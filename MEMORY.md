# MEMORY.md — Tarefas Escolares
> Fonte oficial de contexto do projeto. Atualizar após cada sessão de trabalho.
> **Última atualização:** 2026-05-28 (Sessão 023)

---

## 1. Visão Geral do Projeto

**Nome:** Tarefas Escolares  
**Versão:** 2.0.0  
**Tipo:** SaaS Web App — Gerenciador de tarefas escolares  
**Status:** ✅ Em produção, 100% funcional

Aplicação que permite a estudantes gerenciar tarefas escolares com CRUD completo, métricas, agenda, importação de planilhas e sincronização entre dispositivos via Supabase.

---

## 2. Objetivo do Sistema

Substituir cadernos e planilhas manuais por um painel digital unificado que:
- Centraliza todas as tarefas por matéria, status e prazo
- Gera métricas automáticas de desempenho
- Alerta tarefas urgentes (≤3 dias para o prazo)
- Persiste dados por usuário com autenticação real

---

## 3. Público-alvo

Estudantes do ensino médio/técnico/superior brasileiros. Uso individual, um usuário por conta.

---

## 4. Problema que resolve

- Perda de prazos por falta de visibilidade centralizada
- Dificuldade de priorizar tarefas de múltiplas disciplinas
- Ausência de métricas pessoais de desempenho estudantil

---

## 5. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19.x |
| Linguagem | TypeScript | 5.6.3 |
| Build | Vite | 7.x |
| Estilo | Tailwind CSS | 4.x |
| Componentes | shadcn/ui | (Radix-based) |
| Roteamento | Wouter | 3.x |
| Gráficos | Recharts | 2.x |
| Animações | Framer Motion | 12.x |
| Toasts | Sonner | 2.x |
| Backend/Auth | Supabase | 2.x |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| Planilhas | XLSX | 0.18.x |
| Deploy | Vercel | (via GitHub CI/CD) |
| Package manager | npm (pnpm disponível) | 11.x |

---

## 6. URLs Oficiais

| Ambiente | URL |
|---|---|
| **Produção** | https://tarefas-escolares-five.vercel.app |
| **GitHub** | https://github.com/DGomesdpaulagit/tarefas-escolares |
| **Supabase** | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn |
| **Vercel** | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares |

**Supabase Project Ref:** `qnrrgkicsjdbrwhjelqn`  
**GitHub user:** `DGomesdpaulagit`  
**Vercel org:** `davi-gomes-de-paula-s-projects`

---

## 7. Variáveis de Ambiente

### `.env.local` (local — não commitado)
```env
VITE_SUPABASE_URL=https://qnrrgkicsjdbrwhjelqn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_AdDbDsdd9woxSoz0AYyQ8g_gAk2sClv
```

### Vercel (produção — salvas no dashboard)
Configuradas via API para `production`, `preview` e `development`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> ⚠️ As variáveis são injetadas pelo Vite em **build time** (não em runtime).
> Se as variáveis não estiverem salvas no projeto Vercel antes do build, o app lança erro.

---

## 8. Estrutura Atual do Projeto

