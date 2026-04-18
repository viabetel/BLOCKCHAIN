"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { MarketCard } from "@/components/MarketCard";

export default function HomePage() {
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });

  const count = Number(length ?? 0n);

  const { data: marketAddresses } = useReadContracts({
    contracts: Array.from({ length: count }).map((_, i) => ({
      address: addresses.factory,
      abi: factoryAbi,
      functionName: "allMarkets",
      args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });

  const markets = (marketAddresses ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((x): x is `0x${string}` => Boolean(x));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-zinc-400">◈</span> Silvercast
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Hard money prediction markets · Denominated in zkLTC
          </p>
        </div>
        <ConnectButton />
      </header>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Open markets</h2>
          <span className="text-sm text-zinc-500">{count} total</span>
        </div>

        {count === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
            <p className="text-zinc-400">
              No markets yet. Deploy the factory and seed markets via{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs">
                forge script Deploy.s.sol
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {markets.map((addr) => (
              <Link key={addr} href={`/market/${addr}`}>
                <MarketCard address={addr} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-20 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
        <p>
          Built on LitVM LiteForge · Chain ID 4441 · Contracts are testnet only
        </p>
      </footer>
    </main>
  );
}
