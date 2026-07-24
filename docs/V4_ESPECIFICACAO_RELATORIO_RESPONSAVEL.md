# Tarefas Escolares v4.0 — Especificação: Relatório Mensal para o Responsável

**Documento de planejamento para iniciar uma NOVA conversa.**
**Criado em:** 2026-07-23
**Status:** Planejado, nenhum código implementado ainda.
**Ordem de execução:** esta é a **v4.0** — vem ANTES da v5.0 (registro por imagem, ver `V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md`).

---

## 1. Pedido original do usuário (registrado literalmente)

> "Artigo mensal de acompanhamento do usuário para o responsável cadastrado, ao usuário entrar pela primeira vez, vai poder colocar o e-mail do responsável para receber esses artigos. Em configurações o usuário conseguirá editar ou excluir o e-mail do responsável só com uma autorização enviada para o e-mail do responsável. Os artigos que falam sobre o desenvolvimento do usuário e o acompanhamento das tarefas do mesmo serão mandados mensalmente, todo dia 25, comentando sobre quantas atividades teve naquele mês, quantas fez, quantas deixou de fazer e quantas ainda tem que fazer, quantas tem no total etc..."

Resumo em requisitos:

| # | Requisito |
|---|---|
| R1 | No **onboarding** (primeiro acesso), o usuário pode cadastrar o e-mail de um responsável |
| R2 | Todo **dia 25**, um relatório do mês é enviado automaticamente para esse e-mail |
| R3 | O relatório traz: total de tarefas do mês, quantas foram concluídas, quantas expiraram sem conclusão, quantas ainda estão pendentes, e o total geral |
| R4 | As **três** operações sobre o e-mail do responsável — **cadastrar** (quando ainda não existe), **editar** e **excluir** — só efetivam após verificação por **código enviado ao e-mail do responsável** |

---

## 2. Verificação por código — DECIDIDO (Sessão 029, 2026-07-23)

Ponto levantado na sessão anterior: se só editar/excluir exigissem verificação, um e-mail digitado errado no cadastro mandaria dados escolares para um estranho todo mês, **sem possibilidade de correção** (corrigir exigiria autorização enviada justamente ao endereço errado).

**Decisão do usuário:** aplicar verificação nas três operações — **cadastrar, editar e excluir**. Confirmado literalmente: *"pode deixar pra cadastrar também, ent cadastrar (se não tiver) - editar - excluir. [...] Ao usuário cadastrar será enviado um código para este e-mail do responsável permitindo cadastrar. Após isso é fé, todos os dias 25 será enviado este artigo."*

**Mecanismo: código, não link.** O e-mail enviado ao responsável contém um **código numérico** que o estudante digita dentro do app para efetivar a operação. Isso é melhor que um link clicável neste caso, porque o código só chega às mãos do estudante se o responsável **repassar ativamente** — ou seja, o repasse do código *é* o ato de consentimento. Um link clicável seria confirmado pelo próprio responsável, o que também funciona, mas exigiria uma página pública de retorno; o código mantém tudo dentro do app e o fluxo mais simples.

### Fluxo das três operações

| Operação | Pré-condição | Para onde vai o código | Efeito ao validar |
|---|---|---|---|
| **Cadastrar** | Nenhum responsável cadastrado | Para o e-mail **novo** que está sendo cadastrado | `status` vira `ativo`, relatórios começam |
| **Editar** | Já existe um responsável `ativo` | Para o e-mail **atual** (é ele quem autoriza a troca) | E-mail é substituído pelo novo, `status` segue `ativo` |
| **Excluir** | Já existe um responsável `ativo` | Para o e-mail **atual** | Registro vira `removido`, relatórios param |

**Regras do código:**
- 6 dígitos numéricos, gerados aleatoriamente (nunca sequenciais ou derivados de dados do usuário)
- Validade de **30 minutos**
- Uso único — invalidado assim que usado
- Máximo de **5 tentativas** de digitação por código; ao estourar, invalida e obriga a pedir outro
- Limite de reenvio: no máximo 1 código a cada 60 segundos por usuário (evita usar o app como ferramenta de spam contra um terceiro)
- **Nunca armazenar o código em texto puro** no banco — guardar apenas o hash, comparar na validação

