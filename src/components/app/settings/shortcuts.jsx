"use client";

// Every shortcut Milo answers to, read from the one list in lib/shortcuts.js.

import { useSyncExternalStore } from "react";
import { SHORTCUTS } from "@/lib/shortcuts";

// Ctrl or ⌘ depends on the machine; the server can't know, so it says Ctrl until the browser does
const noSubscribe = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const label = (key, mac) => {
  if (key === "Mod") return mac ? "⌘" : "Ctrl";
  if (mac && key === "Shift") return "⇧";
  if (mac && key === "Alt") return "⌥";
  return key;
};

function Keys({ keys, mac }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="flex h-7 min-w-7 items-center justify-center rounded-md border border-foreground/15 bg-card px-2 font-sans text-xs text-foreground/75 shadow-[0_1px_0_rgb(0_0_0_/_0.08)]"
        >
          {label(k, mac)}
        </kbd>
      ))}
    </span>
  );
}

export function Shortcuts() {
  const mac = useSyncExternalStore(noSubscribe, isMac, () => false);

  return (
    <section className="flex flex-col gap-10">
      {SHORTCUTS.map((group) => (
        <div key={group.group} className="flex flex-col">
          <h2 className="text-md">{group.group}</h2>
          {group.hint && <p className="pt-0.5 text-sm text-foreground/50">{group.hint}</p>}

          <ul className="m-0 mt-3 flex list-none flex-col p-0">
            {group.items.map((s) => (
              <li
                key={`${s.label}-${s.keys.join("+")}`}
                className="flex items-center justify-between gap-6 border-t border-foreground/8 py-3 first:border-t-0"
              >
                <span className="text-sm">{s.label}</span>
                <Keys keys={s.keys} mac={mac} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