```
tarefas-escolares-app/
├── client/
│   ├── index.html                    # Entry point HTML
│   ├── public/
│   └── src/
│       ├── App.tsx                   # Router principal + providers
│       ├── main.tsx                  # Entry React
│       ├── index.css                 # Tailwind v4 + CSS variables (Academic Dark)
│       ├── components/
│       │   ├── ErrorBoundary.tsx
│       │   ├── HistoricoArquivos.tsx  # Lista de importações anteriores
│       │   ├── ImportarPlanilhaModal.tsx
│       │   ├── LimparTarefasModal.tsx
│       │   ├── Sidebar.tsx            # Navegação lateral
│       │   ├── TarefaCard.tsx         # Card individual de tarefa
│       │   ├── TarefaForm.tsx         # Modal criar/editar tarefa
│       │   ├── UserMenu.tsx           # Menu do usuário (logout, config)
│       │   └── ui/                    # shadcn/ui components (30+ componentes)
│       ├── contexts/
│       │   ├── ArquivosContext.tsx    # Estado de histórico de importações
│       │   ├── AuthContext.tsx        # Autenticação Supabase
│       │   ├── TarefasContext.tsx     # Estado global de tarefas + filtros + métricas
│       │   └── ThemeContext.tsx       # Tema claro/escuro (estrutura pronta)
│       ├── hooks/
│       │   ├── useComposition.ts      # IME composition (teclados asiáticos)
│       │   └── useMobile.tsx          # Detecção de mobile
│       ├── lib/
│       │   ├── parseExcel.ts          # Parser XLSX → Tarefa[]
│       │   ├── tarefasData.ts         # Constantes: matérias, cores, status, funções utilitárias
│       │   └── utils.ts               # cn() helper (clsx + tailwind-merge)
│       ├── pages/
│       │   ├── Agenda.tsx             # Calendário mensal com tarefas por dia
│       │   ├── Arquivos.tsx           # Importação planilhas + histórico + exportação
│       │   ├── Configuracoes.tsx      # Config: Perfil, Tema, Notificações, Matérias
│       │   ├── Home.tsx               # Dashboard principal (entry point autenticado)
│       │   ├── Login.tsx              # Login / Cadastro / "Esqueci senha"
│       │   ├── Metricas.tsx           # Dashboard de métricas + perfil analítico
│       │   ├── NotFound.tsx           # 404
│       │   ├── ResetPassword.tsx      # Redefinição de senha (link do email)
│       │   └── Tarefas.tsx            # Lista + filtros de tarefas
│       ├── services/
│       │   ├── authService.ts         # signUp, signIn, signOut, resetPassword, updatePassword
│       │   ├── importService.ts       # CRUD de imports (histórico planilhas)
│       │   ├── profileService.ts      # CRUD de perfis de usuário
│       │   ├── settingsService.ts     # CRUD de notification_settings
│       │   ├── subjectService.ts      # CRUD de subjects (matérias personalizadas)
│       │   └── taskService.ts         # CRUD de tasks + toggle + deleteAll
│       ├── supabase/
│       │   └── client.ts              # Singleton do Supabase client
│       └── types/
│           ├── database.ts            # Tipos do banco (Database interface)
│           └── index.ts               # Tipos de domínio: Tarefa, Perfil, Materia, etc.
├── docs/
│   ├── ARQUITETURA.md
│   ├── AUDITORIA.md
│   ├── BANCO_DE_DADOS.md
│   ├── DEPLOY.md
│   └── ROADMAP.md
├── shared/
│   └── const.ts                      # APP_NAME, APP_VERSION (legado harmless)
├── server/
│   └── index.ts                      # ⚠️ Express legado — NÃO USADO pelo Vite/Vercel
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Schema completo do banco
├── .env.local                        # Variáveis locais (não commitado)
├── .gitignore
├── components.json                   # Config shadcn/ui
├── ideas.md                          # Rascunho de design (Manus legado, inofensivo)
├── package.json
├── package-lock.json
├── patches/wouter@3.7.1.patch       # Patch de compatibilidade do wouter
├── pnpm-lock.yaml                    # Lock file pnpm (projeto usa npm no Vercel)
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                       # Config de deploy Vercel
└── vite.config.ts
```

---

## 9. Banco de Dados Supabase

### Tabelas
| Tabela | Descrição |
|---|---|
| `profiles` | Perfil estendido do usuário (name, bio, language, theme, avatar_url) |
| `subjects` | Matérias personalizadas por usuário |
| `tasks` | Tarefas escolares com todos os campos |
| `imports` | Histórico de importações de planilhas |
| `notification_settings` | Config de notificações por usuário |

### RLS (Row Level Security)
**Todas as tabelas** têm RLS ativo com política `auth.uid() = user_id`.
Isso garante isolamento total por usuário — base do "login sincronizado".

### Triggers
- `on_auth_user_created` → Cria `profile` automaticamente no cadastro
- `tasks_updated_at` → Atualiza `updated_at` antes de cada UPDATE em tasks
- `profiles_updated_at` → Atualiza `updated_at` antes de cada UPDATE em profiles

