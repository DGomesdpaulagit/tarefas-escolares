import { useAuth } from "@/contexts/AuthContext";
import { useDisciplinas } from "@/contexts/DisciplinasContext";
import { profileService } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MATERIAS_PADRAO,
  MATERIAS_CORES,
  MATERIAS_EMOJIS,
  getMateriaEmoji,
} from "@/lib/tarefasData";
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface OnboardingProps {
  onConcluir: () => void;
}

type Passo = 1 | 2 | 3;

export default function Onboarding({ onConcluir }: OnboardingProps) {
  const { user } = useAuth();
  const { criar } = useDisciplinas();

  const [passo, setPasso] = useState<Passo>(1);
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [salvando, setSalvando] = useState(false);

  // Pré-preenche nome a partir do user metadata
  useEffect(() => {
    if (!user) return;
    profileService.get(user.id).then((p) => {
      if (p?.name) setNome(p.name);
      else if (user.user_metadata?.name) setNome(user.user_metadata.name);
    });
  }, [user]);

  // Catálogo: padrões disponíveis pra escolher (todas exceto "Outra")
  const catalogo = useMemo(
    () => MATERIAS_PADRAO.filter((m) => m !== "Outra"),
    [],
  );

  const toggleDisciplina = (nomeDisc: string) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(nomeDisc)) next.delete(nomeDisc);
      else next.add(nomeDisc);
      return next;
    });
  };

  const concluir = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      // 1. Salva nome + ano escolar + marca onboarding completo
      await profileService.upsert({
        id: user.id,
        name: nome.trim() || null,
        school_year: ano.trim() || null,
        onboarding_completed: true,
      });

      // 2. Cria as disciplinas selecionadas em paralelo
      const criarPromessas = Array.from(selecionadas).map((nomeDisc) =>
        criar({
          name: nomeDisc,
          color: MATERIAS_CORES[nomeDisc] ?? "#94a3b8",
          emoji: MATERIAS_EMOJIS[nomeDisc] ?? "📘",
        }).catch(() => null),
      );
      await Promise.all(criarPromessas);

      toast.success(`Boas-vindas, ${nome.trim() || "estudante"}! 🎉`);
      onConcluir();
    } catch {
      toast.error("Erro ao concluir cadastro. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const pular = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      await profileService.upsert({ id: user.id, onboarding_completed: true });
      onConcluir();
    } catch {
      toast.error("Erro ao pular. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl bg-[var(--bg-card)] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "scaleIn 0.3s ease-out both" }}
      >
        {/* Cabeçalho com progresso */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <BookOpen size={20} className="text-black" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Tarefas Escolares</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Vamos configurar sua conta
              </p>
            </div>
            <button
              onClick={pular}
              disabled={salvando}
              className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Pular
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex-1 flex items-center gap-2">
                <div
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    n <= passo ? "bg-amber-500" : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">Passo {passo} de 3</span>
            <span className="text-xs text-slate-500">
              {passo === 1 && "Sobre você"}
              {passo === 2 && "Suas disciplinas"}
              {passo === 3 && "Pronto!"}
            </span>
          </div>
        </div>

        {/* Conteúdo do passo */}
        <div className="px-6 sm:px-8 py-6 min-h-[400px]">
          {passo === 1 && (
            <PassoBoasVindas
              nome={nome}
              setNome={setNome}
              ano={ano}
              setAno={setAno}
            />
          )}
          {passo === 2 && (
            <PassoDisciplinas
              catalogo={catalogo}
              selecionadas={selecionadas}
              toggle={toggleDisciplina}
            />
          )}
          {passo === 3 && (
            <PassoRevisao
              nome={nome}
              ano={ano}
              selecionadas={selecionadas}
            />
          )}
        </div>

        {/* Botões de navegação */}
        <div className="px-6 sm:px-8 py-5 border-t border-white/8 flex items-center gap-3">
          {passo > 1 && (
            <Button
              variant="outline"
              onClick={() => setPasso((p) => (p - 1) as Passo)}
              disabled={salvando}
              className="border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 bg-transparent gap-2"
            >
              <ArrowLeft size={14} />
              Voltar
            </Button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {passo < 3 ? (
              <Button
                onClick={() => setPasso((p) => (p + 1) as Passo)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
              >
                Próximo
                <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={concluir}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
              >
                {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Começar a usar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Passo 1 — Boas-vindas + nome + ano
// ============================================================

function PassoBoasVindas({
  nome,
  setNome,
  ano,
  setAno,
}: {
  nome: string;
  setNome: (s: string) => void;
  ano: string;
  setAno: (s: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-3">👋</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
          Boas-vindas!
        </h2>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          Em alguns passos, vamos personalizar sua experiência. Você pode pular
          essa parte e fazer depois nas configurações.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ob-nome" className="text-slate-700 dark:text-slate-300 text-sm">
            Como você quer ser chamado?
          </Label>
          <Input
            id="ob-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Davi"
            className="bg-white/5 border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
            maxLength={40}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ob-ano" className="text-slate-700 dark:text-slate-300 text-sm">
            Ano / série (opcional)
          </Label>
          <Input
            id="ob-ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            placeholder="Ex: 3º Ano Técnico"
            className="bg-white/5 border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
            maxLength={40}
          />
          <p className="text-xs text-slate-500">
            Vai aparecer na sua bio do perfil. Pode editar depois.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Passo 2 — Seleção de disciplinas
// ============================================================

function PassoDisciplinas({
  catalogo,
  selecionadas,
  toggle,
}: {
  catalogo: string[];
  selecionadas: Set<string>;
  toggle: (nome: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
          Quais disciplinas você cursa?
        </h2>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          Toque nos cards para selecionar. Você pode personalizar emoji e cor
          depois, e adicionar disciplinas próprias.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-amber-500">
        <Sparkles size={12} />
        <span>{selecionadas.size} selecionada{selecionadas.size !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {catalogo.map((nome) => {
          const cor = MATERIAS_CORES[nome] ?? "#94a3b8";
          const emoji = getMateriaEmoji(nome);
          const ativo = selecionadas.has(nome);
          return (
            <button
              key={nome}
              type="button"
              onClick={() => toggle(nome)}
              className={`relative rounded-2xl border-2 p-3 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                ativo ? "shadow-lg" : ""
              }`}
              style={{
                backgroundColor: ativo ? `${cor}25` : "var(--bg-card-hover)",
                borderColor: ativo ? cor : "rgba(148, 163, 184, 0.15)",
              }}
              aria-pressed={ativo}
            >
              {ativo && (
                <div
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cor }}
                >
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className="text-3xl mb-1">{emoji}</div>
              <p
                className="text-xs font-semibold truncate"
                style={{ color: ativo ? cor : undefined }}
              >
                {nome}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500 pt-2">
        Não tem na lista? Você poderá adicionar disciplinas personalizadas depois.
      </p>
    </div>
  );
}

// ============================================================
// Passo 3 — Revisão final
// ============================================================

function PassoRevisao({
  nome,
  ano,
  selecionadas,
}: {
  nome: string;
  ano: string;
  selecionadas: Set<string>;
}) {
  const nomeExibido = nome.trim() || "Estudante";
  const lista = Array.from(selecionadas);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
          Tudo pronto, {nomeExibido}!
        </h2>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          Revise abaixo e clique em "Começar a usar" para entrar no app.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <ResumoLinha label="Nome" valor={nomeExibido} />
        {ano.trim() && <ResumoLinha label="Ano" valor={ano.trim()} />}
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
            Disciplinas ({lista.length})
          </p>
          {lista.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Nenhuma disciplina selecionada — você pode adicionar depois.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lista.map((n) => {
                const cor = MATERIAS_CORES[n] ?? "#94a3b8";
                const emoji = getMateriaEmoji(n);
                return (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${cor}20`,
                      color: cor,
                      border: `1px solid ${cor}40`,
                    }}
                  >
                    <span>{emoji}</span>
                    {n}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white/5 rounded-full px-3 py-1.5 border border-white/8">
          <Plus size={11} />
          Mais ajustes em Configurações &gt; Perfil
        </div>
      </div>
    </div>
  );
}

function ResumoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/8">
      <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{valor}</span>
    </div>
  );
}
