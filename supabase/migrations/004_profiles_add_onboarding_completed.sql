-- Reconstruída em 2026-07-27 (auditoria) a partir do schema real de produção —
-- aplicada originalmente na Sessão 019, arquivo nunca salvo no repositório.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
