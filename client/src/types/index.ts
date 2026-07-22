export type StatusTarefa = "Concluída" | "Não iniciada" | "Em Andamento" | "Passou do Prazo";
export type PrioridadeTarefa = "Alta" | "Média" | "Baixa";

export interface Tarefa {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject_name: string;
  subject_id: string | null;
  priority: PrioridadeTarefa;
  status: StatusTarefa;
  progress: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  notes: string | null;
  link: string | null;
  sector: string | null;
  origin: string | null;
}

export interface Materia {
  id: string;
  user_id: string;
  name: string;
  color: string;
  emoji: string | null;
  created_at: string;
}

export interface Perfil {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: string;
  theme: string;
  school_year: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type Conceito = "MB" | "B" | "R" | "I";
export type CategoriaMesada = "principal" | "complementar" | "menor" | "outra";

export interface MesadaConfig {
  id: string;
  user_id: string;
  ano_letivo: number;
  mes_inicio: number;
  mes_fim: number;
  valor_mb: number;
  valor_b: number;
  valor_r: number;
  valor_i: number;
  limite_mb_por_periodo: number;
  meta_total: number;
  criterio_aproveitamento: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface MesadaMateria {
  id: string;
  user_id: string;
  nome: string;
  categoria: CategoriaMesada;
  valor_base: number | null;
  subject_id: string | null;
  emoji: string | null;
  cor: string;
  ativa: boolean;
  ordem: number;
  created_at: string;
}

export interface MesadaNota {
  id: string;
  user_id: string;
  materia_id: string;
  ano: number;
  mes: number;
  conceito: Conceito;
  valor_calculado: number;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArquivoImportado {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number | null;
  imported_count: number;
  file_type: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  notify_3_days: boolean;
  notify_2_days: boolean;
  notify_1_day: boolean;
  notify_on_create: boolean;
  sound_enabled: boolean;
}

export interface FiltrosTarefas {
  busca: string;
  status: StatusTarefa | "Todas";
  materia: string;
  prioridade: PrioridadeTarefa | "Todas";
}

export interface MetricasTarefas {
  total: number;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  passouPrazo: number;
  percentualConcluido: number;
  porMateria: Record<string, number>;
  porStatus: Record<string, number>;
  porSetor: Record<string, number>;
}