### Campos da tabela `tasks`
```
id, user_id, title, description, subject_id, subject_name,
priority (Alta/Média/Baixa), status (Não iniciada/Em Andamento/Concluída/Passou do Prazo),
progress (0-100), due_date, notes, link, sector, origin,
created_at, updated_at, completed_at
```

---

## 10. Design System — Academic Dark

**Filosofia:** Neo-Brutalism Acadêmico com Dark Mode permanente.

| Token | Valor | Uso |
|---|---|---|
| Background | `#0f1117` | Fundo principal |
| Card | `#13151f` / `#1a1d27` | Cards, modais |
| Accent primary | `#f59e0b` (amber-500) | Botões, destaques |
| Success | `#10b981` (emerald-500) | Concluída |
| Danger | `#ef4444` (red-500) | Atrasada, urgente |
| Warning | `#f59e0b` | Em andamento |
| Text primary | `#f1f5f9` (slate-100) | Títulos |
| Text secondary | `#94a3b8` (slate-400) | Labels, metadados |
| Border | `rgba(255,255,255,0.1)` | Bordas sutis |

**Fontes:**
- Display: `Space Grotesk` (600/700) para títulos e métricas
- Corpo: `Inter` (400/500) para texto corrido

---

## 11. Funcionalidades Implementadas (✅ 100%)

| # | Funcionalidade | Arquivo principal |
|---|---|---|
| 1 | Login / Cadastro (email + senha) | `Login.tsx` + `authService.ts` |
| 2 | Reset de senha (link por email) | `ResetPassword.tsx` + `authService.ts` |
| 3 | CRUD completo de tarefas | `TarefasContext.tsx` + `taskService.ts` |
| 4 | Filtros (status, matéria, prioridade, busca) | `TarefasContext.tsx` + `Tarefas.tsx` |
| 5 | Cards com progresso + urgência | `TarefaCard.tsx` |
| 6 | Detecção de tarefas urgentes (≤3 dias) | `TarefasContext.tsx` (`isUrgente`) |
| 7 | Métricas e gráficos (Recharts) | `Metricas.tsx` |
| 8 | Perfil analítico (taxa conclusão, atraso) | `Metricas.tsx` |
| 9 | Importação Excel/CSV (XLSX) | `Arquivos.tsx` + `parseExcel.ts` |
| 10 | Exportação JSON e Excel | `Arquivos.tsx` |
| 11 | Histórico de importações | `HistoricoArquivos.tsx` + `importService.ts` |
| 12 | Calendário mensal (Agenda) | `Agenda.tsx` |
| 13 | Página de Configurações (4 tabs) | `Configuracoes.tsx` |
| 14 | Sincronização entre dispositivos | Supabase RLS (automático) |
| 15 | Sidebar responsiva com navegação | `Sidebar.tsx` |
| 16 | Toasts de feedback | Sonner |
| 17 | TypeScript strict (0 erros) | `tsconfig.json` |
| 18 | Deploy CI/CD (GitHub → Vercel) | `vercel.json` |
| 19 | Favicon + PWA icons (7 tamanhos) + manifest | `client/public/` + `index.html` |
| 20 | Web Push Notifications (Service Worker + VAPID + Edge Function) | `sw.js` + `notificationService.ts` + Supabase |
| 21 | Cron job diário às 8h Brasília (pg_cron + Edge Function) | Supabase Dashboard |

---

## 12. Funcionalidades Parcialmente Implementadas (⚠️)

| # | Funcionalidade | Status | O que falta |
|---|---|---|---|
| 1 | Tema Claro/Escuro | 30% | `ThemeContext.tsx` existe, CSS do light theme falta em `index.css` |
| 2 | Tarefas urgentes no topo | 80% | `isUrgente()` existe, ordenação automática precisa de polimento |
| 3 | Configurações de notificação | ✅ 100% | Web Push + local notifications + cron job implementados |
| 4 | Matérias personalizadas | 40% | `subjectService.ts` existe, UI de gerenciamento falta |
| 5 | Página Agenda | 70% | Calendário existe, clique p/ editar/excluir precisa de melhorias |
| 6 | Perfil do usuário | ✅ 100% | Avatar via Canvas base64, bio, upsert corrigido |

