import { TextShimmer } from "@/lib/text-shimmer";
import { cn } from "@/lib/utils";

export function ThinkingShimmer({
  children = "Thinking…",
  duration = 1.8,
  className
}) {
  return (
    <TextShimmer
      as="span"
      duration={duration}
      className={cn("font-medium", className)}
    >
      {children}
    </TextShimmer>
  );
}