**Depois do cadastro confirmado, é automático** ("após isso é fé"): todo dia 25 o relatório sai sozinho, sem nenhuma ação do usuário ou do responsável.

**Descadastro pelo próprio responsável:** todo relatório enviado deve trazer, no rodapé, um link de saída em 1 clique. Quem recebe precisa poder parar de receber sem depender do estudante — isso não conflita com o fluxo de código acima, é uma via de saída independente para quem está do outro lado.

---

## 3. O que já existe hoje (reaproveitar, não recriar)

- **Edge Function `send-notifications`** (`supabase/functions/send-notifications/index.ts`) — já existe uma função Deno agendada que roda diariamente e envia Web Push. **É o modelo a seguir** para a função nova de relatório: mesma estrutura de `createClient` com service role key, mesmas variáveis de ambiente, mesmo padrão de agendamento.
- **Tabela `profiles`** — já guarda dados do usuário (`name`, `school_year`, `language`, `onboarding_completed`). O e-mail do responsável **não deve** ir aqui: merece tabela própria, por causa dos estados de verificação (ver seção 4).
- **`Onboarding.tsx`** — já tem fluxo de 3 passos pós-cadastro. O cadastro do responsável entra como um passo novo (ou sub-etapa do passo 1), **sempre pulável** — ninguém deve ser obrigado a cadastrar um responsável pra usar o app.
- **`Configuracoes.tsx`** — já tem as abas Perfil/Acadêmico/Aparência/Notificações. A gestão do responsável entra na aba **Perfil** ou numa aba nova "Responsável".
- **`getStatusEfetivo()`** (`lib/tarefasData.ts`) — **usar obrigatoriamente** para classificar as tarefas do relatório. É a mesma lógica que a UI usa (concluída / pendente / passou do prazo). Recalcular isso na Edge Function com regra própria vai gerar números que não batem com o que o usuário vê na tela.
- **i18n** — o relatório deve respeitar `profiles.language` (pt-BR/en/es), seguindo o padrão já estabelecido.

---

## 4. Modelo de dados proposto

Migration nova: `008_guardian_reports.sql`

```sql
CREATE TABLE public.guardians (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  nome          text,                    -- opcional, só pra personalizar o e-mail
  status        text NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'ativo', 'removido')),
  criado_em     timestamptz NOT NULL DEFAULT now(),
  confirmado_em timestamptz,
  UNIQUE (user_id)                       -- 1 responsável por usuário nesta versão
);

-- Códigos de verificação (cadastrar / editar / excluir)
CREATE TABLE public.guardian_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE CASCADE,  -- null no cadastro inicial
  codigo_hash text NOT NULL,             -- HASH do código de 6 dígitos, NUNCA o código em texto puro
  acao        text NOT NULL
              CHECK (acao IN ('cadastrar', 'editar', 'excluir')),
  payload     jsonb,                     -- ex: { "email": "..." } no cadastro/edição
  tentativas  smallint NOT NULL DEFAULT 0,   -- invalida ao chegar em 5
  expira_em   timestamptz NOT NULL,      -- now() + 30 minutos
  usado_em    timestamptz,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Índice para o rate limit de reenvio (1 código por minuto por usuário)
CREATE INDEX idx_guardian_codes_rate_limit
  ON public.guardian_codes (user_id, criado_em DESC);

-- Histórico de envios (evita envio duplicado e serve de auditoria)
CREATE TABLE public.guardian_reports_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  referencia  text NOT NULL,             -- "2026-07" (ano-mês do relatório)
  enviado_em  timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL,             -- 'enviado' | 'falhou'
  erro        text,
  UNIQUE (guardian_id, referencia)       -- garante 1 relatório por mês por responsável
);
```

