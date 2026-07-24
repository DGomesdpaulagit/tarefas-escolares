// Supabase Edge Function — guardian-request-code
// Gera e envia o código de 6 dígitos ao e-mail do responsável.
// Ver docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md (seção 2).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, json, mascararEmail, hashCodigo, gerarCodigo, emailValido } from "../_shared/cors.ts";
import { enviarEmail, htmlCodigoVerificacao, normalizarIdioma } from "../_shared/email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const RATE_LIMIT_SEGUNDOS = 60;
const VALIDADE_MINUTOS = 30;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405);

  // --- autenticação: o código é sempre pedido por um usuário logado ---
  const authHeader = req.headers.get("Authorization") ?? "";
  const cliente = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return json({ erro: "nao_autenticado" }, 401);

  let body: { acao?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ erro: "body_invalido" }, 400);
  }

  const acao = body.acao;
  if (acao !== "cadastrar" && acao !== "editar" && acao !== "excluir") {
    return json({ erro: "acao_invalida" }, 400);
  }

  const emailNovo = (body.email ?? "").trim().toLowerCase();

  // --- rate limit: 1 código por minuto por usuário ---
  const { data: ultimo } = await admin
    .from("guardian_codes")
    .select("criado_em")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ultimo) {
    const decorrido = (Date.now() - new Date(ultimo.criado_em).getTime()) / 1000;
    if (decorrido < RATE_LIMIT_SEGUNDOS) {
      return json({ erro: "aguarde", segundos: Math.ceil(RATE_LIMIT_SEGUNDOS - decorrido) }, 429);
    }
  }

  // --- estado atual do responsável ---
  const { data: guardian } = await admin
    .from("guardians")
    .select("id, email, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const ativo = guardian && guardian.status === "ativo" ? guardian : null;

  // --- valida a operação e decide para ONDE o código vai ---
  let destino: string;

  if (acao === "cadastrar") {
    if (ativo) return json({ erro: "ja_existe_responsavel" }, 409);
    if (!emailValido(emailNovo)) return json({ erro: "email_invalido" }, 400);
    destino = emailNovo; // quem autoriza é o e-mail que está sendo cadastrado
  } else if (acao === "editar") {
    if (!ativo) return json({ erro: "sem_responsavel" }, 409);
    if (!emailValido(emailNovo)) return json({ erro: "email_invalido" }, 400);
    if (emailNovo === ativo.email) return json({ erro: "email_igual_ao_atual" }, 400);
    destino = ativo.email; // é o responsável atual quem autoriza a troca
  } else {
    if (!ativo) return json({ erro: "sem_responsavel" }, 409);
    destino = ativo.email;
  }

  // --- gera e grava o código (apenas o hash) ---
  const codigo = gerarCodigo();
  const expira = new Date(Date.now() + VALIDADE_MINUTOS * 60_000).toISOString();

  const { error: erroInsert } = await admin.from("guardian_codes").insert({
    user_id: user.id,
    guardian_id: guardian?.id ?? null,
    codigo_hash: await hashCodigo(codigo),
    acao,
    payload: acao === "excluir" ? null : { email: emailNovo },
    expira_em: expira,
  });

  if (erroInsert) return json({ erro: "falha_ao_gerar", detalhe: erroInsert.message }, 500);

  // --- envia o e-mail ---
  const { data: perfil } = await admin
    .from("profiles")
    .select("name, language")
    .eq("id", user.id)
    .maybeSingle();

  const idioma = normalizarIdioma(perfil?.language);
  const nome = perfil?.name?.trim() || user.email?.split("@")[0] || "O estudante";

  const { assunto, html } = htmlCodigoVerificacao(idioma, acao, nome, codigo);
  const envio = await enviarEmail(destino, assunto, html);

  if (!envio.ok) {
    // Invalida o código: se o e-mail não saiu, ninguém pode usá-lo.
    await admin.from("guardian_codes")
      .update({ usado_em: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("usado_em", null);
    return json({ erro: "falha_no_envio", detalhe: envio.erro }, 502);
  }

  return json({
    ok: true,
    destino_mascarado: mascararEmail(destino),
    expira_em: expira,
  });
});
