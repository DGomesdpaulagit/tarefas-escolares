import { useTarefas } from "@/contexts/TarefasContext";
import { useArquivos } from "@/contexts/ArquivosContext";
import { parseExcelFile } from "@/lib/parseExcel";
import { AlertCircle, CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Tarefa } from "@/types";
import { toast } from "sonner";

interface ImportarPlanilhaModalProps {
  onClose: () => void;
}

type Status = "idle" | "loading" | "preview" | "success" | "error";

type TarefaRaw = Omit<Tarefa, "id" | "user_id" | "created_at" | "updated_at" | "completed_at">;

export default function ImportarPlanilhaModal({ onClose }: ImportarPlanilhaModalProps) {
  const { adicionarTarefa } = useTarefas();
  const { adicionarArquivo } = useArquivos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [tarefasParaImportar, setTarefasParaImportar] = useState<TarefaRaw[]>([]);
  const [erro, setErro] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [tamanhoArquivo, setTamanhoArquivo] = useState(0);

  const handleFileSelect = async (file: File) => {
    setStatus("loading");
    setErro("");
    setNomeArquivo(file.name);
    setTamanhoArquivo(file.size);

    try {
      const raw = await parseExcelFile(file);
      if (raw.length === 0) {
        setErro("Nenhuma tarefa encontrada no arquivo");
        setStatus("error");
        return;
      }
      setTarefasParaImportar(raw as TarefaRaw[]);
      setStatus("preview");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar arquivo");
      setStatus("error");
    }
  };

  const handleImportar = async () => {
    setStatus("loading");
    try {
      for (const t of tarefasParaImportar) {
        await adicionarTarefa(t);
      }
      await adicionarArquivo(
        nomeArquivo,
        tamanhoArquivo,
        tarefasParaImportar.length,
        nomeArquivo.endsWith(".csv") ? "csv" : "xlsx"
      );
      setStatus("success");
      toast.success(`${tarefasParaImportar.length} tarefa(s) importada(s)!`);
      setTimeout(onClose, 2000);
    } catch {
      setErro("Erro ao importar tarefas");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Importar Planilha">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-[#1a1d27] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">Importar Planilha</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {status === "idle" && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver ? "border-amber-500 bg-amber-500/10" : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Área para arrastar ou selecionar arquivo"
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <FileUp size={32} className="mx-auto mb-3 text-amber-400" aria-hidden="true" />
              <p className="text-slate-200 font-medium mb-1">Arraste sua planilha aqui</p>
              <p className="text-slate-500 text-sm mb-4">ou clique para selecionar (.xlsx, .csv)</p>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} className="hidden" aria-label="Selecionar arquivo" />
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                Selecionar Arquivo
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="text-amber-400 animate-spin mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">Processando...</p>
            </div>
          )}

          {status === "preview" && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm text-amber-300 font-medium">{tarefasParaImportar.length} tarefa(s) encontrada(s)</p>
                  <p className="text-xs text-amber-200 mt-0.5">Clique em "Importar" para adicionar ao app</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tarefasParaImportar.slice(0, 10).map((t, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <p className="text-sm text-slate-200 font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">{t.subject_name}</span>
                      <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">{t.status}</span>
                    </div>
                  </div>
                ))}
                {tarefasParaImportar.length > 10 && (
                  <p className="text-xs text-slate-500 text-center py-2">+{tarefasParaImportar.length - 10} mais...</p>
                )}
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 size={32} className="text-green-400 mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">{tarefasParaImportar.length} tarefa(s) importada(s) com sucesso!</p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Erro ao processar</p>
                  <p className="text-xs text-red-200 mt-1">{erro}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {(status === "preview" || status === "error") && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[#0f1117]/50">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
              Cancelar
            </Button>
            {status === "preview" && (
              <Button onClick={handleImportar} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                Importar {tarefasParaImportar.length} Tarefa(s)
              </Button>
            )}
            {status === "error" && (
              <Button onClick={() => { setStatus("idle"); setTarefasParaImportar([]); setErro(""); }} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                Tentar Novamente
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
