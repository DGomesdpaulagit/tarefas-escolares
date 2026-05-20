# cloud.md — Registro de Etapas e Sessões do Projeto Tarefas Escolares

Arquivo de controle de continuidade entre conversas do Claude Code.
Lido automaticamente no início de cada nova conversa.

---

## Glossário

- **Etapa** = uma conversa completa no Claude (uma janela/thread)
- **Sessão** = um bloco de progresso dentro de uma Etapa

---

## ETAPA ATUAL: Etapa 7 - PWA e Ícone Oficial
## SESSÃO ATUAL: [Sessão 13] - Ícone oficial e PWA favicon assets ✅ CONCLUÍDA

---

## [Etapa 6 / Sessão 12] - Tema Claro/Escuro (Fase 2 finalizada)
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- `index.css`: CSS custom properties `--bg-base`, `--bg-surface`, `--bg-card`, `--bg-card-hover` com valores Light (`:root`) e Dark (`.dark`)
- `ThemeContext.tsx`: expõe `setTheme` no contexto, `ThemeProvider` com `switchable`
- `App.tsx`: `ThemeLoader` sincroniza tema do Supabase (`profiles.theme`) no login; `ThemedApp` usa tema dinâmico no Toaster
- Substituídos todos os `bg-[#0f1117]`, `bg-[#13151f]`, `bg-[#1a1d27]`, `bg-[#1e2130]` por vars CSS em 17 arquivos:
  - `Home.tsx`, `Sidebar.tsx`, `Login.tsx`, `ResetPassword.tsx`, `Agenda.tsx`
  - `Arquivos.tsx`, `Metricas.tsx`, `TarefaCard.tsx`, `Configuracoes.tsx`
  - `Tarefas.tsx`, `TarefaForm.tsx`, `ImportarPlanilhaModal.tsx`
  - `LimparTarefasModal.tsx`, `UserMenu.tsx`, `App.tsx`
- `AbaTema` em Configurações: toggle light/dark funcional, salva em `profiles.theme` via Supabase
- Transição suave (250ms) entre temas
- Light mode: tema Academic Light (`#f0f3f8` base, `#ffffff` card)
- Dark mode: tema Academic Dark (`#0f1117` base, `#1a1d27` card) — padrão preservado

### Arquivos modificados (17)
- `client/src/index.css`
- `client/src/contexts/ThemeContext.tsx`
- `client/src/App.tsx`
- `client/src/components/{Sidebar,TarefaCard,TarefaForm,ImportarPlanilhaModal,LimparTarefasModal,UserMenu}.tsx`
- `client/src/pages/{Home,Login,ResetPassword,Agenda,Arquivos,Metricas,Configuracoes,Tarefas}.tsx`

### Próximo passo
**PROJETO FINALIZADO** — todas as features da Fase 2 implementadas:
✅ Sessão 8: Filtros + busca multi-campo + mobile
✅ Sessão 9: Perfil Inteligente (Métricas)
✅ Sessão 10: Configurações avançadas (avatar, bio, matérias)
✅ Sessão 11: Sons de transição (Web Audio API)
✅ Sessão 12: Tema claro/escuro com persistência Supabase

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (deploy automático disparado)
- Build: ✅ 0 erros TypeScript
- Commit: df771fd — "feat: implement light/dark theme with CSS custom properties"
- Push: ✅ main → GitHub (59e76f0)

---

## [Etapa 7 / Sessão 13] - Ícone oficial e PWA favicon assets
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Gerados 7 arquivos de ícone em `client/public/`:
  - `favicon.ico` (16/32/48px)
  - `favicon-16x16.png`, `favicon-32x32.png`
  - `apple-touch-icon.png` (180×180)
  - `android-chrome-192x192.png`, `android-chrome-512x512.png`
  - `maskable-icon-512x512.png`
- Criado `manifest.webmanifest` com configuração PWA completa
- Atualizado `client/index.html` com todas as meta tags e links de ícone

