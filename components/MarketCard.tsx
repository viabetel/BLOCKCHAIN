"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { useMemo } from "react";
import { marketAbi } from "@/lib/contracts";
import { fmtPct, fmtZkLTC, fmtTimeLeft, inferCategory } from "@/lib/format";
import { TokensFromQuestion } from "@/components/TokenIcon";

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
  const sparkline = useMemo(() => generateSparkline(address, yesPct), [address, yesPct]);
  const category = useMemo(() => inferCategory(question), [question]);
  const icon = categoryIcon(category);

  return (
    <div className="card-paper group relative flex h-full flex-col overflow-hidden rounded-xl p-4">
      {/* Top: real token icons + category + status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 items-center">
            <TokensFromQuestion question={question} size={22} />
            {/* Fallback when no tokens detected */}
            <span className={`ml-0 flex h-8 w-8 items-center justify-center rounded-full text-[14px] ${icon.bg} ${icon.color}`}
              style={{ display: /ltc|btc|eth|bitcoin|ethereum|litecoin|usdc|usdt|sol/i.test(question) ? "none" : "flex" }}>
              {icon.label}
            </span>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">
              {category}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-500">
              {resolved ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-ink-400" />
                  <span>Settled</span>
                </>
              ) : (
                <>
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-bull" />
                  <span>Live · {fmtTimeLeft(deadline)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question + sparkline */}
      <Link href={`/market/${address}`} className="mb-4 flex items-start gap-3">
        <h3 className="flex-1 font-display text-[15px] font-semibold leading-[1.25] tracking-tight text-ink-pure min-h-[56px] [text-wrap:balance]">
          {question}
        </h3>
        <div className="h-12 w-20 shrink-0">
          <Sparkline points={sparkline} color={yesPct >= 50 ? "#00a868" : "#cf202f"} />
        </div>
      </Link>

      {/* Probability split */}
      <div className="mb-3 flex h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="bg-bull transition-all duration-700" style={{ width: `${yesPct}%` }} />
        <div className="bg-bear transition-all duration-700" style={{ width: `${noPct}%` }} />
      </div>

      {/* Buy buttons */}
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <Link href={`/market/${address}?side=YES`}
          className="group/btn flex items-center justify-between rounded-lg border border-ink-200 bg-paper-pure px-3 py-2 transition hover:border-bull hover:bg-bull hover:text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-bull group-hover/btn:text-white">
            Buy Yes
          </span>
          <span className="font-mono text-sm font-semibold text-ink-pure tabular group-hover/btn:text-white">
            {fmtPct(yesPct)}¢
          </span>
        </Link>
        <Link href={`/market/${address}?side=NO`}
          className="group/btn flex items-center justify-between rounded-lg border border-ink-200 bg-paper-pure px-3 py-2 transition hover:border-bear hover:bg-bear hover:text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-bear group-hover/btn:text-white">
            Buy No
          </span>
          <span className="font-mono text-sm font-semibold text-ink-pure tabular group-hover/btn:text-white">
            {fmtPct(noPct)}¢
          </span>
        </Link>
      </div>

      {/* Footer: volume */}
      <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-[11px]">
        <span className="flex items-center gap-1 text-ink-500">
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
            <path d="M2 11h10M2 11V5m0 6h4V7H2m10 4V3h-4v8M6 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Vol <span className="font-mono font-semibold text-ink-800 tabular">{fmtZkLTC(tvl)}</span>
        </span>
        <Link href={`/market/${address}`} className="font-semibold text-ink-500 opacity-0 transition group-hover:text-ink-pure group-hover:opacity-100">
          Trade →
        </Link>
      </div>
    </div>
  );
}

function categoryIcon(cat: string) {
  switch (cat) {
    case "Crypto":
      return { label: "₿", bg: "bg-amber-100", color: "text-amber-700 font-bold" };
    case "Launch":
      return { label: "▲", bg: "bg-blue-100", color: "text-blue-700 font-bold" };
    case "Policy":
      return { label: "§", bg: "bg-violet-100", color: "text-violet-700 font-bold" };
    case "Ecosystem":
      return { label: "◇", bg: "bg-emerald-100", color: "text-emerald-700 font-bold" };
    default:
      return { label: "●", bg: "bg-ink-100", color: "text-ink-700" };
  }
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80;
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
  const gradId = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w},${h} L 0,${h} Z`} fill={`url(#${gradId})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function generateSparkline(seed: string, endPoint: number): number[] {
  const n = 20;
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
  for (let i = n - 4; i < n; i++) {
    const t = (i - (n - 4)) / 3;
    out[i] = out[i] * (1 - t) + endPoint * t;
  }
  out[n - 1] = endPoint;
  return out;
}
