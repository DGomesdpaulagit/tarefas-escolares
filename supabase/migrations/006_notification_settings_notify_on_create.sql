-- Reconstruída em 2026-07-27 (auditoria) a partir do schema real de produção —
-- aplicada originalmente na Sessão 024, arquivo nunca salvo no repositório.

ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS notify_on_create boolean NOT NULL DEFAULT false;