### Arquivos criados/modificados (9)
- `client/public/favicon.ico` (novo)
- `client/public/favicon-16x16.png` (novo)
- `client/public/favicon-32x32.png` (novo)
- `client/public/apple-touch-icon.png` (novo)
- `client/public/android-chrome-192x192.png` (novo)
- `client/public/android-chrome-512x512.png` (novo)
- `client/public/maskable-icon-512x512.png` (novo)
- `client/public/manifest.webmanifest` (novo)
- `client/index.html` (modificado)

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (deploy automático disparado)
- Build: ✅ 0 erros TypeScript
- Commit: e3ecd5d — "feat: add official app icon and PWA favicon assets"
- Merge: a9a4609 — "merge: Sessão 13 — ícone oficial e PWA favicon assets"
- Push: ✅ main → GitHub

### Próximo passo
A definir na próxima conversa.

---

## [Etapa 5 / Sessão 11] - Sons de Transição (Web Audio API)
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Criado `soundService.ts` — Web Audio API puro, sem arquivos externos:
  - `playConcluida()` — chime ascendente ao concluir tarefa
  - `playDesmarcada()` — tom descendente ao desmarcar
  - `playAdicionada()` — pop curto ao criar nova tarefa
  - `playRemovida()` — descida rápida ao remover tarefa
- `sound_enabled` lido do localStorage (sincronizado com Supabase ao salvar Settings)
- `AbaNotificacoes`: ao carregar, sincroniza localStorage; ao salvar, toca preview do som se ativado
- `TarefaCard`: sons em toggle e remoção
- `TarefaForm`: som ao adicionar nova tarefa

### Arquivos modificados
- `client/src/services/soundService.ts` (novo)
- `client/src/pages/Configuracoes.tsx`
- `client/src/components/TarefaCard.tsx`
- `client/src/components/TarefaForm.tsx`

### Próximo passo
**Etapa 6 — [Sessão 12] - Fase 2: Tema claro/escuro** (última feature da Fase 2)

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- Build: ✅ 0 erros TypeScript

---

## [Etapa 4 / Sessão 10] - Configurações Avançadas (avatar, bio, matérias)
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- **Avatar upload** — foto de perfil com Supabase Storage (bucket `avatars`), exibição com iniciais como fallback, limite 2 MB
- **Bio** — campo de texto curto (200 chars) salvo na tabela `profiles`
- **Carregamento real do perfil** — `AbaPerfil` agora carrega dados do Supabase no mount (antes lia apenas `user_metadata`)
- **Matérias com persistência real** — `AbaMaterias` agora usa `subjectService` (tabela `subjects`):
  - Lista matérias salvas no Supabase
  - Adiciona matérias padrão com 1 clique
  - Adiciona matérias personalizadas por nome
  - Remove matérias com botão (aparece no hover)
- Adicionado `uploadAvatar()` em `profileService.ts`

### Arquivos modificados
- `client/src/pages/Configuracoes.tsx`
- `client/src/services/profileService.ts`

### Próximo passo
**Etapa 5 — [Sessão 11] - Próxima feature da Fase 2** (tema claro/escuro ou sons)

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- Build: ✅ 0 erros TypeScript
- Nota: avatar upload requer bucket `avatars` no Supabase Storage (público)

---

## [Etapa 4 / Sessão 9] - Perfil Inteligente em Métricas
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Implementado **Perfil Inteligente** na página de Métricas (`Metricas.tsx`)
- 5 insights automáticos computados a partir dos dados reais:
  1. **Foco urgente** — matéria com mais tarefas urgentes
  2. **Mais produtiva** — matéria com maior taxa de conclusão (mín. 2 tarefas)
  3. **Mais atrasada** — matéria com mais tarefas "Passou do Prazo"
  4. **Progresso médio** — média de `progress` das tarefas em andamento
  5. **Ritmo (7 dias)** — tarefas concluídas na última semana (via `completed_at`)
- Corrigido bug do `materiasComAtraso` que calculava incorretamente
- Adicionado componente `InsightCard` reutilizável com cor por tipo
- KPI "Ponto de Atenção" substituído por "Ritmo (7 dias)" — dado mais útil

### Arquivos modificados
- `client/src/pages/Metricas.tsx`

### Próximo passo
**Etapa 5 — [Sessão 10] - Próxima feature da Fase 2** (tema claro/escuro, configurações ou notificações)

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- Build: ✅ 0 erros TypeScript

