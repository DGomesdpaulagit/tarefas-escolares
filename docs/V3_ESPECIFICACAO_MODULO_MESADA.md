# Tarefas Escolares v3.0 — Especificação do Módulo de Mesada por Desempenho

**Documento de planejamento para iniciar uma NOVA conversa.**
**Criado em:** 2026-05-30
**Branch dedicada:** `v3-mesada-pessoal` (já criada e pushada para o GitHub)
**Tag de segurança da versão pública:** `v2.1.0-publico` (aponta para o commit `80adcd8`, ponto de retorno seguro)

---

## ⚠️ REGRA FUNDAMENTAL — LER PRIMEIRO

**A versão 3.0 é de uso PESSOAL. A versão 2.1 (pública) NUNCA pode ganhar o módulo de Mesada.**

Motivo do usuário (registrado literalmente): *"não sei se os usuários vão ter mesada por matéria, então essa nova versão vai ser encaminhada só pra mim. [...] Se eu tiver a ideia de publicar, eu vou querer ele sem essa versão de notas/mesada."*

Isso significa que toda esta especificação parte de uma premissa não-negociável:

1. **`main`** permanece congelada como a versão pública (2.1.0), sem o módulo de Mesada. Bugfixes gerais (não relacionados à Mesada) podem continuar indo para `main` normalmente.
2. **`v3-mesada-pessoal`** é onde o módulo de Mesada é desenvolvido. Só o usuário usa essa branch/deploy.
3. **Dupla proteção técnica** (não basta separar por branch — precisa também de um feature flag, caso a branch seja mesclada por engano no futuro):
   - Variável de ambiente `VITE_ENABLE_MESADA_MODULE` (default: **ausente/false**)
   - Toda rota, item de sidebar, tabela consultada e componente do módulo de Mesada deve checar essa flag antes de renderizar ou buscar dados
   - Isso garante que, mesmo que `v3-mesada-pessoal` seja mesclada em `main` por engano, o módulo continua invisível a menos que a env var seja setada explicitamente no deploy pessoal

**A tag `v2.1.0-publico` é o ponto de retorno seguro.** Se algo der errado na v3, ou se o usuário decidir publicar, o deploy de produção pode sempre voltar a apontar para essa tag/branch `main`, sem qualquer risco de vazamento do módulo de Mesada.

---

## 1. Contexto do que já existe (v2.1.0)

O Tarefas Escolares v2.1.0 está documentado por completo em `DOCUMENTACAO_PROJETO.md` (raiz do projeto) e em `MEMORY.md`. Resumo rápido do que já existe e **não deve ser alterado** pela v3:

- Sistema de tarefas com status efetivo, expiração automática, datas corretas
- Catálogo de Disciplinas (nome + emoji + cor) — tabela `subjects`
- Agenda semanal e mensal com long-press
- Dashboard "Visão Geral"
- Configurações (Perfil, Acadêmico, Aparência, Notificações)
- Notificações push reais + Welcome pré-login + Onboarding pós-cadastro
- Stack: React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui + Supabase (Postgres + Auth + RLS + Edge Functions + pg_cron) + Vercel

**Importante:** a v3 deve **reaproveitar** a estrutura de Disciplinas já existente sempre que fizer sentido (ex: emoji e cor), mas o módulo de Mesada é conceitualmente **independente** — "matérias do boletim" não são necessariamente as mesmas "disciplinas de tarefas". Ver seção 4.

---

## 2. Fonte da metodologia (documento original do usuário)

O usuário forneceu um documento (`Métodologia de mesada.docx`) descrevendo um sistema manual de planilha. Transcrição do conteúdo extraído, preservada aqui para referência da próxima conversa:

