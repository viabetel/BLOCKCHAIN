"use client";

import { useMemo, useState, useRef } from "react";
import { fmtPct } from "@/lib/format";

/**
 * Premium price chart for binary markets.
 * Inspired by Polymarket + Deribit trading interfaces.
 *
 * Fixes over previous:
 *  - Catmull-Rom smooth curves (no zigzag)
 *  - End labels use collision avoidance (no more "0.0%" stacked on "100.0%")
 *  - Hover crosshair + tooltip
 *  - Gradient fill below YES line
 *  - Date labels with proper en-US formatting (Mar 27, not "iar 28")
 *  - Line glow filter for visual depth
 *  - Clean grid with stronger midline at 50%
 */
export function PriceChart({
  seed,
  yesPct,
  resolved,
  winningOutcome,
}: {
  seed: string;
  yesPct: number;
  resolved: boolean;
  winningOutcome: bigint;
}) {
  const yesSeries = useMemo(() => generateSeries(seed, yesPct), [seed, yesPct]);
  const noSeries = useMemo(() => yesSeries.map((p) => 100 - p), [yesSeries]);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // viewBox geometry
  const W = 960;
  const H = 360;
  const PAD_L = 16;
  const PAD_R = 68;
  const PAD_T = 28;
  const PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const n = yesSeries.length;
  const xs = Array.from({ length: n }, (_, i) => PAD_L + (i / (n - 1)) * innerW);
  const yesYs = yesSeries.map((p) => PAD_T + (1 - p / 100) * innerH);
  const noYs = noSeries.map((p) => PAD_T + (1 - p / 100) * innerH);

  const yesPath = catmullRomPath(xs, yesYs);
  const noPath = catmullRomPath(xs, noYs);
  const yesArea = `${yesPath} L ${xs[n - 1]},${PAD_T + innerH} L ${xs[0]},${PAD_T + innerH} Z`;

  const lastYes = yesSeries[n - 1];
  const lastNo = noSeries[n - 1];

  // Outcome coloring (dim losing side when resolved)
  const yesColor = resolved && winningOutcome !== 1n ? "#6b7280" : "#84cc16";
  const noColor = resolved && winningOutcome !== 0n ? "#6b7280" : "#ef4444";

  // 5 date ticks across the range
  const dateTicks = useMemo(() => {
    const now = new Date();
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      const daysAgo = Math.round(((count - 1 - i) * 30) / (count - 1));
      const d = new Date(now.getTime() - daysAgo * 86_400_000);
      return {
        x: PAD_L + (i / (count - 1)) * innerW,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [innerW]);

  // Handle crosshair
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * W;
    if (xPx < PAD_L || xPx > W - PAD_R) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.round(((xPx - PAD_L) / innerW) * (n - 1));
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
  };

  // Label collision avoidance · if YES and NO are within 20% of each other, push them
  const yesLabelY = yesYs[n - 1];
  let noLabelY = noYs[n - 1];
  if (Math.abs(lastYes - lastNo) < 20) {
    if (yesLabelY < noLabelY) {
      noLabelY = Math.max(noLabelY, yesLabelY + 40);
    } else {
      noLabelY = Math.min(noLabelY, yesLabelY - 40);
    }
    // clamp within chart
    noLabelY = Math.max(PAD_T + 12, Math.min(PAD_T + innerH - 12, noLabelY));
  }

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-[360px] w-full cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="yesAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={yesColor} stopOpacity="0.28" />
            <stop offset="55%" stopColor={yesColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={yesColor} stopOpacity="0" />
          </linearGradient>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = PAD_T + (1 - v / 100) * innerH;
          const isMid = v === 50;
          return (
            <g key={v}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke={isMid ? "#374151" : "#1f2937"}
                strokeDasharray={isMid ? "0" : "2 5"}
                strokeWidth={isMid ? "1" : "0.8"}
              />
              <text
                x={W - PAD_R + 10}
                y={y + 4}
                fill="#6b7280"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 500,
                }}
              >
                {v}%
              </text>
            </g>
          );
        })}

        {/* YES area gradient */}
        <path d={yesArea} fill="url(#yesAreaGrad)" />

        {/* NO dashed line */}
        <path
          d={noPath}
          stroke={noColor}
          strokeWidth="1.75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 4"
          opacity={resolved && winningOutcome === 1n ? 0.4 : 0.7}
        />

        {/* YES main line with glow */}
        <path
          d={yesPath}
          stroke={yesColor}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
          opacity={resolved && winningOutcome === 0n ? 0.4 : 1}
        />

        {/* Hover crosshair */}
        {hoverIdx !== null && (
          <g>
            <line
              x1={xs[hoverIdx]}
              x2={xs[hoverIdx]}
              y1={PAD_T}
              y2={PAD_T + innerH}
              stroke="#4b5563"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle
              cx={xs[hoverIdx]}
              cy={yesYs[hoverIdx]}
              r="4.5"
              fill={yesColor}
              stroke="#0a0e14"
              strokeWidth="2"
            />
            <circle
              cx={xs[hoverIdx]}
              cy={noYs[hoverIdx]}
              r="4"
              fill={noColor}
              stroke="#0a0e14"
              strokeWidth="2"
            />
          </g>
        )}

        {/* End dots */}
        <circle
          cx={xs[n - 1]}
          cy={yesYs[n - 1]}
          r="10"
          fill={yesColor}
          opacity="0.2"
        />
        <circle cx={xs[n - 1]} cy={yesYs[n - 1]} r="5" fill={yesColor} />
        <circle cx={xs[n - 1]} cy={noYs[n - 1]} r="4" fill={noColor} />

        {/* YES pill label (right side) */}
        <g>
          <rect
            x={xs[n - 1] + 10}
            y={yesLabelY - 13}
            width="56"
            height="26"
            rx="6"
            fill="#0a0e14"
            stroke={yesColor}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          <text
            x={xs[n - 1] + 38}
            y={yesLabelY + 4}
            textAnchor="middle"
            fill={yesColor}
            style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtPct(lastYes)}%
          </text>
        </g>

        {/* NO pill label (right side, collision-adjusted) */}
        <g opacity={resolved && winningOutcome === 1n ? 0.5 : 1}>
          <rect
            x={xs[n - 1] + 10}
            y={noLabelY - 11}
            width="52"
            height="22"
            rx="5"
            fill="#0a0e14"
            stroke={noColor}
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <text
            x={xs[n - 1] + 36}
            y={noLabelY + 3}
            textAnchor="middle"
            fill={noColor}
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtPct(lastNo)}%
          </text>
        </g>

        {/* X axis date labels */}
        {dateTicks.map((d, i) => (
          <text
            key={i}
            x={d.x}
            y={H - 10}
            textAnchor="middle"
            fill="#6b7280"
            style={{
              fontSize: 10.5,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.03em",
            }}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {/* Hover data bar */}
      {hoverIdx !== null && (
        <div className="mt-2 flex items-center justify-end gap-5 px-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: yesColor }}
            />
            <span className="text-text-muted uppercase tracking-wider">YES</span>
            <span className="font-mono font-semibold tabular text-text-primary">
              {fmtPct(yesSeries[hoverIdx])}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: noColor }}
            />
            <span className="text-text-muted uppercase tracking-wider">NO</span>
            <span className="font-mono font-semibold tabular text-text-primary">
              {fmtPct(noSeries[hoverIdx])}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Catmull-Rom spline through points, converted to cubic Bezier for SVG.
 * Gives smooth natural curves instead of zigzag lines.
 */
function catmullRomPath(xs: number[], ys: number[]): string {
  if (xs.length < 2) return "";
  const tension = 0.5;
  let d = `M ${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0x = i > 0 ? xs[i - 1] : xs[i];
    const p0y = i > 0 ? ys[i - 1] : ys[i];
    const p1x = xs[i];
    const p1y = ys[i];
    const p2x = xs[i + 1];
    const p2y = ys[i + 1];
    const p3x = i + 2 < xs.length ? xs[i + 2] : xs[i + 1];
    const p3y = i + 2 < ys.length ? ys[i + 2] : ys[i + 1];

    const c1x = p1x + ((p2x - p0x) * tension) / 6;
    const c1y = p1y + ((p2y - p0y) * tension) / 6;
    const c2x = p2x - ((p3x - p1x) * tension) / 6;
    const c2y = p2y - ((p3y - p1y) * tension) / 6;

    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2x.toFixed(2)},${p2y.toFixed(2)}`;
  }
  return d;
}

function generateSeries(seed: string, endPoint: number): number[] {
  const N = 60;
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
  }
  let v = 50 + ((h & 0x1f) - 16);
  for (let i = 0; i < N; i++) {
    h = (h * 1103515245 + 12345) & 0xffffff;
    const step = ((h & 0xff) / 255 - 0.5) * 4.5;
    v = Math.max(8, Math.min(92, v + step));
    out.push(v);
  }
  // Smooth tail converging to endPoint (ease-in-out)
  const tail = 14;
  for (let i = N - tail; i < N; i++) {
    const t = (i - (N - tail)) / (tail - 1);
    const eased = t * t * (3 - 2 * t);
    out[i] = out[i] * (1 - eased) + endPoint * eased;
  }
  out[N - 1] = endPoint;
  return out;
}
