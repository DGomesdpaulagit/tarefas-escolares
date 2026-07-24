# cloud.md — Registro de Etapas e Sessões do Projeto Tarefas Escolares

Arquivo de controle de continuidade entre conversas do Claude Code.
Lido automaticamente no início de cada nova conversa.

---

## Glossário

- **Etapa** = uma conversa completa no Claude (uma janela/thread)
- **Sessão** = um bloco de progresso dentro de uma Etapa

---

## ETAPA ATUAL: Etapa 17 - v3.0 (Mesada + Tutorial, agora em `main`) / i18n real
## SESSÃO ATUAL: [Sessão 029] - Merge para main + i18n completo + deploy validado + planejamento v5.0 ✅ CONCLUÍDA

## STATUS DO PROJETO: 🎉 v2.1.0 base estável + v3.0 (Mesada + Tutorial) MESCLADA em `main`, publicada em tarefas-escolares-five.vercel.app com `VITE_ENABLE_MESADA_MODULE=true` ativa em produção + i18n real com cobertura completa + planejamento da v5.0 registrado

---

## [Etapa 17 / Sessão 029n] - Planejamento v4.0: relatório mensal para o responsável + curadoria da lista v5
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída (planejamento — sem código)

### O que foi feito
Usuário revisou a lista de melhorias da v5 criada na sessão anterior e definiu o escopo real:

**Descartados da v5** (não implementar): assistente de estudos por IA, heatmap de conclusão estilo GitHub, metas por período.

**Novo recurso, promovido a v4.0** (vem ANTES do registro por imagem): relatório mensal de acompanhamento enviado ao responsável. Usuário cadastra o e-mail do responsável no primeiro acesso; todo dia 25 um relatório do mês é enviado automaticamente (total de tarefas, concluídas, expiradas, pendentes, total geral); editar/excluir esse e-mail em Configurações exige autorização confirmada por e-mail enviado ao próprio responsável.

Criada a especificação técnica completa em **`docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md`**: modelo de dados (`guardians`, `guardian_tokens`, `guardian_reports_log` + RLS nas três), fluxo de autorização por token de uso único com expiração, duas Edge Functions novas (`enviar-relatorio-responsavel` agendada via pg_cron `0 8 25 * *`, e `guardian-action` para os links de token), conteúdo e tom do relatório, e checklist passo a passo.

**Ponto levantado na especificação (decisão do usuário na próxima conversa):** o pedido original só previa verificação por e-mail para *editar/excluir*, não para *cadastrar*. Isso deixa dois furos — um e-mail digitado errado manda dados escolares para um estranho todo mês, e não tem como corrigir depois (a correção exige autorização enviada justamente para o endereço errado). Proposta registrada na seção 2 do documento: aplicar double opt-in também no cadastro inicial, com expiração em 7 dias.

`docs/ROADMAP.md` reorganizado: v4.0 no topo como "próxima a ser implementada", v5.0 logo abaixo, itens descartados registrados explicitamente para não voltarem por engano.

### Próximo passo
Próxima conversa = **início da v4.0**. Primeiras decisões: provedor de e-mail (Resend recomendado, usuário gera e configura a API key como secret no Supabase — nunca colada em chat) e se adota o double opt-in no cadastro inicial. Depois, seguir o checklist da seção 9 do documento de especificação.

---

## [Etapa 17 / Sessão 029m] - Planejamento v5.0: registro de tarefas por imagem (IA) + lista de melhorias
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída (planejamento — sem código)

### O que foi feito
Ao encerrar a sessão, usuário pediu duas coisas: (1) um recurso novo — registrar tarefas a partir de foto/print analisada por IA, recomendando o usuário detalhar mais quando a tarefa extraída vier incompleta; (2) uma lista de melhorias para a v5.0. Dado o tamanho do recurso de imagem (precisa de Storage bucket novo, Edge Function nova, decisão de provedor de IA de visão e API key que só o usuário pode configurar), a implementação ficou para a próxima conversa — feito o planejamento completo:

- **`docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md`** (novo, mesmo padrão do `V3_ESPECIFICACAO_MODULO_MESADA.md`) — arquitetura completa (upload → Storage → Edge Function → API de visão → tela de revisão reaproveitando o padrão do `ImportarPlanilhaModal.tsx`), decisão pendente de provedor (Claude/GPT-4/Gemini), regras exatas de quando uma tarefa extraída é considerada "incompleta" e precisa de recomendação de detalhamento, e checklist de implementação passo a passo
- **`docs/ROADMAP.md`** — nova seção "v5.0 — Planejado" no topo do arquivo, com o recurso de imagem como destaque + 8 outras melhorias candidatas (assistente de estudos por IA, resumo semanal automático, PWA offline completo, exportar Agenda para `.ics`, heatmap de conclusão, metas por período, compartilhamento de tarefa avulsa via link). Também atualizados dois itens antigos da seção "v3.0 — Visão de Longo Prazo" que já estavam desatualizados: OCR marcado como superado pela nova especificação, multi-idioma marcado como entregue

### Próximo passo
Próxima conversa: decidir o provedor de IA de visão com o usuário (isso precisa de uma API key que ele mesmo vai configurar como secret no Supabase, nunca colada em chat) e seguir o checklist do documento de especificação.

---

## [Etapa 17 / Sessão 029l] - Deploy de produção: ativação da Mesada + correção de i18n na Visão Geral
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída

### O que foi feito
Usuário pediu para publicar o deploy. Durante a verificação, dois problemas foram encontrados e corrigidos:

1. **Aba Mesada não aparecia em produção** — a feature flag `VITE_ENABLE_MESADA_MODULE` só existia no `.env.local` (gitignored), nunca tinha sido configurada nas Environment Variables do projeto no Vercel (herança de quando a ideia era ter 2 projetos separados). Usuário adicionou a variável manualmente no painel do Vercel (Settings → Environments → Production → Environment Variables) seguindo passo a passo guiado; disparado um commit vazio + push para forçar rebuild com a variável nova. Verificado via bundle publicado (grep pela string "Mesada por Desempenho" no JS de produção) que o módulo está ativo.

2. **Strings residuais em português na Visão Geral** — usuário testou o app publicado com idioma trocado para inglês e reportou vários textos ainda em português no dashboard (Overview): labels de progresso/desempenho, empty states, contador de dias restantes/atrasados. Causa: `VisaoGeral.tsx` foi marcada como "traduzida" na fase 2 do i18n, mas só os headers principais tinham sido cobertos; `labelDiasRestantes()` era uma função utilitária pura sem acesso ao idioma. Corrigidas ~20 strings, `labelDiasRestantes()` refatorada para receber `t()` como parâmetro (atualizados 3 pontos de uso: VisaoGeral, TarefaCard, Agenda).

### Resultado
Deploy de produção (`tarefas-escolares-five.vercel.app`) verificado e funcionando: módulo da Mesada visível, i18n completo (incluindo Visão Geral) confirmado via inspeção do bundle publicado.

