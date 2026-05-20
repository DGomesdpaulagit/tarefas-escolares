# cloud.md — Registro de Etapas e Sessões do Projeto Tarefas Escolares

Arquivo de controle de continuidade entre conversas do Claude Code.
Lido automaticamente no início de cada nova conversa.

---

## Glossário

- **Etapa** = uma conversa completa no Claude (uma janela/thread)
- **Sessão** = um bloco de progresso dentro de uma Etapa

---

## ETAPA ATUAL: Etapa 4 - Fase 2 Features
## SESSÃO ATUAL: [Sessão 10] - Configurações Avançadas (avatar, bio, matérias)

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
