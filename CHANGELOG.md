# Changelog — Tarefas Escolares

Todas as mudanças notáveis são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

### Corrigido (Etapa 17 / Sessão 029l — 2026-07-23) — i18n: strings restantes da Visão Geral (dashboard)
- Usuário reportou, testando o app já publicado em produção com o idioma trocado pra inglês, que a aba **Overview** (dashboard) ainda mostrava várias strings em português: labels do card de progresso semanal (Concluídas/Pendentes/Total da semana), card de desempenho geral (Feitas/Ativas/Expiradas, "Taxa de conclusão", "Sua produtividade desde o início"), empty states ("Sem prazos próximos...", "Nenhuma tarefa expirada"), contador "X pendente(s)" nas disciplinas, e a contagem de dias ("Faltam X dias" / "X dias atrás")
- **Causa:** `VisaoGeral.tsx` havia sido marcada como "traduzida" na fase 2, mas só os headers principais tinham sido cobertos — vários textos menores (labels, empty states) ficaram para trás. `labelDiasRestantes()` em `tarefasData.ts` era uma função utilitária pura (fora de componente React), sem acesso ao idioma
- **Correção:** ~20 novas chaves `visaoGeral.*` e `diasRestantes.*` (com prefixo/sufixo separados por idioma, já que a ordem das palavras muda entre pt-BR "Faltam X dias" / en "X days left" / es "Faltan X días"). `labelDiasRestantes()` refatorada para receber `t()` como parâmetro; atualizados os 3 pontos de uso (`VisaoGeral.tsx`, `TarefaCard.tsx`, `Agenda.tsx`)
- Build: 0 erros TypeScript. Deploy de produção verificado via bundle publicado (hash do JS conferido, strings novas confirmadas no ar)

### Adicionado (Etapa 17 / Sessão 029i–k — 2026-07-23) — Sistema de tradução real (i18n) — fase 4 (varredura final, conclui a cobertura completa)
- **Configuracoes.tsx traduzida por completo**: as abas Perfil, Aparência e Notificações (que na fase 1 só tinham o seletor de idioma traduzido) agora usam `t()` em todos os labels, placeholders e toasts — chaves `config.*` (~70 novas entradas)
- **TarefaCard.tsx, HistoricoArquivos.tsx, ResetPassword.tsx** traduzidos — badges de status (`STATUS_LABEL_KEY`), formatação de data por locale no histórico de arquivos, e a tela inteira de redefinição de senha
- **Sistema de tutorial guiado traduzido por completo** (nunca havia sido tocado nas fases anteriores por ter sido construído antes do i18n existir): `OfertaTourModal.tsx` (tela pós-onboarding oferecendo o tour), `TourContext.tsx` (os 19 passos do tour — `TourStep` migrado de `title`/`description` literais para `tituloChave`/`descricaoChave: DicionarioChave`, mesmo padrão já usado em `Welcome.tsx`), `TourOverlay.tsx` (botões "Pular tutorial"/"Anterior"/"Próximo"/"Concluir", contador "Passo X de Y")
- Descoberta pela varredura final: o Grep por acentuação `[à-úÀ-Ú]` deu falso-negativo (não bateu com "ã"/"ç" etc.); verificação cruzada feita com `grep` literal por palavras como "não" encontrou os 3 arquivos do tutorial ainda pendentes
- Build: 0 erros TypeScript validado após cada arquivo
- **Com isso, a cobertura de i18n real do app está completa**: todas as páginas, todos os modais e o tutorial guiado respondem à troca de idioma (pt-BR/en/es). Segue intencionalmente em português apenas o que é dado (não interface): valores de status/prioridade/setor/origem armazenados no Supabase, nomes de matérias do catálogo padrão

### Adicionado (Etapa 17 / Sessão 029f–h — 2026-07-23) — Sistema de tradução real (i18n) — fase 3 (conclui todos os modais)
- Estendido o dicionário (`pt-BR.ts`/`en.ts`/`es.ts`) com chaves para: `tarefaForm.*`, `disciplinaModal.*`, `mesadaMateriaModal.*`, `mesadaImportar.*`, `importarPlanilha.*`, `limparModal.*`
- Todos os 6 modais do app traduzidos: **TarefaForm** (criar/editar tarefa, botões de ação, toasts), **DisciplinaModal** (criar/editar disciplina), **MesadaMateriaModal** e **MesadaImportarDisciplinasModal** (matérias do boletim da Mesada), **ImportarPlanilhaModal** (importação de planilha, preview, estados de sucesso/erro), **LimparTarefasModal** (confirmação destrutiva)
- Build: 0 erros TypeScript validado a cada modal (3 commits incrementais)
- **Com isso, a cobertura de i18n real do app está completa**: todas as páginas e todos os modais respondem à troca de idioma (pt-BR/en/es)

**Ainda intencionalmente em português** (dados, não interface): valores de status/prioridade/setor/origem armazenados no Supabase, nomes de matérias do catálogo padrão (`MATERIAS_PADRAO`). **Pendência não crítica remanescente:** alguns toasts/mensagens de erro dentro de `contexts/` e `services/` que não passam pela UI diretamente podem ainda estar hardcoded — não mapeados nesta varredura.

