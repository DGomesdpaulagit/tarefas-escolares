# Prompts — Tarefas Escolares

Registro de prompts usados para construir e evoluir o projeto.
Útil para replicar abordagens em sessões futuras.

---

## Prompts de Arquitetura e Setup

### P-001 — Refatoração completa do projeto Manus AI
**Contexto:** Projeto gerado pelo Manus AI com autenticação mockada, dados hardcoded e dependências quebradas.
**Prompt:**
```
Analise o projeto inteiro e execute uma refatoração completa:
1. Substituir autenticação localStorage por Supabase Auth real
2. Migrar dados hardcoded para PostgreSQL (Supabase)
3. Remover todos os artefatos Manus AI
4. Corrigir todos os erros TypeScript
5. Manter o design Academic Dark intacto
```
**Resultado:** Projeto completamente refatorado, 0 erros TS, deploy funcional.

---

### P-002 — Deploy automatizado Supabase + GitHub + Vercel
**Contexto:** Precisava publicar o projeto sem configuração manual de cada serviço.
**Prompt:**
```
Automatize o deploy completo:
1. Criar projeto Supabase com tabelas e RLS via API
2. Criar repositório GitHub e fazer push
3. Conectar Vercel ao GitHub com CI/CD automático
4. Configurar variáveis de ambiente em todos os serviços
```
**Resultado:** Pipeline completo — push em main → Vercel deploy em ~30s.

---

### P-003 — Correção de tela preta em produção
**Contexto:** App publicado na Vercel exibia tela preta com erro de variáveis de ambiente.
**Prompt:**
```
[imagem do console com erro]
Analise o print e corrija: o app está publicado na Vercel mas exibe tela preta.
No console: "Uncaught Error: Variáveis de ambiente VITE_SUPABASE_URL e 
VITE_SUPABASE_ANON_KEY são obrigatórias."
```
**Causa identificada:** Env vars passadas como `--env` no CLI não foram persistidas no projeto Vercel.
**Solução:** Usar Vercel API para salvar variáveis permanentemente em production/preview/development.

---

### P-004 — Fluxo de reset de senha
**Contexto:** Link de reset do Supabase abria página em branco.
**Prompt:**
```
[imagem do console com erro]
Implemente o fluxo completo de recuperação de senha.
Problema: ao clicar no link de reset, abre página em branco.
Console: "Error: Auth session missing!"
```
**Solução:** Criar `ResetPassword.tsx` que escuta evento `PASSWORD_RECOVERY` no `onAuthStateChange`.

---

## Prompts de Documentação

### P-005 — Criação do MEMORY.md
**Contexto:** Sessão crescia muito; precisava de documento de continuidade entre sessões.
**Prompt:**
```
Crie um MEMORY.md extremamente detalhado na raiz do projeto cobrindo:
- Stack completa com versões
- URLs de produção (Supabase, Vercel, GitHub)
- Esquema do banco de dados (todas as tabelas e colunas)
- Design system (cores, fontes, componentes)
- Funcionalidades implementadas vs pendentes
- Bugs resolvidos com causa e solução
- Decisões técnicas com justificativas
- Roadmap em 3 fases
- Prompt exato para próxima sessão
```
**Resultado:** MEMORY.md com ~490 linhas, 24 seções.

---

### P-006 — Base de conhecimento (CHANGELOG, PROMPTS, BUGS, LINKS)
**Contexto:** Criar documentação estruturada para o projeto após MEMORY.md estar pronto.
**Prompt:**
```
Leia o MEMORY.md. Verifique e crie os seguintes arquivos se não existirem:
- CHANGELOG.md (formato Keep a Changelog)
- PROMPTS.md (registro de prompts usados)
- BUGS.md (bugs resolvidos e conhecidos)
- LINKS.md (todos os links do projeto)
Depois: commit "docs: add project knowledge base files" e push.
```

---

## Prompts de Features (Fase 1)

### P-007 — Legendas nos filtros
**Status:** Pendente
**Prompt sugerido:**
```
Em client/src/pages/Tarefas.tsx, adicione legendas acima de cada Select de filtro.
Exemplo: "Status", "Matéria", "Prioridade" como <label> ou <span> com estilo text-slate-400.
Não altere a lógica de filtragem.
```

---

