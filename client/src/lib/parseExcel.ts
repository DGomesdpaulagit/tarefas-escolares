import type { Tarefa, StatusTarefa, PrioridadeTarefa } from "@/types";

type TarefaRaw = Omit<Tarefa, "id" | "user_id" | "created_at" | "updated_at" | "completed_at">;

const STATUS_VALIDOS: StatusTarefa[] = ["Concluída", "Não iniciada", "Em Andamento", "Passou do Prazo"];
const PRIORIDADE_VALIDA: PrioridadeTarefa[] = ["Alta", "Média", "Baixa"];

const STATUS_MAP: Record<string, StatusTarefa> = {
  concluida: "Concluída", concluído: "Concluída", concluido: "Concluída",
  done: "Concluída", completed: "Concluída", finalizado: "Concluída", finalizada: "Concluída",
  "em andamento": "Em Andamento", andamento: "Em Andamento",
  "in progress": "Em Andamento", progress: "Em Andamento", iniciada: "Em Andamento",
  "passou do prazo": "Passou do Prazo", atrasada: "Passou do Prazo", atrasado: "Passou do Prazo",
  overdue: "Passou do Prazo", late: "Passou do Prazo",
};

const PRIORIDADE_MAP: Record<string, PrioridadeTarefa> = {
  alta: "Alta", high: "Alta", urgente: "Alta", urgent: "Alta",
  baixa: "Baixa", low: "Baixa",
  media: "Média", média: "Média", medium: "Média", normal: "Média",
};

function sanitizeStatus(raw: string): StatusTarefa {
  const trimmed = raw.trim();
  if (STATUS_VALIDOS.includes(trimmed as StatusTarefa)) return trimmed as StatusTarefa;
  return STATUS_MAP[trimmed.toLowerCase()] ?? "Não iniciada";
}

function sanitizePrioridade(raw: string): PrioridadeTarefa {
  const trimmed = raw.trim();
  if (PRIORIDADE_VALIDA.includes(trimmed as PrioridadeTarefa)) return trimmed as PrioridadeTarefa;
  return PRIORIDADE_MAP[trimmed.toLowerCase()] ?? "Média";
}

function parseExcelDate(value: string | number): string | null {
  if (!value && value !== 0) return null;
  if (typeof value === "number") {
    // Excel serial date: dias desde 1900-01-01 (com bug do ano 1900)
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  }
  const str = String(value).trim();
  if (!str) return null;
  // Tenta parsear string de data
  const date = new Date(str);
  if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  return null;
}

export async function parseExcelFile(file: File): Promise<TarefaRaw[]> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) return parseCSV(file);
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) return parseXLSX(file);
  throw new Error("Formato não suportado. Use .xlsx ou .csv");
}

function getIndex(headers: string[], names: string[]): number {
  return headers.findIndex((h) => names.some((n) => h.includes(n)));
}

function mapRow(values: (string | number)[], headers: string[]): TarefaRaw | null {
  const idxTarefa = getIndex(headers, ["tarefa", "task", "título", "titulo", "title"]);
  const idxMateria = getIndex(headers, ["matéria", "materia", "disciplina", "subject"]);
  const idxStatus = getIndex(headers, ["status"]);
  const idxPrioridade = getIndex(headers, ["prioridade", "priority"]);
  const idxData = getIndex(headers, ["data", "entrega", "due"]);
  const idxProgresso = getIndex(headers, ["conclusão", "conclusao", "progresso", "%", "progress"]);
  const idxNotes = getIndex(headers, ["observação", "observacao", "nota", "notes"]);
  const idxLink = getIndex(headers, ["link", "url", "referência", "referencia"]);
  const idxSetor = getIndex(headers, ["setor", "sector"]);
  const idxOrigem = getIndex(headers, ["origem", "source", "origin"]);

  const title = String(values[idxTarefa] ?? "").trim();
  if (!title) return null;

  return {
    title,
    subject_name: String(values[idxMateria] ?? "Outra").trim() || "Outra",
    subject_id: null,
    status: sanitizeStatus(String(values[idxStatus] ?? "")),
    priority: sanitizePrioridade(String(values[idxPrioridade] ?? "")),
    due_date: idxData >= 0 ? parseExcelDate(values[idxData] as string | number) : null,
    progress: parseFloat(String(values[idxProgresso] ?? 0)) || 0,
    notes: idxNotes >= 0 ? String(values[idxNotes] ?? "").trim() || null : null,
    link: idxLink >= 0 ? String(values[idxLink] ?? "").trim() || null : null,
    sector: idxSetor >= 0 ? String(values[idxSetor] ?? "").trim() || null : null,
    origin: idxOrigem >= 0 ? String(values[idxOrigem] ?? "").trim() || null : null,
    description: null,
  };
}

async function parseCSV(file: File): Promise<TarefaRaw[]> {
  const text = await file.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("Arquivo CSV vazio ou inválido");

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const result: TarefaRaw[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = mapRow(values, headers);
    if (row) result.push(row);
  }

  return result;
}

async function parseXLSX(file: File): Promise<TarefaRaw[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number)[][];

  if (data.length < 2) throw new Error("Arquivo Excel vazio ou inválido");

  const headers = (data[0] ?? []).map((h) => String(h).trim().toLowerCase());
  const result: TarefaRaw[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = mapRow(data[i] ?? [], headers);
    if (row) result.push(row);
  }

  return result;
}
