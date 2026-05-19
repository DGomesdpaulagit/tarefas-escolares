import type { StatusTarefa, PrioridadeTarefa } from "@/types";

export type { StatusTarefa, PrioridadeTarefa };

export const MATERIAS_CORES: Record<string, string> = {
  Português: "#f59e0b",
  Artes: "#ec4899",
  Filosofia: "#8b5cf6",
  Química: "#06b6d4",
  "Interfaces Web": "#3b82f6",
  "Banco de Dados": "#10b981",
  Matemática: "#f97316",
  Física: "#84cc16",
  História: "#a78bfa",
  Geografia: "#34d399",
  Biologia: "#22d3ee",
  "Educação Física": "#f43f5e",
  Inglês: "#60a5fa",
};

export const MATERIAS_PADRAO = [
  "Português",
  "Artes",
  "Filosofia",
  "Química",
  "Interfaces Web",
  "Banco de Dados",
  "Matemática",
  "Física",
  "História",
  "Geografia",
  "Biologia",
  "Educação Física",
  "Inglês",
  "Outra",
];

export const SETORES = [
  "Trabalho",
  "Atividade/Exercício",
  "Avaliação B",
  "Prova",
  "Projeto",
  "Outro",
];

export const ORIGENS = ["SALA", "TEAMS", "PORTAL", "E-MAIL", "OUTRO"];

export function getMateriaColor(materia: string): string {
  return MATERIAS_CORES[materia] ?? "#94a3b8";
}

export function getStatusColor(status: StatusTarefa): string {
  switch (status) {
    case "Concluída":
      return "#10b981";
    case "Em Andamento":
      return "#f59e0b";
    case "Não iniciada":
      return "#94a3b8";
    case "Passou do Prazo":
      return "#ef4444";
  }
}

export function getDiasRestantesColor(dias: number | null): string {
  if (dias === null) return "#94a3b8";
  if (dias < 0) return "#ef4444";
  if (dias <= 3) return "#ef4444";
  if (dias <= 7) return "#f59e0b";
  return "#10b981";
}

export function formatarData(data: string | null): string {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
