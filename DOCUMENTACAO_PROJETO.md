# Tarefas Escolares — Documentação Oficial do Projeto

**Versão atual (pública):** 2.1.0 — **ENCERRADA**
**Versão em uso pessoal:** 3.0 (branch `v3-mesada-pessoal`, não publicada — ver seção 25)
**Última atualização da documentação:** 2026-07-22
**Repositório:** https://github.com/DGomesdpaulagit/tarefas-escolares
**Produção (pública, v2.1.0):** https://tarefas-escolares-five.vercel.app

---

## Sumário

1. [Identidade do projeto](#1-identidade-do-projeto)
2. [Objetivo principal](#2-objetivo-principal)
3. [Problema que o sistema resolve](#3-problema-que-o-sistema-resolve)
4. [Público-alvo](#4-público-alvo)
5. [Conceito do sistema](#5-conceito-do-sistema)
6. [Estrutura geral da plataforma](#6-estrutura-geral-da-plataforma)
7. [Funcionalidades principais](#7-funcionalidades-principais)
8. [Sistema de login e registro](#8-sistema-de-login-e-registro)
9. [Sistema de tarefas](#9-sistema-de-tarefas)
10. [Sistema de agenda](#10-sistema-de-agenda)
11. [Sistema de notificações](#11-sistema-de-notificações)
12. [Sistema de organização por disciplinas](#12-sistema-de-organização-por-disciplinas)
13. [Sistema de progresso e desempenho](#13-sistema-de-progresso-e-desempenho)
14. [Tecnologias utilizadas](#14-tecnologias-utilizadas)
15. [Estrutura do código](#15-estrutura-do-código)
16. [Organização das pastas](#16-organização-das-pastas)
17. [Fluxo do usuário dentro da plataforma](#17-fluxo-do-usuário-dentro-da-plataforma)
18. [Experiência do usuário (UX/UI)](#18-experiência-do-usuário-uxui)
19. [Segurança e autenticação](#19-segurança-e-autenticação)
20. [Responsividade](#20-responsividade)
21. [Organização visual do projeto](#21-organização-visual-do-projeto)
22. [Diferenciais do sistema](#22-diferenciais-do-sistema)
23. [Ideias futuras para expansão](#23-ideias-futuras-para-expansão)
24. [Conclusão final](#24-conclusão-final)
25. [Anexo — v3.0: Módulo de Mesada + Tutorial guiado (branch pessoal)](#25-anexo--v30-módulo-de-mesada--tutorial-guiado-branch-pessoal)

---

## 1. Identidade do projeto

**Nome oficial:** Tarefas Escolares

**Categoria:** SaaS Web App / PWA — Gerenciador de tarefas escolares com sincronização em nuvem

**Slogan operacional:** "Sua vida acadêmica organizada num só lugar."

**Identidade visual:**
- Paleta principal: âmbar `#f59e0b` (ação, destaque) sobre Academic Dark `#0f1117` (base) ou Academic Light `#f0f3f8`
- Tipografia: `Space Grotesk` para títulos e números, `Inter` para corpo de texto
- Tom de voz: direto, próximo, sem jargão técnico, em português brasileiro

**Linha do tempo:**
- Versão `1.0.0` (descontinuada): protótipo gerado por Manus AI com auth mockada via localStorage, dados hardcoded, dependências quebradas
- Versão `2.0.0` (refatoração completa): migração para Supabase, autenticação real, RLS, deploy contínuo 
- Versão `2.1.0` (atual): inclusão de todas as Fases 1 a 6 (correções estruturais, catálogo de disciplinas, calendário, dashboard, configurações acadêmicas, notificações reorganizadas, welcome pré-login e fechamento)

---

## 2. Objetivo principal

O Tarefas Escolares foi criado para substituir cadernos, planilhas avulsas e aplicativos genéricos de tarefa por uma **plataforma digital unificada e específica para a rotina estudantil**.

O sistema centraliza, em um único painel:

- Todas as tarefas escolares com prazo, prioridade e disciplina
- Métricas automáticas de produtividade e desempenho
- Alertas inteligentes para prazos próximos e tarefas urgentes
- Persistência por usuário em nuvem, com sincronização entre dispositivos
- Visão geral diária via dashboard e visão temporal via agenda semanal e mensal

A meta não é apenas "anotar tarefa". É **dar contexto** para o estudante saber, a cada acesso, exatamente o que precisa fazer hoje, o que está atrasado, em quais matérias está em dia e o quanto já evoluiu na semana.

---

## 3. Problema que o sistema resolve

A rotina estudantil enfrenta três dores estruturais:

1. **Perda de prazos por falta de visibilidade centralizada.** O estudante normalmente recebe tarefas de canais diferentes — sala, Teams, portal, e-mail — e acaba sem um lugar único para enxergar tudo o que tem para entregar.

2. **Dificuldade de priorizar entre múltiplas disciplinas.** Sem identidade visual por matéria, listas longas viram um borrão e a hierarquia de urgência desaparece.

3. **Ausência de métricas pessoais de desempenho.** Cadernos e planilhas não dizem ao aluno se ele está mantendo consistência, em quais matérias está atrasado ou qual sua taxa de entrega no período.

O Tarefas Escolares ataca os três pontos:

- Centraliza tudo em uma interface única, web e mobile-friendly, instalável como PWA
- Dá identidade visual (emoji + cor) por disciplina, transformando a lista em um catálogo reconhecível em segundos
- Calcula automaticamente progresso da semana, taxa de conclusão, tarefas urgentes, tarefas atrasadas e desempenho por matéria

---

## 4. Público-alvo

**Perfil primário:** estudantes do ensino médio, técnico e superior brasileiros que precisam acompanhar múltiplas disciplinas simultaneamente, com prazos variáveis e entregas escalonadas.

**Perfil secundário:** alunos de cursos preparatórios, intercâmbios e pós-graduação que mantenham uma carga de trabalho com prazos definidos.

**Uso:** individual. Uma conta por aluno. Sem componente colaborativo ou de grupo nesta versão.

**Idioma de partida:** Português brasileiro (`pt-BR`). O sistema já está preparado em estrutura para idiomas adicionais (`en`, `es`) — a tradução em runtime está planejada como expansão futura.

---

## 5. Conceito do sistema

O Tarefas Escolares trabalha sob três conceitos centrais:

### 5.1 Status efetivo

Toda tarefa pode estar em um dos estados:

- **Não iniciada** — registrada, ainda dentro do prazo
- **Em Andamento** — sendo executada (com progresso parcial salvo)
- **Concluída** — entregue dentro do prazo
- **Passou do Prazo (Expirada)** — prazo encerrado sem conclusão

O sistema calcula em tempo real o **status efetivo** de cada tarefa via a função `getStatusEfetivo`, que projeta automaticamente "Passou do Prazo" para tarefas cujo prazo já passou, sem depender de o banco ter sido atualizado. Tarefas expiradas não podem ser concluídas, mas podem ser editadas — preservando o histórico.

### 5.2 Identidade visual por disciplina

Cada disciplina cadastrada possui:

- **Nome** (ex: Matemática, Banco de Dados, Educação Física)
- **Emoji personalizado** (ex: `📘`, `🗄️`, `⚽`)
- **Cor própria** (ex: `#f97316`, `#10b981`, `#f43f5e`)

Esses três atributos se propagam por toda a interface — cards de tarefa, chips no formulário, sidebar, calendário, dashboard. Em segundos, o estudante reconhece "tudo o que é de Matemática" sem ler texto.

### 5.3 Status visual coerente em todos os contextos

Tarefas urgentes (prazo em até 3 dias) ganham badge vermelho. Concluídas ficam com opacidade reduzida e texto riscado. Expiradas ganham fundo vermelho suave, ícone `X` e badge "Prazo encerrado". Esses padrões são aplicados em todos os lugares onde uma tarefa aparece — não há divergência entre página de Tarefas, Agenda e Visão Geral.

---

## 6. Estrutura geral da plataforma

A plataforma é uma SPA (Single Page Application) com sete áreas principais, acessíveis pela sidebar:

| # | Área | Função |
|---|---|---|
| 1 | Visão Geral | Dashboard de produtividade — landing padrão ao logar |
| 2 | Tarefas | Listagem completa com filtros, busca e ordenação |
| 3 | Disciplinas | Catálogo visual de matérias com contadores |
| 4 | Agenda | Calendário semanal ou mensal com mini-cards |
| 5 | Métricas | Análise estatística de desempenho |
| 6 | Arquivos | Histórico de planilhas importadas |
| 7 | Configurações | Perfil, Acadêmico, Aparência, Notificações |

A sidebar exibe também:
- **Resumo rápido**: total, concluídas, pendentes, atrasadas
- **Progresso geral** com barra âmbar e percentual
- **Filtros por status** com contadores
- **Lista de disciplinas ativas** com emoji + cor + número de tarefas

No mobile, a sidebar vira menu lateral retrátil; um botão de "hambúrguer" abre/fecha. No desktop, ela é fixa.

---

## 7. Funcionalidades principais

### 7.1 Gestão de tarefas

- CRUD completo (criar, editar, marcar concluída, excluir)
- Filtros por status, disciplina, prioridade
- Busca multi-campo (título, disciplina, observações, setor, origem, descrição)
- Ordenação por urgência, data, prioridade ou disciplina
- Exibição visual coerente em qualquer contexto (Tarefas, Agenda, Visão Geral)

### 7.2 Catálogo de disciplinas

- Cadastro com emoji e cor personalizáveis
- Picker de emoji em grade com mais de 50 sugestões
- Paleta de 15 cores em círculos com check visual
- Sugestão automática de visual ("usar visual sugerido para Matemática")
- Sugestões rápidas para adicionar disciplinas padrão em 1 clique
- Edição e remoção com confirmação

### 7.3 Calendário (Agenda)

- Visão semanal com 7 colunas
- Visão mensal alternativa
- Mini-cards de tarefa com emoji + cor + status
- Long-press em qualquer dia → cria tarefa com data pré-preenchida
- Tap rápido em mini-card → edição
- Coluna "hoje" destacada

### 7.4 Visão Geral (Dashboard)

- Saudação dinâmica (Bom dia / Boa tarde / Boa noite)
- Ring SVG animado com progresso da semana
- Card de desempenho geral com taxa de conclusão
- Próximos prazos (top 5)
- Tarefas expiradas (top 5)
- Cards de disciplinas com filtragem rápida

### 7.5 Notificações

- Push real via Web Push API com VAPID
- Service Worker dedicado para receber em background
- Cron diário no Supabase Edge Function às 8h Brasília
- Notificações locais quando o app abre (verificação 1x/dia)
- Notificação opcional ao criar nova tarefa
- Notificação agrupada para tarefas expiradas
- Botão "Enviar notificação de teste" nas configurações

### 7.6 Onboarding e Welcome

- Welcome de 5 slides antes do login (anônimo, persiste em localStorage)
- Onboarding pós-cadastro em 3 passos (boas-vindas + nome/ano, seleção visual de disciplinas, revisão)

### 7.7 Importação e exportação

- Importação de planilhas Excel/CSV com sanitização de status, prioridade e datas
- Exportação para JSON e Excel
- Histórico de importações registrado

### 7.8 Personalização

- Tema claro e escuro com sincronização entre dispositivos
- Avatar do usuário (compressão Canvas para base64)
- Bio personalizada
- Ano escolar (13 opções de nível)
- Idioma (estrutura pronta para pt-BR, en, es)

---

## 8. Sistema de login e registro

### 8.1 Autenticação

Implementado via **Supabase Auth** com email e senha. O usuário pode:

- **Cadastrar-se** informando nome, e-mail e senha (mínimo 6 caracteres). O Supabase envia e-mail de confirmação automaticamente.
- **Fazer login** com e-mail e senha. Erros tratados com mensagens em português ("Email ou senha incorretos", "Confirme seu email antes de entrar").
- **Recuperar senha** via link enviado por e-mail. Página dedicada `/reset-password` para redefinir.

### 8.2 Trigger automática de perfil

Ao criar uma conta, uma `function` no Postgres com `SECURITY DEFINER` cria automaticamente:
- Uma linha em `profiles` com `id` igual ao `auth.users.id`
- Uma linha em `notification_settings` com defaults seguros

Isso garante que todo usuário sempre tem seu perfil e suas preferências de notificação prontos para uso, sem race condition no primeiro acesso.

### 8.3 Sessão e roteamento

- Sessão persistida em `localStorage` pelo SDK Supabase
- `AuthContext` expõe `user`, `estaAutenticado`, `carregando`, `logar`, `cadastrar`, `deslogar`, `resetarSenha`, `atualizarSenha`
- O `App.tsx` decide entre `<Welcome>` (primeira visita anônima), `<Login>` (não autenticado), `<Onboarding>` (autenticado, mas sem onboarding concluído) ou `<Home>` (autenticado, onboarding ok)

### 8.4 Welcome pré-login

Antes mesmo da tela de login, novos visitantes (anônimos) veem 5 slides curtos explicando o app: Tarefas → Disciplinas → Agenda → Notificações → Visão Geral. Cada slide tem emoji grande, ícone, título e texto. Botões "Voltar/Próximo", dots clicáveis, "Pular" sempre disponível. Persiste em `localStorage` (`tarefas_welcome_seen_v1`) — só aparece uma vez por navegador.

### 8.5 Onboarding pós-cadastro

Após o primeiro login, o usuário passa por um fluxo de 3 passos:

1. **Boas-vindas:** nome de exibição + ano/série (opcional)
2. **Disciplinas:** grade visual selecionável com emoji + cor (multiselect)
3. **Revisão:** chips das escolhas + botão "Começar a usar"

Ao concluir, todas as disciplinas marcadas são criadas em paralelo, o ano é salvo em `profiles.school_year` e a flag `onboarding_completed` vira `true`. O fluxo nunca mais reaparece. "Pular" também marca a flag.

---

## 9. Sistema de tarefas

### 9.1 Modelo de dados

Tabela `tasks` no Postgres:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | Primary key, gerado por `gen_random_uuid()` |
| `user_id` | uuid | FK para `auth.users` |
| `title` | text | Obrigatório |
| `description` | text | Opcional |
| `subject_name` | text | Nome da disciplina (denormalizado para consulta rápida) |
| `subject_id` | uuid | FK opcional para `subjects` |
| `priority` | text | `Alta` / `Média` / `Baixa` (check constraint) |
| `status` | text | `Não iniciada` / `Em Andamento` / `Concluída` / `Passou do Prazo` (check constraint) |
| `progress` | int | 0–100 (check constraint) |
| `due_date` | date | Opcional, nullable |
| `notes` | text | Opcional |
| `link` | text | Opcional, link externo de referência |
| `sector` | text | Trabalho / Atividade / Prova / Projeto / Outro |
| `origin` | text | SALA / TEAMS / PORTAL / E-MAIL / OUTRO |
| `completed_at` | timestamptz | Quando foi concluída |
| `created_at` / `updated_at` | timestamptz | Automáticos |

### 9.2 Operações suportadas

- `taskService.list(userId)` — lista todas as tarefas do usuário
- `taskService.create(insert)` — cria
- `taskService.update(id, patch)` — atualiza qualquer campo
- `taskService.delete(id)` — exclui
- `taskService.deleteAll(userId)` — limpa todas
- `taskService.toggle(id, currentStatus)` — alterna concluída ↔ pendente

Todas as operações respeitam **Row Level Security (RLS)** — um usuário só vê ou modifica suas próprias linhas.

### 9.3 Status efetivo e expiração automática

O sistema **nunca depende exclusivamente do `status` armazenado** para decidir o que mostrar. Em vez disso, todas as leituras usam `getStatusEfetivo(tarefa)`:

```ts
if (tarefa.status === "Concluída") return "Concluída";
if (isExpirada(tarefa)) return "Passou do Prazo";
return tarefa.status;
```

Quando o app carrega, `TarefasContext.recarregar()` faz um sweep de fundo: tarefas que viraram expiradas desde a última visita são atualizadas no banco via `taskService.update`, mantendo a base limpa para consultas externas (como o cron de push).

### 9.4 Datas com timezone correto

Um bug crítico que existia até a Sessão 017 fazia o sistema "perder um dia" no cálculo de dias restantes. Causa: `new Date("YYYY-MM-DD")` é interpretado como UTC midnight, e no fuso de Brasília (UTC-3) caía no dia anterior.

A solução foi criar `parseDueDateLocal(due)` que parseia o string como data local no final do dia (`23:59:59.999`). Junto com `Math.round` em vez de `Math.ceil`, o cálculo passou a contar tanto o dia atual quanto o dia da entrega:

- Entrega hoje → 0 → "Último dia"
- Entrega amanhã → 1 → "Falta 1 dia"
- Entrega em 8 dias → 8 → "Faltam 8 dias"

### 9.5 Ordenação por buckets

A listagem de tarefas é ordenada por **buckets**, garantindo hierarquia visual estável:

1. Pendentes urgentes (prazo em até 3 dias)
2. Pendentes normais
3. Concluídas
4. Expiradas

Dentro de cada bucket, prazo mais próximo aparece primeiro; sem prazo, vai por data de criação.

### 9.6 Formulário de tarefa

O `TarefaForm` é um modal único usado em todos os contextos (criação direta, edição via card, criação rápida pela agenda). Oferece:

- Título obrigatório
- Disciplina (Select com emoji em cada opção)
- Status e prioridade
- Setor e origem
- Data de entrega (com `initialDueDate` para criação rápida)
- Progresso (slider 0–100)
- Observações e link externo
- Em modo edição: botão **Marcar como concluída/pendente**, botão **Excluir com dupla confirmação**
- Strings vazias são normalizadas para `null` antes do envio, evitando o erro 400 do Postgres em campos `date`

---

## 10. Sistema de agenda

A página Agenda oferece duas visões alternáveis via toggle no topo: **Semana** ou **Mês**.

### 10.1 Visão semanal

- Grade `grid-cols-7` exibindo Domingo a Sábado
- Cabeçalho com nome curto do dia + número grande + contador de tarefas
- Coluna "hoje" destacada com borda âmbar
- Mini-cards de tarefa com emoji da disciplina, título truncado, cor de fundo da disciplina (tonalidade 12%), dot de status e badge "!" para urgentes
- Estados visuais: concluída (opacity-60 + line-through), expirada (vermelho + line-through)

### 10.2 Visão mensal

- Grade 7×N com células dos dias e células vazias antes do dia 1
- Cada célula: número do dia, até 3 dots coloridos (cor da disciplina, vermelho se expirada, opaco se concluída), contador "+N" se exceder, emoji da primeira disciplina como mini-identidade do dia
- Pulso vermelho na borda quando houver tarefa expirada
- Ring âmbar no "hoje", destaque âmbar quando selecionado
- Painel lateral com mini-cards das tarefas do dia + botão "+" de criação rápida

### 10.3 Long-press para criação rápida

Em ambas as visões, **pressionar e segurar (450 ms)** em qualquer dia ou coluna abre o `TarefaForm` com a data já preenchida. O hook `useLongPress` foi escrito sob medida:

- Eventos `Pointer*` (cobre mouse, touch, caneta)
- Cancelamento automático se o ponteiro mover mais de 4px (evita disparar durante scroll)
- Vibração tátil de 15ms em dispositivos compatíveis

Também há um botão "+ Nova" tracejado abaixo das tarefas em cada coluna semanal — corrige o caso de o long-press não estar funcionando ou o usuário preferir o clique simples.

### 10.4 Navegação

- Botões de seta para semana/mês anterior e próximo
- Botão "Hoje" volta para a unidade atual da visão ativa
- Animação `fadeSlideIn` na troca de período (`key` reativo)

### 10.5 Performance

- Agrupamento de tarefas por `YYYY-MM-DD` via `useMemo` (lookup O(1) por dia)
- Re-render localizado por chave de período
- Mini-cards sem dependências pesadas

---

## 11. Sistema de notificações

### 11.1 Arquitetura

Três camadas trabalham juntas:

1. **Browser** — `Notification API` para exibir; `Permission` para autorizar
2. **Service Worker** (`/sw.js`) — recebe push em background, exibe notificação, trata clique
3. **Supabase Edge Function** (`send-notifications`) — consulta tarefas a vencer e envia push autenticado via VAPID

### 11.2 Service Worker v2

O `sw.js` (versão 2 da Sessão 024) oferece:

- Recepção de eventos `push` com parsing JSON tolerante a falhas
- Suporte ao campo `data.url` no payload → ao clicar, o app abre/navega para esse URL específico
- Listener `message` para notificações locais via `postMessage` (usado por `sendTest()` e `notifyTaskCreated()`)
- Vibração padrão `[120, 60, 120]` em mobile
- `requireInteraction` opcional para alertas críticos
- `client.navigate()` quando o app já está aberto
- `skipWaiting()` + `clients.claim()` no install/activate para atualizações imediatas

### 11.3 Push real com VAPID

Para receber notificações com o app/navegador fechado, o usuário se inscreve via `pushManager.subscribe()`. As chaves de inscrição (`endpoint`, `p256dh`, `auth`) são gravadas na tabela `push_subscriptions` com RLS.

A Edge Function `send-notifications` (Deno):
- Roda diariamente às 11h UTC (8h Brasília) via `pg_cron`
- Consulta tarefas a vencer em 1/2/3 dias do usuário (respeitando `notification_settings`)
- Assina cada push com a chave VAPID privada (`VAPID_PRIVATE_KEY` no Secret Manager)
- Envia para cada `endpoint` registrado

### 11.4 Notificações locais

Ao abrir o app, `NotificationChecker` em `App.tsx` executa `checkAndNotify`:

- 1x por dia (flag `notify_last_check` em localStorage)
- Notifica tarefas próximas do vencimento conforme preferências
- Notifica de forma agrupada tarefas já expiradas ("X tarefas com prazo encerrado")
- Ignora tarefas concluídas

Também há:

- `sendTest()` — botão de teste em Configurações
- `notifyTaskCreated(task, enabled)` — notificação local imediata ao criar tarefa (opt-in via `notify_on_create`)

### 11.5 Configurações reorganizadas

A aba Notificações foi reorganizada em 3 caixas:

1. **Status push** — banner verde se ativo, âmbar se inativo, com ícone grande, botão Ativar/Desativar e botão "Enviar notificação de teste"
2. **Quando avisar** — 4 toggles com descrição: 3 dias antes, 2 dias antes, 1 dia / no dia, ao criar tarefa
3. **Sons no app** — toggle para feedback sonoro de transições

### 11.6 Restrições conhecidas

- **iOS Safari** exige que o app seja **adicionado à Tela Inicial como PWA** para receber push em background. É restrição da Apple, não há contorno via código.
- Em desktop, o navegador precisa permanecer aberto (mesmo minimizado) para receber push em alguns sistemas — varia por SO.

---

## 12. Sistema de organização por disciplinas

### 12.1 Modelo

Tabela `subjects` no Postgres:

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid (FK auth.users) |
| `name` | text |
| `color` | text (default `#94a3b8`) |
| `emoji` | text nullable |
| `created_at` | timestamptz |

### 12.2 Contexto

`DisciplinasContext` centraliza o CRUD: `disciplinas`, `criar`, `atualizar`, `remover`, `buscarPorNome`, `recarregar`. Todos os componentes do app consomem desse contexto via `useDisciplinas()`, garantindo consistência.

### 12.3 Página Disciplinas

Catálogo visual em grade responsiva (1, 2, 3 ou 4 colunas conforme largura). Cada card mostra:

- Emoji grande dentro de uma "bolha" tonalizada na cor da disciplina
- Nome em destaque na cor da disciplina
- Contadores de Pendentes, Feitas e Vencidas
- Badge especial se houver tarefas urgentes
- Botões Editar e Remover (visíveis no hover desktop, sempre visíveis no mobile)
- Faixa colorida no topo do card

Clicar no card filtra automaticamente as tarefas dessa disciplina e navega para a página Tarefas.

### 12.4 Modal de criação/edição

- **Preview ao vivo** no topo: bolha do emoji + nome + cor escolhidos
- **Picker de emoji** com 50+ presets em grade scrollable, mais input para emoji personalizado
- **Paleta de 15 cores** em círculos com check visual
- **Sugestão automática** "Usar visual sugerido para X" quando o nome digitado bate com um preset conhecido (Matemática → laranja + livro, Educação Física → vermelho + bola etc.)
- **Validação**: nome único, mínimo 1 caracteres

### 12.5 Sugestões rápidas

Quando o usuário já tem algumas disciplinas mas há padrões não adicionados, a página exibe uma seção "Adicionar rapidamente" com pílulas para cada padrão restante. Um clique cadastra com emoji e cor pré-definidos.

### 12.6 Propagação em todo o app

A combinação emoji + cor da disciplina aparece em:

- Página Tarefas (chip da disciplina no `TarefaCard`)
- Formulário (Select com emoji em cada opção)
- Sidebar (seção "Por Disciplina")
- Agenda (mini-cards e dots no mês)
- Visão Geral (cards de disciplina e mini-cards de tarefa)

---

## 13. Sistema de progresso e desempenho

### 13.1 Visão Geral (Dashboard)

A página landing após o login. Dividida em seções:

**Cabeçalho** — saudação dinâmica baseada no horário ("Bom dia, [Primeiro nome]! 👋") + botão de criação rápida.

**Card Progresso da Semana** (lg:col-span-2) — ring SVG animado de 110px com percentual da semana, transição suave de 0.6s ao mudar valores. Ao lado: stats inline (Concluídas, Pendentes, Total da semana).

**Card Desempenho Geral** — barra horizontal com gradient âmbar mostrando a taxa de conclusão geral, mais 3 mini-stats (Feitas, Ativas, Expiradas). Inclui dica contextual quando o usuário ainda não criou nenhuma tarefa.

**Seção Próximos Prazos** (lg:col-span-2) — top 5 tarefas pendentes ordenadas por data, com emoji + cor + título + contagem de dias. Clique abre o `TarefaForm`.

**Seção Tarefas Expiradas** — top 5 tarefas vencidas com visual vermelho e line-through. Clique abre `TarefaForm` em modo edição.

**Seção Disciplinas** (lg:col-span-3) — grid 2/3/6 colunas com mini-cards das top 6 disciplinas por pendências. Clique filtra Tarefas pela disciplina.

### 13.2 Página Métricas

Análise estatística mais profunda:

- Total de tarefas, taxa de conclusão, prazo médio
- Distribuição por status (Não iniciada / Em Andamento / Concluída / Passou do Prazo)
- Distribuição por disciplina
- Distribuição por setor (Trabalho, Prova, Projeto etc.)
- Perfil analítico do estudante (5 insights automáticos baseados nos dados)

### 13.3 Sidebar

Em todas as páginas, a sidebar mostra um resumo permanente:

- 4 mini-cards: Total, Concluídas, Pendentes, Atrasadas
- Barra de progresso geral com percentual
- Filtros por status (clique aplica filtro na página Tarefas)
- Lista de disciplinas ativas com emoji + cor + contagem

---

## 14. Tecnologias utilizadas

### 14.1 Frontend

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | TypeScript | 5.6.3 |
| Framework | React | 19.x |
| Build | Vite | 7.x |
| Estilo | Tailwind CSS | 4.x (com `@tailwindcss/vite`) |
| Componentes | shadcn/ui (Radix-based) | — |
| Roteamento | Wouter | 3.x |
| Animação | Framer Motion + CSS keyframes | 12.x |
| Gráficos | Recharts | 2.x |
| Toasts | Sonner | 2.x |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| Ícones | lucide-react | — |

### 14.2 Backend e infraestrutura

| Camada | Tecnologia |
|---|---|
| Banco | Postgres (Supabase) com RLS ativo |
| Autenticação | Supabase Auth (email/senha + email de confirmação + recuperação) |
| Storage de avatar | Canvas base64 em coluna `profiles.avatar_url` (substitui Storage para evitar bucket extra) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Cron | `pg_cron` no Postgres |
| Push | Web Push API com VAPID (Edge Function como servidor de envio) |
| CI/CD | GitHub → Vercel (deploy automático no `main`) |
| PWA | Service Worker próprio + manifest + ícones (iOS/Android) |

### 14.3 Ambiente de desenvolvimento

| Ferramenta | Uso |
|---|---|
| Node.js | Runtime |
| npm + pnpm | Package manager (pnpm disponível, npm padrão) |
| TypeScript strict | `tsc --noEmit` antes do build |
| Vitest | Configurado para testes (suite inicial) |
| Prettier | Formatação |
| ESLint via tsc | Lint via type-check |
| Obsidian Git plugin | Sincronização de documentação (vault aponta para a raiz do repositório) |

---

## 15. Estrutura do código

A aplicação é uma SPA pura, organizada por **camadas de responsabilidade**:

### 15.1 Camadas

1. **Pages** (`client/src/pages/`) — telas completas, uma por rota lógica
2. **Components** (`client/src/components/`) — peças reutilizáveis (`TarefaCard`, `TarefaForm`, `DisciplinaModal`, `Sidebar`, `UserMenu` etc.)
3. **UI primitives** (`client/src/components/ui/`) — wrappers do shadcn/ui
4. **Contexts** (`client/src/contexts/`) — estado global por domínio (Auth, Tarefas, Disciplinas, Arquivos, Theme)
5. **Services** (`client/src/services/`) — cliente das APIs Supabase, organizado por domínio
6. **Lib** (`client/src/lib/`) — funções puras (helpers de datas, parser Excel, utils visuais)
7. **Hooks** (`client/src/hooks/`) — hooks específicos (`useMobile`, `useComposition`)
8. **Types** (`client/src/types/`) — interfaces TypeScript dos modelos

### 15.2 Princípios aplicados

- **Single Source of Truth** — cada modelo tem um único `Context`. Componentes não fazem fetch direto.
- **Side-effects isolados** — chamadas ao Supabase só nos `services`. Os contexts orquestram.
- **Helpers puros** — funções de cálculo em `lib/`, sem dependência de estado. Facilita teste.
- **Estilização declarativa** — Tailwind utility-first + CSS variables para temas. Cores neutras adaptam automaticamente entre claro e escuro via overrides em `index.css`.
- **Type safety** — interfaces compartilhadas entre serviços e contextos. `tsc --noEmit` no CI.

---

## 16. Organização das pastas

```
Tarefas-Escolares-app/
├── client/
│   ├── public/
│   │   ├── sw.js                       # Service Worker
│   │   ├── manifest.webmanifest        # PWA manifest
│   │   ├── favicon.ico
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   └── maskable-icon-512x512.png
│   └── src/
│       ├── App.tsx                     # Roteador + gates (welcome, onboarding)
│       ├── main.tsx                    # Entry point
│       ├── index.css                   # Temas + animações + overrides light/dark
│       ├── supabase/
│       │   └── client.ts               # Inicialização do SDK
│       ├── types/
│       │   ├── index.ts                # Tarefa, Materia, Perfil, NotificationSettings
│       │   └── database.ts             # Types gerados do Supabase
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   ├── TarefasContext.tsx
│       │   ├── DisciplinasContext.tsx
│       │   ├── ArquivosContext.tsx
│       │   └── ThemeContext.tsx
│       ├── services/
│       │   ├── authService.ts
│       │   ├── taskService.ts
│       │   ├── subjectService.ts
│       │   ├── profileService.ts
│       │   ├── settingsService.ts
│       │   ├── notificationService.ts
│       │   ├── importService.ts
│       │   └── soundService.ts
│       ├── lib/
│       │   ├── tarefasData.ts          # Helpers de status, datas, emojis, cores
│       │   ├── parseExcel.ts
│       │   └── utils.ts
│       ├── hooks/
│       │   ├── useMobile.tsx
│       │   └── useComposition.ts
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── TarefaCard.tsx
│       │   ├── TarefaForm.tsx
│       │   ├── DisciplinaModal.tsx
│       │   ├── UserMenu.tsx
│       │   ├── ImportarPlanilhaModal.tsx
│       │   ├── LimparTarefasModal.tsx
│       │   ├── HistoricoArquivos.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── ui/                     # shadcn primitives
│       └── pages/
│           ├── Welcome.tsx             # Pré-login (5 slides)
│           ├── Login.tsx
│           ├── ResetPassword.tsx
│           ├── Onboarding.tsx          # Pós-cadastro (3 passos)
│           ├── Home.tsx                # Shell autenticado
│           ├── VisaoGeral.tsx          # Dashboard
│           ├── Tarefas.tsx
│           ├── Disciplinas.tsx
│           ├── Agenda.tsx              # Semanal + mensal
│           ├── Metricas.tsx
│           ├── Arquivos.tsx
│           ├── Configuracoes.tsx
│           └── NotFound.tsx
├── supabase/
│   ├── migrations/                     # SQL versionado
│   │   ├── 001_initial.sql
│   │   ├── 002_push_subscriptions.sql
│   │   ├── 003_subjects_add_emoji.sql
│   │   ├── 004_profiles_add_onboarding_completed.sql
│   │   ├── 005_profiles_add_school_year.sql
│   │   └── 006_notification_settings_notify_on_create.sql
│   └── functions/
│       └── send-notifications/
│           └── index.ts                # Edge Function Deno (cron diário)
├── docs/
│   ├── ARQUITETURA.md
│   ├── AUDITORIA.md
│   ├── BANCO_DE_DADOS.md
│   ├── DEPLOY.md
│   └── ROADMAP.md
├── SESSIONS/
│   ├── 001-006.md
│   └── 008-016.md
├── CLAUDE.md                           # Instruções do assistente de IA
├── MEMORY.md                           # Memória oficial do projeto
├── MEMORY_CORE.md                      # Cérebro ativo
├── cloud.md                            # Etapas e sessões
├── CHANGELOG.md                        # Histórico de releases
├── BUGS.md                             # Bugs conhecidos e resolvidos
├── PROMPTS.md                          # Prompts validados
├── LINKS.md
├── README.md / README_PT.md
├── DOCUMENTACAO_PROJETO.md             # Este documento
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## 17. Fluxo do usuário dentro da plataforma

### 17.1 Primeiro acesso (anônimo)

1. Usuário acessa a URL
2. Sistema verifica `localStorage.tarefas_welcome_seen_v1`
3. Como é a primeira visita, exibe **Welcome** (5 slides)
4. Usuário navega ou pula → flag salva no localStorage
5. Cai na tela de **Login**

### 17.2 Cadastro

1. Usuário escolhe "Cadastre-se"
2. Preenche nome, e-mail, senha (mínimo 6 caracteres) e confirmação
3. Supabase Auth envia e-mail de confirmação
4. Trigger no Postgres cria automaticamente `profiles` e `notification_settings`
5. Usuário confirma e-mail e volta para login

### 17.3 Primeiro login

1. Após autenticar, o `OnboardingGate` checa `profiles.onboarding_completed`
2. Como é `false`, exibe **Onboarding** em 3 passos
3. Passo 1: nome + ano/série
4. Passo 2: seleção visual de disciplinas
5. Passo 3: revisão e "Começar a usar"
6. Disciplinas são criadas em paralelo, `school_year` é salvo, flag vira `true`
7. Usuário cai na **Visão Geral** (landing padrão)

### 17.4 Uso diário

1. Ao abrir o app, `NotificationChecker` roda em background e dispara alertas locais conforme preferências
2. Em background, `TarefasContext.recarregar()` atualiza no banco tarefas que viraram expiradas
3. Usuário vê seu **Dashboard** (Visão Geral) com saudação dinâmica, ring de progresso, próximos prazos e desempenho
4. Pode:
   - Criar tarefa rápida pelo botão "Nova tarefa" no topo
   - Clicar em "Próximos prazos" para ir à página completa de Tarefas
   - Clicar num card de disciplina para filtrar Tarefas por ela
   - Acessar Agenda para visão semanal ou mensal
   - Pressionar e segurar um dia da Agenda para criar tarefa naquele dia
   - Acessar Configurações para ajustar perfil, ano, idioma, tema, notificações

### 17.5 Logout

Pelo menu superior direito (UserMenu), o usuário desloga. A sessão é encerrada no Supabase e no localStorage. O fluxo volta para Login.

### 17.6 Recuperação de senha

1. Usuário clica em "Esqueceu sua senha?" na tela de login
2. Informa e-mail
3. Supabase envia link para `/reset-password`
4. Usuário define nova senha e volta para login

---

## 18. Experiência do usuário (UX/UI)

### 18.1 Princípios de design

**Clareza acima de tudo.** Cada elemento da tela responde "o quê" e "por que está aqui". Sem ruído visual; sem decoração sem função.

**Identidade visual consistente.** Toda tarefa tem emoji + cor da disciplina, em qualquer contexto. O olho aprende em segundos.

**Hierarquia coerente.** Pendentes urgentes sempre primeiro; concluídas e expiradas vão para baixo. Botões de ação primária sempre em âmbar; secundários em outline; destrutivos em vermelho.

**Feedback imediato.** Toda ação gera toast confirmatório ou de erro. Sons opcionais para concluir, adicionar e remover. Vibração tátil no long-press mobile.

**Acessibilidade básica.** `aria-label` em botões só com ícone, `aria-pressed` em toggles, `focus:ring-2 focus:ring-amber-500` em todos os interativos, `prefers-reduced-motion` respeitado.

### 18.2 Padrões de interação

| Padrão | Onde |
|---|---|
| Toast confirmatório verde / erro vermelho | Toda operação assíncrona |
| Dupla confirmação para destrutivas | Excluir tarefa, excluir disciplina, limpar todas |
| Long-press para criação rápida | Agenda (450ms) |
| Loading inline (spinner pequeno no botão) | Submits |
| Skeleton / spinner centralizado | Páginas carregando |
| Hover lift sutil (`hover:-translate-y-0.5`) | Cards de disciplina |
| Animação stagger (`animation-delay: ${index * 40}ms`) | Listas que entram juntas |
| Click outside fecha modal | Todos os modais |

### 18.3 Microanimações

- `fadeSlideIn` (0.3s) — entrada de cards e listas
- `scaleIn` (0.2s) — modais e onboarding
- Ring SVG do Dashboard com `strokeDashoffset` animado em 0.6s
- Botões com `transform: scale(0.97)` no `:active` para feedback tátil
- Botão "Active state" em scroll do mês com `bg-amber-500/20` para destacar dia selecionado

### 18.4 Tom de voz

Português brasileiro direto, sem jargão. Erros explicados de forma humana ("Email ou senha incorretos" em vez de "Invalid login credentials"). Empty states encorajadores ("Adicione sua primeira tarefa para começar"). Saudações dinâmicas pelo horário do dia.

---

## 19. Segurança e autenticação

### 19.1 Camadas de segurança

1. **Autenticação real** via Supabase Auth (email/senha com confirmação por e-mail). Tokens JWT assinados.
2. **Row Level Security (RLS)** ativo em **todas as 6 tabelas públicas**:
   - `profiles`, `subjects`, `tasks`, `imports`, `notification_settings`, `push_subscriptions`
   - Policies sempre `auth.uid() = user_id`
3. **Trigger `SECURITY DEFINER`** para criar `profiles` e `notification_settings` no signup, sem expor service-role key ao cliente
4. **Variáveis de ambiente** só com `anon key` no cliente; `service_role` apenas na Edge Function
5. **`.env.local` no `.gitignore`** — chaves nunca commitadas
6. **Vault de secrets do Supabase** — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` armazenados na Edge Function
7. **HTTPS forçado** pela Vercel
8. **Sessão persistente em localStorage** com refresh automático pelo SDK Supabase
9. **Bypass de Vercel auth público** — projeto configurado para acesso público sem prompt da Vercel

### 19.2 Política de dados

- Cada usuário só lê e escreve em suas próprias linhas (garantido por RLS)
- Avatar gravado como base64 em `profiles.avatar_url` (sem bucket Storage externo)
- Push subscription armazenada por usuário e endpoint (constraint `(user_id, endpoint)`)
- Histórico de importações registrado por usuário em `imports`

### 19.3 Tratamento de erros

- Toasts amigáveis para erros de rede e validação
- `ErrorBoundary` global no entrypoint para evitar tela branca em crash de componente
- Logs do Supabase acessíveis no painel para auditoria
- Hotfixes documentados em `BUGS.md` (BUG-001 a BUG-021)

---

## 20. Responsividade

### 20.1 Breakpoints

Tailwind padrão:

| Breakpoint | Largura | Tipo de dispositivo |
|---|---|---|
| (default) | < 640px | Mobile pequeno |
| `sm:` | ≥ 640px | Mobile grande / tablet pequeno |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Notebook |
| `xl:` | ≥ 1280px | Desktop |

### 20.2 Adaptações chave

**Sidebar:**
- Desktop: fixa à esquerda, 256px de largura
- Mobile: oculta por padrão, abre com botão "hambúrguer", overlay escuro de fundo

**Visão Geral:**
- 1 coluna no mobile
- 3 colunas no desktop com `lg:col-span-*` nos cards maiores

**Disciplinas:**
- 1, 2, 3 ou 4 colunas conforme tela

**Agenda semanal:**
- Mesmas 7 colunas em todas as telas, com `min-h-[260px]` no mobile e `min-h-[420px]` no desktop
- Cabeçalho de dia com fonte responsiva
- Mini-cards reduzidos no mobile (`text-[10px] sm:text-xs`)

**Agenda mensal:**
- 1 coluna mobile (calendário + painel embaixo)
- 3 colunas desktop (calendário 2/3 + painel 1/3)

**Modais:**
- Mobile: `items-end` (sobem do fundo)
- Desktop: `items-center` (no centro)

**Configurações:**
- Abas em linha (`flex-wrap`) no mobile
- Abas em coluna no desktop (`lg:flex-col`)

**TarefaForm:**
- Campos em 1 coluna no mobile, 2 colunas no desktop (`sm:grid-cols-2`)
- Botões inferiores escondem texto extra no mobile (apenas ícone)

### 20.3 Touch e gestos

- Long-press otimizado para touch (Pointer Events em vez de touch puro)
- `touch-none` em superfícies onde scroll competiria com long-press
- Botões com tamanho mínimo confortável (h-9 ou h-10) para dedos
- Hover states viram sempre visíveis no mobile (`opacity-100 sm:opacity-0 group-hover:opacity-100`)

---

## 21. Organização visual do projeto

### 21.1 Tema Academic Dark (padrão)

Inspirado em IDEs modernas e dashboards SaaS premium.

| Variável | Valor | Onde |
|---|---|---|
| `--bg-base` | `#0f1117` | Background do app |
| `--bg-surface` | `#13151f` | Sidebar e topbar |
| `--bg-card` | `#1a1d27` | Cards e modais |
| `--bg-card-hover` | `#1e2130` | Hover de cards |
| `--primary` | `oklch(0.769 0.188 70.08)` (âmbar) | Ações primárias |
| `--foreground` | `oklch(0.92 0.005 264)` (quase branco) | Texto base |
| `--border` | `oklch(1 0 0 / 8%)` | Bordas sutis |

### 21.2 Tema Academic Light

Pensado para uso diurno com alto contraste preservando a identidade âmbar.

| Variável | Valor |
|---|---|
| `--bg-base` | `#f0f3f8` |
| `--bg-surface` | `#e6eaf3` |
| `--bg-card` | `#ffffff` |
| `--bg-card-hover` | `#f5f7fc` |
| `--foreground` | `oklch(0.15 0.012 264)` (quase preto) |

### 21.3 Adaptação automática de cores neutras

Em vez de refatorar 30+ componentes que usam classes Tailwind como `text-slate-100`, `text-white`, `bg-white/5`, foi adicionado em `index.css` um bloco de overrides para o tema claro:

```css
html:not(.dark) .text-white     { color: #0f172a !important; }
html:not(.dark) .text-slate-100 { color: #0f172a !important; }
html:not(.dark) .text-slate-200 { color: #1e293b !important; }
html:not(.dark) .text-slate-300 { color: #334155 !important; }
html:not(.dark) .text-slate-400 { color: #475569 !important; }
html:not(.dark) .text-slate-500 { color: #64748b !important; }
html:not(.dark) .border-white\/8,
html:not(.dark) .border-white\/10 { border-color: rgba(15, 23, 42, 0.10) !important; }
html:not(.dark) .bg-white\/5    { background-color: rgba(15, 23, 42, 0.04) !important; }
```

Cores de identidade (âmbar, vermelho, verde, cores das disciplinas) são **preservadas em ambos os temas** — só os tons neutros adaptam.

### 21.4 Cores de status

| Status | Cor | Hex |
|---|---|---|
| Concluída | Verde | `#10b981` |
| Em Andamento | Âmbar | `#f59e0b` |
| Não iniciada | Cinza | `#94a3b8` |
| Passou do Prazo | Vermelho | `#ef4444` |
| Urgente (≤3 dias) | Vermelho | `#ef4444` |

### 21.5 Cores padrão de disciplinas

13 cores pré-definidas para disciplinas conhecidas (Matemática laranja, Banco de Dados verde, História lilás etc.) + paleta de 15 cores selecionáveis no modal de criação.

---

## 22. Diferenciais do sistema

### 22.1 Status efetivo computado em tempo real

A grande maioria dos gerenciadores de tarefa mantém status como dado puramente armazenado. O Tarefas Escolares **calcula em runtime** se uma tarefa expirou, sem depender de jobs assíncronos ou ações do usuário. Tarefas vencidas aparecem como expiradas **instantaneamente** ao próximo render.

### 22.2 Cálculo de datas com timezone correto

Há um bug clássico que afeta praticamente todo app web baseado em strings ISO: parsing de `"YYYY-MM-DD"` como UTC midnight. O Tarefas Escolares tem um helper dedicado `parseDueDateLocal` que normaliza para o fim do dia local, evitando perder 1 dia em fusos negativos. Esse cuidado se reflete em "Faltam 8 dias" em vez de "Faltam 7 dias" — pequena diferença que importa muito na hora de entregar.

### 22.3 Identidade visual por disciplina propagada

Emoji + cor da disciplina aparecem em todos os contextos. Não há "página de configuração da matéria que não reflete na lista". Cadastrou Matemática com `📘` laranja? Aparece em cards, formulário, sidebar, agenda e dashboard, sempre coerente.

### 22.4 Calendário com long-press

Recurso típico de apps mobile premium (Apple Reminders, Things, Motion): pressionar e segurar para criar. Implementado sem dependências extras, com cancelamento por movimento e vibração tátil.

### 22.5 Ordenação por buckets

Tarefas pendentes urgentes nunca se misturam com expiradas. A hierarquia é estável: urgentes → normais → concluídas → expiradas. Concluídas e expiradas vão automaticamente para baixo sem o usuário precisar configurar nada.

### 22.6 Notificações em duas camadas

Push real via Edge Function com VAPID (funciona com app fechado) + notificações locais ao abrir o app (cobre o caso de o usuário não ter ativado push). Sem perder lembrete.

### 22.7 Welcome pré-login

Diferencial competitivo: a primeira impressão é uma apresentação rápida e bonita. Não é só "tela de cadastro fria". O visitante entende o sistema em 30 segundos antes de criar conta.

### 22.8 Onboarding visual em vez de checklist

Em vez de um wizard com inputs, o onboarding usa **grade de cards selecionáveis** com emoji e cor. O estudante vê visualmente quais matérias está marcando — é mais rápido e mais agradável.

### 22.9 PWA com push real

Pode ser instalado em Android e iOS. Em iOS, mesmo com a restrição da Apple, funciona como app standalone com ícone na tela inicial.

### 22.10 Tema light/dark com cores neutras adaptativas

Sem precisar refatorar componente por componente, troca de tema funciona em todo o sistema graças à camada de overrides em `index.css`. Cores de identidade preservadas.

---

## 23. Ideias futuras para expansão

### 23.1 Curto prazo (próximas semanas)

- **i18n em runtime** — usar a estrutura já preparada (`profiles.language` + 3 idiomas no seletor) para traduzir efetivamente as strings da interface (pt-BR, en, es)
- **Otimização de bundle** — code-splitting via `manualChunks` no Vite para baixar o chunk principal abaixo de 500kB
- **Testes manuais ampliados em mobile real** — bateria de testes em iOS Safari (PWA), Chrome Android, Firefox Android
- **Drag-and-drop entre dias na Agenda** — arrastar mini-card de um dia para outro alterando `due_date`

### 23.2 Médio prazo

- **Tarefas recorrentes** — gerar automaticamente tarefas semanais ou mensais ("Aula de Matemática toda quarta")
- **Tags / labels customizáveis** — além de Setor e Origem, permitir tags livres
- **OCR de quadro-negro** — fotografar o quadro pelo celular e gerar tarefa automaticamente
- **Sugestão de prioridade via IA** — analisar histórico e título da tarefa para sugerir prioridade
- **Integração com Google Calendar / Microsoft Teams** — sincronização de eventos e tarefas

### 23.3 Longo prazo

- **Colaboração em grupo (sala de turma)** — compartilhar tarefas com colegas, lista de presença, atas de aula
- **Aplicativo nativo** (React Native ou expansão do PWA para iOS App Store / Play Store)
- **Recurring revenue / Plano Pro** — recursos premium (IA, storage maior, integrações)
- **API pública** para integração com sistemas educacionais (Moodle, Google Classroom, Microsoft Education)
- **Análise preditiva** — alertar "você costuma atrasar tarefas de Matemática 60% das vezes, comece com antecedência"
- **Modo offline completo** — service worker cacheando tudo + IndexedDB para escrever offline

### 23.4 Pequenos refinamentos pendentes

- Visão alternativa de Métricas com gráficos de Recharts mais ricos
- Atalhos de teclado para criar tarefa, mudar de página, marcar concluída
- Tema customizável (não só dark/light, mas escolha de cor primária)
- Exportação completa para PDF
- Modo concentração / Pomodoro integrado

---

## 24. Conclusão final

O **Tarefas Escolares** começou como um projeto de organização pessoal e cresceu, ao longo de **25 sessões de desenvolvimento estruturado** em pareamento com IA, para se tornar uma plataforma SaaS completa, em produção, com infraestrutura real, autenticação, sincronização entre dispositivos e arquitetura escalável. 

Mais do que um app de tarefa, o sistema entrega:

- Uma **central de produtividade estudantil** com dashboard, agenda e métricas
- **Identidade visual coerente** que respeita a forma como o estudante pensa em "matérias"
- **Confiabilidade técnica** com correção de bugs estruturais (timezone, expiração, ordenação) e cobertura de edge cases
- **Experiência premium** comparável a apps consagrados como Notion, Todoist ou TickTick — mas focada em rotina escolar
- **Base sólida para expansão** com código modular, type-safe, e documentação completa

O processo de desenvolvimento — registrado integralmente em `MEMORY.md`, `cloud.md`, `CHANGELOG.md`, `BUGS.md` e `PROMPTS.md` — também serve como **estudo de caso prático** sobre estruturação de projetos, refatoração de bugs críticos, pareamento humano-IA, organização de sessões e versionamento contínuo.

Cada uma das **15 etapas de desenvolvimento** trouxe uma camada nova:

- **Fase 0** estabeleceu a fundação técnica
- **Fases 1 e 2** consertaram o núcleo lógico e deram identidade visual
- **Fase 3** entregou um calendário de qualidade premium
- **Fases 4 e 5** completaram o sistema com dashboard e configurações limpas
- **Fase 6** poliu notificações e a primeira impressão
- **Fechamento** unificou ações de edição/exclusão em qualquer ponto do app
- **Hotfix** garantiu robustez na entrada de dados sem data

O resultado é um sistema **estável, em produção, com 6 migrações SQL aplicadas, push notifications funcionando via cron diário, PWA instalável, deploy contínuo na Vercel e código documentado linha a linha**.

Mais importante: é uma ferramenta que o usuário **realmente vai usar todo dia** — porque foi pensada para isso, não para impressionar com features. Cada decisão de design respondeu a uma dor concreta da rotina estudantil.

O projeto está oficialmente **finalizado na versão 2.1.0**. Pode evoluir conforme o uso real revele oportunidades, mas seu núcleo funcional, técnico e visual está completo, robusto e profissional.

---

## 25. Anexo — v3.0: Módulo de Mesada + Tutorial guiado (branch pessoal)

> Esta seção documenta trabalho posterior ao encerramento da v2.1.0 (seção 24). **Não faz parte da versão pública** — vive exclusivamente na branch `v3-mesada-pessoal` e não deve ser mesclada em `main`.

### 25.1 Módulo de Mesada por Desempenho (uso exclusivamente pessoal)

Sistema de recompensa financeira por desempenho escolar, digitalizando uma planilha manual que o usuário já usava. Lançamento mensal de conceito (MB/B/R/I) por matéria do boletim, com cálculo automático de valor acumulado, meta e alertas.

**Regras de negócio confirmadas com o usuário:**
- Tabela de conceito **única** para todas as matérias: MB = R$22, B = R$5, R = R$2, I = -R$5
- Limite de MB por período (padrão 5) **trava** o cálculo — a partir do 6º lançamento MB, o valor extra é contabilizado como B

**Modelo de dados:** três tabelas novas no Supabase (`mesada_config`, `mesada_materias`, `mesada_notas`), independentes de `subjects` (Disciplinas de tarefas), todas com RLS. Um campo opcional `subject_id` permite vincular visualmente a uma Disciplina existente sem forçar acoplamento.

**UI:** página `/mesada` (rota condicional) com 3 abas:
- **Lançamentos** — picker de conceito por matéria/mês, termômetro visual (🟢🟡🔴) baseado no histórico, resumo do mês
- **Acompanhamento** — ring de progresso da meta, gráfico de evolução mensal, **Grade do boletim** (tabela matéria × mês, réplica da planilha original do usuário), gráfico de distribuição de conceitos por matéria, cards de insight automáticos (matéria destaque / matéria de atenção)
- **Configurações da Mesada** — período, valores por conceito, limite, meta, CRUD de matérias do boletim (criação manual ou importação em lote das Disciplinas já cadastradas no app)

**Proteção contra vazamento para a versão pública (dupla camada):**
1. Tag `v2.1.0-publico` (commit `80adcd8`) — ponto de retorno seguro
2. Branch dedicada `v3-mesada-pessoal`
3. Feature flag `VITE_ENABLE_MESADA_MODULE` (default ausente/`false`) — mesmo que a branch seja mesclada por engano, o módulo continua invisível sem a env var setada explicitamente

**Extras:** lembrete de notificação local nos últimos dias do mês se faltar lançamento; virada de ano automática (matérias e configurações persistem entre anos, lançamentos resetam sozinhos por serem escopados por ano/mês, e a configuração de um ano novo herda os valores do ano anterior em vez de resetar para os defaults).

### 25.2 Tutorial guiado do app (recurso geral, não exclusivo da Mesada)

Diferente do módulo de Mesada, esse recurso **não é pessoal por natureza** — é um tutorial interativo explicando as funções do app inteiro, candidato a ser levado também para `main` no futuro, se o usuário decidir.

- **Efeito spotlight:** escurece toda a tela e recorta (destaca) só o elemento sendo explicado, via a técnica `box-shadow: 0 0 0 9999px rgba(0,0,0,.78)` aplicada a um elemento posicionado exatamente sobre o alvo
- **19 passos** cobrindo Visão Geral, Tarefas, Disciplinas, Agenda, Métricas, Mesada (se habilitada), Arquivos, Configurações e o menu do usuário, com navegação automática entre páginas conforme o passo
- Card de navegação (Anterior/Próximo/Pular, contador de passos) sempre posicionado dentro dos limites da janela — corrigido um bug em que o card podia renderizar fora da área visível em passos com o alvo perto do rodapé da tela
- Disparado manualmente pelo botão "Ver tutorial do app" em Configurações, ou oferecido automaticamente a usuários novos ao concluir/pular o onboarding pós-cadastro

### 25.3 Estado no encerramento desta etapa

Ambos os recursos foram implementados, com build validado (0 erros TypeScript) e commits salvos na branch `v3-mesada-pessoal`. Testes manuais na UI real (login, lançamentos, tutorial) ficam a cargo do usuário. Não há próximo passo definido — o usuário não tinha novas ideias no momento do encerramento desta etapa (2026-07-22). Um segundo projeto Vercel apontando para essa branch (com a env var ativada) é o caminho natural caso o usuário queira um link de acesso remoto pessoal no futuro.

---

**Documento gerado em:** 2026-05-29 · **Anexo v3.0 adicionado em:** 2026-07-22
**Versão do sistema documentada:** 2.1.0 (pública) + 3.0 (pessoal, anexo)
**Autoria do projeto:** Davi Gomes de Paula
**Pareamento técnico ao longo do desenvolvimento:** Claude (Anthropic) via Claude Code

---

> "Substituir cadernos e planilhas manuais por um painel digital unificado que centraliza tudo, alerta os prazos certos e mostra ao estudante exatamente como ele está evoluindo."
>
> — Objetivo registrado em `MEMORY.md`, seção 2
