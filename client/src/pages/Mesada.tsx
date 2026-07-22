import { useMemo, useState, type CSSProperties } from "react";
import { useMesada } from "@/contexts/MesadaContext";
import MesadaMateriaModal from "@/components/MesadaMateriaModal";
import type { Conceito, MesadaMateria } from "@/types";
import {
  AlertTriangle,
  Coins,
  Loader2,
  Pencil,
  Plus,
  Settings2,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const CONCEITOS: { valor: Conceito; label: string; cor: string }[] = [
  { valor: "MB", label: "MB", cor: "#10b981" },
  { valor: "B", label: "B", cor: "#f59e0b" },
  { valor: "R", label: "R", cor: "#94a3b8" },
  { valor: "I", label: "I", cor: "#ef4444" },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#1a1d27",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
};

type Aba = "lancamentos" | "acompanhamento" | "configuracoes";

export default function Mesada() {
  const { config, materias, carregando } = useMesada();
  const [aba, setAba] = useState<Aba>("lancamentos");

  if (carregando || !config) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Mesada por Desempenho
          </h1>
        </div>
        <p className="text-slate-500 text-sm">Uso pessoal — ano letivo {config.ano_letivo}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/8 overflow-x-auto">
        <AbaBotao label="Lançamentos" ativa={aba === "lancamentos"} onClick={() => setAba("lancamentos")} />
        <AbaBotao label="Acompanhamento" ativa={aba === "acompanhamento"} onClick={() => setAba("acompanhamento")} />
        <AbaBotao label="Configurações da Mesada" ativa={aba === "configuracoes"} onClick={() => setAba("configuracoes")} />
      </div>

      {materias.length === 0 && aba !== "configuracoes" ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm mb-3">
            Nenhuma matéria do boletim cadastrada ainda.
          </p>
          <button
            onClick={() => setAba("configuracoes")}
            className="text-amber-500 hover:text-amber-400 text-sm font-medium"
          >
            Ir para Configurações e adicionar matérias →
          </button>
        </div>
      ) : (
        <>
          {aba === "lancamentos" && <AbaLancamentos />}
          {aba === "acompanhamento" && <AbaAcompanhamento />}
        </>
      )}
      {aba === "configuracoes" && <AbaConfiguracoes />}
    </div>
  );
}