### Build
✅ `npm run build` — 0 erros TS (2 rodadas, uma por correção)

### Próximo passo
Nenhum definido.

---

## [Etapa 17 / Sessão 029i–k] - i18n real: fase 4 (varredura final — Configurações completa, componentes residuais e tutorial guiado)
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída

### O que foi feito
Continuação da Sessão 029f–h. Uma varredura final por strings em português ainda hardcoded revelou uma lacuna maior do que o esperado:
- **Configuracoes.tsx traduzida por completo** — as abas Perfil, Aparência e Notificações (que tinham ficado pra trás na fase 1, só o seletor de idioma havia sido traduzido) agora usam `t()` em tudo: labels, placeholders, toasts (~70 novas chaves `config.*`)
- **TarefaCard.tsx, HistoricoArquivos.tsx, ResetPassword.tsx** traduzidos
- **Sistema de tutorial guiado traduzido por completo** — nunca havia sido tocado nas fases anteriores porque foi construído *antes* do sistema de i18n existir: `OfertaTourModal.tsx` (tela pós-onboarding), `TourContext.tsx` (os 19 passos — `TourStep` migrado de `title`/`description` literais em português para `tituloChave`/`descricaoChave: DicionarioChave`, seguindo o mesmo padrão já usado em `Welcome.tsx`), `TourOverlay.tsx` (botões "Pular tutorial"/"Anterior"/"Próximo"/"Concluir", contador "Passo X de Y")
- Achado durante a varredura: um Grep por padrão de acentuação `[à-úÀ-Ú]{4,}` deu falso-negativo (não bateu com "ã", "ç" etc. apesar de estarem no range Unicode declarado) — verificação cruzada com `grep` literal por palavras comuns ("não") encontrou os arquivos do tutorial que tinham escapado

### Resultado
Cobertura de i18n real agora **verdadeiramente completa**: todas as páginas, todos os modais, todos os componentes residuais e o tutorial guiado respondem à troca de idioma (pt-BR/en/es). Segue intencionalmente em português apenas o que é dado armazenado no Supabase (status/prioridade/setor/origem) ou catálogo padrão de disciplinas — não é texto de interface.

### Build
✅ `npm run build` — 0 erros TS

### Próximo passo
Nenhum definido — usuário não indicou mais itens de escopo além da cobertura completa de i18n pedida em "Ent resolva".

---

## [Etapa 17 / Sessão 029f–h] - i18n real: fase 3 (todos os modais — conclui o i18n)
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída

### O que foi feito
Continuação direta da Sessão 029b–e. Traduzidos os 6 modais do app, um a um, com build validado (0 erros TS) e commit a cada um:
- **TarefaForm** — modal de criar/editar tarefa (o mais usado do app): título, todos os labels de campo, botões de ação (marcar concluída/pendente, excluir com dupla confirmação), toasts
- **DisciplinaModal** — criar/editar disciplina (preview, nome, sugestão de visual, emoji, cor)
- **MesadaMateriaModal** — matéria do boletim da Mesada (vínculo com Disciplina existente, categorias traduzidas mantendo os valores de dados intactos)
- **MesadaImportarDisciplinasModal** — importação em lote de Disciplinas pra Mesada
- **ImportarPlanilhaModal** — fluxo de importação (drag-and-drop, preview, sucesso, erro)
- **LimparTarefasModal** — confirmação de ação destrutiva

### Resultado
Cobertura de i18n real considerada **completa**: toda a interface visível (páginas + modais) responde à troca de idioma pt-BR/en/es. Restam apenas alguns toasts pontuais dentro de `contexts/`/`services/` não mapeados nesta varredura (não bloqueiam o uso — são mensagens de erro genéricas de fallback).

### Build
✅ `npm run build` — 0 erros TS após cada modal (3 commits incrementais)

### Próximo passo
Nenhum obrigatório. Se quiser 100% de cobertura, falta revisar toasts residuais em `contexts/`/`services/`. Depende de nova instrução do usuário.

---

## [Etapa 17 / Sessão 029b–e] - i18n real: fase 2 (Tarefas, Disciplinas, Agenda, Métricas, Arquivos, Mesada, Welcome, Onboarding)
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída

### O que foi feito
Continuação direta da Sessão 029a. Traduzidas as 8 páginas que faltavam, uma a uma, com build validado (0 erros TS) e commit a cada página:
- **Tarefas** — busca, filtros (Status/Prioridade/Disciplina/Ordenação), empty states, contagem
- **Disciplinas** — cabeçalho, cards (Pendentes/Feitas/Vencidas), sugestões rápidas, toasts
- **Agenda** — visão semanal/mensal, navegação, dicas de uso. Nomes de dias/meses passaram a vir de um novo `CALENDARIO[idioma]` no sistema de i18n (antes eram arrays fixos em português usados também pela Mesada)
- **Métricas** — KPIs, Perfil Inteligente, insights, gráficos (labels de status traduzidos via mapa `STATUS_LABEL_KEY`)
- **Arquivos** — exportação, histórico; formatação de data agora usa o locale do idioma escolhido (`pt-BR`/`en-US`/`es-ES`) em vez de fixo
- **Mesada** — as 3 abas completas (Lançamentos, Acompanhamento, Configurações), reaproveitando o `CALENDARIO`
- **Welcome** — os 5 slides pré-login
- **Onboarding** — os 3 passos pós-cadastro

### Pendências conhecidas (não bloqueiam, próxima sessão)
Modais ainda hardcoded em português: `TarefaForm`, `DisciplinaModal`, `MesadaMateriaModal`, `MesadaImportarDisciplinasModal`, `ImportarPlanilhaModal`, `LimparTarefasModal`. Também sobram toasts/mensagens dentro de `contexts/` e `services/` que não passam pelo dicionário ainda.

**Intencionalmente não traduzido** (são dados, não interface): valores de status/prioridade/setor/origem armazenados no Supabase, nomes de matérias do catálogo padrão (`MATERIAS_PADRAO`) usados para criar disciplinas reais no banco.

### Build
✅ `npm run build` — 0 erros TS após cada página (9 commits incrementais nesta etapa)

### Próximo passo
Traduzir os modais listados acima e revisar toasts/mensagens em `contexts/`/`services/`, se o usuário quiser continuar o i18n até 100% de cobertura. Nenhum próximo passo obrigatório definido — depende de nova instrução do usuário.

---

## [Etapa 17 / Sessão 029a] - Merge de v3-mesada-pessoal em main + i18n real (fase 1)
**Data:** 2026-07-23
**Branch:** `main`
**Status:** ✅ Concluída

