"use client";

import { TokenIcon } from "@/components/TokenIcon";

/**
 * Hero mascot stage. Renders:
 * - Orbit rings (SVG)
 * - Floating token icons (LTC, BTC, ETH) positioned on orbits
 * - Probability chips floating around
 * - The mascot itself (img if provided, else placeholder lime)
 *
 * Props: mascotSrc - path to mascot PNG (when user uploads asset)
 */
export function MascotStage({ mascotSrc }: { mascotSrc?: string }) {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[70%] w-[70%] rounded-full bg-lime-500/10 blur-3xl" />
      </div>

      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="orbit-line h-[95%] w-[95%] animate-orbit" style={{ borderStyle: "dashed" }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="orbit-line h-[75%] w-[75%] animate-orbit-reverse" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="orbit-line h-[55%] w-[55%] animate-orbit" style={{ animationDuration: "30s" }} />
      </div>

      {/* Floating token icons on orbits */}
      <FloatingToken symbol="LTC" position={{ top: "8%", left: "50%" }} delay={0} />
      <FloatingToken symbol="BTC" position={{ top: "30%", right: "2%" }} delay={1.5} />
      <FloatingToken symbol="ETH" position={{ bottom: "20%", left: "5%" }} delay={3} />

      {/* Probability chips */}
      <FloatingChip
        label="LTC > $120"
        value="73"
        trend="up"
        position={{ top: "15%", left: "-5%" }}
        delay={0.5}
      />
      <FloatingChip
        label="Mainnet Q3"
        value="48"
        trend="flat"
        position={{ top: "55%", right: "-8%" }}
        delay={2}
      />
      <FloatingChip
        label="BTC Dom <55%"
        value="31"
        trend="down"
        position={{ bottom: "5%", right: "15%" }}
        delay={3.5}
      />

      {/* MASCOT (centered) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[72%] w-[72%]">
          {mascotSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mascotSrc}
              alt="Limero mascot"
              className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(132,204,22,0.3)]"
              style={{ filter: "drop-shadow(0 0 60px rgba(190, 242, 100, 0.15))" }}
            />
          ) : (
            <MascotPlaceholder />
          )}
        </div>
      </div>

      {/* Base reflection/shadow */}
      <div className="absolute bottom-[8%] left-1/2 h-4 w-[55%] -translate-x-1/2 rounded-[50%] bg-lime-500/20 blur-xl" />
    </div>
  );
}

function FloatingToken({
  symbol,
  position,
  delay,
}: {
  symbol: "LTC" | "BTC" | "ETH";
  position: React.CSSProperties;
  delay: number;
}) {
  return (
    <div
      className="absolute animate-float"
      style={{ ...position, animationDelay: `${delay}s` }}
    >
      <div className="rounded-full bg-space-elevated/80 p-2 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <TokenIcon symbol={symbol} size={32} />
      </div>
    </div>
  );
}

function FloatingChip({
  label,
  value,
  trend,
  position,
  delay,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  position: React.CSSProperties;
  delay: number;
}) {
  const trendColor =
    trend === "up" ? "text-lime-300" : trend === "down" ? "text-red-400" : "text-text-secondary";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div
      className="floating-chip absolute flex animate-float items-center gap-2.5 rounded-xl px-3 py-2"
      style={{ ...position, animationDelay: `${delay}s` }}
    >
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="font-display text-lg font-bold text-text-primary tabular">{value}</span>
          <span className="text-xs text-text-muted">%</span>
          <span className={`ml-0.5 text-xs font-semibold ${trendColor}`}>{trendIcon}</span>
        </div>
      </div>
    </div>
  );
}

function MascotPlaceholder() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="phLimeBody" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#f7fee7" />
            <stop offset="30%" stopColor="#d9f99d" />
            <stop offset="70%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </radialGradient>
          <radialGradient id="phLimeHighlight" cx="0.3" cy="0.25" r="0.3">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="phLeaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4d7c0f" />
            <stop offset="100%" stopColor="#1a2e05" />
          </linearGradient>
        </defs>

        {/* Lime body */}
        <ellipse cx="100" cy="115" rx="70" ry="68" fill="url(#phLimeBody)" />
        <ellipse cx="100" cy="115" rx="70" ry="68" fill="none" stroke="#4d7c0f" strokeWidth="1" opacity="0.5" />

        {/* Shine */}
        <ellipse cx="75" cy="90" rx="32" ry="22" fill="url(#phLimeHighlight)" />

        {/* Texture dots */}
        {[
          [60, 100, 2], [130, 95, 1.8], [150, 130, 2.2], [75, 150, 1.6],
          [120, 160, 1.8], [95, 175, 2], [50, 130, 1.5], [160, 100, 1.7]
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#365314" opacity="0.35" />
        ))}

        {/* Eyes (simple placeholder) */}
        <ellipse cx="78" cy="100" rx="6" ry="8" fill="#0a0e14" />
        <ellipse cx="118" cy="100" rx="6" ry="8" fill="#0a0e14" />
        <circle cx="80" cy="97" r="1.8" fill="#ffffff" />
        <circle cx="120" cy="97" r="1.8" fill="#ffffff" />

        {/* Eyebrow (subtle smirk expression) */}
        <path d="M 70 85 Q 78 80, 86 85" stroke="#1a2e05" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 114 85 Q 122 80, 130 85" stroke="#1a2e05" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Mouth (confident smirk) */}
        <path d="M 82 130 Q 100 138, 118 130" stroke="#1a2e05" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Stem */}
        <rect x="96" y="38" width="8" height="14" rx="2" fill="#4d7c0f" />

        {/* Leaf */}
        <path d="M 104 42 Q 140 20, 158 40 Q 138 55, 112 50 Q 104 48, 104 42 Z" fill="url(#phLeaf)" />
        <path d="M 108 44 Q 135 38, 152 43" stroke="#365314" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>

      {/* Placeholder notice */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-space-elevated/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted backdrop-blur-sm border border-space-border">
        Mascot placeholder
      </div>
    </div>
  );
}