### Adicionado (Etapa 17 / Sessão 029b–e — 2026-07-23) — Sistema de tradução real (i18n) — fase 2 (conclui a tradução das páginas principais)
- Estendido o dicionário (`pt-BR.ts`/`en.ts`/`es.ts`) com chaves para: `tarefas.*`, `disciplinas.*`, `agenda.*`, `metricas.*`, `arquivos.*`, `mesada.*`, `welcome.*`, `onboarding.*`
- **`CALENDARIO`** adicionado ao sistema de i18n (`diasCurtos`/`mesesCurtos`/`mesesCompletos` por idioma) — usado pela Agenda e pela Mesada, que antes tinham arrays de nomes de dias/meses fixos em português
- Páginas traduzidas nesta fase: **Tarefas** (busca, filtros, ordenação, empty states), **Disciplinas** (cabeçalho, cards, sugestões rápidas, toasts), **Agenda** (semanal/mensal, navegação, dicas), **Métricas** (KPIs, Perfil Inteligente, gráficos, status traduzidos via mapa), **Arquivos** (exportação, histórico, formatação de data por locale), **Mesada** (3 abas completas), **Welcome** (5 slides pré-login), **Onboarding** (3 passos pós-cadastro)
- Formatação de datas em `Arquivos.tsx` agora usa o locale correspondente ao idioma (`pt-BR`/`en-US`/`es-ES`) em vez de `pt-BR` fixo
- Build: 0 erros TypeScript validado após cada página traduzida (9 commits incrementais)

**Pendências conhecidas (não bloqueiam, ficam para uma próxima fase):** modais (`TarefaForm`, `DisciplinaModal`, `MesadaMateriaModal`, `MesadaImportarDisciplinasModal`, `ImportarPlanilhaModal`, `LimparTarefasModal`) e mensagens de toast dentro de `contexts/`/`services/` ainda estão hardcoded em português. Valores de dados (status/prioridade/setor/origem armazenados no Supabase, nomes de disciplinas no catálogo padrão) permanecem em português intencionalmente — são dados, não strings de interface.

### Adicionado (Etapa 17 / Sessão 029a — 2026-07-23) — Sistema de tradução real (i18n) — fase 1
- **Merge de `v3-mesada-pessoal` em `main`** — decisão do usuário: manter tudo em um único projeto/link Vercel (`tarefas-escolares-five.vercel.app`), sem separação de branch por enquanto. Tag `v2.1.0-publico` preservada como ponto de retorno seguro para quando o usuário decidir publicar oficialmente
- **`client/src/lib/i18n/{pt-BR,en,es}.ts`** — dicionários tipados de tradução
- **`LanguageContext.tsx`** — contexto de idioma (padrão igual `ThemeContext`): localStorage-first, sincroniza com `profiles.language` ao logar via `LanguageLoader`
- Seletor de idioma em Configurações > Acadêmico agora **aplica a tradução na hora** (antes só salvava a preferência sem efeito nenhum — "Tradução completa em breve")
- Traduzido nesta fase: Sidebar completa, topbar (título da página + data no locale certo), UserMenu, Login (todas as strings), Configurações (abas + seção de idioma), Visão Geral (headers principais)
- **Mesada:** clicar de novo no conceito já selecionado agora remove o lançamento (corrige lançamento errado sem precisar mexer no banco)
- **Tutorial:** corrigido bug do Esc não fechar a sidebar mobile aberta pelo tour (causava um overlay preto grudado na tela)
- Build: 0 erros TypeScript em cada etapa

### Documentação (Etapa 17 / Sessão 028g — 2026-07-22) — Limpeza e consolidação de toda a documentação do projeto
- Usuário confirmou não ter mais ideias/próximos passos por enquanto — sessão de fechamento e atualização de todos os arquivos de registro
- `MEMORY.md` — seção 22 e histórico consolidados com os 6 blocos da Sessão 028 (Mesada completa + Tutorial)
- `MEMORY_CORE.md` — reescrito por completo (estava parado na Sessão 016/2026-05-22)
- `cloud.md` — Etapa 17 consolidada num único registro cobrindo Sessões 027–028, com "Próximo passo: nenhum definido"
- `BUGS.md` — adicionado BUG-022 (card do tutorial podia renderizar fora da tela, corrigido nesta sessão)
- `PROMPTS.md` — adicionado P-019 (mega-prompt validado da v3.0: Mesada + Tutorial)
- `LINKS.md` — adicionada branch `v3-mesada-pessoal`, nota sobre push pendente
- `DOCUMENTACAO_PROJETO.md` — nova seção 25 (anexo) documentando a v3.0 sem misturar com o núcleo público (v2.1.0)
- `docs/ROADMAP.md` — nova seção v3.0 marcada como concluída
- `README.md` — menção ao Tutorial guiado e às branches do projeto
- `CLAUDE.md` — corrigido caminho do projeto (estava apontando para pasta inexistente em `Downloads`, projeto está em `Documents`)
- **Removido `README_PT.md`** — duplicata obsoleta que descrevia a arquitetura localStorage/Manus AI descontinuada desde a Sessão 1 (contradizia o `README.md` atual, que já é em português e reflete a arquitetura real com Supabase)

