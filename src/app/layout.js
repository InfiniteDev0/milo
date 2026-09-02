import { Outfit, Albert_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

const outfit = Outfit({
  variable: "--font-Albert-sans",
  subsets: ["latin"],
});

const albert = Albert_Sans({
  variable: "--font-Albert-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Milo - manage your life in blocks",
  description:
    "Design the shape of your month. Milo runs the day — one block at a time, and nothing ever goes overdue.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${albert.variable} ${outfit.variable} h-full antialiased bg-[]`}
    >
      <body className="min-h-full">
        {" "}
        <Navbar />
        <div className="pt-24">{children}</div>
        <Footer/>
      </body>
    </html>
  );
}
