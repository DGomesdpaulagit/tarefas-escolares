import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Clock, DollarSign, Loader2, XCircle } from "lucide-react";

/**
 * Painel público do responsável — sem login, sem senha. A autenticação é o
 * próprio token da URL: longo, aleatório, não enumerável (guardians.access_token).
 * Mostra tudo que o pai pediu: tarefas, desempenho e mesada.
 *
 * Fica fora do gate de autenticação e do Welcome (ver App.tsx), assim como
 * /descadastrar — quem abre não tem conta no app.
 */

type Tarefa = {
  id: string;
  title: string;
  subject_name: string;
  status_efetivo: string;
  priority: string;
  due_date: string | null;
};

type Metricas = {
  total: number;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  passouPrazo: number;
  percentualConcluido: number;
  porMateria: Record<string, number>;
};

type NotaMesada = { mes: number; conceito: string; valor: number };
type MateriaMesada = { nome: string; emoji: string | null; cor: string; notas: NotaMesada[] };
type Mesada = { anoLetivo: number; meta: number; valorAcumulado: number; porMateria: MateriaMesada[] };

type DadosPainel = {
  estudante: { nome: string };
  responsavel: { nome: string | null };
  tarefas: Tarefa[];
  metricas: Metricas;
  mesada: Mesada | null;
};

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const STATUS_COR: Record<string, string> = {
  "Concluída": "text-emerald-500",
  "Passou do Prazo": "text-red-400",
  "Em Andamento": "text-blue-400",
  "Não iniciada": "text-slate-400",
};

export default function PainelResponsavel() {
  const [estado, setEstado] = useState<"carregando" | "ok" | "invalido">("carregando");
  const [dados, setDados] = useState<DadosPainel | null>(null);

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    if (!token) { setEstado("invalido"); return; }
    let vivo = true;
    fetch(`${FUNCTIONS_URL}/guardian-dashboard?token=${encodeURIComponent(token)}`, {
      headers: { apikey: ANON_KEY },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: DadosPainel) => { if (vivo) { setDados(d); setEstado("ok"); } })
      .catch(() => { if (vivo) setEstado("invalido"); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (estado === "carregando") {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 size={28} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  if (estado === "invalido" || !dados) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-white font-['Space_Grotesk']">Link inválido</h1>
          <p className="text-sm text-slate-500 mt-2">
            Este link não é válido ou o acompanhamento foi cancelado. Fale com quem te enviou o link.
          </p>
        </div>
      </div>
    );
  }

  const saudacao = dados.responsavel.nome ? `Bem-vindo, ${dados.responsavel.nome}` : "Bem-vindo";

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-amber-500" />
            <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
              Tarefas Escolares
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">{saudacao}!</h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe tudo das matérias de {dados.estudante.nome}.
          </p>
        </header>

        {/* Resumo de desempenho */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CardStat rotulo="Total de tarefas" valor={dados.metricas.total} />
          <CardStat rotulo="Concluídas" valor={dados.metricas.concluidas} cor="text-emerald-500" />
          <CardStat rotulo="Pendentes" valor={dados.metricas.pendentes + dados.metricas.emAndamento} cor="text-amber-400" />
          <CardStat rotulo="Atrasadas" valor={dados.metricas.passouPrazo} cor="text-red-400" />
        </section>

        <section className="bg-[#1a1d27] border border-white/8 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Progresso geral</p>
            <p className="text-sm font-bold text-amber-400">{dados.metricas.percentualConcluido}%</p>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              style={{ width: `${dados.metricas.percentualConcluido}%` }}
            />
          </div>
        </section>

        {/* Mesada, se existir */}
        {dados.mesada && (
          <section className="bg-[#1a1d27] border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-emerald-500" />
              <p className="text-sm font-semibold text-white font-['Space_Grotesk']">
                Mesada por desempenho — {dados.mesada.anoLetivo}
              </p>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-emerald-500">
                {dados.mesada.valorAcumulado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="text-xs text-slate-500">
                de {dados.mesada.meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de meta
              </span>
            </div>
            <div className="space-y-1.5">
              {dados.mesada.porMateria.filter((m) => m.notas.length > 0).map((m) => (
                <div key={m.nome} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-slate-300">{m.emoji} {m.nome}</span>
                  <span className="text-slate-500">{m.notas.length} lançamento{m.notas.length !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lista de tarefas */}
        <section>
          <p className="text-sm font-semibold text-white font-['Space_Grotesk'] mb-2">Tarefas</p>
          {dados.tarefas.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhuma tarefa registrada ainda.</p>
          ) : (
            <div className="space-y-1.5">
              {dados.tarefas.map((t) => (
                <div key={t.id} className="flex items-center gap-3 bg-[#1a1d27] border border-white/8 rounded-lg px-3 py-2.5">
                  <StatusIcone status={t.status_efetivo} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.subject_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-medium ${STATUS_COR[t.status_efetivo] ?? "text-slate-400"}`}>
                      {t.status_efetivo}
                    </p>
                    {t.due_date && (
                      <p className="text-[11px] text-slate-500">
                        {new Date(`${t.due_date}T12:00:00`).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-4 text-center">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Este é um link de leitura enviado por {dados.estudante.nome}. Se você não reconhece este acesso, avise a pessoa que te enviou o link.
          </p>
        </footer>
      </div>
    </div>
  );
}

function CardStat({ rotulo, valor, cor }: { rotulo: string; valor: number; cor?: string }) {
  return (
    <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-3">
      <p className="text-xs text-slate-500">{rotulo}</p>
      <p className={`text-xl font-bold mt-0.5 ${cor ?? "text-white"}`}>{valor}</p>
    </div>
  );
}

function StatusIcone({ status }: { status: string }) {
  if (status === "Concluída") return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
  if (status === "Passou do Prazo") return <XCircle size={16} className="text-red-400 shrink-0" />;
  return <Clock size={16} className="text-slate-500 shrink-0" />;
}
