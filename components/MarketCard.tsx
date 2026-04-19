"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { useMemo } from "react";
import { marketAbi } from "@/lib/contracts";
import { fmtPct, fmtZkLTC, fmtTimeLeft, inferCategory } from "@/lib/format";
import { TokensFromQuestion } from "@/components/TokenIcon";

export function MarketCard({ address, featured }: { address: `0x${string}`; featured?: boolean }) {
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

  // "Hot" when extreme probability OR ending soon
  const msLeft = deadline.getTime() - Date.now();
  const isHot = !resolved && (yesPct > 80 || yesPct < 20 || (msLeft > 0 && msLeft < 7 * 86_400_000));

  const cardClass = featured ? "card-featured" : "card-glass";

  return (
    <div className={`${cardClass} group relative flex h-full flex-col overflow-hidden rounded-2xl p-5`}>
      {/* Top: tokens + category + status */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <TokensFromQuestion question={question} size={24} />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted truncate">
              {category}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
              {resolved ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-text-muted" />
                  <span>Settled</span>
                </>
              ) : (
                <>
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-lime-400" />
                  <span className="font-mono tabular">{fmtTimeLeft(deadline)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {featured && <span className="chip chip-featured">Featured</span>}
          {isHot && !featured && <span className="chip chip-hot">Hot</span>}
        </div>
      </div>

      {/* Question + sparkline */}
      <Link href={`/market/${address}`} className="mb-4 flex items-start gap-3">
        <h3
          className="flex-1 font-display text-[16px] font-semibold leading-[1.25] text-text-primary min-h-[60px] [text-wrap:balance]"
          style={{ letterSpacing: "-0.015em" }}
        >
          {question}
        </h3>
        <div className="h-12 w-20 shrink-0">
          <Sparkline points={sparkline} color={yesPct >= 50 ? "#84cc16" : "#ef4444"} />
        </div>
      </Link>

      {/* Probability split — shimmered */}
      <div className="mb-3">
        <div className="flex h-2 overflow-hidden rounded-full bg-space-border shadow-inner">
          <div
            className={yesPct > 0 ? "prob-bar-yes transition-all duration-700" : ""}
            style={{ width: `${yesPct}%` }}
          />
          <div
            className={noPct > 0 ? "prob-bar-no transition-all duration-700" : ""}
            style={{ width: `${noPct}%` }}
          />
        </div>
      </div>

      {/* Outcome buttons */}
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <Link href={`/market/${address}?side=YES`}
          className="group/btn flex items-center justify-between rounded-lg border border-space-border bg-space-surface/40 px-3 py-2 transition hover:border-lime-500/50 hover:bg-lime-500/10 hover:shadow-[0_0_20px_-5px_rgba(132,204,22,0.3)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-lime-300">
            Buy Yes
          </span>
          <span className="font-mono text-sm font-bold text-text-primary tabular">
            {fmtPct(yesPct)}¢
          </span>
        </Link>
        <Link href={`/market/${address}?side=NO`}
          className="group/btn flex items-center justify-between rounded-lg border border-space-border bg-space-surface/40 px-3 py-2 transition hover:border-red-500/50 hover:bg-red-500/10 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">
            Buy No
          </span>
          <span className="font-mono text-sm font-bold text-text-primary tabular">
            {fmtPct(noPct)}¢
          </span>
        </Link>
      </div>

      {/* Footer - terminal style */}
      <div className="mt-auto flex items-center justify-between border-t border-space-border pt-3">
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase tracking-wider">
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
            <path d="M2 11h10M2 11V5m0 6h4V7H2m10 4V3h-4v8M6 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Vol <span className="font-mono font-semibold text-lime-300 tabular">{fmtZkLTC(tvl)}</span>
        </span>
        <Link href={`/market/${address}`} className="text-[10px] font-semibold uppercase tracking-wider text-text-muted opacity-0 transition group-hover:text-lime-300 group-hover:opacity-100">
          Trade →
        </Link>
      </div>
    </div>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80; const h = 48;
  const max = Math.max(...points); const min = Math.min(...points);
  const range = max - min || 1;
  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const gradId = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
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