### Decisão do usuário: mesclar tudo em `main`
Depois de eu sugerir criar um segundo projeto Vercel (conforme o planejamento original), o usuário explicou que não queria um projeto a mais (consumiria cota de outros projetos da conta) e queria o **mesmo link** `tarefas-escolares-five.vercel.app` mostrando a versão nova. Esclareci que isso reverteria a regra de nunca publicar a Mesada — o usuário confirmou que:
- Não pretende publicar o app publicamente por enquanto (só considera Play Store/publicação de verdade bem mais pra frente)
- O único destinatário do link por ora é o pai dele, que banca a mesada e tem total ciência/acesso autorizado aos próprios dados financeiros do filho
- Sabe que pode reverter isso (tag `v2.1.0-publico` continua existindo) quando for de fato publicar

**Ação:** merge de `v3-mesada-pessoal` em `main`, push, e verificação de que o deploy do Vercel (projeto único `tarefas-escolares`) está servindo a versão com Mesada, com a env var `VITE_ENABLE_MESADA_MODULE=true` configurada no projeto.

### i18n real — fase 1
O seletor de idioma em Configurações existia desde a Fase 5 (Sessão 023) mas só salvava a preferência sem nenhum efeito real na interface. Nesta sessão:
- Criados dicionários tipados `client/src/lib/i18n/{pt-BR,en,es}.ts` + `index.ts` (mapa de idiomas, validação)
- `LanguageContext.tsx` (padrão igual `ThemeContext`): estado `idioma` + função `t(chave)`, persiste em `localStorage`, sincroniza com `profiles.language` ao logar via `LanguageLoader`
- Traduzidos nesta fase: Sidebar completa, topbar (título + data no locale certo), UserMenu, Login (todas as strings), Configurações (abas + seção de idioma), Visão Geral (headers principais)
- Seletor de idioma agora **funciona de verdade** — trocar pt-BR/en/es muda a interface na hora

### Outras correções desta sessão
- Mesada: clicar de novo no conceito já selecionado remove o lançamento (corrige erro de digitação sem precisar mexer no banco)
- Tutorial: corrigido bug do Esc não fechar a sidebar mobile aberta pelo tour (causava overlay preto grudado na tela — reportado pelo usuário com print)

### Pendente (continuar na sequência)
Faltam traduzir: `Tarefas.tsx`, `Disciplinas.tsx`, `Agenda.tsx`, `Metricas.tsx`, `Arquivos.tsx`, `Mesada.tsx`, `Onboarding.tsx`, `Welcome.tsx`, e os toasts/mensagens dinâmicas espalhadas pelos contexts/services que ainda estão hardcoded em português.

### Build
✅ `npm run build` — 0 erros TS a cada etapa

### Próximo passo
Continuar a tradução real (i18n) pelas páginas que faltam, na ordem: Tarefas → Disciplinas → Agenda → Métricas → Arquivos → Mesada → Onboarding → Welcome.

---

## [Etapa 17 / Sessão 028] - Módulo de Mesada por Desempenho (completo) + Tutorial guiado do app
**Data:** 2026-07-22
**Branch:** `v3-mesada-pessoal`
**Status:** ✅ Concluída — usuário sem novas ideias/passos no momento

### Contexto
Continuação da Sessão 027 (planejamento). Conversa única que evoluiu em 6 blocos de trabalho (028a–028f), todos na mesma Etapa/branch. As duas ambiguidades da especificação (`docs/V3_ESPECIFICACAO_MODULO_MESADA.md`, seções 2.1 e 5.5) foram esclarecidas com o usuário logo no início:
1. **Eixo de cálculo:** **Eixo A** — tabela única de conceitos (MB=R$22/B=R$5/R=R$2/I=-R$5) igual para todas as matérias. Eixo B (valor base por matéria) não foi implementado.
2. **Limite de MB:** **trava o cálculo** — a partir do 6º lançamento MB no período (limite padrão 5), o valor extra é recalculado como B.

### O que foi feito (resumo consolidado dos 6 blocos)

**1 — Módulo base (migration, service, context, UI):**
- Migration `007_mesada_module` (tabelas `mesada_config`, `mesada_materias`, `mesada_notas`, todas com RLS `auth.uid() = user_id`) aplicada via Supabase MCP e salva em `supabase/migrations/`
- `mesadaService.ts`, `MesadaContext.tsx` (cálculo + travamento do limite de MB), `lib/featureFlags.ts` (`VITE_ENABLE_MESADA_MODULE`), página `Mesada.tsx` com 3 abas, `MesadaMateriaModal.tsx`

**2 — Importar Disciplinas existentes em lote:** `MesadaImportarDisciplinasModal.tsx` — seleção múltipla de Disciplinas já cadastradas no app, herdando emoji/cor, sem digitar uma por uma.

**3 — Grade do boletim + Distribuição por matéria:** tabela "Grade do boletim" (réplica da planilha original, matéria × mês) e gráfico de barras empilhadas "Desempenho por matéria" com cards de insight (matéria destaque / matéria de atenção), ambos na aba Acompanhamento.

**4 — Termômetro, lembrete mensal, virada de ano, data ao vivo:**
- Termômetro 🟢🟡🔴 por matéria em Lançamentos (média histórica dos conceitos)
- `notificationService.checkMesadaReminder()` + `MesadaNotificationChecker.tsx` — lembrete nos últimos 5 dias do mês se faltar lançamento
- Virada de ano: config herda valores do ano anterior via `mesadaService.getConfigMaisRecente()` (matérias já eram compartilhadas entre anos; notas resetam sozinhas por serem escopadas por ano/mês)
- Data de hoje ao vivo no topo do app (`Home.tsx`), atualiza sozinha

**5 — Tutorial guiado do app (spotlight):** `TourContext.tsx` (19 passos cobrindo todas as páginas/abas) + `TourOverlay.tsx` (escurece a tela, recorta o elemento explicado, navega entre páginas automaticamente) + atributos `data-tour` em Sidebar, VisaoGeral, Tarefas, Disciplinas, Agenda, Metricas, Mesada, Configuracoes, UserMenu. Botão "Ver tutorial do app" em Configurações.

**6 — Ajustes finos do tutorial:** animação mais lenta (0.6s no destaque, entrada `fadeSlideIn` a cada passo); bug corrigido onde o card de navegação podia renderizar fora da janela em passos com alvo perto do rodapé (posição agora sempre clampada aos limites da tela); oferta automática do tour a usuários novos ao concluir/pular o onboarding (`OfertaTourModal.tsx`).

### Arquivos criados
`supabase/migrations/007_mesada_module.sql`, `client/src/services/mesadaService.ts`, `client/src/contexts/MesadaContext.tsx`, `client/src/lib/featureFlags.ts`, `client/src/pages/Mesada.tsx`, `client/src/components/MesadaMateriaModal.tsx`, `client/src/components/MesadaImportarDisciplinasModal.tsx`, `client/src/components/MesadaNotificationChecker.tsx`, `client/src/contexts/TourContext.tsx`, `client/src/components/TourOverlay.tsx`, `client/src/components/OfertaTourModal.tsx`

