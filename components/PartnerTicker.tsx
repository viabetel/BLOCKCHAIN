"use client";

import { TokenIcon, PARTNER_TEXT_ONLY } from "@/components/TokenIcon";

export function PartnerTicker() {
  const items: { name: string; logo?: boolean; symbol?: "LTC" | "BTC" | "ETH" | "ARB" }[] = [
    { name: "Litecoin", logo: true, symbol: "LTC" },
    { name: "Arbitrum Orbit", logo: true, symbol: "ARB" },
    { name: "Ethereum", logo: true, symbol: "ETH" },
    { name: "Bitcoin", logo: true, symbol: "BTC" },
    ...PARTNER_TEXT_ONLY.map((n) => ({ name: n })),
  ];
  const loop = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-space-border bg-space-deep py-6">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-space-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-space-deep to-transparent" />

      <div className="mb-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-muted">
          Powered by
        </span>
      </div>
      <div className="flex animate-ticker items-center whitespace-nowrap">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-8">
            {item.logo && item.symbol ? (
              <TokenIcon symbol={item.symbol} size={22} />
            ) : (
              <div className="h-5 w-5 rounded-full border border-space-border bg-space-surface" />
            )}
            <span className="font-display text-sm font-semibold tracking-tight text-text-secondary">
              {item.name}
            </span>
            <span className="text-space-border">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
