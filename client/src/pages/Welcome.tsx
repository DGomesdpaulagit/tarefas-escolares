import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Bell,
  CalendarDays,
  ChevronLeft,
  GraduationCap,
  Home as HomeIcon,
  ListTodo,
} from "lucide-react";

interface WelcomeProps {
  onConcluir: () => void;
}

interface Slide {
  emoji: string;
  icon: React.ReactNode;
  titulo: string;
  texto: string;
  cor: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "📚",
    icon: <ListTodo size={20} />,
    titulo: "Suas tarefas, organizadas",
    texto:
      "Centralize tudo o que precisa entregar — com prazo, prioridade e disciplina. Concluídas ficam no histórico, expiradas saem do caminho.",
    cor: "#f59e0b",
  },
  {
    emoji: "🎯",
    icon: <GraduationCap size={20} />,
    titulo: "Disciplinas com identidade",
    texto:
      "Cada matéria com emoji e cor próprios. Fica fácil reconhecer suas tarefas e saber onde está atrasado em segundos.",
    cor: "#a78bfa",
  },
  {
    emoji: "📅",
    icon: <CalendarDays size={20} />,
    titulo: "Agenda semanal e mensal",
    texto:
      "Veja a semana inteira de uma vez ou navegue pelo mês. Pressione e segure um dia para criar uma tarefa direto na data.",
    cor: "#10b981",
  },
  {
    emoji: "🔔",
    icon: <Bell size={20} />,
    titulo: "Lembretes automáticos",
    texto:
      "Push notifications mesmo com o app fechado, no celular ou computador. Avisos 3/2/1 dias antes e no dia da entrega.",
    cor: "#ef4444",
  },
  {
    emoji: "🏠",
    icon: <HomeIcon size={20} />,
    titulo: "Visão geral inteligente",
    texto:
      "Sua produtividade num só lugar: progresso da semana, próximos prazos e desempenho. Tudo num dashboard moderno.",
    cor: "#3b82f6",
  },
];

const STORAGE_KEY = "tarefas_welcome_seen_v1";

export function welcomeJaVisto(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function Welcome({ onConcluir }: WelcomeProps) {
  const [indice, setIndice] = useState(0);
  const slide = SLIDES[indice];
  const ultimo = indice === SLIDES.length - 1;

  const concluir = () => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    onConcluir();
  };

  const avancar = () => {
    if (ultimo) concluir();
    else setIndice((i) => i + 1);
  };

  const voltar = () => setIndice((i) => Math.max(0, i - 1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] p-4">
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "scaleIn 0.25s ease-out both" }}
      >
        {/* Topbar com logo + pular */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <BookOpen size={16} className="text-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] leading-none">
                Tarefas
              </p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Escolares</p>
            </div>
          </div>
          <button
            onClick={concluir}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Pular
          </button>
        </div>

        {/* Conteúdo do slide */}
        <div className="px-6 sm:px-8 pb-2" key={indice}>
          <div className="flex flex-col items-center text-center" style={{ animation: "fadeSlideIn 0.3s ease-out both" }}>
            {/* Bolha com emoji + ícone */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                backgroundColor: `${slide.cor}25`,
                border: `1px solid ${slide.cor}50`,
              }}
            >
              <span className="text-5xl leading-none">{slide.emoji}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mb-2">
              {slide.titulo}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              {slide.texto}
            </p>
          </div>
        </div>

        {/* Dots indicadores */}
        <div className="flex items-center justify-center gap-1.5 py-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                i === indice ? "w-6 bg-amber-500" : "w-1.5 bg-white/15 hover:bg-white/25"
              }`}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === indice}
            />
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pb-6">
          {indice > 0 ? (
            <Button
              variant="outline"
              onClick={voltar}
              className="border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 bg-transparent gap-1"
            >
              <ChevronLeft size={14} />
              Voltar
            </Button>
          ) : (
            <div className="w-[88px]" />
          )}

          <Button
            onClick={avancar}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2 transition-all"
          >
            {ultimo ? (
              <>
                Começar agora <ArrowRight size={14} />
              </>
            ) : (
              <>
                Próximo <ArrowRight size={14} />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-5 text-center max-w-md flex items-center justify-center gap-1.5">
        <span className="text-amber-400">{slide.icon}</span>
        {indice + 1} de {SLIDES.length} — etapa rápida, você só vê uma vez
      </p>
    </div>
  );
}
