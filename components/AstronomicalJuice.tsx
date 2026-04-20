"use client";

import { useState, useEffect } from "react";

/**
 * AstronomicalJuice v5 — Carousel INSIDE the image.
 *
 * Key change from v4:
 *  - The content panel is no longer BELOW the image
 *  - It sits INSIDE the image, positioned EXACTLY over the 2 blurred dock
 *    bars at the bottom of the composition — covering them completely
 *  - A left-right pagination (carousel) lets the user browse all 4 pillars
 *  - Auto-advance every 6s; pauses on hover
 *
 * Image anatomy reminder:
 *  - Bottom-left blurred bar: ~5-38% x, ~84-92% y
 *  - Bottom-right blurred bar: ~58-95% x, ~84-92% y
 *  - Between them (~38-58% x): slight natural gap we leave clean
 *  - Our panel spans the full bottom width covering both bars seamlessly
 */

type Hotspot = {
  id: "volatility" | "network" | "usdc" | "lime";
  x: number; // % of container width
  y: number; // % of container height
  label: string;
  subtitle: string;
  color: string;
  body: string;
  status: "LIVE" | "SOON";
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "volatility",
    x: 22,
    y: 40,
    label: "Price Volatility",
    subtitle: "Movement engine",
    color: "#c68b5a",
    body: "Every trade updates the probability curve continuously. Priced by a Fixed Product Market Maker — not matched against a stale orderbook.",
    status: "LIVE",
  },
  {
    id: "network",
    x: 20,
    y: 72,
    label: "Network Layer",
    subtitle: "Settlement mesh",
    color: "#b9764a",
    body: "Built on LitVM LiteForge — an Arbitrum Orbit rollup operated by Caldera. Every outcome settles onchain with verifiable execution.",
    status: "LIVE",
  },
  {
    id: "usdc",
    x: 82,
    y: 32,
    label: "USDC Collateral",
    subtitle: "Stable reference",
    color: "#cbd5e1",
    body: "Circle's USDC bridged via Arbitrum Bridge anchors price discovery. Native LIME/USDC liquidity pool deploys with mainnet.",
    status: "SOON",
  },
  {
    id: "lime",
    x: 83,
    y: 65,
    label: "$LIME Token",
    subtitle: "Native collateral",
    color: "#e0b464",
    body: "The native asset of Limero. Powers onboarding, market collateral, LP positions and incentives across the entire protocol.",
    status: "LIVE",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function AstronomicalJuice() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<Hotspot["id"] | null>(null);
  const [paused, setPaused] = useState(false);

  const active = HOTSPOTS[index];

  // Auto-advance carousel
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % HOTSPOTS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      id="astronomical-juice"
      className="relative w-full overflow-hidden border-y border-white/5 bg-space-deep"
    >
      {/* Container for image + overlays */}
      <div
        className="relative aspect-[16/8.6] w-full lg:aspect-[16/7.4]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background image - full bleed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/engine-image.jpg"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />

        {/* Corner vignettes */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 42% 50% at 0% 0%, rgba(6,9,16,0.82) 0%, transparent 70%), radial-gradient(ellipse 42% 50% at 100% 0%, rgba(6,9,16,0.72) 0%, transparent 70%)",
          }}
        />

        {/* ZONE 1 — TOP LEFT: Eyebrow + Headline */}
        <div className="absolute left-0 top-0 z-20 max-w-[52%] p-6 sm:p-8 lg:max-w-[42%] lg:p-10">
          <div className="animate-fade-up mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/[0.1] px-3 py-1 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-purple-300 opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-purple-300" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-purple-200">
              Inside the engine
            </span>
          </div>
          <h2
            className="animate-fade-up headline-display text-white [text-wrap:balance]"
            style={{
              fontSize: "clamp(28px, 3.6vw, 52px)",
              lineHeight: "0.98",
              letterSpacing: "-0.045em",
              textShadow: "0 4px 40px rgba(0,0,0,0.9)",
              animationDelay: "0.05s",
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
            className="animate-fade-up mt-3 max-w-sm text-sm leading-relaxed text-white/75"
            style={{
              textShadow: "0 2px 15px rgba(0,0,0,0.9)",
              animationDelay: "0.1s",
            }}
          >
            Four assets orbit a single market core. Browse each layer below.
          </p>
        </div>

        {/* ZONE 2 — TOP RIGHT: Market state pill */}
        <div className="absolute right-0 top-0 z-20 hidden p-6 sm:p-8 lg:block lg:p-10">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-md">
            <StateLabel label="Created" />
            <StateDivider />
            <StateLabel label="Live" active />
            <StateDivider />
            <StateLabel label="Resolved" />
          </div>
        </div>

        {/* ZONE 3 — Hotspots over coins (indicators only) */}
        {HOTSPOTS.map((h, i) => {
          const isActive = index === i;
          const isHovered = hovered === h.id;
          const highlight = isActive || isHovered;
          return (
            <button
              key={h.id}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setIndex(i)}
              className="absolute z-15 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={h.label}
            >
              <span
                className="absolute inset-0 -m-8 animate-ping rounded-full opacity-40"
                style={{
                  background: `radial-gradient(circle, ${h.color}66 0%, transparent 70%)`,
                  animationDuration: "2.8s",
                }}
              />
              {isActive && (
                <span
                  className="absolute inset-0 -m-5 rounded-full border-2"
                  style={{
                    borderColor: h.color,
                    boxShadow: `0 0 28px ${h.color}90, inset 0 0 18px ${h.color}40`,
                  }}
                />
              )}
              <span
                className="relative block h-4 w-4 rounded-full ring-2 ring-white/60 transition-all"
                style={{
                  background: h.color,
                  boxShadow: highlight
                    ? `0 0 32px ${h.color}, 0 0 64px ${h.color}60`
                    : `0 0 14px ${h.color}80`,
                  transform: highlight ? "scale(1.45)" : "scale(1)",
                }}
              />
              {isHovered && !isActive && (
                <span
                  className={`absolute top-1/2 ${
                    h.x < 50 ? "left-7" : "right-7"
                  } -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md animate-fade-in`}
                >
                  {h.label}
                </span>
              )}
            </button>
          );
        })}

        {/* ZONE 4 — CAROUSEL PANEL covering the 2 blurred bars at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-25 px-4 pb-5 sm:px-8 sm:pb-7 lg:px-12 lg:pb-8">
          <div
            className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,14,20,0.85) 0%, rgba(6,9,16,0.92) 100%)",
              boxShadow: `0 30px 60px -20px rgba(0,0,0,0.9), inset 0 0 40px ${active.color}10`,
            }}
          >
            {/* Carousel slide content */}
            <div
              key={active.id}
              className="animate-fade-up flex items-center gap-4 p-5 sm:gap-5 sm:p-6"
            >
              {/* Left: color-coded accent bar */}
              <div
                className="h-16 w-1 shrink-0 rounded-full"
                style={{
                  background: active.color,
                  boxShadow: `0 0 16px ${active.color}99`,
                }}
              />

              {/* Middle: content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    {active.subtitle}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                      active.status === "LIVE"
                        ? "border border-lime-500/30 bg-lime-500/10 text-lime-300"
                        : "border border-purple-500/30 bg-purple-500/10 text-purple-300"
                    }`}
                  >
                    {active.status}
                  </span>
                  <span className="ml-auto font-mono text-[10px] font-semibold text-white/40 tabular">
                    {(index + 1).toString().padStart(2, "0")}
                    <span className="text-white/20">
                      {" "}/ {HOTSPOTS.length.toString().padStart(2, "0")}
                    </span>
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                  {active.label}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70 sm:text-sm">
                  {active.body}
                </p>
              </div>

              {/* Right: prev / next buttons */}
              <div className="flex shrink-0 items-center gap-1.5">
                <CarouselButton
                  onClick={() =>
                    setIndex((i) => (i - 1 + HOTSPOTS.length) % HOTSPOTS.length)
                  }
                  direction="prev"
                />
                <CarouselButton
                  onClick={() => setIndex((i) => (i + 1) % HOTSPOTS.length)}
                  direction="next"
                />
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 border-t border-white/5 bg-black/30 px-4 py-2.5">
              {HOTSPOTS.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === i ? "w-8" : "w-1.5 hover:w-3"
                  }`}
                  style={{
                    background: index === i ? h.color : "rgba(255,255,255,0.2)",
                    boxShadow: index === i ? `0 0 12px ${h.color}80` : "none",
                  }}
                  aria-label={h.label}
                />
              ))}
              <span className="ml-3 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.22em] text-white/30">
                {paused ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    Paused
                  </>
                ) : (
                  <>
                    <span className="h-1 w-1 animate-pulse-dot rounded-full bg-lime-400" />
                    Auto
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Roadmap strip — below carousel, outside image */}
        </div>

        {/* Bottom fade connecting into next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(6,9,16,0.7) 100%)",
          }}
        />
      </div>

      {/* ROADMAP STRIP — below the image */}
      <div className="mx-auto w-full max-w-[1400px] px-6 py-5 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-purple-400 opacity-50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-purple-400" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-200">
              Coming next
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
            <RoadmapItem label="LIME/USDC Swap" eta="Q2 2026" />
            <span className="text-white/20">·</span>
            <RoadmapItem label="AMM pools" eta="Q3 2026" />
            <span className="text-white/20">·</span>
            <RoadmapItem label="Permissionless markets" eta="Q3" />
            <span className="text-white/20">·</span>
            <RoadmapItem label="UMA oracle" eta="Mainnet" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  onClick,
  direction,
}: {
  onClick: () => void;
  direction: "prev" | "next";
}) {
  return (
    <button
      onClick={onClick}
      className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-lime-400/40 hover:bg-lime-500/10 hover:text-lime-300"
      aria-label={direction === "prev" ? "Previous pillar" : "Next pillar"}
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
        {direction === "prev" ? (
          <path
            d="M10 4L6 8L10 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

function RoadmapItem({ label, eta }: { label: string; eta: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-white/75">{label}</span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-white/35">
        {eta}
      </span>
    </span>
  );
}

function StateLabel({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "animate-pulse-dot" : ""
        }`}
        style={{
          background: active ? "#bef264" : "rgba(255,255,255,0.25)",
          boxShadow: active ? "0 0 12px rgba(190,242,100,0.8)" : "none",
        }}
      />
      <span
        className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: active ? "#bef264" : "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
    </span>
  );
}

function StateDivider() {
  return <span className="h-3 w-px bg-white/15" />;
}
