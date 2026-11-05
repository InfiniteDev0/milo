"use client";

/* Milo's panel, opened from Milo's face — laid out as Notion's AI chat: a
   header, Milo and "How can I help you today?", a few things to start with,
   and a box to type in. Milo can't answer yet: what you send is shown, and
   Milo says so. The starters do real things in the app today. */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { BookOpen, ChevronsRight, MessageSquarePlus, NotebookPen, Search, Sunrise } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MILO_CHAT_KEY } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";
import { ShellFace } from "../shell-face";
import { MiloButton } from "./button";
import { Composer } from "./composer";

const HEADER_ICON =
  "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

// a header button with its name, and its keys when it has some, as Notion's
function HeaderButton({ label, keys, render, children }) {
  return (
    <Tooltip>
      <TooltipTrigger render={render} aria-label={label} className={HEADER_ICON}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="flex items-center gap-2">
        {label}
        {keys && <span className="opacity-60">{keys}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

function Face({ className }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-chip", className)}>
      <ShellFace className="size-full touch-none select-none" />
    </span>
  );
}

export function MiloChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const onNotesPage = usePathname().startsWith("/notes");

  // Ctrl+J (⌘J on a Mac) shows and hides it from anywhere, as Notion's
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === MILO_CHAT_KEY) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close first, so whatever a starter opens takes the focus
  const then = (run) => () => {
    setOpen(false);
    window.setTimeout(run, 120);
  };

  const STARTERS = [
    { icon: Search, label: "Search for anything", run: () => window.dispatchEvent(new Event("milo:search")) },
    { icon: Sunrise, label: "Plan my day", run: () => window.dispatchEvent(new CustomEvent("milo:day-ahead", { detail: "today" })) },
    {
      icon: NotebookPen,
      label: "Write a note",
      // the Notes page has its own sheet, so the tray isn't there to open
      run: () => (onNotesPage ? router.push("/notes") : window.dispatchEvent(new Event("milo:open-notes"))),
    },
    { icon: BookOpen, label: "Write in my journal", run: () => router.push("/journal") },
  ];

  const send = (text) =>
    setMessages((m) => [
      ...m,
      { from: "you", text },
      { from: "milo", text: "I can't answer questions yet. That's coming soon." },
    ]);

  return (
    <>
      <MiloButton open={open} onOpen={() => setOpen(true)} />

      {/* no backdrop, but a click anywhere else puts it away. Its own border and,
          in the dark, its own darker colour, so it reads as apart from the page */}
      <Sheet
        side="right"
        floating
        dismissible
        open={open}
        onOpenChange={setOpen}
        className="border border-border dark:border-white/10 dark:bg-[#161616]"
      >
        <DialogPrimitive.Title className="sr-only">Milo</DialogPrimitive.Title>

        <div className="flex h-12 shrink-0 items-center gap-2 px-3">
          <span className="flex-1 truncate text-[15px] font-medium">New chat</span>
          <TooltipProvider delay={300}>
            <HeaderButton label="New chat" render={<button type="button" onClick={() => setMessages([])} />}>
              <MessageSquarePlus className="size-[18px]" />
            </HeaderButton>
            <HeaderButton label="Hide chat" keys="Ctrl+J" render={<DialogPrimitive.Close />}>
              <ChevronsRight className="size-[18px]" />
            </HeaderButton>
          </TooltipProvider>
        </div>

        <div className="scrollbar-pill flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
          {messages.length === 0 ? (
            // pushed to the bottom, just above the box, as Notion's
            <div className="mt-auto flex flex-col gap-1 pb-2">
              <Face className="mb-3 size-16" />
              <h2 className="mb-2 text-lg font-semibold">What do  want to achieve today?</h2>
              {STARTERS.map(({ icon: Icon, label, run }) => (
                <button
                  key={label}
                  type="button"
                  onClick={then(run)}
                  className="-mx-2.5 flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-left text-[15px] outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                >
                  <Icon className="size-[18px] shrink-0 text-muted-foreground" />
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-3 py-3">
              {messages.map((m, i) =>
                m.from === "you" ? (
                  <p key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-muted px-3.5 py-2 text-[15px]">
                    {m.text}
                  </p>
                ) : (
                  <div key={i} className="flex max-w-[85%] items-start gap-2">
                    <Face className="size-6 rounded-md" />
                    <p className="pt-0.5 text-[15px] text-foreground/80">{m.text}</p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <Composer onSend={send} />
      </Sheet>
    </>
  );
}
