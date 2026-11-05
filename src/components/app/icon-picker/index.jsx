"use client";

/* Pick an icon, as the reference does it: Emoji, Icons or Upload along the
   top, and Remove at the end. Opens from whatever it wraps (the trigger) and
   closes on a pick.

   value: what's picked now — an emoji ({ type: "emoji", value }), an icon
   ({ type: "icon", name, color }), a picture ({ type: "image", src }), or null.
   It opens on the tab that matches it. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmojiTab, preloadEmoji } from "./emoji-tab";
import { IconsTab } from "./icons-tab";
import { UploadTab } from "./upload-tab";
import { preloadIcons } from "./shared";

// both packs start loading as the pointer reaches the trigger, so the picker opens full
const preload = () => {
  preloadEmoji();
  preloadIcons();
};

const TABS = [
  { id: "emoji", label: "Emoji" },
  { id: "icon", label: "Icons" },
  { id: "image", label: "Upload" },
];

export { PickedIcon } from "./picked-icon";

export function IconPicker({ value, onChange, children }) {
  const [open, setOpen] = useState(false);
  const kind = typeof value === "string" ? "emoji" : (value?.type ?? "emoji");
  const [tab, setTab] = useState(kind);

  const pick = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setTab(kind);
        setOpen(next);
      }}
    >
      <PopoverTrigger render={children} onPointerEnter={preload} onFocus={preload} />
      <PopoverContent align="start" sideOffset={6} className="w-[22.5rem] gap-0 overflow-hidden p-0">
        <div className="flex h-11 items-center gap-4 border-b border-foreground/10 px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px flex h-full cursor-pointer items-center border-b-2 text-sm transition-colors",
                tab === t.id ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => pick(null)}
            className="ms-auto cursor-pointer rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            Remove
          </button>
        </div>

        {/* each tab fades in as it's switched to */}
        <div key={tab} className="duration-150 animate-in fade-in-0">
          {tab === "emoji" && <EmojiTab onPick={pick} />}
          {tab === "icon" && <IconsTab onPick={pick} />}
          {tab === "image" && <UploadTab onPick={pick} onCancel={() => setOpen(false)} />}
        </div>
      </PopoverContent>
    </Popover>
  );
}
