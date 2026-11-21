"use client";

// The stars behind the hero: dark on the light page, white once it goes dark.

import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { useLandingDark } from "../landing-theme";

export function HeroSky() {
  const dark = useLandingDark();
  return (
    <>
      <StarsBackground starColor={dark ? "255, 255, 255" : "40, 30, 80"} starDensity={0.0003} />
      <ShootingStars />
    </>
  );
}
