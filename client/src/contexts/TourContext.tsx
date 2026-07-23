import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MESADA_MODULE_ENABLED } from "@/lib/featureFlags";
import type { DicionarioChave } from "@/lib/i18n";

export interface TourStep {
  /** valor do atributo data-tour do elemento a destacar; null = card central sem recorte */
  id: string | null;
  /** página (estado `pagina` de Home.tsx) para navegar antes de mostrar este passo; null = mantém a atual */
  page: string | null;
  tituloChave: DicionarioChave;
  descricaoChave: DicionarioChave;
  somenteMesada?: boolean;
}

const PASSOS_BASE: TourStep[] = [
  {
    id: null,
    page: "visao-geral",
    tituloChave: "tour.boasVindasTitulo",
    descricaoChave: "tour.boasVindasDesc",
  },
  {
    id: "nav-visao-geral",
    page: "visao-geral",
    tituloChave: "tour.visaoGeralTitulo",
    descricaoChave: "tour.visaoGeralDesc",
  },
  {
    id: "vg-nova-tarefa",
    page: "visao-geral",
    tituloChave: "tour.novaTarefaTitulo",
    descricaoChave: "tour.novaTarefaDesc",
  },
  {
    id: "nav-tarefas",
    page: "tarefas",
    tituloChave: "tour.tarefasTitulo",
    descricaoChave: "tour.tarefasDesc",
  },
  {
    id: "tarefas-filtros",
    page: "tarefas",
    tituloChave: "tour.filtrosTitulo",
    descricaoChave: "tour.filtrosDesc",
  },
  {
    id: "nav-disciplinas",
    page: "disciplinas",
    tituloChave: "tour.disciplinasTitulo",
    descricaoChave: "tour.disciplinasDesc",
  },
  {
    id: "disciplinas-nova",
    page: "disciplinas",
    tituloChave: "tour.disciplinaNovaTitulo",
    descricaoChave: "tour.disciplinaNovaDesc",
  },
  {
    id: "nav-agenda",
    page: "agenda",
    tituloChave: "tour.agendaTitulo",
    descricaoChave: "tour.agendaDesc",
  },
  {
    id: "agenda-toggle",
    page: "agenda",
    tituloChave: "tour.agendaToggleTitulo",
    descricaoChave: "tour.agendaToggleDesc",
  },
  {
    id: "nav-metricas",
    page: "metricas",
    tituloChave: "tour.metricasTitulo",
    descricaoChave: "tour.metricasDesc",
  },
  {
    id: "metricas-insights",
    page: "metricas",
    tituloChave: "tour.insightsTitulo",
    descricaoChave: "tour.insightsDesc",
  },
  {
    id: "nav-mesada",
    page: "mesada",
    tituloChave: "tour.mesadaTitulo",
    descricaoChave: "tour.mesadaDesc",
    somenteMesada: true,
  },
  {
    id: "mesada-abas",
    page: "mesada",
    tituloChave: "tour.mesadaAbasTitulo",
    descricaoChave: "tour.mesadaAbasDesc",
    somenteMesada: true,
  },
  {
    id: "nav-arquivos",
    page: "arquivos",
    tituloChave: "tour.arquivosTitulo",
    descricaoChave: "tour.arquivosDesc",
  },
  {
    id: "nav-configuracoes",
    page: "configuracoes",
    tituloChave: "tour.configuracoesTitulo",
    descricaoChave: "tour.configuracoesDesc",
  },
  {
    id: "config-abas",
    page: "configuracoes",
    tituloChave: "tour.configAbasTitulo",
    descricaoChave: "tour.configAbasDesc",
  },
  {
    id: "config-tutorial-button",
    page: "configuracoes",
    tituloChave: "tour.revejaTitulo",
    descricaoChave: "tour.revejaDesc",
  },
  {
    id: "user-menu",
    page: null,
    tituloChave: "tour.userMenuTitulo",
    descricaoChave: "tour.userMenuDesc",
  },
  {
    id: null,
    page: null,
    tituloChave: "tour.prontoTitulo",
    descricaoChave: "tour.prontoDesc",
  },
];

interface TourContextValue {
  ativo: boolean;
  passoAtual: number;
  passos: TourStep[];
  iniciar: () => void;
  proximo: () => void;
  anterior: () => void;
  encerrar: () => void;
  registrarNavegacao: (fn: (pagina: string) => void) => void;
  registrarSidebar: (abrir: () => void, fechar: () => void) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [ativo, setAtivo] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);

  const navegarRef = useRef<(pagina: string) => void>(() => {});
  const sidebarRef = useRef<{ abrir: () => void; fechar: () => void }>({ abrir: () => {}, fechar: () => {} });

  const passos = useMemo(
    () => PASSOS_BASE.filter((p) => !p.somenteMesada || MESADA_MODULE_ENABLED),
    [],
  );

  const registrarNavegacao = useCallback((fn: (pagina: string) => void) => {
    navegarRef.current = fn;
  }, []);

  const registrarSidebar = useCallback((abrir: () => void, fechar: () => void) => {
    sidebarRef.current = { abrir, fechar };
  }, []);

  // Efeito colateral de cada passo: navega pra página certa e abre/fecha a sidebar (necessário em mobile)
  useEffect(() => {
    if (!ativo) return;
    const passo = passos[passoAtual];
    if (!passo) return;
    if (passo.page) navegarRef.current(passo.page);
    if (passo.id?.startsWith("nav-")) sidebarRef.current.abrir();
    else sidebarRef.current.fechar();
  }, [ativo, passoAtual, passos]);

  useEffect(() => {
    if (!ativo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Usa encerrar() (não setAtivo direto) para garantir que a sidebar mobile,
      // se tiver sido aberta por um passo do tour, feche junto — senão fica presa aberta.
      if (e.key === "Escape") encerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- encerrar é estável (useCallback com deps vazias)
  }, [ativo]);

  const iniciar = useCallback(() => {
    setPassoAtual(0);
    setAtivo(true);
  }, []);

  const proximo = useCallback(() => {
    setPassoAtual((i) => {
      if (i + 1 >= passos.length) {
        setAtivo(false);
        return i;
      }
      return i + 1;
    });
  }, [passos.length]);

  const anterior = useCallback(() => {
    setPassoAtual((i) => Math.max(0, i - 1));
  }, []);

  const encerrar = useCallback(() => {
    setAtivo(false);
    sidebarRef.current.fechar();
  }, []);

  return (
    <TourContext.Provider
      value={{ ativo, passoAtual, passos, iniciar, proximo, anterior, encerrar, registrarNavegacao, registrarSidebar }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour deve ser usado dentro de TourProvider");
  return ctx;
}
