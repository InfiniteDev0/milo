// This device's push subscription: made when you choose notifications, saved so Supabase can reach it, dropped when you stop.

import { createClient } from "@/lib/supabase/client";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const pushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window &&
  Boolean(KEY);

// the VAPID key arrives base64url; the browser wants bytes
function keyBytes(key) {
  const b64 = (key + "=".repeat((4 - (key.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const registration = () => navigator.serviceWorker.register("/sw.js");

// subscribe (or reuse the subscription this browser already has) and save it; true once Supabase holds it
export async function startPush() {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  try {
    const reg = await registration();
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY) }));
    const { endpoint, keys } = sub.toJSON();

    const db = createClient();
    const { data } = await db.auth.getUser();
    if (!data.user) return false;
    const { error } = await db
      .from("push_subscriptions")
      .upsert({ user_id: data.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });
    return !error;
  } catch {
    return false;
  }
}

// forget this device: the row first, while there's still a session to delete it with
export async function stopPush() {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await createClient().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  } catch {}
}
