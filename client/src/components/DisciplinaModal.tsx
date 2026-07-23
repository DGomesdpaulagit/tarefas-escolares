import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import {
  PALETA_DISCIPLINAS,
  EMOJI_SUGERIDOS,
  MATERIAS_EMOJIS,
  MATERIAS_CORES,
} from "@/lib/tarefasData";
import type { Materia } from "@/types";
import { X, Loader2, Check, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useIdioma } from "@/contexts/LanguageContext";

interface DisciplinaModalProps {
  disciplina?: Materia;
  onClose: () => void;
}

export default function DisciplinaModal({ disciplina, onClose }: DisciplinaModalProps) {
  const { criar, atualizar, disciplinas } = useDisciplinas();
  const { t } = useIdioma();
  const isEdicao = !!disciplina;

  const [nome, setNome] = useState(disciplina?.name ?? "");
  const [cor, setCor] = useState(disciplina?.color ?? PALETA_DISCIPLINAS[0]);
  const [emoji, setEmoji] = useState<string>(disciplina?.emoji ?? "📘");
  const [salvando, setSalvando] = useState(false);

  const nomeLimpo = nome.trim();
  const valido = nomeLimpo.length > 0;

  const sugestaoCor = useMemo(() => MATERIAS_CORES[nomeLimpo], [nomeLimpo]);
  const sugestaoEmoji = useMemo(() => MATERIAS_EMOJIS[nomeLimpo], [nomeLimpo]);

  const aplicarSugestao = () => {
    if (sugestaoCor) setCor(sugestaoCor);
    if (sugestaoEmoji) setEmoji(sugestaoEmoji);
  };

  const handleSalvar = async () => {
    if (!valido) return;
    if (!isEdicao && disciplinas.some((d) => d.name.toLowerCase() === nomeLimpo.toLowerCase())) {
      toast.error(t("disciplinaModal.erroNomeExiste"));
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao && disciplina) {
        await atualizar(disciplina.id, { name: nomeLimpo, color: cor, emoji });
        toast.success(`${nomeLimpo} ${t("disciplinaModal.toastAtualizada")}`);
      } else {
        await criar({ name: nomeLimpo, color: cor, emoji });
        toast.success(`${nomeLimpo} ${t("disciplinaModal.toastAdicionada")}`);
      }
      onClose();
    } catch {
      toast.error(t("disciplinaModal.erroSalvar"));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdicao ? t("disciplinaModal.editar") : t("disciplinaModal.nova")}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        style={{ animation: "scaleIn 0.2s ease-out both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {isEdicao ? t("disciplinaModal.editar") : t("disciplinaModal.nova")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t("disciplinaModal.fechar")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Preview */}
          <div
            className="rounded-2xl p-5 border-2 transition-all"
            style={{
              backgroundColor: `${cor}14`,
              borderColor: `${cor}50`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-black/10"
                style={{ backgroundColor: `${cor}30`, border: `1px solid ${cor}60` }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{t("disciplinaModal.pratica")}</p>
                <p className="text-lg font-semibold truncate" style={{ color: cor }}>
                  {nomeLimpo || t("disciplinaModal.nomeDisciplinaPlaceholder")}
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="disc-nome" className="text-slate-700 dark:text-slate-300 text-sm">
              {t("disciplinaModal.nomeLabel")}
            </Label>
            <Input
              id="disc-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t("disciplinaModal.nomePlaceholder")}
              className="bg-white/5 border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-amber-500"
              maxLength={40}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSalvar();
              }}
            />
            {(sugestaoCor || sugestaoEmoji) && nomeLimpo && (
              <button
                type="button"
                onClick={aplicarSugestao}
                className="text-xs text-amber-500 hover:text-amber-600 inline-flex items-center gap-1 mt-1"
              >
                <Sparkles size={11} /> {t("disciplinaModal.usarVisualSugerido")} "{nomeLimpo}"
              </button>
            )}
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 text-sm">{t("disciplinaModal.emoji")}</Label>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-lg bg-white/5 border border-white/10">
              {EMOJI_SUGERIDOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-lg text-xl transition-all flex items-center justify-center hover:scale-110 ${
                    emoji === e ? "bg-amber-500/20 ring-2 ring-amber-500" : "hover:bg-white/10"
                  }`}
                  aria-label={`Selecionar emoji ${e}`}
                  aria-pressed={emoji === e}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Label htmlFor="disc-emoji-custom" className="text-xs text-slate-500">
                {t("disciplinaModal.colarEmoji")}
              </Label>
              <Input
                id="disc-emoji-custom"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
                className="bg-white/5 border-white/10 text-center text-lg h-9 w-16 focus:border-amber-500"
                maxLength={4}
              />
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 text-sm">{t("disciplinaModal.corDisciplina")}</Label>
            <div className="grid grid-cols-8 sm:grid-cols-[repeat(15,minmax(0,1fr))] gap-2">
              {PALETA_DISCIPLINAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className="aspect-square rounded-full transition-all hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  style={{
                    backgroundColor: c,
                    boxShadow: cor === c ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${c}` : "none",
                  }}
                  aria-label={`Cor ${c}`}
                  aria-pressed={cor === c}
                >
                  {cor === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 bg-transparent"
          >
            {t("disciplinaModal.cancelar")}
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={salvando || !valido}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
          >
            {salvando ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEdicao ? t("disciplinaModal.salvar") : t("disciplinaModal.criarDisciplina")}
          </Button>
        </div>
      </div>
    </div>
  );
}
