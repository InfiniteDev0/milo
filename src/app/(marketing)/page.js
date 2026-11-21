import { Hero } from "@/components/landing/home/hero";
// next, one at a time once the hero is right:
// import { Chips } from "@/components/landing/home/chips";
// import { Tour } from "@/components/landing/home/tour";
// import { Promises } from "@/components/landing/home/promises";
// import { Closing } from "@/components/landing/home/closing";

// The home page, built a section at a time: the navbar (in the layout) and the hero first.
export default function Home() {
  return (
    <>
      <Hero />
      {/* <section className="flex justify-center px-5 pb-6"><Chips /></section>
      <Tour />
      <Promises />
      <Closing /> */}
    </>
  );
}
