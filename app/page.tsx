"use client";

import { useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { MarketCard } from "@/components/MarketCard";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { TickerBar } from "@/components/TickerBar";
import { FaucetCard } from "@/components/FaucetCard";
import { PartnerTicker } from "@/components/PartnerTicker";
import { fmtZkLTC, inferCategory } from "@/lib/format";
import { useHiddenMarkets } from "@/lib/useHiddenMarkets";

const CATEGORIES = ["All", "Crypto", "Ecosystem", "Launch", "Policy", "General"] as const;
const SORT_OPTIONS = ["Trending", "Volume", "Ending Soon", "Newest"] as const;

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<string>("Trending");
  const { isHidden, mounted: hiddenMounted } = useHiddenMarkets();

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

  const { data: marketMeta } = useReadContracts({
    contracts: markets.flatMap((addr) => [
      { address: addr, abi: marketAbi, functionName: "question" },
      { address: addr, abi: marketAbi, functionName: "yesReserve" },
      { address: addr, abi: marketAbi, functionName: "noReserve" },
      { address: addr, abi: marketAbi, functionName: "resolutionTime" },
      { address: addr, abi: marketAbi, functionName: "resolved" },
    ]),
    query: { enabled: markets.length > 0 },
  });

  const marketInfo = useMemo(() => {
    if (!marketMeta) return [];
    const out: { address: `0x${string}`; question: string; tvl: bigint; endTime: number; resolved: boolean; category: string }[] = [];
    for (let i = 0; i < markets.length; i++) {
      const q = (marketMeta[i * 5]?.result as string) ?? "";
      const y = (marketMeta[i * 5 + 1]?.result as bigint) ?? 0n;
      const n = (marketMeta[i * 5 + 2]?.result as bigint) ?? 0n;
      const t = Number((marketMeta[i * 5 + 3]?.result as bigint) ?? 0n);
      const r = (marketMeta[i * 5 + 4]?.result as boolean) ?? false;
      out.push({
        address: markets[i], question: q, tvl: y < n ? y : n,
        endTime: t, resolved: r, category: inferCategory(q),
      });
    }
    return out;
  }, [marketMeta, markets]);

  const totalLiquidity = useMemo(() => marketInfo.reduce((acc, m) => acc + m.tvl, 0n), [marketInfo]);

  const filtered = useMemo(() => {
    let list = [...marketInfo];
    // Exclude hidden markets
    if (hiddenMounted) list = list.filter((m) => !isHidden(m.address));
    if (search) list = list.filter((m) => m.question.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") list = list.filter((m) => m.category === category);

    switch (sort) {
      case "Volume": list.sort((a, b) => (a.tvl < b.tvl ? 1 : -1)); break;
      case "Ending Soon":
        list = list.filter((m) => !m.resolved).sort((a, b) => a.endTime - b.endTime);
        break;
      case "Newest": list.reverse(); break;
      case "Trending":
      default:
        list.sort((a, b) => {
          if (a.resolved && !b.resolved) return 1;
          if (!a.resolved && b.resolved) return -1;
          return (b.tvl > a.tvl ? 1 : -1);
        });
    }
    return list;
  }, [marketInfo, search, category, sort, hiddenMounted, isHidden]);

  return (
    <>
      <Nav />
      <TickerBar />

      {/* Dense operational header */}
      <section className="border-b border-ink-200 bg-paper-off">
        <div className="mx-auto max-w-[1400px] px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tighter text-ink-pure">
                  Markets
                </h1>
                <span className="font-mono text-sm text-ink-500 tabular">
                  {count} active
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-ink-500">
                <span>
                  TVL <span className="font-mono font-semibold text-ink-800 tabular">{fmtZkLTC(totalLiquidity)} zkLTC</span>
                </span>
                <span className="h-3 w-px bg-ink-300" />
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-bull" />
                  LiteForge · Chain 4441
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search markets..."
                className="w-full rounded-lg border border-ink-200 bg-paper-pure py-2 pl-10 pr-3 text-sm placeholder:text-ink-400 focus:border-ink-pure focus:outline-none" />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === c
                      ? "bg-ink-pure text-paper-pure"
                      : "border border-ink-200 bg-paper-pure text-ink-700 hover:border-ink-pure"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="rounded-md border border-ink-200 bg-paper-pure px-2.5 py-1.5 text-xs font-semibold text-ink-pure focus:border-ink-pure focus:outline-none">
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
        <div className="mb-6">
          <FaucetCard />
        </div>
        {count === 0 ? <EmptyState /> : filtered.length === 0 ? <NoResults /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m, i) => (
              <div key={m.address} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                <MarketCard address={m.address} />
              </div>
            ))}
          </div>
        )}
      </section>

      <PartnerTicker />
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-paper-pure/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <Wordmark className="text-lg text-ink-pure" />
          <span className="ml-1 rounded border border-ink-300 bg-paper-off px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-ink-600">
            Testnet
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Markets</NavLink>
          <NavLink href="https://liteforge.hub.caldera.xyz" external>Faucet</NavLink>
          <NavLink href="https://docs.litvm.com" external>Docs</NavLink>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}

function NavLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      className="text-sm font-medium text-ink-700 transition hover:text-ink-pure">
      {children}
    </a>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-paper-off p-20 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 bg-paper-pure">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-ink-400">
          <path d="M12 8v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-semibold text-ink-pure">No markets yet</p>
      <p className="mt-2 text-sm text-ink-500">Markets will appear here once created.</p>
    </div>
  );
}

function NoResults() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-paper-off p-16 text-center">
      <p className="text-sm font-medium text-ink-pure">No markets match your filters</p>
      <p className="mt-1 text-xs text-ink-500">Try a different category or clear the search.</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-paper-pure py-8">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5 opacity-70" />
            <span>Silvercast v0.4 · Testnet</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://liteforge.explorer.caldera.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-ink-pure">
              Block Explorer ↗
            </a>
            <a href="https://docs.litvm.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink-pure">
              Docs ↗
            </a>
            <a href="https://builders.litvm.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink-pure">
              Builders ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