### Arquivos modificados
`types/index.ts`, `App.tsx`, `Sidebar.tsx`, `Home.tsx`, `Configuracoes.tsx`, `UserMenu.tsx`, `VisaoGeral.tsx`, `Tarefas.tsx`, `Disciplinas.tsx`, `Agenda.tsx`, `Metricas.tsx`, `notificationService.ts`, `.env.local`

### Build
✅ `npm run build` — 0 erros TS em todos os 6 blocos (última verificação: build limpo, ~20s)

### Validação do cálculo
Conferido manualmente contra o exemplo do documento original: 5 matérias MB (5×22=110) + 6 matérias B (6×5=30) + 1 matéria R (1×2=2) − 1 matéria I (1×5=−5) = **R$137,00**, batendo com o "total potencial" citado na planilha manual do usuário.

### Pendências conhecidas (não bloqueiam, ação do próprio usuário)
- Segundo projeto Vercel apontando para `v3-mesada-pessoal` com `VITE_ENABLE_MESADA_MODULE=true` (seção 7.1 da especificação) — só necessário quando o usuário quiser um link público pessoal; até lá, uso é via servidor local
- Ideias adicionais da seção 10 da especificação (histórico por ano, exportação, cruzamento com Disciplinas) e da seção 23 do `DOCUMENTACAO_PROJETO.md` — não solicitadas, ficam em aberto para quando o usuário quiser
- Achado de segurança fora do escopo do código: token do GitHub exposto em texto plano na URL do remote `origin` — reportado ao usuário, ação pendente dele (revogar/reconfigurar)
- `git push` para o GitHub não foi possível neste ambiente (exige autenticação interativa) — commits estão salvos localmente na branch `v3-mesada-pessoal`; usuário deve rodar `git push origin v3-mesada-pessoal` manualmente

### Próximo passo
**Nenhum definido.** Usuário confirmou não ter mais ideias/próximos passos por enquanto. Aguardar novas instruções em conversa futura — o `CLAUDE.md` já está atualizado para retomar o contexto correto quando isso acontecer.

---

## [Etapa 17 / Sessão 027] - Planejamento da v3.0: Módulo de Mesada por Desempenho
**Data:** 2026-05-30
**Status:** ✅ Concluída (apenas planejamento — implementação fica para a PRÓXIMA conversa)

### Contexto
Usuário trouxe um documento (`Métodologia de mesada.docx`) descrevendo um sistema manual de mesada por desempenho escolar (conceitos MB/B/R/I com valores em R$, 13 matérias, acompanhamento mensal). Pediu para transformar isso em um módulo dentro do Tarefas Escolares, mas **apenas para uso pessoal** — se o app for publicado um dia, deve ser publicado sem esse módulo.

### O que foi feito
- **Tag `v2.1.0-publico`** criada no commit `80adcd8` (marco de retorno seguro da versão pública, sem Mesada) e pushada para o GitHub
- **Branch `v3-mesada-pessoal`** criada a partir de `main` e pushada para o GitHub — é onde a v3.0 será desenvolvida
- **Documento de especificação completo** criado em `docs/V3_ESPECIFICACAO_MODULO_MESADA.md`, contendo:
  - Regra fundamental de separação (branch + feature flag `VITE_ENABLE_MESADA_MODULE` como dupla proteção)
  - Transcrição da metodologia original do usuário
  - Ambiguidade identificada no cálculo (Eixo A: conceito com valor fixo para todas as matérias vs Eixo B: cada matéria com valor base próprio) — sinalizada para esclarecer no início da próxima conversa
  - Modelo de dados proposto (`mesada_config`, `mesada_materias`, `mesada_notas`) com RLS, como entidades independentes de `subjects` (Disciplinas de tarefas)
  - Fórmulas de cálculo (valor mensal, acumulado, progresso de meta, alerta de limite de MB)
  - Especificação de UI (3 abas: Lançamentos, Acompanhamento, Configurações da Mesada) reaproveitando componentes visuais já existentes (RingProgress, paleta de cores, emoji picker)
  - Estratégia de deploy: dois projetos Vercel (um público rastreando `main`, outro pessoal rastreando `v3-mesada-pessoal` com a env var ativada)
  - Ordem de implementação sugerida (10 passos)
  - Ideias adicionais em aberto (histórico por ano, exportação, notificação de lançamento mensal, cruzamento com Disciplinas)
  - Checklist de início da próxima conversa

### Arquivos criados
- `docs/V3_ESPECIFICACAO_MODULO_MESADA.md`

### Nenhum código de produção foi alterado nesta sessão
Por pedido explícito do usuário, esta sessão foi só de **planejamento e documentação**. A implementação real do módulo de Mesada começa em uma **nova conversa**, na branch `v3-mesada-pessoal`.

### Próximo passo
Abrir nova conversa. Primeira ação: ler `docs/V3_ESPECIFICACAO_MODULO_MESADA.md` por completo, confirmar a branch ativa, esclarecer as ambiguidades da seção 2.1 e 5.5 com o usuário, e só então iniciar a implementação seguindo a ordem sugerida na seção 8 do documento.

---

## [Etapa 16 / Sessão 026] - HOTFIX BUG-021: erro 400 ao salvar tarefa sem data
**Data:** 2026-05-29
**Status:** ✅ Concluída

### Bug reportado
Usuário reportou com print: ao tentar salvar uma "Nova Tarefa" deixando o campo "Data de Entrega" em branco (placeholder `dd/mm/aaaa`), aparecia toast vermelho "Erro ao salvar tarefa" e o DevTools mostrava:
```
POST .../rest/v1/tasks?select=* → 400 (Bad Request)
```

### Causa raiz
`TarefaForm.handleSubmit` enviava o estado do form direto pro `taskService`, incluindo `due_date: ""` (string vazia, valor inicial do `useState`). A coluna `tasks.due_date` é do tipo `date` no Postgres, que rejeita strings vazias como entrada inválida — daí o 400.

Outros campos texto opcionais (`notes`, `link`, `sector`, `origin`, `description`) aceitam string vazia, mas pra ficar semanticamente correto e evitar dados sujos no banco, também foram normalizados.

### Correção
- Em `client/src/components/TarefaForm.tsx`, antes de enviar, todos os campos opcionais com `""` são convertidos para `null` via helper `toNull()`.
- `title` também ganha `.trim()` para evitar espaços em branco salvos.

### Arquivos modificados
- `client/src/components/TarefaForm.tsx`

### Build
- ✅ `npm run build` — 0 erros TS, 14s

---

## [Etapa 15 / Sessão 025] - FECHAMENTO: editar/excluir/concluir no TarefaForm
**Data:** 2026-05-28
**Status:** ✅ Concluída — **PROJETO FINALIZADO**

