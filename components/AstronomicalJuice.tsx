"use client";

import { useState } from "react";

/**
 * AstronomicalJuice v4 — Rigorously reorganized composition.
 *
 * DESIGN PRINCIPLE: the image is the stage. All UI lives in the MARGINS
 * (corners + bottom strip). The center — where the lime, moonstones and
 * chip live — stays forever untouched.
 *
 * LAYOUT GRID (vertical zones, top to bottom):
 *  Zone 1 — top-left corner: eyebrow + compact headline (left-aligned)
 *  Zone 2 — top-right corner: market state indicator pill
 *  Zone 3 — center (image area): hotspots only, no text overlap
 *  Zone 4 — bottom of image: the 2 blurred bars → 2 functional capsules
 *  Zone 5 — below image: detail panel + roadmap strip (solid background)
 *
 * HOTSPOT BEHAVIOR:
 *  - Hover: shows thin tooltip (name + status badge) — NOT a big panel
 *  - Click: selects this hotspot → detail panel below image updates
 *  - Zero overlap with central elements
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
      className="relative w-full overflow-hidden border-y border-white/5 bg-space-deep"
    >
      {/* ============================================
          STAGE CONTAINER (holds the image + its overlays + margin UI)
          ============================================ */}
      <div className="relative w-full">
        {/* Background image — full bleed */}
        <div className="relative aspect-[16/8.2] w-full lg:aspect-[16/7.2]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/engine-image.jpg"
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
            loading="lazy"
          />

          {/* Corner vignettes — darken the 4 corners for UI placement */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 45% 55% at 0% 0%, rgba(6,9,16,0.82) 0%, transparent 70%), radial-gradient(ellipse 45% 55% at 100% 0%, rgba(6,9,16,0.75) 0%, transparent 70%), radial-gradient(ellipse 45% 55% at 0% 100%, rgba(6,9,16,0.82) 0%, transparent 70%), radial-gradient(ellipse 45% 55% at 100% 100%, rgba(6,9,16,0.82) 0%, transparent 70%)",
            }}
          />

          {/* ============================================
              ZONE 1 — TOP LEFT: Eyebrow + Headline
              ============================================ */}
          <div className="absolute left-0 top-0 z-20 max-w-[50%] p-6 sm:p-8 lg:max-w-[42%] lg:p-10">
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
                fontSize: "clamp(28px, 3.8vw, 54px)",
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
              Four assets orbit a single market core.
              Hover each orbit to inspect the layer.
            </p>
          </div>

          {/* ============================================
              ZONE 2 — TOP RIGHT: Market state pill
              ============================================ */}
          <div className="absolute right-0 top-0 z-20 hidden p-6 sm:p-8 lg:block lg:p-10">
            <div className="animate-fade-up flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-md">
              <StateLabel label="Created" />
              <StateDivider />
              <StateLabel label="Live" active />
              <StateDivider />
              <StateLabel label="Resolved" />
            </div>
          </div>

          {/* ============================================
              ZONE 3 — CENTER: Hotspots only (no other UI)
              ============================================ */}
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
                className="absolute z-15 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
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
                {/* Thin tooltip on hover — ONLY name + status, never a panel */}
                {isHovered && (
                  <span
                    className={`absolute top-1/2 ${
                      h.x < 50 ? "left-7" : "right-7"
                    } -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md animate-fade-in`}
                    style={{ boxShadow: `0 0 24px ${h.color}40` }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: h.color }}
                      />
                      {h.label}
                      <span
                        className={`rounded px-1 py-0.5 font-mono text-[8px] font-bold tracking-widest ${
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

          {/* ============================================
              ZONE 4 — BOTTOM OF IMAGE: Two capsules covering blurred bars
              ============================================ */}
          {/* Left capsule: Dual-asset switcher at ~25% x, 88% y */}
          <div
            className="absolute z-20 hidden -translate-x-1/2 sm:flex"
            style={{ left: "25%", top: "88%" }}
          >
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 p-1 backdrop-blur-xl shadow-2xl">
              <button
                onClick={() => setDenom("LIME")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  denom === "LIME"
                    ? "bg-gradient-to-b from-yellow-400/25 to-lime-500/15 text-lime-200 ring-1 ring-lime-400/40"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      denom === "LIME"
                        ? "linear-gradient(135deg, #fde047, #84cc16)"
                        : "#374151",
                    boxShadow:
                      denom === "LIME"
                        ? "0 0 8px rgba(190,242,100,0.6)"
                        : "none",
                  }}
                />
                $LIME
              </button>
              <span className="px-0.5 text-xs text-white/25">⇄</span>
              <button
                onClick={() => setDenom("USDC")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  denom === "USDC"
                    ? "bg-gradient-to-b from-slate-300/20 to-slate-400/10 text-slate-200 ring-1 ring-slate-300/40"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      denom === "USDC"
                        ? "linear-gradient(135deg, #e2e8f0, #94a3b8)"
                        : "#374151",
                    boxShadow:
                      denom === "USDC"
                        ? "0 0 8px rgba(203,213,225,0.5)"
                        : "none",
                  }}
                />
                USDC
              </button>
            </div>
          </div>

          {/* Right capsule: Engine status at ~72% x, 88% y */}
          <div
            className="absolute z-20 hidden -translate-x-1/2 sm:flex"
            style={{ left: "72%", top: "88%" }}
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/80 px-3.5 py-2 backdrop-blur-xl shadow-2xl">
              <StatusDot color="#84cc16" pulse />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300">
                FPMM
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                <span className="font-semibold text-white/90 tabular">4441</span>
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                <span className="font-semibold text-white/90 tabular">2.00%</span>
              </span>
            </div>
          </div>

          {/* Bottom fade into detail panel below */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(10,14,20,0.8) 100%)",
            }}
          />
        </div>

        {/* ============================================
            ZONE 5 — BELOW IMAGE: Detail panel + roadmap
            (solid background, no overlap with image)
            ============================================ */}
        <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
          {/* Detail panel */}
          <div
            key={active.id}
            className="animate-fade-up rounded-2xl border border-white/10 bg-space-surface/70 p-5 backdrop-blur-xl"
            style={{
              boxShadow: `inset 0 0 40px ${active.color}08`,
            }}
          >
            <div className="flex items-start gap-5">
              {/* Color bar */}
              <div
                className="mt-1 h-14 w-1 shrink-0 rounded-full"
                style={{
                  background: active.color,
                  boxShadow: `0 0 16px ${active.color}80`,
                }}
              />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
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
                <h3 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {active.label}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                  {active.body}
                </p>
              </div>

              {/* Hotspot navigator (4 dots) */}
              <div className="flex shrink-0 flex-col gap-1.5">
                {HOTSPOTS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelected(h.id)}
                    className={`h-2 w-10 rounded-full transition-all ${
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

          {/* Roadmap strip */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 sm:justify-between">
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
      </div>
    </section>
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
