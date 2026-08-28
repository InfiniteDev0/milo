import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Process from "@/components/landing/process";


export default function Home() {
  return (
    <div className="px-3">
      <Hero />
      <Process/>
      <Features/>
    </div>
  );
}
