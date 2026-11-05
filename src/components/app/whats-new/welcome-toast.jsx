"use client";

// Said once, as the last What's new step is done: welcome, and enjoy Milo — with his face cheering.
// The same chrome as the app's other Milo toasts.

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

function Welcome() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace mood="cheer" instant gaze={false} blink={false} reactToScroll={false} className="size-10" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-chrome-ink">Welcome to the new Milo!</span>
        <span className="text-xs text-chrome-ink/55">You&apos;ve seen it all. Enjoy Milo.</span>
      </div>
    </div>
  );
}

export function showWelcome() {
  toast.custom(() => <Welcome />, { unstyled: true, id: "milo-welcome", duration: 5000 });
}
