"use client";

import { useState, useEffect } from "react";

/**
 * AstronomicalJuice v6 · LitVM-native repositioning.
 *
 * Changes from v5:
 *  - Hotspot order is now zkLTC-first, LIME demoted to incentive layer.
 *  - Copy for every hotspot ties back to LitVM's thesis: productive
 *    zkLTC capital, Litecoin-native markets, vault-routed liquidity.
 *  - USDC is now explicitly the "stable reference", not a parallel
 *    collateral equivalent to zkLTC.
 *
 * Image anatomy and layout preserved from v5.
 */

type Hotspot = {
  id: "zkltc" | "vaults" | "usdc" | "lime";
  x: number;
  y: number;
  label: string;
  subtitle: string;
  color: string;
  body: string;
  status: "LIVE" | "SOON";
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "zkltc",
    x: 22,
    y: 40,
    label: "zkLTC Core",
    subtitle: "Primary collateral",
    color: "#bef264",
    body: "Every Limero market and vault is denominated in zkLTC · LTC bridged 1:1 via BitcoinOS Grail. This is how Litecoin becomes productive, onchain capital on LitVM.",
    status: "LIVE",
  },
  {
    id: "vaults",
    x: 20,
    y: 72,
    label: "Yield Vaults",
    subtitle: "Productive capital engine",
    color: "#84cc16",
    body: "Vaults route depositor liquidity into every active market. LTC holders deposit zkLTC, earn trading fees, withdraw anytime. No side-picking required.",
    status: "LIVE",
  },
  {
    id: "usdc",
    x: 82,
    y: 32,
    label: "USDC Reference",
    subtitle: "Stable denomination",
    color: "#cbd5e1",
    body: "Circle USDC bridged via Arbitrum. Used for USD-denominated markets where stable reference matters · complementary to the zkLTC core, not central to it.",
    status: "SOON",
  },
  {
    id: "lime",
    x: 83,
    y: 65,
    label: "$LIME Incentives",
    subtitle: "Points · rewards · governance",
    color: "#e0b464",
    body: "LIME powers the incentive layer: trader points, LP streak rewards, curator bonuses, and post-mainnet governance. It is not the primary collateral.",
    status: "LIVE",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function AstronomicalJuice() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<Hotspot["id"] | null>(null);
  const [paused, setPaused] = useState(false);

  const active = HOTSPOTS[index];

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
      <div
        className="relative aspect-[16/8.6] w-full lg:aspect-[16/7.4]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/engine-image.jpg"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 42% 50% at 0% 0%, rgba(6,9,16,0.82) 0%, transparent 70%), radial-gradient(ellipse 42% 50% at 100% 0%, rgba(6,9,16,0.72) 0%, transparent 70%)",
          }}
        />

        {/* ZONE 1 · TOP LEFT */}
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
            A{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #fde047 0%, #facc15 45%, #bef264 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              zkLTC engine
            </span>
            , four layers.
          </h2>
          <p
            className="animate-fade-up mt-3 max-w-sm text-sm leading-relaxed text-white/75"
            style={{
              textShadow: "0 2px 15px rgba(0,0,0,0.9)",
              animationDelay: "0.1s",
            }}
          >
            zkLTC at the core. Vaults, stable reference and incentives orbit around it.
          </p>
        </div>

        {/* ZONE 2 · TOP RIGHT */}
        <div className="absolute right-0 top-0 z-20 hidden p-6 sm:p-8 lg:block lg:p-10">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-md">
            <StateLabel label="Created" />
            <StateDivider />
            <StateLabel label="Live" active />
            <StateDivider />
            <StateLabel label="Resolved" />
          </div>
        </div>

        {/* ZONE 3 · Hotspots */}
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

        {/* ZONE 4 · CAROUSEL PANEL */}
        <div
          className="absolute inset-x-0 z-25 px-4 sm:px-8 lg:px-12"
          style={{ bottom: "5%" }}
        >
          <div
            className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,14,20,0.85) 0%, rgba(6,9,16,0.92) 100%)",
              boxShadow: `0 30px 60px -20px rgba(0,0,0,0.9), inset 0 0 40px ${active.color}10`,
            }}
          >
            <div
              key={active.id}
              className="animate-fade-up flex items-center gap-4 p-5 sm:gap-5 sm:p-6"
            >
              <div
                className="h-16 w-1 shrink-0 rounded-full"
                style={{
                  background: active.color,
                  boxShadow: `0 0 16px ${active.color}99`,
                }}
              />

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
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(6,9,16,0.7) 100%)",
          }}
        />
      </div>

      {/* ROADMAP STRIP · updated for LitVM fit */}
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
            <RoadmapItem label="Native zkLTC vault" eta="30d" />
            <span className="text-white/20">·</span>
            <RoadmapItem label="Permissionless markets" eta="60d" />
            <span className="text-white/20">·</span>
            <RoadmapItem label="Trader streaks · points" eta="60d" />
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
          <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        className={`h-1.5 w-1.5 rounded-full ${active ? "animate-pulse-dot" : ""}`}
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
