-- Reconstruída em 2026-07-27 (auditoria) a partir do schema real de produção —
-- o arquivo original desta migration nunca foi salvo no repositório, só
-- aplicado direto via MCP na Sessão 018. Mantém o número de sequência
-- correspondente para não confundir a ordem histórica.

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS emoji text NULL;