**RLS obrigatório em todas as três tabelas**, seguindo o padrão do resto do projeto:
- `guardians`: usuário lê a linha onde `user_id = auth.uid()`, mas **não escreve direto** — toda escrita passa pela Edge Function que valida o código. Se o cliente pudesse dar `UPDATE` na tabela, bastaria chamar o Supabase direto pelo console do navegador para trocar o e-mail sem código nenhum.
- `guardian_codes`: **nenhum acesso pelo cliente, nem leitura** — só a Edge Function (service role) manipula. Se o cliente conseguisse ler essa tabela, leria o próprio código que deveria vir do responsável, e a verificação inteira viraria teatro. (Mesmo com hash: o cliente saberia da existência e poderia tentar quebrar offline.)
- `guardian_reports_log`: usuário pode ler o histórico do próprio responsável (transparência: ele vê o que foi enviado), sem poder escrever.

---

## 5. Arquitetura de envio do relatório mensal

*(O fluxo de verificação por código está na seção 2; esta seção cobre o envio automático do dia 25, que roda sem nenhuma interação.)*

```
pg_cron (todo dia 25, ~08:00)
        │
        ▼
Edge Function nova: "enviar-relatorio-responsavel"
        │
        │ 1. SELECT guardians WHERE status = 'ativo'
        │ 2. Para cada um, pula se já existe log com referencia = mês atual
        │ 3. Busca as tasks do usuário no período do mês
        │ 4. Classifica com a MESMA lógica de getStatusEfetivo()
        │ 5. Monta o texto do relatório no idioma do profiles.language
        │ 6. Envia via provedor de e-mail (ver seção 6)
        │ 7. Grava em guardian_reports_log (enviado | falhou + erro)
        ▼
Responsável recebe o e-mail
```

**Agendamento:** o projeto já usa Supabase Cron para `send-notifications`. Aqui a expressão é `0 8 25 * *` (dia 25 de todo mês, 08:00 UTC — ajustar o horário considerando que o servidor roda em UTC e o usuário está em UTC-3).

**Idempotência é crítica:** o `UNIQUE (guardian_id, referencia)` no log é o que impede o responsável de receber 5 e-mails iguais se o cron rodar mais de uma vez ou a função for reexecutada. Checar o log ANTES de enviar, gravar DEPOIS.

---

## 6. Decisão pendente — provedor de e-mail

Precisa ser decidido no início da próxima conversa, porque exige uma API key que **só o usuário pode gerar e configurar** (como secret da Edge Function no Supabase — nunca colada em chat, nunca em arquivo versionado).

Opções:
- **Resend** — a mais simples de integrar em Edge Function Deno, camada gratuita de 3.000 e-mails/mês. Recomendada.
- **SendGrid** — mais tradicional, camada gratuita menor.
- **SMTP próprio (Gmail)** — funciona, mas Gmail bloqueia envio automatizado com frequência e a entregabilidade é ruim. Não recomendado.

Qualquer que seja: o domínio remetente precisa estar verificado no provedor, senão o relatório cai direto em spam — o que na prática significa que o recurso não funciona.

---

## 7. Conteúdo do relatório

Dados a calcular para o mês de referência (do dia 1 até o dia do envio):

| Métrica | Como calcular |
|---|---|
| Total de tarefas do mês | tasks com `due_date` dentro do mês |
| Concluídas | `getStatusEfetivo() === "Concluída"` |
| Não feitas (expiraram) | `getStatusEfetivo() === "Passou do Prazo"` |
| Ainda pendentes | nem concluída nem expirada |
| Taxa de conclusão | concluídas ÷ total do mês |
| Total geral (histórico) | todas as tasks do usuário, sem filtro de mês |
| Comparação com o mês anterior | taxa deste mês vs. taxa do mês passado (↑ melhorou / ↓ caiu / = estável) |
| Disciplina com melhor desempenho | maior taxa de conclusão no mês |
| Disciplina que precisa de atenção | maior número de expiradas no mês |

