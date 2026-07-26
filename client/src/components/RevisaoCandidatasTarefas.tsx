import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTarefas } from "@/contexts/TarefasContext";
import { useArquivos } from "@/contexts/ArquivosContext";
import { useIdioma } from "@/contexts/LanguageContext";
import TarefaForm from "@/components/TarefaForm";
import { LABEL_CAMPO, type CandidataComId } from "@/lib/candidataTarefa";
import type { DicionarioChave } from "@/lib/i18n";

/**
 * Tela de revisão das tarefas candidatas extraídas por IA — compartilhada
 * entre a importação por foto e por áudio (mesmo formato de dado, mesmas regras
 * de "detalhamento incompleto" já aplicadas pela Edge Function correspondente).
 */
export default function RevisaoCandidatasTarefas({
  candidatas,
  setCandidatas,
  restantesHoje,
  nomeArquivo,
  tamanhoArquivo,
  tipoArquivo,
  onFechar,
  onTentarNovamente,
  textoTentarNovamente,
}: {
  candidatas: CandidataComId[];
  setCandidatas: React.Dispatch<React.SetStateAction<CandidataComId[]>>;
  restantesHoje: number | null;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoArquivo: string;
  onFechar: () => void;
  onTentarNovamente: () => void;
  /** Texto do botão quando nenhuma tarefa foi identificada (varia entre foto/áudio). */
  textoTentarNovamente: string;
}) {
  const { adicionarTarefa } = useTarefas();
  const { adicionarArquivo } = useArquivos();
  const { t } = useIdioma();

  const [importando, setImportando] = useState(false);
  const [completandoId, setCompletandoId] = useState<string | null>(null);

  const prontas = candidatas.filter((c) => c.camposFaltando.length === 0);
  const incompletas = candidatas.filter((c) => c.camposFaltando.length > 0);
  const candidataCompletando = candidatas.find((c) => c.localId === completandoId) ?? null;

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
      await adicionarArquivo(nomeArquivo, tamanhoArquivo, prontas.length, tipoArquivo);
      toast.success(`${prontas.length} ${t(prontas.length !== 1 ? "importarIA.toastImportadasPlural" : "importarIA.toastImportadasSingular")}`);
      setCandidatas((prev) => prev.filter((c) => c.camposFaltando.length > 0));
    } catch {
      const chave = "importarIA.erro.generico" as DicionarioChave;
      toast.error(t(chave));
    } finally {
      setImportando(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {restantesHoje !== null && (
          <p className="text-xs text-slate-500 text-right">{restantesHoje} {t("importarIA.restamHoje")}</p>
        )}

        {candidatas.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
            <p>{t("importarIA.nenhumaTarefaEncontrada")}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-300 font-medium">
              {candidatas.length} {t(candidatas.length !== 1 ? "importarIA.tarefaEncontradaPlural" : "importarIA.tarefaEncontradaSingular")}
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
              <p className="text-xs text-slate-500 italic">{t("importarIA.semTarefasProntas")}</p>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50 -mx-6 -mb-6 mt-6">
        {candidatas.length === 0 ? (
          <Button onClick={onTentarNovamente} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
            {textoTentarNovamente}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onFechar} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
              {t("importarIA.btnConcluir")}
            </Button>
            {prontas.length > 0 && (
              <Button
                onClick={importarProntas}
                disabled={importando}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
              >
                {importando && <Loader2 size={14} className="animate-spin" />}
                {t("importarIA.btnImportarProntas")} ({prontas.length})
              </Button>
            )}
          </>
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
    </>
  );
}

function CandidataCard({
  candidata, onCompletar, t,
}: {
  candidata: CandidataComId;
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
            {t("importarIA.faltamCampos")}: {candidata.camposFaltando.map((f) => t(LABEL_CAMPO[f])).join(", ")}
          </p>
          <Button
            size="sm"
            onClick={onCompletar}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-7 px-2.5 text-xs shrink-0"
          >
            {t("importarIA.btnCompletar")}
          </Button>
        </div>
      )}
    </div>
  );
}
