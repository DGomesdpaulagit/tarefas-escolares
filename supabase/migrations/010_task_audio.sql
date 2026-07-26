-- v5.1 — Registro de tarefas por áudio (mesmo padrão da importação por imagem)
-- Ver docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-audio', 'task-audio', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "task_audio_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-audio' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_audio_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-audio' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_audio_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-audio' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Limite diário próprio (não compartilha cota com a análise de imagem) —
-- mesmo raciocínio de image_analysis_usage: registra cada tentativa, não
-- cada importação confirmada, porque o custo é na chamada de IA.
CREATE TABLE public.audio_analysis_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sucesso    boolean NOT NULL DEFAULT true,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audio_analysis_usage_rate
  ON public.audio_analysis_usage (user_id, criado_em DESC);

ALTER TABLE public.audio_analysis_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audio_analysis_usage_select_own" ON public.audio_analysis_usage
  FOR SELECT USING (auth.uid() = user_id);
