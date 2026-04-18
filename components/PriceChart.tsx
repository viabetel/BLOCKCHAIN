"use client";

import { useMemo } from "react";
import { fmtPct } from "@/lib/format";

export function PriceChart({
  seed, yesPct, resolved, winningOutcome,
}: {
  seed: string; yesPct: number; resolved: boolean; winningOutcome: bigint;
}) {
  const points = useMemo(() => generateChart(seed, yesPct), [seed, yesPct]);

  const w = 900;
  const h = 340;
  const padL = 12;
  const padR = 60;
  const padY = 24;

  const xs = points.map((_, i) => padL + (i / (points.length - 1)) * (w - padL - padR));
  const yesYs = points.map((p) => padY + (1 - p / 100) * (h - padY * 2));
  const noYs = points.map((p) => padY + (p / 100) * (h - padY * 2));

  const yesPath = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${yesYs[i].toFixed(1)}`).join(" ");
  const noPath = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${noYs[i].toFixed(1)}`).join(" ");
  const yesArea = `${yesPath} L ${xs[xs.length - 1]},${h - padY} L ${xs[0]},${h - padY} Z`;

  const yesColor = resolved ? (winningOutcome === 1n ? "#00a868" : "#a3a3a3") : "#00a868";
  const noColor = resolved ? (winningOutcome === 0n ? "#cf202f" : "#a3a3a3") : "#cf202f";

  const dates = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const n = 5;
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const daysAgo = Math.round((n - 1 - i) * (30 / (n - 1)));
      const d = new Date(now.getTime() - daysAgo * 86_400_000);
      const x = padL + (i / (n - 1)) * (w - padL - padR);
      out.push({
        x,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return out;
  }, []);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="h-[340px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={yesColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={yesColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid at 0/25/50/75/100 */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padY + (1 - v / 100) * (h - padY * 2);
          return (
            <g key={v}>
              <line x1={padL} x2={w - padR} y1={y} y2={y}
                stroke="#e5e5e5" strokeDasharray={v === 50 ? "0" : "3 4"} strokeWidth="1" />
              <text x={w - padR + 8} y={y + 4} fill="#737373"
                style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                {v}%
              </text>
            </g>
          );
        })}

        {/* YES area */}
        <path d={yesArea} fill="url(#yesGrad)" />

        {/* Lines */}
        <path d={yesPath} stroke={yesColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={noPath} stroke={noColor} strokeWidth="1.5" fill="none"
          strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />

        {/* End labels (Polymarket-style) */}
        <g>
          <circle cx={xs[xs.length - 1]} cy={yesYs[yesYs.length - 1]} r="4" fill={yesColor} />
          <circle cx={xs[xs.length - 1]} cy={yesYs[yesYs.length - 1]} r="8" fill={yesColor} opacity="0.2" />
          <text x={xs[xs.length - 1] + 10} y={yesYs[yesYs.length - 1] - 4} fill={yesColor}
            style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            YES
          </text>
          <text x={xs[xs.length - 1] + 10} y={yesYs[yesYs.length - 1] + 9} fill={yesColor}
            style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
            {fmtPct(yesPct)}%
          </text>
        </g>
        <g opacity={resolved && winningOutcome === 1n ? 0.4 : 1}>
          <circle cx={xs[xs.length - 1]} cy={noYs[noYs.length - 1]} r="3.5" fill={noColor} />
          <text x={xs[xs.length - 1] + 10} y={noYs[noYs.length - 1] - 4} fill={noColor}
            style={{ fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            NO
          </text>
          <text x={xs[xs.length - 1] + 10} y={noYs[noYs.length - 1] + 9} fill={noColor}
            style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
            {fmtPct(100 - yesPct)}%
          </text>
        </g>

        {/* X axis dates */}
        {dates.map((d, i) => (
          <text key={i} x={d.x} y={h + 14} textAnchor="middle" fill="#a3a3a3"
            style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function generateChart(seed: string, endPoint: number): number[] {
  const n = 90;
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
  let v = 50 + ((h & 0x1f) - 16);
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) & 0xffffff;
    const step = ((h & 0xff) / 255 - 0.5) * 5;
    v = Math.max(10, Math.min(90, v + step));
    out.push(v);
  }
  const tail = Math.floor(n * 0.12);
  for (let i = n - tail; i < n; i++) {
    const t = (i - (n - tail)) / (tail - 1);
    out[i] = out[i] * (1 - t) + endPoint * t;
  }
  out[n - 1] = endPoint;
  return out;
}