> **Sistema de Mesada por Desempenho Escolar**
> Objetivo: Criar um sistema de recompensa financeira para estudante baseado no desempenho em cada matéria escolar, com valores diferenciados por tipo de conceito/nota.
>
> **1. Legenda de Conceitos e Valores**
> | Conceito | Valor | Descrição |
> |---|---|---|
> | MB (Muito Bom) | R$ 22,00 | Limite de 5 notas MB por período |
> | B (Bom) | R$ 5,00 | Bonificação padrão |
> | R (Regular) | R$ 2,00 | Recompensa menor |
> | I (Insuficiente) | -R$ 5,00 | Penalidade/desconto |
>
> **2. Lista de Matérias com Valores Base** — 13 matérias monitoradas:
> - Principais (R$ 22,00 cada): Português, Matemática, História, Geografia, Inglês
> - Complementares (R$ 5,00 cada): Arte, BND, Info Web, Filosofia, Física, Biologia
> - Valor menor (R$ 2,00): Sociologia
> - Com penalidade (-R$ 5,00): Química (exemplo de nota baixa)
>
> **3. Acompanhamento Mensal** — colunas de junho a dezembro (7 meses): registro do conceito por matéria/mês + cálculo automático do valor acumulado.
>
> **4. Regras Adicionais** — limite de 5 notas "MB" por período; meta total aparente R$ 150,00 (ou pontuação 110); critério de aproveitamento MB = 100%, B = 70%.
>
> **5. Cálculos Auxiliares** — valor médio por matéria ~R$ 21,43; total potencial R$ 137,00 (soma de todos os valores base).

### 2.1 Ambiguidade identificada — RESOLVER NA PRÓXIMA CONVERSA

O documento original mistura dois eixos que precisam ser esclarecidos com o usuário antes de implementar o cálculo:

- **Eixo A (conceito → valor fixo):** MB sempre vale R$22, B sempre R$5, R sempre R$2, I sempre -R$5, **independente da matéria**.
- **Eixo B (matéria → valor base):** cada matéria tem um "valor base" (Português R$22, Arte R$5, Sociologia R$2, Química -R$5) que parece ser só um **exemplo de um mês específico** já preenchido na planilha original (ou seja, a matéria em si não tem valor fixo — o valor vem do conceito obtido naquele mês).

**Hipótese mais provável** (a validar com o usuário na próxima conversa): o Eixo A é a regra real (tabela de conceito → valor, igual para todas as matérias), e o Eixo B era apenas o resultado daquele mês de exemplo mostrado no documento (Português tirou MB, Arte tirou B, Sociologia tirou R, Química tirou I — por isso os valores batem exatamente com a tabela de conceitos). Os "Cálculos Auxiliares" (R$137,00 de total potencial) reforçam essa hipótese, pois batem com a soma de: 5 matérias com MB (5×22=110) + 6 matérias com B (6×5=30) + 1 com R (1×2=2) − 1 com I (1×5=−5) = 137.

**Pergunta a fazer ao usuário na próxima conversa, antes de codar:**
> "Cada matéria tem um valor fixo por conceito (todas seguem a mesma tabela MB=R$22/B=R$5/R=R$2/I=-R$5), ou você quer que cada matéria tenha seu próprio valor base configurável (ex: Matemática vale mais que Sociologia mesmo tirando o mesmo conceito)?"

A especificação abaixo já contempla **ambos os cenários** como configuráveis, para não travar a implementação — mas a pergunta deve ser feita antes de fixar a lógica de cálculo definitiva.

---

## 3. Visão geral do módulo (v3.0)

**Nome do módulo:** "Mesada por Desempenho" (rota: `/mesada`, ícone de sidebar: `Wallet` ou `PiggyBank` do lucide-react)

**Objetivo:** Permitir ao usuário (só ele, via flag) registrar o conceito (MB/B/R/I) obtido em cada matéria a cada mês/período letivo, e visualizar automaticamente:

- Valor ganho no mês
- Valor acumulado no período/ano
- Progresso em relação à meta total
- Alertas (limite de MB atingido, tarefas com penalidade, etc.)
- Histórico visual mês aмês (gráfico de evolução)

---

## 4. Modelo de dados proposto

Duas opções de vínculo com o sistema de Disciplinas existente — **decidir na próxima conversa**:

**Opção A (recomendada): entidade independente `mesada_materias`**
Motivo: "matéria do boletim" pode não ser 1:1 com "disciplina de tarefas" (o boletim tem exatamente as matérias da grade curricular oficial; as Disciplinas do app são livres, o usuário pode ter cadastrado "Banco de Dados" como task-discipline sem isso aparecer no boletim escolar formal). Um campo opcional `subject_id` permite linkar visualmente (herdar emoji/cor) sem forçar acoplamento.

