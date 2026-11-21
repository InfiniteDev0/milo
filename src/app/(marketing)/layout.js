import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { LandingShell } from "@/components/landing/landing-shell";

// Chrome for the public site only. Routes outside this group — /login, /demo —
// render bare, which is what auth screens and scratch pages want.
// The shell lets the landing page go dark from the hero board's toggle.
export default function MarketingLayout({ children }) {
  return (
    <LandingShell>
      <Navbar />
      {children}
      <Footer />
    </LandingShell>
  );
}
