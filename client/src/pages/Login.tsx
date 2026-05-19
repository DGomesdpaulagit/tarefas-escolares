import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Modo = "login" | "cadastro" | "reset";

export default function Login() {
  const { logar, cadastrar, resetarSenha } = useAuth();
  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (modo === "reset") {
        if (!email) { toast.error("Informe seu email"); return; }
        await resetarSenha(email);
        setResetEnviado(true);
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        return;
      }

      if (modo === "login") {
        if (!email || !senha) { toast.error("Preencha todos os campos"); return; }
        await logar(email, senha);
        toast.success("Login realizado com sucesso!");
      } else {
        if (!email || !nome || !senha || !confirmarSenha) { toast.error("Preencha todos os campos"); return; }
        if (senha !== confirmarSenha) { toast.error("As senhas não conferem"); return; }
        if (senha.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return; }
        await cadastrar(email, nome, senha);
        toast.success("Cadastro realizado! Verifique seu email para confirmar a conta.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao processar solicitação";
      if (msg.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (msg.includes("User already registered")) {
        toast.error("Este email já está cadastrado");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Confirme seu email antes de entrar");
      } else {
        toast.error(msg);
      }
    } finally {
      setCarregando(false);
    }
  };

  const trocarModo = (novoModo: Modo) => {
    setModo(novoModo);
    setSenha("");
    setConfirmarSenha("");
    setResetEnviado(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4">
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

        <div className="bg-[#13151f] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-1">
            {modo === "login" ? "Bem-vindo de volta" : modo === "cadastro" ? "Criar conta" : "Recuperar senha"}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {modo === "login" ? "Faça login para acessar suas tarefas"
              : modo === "cadastro" ? "Cadastre-se para começar"
              : "Insira seu email para receber o link de recuperação"}
          </p>

          {resetEnviado ? (
            <div className="text-center py-4">
              <p className="text-green-400 font-medium mb-2">Email enviado!</p>
              <p className="text-slate-400 text-sm">Verifique sua caixa de entrada e siga as instruções.</p>
              <Button variant="ghost" onClick={() => trocarModo("login")} className="mt-4 text-amber-400 hover:text-amber-300">
                Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-slate-300 mb-1.5 block">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500"
                  disabled={carregando}
                  autoComplete="email"
                />
              </div>

              {modo === "cadastro" && (
                <div>
                  <label htmlFor="nome" className="text-xs font-semibold text-slate-300 mb-1.5 block">Nome completo</label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500"
                    disabled={carregando}
                    autoComplete="name"
                  />
                </div>
              )}

              {modo !== "reset" && (
                <div>
                  <label htmlFor="senha" className="text-xs font-semibold text-slate-300 mb-1.5 block">Senha</label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 pr-10 focus:border-amber-500"
                      disabled={carregando}
                      autoComplete={modo === "login" ? "current-password" : "new-password"}
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
              )}

              {modo === "cadastro" && (
                <div>
                  <label htmlFor="confirmar" className="text-xs font-semibold text-slate-300 mb-1.5 block">Confirmar senha</label>
                  <Input
                    id="confirmar"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500"
                    disabled={carregando}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {modo === "login" && (
                <div className="text-right">
                  <button type="button" onClick={() => trocarModo("reset")} className="text-xs text-amber-400 hover:text-amber-300 focus:outline-none">
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold h-10 mt-2"
              >
                {carregando ? (
                  <><Loader2 size={16} className="animate-spin mr-2" />Processando...</>
                ) : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar conta" : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          {!resetEnviado && (
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              {modo === "login" ? (
                <>
                  <p className="text-sm text-slate-400 mb-2">Não tem conta?</p>
                  <Button type="button" variant="ghost" onClick={() => trocarModo("cadastro")} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold">
                    Cadastre-se
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400 mb-2">Já tem conta?</p>
                  <Button type="button" variant="ghost" onClick={() => trocarModo("login")} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold">
                    Faça login
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 text-center mt-6">
          Seus dados são armazenados com segurança via Supabase
        </p>
      </div>
    </div>
  );
}
