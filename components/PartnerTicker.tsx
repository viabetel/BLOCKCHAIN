"use client";

import { TokenIcon, PARTNER_LOGOS, PARTNER_TEXT_ONLY } from "@/components/TokenIcon";

export function PartnerTicker() {
  // Build items: logo partners + text-only partners
  const items: { name: string; logo?: boolean; symbol?: "LTC" | "BTC" | "ETH" | "ARB" }[] = [
    { name: "Litecoin", logo: true, symbol: "LTC" },
    { name: "Arbitrum Orbit", logo: true, symbol: "ARB" },
    { name: "Ethereum", logo: true, symbol: "ETH" },
    { name: "Bitcoin", logo: true, symbol: "BTC" },
    ...PARTNER_TEXT_ONLY.map((n) => ({ name: n })),
  ];
  const loop = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-t border-ink-200 bg-paper-off py-5">
      <div className="mb-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-500">
          Powered by
        </span>
      </div>
      <div className="flex animate-ticker whitespace-nowrap items-center">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-8">
            {item.logo && item.symbol ? (
              <TokenIcon symbol={item.symbol} size={20} />
            ) : (
              <div className="h-5 w-5 rounded-full bg-ink-pure" />
            )}
            <span className="font-display text-sm font-semibold tracking-tight text-ink-800">
              {item.name}
            </span>
            <span className="text-ink-300">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
