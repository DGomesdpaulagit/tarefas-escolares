-- v5.0 — Registro de tarefas por imagem (análise por IA)
-- Ver docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md

-- Bucket privado: cada usuário só acessa a própria pasta ({user_id}/arquivo.ext)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-images', 'task-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "task_images_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_images_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_images_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Registro de cada análise (não de cada importação confirmada) — é o que sustenta
-- o limite diário de custo, já que o gasto acontece na chamada de IA, não na
-- confirmação da tarefa.
CREATE TABLE public.image_analysis_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sucesso    boolean NOT NULL DEFAULT true,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_image_analysis_usage_rate
  ON public.image_analysis_usage (user_id, criado_em DESC);

ALTER TABLE public.image_analysis_usage ENABLE ROW LEVEL SECURITY;

-- Leitura própria (a UI mostra "restam N análises hoje"); escrita só pela
-- Edge Function via service role — o cliente não pode inflar nem zerar a
-- própria contagem.
CREATE POLICY "image_analysis_usage_select_own" ON public.image_analysis_usage
  FOR SELECT USING (auth.uid() = user_id);
