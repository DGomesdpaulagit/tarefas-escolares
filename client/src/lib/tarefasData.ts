import type { StatusTarefa, PrioridadeTarefa, Tarefa } from "@/types";

export type { StatusTarefa, PrioridadeTarefa };

// ============================================================
// DATAS — sempre tratadas como datas LOCAIS (sem timezone shift)
// ============================================================

/**
 * Converte "YYYY-MM-DD" (ou ISO) em Date local no FINAL do dia (23:59:59.999).
 * Evita o bug clássico de `new Date("2026-06-05")` interpretar como UTC midnight
 * e cair um dia atrás em fusos negativos (ex: Brasília UTC-3).
 */
export function parseDueDateLocal(due: string): Date {
  const datePart = due.split("T")[0];
  const [ano, mes, dia] = datePart.split("-").map(Number);
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1, 23, 59, 59, 999);
}

/** Hoje às 00:00:00 local. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Dias restantes até a entrega (contando o dia atual e o dia final).
 * - Entrega hoje  → 0  ("Último dia")
 * - Entrega amanhã → 1 ("Falta 1 dia")
 * - Entrega em 8 dias → 8 ("Faltam 8 dias")
 * - Prazo vencido → número negativo
 */
export function diasAteVencimento(due: string | null): number | null {
  if (!due) return null;
  const hoje = startOfToday();
  const prazo = parseDueDateLocal(due);
  prazo.setHours(0, 0, 0, 0);
  return Math.round((prazo.getTime() - hoje.getTime()) / 86_400_000);
}

/** Tarefa expirou? Só após 23:59:59 do dia final. Concluídas nunca expiram. */
export function isExpirada(tarefa: Pick<Tarefa, "status" | "due_date">): boolean {
  if (tarefa.status === "Concluída") return false;
  if (!tarefa.due_date) return false;
  return Date.now() > parseDueDateLocal(tarefa.due_date).getTime();
}

/**
 * Status efetivo para uso na UI — projeta "Passou do Prazo" quando o prazo
 * já passou, mesmo que o status persistido ainda não tenha sido atualizado.
 */
export function getStatusEfetivo(tarefa: Tarefa): StatusTarefa {
  if (tarefa.status === "Concluída") return "Concluída";
  if (isExpirada(tarefa)) return "Passou do Prazo";
  return tarefa.status;
}

/** Texto humano para a contagem de dias. */
export function labelDiasRestantes(dias: number | null): string {
  if (dias === null) return "";
  if (dias === 0) return "Último dia";
  if (dias === 1) return "Falta 1 dia";
  if (dias > 0) return `Faltam ${dias} dias`;
  if (dias === -1) return "1 dia atrás";
  return `${Math.abs(dias)} dias atrás`;
}

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

export const MATERIAS_EMOJIS: Record<string, string> = {
  Português: "📚",
  Artes: "🎨",
  Filosofia: "🧠",
  Química: "🧪",
  "Interfaces Web": "💻",
  "Banco de Dados": "🗄️",
  Matemática: "📘",
  Física: "🔬",
  História: "🏛️",
  Geografia: "🌎",
  Biologia: "🧬",
  "Educação Física": "⚽",
  Inglês: "🇬🇧",
};

/** Paleta de cores recomendada para disciplinas (uniforme, funciona em ambos os temas). */
export const PALETA_DISCIPLINAS: string[] = [
  "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#a78bfa",
  "#8b5cf6", "#3b82f6", "#60a5fa", "#06b6d4", "#22d3ee",
  "#10b981", "#34d399", "#84cc16", "#f43f5e", "#94a3b8",
];

/** Emojis sugeridos para o picker. */
export const EMOJI_SUGERIDOS: string[] = [
  "📚", "📘", "📗", "📕", "📙", "📓", "📔", "📒", "📝", "✏️",
  "🧠", "💡", "🔬", "🧪", "🧬", "⚗️", "🔭", "🌡️",
  "🌎", "🗺️", "🌍", "🌏", "🏛️", "⚖️", "📜",
  "🎨", "🎭", "🎬", "🎵", "🎤", "🎹", "🎸",
  "💻", "⌨️", "🖥️", "🗄️", "📊", "📈", "🔢",
  "⚽", "🏀", "🏈", "🏐", "🎾", "🏃", "🤸",
  "🇬🇧", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇧🇷",
  "🍎", "🌱", "🐛", "🐝", "🦋",
];

export function getMateriaEmoji(materia: string, custom?: string | null): string {
  if (custom) return custom;
  return MATERIAS_EMOJIS[materia] ?? "📘";
}

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
