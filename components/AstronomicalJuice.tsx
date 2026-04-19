"use client";

import { useState } from "react";

/**
 * AstronomicalJuice v2 — Full-bleed composition.
 *
 * Fixes from v1:
 * - Image is now full-bleed background of the section (like the Hero)
 * - Content overlays the image, not beside it
 * - Single tab system aligned with the natural dock bar position in the image
 * - Text panel floats on the left (dark area of image), doesn't replace image
 * - Hotspots remain interactive on the orbiting tokens
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
    status: string;
  }
> = {
  predict: {
    label: "Predict",
    eyebrow: "Market formation",
    headline: "Every event becomes a priced outcome",
    body: "Each market is a structured binary event. Probability is priced continuously, reflecting real conviction — not narrative or hype.",
    bullets: [
      "Binary YES/NO outcome shares",
      "Permissionless creation coming in v2",
    ],
    status: "LIVE",
  },
  price: {
    label: "Price",
    eyebrow: "Probability layer",
    headline: "Prices move as capital moves",
    body: "A Fixed Product Market Maker anchors pricing. Every trade adjusts the curve, giving instant probability readouts in $LIME with USDC-equivalent display.",
    bullets: [
      "FPMM price discovery",
      "Dual-asset display: LIME + USDC",
    ],
    status: "LIVE",
  },
  liquidity: {
    label: "Liquidity",
    eyebrow: "Capital routing",
    headline: "Liquidity anchors every outcome",
    body: "LPs deposit into the market pool and collect fees from every trade. Exit anytime before resolution. Native LIME/USDC AMM on the roadmap.",
    bullets: [
      "Per-market liquidity provision",
      "LIME/USDC AMM pool — Q3 2026",
    ],
    status: "SOON",
  },
  resolve: {
    label: "Resolve",
    eyebrow: "Settlement",
    headline: "Onchain truth, transparent payout",
    body: "At expiry the oracle posts the outcome onchain. Winners redeem 1:1. No hidden matching, no custody risk, no disputes.",
    bullets: [
      "Manual oracle on testnet",
      "UMA Optimistic Oracle on mainnet",
    ],
    status: "LIVE",
  },
};

// Hotspot positions tuned to the 16:9 engine-image
const HOTSPOTS: {
  id: Pillar;
  x: number;
  y: number;
  label: string;
  color: string;
}[] = [
  { id: "liquidity", x: 26, y: 42, label: "Liquidity Core", color: "#c68b5a" },
  { id: "predict", x: 22, y: 68, label: "Collateral Logic", color: "#b9764a" },
  { id: "price", x: 73, y: 35, label: "Price Oracle", color: "#d4d4d4" },
  { id: "resolve", x: 78, y: 62, label: "Settlement Layer", color: "#e0b464" },
];

export function AstronomicalJuice() {
  const [activeTab, setActiveTab] = useState<Pillar>("predict");
  const [hoveredHotspot, setHoveredHotspot] = useState<Pillar | null>(null);

  const active = PILLARS[activeTab];

  return (
    <section
      id="astronomical-juice"
      className="relative flex min-h-[800px] w-full flex-col overflow-hidden border-y border-white/5 lg:min-h-[90vh]"
    >
      {/* FULL-BLEED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/engine-image.jpg"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* OVERLAYS */}
      {/* Top fade for section header */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,16,0.9) 0%, rgba(6,9,16,0.3) 70%, transparent 100%)",
        }}
      />
      {/* Left-side darkening for text panel */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[55%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(6,9,16,0.75) 0%, rgba(6,9,16,0.3) 60%, transparent 100%)",
        }}
      />
      {/* Bottom transition */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,14,20,0.85) 70%, #0a0e14 100%)",
        }}
      />

      {/* SECTION HEADER */}
      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pt-14 lg:px-10 lg:pt-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/[0.08] px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-purple-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-200">
              Inside the engine
            </span>
          </div>
          <h2
            className="headline-display text-white [text-wrap:balance]"
            style={{
              fontSize: "clamp(40px, 5.5vw, 80px)",
              letterSpacing: "-0.045em",
              lineHeight: "0.96",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
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
          <p
            className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}
          >
            A modular market core where prediction, liquidity, collateral
            and settlement orbit a single protocol. Hover the orbiting
            assets to inspect each layer.
          </p>
        </div>
      </div>

      {/* STAGE area with hotspots overlaid */}
      <div className="relative z-15 flex-1">
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
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={h.label}
            >
              {/* Pulsing ring */}
              <span
                className="absolute inset-0 -m-6 animate-ping rounded-full opacity-50"
                style={{
                  background: `radial-gradient(circle, ${h.color}55 0%, transparent 70%)`,
                  animationDuration: "2.4s",
                }}
              />
              {/* Core dot */}
              <span
                className="relative block h-3.5 w-3.5 rounded-full ring-2 ring-white/50 transition-all"
                style={{
                  background: h.color,
                  boxShadow: highlight
                    ? `0 0 28px ${h.color}, 0 0 56px ${h.color}60`
                    : `0 0 14px ${h.color}80`,
                  transform: highlight ? "scale(1.4)" : "scale(1)",
                }}
              />
              {/* Callout on hover */}
              {isHovered && (
                <span
                  className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md animate-fade-in"
                  style={{ boxShadow: `0 0 30px ${h.color}40` }}
                >
                  <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-widest text-white/50">
                    {PILLARS[h.id].eyebrow}
                  </span>
                  {h.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FLOATING TEXT PANEL (left side) + TAB DOCK (bottom) */}
      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pb-12 lg:px-10 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          {/* LEFT: Active pillar content as floating panel */}
          <div
            key={activeTab}
            className="animate-fade-up rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl"
            style={{
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.8)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">
                {active.eyebrow}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                  active.status === "LIVE"
                    ? "bg-lime-500/15 text-lime-300 border border-lime-500/30"
                    : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                }`}
              >
                {active.status}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
              {active.headline}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              {active.body}
            </p>
            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
              {active.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime-400" />
                  <span className="text-sm text-white/80">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Roadmap preview */}
          <div
            className="hidden rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl lg:block"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-purple-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-purple-400" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-200">
                On the roadmap
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <RoadmapItem label="LIME / USDC Swap" eta="Q2 2026" />
              <RoadmapItem label="AMM Liquidity Pools" eta="Q3 2026" />
              <RoadmapItem label="Permissionless markets" eta="Q3 2026" />
              <RoadmapItem label="UMA Optimistic Oracle" eta="Mainnet" />
            </div>
          </div>
        </div>

        {/* TAB DOCK - full width, aligned with visual dock bar in image */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/70 p-1.5 backdrop-blur-xl">
          <div className="flex items-center gap-1">
            {(Object.keys(PILLARS) as Pillar[]).map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
                  activeTab === id
                    ? "bg-gradient-to-b from-white/15 to-white/5 text-white shadow-lg"
                    : "text-white/45 hover:text-white/75"
                }`}
              >
                {activeTab === id && (
                  <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-lime-400 via-yellow-300 to-lime-400" />
                )}
                {PILLARS[id].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapItem({ label, eta }: { label: string; eta: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
      <span className="truncate text-[11px] text-white/80">{label}</span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-white/40">
        {eta}
      </span>
    </div>
  );
}