---

## [Etapa 3 / Sessão 8] - Filtro de Matéria, busca multi-campo e mobile
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Adicionado filtro de **Matéria** no painel de filtros (`Tarefas.tsx`) com lista dinâmica das matérias cadastradas
- Expandida a **busca avançada** para incluir `notes`, `sector`, `origin`, `description` além de `title` e `subject_name` (`TarefasContext.tsx`)
- Corrigido grid do **formulário mobile**: `grid-cols-1 sm:grid-cols-2` em todos os campos duplos (`TarefaForm.tsx`)
- Confirmado que urgentes no topo já estava implementado ✅

### Arquivos modificados
- `client/src/contexts/TarefasContext.tsx` — busca multi-campo
- `client/src/pages/Tarefas.tsx` — filtro de Matéria no painel
- `client/src/components/TarefaForm.tsx` — grid responsivo mobile

### Próximo passo
**Etapa 4 — [Sessão 9] - Fase 2 (a definir)**
- Possíveis: notificações de prazo, exportação de dados, integração com calendário real

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- Build: ✅ 0 erros TypeScript

---

## [Etapa 2 / Sessão 7] - Integração do Mega Prompt ao sistema de memória
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Recebido Mega Prompt de arquitetura de agente IA
- Criado `MEMORY_CORE.md` — estado operacional ativo (complementa MEMORY.md)
- Criada estrutura `SESSIONS/` com log `007.md`
- Nenhum código de produção alterado
- Fase 1 UX adiada para Etapa 3 por decisão do usuário (melhor organização)

### Arquivos criados
- `MEMORY_CORE.md`
- `SESSIONS/007.md`

### Próximo passo
**Etapa 3 — [Sessão 8] - Implementação Fase 1 UX**
1. Legendas nos filtros → `client/src/pages/Tarefas.tsx`
2. Melhorias mobile → `TarefaCard.tsx` + `TarefaForm.tsx`
3. Busca avançada multi-campo → `client/src/contexts/TarefasContext.tsx`
4. Tarefas urgentes no topo → `client/src/contexts/TarefasContext.tsx`

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- GitHub: ✅ commit `61baacd` — push confirmado
- Build: ✅ 0 erros TypeScript
- MEMORY_CORE.md: ✅ criado
- SESSIONS/: ✅ criado

---

## [Etapa 1 / Sessão 6] - Nomenclatura de etapas e regra de nomeação de conversas
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Criado `CLAUDE.md` com instruções automáticas de início e fim de sessão
- Configurado comportamento proativo: Claude lê cloud.md e MEMORY.md ao iniciar
- Adicionada regra de certificação após cada ação importante
- Criado `cloud.md` para controle de etapas e sessões
- Explicado a diferença entre Etapa (conversa) e Sessão (progresso dentro da conversa)
- Definida regra: ao final de cada Etapa, Claude sugere o nome da conversa no formato `Etapa X - (nome)`
- Etapa 1 nomeada: **"Etapa 1 - Documentação, CLAUDE.md e sistema de continuidade automática"**

### Problemas resolvidos
- Usuário não sabia onde ficavam as "Project Instructions" → configurado via CLAUDE.md
- Progresso não era registrado automaticamente → sistema cloud.md + MEMORY.md criado
- Conversas sem nome estruturado → regra de nomenclatura Etapa X definida

### Próximo passo
**Etapa 2 — [Sessão 7] - Implementação da Fase 1 (UX)**
1. Legendas nos filtros → `client/src/pages/Tarefas.tsx`
2. Melhorias mobile → `TarefaCard.tsx` + `TarefaForm.tsx`
3. Busca avançada multi-campo → `client/src/contexts/TarefasContext.tsx`
4. Tarefas urgentes no topo → `client/src/contexts/TarefasContext.tsx`

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app (funcionando)
- GitHub: ✅ commit `02aafde` — push confirmado
- Build: ✅ 0 erros TypeScript
- Vercel: ✅ CI/CD ativo

---

