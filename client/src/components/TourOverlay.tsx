import { useEffect, useState, type CSSProperties } from "react";
import { useTour } from "@/contexts/TourContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const MARGEM = 16;
const PADDING_ALVO = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function medirAlvo(id: string | null): Rect | null {
  if (!id) return null;
  const el = document.querySelector(`[data-tour="${id}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function TourOverlay() {
  const { ativo, passoAtual, passos, proximo, anterior, encerrar } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);

  const passo = passos[passoAtual];

  // Re-mede a posição do alvo repetidamente enquanto o tour está ativo — cobre navegação entre
  // páginas, animações de entrada dos cards e scroll/resize sem precisar de lógica dedicada por caso.
  useEffect(() => {
    if (!ativo || !passo) {
      setRect(null);
      return;
    }
    setRect(medirAlvo(passo.id));
    const el = passo.id ? document.querySelector(`[data-tour="${passo.id}"]`) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    const interval = setInterval(() => setRect(medirAlvo(passo.id)), 150);
    return () => clearInterval(interval);
  }, [ativo, passo]);

  if (!ativo || !passo) return null;

  const isPrimeiro = passoAtual === 0;
  const isUltimo = passoAtual === passos.length - 1;

  const alvo = rect
    ? {
        top: rect.top - PADDING_ALVO,
        left: rect.left - PADDING_ALVO,
        width: rect.width + PADDING_ALVO * 2,
        height: rect.height + PADDING_ALVO * 2,
      }
    : null;

  // Posição do card: perto do alvo (embaixo, ou em cima se não couber); centralizado se não há alvo.
  // A altura estimada é generosa e o resultado final SEMPRE é limitado aos limites da janela — o card
  // nunca fica cortado embaixo (atrás da barra de tarefas do sistema, por exemplo) nem em cima.
  const cardWidth = 320;
  const ALTURA_ESTIMADA = 240;
  let cardStyle: CSSProperties;
  if (alvo) {
    const espacoAbaixo = window.innerHeight - (alvo.top + alvo.height);
    const espacoAcima = alvo.top;
    const preferirCima = espacoAbaixo < ALTURA_ESTIMADA + MARGEM && espacoAcima > espacoAbaixo;
    const topBruto = preferirCima
      ? alvo.top - ALTURA_ESTIMADA - MARGEM
      : alvo.top + alvo.height + MARGEM;
    const top = Math.min(
      Math.max(MARGEM, topBruto),
      window.innerHeight - ALTURA_ESTIMADA - MARGEM,
    );
    const left = Math.min(Math.max(MARGEM, alvo.left), window.innerWidth - cardWidth - MARGEM);
    cardStyle = { position: "fixed", top, left, width: cardWidth };
  } else {
    cardStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: cardWidth,
    };
  }

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Tutorial guiado">
      {/* Destaque visual (recorte no escurecimento via box-shadow gigante) */}
      {alvo ? (
        <div
          className="fixed rounded-xl ring-2 ring-amber-500 pointer-events-none"
          style={{
            top: alvo.top,
            left: alvo.left,
            width: alvo.width,
            height: alvo.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
            transition: "top 0.6s ease, left 0.6s ease, width 0.6s ease, height 0.6s ease",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/78 pointer-events-none transition-opacity duration-500" />
      )}

      {/* Escudo — bloqueia cliques no resto da tela; navegação só pelos botões do tutorial */}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />

      <button
        onClick={encerrar}
        className="fixed top-4 right-4 z-[201] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
        aria-label="Pular tutorial"
      >
        <X size={13} /> Pular tutorial
      </button>

      <div
        key={passoAtual}
        className="z-[201] bg-[var(--bg-card)] border border-amber-500/30 rounded-2xl shadow-2xl p-5"
        style={{ ...cardStyle, animation: "fadeSlideIn 0.45s ease-out both" }}
      >
        <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider mb-1.5">
          Passo {passoAtual + 1} de {passos.length}
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mb-1.5">
          {passo.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">{passo.description}</p>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={anterior}
            disabled={isPrimeiro}
            className="text-xs font-medium text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1 px-2 py-1.5"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <button
            onClick={isUltimo ? encerrar : proximo}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg px-4 py-2 inline-flex items-center gap-1"
          >
            {isUltimo ? "Concluir" : "Próximo"}
            {!isUltimo && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
