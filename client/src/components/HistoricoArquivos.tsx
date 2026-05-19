import { useArquivos } from "@/contexts/ArquivosContext";
import { FileText, Trash2, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HistoricoArquivos() {
  const { arquivos, removerArquivo, limparHistorico } = useArquivos();

  const handleRemover = async (id: string) => {
    try {
      await removerArquivo(id);
      toast.success("Removido do histórico");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleLimpar = async () => {
    try {
      await limparHistorico();
      toast.success("Histórico limpo");
    } catch {
      toast.error("Erro ao limpar");
    }
  };

  if (arquivos.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
        <FileText size={32} className="mx-auto mb-3 text-slate-500" aria-hidden="true" />
        <p className="text-slate-400">Nenhum arquivo importado ainda</p>
        <p className="text-xs text-slate-500 mt-1">Importe uma planilha para ver o histórico aqui</p>
      </div>
    );
  }

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatarTamanho = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white font-['Space_Grotesk']">Histórico de Importações</h3>
        <Button size="sm" variant="ghost" onClick={handleLimpar} className="text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-7">
          Limpar
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {arquivos.map((arquivo) => (
          <div key={arquivo.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={14} className="text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-slate-200 font-medium truncate">{arquivo.file_name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Package size={12} aria-hidden="true" />
                    <span>{arquivo.imported_count} tarefa(s)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} aria-hidden="true" />
                    <span className="truncate">{formatarData(arquivo.created_at)}</span>
                  </div>
                  <div className="text-slate-500 text-right">{formatarTamanho(arquivo.file_size)}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemover(arquivo.id)}
                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 flex-shrink-0"
                aria-label={`Remover ${arquivo.file_name}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
