// Supabase Edge Function — analisar-audio-tarefas
// Recebe o caminho de um áudio já enviado ao Storage, chama o Gemini (áudio)
// e devolve uma lista de tarefas candidatas para revisão do usuário.
// Mesma arquitetura de analisar-imagem-tarefas, trocando imagem por áudio e
// bucket/tabela próprios (não compartilha cota diária com a análise de foto).
// Ver docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY") ?? "";

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const LIMITE_DIARIO = 5;
const JANELA_HORAS = 24;
const TAMANHO_MAX_BYTES = 15 * 1024 * 1024; // folga para ~90s de áudio comprimido

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

type CandidataIA = {
  title?: unknown;
  subject_name?: unknown;
  due_date?: unknown;
  priority?: unknown;
  confidence?: unknown;
};

type CandidataFinal = {
  title: string;
  subject_name: string | null;
  due_date: string | null;
  priority: "Alta" | "Média" | "Baixa";
  confianca: number;
  camposFaltando: ("data" | "disciplina" | "titulo")[];
};

const PRIORIDADES = new Set(["Alta", "Média", "Baixa"]);

function hojeBrasilia(): string {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function extrairArrayJSON(texto: string): unknown[] {
  const inicio = texto.indexOf("[");
  const fim = texto.lastIndexOf("]");
  if (inicio === -1 || fim === -1 || fim < inicio) throw new Error("resposta_sem_json");
  const bruto = JSON.parse(texto.slice(inicio, fim + 1));
  if (!Array.isArray(bruto)) throw new Error("resposta_nao_e_array");
  return bruto;
}

/** Mesma regra determinística de "detalhamento incompleto" da análise de imagem. */
function avaliarCampos(
  title: string,
  subjectName: string | null,
  dueDate: string | null,
  disciplinasConhecidas: Set<string>,
): CandidataFinal["camposFaltando"] {
  const faltando: CandidataFinal["camposFaltando"] = [];

  if (!dueDate) faltando.push("data");

  const disciplinaBate = subjectName !== null && disciplinasConhecidas.has(subjectName.toLowerCase());
  if (!subjectName || !disciplinaBate) faltando.push("disciplina");

  const palavras = title.trim().split(/\s+/).filter(Boolean).length;
  if (palavras < 4 && !dueDate && (!subjectName || !disciplinaBate)) {
    faltando.push("titulo");
  }

  return faltando;
}

function normalizarCandidata(
  bruta: CandidataIA,
  disciplinasConhecidas: Set<string>,
): CandidataFinal | null {
  const title = typeof bruta.title === "string" ? bruta.title.trim() : "";
  if (!title) return null;

  const subjectName = typeof bruta.subject_name === "string" && bruta.subject_name.trim()
    ? bruta.subject_name.trim()
    : null;

  const dueDate = typeof bruta.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(bruta.due_date)
    ? bruta.due_date
    : null;

  const priority = typeof bruta.priority === "string" && PRIORIDADES.has(bruta.priority)
    ? bruta.priority as CandidataFinal["priority"]
    : "Média";

  const confianca = typeof bruta.confidence === "number"
    ? Math.max(0, Math.min(1, bruta.confidence))
    : 0.5;

  return {
    title,
    subject_name: subjectName,
    due_date: dueDate,
    priority,
    confianca,
    camposFaltando: avaliarCampos(title, subjectName, dueDate, disciplinasConhecidas),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const cliente = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return json({ erro: "nao_autenticado" }, 401);

  let body: { path?: string };
  try {
    body = await req.json();
  } catch {
    return json({ erro: "body_invalido" }, 400);
  }

  const path = body.path ?? "";
  if (!path || !path.startsWith(`${user.id}/`)) {
    return json({ erro: "caminho_invalido" }, 400);
  }

  // --- limite diário: protege contra custo, checado ANTES da chamada paga ---
  const desde = new Date(Date.now() - JANELA_HORAS * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("audio_analysis_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("criado_em", desde);

  if ((count ?? 0) >= LIMITE_DIARIO) {
    return json({ erro: "limite_diario", limite: LIMITE_DIARIO }, 429);
  }

  if (!GOOGLE_API_KEY) {
    return json({ erro: "chave_ia_nao_configurada" }, 500);
  }

  const { data: arquivo, error: erroDownload } = await admin.storage
    .from("task-audio")
    .download(path);

  if (erroDownload || !arquivo) {
    return json({ erro: "arquivo_nao_encontrado" }, 404);
  }

  if (arquivo.size > TAMANHO_MAX_BYTES) {
    return json({ erro: "arquivo_grande_demais" }, 413);
  }

  const mediaType = arquivo.type && arquivo.type.startsWith("audio/") ? arquivo.type : "audio/webm";
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  let binario = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  const base64 = btoa(binario);

  const { data: disciplinasRows } = await admin
    .from("subjects")
    .select("name")
    .eq("user_id", user.id);

  const nomesDisciplinas = (disciplinasRows ?? []).map((d) => d.name as string);
  const disciplinasConhecidas = new Set(nomesDisciplinas.map((n) => n.toLowerCase()));

  const prompt = `Você ouve um áudio em que um estudante descreve verbalmente as tarefas escolares que precisa fazer.
Data de hoje: ${hojeBrasilia()} (use para resolver datas relativas como "amanhã" ou "sexta-feira").
Disciplinas já cadastradas pelo usuário (prefira estes nomes exatos quando o áudio corresponder a uma delas): ${nomesDisciplinas.length ? nomesDisciplinas.join(", ") : "nenhuma cadastrada ainda"}.

Extraia cada tarefa/atividade escolar mencionada no áudio. Responda APENAS com um array JSON, sem nenhum texto antes ou depois, no formato:
[{"title": string, "subject_name": string ou null, "due_date": "AAAA-MM-DD" ou null, "priority": "Alta"|"Média"|"Baixa" ou null, "confidence": number entre 0 e 1}]

Regras:
- "due_date" só deve vir preenchido se houver confiança razoável na data — nunca invente uma data.
- "subject_name" só deve vir preenchido se estiver relativamente claro qual é a matéria.
- "confidence" reflete sua certeza geral sobre aquela tarefa (áudio ruim, fala cortada ou ambígua = confiança baixa).
- Se o áudio não mencionar nenhuma tarefa identificável, responda "[]".
- Não invente tarefas que não foram ditas no áudio.`;

  let respostaIA: Response;
  try {
    respostaIA = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": GOOGLE_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inline_data: { mime_type: mediaType, data: base64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });
  } catch (e) {
    await admin.from("audio_analysis_usage").insert({ user_id: user.id, sucesso: false });
    return json({ erro: "falha_de_rede", detalhe: String(e) }, 502);
  }

  if (!respostaIA.ok) {
    await admin.from("audio_analysis_usage").insert({ user_id: user.id, sucesso: false });
    const detalhe = await respostaIA.text();
    console.error(`Gemini respondeu ${respostaIA.status}: ${detalhe.slice(0, 500)}`);
    return json({ erro: "falha_na_analise", detalhe: detalhe.slice(0, 300) }, 502);
  }

  const corpo = await respostaIA.json();
  const texto: string = corpo?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let brutas: unknown[];
  try {
    brutas = extrairArrayJSON(texto);
  } catch {
    await admin.from("audio_analysis_usage").insert({ user_id: user.id, sucesso: false });
    console.error(`Resposta do Gemini sem JSON reconhecível. corpo=${JSON.stringify(corpo).slice(0, 800)}`);
    return json({ erro: "resposta_ia_invalida" }, 502);
  }

  const candidatas = brutas
    .map((b) => normalizarCandidata(b as CandidataIA, disciplinasConhecidas))
    .filter((c): c is CandidataFinal => c !== null);

  await admin.from("audio_analysis_usage").insert({ user_id: user.id, sucesso: true });

  return json({
    tarefas: candidatas,
    restantesHoje: Math.max(0, LIMITE_DIARIO - (count ?? 0) - 1),
  });
});
