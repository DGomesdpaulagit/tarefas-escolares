import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MailCheck, Pencil, Send, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIdioma } from "@/contexts/LanguageContext";
import { ErroResponsavel, guardianService } from "@/services/guardianService";
import type { DicionarioChave } from "@/lib/i18n";
import type { AcaoResponsavel, Responsavel } from "@/types";

const COOLDOWN_REENVIO = 60;

/**
 * Painel de gestão do responsável que recebe o relatório mensal.
 * Usado em Configurações (aba Responsável) e no Onboarding (passo 3).
 *
 * As três operações — cadastrar, editar e excluir — passam pelo mesmo fluxo:
 * pede código → o código vai por e-mail a quem autoriza → o estudante digita.
 */
export default function ResponsavelPainel({
  userId,
  compacto = false,
  onMudanca,
}: {
  userId: string | undefined;
  /** No onboarding esconde o histórico e o cabeçalho próprio. */
  compacto?: boolean;
  onMudanca?: (r: Responsavel | null) => void;
}) {
  const { t } = useIdioma();

  const [carregando, setCarregando] = useState(true);
  const [responsavel, setResponsavel] = useState<Responsavel | null>(null);

  const [acao, setAcao] = useState<AcaoResponsavel | null>(null);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [destino, setDestino] = useState<string | null>(null);
  const [expiraEm, setExpiraEm] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [agora, setAgora] = useState(Date.now());

  const aguardandoCodigo = destino !== null;

  // --- carga inicial -------------------------------------------------------
  useEffect(() => {
    if (!userId) { setCarregando(false); return; }
    let vivo = true;
    guardianService.get(userId).then((r) => {
      if (!vivo) return;
      setResponsavel(r);
      setCarregando(false);
    });
    return () => { vivo = false; };
  }, [userId]);

  // --- relógio único para expiração e cooldown -----------------------------
  useEffect(() => {
    if (!aguardandoCodigo && cooldown === 0) return;
    const id = setInterval(() => {
      setAgora(Date.now());
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [aguardandoCodigo, cooldown]);

  const segundosParaExpirar = expiraEm ? Math.max(0, Math.round((expiraEm - agora) / 1000)) : 0;
  const expirado = aguardandoCodigo && segundosParaExpirar === 0;

  const traduzErro = useCallback(
    (e: unknown): string => {
      if (e instanceof ErroResponsavel) {
        const chave = `resp.erro.${e.codigo}` as DicionarioChave;
        const texto = t(chave);
        // t() devolve a própria chave quando ela não existe no dicionário
        if (texto !== chave) {
          if (e.codigo === "codigo_incorreto" && typeof e.restantes === "number") {
            return `${texto} ${e.restantes} ${t("resp.tentativasRestantes")}.`;
          }
          if (e.codigo === "aguarde" && typeof e.segundos === "number") {
            return `${texto} (${e.segundos}s)`;
          }
          return texto;
        }
      }
      return t("resp.erro.generico");
    },
    [t],
  );

  const limpar = () => {
    setAcao(null);
    setEmail("");
    setCodigo("");
    setDestino(null);
    setExpiraEm(null);
    setErro(null);
  };

  // --- pedir código --------------------------------------------------------
  const pedirCodigo = async (qual: AcaoResponsavel, emailAlvo?: string) => {
    setOcupado(true);
    setErro(null);
    try {
      const r = await guardianService.solicitarCodigo(qual, emailAlvo);
      setAcao(qual);
      setDestino(r.destino_mascarado);
      setExpiraEm(new Date(r.expira_em).getTime());
      setAgora(Date.now());
      setCooldown(COOLDOWN_REENVIO);
      setCodigo("");
      toast.success(t("resp.codigoEnviado"));
    } catch (e) {
      const msg = traduzErro(e);
      setErro(msg);
      if (e instanceof ErroResponsavel && e.codigo === "aguarde" && e.segundos) {
        setCooldown(e.segundos);
      }
    } finally {
      setOcupado(false);
    }
  };

  // --- confirmar código ----------------------------------------------------
  const confirmar = async () => {
    if (codigo.length !== 6) { setErro(t("resp.erro.formato_invalido")); return; }
    setOcupado(true);
    setErro(null);
    try {
      const r = await guardianService.verificarCodigo(codigo);
      setResponsavel(r.guardian);
      onMudanca?.(r.guardian);
      toast.success(
        r.acao === "cadastrar" ? t("resp.sucessoCadastro")
        : r.acao === "editar" ? t("resp.sucessoEdicao")
        : t("resp.sucessoExclusao"),
      );
      limpar();
    } catch (e) {
      setErro(traduzErro(e));
      setCodigo("");
    } finally {
      setOcupado(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">
        <Loader2 size={18} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!compacto && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Space_Grotesk']">
            {t("resp.titulo")}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("resp.subtitulo")}</p>
        </div>
      )}

      {/* Estado atual */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        {responsavel ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <MailCheck size={17} className="text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white break-all">
                {responsavel.email}
              </p>
              {responsavel.confirmado_em && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("resp.recebendoDesde")}{" "}
                  {new Date(responsavel.confirmado_em).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <Mail size={17} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {t("resp.nenhumCadastrado")}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{t("resp.nenhumDescricao")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fluxo */}
      {aguardandoCodigo ? (
        <EntradaCodigo
          destino={destino!}
          codigo={codigo}
          setCodigo={(v) => { setCodigo(v); setErro(null); }}
          segundosParaExpirar={segundosParaExpirar}
          expirado={expirado}
          cooldown={cooldown}
          ocupado={ocupado}
          erro={erro}
          onConfirmar={confirmar}
          onReenviar={() => pedirCodigo(acao!, acao === "excluir" ? undefined : email)}
          onCancelar={limpar}
          t={t}
        />
      ) : acao ? (
        <FormEmail
          acao={acao}
          email={email}
          setEmail={(v) => { setEmail(v); setErro(null); }}
          ocupado={ocupado}
          erro={erro}
          onEnviar={() => pedirCodigo(acao, acao === "excluir" ? undefined : email)}
          onCancelar={limpar}
          t={t}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {responsavel ? (
            <>
              <Button
                onClick={() => { setAcao("editar"); setErro(null); }}
                variant="outline"
                className="border-white/10 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-white/10 gap-2"
              >
                <Pencil size={14} />
                {t("resp.btnEditar")}
              </Button>
              <Button
                onClick={() => { setAcao("excluir"); setErro(null); }}
                variant="outline"
                className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 gap-2"
              >
                <Trash2 size={14} />
                {t("resp.btnExcluir")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => { setAcao("cadastrar"); setErro(null); }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
            >
              <Mail size={14} />
              {t("resp.btnCadastrar")}
            </Button>
          )}
        </div>
      )}

      {/* O que é enviado — transparência */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck size={14} className="text-amber-500" />
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
            {t("resp.oQueEnviado")}
          </p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{t("resp.oQueEnviadoDetalhe")}</p>
      </div>

      {!compacto && responsavel && <Historico guardianId={responsavel.id} t={t} />}
    </div>
  );
}

// ============================================================
// Formulário de e-mail (cadastrar / editar) e confirmação (excluir)
// ============================================================

function FormEmail({
  acao, email, setEmail, ocupado, erro, onEnviar, onCancelar, t,
}: {
  acao: AcaoResponsavel;
  email: string;
  setEmail: (s: string) => void;
  ocupado: boolean;
  erro: string | null;
  onEnviar: () => void;
  onCancelar: () => void;
  t: (c: DicionarioChave) => string;
}) {
  const aviso =
    acao === "cadastrar" ? t("resp.avisoCadastrar")
    : acao === "editar" ? t("resp.avisoEditar")
    : t("resp.avisoExcluir");

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{aviso}</p>

      {acao !== "excluir" && (
        <div className="space-y-1.5">
          <Label htmlFor="resp-email" className="text-slate-700 dark:text-slate-300 text-sm">
            {acao === "editar" ? t("resp.emailNovoLabel") : t("resp.emailLabel")}
          </Label>
          <Input
            id="resp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("resp.emailPlaceholder")}
            className="bg-white/5 border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
            autoFocus
            autoComplete="off"
          />
        </div>
      )}

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <div className="flex gap-2">
        <Button
          onClick={onEnviar}
          disabled={ocupado || (acao !== "excluir" && email.trim().length === 0)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
        >
          {ocupado ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {t("resp.btnEnviarCodigo")}
        </Button>
        <Button
          onClick={onCancelar}
          disabled={ocupado}
          variant="outline"
          className="border-white/10 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-white/10"
        >
          {t("resp.btnCancelar")}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Entrada do código de 6 dígitos
// ============================================================

function EntradaCodigo({
  destino, codigo, setCodigo, segundosParaExpirar, expirado, cooldown,
  ocupado, erro, onConfirmar, onReenviar, onCancelar, t,
}: {
  destino: string;
  codigo: string;
  setCodigo: (s: string) => void;
  segundosParaExpirar: number;
  expirado: boolean;
  cooldown: number;
  ocupado: boolean;
  erro: string | null;
  onConfirmar: () => void;
  onReenviar: () => void;
  onCancelar: () => void;
  t: (c: DicionarioChave) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const mmss = `${Math.floor(segundosParaExpirar / 60)}:${String(segundosParaExpirar % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t("resp.codigoEnviadoPara")}{" "}
          <span className="font-medium text-slate-900 dark:text-white">{destino}</span>
        </p>
        <button
          onClick={onCancelar}
          className="text-slate-500 hover:text-slate-300 shrink-0"
          aria-label={t("resp.btnCancelar")}
        >
          <X size={15} />
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resp-codigo" className="text-slate-700 dark:text-slate-300 text-sm">
          {t("resp.digiteOCodigo")}
        </Label>
        <Input
          id="resp-codigo"
          ref={inputRef}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => { if (e.key === "Enter" && codigo.length === 6) onConfirmar(); }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          disabled={expirado}
          className="bg-white/5 border-white/10 text-slate-900 dark:text-white focus:border-amber-500 text-center text-2xl tracking-[0.5em] font-mono h-14"
        />
      </div>

      <p className={`text-xs ${expirado ? "text-red-400" : "text-slate-500"}`}>
        {expirado ? t("resp.expirado") : `${t("resp.expiraEm")} ${mmss}`}
      </p>

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onConfirmar}
          disabled={ocupado || expirado || codigo.length !== 6}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
        >
          {ocupado ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {t("resp.btnConfirmar")}
        </Button>
        <Button
          onClick={onReenviar}
          disabled={ocupado || cooldown > 0}
          variant="outline"
          className="border-white/10 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-white/10"
        >
          {cooldown > 0 ? `${t("resp.reenviarEm")} ${cooldown}s` : t("resp.btnReenviar")}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Histórico de relatórios enviados
// ============================================================

function Historico({ guardianId, t }: { guardianId: string; t: (c: DicionarioChave) => string }) {
  const [itens, setItens] = useState<{ id: string; referencia: string; enviado_em: string; status: string }[]>([]);

  useEffect(() => {
    let vivo = true;
    guardianService.historico(guardianId).then((r) => { if (vivo) setItens(r); });
    return () => { vivo = false; };
  }, [guardianId]);

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
        {t("resp.historicoTitulo")}
      </p>
      {itens.length === 0 ? (
        <p className="text-xs text-slate-500 italic">{t("resp.historicoVazio")}</p>
      ) : (
        <ul className="space-y-1">
          {itens.map((i) => (
            <li key={i.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
              <span className="text-slate-600 dark:text-slate-400">{i.referencia}</span>
              <span className={i.status === "enviado" ? "text-emerald-500" : "text-red-400"}>
                {i.status === "enviado" ? t("resp.statusEnviado") : t("resp.statusFalhou")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