### Corrigido/Adicionado (Etapa 17 / Sessão 028f — 2026-07-22) — Tutorial: velocidade, oferta a novos usuários, card nunca cortado
- **Animação mais lenta:** destaque (spotlight) agora se move em 0.6s (era 0.2s) e o card de explicação entra com `fadeSlideIn` 0.45s a cada passo, em vez de trocar instantaneamente
- **Bug corrigido:** em passos com o alvo perto do rodapé da tela (ex: itens de baixo da Sidebar em Configurações), o card de Anterior/Próximo/Pular podia renderizar parcialmente fora da janela (atrás da barra de tarefas do sistema, por exemplo), ficando impossível de clicar. Agora a posição vertical do card é sempre limitada aos limites da janela — nunca fica cortado embaixo nem em cima
- **Tutorial oferecido a usuários novos:** ao concluir (ou pular) o onboarding, uma tela pergunta "Quer um tour rápido guiado?" com opções "Ver tutorial" / "Agora não" — `OfertaTourModal.tsx`, disparado uma única vez via flag em `localStorage`
- Build: 0 erros TypeScript

### Adicionado (Etapa 17 / Sessão 028e — 2026-07-22) — Tutorial guiado do app com spotlight
- **`TourContext.tsx`** — 19 passos cobrindo todas as páginas e abas do app (Visão Geral, Tarefas, Disciplinas, Agenda, Métricas, Mesada quando habilitada, Arquivos, Configurações, menu do usuário), com navegação automática entre páginas e abertura/fechamento da sidebar mobile conforme o passo
- **`TourOverlay.tsx`** — escurece o restante da tela e recorta (spotlight) o elemento sendo explicado via `box-shadow` no elemento alvo; bloqueia cliques fora do tutorial; card com título, descrição, contador de passos e botões Anterior/Próximo/Pular; tecla Esc encerra
- **Atributos `data-tour`** adicionados (sem alterar comportamento) em: itens da Sidebar, botão "Nova tarefa" (Visão Geral), botão de filtros (Tarefas), botão "Adicionar disciplina" (Disciplinas), toggle Semana/Mês (Agenda), card "Perfil Inteligente" (Métricas), abas da Mesada, abas e botão de tutorial (Configurações), avatar (UserMenu)
- **Botão "Ver tutorial do app"** na barra lateral de Configurações — inicia o tour a qualquer momento
- Build: 0 erros TypeScript

### Adicionado (Etapa 17 / Sessão 028d — 2026-07-22) — Mesada: termômetro, lembrete mensal, virada de ano + data no topo
- **Termômetro por matéria** (🟢/🟡/🔴) na aba Lançamentos, calculado pela média histórica dos conceitos daquela matéria no ano (peso MB=3/B=2/R=1/I=0) — não afeta o valor em R$, é só indicador visual
- **`notificationService.checkMesadaReminder()`** — lembrete local (1x/dia) nos últimos 5 dias do mês se houver matéria sem lançamento; **`MesadaNotificationChecker.tsx`** monta essa checagem dentro do `MesadaProvider`
- **Virada de ano automática e correta:** `mesadaService.getConfigMaisRecente()` + lógica em `MesadaContext.recarregar` — ao entrar em um ano letivo novo sem config, os valores (MB/B/R/I, limite, meta) são **herdados do ano anterior** em vez de resetar para os defaults do banco. Matérias do boletim já eram compartilhadas entre anos (sem coluna `ano`); lançamentos (`mesada_notas`) começam vazios naturalmente por serem escopados por ano/mês — nenhuma ação manual necessária na virada do ano
- **Data de hoje ao vivo** no topo do app (`Home.tsx`) — centralizada no topbar desktop, abaixo do título no topbar mobile; atualiza sozinha (checagem a cada hora), sem precisar recarregar a página
- Build: 0 erros TypeScript

### Adicionado (Etapa 17 / Sessão 028c — 2026-07-22) — Mesada: Grade do boletim + Distribuição por matéria
- **Grade do boletim** na aba Acompanhamento — tabela matérias × meses (mesmo layout da planilha original do usuário), célula colorida por conceito, linha de total por mês e coluna de total por matéria
- **Gráfico "Desempenho por matéria"** — barras empilhadas horizontais mostrando quantos MB/B/R/I cada matéria teve no período, pra identificar onde está a dificuldade
- **Cards de insight automáticos** — "Onde você manda bem" (matéria com mais MB) e "Precisa de atenção" (matéria com mais penalidades I, ou predominância de R)
- Build: 0 erros TypeScript

### Adicionado (Etapa 17 / Sessão 028b — 2026-07-22) — Mesada: importar Disciplinas existentes em lote
- **`MesadaMateriaModal` (feedback do usuário):** faltava um jeito rápido de trazer as Disciplinas já cadastradas no app (Português, Matemática, etc.) para as matérias do boletim da Mesada sem digitar uma por uma
- **`MesadaImportarDisciplinasModal.tsx`** — novo modal com lista de checkboxes das Disciplinas ainda não vinculadas a nenhuma matéria da Mesada; seleção múltipla + botão "Importar (N)" cria todas de uma vez, herdando nome/emoji/cor
- Botão "Importar Disciplinas" adicionado ao lado de "Nova matéria" na aba Configurações da Mesada
- Build: 0 erros TypeScript

