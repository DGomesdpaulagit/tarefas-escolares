# Arquitetura — Tarefas Escolares

## Visão Geral

Aplicação SPA (Single Page Application) em React com backend serverless via Supabase.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                       │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Pages  │  │ Contexts │  │ Services │  │  Lib   │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────────┘  │
│       │            │             │                      │
│  ┌────▼────────────▼─────────────▼──────┐               │
│  │          React Component Tree        │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS (REST / Realtime)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                           │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Auth   │  │  PostgreSQL  │  │  Row Level Sec. │   │
│  └──────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Camadas

### 1. Pages (`src/pages/`)
Componentes de página montados pelo roteador. Sem lógica de negócio direta — consomem contexts.

| Página | Responsabilidade |
|---|---|
| `Login` | Autenticação, cadastro, recuperação de senha |
| `Home` | Layout raiz: Sidebar + conteúdo |
| `Tarefas` | Lista, busca, filtros, CRUD |
| `Agenda` | Calendário mensal de tarefas |
| `Metricas` | Gráficos e KPIs |
| `Arquivos` | Importação/exportação |
| `Configuracoes` | Perfil, tema, notificações |
| `NotFound` | Página 404 |

### 2. Contexts (`src/contexts/`)
Estado global da aplicação. Consomem services e expõem dados para toda a árvore.

| Context | Estado gerenciado |
|---|---|
| `AuthContext` | Sessão Supabase, usuário, auth methods |
| `TarefasContext` | Lista de tarefas, filtros, métricas, CRUD |
| `ArquivosContext` | Histórico de importações |
| `ThemeContext` | Tema claro/escuro (next-themes) |

### 3. Services (`src/services/`)
Camada de acesso ao Supabase. Sem estado próprio. Funções puras que retornam/mutam dados.

| Service | Responsabilidade |
|---|---|
| `authService` | signIn, signUp, signOut, resetPassword |
| `taskService` | CRUD de tarefas |
| `subjectService` | CRUD de matérias |
| `importService` | Histórico de importações |
| `profileService` | Leitura/atualização de perfil |
| `settingsService` | Configurações de notificação |

### 4. Supabase Client (`src/supabase/client.ts`)
Instância singleton do cliente Supabase com tipagem gerada (`src/types/database.ts`).

## Fluxo de Autenticação

```
Usuário → Login.tsx → AuthContext.logar() → authService.signIn()
  → Supabase Auth → onAuthStateChange() → setUser() → Router redirect
```

## Fluxo de Dados (Tarefas)

```
TarefasContext (montado após auth) → taskService.list(userId)
  → Supabase RLS filtra por user_id
  → setTarefas([...])
  → Components renderizam

Criação: TarefaForm.submit → TarefasContext.adicionarTarefa()
  → taskService.create({...}) → INSERT INTO tasks → retorna ID
  → setTarefas([nova, ...prev])
```

## Decisões de Design

- **Sem server**: frontend direto no Supabase. O Express foi removido.
- **RLS obrigatório**: cada query é filtrada por `auth.uid() = user_id`.
- **Urgência no frontend**: `calcularDiasRestantes()` é computado em tempo real, não armazenado.
- **IDs como UUID**: Supabase usa `gen_random_uuid()`, eliminando colisões.
- **Types centralizados**: `src/types/index.ts` é a fonte de verdade dos tipos de domínio.
