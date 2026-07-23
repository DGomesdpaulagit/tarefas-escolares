import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { useTarefas } from "@/contexts/TarefasContext";
import { getMateriaEmoji, MATERIAS_PADRAO, MATERIAS_CORES, MATERIAS_EMOJIS, getStatusEfetivo } from "@/lib/tarefasData";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import DisciplinaModal from "@/components/DisciplinaModal";
import type { Materia, Tarefa } from "@/types";
import { toast } from "sonner";

interface DisciplinasProps {
  onAbrirTarefasFiltradas?: (nome: string) => void;
}

export default function Disciplinas({ onAbrirTarefasFiltradas }: DisciplinasProps) {
  const { disciplinas, carregando, remover } = useDisciplinas();
  const { tarefas } = useTarefas();
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<string | null>(null);

  // Conta tarefas por disciplina (status efetivo)
  const contagemPorDisciplina = useMemo(() => {
    const map: Record<string, { total: number; pendentes: number; concluidas: number; expiradas: number; urgentes: number }> = {};
    for (const t of tarefas) {
      const eff = getStatusEfetivo(t);
      const k = t.subject_name;
      map[k] ??= { total: 0, pendentes: 0, concluidas: 0, expiradas: 0, urgentes: 0 };
      map[k].total += 1;
      if (eff === "Concluída") map[k].concluidas += 1;
      else if (eff === "Passou do Prazo") map[k].expiradas += 1;
      else {
        map[k].pendentes += 1;
        // urgente = pendente com prazo até 3 dias
        if (t.due_date) {
          const fim = new Date(t.due_date.split("T")[0]);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          fim.setHours(0, 0, 0, 0);
          const dias = Math.round((fim.getTime() - hoje.getTime()) / 86_400_000);
          if (dias >= 0 && dias <= 3) map[k].urgentes += 1;
        }
      }
    }
    return map;
  }, [tarefas]);

  // Padrões ainda não adicionados (sugestões rápidas)
  const sugestoesRapidas = useMemo(
    () => MATERIAS_PADRAO.filter((n) => n !== "Outra" && !disciplinas.some((d) => d.name === n)),
    [disciplinas],
  );

  const handleRemover = async (d: Materia) => {
    if (confirmandoRemocao !== d.id) {
      setConfirmandoRemocao(d.id);
      setTimeout(() => setConfirmandoRemocao((id) => (id === d.id ? null : id)), 3000);
      return;
    }
    try {
      await remover(d.id);
      toast.success(`${d.name} removida`);
    } catch {
      toast.error("Erro ao remover disciplina");
    } finally {
      setConfirmandoRemocao(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">Disciplinas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {disciplinas.length === 0
              ? "Adicione suas disciplinas para organizar tarefas com identidade visual"
              : `${disciplinas.length} disciplina${disciplinas.length !== 1 ? "s" : ""} cadastrada${disciplinas.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setCriando(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
        >
          <Plus size={16} />
          Nova disciplina
        </Button>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Grade de cards */}
          {disciplinas.length === 0 ? (
            <EmptyState onCriar={() => setCriando(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {disciplinas.map((d, idx) => {
                const c = contagemPorDisciplina[d.name] ?? { total: 0, pendentes: 0, concluidas: 0, expiradas: 0, urgentes: 0 };
                const emoji = getMateriaEmoji(d.name, d.emoji);
                return (
                  <DisciplinaCard
                    key={d.id}
                    disciplina={d}
                    emoji={emoji}
                    contagem={c}
                    index={idx}
                    confirmandoRemocao={confirmandoRemocao === d.id}
                    onEditar={() => setEditando(d)}
                    onRemover={() => handleRemover(d)}
                    onClicar={() => onAbrirTarefasFiltradas?.(d.name)}
                  />
                );
              })}

              {/* Card para adicionar */}
              <button
                data-tour="disciplinas-nova"
                onClick={() => setCriando(true)}
                className="group relative aspect-auto min-h-[180px] rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/60 bg-white/2 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-2 p-5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Adicionar nova disciplina"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 flex items-center justify-center transition-all group-hover:scale-110">
                  <Plus size={22} className="text-amber-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-amber-400 transition-colors">
                  Adicionar disciplina
                </p>
              </button>
            </div>
          )}

          {/* Sugestões rápidas */}
          {sugestoesRapidas.length > 0 && disciplinas.length > 0 && (
            <div className="mt-8 bg-[var(--bg-card)] border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-['Space_Grotesk']">
                  Adicionar rapidamente
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sugestoesRapidas.map((nome) => (
                  <SugestaoRapida key={nome} nome={nome} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {criando && <DisciplinaModal onClose={() => setCriando(false)} />}
      {editando && <DisciplinaModal disciplina={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

// ============================================================
// Card de disciplina
// ============================================================

interface DisciplinaCardProps {
  disciplina: Materia;
  emoji: string;
  contagem: { total: number; pendentes: number; concluidas: number; expiradas: number; urgentes: number };
  index: number;
  confirmandoRemocao: boolean;
  onEditar: () => void;
  onRemover: () => void;
  onClicar: () => void;
}

function DisciplinaCard({
  disciplina,
  emoji,
  contagem,
  index,
  confirmandoRemocao,
  onEditar,
  onRemover,
  onClicar,
}: DisciplinaCardProps) {
  const cor = disciplina.color;

  return (
    <div
      className="group relative rounded-2xl border border-white/8 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-amber-500"
      style={{
        animationDelay: `${index * 40}ms`,
        animation: "fadeSlideIn 0.3s ease-out both",
      }}
      onClick={onClicar}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClicar()}
      aria-label={`Filtrar tarefas da disciplina ${disciplina.name}`}
    >
      {/* Faixa colorida no topo */}
      <div className="h-1.5 w-full" style={{ backgroundColor: cor }} />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${cor}25`, border: `1px solid ${cor}50` }}
          >
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold truncate font-['Space_Grotesk']"
              style={{ color: cor }}
              title={disciplina.name}
            >
              {disciplina.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {contagem.total === 0
                ? "Nenhuma tarefa"
                : `${contagem.total} tarefa${contagem.total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat
            icon={<Clock size={11} />}
            label="Pendentes"
            valor={contagem.pendentes}
            color={contagem.urgentes > 0 ? "#ef4444" : "#94a3b8"}
            destaque={contagem.urgentes > 0 ? `${contagem.urgentes} urgente${contagem.urgentes !== 1 ? "s" : ""}` : null}
          />
          <Stat
            icon={<CheckCircle2 size={11} />}
            label="Feitas"
            valor={contagem.concluidas}
            color="#10b981"
          />
          <Stat
            icon={<XCircle size={11} />}
            label="Vencidas"
            valor={contagem.expiradas}
            color={contagem.expiradas > 0 ? "#ef4444" : "#64748b"}
          />
        </div>

        {/* Ações — visíveis no mobile, hover no desktop */}
        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditar();
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={`Editar ${disciplina.name}`}
          >
            <Pencil size={11} />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemover();
            }}
            className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${
              confirmandoRemocao ? "text-red-400 font-semibold" : "text-slate-400 hover:text-red-400"
            }`}
            aria-label={confirmandoRemocao ? `Confirmar remoção de ${disciplina.name}` : `Remover ${disciplina.name}`}
          >
            <Trash2 size={11} />
            {confirmandoRemocao ? "Confirmar?" : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  valor,
  color,
  destaque,
}: {
  icon: React.ReactNode;
  label: string;
  valor: number;
  color: string;
  destaque?: string | null;
}) {
  return (
    <div className="bg-white/4 rounded-lg p-2 border border-white/6">
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-[10px] text-slate-500 truncate">{label}</span>
      </div>
      <p className="text-lg font-bold font-['Space_Grotesk'] leading-tight mt-0.5" style={{ color }}>
        {valor}
      </p>
      {destaque && <p className="text-[9px] text-red-400 font-medium leading-none">{destaque}</p>}
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================

function EmptyState({ onCriar }: { onCriar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-4">
        <BookOpen size={32} className="text-amber-400" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 font-['Space_Grotesk']">
        Nenhuma disciplina cadastrada
      </p>
      <p className="text-slate-500 text-sm mb-5 max-w-sm">
        Adicione disciplinas para dar identidade visual às suas tarefas — com emoji, cor e organização própria.
      </p>
      <Button onClick={onCriar} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
        <Plus size={16} />
        Criar primeira disciplina
      </Button>
    </div>
  );
}

// ============================================================
// Sugestão rápida (botão para adicionar uma padrão de um clique)
// ============================================================

function SugestaoRapida({ nome }: { nome: string }) {
  const { criar } = useDisciplinas();
  const [adicionando, setAdicionando] = useState(false);
  const cor = MATERIAS_CORES[nome] ?? "#94a3b8";
  const emoji = MATERIAS_EMOJIS[nome] ?? "📘";

  const adicionar = async () => {
    setAdicionando(true);
    try {
      await criar({ name: nome, color: cor, emoji });
      toast.success(`${nome} adicionada!`);
    } catch {
      toast.error("Erro ao adicionar");
    } finally {
      setAdicionando(false);
    }
  };

  return (
    <button
      onClick={adicionar}
      disabled={adicionando}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all hover:scale-105"
      style={{
        backgroundColor: `${cor}15`,
        borderColor: `${cor}40`,
        color: cor,
      }}
    >
      {adicionando ? <Loader2 size={11} className="animate-spin" /> : <span className="text-base leading-none">{emoji}</span>}
      <span className="font-medium">{nome}</span>
      <Plus size={11} />
    </button>
  );
}

export type { Tarefa };