### Adicionado (Etapa 17 / Sessão 028 — 2026-07-22) — v3.0: Módulo de Mesada por Desempenho — implementação inicial (uso pessoal, branch `v3-mesada-pessoal`)
- **Ambiguidades da especificação resolvidas com o usuário:** tabela de conceito única para todas as matérias (Eixo A: MB=R$22/B=R$5/R=R$2/I=-R$5) e o limite de 5 MBs por período **trava o cálculo** (o 6º MB em diante é recalculado como B)
- **Migration `007_mesada_module`** (aplicada via Supabase MCP + salva em `supabase/migrations/`) — tabelas `mesada_config`, `mesada_materias`, `mesada_notas`, todas com RLS `auth.uid() = user_id`
- **`mesadaService.ts`** — CRUD de config (upsert por ano letivo), matérias e notas (upsert por matéria/ano/mês)
- **`MesadaContext.tsx`** — estado global do módulo; cálculo de valor por lançamento com a regra de travamento do limite de MB (ordem determinística por mês + ordem da matéria); `valorAcumulado`, `progressoPercentual`, `valorDoMes`
- **Feature flag `VITE_ENABLE_MESADA_MODULE`** (`client/src/lib/featureFlags.ts`) — controla item de sidebar, rota `/mesada` e o `MesadaProvider` em `App.tsx`; default ausente/false, setada como `true` apenas em `.env.local` deste ambiente pessoal
- **Página `Mesada.tsx`** com 3 abas: Lançamentos (picker de conceito MB/B/R/I por matéria/mês, resumo do mês, contador de MBs vs limite), Acompanhamento (RingProgress da meta, gráfico de evolução mensal via Recharts, lista de penalidades), Configurações da Mesada (período, valores por conceito, limite, meta, CRUD de matérias do boletim)
- **`MesadaMateriaModal.tsx`** — reaproveita paleta de cores e emoji picker de `lib/tarefasData.ts`; permite vincular opcionalmente a uma Disciplina existente (herda emoji/cor)
- Build validado: `npm run build` — 0 erros TypeScript
- Cálculo conferido manualmente contra o exemplo do documento original (5 MB + 6 B + 1 R + 1 I = R$137,00 de total potencial)

### Planejamento (Etapa 17 / Sessão 027 — 2026-05-30) — v3.0: Módulo de Mesada por Desempenho (uso pessoal)
- Criada tag `v2.1.0-publico` no commit `80adcd8` — marco de retorno seguro da versão pública, sem o módulo de Mesada
- Criada e pushada branch `v3-mesada-pessoal` a partir de `main` — onde a v3.0 será desenvolvida
- Documento de especificação técnica completo em `docs/V3_ESPECIFICACAO_MODULO_MESADA.md`: modelo de dados (`mesada_config`, `mesada_materias`, `mesada_notas`), fórmulas de cálculo, UI proposta (3 abas), estratégia de deploy com dois projetos Vercel separados, feature flag `VITE_ENABLE_MESADA_MODULE` como proteção adicional
- **Nenhum código de produção foi alterado** — sessão exclusivamente de planejamento; implementação começa em nova conversa

### Corrigido (Etapa 16 / Sessão 026 — 2026-05-29) — HOTFIX BUG-021
- **Bug crítico de salvamento de tarefa** — quando o usuário deixava a data de entrega em branco, o Supabase retornava 400 Bad Request porque o form enviava `due_date: ""` para uma coluna `date`. Toast "Erro ao salvar tarefa" aparecia.
- Correção: `TarefaForm.handleSubmit` agora normaliza strings vazias para `null` em todos os campos opcionais (`due_date`, `notes`, `link`, `sector`, `origin`, `description`) antes de enviar
- `title` ganhou `.trim()` por segurança

### Adicionado (Etapa 15 / Sessão 025 — 2026-05-28) — Ações completas no TarefaForm (PROJETO FINALIZADO 🎉)
- **Botão "Marcar como concluída/pendente"** dentro do `TarefaForm` em modo edição (verde/âmbar, largura total). Não aparece em tarefas expiradas.
- **Botão "Excluir"** vermelho com **dupla confirmação** (clique 1 → "Confirmar?", clique 2 dentro de 3s → exclui)
- Sons e toasts informativos em todas as ações; botões mutuamente bloqueados durante operações
- Resultado: **um único clique** em qualquer mini-card da Agenda, Tarefas, Visão Geral ou Disciplinas abre o modal com **todas** as ações (editar campos, concluir/desmarcar, excluir)
- Versão `2.1.0` — projeto considerado completo

### Adicionado (Etapa 14 / Sessão 024 — 2026-05-28) — FASE 6: Notificações + Onboarding pré-login

