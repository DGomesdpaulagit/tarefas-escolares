# Banco de Dados — Tarefas Escolares

Banco PostgreSQL hospedado no Supabase, com Row Level Security (RLS) em todas as tabelas de aplicação. Atualizado em 2026-07-27 para refletir o schema real de produção (migrations 001–011).

## Diagrama de Entidades (simplificado)

```
auth.users (Supabase)
     │
     ├─── profiles (1:1)
     ├─── subjects (1:N) ──────────────┐
     ├─── tasks (1:N) ──FK subject_id──┘
     ├─── imports (1:N)
     ├─── notification_settings (1:1)
     ├─── push_subscriptions (1:N)
     │
     ├─── mesada_config (1:N, por ano letivo)
     ├─── mesada_materias (1:N) ──FK subject_id (opcional)──┐
     ├─── mesada_notas (1:N) ──FK materia_id──┘             │
     │                                                       ▼ subjects
     ├─── guardians (1:1 nesta versão)
     │        └─── guardian_reports_log (1:N)
     ├─── guardian_codes (1:N, ligada a guardians opcionalmente)
     │
     ├─── image_analysis_usage (1:N — log de tentativas)
     └─── audio_analysis_usage (1:N — log de tentativas)
```

## Tabelas

### `profiles`
Dados do perfil estendido do usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Referencia `auth.users.id` |
| `name` | TEXT | Nome do usuário |
| `email` | TEXT | E-mail (sincronizado do auth) |
| `avatar_url` | TEXT | Avatar em base64 (não usa Storage) |
| `bio` | TEXT | Biografia livre |
| `language` | TEXT | Idioma (`pt-BR`, `en`, `es`), default `pt-BR` |
| `theme` | TEXT | Tema (`dark`, `light`), default `dark` |
| `school_year` | TEXT? | Ano/série escolar |
| `onboarding_completed` | BOOLEAN | Se já passou pelo onboarding, default `false` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Auto-gerenciados |

### `subjects`
Disciplinas cadastradas por usuário (rótulo "Disciplina" na UI; nome da tabela/coluna em inglês por herança do schema original).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Dono da disciplina |
| `name` | TEXT | Nome |
| `color` | TEXT | Cor hex, default `#94a3b8` |
| `emoji` | TEXT? | Emoji da disciplina |
| `created_at` | TIMESTAMPTZ | Data de criação |

### `tasks`
Tarefas escolares — a tabela central do app.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Dono da tarefa |
| `title` | TEXT | Título |
| `description` | TEXT? | Descrição longa |
| `subject_id` | UUID? FK | Disciplina (nullable) |
| `subject_name` | TEXT | Nome da disciplina (desnormalizado, usado para exibição/relatórios) |
| `priority` | TEXT | `Alta` \| `Média` \| `Baixa` |
| `status` | TEXT | `Não iniciada` \| `Em Andamento` \| `Concluída` \| `Passou do Prazo` |
| `progress` | INTEGER | 0–100 (%) |
| `due_date` | DATE? | Data de entrega |
| `notes` / `link` / `sector` / `origin` | TEXT? | Campos opcionais |
| `created_at` / `updated_at` / `completed_at` | TIMESTAMPTZ | Auto-gerenciados |

`getStatusEfetivo()` no cliente (`lib/tarefasData.ts`) projeta "Passou do Prazo" em tempo real sem depender do valor persistido — é a lógica de referência reaproveitada pela Edge Function do relatório mensal.

### `imports`
Histórico de importações (planilha, foto ou áudio).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Quem importou |
| `file_name` | TEXT | Nome do arquivo/gravação |
| `file_size` | BIGINT? | Tamanho em bytes |
| `imported_count` | INTEGER | Quantas tarefas foram criadas |
| `file_type` | TEXT | `xlsx` \| `csv` \| `imagem` \| `audio` (texto livre, sem CHECK) |
| `created_at` | TIMESTAMPTZ | Data da importação |

### `notification_settings`
Preferências de notificação (1:1 com o usuário).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID UK | 1:1 com usuário |
| `notify_3_days` / `notify_2_days` / `notify_1_day` | BOOLEAN | Alertas por proximidade do prazo, default `true` |
| `notify_on_create` | BOOLEAN | Notificar ao criar tarefa, default `false` |
| `sound_enabled` | BOOLEAN | Sons de transição no app, default `false` |

### `push_subscriptions`
Assinaturas de Web Push (uma por dispositivo/navegador).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Dono |
| `endpoint` / `p256dh` / `auth` | TEXT | Dados da assinatura push |
| `created_at` | TIMESTAMPTZ | Data de criação |

---

### Módulo Mesada por Desempenho (uso pessoal, atrás de `VITE_ENABLE_MESADA_MODULE`)

Ver `docs/V3_ESPECIFICACAO_MODULO_MESADA.md` para o modelo completo.

