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
