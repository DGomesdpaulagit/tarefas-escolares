import { useState } from "react";
import { X, Pencil, Camera, Mic } from "lucide-react";
import { useIdioma } from "@/contexts/LanguageContext";
import TarefaForm from "@/components/TarefaForm";
import ImportarImagemModal from "@/components/ImportarImagemModal";
import ImportarAudioModal from "@/components/ImportarAudioModal";

interface NovaTarefaModalProps {
  /** Pré-preenche a data ao escolher "escrever manualmente" (ex: clique num dia da Agenda). */
  initialDueDate?: string;
  onClose: () => void;
}

type Modo = "escolha" | "manual" | "foto" | "audio";

/**
 * Ponto único de entrada para criar uma tarefa nova: escrever manualmente,
 * importar por foto ou por áudio. Delega para os modais já existentes de cada
 * modo — este componente é só o seletor inicial.
 */
export default function NovaTarefaModal({ initialDueDate, onClose }: NovaTarefaModalProps) {
  const { t } = useIdioma();
  const [modo, setModo] = useState<Modo>("escolha");

  if (modo === "manual") {
    return <TarefaForm initialDueDate={initialDueDate} onClose={onClose} />;
  }
  if (modo === "foto") {
    return <ImportarImagemModal onClose={onClose} />;
  }
  if (modo === "audio") {
    return <ImportarAudioModal onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t("novaTarefa.titulo")}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">{t("novaTarefa.titulo")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <OpcaoModo
            icone={<Pencil size={20} className="text-amber-400" />}
            titulo={t("novaTarefa.opcaoManualTitulo")}
            descricao={t("novaTarefa.opcaoManualDesc")}
            onClick={() => setModo("manual")}
          />
          <OpcaoModo
            icone={<Camera size={20} className="text-amber-400" />}
            titulo={t("novaTarefa.opcaoFotoTitulo")}
            descricao={t("novaTarefa.opcaoFotoDesc")}
            onClick={() => setModo("foto")}
          />
          <OpcaoModo
            icone={<Mic size={20} className="text-amber-400" />}
            titulo={t("novaTarefa.opcaoAudioTitulo")}
            descricao={t("novaTarefa.opcaoAudioDesc")}
            onClick={() => setModo("audio")}
          />
        </div>
      </div>
    </div>
  );
}

function OpcaoModo({
  icone, titulo, descricao, onClick,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{titulo}</p>
        <p className="text-xs text-slate-500 truncate">{descricao}</p>
      </div>
    </button>
  );
}