**Opção B: reaproveitar `subjects` direto**, adicionando `valor_base` e `categoria_mesada` nessa tabela.
Risco: polui o domínio de Disciplinas (usado pelo sistema de tarefas) com um conceito que só faz sentido pro boletim. Não recomendado, mas mais simples.

### 4.1 Tabelas novas (Opção A recomendada)

```sql
-- Configuração do módulo por usuário
CREATE TABLE mesada_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  ano_letivo integer NOT NULL,              -- ex: 2026
  mes_inicio integer NOT NULL DEFAULT 6,    -- 1-12 (ex: junho)
  mes_fim integer NOT NULL DEFAULT 12,      -- 1-12 (ex: dezembro)
  valor_mb numeric(10,2) NOT NULL DEFAULT 22.00,
  valor_b numeric(10,2) NOT NULL DEFAULT 5.00,
  valor_r numeric(10,2) NOT NULL DEFAULT 2.00,
  valor_i numeric(10,2) NOT NULL DEFAULT -5.00,
  limite_mb_por_periodo integer NOT NULL DEFAULT 5,
  meta_total numeric(10,2) NOT NULL DEFAULT 150.00,
  criterio_aproveitamento jsonb DEFAULT '{"MB": 100, "B": 70}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ano_letivo)
);

-- Matérias monitoradas no boletim (independente de `subjects`)
CREATE TABLE mesada_materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'complementar'
    CHECK (categoria IN ('principal', 'complementar', 'menor', 'outra')),
  valor_base numeric(10,2),               -- NULL = usa tabela de conceito padrão (Eixo A); preenchido = valor fixo da matéria (Eixo B)
  subject_id uuid REFERENCES subjects(id), -- opcional, herda emoji/cor da Disciplina existente
  emoji text,                              -- fallback se não linkado a subject_id
  cor text DEFAULT '#94a3b8',              -- fallback se não linkado a subject_id
  ativa boolean NOT NULL DEFAULT true,
  ordem integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lançamento mensal de conceito por matéria
CREATE TABLE mesada_notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  materia_id uuid NOT NULL REFERENCES mesada_materias(id) ON DELETE CASCADE,
  ano integer NOT NULL,
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  conceito text NOT NULL CHECK (conceito IN ('MB', 'B', 'R', 'I')),
  valor_calculado numeric(10,2) NOT NULL,  -- snapshot do valor no momento do lançamento (auditável mesmo se a config mudar depois)
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(materia_id, ano, mes)
);

-- RLS em todas as três (padrão do projeto: auth.uid() = user_id)
ALTER TABLE mesada_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesada_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesada_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_mesada_config" ON mesada_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mesada_materias" ON mesada_materias FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mesada_notas" ON mesada_notas FOR ALL USING (auth.uid() = user_id);
```

Essas migrations devem ser aplicadas **apenas quando a v3 estiver em desenvolvimento ativo** (via Supabase MCP na próxima conversa) — não há problema em elas existirem no banco mesmo que o deploy público não use, porque RLS já isola por usuário e a UI/rotas não vão expor nada sem a flag.

---

## 5. Cálculo de valores

### 5.1 Valor mensal por matéria

```
valor_calculado = 
  SE mesada_materias.valor_base IS NOT NULL
    ENTÃO mesada_materias.valor_base * multiplicador_conceito(conceito)
    SENÃO tabela_conceito[conceito]   -- valor_mb / valor_b / valor_r / valor_i da config
```

(O `multiplicador_conceito` só existe se confirmarmos o Eixo B — por ora, tratar como **não implementado até validar a hipótese da seção 2.1**. Recomenda-se **começar apenas com o Eixo A** — tabela de conceito fixa igual para todas as matérias — que é a hipótese mais provável, e adicionar o Eixo B depois se o usuário confirmar que precisa.)

### 5.2 Valor mensal total

```
valor_do_mes = SOMA(valor_calculado) de todas as mesada_notas do (ano, mes)
```

### 5.3 Valor acumulado

```
valor_acumulado = SOMA(valor_do_mes) de mes_inicio até o mês atual (ou até mes_fim)
```

### 5.4 Progresso da meta

```
progresso_percentual = (valor_acumulado / meta_total) * 100
```

### 5.5 Alerta de limite de MB

```
SE COUNT(notas com conceito = 'MB' no período) > limite_mb_por_periodo
  ENTÃO destacar visualmente (ex: badge "Limite de MB atingido")
```

