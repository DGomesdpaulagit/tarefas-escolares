# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão.
> Complementa o MEMORY.md (fonte de verdade completa).

---

## Estado atual

**✅ Fase 0 ✅ | Fase 1 ✅ | Fase 2 ✅ | Bugfixes ✅ | Fase 3 (Push) ✅**

Sistema de memória distribuída completamente estruturado:
- `MEMORY.md` → fonte de verdade completa do projeto (~500 linhas)
- `MEMORY_CORE.md` → estado operacional atual (este arquivo)
- `SESSIONS/` → logs numerados por sessão (001–016)
- `cloud.md` → controle de etapas e continuidade entre conversas
- `CLAUDE.md` → instruções automáticas de início e fim de sessão

App em produção, 100% funcional. **Web Push Notifications implementado e ativo.**

---

## Próximo passo

**Fase 3 — continuação (a decidir com o usuário)**

- [ ] Onboarding (fluxo pós-cadastro: escolha de matérias, preferências)
- [ ] Agenda melhorada (visão semanal, clique para editar/excluir tarefas)

---

## Última ação

**[Etapa 9 / Sessão 016 / 2026-05-22]** — Web Push Notifications completo:
- `client/public/sw.js` criado — Service Worker para push em background
- `client/src/services/notificationService.ts` criado — subscribe/unsubscribe/checkAndNotify
- Tabela `push_subscriptions` no Supabase (endpoint, p256dh, auth, RLS)
- Edge Function `send-notifications` deployada no Supabase (Deno, VAPID)
- Secrets VAPID configurados: `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`
- `pg_cron` habilitado + cron job `send-daily-notifications` às 11h UTC (8h Brasília)
- UI em Configurações → AbaNotificacoes reescrita com banner de status + botões push
- `NotificationChecker` em `App.tsx` — 1x por dia via localStorage
- Commit: `6f03b82`

**[Sessão 015 / 2026-05-21]** — Bugfixes: avatar, perfil e notificações:
- Avatar: Canvas base64 (sem Supabase Storage) + `profileService` todo migrado para `upsert`
- Perfil: linha inexistente no banco criada via SQL no Supabase Dashboard
- notification_settings: 409 corrigido com `{ onConflict: "user_id" }`
- Commits: `725c09a` → `bdd49d0` + `b81add1`

---

## Último commit

`6f03b82` — feat: implement Web Push Notifications (Fase 3 / Sessão 016)

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
Etapa 8 corrigiu bugs de importação, avatar e notificações.
Etapa 9 implementou Web Push Notifications completo (Fase 3 — item 1).

Tags desta sessão: #push #serviceworker #vapid #edgefunction #pgcron #notificações

---

## Status

**✅ EM PRODUÇÃO** — Web Push ativo. Próximo: Onboarding ou Agenda melhorada (Fase 3, itens 2 e 3).
