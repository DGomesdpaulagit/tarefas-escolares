# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão.
> Complementa o MEMORY.md (fonte de verdade completa).

---

## Estado atual

**✅ PROJETO CONCLUÍDO — Fase 0 ✅ | Fase 1 ✅ | Fase 2 ✅ | Bugfixes ✅**

Sistema de memória distribuída completamente estruturado:
- `MEMORY.md` → fonte de verdade completa do projeto (~500 linhas)
- `MEMORY_CORE.md` → estado operacional atual (este arquivo)
- `SESSIONS/` → logs numerados por sessão
- `cloud.md` → controle de etapas e continuidade entre conversas
- `CLAUDE.md` → instruções automáticas de início e fim de sessão

App em produção, 100% funcional. **Fase 1 UX ✅ e Fase 2 ✅ concluídas.**

---

## Próximo passo

**Fase 3 — Features Avançadas (a decidir com o usuário)**

Candidatos:
- Notificações de prazo (Web Notifications API — 3, 2, 1 dias)
- Onboarding (fluxo pós-cadastro: escolha de matérias, preferências)
- Agenda melhorada (visão semanal, clique para editar/excluir tarefas)

---

## Última ação

**[Bugfix / 2026-05-20]** — Importação de planilha retornando erro 400 (Bad Request):
- Causa: valores de `status` e `priority` da planilha não batiam com o enum do Supabase
- Causa secundária: datas do Excel chegavam como número serial (ex: `45672`) em vez de string
- Fix em `client/src/lib/parseExcel.ts`: adicionados `sanitizeStatus()`, `sanitizePrioridade()` e `parseExcelDate()` com mapeamento PT/EN
- Fix em `client/src/components/ImportarPlanilhaModal.tsx`: mensagem de erro agora mostra o erro real do Supabase
- Commit: 4e32f37 | Push: ✅ main → GitHub | Deploy: ✅ Vercel automático

**[Etapa 7 / Sessão 13]** — Ícone oficial e PWA favicon assets:
- Gerados 7 arquivos de ícone em `client/public/` (favicon.ico, PNGs 16/32/180/192/512px, maskable)
- Criado `manifest.webmanifest` (PWA standalone, theme `#0f1117`)
- Atualizado `client/index.html` com todas as tags de favicon, apple-touch-icon, manifest e metas PWA
- Commit: e3ecd5d | Merge: a9a4609 | Push: ✅ main → GitHub | Deploy: ✅ Vercel

**[Etapa 6 / Sessão 12]** — Tema Claro/Escuro (última feature da Fase 2):
- CSS custom properties (`--bg-base`, `--bg-surface`, `--bg-card`, `--bg-card-hover`) em `index.css`
- `ThemeContext.tsx` com `setTheme` exposto; `ThemeProvider switchable`
- `ThemeLoader` em `App.tsx` sincroniza `profiles.theme` do Supabase no login
- Todos os 17 arquivos com `bg-[#0f1117/1a1d27/13151f/1e2130]` convertidos para CSS vars
- `AbaTema` em Configurações funcional com toggle e persistência

---

## Último commit

`f24b8a6` — docs: registrar bugfix importação planilha no MEMORY.md e MEMORY_CORE.md

---

## Regras do sistema

- Não quebrar código funcional
- Não alterar arquitetura sem solicitação explícita
- Sempre atualizar MEMORY_CORE.md após cada sessão
- Sempre registrar sessão em `SESSIONS/NNN.md`
- Sempre fazer commit após alterações
- Só avançar para features após documentação estar estável

---

## Contexto vivo

Etapas 1 e 2 foram 100% dedicadas a estruturar o sistema de memória e continuidade.
Etapa 3 implementou a Fase 1 UX completa.
Etapas 4, 5 e 6 implementaram a Fase 2 completa.
Projeto pronto para Fase 3 quando o usuário decidir avançar.

Tags desta fase: #tema #light #dark #css-vars #supabase #persistência

---

## Status

**✅ CONCLUÍDO** — aguardando decisão do usuário para iniciar Fase 3 (Notificações, Onboarding, Agenda melhorada) ou manutenção.
