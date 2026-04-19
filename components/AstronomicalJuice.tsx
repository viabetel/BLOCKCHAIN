"use client";

import { useState } from "react";

/**
 * AstronomicalJuice v3 — Precision alignment with the new engine-image.
 *
 * Image anatomy (measured from source):
 *  - Central lime-medallion inside crystalline sphere (~50% x, 48% y)
 *  - Bronze coin top-left, trade arrows symbol (~22% x, 38% y) → VOLATILITY
 *  - Bronze coin bottom-left, network pattern (~20% x, 70% y) → NETWORK
 *  - Silver coin top-right, "$" symbol (~82% x, 28% y) → USDC
 *  - Gold coin bottom-right, lemon icon (~83% x, 68% y) → $LIME
 *  - Three moonstones above sphere (~46-56% x, 17% y) → MARKET STATES
 *  - Electronic chip right of lime core (~62% x, 32% y) → INFRASTRUCTURE
 *  - Two blurred dock bars bottom (~25% and ~72% x, 86% y) ← COVERED
 *
 * Decisions:
 *  - Each coin is a true hotspot linked to a pillar.
 *  - Three moonstones become the market lifecycle indicator in a pill group.
 *  - The two blurred bars are covered by TWO FUNCTIONAL ELEMENTS at their
 *    natural positions: dual-asset switcher on the left, engine status on the right.
 *  - Zero extra decoration — the image does the heavy lifting.
 */

type Hotspot = {
  id: "volatility" | "network" | "usdc" | "lime";
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
    id: "volatility",
    x: 22,
    y: 40,
    label: "Price Volatility",
    subtitle: "Movement engine",
    color: "#c68b5a",
    body: "Every trade updates the probability curve. Volatility is priced continuously by a Fixed Product Market Maker — not matched against a stale orderbook.",
    status: "LIVE",
  },
  {
    id: "network",
    x: 20,
    y: 72,
    label: "Network Layer",
    subtitle: "Settlement mesh",
    color: "#b9764a",
    body: "Built on LitVM — Litecoin's first EVM rollup powered by Arbitrum Orbit & Caldera. Every outcome settles onchain with proof-of-work security underneath.",
    status: "LIVE",
  },
  {
    id: "usdc",
    x: 82,
    y: 32,
    label: "USDC Collateral",
    subtitle: "Stable reference",
    color: "#cbd5e1",
    body: "USDC bridged to LiteForge anchors price discovery. LIME markets display USDC equivalence today — native LIME/USDC pair deploys Q3 2026.",
    status: "SOON",
  },
  {
    id: "lime",
    x: 83,
    y: 65,
    label: "$LIME Token",
    subtitle: "Native collateral",
    color: "#e0b464",
    body: "The native asset of the Limero engine. Powers onboarding, market collateral, liquidity provision and growth incentives across the protocol.",
    status: "LIVE",
  },
];

type Denomination = "LIME" | "USDC";

