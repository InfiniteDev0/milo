import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="w-full py-8 sm:py-12">
      <div className="flex w-full flex-col items-center gap-6 rounded-[32px] bg-black px-6 py-16 text-center sm:px-10 sm:py-20">
        <h2 className="m-0 text-4xl font-extralight text-white sm:text-5xl">
          Manage your life in blocks.
        </h2>
        <p className="m-0 max-w-xl text-lg text-white/60">
          Plan calmly, live your day, pause when you need to, reflect
          without judgment.
        </p>
        <Link href="/auth">
          <Button className="flex items-center gap-2 bg-[#5e17eb] text-white text-md font-normal rounded-full px-5 py-2 h-12 w-fit transition-opacity duration-300 hover:opacity-85 hover:bg-[#5e17eb]">
            Try Milo, it&apos;s Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
