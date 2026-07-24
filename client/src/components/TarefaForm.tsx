import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTarefas } from "@/contexts/TarefasContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { soundService } from "@/services/soundService";
import { MATERIAS_PADRAO, SETORES, ORIGENS, getMateriaEmoji, getStatusEfetivo } from "@/lib/tarefasData";
import type { Tarefa, PrioridadeTarefa, StatusTarefa } from "@/types";
import { Loader2, Trash2, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIdioma } from "@/contexts/LanguageContext";

interface TarefaFormProps {
  tarefa?: Tarefa;
  initialDueDate?: string;
  /** Pré-preenche a criação com o que já foi identificado (ex: análise de imagem por IA). */
  initial?: Partial<{
    title: string;
    subject_name: string;
    due_date: string;
    priority: PrioridadeTarefa;
  }>;
  /** Chamado só quando uma tarefa NOVA é criada com sucesso (não em edição, nem ao cancelar). */
  onSalvou?: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: StatusTarefa[] = [
  "Não iniciada",
  "Em Andamento",
  "Concluída",
  "Passou do Prazo",
];

const PRIORIDADE_OPTIONS: PrioridadeTarefa[] = ["Alta", "Média", "Baixa"];

export default function TarefaForm({ tarefa, initialDueDate, initial, onSalvou, onClose }: TarefaFormProps) {
  const { adicionarTarefa, atualizarTarefa, removerTarefa, toggleConcluida } = useTarefas();
  const { disciplinas } = useDisciplinas();
  const { t } = useIdioma();
  const isEdicao = !!tarefa;
  const statusEfetivo = tarefa ? getStatusEfetivo(tarefa) : null;
  const podeConcluir = isEdicao && statusEfetivo !== "Passou do Prazo";
  const estaConcluida = statusEfetivo === "Concluída";

  // Combina disciplinas cadastradas + padrões não cadastradas (com emojis)
  const opcoesDisciplina = (() => {
    const nomesCadastradas = new Set(disciplinas.map((d) => d.name));
    const padraoExtras = MATERIAS_PADRAO.filter((m) => m !== "Outra" && !nomesCadastradas.has(m));
    return [
      ...disciplinas.map((d) => ({ nome: d.name, emoji: getMateriaEmoji(d.name, d.emoji) })),
      ...padraoExtras.map((nome) => ({ nome, emoji: getMateriaEmoji(nome) })),
    ];
  })();

  const [form, setForm] = useState({
    title: tarefa?.title ?? initial?.title ?? "",
    subject_name: tarefa?.subject_name ?? initial?.subject_name ?? "Português",
    subject_id: tarefa?.subject_id ?? null,
    status: tarefa?.status ?? ("Não iniciada" as StatusTarefa),
    priority: tarefa?.priority ?? initial?.priority ?? ("Média" as PrioridadeTarefa),
    sector: tarefa?.sector ?? "Trabalho",
    origin: tarefa?.origin ?? "SALA",
    due_date: tarefa?.due_date ?? initial?.due_date ?? initialDueDate ?? "",
    progress: tarefa?.progress ?? 0,
    notes: tarefa?.notes ?? "",
    link: tarefa?.link ?? "",
    description: tarefa?.description ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [alternandoConclusao, setAlternandoConclusao] = useState(false);

  const handleRemover = async () => {
    if (!tarefa) return;
    if (!confirmandoRemocao) {
      setConfirmandoRemocao(true);
      setTimeout(() => setConfirmandoRemocao(false), 3000);
      return;
    }
    setRemovendo(true);
    try {
      await removerTarefa(tarefa.id);
      soundService.playRemovida();
      toast.success(t("tarefaForm.toastRemovida"));
      onClose();
    } catch {
      toast.error(t("tarefaForm.erroRemover"));
      setRemovendo(false);
      setConfirmandoRemocao(false);
    }
  };

  const handleAlternarConclusao = async () => {
    if (!tarefa) return;
    if (statusEfetivo === "Passou do Prazo") {
      toast.error(t("tarefaForm.erroExpiradaConcluir"));
      return;
    }
    setAlternandoConclusao(true);
    try {
      await toggleConcluida(tarefa.id);
      if (estaConcluida) {
        soundService.playDesmarcada();
        toast.success(t("tarefaForm.toastMarcadaPendente"));
      } else {
        soundService.playConcluida();
        toast.success(t("tarefaForm.toastConcluida"));
      }
      onClose();
    } catch {
      toast.error(t("tarefaForm.erroAtualizar"));
    } finally {
      setAlternandoConclusao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    // Normaliza strings vazias para null nos campos nullable.
    // due_date é `date` no Postgres — "" causa 400 Bad Request.
    const toNull = (v: string | null) => (v === null || v === "" ? null : v);
    const payload = {
      ...form,
      title: form.title.trim(),
      due_date: toNull(form.due_date),
      notes: toNull(form.notes),
      link: toNull(form.link),
      sector: toNull(form.sector),
      origin: toNull(form.origin),
      description: toNull(form.description),
    };

    setSalvando(true);
    try {
      if (isEdicao && tarefa) {
        await atualizarTarefa(tarefa.id, payload);
        toast.success(t("tarefaForm.toastAtualizada"));
      } else {
        await adicionarTarefa(payload);
        soundService.playAdicionada();
        toast.success(t("tarefaForm.toastAdicionada"));
        onSalvou?.();
      }
      onClose();
    } catch {
      toast.error(t("tarefaForm.erroSalvar"));
    } finally {
      setSalvando(false);
    }
  };

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdicao ? t("tarefaForm.editarTarefa") : t("tarefaForm.novaTarefa")}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
            {isEdicao ? t("tarefaForm.editarTarefa") : t("tarefaForm.novaTarefa")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t("tarefaForm.fechar")}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-slate-300 text-sm">{t("tarefaForm.tituloTarefa")}</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("tarefaForm.tituloPlaceholder")}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-slate-300 text-sm">{t("tarefaForm.disciplina")}</Label>
              <Select value={form.subject_name} onValueChange={(v) => set("subject_name", v)}>
                <SelectTrigger id="subject" className="bg-white/5 border-white/10 text-white focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {opcoesDisciplina.map(({ nome, emoji }) => (
                    <SelectItem key={nome} value={nome} className="text-slate-200 focus:bg-white/10">
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true">{emoji}</span>
                        {nome}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-slate-300 text-sm">{t("tarefaForm.status")}</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as StatusTarefa)}>
                <SelectTrigger id="status" className="bg-white/5 border-white/10 text-white focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="text-slate-200 focus:bg-white/10">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-slate-300 text-sm">{t("tarefaForm.prioridade")}</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as PrioridadeTarefa)}>
                <SelectTrigger id="priority" className="bg-white/5 border-white/10 text-white focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {PRIORIDADE_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-slate-200 focus:bg-white/10">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sector" className="text-slate-300 text-sm">{t("tarefaForm.setor")}</Label>
              <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
                <SelectTrigger id="sector" className="bg-white/5 border-white/10 text-white focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {SETORES.map((s) => (
                    <SelectItem key={s} value={s} className="text-slate-200 focus:bg-white/10">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="origin" className="text-slate-300 text-sm">{t("tarefaForm.origem")}</Label>
              <Select value={form.origin} onValueChange={(v) => set("origin", v)}>
                <SelectTrigger id="origin" className="bg-white/5 border-white/10 text-white focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-white/10">
                  {ORIGENS.map((o) => (
                    <SelectItem key={o} value={o} className="text-slate-200 focus:bg-white/10">
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date" className="text-slate-300 text-sm">{t("tarefaForm.dataDeEntrega")}</Label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-amber-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="progress" className="text-slate-300 text-sm">
              {t("tarefaForm.percentConclusao")} <span className="text-amber-400 font-semibold">{form.progress}%</span>
            </Label>
            <input
              id="progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="w-full accent-amber-500 h-2 cursor-pointer"
              aria-label="Porcentagem de conclusão"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-slate-300 text-sm">{t("tarefaForm.observacao")}</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t("tarefaForm.notasPlaceholder")}
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link" className="text-slate-300 text-sm">{t("tarefaForm.linkReferencia")}</Label>
            <Input
              id="link"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://..."
              type="url"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500"
            />
          </div>

          {/* Ações rápidas (somente em edição) */}
          {isEdicao && podeConcluir && (
            <Button
              type="button"
              onClick={handleAlternarConclusao}
              disabled={alternandoConclusao || salvando || removendo}
              variant="outline"
              className={`w-full gap-2 ${
                estaConcluida
                  ? "border-amber-500/40 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                  : "border-green-500/40 text-green-500 hover:bg-green-500/10 bg-transparent"
              }`}
            >
              {alternandoConclusao ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {estaConcluida ? t("tarefaForm.marcarPendente") : t("tarefaForm.marcarConcluida")}
            </Button>
          )}

          <div className="flex gap-2 pt-2">
            {/* Excluir — apenas em edição */}
            {isEdicao && (
              <Button
                type="button"
                onClick={handleRemover}
                disabled={removendo || salvando || alternandoConclusao}
                variant="outline"
                className={`gap-1.5 border bg-transparent transition-all ${
                  confirmandoRemocao
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                }`}
                title={confirmandoRemocao ? "Clique novamente para confirmar" : "Excluir tarefa"}
                aria-label={confirmandoRemocao ? "Confirmar exclusão" : "Excluir tarefa"}
              >
                {removendo ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span className="hidden sm:inline">
                  {confirmandoRemocao ? t("tarefaForm.confirmar") : t("tarefaForm.excluir")}
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent"
              disabled={salvando || removendo || alternandoConclusao}
            >
              {t("tarefaForm.cancelar")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              disabled={salvando || removendo || alternandoConclusao}
            >
              {salvando ? t("tarefaForm.salvando") : isEdicao ? t("tarefaForm.salvar") : t("tarefaForm.adicionar")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
