import { useTarefas } from "@/contexts/TarefasContext";
import { getMateriaColor, getStatusColor } from "@/lib/tarefasData";
import type { StatusTarefa } from "@/types";
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS_CORES: Record<StatusTarefa, string> = {
  Concluída: "#10b981",
  "Em Andamento": "#f59e0b",
  "Não iniciada": "#64748b",
  "Passou do Prazo": "#ef4444",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#1a1d27",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
};

export default function Metricas() {
  const { metricas } = useTarefas();

  const dadosStatus = Object.entries(metricas.porStatus).map(([status, qtd]) => ({
    name: status,
    value: qtd,
    color: STATUS_CORES[status as StatusTarefa] ?? "#94a3b8",
  }));

  const dadosMateria = Object.entries(metricas.porMateria)
    .sort((a, b) => b[1] - a[1])
    .map(([materia, qtd]) => ({
      name: materia.length > 12 ? materia.slice(0, 12) + "…" : materia,
      fullName: materia,
      value: qtd,
      fill: getMateriaColor(materia),
    }));

  const dadosSetor = Object.entries(metricas.porSetor)
    .sort((a, b) => b[1] - a[1])
    .map(([setor, qtd]) => ({ name: setor, value: qtd }));

  const taxaConclusao = metricas.total > 0
    ? `${Math.round((metricas.concluidas / metricas.total) * 100)}%`
    : "0%";

  const materiasComAtraso = Object.entries(metricas.porMateria)
    .filter(([materia]) => {
      // Identificar matérias que podem ter tarefas atrasadas (simplificado)
      return metricas.porStatus["Passou do Prazo"] > 0;
    })
    .slice(0, 3)
    .map(([materia]) => materia);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Métricas</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral do seu desempenho escolar</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total" valor={metricas.total} cor="#94a3b8" sufixo="tarefas" />
        <KpiCard label="Concluídas" valor={metricas.concluidas} cor="#10b981" sufixo={taxaConclusao} />
        <KpiCard label="Em Andamento" valor={metricas.emAndamento} cor="#f59e0b" sufixo="tarefas" />
        <KpiCard label="Atrasadas" valor={metricas.passouPrazo} cor="#ef4444" sufixo="tarefas" />
      </div>

      {/* Insights analíticos */}
      {metricas.total > 0 && (
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 font-['Space_Grotesk']">Perfil Analítico</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-green-400 font-['Space_Grotesk']">{taxaConclusao}</p>
              <p className="text-xs text-slate-500 mt-1">
                {metricas.concluidas} de {metricas.total} tarefas
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Taxa de Atraso</p>
              <p className="text-2xl font-bold text-red-400 font-['Space_Grotesk']">
                {metricas.total > 0 ? `${Math.round((metricas.passouPrazo / metricas.total) * 100)}%` : "0%"}
              </p>
              <p className="text-xs text-slate-500 mt-1">{metricas.passouPrazo} tarefas atrasadas</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Ponto de Atenção</p>
              {metricas.passouPrazo > 0 ? (
                <p className="text-sm text-amber-400 font-medium mt-1">
                  {metricas.passouPrazo} tarefa(s) passou(aram) do prazo
                </p>
              ) : metricas.emAndamento > 0 ? (
                <p className="text-sm text-green-400 font-medium mt-1">
                  Sem atrasos — {metricas.emAndamento} em andamento
                </p>
              ) : (
                <p className="text-sm text-slate-400 font-medium mt-1">Nenhum ponto crítico</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 font-['Space_Grotesk']">Distribuição por Status</h3>
          {dadosStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dadosStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {dadosStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend formatter={(value) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>

        {dadosSetor.length > 0 && (
          <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 font-['Space_Grotesk']">Tarefas por Setor</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosSetor} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Tarefas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {dadosMateria.length > 0 && (
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 font-['Space_Grotesk']">Tarefas por Matéria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosMateria} margin={{ left: 0, right: 16, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, _name, props) => [value, props.payload.fullName]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tarefas">
                {dadosMateria.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Progresso Geral</h3>
          <span className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{metricas.percentualConcluido}%</span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={metricas.percentualConcluido} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${metricas.percentualConcluido}%`, background: "linear-gradient(90deg, #f59e0b, #10b981)" }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{metricas.concluidas} concluídas</span>
          <span>{metricas.total - metricas.concluidas} restantes</span>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, valor, cor, sufixo }: { label: string; valor: number; cor: string; sufixo: string }) {
  return (
    <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold font-['Space_Grotesk'] leading-none" style={{ color: cor }}>{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{sufixo}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
      Sem dados para exibir
    </div>
  );
}
