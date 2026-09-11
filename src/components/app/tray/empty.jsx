"use client";

// No notes today. Not a failing — most days won't have one.

import { Plus } from "lucide-react";
import { shade } from "@/lib/shade";

export function Empty({ onAdd }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <img src="/taking-note.svg" alt="" className="size-44" />

      <p className="max-w-xs text-sm text-black/45">
        Anything you think of today. Keep it, or let it go at midnight.
      </p>

      <button
        type="button"
        onClick={onAdd}
        style={{ "--lift": shade("#141414", 0.6) }}
        className="milo-lift flex cursor-pointer items-center gap-2 rounded-xl bg-[#141414] px-5 py-2.5 text-sm font-medium text-white"
      >
        <Plus className="size-4" />
        New note
      </button>
    </div>
  );
}
