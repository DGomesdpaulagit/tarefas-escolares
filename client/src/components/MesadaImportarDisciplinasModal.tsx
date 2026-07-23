import { Button } from "@/components/ui/button";
import { useMesada } from "@/contexts/MesadaContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { X, Loader2, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useIdioma } from "@/contexts/LanguageContext";

interface MesadaImportarDisciplinasModalProps {
  onClose: () => void;
}

export default function MesadaImportarDisciplinasModal({ onClose }: MesadaImportarDisciplinasModalProps) {
  const { disciplinas } = useDisciplinas();
  const { materias, criarMateria } = useMesada();
  const { t } = useIdioma();
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [salvando, setSalvando] = useState(false);

  const jaVinculadas = useMemo(
    () => new Set(materias.map((m) => m.subject_id).filter((id): id is string => !!id)),
    [materias],
  );
  const disponiveis = useMemo(
    () => disciplinas.filter((d) => !jaVinculadas.has(d.id)),
    [disciplinas, jaVinculadas],
  );

  const alternar = (id: string) => {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  const handleImportar = async () => {
    if (selecionadas.size === 0) return;
    setSalvando(true);
    try {
      const alvos = disponiveis.filter((d) => selecionadas.has(d.id));
      for (let i = 0; i < alvos.length; i++) {
        const d = alvos[i];
        await criarMateria({
          nome: d.name,
          categoria: "complementar",
          cor: d.color,
          emoji: d.emoji,
          subject_id: d.id,
          ordem: materias.length + i,
        });
      }
      toast.success(`${alvos.length} ${t(alvos.length !== 1 ? "mesadaImportar.toastSucessoPlural" : "mesadaImportar.toastSucessoSingular")}`);
      onClose();
    } catch {
      toast.error(t("mesadaImportar.erroImportar"));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("mesadaImportar.titulo")}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        style={{ animation: "scaleIn 0.2s ease-out both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {t("mesadaImportar.titulo")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t("mesadaImportar.fechar")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-2 overflow-y-auto flex-1">
          <p className="text-xs text-slate-500 mb-2">
            {t("mesadaImportar.descricao")}
          </p>

          {disponiveis.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {disciplinas.length === 0
                ? t("mesadaImportar.semDisciplinas")
                : t("mesadaImportar.todasImportadas")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {disponiveis.map((d) => {
                const marcada = selecionadas.has(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => alternar(d.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                      marcada ? "border-amber-500 bg-amber-500/10" : "border-white/8 hover:border-white/20"
                    }`}
                    aria-pressed={marcada}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${d.color}25`, border: `1px solid ${d.color}50` }}
                    >
                      {d.emoji ?? "📘"}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">
                      {d.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        marcada ? "bg-amber-500 border-amber-500" : "border-white/20"
                      }`}
                    >
                      {marcada && <Check size={13} className="text-black" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 bg-transparent"
          >
            {t("mesadaImportar.cancelar")}
          </Button>
          <Button
            type="button"
            onClick={handleImportar}
            disabled={salvando || selecionadas.size === 0}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
          >
            {salvando ? <Loader2 size={14} className="animate-spin" /> : null}
            {t("mesadaImportar.importar")} {selecionadas.size > 0 ? `(${selecionadas.size})` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
