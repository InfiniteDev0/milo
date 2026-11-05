"use client";

// The tools you pinned from the avatar menu, as icons in the top bar — what
// ClickUp does with its pinned Personal Tools.

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreference } from "@/hooks/use-preference";
import { PINS, TOOLS, runEvent } from "./tools";

const BAR_ICON =
  "flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10";

function PinnedTool({ tool }) {
  const on = usePreference(PINS[tool.id]) === "on";
  if (!on) return null;
  const Icon = tool.icon;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          tool.href ? (
            <Link href={tool.href} aria-label={tool.label} />
          ) : (
            <button type="button" aria-label={tool.label} onClick={() => runEvent(tool)} />
          )
        }
        className={BAR_ICON}
      >
        <Icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tool.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function PinnedTools() {
  return (
    <TooltipProvider delay={200}>
      <div className="flex items-center gap-0.5">
        {TOOLS.filter((t) => t.pin).map((tool) => (
          <PinnedTool key={tool.id} tool={tool} />
        ))}
      </div>
    </TooltipProvider>
  );
}