### O que foi feito
- **TarefaForm** agora tem ações completas no rodapé, em modo edição:
  - **Botão "Marcar como concluída"** (verde) / **"Marcar como pendente"** (âmbar) acima dos botões finais — destacado em largura total. Não aparece se a tarefa estiver expirada (respeita BUG-017).
  - **Botão "Excluir"** (vermelho, ícone Trash2) à esquerda do "Cancelar" com padrão de **dupla confirmação**: clique 1 → texto vira "Confirmar?" + cor sólida; clique 2 dentro de 3s → exclui e fecha o modal.
  - Som `playRemovida` ao excluir; som `playConcluida`/`playDesmarcada` ao alternar conclusão; toasts informativos em cada ação.
  - Todos os botões inferiores ficam desabilitados durante qualquer operação em andamento (evita race conditions).
- **Resultado:** clicar em qualquer mini-card da Agenda (semanal ou mensal), card da página Tarefas, item da Visão Geral ou listagem da Disciplinas abre o modal com **todas** as ações disponíveis — editar campos, marcar concluída/pendente, excluir.

### Por que isso fecha o projeto
A solicitação final foi "Agenda melhorada (visão semanal, clique para editar/excluir tarefas)". Como o `TarefaForm` é o componente único de edição usado por toda a aplicação, melhorar ele significa que toda a navegação por tarefas (Agenda, Tarefas, VisaoGeral, Disciplinas) ganha as mesmas ações. Não houve necessidade de duplicar lógica em cada local.

### Arquivos modificados
- `client/src/components/TarefaForm.tsx` — ações de excluir + concluir/desmarcar com confirmação visual

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 17s

### Estado final do projeto
**Todas as fases entregues:**
- ✅ FASE 0 — Setup base + Supabase + Auth
- ✅ FASE 1 — Correções críticas (datas, status, expiração, light/dark)
- ✅ FASE 2 — Catálogo visual de Disciplinas (emoji, cor, modal)
- ✅ FASE 3 — Calendário semanal + mensal moderno
- ✅ FASE 4 — Dashboard "Visão Geral"
- ✅ FASE 5 — Configurações Acadêmicas (ano + idioma)
- ✅ FASE 6 — Notificações reorganizadas + Welcome pré-login
- ✅ Onboarding pós-cadastro
- ✅ Fechamento: editar/excluir/concluir em qualquer lugar

---

## [Etapa 14 / Sessão 024] - FASE 6: Notificações + Onboarding pré-login
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito

**A — Notificações:**
- **Service Worker v2** (`sw.js`):
  - Suporte a campo `data.url` (clique foca/abre tab no URL específico)
  - Listener `message` para notificações locais via `postMessage` (`SHOW_NOTIFICATION`)
  - Vibração `[120, 60, 120]` padrão
  - `requireInteraction` opcional no payload
  - `client.navigate()` quando o app já está aberto
- **`notificationService` ampliado**:
  - `sendTest()` — envia notificação de teste local via SW (com fallback à API nativa)
  - `notifyTaskCreated(task, enabled)` — notificação imediata ao criar tarefa (opcional)
  - `checkAndNotify` agora também alerta sobre **tarefas já expiradas** (1x por dia, agrupado: "X tarefas com prazo encerrado")
- **Migration `006_notification_settings_notify_on_create`** — coluna `notify_on_create boolean NOT NULL DEFAULT false`
- **`NotificationSettings.notify_on_create`** no tipo
- **`TarefasContext.adicionarTarefa`** dispara `notifyTaskCreated` em background (não bloqueia UI) se o usuário ativou a opção
- **Configurações > Notificações reorganizadas** em 3 caixas modernas:
  1. Status push (banner verde/âmbar com ícone grande 🔔/🔕 + botão Ativar/Desativar + botão "Enviar notificação de teste")
  2. "Quando avisar" (4 toggles: 3 dias, 2 dias, 1 dia/hoje, ao criar) com descrição em cada linha
  3. "Sons no app" (toggle único isolado)

**B — Welcome pré-login:**
- **Página `Welcome.tsx`** mostrada antes do `Login` na primeira visita (anônima)
  - 5 slides curtos com emoji grande + ícone + título + texto
  - Slides: Tarefas → Disciplinas → Agenda → Notificações → Visão Geral
  - Cada slide com cor própria (âmbar, lilás, verde, vermelho, azul) na bolha do emoji
  - Botões "Voltar" (a partir do 2º slide) + "Próximo" / "Começar agora"
  - Dots indicadores clicáveis no rodapé
  - Botão "Pular" no canto superior direito
  - Persistência via `localStorage` (`tarefas_welcome_seen_v1`) — só aparece uma vez
  - Animação `scaleIn` no container + `fadeSlideIn` em cada slide (key=indice)
- **`App.tsx`** — novo wrapper `PublicRoutes` checa `welcomeJaVisto()` antes de renderizar o Switch público

### Arquivos criados
- `client/src/pages/Welcome.tsx`
- Migration Supabase: `006_notification_settings_notify_on_create`

### Arquivos modificados
- `client/public/sw.js` — v2 com URL handling e SHOW_NOTIFICATION
- `client/src/services/notificationService.ts` — sendTest, notifyTaskCreated, alerta de expiradas
- `client/src/contexts/TarefasContext.tsx` — notificação ao criar
- `client/src/types/index.ts` — `notify_on_create`
- `client/src/pages/Configuracoes.tsx` — aba reorganizada em 3 caixas
- `client/src/App.tsx` — wrapper `PublicRoutes` com gate de welcome

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 19s

### Próximo passo
Testes manuais reais em mobile (iOS Safari precisa do app instalado como PWA pra push funcionar) + implementação efetiva de i18n.

---

## [Etapa 13 / Sessão 023] - FASES 4 e 5: Dashboard "Visão Geral" + Configurações Acadêmicas
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
**FASE 4 — Dashboard "Visão Geral":**
- **Migration `005_profiles_add_school_year`** — coluna `school_year text NULL` em `profiles`
- **Página `VisaoGeral.tsx`** — nova landing page do app com 5 seções:
  - **Saudação dinâmica** ("Bom dia/Boa tarde/Boa noite, [primeiro_nome]!") + botão de criação rápida
  - **Card Progresso da Semana** (lg:col-span-2) com ring SVG animado (110px), percentual grande âmbar, stats inline (concluídas, pendentes, total)
  - **Card Desempenho Geral** com barra de gradient âmbar + 3 mini-stats (feitas/ativas/expiradas)
  - **Seção Próximos Prazos** (lg:col-span-2) — top 5 tarefas pendentes ordenadas por prazo, com emoji+cor+nome+contagem de dias; clique abre edição
  - **Seção Tarefas Expiradas** — top 5 expiradas com visual vermelho e line-through
  - **Seção Disciplinas** (lg:col-span-3) — grid 2/3/6 cols com cards mini de disciplinas (top 6 por pendências), clique filtra tarefas
- **`RingProgress`** SVG animado com `strokeDashoffset` + transição 0.6s
- **Grid responsivo**: 1 col mobile, 3 cols desktop com spans adequados
- **Sidebar** ganhou item "Visão Geral" (ícone Home) no topo do menu
- **Home.tsx** — `VisaoGeral` agora é a landing (default `pagina = "visao-geral"`)

