import { useTarefas, calcularDiasRestantes, isUrgente } from "@/contexts/TarefasContext";
import { soundService } from "@/services/soundService";
import type { Tarefa } from "@/types";
import {
  formatarData,
  getMateriaColor,
  getStatusColor,
  getDiasRestantesColor,
  getStatusEfetivo,
  labelDiasRestantes,
} from "@/lib/tarefasData";
import { AlertTriangle, Calendar, Clock, ExternalLink, Pencil, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import TarefaForm from "./TarefaForm";
import { toast } from "sonner";

interface TarefaCardProps {
  tarefa: Tarefa;
  index: number;
}

const STATUS_LABELS: Record<string, string> = {
  Concluída: "✓ Concluída",
  "Em Andamento": "⟳ Em Andamento",
  "Não iniciada": "○ Não iniciada",
  "Passou do Prazo": "✕ Passou do Prazo",
};

const PRIORIDADE_LABELS: Record<string, string> = {
  Alta: "🔴",
  Média: "🟡",
  Baixa: "🟢",
};

export default function TarefaCard({ tarefa, index }: TarefaCardProps) {
  const { toggleConcluida, removerTarefa } = useTarefas();
  const [editando, setEditando] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  const statusEfetivo = getStatusEfetivo(tarefa);
  const materiaColor = getMateriaColor(tarefa.subject_name);
  const statusColor = getStatusColor(statusEfetivo);
  const diasRestantes = calcularDiasRestantes(tarefa.due_date);
  const diasColor = getDiasRestantesColor(diasRestantes);
  const concluida = statusEfetivo === "Concluída";
  const expirada = statusEfetivo === "Passou do Prazo";
  const urgente = isUrgente(tarefa);

  const handleToggle = async () => {
    if (expirada) {
      toast.error("Esta tarefa expirou e não pode ser concluída");
      return;
    }
    try {
      await toggleConcluida(tarefa.id);
      if (concluida) soundService.playDesmarcada();
      else soundService.playConcluida();
    } catch {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleRemover = async () => {
    if (confirmandoRemocao) {
      try {
        await removerTarefa(tarefa.id);
        soundService.playRemovida();
        toast.success("Tarefa removida");
      } catch {
        toast.error("Erro ao remover tarefa");
      }
    } else {
      setConfirmandoRemocao(true);
      setTimeout(() => setConfirmandoRemocao(false), 3000);
    }
  };

  return (
    <>
      <div
        className={`group relative border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg ${
          expirada
            ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 hover:shadow-red-500/10"
            : "bg-[var(--bg-card)] border-white/8 hover:border-white/20 hover:shadow-black/30 hover:bg-[var(--bg-card-hover)]"
        }`}
        style={{
          animationDelay: `${index * 40}ms`,
          animation: "fadeSlideIn 0.3s ease-out both",
        }}
        role="article"
        aria-label={`Tarefa: ${tarefa.title}`}
      >
        {expirada && (
          <div className="absolute top-2 right-2 z-10" title="Prazo encerrado">
            <XCircle size={16} className="text-red-500" aria-label="Tarefa expirada — prazo encerrado" />
          </div>
        )}
        {urgente && !concluida && !expirada && (
          <div className="absolute top-2 right-2 z-10">
            <AlertTriangle size={14} className="text-red-400 animate-pulse" aria-label="Tarefa urgente — prazo em 3 dias ou menos" />
          </div>
        )}

        {/* Barra lateral colorida por matéria */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: expirada ? "#ef4444" : urgente && !concluida ? "#ef4444" : materiaColor }}
        />

        <div className="pl-4 pr-4 py-4">
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggle}
              disabled={expirada}
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: expirada ? "#ef4444" : concluida ? "#10b981" : "#475569",
                backgroundColor: concluida ? "#10b981" : "transparent",
              }}
              title={
                expirada
                  ? "Prazo encerrado — não pode ser concluída"
                  : concluida
                  ? "Marcar como pendente"
                  : "Marcar como concluída"
              }
              aria-label={
                expirada
                  ? "Tarefa expirada — concluir desabilitado"
                  : concluida
                  ? "Marcar como pendente"
                  : "Marcar como concluída"
              }
            >
              {concluida && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium leading-snug transition-all duration-200 select-none ${
                  concluida
                    ? "line-through text-slate-500"
                    : expirada
                    ? "line-through text-slate-500 dark:text-slate-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {tarefa.title}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${materiaColor}20`,
                    color: materiaColor,
                    border: `1px solid ${materiaColor}40`,
                  }}
                >
                  {tarefa.subject_name}
                </span>

                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  {expirada ? "✕ Prazo encerrado" : STATUS_LABELS[statusEfetivo] ?? statusEfetivo}
                </span>

                {tarefa.sector && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {tarefa.sector}
                  </span>
                )}

                <span className="text-xs" title={`Prioridade ${tarefa.priority}`}>
                  {PRIORIDADE_LABELS[tarefa.priority]}
                </span>

                {urgente && !concluida && !expirada && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                    Urgente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 ml-8">
            {tarefa.due_date && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={11} aria-hidden="true" />
                <span>{formatarData(tarefa.due_date)}</span>
              </div>
            )}

            {diasRestantes !== null && (
              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: diasColor }}
              >
                <Clock size={11} aria-hidden="true" />
                <span>{labelDiasRestantes(diasRestantes)}</span>
              </div>
            )}

            {tarefa.origin && (
              <span className="text-xs text-slate-500">{tarefa.origin}</span>
            )}
          </div>

          {tarefa.progress > 0 && (
            <div className="mt-3 ml-8">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Progresso</span>
                <span className="text-xs font-medium text-amber-400">{tarefa.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={tarefa.progress} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tarefa.progress}%`,
                    backgroundColor: concluida ? "#10b981" : "#f59e0b",
                  }}
                />
              </div>
            </div>
          )}

          {tarefa.notes && (
            <p className="text-xs text-slate-500 mt-2 ml-8 italic leading-relaxed line-clamp-2">
              {tarefa.notes}
            </p>
          )}

          {/* Ações — visíveis sempre no mobile, hover no desktop */}
          <div className="flex items-center gap-2 mt-3 ml-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {tarefa.link && (
              <a
                href={tarefa.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                aria-label="Abrir link de referência"
              >
                <ExternalLink size={11} aria-hidden="true" />
                <span>Referência</span>
              </a>
            )}
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
              aria-label="Editar tarefa"
            >
              <Pencil size={11} aria-hidden="true" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleRemover}
              className={`flex items-center gap-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded ${
                confirmandoRemocao
                  ? "text-red-400 font-semibold"
                  : "text-slate-400 hover:text-red-400"
              }`}
              aria-label={confirmandoRemocao ? "Confirmar remoção" : "Remover tarefa"}
            >
              <Trash2 size={11} aria-hidden="true" />
              <span>{confirmandoRemocao ? "Confirmar?" : "Remover"}</span>
            </button>
          </div>
        </div>
      </div>

      {editando && (
        <TarefaForm tarefa={tarefa} onClose={() => setEditando(false)} />
      )}
    </>
  );
}
