import { useTarefas } from "@/contexts/TarefasContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { getMateriaColor, getMateriaEmoji } from "@/lib/tarefasData";
import { MESADA_MODULE_ENABLED } from "@/lib/featureFlags";
import type { StatusTarefa } from "@/types";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Home as HomeIcon,
  LayoutDashboard,
  ListTodo,
  Settings,
  Wallet,
  XCircle,
} from "lucide-react";

interface SidebarProps {
  paginaAtual: string;
  onNavegar: (p: string) => void;
  aberta: boolean;
  onFechar: () => void;
}

export default function Sidebar({ paginaAtual, onNavegar, aberta, onFechar }: SidebarProps) {
  const { metricas, filtros, setFiltros } = useTarefas();
  const { disciplinas } = useDisciplinas();
  const { t } = useIdioma();

  const STATUS_FILTROS: { label: string; valor: StatusTarefa | "Todas"; cor: string }[] = [
    { label: t("status.todas"), valor: "Todas", cor: "#94a3b8" },
    { label: t("status.naoIniciada"), valor: "Não iniciada", cor: "#94a3b8" },
    { label: t("status.emAndamento"), valor: "Em Andamento", cor: "#f59e0b" },
    { label: t("status.concluida"), valor: "Concluída", cor: "#10b981" },
    { label: t("status.passouPrazo"), valor: "Passou do Prazo", cor: "#ef4444" },
  ];

  const navItems = [
    { id: "visao-geral", label: t("nav.visaoGeral"), icon: HomeIcon },
    { id: "tarefas", label: t("nav.tarefas"), icon: ListTodo },
    { id: "disciplinas", label: t("nav.disciplinas"), icon: GraduationCap },
    { id: "agenda", label: t("nav.agenda"), icon: Calendar },
    { id: "metricas", label: t("nav.metricas"), icon: LayoutDashboard },
    ...(MESADA_MODULE_ENABLED ? [{ id: "mesada", label: t("nav.mesada"), icon: Wallet }] : []),
    { id: "arquivos", label: t("nav.arquivos"), icon: BookOpen },
    { id: "configuracoes", label: t("nav.configuracoes"), icon: Settings },
  ];

  const materias = Object.entries(metricas.porMateria).sort((a, b) => b[1] - a[1]);
  const emojiDe = (nome: string) => {
    const d = disciplinas.find((x) => x.name === nome);
    return getMateriaEmoji(nome, d?.emoji);
  };
  const corDe = (nome: string) => {
    const d = disciplinas.find((x) => x.name === nome);
    return d?.color ?? getMateriaColor(nome);
  };

  return (
    <>
      {aberta && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-surface)] border-r border-white/8 z-30 flex flex-col transition-transform duration-300 ease-out
          ${aberta ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
        role="navigation"
        aria-label="Menu lateral"
      >
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <BookOpen size={16} className="text-black" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-['Space_Grotesk'] leading-none">{t("sidebar.brandLinha1")}</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">{t("sidebar.brandLinha2")}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-white/8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-['Space_Grotesk']">{t("sidebar.resumo")}</p>
          <div className="grid grid-cols-2 gap-2">
            <MetricaMini label={t("sidebar.total")} valor={metricas.total} cor="#94a3b8" icon={<ListTodo size={12} />} />
            <MetricaMini label={t("sidebar.concluidas")} valor={metricas.concluidas} cor="#10b981" icon={<CheckCircle2 size={12} />} />
            <MetricaMini label={t("sidebar.pendentes")} valor={metricas.pendentes} cor="#94a3b8" icon={<Clock size={12} />} />
            <MetricaMini label={t("sidebar.atrasadas")} valor={metricas.passouPrazo} cor="#ef4444" icon={<XCircle size={12} />} />
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{t("sidebar.progressoGeral")}</span>
              <span className="text-amber-400 font-semibold font-['Space_Grotesk']">{metricas.percentualConcluido}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={metricas.percentualConcluido} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${metricas.percentualConcluido}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="px-3 py-3 border-b border-white/8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2 font-['Space_Grotesk']">{t("sidebar.navegacao")}</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-tour={`nav-${id}`}
              onClick={() => { onNavegar(id); onFechar(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                paginaAtual === id
                  ? "bg-amber-500/15 text-amber-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              aria-current={paginaAtual === id ? "page" : undefined}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
              {paginaAtual === id && <ChevronRight size={13} className="ml-auto" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-3 py-3 border-b border-white/8">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2 font-['Space_Grotesk']">
              {t("sidebar.filtrarPorStatus")}
            </p>
            {STATUS_FILTROS.map(({ label, valor, cor }) => {
              const qtd = valor === "Todas" ? metricas.total : (metricas.porStatus[valor] ?? 0);
              const ativo = filtros.status === valor;
              return (
                <button
                  key={valor}
                  onClick={() => { setFiltros({ status: valor }); onFechar(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    ativo ? "bg-white/8 font-medium" : "hover:bg-white/5"
                  }`}
                  aria-pressed={ativo}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} aria-hidden="true" />
                  <span className={ativo ? "text-slate-200" : "text-slate-400"}>{label}</span>
                  <span className="ml-auto text-xs text-slate-500 font-['Space_Grotesk']">{qtd}</span>
                </button>
              );
            })}
          </div>

          {materias.length > 0 && (
            <div className="px-3 py-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2 font-['Space_Grotesk']">{t("sidebar.porDisciplina")}</p>
              {materias.map(([materia, qtd]) => {
                const cor = corDe(materia);
                const emoji = emojiDe(materia);
                const ativo = filtros.materia === materia;
                return (
                  <button
                    key={materia}
                    onClick={() => { setFiltros({ materia: ativo ? "Todas" : materia }); onFechar(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      ativo ? "bg-white/8 font-medium" : "hover:bg-white/5"
                    }`}
                    aria-pressed={ativo}
                  >
                    <span className="text-base leading-none flex-shrink-0" aria-hidden="true">{emoji}</span>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} aria-hidden="true" />
                    <span className={`truncate ${ativo ? "text-slate-200" : "text-slate-400"}`}>{materia}</span>
                    <span className="ml-auto text-xs text-slate-500 font-['Space_Grotesk']">{qtd}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function MetricaMini({ label, valor, cor, icon }: { label: string; valor: number; cor: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/4 rounded-lg p-2.5 border border-white/6">
      <div className="flex items-center gap-1 mb-1" style={{ color: cor }} aria-hidden="true">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-bold font-['Space_Grotesk'] leading-none" style={{ color: cor }} aria-label={`${label}: ${valor}`}>
        {valor}
      </p>
    </div>
  );
}