**FASE 5 — Configurações Acadêmicas:**
- **Aba "Acadêmico"** nas Configurações com:
  - **Ano escolar** — 13 opções em grade 2/3 cols, cards com check visual ao selecionar (6º Ano → Pós-graduação + Outro)
  - **Idioma** — 3 opções com bandeira (🇧🇷 pt-BR padrão, 🇺🇸 en, 🇪🇸 es) em lista vertical
  - Bloco informativo redirecionando para a página de Disciplinas (que já é dedicada)
- **Onboarding** — agora salva `school_year` direto na coluna dedicada (não mais como bio), mantendo separação semântica
- **Sem campo "escola"** — confirmado que nunca existiu; spec atendida

### Arquivos criados
- `client/src/pages/VisaoGeral.tsx`
- Migration Supabase: `005_profiles_add_school_year`

### Arquivos modificados
- `client/src/types/index.ts` — `Perfil.school_year`
- `client/src/components/Sidebar.tsx` — nav item "Visão Geral" + ícone Home
- `client/src/pages/Home.tsx` — landing padrão + rota da Visão Geral
- `client/src/pages/Configuracoes.tsx` — aba Acadêmico (`AbaAcademico`)
- `client/src/pages/Onboarding.tsx` — usa `school_year` em vez de `bio`

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 22s

### Próximo passo
- Testes mobile reais (mobile Android/iOS, dashboard + configurações)
- Refinamentos visuais conforme feedback

---

## [Etapa 12 / Sessão 022] - Bugfix: Agenda semanal — criar tarefa em dia ocupado
**Data:** 2026-05-28
**Status:** ✅ Concluída

### Bug reportado
Na visão semanal, dias que já tinham tarefas não exibiam o botão "Adicionar", e o long-press estava só no cabeçalho do dia (não no corpo da coluna). Resultado: era impossível criar uma segunda tarefa para o mesmo dia direto pela Agenda semanal.

### Correção
- **Long-press na coluna inteira** — movido o handler `useLongPress` do header para o wrapper de `DiaColuna`. Agora pressionar e segurar em qualquer parte da coluna abre o modal de criação com a data pré-preenchida, mesmo se houver tarefas listadas.
- **Botão "Nova" sempre visível** — quando o dia tem tarefas, um botão "+ Nova" pequeno e tracejado aparece logo abaixo da última tarefa, permitindo criar mais com um clique simples.
- `stopPropagation()` nos cliques internos (mini-cards e botões "+") evita que o tap acidentalmente dispare o long-press do contêiner.

### Arquivos modificados
- `client/src/pages/Agenda.tsx` — `DiaColuna` refeito

### Build
- ✅ `npm run build` — 0 erros TS, 20s

### Próximo passo
Visão geral / Dashboard de disciplinas em destaque.

---

## [Etapa 12 / Sessão 021] - Agenda: toggle Semana/Mês
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
- **Toggle "Semana | Mês"** no cabeçalho da Agenda (segmented control com pill âmbar no ativo)
- **Visão mensal** restaurada e modernizada:
  - Grade 7×N do mês (com células vazias antes do dia 1)
  - Cabeçalho com nomes curtos dos dias (DOM, SEG, TER…)
  - Cada célula: número do dia, até 3 dots coloridos (cor da disciplina/vermelho se expirada/opaco se concluída), contador "+N" se exceder, emoji da 1ª disciplina como mini-identidade, pulso vermelho se houver tarefa expirada
  - Ring âmbar no "hoje", destaque âmbar quando selecionado
  - **Long-press na célula** abre criação rápida com data pré-preenchida (mesmo hook `useLongPress` da semana)
  - **Toque rápido** seleciona o dia → painel lateral mostra mini-cards das tarefas
- **Painel lateral mensal** com:
  - Cabeçalho com dia da semana + dia/mês grandes + contador
  - Botão "+" para criar tarefa no dia selecionado
  - Lista de mini-cards reutilizando `MiniCard` da visão semanal
- **Navegação contextual** — botões prev/next ajustam semana ou mês conforme visão; "Hoje" volta para a unidade atual da visão ativa
- **Cabeçalho dinâmico** — título muda entre "Agenda semanal" / "Agenda mensal"; rótulo de contagem usa total da unidade
- **Animação `fadeSlideIn`** ao trocar de mês (key=ano-mês)

### Arquivos modificados
- `client/src/pages/Agenda.tsx` — toggle, `VisaoMensal`, `CelulaMes`

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 19s

### Próximo passo
Visão geral / Dashboard de disciplinas em destaque.

---

## [Etapa 12 / Sessão 020] - FASE 3: Calendário Semanal Moderno
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
- **Agenda reescrita** em formato semanal — substituiu o calendário mensal antigo
  - Grade `grid-cols-7` exibe a semana inteira (Dom a Sáb) em colunas
  - Coluna de "hoje" destacada com borda âmbar e fundo `bg-amber-500/5`
  - Cabeçalho com nome curto do dia + número grande + contador de tarefas
- **Mini-cards de tarefa** por dia com:
  - emoji da disciplina + título truncado (2 linhas)
  - cor de fundo da disciplina (tonalidade 12%)
  - dot de status (cor efetiva via `getStatusEfetivo`)
  - badge "!" para tarefas urgentes (≤3 dias, não concluídas/expiradas)
  - estados visuais: concluída (opacity-60 + line-through), expirada (vermelho + line-through), urgente (badge)
- **Long-press** (450ms) em qualquer dia abre o `TarefaForm` com `due_date` pré-preenchido
  - Hook `useLongPress` próprio com cancelamento por movimento (>4px) e `Pointer*` events
  - Vibração tátil (15ms) em dispositivos compatíveis
  - Tap rápido em mini-card → editar tarefa
  - Tap em coluna vazia (botão "+") → criar
- **Navegação semanal** — botões prev/next + "Hoje" (volta para semana atual)
  - Animação `fadeSlideIn` na troca de semana (key=ymd(inicio))
- **TarefaForm estendido** — nova prop `initialDueDate?: string` para criação rápida
- **Helpers de semana** internos: `inicioDaSemana(d)`, `addDays`, `ymd`, `rotuloSemana`
- **Theme-aware** (legível em dark e light), responsivo (min-h adapta sm:420px / 260px mobile)
- **Performance** — agrupamento de tarefas em `useMemo` por YYYY-MM-DD; lookup O(1) por dia
- **Sincronização real-time** — mantida via `useTarefas()` (qualquer mudança atualiza imediatamente)

### Arquivos modificados
- `client/src/pages/Agenda.tsx` — reescrito como calendário semanal
- `client/src/components/TarefaForm.tsx` — prop `initialDueDate`

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 19s

### Próximo passo
- Visão Geral / Dashboard com cards de disciplinas em destaque
- Refinamentos visuais conforme feedback de uso

---

