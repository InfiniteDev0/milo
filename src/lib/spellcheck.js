// Whether the browser underlines spelling while you write. A preference on this device, like sound — never note data.

const KEY = "milo:spellcheck";
const CHANGED = "milo:spellcheck";

export function spellcheckOn() {
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSpellcheckOn(on) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new Event(CHANGED));
}

// for useSyncExternalStore: a change on this page, or in another tab
export function subscribeSpellcheck(onChange) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