Regra de negócio a confirmar: o limite de MB **trava o cálculo** (MB extra não conta, vira B?) ou é **só um alerta informativo** (conta normal, só avisa visualmente)? Documento original diz "Limite de 5 notas MB por período **para evitar excesso de bonificação**" — sugere que deveria travar, mas isso precisa confirmação explícita antes de implementar, porque é uma regra que afeta dinheiro de verdade.

---

## 6. Telas / UI do módulo

### 6.1 Nova entrada na Sidebar

Item "Mesada" (ícone `Wallet` ou `PiggyBank`), **renderizado somente se `import.meta.env.VITE_ENABLE_MESADA_MODULE === 'true'`**. Posição sugerida: entre "Métricas" e "Arquivos".

### 6.2 Página `/mesada` — três abas (padrão consistente com Configuracoes.tsx)

**Aba "Lançamentos"** (padrão)
- Seletor de mês/ano (dropdown ou navegação tipo Agenda)
- Lista de matérias ativas, cada uma com:
  - Emoji + nome + categoria (badge sutil)
  - Select de conceito (MB / B / R / I) — visual similar ao picker de emoji das Disciplinas (botões coloridos, não dropdown escondido)
  - Valor calculado exibido ao lado em tempo real
- Botão "Salvar lançamentos do mês"
- Resumo do mês no topo: valor total do mês + contador de MBs usados vs limite

**Aba "Acompanhamento"** (dashboard do módulo)
- Ring de progresso (reaproveitar o componente `RingProgress` já existente em `VisaoGeral.tsx`) mostrando `valor_acumulado / meta_total`
- Gráfico de evolução mensal (Recharts — já é dependência do projeto) — barra ou linha, valor por mês
- Cards de resumo: Valor acumulado, Meta, Faltam R$X, MBs usados/limite
- Lista de penalidades (conceito I) do período, se houver, com destaque vermelho (reaproveitar o padrão visual de "tarefa expirada")

**Aba "Configurações da Mesada"**
- Ano letivo, mês de início/fim
- Valores de MB/B/R/I (editáveis)
- Limite de MB por período
- Meta total
- Gerenciar matérias do boletim (adicionar/remover/reordenar/editar categoria e valor_base opcional) — reaproveitar visual do `DisciplinaModal` (emoji + cor) mas como modal próprio `MesadaMateriaModal`, já que a entidade é diferente

### 6.3 Reaproveitamento de componentes existentes

Para manter consistência visual com o resto do app (conforme já estabelecido nas Fases 1-6):

- `RingProgress` (de `VisaoGeral.tsx`) → progresso da meta
- Padrão de card (`bg-[var(--bg-card)] border border-white/8 rounded-2xl p-5`) → todos os cards do módulo
- Paleta de cores (`PALETA_DISCIPLINAS`) e emoji picker (`EMOJI_SUGERIDOS`) de `lib/tarefasData.ts` → modal de matéria
- Toast (sonner) para confirmações de salvamento
- Tema dark/light já herdado automaticamente (variáveis CSS)

---

## 7. Estratégia de deploy (v3 pessoal vs v2 pública)

### 7.1 Opção recomendada: mesmo projeto Vercel, branch diferente + env var

1. Criar um **segundo projeto Vercel** apontando para a branch `v3-mesada-pessoal` (Vercel permite múltiplos projetos do mesmo repo GitHub, cada um rastreando uma branch diferente)
   - Projeto público (já existe): rastreia `main`, sem a env var `VITE_ENABLE_MESADA_MODULE`
   - Projeto pessoal (novo): rastreia `v3-mesada-pessoal`, com `VITE_ENABLE_MESADA_MODULE=true` configurado nas env vars do próprio projeto Vercel
2. URLs diferentes (ex: `tarefas-escolares-five.vercel.app` continua público; novo projeto gera algo como `tarefas-escolares-pessoal.vercel.app`, ou o usuário pode renomear)
3. Mesmo banco Supabase para os dois (RLS já garante isolamento por usuário — não há problema técnico em compartilhar o banco)

### 7.2 Alternativa mais simples (mas com mais risco): mesmo projeto Vercel, trocar a branch de produção manualmente

