-- v4.1 — Painel completo do responsável (link próprio, sem senha)
-- Usuário pediu acesso completo (tarefas, desempenho, mesada), não só o
-- resumo do e-mail mensal. Decisão (Sessão 036): link com token secreto,
-- sem criar conta/senha para o responsável.

-- Nome do responsável — usado na saudação personalizada do painel
-- ("Bem-vindo Henrique..."). Capturado no mesmo fluxo de cadastro por código.
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS nome text;

-- Token de acesso ao painel — separado do unsubscribe_token de propósito:
-- consequências diferentes se vazar (esse dá acesso de leitura a todos os
-- dados; o outro só permite parar de receber e-mail), então precisam poder
-- ser rotacionados independentemente no futuro.
ALTER TABLE public.guardians
  ADD COLUMN IF NOT EXISTS access_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex');