#### Notificações
- **Service Worker v2** com suporte a `data.url` para redirecionamento, listener `message` para notificações locais, vibração padrão `[120,60,120]`, `requireInteraction` opcional
- **`sendTest()`** no `notificationService` — botão de teste em Configurações
- **`notifyTaskCreated()`** — notificação local imediata ao criar tarefa (opt-in)
- **Alerta de tarefas expiradas** em `checkAndNotify` (1x por dia, agrupado)
- **Migration `006_notification_settings_notify_on_create`** — coluna `notify_on_create boolean NOT NULL DEFAULT false`
- **Aba Configurações > Notificações reorganizada** em 3 caixas: Status push, "Quando avisar" (com descrição em cada toggle), Sons no app

#### Onboarding pré-login
- **Página `Welcome.tsx`** com 5 slides (Tarefas, Disciplinas, Agenda, Notificações, Visão Geral)
- Cada slide com bolha colorida do emoji + ícone + título + texto curto
- Navegação por botões "Voltar/Próximo" + dots clicáveis + botão "Pular"
- Persistência via `localStorage` (`tarefas_welcome_seen_v1`) — só aparece uma vez
- Animação `scaleIn` no container + `fadeSlideIn` por slide

### Adicionado (Etapa 13 / Sessão 023 — 2026-05-28) — FASES 4 e 5: Dashboard + Configurações Acadêmicas

#### FASE 4 — Dashboard "Visão Geral"
- **Migration `005_profiles_add_school_year`** — coluna `school_year text NULL` em `profiles`
- **Nova página Visão Geral** como landing padrão do app
- **Saudação dinâmica** (Bom dia / Boa tarde / Boa noite) + nome do usuário
- **Ring de progresso SVG animado** (110px, transição 0.6s) com percentual da semana
- **Card Desempenho** com taxa de conclusão (barra gradient âmbar) + 3 mini-stats
- **Seção Próximos Prazos** (top 5 pendentes ordenadas por data)
- **Seção Tarefas Expiradas** (top 5 vencidas com visual vermelho)
- **Seção Disciplinas** (top 6 por pendências, grid 2/3/6 cols, clique filtra tarefas)
- **Sidebar**: novo item "Visão Geral" com ícone Home

#### FASE 5 — Configurações Acadêmicas
- **Aba "Acadêmico"** nas Configurações
- **Ano escolar**: 13 cards selecionáveis (6º Ano → Pós-graduação + Outro)
- **Idioma**: 3 opções com bandeira (pt-BR padrão, en, es)
- **Onboarding** agora salva `school_year` na coluna dedicada (em vez de bio)
- Sem campo "escola" (confirmado que nunca existiu)

### Corrigido (Etapa 12 / Sessão 022 — 2026-05-28) — Agenda semanal: criar tarefa em dia ocupado
- **BUG-020 resolvido** — na visão semanal, dias com tarefas não permitiam criar nova tarefa direto pela Agenda (long-press estava só no header e o botão "+" sumia)
- Long-press agora cobre a coluna inteira (`DiaColuna` recebe `useLongPress` no wrapper)
- Novo botão "+ Nova" tracejado aparece sempre ao final da coluna quando há tarefas
- `stopPropagation()` em mini-cards e botões internos evita disparos acidentais de long-press

### Adicionado (Etapa 12 / Sessão 021 — 2026-05-28) — Agenda: visão mensal de volta
- **Toggle Semana/Mês** no topo da Agenda (pill âmbar no ativo)
- **Visão mensal modernizada** integrada ao novo padrão visual: dots coloridos com cor da disciplina, opacidade para concluídas, vermelho para expiradas, contador "+N" para sobras, emoji da 1ª disciplina como mini-identidade do dia, pulso vermelho na borda quando houver expiradas
- **Painel lateral mensal** com mini-cards do dia selecionado e botão de criação rápida
- **Long-press na célula do mês** também abre criação rápida (mesmo hook `useLongPress` da visão semanal)
- Navegação contextual (prev/next ajusta semana ou mês), "Hoje" volta para a unidade atual da visão ativa

### Adicionado (Etapa 12 / Sessão 020 — 2026-05-28) — FASE 3: Calendário Semanal Moderno
- **Agenda redesenhada** como calendário semanal: 7 colunas (Dom→Sáb), navegação prev/next + botão "Hoje"
- **Mini-cards de tarefa por dia** com emoji da disciplina, cor de fundo, dot de status, badge "!" para urgentes; estados visuais para concluída (opacity + line-through) e expirada (vermelho + line-through)
- **Long-press de 450ms** em qualquer dia abre criação rápida com `due_date` pré-preenchido (hook `useLongPress` com cancelamento por movimento e vibração tátil em mobile)
- **Tap rápido** em mini-card → editar tarefa; tap em coluna vazia → criar tarefa
- **Coluna "hoje" destacada** com borda âmbar e fundo de identidade
- **Performance**: agrupamento `useMemo` por YYYY-MM-DD, lookup O(1) por dia, animação leve na troca de semana
- **Responsivo** em mobile (min-h 260px) e desktop (min-h 420px); theme-aware

### Alterado (Sessão 020)
- `Agenda.tsx` — reescrita completa, removendo o calendário mensal anterior
- `TarefaForm.tsx` — nova prop `initialDueDate?: string` para criação rápida com data pré-preenchida