Não recomendado como padrão — exigiria lembrar de trocar a branch de produção de volta para `main` antes de qualquer eventual publicação. A Opção 7.1 é mais segura porque nunca há necessidade de "lembrar de trocar" nada.

---

## 8. Ordem de implementação sugerida para a próxima conversa

1. **Confirmar com o usuário** a ambiguidade da seção 2.1 (Eixo A vs Eixo B) e a regra do limite de MB (trava ou só alerta) — sem isso, não iniciar o cálculo
2. Criar as migrations (`mesada_config`, `mesada_materias`, `mesada_notas`) com RLS, via Supabase MCP
3. Criar `mesadaService.ts` (services/) seguindo o padrão dos serviços existentes (`taskService.ts`, `subjectService.ts`)
4. Criar `MesadaContext.tsx` (contexts/) seguindo o padrão de `DisciplinasContext.tsx`
5. Implementar a flag `VITE_ENABLE_MESADA_MODULE` — adicionar ao `.env.local` e checar em `Sidebar.tsx` e `Home.tsx` antes de expor a rota
6. Construir a página `Mesada.tsx` com as 3 abas (Lançamentos, Acompanhamento, Configurações)
7. Construir `MesadaMateriaModal.tsx` (reaproveitando visual do `DisciplinaModal.tsx`)
8. Testar cálculos manualmente com os dados do exemplo do documento original (seção 2) para validar que a lógica bate com a planilha manual do usuário
9. Configurar o segundo projeto Vercel (seção 7.1) e validar que o módulo aparece lá e **não aparece** no projeto público
10. Documentar tudo em `cloud.md` / `MEMORY.md` / `CHANGELOG.md` seguindo o padrão de todas as sessões anteriores (ver `CLAUDE.md` na raiz — as regras de certificação continuam valendo)

---

## 9. O que NÃO fazer

- Não alterar nada da v2.1 pública além de bugfixes genéricos (não relacionados à Mesada) — e mesmo esses, avaliar se devem ir para `main` (public) e depois merge/cherry-pick para `v3-mesada-pessoal`, ou o inverso
- Não expor o módulo de Mesada sem a env var de flag, mesmo durante desenvolvimento (testar sempre com a flag setada localmente em `.env.local`, nunca hardcoded como `true` no código)
- Não misturar o conceito de "matéria do boletim" com "disciplina de tarefas" na mesma tabela (`subjects`) — manter entidades separadas conforme seção 4
- Não implementar o Eixo B (valor por matéria) até confirmar com o usuário que é isso que ele quer

---

## 10. Ideias adicionais mencionadas pelo usuário ("outras e outros adicionais que a gente pode inventar")

O usuário deixou em aberto a possibilidade de mais funcionalidades dentro do módulo de Mesada, a explorar/propor na próxima conversa:

- Histórico de anos letivos anteriores (comparar ano a ano)
- Exportar relatório de mesada em PDF/Excel (reaproveitar `xlsx` já usado em Arquivos)
- Notificação ao final do mês lembrando de lançar as notas (reaproveitar `notificationService`)
- Gráfico comparativo entre matérias (quais rendem mais, quais têm mais penalidade)
- Integração opcional: se uma tarefa de uma Disciplina está sempre atrasada, sugerir atenção àquela matéria no boletim (cruzamento de dados entre os dois módulos, totalmente opcional e não essencial)

Essas são sugestões abertas — não fazem parte do escopo mínimo viável, mas podem ser propostas como "Fase 2 da v3" após o módulo básico estar funcional.

---

## 11. Checklist de início da próxima conversa

Ao abrir a nova conversa, o usuário (ou o Claude) deve:

- [ ] Confirmar que está na branch `v3-mesada-pessoal` (`git status`)
- [ ] Ler este documento por completo
- [ ] Ler `DOCUMENTACAO_PROJETO.md` e `MEMORY.md` para relembrar o estado da v2.1
- [ ] Fazer as perguntas de esclarecimento da seção 2.1 e 5.5 ao usuário
- [ ] Só então começar a implementação seguindo a ordem da seção 8

---

**Este documento foi gerado ao final da v2.1.0, sessão de planejamento da v3.0, em 2026-05-30.**
**Autor do projeto:** Davi Gomes de Paula
**Planejamento técnico:** Claude (Anthropic) via Claude Code
