# Roadmap — Tarefas Escolares

## v5.0 — Planejado (Sessão 029, 2026-07-23)

Lista de melhorias levantada ao final da Sessão 029, a pedido do usuário ("quero que crie uma lista de melhorias para o v.5"). Nenhuma implementada ainda — fica para uma próxima conversa.

### 🎯 Recurso principal: registro de tarefas por imagem (análise por IA)

Usuário tira uma foto/print do quadro de avisos, agenda escolar em papel ou mensagem da escola, e o app usa análise de IA sobre a imagem pra identificar e sugerir as tarefas automaticamente — com o mesmo fluxo de revisão já usado na importação de planilha. Se uma tarefa extraída vier incompleta (sem data, sem matéria, título vago), o app recomenda ativamente que o usuário complete o detalhamento antes de salvar.

**Especificação técnica completa:** [`docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md`](./V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md) — arquitetura (Storage + Edge Function + provedor de IA de visão), decisão pendente de provedor (Claude/GPT-4/Gemini — requer API key do usuário), regras de "detalhamento incompleto", e checklist de implementação passo a passo.

- [ ] Ver especificação completa e decidir provedor de IA de visão antes de começar

### Outras melhorias candidatas para v5

- [ ] **Assistente de estudos por IA** — dado o histórico de desempenho (Métricas), sugerir automaticamente em quais matérias focar essa semana
- [ ] **Resumo semanal automático** — notificação/email no domingo à noite com o que vem pela frente na semana
- [ ] **Modo offline (PWA completo)** — cache de tarefas via Service Worker para uso sem internet, sincronizando quando a conexão voltar
- [ ] **Exportar Agenda para o calendário do celular** — gerar arquivo `.ics` a partir das tarefas com prazo, importável no Google Calendar/Apple Calendar
- [ ] **Widget de tarefas do dia** — versão simplificada da Visão Geral pensada para tela de bloqueio/widget do celular (PWA installable já existe; isso é sobre um recorte de dados mais enxuto)
- [ ] **Histórico de conclusão em gráfico de calor (heatmap)** — visualização estilo GitHub contributions, mostrando os dias mais produtivos do mês/ano
- [ ] **Metas por período** — usuário define uma meta de tarefas concluídas por semana/mês e acompanha o progresso
- [ ] **Compartilhamento de tarefa avulsa** — gerar link de leitura (sem exigir login) para um responsável acompanhar uma tarefa específica, sem abrir mão de RLS no resto do app
- [ ] Itens antigos ainda pendentes da lista de longo prazo (ver seção "v3.0 — Visão de Longo Prazo" abaixo): drag & drop, tarefas recorrentes, tags customizáveis, integração com Google Calendar

## v3.0 — Módulo de Mesada + Tutorial guiado (branch pessoal `v3-mesada-pessoal`, Sessão 028 — 2026-07-22) ✅ CONCLUÍDA

**Uso exclusivamente pessoal — não publicar em `main`.**

- [x] Migration `mesada_config` / `mesada_materias` / `mesada_notas` com RLS
- [x] Cálculo por tabela única de conceito (MB=R$22/B=R$5/R=R$2/I=-R$5) + limite de MB travando (6º vira B)
- [x] Página `/mesada` com 3 abas (Lançamentos, Acompanhamento, Configurações), atrás da flag `VITE_ENABLE_MESADA_MODULE`
- [x] Importação em lote de Disciplinas existentes como matérias do boletim
- [x] Grade do boletim (tabela matéria × mês) + gráfico de distribuição de conceitos por matéria
- [x] Termômetro por matéria, lembrete de fim de mês, virada de ano automática (config herda valores do ano anterior)
- [x] Tutorial guiado do app com efeito spotlight (19 passos, todas as páginas) — recurso geral, candidato a ir para `main` separadamente
- [x] Oferta automática do tutorial a usuários novos pós-onboarding

**Próximo passo:** nenhum definido — usuário sem novas ideias no momento. Deploy remoto pessoal (2º projeto Vercel) fica para quando o usuário quiser um link de acesso fora do servidor local.

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

## FECHAMENTO — Ações completas no TarefaForm (Sessão 025 — 2026-05-28) 🎉 PROJETO FINALIZADO

- [x] Botão "Marcar como concluída" / "pendente" no rodapé do modal de edição
- [x] Botão "Excluir" vermelho com dupla confirmação
- [x] Sons e toasts em cada ação
- [x] Acessível em todas as origens (Agenda semanal/mensal, Tarefas, Visão Geral, Disciplinas)

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
- [x] OCR — fotografar quadro-negro para criar tarefa — **superado pela especificação completa da v5.0**, ver seção no topo deste arquivo e `docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md`
- [ ] IA — sugestão de prioridade automática
- [x] Multi-idioma completo — entregue na Sessão 029 (i18n real pt-BR/en/es, cobertura completa de páginas, modais, componentes e tutorial guiado)
- [ ] Plano Pro com funcionalidades avançadas