---

## 13. Funcionalidades Pendentes (❌ 0%)

| # | Funcionalidade | Fase | Prioridade |
|---|---|---|---|
| 1 | Legendas nos filtros | 1 | Alta |
| 2 | Melhorias mobile (edição, detalhes, "Data de Registro") | 1 | Alta |
| 3 | Busca avançada (título + descrição + matéria + notas) | 1 | Alta |
| 4 | Polimento tarefas urgentes (mover para o topo) | 1 | Média |
| 5 | Tema claro/escuro completo + persistência Supabase | 2 | Alta |
| 6 | Configurações avançadas (avatar, idioma completo, backup) | 2 | Média |
| 7 | Perfil inteligente (insights automáticos) | 2 | Média |
| 8 | Sons de transição | 2 | Baixa |
| 9 | Notificações de prazo (Web Notifications API) | 3 | Média |
| 10 | Onboarding (fluxo pós-cadastro) | 3 | Baixa |
| 11 | Agenda semanal + clique para editar/excluir | 3 | Média |

---

## 14. Scripts

```bash
npm run dev      # Servidor de desenvolvimento (Vite, porta 3000)
npm run build    # TypeScript check + build produção → dist/
npm run preview  # Preview do build de produção
npm run check    # Apenas TypeScript (sem build)
npm run format   # Prettier em todo o projeto
```

> **Vercel usa:** `npm install` + `npm run build` → output `dist/`

---

## 15. Processo de Deploy

```
Push para branch main
  → GitHub detecta push
  → Vercel CI/CD dispara automaticamente
  → npm install + npm run build
  → Vite injeta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no bundle
  → dist/ publicado
  → Alias https://tarefas-escolares-five.vercel.app atualizado
```

**Tempo médio de deploy:** ~25–35 segundos

> ⚠️ **Atenção crítica:** As variáveis `VITE_*` são injetadas em BUILD TIME pelo Vite.
> Se não estiverem salvas no Vercel **antes** do build, o app falha com tela preta.

---

## 16. Decisões Técnicas

| Decisão | Motivo |
|---|---|
| Supabase sem `<Database>` generic | Tipos gerados manualmente não batiam com a estrutura esperada pelo client; serviços usam `as Tarefa[]` |
| `window.location.origin` no redirectTo | URL dinâmica: funciona em localhost E em produção sem hardcode |
| `@plugin "tailwindcss-animate"` em vez de `@import` | Tailwind v4 usa `@plugin` para plugins, não `@import` |
| `npm install` forçado no Vercel | `pnpm-lock.yaml` causava falha no CI do Vercel (pnpm versão incompatível) |
| Urgência calculada em render time | Não armazenar `diasRestantes` no banco evita dados desatualizados |
| RLS em todas as tabelas | Segurança por design — usuário só acessa seus dados mesmo com token vazado |

---

## 17. Problemas Resolvidos

| Problema | Causa | Solução |
|---|---|---|
| Tela preta no Vercel | Vars de ambiente não salvas permanentemente | Salvas via Vercel API no projeto |
| `pnpm install` falhando no CI | pnpm@10.4.1 não disponível no Vercel | `installCommand: "npm install"` no vercel.json |
| TS error `never[]` nos services | `createClient<Database>` com tipo incompatível | Removido generic, serviços usam type assertions |
| `tw-animate-css` não resolve | Tailwind v4 usa `@plugin`, não `@import` | Corrigido para `@plugin "tailwindcss-animate"` |
| `usePersistFn` não encontrado | Arquivo deletado na limpeza Manus AI | Reescrito com `useCallback` nativo |
| Link reset senha → página branca | Rota `/reset-password` não existia | Criada `ResetPassword.tsx` + rota no App.tsx |
| Analytics Manus no HTML | Script legado com variáveis não definidas | Removido do `client/index.html` |

---

## 18. Bugs Conhecidos

