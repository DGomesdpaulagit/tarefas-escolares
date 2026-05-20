import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [aguardando, setAguardando] = useState(true);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Supabase v2 processa o hash #access_token=...&type=recovery automaticamente
    // e dispara o evento PASSWORD_RECOVERY via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY" && s) {
        setSession(s);
        setAguardando(false);
      }
    });

    // Fallback: verifica se já há sessão ativa (ex: usuário recarregou a página)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setAguardando(false);
      } else {
        // Aguarda até 3s pelo evento PASSWORD_RECOVERY antes de mostrar erro
        setTimeout(() => setAguardando(false), 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmar) {
      toast.error("As senhas não conferem");
      return;
    }

    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      // Encerra a sessão temporária de recovery e redireciona para o login
      await supabase.auth.signOut();
      setLocation("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar senha";
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  // ── Carregando ────────────────────────────────────────────────────────────
  if (aguardando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // ── Link inválido / expirado ──────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <BookOpen size={20} className="text-black" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-white font-['Space_Grotesk']">Tarefas</p>
              <p className="text-xs text-slate-500">Escolares</p>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-red-500/20 rounded-2xl p-6 shadow-2xl text-center">
            <AlertTriangle size={40} className="mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              O link de recuperação pode ter expirado. Solicite um novo link de recuperação.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              Voltar ao login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário de nova senha ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
            <BookOpen size={20} className="text-black" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-['Space_Grotesk']">Tarefas</p>
            <p className="text-xs text-slate-500">Escolares</p>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Nova senha
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Escolha uma senha segura com pelo menos 6 caracteres.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="nova" className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Nova senha
              </label>
              <div className="relative">
                <Input
                  id="nova"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  minLength={6}
                  disabled={salvando}
                  autoFocus
                  autoComplete="new-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 pr-10 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmar" className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Confirmar senha
              </label>
              <Input
                id="confirmar"
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                disabled={salvando}
                autoComplete="new-password"
                className={`bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500 ${
                  confirmar && novaSenha !== confirmar ? "border-red-500/50" : ""
                }`}
              />
              {confirmar && novaSenha !== confirmar && (
                <p className="text-xs text-red-400 mt-1">As senhas não conferem</p>
              )}
            </div>

            {/* Indicador de força da senha */}
            {novaSenha.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < Math.min(Math.floor(novaSenha.length / 3), 4)
                          ? novaSenha.length < 6 ? "bg-red-500"
                            : novaSenha.length < 10 ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {novaSenha.length < 6 ? "Senha muito curta"
                    : novaSenha.length < 10 ? "Força média"
                    : "Senha forte"}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={salvando || novaSenha !== confirmar || novaSenha.length < 6}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold h-10 mt-2 disabled:opacity-50"
            >
              {salvando ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Salvando...</>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </form>
        </div>

        <p className="text-xs text-slate-600 text-center mt-6">
          Seus dados são armazenados com segurança via Supabase
        </p>
      </div>
    </div>
  );
}