### Adicionado (Etapa 11 / Sessão 019 — 2026-05-28) — Onboarding pós-cadastro
- **Migration `004_profiles_add_onboarding_completed`** — coluna `onboarding_completed boolean NOT NULL DEFAULT false` em `profiles`
- **Página de Onboarding em 3 passos** mostrada uma única vez após o primeiro login:
  - Passo 1: nome + ano/série opcional
  - Passo 2: seleção visual de disciplinas (grade de cards com emoji + cor, multiselect com check)
  - Passo 3: revisão final com chips das disciplinas escolhidas
- **`OnboardingGate`** em `App.tsx` — detecta `onboarding_completed === false` e renderiza o fluxo no lugar da Home; "Pular" também marca a flag para não exibir novamente
- Ao concluir: cria todas as disciplinas selecionadas em paralelo + salva nome/ano + marca flag como `true`
- Stepper visual + animação `scaleIn` no card; theme-aware

### Adicionado (Etapa 10 / Sessão 018 — 2026-05-28) — FASE 2: Estrutura visual das Disciplinas
- **Migração `003_subjects_add_emoji`** — coluna `emoji text NULL` em `subjects`
- **Nova página "Disciplinas"** — catálogo visual com cards (grade responsiva 1/2/3/4 col), cada card com emoji grande, cor própria, contadores (pendentes/feitas/vencidas) e ações inline. Clique no card filtra tarefas pela disciplina.
- **Modal moderno de criação/edição de disciplina** — preview ao vivo + picker de emoji em grade (com input para emoji custom) + paleta de 15 cores em círculos + sugestão automática para nomes conhecidos
- **Contexto `DisciplinasProvider`** — fonte única de verdade para CRUD de disciplinas em todo o app
- **Emojis nas tarefas** — chip da disciplina no TarefaCard exibe emoji da disciplina cadastrada; Select do TarefaForm mostra emoji em cada opção
- **Sidebar** — novo item de navegação "Disciplinas" + seção "Por Disciplina" exibe emoji + cor configurados pelo usuário
- **Helpers** `MATERIAS_EMOJIS`, `PALETA_DISCIPLINAS`, `EMOJI_SUGERIDOS`, `getMateriaEmoji(nome, custom?)` em `lib/tarefasData.ts`
- **Sugestões rápidas** — bloco com botões para adicionar disciplinas padrão (Matemática, Física, etc.) em um clique, com emoji e cor pré-definidos
- **Animações** — `fadeSlideIn` nos cards (stagger), `scaleIn` no modal, hover-lift sutil

### Alterado (Sessão 018)
- "Matéria" → "Disciplina" em todos os labels de UI (Tarefas filtros, Sidebar, TarefaForm, Configurações). Schema do banco preservado (`subjects`, `subject_name`).
- Aba "Matérias" das Configurações removida (funcionalidade movida para página dedicada)
- `Materia.emoji: string | null` adicionado ao tipo
- `subjectService.create()` / `update()` agora aceitam objeto `{ name, color, emoji }`

### Corrigido (Etapa 10 / Sessão 017 — 2026-05-28) — FASE 1: Correções críticas
- **Bug crítico de timezone nas datas** — `new Date("YYYY-MM-DD")` era interpretado como UTC midnight, em UTC-3 (Brasília) caía 1 dia atrás. Novo helper `parseDueDateLocal()` parseia como data local no final do dia.
- **Cálculo de dias restantes incorreto** — antes mostrava "Faltam 7 dias" quando o correto era 8 (dia atual e dia final contam). Novo `diasAteVencimento()` retorna 0 = "Último dia", 1 = "Falta 1 dia", N = "Faltam N dias".
- **Tarefas com prazo passado podiam ser concluídas** — toggle agora bloqueado para tarefas expiradas (`toggleConcluida` ignora; botão visualmente desabilitado).
- **Expiradas misturadas no topo da lista** — nova ordenação por buckets: pendentes urgentes → pendentes normais → concluídas → expiradas.
- **Textos invisíveis em light mode** — bloco CSS `html:not(.dark)` em `index.css` remapeia `.text-slate-100..500`, `.text-white`, bordas e overlays `white/*` para tons escuros legíveis no tema claro. Cores de identidade (amber, materias) preservadas.

### Adicionado (Etapa 10 / Sessão 017 — 2026-05-28)
- `parseDueDateLocal(due)` — converte ISO date string em Date local no final do dia (23:59:59.999), evitando shift de timezone
- `startOfToday()` — Date local às 00:00 do dia atual
- `diasAteVencimento(due)` — dias até a entrega usando lógica que conta ambos os endpoints
- `isExpirada(tarefa)` — true só após 23:59:59 local do dia final; concluídas nunca expiram
- `getStatusEfetivo(tarefa)` — projeta "Passou do Prazo" na UI mesmo sem DB sincronizado
- `labelDiasRestantes(dias)` — texto humano ("Último dia", "Falta 1 dia", "Faltam N dias", "N dias atrás")
- Card de tarefa expirada — fundo vermelho suave, ícone `XCircle`, badge "✕ Prazo encerrado", título riscado, edição preservada
- Auto-bump de status no Supabase em background ao detectar tarefas expiradas

