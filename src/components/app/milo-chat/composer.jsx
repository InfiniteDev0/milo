"use client";

// The box at the bottom, as Notion's: a few lines to type in, + on the left,
// send on the right. Enter sends, Shift+Enter is a new line.

import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function Composer({ onSend }) {
  const [text, setText] = useState("");
  const ready = text.trim().length > 0;

  const send = () => {
    if (!ready) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="relative m-3 flex flex-col gap-2 rounded-2xl border border-border bg-background/40 p-3 focus-within:border-foreground/25">
      {/* Aceternity's glowing border, always on: the band of colour turns round the edge to face the pointer */}
      <GlowingEffect spread={40} glow disabled={false} alwaysOn proximity={64} inactiveZone={0.01} borderWidth={2} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={2}
        placeholder="Ask Milo"
        aria-label="Ask Milo"
        className="min-h-12 w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Add"
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!ready}
          aria-label="Send"
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-colors",
            ready ? "cursor-pointer bg-foreground text-background" : "bg-muted text-muted-foreground",
          )}
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </div>
  );
}
