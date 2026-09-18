// A small setting kept on this device, like sound: how the app behaves here, never your data.
// Each one is a key, the values it may take, and what it is before you choose.

export function createPreference(key, allowed, fallback) {
  const changed = `pref:${key}`;

  const get = () => {
    try {
      const saved = window.localStorage.getItem(key);
      return allowed.includes(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  };

  const set = (value) => {
    if (!allowed.includes(value)) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
    window.dispatchEvent(new Event(changed));
  };

  // for useSyncExternalStore: a change on this page, or in another tab
  const subscribe = (onChange) => {
    window.addEventListener(changed, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(changed, onChange);
      window.removeEventListener("storage", onChange);
    };
  };

  return { get, set, subscribe, fallback };
}