| Bug | Severidade | Status |
|---|---|---|
| Nenhum bug conhecido em produção | — | — |

## 17b. Bugs Corrigidos (adicionais)

| Bug | Causa | Solução | Commit |
|---|---|---|---|
| Importar planilha retorna 400 Bad Request | Status/prioridade da planilha não batia com enum do Supabase; datas Excel como número serial | Adicionados `sanitizeStatus()`, `sanitizePrioridade()` e `parseExcelDate()` em `parseExcel.ts` | 4e32f37 |
| Avatar upload falhando (406) | Bucket `avatars` inexistente; perfil sem linha no banco | Canvas base64 (sem Storage); `profileService` usa `upsert`; SQL criou linha manualmente | 725c09a..bdd49d0 |
| notification_settings 409 | upsert sem `onConflict` tentava INSERT duplicado | `{ onConflict: "user_id" }` em `settingsService` | 725c09a |

---

## 19. Estratégia de Tokens (Claude)

### Contexto técnico
- Claude Sonnet 4.6: janela de **200K tokens**
- Conversas longas são **comprimidas automaticamente** (resumo substitui histórico)
- Tokens são renovados ao iniciar **nova conversa**

### Regras de uso eficiente
1. **Uma conversa = uma fase** do roadmap
2. Sempre iniciar com: *"Leia o MEMORY.md e continue do ponto exato"*
3. Fazer **edits cirúrgicos** (não reescrever arquivos inteiros)
4. **Commitar após cada feature** — se a conversa cair, o código está salvo
5. **Não ler arquivos desnecessários** — só o que vai ser alterado
6. O projeto NÃO é perdido se o contexto acabar — GitHub, Supabase e Vercel mantêm tudo

### Estimativa por fase
| Fase | Features | Tokens estimados |
|---|---|---|
| Fase 1 | 4 features (filtros, mobile, busca, urgentes) | ~25–35K |
| Fase 2 | 4 features (tema, config, perfil, sons) | ~40–55K |
| Fase 3 | 3 features (notificações, onboarding, agenda) | ~45–60K |

---

## 20. Estratégia com Obsidian

### Vault recomendado
`Tarefas Escolares`

### Arquivos recomendados no Vault
```
Tarefas Escolares/
├── MEMORY.md          ← Este arquivo (sincronizar do GitHub)
├── ROADMAP.md         ← docs/ROADMAP.md
├── CHANGELOG.md       ✅ Criado em 2026-05-20 — registro de mudanças (Keep a Changelog)
├── PROMPTS.md         ✅ Criado em 2026-05-20 — prompts que funcionaram bem
├── BUGS.md            ✅ Criado em 2026-05-20 — 12 bugs resolvidos + 3 conhecidos
├── IDEIAS.md          ← ideas.md atual
└── LINKS.md           ✅ Criado em 2026-05-20 — URLs do projeto
```

### Fluxo de atualização
```
Claude trabalha → Atualiza MEMORY.md → git commit + push → Obsidian sincroniza via Git plugin
```

### Plugin recomendado no Obsidian
`Obsidian Git` — sincroniza automaticamente com o repositório GitHub.

---

## 21. Roadmap em Fases

### ✅ Fase 0 — Base (Concluída)
- Remoção completa de artefatos Manus AI
- Migração de localStorage para Supabase
- Autenticação real (login, cadastro, reset de senha)
- CRUD de tarefas com Supabase + RLS
- Build limpo (0 erros TypeScript)
- Deploy GitHub → Vercel com CI/CD
- Banco de dados com 5 tabelas, RLS e triggers

### ✅ Fase 1 — Polimento UX (Concluída — Etapa 3 / Sessão 8)
- [x] Filtro de Matéria adicionado ao painel de filtros (lista dinâmica)
- [x] Melhorias mobile — TarefaForm: grid-cols-1 sm:grid-cols-2
- [x] Busca avançada (title + subject_name + notes + sector + origin + description)
- [x] Tarefas urgentes no topo (já implementado, confirmado)

