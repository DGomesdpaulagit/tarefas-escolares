// Service Worker — Tarefas Escolares
// Responsável por: receber push notifications, exibir alertas e tratar cliques.
// Versão: 2 (Sessão 024)

const SW_VERSION = "v2-2026-05-28";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ----------------------------------------------------------------------
// Recebe push do servidor (Supabase Edge Function) ou direto do app
// ----------------------------------------------------------------------
self.addEventListener("push", (event) => {
  let data = {
    title: "Tarefas Escolares",
    body: "Você tem tarefas próximas do prazo!",
    tag: "default",
    url: "/",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload pode vir como texto puro
    try {
      if (event.data) data.body = event.data.text();
    } catch {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/android-chrome-192x192.png",
      badge: data.badge || "/favicon-32x32.png",
      tag: data.tag,
      renotify: true,
      requireInteraction: data.requireInteraction === true,
      vibrate: data.vibrate || [120, 60, 120],
      data: data,
    }),
  );
});

// ----------------------------------------------------------------------
// Clique na notificação → abre / foca o app
// ----------------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client) {
            try { client.navigate(targetUrl); } catch {}
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// ----------------------------------------------------------------------
// Mensagens vindas do app (notificações locais sem servidor)
// ----------------------------------------------------------------------
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || msg.type !== "SHOW_NOTIFICATION") return;
  const { title, body, tag, url, icon, requireInteraction } = msg.payload || {};
  self.registration.showNotification(title || "Tarefas Escolares", {
    body: body || "",
    tag: tag || `local-${Date.now()}`,
    icon: icon || "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    requireInteraction: !!requireInteraction,
    vibrate: [120, 60, 120],
    data: { url: url || "/" },
  });
});
