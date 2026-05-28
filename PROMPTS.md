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

*Atualizado em: 2026-05-28*