### P-008 — Ordenação de tarefas urgentes
**Status:** Pendente
**Prompt sugerido:**
```
Em client/src/contexts/TarefasContext.tsx, modifique tarefasFiltradas para ordenar:
1. Tarefas urgentes (isUrgente = true) no topo
2. Dentro de urgentes: mais próximas do prazo primeiro
3. Não urgentes: por due_date crescente
```

---

### P-009 — Busca avançada multi-campo
**Status:** Pendente
**Prompt sugerido:**
```
Expanda a busca em TarefasContext.tsx para pesquisar em múltiplos campos:
- title (já implementado)
- description
- subject_name
A busca deve ser case-insensitive e usar .toLowerCase().includes().
```

---

## Template de Prompt para Nova Sessão

```
Projeto: Tarefas Escolares (SaaS de gestão de tarefas escolares)
Stack: React 19 + TypeScript + Vite + Tailwind v4 + Supabase + Vercel
Repositório local: C:\Users\HP\Downloads\tarefas-escolares-app (1)\
GitHub: https://github.com/DGomesdpaulagit/tarefas-escolares
App em produção: https://tarefas-escolares-five.vercel.app

Leia o MEMORY.md na raiz do projeto para contexto completo.
Estado atual: [descrever o que foi feito na última sessão]

TAREFA: [descrever a feature ou correção específica]

REGRAS:
- NÃO quebrar código funcional
- NÃO alterar design Academic Dark
- NÃO remover dependências instaladas
- Após implementar: npm run build → confirmar 0 erros → git commit → git push
```

---

---

## Comportamentos validados pelo usuário (Sessão 6)

### P-010 — Sistema de sessões numeradas com cloud.md
**Validado em:** 2026-05-20
**Resultado:** Aprovado — "muito bom claude, vc alterou, registrou e me certificou sobre as alterações. continue assim"
**O que foi aprovado:**
- Criar `cloud.md` como controle de sessões numeradas `[Sessão X]`
- Claude lê `cloud.md` no início e anuncia a próxima sessão antes de começar
- Certificar ao usuário após cada ação importante que foi registrado em `MEMORY.md` + Obsidian
- Checklist obrigatório ao final de cada sessão antes de encerrar

---

### P-011 — Nomenclatura Etapa/Sessão para conversas do projeto
**Validado em:** 2026-05-20
**Resultado:** Aprovado com entusiasmo — "MUITOOOOO BEM CLAUDE, PERFEITO. CONTINUE ASSIM"
**O que foi aprovado:**
- Etapa = conversa completa (thread do Claude)
- Sessão = bloco de progresso dentro de uma Etapa
- Ao final de cada Etapa, Claude sugere o nome da conversa no formato `Etapa X - (nome)`
- Nome cobre tudo que aconteceu na conversa inteira, não só a última sessão

---

### P-012 — Mega prompt FASE 1 (correções críticas do sistema)
**Validado em:** 2026-05-28
**Sessão:** 017
**Escopo aprovado:**
1. Sistema de status com 3 estados (pending/completed/expired) com regras claras
2. Correção do bug de timezone das datas (dia atual e dia final contam)
3. Expiração automática só após 23:59:59 do dia final
4. Visual dedicado para tarefas expiradas (riscado, vermelho, badge, X, sem botão concluir, edição livre)
5. Ordenação correta: urgentes → normais → concluídas → expiradas
6. Notificações com cálculo de dias corrigido
7. Light/Dark mode com cores neutras adaptativas

**Estratégia adotada:**
- Helpers centralizados em `lib/tarefasData.ts` (`parseDueDateLocal`, `diasAteVencimento`, `isExpirada`, `getStatusEfetivo`, `labelDiasRestantes`)
- Status efetivo computado client-side + persistência em background no Supabase
- Light mode resolvido com overrides CSS em `index.css` (`html:not(.dark)`) — sem refatorar componentes um a um

---

### P-013 — Mega prompt FASE 2 (estrutura visual das Disciplinas)
**Validado em:** 2026-05-28
**Sessão:** 018
**Escopo aprovado:**
- Rename "Matéria" → "Disciplina" em toda a UI (schema do banco preservado)
- Catálogo visual de disciplinas com cards modernos (emoji + cor + contadores + ações)
- Modal moderno de criação/edição (preview ao vivo, emoji picker, paleta de cores)
- Animações suaves (fadeSlideIn stagger, scaleIn modal, hover lift)
- Sugestões rápidas para adicionar disciplinas padrão em 1 clique
- Emoji da disciplina propagado em TarefaCard, TarefaForm e Sidebar
- Theme-aware (legível em dark e light mode)
- Responsividade total (grade adapta de 1 a 4 colunas)