- **`mesada_config`** — 1 linha por `(user_id, ano_letivo)`: valores por conceito (MB/B/R/I), limite de MB por período, meta.
- **`mesada_materias`** — matérias monitoradas no boletim; opcionalmente ligadas a uma `subjects.id` via `subject_id` (herda emoji/cor) ou com emoji/cor próprios.
- **`mesada_notas`** — 1 lançamento por `(materia_id, ano, mes)`, com o conceito e o valor calculado no momento (snapshot).

---

### Relatório mensal ao responsável (v4.0)

Ver `docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md` para o fluxo completo.

- **`guardians`** — 1 responsável por usuário (`UNIQUE(user_id)`). `status`: `pendente` \| `ativo` \| `removido`. `unsubscribe_token` identifica o link de saída no rodapé do e-mail, sem exigir login.
- **`guardian_codes`** — código de 6 dígitos (só o **hash**, nunca texto puro) para cadastrar/editar/excluir o responsável. **RLS sem nenhuma policy** — deliberado: o cliente não pode ler nem escrever nada aqui, só a Edge Function via service role.
- **`guardian_reports_log`** — 1 linha por `(guardian_id, referencia)` (ex: `"2026-07"`), evita reenvio duplicado no mesmo mês; guarda `status` (`enviado`/`falhou`) e o erro, se houver.

---

### Importação por IA — foto e áudio (v5.0)

Ver `docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md` para o fluxo completo. Provedor: Google Gemini (camada gratuita).

- **`image_analysis_usage`** / **`audio_analysis_usage`** — um registro por **tentativa** de análise (não por importação confirmada), com `sucesso boolean`. Sustentam o limite diário de 5 análises/usuário/modalidade (cotas independentes entre foto e áudio). Só leitura para o cliente.
- Não guardam a imagem/áudio em si — isso vive no **Storage**, é apagado pelo cliente logo após a análise.

---

## Storage (buckets)

| Bucket | Público | RLS | Uso |
|---|---|---|---|
| `avatars` | — | por pasta `{user_id}/` | Legado — hoje o avatar é salvo como base64 em `profiles.avatar_url`, não usa mais este bucket ativamente |
| `task-images` | Não | por pasta `{user_id}/` (select/insert/delete) | Fotos enviadas para análise de IA (v5.0), apagadas logo após |
| `task-audio` | Não | por pasta `{user_id}/` (select/insert/delete) | Áudios enviados/gravados para análise de IA (v5.0), apagados logo após |

## Row Level Security

Padrão do projeto: cada tabela filtra por `(select auth.uid()) = user_id` (ou `= id` em `profiles`). A partir da migration `011`, todas as policies usam `(select auth.uid())` em vez de `auth.uid()` puro — evita reavaliação por linha, recomendação do próprio linter do Supabase.

```sql
-- Exemplo: tasks
USING ((select auth.uid()) = user_id)
```

**Exceções deliberadas ao padrão:**
- `guardian_codes` — RLS ativo, **zero policies**: inacessível ao cliente em qualquer operação.
- `guardians` — cliente só tem `SELECT`; toda escrita passa pela Edge Function (valida o código antes).
- `image_analysis_usage` / `audio_analysis_usage` — cliente só tem `SELECT`; escrita é sempre da Edge Function.

## Triggers

### `on_auth_user_created` (em `auth.users`)
Executa a função `handle_new_user()` (`SECURITY DEFINER`, `search_path` fixado) após `INSERT` em `auth.users` — cria a linha correspondente em `profiles`.

### `profiles_updated_at` / `tasks_updated_at`
Executam `set_updated_at()` antes de cada `UPDATE`, preenchendo `updated_at = now()`. Só existem nessas duas tabelas — `mesada_config`/`mesada_notas` têm coluna `updated_at` mas sem trigger automático (o valor é atualizado manualmente pelo serviço quando necessário).

## Funções auxiliares relevantes

- **`handle_new_user()`** — só deve ser chamada via trigger; `EXECUTE` revogado de `anon`/`authenticated` (migration `011`).
- **`rls_auto_enable()`** — event trigger do próprio Supabase que liga RLS automaticamente em tabelas novas; `EXECUTE` também revogado de `anon`/`authenticated` por hardening, sem afetar o funcionamento do event trigger.

## Cron jobs (pg_cron)

| Job | Agenda | Função |
|---|---|---|
| `send-daily-notifications` | `0 11 * * *` (08h Brasília) | `send-notifications` — Web Push de tarefas próximas do prazo |
| `enviar-relatorio-responsavel-mensal` | `0 11 25 * *` (08h Brasília, dia 25) | `enviar-relatorio-responsavel` — relatório mensal (v4.0) |

## Como aplicar as migrations

Execute os arquivos de `supabase/migrations/` **em ordem numérica** no SQL Editor do Supabase (ou via MCP/CLI). Note que as migrations `003`–`006` foram reconstruídas em 2026-07-27 a partir do schema real de produção — os arquivos originais nunca haviam sido salvos no repositório (aplicados direto via MCP nas sessões correspondentes); são idempotentes (`ADD COLUMN IF NOT EXISTS`) e seguras de rodar de novo.
