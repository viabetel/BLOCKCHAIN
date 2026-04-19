"use client";

import { useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addresses, factoryAbi, marketAbi } from "@/lib/contracts";
import { MarketCard } from "@/components/MarketCard";
import { Logo, Wordmark } from "@/components/Logo";
import { TickerBar } from "@/components/TickerBar";
import { FaucetCard } from "@/components/FaucetCard";
import { PartnerTicker } from "@/components/PartnerTicker";
import { Hero } from "@/components/Hero";
import { AstronomicalJuice } from "@/components/AstronomicalJuice";
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

  // Filter visible markets
  const visible = useMemo(() => {
    let list = [...marketInfo];
    if (hiddenMounted) list = list.filter((m) => !isHidden(m.address));
    return list;
  }, [marketInfo, hiddenMounted, isHidden]);

  // Featured: top 3 by volume (non-resolved)
  const featured = useMemo(() => {
    return [...visible]
      .filter((m) => !m.resolved)
      .sort((a, b) => (a.tvl < b.tvl ? 1 : -1))
      .slice(0, 3);
  }, [visible]);

  const filtered = useMemo(() => {
    let list = [...visible];
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
  }, [visible, search, category, sort]);

  return (
    <>
      <Hero />
      <TickerBar />

      <AstronomicalJuice />

      {featured.length > 0 && <FeaturedSection markets={featured} />}

      <FaucetSection />

      <MarketsSection
        count={count}
        markets={filtered}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        totalLiquidity={totalLiquidity}
      />

      <HowItWorksSection />
      <WhyLimeroSection />
      <ProtocolStatsSection marketCount={count} totalLiquidity={totalLiquidity} />
      <PartnerTicker />
      <CTAFinalSection />
      <Footer />
    </>
  );
}

/* ============================================
   NAV
   ============================================ */
// Nav and NavLink removed — StickyHeader (imported) replaces them.

/* ============================================
   FEATURED MARKETS
   ============================================ */
