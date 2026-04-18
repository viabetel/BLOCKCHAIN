"use client";

import { useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { marketAbi } from "@/lib/contracts";
import { useMemo } from "react";

export function MarketCard({ address }: { address: `0x${string}` }) {
  const { data } = useReadContracts({
    contracts: [
      { address, abi: marketAbi, functionName: "question" },
      { address, abi: marketAbi, functionName: "yesPrice" },
      { address, abi: marketAbi, functionName: "resolutionTime" },
      { address, abi: marketAbi, functionName: "resolved" },
      { address, abi: marketAbi, functionName: "yesReserve" },
      { address, abi: marketAbi, functionName: "noReserve" },
    ],
  });

  const question = (data?.[0]?.result as string) ?? "Loading...";
  const yesPrice = (data?.[1]?.result as bigint) ?? 50n * 10n ** 16n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const yesReserve = (data?.[4]?.result as bigint) ?? 0n;
  const noReserve = (data?.[5]?.result as bigint) ?? 0n;

  const yesPct = Number(yesPrice) / 1e16;
  const noPct = 100 - yesPct;
  const tvl = yesReserve < noReserve ? yesReserve : noReserve;
  const deadline = new Date(Number(resolutionTime) * 1000);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
  );

  // Generate a deterministic fake price history based on address + current price
  // (real history would come from indexer; this is visual for now)
  const sparkline = useMemo(() => generateSparkline(address, yesPct), [address, yesPct]);
  const category = useMemo(() => inferCategory(question), [question]);

  const priceColor = yesPct >= 50 ? "text-bull" : "text-bear";
  const priceUp = yesPct >= 50;

  return (
    <article className="card-paper group relative overflow-hidden rounded-2xl p-5 cursor-pointer">
      {/* Top row: category + status */}
      <div className="mb-4 flex items-center justify-between">
        <span className="chip bg-ink-100 border border-ink-200 text-ink-700">
          {category}
        </span>
        {resolved ? (
          <span className="chip chip-settled">Settled</span>
        ) : (
          <span className="chip chip-live">
            <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
            Live
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="mb-5 font-display text-[17px] font-semibold leading-[1.25] tracking-tight text-ink-pure min-h-[51px] [text-wrap:balance]">
        {question}
      </h3>

      {/* Big price display + mini chart */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
            YES price
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`font-display text-4xl font-bold tracking-tighter tabular ${priceColor}`}>
              {yesPct.toFixed(0)}
            </span>
            <span className="text-lg font-medium text-ink-400">%</span>
            <span className={`ml-1 flex items-center gap-0.5 text-xs font-medium ${priceColor}`}>
              {priceUp ? "▲" : "▼"}
              <span className="tabular">{Math.abs(yesPct - 50).toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-12 w-24">
          <Sparkline points={sparkline} color={priceUp ? "#00a868" : "#cf202f"} />
        </div>
      </div>

      {/* Probability split bar */}
      <div className="mb-4">
        <div className="flex h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className="bg-bull transition-all duration-700"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="bg-bear transition-all duration-700"
            style={{ width: `${noPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-medium">
          <span className="text-bull tabular">YES {yesPct.toFixed(1)}%</span>
          <span className="text-bear tabular">NO {noPct.toFixed(1)}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-ink-100 pt-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-ink-500">Vol </span>
            <span className="font-mono font-medium text-ink-900 tabular">
              {Number(formatEther(tvl)).toFixed(1)}
            </span>
          </div>
          <div className="h-3 w-px bg-ink-200" />
          <div>
            <span className="text-ink-500">Ends </span>
            <span className="font-mono font-medium text-ink-900 tabular">
              {resolved ? "ended" : daysLeft === 0 ? "today" : `${daysLeft}d`}
            </span>
          </div>
        </div>
        <span className="font-medium text-xs text-ink-pure opacity-0 transition-opacity group-hover:opacity-100">
          Trade →
        </span>
      </div>
    </article>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 96;
  const h = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const path = `M ${pathPoints.join(" L ")}`;
  const areaPath = `${path} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function generateSparkline(seed: string, endPoint: number): number[] {
  // Simple seeded pseudo-random walk ending at `endPoint`
  const n = 24;
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;

  let v = 50 + ((h & 0x1f) - 16);
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) & 0xffff;
    const step = ((h & 0xff) / 255 - 0.5) * 8;
    v = Math.max(5, Math.min(95, v + step));
    out.push(v);
  }
  // Smooth the last few toward the real current price
  for (let i = n - 4; i < n; i++) {
    const t = (i - (n - 4)) / 3;
    out[i] = out[i] * (1 - t) + endPoint * t;
  }
  out[n - 1] = endPoint;
  return out;
}

function inferCategory(q: string): string {
  const lower = q.toLowerCase();
  if (/ltc|litecoin|btc|bitcoin|eth|ethereum|price|\$\d/.test(lower)) return "Crypto";
  if (/tge|token|launch|mainnet/.test(lower)) return "Launch";
  if (/etf|sec|regulation/.test(lower)) return "Policy";
  if (/builders|program|team/.test(lower)) return "Ecosystem";
  return "Market";
}
