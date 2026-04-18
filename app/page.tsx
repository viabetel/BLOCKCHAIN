"use client";

import { useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { MarketCard } from "@/components/MarketCard";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo } from "@/components/Logo";

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

  // Aggregate liquidity across all markets
  const { data: liquidityData } = useReadContracts({
    contracts: markets.flatMap((addr) => [
      { address: addr, abi: marketAbi, functionName: "yesReserve" },
      { address: addr, abi: marketAbi, functionName: "noReserve" },
    ]),
    query: { enabled: markets.length > 0 },
  });

  let totalLiquidity = 0n;
  if (liquidityData) {
    for (let i = 0; i < liquidityData.length; i += 2) {
      const y = (liquidityData[i]?.result as bigint) ?? 0n;
      const n = (liquidityData[i + 1]?.result as bigint) ?? 0n;
      totalLiquidity += y < n ? y : n;
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient grid background */}
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[600px] bg-gradient-to-b from-silver-500/[0.04] to-transparent" />

      <div className="relative">
        <Nav />

        <main className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-10">
          <Hero />

          <StatsStrip
            marketCount={count}
            totalLiquidity={totalLiquidity}
          />

          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between border-b border-silver-800/60 pb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
                  Order Book
                </div>
                <h2 className="mt-1 font-display text-3xl font-normal tracking-tighter text-silver-50">
                  Active markets
                </h2>
              </div>
              <div className="hidden items-center gap-6 text-xs text-silver-400 md:flex">
                <Legend dot="bg-accent-bull" label="Live" />
                <Legend dot="bg-silver-500" label="Settled" />
              </div>
            </div>

            {count === 0 ? (
              <EmptyState />
            ) : (
              <div
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                style={{ animationDelay: "0.2s" }}
              >
                {markets.map((addr, i) => (
                  <Link
                    key={addr}
                    href={`/market/${addr}`}
                    className="animate-fade-up"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <MarketCard address={addr} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-silver-900/80 bg-ink-0/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-normal tracking-tight text-silver-50">
            Silvercast
          </span>
          <span className="ml-2 rounded border border-silver-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-silver-400">
            Testnet
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="#markets">Markets</NavLink>
          <NavLink href="https://docs.litvm.com" external>
            Docs
          </NavLink>
          <NavLink
            href="https://liteforge.hub.caldera.xyz"
            external
          >
            Faucet
          </NavLink>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
}

function NavLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-sm text-silver-300 transition hover:text-silver-50"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section className="pt-12 lg:pt-20">
      <div
        className="animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-silver-800/80 bg-ink-100/60 px-3 py-1 backdrop-blur">
          <span className="h-1 w-1 rounded-full bg-accent-bull shadow-[0_0_6px_rgba(63,185,129,0.6)]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-silver-300">
            Live on LitVM LiteForge
          </span>
        </div>
      </div>

      <h1
        className="animate-fade-up max-w-5xl font-display text-[56px] font-normal leading-[0.95] tracking-tightest text-silver-50 sm:text-[72px] lg:text-[96px] [text-wrap:balance]"
        style={{ animationDelay: "0.1s" }}
      >
        Trade the future.
        <br />
        <span className="text-silver-grad">Priced in silver.</span>
      </h1>

      <p
        className="animate-fade-up mt-8 max-w-2xl text-lg leading-relaxed text-silver-300"
        style={{ animationDelay: "0.2s" }}
      >
        Binary prediction markets on Litecoin's first EVM rollup. Every
        contract denominated in zkLTC — hard money meets programmable liquidity.
      </p>

      <div
        className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
        style={{ animationDelay: "0.3s" }}
      >
        <Link
          href="#markets"
          className="btn-primary rounded-lg px-5 py-2.5 text-sm"
        >
          Explore markets
        </Link>
        <a
          href="https://liteforge.hub.caldera.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary rounded-lg px-5 py-2.5 text-sm"
        >
          Get testnet zkLTC
        </a>
      </div>
    </section>
  );
}

function StatsStrip({
  marketCount,
  totalLiquidity,
}: {
  marketCount: number;
  totalLiquidity: bigint;
}) {
  return (
    <section
      id="markets"
      className="animate-fade-up mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-silver-800/60 bg-silver-800/60 md:grid-cols-4"
      style={{ animationDelay: "0.4s" }}
    >
      <StatCell label="Active Markets" value={marketCount.toString()} />
      <StatCell
        label="Total Liquidity"
        value={Number(formatEther(totalLiquidity)).toFixed(2)}
        unit="zkLTC"
      />
      <StatCell label="Network" value="LiteForge" unit="Chain 4441" />
      <StatCell label="Fee per trade" value="2.00" unit="%" />
    </section>
  );
}

function StatCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-ink-50 px-6 py-6">
      <div className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl font-normal tracking-tighter text-silver-50 tabular">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-silver-400 tabular">{unit}</span>
        )}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="uppercase tracking-widest text-[10px]">{label}</span>
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-silver-800 bg-ink-50/50 p-16 text-center">
      <div className="mx-auto mb-4 h-10 w-10 rounded-full border border-silver-700 bg-ink-100/80" />
      <p className="text-silver-300">No active markets.</p>
      <p className="mt-2 text-sm text-silver-500">
        Markets will appear here as they are created via the factory contract.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-silver-900 pt-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5 opacity-60" />
          <span className="font-display text-sm text-silver-400">
            Silvercast
          </span>
          <span className="text-[11px] text-silver-600">
            — Hard money, programmable futures.
          </span>
        </div>
        <div className="flex items-center gap-8 text-[11px] uppercase tracking-widest text-silver-500">
          <a
            href="https://docs.litvm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-silver-200"
          >
            Documentation
          </a>
          <a
            href="https://liteforge.explorer.caldera.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-silver-200"
          >
            Explorer
          </a>
          <span>v0.2 · Testnet</span>
        </div>
      </div>
    </footer>
  );
}
