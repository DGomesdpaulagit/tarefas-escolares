import { supabase } from "@/supabase/client";
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

  // Exibe notificações locais ao abrir o app (funciona sem servidor)
  async checkAndNotify(tasks: Tarefa[], settings: NotificationSettings): Promise<void> {
    if (!this.isSupported() || Notification.permission !== "granted") return;
    if (!settings.notify_1_day && !settings.notify_2_days && !settings.notify_3_days) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Evita notificar mais de uma vez por dia (localStorage como flag)
    const lastCheck = localStorage.getItem("notify_last_check");
    const todayStr = today.toISOString().split("T")[0];
    if (lastCheck === todayStr) return;

    const notified: string[] = [];

    for (const task of tasks) {
      if (task.status === "Concluída" || !task.due_date) continue;

      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const shouldNotify =
        (diff === 3 && settings.notify_3_days) ||
        (diff === 2 && settings.notify_2_days) ||
        (diff === 1 && settings.notify_1_day) ||
        (diff === 0 && settings.notify_1_day);

      if (!shouldNotify) continue;

      const label = diff === 0 ? "HOJE" : diff === 1 ? "amanhã" : `em ${diff} dias`;

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
};
