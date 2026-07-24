import { supabase } from "@/supabase/client";
import type { AcaoResponsavel, RelatorioEnviado, Responsavel } from "@/types";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Erro vindo das Edge Functions do responsável.
 * `codigo` é a chave estável usada pela UI pra escolher a mensagem traduzida.
 */
export class ErroResponsavel extends Error {
  constructor(
    public codigo: string,
    /** presente em `aguarde` — quantos segundos ainda faltam */
    public segundos?: number,
    /** presente em `codigo_incorreto` — tentativas restantes */
    public restantes?: number,
  ) {
    super(codigo);
    this.name = "ErroResponsavel";
  }
}

async function chamar<T>(funcao: string, body: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new ErroResponsavel("nao_autenticado");

  const res = await fetch(`${FUNCTIONS_URL}/${funcao}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  let payload: Record<string, unknown>;
  try {
    payload = await res.json();
  } catch {
    throw new ErroResponsavel("resposta_invalida");
  }

  if (!res.ok) {
    throw new ErroResponsavel(
      String(payload.erro ?? "erro_desconhecido"),
      typeof payload.segundos === "number" ? payload.segundos : undefined,
      typeof payload.restantes === "number" ? payload.restantes : undefined,
    );
  }

  return payload as T;
}

export const guardianService = {
  /**
   * Responsável atual do usuário. Retorna null quando não existe ou já foi
   * removido — a tabela guarda a linha `removido` por histórico, mas para a UI
   * isso é o mesmo que "não tem responsável".
   */
  async get(userId: string): Promise<Responsavel | null> {
    const { data, error } = await supabase
      .from("guardians")
      .select("id, user_id, email, nome, status, criado_em, confirmado_em")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    const resp = data as Responsavel;
    return resp.status === "ativo" ? resp : null;
  },

  /**
   * Pede um código de 6 dígitos. O código vai para o e-mail que autoriza a
   * operação: o novo no cadastro, o atual em editar/excluir.
   */
  async solicitarCodigo(
    acao: AcaoResponsavel,
    email?: string,
  ): Promise<{ destino_mascarado: string; expira_em: string }> {
    return chamar("guardian-request-code", { acao, email });
  },

  /** Valida o código digitado e efetiva a operação. */
  async verificarCodigo(
    codigo: string,
  ): Promise<{ acao: AcaoResponsavel; guardian: Responsavel | null }> {
    return chamar("guardian-verify-code", { codigo });
  },

  /** Histórico de relatórios enviados (transparência para o usuário). */
  async historico(guardianId: string): Promise<RelatorioEnviado[]> {
    const { data, error } = await supabase
      .from("guardian_reports_log")
      .select("*")
      .eq("guardian_id", guardianId)
      .order("enviado_em", { ascending: false })
      .limit(12);

    if (error || !data) return [];
    return data as RelatorioEnviado[];
  },
};
