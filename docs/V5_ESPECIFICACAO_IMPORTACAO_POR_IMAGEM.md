# Tarefas Escolares v5.0 — Especificação: Registro de Tarefas por Imagem (Análise por IA)

**Documento de planejamento para iniciar uma NOVA conversa.**
**Criado em:** 2026-07-23
**Status:** ✅ **IMPLEMENTADA na Sessão 031 (2026-07-24).** Documento mantido como referência de projeto. Decisões tomadas e o que saiu diferente do previsto: ver seção 8 (fora de escopo, inalterada) e a nova seção 9 no final.
**Ordem de execução:** esta é a **v5.0** — vem DEPOIS da v4.0 (relatório mensal para o responsável, ver `V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md`).

---

## 1. Pedido original do usuário (registrado literalmente)

> "Quero que vc coloque um recurso, que além de conseguir importar o arquivo, ou planilha do estudante, dê pra através de um print, ou imagem mostrando as tarefas que dá pra analisar, e tenha um sistema de alta análise muito bom, e registre a tarefa através de uma imagem, e recomendar o usuário a detalhar mais a tarefa se não estiver completa no detalhamento. Isso irá facilitar e deixar dinâmico pro usuário registrar suas tarefas escolares."

Resumo do pedido:
1. Usuário envia uma **foto ou print** (quadro de avisos, agenda escolar em papel, mensagem da escola, planner) em vez de só planilha Excel/CSV.
2. Um sistema de **análise de imagem por IA** identifica as tarefas contidas nela.
3. As tarefas identificadas são **registradas** no app (com revisão do usuário antes de confirmar, seguindo o padrão já usado na importação de planilha).
4. Se uma tarefa extraída da imagem estiver **incompleta** (sem data, sem disciplina, título vago demais), o sistema **recomenda ativamente que o usuário complete o detalhamento** antes de salvar.

---

## 2. O que já existe hoje (reaproveitar, não recriar)

- **`ImportarPlanilhaModal.tsx`** — fluxo de importação já testado: upload → parse → preview editável → confirmação → criação em lote via `TarefasContext`. **O fluxo de imagem deve seguir a mesma UX**, só troca a fonte de dados (imagem em vez de planilha) e adiciona a etapa de análise por IA no meio.
- **`parseExcel.ts`** — como referência de "parser troca dados brutos por candidatos a `Tarefa`", mas para imagem o parser é substituído por uma chamada de IA.
- **`TarefaForm.tsx`** — reaproveitar para a etapa de "detalhar mais" quando uma tarefa vier incompleta da análise.
- **Supabase Storage** — o projeto já usa Supabase; um novo bucket dedicado a imagens de tarefas segue o mesmo padrão de RLS já usado nas outras tabelas.
- **Edge Functions** — o projeto já tem Edge Functions (notificações push). A análise de imagem deve rodar em uma Edge Function nova, nunca no cliente (a chave de API do provedor de IA não pode vazar para o navegador).

---

## 3. Arquitetura proposta

```
Usuário tira foto/print
        │
        ▼
ImportarImagemModal.tsx (novo componente, espelha ImportarPlanilhaModal)
        │  upload da imagem
        ▼
Supabase Storage — bucket "task-images" (RLS: só o dono acessa)
        │  chama a Edge Function passando a URL assinada da imagem
        ▼
Edge Function nova: "analisar-imagem-tarefas"
        │  chama a API de visão de IA (ver seção 4 — decisão pendente)
        │  prompt estruturado pedindo JSON: [{ titulo, disciplina?, data?, prioridade?, confianca, camposFaltando[] }]
        ▼
Resposta volta pro modal como lista de "tarefas candidatas"
        │
        ▼
Tela de revisão (reaproveita visual do preview do ImportarPlanilhaModal):
  - Cada card mostra os campos identificados
  - Cards com camposFaltando não-vazio ganham um badge de alerta
    ("⚠️ Detalhe mais: falta data") e um botão "Completar antes de salvar"
    que abre o TarefaForm pré-preenchido com o que a IA já identificou
  - Cards completos podem ser confirmados direto, como na planilha
        │
        ▼
Confirmação → cria as tarefas via TarefasContext (mesmo caminho de sempre)
```

---

## 4. Decisão pendente — provedor de IA de visão

Isso **precisa ser decidido no início da próxima conversa**, porque muda a implementação da Edge Function e requer uma chave de API que só o usuário pode gerar e configurar (nunca deve ser colada em chat — configurar direto como secret da Edge Function no Supabase).

Opções:
- **Anthropic Claude (visão)** — modelos Claude atuais leem imagem nativamente. Requer `ANTHROPIC_API_KEY` como secret da Edge Function.
- **OpenAI GPT-4 Vision / GPT-4o** — alternativa amplamente usada, requer `OPENAI_API_KEY`.
- **Google Gemini (visão)** — alternativa com camada gratuita generosa, requer `GOOGLE_API_KEY`.

Recomendação: começar com Claude, já que o projeto inteiro é desenvolvido com Claude Code — mas a decisão final é do usuário, inclusive por causa de custo (a análise de imagem tem custo por chamada, diferente do parse local de planilha que é grátis).

**Custo é um ponto de atenção real:** ao contrário da importação de planilha (processada 100% no navegador, sem custo), cada imagem analisada vai gastar créditos de API. Vale definir um limite razoável (ex: máximo de N imports por dia) para evitar surpresa na fatura.

---

## 5. Regras de "recomendar detalhamento" (lógica central do pedido)

