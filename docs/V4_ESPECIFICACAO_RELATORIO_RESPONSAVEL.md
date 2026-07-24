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
| R4 | Em **Configurações**, o usuário pode editar ou excluir o e-mail do responsável — mas **só efetiva após autorização confirmada por e-mail enviado ao responsável** |

---

## 2. Ponto de atenção antes de implementar (decisão do usuário necessária)

O requisito R4 protege bem contra o usuário **remover** o acompanhamento sem o responsável saber. Mas, do jeito que está descrito, o **cadastro inicial (R1) não tem verificação nenhuma** — o que abre dois problemas reais:

1. **Erro de digitação** manda relatórios com dados escolares de um estudante para um estranho, todo mês, sem que ninguém perceba.
2. Um endereço cadastrado errado **não pode ser corrigido**, porque a correção (R4) exige autorização enviada… para o endereço errado. O usuário fica preso.

**Correção proposta (recomendada, decidir na próxima conversa):** aplicar **double opt-in também no cadastro inicial**. O fluxo fica:

- Usuário digita o e-mail no onboarding → status `pendente`
- Um e-mail de confirmação vai para o responsável ("Fulano cadastrou você para receber relatórios mensais de acompanhamento escolar. Confirmar?")
- Só depois do clique de confirmação o status vira `ativo` e os relatórios começam a ser enviados
- Se não confirmar em 7 dias, o cadastro expira sozinho e o usuário pode tentar de novo (isso resolve o problema do e-mail errado)

Todo e-mail enviado ao responsável deve ter um link de **descadastro em 1 clique** — quem recebe precisa poder sair sem depender do estudante.

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

-- Tokens de ação (confirmar cadastro / autorizar alteração / descadastrar)
CREATE TABLE public.guardian_tokens (
  token       text PRIMARY KEY,          -- aleatório, alta entropia
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  acao        text NOT NULL
              CHECK (acao IN ('confirmar', 'autorizar_alteracao', 'descadastrar')),
  payload     jsonb,                     -- ex: { "novo_email": "..." } para alteração
  expira_em   timestamptz NOT NULL,      -- 7 dias para confirmar, 48h para alteração
  usado_em    timestamptz
);

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
- `guardians`: usuário só lê/escreve a linha onde `user_id = auth.uid()`
- `guardian_tokens`: **nenhum acesso pelo cliente** — só a Edge Function (service role) manipula. Token na mão do cliente derrota o propósito da autorização.
- `guardian_reports_log`: usuário pode ler o histórico do próprio responsável (transparência: ele vê o que foi enviado), sem poder escrever.

---

## 5. Arquitetura de envio

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

**Decisões a tomar logo no início:**
- [ ] Confirmar com o usuário se adota o double opt-in no cadastro inicial (seção 2) — recomendado
- [ ] Escolher o provedor de e-mail (seção 6) e o usuário gerar/configurar a API key como secret no Supabase

**Banco:**
- [ ] Migration `008_guardian_reports.sql` — tabelas `guardians`, `guardian_tokens`, `guardian_reports_log` + RLS nas três

**Backend:**
- [ ] Edge Function `enviar-relatorio-responsavel` — agregação dos dados + montagem do texto + envio + log (modelo: `send-notifications/index.ts`)
- [ ] Edge Function `guardian-action` — endpoint público que recebe `?token=...` e executa confirmar / autorizar alteração / descadastrar; valida expiração e uso único
- [ ] Agendamento no Supabase Cron: `0 8 25 * *`
- [ ] Template de e-mail HTML no visual Academic Dark (`#0f1117` / `#f59e0b`), responsivo, com link de descadastro no rodapé

**Frontend:**
- [ ] `guardianService.ts` — camada de serviço seguindo o padrão dos outros services
- [ ] Passo de cadastro do responsável no `Onboarding.tsx` — **sempre pulável**, com aviso claro de quais dados serão compartilhados
- [ ] Seção de gestão do responsável em `Configuracoes.tsx` — mostrar status (pendente/ativo), botões de editar e excluir, ambos disparando o fluxo de autorização
- [ ] Estado visual de "aguardando confirmação do responsável" enquanto o token não foi usado
- [ ] Página pública de retorno do token (confirmação/descadastro) — funciona sem login
- [ ] i18n: novas strings em pt-BR/en/es (interface + corpo dos e-mails)

**Fechamento:**
- [ ] Build 0 erros + teste real de envio para um e-mail de teste antes de considerar pronto
- [ ] Testar o fluxo completo: cadastrar → confirmar → receber relatório → tentar editar → autorizar → descadastrar
