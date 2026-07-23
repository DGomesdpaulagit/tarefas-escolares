import { useAuth } from "@/contexts/AuthContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Modo = "login" | "cadastro" | "reset";

export default function Login() {
  const { logar, cadastrar, resetarSenha } = useAuth();
  const { t } = useIdioma();
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
        if (!email) { toast.error(t("login.erroInformeEmail")); return; }
        await resetarSenha(email);
        setResetEnviado(true);
        toast.success(t("login.sucessoResetEnviado"));
        return;
      }

      if (modo === "login") {
        if (!email || !senha) { toast.error(t("login.erroPreencherCampos")); return; }
        await logar(email, senha);
        toast.success(t("login.sucessoLogin"));
      } else {
        if (!email || !nome || !senha || !confirmarSenha) { toast.error(t("login.erroPreencherCampos")); return; }
        if (senha !== confirmarSenha) { toast.error(t("login.erroSenhasNaoConferem")); return; }
        if (senha.length < 6) { toast.error(t("login.erroSenhaCurta")); return; }
        await cadastrar(email, nome, senha);
        toast.success(t("login.sucessoCadastro"));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("login.erroGenerico");
      if (msg.includes("Invalid login credentials")) {
        toast.error(t("login.erroCredenciais"));
      } else if (msg.includes("User already registered")) {
        toast.error(t("login.erroJaCadastrado"));
      } else if (msg.includes("Email not confirmed")) {
        toast.error(t("login.erroEmailNaoConfirmado"));
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
            <BookOpen size={20} className="text-black" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-['Space_Grotesk']">{t("sidebar.brandLinha1")}</p>
            <p className="text-xs text-slate-500">{t("sidebar.brandLinha2")}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-1">
            {modo === "login" ? t("login.bemVindo") : modo === "cadastro" ? t("login.criarConta") : t("login.recuperarSenha")}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {modo === "login" ? t("login.faLoginParaAcessar")
              : modo === "cadastro" ? t("login.cadastreSeParaComecar")
              : t("login.insiraEmailRecuperacao")}
          </p>

          {resetEnviado ? (
            <div className="text-center py-4">
              <p className="text-green-400 font-medium mb-2">{t("login.emailEnviado")}</p>
              <p className="text-slate-400 text-sm">{t("login.verifiqueCaixaEntrada")}</p>
              <Button variant="ghost" onClick={() => trocarModo("login")} className="mt-4 text-amber-400 hover:text-amber-300">
                {t("login.voltarAoLogin")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-slate-300 mb-1.5 block">{t("login.email")}</label>
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
                  <label htmlFor="nome" className="text-xs font-semibold text-slate-300 mb-1.5 block">{t("login.nomeCompleto")}</label>
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
                  <label htmlFor="senha" className="text-xs font-semibold text-slate-300 mb-1.5 block">{t("login.senha")}</label>
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
                      aria-label={mostrarSenha ? t("login.ocultarSenha") : t("login.mostrarSenha")}
                    >
                      {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {modo === "cadastro" && (
                <div>
                  <label htmlFor="confirmar" className="text-xs font-semibold text-slate-300 mb-1.5 block">{t("login.confirmarSenha")}</label>
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
                    {t("login.esqueceuSenha")}
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold h-10 mt-2"
              >
                {carregando ? (
                  <><Loader2 size={16} className="animate-spin mr-2" />{t("common.processando")}</>
                ) : modo === "login" ? t("login.entrar") : modo === "cadastro" ? t("login.criarConta") : t("login.enviarLinkRecuperacao")}
              </Button>
            </form>
          )}

          {!resetEnviado && (
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              {modo === "login" ? (
                <>
                  <p className="text-sm text-slate-400 mb-2">{t("login.naoTemConta")}</p>
                  <Button type="button" variant="ghost" onClick={() => trocarModo("cadastro")} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold">
                    {t("login.cadastreSe")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400 mb-2">{t("login.jaTemConta")}</p>
                  <Button type="button" variant="ghost" onClick={() => trocarModo("login")} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold">
                    {t("login.facaLogin")}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 text-center mt-6">
          {t("login.dadosSeguranca")}
        </p>
      </div>
    </div>
  );
}