function FeaturedSection({ markets }: { markets: { address: `0x${string}` }[] }) {
  return (
    <section className="border-b border-space-border bg-space py-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip chip-featured">Featured</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                High volume · actively traded
              </span>
            </div>
            <h2 className="mt-3 headline-display text-text-primary" style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}>
              Trending markets
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((m, i) => (
            <div key={m.address} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <MarketCard address={m.address} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAUCET STRIP
   ============================================ */
function FaucetSection() {
  return (
    <section className="border-b border-space-border bg-space-deep py-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <FaucetCard />
      </div>
    </section>
  );
}

/* ============================================
   MARKETS GRID
   ============================================ */
function MarketsSection({
  count, markets, search, setSearch, category, setCategory, sort, setSort, totalLiquidity,
}: any) {
  return (
    <section id="markets" className="border-b border-space-border bg-space py-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="headline-display text-text-primary" style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}>
                All markets
              </h2>
              <span className="font-mono text-sm text-text-muted tabular">{count} active</span>
            </div>
            <div className="mt-1.5 flex items-center gap-4 text-xs text-text-muted">
              <span>
                TVL <span className="font-mono font-semibold text-text-secondary tabular">{fmtZkLTC(totalLiquidity)} $LIME</span>
              </span>
              <span className="h-3 w-px bg-space-border" />
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                LiteForge · Chain 4441
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input type="text" value={search} onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Search markets..."
              className="w-full rounded-lg border border-space-border bg-space-surface py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/15" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  category === c
                    ? "bg-lime-500 text-space-deep shadow-lime-sm"
                    : "border border-space-border bg-space-surface text-text-secondary hover:border-space-border-hover hover:text-text-primary"
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">Sort</span>
            <select value={sort} onChange={(e: any) => setSort(e.target.value)}
              className="rounded-md border border-space-border bg-space-surface px-2.5 py-1.5 text-xs font-semibold text-text-primary focus:border-lime-500/50 focus:outline-none">
              {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {count === 0 ? <EmptyState /> : markets.length === 0 ? <NoResults /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {markets.map((m: any, i: number) => (
              <div key={m.address} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                <MarketCard address={m.address} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-space-border bg-space-surface/50 p-20 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-space-border bg-space-elevated">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-text-muted">
          <path d="M12 8v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-semibold text-text-primary">No markets yet</p>
      <p className="mt-2 text-sm text-text-muted">Markets will appear here once created.</p>
    </div>
  );
}

function NoResults() {
  return (
    <div className="rounded-2xl border border-dashed border-space-border bg-space-surface/50 p-16 text-center">
      <p className="text-sm font-medium text-text-primary">No markets match your filters</p>
      <p className="mt-1 text-xs text-text-muted">Try a different category or clear the search.</p>
    </div>
  );
}

/* ============================================
   HOW IT WORKS
   ============================================ */
function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "Pick a side",
      body: "Every market asks a yes-or-no question. Buy YES if you think it resolves true, NO if not. Price is the market's live probability.",
    },
    {
      n: "02",
      title: "Trade the price",
      body: "Prices move as traders buy in. If YES sits at 32%, you pay 0.32 $LIME per share. Sell anytime before resolution.",
    },
    {
      n: "03",
      title: "Oracle resolves",
      body: "At expiry, the oracle reports the outcome onchain. Liquidity providers and traders can immediately redeem.",
    },
    {
      n: "04",
      title: "Redeem 1:1",
      body: "Winning shares redeem 1 $LIME each. Losing shares go to zero. LPs get paid from the winning side.",
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-space-border bg-space-deep py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="chip chip-cat">Protocol</span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tighter text-text-primary sm:text-5xl">
            Four steps to a <span className="text-gradient-lime">settled outcome</span>.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
            Limero runs on a Fixed Product Market Maker. Each market holds a pool of YES and NO
            outcome tokens that settle 1:1 against $LIME once the oracle resolves.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="card-glass group rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-lime-300 tabular">{s.n}</span>
                <span className="h-px flex-1 ml-3 bg-space-border group-hover:bg-lime-500/30 transition" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-text-primary">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WHY LIMERO
   ============================================ */
function WhyLimeroSection() {
  const features = [
    {
      icon: "⟠",
      title: "Hard money settlement",
      body: "Every market is settled in $LIME, native to a chain secured by Litecoin proof-of-work — not corporate stablecoins.",
    },
    {
      icon: "◆",
      title: "Onchain proof",
      body: "Trades, resolutions, and payouts are verifiable on LitVM's block explorer. No hidden matching, no custody.",
    },
    {
      icon: "▲",
      title: "Trader-grade UX",
      body: "FPMM with instant pricing, limit-style outcome chips, deep liquidity provision, and real-time positions.",
    },
    {
      icon: "◇",
      title: "First on LitVM",
      body: "Native to LitVM's ecosystem from day one. Markets on Litecoin narratives, ETF flows, BTC dominance, and more.",
    },
  ];

  return (
    <section className="border-b border-space-border bg-space py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="chip chip-cat">Differentiators</span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tighter text-text-primary sm:text-5xl">
              Built for <span className="text-gradient-lime">serious traders</span>.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary">
            Polymarket settles in USDC. Kalshi settles in USD. Limero settles in the only onchain
            asset with fifteen years of PoW security. Betting conviction, denominated in hard money.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="card-glass rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-300 text-lg">
                {f.icon}
              </div>
              <h3 className="mb-2 font-display text-base font-semibold tracking-tight text-text-primary">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROTOCOL STATS
   ============================================ */
function ProtocolStatsSection({ marketCount, totalLiquidity }: { marketCount: number; totalLiquidity: bigint }) {
  return (
    <section className="border-b border-space-border bg-space-deep py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="chip chip-cat">Live onchain</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tighter text-text-primary sm:text-4xl">
            Protocol at a glance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBig label="Active markets" value={marketCount.toString()} />
          <StatBig label="Total liquidity" value={fmtZkLTC(totalLiquidity)} unit="$LIME" />
          <StatBig label="Chain" value="LiteForge" unit="4441" mono />
          <StatBig label="Trading fee" value="2.00" unit="% per trade" />
        </div>
      </div>
    </section>
  );
}

function StatBig({ label, value, unit, mono }: { label: string; value: string; unit?: string; mono?: boolean }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold tracking-tighter text-text-primary tabular ${mono ? "font-mono" : "font-display"}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

/* ============================================
   CTA FINAL
   ============================================ */
function CTAFinalSection() {
  return (
    <section className="cosmic-bg relative overflow-hidden border-b border-space-border py-24">
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <span className="chip chip-featured">Open beta · Testnet</span>
        <h2 className="mt-5 font-display text-5xl font-bold leading-[1.0] tracking-tightest text-text-primary sm:text-6xl [text-wrap:balance]">
          Trade the first <span className="text-gradient-lime">hard money</span> prediction market.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
          No real funds at risk. Claim 100 $LIME from the faucet, pick a market, and settle conviction onchain.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="#markets" className="btn-lime inline-flex items-center gap-2 rounded-xl px-7 py-4 text-sm">
            Start trading <span aria-hidden>→</span>
          </Link>
          <a href="https://docs.litvm.com" target="_blank" rel="noopener noreferrer"
            className="btn-ghost rounded-xl px-7 py-4 text-sm">
            Read LitVM docs
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
   ============================================ */
function Footer() {
  return (
    <footer className="bg-space-deep py-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <Wordmark className="text-base text-text-primary" />
            </div>
            <p className="mt-4 max-w-xs text-sm text-text-secondary">
              Hard money prediction markets. Settled onchain in $LIME, secured by Litecoin proof-of-work.
            </p>
          </div>
          <FooterCol title="Protocol">
            <FooterLink href="#markets">Markets</FooterLink>
            <FooterLink href="#how-it-works">How it works</FooterLink>
            <FooterLink href="https://liteforge.explorer.caldera.xyz" external>Block Explorer</FooterLink>
          </FooterCol>
          <FooterCol title="Developers">
            <FooterLink href="https://docs.litvm.com" external>LitVM Docs</FooterLink>
            <FooterLink href="https://builders.litvm.com" external>Builders Program</FooterLink>
            <FooterLink href="https://liteforge.hub.caldera.xyz" external>Native Faucet</FooterLink>
          </FooterCol>
          <FooterCol title="Status">
            <div className="text-xs text-text-muted">Chain ID</div>
            <div className="font-mono text-sm font-medium text-text-primary tabular">4441</div>
            <div className="mt-2 text-xs text-text-muted">Network</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Live
            </div>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-space-border pt-6 text-xs text-text-muted md:flex-row md:items-center">
          <span>© 2026 Limero Labs. Testnet deployment.</span>
          <span className="font-mono tabular">v0.7.0</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">{title}</div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      className="block text-text-secondary transition hover:text-text-primary">
      {children}
      {external && <span className="ml-0.5 text-text-muted">↗</span>}
    </a>
  );
}
