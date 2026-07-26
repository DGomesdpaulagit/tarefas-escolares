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

---

## 10. Troca de provedor: Anthropic → Google Gemini (Sessão 032, 2026-07-24)

O usuário decidiu não pagar pela API da Anthropic para uso pessoal ("não tenho orçamento para isso"). Como o app hoje é usado só por ele (volume baixo — o teto de 5 análises/dia já limita isso), o **Google Gemini** cobre o caso sem custo: camada gratuita real via Google AI Studio, sem cartão de crédito, com modelo `gemini-2.5-flash` (multimodal, lê imagem) e limite de 1.500 requisições/dia — bem acima do necessário.

**O que mudou no código** (`supabase/functions/analisar-imagem-tarefas/index.ts`):
- Secret trocado de `ANTHROPIC_API_KEY` para `GOOGLE_API_KEY`
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, autenticado via header `x-goog-api-key`
- Formato do request/response é diferente do Anthropic Messages API (`contents[].parts[]` com `inline_data` para a imagem, em vez de `messages[].content[]` com `source`); a extração do texto da resposta mudou de `content[0].text` para `candidates[0].content.parts[0].text`
- O prompt, a lógica de "detalhamento incompleto" (determinística, seção 5) e todo o resto do pipeline (limite diário, apagar a foto após análise) **não mudaram** — só a chamada ao provedor de IA foi trocada

**Ponto de transparência para o usuário saber:** na camada **gratuita** do Google AI Studio, os prompts enviados podem ser usados pelo Google para melhorar os produtos deles — diferente da API paga, que não faz isso. Como as fotos analisadas passam por lá antes de serem apagadas do nosso Storage, isso é uma característica real do modelo gratuito, não um bug. Se algum dia o app for publicado e o volume justificar, vale reavaliar (ver `docs/CHECKLIST_PUBLICACAO.md`, item 1.2).

**Se o usuário quiser reverter para Anthropic no futuro:** a mudança é isolada nas ~20 linhas do `fetch()` e na leitura da resposta — não exige tocar em banco, frontend ou i18n.

---

## 11. Correção do nome do modelo (2026-07-26)

No primeiro teste real (usuário logado, foto de tarefa real), a análise falhou com **502** e a mensagem exata do Gemini (capturada inspecionando a aba Network do navegador, já que os logs padrão da Edge Function só mostram status HTTP, não o corpo): *"This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use a newer model."*

O `gemini-2.5-flash` foi descontinuado para novas contas **antes até da data de desligamento anunciada** (16/10/2026) — um caso real de deprecação sem aviso prévio efetivo, que a documentação já existente sobre o modelo não deixava claro no momento da implementação original (Sessão 032). Corrigido para **`gemini-3.5-flash`**, o substituto oficial, que segue na camada gratuita do Google AI Studio (60 req/min, sem cartão). Testado com uma foto real depois da correção — funcionou, extraiu título/disciplina/data/prioridade corretamente.

**Duas melhorias feitas junto com a correção**, que valem para qualquer erro futuro de IA nesta função:
- `console.error()` antes de retornar `falha_na_analise` e `resposta_ia_invalida`, logando a resposta bruta do provedor — sem isso, só dava pra diagnosticar inspecionando a aba Network do navegador do usuário
- Este tipo de erro (modelo descontinuado) é **externo ao nosso código** — se voltar a acontecer no futuro, o sintoma é sempre "análise falha para todo mundo, de repente, sem nenhuma mudança no nosso lado" e a causa é sempre checar se o provedor mudou/descontinuou o modelo em uso.

---

## 12. Extensão: importação por áudio + reorganização da entrada (2026-07-26)

Pedido do usuário: um recurso equivalente ao de foto, mas por **áudio** (o estudante grava ou envia um áudio contando as tarefas), e que **os dois** (foto e áudio) deixem de ser botões soltos na página Tarefas e passem a viver **dentro do fluxo de "Nova Tarefa"**.

### O que foi feito

**Novo modal seletor `NovaTarefaModal.tsx`** — ponto único de entrada ao criar uma tarefa: apresenta 3 opções (✍️ Escrever, 📷 Foto, 🎤 Áudio) e delega para o fluxo correspondente. Substituiu o `TarefaForm` direto nos botões "+ Nova Tarefa" de `Tarefas.tsx` e `VisaoGeral.tsx`. O botão "Importar por foto", que antes vivia solto na barra de ferramentas de Tarefas, foi removido — a foto agora só se acessa por dentro do seletor.

**Decisão de escopo:** o "+ Nova" de criação rápida por dia na Agenda (clique/long-press numa célula do calendário) **não** passou a abrir o seletor — continua indo direto para o formulário manual, com a data já preenchida. Foto/áudio não têm como aproveitar uma data pré-selecionada de forma natural (podem gerar várias tarefas com datas próprias), e essa é uma ação pensada para ser rápida; inserir uma pergunta antes dela removeria a vantagem de velocidade que o recurso tem hoje.

**Banco (migration `010_task_audio`):** bucket privado `task-audio` (mesmo padrão de RLS por pasta do `task-images`) e tabela `audio_analysis_usage`, com **cota diária própria** (não compartilha os "5 por dia" com a análise de foto — são limites independentes, mesmo raciocínio de proteção de custo).

**Edge Function `analisar-audio-tarefas`** — espelha `analisar-imagem-tarefas` quase linha a linha: mesmo modelo (`gemini-3.5-flash`), mesmo formato de retorno, mesma regra determinística de "detalhamento incompleto". Só muda o bucket, a tabela de limite e o prompt (adaptado para transcrição/interpretação de fala em vez de leitura de imagem).

**Frontend — refatoração para eliminar duplicação:**
- `client/src/lib/candidataTarefa.ts` — tipo `CandidataTarefa` (antes duplicado dentro de `imageImportService.ts`) e o mapa de labels dos campos faltando, agora compartilhados
- `client/src/components/RevisaoCandidatasTarefas.tsx` — a tela de revisão das tarefas candidatas (lista de cards, badges de completo/incompleto, botão "Importar prontas", integração com `TarefaForm` para completar as incompletas) foi extraída para um componente único, usado tanto por `ImportarImagemModal` quanto pelo novo `ImportarAudioModal`
- `audioImportService.ts` — espelha `imageImportService.ts` (upload → análise → apagar o arquivo do Storage logo depois, mesma política de privacidade já adotada para foto)
- `ImportarAudioModal.tsx` — gravação via `MediaRecorder` (limite de 90s, com contador ao vivo) **ou** envio de um arquivo de áudio já gravado, como alternativa caso o navegador negue a permissão do microfone
- Códigos de erro do backend generalizados de `imagem_nao_encontrada`/`imagem_grande_demais` para `arquivo_nao_encontrado`/`arquivo_grande_demais`, e as chaves i18n de erro/revisão que eram `importarImagem.*` migraram para um namespace `importarIA.*` compartilhado — só o que é de fato específico de cada modo (textos da tela de captura) ficou em `importarImagem.*`/`importarAudio.*` separados

### Fora de escopo desta extensão
- Transcrição do áudio exibida ao usuário (só o resultado estruturado das tarefas é mostrado, não o texto transcrito)
- Múltiplos áudios em sequência numa mesma sessão de gravação
