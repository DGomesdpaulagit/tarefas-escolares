-- v4.0 — Relatório mensal para o responsável
-- Ver docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md

-- Responsável cadastrado pelo usuário (1 por usuário nesta versão)
CREATE TABLE public.guardians (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  nome          text,                    -- opcional, só pra personalizar o e-mail
  status        text NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'ativo', 'removido')),
  unsubscribe_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  criado_em     timestamptz NOT NULL DEFAULT now(),
  confirmado_em timestamptz,
  UNIQUE (user_id)
);

-- Códigos de verificação (cadastrar / editar / excluir)
CREATE TABLE public.guardian_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE CASCADE,  -- null no cadastro inicial
  codigo_hash text NOT NULL,             -- SHA-256 do código; NUNCA o código em texto puro
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.guardians            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_reports_log ENABLE ROW LEVEL SECURITY;

-- guardians: o usuário LÊ a própria linha, mas nunca escreve direto.
-- Toda escrita passa pela Edge Function (service role) após validar o código —
-- se houvesse UPDATE pelo cliente, bastaria o console do navegador pra trocar
-- o e-mail sem código nenhum.
CREATE POLICY "guardians_select_own" ON public.guardians
  FOR SELECT USING (auth.uid() = user_id);

-- guardian_codes: NENHUM acesso pelo cliente, nem leitura.
-- Se o cliente lesse essa tabela, leria o próprio código que deveria vir do
-- responsável, e a verificação inteira viraria teatro.
-- (Sem nenhuma policy + RLS ligado = tudo negado, exceto service role.)

-- guardian_reports_log: leitura do histórico do próprio responsável
-- (transparência: o usuário vê o que foi enviado), sem escrita.
CREATE POLICY "guardian_reports_log_select_own" ON public.guardian_reports_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = guardian_reports_log.guardian_id
        AND g.user_id = auth.uid()
    )
  );
