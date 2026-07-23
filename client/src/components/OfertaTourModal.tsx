import { useTour } from "@/contexts/TourContext";
import { Sparkles } from "lucide-react";
import { useIdioma } from "@/contexts/LanguageContext";

export const OFERTA_TOUR_FLAG_KEY = "tarefas_oferecer_tour_v1";

interface OfertaTourModalProps {
  onFechar: () => void;
}

export default function OfertaTourModal({ onFechar }: OfertaTourModalProps) {
  const { iniciar } = useTour();
  const { t } = useIdioma();

  const responder = (comecar: boolean) => {
    localStorage.removeItem(OFERTA_TOUR_FLAG_KEY);
    onFechar();
    if (comecar) iniciar();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("ofertaTour.aria")}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => responder(false)} aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-[var(--bg-card)] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-center"
        style={{ animation: "scaleIn 0.25s ease-out both" }}
      >
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/15 flex items-center justify-center">
          <Sparkles size={26} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mb-1.5">
          {t("ofertaTour.titulo")}
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          {t("ofertaTour.pergunta")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => responder(false)}
            className="flex-1 border border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {t("ofertaTour.agoraNao")}
          </button>
          <button
            onClick={() => responder(true)}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {t("ofertaTour.verTutorial")}
          </button>
        </div>
      </div>
    </div>
  );
}