## [Etapa 11 / Sessão 019] - Onboarding pós-cadastro
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
- **Migration `004_profiles_add_onboarding_completed`** — coluna `onboarding_completed boolean NOT NULL DEFAULT false` em `profiles`
- **`Perfil.onboarding_completed`** adicionado ao type
- **Página `Onboarding.tsx`** — fluxo de 3 passos para novos usuários:
  - **Passo 1 — Boas-vindas:** nome + ano/série opcional (pré-preenche nome do user_metadata se existir)
  - **Passo 2 — Disciplinas:** grade de cards selecionáveis com emoji + cor; multiselect com check visual e tonalização ao selecionar
  - **Passo 3 — Revisão:** resumo do que foi configurado (nome, ano, disciplinas com chips) + dica para ajustar nas Configurações
  - Stepper visual no topo + botão "Pular" + navegação Voltar/Próximo
  - Ao concluir: `profileService.upsert({name, bio: "Ano: X", onboarding_completed: true})` + cria todas as disciplinas selecionadas em paralelo via `DisciplinasContext.criar()`
- **`OnboardingGate`** em `App.tsx` — busca o perfil ao logar; se `onboarding_completed === false` renderiza `<Onboarding>` no lugar da Home. "Pular" também marca a flag para não exibir de novo.
- Animação `scaleIn` no card do onboarding; theme-aware (cores legíveis em light e dark)

### Arquivos criados
- `client/src/pages/Onboarding.tsx`
- Migration Supabase: `004_profiles_add_onboarding_completed`

### Arquivos modificados
- `client/src/types/index.ts` — `Perfil.onboarding_completed: boolean`
- `client/src/App.tsx` — `OnboardingGate` envolvendo o Switch das rotas autenticadas

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 19s

### Próximo passo
- Visão geral / Dashboard de disciplinas em destaque
- Calendário semanal

---

## [Etapa 10 / Sessão 018] - FASE 2: Estrutura visual das Disciplinas
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
- **Migração no Supabase** — coluna `emoji text NULL` adicionada à tabela `subjects` (migration `003_subjects_add_emoji`).
- **Renomeação global** — "Matéria" → "Disciplina" em todos os labels de UI (Tarefas, Sidebar, TarefaForm, Tarefa filtros, Configurações). Schema interno do banco preservado.
- **`DisciplinasContext`** — novo provider centralizando CRUD de disciplinas (`disciplinas`, `criar`, `atualizar`, `remover`, `buscarPorNome`).
- **Página `Disciplinas.tsx`** — catálogo visual em grade responsiva (1/2/3/4 colunas conforme tela), cada card com:
  - emoji grande (`getMateriaEmoji`)
  - faixa colorida no topo + caixa do emoji tonalizada
  - contagem de tarefas (Pendentes, Feitas, Vencidas) com destaque para urgentes
  - botões Editar/Remover (visível mobile, hover desktop)
  - clique no card filtra tarefas dessa disciplina e navega
  - card "+" para criar nova disciplina
- **`DisciplinaModal.tsx`** — modal moderno para criar/editar:
  - preview ao vivo
  - picker de emoji com presets em grade scrollable + input para emoji custom
  - paleta de 15 cores em círculos com check
  - sugestão automática "Usar visual sugerido" quando o nome bate com presets conhecidos
- **`MATERIAS_EMOJIS`** + `PALETA_DISCIPLINAS` + `EMOJI_SUGERIDOS` adicionados a `lib/tarefasData.ts`
- **Helper `getMateriaEmoji(nome, custom?)`** — emoji custom > preset por nome > fallback 📘
- **TarefaCard** — chip da disciplina agora exibe emoji ao lado do nome; cor usa preferência da disciplina cadastrada
- **TarefaForm** — Select de disciplina lista as cadastradas + padrões com emoji visível em cada item
- **Sidebar** — novo item "Disciplinas" no menu (ícone `GraduationCap`); seção "Por Disciplina" mostra emoji + cor da disciplina cadastrada
- **Configurações** — aba "Matérias" removida (funcionalidade movida para página dedicada). Apenas Perfil, Aparência e Notificações.
- **Animações** — `fadeSlideIn` em cards (stagger por index), `scaleIn` no modal, hover lift -translate-y nos cards
- **Theme-aware** — todo o novo código usa `text-slate-900 dark:text-white` / `text-slate-700 dark:text-slate-300` para legibilidade nos dois temas

### Arquivos criados
- `client/src/contexts/DisciplinasContext.tsx`
- `client/src/components/DisciplinaModal.tsx`
- `client/src/pages/Disciplinas.tsx`
- Migration Supabase: `003_subjects_add_emoji`

### Arquivos modificados
- `client/src/types/index.ts` — `Materia.emoji: string | null`
- `client/src/services/subjectService.ts` — API `create({name,color,emoji})`/`update({...emoji})`
- `client/src/lib/tarefasData.ts` — `MATERIAS_EMOJIS`, `PALETA_DISCIPLINAS`, `EMOJI_SUGERIDOS`, `getMateriaEmoji()`
- `client/src/App.tsx` — `DisciplinasProvider` no wrapper
- `client/src/pages/Home.tsx` — rota `disciplinas`, `navegarComFiltro`
- `client/src/components/Sidebar.tsx` — nav item, label "Por Disciplina", emoji+cor por disciplina cadastrada
- `client/src/components/TarefaCard.tsx` — emoji no chip da disciplina
- `client/src/components/TarefaForm.tsx` — Select com disciplinas + emojis
- `client/src/pages/Tarefas.tsx` — strings "Matéria" → "Disciplina"
- `client/src/pages/Configuracoes.tsx` — aba Matérias removida

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 16s

### Próximo passo
- Onboarding pós-cadastro (cadastrar disciplinas no fluxo inicial)
- Visão geral / dashboard com cards de disciplinas em destaque
- Calendário semanal (extensão da Agenda)

---

## [Etapa 10 / Sessão 017] - FASE 1: Correções críticas do sistema
**Data:** 2026-05-28
**Status:** ✅ Concluída

