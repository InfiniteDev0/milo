// The top of the landing page, laid out as ClickUp's: words and the way in on the left, the app spilling off the right.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductShot } from "./product-shot";

export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-12 px-5 pt-10 pb-16 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-14 lg:py-12">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-sm tracking-[0.15em] text-[#5e17eb] uppercase sm:text-base">Milo tasks &amp; notes</span>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-6xl xl:text-[5.5rem]">
            Never feel behind again
          </h1>
          <p className="max-w-[34rem] text-lg leading-snug text-black/60 sm:text-[1.4rem]">
            Plan each day, keep the notes behind it close by, and see what you got done. Nothing in Milo is ever overdue, so nothing ever turns red.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link href="/auth" className="flex h-16 items-center gap-2 rounded-2xl bg-black px-7 text-xl font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-85">
              Get started. It&rsquo;s FREE
              <ArrowRight className="size-5" />
            </Link>
            <span className="text-[15px] leading-snug text-black/60">
              No credit card.
              <br />
              Free forever.
            </span>
          </div>
        </div>

        {/* the app, running off the right edge on wide screens */}
        <div className="min-w-0 lg:-mr-[40%]">
          <ProductShot />
        </div>
      </div>
    </section>
  );
}
