"use client";

import { useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { marketAbi } from "@/lib/contracts";

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

  const question = (data?.[0]?.result as string) ?? "Loading…";
  const yesPrice = (data?.[1]?.result as bigint) ?? 0n;
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

  return (
    <article className="card group relative cursor-pointer overflow-hidden rounded-2xl p-6 transition">
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-x-0 -top-px mx-auto h-px w-1/3 bg-gradient-to-r from-transparent via-silver-300 to-transparent" />
      </div>

      {/* Status pill */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              resolved
                ? "bg-silver-500"
                : "bg-accent-bull shadow-[0_0_8px_rgba(63,185,129,0.4)]"
            }`}
          />
          <span className="text-[10px] uppercase tracking-[0.18em] text-silver-500">
            {resolved ? "Settled" : "Live market"}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-silver-500 tabular">
          {resolved ? "Ended" : daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
        </span>
      </div>

      {/* Question - editorial serif */}
      <h3 className="mb-6 font-display text-[22px] font-normal leading-[1.15] tracking-tighter text-silver-50 [text-wrap:balance]">
        {question}
      </h3>

      {/* Probability split */}
      <div className="space-y-2.5">
        <Row
          label="YES"
          pct={yesPct}
          color="bull"
          muted={resolved}
        />
        <Row
          label="NO"
          pct={noPct}
          color="bear"
          muted={resolved}
        />
      </div>

      {/* Footer metadata */}
      <div className="mt-6 flex items-center justify-between border-t border-silver-800/50 pt-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-silver-500">
            Liquidity
          </span>
          <span className="font-mono text-xs text-silver-200 tabular">
            {Number(formatEther(tvl)).toFixed(2)}
          </span>
          <span className="text-[10px] text-silver-500">zkLTC</span>
        </div>
        <span className="text-[11px] text-silver-400 transition group-hover:text-silver-200">
          Enter market →
        </span>
      </div>
    </article>
  );
}

function Row({
  label,
  pct,
  color,
  muted,
}: {
  label: string;
  pct: number;
  color: "bull" | "bear";
  muted?: boolean;
}) {
  const barColor =
    color === "bull" ? "bg-accent-bull" : "bg-accent-bear";
  const textColor =
    muted
      ? "text-silver-500"
      : color === "bull"
        ? "text-accent-bull"
        : "text-accent-bear";

  return (
    <div className="flex items-center gap-4">
      <span className="w-6 font-mono text-[10px] uppercase tracking-widest text-silver-400">
        {label}
      </span>
      <div className="prob-bar h-2 flex-1 rounded-full">
        <div
          className={`h-full rounded-full ${muted ? "bg-silver-700" : barColor} transition-all duration-700`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <span className={`w-14 text-right font-mono text-sm tabular ${textColor}`}>
        {pct.toFixed(1)}¢
      </span>
    </div>
  );
}
