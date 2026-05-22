// Supabase Edge Function — send-notifications
// Roda diariamente via Supabase Cron e envia Web Push para tarefas próximas do prazo
// Deno runtime

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:daviphone22@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Gera JWT de autenticação VAPID
async function generateVapidAuth(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const now = Math.floor(Date.now() / 1000);

  const header = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payload = btoa(JSON.stringify({ aud: audience, exp: now + 43200, sub: VAPID_SUBJECT }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signingInput = `${header}.${payload}`;
  const keyData = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, cryptoKey, new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `vapid t=${signingInput}.${sig},k=${VAPID_PUBLIC_KEY}`;
}

// Envia push para uma subscription
async function sendPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: object): Promise<boolean> {
  try {
    const vapidAuth = await generateVapidAuth(subscription.endpoint);
    const body = JSON.stringify(payload);

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": vapidAuth,
        "TTL": "86400",
      },
      body,
    });

    return res.ok || res.status === 201;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Aceita GET (cron) ou POST (manual)
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Busca todas as subscriptions com notification_settings e tasks
  const { data: users } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth");

  if (!users || users.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "no subscribers" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let totalSent = 0;

  for (const sub of users) {
    // Pega settings do usuário
    const { data: settings } = await supabase
      .from("notification_settings")
      .select("notify_1_day, notify_2_days, notify_3_days")
      .eq("user_id", sub.user_id)
      .single();

    if (!settings) continue;

    // Busca tarefas pendentes
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, subject_name, due_date, status")
      .eq("user_id", sub.user_id)
      .neq("status", "Concluída")
      .not("due_date", "is", null);

    if (!tasks || tasks.length === 0) continue;

    for (const task of tasks) {
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const shouldSend =
        (diff === 3 && settings.notify_3_days) ||
        (diff === 2 && settings.notify_2_days) ||
        (diff === 1 && settings.notify_1_day) ||
        (diff === 0 && settings.notify_1_day);

      if (!shouldSend) continue;

      const label = diff === 0 ? "HOJE" : diff === 1 ? "amanhã" : `em ${diff} dias`;

      const sent = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        {
          title: `📚 ${task.title}`,
          body: `Prazo ${label} — ${task.subject_name}`,
          tag: `task-${task.id}-${diff}`,
        }
      );

      if (sent) totalSent++;
    }
  }

  return new Response(JSON.stringify({ sent: totalSent }), {
    headers: { "Content-Type": "application/json" },
  });
});
