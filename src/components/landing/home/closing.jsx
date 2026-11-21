// The last word: the way in, once more.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MiloFace from "@/components/MiloFace";

export function Closing() {
  return (
    <section className="px-3 py-10">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 rounded-[32px] bg-gradient-to-b from-[#5e17eb] to-[#2a0a6b] px-6 py-16 text-center text-white sm:py-20">
        <MiloFace className="size-16" />
        <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Start with today.</h2>
        <p className="max-w-md text-white/65">Add one task and one note. That&rsquo;s a good day in Milo.</p>
        <Link href="/auth" className="flex h-13 items-center gap-3 rounded-full bg-white pr-1.5 pl-6 text-black transition-transform hover:-translate-y-0.5">
          Get started. It&rsquo;s free
          <span className="flex size-10 items-center justify-center rounded-full bg-[#5e17eb]">
            <ArrowRight className="size-4 text-white" />
          </span>
        </Link>
        <span className="text-xs text-white/50">Free forever. No credit card.</span>
      </div>
    </section>
  );
}
