// Service Worker — Tarefas Escolares
// Responsável por: receber push notifications, exibir alertas e tratar cliques

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Recebe push do servidor (Supabase Edge Function)
self.addEventListener("push", (event) => {
  let data = { title: "Tarefas Escolares", body: "Você tem tarefas próximas do prazo!", tag: "default" };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      tag: data.tag,
      renotify: true,
      requireInteraction: false,
      data: data,
    })
  );
});

// Clique na notificação → abre o app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
