-- Configuração do módulo por usuário
CREATE TABLE mesada_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  ano_letivo integer NOT NULL,
  mes_inicio integer NOT NULL DEFAULT 6,
  mes_fim integer NOT NULL DEFAULT 12,
  valor_mb numeric(10,2) NOT NULL DEFAULT 22.00,
  valor_b numeric(10,2) NOT NULL DEFAULT 5.00,
  valor_r numeric(10,2) NOT NULL DEFAULT 2.00,
  valor_i numeric(10,2) NOT NULL DEFAULT -5.00,
  limite_mb_por_periodo integer NOT NULL DEFAULT 5,
  meta_total numeric(10,2) NOT NULL DEFAULT 150.00,
  criterio_aproveitamento jsonb DEFAULT '{"MB": 100, "B": 70}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ano_letivo)
);

-- Matérias monitoradas no boletim (independente de `subjects`)
CREATE TABLE mesada_materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'complementar'
    CHECK (categoria IN ('principal', 'complementar', 'menor', 'outra')),
  valor_base numeric(10,2),               -- NULL = usa tabela de conceito padrão (Eixo A)
  subject_id uuid REFERENCES subjects(id), -- opcional, herda emoji/cor da Disciplina existente
  emoji text,                              -- fallback se não linkado a subject_id
  cor text DEFAULT '#94a3b8',              -- fallback se não linkado a subject_id
  ativa boolean NOT NULL DEFAULT true,
  ordem integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lançamento mensal de conceito por matéria
CREATE TABLE mesada_notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  materia_id uuid NOT NULL REFERENCES mesada_materias(id) ON DELETE CASCADE,
  ano integer NOT NULL,
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  conceito text NOT NULL CHECK (conceito IN ('MB', 'B', 'R', 'I')),
  valor_calculado numeric(10,2) NOT NULL,  -- snapshot do valor no momento do lançamento
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(materia_id, ano, mes)
);

-- RLS (padrão do projeto: auth.uid() = user_id)
ALTER TABLE mesada_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesada_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesada_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_mesada_config" ON mesada_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mesada_materias" ON mesada_materias FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mesada_notas" ON mesada_notas FOR ALL USING (auth.uid() = user_id);