### Adicionado (Etapa 9 / Sessão 016 — 2026-05-22)
- **Web Push Notifications** — sistema completo de notificações push para mobile e desktop
- `client/public/sw.js` — Service Worker que recebe eventos `push` em background e exibe notificações nativas; reabre o app ao clicar
- `client/src/services/notificationService.ts` — serviço com `isSupported()`, `requestPermission()`, `subscribe()`, `unsubscribe()`, `checkAndNotify()`
- `supabase/functions/send-notifications/index.ts` — Edge Function Deno que consulta tarefas vencendo em 1/2/3 dias e envia Web Push com autenticação VAPID
- Tabela `push_subscriptions` no Supabase com RLS (endpoint, p256dh, auth por usuário)
- Secrets VAPID configurados na Edge Function (`VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`)
- Extensão `pg_cron` habilitada + cron job `send-daily-notifications` às 11h UTC (8h Brasília)
- UI em Configurações → Notificações: banner de status (verde/âmbar) + botões "Ativar"/"Desativar push"
- `NotificationChecker` em `App.tsx` — verifica tarefas ao abrir o app (1x por dia via localStorage)
- `VITE_VAPID_PUBLIC_KEY` adicionado ao Vercel e `.env.local`

### Corrigido (Sessão 015 — 2026-05-21)
- **Avatar upload** — removida dependência do Supabase Storage (bucket inexistente); imagem agora é comprimida via Canvas (256×256 JPEG) e salva como base64 em `profiles.avatar_url`
- **Perfil sem linha no banco** — `profileService.get()` usa `.maybeSingle()` (sem erro 406); todas as escritas usam `upsert` em vez de `update` (PATCH falhava quando linha não existia)
- **notification_settings 409** — `settingsService.upsertNotifications()` com `{ onConflict: "user_id" }`
- **Importação de planilha 400** — sanitização de status/prioridade (mapeamento PT/EN → enum do banco) e conversão de datas seriais do Excel para `YYYY-MM-DD`

### Adicionado (Etapa 7 / Sessão 13 — 2026-05-20)
- **Ícone oficial do app** configurado em todo o projeto PWA
- `favicon.ico` (16/32/48px) — aba do navegador (Chrome, Edge, Firefox)
- `favicon-16x16.png` e `favicon-32x32.png` — favicons high-DPI
- `apple-touch-icon.png` (180×180) — ícone na tela inicial do iOS/Safari
- `android-chrome-192x192.png` e `android-chrome-512x512.png` — ícone PWA Android
- `maskable-icon-512x512.png` — ícone adaptável para Android (safe zone completa)
- `manifest.webmanifest` criado com nome, short_name, theme_color `#0f1117`, display standalone
- `index.html` atualizado com tags `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<link rel="manifest">` e metas PWA

### Adicionado (Etapa 6 / Sessão 12 — 2026-05-20)
- **Tema claro/escuro** com CSS custom properties (`--bg-base`, `--bg-surface`, `--bg-card`, `--bg-card-hover`)
- Toggle de tema em Configurações → Aparência, com persistência via Supabase `profiles.theme`
- `ThemeLoader` sincroniza preferência salva no login (multi-dispositivo)
- Transição suave (250ms) entre temas
- Light Academic: `#f0f3f8` base, `#ffffff` cards
- Dark Academic (padrão): `#0f1117` base, `#1a1d27` cards — visual preservado
- Toaster adapta estilo dinamicamente ao tema ativo

### Adicionado (Etapa 5 / Sessão 11 — 2026-05-20)
- **Sons de transição** via Web Audio API (sem arquivos externos):
  - Chime ascendente ao concluir tarefa
  - Tom descendente ao desmarcar
  - Pop curto ao criar nova tarefa
  - Descida rápida ao remover tarefa
- Sons controlados pelo toggle "Habilitar sons" em Configurações → Notificações
- Preview sonoro ao salvar configurações com sons ativados

### Adicionado (Etapa 4 / Sessão 10 — 2026-05-20)
- **Avatar upload** em Configurações → Perfil, com fallback de iniciais e limite de 2 MB
- **Campo Bio** no perfil (até 200 caracteres, salvo no Supabase)
- **Carregamento real do perfil** do Supabase no mount (não mais de user_metadata)
- **AbaMaterias com persistência**: lista, adiciona e remove matérias via `subjectService`
- Matérias padrão disponíveis para adição rápida com 1 clique
- Matérias personalizadas via campo de texto livre

### Adicionado (Etapa 4 / Sessão 9 — 2026-05-20)
- **Perfil Inteligente** na página de Métricas com 5 insights automáticos: foco urgente, matéria mais produtiva, matéria mais atrasada, progresso médio e ritmo semanal
- Componente `InsightCard` reutilizável com variantes de cor
- KPI "Ritmo (7 dias)" mostrando tarefas concluídas na última semana
- Corrigido bug no cálculo de matérias com atraso (estava incorreto)