### ✅ Fase 2 — Features Intermediárias (Concluída — Etapa 6 / Sessão 12)
- [x] Tema claro/escuro completo + persistência no Supabase ✅ Etapa 6 / Sessão 12
- [x] Configurações avançadas (avatar upload, bio, matérias com persistência) ✅ Etapa 4 / Sessão 10
- [x] Perfil inteligente (insights automáticos em Metricas.tsx) ✅ Etapa 4 / Sessão 9
- [x] Sons de transição (Web Audio API) ✅ Etapa 5 / Sessão 11

### ✅ Fase 3 — Features Avançadas (Parcialmente Concluída)
- [x] Notificações de prazo (Web Push + local — 3, 2, 1 dias) ✅ Etapa 9 / Sessão 016
- [ ] Onboarding (fluxo pós-cadastro: escolha de matérias, preferências)
- [ ] Agenda melhorada (visão semanal, clique para editar/excluir tarefas)

---

## 22. Próximo Passo Exato

**✅ Fase 0 ✅ | Fase 1 ✅ | Fase 2 ✅ | Bugfixes ✅ | Fase 3 (Push) ✅ | Fase 1 Crítica (Sessão 017) ✅**

### Estado atual
- Sistema de status com 3 estados efetivos (pending/completed/expired) via `getStatusEfetivo`
- Datas com timezone correto (`parseDueDateLocal`), conta dia atual + dia final
- Expiração automática só após 23:59:59 local do dia final
- Tarefas expiradas: visual riscado/vermelho, badge "Prazo encerrado", toggle bloqueado, edição preservada
- Listagem ordenada: urgentes → normais → concluídas → expiradas
- Notificações push real funcionando (Sessão 016) + cálculo de dias corrigido (Sessão 017)
- Light/Dark mode: cores neutras adaptam via overrides em `index.css`

### Próximas opções
- [x] Onboarding pós-cadastro com seleção visual de disciplinas — Sessão 019
- [x] Calendário semanal moderno com long-press — Sessão 020
- [x] Visão geral / Dashboard com cards de disciplinas em destaque — Sessão 023
- [x] Configurações simplificadas (ano + idioma) — Sessão 023
- [ ] Testes manuais em mobile (Android/iOS, troca de tema)
- [ ] Implementação real de i18n (tradução em runtime)

### Estado atual (após Sessão 018)
- Página "Disciplinas" com catálogo visual em cards (emoji + cor + contadores)
- Modal moderno de criação/edição com preview, emoji picker e paleta
- "Matéria" renomeado para "Disciplina" em toda a UI; schema do banco preservado
- Coluna `emoji` em `subjects` (migration `003_subjects_add_emoji`)
- Emoji da disciplina aparece em TarefaCard, TarefaForm e Sidebar

### Último commit
`293d80e` (Sessão 017) — próximo: Sessão 018 (Fase 2 disciplinas)

---

## 23. Prompt para Continuação

O `CLAUDE.md` na raiz do projeto carrega as instruções automaticamente.
Basta abrir uma nova conversa no Claude Code e digitar qualquer coisa (ex: "oi", "continua").
O Claude lê este MEMORY.md, identifica o próximo passo e pergunta se pode iniciar.

> Prompt manual não é mais necessário — o CLAUDE.md substitui.

---

## 24. Histórico de Sessões

