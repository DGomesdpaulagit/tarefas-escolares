// Supabase Edge Function — enviar-relatorio-responsavel
// Agendada via Supabase Cron em `0 11 25 * *` (08:00 em Brasília, UTC-3).
// Modelo: send-notifications/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, json } from "../_shared/cors.ts";
import {
  enviarEmail,
  htmlRelatorioMensal,
  normalizarIdioma,
  MESES,
  type DadosRelatorio,
} from "../_shared/email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Endereço público do app — o link de descadastro precisa abrir uma página
// de verdade, e o gateway do Supabase serve Edge Function como text/plain.
const APP_URL = Deno.env.get("APP_URL") ?? "https://tarefas-escolares-five.vercel.app";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

type Task = {
  status: string;
  due_date: string | null;
  subject_name: string;
};

/** Data de hoje no fuso do usuário (Brasília, UTC-3) como "YYYY-MM-DD". */
function hojeBrasilia(): string {
  const agora = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return agora.toISOString().slice(0, 10);
}

/**
 * Mesma classificação de `getStatusEfetivo()` no cliente (lib/tarefasData.ts):
 * concluída nunca expira; só passa do prazo APÓS o fim do dia do vencimento.
 * Recalcular com regra diferente daria números que não batem com a tela.
 */
function classificar(t: Task, hoje: string): "concluida" | "expirada" | "pendente" {
  if (t.status === "Concluída") return "concluida";
  if (t.due_date && t.due_date < hoje) return "expirada";
  return "pendente";
}

function pct(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100);
}

/** Primeiro e último dia (inclusivo) de um mês, em "YYYY-MM-DD". */
function limitesDoMes(ano: number, mes1a12: number): [string, string] {
  const mm = String(mes1a12).padStart(2, "0");
  const ultimoDia = new Date(Date.UTC(ano, mes1a12, 0)).getUTCDate();
  return [`${ano}-${mm}-01`, `${ano}-${mm}-${String(ultimoDia).padStart(2, "0")}`];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ erro: "metodo_nao_permitido" }, 405);
  }

  const hoje = hojeBrasilia();
  const [anoStr, mesStr] = hoje.split("-");
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  const referencia = `${anoStr}-${mesStr}`;

  const [inicioMes, fimMes] = limitesDoMes(ano, mes);
  const anoAnt = mes === 1 ? ano - 1 : ano;
  const mesAnt = mes === 1 ? 12 : mes - 1;
  const [inicioAnt, fimAnt] = limitesDoMes(anoAnt, mesAnt);

  const { data: responsaveis } = await admin
    .from("guardians")
    .select("id, user_id, email, unsubscribe_token")
    .eq("status", "ativo");

  if (!responsaveis || responsaveis.length === 0) {
    return json({ enviados: 0, mensagem: "nenhum responsável ativo" });
  }

  let enviados = 0;
  let falhas = 0;
  let pulados = 0;

  for (const g of responsaveis) {
    // --- idempotência: já mandou este mês? (UNIQUE guardian_id + referencia) ---
    // Só um envio BEM-SUCEDIDO bloqueia. Uma tentativa que falhou tem de poder
    // ser refeita — senão uma indisponibilidade momentânea do provedor faria o
    // mês inteiro ser perdido.
    const { data: jaEnviado } = await admin
      .from("guardian_reports_log")
      .select("id")
      .eq("guardian_id", g.id)
      .eq("referencia", referencia)
      .eq("status", "enviado")
      .maybeSingle();

    if (jaEnviado) { pulados++; continue; }

    const { data: perfil } = await admin
      .from("profiles")
      .select("name, language")
      .eq("id", g.user_id)
      .maybeSingle();

    const idioma = normalizarIdioma(perfil?.language);
    const nomeEstudante = perfil?.name?.trim() || "O estudante";

    // --- tarefas do mês ---
    const { data: doMes } = await admin
      .from("tasks")
      .select("status, due_date, subject_name")
      .eq("user_id", g.user_id)
      .gte("due_date", inicioMes)
      .lte("due_date", fimMes);

    const tarefas = (doMes ?? []) as Task[];

    let concluidas = 0, expiradas = 0, pendentes = 0;
    const porDisciplina = new Map<string, { total: number; feitas: number; perdidas: number }>();

    for (const t of tarefas) {
      const c = classificar(t, hoje);
      if (c === "concluida") concluidas++;
      else if (c === "expirada") expiradas++;
      else pendentes++;

      const nome = t.subject_name?.trim() || "—";
      const acc = porDisciplina.get(nome) ?? { total: 0, feitas: 0, perdidas: 0 };
      acc.total++;
      if (c === "concluida") acc.feitas++;
      if (c === "expirada") acc.perdidas++;
      porDisciplina.set(nome, acc);
    }

    // --- taxa do mês anterior (para a comparação) ---
    const { data: doMesAnterior } = await admin
      .from("tasks")
      .select("status, due_date, subject_name")
      .eq("user_id", g.user_id)
      .gte("due_date", inicioAnt)
      .lte("due_date", fimAnt);

    const anteriores = (doMesAnterior ?? []) as Task[];
    const taxaAnterior = anteriores.length === 0
      ? null
      : pct(anteriores.filter((t) => classificar(t, hoje) === "concluida").length, anteriores.length);

    const { count: totalGeral } = await admin
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", g.user_id);

    // --- destaques por disciplina (só com amostra mínima de 2 tarefas) ---
    let melhorDisciplina: string | null = null;
    let melhorTaxa = -1;
    let disciplinaAtencao: string | null = null;
    let maisPerdidas = 0;

    for (const [nome, d] of porDisciplina) {
      if (d.total >= 2) {
        const taxa = pct(d.feitas, d.total);
        if (taxa > melhorTaxa && taxa > 0) { melhorTaxa = taxa; melhorDisciplina = nome; }
      }
      if (d.perdidas > maisPerdidas) { maisPerdidas = d.perdidas; disciplinaAtencao = nome; }
    }
    // Não faz sentido apontar a mesma disciplina como destaque e como atenção.
    if (melhorDisciplina && melhorDisciplina === disciplinaAtencao) melhorDisciplina = null;

    const dados: DadosRelatorio = {
      nomeEstudante,
      mesLabel: MESES[idioma][mes - 1],
      totalMes: tarefas.length,
      concluidas,
      expiradas,
      pendentes,
      taxa: pct(concluidas, tarefas.length),
      taxaAnterior,
      totalGeral: totalGeral ?? 0,
      melhorDisciplina,
      disciplinaAtencao,
    };

    const linkDescadastro = `${APP_URL}/descadastrar?token=${g.unsubscribe_token}`;

    const { assunto, html } = htmlRelatorioMensal(idioma, dados, linkDescadastro);
    const envio = await enviarEmail(g.email, assunto, html);

    // upsert, não insert: uma retentativa depois de falha reescreve a linha
    await admin.from("guardian_reports_log").upsert({
      guardian_id: g.id,
      referencia,
      enviado_em: new Date().toISOString(),
      status: envio.ok ? "enviado" : "falhou",
      erro: envio.ok ? null : envio.erro?.slice(0, 500),
    }, { onConflict: "guardian_id,referencia" });

    if (envio.ok) enviados++; else falhas++;
  }

  return json({ referencia, enviados, falhas, pulados });
});
