-- Correções apontadas pelo linter do Supabase (get_advisors), sem mudança de
-- comportamento — só hardening e otimização. Ver auditoria da Sessão 035.

-- ---------------------------------------------------------------------------
-- 1. search_path mutável em funções SECURITY DEFINER (WARN de segurança)
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;

-- ---------------------------------------------------------------------------
-- 2. Funções SECURITY DEFINER expostas via RPC para anon/authenticated sem
-- necessidade — handle_new_user só deve rodar via trigger de auth.users,
-- rls_auto_enable só via event trigger. Revogar EXECUTE não afeta o disparo
-- automático (triggers não passam pelo grant de EXECUTE do chamador).
-- ---------------------------------------------------------------------------
-- REVOKE FROM PUBLIC não basta: o Supabase concede EXECUTE explicitamente a
-- anon/authenticated na criação da função, separado do grant via PUBLIC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Índices faltando em foreign keys (INFO de performance)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guardian_codes_guardian_id ON public.guardian_codes(guardian_id);
CREATE INDEX IF NOT EXISTS idx_mesada_materias_subject_id ON public.mesada_materias(subject_id);
CREATE INDEX IF NOT EXISTS idx_mesada_materias_user_id ON public.mesada_materias(user_id);
CREATE INDEX IF NOT EXISTS idx_mesada_notas_user_id ON public.mesada_notas(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON public.tasks(subject_id);

-- ---------------------------------------------------------------------------
-- 4. RLS reavaliando auth.uid() por linha (WARN de performance, "auth_rls_
-- initplan") — trocar por (select auth.uid()) deixa o planner cachear o
-- valor por statement em vez de recalcular por linha. Mesma lógica, mais
-- rápido em tabelas grandes. Nenhuma policy muda de comportamento.
-- ---------------------------------------------------------------------------
ALTER POLICY "profiles_select_own" ON public.profiles USING ((select auth.uid()) = id);
ALTER POLICY "profiles_insert_own" ON public.profiles WITH CHECK ((select auth.uid()) = id);
ALTER POLICY "profiles_update_own" ON public.profiles USING ((select auth.uid()) = id);

ALTER POLICY "subjects_select_own" ON public.subjects USING ((select auth.uid()) = user_id);
ALTER POLICY "subjects_insert_own" ON public.subjects WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "subjects_update_own" ON public.subjects USING ((select auth.uid()) = user_id);
ALTER POLICY "subjects_delete_own" ON public.subjects USING ((select auth.uid()) = user_id);

ALTER POLICY "tasks_select_own" ON public.tasks USING ((select auth.uid()) = user_id);
ALTER POLICY "tasks_insert_own" ON public.tasks WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "tasks_update_own" ON public.tasks USING ((select auth.uid()) = user_id);
ALTER POLICY "tasks_delete_own" ON public.tasks USING ((select auth.uid()) = user_id);

ALTER POLICY "imports_select_own" ON public.imports USING ((select auth.uid()) = user_id);
ALTER POLICY "imports_insert_own" ON public.imports WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "imports_delete_own" ON public.imports USING ((select auth.uid()) = user_id);

ALTER POLICY "notif_select_own" ON public.notification_settings USING ((select auth.uid()) = user_id);
ALTER POLICY "notif_insert_own" ON public.notification_settings WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "notif_update_own" ON public.notification_settings USING ((select auth.uid()) = user_id);

ALTER POLICY "push_own" ON public.push_subscriptions
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "own_mesada_config" ON public.mesada_config USING ((select auth.uid()) = user_id);
ALTER POLICY "own_mesada_materias" ON public.mesada_materias USING ((select auth.uid()) = user_id);
ALTER POLICY "own_mesada_notas" ON public.mesada_notas USING ((select auth.uid()) = user_id);

ALTER POLICY "guardians_select_own" ON public.guardians USING ((select auth.uid()) = user_id);
ALTER POLICY "guardian_reports_log_select_own" ON public.guardian_reports_log
  USING (
    EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = guardian_reports_log.guardian_id
        AND g.user_id = (select auth.uid())
    )
  );

ALTER POLICY "image_analysis_usage_select_own" ON public.image_analysis_usage USING ((select auth.uid()) = user_id);
ALTER POLICY "audio_analysis_usage_select_own" ON public.audio_analysis_usage USING ((select auth.uid()) = user_id);
