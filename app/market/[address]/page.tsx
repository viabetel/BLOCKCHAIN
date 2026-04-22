"use client";

import { useReadContracts, usePublicClient } from "wagmi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { marketAbi, getPrimaryCollateralMode } from "@/lib/contracts";
import { TradeBox } from "@/components/TradeBox";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { PriceChart } from "@/components/PriceChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { fmtPct, fmtZkLTC, fmtTimeLeft, fmtAddress, inferCategory } from "@/lib/format";
import { TokenIcon, TokensFromQuestion } from "@/components/TokenIcon";

type Tab = "Overview" | "Activity" | "Holders" | "Rules";

export default function MarketPage({ params }: { params: { address: string } }) {
  const collateralMode = getPrimaryCollateralMode();
  const address = params.address as `0x${string}`;
  const searchParams = useSearchParams();
  const initialSide = searchParams.get("side") === "NO" ? "NO" : "YES";
  const [tab, setTab] = useState<Tab>("Overview");

  const { data } = useReadContracts({
    contracts: [
      { address, abi: marketAbi, functionName: "question" },
      { address, abi: marketAbi, functionName: "yesPrice" },
      { address, abi: marketAbi, functionName: "resolutionTime" },
      { address, abi: marketAbi, functionName: "resolved" },
      { address, abi: marketAbi, functionName: "winningOutcome" },
      { address, abi: marketAbi, functionName: "yesReserve" },
      { address, abi: marketAbi, functionName: "noReserve" },
      { address, abi: marketAbi, functionName: "oracle" },
      { address, abi: marketAbi, functionName: "totalLiquidity" },
    ],
  });

  const question = (data?.[0]?.result as string) ?? "Loading...";
  const yesPrice = (data?.[1]?.result as bigint) ?? 50n * 10n ** 16n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const winningOutcome = (data?.[4]?.result as bigint) ?? 0n;
  const yesReserve = (data?.[5]?.result as bigint) ?? 0n;
  const noReserve = (data?.[6]?.result as bigint) ?? 0n;
  const oracle = (data?.[7]?.result as string) ?? "";

  const yesPct = Number(yesPrice) / 1e16;
  const noPct = 100 - yesPct;
  const deadline = new Date(Number(resolutionTime) * 1000);
  const tvl = yesReserve < noReserve ? yesReserve : noReserve;
  const category = useMemo(() => inferCategory(question), [question]);

  const TABS: Tab[] = ["Overview", "Activity", "Holders", "Rules"];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-space-border bg-space/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <Wordmark className="text-lg text-text-primary" />
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-text-muted">
          <Link href="/" className="transition hover:text-text-primary">Limero</Link>
          <span>/</span>
          <span>{category}</span>
          <span>/</span>
          <span className="font-mono tabular text-text-secondary">{fmtAddress(address)}</span>
        </div>

        {/* Title row */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2">
              {resolved ? (
                <span className="chip chip-settled">Settled</span>
              ) : (
                <span className="chip chip-live">
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-lime-500" />Live
                </span>
              )}
              <span className="text-xs text-text-muted">
                Resolves <span className="font-mono font-semibold text-text-secondary tabular">
                  {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span> · <span className="font-mono font-semibold text-text-secondary tabular">{fmtTimeLeft(deadline)}</span>
              </span>
            </div>
            <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tighter text-text-primary sm:text-4xl [text-wrap:balance]">
              {question}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <TokensFromQuestion question={question} size={18} />
              </div>
              <Metric label="Vol" value={`${fmtZkLTC(tvl)} zkLTC`} />
              <Metric label="Liquidity" value={`${fmtZkLTC(tvl)} zkLTC`} />
              <Metric label="Fee" value="2.00%" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT column */}
          <div className="animate-fade-up space-y-5">
            {/* BIG CHART + price */}
            <div className="rounded-xl border border-space-border bg-space">
              {/* Price header */}
              <div className="border-b border-space-border p-5">
                <div className="flex items-end justify-between gap-6">
                  <div className="flex gap-6">
                    <PriceLabel label="YES" pct={yesPct} color="bull"
                      won={resolved && winningOutcome === 1n}
                      lost={resolved && winningOutcome !== 1n} />
                    <PriceLabel label="NO" pct={noPct} color="bear"
                      won={resolved && winningOutcome === 0n}
                      lost={resolved && winningOutcome !== 0n} />
                  </div>
                  <div className="flex gap-0.5 rounded-lg border border-space-border bg-space-deep/40 p-0.5 text-[11px] font-semibold">
                    {["1H", "1D", "1W", "ALL"].map((t, i) => (
                      <button key={t} className={`rounded-md px-3 py-1.5 transition ${
                        i === 1
                          ? "bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/30"
                          : "text-text-muted hover:text-text-primary"
                      }`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="p-5">
                <PriceChart
                  seed={address}
                  yesPct={yesPct}
                  resolved={resolved}
                  winningOutcome={winningOutcome}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-space-border bg-space">
              <div className="flex items-center border-b border-space-border px-4">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`tab-btn ${tab === t ? "active" : ""}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "Overview" && (
                  <OverviewTab
                    question={question} deadline={deadline} oracle={oracle}
                    tvl={tvl} address={address} resolved={resolved}
                    winningOutcome={winningOutcome} collateralMode={collateralMode}
                  />
                )}
                {tab === "Activity" && (
                  <ActivityFeed market={address} />
                )}
                {tab === "Holders" && (
                  <HoldersTab market={address} />
                )}
                {tab === "Rules" && (
                  <RulesTab
                    question={question} oracle={oracle} deadline={deadline} address={address} collateralMode={collateralMode}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TradeBox market={address} resolved={resolved} yesPct={yesPct} initialSide={initialSide} />
          </div>
        </div>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono font-semibold text-text-primary tabular">{value}</span>
    </span>
  );
}

function PriceLabel({ label, pct, color, won, lost }: {
  label: string; pct: number; color: "bull" | "bear"; won?: boolean; lost?: boolean;
}) {
  const ct = color === "bull" ? "text-lime-400" : "text-red-400";
  const dim = lost ? "opacity-25" : "";
  return (
    <div className={dim}>
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${ct}`}>{label}</span>
        {won && <span className="rounded border border-lime-500/30 bg-lime-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-lime-300">Won</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-0.5">
        <span className={`font-display text-4xl font-bold tracking-tightest tabular ${ct}`}>
          {fmtPct(pct)}
        </span>
        <span className="text-lg font-medium text-text-muted">¢</span>
      </div>
    </div>
  );
}

function OverviewTab({ question, deadline, oracle, tvl, address, resolved, winningOutcome, collateralMode }: {
  question: string; deadline: Date; oracle: string; tvl: bigint;
  address: `0x${string}`; resolved: boolean; winningOutcome: bigint; collateralMode: "native-zkltc" | "legacy-mock";
}) {
  return (
    <div className="space-y-5">
      {resolved && (
        <div className={`rounded-lg border p-4 ${winningOutcome === 1n ? "border-lime-500/30 bg-lime-500/10" : "border-red-500/30 bg-red-500/10"}`}>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${winningOutcome === 1n ? "bg-lime-500" : "bg-red-500"}`} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Final outcome</span>
          </div>
          <p className="mt-2 text-sm font-medium text-text-primary">
            Market resolved <span className={`font-bold ${winningOutcome === 1n ? "text-lime-300" : "text-red-300"}`}>
              {winningOutcome === 1n ? "YES" : "NO"}
            </span>. Winners can redeem shares 1:1 for {collateralMode === "native-zkltc" ? "zkLTC" : "legacy MockZkLTC"} collateral.
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Market Description
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {question} This market resolves YES if the condition stated in the question is met at
          or before the resolution time. Otherwise, it resolves NO. Both YES and NO outcomes are
          tradable as outcome shares priced between 0 and 1 {collateralMode === "native-zkltc" ? "zkLTC" : "MockZkLTC"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCell label="Ends" value={fmtTimeLeft(deadline)} />
        <MetaCell label="Liquidity" value={fmtZkLTC(tvl)} unit={collateralMode === "native-zkltc" ? "zkLTC" : "MockZkLTC"} />
        <MetaCell label="Fee" value="2.00" unit="%" />
        <MetaCell label="Contract" value={fmtAddress(address)}
          link={`https://liteforge.explorer.caldera.xyz/address/${address}`} />
      </div>

      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Resolution
        </h3>
        <div className="grid gap-2 rounded-lg bg-space-deep p-4 text-xs sm:grid-cols-2">
          <InfoRow label="Oracle" value={fmtAddress(oracle)}
            link={`https://liteforge.explorer.caldera.xyz/address/${oracle}`} />
          <InfoRow label="Resolution time" value={deadline.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} />
          <InfoRow label="Market type" value="Binary FPMM" />
          <InfoRow label="Settlement asset" value={collateralMode === "native-zkltc" ? "zkLTC" : "Legacy MockZkLTC"} />
        </div>
      </div>
    </div>
  );
}

function HoldersTab({ market }: { market: `0x${string}` }) {
  const client = usePublicClient();
  const [holders, setHolders] = useState<{ addr: string; yes: bigint; no: bigint; lp: bigint }[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    (async () => {
      try {
        // Pull unique addresses from all historical Trade + LiquidityAdded events
        const latest = await client.getBlockNumber();
        const from = latest > 100_000n ? latest - 100_000n : 0n;
        const logs = await client.getLogs({
          address: market,
          fromBlock: from,
          toBlock: latest,
        });

        const uniq = new Set<string>();
        for (const log of logs) {
          if (log.topics[1]) {
            const addr = "0x" + log.topics[1].slice(26);
            uniq.add(addr.toLowerCase());
          }
        }

        if (uniq.size === 0) {
          if (!cancelled) { setHolders([]); setLoading(false); }
          return;
        }

        // Read YES/NO/LP balance for each
        const addrs = [...uniq].slice(0, 25) as `0x${string}`[];
        const calls = addrs.flatMap((a) => [
          { address: market, abi: marketAbi, functionName: "yesBalance" as const, args: [a] },
          { address: market, abi: marketAbi, functionName: "noBalance" as const, args: [a] },
          { address: market, abi: marketAbi, functionName: "liquidity" as const, args: [a] },
        ]);
        const results = await client.multicall({ contracts: calls });

        const out: { addr: string; yes: bigint; no: bigint; lp: bigint }[] = [];
        for (let i = 0; i < addrs.length; i++) {
          const yes = (results[i * 3]?.result as bigint) ?? 0n;
          const no = (results[i * 3 + 1]?.result as bigint) ?? 0n;
          const lp = (results[i * 3 + 2]?.result as bigint) ?? 0n;
          if (yes > 0n || no > 0n || lp > 0n) {
            out.push({ addr: addrs[i], yes, no, lp });
          }
        }
        out.sort((a, b) => {
          const aT = a.yes + a.no + a.lp;
          const bT = b.yes + b.no + b.lp;
          return bT > aT ? 1 : -1;
        });
        if (!cancelled) { setHolders(out); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setHolders([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [client, market]);

  if (loading) {
    return <div className="py-6 text-center text-sm text-text-muted">Loading holders...</div>;
  }
  if (!holders || holders.length === 0) {
    return <div className="py-6 text-center text-sm text-text-muted">No holders yet.</div>;
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-[1fr_80px_80px_80px] gap-2 border-b border-space-border pb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        <span>Address</span>
        <span className="text-right">YES</span>
        <span className="text-right">NO</span>
        <span className="text-right">LP</span>
      </div>
      <div className="divide-y divide-space-border">
        {holders.slice(0, 10).map((h) => (
          <div key={h.addr} className="grid grid-cols-[1fr_80px_80px_80px] gap-2 py-2.5 text-xs">
            <a href={`https://liteforge.explorer.caldera.xyz/address/${h.addr}`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono font-semibold text-text-primary tabular hover:text-lime-300">
              {fmtAddress(h.addr)}
            </a>
            <span className="text-right font-mono tabular text-lime-400">{fmtZkLTC(h.yes)}</span>
            <span className="text-right font-mono tabular text-red-400">{fmtZkLTC(h.no)}</span>
            <span className="text-right font-mono tabular text-lime-300">{fmtZkLTC(h.lp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesTab({ question, oracle, deadline, address, collateralMode }: {
  question: string; oracle: string; deadline: Date; address: `0x${string}`; collateralMode: "native-zkltc" | "legacy-mock";
}) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Question
        </h4>
        <p className="text-text-primary">{question}</p>
      </div>
      <div>
        <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Resolution Criteria
        </h4>
        <p className="leading-relaxed text-text-secondary">
          This market resolves YES if the condition in the question is verifiably true at or
          before the resolution time. Otherwise, it resolves NO. The oracle address listed below
          is responsible for posting the final outcome on-chain after the resolution time has passed.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoLine label="Oracle" value={fmtAddress(oracle)}
          link={`https://liteforge.explorer.caldera.xyz/address/${oracle}`} />
        <InfoLine label="Resolution time"
          value={deadline.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })} />
        <InfoLine label="Market address" value={fmtAddress(address)}
          link={`https://liteforge.explorer.caldera.xyz/address/${address}`} />
        <InfoLine label="Settlement asset" value={collateralMode === "native-zkltc" ? "zkLTC on LiteForge" : "legacy MockZkLTC on LiteForge"} />
      </div>
      <div className="rounded-lg border border-space-border bg-space-deep p-3 text-xs text-text-secondary">
        <strong className="text-text-primary">Testnet notice:</strong> This market runs on LiteForge
        testnet with a manually-resolved oracle. In production (mainnet), oracles will be
        replaced by UMA's Optimistic Oracle for decentralized resolution.
      </div>
    </div>
  );
}

function MetaCell({ label, value, unit, link }: { label: string; value: string; unit?: string; link?: string }) {
  const inner = (
    <>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-base font-semibold text-text-primary tabular">{value}</span>
        {unit && <span className="text-xs font-medium text-text-muted">{unit}</span>}
        {link && <span className="text-xs text-text-muted">↗</span>}
      </div>
    </>
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer"
        className="rounded-lg border border-space-border bg-space-deep px-3 py-2.5 transition hover:border-lime-500/40 hover:bg-space">{inner}</a>
    );
  }
  return <div className="rounded-lg border border-space-border bg-space-deep px-3 py-2.5">{inner}</div>;
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold text-text-primary tabular hover:text-lime-300">
          {value} ↗
        </a>
      ) : (
        <span className="font-mono font-semibold text-text-primary tabular">{value}</span>
      )}
    </div>
  );
}

function InfoLine({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="rounded-lg border border-space-border bg-space-deep p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1 block font-mono text-sm font-semibold text-text-primary tabular hover:text-lime-300">
          {value} ↗
        </a>
      ) : (
        <div className="mt-1 font-mono text-sm font-semibold text-text-primary tabular">{value}</div>
      )}
    </div>
  );
}