**Estratégia adotada:**
- Coluna `emoji` nullable em `subjects` (via Supabase MCP `apply_migration`)
- Novo `DisciplinasContext` separado do `TarefasContext`, fonte única de verdade
- Página dedicada `Disciplinas.tsx` substitui aba das Configurações
- Helper `getMateriaEmoji()` com fallback hierárquico: custom > preset por nome > 📘

---

### P-014 — Onboarding pós-cadastro com seleção visual
**Validado em:** 2026-05-28
**Sessão:** 019
**Escopo aprovado:**
- Fluxo em passos curto para não cansar
- Seleção visual de disciplinas (grade com emoji + cor) em vez de checklist
- Botão "Pular" sempre disponível
- Marcação persistente em `profiles.onboarding_completed` para nunca repetir
- Pré-preenche nome a partir do user_metadata se já existir
- Cria as disciplinas selecionadas em lote (Promise.all) ao concluir

**Estratégia adotada:**
- Migration nullable-safe (`NOT NULL DEFAULT false`) — usuários antigos veem o onboarding 1x
- Gate em `App.tsx` antes do Router das rotas autenticadas
- "Pular" também salva a flag (sem desistir de marcar — evita loop infinito)

---

### P-015 — Mega prompt FASE 3 (calendário semanal moderno)
**Validado em:** 2026-05-28
**Sessão:** 020
**Escopo aprovado:**
- Visão semanal (7 colunas) em vez do calendário mensal anterior
- Mini-cards de tarefa com identidade visual (emoji + cor + status)
- Long-press para criação rápida com data pré-preenchida
- Navegação fluida entre semanas + atalho "Hoje"
- Coluna "hoje" destacada
- Estados visuais para concluída/expirada/urgente
- Responsivo (mobile + desktop) e theme-aware
- Performance otimizada (useMemo, lookup O(1))

**Estratégia adotada:**
- Hook `useLongPress` próprio (sem dependência extra) com `Pointer*` events,
  cancelamento por movimento (>4px) e vibração tátil (15ms)
- `TarefaForm` ganhou prop `initialDueDate` em vez de criar modal separado
- Agrupamento de tarefas por YYYY-MM-DD via `useMemo` para evitar re-render
- Animação `fadeSlideIn` na grade ao trocar de semana (key=ymd(início))

---

### P-016 — Mega prompt FASES 4 e 5 (Dashboard + Configurações)
**Validado em:** 2026-05-28
**Sessão:** 023
**Escopo aprovado:**
- Nova landing "Visão Geral" estilo dashboard premium com 5 seções
- Ring SVG animado para progresso da semana
- Sectionização por blocos (próximos prazos, expiradas, disciplinas, desempenho)
- Configurações simplificadas (apenas ano + idioma + disciplinas)
- Remoção de qualquer campo "escola" (já inexistente)
- Onboarding salvando em coluna dedicada `school_year`

**Estratégia adotada:**
- Reuso máximo de helpers existentes (`getStatusEfetivo`, `parseDueDateLocal`, `diasAteVencimento`)
- Ring SVG nativo (sem libs extras) com `strokeDashoffset` para animação
- `useMemo` em todas as derivações (semana, expiradas, próximos prazos, disciplinas)
- Aba "Acadêmico" com grade de pills selecionáveis (mais visual que dropdown)
- Idioma persistido em `profiles.language` (i18n em runtime virá depois)

---

### P-017 — Mega prompt FASE 6 (Notificações + Onboarding pré-login)
**Validado em:** 2026-05-28
**Sessão:** 024
**Escopo aprovado:**
- NÃO mexer no visual geral do sistema (dashboard, calendário, disciplinas, cards intactos)
- Melhorar SOMENTE: notificações + apresentação antes do login
- Push real funcionando com app fechado (SW + VAPID + Edge Function já existiam)
- Botão de teste pra confirmar funcionamento
- Notificação opcional ao criar tarefa
- Alerta agrupado pra tarefas expiradas
- Welcome leve (5 slides), aparece só na 1ª visita

**Estratégia adotada:**
- Service Worker bumpado pra v2 com listener `message` para acionar
  notificações locais sem servidor — útil pra `sendTest()` e `notifyTaskCreated`
