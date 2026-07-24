import { useAuth } from "@/contexts/AuthContext";
import { useTarefas } from "@/contexts/TarefasContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { profileService } from "@/services/profileService";
import {
  getMateriaColor,
  getMateriaEmoji,
  getStatusColor,
  getStatusEfetivo,
  diasAteVencimento,
  labelDiasRestantes,
  parseDueDateLocal,
} from "@/lib/tarefasData";
import type { Tarefa } from "@/types";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TarefaForm from "@/components/TarefaForm";

interface VisaoGeralProps {
  onNavegar?: (pagina: string) => void;
  onAbrirTarefasFiltradas?: (nomeDisciplina: string) => void;
}

export default function VisaoGeral({ onNavegar, onAbrirTarefasFiltradas }: VisaoGeralProps) {
  const { user } = useAuth();
  const { tarefas, carregando } = useTarefas();
  const { disciplinas } = useDisciplinas();
  const { t } = useIdioma();

  const [nome, setNome] = useState<string>("");
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);

  useEffect(() => {
    if (!user) return;
    profileService.get(user.id).then((p) => {
      const n = p?.name?.trim() || user.user_metadata?.name?.trim() || "";
      setNome(n);
    });
  }, [user]);

  // ---- Lookup de disciplinas por nome ----
  const disciplinaPorNome = useMemo(() => {
    const m: Record<string, { color: string; emoji: string }> = {};
    for (const d of disciplinas) {
      m[d.name] = { color: d.color, emoji: getMateriaEmoji(d.name, d.emoji) };
    }
    return m;
  }, [disciplinas]);
  const corDaTarefa = (t: Tarefa) =>
    disciplinaPorNome[t.subject_name]?.color ?? getMateriaColor(t.subject_name);
  const emojiDaTarefa = (t: Tarefa) =>
    disciplinaPorNome[t.subject_name]?.emoji ?? getMateriaEmoji(t.subject_name);

  // ---- Cálculos da semana ----
  const { semanaTotal, semanaConcluidas, semanaPendentes, percentualSemana } = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - inicio.getDay()); // domingo
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    fim.setHours(23, 59, 59, 999);

    const naSemana = tarefas.filter((t) => {
      if (!t.due_date) return false;
      const d = parseDueDateLocal(t.due_date);
      return d.getTime() >= inicio.getTime() && d.getTime() <= fim.getTime();
    });
    const concluidas = naSemana.filter((t) => getStatusEfetivo(t) === "Concluída").length;
    const pendentes = naSemana.filter((t) => {
      const eff = getStatusEfetivo(t);
      return eff !== "Concluída" && eff !== "Passou do Prazo";
    }).length;
    const total = naSemana.length;
    const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { semanaTotal: total, semanaConcluidas: concluidas, semanaPendentes: pendentes, percentualSemana: pct };
  }, [tarefas]);

  // ---- Próximos prazos (top 5 não concluídas, não expiradas, com prazo) ----
  const proximosPrazos = useMemo(() => {
    return tarefas
      .filter((t) => {
        const eff = getStatusEfetivo(t);
        return eff !== "Concluída" && eff !== "Passou do Prazo" && !!t.due_date;
      })
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
      .slice(0, 5);
  }, [tarefas]);

  // ---- Tarefas expiradas (top 5 recentes) ----
  const expiradas = useMemo(() => {
    return tarefas
      .filter((t) => getStatusEfetivo(t) === "Passou do Prazo")
      .sort((a, b) => (b.due_date ?? "").localeCompare(a.due_date ?? ""))
      .slice(0, 5);
  }, [tarefas]);

  // ---- Contagem por disciplina ----
  const disciplinasResumo = useMemo(() => {
    const map: Record<string, { pendentes: number; total: number }> = {};
    for (const t of tarefas) {
      const k = t.subject_name;
      map[k] ??= { pendentes: 0, total: 0 };
      map[k].total += 1;
      const eff = getStatusEfetivo(t);
      if (eff !== "Concluída" && eff !== "Passou do Prazo") map[k].pendentes += 1;
    }
    return disciplinas
      .map((d) => ({
        ...d,
        emoji: getMateriaEmoji(d.name, d.emoji),
        pendentes: map[d.name]?.pendentes ?? 0,
        total: map[d.name]?.total ?? 0,
      }))
      .sort((a, b) => b.pendentes - a.pendentes)
      .slice(0, 6);
  }, [tarefas, disciplinas]);

  // ---- Desempenho geral ----
  const desempenho = useMemo(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => getStatusEfetivo(t) === "Concluída").length;
    const expiradasTotal = tarefas.filter((t) => getStatusEfetivo(t) === "Passou do Prazo").length;
    const ativas = total - concluidas - expiradasTotal;
    const taxa = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, expiradasTotal, ativas, taxa };
  }, [tarefas]);

  const saudacao = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t("visaoGeral.bomDia");
    if (h < 18) return t("visaoGeral.boaTarde");
    return t("visaoGeral.boaNoite");
  }, [t]);

  const primeiroNome = nome.split(" ")[0] || "estudante";

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {saudacao}, {primeiroNome}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t("visaoGeral.resumoHoje")}
          </p>
        </div>
        <Button
          data-tour="vg-nova-tarefa"
          onClick={() => setCriando(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
        >
          <Plus size={16} />
          {t("visaoGeral.novaTarefa")}
        </Button>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero — Progresso da semana */}
          <CardProgressoSemana
            total={semanaTotal}
            concluidas={semanaConcluidas}
            pendentes={semanaPendentes}
            percentual={percentualSemana}
          />

          {/* Desempenho geral */}
          <CardDesempenho desempenho={desempenho} />

          {/* Próximos prazos */}
          <SecaoCard
            titulo={t("visaoGeral.proximosPrazos")}
            icon={<Clock size={14} />}
            iconColor="#f59e0b"
            acao={
              <button
                onClick={() => onNavegar?.("agenda")}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                {t("visaoGeral.agenda")} <ChevronRight size={12} />
              </button>
            }
            className="lg:col-span-2"
          >
            {proximosPrazos.length === 0 ? (
              <EmptyMini texto={t("visaoGeral.semPrazosProximos")} />
            ) : (
              <div className="space-y-2">
                {proximosPrazos.map((t) => (
                  <LinhaTarefa
                    key={t.id}
                    tarefa={t}
                    cor={corDaTarefa(t)}
                    emoji={emojiDaTarefa(t)}
                    onClick={() => setEditando(t)}
                  />
                ))}
              </div>
            )}
          </SecaoCard>

          {/* Tarefas expiradas */}
          <SecaoCard
            titulo={t("visaoGeral.tarefasExpiradas")}
            icon={<XCircle size={14} />}
            iconColor="#ef4444"
            acao={
              expiradas.length > 0 ? (
                <span className="text-xs text-red-400 font-semibold">{expiradas.length}</span>
              ) : null
            }
          >
            {expiradas.length === 0 ? (
              <EmptyMini texto={t("visaoGeral.nenhumaExpirada")} />
            ) : (
              <div className="space-y-2">
                {expiradas.map((t) => (
                  <LinhaTarefa
                    key={t.id}
                    tarefa={t}
                    cor={corDaTarefa(t)}
                    emoji={emojiDaTarefa(t)}
                    onClick={() => setEditando(t)}
                  />
                ))}
              </div>
            )}
          </SecaoCard>

          {/* Disciplinas */}
          <SecaoCard
            titulo={t("visaoGeral.suasDisciplinas")}
            icon={<Sparkles size={14} />}
            iconColor="#a78bfa"
            className="lg:col-span-3"
            acao={
              <button
                onClick={() => onNavegar?.("disciplinas")}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                {t("visaoGeral.verTodas")} <ChevronRight size={12} />
              </button>
            }
          >
            {disciplinasResumo.length === 0 ? (
              <EmptyMini texto={t("visaoGeral.adicionePrimeirasDisciplinas")} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {disciplinasResumo.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onAbrirTarefasFiltradas?.(d.name)}
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 hover:border-white/20 bg-[var(--bg-card-hover)] hover:bg-white/5 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{ backgroundColor: `${d.color}10` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${d.color}25`, border: `1px solid ${d.color}50` }}
                    >
                      {d.emoji}
                    </div>
                    <p className="text-[11px] font-semibold truncate w-full text-center" style={{ color: d.color }}>
                      {d.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {d.pendentes === 0
                        ? t("visaoGeral.emDia")
                        : `${d.pendentes} ${t(d.pendentes !== 1 ? "visaoGeral.pendentesPlural" : "visaoGeral.pendenteSingular")}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </SecaoCard>
        </div>
      )}

      {criando && <TarefaForm onClose={() => setCriando(false)} />}
      {editando && <TarefaForm tarefa={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

// ============================================================
// Card: Progresso semanal (hero)
// ============================================================

function CardProgressoSemana({
  total,
  concluidas,
  pendentes,
  percentual,
}: {
  total: number;
  concluidas: number;
  pendentes: number;
  percentual: number;
}) {
  const { t } = useIdioma();
  return (
    <div
      className="lg:col-span-2 rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5 transition-all hover:border-white/15"
      style={{ animation: "fadeSlideIn 0.3s ease-out both" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
          {t("visaoGeral.progressoSemana")}
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {total === 0
          ? t("visaoGeral.semanaVazia")
          : `${t("visaoGeral.voceConcluiu")} ${concluidas} ${t("visaoGeral.de")} ${total} ${t(total !== 1 ? "tarefas.tarefaPlural" : "tarefas.tarefaSingular")}`}
      </p>

      <div className="flex items-center gap-5">
        {/* Indicador circular */}
        <RingProgress percentual={percentual} />

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <StatLinha
            label={t("sidebar.concluidas")}
            valor={concluidas}
            color="#10b981"
            icon={<CheckCircle2 size={11} />}
          />
          <StatLinha
            label={t("sidebar.pendentes")}
            valor={pendentes}
            color="#f59e0b"
            icon={<Clock size={11} />}
          />
          <StatLinha
            label={t("visaoGeral.totalDaSemana")}
            valor={total}
            color="#94a3b8"
            icon={<CalendarDays size={11} />}
          />
        </div>
      </div>
    </div>
  );
}

function RingProgress({ percentual }: { percentual: number }) {
  const { t } = useIdioma();
  const size = 110;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentual / 100) * c;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-amber-400 font-['Space_Grotesk'] leading-none">
          {percentual}%
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{t("visaoGeral.concluidoRing")}</span>
      </div>
    </div>
  );
}

function StatLinha({
  label,
  valor,
  color,
  icon,
}: {
  label: string;
  valor: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 flex items-center gap-1.5" style={{ color }}>
        {icon}
        {label}
      </span>
      <span className="text-sm font-bold font-['Space_Grotesk']" style={{ color }}>
        {valor}
      </span>
    </div>
  );
}

// ============================================================
// Card: Desempenho geral
// ============================================================

function CardDesempenho({
  desempenho,
}: {
  desempenho: { total: number; concluidas: number; expiradasTotal: number; ativas: number; taxa: number };
}) {
  const { total, concluidas, expiradasTotal, ativas, taxa } = desempenho;
  const { t } = useIdioma();

  return (
    <div
      className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5 transition-all hover:border-white/15"
      style={{ animation: "fadeSlideIn 0.3s ease-out both", animationDelay: "60ms" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Flame size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
          {t("visaoGeral.desempenhoGeral")}
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">{t("visaoGeral.produtividadeDesdeInicio")}</p>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-slate-500">{t("visaoGeral.taxaConclusao")}</span>
            <span className="text-xl font-bold text-amber-400 font-['Space_Grotesk'] leading-none">
              {taxa}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${taxa}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <MiniStat valor={concluidas} label={t("visaoGeral.feitas")} color="#10b981" />
          <MiniStat valor={ativas} label={t("visaoGeral.ativas")} color="#f59e0b" />
          <MiniStat valor={expiradasTotal} label={t("visaoGeral.expiradas")} color="#ef4444" />
        </div>

        <p className="text-[10px] text-slate-500 text-center pt-1">
          {total === 0
            ? t("visaoGeral.adicionePrimeiraTarefa")
            : `${total} ${t(total !== 1 ? "tarefas.tarefaPlural" : "tarefas.tarefaSingular")} ${t("visaoGeral.noTotal")}`}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ valor, label, color }: { valor: number; label: string; color: string }) {
  return (
    <div className="text-center bg-white/3 rounded-lg p-2 border border-white/5">
      <p className="text-base font-bold font-['Space_Grotesk'] leading-tight" style={{ color }}>
        {valor}
      </p>
      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ============================================================
// SecaoCard genérica
// ============================================================

function SecaoCard({
  titulo,
  icon,
  iconColor,
  acao,
  children,
  className = "",
}: {
  titulo: string;
  icon: React.ReactNode;
  iconColor: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5 transition-all hover:border-white/15 ${className}`}
      style={{ animation: "fadeSlideIn 0.3s ease-out both", animationDelay: "120ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ color: iconColor }}>{icon}</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {titulo}
          </h3>
        </div>
        {acao}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Linha de tarefa (próximos prazos / expiradas)
// ============================================================

function LinhaTarefa({
  tarefa,
  cor,
  emoji,
  onClick,
}: {
  tarefa: Tarefa;
  cor: string;
  emoji: string;
  onClick: () => void;
}) {
  const { t } = useIdioma();
  const eff = getStatusEfetivo(tarefa);
  const expirada = eff === "Passou do Prazo";
  const dias = diasAteVencimento(tarefa.due_date);
  const urgente = !expirada && dias !== null && dias >= 0 && dias <= 3;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
        expirada
          ? "bg-red-500/5 border-red-500/25 hover:border-red-500/40"
          : "border-white/8 hover:border-white/20 bg-white/2"
      }`}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${cor}25`, border: `1px solid ${cor}50` }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            expirada ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"
          }`}
        >
          {tarefa.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-medium" style={{ color: cor }}>
            {tarefa.subject_name}
          </span>
          {dias !== null && (
            <>
              <span className="text-slate-600">·</span>
              <span
                className="text-[11px] font-medium"
                style={{ color: expirada ? "#ef4444" : urgente ? "#ef4444" : "#94a3b8" }}
              >
                {labelDiasRestantes(dias, t)}
              </span>
            </>
          )}
        </div>
      </div>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: getStatusColor(eff) }}
        aria-hidden="true"
      />
    </button>
  );
}

function EmptyMini({ texto }: { texto: string }) {
  return <p className="text-xs text-slate-500 text-center py-4">{texto}</p>;
}