| Data | O que foi feito |
|---|---|
| 2026-05-19 | Refatoração completa: remoção Manus AI, migração Supabase, 17 stages |
| 2026-05-19 | Correção TypeScript (0 erros), build limpo, deploy Vercel |
| 2026-05-19 | Criação repositório GitHub, CI/CD, SQL do banco executado |
| 2026-05-19 | Correção variáveis de ambiente Vercel (salvas permanentemente via API) |
| 2026-05-20 | Implementação reset de senha (`ResetPassword.tsx`) |
| 2026-05-20 | Criação MEMORY.md + organização do projeto |
| 2026-05-20 | Criação base de conhecimento: CHANGELOG.md, PROMPTS.md, BUGS.md, LINKS.md |
| 2026-05-20 | Criação do CLAUDE.md com instruções automáticas de sessão (início proativo + checklist final) |
| 2026-05-20 | Regra adicionada: certificar registro no MEMORY.md + Obsidian após toda ação importante |
| 2026-05-20 | [Etapa 2 / Sessão 7] Criação de MEMORY_CORE.md e estrutura SESSIONS/ — Mega Prompt integrado |
| 2026-05-20 | [Etapa 3 / Sessão 8] Fase 1 UX: filtro de Matéria, busca multi-campo (6 campos), TarefaForm mobile |
| 2026-05-20 | [Etapa 4 / Sessão 9] Fase 2: Perfil Inteligente com 5 insights automáticos em Metricas.tsx |
| 2026-05-20 | [Etapa 4 / Sessão 10] Fase 2: Configurações avançadas — avatar, bio, matérias com persistência real |
| 2026-05-20 | [Etapa 5 / Sessão 11] Fase 2: Sons de transição via Web Audio API (concluir, desmarcar, adicionar, remover) |
| 2026-05-20 | [Etapa 6 / Sessão 12] Fase 2: Tema claro/escuro com CSS vars, ThemeLoader, persistência Supabase — PROJETO FINALIZADO |
| 2026-05-20 | [Bugfix] Importação de planilha: erro 400 corrigido — sanitização de status/prioridade + parsing de datas Excel |
| 2026-05-21 | [Sessão 015] Bugfixes: avatar via Canvas base64, perfil sem linha no banco (upsert + SQL fix), notification_settings 409 |
| 2026-05-22 | [Etapa 9 / Sessão 016] Web Push Notifications completo: sw.js, notificationService, Edge Function, VAPID secrets, pg_cron, UI em Configurações |
| 2026-05-28 | [Etapa 10 / Sessão 017] FASE 1 crítica: timezone das datas, expiração automática (23:59:59), status efetivo (pending/completed/expired), buckets de ordenação, light mode cores neutras corrigidas |
| 2026-05-28 | [Etapa 10 / Sessão 018] FASE 2 visual: rename Matéria→Disciplina, página Disciplinas com cards, modal moderno (emoji+cor+preview), DisciplinasContext, migration `003_subjects_add_emoji`, emoji em TarefaCard/TarefaForm/Sidebar |
| 2026-05-28 | [Etapa 11 / Sessão 019] Onboarding pós-cadastro em 3 passos (nome+ano, seleção visual de disciplinas, revisão), migration `004_profiles_add_onboarding_completed`, OnboardingGate no App.tsx |
| 2026-05-28 | [Etapa 12 / Sessão 020] FASE 3 calendário semanal: Agenda.tsx reescrita (7 colunas, mini-cards com emoji/cor/status, long-press 450ms para criar tarefa, useLongPress hook com vibração, navegação prev/next+Hoje), TarefaForm com initialDueDate |
| 2026-05-28 | [Etapa 12 / Sessão 021] Agenda toggle Semana/Mês: visão mensal modernizada (dots coloridos, emoji do dia, pulso vermelho para expiradas, long-press na célula, painel lateral com mini-cards) |
| 2026-05-28 | [Etapa 12 / Sessão 022] Bugfix BUG-020: Agenda semanal — long-press na coluna inteira + botão "+ Nova" sempre visível quando há tarefas |
| 2026-05-28 | [Etapa 13 / Sessão 023] FASES 4 e 5: nova página Visão Geral (dashboard com 5 seções, ring SVG, saudação dinâmica) como landing, aba Configurações → Acadêmico (ano escolar + idioma), migration `005_profiles_add_school_year`, Onboarding usa school_year |

---

## 25. Arquivos do Sistema de Memória

| Arquivo | Função |
|---|---|
| `MEMORY.md` | Fonte de verdade completa do projeto |
| `MEMORY_CORE.md` | Estado operacional atual — "cérebro ativo" |
| `SESSIONS/NNN.md` | Log individual de cada sessão |
| `cloud.md` | Controle de etapas e continuidade entre conversas |
| `CLAUDE.md` | Instruções automáticas de início e fim de sessão |

---

*Este arquivo é a fonte de verdade do projeto. Sempre atualizar ao final de cada sessão.*