Uma tarefa extraída da imagem é considerada **incompleta** se:
- Não tiver `due_date` identificada com confiança razoável, OU
- O `title` extraído tiver menos de ~4 palavras e nenhuma outra informação de contexto (ex: só "Prova" sem matéria nem data), OU
- A `disciplina` não bater com nenhuma das disciplinas já cadastradas do usuário e a IA não tiver certeza de qual seria

Nesses casos:
- O card da tarefa candidata ganha um badge visual de alerta
- Um texto curto explica o que falta (ex: "Falta data de entrega", "Título muito genérico — adicione mais contexto")
- O botão de confirmação daquele card fica desabilitado até o usuário clicar em "Completar" e preencher o que falta no `TarefaForm`

---

## 6. Fora de escopo desta primeira versão (não implementar ainda)

- OCR para PDFs escaneados (a v5 cobre apenas imagens — jpg/png/heic — não PDF)
- Reconhecimento de letra cursiva manuscrita malfeita (o sistema deve indicar baixa confiança e pedir revisão manual, não tentar adivinhar)
- Importação em lote de múltiplas imagens de uma vez (a v5 cobre uma imagem por vez)

---

## 7. Checklist de implementação (para a próxima conversa)

- [ ] Decisão do provedor de IA de visão (seção 4) — perguntar ao usuário no início da conversa
- [ ] Bucket `task-images` no Supabase Storage + política RLS (usuário só acessa/deleta suas próprias imagens)
- [ ] Edge Function `analisar-imagem-tarefas` — recebe URL da imagem, chama a API de visão, retorna JSON estruturado de tarefas candidatas + campos faltando
- [ ] Secret da API key configurado no Supabase (nunca no cliente, nunca em `.env` versionado)
- [ ] `ImportarImagemModal.tsx` — upload de imagem (captura de câmera em mobile via `<input capture>`, ou seleção de arquivo), chamada da Edge Function, estado de loading durante análise
- [ ] Tela de revisão das tarefas candidatas com badges de "detalhamento incompleto"
- [ ] Integração do botão "Completar" com `TarefaForm.tsx` pré-preenchido
- [ ] Botão "Importar por foto" em `Arquivos.tsx`, ao lado do botão já existente de importar planilha
- [ ] Limite de uso diário (proteção de custo) — a definir com o usuário
- [ ] i18n: novas strings em pt-BR/en/es seguindo o padrão já estabelecido no resto do app
- [ ] Build 0 erros + testes manuais com fotos reais de quadro/agenda antes de considerar pronto

---

## 9. Como foi implementada (Sessão 031, 2026-07-24)

**Decisões do usuário no início da conversa:** provedor **Anthropic Claude** (modelo `claude-sonnet-5`) e limite diário de **5 análises por usuário**.

**Banco** — migration `009_task_images`: bucket privado `task-images` no Storage (RLS por pasta `{user_id}/...`, igual ao padrão de `avatars`) + tabela `image_analysis_usage` (um registro por *tentativa* de análise, não por importação confirmada — é isso que sustenta o limite de custo, já que o gasto acontece na chamada à API, não na confirmação da tarefa). RLS: leitura própria (a UI mostra "N análises restantes hoje"), escrita só via service role.

**Edge Function `analisar-imagem-tarefas`:**
- Checa o limite diário (janela rolante de 24h) **antes** de gastar qualquer coisa
- Baixa a imagem do Storage com service role, converte para base64, monta um prompt em português pedindo um array JSON estrito (`title`, `subject_name`, `due_date`, `priority`, `confidence`), incluindo a data de hoje (para resolver "amanhã"/"sexta-feira") e a lista de disciplinas já cadastradas do usuário (para a IA preferir esses nomes exatos)
- **A regra de "detalhamento incompleto" (seção 5) é aplicada de forma determinística na função**, não delegada à opinião livre do modelo — a confiança que a IA declara é só um dado a mais, não decide sozinha o que fica incompleto
- Cada tentativa é registrada em `image_analysis_usage` (sucesso ou falha) — inclusive quando a resposta da IA não é um JSON válido

**Frontend:**
- `imageImportService.ts` — upload para o Storage, chamada da Edge Function, e **apaga a imagem do Storage logo depois da análise** (o app não precisa guardar a foto original depois de extrair as tarefas dela — nem a spec original pedia retenção)
- `ImportarImagemModal.tsx` — mesmo padrão visual do `ImportarPlanilhaModal`, com `<input accept="image/*" capture="environment">` (abre a câmera no celular, seletor de arquivo no desktop). Cards com badge verde (pronta) ou âmbar (falta detalhar); botão único "Importar prontas" para as completas, botão "Completar" por card nas incompletas
- `TarefaForm.tsx` ganhou dois pontos de extensão: prop `initial` (pré-preenche título/disciplina/data/prioridade na criação) e prop `onSalvou` (chamada só quando uma tarefa NOVA é criada com sucesso — usada para tirar aquele candidato da lista pendente do modal sem depender de inferir "salvou vs. cancelou" a partir do `onClose`, que é chamado nos dois casos)
- Botão "Importar por foto" ao lado do "Importar" (planilha) em `Tarefas.tsx`

**Diferença do plano original:** a especificação não detalhava o que fazer com a imagem depois da análise. Decisão tomada na implementação: apagar sempre, sucesso ou erro — é o comportamento mais simples e mais respeitoso com o dado (fotos de agenda/quadro de avisos podem conter nome de outros alunos, endereço da escola etc.).

**Pendência do usuário:** gerar a `ANTHROPIC_API_KEY` no [console da Anthropic](https://console.anthropic.com) e configurar como secret no painel do Supabase. Sem ela a função responde `chave_ia_nao_configurada` e nenhuma chamada paga é feita.