export function AstronomicalJuice() {
  const [selected, setSelected] = useState<Hotspot["id"]>("volatility");
  const [hovered, setHovered] = useState<Hotspot["id"] | null>(null);
  const [denom, setDenom] = useState<Denomination>("LIME");

  const active = HOTSPOTS.find((h) => h.id === selected)!;

  return (
    <section
      id="astronomical-juice"
      className="relative flex min-h-[820px] w-full flex-col overflow-hidden border-y border-white/5 lg:min-h-[94vh]"
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

      {/* OVERLAYS — very subtle so image stays present */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,16,0.9) 0%, rgba(6,9,16,0.25) 70%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,14,20,0.85) 60%, #0a0e14 100%)",
        }}
      />

      {/* HEADER TOP - centered over the cosmic space */}
      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pt-14 text-center lg:px-10 lg:pt-20">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/[0.1] px-3.5 py-1.5 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-purple-300 opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-purple-300" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-200">
            Inside the engine
          </span>
        </div>
        <h2
          className="headline-display mx-auto max-w-3xl text-white [text-wrap:balance]"
          style={{
            fontSize: "clamp(40px, 5.2vw, 78px)",
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
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          style={{ textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}
        >
          Four assets orbit a single market core. Hover each orbit to inspect
          how volatility, network, USDC and LIME power the protocol.
        </p>
      </div>

      {/* MARKET STATES PILL — sits right above the three moonstones (~17% y) */}
      <div className="pointer-events-none absolute left-1/2 top-[26%] z-15 hidden -translate-x-1/2 lg:block">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 backdrop-blur-md">
          <StateLabel label="Created" />
          <StateDivider />
          <StateLabel label="Live" active />
          <StateDivider />
          <StateLabel label="Resolved" />
        </div>
      </div>

      {/* HOTSPOTS over the 4 coins */}
      <div className="relative z-15 flex-1">
        {HOTSPOTS.map((h) => {
          const isSelected = selected === h.id;
          const isHovered = hovered === h.id;
          const highlight = isSelected || isHovered;
          return (
            <button
              key={h.id}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(h.id)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={h.label}
            >
              {/* Pulsing ring */}
              <span
                className="absolute inset-0 -m-8 animate-ping rounded-full opacity-40"
                style={{
                  background: `radial-gradient(circle, ${h.color}66 0%, transparent 70%)`,
                  animationDuration: "2.8s",
                }}
              />
              {/* Selection halo */}
              {isSelected && (
                <span
                  className="absolute inset-0 -m-5 rounded-full border-2"
                  style={{
                    borderColor: h.color,
                    boxShadow: `0 0 28px ${h.color}90, inset 0 0 18px ${h.color}40`,
                  }}
                />
              )}
              {/* Core dot */}
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
              {/* Callout card on hover */}
              {isHovered && !isSelected && (
                <span
                  className={`absolute top-1/2 ${
                    h.x < 50 ? "left-8" : "right-8"
                  } -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-black/80 px-3.5 py-2 text-[11px] font-semibold text-white backdrop-blur-md animate-fade-in`}
                  style={{ boxShadow: `0 0 36px ${h.color}40` }}
                >
                  <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
                    {h.subtitle}
                  </span>
                  <span className="flex items-center gap-2">
                    {h.label}
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest ${
                        h.status === "LIVE"
                          ? "bg-lime-500/20 text-lime-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {h.status}
                    </span>
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* BOTTOM SECTION — covers the two blurred bars with functional elements */}
      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pb-10 lg:px-10 lg:pb-14">
        {/* Active hotspot info panel — floats above the dock row */}
        <div
          key={active.id}
          className="animate-fade-up mx-auto mb-5 max-w-3xl rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur-xl"
          style={{
            boxShadow: `0 20px 60px -20px rgba(0,0,0,0.9), inset 0 0 40px ${active.color}08`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-12 w-1 shrink-0 rounded-full"
              style={{
                background: active.color,
                boxShadow: `0 0 16px ${active.color}80`,
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
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-white">
                {active.label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                {active.body}
              </p>
            </div>
            {/* Hotspot navigator pills */}
            <div className="hidden flex-col gap-1.5 sm:flex">
              {HOTSPOTS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelected(h.id)}
                  className={`h-2 w-8 rounded-full transition-all ${
                    selected === h.id
                      ? "opacity-100"
                      : "opacity-25 hover:opacity-60"
                  }`}
                  style={{
                    background: h.color,
                    boxShadow: selected === h.id ? `0 0 10px ${h.color}` : "none",
                  }}
                  aria-label={h.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* DOCK ROW — two capsules at exact positions of the blurred bars */}
        <div className="flex items-center justify-between gap-4">
          {/* LEFT CAPSULE (~25% x) → Dual-asset switcher */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/75 p-1.5 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setDenom("LIME")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
                denom === "LIME"
                  ? "bg-gradient-to-b from-yellow-400/25 to-lime-500/15 text-lime-200 ring-1 ring-lime-400/40"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background:
                    denom === "LIME"
                      ? "linear-gradient(135deg, #fde047, #84cc16)"
                      : "#374151",
                  boxShadow:
                    denom === "LIME"
                      ? "0 0 10px rgba(190,242,100,0.6)"
                      : "none",
                }}
              />
              $LIME
            </button>
            <span className="px-1 text-white/25">⇄</span>
            <button
              onClick={() => setDenom("USDC")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
                denom === "USDC"
                  ? "bg-gradient-to-b from-slate-300/20 to-slate-400/10 text-slate-200 ring-1 ring-slate-300/40"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background:
                    denom === "USDC"
                      ? "linear-gradient(135deg, #e2e8f0, #94a3b8)"
                      : "#374151",
                  boxShadow:
                    denom === "USDC"
                      ? "0 0 10px rgba(203,213,225,0.5)"
                      : "none",
                }}
              />
              USDC
            </button>
          </div>

          {/* RIGHT CAPSULE (~72% x) → Engine status */}
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/75 px-4 py-2.5 backdrop-blur-xl shadow-2xl">
            <StatusDot color="#84cc16" pulse />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300">
              FPMM
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              Chain{" "}
              <span className="font-semibold text-white/90 tabular">4441</span>
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 sm:inline">
              Fee{" "}
              <span className="font-semibold text-white/90 tabular">2.00%</span>
            </span>
          </div>
        </div>

        {/* Roadmap teaser - minimal, centered below */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/45">
          <span className="font-mono font-semibold uppercase tracking-[0.22em] text-white/60">
            Coming next
          </span>
          <span className="text-white/20">·</span>
          <span>LIME/USDC AMM</span>
          <span className="text-white/20">·</span>
          <span>Permissionless markets</span>
          <span className="text-white/20">·</span>
          <span>UMA oracle</span>
        </div>
      </div>
    </section>
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
        style={{
          color: active ? "#bef264" : "rgba(255,255,255,0.4)",
        }}
      >
        {label}
      </span>
    </span>
  );
}

function StateDivider() {
  return <span className="h-3 w-px bg-white/15" />;
}

function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-70"
          style={{ background: color }}
        />
      )}
      <span
        className="relative h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
    </span>
  );
}
