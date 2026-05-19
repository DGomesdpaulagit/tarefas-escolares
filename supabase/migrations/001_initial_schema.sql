-- ============================================================
-- Tarefas Escolares — Schema Inicial
-- Executar no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  language    TEXT NOT NULL DEFAULT 'pt-BR',
  theme       TEXT NOT NULL DEFAULT 'dark',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: subjects (matérias)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#94a3b8',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: tasks (tarefas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  subject_id   UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL DEFAULT '',
  priority     TEXT NOT NULL DEFAULT 'Média' CHECK (priority IN ('Alta', 'Média', 'Baixa')),
  status       TEXT NOT NULL DEFAULT 'Não iniciada' CHECK (
    status IN ('Não iniciada', 'Em Andamento', 'Concluída', 'Passou do Prazo')
  ),
  progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  due_date     DATE,
  notes        TEXT,
  link         TEXT,
  sector       TEXT,
  origin       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- TABELA: imports (histórico de importações)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.imports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name      TEXT NOT NULL,
  file_size      BIGINT,
  imported_count INTEGER NOT NULL DEFAULT 0,
  file_type      TEXT NOT NULL DEFAULT 'xlsx',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: notification_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_3_days BOOLEAN NOT NULL DEFAULT TRUE,
  notify_2_days BOOLEAN NOT NULL DEFAULT TRUE,
  notify_1_day  BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_imports_user_id ON public.imports(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuário vê/edita apenas o seu perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- subjects
CREATE POLICY "subjects_select_own" ON public.subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subjects_insert_own" ON public.subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subjects_update_own" ON public.subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subjects_delete_own" ON public.subjects
  FOR DELETE USING (auth.uid() = user_id);

-- tasks
CREATE POLICY "tasks_select_own" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- imports
CREATE POLICY "imports_select_own" ON public.imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "imports_insert_own" ON public.imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "imports_delete_own" ON public.imports
  FOR DELETE USING (auth.uid() = user_id);

-- notification_settings
CREATE POLICY "notif_select_own" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notif_insert_own" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_update_own" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-criar perfil ao cadastrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, language, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'pt-BR',
    'dark'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
