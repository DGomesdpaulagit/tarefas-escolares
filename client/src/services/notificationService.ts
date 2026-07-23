import { supabase } from "@/supabase/client";
import { diasAteVencimento, isExpirada, parseDueDateLocal } from "@/lib/tarefasData";
import type { Tarefa, NotificationSettings } from "@/types";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export const notificationService = {
  isSupported(): boolean {
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return reg;
    } catch {
      return null;
    }
  },

  async subscribe(userId: string): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== "granted") return false;
    if (!VAPID_PUBLIC_KEY) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      const keys = json.keys as { p256dh: string; auth: string };

      await supabase.from("push_subscriptions").upsert(
        { user_id: userId, endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: "user_id,endpoint" }
      );
      return true;
    } catch {
      return false;
    }
  },

  async unsubscribe(userId: string): Promise<void> {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await supabase.from("push_subscriptions").delete()
          .eq("user_id", userId).eq("endpoint", sub.endpoint);
      }
    } catch {}
  },

  // Envia uma notificação de teste para confirmar que o sistema funciona
  async sendTest(): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== "granted") return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title: "🔔 Notificações ativas!",
          body: "Tudo certo — você vai receber alertas dos seus prazos.",
          tag: "test-notification",
          url: "/",
        },
      });
      return true;
    } catch {
      try {
        new Notification("🔔 Notificações ativas!", {
          body: "Tudo certo — você vai receber alertas dos seus prazos.",
          icon: "/android-chrome-192x192.png",
          tag: "test-notification",
        });
        return true;
      } catch {
        return false;
      }
    }
  },

  // Notificação local imediata ao criar uma tarefa nova
  async notifyTaskCreated(task: Tarefa, enabled: boolean): Promise<void> {
    if (!enabled) return;
    if (!this.isSupported() || Notification.permission !== "granted") return;
    const data = task.due_date ? new Date(parseDueDateLocal(task.due_date)) : null;
    const dataLabel = data
      ? `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`
      : "sem prazo";
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title: `➕ ${task.title}`,
          body: `Adicionada em ${task.subject_name} · ${dataLabel}`,
          tag: `created-${task.id}`,
          url: "/",
        },
      });
    } catch { /* ignore */ }
  },

  // Exibe notificações locais ao abrir o app (funciona sem servidor)
  async checkAndNotify(tasks: Tarefa[], settings: NotificationSettings): Promise<void> {
    if (!this.isSupported() || Notification.permission !== "granted") return;
    if (!settings.notify_1_day && !settings.notify_2_days && !settings.notify_3_days) return;

    // Evita notificar mais de uma vez por dia (localStorage como flag)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCheck = localStorage.getItem("notify_last_check");
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (lastCheck === todayStr) return;

    const notified: string[] = [];

    // 1. Notifica tarefas que JÁ expiraram (1x por dia, agrupado)
    const expiradas = tasks.filter((t) => t.status !== "Concluída" && isExpirada(t));
    if (expiradas.length > 0) {
      const titulo = expiradas.length === 1
        ? `⚠️ Prazo encerrado: ${expiradas[0].title}`
        : `⚠️ ${expiradas.length} tarefas com prazo encerrado`;
      const corpo = expiradas.length === 1
        ? `${expiradas[0].subject_name} — você ainda pode editar`
        : `Veja a Visão Geral para revisar`;
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: { title: titulo, body: corpo, tag: "expired-today", url: "/" },
        });
      } catch {
        try {
          new Notification(titulo, { body: corpo, icon: "/android-chrome-192x192.png", tag: "expired-today" });
        } catch {}
      }
      notified.push("expired");
    }

    // 2. Notifica tarefas pendentes próximas do prazo
    for (const task of tasks) {
      if (task.status === "Concluída" || !task.due_date) continue;
      if (isExpirada(task)) continue; // já notificadas acima

      const diff = diasAteVencimento(task.due_date);
      if (diff === null) continue;

      const shouldNotify =
        (diff === 3 && settings.notify_3_days) ||
        (diff === 2 && settings.notify_2_days) ||
        (diff === 1 && settings.notify_1_day) ||
        (diff === 0 && settings.notify_1_day);

      if (!shouldNotify) continue;

      const label = diff === 0 ? "HOJE (último dia)" : diff === 1 ? "amanhã" : `em ${diff} dias`;

      new Notification(`📚 ${task.title}`, {
        body: `Prazo ${label} — ${task.subject_name}`,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        tag: `task-${task.id}-${diff}`,
      });

      notified.push(task.title);
    }

    if (notified.length > 0) localStorage.setItem("notify_last_check", todayStr);
  },

  // Lembrete de lançamento da Mesada — avisa 1x/dia nos últimos dias do mês se houver matéria sem lançamento
  async checkMesadaReminder(materiasFaltando: number): Promise<void> {
    if (!this.isSupported() || Notification.permission !== "granted") return;
    if (materiasFaltando <= 0) return;

    const hoje = new Date();
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const diasRestantes = ultimoDiaDoMes - hoje.getDate();
    if (diasRestantes > 5) return; // só nos últimos 5 dias do mês

    const todayStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    if (localStorage.getItem("mesada_notify_last_check") === todayStr) return;

    const titulo = "💰 Lançamentos da Mesada pendentes";
    const corpo = `Faltam ${materiasFaltando} matéria${materiasFaltando !== 1 ? "s" : ""} sem conceito lançado este mês`;

    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: { title: titulo, body: corpo, tag: "mesada-reminder", url: "/" },
      });
    } catch {
      try {
        new Notification(titulo, { body: corpo, icon: "/android-chrome-192x192.png", tag: "mesada-reminder" });
      } catch {}
    }

    localStorage.setItem("mesada_notify_last_check", todayStr);
  },
};