### O que foi feito
- **Datas corrigidas** — `new Date("YYYY-MM-DD")` interpretava como UTC, perdendo 1 dia em fuso BR. Novo helper `parseDueDateLocal()` em `lib/tarefasData.ts` parseia como data local no final do dia (23:59:59.999).
- **Cálculo de dias** — `diasAteVencimento()` substitui o `Math.ceil()` por `Math.round()` sobre datas normalizadas; agora "hoje" = 0 (Último dia), "amanhã" = 1 (Falta 1 dia), 28/05 → 05/06 = 8 (Faltam 8 dias).
- **Expiração automática** — helper `isExpirada()` verifica `Date.now() > fim do dia local`. Status só vira "Passou do Prazo" APÓS 23:59:59 do dia final.
- **Status efetivo** — `getStatusEfetivo()` projeta "Passou do Prazo" na UI mesmo antes do DB ser atualizado. Tarefas concluídas nunca expiram.
- **Persistência em background** — `TarefasContext.recarregar()` agora detecta tarefas expiradas e atualiza o status no Supabase em background (sem bloquear UI).
- **Bloqueio de conclusão** — `toggleConcluida()` ignora tarefas expiradas; botão de check no card fica desabilitado com aviso.
- **Visual expirada** — card com fundo `bg-red-500/5`, borda vermelha, ícone `XCircle`, badge "✕ Prazo encerrado", título riscado. Edição continua liberada.
- **Ordenação correta** — buckets: 0=pendentes urgentes, 1=pendentes normais, 2=concluídas, 3=expiradas. Dentro do bucket, prazo mais próximo primeiro.
- **Notificações** — `notificationService.checkAndNotify()` reescrita com `diasAteVencimento()` (timezone-safe); ignora tarefas já expiradas; `todayStr` calculado em local time.
- **Light/Dark mode** — em `index.css`, adicionado bloco `html:not(.dark)` que remapeia `.text-white`, `.text-slate-100..500`, bordas/bg `white/*` para tons escuros no tema claro. Corrige textos invisíveis em todas as páginas sem refatorar componentes.

### Arquivos modificados
- `client/src/lib/tarefasData.ts` — novos helpers de data, status, label
- `client/src/contexts/TarefasContext.tsx` — sort por buckets, auto-bump de expiradas, bloqueio de toggle, métricas via status efetivo
- `client/src/components/TarefaCard.tsx` — visual expirada, botão desabilitado, label e cores theme-aware
- `client/src/pages/Agenda.tsx` — usa `parseDueDateLocal`, `getStatusEfetivo`, `labelDiasRestantes`
- `client/src/services/notificationService.ts` — cálculo de dias corrigido, filtro de expiradas
- `client/src/index.css` — overrides de cores neutras para tema claro

### Build
- ✅ `npm run build` — 0 erros TS, vite build OK em 29s

### Próximo passo
Testes em produção (desktop, mobile Android/iOS, troca de tema, criação de tarefa hoje/amanhã/8 dias) — depois Fase 2 conforme roadmap.

---

## [Etapa 9 / Sessão 016] - Web Push Notifications completo
**Data:** 2026-05-22
**Status:** ✅ Concluída

### O que foi feito
- Service Worker `sw.js` criado — recebe push em background
- `notificationService.ts` criado — subscribe/unsubscribe/checkAndNotify
- Tabela `push_subscriptions` criada no Supabase com RLS
- Edge Function `send-notifications` deployada no Supabase (Deno)
- Secrets VAPID configurados na Edge Function
- `pg_cron` habilitado + cron job diário às 8h Brasília criado
- UI em Configurações reescrita — banner de status + botões Ativar/Desativar
- `NotificationChecker` adicionado ao App.tsx
- Bugfixes: avatar 406, importação 400, notification_settings 409

### Arquivos criados
- `client/public/sw.js`
- `client/src/services/notificationService.ts`
- `supabase/functions/send-notifications/index.ts`
- `supabase/migrations/002_push_subscriptions.sql`
- `SESSIONS/001-006.md`, `SESSIONS/008-016.md`

### Arquivos modificados
- `client/src/main.tsx`, `client/src/App.tsx`
- `client/src/pages/Configuracoes.tsx`
- `client/src/services/profileService.ts`, `settingsService.ts`
- `vite.config.ts`, `.env.local`

### Commits
- `6f03b82` — feat: implement Web Push Notifications (Fase 3 / Sessão 016)

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app
- Push Notifications: ✅ funcionando (local + background)
- Edge Function: ✅ deployada
- Cron Job: ✅ todo dia às 8h Brasília

### Próximo passo
Fase 3 continuação: Onboarding, Agenda melhorada, ou novo feature

---

## [Etapa 8 / Sessão 015] - Bugfixes: avatar, perfil e notificações
**Data:** 2026-05-21
**Status:** ✅ Concluída

### O que foi feito
- Avatar upload: Canvas base64 substituiu Supabase Storage (bucket inexistente)
- profileService: `.single()` → `.maybeSingle()`, `.update()` → `upsert` em todo o código
- settingsService: `{ onConflict: "user_id" }` corrigiu erro 409
- AbaTema, salvarPerfil, handleAvatarChange: todos migrados para `upsert`
- SQL no Supabase criou linha de perfil ausente do usuário (conta criada antes do trigger)

### Arquivos modificados
- `client/src/services/profileService.ts`
- `client/src/services/settingsService.ts`
- `client/src/pages/Configuracoes.tsx`
- `vite.config.ts` (force bundle hash)

### Commits
- `725c09a` → `bdd49d0` + `b81add1`

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app
- Avatar: ✅ funcionando
- Notificações: ✅ funcionando

---

## [Etapa 8 / Sessão 14] - Bugfix: importação de planilha (erro 400)
**Data:** 2026-05-20
**Status:** ✅ Concluída

### O que foi feito
- Corrigido erro 400 (Bad Request) ao importar planilhas .xlsx/.csv
- Causa 1: status/prioridade da planilha não batia com enum do Supabase
- Causa 2: datas do Excel chegavam como número serial (ex: 45672)
- Adicionados `sanitizeStatus()`, `sanitizePrioridade()` e `parseExcelDate()` em `parseExcel.ts`
- Melhorada mensagem de erro no modal para exibir o erro real do Supabase

### Arquivos modificados
- `client/src/lib/parseExcel.ts`
- `client/src/components/ImportarPlanilhaModal.tsx`

### Commits
- `4e32f37` — fix: sanitize status/priority values and parse Excel dates on import
- `f24b8a6` — docs: registrar bugfix no MEMORY.md e MEMORY_CORE.md

### Status do sistema
- App: ✅ https://tarefas-escolares-five.vercel.app
- Build: ✅ 0 erros TypeScript
- Push: ✅ main → GitHub
- Deploy: ✅ Vercel automático

### Próximo passo
Projeto concluído. Fase 3 (Notificações, Onboarding, Agenda melhorada) pode ser iniciada quando o usuário decidir.

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
| `f24b8a6` | 14 | docs: registrar bugfix importação planilha no MEMORY.md e MEMORY_CORE.md |
| `4e32f37` | 14 | fix: sanitize status/priority values and parse Excel dates on import |
| `a9a4609` | 13 | merge: Sessão 13 — ícone oficial e PWA favicon assets |
| `e3ecd5d` | 13 | feat: add official app icon and PWA favicon assets |
| `59e76f0` | 12 | merge: Sessão 12 — light/dark theme (Fase 2 finalizada) |
| `df771fd` | 12 | feat: implement light/dark theme with CSS custom properties |
| `a3e1374` | 6 | docs: add mid-session registration rule |
| `861a155` | 6 | chore: update CLAUDE.md with proactive checklist |
| `9c5f152` | 6 | chore: add CLAUDE.md |
| `02f9a35` | 5 | docs: add project knowledge base files |

---

*Atualizado automaticamente ao final de cada sessão.*
