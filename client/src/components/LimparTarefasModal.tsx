import { useTarefas } from "@/contexts/TarefasContext";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIdioma } from "@/contexts/LanguageContext";

interface LimparTarefasModalProps {
  onClose: () => void;
}

export default function LimparTarefasModal({ onClose }: LimparTarefasModalProps) {
  const { limparTodas, tarefas } = useTarefas();
  const { t } = useIdioma();
  const [carregando, setCarregando] = useState(false);

  const handleLimpar = async () => {
    setCarregando(true);
    try {
      const total = tarefas.length;
      await limparTodas();
      toast.success(`${total} ${t(total !== 1 ? "limparModal.toastRemovidaPlural" : "limparModal.toastRemovidaSingular")}`);
      onClose();
    } catch {
      toast.error(t("limparModal.erroLimpar"));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t("limparModal.titulo")}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">{t("limparModal.titulo")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500" aria-label={t("limparModal.fechar")}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm text-red-300 font-medium">{t("limparModal.acaoIrreversivel")}</p>
              <p className="text-xs text-red-200 mt-0.5">
                {t("limparModal.prestesARemover")} {tarefas.length} {t(tarefas.length !== 1 ? "tarefas.tarefaPlural" : "tarefas.tarefaSingular")}. {t("limparModal.acaoNaoDesfeita")}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 text-center">
            {t("limparModal.confirmarPergunta")}
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent" disabled={carregando}>
            {t("limparModal.cancelar")}
          </Button>
          <Button onClick={handleLimpar} disabled={carregando} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold">
            {carregando ? (
              <><Loader2 size={14} className="animate-spin mr-2" aria-hidden="true" />{t("limparModal.limpando")}</>
            ) : t("limparModal.limparTudo")}
          </Button>
        </div>
      </div>
    </div>
  );
}
