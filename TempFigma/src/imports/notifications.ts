// Notification helpers. Best-effort: uses the (experimental) Notification
// Triggers API for OS-scheduled reminders that fire even when the app is
// closed where supported (recent Chromium), and always falls back to an
// in-app timer that fires while the app is open.

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%2327C882'/%3E%3Ctext x='50' y='66' font-size='52' text-anchor='middle'%3E🥗%3C/text%3E%3C/svg%3E";

export function notificheSupportate(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function permessoNotifiche(): NotificationPermission {
  return "Notification" in window ? Notification.permission : "denied";
}

export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    /* ignore registration errors */
  }
}

export async function richiediPermesso(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  try {
    if (Notification.permission === "default") return await Notification.requestPermission();
  } catch {
    /* ignore */
  }
  return Notification.permission;
}

function triggerSupportato(): boolean {
  return typeof (window as unknown as { TimestampTrigger?: unknown }).TimestampTrigger !== "undefined";
}

/** True where a reminder can fire with the app CLOSED. */
export function schedulazioneRealeDisponibile(): boolean {
  return triggerSupportato();
}

let timers: ReturnType<typeof setTimeout>[] = [];
function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
}

async function reg(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

async function mostra(title: string, body: string, tag: string) {
  if (permessoNotifiche() !== "granted") return;
  const r = await reg();
  if (r) {
    try {
      await r.showNotification(title, { body, tag, icon: ICON });
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    new Notification(title, { body, icon: ICON });
  } catch {
    /* ignore */
  }
}

/**
 * (Re)schedule the dietitian-visit reminder. Cancels any previous one.
 * Returns how it was scheduled so the UI can be honest with the user.
 */
export async function pianificaVisita(
  iso: string | null,
  nome: string,
  note?: string,
): Promise<"os" | "in-app" | "none"> {
  clearTimers();
  const r = await reg();
  if (r) {
    try {
      const pending = await r.getNotifications({ tag: "visita-dietologo" } as never);
      pending.forEach((n) => n.close());
    } catch {
      /* ignore */
    }
  }
  if (permessoNotifiche() !== "granted" || !iso) return "none";

  const when = new Date(iso).getTime();
  const now = Date.now();
  if (Number.isNaN(when) || when <= now) return "none";

  const body = `Appuntamento con ${nome}${note ? " · " + note : ""}`;
  let mode: "os" | "in-app" | "none" = "none";

  if (r && triggerSupportato()) {
    try {
      await r.showNotification("Visita dal dietologo 🩺", {
        body,
        tag: "visita-dietologo",
        icon: ICON,
        requireInteraction: true,
        // @ts-expect-error experimental API
        showTrigger: new (window as unknown as { TimestampTrigger: new (t: number) => unknown }).TimestampTrigger(when),
      });
      mode = "os";
    } catch {
      /* fall back below */
    }
  }

  // In-app fallback: fire while the app is open, for anything within ~24h.
  const delta = when - now;
  if (delta > 0 && delta < 24 * 60 * 60 * 1000) {
    timers.push(setTimeout(() => void mostra("Visita dal dietologo 🩺", body, "visita-dietologo"), delta));
    if (mode === "none") mode = "in-app";
  }
  return mode;
}

/** Fire a test notification immediately (used to confirm the setup works). */
export async function notificaProva(): Promise<void> {
  await mostra("Mangiaria", "Le notifiche sono attive! 🔔", "prova");
}
