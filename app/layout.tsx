import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Inter Tight as reliable fallback + backup display font
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Limero — Hard Money Prediction Markets",
  description: "Dual-collateral prediction markets on LitVM. Trade real-world outcomes in $LIME or USDC, settled onchain.",
  openGraph: {
    title: "Limero — Hard Money Prediction Markets",
    description: "Trade the future in hard money. Binary prediction markets on LitVM.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${mono.variable}`}>
      <head>
        {/* Satoshi Variable via Fontshare - same font used by Arbitrum, LayerZero, Monad, Blast */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900,1,2&display=swap"
        />
      </head>
      <body className="min-h-screen bg-space font-sans text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