## [Sessão 5] - Criação do MEMORY.md e base de conhecimento
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Criado `MEMORY.md` com 24 seções (~490 linhas) — fonte de verdade do projeto
- Criado `CHANGELOG.md` (Keep a Changelog) com v2.0.0 e v1.0.0
- Criado `PROMPTS.md` com 9 prompts documentados
- Criado `BUGS.md` com 12 bugs resolvidos e 3 conhecidos
- Criado `LINKS.md` com todos os links organizados por categoria
- Todos os arquivos commitados e pushdados para o GitHub

### Problemas resolvidos
- Projeto sem documentação estruturada → base de conhecimento completa criada
- Perda de contexto entre sessões → MEMORY.md como fonte de verdade

### Commits
- `02f9a35` — docs: add project knowledge base files
- `9c5f152` — chore: add CLAUDE.md with project instructions
- `861a155` — chore: update CLAUDE.md with proactive session start and end checklist

---

## [Sessão 4] - Implementação do reset de senha
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Criado `client/src/pages/ResetPassword.tsx` completo
- Configurado listener `onAuthStateChange` para evento `PASSWORD_RECOVERY`
- Adicionada rota `/reset-password` no `App.tsx` (branches autenticado e não-autenticado)
- Atualizado `authService.ts` com `redirectTo: ${window.location.origin}/reset-password`
- Adicionado indicador visual de força da senha

### Problemas resolvidos
- BUG-011: Link de reset abria página em branco → `ResetPassword.tsx` criado com handler correto

### Commits
- Reset de senha funcional em produção

---

## [Sessão 3] - Correção de tela preta (variáveis de ambiente Vercel)
**Data:** 2026-05-19
**Status:** ✅ Concluída

### O que foi feito
- Identificado que vars passadas via `--env` no CLI não foram persistidas no projeto Vercel
- Usado Vercel API para salvar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` permanentemente
- Vars salvas para targets: `production`, `preview`, `development`
- Novo deploy disparado — app voltou a funcionar

### Problemas resolvidos
- BUG-010: Tela preta em produção por ausência de variáveis de ambiente

---

## [Sessão 2] - Build limpo, deploy Vercel e integração GitHub
**Data:** 2026-05-19
**Status:** ✅ Concluída

### O que foi feito
- Corrigidos todos os erros TypeScript (0 erros restantes)
- Criado repositório GitHub `DGomesdpaulagit/tarefas-escolares`
- Configurado CI/CD: push em main → Vercel deploy automático (~30s)
- Criado `vercel.json` com `installCommand: "npm install"` (evita falha do pnpm)
- Executado SQL do banco no Supabase (5 tabelas, RLS, triggers)
- Variáveis de ambiente configuradas

### Problemas resolvidos
- BUG-001 a BUG-009: Erros TypeScript, imports quebrados, plugins incompatíveis
- BUG-012: Vercel rejeitando nome com parênteses → `--name tarefas-escolares`

---

## [Sessão 1] - Limpeza do projeto Manus AI e refatoração completa
**Data:** 2026-05-19
**Status:** ✅ Concluída

### O que foi feito
- Removidos todos os artefatos Manus AI (ManusDialog.tsx, Map.tsx, debug-collector.js, etc.)
- Deletados 14 componentes shadcn/ui com dependências ausentes
- Migrada autenticação de localStorage para Supabase Auth real
- Migrado CRUD de tarefas de localStorage para Supabase PostgreSQL
- Substituído `usePersistFn` por `useCallback` nativo
- Corrigido `tw-animate-css` → `@plugin "tailwindcss-animate"` (Tailwind v4)
- Removido analytics Manus AI do `index.html`
- Corrigido `sonner.tsx` removendo dependência `next-themes`

### Problemas resolvidos
- Projeto original gerado pelo Manus AI com código quebrado, deps ausentes e dados hardcoded
- Autenticação mockada substituída por Supabase Auth real

---

## Histórico de commits principais

| Commit | Sessão | Descrição |
|--------|--------|-----------|
| `a3e1374` | 6 | docs: add mid-session registration rule |
| `861a155` | 6 | chore: update CLAUDE.md with proactive checklist |
| `9c5f152` | 6 | chore: add CLAUDE.md |
| `02f9a35` | 5 | docs: add project knowledge base files |

---

*Atualizado automaticamente ao final de cada sessão.*
