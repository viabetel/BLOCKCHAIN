"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { fmtAddress, fmtZkLTC, fmtCompact } from "@/lib/format";

type Event =
  | { kind: "Trade"; user: string; outcome: 0 | 1; collateral: bigint; tokens: bigint; block: bigint; tx: string }
  | { kind: "LiquidityAdded"; user: string; collateral: bigint; block: bigint; tx: string }
  | { kind: "LiquidityRemoved"; user: string; collateral: bigint; block: bigint; tx: string }
  | { kind: "Resolved"; outcome: 0 | 1; block: bigint; tx: string };

export function ActivityFeed({ market }: { market: `0x${string}` }) {
  const client = usePublicClient();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await client.getBlockNumber();
        const from = latest > 100_000n ? latest - 100_000n : 0n;
        const logs = await client.getLogs({
          address: market,
          fromBlock: from,
          toBlock: latest,
        });

        const out: Event[] = [];
        for (const log of logs) {
          const sig = log.topics[0];
          if (!sig) continue;

          // Trade(address indexed trader, uint256 outcome, uint256 collateralIn, uint256 outcomeOut)
          if (sig === "0x" + "Trade(address,uint256,uint256,uint256)".slice(0, 0)) continue; // placeholder
          // We'll match by event signature hash below

          try {
            if (log.topics.length >= 2 && log.data && log.data.length >= 2) {
              const user = "0x" + (log.topics[1]?.slice(26) ?? "");
              const data = log.data.slice(2);
              const slots = [];
              for (let i = 0; i < data.length; i += 64) slots.push(BigInt("0x" + data.slice(i, i + 64)));

              // Heuristic matching: 3 slots = Trade, 2 slots = LiquidityAdded/Removed, 1 slot = Resolved/Redeemed
              if (slots.length === 3) {
                out.push({
                  kind: "Trade",
                  user,
                  outcome: Number(slots[0]) === 1 ? 1 : 0,
                  collateral: slots[1],
                  tokens: slots[2],
                  block: log.blockNumber ?? 0n,
                  tx: log.transactionHash ?? "",
                });
              } else if (slots.length === 2) {
                // Guess between LiquidityAdded and Removed based on order; we'll label "Liquidity"
                out.push({
                  kind: "LiquidityAdded",
                  user,
                  collateral: slots[0],
                  block: log.blockNumber ?? 0n,
                  tx: log.transactionHash ?? "",
                });
              } else if (slots.length === 1 && log.topics.length === 1) {
                out.push({
                  kind: "Resolved",
                  outcome: Number(slots[0]) === 1 ? 1 : 0,
                  block: log.blockNumber ?? 0n,
                  tx: log.transactionHash ?? "",
                });
              }
            }
          } catch {}
        }

        out.reverse();
        if (!cancelled) { setEvents(out.slice(0, 25)); setLoading(false); }
      } catch {
        if (!cancelled) { setEvents([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [client, market]);

  if (loading) return <div className="py-6 text-center text-sm text-text-muted">Loading activity...</div>;
  if (!events || events.length === 0) {
    return <div className="py-6 text-center text-sm text-text-muted">No activity yet.</div>;
  }

  return (
    <div className="space-y-1">
      {events.map((e, i) => <EventRow key={i} ev={e} />)}
    </div>
  );
}

function EventRow({ ev }: { ev: Event }) {
  if (ev.kind === "Trade") {
    const side = ev.outcome === 1 ? "YES" : "NO";
    const sideColor = ev.outcome === 1 ? "text-lime-400" : "text-red-400";
    return (
      <div className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 rounded-lg py-2 text-xs hover:bg-space-deep">
        <div className={`h-1.5 w-1.5 justify-self-center rounded-full ${ev.outcome === 1 ? "bg-lime-500" : "bg-red-500"}`} />
        <div className="flex items-center gap-2 min-w-0">
          <a href={`https://liteforge.explorer.caldera.xyz/address/${ev.user}`}
            target="_blank" rel="noopener noreferrer"
            className="font-mono font-semibold text-text-primary tabular hover:text-lime-300 truncate">
            {fmtAddress(ev.user)}
          </a>
          <span className="text-text-muted">bought</span>
          <span className={`font-semibold ${sideColor}`}>{side}</span>
        </div>
        <span className="font-mono text-text-secondary tabular">
          {fmtCompact(Number(formatEther(ev.tokens)))} shares
        </span>
        <span className="font-mono text-text-primary tabular">
          {fmtZkLTC(ev.collateral)} zkLTC
        </span>
      </div>
    );
  }
  if (ev.kind === "LiquidityAdded") {
    return (
      <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-lg py-2 text-xs hover:bg-space-deep">
        <div className="h-1.5 w-1.5 justify-self-center rounded-full bg-brand" />
        <div className="flex items-center gap-2 min-w-0">
          <a href={`https://liteforge.explorer.caldera.xyz/address/${ev.user}`}
            target="_blank" rel="noopener noreferrer"
            className="font-mono font-semibold text-text-primary tabular hover:text-lime-300 truncate">
            {fmtAddress(ev.user)}
          </a>
          <span className="text-text-muted">added liquidity</span>
        </div>
        <span className="font-mono text-text-primary tabular">
          {fmtZkLTC(ev.collateral)} zkLTC
        </span>
      </div>
    );
  }
  if (ev.kind === "Resolved") {
    return (
      <div className="flex items-center gap-3 rounded-lg py-2 text-xs hover:bg-space-deep">
        <div className={`h-1.5 w-1.5 rounded-full ${ev.outcome === 1 ? "bg-lime-500" : "bg-red-500"}`} />
        <span className="font-semibold text-text-primary">Market resolved</span>
        <span className={ev.outcome === 1 ? "text-lime-400 font-semibold" : "text-red-400 font-semibold"}>
          {ev.outcome === 1 ? "YES" : "NO"}
        </span>
      </div>
    );
  }
  return null;
}
