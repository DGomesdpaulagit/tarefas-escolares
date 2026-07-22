import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMesada } from "@/contexts/MesadaContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { PALETA_DISCIPLINAS, EMOJI_SUGERIDOS } from "@/lib/tarefasData";
import type { CategoriaMesada, MesadaMateria } from "@/types";
import { X, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MesadaMateriaModalProps {
  materia?: MesadaMateria;
  onClose: () => void;
}

const CATEGORIAS: { valor: CategoriaMesada; label: string }[] = [
  { valor: "principal", label: "Principal" },
  { valor: "complementar", label: "Complementar" },
  { valor: "menor", label: "Valor menor" },
  { valor: "outra", label: "Outra" },
];

export default function MesadaMateriaModal({ materia, onClose }: MesadaMateriaModalProps) {
  const { criarMateria, atualizarMateria, materias } = useMesada();
  const { disciplinas } = useDisciplinas();
  const isEdicao = !!materia;

  const [nome, setNome] = useState(materia?.nome ?? "");
  const [categoria, setCategoria] = useState<CategoriaMesada>(materia?.categoria ?? "complementar");
  const [cor, setCor] = useState(materia?.cor ?? PALETA_DISCIPLINAS[0]);
  const [emoji, setEmoji] = useState<string>(materia?.emoji ?? "📘");
  const [subjectId, setSubjectId] = useState<string | null>(materia?.subject_id ?? null);
  const [salvando, setSalvando] = useState(false);

  const nomeLimpo = nome.trim();
  const valido = nomeLimpo.length > 0;

  const linkarDisciplina = (id: string) => {
    setSubjectId(id);
    const d = disciplinas.find((x) => x.id === id);
    if (d) {
      setCor(d.color);
      if (d.emoji) setEmoji(d.emoji);
    }
  };

  const handleSalvar = async () => {
    if (!valido) return;
    if (!isEdicao && materias.some((m) => m.nome.toLowerCase() === nomeLimpo.toLowerCase())) {
      toast.error("Já existe uma matéria com esse nome");
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao && materia) {
        await atualizarMateria(materia.id, {
          nome: nomeLimpo,
          categoria,
          cor,
          emoji,
          subject_id: subjectId,
        });
        toast.success(`${nomeLimpo} atualizada!`);
      } else {
        await criarMateria({
          nome: nomeLimpo,
          categoria,
          cor,
          emoji,
          subject_id: subjectId,
          ordem: materias.length,
        });
        toast.success(`${nomeLimpo} adicionada!`);
      }
      onClose();
    } catch {
      toast.error("Erro ao salvar matéria");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdicao ? "Editar Matéria" : "Nova Matéria"}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        style={{ animation: "scaleIn 0.2s ease-out both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {isEdicao ? "Editar Matéria" : "Nova Matéria do Boletim"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Preview */}
          <div
            className="rounded-2xl p-5 border-2 transition-all"
            style={{ backgroundColor: `${cor}14`, borderColor: `${cor}50` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-black/10"
                style={{ backgroundColor: `${cor}30`, border: `1px solid ${cor}60` }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Pré-visualização</p>
                <p className="text-lg font-semibold truncate" style={{ color: cor }}>
                  {nomeLimpo || "Nome da matéria"}
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="mesada-materia-nome" className="text-slate-700 dark:text-slate-300 text-sm">
              Nome da matéria *
            </Label>
            <Input
              id="mesada-materia-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Matemática"
              className="bg-white/5 border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-amber-500"
              maxLength={40}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSalvar();
              }}
            />
          </div>

          {/* Vincular a Disciplina existente (opcional) */}
          {disciplinas.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">
                Vincular a uma Disciplina existente (opcional)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubjectId(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    subjectId === null
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  Nenhuma
                </button>
                {disciplinas.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => linkarDisciplina(d.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all inline-flex items-center gap-1.5 ${
                      subjectId === d.id
                        ? "ring-2 ring-amber-500 border-transparent"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    style={{ backgroundColor: `${d.color}20`, color: d.color }}
                  >
                    {d.emoji ?? "📘"} {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 text-sm">Categoria</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.valor}
                  type="button"
                  onClick={() => setCategoria(c.valor)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    categoria === c.valor
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                  aria-pressed={categoria === c.valor}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 text-sm">Emoji</Label>
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
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 text-sm">Cor</Label>
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
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={salvando || !valido}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
          >
            {salvando ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEdicao ? "Salvar" : "Criar matéria"}
          </Button>
        </div>
      </div>
    </div>
  );
}