- Alerta de expiradas reusa o flag `notify_last_check` (não duplica avisos)
- Welcome persiste em `localStorage` (não em DB) — não depende de login
- Configurações dividida em 3 caixas para hierarquia visual sem refatorar UI global

---

### P-018 — Fechamento: editar/excluir tarefas direto no modal
**Validado em:** 2026-05-28
**Sessão:** 025 (final)
**Escopo aprovado:**
- Última alteração antes de considerar o projeto terminado
- "Agenda melhorada (visão semanal, clique para editar/excluir tarefas)"

**Estratégia adotada:**
- Em vez de duplicar lógica em mini-cards (Agenda) e cards (Tarefas/VisaoGeral),
  adicionar Excluir + Concluir/Pendente diretamente no `TarefaForm` que já é
  aberto por TODOS os pontos de clique do app.
- Padrão de dupla confirmação (3s) para evitar exclusão acidental.
- Botão "Concluir" oculto quando a tarefa está expirada (consistente com BUG-017).

---

🎉 **v2.1.0 FINALIZADA** — todas as fases entregues conforme escopo (versão pública, branch `main`).

---

### P-019 — v3.0: Módulo de Mesada por Desempenho + Tutorial guiado do app
**Validado em:** 2026-07-22
**Sessão:** 028 (branch `v3-mesada-pessoal`, uso pessoal)
**Escopo aprovado (em 6 blocos ao longo da conversa):**
1. Módulo de Mesada base: lançar conceito (MB/B/R/I) por matéria/mês, cálculo automático de valor acumulado, limite de MB, meta
2. Importar Disciplinas já cadastradas no app em lote, em vez de digitar cada matéria do boletim manualmente
3. Painel/dashboard mostrando a grade real do boletim (matéria × mês, igual à planilha original) e gráfico de quantas notas de cada conceito por matéria, para identificar dificuldade
4. Termômetro visual por matéria, lembrete de lançamento no fim do mês, confirmação de que a virada de ano funciona sozinha (matérias e config persistem, notas resetam)
5. Data de hoje ao vivo no topo do app
6. Tutorial guiado explicando todas as funções/abas do app, com efeito spotlight (escurece o resto da tela, destaca só o item explicado)
7. Ajustes finos do tutorial: velocidade da animação, oferecer automaticamente a usuários novos, corrigir card de navegação saindo da tela

**Decisões de negócio esclarecidas antes de codar (ambiguidades do documento original):**
- Tabela de conceito única para todas as matérias (não valor por matéria)
- Limite de MB por período **trava** o cálculo (não é só alerta visual)

**Estratégia adotada:**
- Três tabelas novas (`mesada_config`, `mesada_materias`, `mesada_notas`) independentes de `subjects`, com RLS padrão do projeto
- `valor_calculado` salvo como snapshot em cada nota (auditável mesmo se a config mudar depois)
- Config de um ano novo herda os valores do ano letivo mais recente em vez de resetar para os defaults do banco
- Tutorial implementado com `TourContext` (steps declarativos, navegação de página via callback registrado) + `TourOverlay` (técnica de `box-shadow: 0 0 0 9999px` para o recorte/spotlight, com posição sempre clampada aos limites da janela)
- Feature flag `VITE_ENABLE_MESADA_MODULE` mantém a Mesada exclusiva do ambiente pessoal; o Tutorial, por ser recurso geral, não tem flag — é candidato a ir para `main` separadamente no futuro

**Prompt de fechamento validado (registrar e limpar documentação):**
```
Agora quero que vc atualize todos os arquivos que fazemos registros,
documentação do projeto, entre outros e atualize tudo, não tenho mais
inovações ou ideia de nova versão ou passo. Faça a limpa.
```
**Resultado:** varredura e atualização de `MEMORY.md`, `MEMORY_CORE.md`, `cloud.md`, `CHANGELOG.md`, `BUGS.md`, `PROMPTS.md`, `LINKS.md`, `DOCUMENTACAO_PROJETO.md`, `docs/ROADMAP.md`, `README.md`, `CLAUDE.md` (caminho do projeto corrigido) e remoção de `README_PT.md` (duplicata obsoleta descrevendo a arquitetura localStorage/Manus AI descontinuada desde a Sessão 1).

---

*Atualizado em: 2026-07-22*
