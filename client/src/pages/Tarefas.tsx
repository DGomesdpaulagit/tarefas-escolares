import { useTarefas } from "@/contexts/TarefasContext";
import TarefaCard from "@/components/TarefaCard";
import TarefaForm from "@/components/TarefaForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, SlidersHorizontal, X, Upload, Trash2 } from "lucide-react";
import { useState } from "react";
import ImportarPlanilhaModal from "@/components/ImportarPlanilhaModal";
import LimparTarefasModal from "@/components/LimparTarefasModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PrioridadeTarefa, StatusTarefa, Tarefa } from "@/types";

const STATUS_OPTIONS: (StatusTarefa | "Todas")[] = [
  "Todas", "Não iniciada", "Em Andamento", "Concluída", "Passou do Prazo",
];

const PRIORIDADE_OPTIONS: (PrioridadeTarefa | "Todas")[] = [
  "Todas", "Alta", "Média", "Baixa",
];

const ORDENACAO_OPTIONS = [
  { value: "urgente", label: "Urgentes primeiro" },
  { value: "recente", label: "Mais recentes" },
  { value: "prazo", label: "Por prazo" },
  { value: "prioridade", label: "Por prioridade" },
  { value: "materia", label: "Por disciplina" },
];

type Ordenacao = "urgente" | "recente" | "prazo" | "prioridade" | "materia";

function ordenarTarefas(tarefas: Tarefa[], ord: Ordenacao): Tarefa[] {
  const copia = [...tarefas];
  if (ord === "prazo") {
    return copia.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  }
  if (ord === "prioridade") {
    const ordem = { Alta: 0, Média: 1, Baixa: 2 };
    return copia.sort((a, b) => (ordem[a.priority] ?? 2) - (ordem[b.priority] ?? 2));
  }
  if (ord === "materia") {
    return copia.sort((a, b) => a.subject_name.localeCompare(b.subject_name));
  }
  return copia;
}

export default function Tarefas() {
  const { tarefas, tarefasFiltradas, filtros, setFiltros, carregando } = useTarefas();

  const materiasDisponiveis = ["Todas", ...Array.from(new Set(tarefas.map((t) => t.subject_name))).sort()];
  const [criando, setCriando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("urgente");
  const [importando, setImportando] = useState(false);
  const [limpando, setLimpando] = useState(false);

  const tarefasOrdenadas = ordenarTarefas(tarefasFiltradas, ordenacao);
  const temFiltrosAtivos =
    filtros.status !== "Todas" ||
    filtros.materia !== "Todas" ||
    filtros.prioridade !== "Todas" ||
    filtros.busca !== "";

  const limparFiltros = () => {
    setFiltros({ status: "Todas", materia: "Todas", prioridade: "Todas", busca: "" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-white/8 bg-[var(--bg-base)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[140px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <Input
              value={filtros.busca}
              onChange={(e) => setFiltros({ busca: e.target.value })}
              placeholder="Buscar tarefas..."
              className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 h-9 text-sm"
              aria-label="Buscar tarefas"
            />
            {filtros.busca && (
              <button onClick={() => setFiltros({ busca: "" })} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label="Limpar busca">
                <X size={13} />
              </button>
            )}
          </div>

          <Button
            data-tour="tarefas-filtros"
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros((v) => !v)}
            className={`border-white/10 h-9 gap-1.5 text-sm ${
              mostrarFiltros || temFiltrosAtivos
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
            aria-expanded={mostrarFiltros}
            aria-label={`${mostrarFiltros ? "Ocultar" : "Mostrar"} filtros${temFiltrosAtivos ? " (ativos)" : ""}`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filtros</span>
            {temFiltrosAtivos && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-label="Filtros ativos" />}
          </Button>

          <Button
            size="sm"
            onClick={() => setImportando(true)}
            variant="outline"
            className="border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200 h-9 gap-1.5 text-sm bg-transparent"
            aria-label="Importar tarefas de planilha"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Importar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setLimpando(true)}
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 gap-1.5 text-sm bg-transparent"
            aria-label="Limpar todas as tarefas"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Limpar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setCriando(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-9 gap-1.5 text-sm"
            aria-label="Criar nova tarefa"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>

        {mostrarFiltros && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/8">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 px-1">Status</span>
              <Select value={filtros.status} onValueChange={(v) => setFiltros({ status: v as StatusTarefa | "Todas" })}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-slate-300 w-36 focus:border-amber-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="text-slate-200 text-xs focus:bg-white/10">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 px-1">Prioridade</span>
              <Select value={filtros.prioridade} onValueChange={(v) => setFiltros({ prioridade: v as PrioridadeTarefa | "Todas" })}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-slate-300 w-32 focus:border-amber-500">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {PRIORIDADE_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-slate-200 text-xs focus:bg-white/10">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 px-1">Disciplina</span>
              <Select value={filtros.materia} onValueChange={(v) => setFiltros({ materia: v })}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-slate-300 w-36 focus:border-amber-500">
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {materiasDisponiveis.map((m) => (
                    <SelectItem key={m} value={m} className="text-slate-200 text-xs focus:bg-white/10">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 px-1">Ordenação</span>
              <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as Ordenacao)}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-slate-300 w-40 focus:border-amber-500">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {ORDENACAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-slate-200 text-xs focus:bg-white/10">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {temFiltrosAtivos && (
              <button onClick={limparFiltros} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors mt-4" aria-label="Limpar todos os filtros">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            {carregando ? "Carregando..." : tarefasOrdenadas.length === 0
              ? "Nenhuma tarefa encontrada"
              : `${tarefasOrdenadas.length} tarefa${tarefasOrdenadas.length !== 1 ? "s" : ""}`}
          </p>
          {filtros.materia !== "Todas" && (
            <button onClick={() => setFiltros({ materia: "Todas" })} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1" aria-label={`Remover filtro de disciplina: ${filtros.materia}`}>
              <X size={11} />
              {filtros.materia}
            </button>
          )}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-amber-400 animate-spin" aria-label="Carregando tarefas" />
          </div>
        ) : tarefasOrdenadas.length === 0 ? (
          <EmptyState onCriar={() => setCriando(true)} temFiltros={temFiltrosAtivos} />
        ) : (
          <div className="space-y-2.5">
            {tarefasOrdenadas.map((t, i) => (
              <TarefaCard key={t.id} tarefa={t} index={i} />
            ))}
          </div>
        )}
      </div>

      {criando && <TarefaForm onClose={() => setCriando(false)} />}
      {importando && <ImportarPlanilhaModal onClose={() => setImportando(false)} />}
      {limpando && <LimparTarefasModal onClose={() => setLimpando(false)} />}
    </div>
  );
}

function EmptyState({ onCriar, temFiltros }: { onCriar: () => void; temFiltros: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Search size={24} className="text-slate-500" aria-hidden="true" />
      </div>
      <p className="text-slate-300 font-medium mb-1">
        {temFiltros ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa ainda"}
      </p>
      <p className="text-slate-500 text-sm mb-4">
        {temFiltros
          ? "Tente ajustar os filtros para ver mais tarefas"
          : "Adicione sua primeira tarefa para começar"}
      </p>
      {!temFiltros && (
        <Button onClick={onCriar} size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-1.5">
          <Plus size={14} />
          Nova Tarefa
        </Button>
      )}
    </div>
  );
}
