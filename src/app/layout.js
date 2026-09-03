import { Outfit, Albert_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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

// Fonts, globals, html/body only. Navbar and footer live in (marketing)/layout.js
// so auth and app routes can render without them.
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${albert.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
