import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MESADA_MODULE_ENABLED } from "@/lib/featureFlags";

export interface TourStep {
  /** valor do atributo data-tour do elemento a destacar; null = card central sem recorte */
  id: string | null;
  /** página (estado `pagina` de Home.tsx) para navegar antes de mostrar este passo; null = mantém a atual */
  page: string | null;
  title: string;
  description: string;
  somenteMesada?: boolean;
}

const PASSOS_BASE: TourStep[] = [
  {
    id: null,
    page: "visao-geral",
    title: "Bem-vindo ao Tarefas Escolares! 👋",
    description:
      "Vamos fazer um tour rápido pelas principais áreas do app. Você pode sair a qualquer momento clicando em \"Pular tutorial\".",
  },
  {
    id: "nav-visao-geral",
    page: "visao-geral",
    title: "Visão Geral",
    description:
      "Sua página inicial: progresso da semana, desempenho geral, próximos prazos, tarefas expiradas e um resumo das suas disciplinas.",
  },
  {
    id: "vg-nova-tarefa",
    page: "visao-geral",
    title: "Criar tarefa",
    description: "Esse botão cria uma tarefa nova rapidamente — funciona de qualquer lugar do app.",
  },
  {
    id: "nav-tarefas",
    page: "tarefas",
    title: "Tarefas",
    description: "A lista completa de tarefas, com busca, ordenação e filtros.",
  },
  {
    id: "tarefas-filtros",
    page: "tarefas",
    title: "Filtros",
    description: "Filtre por status, disciplina, prioridade ou busque por texto — inclusive em anotações e links.",
  },
  {
    id: "nav-disciplinas",
    page: "disciplinas",
    title: "Disciplinas",
    description: "Seu catálogo de matérias, cada uma com emoji e cor próprios, usados em toda a interface.",
  },
  {
    id: "disciplinas-nova",
    page: "disciplinas",
    title: "Adicionar disciplina",
    description: "Clique aqui pra cadastrar uma disciplina nova — escolha o emoji e a cor do jeito que quiser.",
  },
  {
    id: "nav-agenda",
    page: "agenda",
    title: "Agenda",
    description: "Calendário semanal ou mensal com todas as suas tarefas organizadas por dia.",
  },
  {
    id: "agenda-toggle",
    page: "agenda",
    title: "Semana ou Mês",
    description:
      "Alterne entre as duas visões. Dica: segure o clique num dia vazio pra criar uma tarefa direto por lá.",
  },
  {
    id: "nav-metricas",
    page: "metricas",
    title: "Métricas",
    description: "Gráficos de desempenho e um Perfil Inteligente com insights automáticos.",
  },
  {
    id: "metricas-insights",
    page: "metricas",
    title: "Perfil Inteligente",
    description:
      "O app calcula sozinho coisas como sua matéria mais produtiva, a mais atrasada e seu ritmo dos últimos 7 dias.",
  },
  {
    id: "nav-mesada",
    page: "mesada",
    title: "Mesada por Desempenho",
    description:
      "Módulo pessoal: lance o conceito (MB/B/R/I) de cada matéria por mês e acompanhe o valor acumulado automaticamente.",
    somenteMesada: true,
  },
  {
    id: "mesada-abas",
    page: "mesada",
    title: "Três abas da Mesada",
    description:
      "Lançamentos (registrar conceitos), Acompanhamento (gráficos e a grade do boletim) e Configurações (valores e matérias).",
    somenteMesada: true,
  },
  {
    id: "nav-arquivos",
    page: "arquivos",
    title: "Arquivos",
    description: "Importe planilhas Excel/CSV com suas tarefas e exporte tudo em JSON ou Excel quando quiser.",
  },
  {
    id: "nav-configuracoes",
    page: "configuracoes",
    title: "Configurações",
    description: "Perfil, ano escolar, tema claro/escuro e notificações — tudo aqui.",
  },
  {
    id: "config-abas",
    page: "configuracoes",
    title: "Seções de Configurações",
    description: "Navegue entre Perfil, Acadêmico, Aparência e Notificações por essas abas.",
  },
  {
    id: "config-tutorial-button",
    page: "configuracoes",
    title: "Reveja quando quiser",
    description: "Esse tutorial fica sempre disponível aqui, é só clicar de novo.",
  },
  {
    id: "user-menu",
    page: null,
    title: "Seu menu",
    description: "No canto superior direito: acesso rápido ao seu perfil, configurações e sair da conta.",
  },
  {
    id: null,
    page: null,
    title: "Pronto! 🎓",
    description: "Agora você já conhece o Tarefas Escolares. Bom estudo!",
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
      if (e.key === "Escape") setAtivo(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
