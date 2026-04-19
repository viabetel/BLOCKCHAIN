"use client";

import { useState } from "react";

/**
 * AstronomicalJuice — Premium interactive product section.
 *
 * Uses /engine-image.jpg as the visual core (lime slice inside crystalline sphere
 * with 4 orbiting tokens + dock bar at bottom).
 *
 * Layout:
 * - Full-bleed 16:9 image as section backdrop
 * - Headline + eyebrow at top-left
 * - 4 invisible hotspots over the tokens → show callout cards on hover
 * - Bottom dock bar becomes tab system with 4 pillars
 * - Side panel updates based on active tab
 */

type Pillar = "predict" | "price" | "liquidity" | "resolve";

const PILLARS: Record<
  Pillar,
  {
    label: string;
    eyebrow: string;
    headline: string;
    body: string;
    bullets: string[];
    stat: { label: string; value: string };
  }
> = {
  predict: {
    label: "Predict",
    eyebrow: "Market formation",
    headline: "Every event becomes a priced outcome",
    body: "Each market is a structured binary event. Probability is priced continuously, reflecting real conviction — not narrative or hype.",
    bullets: [
      "Binary YES/NO outcome shares",
      "Permissionless market creation (v2)",
    ],
    stat: { label: "Markets", value: "Open" },
  },
  price: {
    label: "Price",
    eyebrow: "Probability layer",
    headline: "Prices move as capital moves",
    body: "A fixed product market maker anchors pricing. Every trade adjusts the curve, giving instant probability readouts in $LIME and USDC-equivalent.",
    bullets: [
      "FPMM-based price discovery",
      "Dual-asset display: LIME + USDC",
    ],
    stat: { label: "Fee", value: "2.00%" },
  },
  liquidity: {
    label: "Liquidity",
    eyebrow: "Capital routing",
    headline: "Liquidity anchors every outcome",
    body: "LPs deposit against the market pool and collect fees from every trade. Exit anytime before resolution. LIME/USDC pair coming with v2 AMM.",
    bullets: [
      "Per-market liquidity provision (live)",
      "LIME/USDC AMM pool (Q3 2026)",
    ],
    stat: { label: "Status", value: "Active" },
  },
  resolve: {
    label: "Resolve",
    eyebrow: "Settlement",
    headline: "Onchain truth, transparent payout",
    body: "At expiry the oracle posts the outcome onchain. Winners redeem 1:1, losers go to zero. No hidden matching, no custody risk, no disputes.",
    bullets: [
      "Manual oracle (testnet)",
      "UMA Optimistic Oracle (mainnet)",
    ],
    stat: { label: "Settlement", value: "1:1" },
  },
};

// Hotspot positions as % of container (matches token positions in engine-image.jpg)
const HOTSPOTS: {
  id: Pillar;
  x: number;
  y: number;
  label: string;
  color: string;
}[] = [
  { id: "liquidity", x: 26, y: 45, label: "Liquidity Core", color: "#c68b5a" },
  { id: "predict", x: 22, y: 72, label: "Collateral Logic", color: "#b9764a" },
  { id: "price", x: 75, y: 38, label: "Price Oracle", color: "#d4d4d4" },
  { id: "resolve", x: 80, y: 65, label: "Settlement Layer", color: "#e0b464" },
];

