import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silvercast — Prediction markets on LitVM",
  description: "Hard money prediction markets. Denominated in zkLTC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