### Adicionado (Etapa 3 / Sessão 8 — 2026-05-20)
- Filtro de **Matéria** no painel de filtros com lista dinâmica das matérias cadastradas
- **Busca avançada multi-campo**: pesquisa agora inclui notas, setor, origem e descrição
- **Formulário mobile responsivo**: campos duplos agora empilham em telas pequenas (`sm:grid-cols-2`)
- Ordenação de tarefas urgentes no topo (confirmada como já implementada)

---

## [2.0.0] — 2026-05-20

### Adicionado
- **Autenticação real** com Supabase Auth (email + senha)
- **Cadastro** de novos usuários com criação automática de perfil via trigger
- **Redefinição de senha** com link por email (`ResetPassword.tsx`)
- **CRUD completo de tarefas** com persistência no PostgreSQL (Supabase)
- **Filtros de tarefas**: status, matéria, prioridade e busca por texto
- **Detecção de urgência**: tarefas com prazo ≤ 3 dias marcadas automaticamente
- **Métricas e gráficos** (Recharts): total, concluídas, em andamento, passaram do prazo
- **Perfil analítico**: taxa de conclusão, taxa de atraso, ponto de atenção
- **Calendário mensal** (Agenda) com visualização de tarefas por dia
- **Importação de planilhas** Excel (`.xlsx`) e CSV com parser dedicado
- **Exportação** de dados em JSON e Excel
- **Histórico de importações** com data, tamanho e quantidade importada
- **Página de Configurações** com 4 abas: Perfil, Tema, Notificações, Matérias
- **Design system Academic Dark**: fundo `#0f1117`, acento âmbar `#f59e0b`
- **Sidebar responsiva** com navegação entre páginas
- **Row Level Security (RLS)** em todas as tabelas — dados isolados por usuário
- **Sincronização entre dispositivos** (dados no Supabase, não no localStorage)
- **CI/CD automático**: push em `main` → deploy Vercel em ~30s
- **Toasts de feedback** em todas as ações (Sonner)
- **Acessibilidade**: aria-labels, focus styles, cursor-pointer em interativos
- **Documentação completa**: ARQUITETURA.md, BANCO_DE_DADOS.md, DEPLOY.md, ROADMAP.md, MEMORY.md
- **Base de conhecimento**: CHANGELOG.md, PROMPTS.md, BUGS.md, LINKS.md

### Modificado
- Migração completa de **localStorage** para **Supabase PostgreSQL**
- Substituição de autenticação mockada por **Supabase Auth real**
- Campos da tarefa renomeados para inglês: `tarefa→title`, `materia→subject_name`, `dataEntrega→due_date`, etc.
- ID das tarefas migrado de numérico para **UUID**
- `calcularDiasRestantes()` calculado em render time (não armazenado no banco)
- `vercel.json` adicionado com `installCommand: "npm install"` (evita falha do pnpm no CI)

### Removido
- **Todos os artefatos Manus AI**: `ManusDialog.tsx`, `Map.tsx`, `debug-collector.js`, `version.json`
- Dependências quebradas: `express`, `drizzle`, `mysql2`, `embla-carousel-react`, `cmdk`, `vaul`, `next-themes`
- Código morto: `server/db.ts`, `server/routers.ts`, `usePersistFn.ts`
- Dados hardcoded: `TAREFAS_INICIAIS` (lista de tarefas de demonstração)
- Arquivo de config Manus: `.project-config.json`, `template.json`
- Scripts Manus no `package.json`: plugin `vite-plugin-manus-runtime`
- Analytics Manus no `index.html`: script com `%VITE_ANALYTICS_ENDPOINT%`
- Componentes shadcn/ui sem dependência instalada: carousel, drawer, input-otp, menubar, navigation-menu, radio-group, resizable, slider, toggle, toggle-group, context-menu, hover-card, aspect-ratio, command

### Corrigido
- `tw-animate-css` → `@plugin "tailwindcss-animate"` (sintaxe Tailwind v4)
- `usePersistFn` deletado → reescrito com `useCallback` nativo
- `createClient<Database>` com generic incompatível → removido generic
- Variáveis de ambiente Vercel não persistidas → salvas via Vercel API
- `pnpm install` falhando no CI → forçado `npm install` no vercel.json
- `onAuthStateChange` callback type mismatch → `async` adicionado
- `TarefaForm`: `subject_id` ausente no estado → adicionado com `null`

### Segurança
- RLS ativo em todas as 5 tabelas do banco
- `.env.local` no `.gitignore` (nunca commitado)
- Chaves de ambiente injetadas somente em build time (não expostas em runtime)
- Trigger `SECURITY DEFINER` para criação automática de perfil

---

## [1.0.0] — 2026-05-18 (Manus AI — descontinuado)

### Nota
Versão original gerada pelo Manus AI. Continha autenticação mockada via localStorage,
dados hardcoded, dependências quebradas e artefatos de debugging do gerador.
Completamente substituída pela v2.0.0.

---

[Não lançado]: https://github.com/DGomesdpaulagit/tarefas-escolares/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/DGomesdpaulagit/tarefas-escolares/releases/tag/v2.0.0
[1.0.0]: https://github.com/DGomesdpaulagit/tarefas-escolares/releases/tag/v1.0.0
