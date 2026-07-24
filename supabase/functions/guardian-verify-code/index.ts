// Supabase Edge Function — guardian-verify-code
// Valida o código digitado e executa a operação em `guardians`.
// Toda escrita na tabela passa por aqui — o cliente não tem permissão de INSERT/UPDATE.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, json, hashCodigo } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const MAX_TENTATIVAS = 5;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const cliente = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return json({ erro: "nao_autenticado" }, 401);

  let body: { codigo?: string };
  try {
    body = await req.json();
  } catch {
    return json({ erro: "body_invalido" }, 400);
  }

  const digitado = (body.codigo ?? "").replace(/\D/g, "");
  if (digitado.length !== 6) return json({ erro: "formato_invalido" }, 400);

  // Código válido mais recente do usuário
  const { data: registro } = await admin
    .from("guardian_codes")
    .select("id, guardian_id, codigo_hash, acao, payload, tentativas, expira_em")
    .eq("user_id", user.id)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!registro) return json({ erro: "sem_codigo_valido" }, 404);

  // --- confere o hash ---
  if (registro.codigo_hash !== await hashCodigo(digitado)) {
    const tentativas = registro.tentativas + 1;
    const esgotou = tentativas >= MAX_TENTATIVAS;

    await admin.from("guardian_codes").update({
      tentativas,
      usado_em: esgotou ? new Date().toISOString() : null, // esgotou = invalida
    }).eq("id", registro.id);

    return json({
      erro: esgotou ? "tentativas_esgotadas" : "codigo_incorreto",
      restantes: Math.max(MAX_TENTATIVAS - tentativas, 0),
    }, 400);
  }

  // --- código correto: consome antes de executar (uso único) ---
  await admin.from("guardian_codes")
    .update({ usado_em: new Date().toISOString() })
    .eq("id", registro.id);

  const agora = new Date().toISOString();
  const emailPayload = (registro.payload as { email?: string } | null)?.email ?? null;

  if (registro.acao === "cadastrar") {
    if (!emailPayload) return json({ erro: "payload_invalido" }, 500);
    // upsert por user_id: cobre o caso de uma linha antiga com status 'removido'
    const { data, error } = await admin.from("guardians")
      .upsert({
        user_id: user.id,
        email: emailPayload,
        status: "ativo",
        confirmado_em: agora,
      }, { onConflict: "user_id" })
      .select("id, email, status, criado_em, confirmado_em")
      .single();
    if (error) return json({ erro: "falha_ao_salvar", detalhe: error.message }, 500);
    return json({ ok: true, acao: "cadastrar", guardian: data });
  }

  if (registro.acao === "editar") {
    if (!emailPayload) return json({ erro: "payload_invalido" }, 500);
    const { data, error } = await admin.from("guardians")
      .update({ email: emailPayload, status: "ativo", confirmado_em: agora })
      .eq("user_id", user.id)
      .select("id, email, status, criado_em, confirmado_em")
      .single();
    if (error) return json({ erro: "falha_ao_salvar", detalhe: error.message }, 500);
    return json({ ok: true, acao: "editar", guardian: data });
  }

  // excluir
  const { error } = await admin.from("guardians")
    .update({ status: "removido" })
    .eq("user_id", user.id);
  if (error) return json({ erro: "falha_ao_salvar", detalhe: error.message }, 500);
  return json({ ok: true, acao: "excluir", guardian: null });
});
