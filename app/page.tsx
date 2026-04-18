"use client";

import { useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { MarketCard } from "@/components/MarketCard";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { TickerBar } from "@/components/TickerBar";
import { PartnersSection } from "@/components/PartnersSection";
import { HowItWorks } from "@/components/HowItWorks";

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
    <>
      <Nav />
      <TickerBar />
      <Hero />
      <StatsBar marketCount={count} totalLiquidity={totalLiquidity} />
      <MarketsSection count={count} markets={markets} />
      <HowItWorks />
      <PartnersSection />
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-paper-pure/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <Wordmark className="text-lg text-ink-pure" />
          <span className="ml-2 rounded border border-ink-300 bg-paper-off px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-ink-600">
            Testnet
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="#markets">Markets</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="https://liteforge.hub.caldera.xyz" external>
            Faucet
          </NavLink>
          <NavLink href="https://docs.litvm.com" external>
            Docs
          </NavLink>
        </nav>

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
      className="text-sm font-medium text-ink-700 transition hover:text-ink-pure"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-ink-200 bg-paper-off px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-700">
            Live on LitVM LiteForge
          </span>
        </div>

        <h1
          className="animate-fade-up mt-6 max-w-5xl font-display text-[56px] font-semibold leading-[0.95] tracking-tightest text-ink-pure sm:text-[80px] lg:text-[104px] [text-wrap:balance]"
          style={{ animationDelay: "0.05s" }}
        >
          Trade the future.
          <br />
          <span className="text-brand">In hard money.</span>
        </h1>

        <p
          className="animate-fade-up mt-8 max-w-2xl text-lg leading-relaxed text-ink-600"
          style={{ animationDelay: "0.1s" }}
        >
          Binary prediction markets settled in zkLTC. Built on LitVM, Litecoin's
          first EVM rollup. Every contract backed by proof-of-work security.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "0.15s" }}
        >
          <a href="#markets" className="btn-ink rounded-lg px-6 py-3 text-sm">
            Explore markets
          </a>
          <a
            href="#how-it-works"
            className="btn-outline rounded-lg px-6 py-3 text-sm"
          >
            How it works
          </a>
          <div className="ml-2 flex items-center gap-2 text-xs text-ink-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-300 bg-paper-off font-mono text-[10px] font-semibold">
              i
            </span>
            <span>Testnet only. No real funds at risk.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar({
  marketCount,
  totalLiquidity,
}: {
  marketCount: number;
  totalLiquidity: bigint;
}) {
  return (
    <section className="border-b border-ink-200 bg-paper-pure">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-ink-200 md:grid-cols-4">
        <Stat label="Active Markets" value={marketCount.toString()} />
        <Stat
          label="Total Liquidity"
          value={Number(formatEther(totalLiquidity)).toFixed(2)}
          unit="zkLTC"
        />
        <Stat label="Chain" value="4441" unit="LiteForge" />
        <Stat label="Fee" value="2.00" unit="% per trade" />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold tracking-tighter text-ink-pure tabular">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-ink-500">{unit}</span>
        )}
      </div>
    </div>
  );
}

function MarketsSection({
  count,
  markets,
}: {
  count: number;
  markets: `0x${string}`[];
}) {
  return (
    <section id="markets" className="bg-paper-off py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 flex items-end justify-between border-b border-ink-200 pb-5">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-500">
              Order book
            </div>
            <h2 className="mt-1 font-display text-4xl font-semibold tracking-tighter text-ink-pure">
              Active markets
            </h2>
          </div>
          <div className="hidden items-center gap-5 text-xs font-medium md:flex">
            <FilterChip active>All</FilterChip>
            <FilterChip>Crypto</FilterChip>
            <FilterChip>Ecosystem</FilterChip>
            <FilterChip>Launch</FilterChip>
          </div>
        </div>

        {count === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((addr, i) => (
              <Link
                key={addr}
                href={`/market/${addr}`}
                className="animate-fade-up"
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              >
                <MarketCard address={addr} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-ink-pure text-paper-pure"
          : "text-ink-600 hover:text-ink-pure"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-paper-pure p-20 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 bg-paper-off">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-ink-400">
          <path
            d="M12 8v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="font-semibold text-ink-pure">No active markets</p>
      <p className="mt-2 text-sm text-ink-500">
        New markets are created through the factory contract.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-paper-pure py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <Wordmark className="text-base text-ink-pure" />
            </div>
            <p className="mt-4 max-w-sm text-sm text-ink-600">
              Hard money prediction markets. Settled onchain in zkLTC, secured by
              Litecoin's proof-of-work.
            </p>
          </div>

          <FooterCol title="Protocol">
            <FooterLink href="#markets">Markets</FooterLink>
            <FooterLink href="#how-it-works">How it works</FooterLink>
            <FooterLink href="https://liteforge.explorer.caldera.xyz" external>
              Block Explorer
            </FooterLink>
          </FooterCol>

          <FooterCol title="Developers">
            <FooterLink href="https://docs.litvm.com" external>
              LitVM Docs
            </FooterLink>
            <FooterLink href="https://builders.litvm.com" external>
              Builders Program
            </FooterLink>
            <FooterLink href="https://liteforge.hub.caldera.xyz" external>
              Faucet
            </FooterLink>
          </FooterCol>

          <FooterCol title="Network">
            <div className="text-xs text-ink-500">Chain ID</div>
            <div className="font-mono text-sm font-medium text-ink-pure tabular">
              4441
            </div>
            <div className="mt-3 text-xs text-ink-500">Status</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink-pure">
              <span className="h-1.5 w-1.5 rounded-full bg-bull" />
              Live
            </div>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-500 md:flex-row md:items-center">
          <span>© 2026 Silvercast. Testnet deployment.</span>
          <span className="font-mono tabular">v0.3.0</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({
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
      className="block text-ink-700 transition hover:text-ink-pure"
    >
      {children}
      {external && <span className="ml-0.5 text-ink-400">↗</span>}
    </a>
  );
}
