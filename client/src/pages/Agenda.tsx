import { useTarefas } from "@/contexts/TarefasContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import {
  getMateriaColor,
  getStatusColor,
  getStatusEfetivo,
  getMateriaEmoji,
  parseDueDateLocal,
  labelDiasRestantes,
  diasAteVencimento,
} from "@/lib/tarefasData";
import type { Tarefa } from "@/types";
import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import TarefaForm from "@/components/TarefaForm";

// ============================================================
// Helpers de semana
// ============================================================

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_CURTOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/** Retorna o domingo (00:00 local) da semana de uma data. */
function inicioDaSemana(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

/** Adiciona n dias a uma data (cópia). */
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Formata YYYY-MM-DD a partir de um Date local. */
function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dd}`;
}

/** Title humano: "12 — 18 de Mai 2026" ou cruza meses. */
function rotuloSemana(inicio: Date): string {
  const fim = addDays(inicio, 6);
  const sMes = MESES_CURTOS[inicio.getMonth()];
  const fMes = MESES_CURTOS[fim.getMonth()];
  if (inicio.getMonth() === fim.getMonth()) {
    return `${inicio.getDate()} — ${fim.getDate()} de ${sMes} ${inicio.getFullYear()}`;
  }
  return `${inicio.getDate()} ${sMes} — ${fim.getDate()} ${fMes} ${fim.getFullYear()}`;
}

// ============================================================
// Página
// ============================================================

type Visao = "semana" | "mes";

export default function Agenda() {
  const { tarefas, carregando } = useTarefas();
  const { disciplinas } = useDisciplinas();

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [visao, setVisao] = useState<Visao>("semana");
  const [inicioSemana, setInicioSemana] = useState<Date>(() => inicioDaSemana(new Date()));
  const [mesAtual, setMesAtual] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [criandoData, setCriandoData] = useState<string | null>(null);
  const [diaSelecionadoMes, setDiaSelecionadoMes] = useState<string | null>(null);

  // Agrupar tarefas por YYYY-MM-DD para acesso O(1)
  const tarefasPorDia = useMemo(() => {
    const map: Record<string, Tarefa[]> = {};
    for (const t of tarefas) {
      if (!t.due_date) continue;
      const data = parseDueDateLocal(t.due_date);
      const k = ymd(data);
      (map[k] ??= []).push(t);
    }
    // ordena cada dia: pendentes urgentes/normais primeiro, depois concluídas, depois expiradas
    const bucket = (t: Tarefa) => {
      const eff = getStatusEfetivo(t);
      if (eff === "Passou do Prazo") return 3;
      if (eff === "Concluída") return 2;
      return 1;
    };
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => bucket(a) - bucket(b));
    }
    return map;
  }, [tarefas]);

  // Disciplinas indexadas por nome para lookup rápido
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

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i)),
    [inicioSemana],
  );

  const semanaAnterior = () => setInicioSemana((d) => addDays(d, -7));
  const proximaSemana = () => setInicioSemana((d) => addDays(d, 7));
  const mesAnterior = () =>
    setMesAtual((m) => {
      const x = new Date(m);
      x.setMonth(x.getMonth() - 1);
      return x;
    });
  const proximoMes = () =>
    setMesAtual((m) => {
      const x = new Date(m);
      x.setMonth(x.getMonth() + 1);
      return x;
    });
  const irHoje = () => {
    if (visao === "semana") setInicioSemana(inicioDaSemana(new Date()));
    else {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      setMesAtual(d);
    }
  };

  const totalDaSemana = dias.reduce((acc, d) => acc + (tarefasPorDia[ymd(d)]?.length ?? 0), 0);
  const totalDoMes = useMemo(() => {
    let n = 0;
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    for (const k of Object.keys(tarefasPorDia)) {
      const [y, m] = k.split("-").map(Number);
      if (y === ano && m - 1 === mes) n += tarefasPorDia[k].length;
    }
    return n;
  }, [tarefasPorDia, mesAtual]);

  const rotuloCabecalho =
    visao === "semana"
      ? rotuloSemana(inicioSemana)
      : `${["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;
  const totalRotulo = visao === "semana" ? totalDaSemana : totalDoMes;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {visao === "semana" ? "Agenda semanal" : "Agenda mensal"}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
            <CalendarDays size={13} />
            {rotuloCabecalho}
            <span className="text-slate-600">·</span>
            <span>{totalRotulo} tarefa{totalRotulo !== 1 ? "s" : ""}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Semana/Mês */}
          <div className="inline-flex p-0.5 rounded-lg border border-white/10 bg-white/5">
            <button
              onClick={() => setVisao("semana")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                visao === "semana"
                  ? "bg-amber-500 text-black"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              aria-pressed={visao === "semana"}
            >
              Semana
            </button>
            <button
              onClick={() => setVisao("mes")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                visao === "mes"
                  ? "bg-amber-500 text-black"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              aria-pressed={visao === "mes"}
            >
              Mês
            </button>
          </div>

          {/* Navegação */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={visao === "semana" ? semanaAnterior : mesAnterior}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={visao === "semana" ? "Semana anterior" : "Mês anterior"}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={irHoje}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Hoje
            </button>
            <button
              onClick={visao === "semana" ? proximaSemana : proximoMes}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={visao === "semana" ? "Próxima semana" : "Próximo mês"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        </div>
      ) : visao === "semana" ? (
        <>
          {/* Grade semanal */}
          <div
            className="grid grid-cols-7 gap-1.5 sm:gap-2.5 rounded-2xl"
            key={ymd(inicioSemana)}
            style={{ animation: "fadeSlideIn 0.25s ease-out both" }}
          >
            {dias.map((dia) => {
              const key = ymd(dia);
              const isHoje = dia.getTime() === hoje.getTime();
              const tarefasDia = tarefasPorDia[key] ?? [];
              return (
                <DiaColuna
                  key={key}
                  dia={dia}
                  ymdKey={key}
                  isHoje={isHoje}
                  tarefas={tarefasDia}
                  corDaTarefa={corDaTarefa}
                  emojiDaTarefa={emojiDaTarefa}
                  onClicarTarefa={(t) => setEditando(t)}
                  onCriarRapido={(data) => setCriandoData(data)}
                />
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
            <Sparkles size={11} className="text-amber-400" />
            Toque rápido para editar. Pressione e segure um dia para criar tarefa.
          </p>
        </>
      ) : (
        <VisaoMensal
          mesAtual={mesAtual}
          hoje={hoje}
          tarefasPorDia={tarefasPorDia}
          corDaTarefa={corDaTarefa}
          emojiDaTarefa={emojiDaTarefa}
          diaSelecionado={diaSelecionadoMes}
          onSelecionarDia={setDiaSelecionadoMes}
          onClicarTarefa={(t) => setEditando(t)}
          onCriarRapido={(data) => setCriandoData(data)}
        />
      )}

      {editando && <TarefaForm tarefa={editando} onClose={() => setEditando(null)} />}
      {criandoData && (
        <TarefaForm initialDueDate={criandoData} onClose={() => setCriandoData(null)} />
      )}
    </div>
  );
}

// ============================================================
// Coluna de um dia
// ============================================================

interface DiaColunaProps {
  dia: Date;
  ymdKey: string;
  isHoje: boolean;
  tarefas: Tarefa[];
  corDaTarefa: (t: Tarefa) => string;
  emojiDaTarefa: (t: Tarefa) => string;
  onClicarTarefa: (t: Tarefa) => void;
  onCriarRapido: (data: string) => void;
}

function DiaColuna({
  dia,
  ymdKey,
  isHoje,
  tarefas,
  corDaTarefa,
  emojiDaTarefa,
  onClicarTarefa,
  onCriarRapido,
}: DiaColunaProps) {
  // Long-press na coluna inteira — funciona mesmo em dias com tarefas
  const longPress = useLongPress(() => onCriarRapido(ymdKey), 450);

  return (
    <div
      className={`flex flex-col rounded-2xl border transition-all overflow-hidden min-h-[260px] sm:min-h-[420px] touch-none select-none ${
        isHoje
          ? "border-amber-500/60 bg-amber-500/5"
          : "border-white/8 bg-[var(--bg-card)] hover:border-white/15"
      }`}
      {...longPress}
      title="Pressione e segure para criar tarefa neste dia"
    >
      {/* Cabeçalho do dia */}
      <div
        className={`flex flex-col items-center pt-2 pb-1.5 ${
          isHoje ? "bg-amber-500/10" : "bg-white/2"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold ${
            isHoje ? "text-amber-500" : "text-slate-500"
          }`}
        >
          {DIAS_CURTOS[dia.getDay()]}
        </span>
        <span
          className={`text-base sm:text-lg font-bold leading-none mt-0.5 font-['Space_Grotesk'] ${
            isHoje ? "text-amber-500" : "text-slate-900 dark:text-white"
          }`}
        >
          {dia.getDate()}
        </span>
        {tarefas.length > 0 && (
          <span className="text-[9px] text-slate-500 mt-0.5">{tarefas.length}</span>
        )}
      </div>

      {/* Lista de tarefas */}
      <div className="flex-1 px-1 sm:px-1.5 py-1.5 space-y-1 overflow-y-auto flex flex-col">
        {tarefas.length === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCriarRapido(ymdKey);
            }}
            className="w-full flex-1 min-h-[120px] flex flex-col items-center justify-center rounded-lg border border-dashed border-white/8 text-slate-600 hover:border-amber-500/40 hover:text-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={`Adicionar tarefa em ${dia.getDate()}`}
          >
            <Plus size={14} className="opacity-50" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 opacity-70">Adicionar</span>
          </button>
        ) : (
          <>
            {tarefas.map((t) => (
              <MiniCard
                key={t.id}
                tarefa={t}
                cor={corDaTarefa(t)}
                emoji={emojiDaTarefa(t)}
                onClick={() => onClicarTarefa(t)}
              />
            ))}
            {/* Botão "+" sempre disponível mesmo quando o dia tem tarefas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCriarRapido(ymdKey);
              }}
              className="mt-1 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed border-white/10 text-slate-500 hover:border-amber-500/40 hover:text-amber-500 hover:bg-amber-500/5 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={`Adicionar nova tarefa em ${dia.getDate()}`}
              title="Adicionar tarefa neste dia"
            >
              <Plus size={11} />
              <span className="text-[9px] sm:text-[10px] font-medium">Nova</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Mini card de tarefa
// ============================================================

function MiniCard({
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
  const eff = getStatusEfetivo(tarefa);
  const expirada = eff === "Passou do Prazo";
  const concluida = eff === "Concluída";
  const dias = diasAteVencimento(tarefa.due_date);
  const urgente = !concluida && !expirada && dias !== null && dias >= 0 && dias <= 3;
  const statusCor = getStatusColor(eff);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left rounded-lg p-1.5 sm:p-2 border transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
        expirada
          ? "bg-red-500/5 border-red-500/30"
          : concluida
          ? "opacity-60 hover:opacity-90"
          : "hover:border-white/20"
      }`}
      style={{
        backgroundColor: expirada ? undefined : `${cor}12`,
        borderColor: expirada ? undefined : `${cor}35`,
      }}
      aria-label={`${tarefa.title} — ${tarefa.subject_name}`}
      title={`${tarefa.title}${labelDiasRestantes(dias) ? " — " + labelDiasRestantes(dias) : ""}`}
    >
      <div className="flex items-start gap-1 sm:gap-1.5">
        <span className="text-sm sm:text-base leading-tight shrink-0" aria-hidden="true">
          {emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] sm:text-xs font-medium leading-tight line-clamp-2 ${
              concluida || expirada
                ? "line-through text-slate-500"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {tarefa.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ backgroundColor: statusCor }}
              aria-hidden="true"
            />
            <span
              className="text-[8px] sm:text-[9px] truncate font-medium"
              style={{ color: cor }}
            >
              {tarefa.subject_name}
            </span>
            {urgente && (
              <span className="text-[8px] sm:text-[9px] font-bold text-red-500 ml-auto shrink-0">
                !
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// Visão mensal
// ============================================================

interface VisaoMensalProps {
  mesAtual: Date;
  hoje: Date;
  tarefasPorDia: Record<string, Tarefa[]>;
  corDaTarefa: (t: Tarefa) => string;
  emojiDaTarefa: (t: Tarefa) => string;
  diaSelecionado: string | null;
  onSelecionarDia: (k: string | null) => void;
  onClicarTarefa: (t: Tarefa) => void;
  onCriarRapido: (data: string) => void;
}

function VisaoMensal({
  mesAtual,
  hoje,
  tarefasPorDia,
  corDaTarefa,
  emojiDaTarefa,
  diaSelecionado,
  onSelecionarDia,
  onClicarTarefa,
  onCriarRapido,
}: VisaoMensalProps) {
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const tarefasDoDiaSelecionado = diaSelecionado
    ? (tarefasPorDia[diaSelecionado] ?? [])
    : [];
  const diaSelecionadoData = diaSelecionado ? parseDueDateLocal(diaSelecionado) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" key={`${ano}-${mes}`} style={{ animation: "fadeSlideIn 0.25s ease-out both" }}>
      <div className="lg:col-span-2 bg-[var(--bg-card)] border border-white/8 rounded-2xl p-4 sm:p-5">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_CURTOS.map((d) => (
            <div key={d} className="text-center text-xs text-slate-500 font-semibold py-1.5 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: diasNoMes }).map((_, i) => {
            const dia = i + 1;
            const dataObj = new Date(ano, mes, dia);
            dataObj.setHours(0, 0, 0, 0);
            const k = ymd(dataObj);
            const tarefasDia = tarefasPorDia[k] ?? [];
            const isHoje = dataObj.getTime() === hoje.getTime();
            const selecionado = diaSelecionado === k;
            const temExpirada = tarefasDia.some((t) => getStatusEfetivo(t) === "Passou do Prazo");

            return (
              <CelulaMes
                key={k}
                ymdKey={k}
                dia={dia}
                tarefas={tarefasDia}
                isHoje={isHoje}
                selecionado={selecionado}
                temExpirada={temExpirada}
                corDaTarefa={corDaTarefa}
                emojiDaTarefa={emojiDaTarefa}
                onClick={() => onSelecionarDia(selecionado ? null : k)}
                onLongPress={() => onCriarRapido(k)}
              />
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
          <Sparkles size={11} className="text-amber-400" />
          Toque para ver tarefas do dia. Pressione e segure para criar.
        </p>
      </div>

      {/* Painel lateral */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-2xl p-4 sm:p-5">
        {diaSelecionadoData ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {DIAS_CURTOS[diaSelecionadoData.getDay()]}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {diaSelecionadoData.getDate()} de {MESES_CURTOS[diaSelecionadoData.getMonth()]}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tarefasDoDiaSelecionado.length} tarefa{tarefasDoDiaSelecionado.length !== 1 ? "s" : ""}
                </p>
              </div>
              {diaSelecionado && (
                <button
                  onClick={() => onCriarRapido(diaSelecionado)}
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Criar tarefa neste dia"
                  title="Criar tarefa"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {tarefasDoDiaSelecionado.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                Sem tarefas neste dia.
              </p>
            ) : (
              <div className="space-y-2">
                {tarefasDoDiaSelecionado.map((t) => (
                  <MiniCard
                    key={t.id}
                    tarefa={t}
                    cor={corDaTarefa(t)}
                    emoji={emojiDaTarefa(t)}
                    onClick={() => onClicarTarefa(t)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <CalendarDays size={28} className="mx-auto opacity-40 mb-2" />
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione um dia</p>
            <p className="text-xs">Toque numa data para ver as tarefas</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Célula do mês
// ============================================================

interface CelulaMesProps {
  ymdKey: string;
  dia: number;
  tarefas: Tarefa[];
  isHoje: boolean;
  selecionado: boolean;
  temExpirada: boolean;
  corDaTarefa: (t: Tarefa) => string;
  emojiDaTarefa: (t: Tarefa) => string;
  onClick: () => void;
  onLongPress: () => void;
}

function CelulaMes({
  dia,
  tarefas,
  isHoje,
  selecionado,
  temExpirada,
  corDaTarefa,
  emojiDaTarefa,
  onClick,
  onLongPress,
}: CelulaMesProps) {
  const longPress = useLongPress(onLongPress, 450);

  return (
    <button
      onClick={onClick}
      {...longPress}
      className={`relative aspect-square flex flex-col items-center pt-1.5 rounded-lg text-sm transition-all touch-none select-none focus:outline-none focus:ring-2 focus:ring-amber-500 ${
        isHoje ? "ring-2 ring-amber-500/70" : ""
      } ${
        selecionado
          ? "bg-amber-500/20"
          : tarefas.length > 0
          ? "hover:bg-white/10 bg-white/3"
          : "hover:bg-white/5"
      }`}
      title="Toque para ver tarefas, segure para criar"
    >
      <span
        className={`text-xs font-semibold ${
          isHoje ? "text-amber-500" : selecionado ? "text-amber-400" : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {dia}
      </span>
      {tarefas.length > 0 && (
        <>
          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-full px-0.5">
            {tarefas.slice(0, 3).map((t, ti) => {
              const eff = getStatusEfetivo(t);
              const cor = eff === "Passou do Prazo" ? "#ef4444" : corDaTarefa(t);
              return (
                <span
                  key={ti}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: cor, opacity: eff === "Concluída" ? 0.4 : 1 }}
                />
              );
            })}
            {tarefas.length > 3 && (
              <span className="text-[8px] text-slate-500 leading-none">+{tarefas.length - 3}</span>
            )}
          </div>
          {/* Emoji da primeira disciplina como mini-identidade */}
          <span className="text-[10px] leading-none mt-0.5 opacity-70" aria-hidden="true">
            {emojiDaTarefa(tarefas[0])}
          </span>
        </>
      )}
      {temExpirada && !selecionado && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
      )}
    </button>
  );
}

// ============================================================
// Hook: press-and-hold
// ============================================================

function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const start = (e: React.PointerEvent) => {
    // Ignora cliques com botão direito ou em elementos filhos focáveis
    if (e.button !== undefined && e.button !== 0) return;
    triggeredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      triggeredRef.current = true;
      // Feedback tátil em dispositivos compatíveis
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(15); } catch { /* ignore */ }
      }
      callback();
    }, ms);
  };

  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Em mobile, scroll move o ponteiro — cancele se mover muito
    onPointerMove: (e: React.PointerEvent) => {
      if (timerRef.current !== null && (Math.abs(e.movementX) > 4 || Math.abs(e.movementY) > 4)) {
        cancel();
      }
    },
  };
}
