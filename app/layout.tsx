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
  title: "Limero · zkLTC Productivity Engine on LitVM",
  description: "Litecoin-native prediction and yield markets on LitVM. zkLTC is primary collateral, vaults drive yield, LIME is incentive layer.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Limero · zkLTC Productivity Engine on LitVM",
    description: "zkLTC-first event markets with vault-backed liquidity and LIME incentives on LitVM.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Limero" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Limero · zkLTC Productivity Engine on LitVM",
    description: "zkLTC-first event markets with vault-backed liquidity and LIME incentives on LitVM.",
    images: ["/og-image.png"],
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
