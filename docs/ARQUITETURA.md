# Arquitetura — Tarefas Escolares

Atualizado em 2026-07-27 para refletir o estado atual do projeto (v2.1.0 + Mesada + i18n + relatório ao responsável + importação por IA).

## Visão Geral

Aplicação SPA (Single Page Application) em React, com backend 100% serverless via Supabase (banco, auth, storage, funções) — sem servidor de aplicação próprio em produção.

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (SPA)                            │
│                                                                    │
│  Pages  →  Contexts  →  Services  →  Supabase client / fetch     │
│                                                                    │
└───────────────────────────────┬────────────────────────────────┘
                                  │ HTTPS (REST / Realtime / Storage)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                            Supabase                                │
│  Auth │ PostgreSQL + RLS │ Storage (task-images, task-audio) │     │
│  Edge Functions (Deno) │ pg_cron                                  │
└───────────────────────────────┬────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              Google Gemini    Resend      Web Push (VAPID)
              (foto/áudio)   (e-mail)      (navegadores)
```

## Camadas do frontend (`client/src/`)

### 1. Pages (`pages/`)
Componentes de página, montados pelo roteador (`Wouter`). Consomem contexts, sem lógica de negócio direta.

| Página | Responsabilidade |
|---|---|
| `Login` / `ResetPassword` | Autenticação, cadastro, recuperação de senha |
| `Welcome` | Slides pré-login (primeira visita anônima) |
| `Onboarding` | Fluxo pós-cadastro: nome/ano, disciplinas, responsável (opcional), revisão |
| `Home` | Layout raiz autenticado: Sidebar + conteúdo |
| `VisaoGeral` | Dashboard principal (landing pós-login): progresso, desempenho, próximos prazos |
| `Tarefas` | Lista, busca, filtros, ordenação, CRUD |
| `Disciplinas` | Catálogo visual de disciplinas |
| `Agenda` | Calendário semanal/mensal |
| `Metricas` | Gráficos e Perfil Inteligente |
| `Arquivos` | Importação/exportação, histórico |
| `Mesada` | Módulo de Mesada por Desempenho (atrás de feature flag) |
| `Configuracoes` | Perfil, Acadêmico, Aparência, Notificações, Responsável |
| `Descadastrar` | Página **pública** (sem auth) do link de saída do relatório mensal |
| `NotFound` | Página 404 |

### 2. Contexts (`contexts/`)
Estado global. Consomem services e expõem dados para a árvore de componentes.

| Context | Estado gerenciado |
|---|---|
| `AuthContext` | Sessão Supabase, usuário, métodos de auth |
| `TarefasContext` | Lista de tarefas, filtros, métricas, CRUD |
| `DisciplinasContext` | CRUD de disciplinas |
| `ArquivosContext` | Histórico de importações |
| `MesadaContext` | Config/matérias/notas da Mesada (só quando a flag está ativa) |
| `ThemeContext` | Tema claro/escuro |
| `LanguageContext` | Idioma ativo + função `t()` de tradução |
| `TourContext` | Estado do tutorial guiado (spotlight) |

### 3. Services (`services/`)
Camada de acesso ao Supabase (tabelas, Storage, Edge Functions). Sem estado próprio.

| Service | Responsabilidade |
|---|---|
| `authService` | signIn, signUp, signOut, resetPassword |
| `taskService` | CRUD de tarefas |
| `subjectService` | CRUD de disciplinas |
| `importService` | Histórico de importações |
| `profileService` | Leitura/atualização de perfil |
| `settingsService` | Configurações de notificação |
| `notificationService` | Web Push (subscribe, notificações locais/teste) |
| `mesadaService` | CRUD da Mesada |
| `guardianService` | Cadastro/edição/exclusão do responsável (fluxo de código), histórico de relatórios |
| `imageImportService` / `audioImportService` | Upload para Storage + chamada da Edge Function de análise + limpeza do arquivo |

### 4. Componentes de IA/importação
`NovaTarefaModal` é o ponto único de entrada ao criar uma tarefa (Escrever / Foto / Áudio), delegando para `TarefaForm`, `ImportarImagemModal` ou `ImportarAudioModal`. Estes dois últimos compartilham `RevisaoCandidatasTarefas` (tela de revisão das tarefas candidatas) e o tipo `CandidataTarefa` (`lib/candidataTarefa.ts`).

### 5. Supabase Client (`supabase/client.ts`)
Instância singleton do cliente Supabase (`@supabase/supabase-js`), usando as variáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.

## Backend serverless (`supabase/functions/`, Deno)

| Edge Function | Gatilho | Faz |
|---|---|---|
| `send-notifications` | pg_cron diário | Web Push de tarefas próximas do prazo |
| `enviar-relatorio-responsavel` | pg_cron dia 25 | Agrega o mês, monta e envia o relatório via Resend |
| `guardian-request-code` | chamada do app | Gera e envia o código de verificação (cadastrar/editar/excluir responsável) |
| `guardian-verify-code` | chamada do app | Valida o código e executa a operação em `guardians` |
| `guardian-unsubscribe` | link público do e-mail | API do descadastro (sem auth) — a UI mora em `Descadastrar.tsx`, não na função (ver nota abaixo) |
| `analisar-imagem-tarefas` | chamada do app | Baixa a foto do Storage, chama o Gemini, devolve tarefas candidatas |
| `analisar-audio-tarefas` | chamada do app | Idem, para áudio |

**Nota de infraestrutura importante:** o gateway do Supabase força `Content-Type: text/plain` + CSP `sandbox` em toda resposta de Edge Function — nenhuma delas pode servir HTML para um humano abrir diretamente. Por isso a página de descadastro vive no app (`/descadastrar`), e a função correspondente é só uma API JSON.

## Fluxo de Autenticação

```
Login.tsx → AuthContext.logar() → authService.signIn()
  → Supabase Auth → onAuthStateChange() → setUser() → Router redireciona
  → OnboardingGate verifica profiles.onboarding_completed