**Tom do texto:** o pedido fala em "artigo… sobre o desenvolvimento do usuário". Deve ser um texto corrido, curto e informativo — não um dump de números. Algo como *"Em julho, Davi teve 18 tarefas. Concluiu 15 (83%), uma melhora em relação a junho (71%). Três passaram do prazo, todas de Banco de Dados — pode valer uma conversa sobre essa matéria."*

**Não incluir:** títulos ou conteúdo das tarefas em si, anotações pessoais, links. O relatório é sobre **desempenho agregado**, não vigilância do conteúdo. Só números e tendências.

---

## 8. Fora de escopo desta primeira versão

- Múltiplos responsáveis por usuário (o schema já tem `UNIQUE (user_id)`; remover essa constraint no futuro se necessário)
- Relatório em PDF anexado (v4 manda e-mail HTML simples)
- Painel web para o responsável acompanhar em tempo real (v4 é só e-mail passivo)
- Frequência configurável (v4 é fixo no dia 25; semanal/trimestral fica para depois)

---

## 9. Checklist de implementação (para a próxima conversa)

**Única decisão pendente (adiada pelo usuário na Sessão 029 — resolver no início da v4):**
- [ ] Escolher o provedor de e-mail (seção 6, Resend recomendado) e o usuário gerar/configurar a API key como secret no Supabase — nunca colada em chat, nunca em arquivo versionado

*(A verificação por código nas três operações já está decidida — ver seção 2.)*

**Banco:**
- [ ] Migration `008_guardian_reports.sql` — tabelas `guardians`, `guardian_codes`, `guardian_reports_log` + RLS nas três (atenção à seção 4: cliente não escreve em `guardians` e não acessa `guardian_codes` de forma alguma)

**Backend (Edge Functions):**
- [ ] `guardian-request-code` — recebe a ação (`cadastrar`/`editar`/`excluir`) + e-mail quando aplicável; valida rate limit de 60s; gera código de 6 dígitos; grava só o hash; envia o e-mail ao responsável
- [ ] `guardian-verify-code` — recebe o código digitado; valida expiração, uso único e limite de 5 tentativas; executa a operação em `guardians`
- [ ] `enviar-relatorio-responsavel` — agregação dos dados + montagem do texto + envio + log (modelo: `send-notifications/index.ts`)
- [ ] `guardian-unsubscribe` — endpoint público do link de saída no rodapé do relatório (funciona sem login, é o responsável clicando)
- [ ] Agendamento no Supabase Cron: `0 8 25 * *`
- [ ] Templates de e-mail HTML no visual Academic Dark (`#0f1117` / `#f59e0b`), responsivos: um para o código de verificação, um para o relatório mensal (este com o link de descadastro no rodapé)

**Frontend:**
- [ ] `guardianService.ts` — camada de serviço seguindo o padrão dos outros services
- [ ] Componente de entrada de código de 6 dígitos, reaproveitável nas três operações
- [ ] Passo de cadastro do responsável no `Onboarding.tsx` — **sempre pulável**, com aviso claro de quais dados serão compartilhados
- [ ] Seção de gestão do responsável em `Configuracoes.tsx` — status atual + botões Cadastrar (se não houver) / Editar / Excluir, os três abrindo o fluxo de código
- [ ] Estado visual de "aguardando código" com contador de expiração e botão de reenvio (desabilitado por 60s)
- [ ] Tratamento claro dos erros: código expirado, código errado, tentativas esgotadas, reenvio cedo demais
- [ ] i18n: novas strings em pt-BR/en/es (interface + corpo dos dois e-mails)

**Fechamento:**
- [ ] Build 0 erros + teste real de envio para um e-mail de teste antes de considerar pronto
- [ ] Testar os 3 fluxos ponta a ponta: cadastrar → código → ativo; editar → código no e-mail antigo → troca; excluir → código → parado
- [ ] Testar os caminhos de erro: código expirado, 5 tentativas erradas, reenvio antes dos 60s
- [ ] Testar o descadastro pelo próprio responsável via link do rodapé
