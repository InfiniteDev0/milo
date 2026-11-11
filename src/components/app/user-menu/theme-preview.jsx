// A little picture of the app in a theme (from Manasik): a rail of squares, a panel of lines.
// system: light on the left, dark on the right.

import { cn } from "@/lib/utils";

function Picture({ dark, className }) {
  const page = dark ? "bg-neutral-900" : "bg-neutral-100";
  const panel = dark ? "bg-black" : "bg-white";
  const ink = dark ? "bg-neutral-100" : "bg-neutral-900";
  const muted = dark ? "bg-neutral-600" : "bg-neutral-300";
  return (
    <span className={cn("flex h-20 w-full gap-1.5 overflow-hidden p-2", page, className)}>
      <span className="flex flex-col gap-1.5 pt-1">
        <span className={cn("size-3 rounded", ink)} />
        <span className={cn("size-3 rounded", muted)} />
        <span className={cn("size-3 rounded", muted)} />
      </span>
      <span className={cn("flex flex-1 flex-col gap-1.5 rounded-md p-2", panel)}>
        <span className={cn("h-1.5 w-10 rounded-full", muted)} />
        <span className="flex gap-1.5">
          <span className={cn("h-1.5 w-8 rounded-full", muted)} />
          <span className={cn("h-1.5 w-6 rounded-full", ink)} />
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", ink)} />
          <span className={cn("h-1.5 w-5 rounded-full", muted)} />
          <span className={cn("h-1.5 w-5 rounded-full", muted)} />
        </span>
      </span>
    </span>
  );
}

export function ThemePreview({ theme }) {
  if (theme !== "system") return <Picture dark={theme === "dark"} />;
  return (
    <span className="relative block">
      <Picture />
      <Picture dark className="absolute inset-0 [clip-path:inset(0_0_0_50%)]" />
    </span>
  );
}