```

## Fluxo de Dados (Tarefas)

```
TarefasContext (montado após auth) → taskService.list(userId)
  → RLS filtra por user_id → setTarefas([...]) → componentes renderizam

Criação manual: NovaTarefaModal → TarefaForm.submit → TarefasContext.adicionarTarefa()
  → taskService.create({...}) → INSERT → setTarefas([nova, ...prev])

Criação por IA: NovaTarefaModal → ImportarImagemModal/ImportarAudioModal
  → upload no Storage → Edge Function (Gemini) → RevisaoCandidatasTarefas
  → adicionarTarefa() em lote para as "prontas", TarefaForm para completar as incompletas
```

## Decisões de Design

- **Sem servidor de aplicação em produção**: frontend fala direto com o Supabase; o `server/index.ts` (Express) existe no repositório mas não é usado pelo deploy da Vercel (que serve o SPA estático via `vercel.json`).
- **RLS obrigatório**: toda tabela de dado de usuário é filtrada por `(select auth.uid()) = user_id` (ou `id`), exceto exceções deliberadas e documentadas (ex: `guardian_codes` sem nenhuma policy).
- **Segredos de provedor externo só em Edge Function**: `RESEND_API_KEY`, `GOOGLE_API_KEY`, chaves VAPID nunca chegam ao cliente — ficam como secrets do Supabase, configurados manualmente pelo usuário no painel.
- **Urgência computada no frontend**: `getStatusEfetivo()`/`diasAteVencimento()` (`lib/tarefasData.ts`) calculam o status em tempo real; é a mesma lógica reaproveitada pela Edge Function do relatório mensal, para os números baterem com o que a tela mostra.
- **IDs como UUID**: `gen_random_uuid()`, sem colisões.
- **Types centralizados**: `client/src/types/index.ts` é a fonte de verdade dos tipos de domínio.
- **i18n real**: dicionários tipados em `lib/i18n/` (`pt-BR`, `en`, `es`); `t()` do `LanguageContext` é usado em toda a interface — o único texto que fica sempre em português é dado armazenado (status/prioridade) ou catálogo padrão de disciplinas, não texto de interface.