export function AstronomicalJuice() {
  const [activeTab, setActiveTab] = useState<Pillar>("predict");
  const [hoveredHotspot, setHoveredHotspot] = useState<Pillar | null>(null);

  const active = PILLARS[activeTab];

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-space-deep py-20 lg:py-28">
      {/* Ambient glow matching image palette */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[10%] h-96 w-96 rounded-full bg-purple-500/[0.04] blur-3xl" />
        <div className="absolute right-[15%] top-[30%] h-96 w-96 rounded-full bg-lime-500/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mb-10 flex flex-col items-start gap-4 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/[0.04] px-3 py-1.5 backdrop-blur">
              <span className="h-1 w-1 rounded-full bg-purple-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Inside the engine
              </span>
            </div>
            <h2
              className="headline-display text-white [text-wrap:balance]"
              style={{
                fontSize: "clamp(36px, 4.6vw, 68px)",
                letterSpacing: "-0.045em",
                lineHeight: "0.98",
              }}
            >
              Astronomical{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #fde047 0%, #facc15 45%, #bef264 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Juice
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              A modular market core where prediction, liquidity, collateral
              and settlement orbit a single protocol. Hover the orbiting
              assets to inspect each layer.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-end">
            <span className="terminal-pill">4 PILLARS</span>
            <span className="terminal-pill" style={{ background: "rgba(168, 85, 247, 0.08)", borderColor: "rgba(168, 85, 247, 0.2)", color: "#d8b4fe" }}>
              V2 ROADMAP
            </span>
          </div>
        </div>

        {/* MAIN STAGE - grid on desktop */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* IMAGE STAGE with hotspots */}
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/5">
            <div className="relative aspect-[16/9] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/engine-image.jpg"
                alt="Limero engine — lime core with orbiting tokens"
                className="h-full w-full object-cover"
                draggable={false}
                loading="lazy"
              />

              {/* Subtle overlay for hotspot legibility */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(6,9,16,0.25) 90%)",
                }}
              />

              {/* HOTSPOTS */}
              {HOTSPOTS.map((h) => {
                const isActive = activeTab === h.id;
                const isHovered = hoveredHotspot === h.id;
                const highlight = isActive || isHovered;
                return (
                  <button
                    key={h.id}
                    onMouseEnter={() => setHoveredHotspot(h.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={() => setActiveTab(h.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    aria-label={h.label}
                  >
                    {/* Pulsing ring */}
                    <span
                      className="absolute inset-0 -m-6 animate-ping rounded-full opacity-60"
                      style={{
                        background: `radial-gradient(circle, ${h.color}55 0%, transparent 70%)`,
                        animationDuration: "2.4s",
                      }}
                    />
                    {/* Core dot */}
                    <span
                      className="relative block h-4 w-4 rounded-full ring-2 ring-white/60 transition-all"
                      style={{
                        background: h.color,
                        boxShadow: highlight
                          ? `0 0 24px ${h.color}, 0 0 48px ${h.color}60`
                          : `0 0 12px ${h.color}80`,
                        transform: highlight ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                    {/* Callout card on hover */}
                    {isHovered && (
                      <span
                        className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md animate-fade-in"
                        style={{ boxShadow: `0 0 30px ${h.color}30` }}
                      >
                        <span className="block text-[9px] font-mono uppercase tracking-widest text-white/50">
                          {PILLARS[h.id].eyebrow}
                        </span>
                        {h.label}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* TAB DOCK — overlays the dark dock bar at bottom of image */}
              <div className="absolute inset-x-4 bottom-4 lg:inset-x-8 lg:bottom-6">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-xl">
                  {(Object.keys(PILLARS) as Pillar[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`relative flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                        activeTab === id
                          ? "bg-gradient-to-b from-white/15 to-white/5 text-white shadow-lg"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {activeTab === id && (
                        <span className="absolute left-1/2 top-0 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-lime-400 to-yellow-300" />
                      )}
                      {PILLARS[id].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL - dynamic content */}
          <div className="flex flex-col gap-4">
            <div
              key={activeTab}
              className="card-glass animate-fade-up rounded-2xl p-6"
            >
              {/* Eyebrow */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300">
                  {active.eyebrow}
                </span>
                <span className="terminal-pill">{active.stat.value}</span>
              </div>

              {/* Headline */}
              <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                {active.headline}
              </h3>

              {/* Body */}
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {active.body}
              </p>

              {/* Bullets */}
              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
                {active.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime-400" />
                    <span className="text-sm text-white/80">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming soon block */}
            <div className="card-glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-purple-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-purple-400" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  On the roadmap
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <RoadmapItem label="LIME / USDC Swap" eta="Q2 2026" />
                <RoadmapItem label="AMM Liquidity Pools" eta="Q3 2026" />
                <RoadmapItem label="Permissionless markets" eta="Q3 2026" />
                <RoadmapItem label="UMA Optimistic Oracle" eta="Mainnet" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapItem({ label, eta }: { label: string; eta: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-white/80">{label}</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {eta}
      </span>
    </div>
  );
}
