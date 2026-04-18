"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { fmtPct } from "@/lib/format";

export function TickerBar() {
  const { data: length } = useReadContract({
    address: addresses.factory, abi: factoryAbi, functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  const { data: marketAddresses } = useReadContracts({
    contracts: Array.from({ length: count }).map((_, i) => ({
      address: addresses.factory, abi: factoryAbi, functionName: "allMarkets", args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });

  const markets = (marketAddresses ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((x): x is `0x${string}` => Boolean(x));

  const { data: marketData } = useReadContracts({
    contracts: markets.flatMap((addr) => [
      { address: addr, abi: marketAbi, functionName: "question" },
      { address: addr, abi: marketAbi, functionName: "yesPrice" },
    ]),
    query: { enabled: markets.length > 0 },
  });

  const items: { question: string; pct: number }[] = [];
  if (marketData) {
    for (let i = 0; i < marketData.length; i += 2) {
      const q = marketData[i]?.result as string;
      const price = (marketData[i + 1]?.result as bigint) ?? 0n;
      if (q) items.push({ question: q, pct: Number(price) / 1e16 });
    }
  }

  const displayItems = items.length > 0 ? items : [{ question: "No active markets", pct: 50 }];
  const loop = [...displayItems, ...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="overflow-hidden border-y border-ink-pure bg-ink-pure py-2.5">
      <div className="flex animate-ticker whitespace-nowrap">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Market</span>
            <span className="max-w-[280px] truncate text-sm text-paper-pure">{item.question}</span>
            <span className={`font-mono text-sm font-semibold tabular ${item.pct >= 50 ? "text-bull" : "text-bear"}`}>
              YES {fmtPct(item.pct)}%
            </span>
            <span className="text-ink-700">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