function AbaBotao({ label, ativa, onClick }: { label: string; ativa: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
        ativa
          ? "border-amber-500 text-amber-400"
          : "border-transparent text-slate-500 hover:text-slate-300"
      }`}
      aria-current={ativa ? "page" : undefined}
    >
      {label}
    </button>
  );
}

// ============================================================
// Aba: Lançamentos
// ============================================================

function AbaLancamentos() {
  const { config, materias, notaDoMes, valorDoMes, lancarNota, mbUsadosNoPeriodo } = useMesada();
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  if (!config) return null;

  const valorMes = valorDoMes(mes);
  const materiasAtivas = materias.filter((m) => m.ativa);

  const handleLancar = async (materiaId: string, conceito: Conceito) => {
    setSalvandoId(materiaId);
    try {
      const { limiteMbAtingido } = await lancarNota(materiaId, mes, conceito);
      if (limiteMbAtingido) {
        toast.warning("Limite de MB no período atingido — este lançamento foi contabilizado como B");
      } else {
        toast.success("Lançamento salvo!");
      }
    } catch {
      toast.error("Erro ao salvar lançamento");
    } finally {
      setSalvandoId(null);
    }
  };

  return (
    <div>
      {/* Resumo do mês */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 rounded-2xl border border-white/8 bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mês</p>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg text-sm px-2 py-1 text-slate-900 dark:text-white"
            >
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <p
            className="text-2xl font-bold font-['Space_Grotesk']"
            style={{ color: valorMes >= 0 ? "#10b981" : "#ef4444" }}
          >
            R$ {valorMes.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">valor do mês</p>
        </div>
        <div className="flex-1 rounded-2xl border border-white/8 bg-[var(--bg-card)] p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">MBs usados no período</p>
          <p
            className={`text-2xl font-bold font-['Space_Grotesk'] ${
              mbUsadosNoPeriodo >= config.limite_mb_por_periodo ? "text-red-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {mbUsadosNoPeriodo} / {config.limite_mb_por_periodo}
          </p>
          {mbUsadosNoPeriodo >= config.limite_mb_por_periodo && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle size={11} /> Limite atingido — próximos MBs viram B
            </p>
          )}
        </div>
      </div>

      {/* Lista de matérias */}
      <div className="space-y-2">
        {materiasAtivas.map((m) => {
          const nota = notaDoMes(m.id, mes);
          return (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-white/8 bg-[var(--bg-card)]"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${m.cor}25`, border: `1px solid ${m.cor}50` }}
                >
                  {m.emoji ?? "📘"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.nome}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{m.categoria}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {CONCEITOS.map((c) => (
                  <button
                    key={c.valor}
                    disabled={salvandoId === m.id}
                    onClick={() => handleLancar(m.id, c.valor)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center disabled:opacity-50 ${
                      nota?.conceito === c.valor ? "ring-2 ring-offset-1 ring-offset-[var(--bg-card)]" : "opacity-60 hover:opacity-100"
                    }`}
                    style={
                      {
                        backgroundColor: `${c.cor}25`,
                        color: c.cor,
                        "--tw-ring-color": c.cor,
                      } as CSSProperties
                    }
                    aria-pressed={nota?.conceito === c.valor}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="w-20 text-right flex-shrink-0">
                {nota ? (
                  <span
                    className="text-sm font-bold font-['Space_Grotesk']"
                    style={{ color: nota.valor_calculado >= 0 ? "#10b981" : "#ef4444" }}
                  >
                    R$ {nota.valor_calculado.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Aba: Acompanhamento
// ============================================================

function AbaAcompanhamento() {
  const { config, notas, valorAcumulado, progressoPercentual } = useMesada();

  const dadosPorMes = useMemo(() => {
    const somaPorMes: Record<number, number> = {};
    for (const n of notas) {
      somaPorMes[n.mes] = (somaPorMes[n.mes] ?? 0) + n.valor_calculado;
    }
    return MESES.map((label, i) => ({ mes: label, valor: somaPorMes[i + 1] ?? 0 }));
  }, [notas]);

  const penalidades = useMemo(
    () => notas.filter((n) => n.conceito === "I").sort((a, b) => a.mes - b.mes),
    [notas],
  );

  if (!config) return null;

  const faltam = Math.max(0, config.meta_total - valorAcumulado);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5 flex items-center gap-5">
          <RingProgress percentual={progressoPercentual} />
          <div className="flex-1 space-y-1.5">
            <StatLinha label="Acumulado" valor={`R$ ${valorAcumulado.toFixed(2)}`} color="#f59e0b" />
            <StatLinha label="Meta" valor={`R$ ${config.meta_total.toFixed(2)}`} color="#94a3b8" />
            <StatLinha label="Faltam" valor={`R$ ${faltam.toFixed(2)}`} color="#10b981" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Evolução mensal
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dadosPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Valor"]} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dadosPorMes.map((d, i) => (
                  <Cell key={i} fill={d.valor >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {penalidades.length > 0 && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Penalidades no período
            </h3>
          </div>
          <div className="space-y-1.5">
            {penalidades.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{MESES[p.mes - 1]}</span>
                <span className="text-red-400 font-semibold">R$ {p.valor_calculado.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RingProgress({ percentual }: { percentual: number }) {
  const size = 100;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentual / 100) * c;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth={stroke} />
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
        <span className="text-xl font-bold text-amber-400 font-['Space_Grotesk'] leading-none">{percentual}%</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">da meta</span>
      </div>
    </div>
  );
}

function StatLinha({ label, valor, color }: { label: string; valor: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-bold font-['Space_Grotesk']" style={{ color }}>
        {valor}
      </span>
    </div>
  );
}

// ============================================================
// Aba: Configurações da Mesada
// ============================================================

function AbaConfiguracoes() {
  const { config, materias, atualizarConfig, removerMateria } = useMesada();
  const [editando, setEditando] = useState<MesadaMateria | null>(null);
  const [criando, setCriando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (!config) return null;

  const [form, setForm] = useState({
    mes_inicio: config.mes_inicio,
    mes_fim: config.mes_fim,
    valor_mb: config.valor_mb,
    valor_b: config.valor_b,
    valor_r: config.valor_r,
    valor_i: config.valor_i,
    limite_mb_por_periodo: config.limite_mb_por_periodo,
    meta_total: config.meta_total,
  });

  const handleSalvarConfig = async () => {
    setSalvando(true);
    try {
      await atualizarConfig(form);
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverMateria = async (id: string, nome: string) => {
    if (!confirm(`Remover "${nome}"? Todos os lançamentos dessa matéria também serão apagados.`)) return;
    try {
      await removerMateria(id);
      toast.success("Matéria removida");
    } catch {
      toast.error("Erro ao remover matéria");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Período e valores */}
      <div className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Período e valores por conceito
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <CampoNumero label="Mês de início" value={form.mes_inicio} onChange={(v) => setForm({ ...form, mes_inicio: v })} min={1} max={12} />
          <CampoNumero label="Mês final" value={form.mes_fim} onChange={(v) => setForm({ ...form, mes_fim: v })} min={1} max={12} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <CampoMoeda label="MB" value={form.valor_mb} onChange={(v) => setForm({ ...form, valor_mb: v })} />
          <CampoMoeda label="B" value={form.valor_b} onChange={(v) => setForm({ ...form, valor_b: v })} />
          <CampoMoeda label="R" value={form.valor_r} onChange={(v) => setForm({ ...form, valor_r: v })} />
          <CampoMoeda label="I (penalidade)" value={form.valor_i} onChange={(v) => setForm({ ...form, valor_i: v })} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <CampoNumero
            label="Limite de MB no período"
            value={form.limite_mb_por_periodo}
            onChange={(v) => setForm({ ...form, limite_mb_por_periodo: v })}
            min={0}
            max={50}
          />
          <CampoMoeda label="Meta total" value={form.meta_total} onChange={(v) => setForm({ ...form, meta_total: v })} />
        </div>

        <button
          onClick={handleSalvarConfig}
          disabled={salvando}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
        >
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
          Salvar configurações
        </button>
      </div>

      {/* Matérias do boletim */}
      <div className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Matérias do boletim
          </h3>
          <button
            onClick={() => setCriando(true)}
            className="text-amber-500 hover:text-amber-400 text-xs font-medium inline-flex items-center gap-1"
          >
            <Plus size={13} /> Adicionar
          </button>
        </div>

        {materias.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Nenhuma matéria cadastrada ainda</p>
        ) : (
          <div className="space-y-1.5">
            {materias.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/8 hover:border-white/15 transition-all"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${m.cor}25`, border: `1px solid ${m.cor}50` }}
                >
                  {m.emoji ?? "📘"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.nome}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{m.categoria}</p>
                </div>
                <button
                  onClick={() => setEditando(m)}
                  className="text-slate-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-white/5"
                  aria-label={`Editar ${m.nome}`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleRemoverMateria(m.id, m.nome)}
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5"
                  aria-label={`Remover ${m.nome}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {criando && <MesadaMateriaModal onClose={() => setCriando(false)} />}
      {editando && <MesadaMateriaModal materia={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

function CampoNumero({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-white/5 border border-white/10 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
      />
    </div>
  );
}

function CampoMoeda({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">R$</span>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg text-sm pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
        />
      </div>
    </div>
  );
}
