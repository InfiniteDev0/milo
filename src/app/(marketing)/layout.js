import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

// Chrome for the public site only. Routes outside this group — /login, /demo —
// render bare, which is what auth screens and scratch pages want.
export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pt-24">{children}</div>
      <Footer />
    </>
  );
}
