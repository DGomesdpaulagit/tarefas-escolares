import type { DicionarioChave } from "@/lib/i18n";

/**
 * Formato comum das tarefas candidatas extraídas por IA — usado tanto pela
 * análise de imagem quanto pela de áudio (mesmo shape, mesmas regras de
 * "detalhamento incompleto" calculadas na Edge Function).
 */
export type CandidataTarefa = {
  title: string;
  subject_name: string | null;
  due_date: string | null;
  priority: "Alta" | "Média" | "Baixa";
  confianca: number;
  camposFaltando: ("data" | "disciplina" | "titulo")[];
};

export type CandidataComId = CandidataTarefa & { localId: string };

export const LABEL_CAMPO: Record<string, DicionarioChave> = {
  data: "importarIA.campoData",
  disciplina: "importarIA.campoDisciplina",
  titulo: "importarIA.campoTitulo",
};
