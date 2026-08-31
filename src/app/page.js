import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Philosophy from "@/components/landing/philosophy";
import LifeBlocksSection from "@/components/landing/life-blocks";
import Features from "@/components/landing/features";
import Process from "@/components/landing/process";
import BehindTheScenes from "@/components/landing/behind-the-scenes";
import CTA from "@/components/landing/cta";


export default function Home() {
  return (
    <div className="px-3">
      <Hero />
      <Philosophy />
      <LifeBlocksSection />
      <Process/>
      <Features/>
      <BehindTheScenes />
      <CTA />
    </div>
  );
}
