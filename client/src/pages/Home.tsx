import Sidebar from "@/components/Sidebar";
import Tarefas from "@/pages/Tarefas";
import Metricas from "@/pages/Metricas";
import Arquivos from "@/pages/Arquivos";
import Configuracoes from "@/pages/Configuracoes";
import Agenda from "@/pages/Agenda";
import Disciplinas from "@/pages/Disciplinas";
import VisaoGeral from "@/pages/VisaoGeral";
import Mesada from "@/pages/Mesada";
import UserMenu from "@/components/UserMenu";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTarefas } from "@/contexts/TarefasContext";
import { MESADA_MODULE_ENABLED } from "@/lib/featureFlags";

const PAGINA_LABELS: Record<string, string> = {
  "visao-geral": "🏠 Visão Geral",
  tarefas: "📚 Tarefas",
  disciplinas: "🎯 Disciplinas",
  metricas: "📊 Métricas",
  arquivos: "📁 Arquivos",
  configuracoes: "⚙️ Configurações",
  agenda: "📅 Agenda",
  mesada: "💰 Mesada",
};

// Atualiza sozinha à meia-noite (e a cada hora, como rede de segurança) — sem precisar recarregar a página
function useDataDeHoje(): Date {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 60 * 60 * 1000); // checa a cada hora
    return () => clearInterval(timer);
  }, []);

  return agora;
}

function DataDeHoje({ className = "" }: { className?: string }) {
  const hoje = useDataDeHoje();
  const label = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const labelCapitalizado = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <span className={`text-sm text-slate-500 font-medium whitespace-nowrap ${className}`}>
      {labelCapitalizado}
    </span>
  );
}

export default function Home() {
  const [pagina, setPagina] = useState("visao-geral");
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const { setFiltros } = useTarefas();

  const navegarComFiltro = (nomeDisciplina: string) => {
    setFiltros({ materia: nomeDisciplina });
    setPagina("tarefas");
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      <Sidebar
        paginaAtual={pagina}
        onNavegar={setPagina}
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarAberta(true)}
              className="text-slate-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white font-['Space_Grotesk'] truncate">
                {PAGINA_LABELS[pagina] ?? pagina}
              </h1>
              <DataDeHoje className="text-[11px] block truncate" />
            </div>
          </div>
          <UserMenu onNavegar={setPagina} />
        </div>

        {/* Topbar desktop */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 border-b border-white/8 bg-[var(--bg-surface)]">
          <div />
          <DataDeHoje className="justify-self-center" />
          <div className="justify-self-end">
            <UserMenu onNavegar={setPagina} />
          </div>
        </div>

        <main className="flex-1 overflow-hidden" id="main-content">
          {pagina === "visao-geral" && (
            <VisaoGeral onNavegar={setPagina} onAbrirTarefasFiltradas={navegarComFiltro} />
          )}
          {pagina === "tarefas" && <Tarefas />}
          {pagina === "disciplinas" && <Disciplinas onAbrirTarefasFiltradas={navegarComFiltro} />}
          {pagina === "metricas" && <Metricas />}
          {pagina === "arquivos" && <Arquivos />}
          {pagina === "configuracoes" && <Configuracoes />}
          {pagina === "agenda" && <Agenda />}
          {pagina === "mesada" && MESADA_MODULE_ENABLED && <Mesada />}
        </main>
      </div>
    </div>
  );
}
