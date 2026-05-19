# Banco de Dados — Tarefas Escolares

Banco PostgreSQL hospedado no Supabase com Row Level Security (RLS).

## Diagrama de Entidades

```
auth.users (Supabase)
     │
     ├─── profiles (1:1)
     ├─── subjects (1:N)
     ├─── tasks (1:N)
     ├─── imports (1:N)
     └─── notification_settings (1:1)

tasks.subject_id ──FK──▶ subjects.id (nullable)
```

## Tabelas

### `profiles`
Dados do perfil estendido do usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Referencia `auth.users.id` |
| `name` | TEXT | Nome do usuário |
| `email` | TEXT | Email (sincronizado do auth) |
| `avatar_url` | TEXT | URL do avatar |
| `bio` | TEXT | Biografia |
| `language` | TEXT | Idioma (`pt-BR`, `en`, `es`...) |
| `theme` | TEXT | Tema (`dark`, `light`) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (auto-trigger) |

### `subjects`
Matérias personalizadas por usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Dono da matéria |
| `name` | TEXT | Nome da matéria |
| `color` | TEXT | Cor hex (#f59e0b) |
| `created_at` | TIMESTAMPTZ | Data de criação |

### `tasks`
Tarefas escolares.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Dono da tarefa |
| `title` | TEXT | Título |
| `description` | TEXT? | Descrição longa |
| `subject_id` | UUID? FK | Matéria (nullable) |
| `subject_name` | TEXT | Nome da matéria (desnormalizado) |
| `priority` | TEXT | `Alta` \| `Média` \| `Baixa` |
| `status` | TEXT | `Não iniciada` \| `Em Andamento` \| `Concluída` \| `Passou do Prazo` |
| `progress` | INTEGER | 0–100 (%) |
| `due_date` | DATE? | Data de entrega |
| `notes` | TEXT? | Observações |
| `link` | TEXT? | Link de referência |
| `sector` | TEXT? | Setor (Trabalho, Prova...) |
| `origin` | TEXT? | Origem (SALA, TEAMS...) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (auto-trigger) |
| `completed_at` | TIMESTAMPTZ? | Quando foi concluída |

### `imports`
Histórico de importações de planilhas.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK | Usuário que importou |
| `file_name` | TEXT | Nome do arquivo |
| `file_size` | BIGINT? | Tamanho em bytes |
| `imported_count` | INTEGER | Quantidade importada |
| `file_type` | TEXT | `xlsx` ou `csv` |
| `created_at` | TIMESTAMPTZ | Data da importação |

### `notification_settings`
Configurações de notificação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID UK | 1:1 com usuário |
| `notify_3_days` | BOOLEAN | Alertar 3 dias antes |
| `notify_2_days` | BOOLEAN | Alertar 2 dias antes |
| `notify_1_day` | BOOLEAN | Alertar 1 dia antes |
| `sound_enabled` | BOOLEAN | Sons de transição |

## Row Level Security

Todas as tabelas têm RLS ativo. As políticas garantem que:

```sql
-- Exemplo: tasks
USING (auth.uid() = user_id)
```

Ou seja, qualquer query retorna/modifica apenas dados do usuário autenticado.

## Triggers

### `on_auth_user_created`
Executa após `INSERT` em `auth.users`. Cria automaticamente um `profile` para o novo usuário.

### `tasks_updated_at` / `profiles_updated_at`
Atualiza o campo `updated_at` automaticamente antes de cada `UPDATE`.

## Como Executar

1. Acesse o **SQL Editor** no painel do Supabase
2. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Clique em **Run**
