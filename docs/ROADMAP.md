# Roadmap — Tarefas Escolares

## v2.0 — Atual ✅

- [x] Migração completa de localStorage para Supabase
- [x] Autenticação real (Supabase Auth)
- [x] Row Level Security
- [x] Camada de services
- [x] Página de Agenda (calendário)
- [x] Página de Configurações
- [x] Urgência automática (tarefas ≤ 3 dias)
- [x] Perfil analítico nas métricas
- [x] Exportação JSON e Excel
- [x] Ações visíveis no mobile (sem hover)
- [x] Acessibilidade básica (aria-labels, focus)
- [x] Remoção total de Manus AI
- [x] Documentação completa

## v2.1 — Próximo

- [x] Modo claro (light theme) — entregue na Sessão 012; cores neutras consertadas na Sessão 017
- [ ] i18n: pt-BR, en, es, de, fr
- [ ] Importação de JSON (backup)
- [ ] Matérias personalizadas salvas no Supabase
- [x] Notificações push/browser — entregue na Sessão 016 (Web Push + VAPID + Edge Function + pg_cron)
- [ ] Filtro por matéria no formulário de criação

## FASE 1 — Correções estruturais críticas (Sessão 017 — 2026-05-28)

- [x] Sistema de datas com timezone correto (parseDueDateLocal)
- [x] Expiração automática só após 23:59:59 do dia final
- [x] Status efetivo na UI (pending / completed / expired)
- [x] Bloqueio de conclusão em tarefas expiradas (edição preservada)
- [x] Visual dedicado para expiradas (risco + tonalidade vermelha + badge + XCircle)
- [x] Ordenação por buckets: urgentes → normais → concluídas → expiradas
- [x] Notificações com cálculo de dias corrigido
- [x] Light/Dark mode — cores neutras adaptam automaticamente

## v2.2 — Planejado

- [ ] Drag & drop para reordenar tarefas
- [ ] Compartilhar tarefas (link público)
- [ ] Colaboração em grupo (sala de turma)
- [ ] Recurring tasks (tarefas recorrentes)
- [ ] Tags/labels customizáveis

## v3.0 — Visão de Longo Prazo

- [ ] App mobile (React Native ou PWA)
- [ ] Integração com Google Calendar
- [ ] Integração com Microsoft Teams
- [ ] OCR — fotografar quadro-negro para criar tarefa
- [ ] IA — sugestão de prioridade automática
- [ ] Multi-idioma completo
- [ ] Plano Pro com funcionalidades avançadas
