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

  const question = (data?.[0]?.result as string) ?? "…";
  const yesPrice = (data?.[1]?.result as bigint) ?? 0n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const yesReserve = (data?.[4]?.result as bigint) ?? 0n;
  const noReserve = (data?.[5]?.result as bigint) ?? 0n;

  const yesPct = Number(yesPrice) / 1e16; // 1e18 scale -> percent
  const noPct = 100 - yesPct;

  const tvl = yesReserve < noReserve ? yesReserve : noReserve;
  const deadline = new Date(Number(resolutionTime) * 1000);

  return (
    <div className="group rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-zinc-100">
          {question}
        </h3>
        {resolved && (
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
            Resolved
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>YES</span>
            <span className="font-mono text-emerald-400">
              {yesPct.toFixed(1)}¢
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-zinc-800">
            <div
              className="h-full bg-emerald-500/70"
              style={{ width: `${yesPct}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>NO</span>
            <span className="font-mono text-rose-400">{noPct.toFixed(1)}¢</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-zinc-800">
            <div
              className="h-full bg-rose-500/70"
              style={{ width: `${noPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>TVL: {Number(formatEther(tvl)).toFixed(2)} zkLTC</span>
        <span>
          {resolved
            ? "Ended"
            : `Ends ${deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
        </span>
      </div>
    </div>
  );
}
