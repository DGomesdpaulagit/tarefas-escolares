// Supabase Edge Function — guardian-dashboard
// API PÚBLICA (sem login, verify_jwt=false) que alimenta o painel completo do
// responsável: tarefas, desempenho e mesada. Autenticação é o próprio token —
// longo, aleatório, não enumerável — não uma conta de usuário.
// Ver docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md seção 10 (extensão v4.1).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

type Task = {
  id: string;
  title: string;
  subject_name: string;
  status: string;
  priority: string;
  due_date: string | null;
  progress: number;
};

/** Mesma regra de getStatusEfetivo() do cliente — concluída nunca expira. */
function statusEfetivo(t: Task, hoje: string): string {
  if (t.status === "Concluída") return "Concluída";
  if (t.due_date && t.due_date < hoje) return "Passou do Prazo";
  return t.status;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET") return json({ erro: "metodo_nao_permitido" }, 405);

  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return json({ erro: "token_invalido" }, 400);

  const { data: guardian } = await admin
    .from("guardians")
    .select("id, user_id, nome, status")
    .eq("access_token", token)
    .maybeSingle();

  if (!guardian || guardian.status !== "ativo") {
    return json({ erro: "token_invalido" }, 404);
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("name")
    .eq("id", guardian.user_id)
    .maybeSingle();

  const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // --- tarefas ---
  const { data: tarefasRows } = await admin
    .from("tasks")
    .select("id, title, subject_name, status, priority, due_date, progress")
    .eq("user_id", guardian.user_id)
    .order("due_date", { ascending: true, nullsFirst: false });

  const tarefas = (tarefasRows ?? []) as Task[];

  let concluidas = 0, passouPrazo = 0, emAndamento = 0, pendentes = 0;
  const porMateria: Record<string, number> = {};
  const porStatus: Record<string, number> = {};

  const tarefasComEfetivo = tarefas.map((t) => {
    const efetivo = statusEfetivo(t, hoje);
    if (efetivo === "Concluída") concluidas++;
    else if (efetivo === "Passou do Prazo") passouPrazo++;
    else if (efetivo === "Em Andamento") emAndamento++;
    else pendentes++;

    porMateria[t.subject_name] = (porMateria[t.subject_name] ?? 0) + 1;
    porStatus[efetivo] = (porStatus[efetivo] ?? 0) + 1;

    return { ...t, status_efetivo: efetivo };
  });

  const total = tarefas.length;
  const percentualConcluido = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  // --- mesada (se o usuário tiver dados — não depende de flag do cliente) ---
  const { data: config } = await admin
    .from("mesada_config")
    .select("ano_letivo, meta_total")
    .eq("user_id", guardian.user_id)
    .order("ano_letivo", { ascending: false })
    .limit(1)
    .maybeSingle();

  let mesada: unknown = null;

  if (config) {
    const { data: materias } = await admin
      .from("mesada_materias")
      .select("id, nome, emoji, cor, ordem")
      .eq("user_id", guardian.user_id)
      .eq("ativa", true)
      .order("ordem", { ascending: true });

    const { data: notas } = await admin
      .from("mesada_notas")
      .select("materia_id, mes, conceito, valor_calculado")
      .eq("user_id", guardian.user_id)
      .eq("ano", config.ano_letivo);

    const valorAcumulado = (notas ?? []).reduce((soma, n) => soma + Number(n.valor_calculado), 0);

    const porMateriaMesada = (materias ?? []).map((m) => ({
      nome: m.nome,
      emoji: m.emoji,
      cor: m.cor,
      notas: (notas ?? [])
        .filter((n) => n.materia_id === m.id)
        .map((n) => ({ mes: n.mes, conceito: n.conceito, valor: Number(n.valor_calculado) })),
    }));

    mesada = {
      anoLetivo: config.ano_letivo,
      meta: Number(config.meta_total),
      valorAcumulado,
      porMateria: porMateriaMesada,
    };
  }

  return json({
    estudante: { nome: perfil?.name?.trim() || "Estudante" },
    responsavel: { nome: guardian.nome },
    tarefas: tarefasComEfetivo,
    metricas: {
      total,
      concluidas,
      pendentes,
      emAndamento,
      passouPrazo,
      percentualConcluido,
      porMateria,
      porStatus,
    },
    mesada,
  });
});
