import { useArquivos } from "@/contexts/ArquivosContext";
import { useTarefas } from "@/contexts/TarefasContext";
import { FileText, FileSpreadsheet, Loader2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";

function formatarTamanho(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Arquivos() {
  const { arquivos, carregando, removerArquivo, limparHistorico } = useArquivos();
  const { tarefas } = useTarefas();

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(tarefas, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarefas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação JSON concluída!");
  };

  const exportarExcel = () => {
    const headers = ["Título", "Matéria", "Status", "Prioridade", "Data de Entrega", "Progresso%", "Setor", "Origem", "Observações", "Link", "Criado em"];
    const rows = tarefas.map((t) => [
      t.title, t.subject_name, t.status, t.priority,
      t.due_date ?? "", t.progress, t.sector ?? "", t.origin ?? "",
      t.notes ?? "", t.link ?? "",
      new Date(t.created_at).toLocaleDateString("pt-BR"),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tarefas");
    XLSX.writeFile(wb, `tarefas-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Exportação Excel concluída!");
  };

  const handleRemover = async (id: string) => {
    try {
      await removerArquivo(id);
      toast.success("Removido do histórico");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleLimparHistorico = async () => {
    try {
      await limparHistorico();
      toast.success("Histórico limpo");
    } catch {
      toast.error("Erro ao limpar histórico");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Arquivos</h1>
        <p className="text-slate-400 text-sm mt-1">Histórico de importações e exportações de dados</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-3 font-['Space_Grotesk']">Exportar Dados</h2>
        <p className="text-xs text-slate-500 mb-4">Faça backup ou exporte suas tarefas em diferentes formatos</p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportarJSON}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent gap-2"
            disabled={tarefas.length === 0}
          >
            <Download size={14} aria-hidden="true" />
            Exportar JSON
          </Button>
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent gap-2"
            disabled={tarefas.length === 0}
          >
            <Download size={14} aria-hidden="true" />
            Exportar Excel
          </Button>
        </div>
        {tarefas.length === 0 && (
          <p className="text-xs text-slate-500 mt-3 italic">Adicione tarefas para habilitar a exportação</p>
        )}
      </div>

      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">
            Histórico de Importações
          </h2>
          {arquivos.length > 0 && (
            <button
              onClick={handleLimparHistorico}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            >
              <Trash2 size={12} aria-hidden="true" />
              Limpar histórico
            </button>
          )}
        </div>

        {carregando ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="text-amber-400 animate-spin" />
          </div>
        ) : arquivos.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <FileText size={24} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
            <p>Nenhuma importação realizada ainda</p>
            <p className="text-xs mt-1 text-slate-600">Use "Importar" na tela de Tarefas para importar planilhas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {arquivos.map((arquivo) => (
              <div key={arquivo.id} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-lg p-3">
                <div className="flex-shrink-0">
                  {arquivo.file_type === "csv" ? (
                    <FileText size={20} className="text-green-400" aria-hidden="true" />
                  ) : (
                    <FileSpreadsheet size={20} className="text-blue-400" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{arquivo.file_name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{formatarDataHora(arquivo.created_at)}</span>
                    <span className="text-xs text-slate-500">{arquivo.imported_count} tarefas importadas</span>
                    <span className="text-xs text-slate-500">{formatarTamanho(arquivo.file_size)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemover(arquivo.id)}
                  className="flex-shrink-0 text-slate-500 hover:text-red-400 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label={`Remover ${arquivo.file_name} do histórico`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
