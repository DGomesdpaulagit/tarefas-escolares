import { useEffect, useState } from "react";
import { BookOpen, Check, Loader2, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Página pública do link no rodapé do relatório mensal.
 * Quem abre é o responsável, que não tem conta no app — por isso ela vive fora
 * de qualquer gate de autenticação ou de Welcome (ver App.tsx).
 *
 * A confirmação é um POST explícito: scanners de e-mail pré-carregam links, e
 * um descadastro no GET cancelaria o envio sem ninguém ter clicado.
 */

type Estado = "carregando" | "valido" | "invalido" | "ja_removido" | "removido" | "falhou";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function Descadastrar() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [enviando, setEnviando] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const chamar = async (metodo: "GET" | "POST"): Promise<Estado> => {
    try {
      const res = await fetch(
        `${FUNCTIONS_URL}/guardian-unsubscribe?token=${encodeURIComponent(token)}`,
        { method: metodo, headers: { apikey: ANON_KEY } },
      );
      const body = await res.json();
      return (body?.estado as Estado) ?? "falhou";
    } catch {
      return "falhou";
    }
  };

  useEffect(() => {
    if (!token) { setEstado("invalido"); return; }
    let vivo = true;
    chamar("GET").then((e) => { if (vivo) setEstado(e); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const confirmar = async () => {
    setEnviando(true);
    setEstado(await chamar("POST"));
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-3xl shadow-2xl p-8 text-center"
        style={{ animation: "scaleIn 0.3s ease-out both" }}
      >
        <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={22} className="text-black" />
        </div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          Tarefas Escolares
        </p>

        {estado === "carregando" && (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin text-amber-500" />
          </div>
        )}

        {estado === "valido" && (
          <>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mt-3">
              Cancelar os relatórios?
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mt-2 mb-6">
              Você deixará de receber o relatório mensal de acompanhamento escolar neste endereço.
            </p>
            <Button
              onClick={confirmar}
              disabled={enviando}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
            >
              {enviando ? <Loader2 size={15} className="animate-spin" /> : <MailX size={15} />}
              Confirmar cancelamento
            </Button>
          </>
        )}

        {estado === "removido" && (
          <Resultado
            icone={<Check size={22} className="text-emerald-500" />}
            titulo="Cancelado"
            texto="Pronto. Este endereço não vai mais receber os relatórios mensais."
          />
        )}

        {estado === "ja_removido" && (
          <Resultado
            icone={<Check size={22} className="text-emerald-500" />}
            titulo="Tudo certo"
            texto="Este endereço já não recebe mais os relatórios. Nenhuma ação necessária."
          />
        )}

        {estado === "invalido" && (
          <Resultado
            icone={<MailX size={22} className="text-red-400" />}
            titulo="Link inválido"
            texto="Este link não é válido ou já expirou. Se você recebeu um relatório por engano, responda ao e-mail avisando."
          />
        )}

        {estado === "falhou" && (
          <Resultado
            icone={<MailX size={22} className="text-red-400" />}
            titulo="Não foi possível cancelar"
            texto="Tente novamente em alguns minutos."
          />
        )}
      </div>
    </div>
  );
}

function Resultado({ icone, titulo, texto }: { icone: React.ReactNode; titulo: string; texto: string }) {
  return (
    <>
      <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center mx-auto mt-5 mb-3">
        {icone}
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
        {titulo}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">{texto}</p>
    </>
  );
}
