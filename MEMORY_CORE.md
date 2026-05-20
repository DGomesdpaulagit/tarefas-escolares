# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão.
> Complementa o MEMORY.md (fonte de verdade completa).

---

## Estado atual

**PROJETO FINALIZADO — Fase 2 concluída ✅**

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

**[Etapa 6 / Sessão 12]** — Tema Claro/Escuro (última feature da Fase 2):
- CSS custom properties (`--bg-base`, `--bg-surface`, `--bg-card`, `--bg-card-hover`) em `index.css`
- `ThemeContext.tsx` com `setTheme` exposto; `ThemeProvider switchable`
- `ThemeLoader` em `App.tsx` sincroniza `profiles.theme` do Supabase no login
- Todos os 17 arquivos com `bg-[#0f1117/1a1d27/13151f/1e2130]` convertidos para CSS vars
- `AbaTema` em Configurações funcional com toggle e persistência

---

## Último commit

`59e76f0` — merge: Sessão 12 — light/dark theme (Fase 2 finalizada)

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

ATIVO — aguardando próxima instrução (Fase 3 ou manutenção)
