import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, AlertTriangle, Camera, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTarefas } from "@/contexts/TarefasContext";
import { useArquivos } from "@/contexts/ArquivosContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { ErroImportarImagem, imageImportService, type CandidataTarefa } from "@/services/imageImportService";
import TarefaForm from "@/components/TarefaForm";
import type { DicionarioChave } from "@/lib/i18n";

interface ImportarImagemModalProps {
  onClose: () => void;
}

type Status = "idle" | "enviando" | "analisando" | "preview" | "error";

type Candidata = CandidataTarefa & { localId: string };

const LABEL_CAMPO: Record<string, DicionarioChave> = {
  data: "importarImagem.campoData",
  disciplina: "importarImagem.campoDisciplina",
  titulo: "importarImagem.campoTitulo",
};

export default function ImportarImagemModal({ onClose }: ImportarImagemModalProps) {
  const { user } = useAuth();
  const { adicionarTarefa } = useTarefas();
  const { adicionarArquivo } = useArquivos();
  const { t } = useIdioma();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [candidatas, setCandidatas] = useState<Candidata[]>([]);
  const [restantesHoje, setRestantesHoje] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [tamanhoArquivo, setTamanhoArquivo] = useState(0);
  const [importando, setImportando] = useState(false);
  const [completandoId, setCompletandoId] = useState<string | null>(null);

  const traduzErro = (codigo: string): string => {
    const chave = `importarImagem.erro.${codigo}` as DicionarioChave;
    const texto = t(chave);
    return texto !== chave ? texto : t("importarImagem.erro.generico");
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

  const prontas = candidatas.filter((c) => c.camposFaltando.length === 0);
  const incompletas = candidatas.filter((c) => c.camposFaltando.length > 0);

  const importarProntas = async () => {
    if (prontas.length === 0) return;
    setImportando(true);
    try {
      for (const c of prontas) {
        await adicionarTarefa({
          title: c.title,
          subject_name: c.subject_name ?? "Outra",
          subject_id: null,
          status: "Não iniciada",
          priority: c.priority,
          due_date: c.due_date,
          progress: 0,
          notes: null,
          link: null,
          sector: null,
          origin: null,
          description: null,
        });
      }
      await adicionarArquivo(nomeArquivo, tamanhoArquivo, prontas.length, "imagem");
      toast.success(`${prontas.length} ${t(prontas.length !== 1 ? "importarImagem.toastImportadasPlural" : "importarImagem.toastImportadasSingular")}`);
      setCandidatas((prev) => prev.filter((c) => c.camposFaltando.length > 0));
    } catch {
      toast.error(traduzErro("generico"));
    } finally {
      setImportando(false);
    }
  };

  const candidataCompletando = candidatas.find((c) => c.localId === completandoId) ?? null;

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
            <div className="space-y-4">
              {restantesHoje !== null && (
                <p className="text-xs text-slate-500 text-right">{restantesHoje} {t("importarImagem.restamHoje")}</p>
              )}

              {candidatas.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
                  <p>{t("importarImagem.nenhumaTarefaEncontrada")}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-amber-300 font-medium">
                    {candidatas.length} {t(candidatas.length !== 1 ? "importarImagem.tarefaEncontradaPlural" : "importarImagem.tarefaEncontradaSingular")}
                  </p>

                  <div className="space-y-2">
                    {candidatas.map((c) => (
                      <CandidataCard
                        key={c.localId}
                        candidata={c}
                        onCompletar={() => setCompletandoId(c.localId)}
                        t={t}
                      />
                    ))}
                  </div>

                  {prontas.length === 0 && incompletas.length > 0 && (
                    <p className="text-xs text-slate-500 italic">{t("importarImagem.semTarefasProntas")}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {status === "error" && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
              {t("importarImagem.fechar")}
            </Button>
            <Button onClick={() => setStatus("idle")} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {t("importarImagem.btnTentarOutraFoto")}
            </Button>
          </div>
        )}

        {status === "preview" && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50">
            {candidatas.length === 0 ? (
              <Button onClick={() => setStatus("idle")} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                {t("importarImagem.btnTentarOutraFoto")}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
                  {t("importarImagem.btnConcluir")}
                </Button>
                {prontas.length > 0 && (
                  <Button
                    onClick={importarProntas}
                    disabled={importando}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
                  >
                    {importando && <Loader2 size={14} className="animate-spin" />}
                    {t("importarImagem.btnImportarProntas")} ({prontas.length})
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {candidataCompletando && (
        <TarefaForm
          initial={{
            title: candidataCompletando.title,
            subject_name: candidataCompletando.subject_name ?? undefined,
            due_date: candidataCompletando.due_date ?? undefined,
            priority: candidataCompletando.priority,
          }}
          onSalvou={() => setCandidatas((prev) => prev.filter((c) => c.localId !== completandoId))}
          onClose={() => setCompletandoId(null)}
        />
      )}
    </div>
  );
}

function CandidataCard({
  candidata, onCompletar, t,
}: {
  candidata: Candidata;
  onCompletar: () => void;
  t: (chave: DicionarioChave) => string;
}) {
  const completa = candidata.camposFaltando.length === 0;

  return (
    <div className={`rounded-lg p-3 border ${completa ? "bg-white/5 border-white/10" : "bg-amber-500/5 border-amber-500/30"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-slate-200 font-medium truncate">{candidata.title}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {candidata.subject_name && (
              <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">{candidata.subject_name}</span>
            )}
            {candidata.due_date && (
              <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                {new Date(`${candidata.due_date}T12:00:00`).toLocaleDateString()}
              </span>
            )}
            <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">{candidata.priority}</span>
          </div>
        </div>
        {completa ? (
          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        )}
      </div>

      {!completa && (
        <div className="flex items-center justify-between gap-2 mt-2">
          <p className="text-xs text-amber-400">
            {t("importarImagem.faltamCampos")}: {candidata.camposFaltando.map((f) => t(LABEL_CAMPO[f])).join(", ")}
          </p>
          <Button
            size="sm"
            onClick={onCompletar}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-7 px-2.5 text-xs shrink-0"
          >
            {t("importarImagem.btnCompletar")}
          </Button>
        </div>
      )}
    </div>
  );
}
