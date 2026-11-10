"use client";

/* Whatever icon was picked, drawn at a size: an emoji, one of lucide's icons in
   its colour, or an uploaded picture. A plain string is an emoji (the samples).
   With nothing picked, a quiet folder. */

import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLucideIcons } from "./shared";

function LucideIcon({ name, color, size }) {
  const icons = useLucideIcons();
  const Icon = icons?.[name];
  // a blank of the same size while the set loads, so nothing shifts
  if (!Icon) return <span style={{ width: size, height: size }} />;
  return <Icon style={{ width: size, height: size, color }} strokeWidth={2.25} />;
}

export function PickedIcon({ icon, size = 16, className }) {
  const value = typeof icon === "string" ? { type: "emoji", value: icon } : icon;
  return (
    <span className={cn("flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      {!value ? (
        <Folder className="text-muted-foreground" style={{ width: size, height: size }} />
      ) : value.type === "emoji" ? (
        <span className="leading-none" style={{ fontSize: size * 0.9 }}>
          {value.value}
        </span>
      ) : value.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.src} alt="" className="size-full rounded-sm object-cover" />
      ) : (
        <LucideIcon name={value.name} color={value.color} size={size} />
      )}
    </span>
  );
}
