// What happens when a task has run for the time you set on it. "off" is a complete answer (POSITIONING 9).

import { createPreference } from "./preference";

export const TASK_TIMER = createPreference("milo:task-timer", ["off", "toast", "desktop"], "toast");

// a desktop notification, only when this browser has already been allowed to show one
export function notifyDesktop(title, body, tag) {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification(title, { body, tag, icon: "/favicon.ico" });
  } catch {}
}

// asked once, when you choose desktop notifications; true if the browser allows them
export async function allowDesktop() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}
