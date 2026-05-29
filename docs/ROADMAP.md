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

## FASE 6 — Notificações + Onboarding pré-login (Sessão 024 — 2026-05-28)

**Notificações:**
- [x] Service Worker v2 (data.url, SHOW_NOTIFICATION via postMessage, vibração)
- [x] `sendTest()` + botão "Enviar notificação de teste" nas Configurações
- [x] `notifyTaskCreated()` — notificação local ao criar (opt-in)
- [x] Alerta de tarefas expiradas em `checkAndNotify` (agrupado, 1x por dia)
- [x] Migration `006_notification_settings_notify_on_create`
- [x] Aba Configurações reorganizada em 3 caixas com descrições por opção

**Welcome pré-login:**
- [x] 5 slides curtos com emoji + ícone + título + texto
- [x] Bolhas coloridas (uma cor por slide), botão "Pular" sempre visível
- [x] Dots clicáveis + animação de transição
- [x] Persistência em localStorage (`tarefas_welcome_seen_v1`)
- [x] Mostra apenas na primeira visita (anônima)

## FASES 4 e 5 — Dashboard + Configurações Acadêmicas (Sessão 023 — 2026-05-28)

**FASE 4 — Dashboard "Visão Geral":**
- [x] Nova página `VisaoGeral` como landing padrão do app
- [x] Saudação dinâmica + botão de criação rápida
- [x] Card "Progresso da Semana" com ring SVG animado e stats inline
- [x] Card "Desempenho Geral" com barra gradient e mini-stats
- [x] Seção "Próximos Prazos" (top 5)
- [x] Seção "Tarefas Expiradas" (top 5)
- [x] Seção "Disciplinas" (top 6 por pendências) com filtro ao clicar
- [x] Sidebar com item "Visão Geral"
- [x] Migration `005_profiles_add_school_year`

**FASE 5 — Configurações Acadêmicas:**
- [x] Aba "Acadêmico" nas Configurações
- [x] Ano escolar com 13 opções (6º Ano → Pós-graduação)
- [x] Idioma com 3 opções (pt-BR, en, es) e bandeiras
- [x] Onboarding salva `school_year` na coluna dedicada
- [x] Sem campo "escola"

## Agenda: visão mensal restaurada (Sessão 021 — 2026-05-28)

- [x] Toggle Semana/Mês no cabeçalho
- [x] Visão mensal com dots coloridos por disciplina
- [x] Emoji da 1ª disciplina como mini-identidade
- [x] Pulso vermelho para dias com tarefa expirada
- [x] Long-press na célula → criação rápida
- [x] Painel lateral com mini-cards do dia selecionado
- [x] Navegação contextual prev/next + "Hoje"

## FASE 3 — Calendário Semanal Moderno (Sessão 020 — 2026-05-28)

- [x] Agenda reescrita em formato semanal (7 colunas)
- [x] Mini-cards com emoji + cor + status visual
- [x] Long-press (450ms) abre criação rápida com data pré-preenchida
- [x] Hook `useLongPress` com cancelamento por movimento + vibração tátil
- [x] Navegação prev/next semana + botão "Hoje"
- [x] Coluna "hoje" destacada
- [x] Estados visuais para concluída/expirada/urgente
- [x] Theme-aware (dark e light)
- [x] Performance otimizada (`useMemo` + lookup O(1))
- [x] TarefaForm aceita `initialDueDate` para criação rápida

## Onboarding pós-cadastro (Sessão 019 — 2026-05-28)

- [x] Migration `004_profiles_add_onboarding_completed`
- [x] Fluxo em 3 passos: boas-vindas (nome + ano) → seleção de disciplinas → revisão
- [x] Grade visual de cards selecionáveis com emoji + cor
- [x] OnboardingGate detecta usuário sem onboarding e direciona
- [x] Botão "Pular" disponível em qualquer passo
- [x] Criação em lote das disciplinas selecionadas

## FASE 2 — Estrutura visual das Disciplinas (Sessão 018 — 2026-05-28)

- [x] Rename global "Matéria" → "Disciplina" na UI
- [x] Página dedicada "Disciplinas" com catálogo em cards
- [x] Emoji por disciplina (picker + custom)
- [x] Paleta de cores em círculos com preview
- [x] Modal moderno de criação/edição com pré-visualização ao vivo
- [x] Contadores por card (pendentes, feitas, vencidas, urgentes)
- [x] Clique no card filtra tarefas pela disciplina
- [x] Sugestões rápidas para adicionar padrões em um clique
- [x] Sidebar exibe emoji + cor das disciplinas configuradas
- [x] TarefaCard e TarefaForm exibem emoji da disciplina
- [x] Migration `003_subjects_add_emoji` aplicada no Supabase
- [x] Aba "Matérias" removida das Configurações (página dedicada)

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
