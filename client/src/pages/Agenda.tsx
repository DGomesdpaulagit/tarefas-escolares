import { useTarefas, calcularDiasRestantes } from "@/contexts/TarefasContext";
import { getMateriaColor, getStatusColor, formatarData } from "@/lib/tarefasData";
import type { Tarefa } from "@/types";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import TarefaForm from "@/components/TarefaForm";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDiasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

function getPrimeiroDiaSemana(ano: number, mes: number): number {
  return new Date(ano, mes, 1).getDay();
}

export default function Agenda() {
  const { tarefas, carregando } = useTarefas();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);

  const diasNoMes = getDiasNoMes(ano, mes);
  const primeiroDia = getPrimeiroDiaSemana(ano, mes);

  const tarefasPorDia: Record<number, Tarefa[]> = {};
  tarefas.forEach((t) => {
    if (!t.due_date) return;
    const data = new Date(t.due_date + "T12:00:00");
    if (data.getFullYear() === ano && data.getMonth() === mes) {
      const dia = data.getDate();
      tarefasPorDia[dia] = [...(tarefasPorDia[dia] ?? []), t];
    }
  });

  const irMesAnterior = () => {
    if (mes === 0) { setAno(ano - 1); setMes(11); }
    else setMes(mes - 1);
    setDiaSelecionado(null);
  };

  const irProximoMes = () => {
    if (mes === 11) { setAno(ano + 1); setMes(0); }
    else setMes(mes + 1);
    setDiaSelecionado(null);
  };

  const tarefasDoDia = diaSelecionado ? (tarefasPorDia[diaSelecionado] ?? []) : [];

  const isHoje = (dia: number) =>
    dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Agenda</h1>
        <p className="text-slate-400 text-sm mt-1">Visualize suas tarefas por data de entrega</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-[#1a1d27] border border-white/8 rounded-xl p-5">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={irMesAnterior}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-base font-semibold text-white font-['Space_Grotesk']">
                {MESES[mes]} {ano}
              </h2>
              <button
                onClick={irProximoMes}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1;
                const temTarefas = !!tarefasPorDia[dia];
                const tarefasDia = tarefasPorDia[dia] ?? [];
                const temAtrasada = tarefasDia.some((t) => t.status === "Passou do Prazo");
                const selecionado = diaSelecionado === dia;

                return (
                  <button
                    key={dia}
                    onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                    className={`
                      relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm transition-all
                      focus:outline-none focus:ring-2 focus:ring-amber-500
                      ${isHoje(dia) ? "ring-2 ring-amber-500" : ""}
                      ${selecionado ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/5 text-slate-300"}
                    `}
                    aria-label={`${dia} ${MESES[mes]}${temTarefas ? ` — ${tarefasDia.length} tarefa(s)` : ""}`}
                    aria-pressed={selecionado}
                  >
                    <span className={`font-medium text-xs ${isHoje(dia) ? "text-amber-400" : ""}`}>{dia}</span>
                    {temTarefas && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {tarefasDia.slice(0, 3).map((t, ti) => (
                          <span
                            key={ti}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: temAtrasada ? "#ef4444" : getMateriaColor(t.subject_name) }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/8">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full ring-2 ring-amber-500 inline-block" />
                <span className="text-xs text-slate-500">Hoje</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-xs text-slate-500">Com tarefas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                <span className="text-xs text-slate-500">Atrasadas</span>
              </div>
            </div>
          </div>

          {/* Painel lateral com tarefas do dia */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
            {diaSelecionado ? (
              <>
                <h3 className="text-sm font-semibold text-white mb-4 font-['Space_Grotesk']">
                  {diaSelecionado} de {MESES[mes]}
                  <span className="text-slate-500 font-normal ml-2 text-xs">
                    {tarefasDoDia.length} tarefa(s)
                  </span>
                </h3>
                {tarefasDoDia.length === 0 ? (
                  <p className="text-slate-500 text-sm">Nenhuma tarefa neste dia</p>
                ) : (
                  <div className="space-y-2">
                    {tarefasDoDia.map((t) => {
                      const dias = calcularDiasRestantes(t.due_date);
                      const cor = getMateriaColor(t.subject_name);
                      const statusCor = getStatusColor(t.status);
                      return (
                        <div
                          key={t.id}
                          className="bg-white/5 border border-white/8 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-all"
                          onClick={() => setTarefaEditando(t)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setTarefaEditando(t)}
                          aria-label={`Editar: ${t.title}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-full min-h-[32px] rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${t.status === "Concluída" ? "line-through text-slate-500" : "text-slate-200"}`}>
                                {t.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: cor, backgroundColor: `${cor}20`, border: `1px solid ${cor}30` }}>
                                  {t.subject_name}
                                </span>
                                <span className="text-xs" style={{ color: statusCor }}>
                                  {t.status}
                                </span>
                              </div>
                              {dias !== null && (
                                <p className={`text-xs mt-1 ${dias < 0 ? "text-red-400" : dias <= 3 ? "text-amber-400" : "text-slate-500"}`}>
                                  {dias < 0 ? `${Math.abs(dias)}d atrás` : dias === 0 ? "Hoje!" : `${dias}d restantes`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                <p className="font-medium text-slate-400 mb-1">Selecione um dia</p>
                <p className="text-xs">Clique em uma data para ver as tarefas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tarefaEditando && (
        <TarefaForm tarefa={tarefaEditando} onClose={() => setTarefaEditando(null)} />
      )}
    </div>
  );
}
