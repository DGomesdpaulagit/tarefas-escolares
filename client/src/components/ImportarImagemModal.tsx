import { useRef, useState } from "react";
import { AlertCircle, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { ErroImportarImagem, imageImportService } from "@/services/imageImportService";
import RevisaoCandidatasTarefas from "@/components/RevisaoCandidatasTarefas";
import type { CandidataComId } from "@/lib/candidataTarefa";
import type { DicionarioChave } from "@/lib/i18n";

interface ImportarImagemModalProps {
  onClose: () => void;
}

type Status = "idle" | "enviando" | "analisando" | "preview" | "error";

export default function ImportarImagemModal({ onClose }: ImportarImagemModalProps) {
  const { user } = useAuth();
  const { t } = useIdioma();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [candidatas, setCandidatas] = useState<CandidataComId[]>([]);
  const [restantesHoje, setRestantesHoje] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [tamanhoArquivo, setTamanhoArquivo] = useState(0);

  const traduzErro = (codigo: string): string => {
    const chave = `importarIA.erro.${codigo}` as DicionarioChave;
    const texto = t(chave);
    return texto !== chave ? texto : t("importarIA.erro.generico");
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;
    setErro("");
    setNomeArquivo(file.name);
    setTamanhoArquivo(file.size);
    setStatus("enviando");

    let path: string | null = null;
    try {
      path = await imageImportService.upload(user.id, file);
      setStatus("analisando");
      const resultado = await imageImportService.analisar(path);
      setCandidatas(resultado.tarefas.map((c) => ({ ...c, localId: crypto.randomUUID() })));
      setRestantesHoje(resultado.restantesHoje);
      setStatus("preview");
    } catch (err) {
      const codigo = err instanceof ErroImportarImagem ? err.codigo : "generico";
      setErro(traduzErro(codigo));
      setStatus("error");
    } finally {
      if (path) imageImportService.apagar(path);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t("importarImagem.titulo")}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">{t("importarImagem.titulo")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label={t("importarImagem.fechar")}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {status === "idle" && (
            <div
              className="border-2 border-dashed border-white/20 bg-white/5 hover:border-white/40 rounded-xl p-8 text-center transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <Camera size={32} className="mx-auto mb-3 text-amber-400" aria-hidden="true" />
              <p className="text-slate-200 font-medium mb-4">{t("importarImagem.arrasteAqui")}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                className="hidden"
                aria-label={t("importarImagem.selecionarImagem")}
              />
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                {t("importarImagem.selecionarImagem")}
              </Button>
            </div>
          )}

          {(status === "enviando" || status === "analisando") && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="text-amber-400 animate-spin mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">
                {status === "enviando" ? t("importarImagem.enviando") : t("importarImagem.analisando")}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-300">{erro}</p>
              </div>
            </div>
          )}

          {status === "preview" && (
            <RevisaoCandidatasTarefas
              candidatas={candidatas}
              setCandidatas={setCandidatas}
              restantesHoje={restantesHoje}
              nomeArquivo={nomeArquivo}
              tamanhoArquivo={tamanhoArquivo}
              tipoArquivo="imagem"
              onFechar={onClose}
              onTentarNovamente={() => setStatus("idle")}
              textoTentarNovamente={t("importarImagem.btnTentarNovamente")}
            />
          )}
        </div>

        {status === "error" && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
              {t("importarImagem.fechar")}
            </Button>
            <Button onClick={() => setStatus("idle")} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {t("importarImagem.btnTentarNovamente")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
