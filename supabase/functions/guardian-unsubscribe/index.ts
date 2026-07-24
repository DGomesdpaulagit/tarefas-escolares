// Supabase Edge Function — guardian-unsubscribe
// API PÚBLICA (sem login) usada pela página /descadastrar do app.
// Quem recebe o relatório precisa poder sair sem depender do estudante.
// Deploy com verify_jwt = false.
//
// GET  ?token=… → consulta o estado do token, sem alterar nada
// POST ?token=… → efetiva o descadastro
//
// Por que a página não mora aqui: o gateway do Supabase devolve todas as
// respostas de Edge Function como `text/plain` com CSP `sandbox` (proteção
// anti-phishing no domínio deles), então HTML servido daqui não renderiza.
// A interface fica no app, em client/src/pages/Descadastrar.tsx.
//
// Por que o GET não descadastra: scanners de e-mail e proxies de segurança
// pré-carregam links, o que cancelaria o relatório sem ninguém clicar.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return json({ estado: "invalido" }, 400);

  const { data: guardian } = await admin
    .from("guardians")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!guardian) return json({ estado: "invalido" }, 404);
  if (guardian.status === "removido") return json({ estado: "ja_removido" });

  if (req.method === "POST") {
    const { error } = await admin.from("guardians")
      .update({ status: "removido" })
      .eq("id", guardian.id);

    if (error) return json({ estado: "falhou" }, 500);
    return json({ estado: "removido" });
  }

  return json({ estado: "valido" });
});
