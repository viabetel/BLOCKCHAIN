"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { useMemo } from "react";
import { marketAbi } from "@/lib/contracts";
import { fmtPct, fmtZkLTC, fmtTimeLeft, inferCategory } from "@/lib/format";

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

  return (
    <div className="card-paper group relative flex h-full flex-col overflow-hidden rounded-xl p-4">
      {/* Top: category + status */}
      <div className="mb-3 flex items-center justify-between">
        <span className="chip chip-cat">{category}</span>
        {resolved ? (
          <span className="chip chip-settled">Settled</span>
        ) : (
          <span className="chip chip-live">
            <span className="h-1 w-1 animate-pulse-dot rounded-full bg-bull" />
            Live
          </span>
        )}
      </div>

      {/* Question + sparkline row */}
      <Link href={`/market/${address}`} className="mb-4 flex items-start gap-3">
        <h3 className="flex-1 font-display text-[15px] font-semibold leading-[1.3] tracking-tight text-ink-pure min-h-[56px] [text-wrap:balance]">
          {question}
        </h3>
        <div className="h-12 w-20 shrink-0">
          <Sparkline points={sparkline} color={yesPct >= 50 ? "#00a868" : "#cf202f"} />
        </div>
      </Link>

      {/* Price split */}
      <div className="mb-4 flex h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="bg-bull transition-all duration-700" style={{ width: `${yesPct}%` }} />
        <div className="bg-bear transition-all duration-700" style={{ width: `${noPct}%` }} />
      </div>

      {/* Inline buy buttons */}
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

      {/* Footer metadata */}
      <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-[11px]">
        <span className="text-ink-500">
          Vol <span className="font-mono font-semibold text-ink-800 tabular">{fmtZkLTC(tvl)}</span>
        </span>
        <span className="text-ink-500">
          Ends <span className="font-mono font-semibold text-ink-800 tabular">{resolved ? "—" : fmtTimeLeft(deadline)}</span>
        </span>
      </div>
    </div>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80; const h = 48;
  const max = Math.max(...points); const min = Math.min(...points);
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
