"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { marketAbi } from "@/lib/contracts";
import { TradeBox } from "@/components/TradeBox";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo } from "@/components/Logo";

export default function MarketPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;

  const { data } = useReadContracts({
    contracts: [
      { address, abi: marketAbi, functionName: "question" },
      { address, abi: marketAbi, functionName: "yesPrice" },
      { address, abi: marketAbi, functionName: "resolutionTime" },
      { address, abi: marketAbi, functionName: "resolved" },
      { address, abi: marketAbi, functionName: "winningOutcome" },
      { address, abi: marketAbi, functionName: "yesReserve" },
      { address, abi: marketAbi, functionName: "noReserve" },
    ],
  });

  const question = (data?.[0]?.result as string) ?? "Loading…";
  const yesPrice = (data?.[1]?.result as bigint) ?? 0n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const winningOutcome = (data?.[4]?.result as bigint) ?? 0n;
  const yesReserve = (data?.[5]?.result as bigint) ?? 0n;
  const noReserve = (data?.[6]?.result as bigint) ?? 0n;

  const yesPct = Number(yesPrice) / 1e16;
  const noPct = 100 - yesPct;
  const deadline = new Date(Number(resolutionTime) * 1000);
  const tvl = yesReserve < noReserve ? yesReserve : noReserve;
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
  );

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-30" />

      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-silver-900/80 bg-ink-0/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-silver-400 transition hover:text-silver-100"
            >
              <Logo className="h-6 w-6" />
              <span className="font-display text-base font-normal tracking-tight">
                Silvercast
              </span>
              <span className="hidden text-xs text-silver-600 sm:inline">
                / Market
              </span>
            </Link>
            <ConnectButton />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10">
          {/* Breadcrumb + status */}
          <div className="animate-fade-up mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-silver-500 transition hover:text-silver-200"
            >
              ← All markets
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  resolved
                    ? "bg-silver-500"
                    : "bg-accent-bull shadow-[0_0_8px_rgba(63,185,129,0.5)]"
                }`}
              />
              <span className="text-[10px] uppercase tracking-[0.2em] text-silver-400">
                {resolved ? "Settled" : "Live"}
              </span>
            </div>
          </div>

          {/* Question */}
          <h1
            className="animate-fade-up mb-10 max-w-4xl font-display text-4xl font-normal leading-[1.05] tracking-tighter text-silver-50 sm:text-5xl lg:text-6xl [text-wrap:balance]"
            style={{ animationDelay: "0.05s" }}
          >
            {question}
          </h1>

          {/* Main grid: market data + trade box */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT: Price, probability, info */}
            <div
              className="animate-fade-up space-y-6"
              style={{ animationDelay: "0.1s" }}
            >
              <PriceDisplay
                yesPct={yesPct}
                noPct={noPct}
                resolved={resolved}
                winningOutcome={winningOutcome}
              />

              <ProbabilityVisual
                yesPct={yesPct}
                noPct={noPct}
                resolved={resolved}
                winningOutcome={winningOutcome}
              />

              <MetadataGrid
                resolutionTime={deadline}
                daysLeft={daysLeft}
                tvl={tvl}
                resolved={resolved}
                address={address}
              />

              {resolved && (
                <ResolvedBanner winningOutcome={winningOutcome} />
              )}
            </div>

            {/* RIGHT: Trade panel */}
            <div
              className="animate-fade-up lg:sticky lg:top-24 lg:self-start"
              style={{ animationDelay: "0.2s" }}
            >
              <TradeBox market={address} resolved={resolved} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PriceDisplay({
  yesPct,
  noPct,
  resolved,
  winningOutcome,
}: {
  yesPct: number;
  noPct: number;
  resolved: boolean;
  winningOutcome: bigint;
}) {
  return (
    <div className="card rounded-2xl p-8">
      <div className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
        Current Market Price
      </div>
      <div className="mt-4 grid grid-cols-2 gap-8">
        <PriceCol
          label="YES"
          pct={yesPct}
          color="bull"
          won={resolved && winningOutcome === 1n}
          lost={resolved && winningOutcome !== 1n}
        />
        <PriceCol
          label="NO"
          pct={noPct}
          color="bear"
          won={resolved && winningOutcome === 0n}
          lost={resolved && winningOutcome !== 0n}
        />
      </div>
    </div>
  );
}

function PriceCol({
  label,
  pct,
  color,
  won,
  lost,
}: {
  label: string;
  pct: number;
  color: "bull" | "bear";
  won?: boolean;
  lost?: boolean;
}) {
  const accent =
    color === "bull" ? "text-accent-bull" : "text-accent-bear";
  const mutedClass = lost ? "opacity-40" : "";

  return (
    <div className={mutedClass}>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-xs font-medium tracking-widest ${color === "bull" ? "text-accent-bull" : "text-accent-bear"}`}
        >
          {label}
        </span>
        {won && (
          <span className="rounded border border-accent-bull/30 bg-accent-bull/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-accent-bull">
            Won
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`font-display text-6xl font-normal tracking-tightest tabular ${accent}`}
        >
          {pct.toFixed(1)}
        </span>
        <span className="text-xl text-silver-400">¢</span>
      </div>
      <div className="mt-1 text-xs text-silver-500">
        Pays 1 zkLTC if {label.toLowerCase()}
      </div>
    </div>
  );
}

function ProbabilityVisual({
  yesPct,
  noPct,
  resolved,
  winningOutcome,
}: {
  yesPct: number;
  noPct: number;
  resolved: boolean;
  winningOutcome: bigint;
}) {
  const yesWon = resolved && winningOutcome === 1n;
  const noWon = resolved && winningOutcome === 0n;

  return (
    <div className="card rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
          Implied probability
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-silver-500">
          Live
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-ink-200">
        <div
          className={`h-full transition-all duration-700 ${
            resolved
              ? yesWon
                ? "bg-accent-bull"
                : "bg-silver-700"
              : "bg-accent-bull"
          }`}
          style={{ width: `${yesPct}%` }}
        />
        <div
          className={`absolute top-0 right-0 h-full transition-all duration-700 ${
            resolved
              ? noWon
                ? "bg-accent-bear"
                : "bg-silver-700"
              : "bg-accent-bear"
          }`}
          style={{ width: `${noPct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span className="font-mono text-silver-300 tabular">
          YES {yesPct.toFixed(2)}%
        </span>
        <span className="font-mono text-silver-300 tabular">
          NO {noPct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function MetadataGrid({
  resolutionTime,
  daysLeft,
  tvl,
  resolved,
  address,
}: {
  resolutionTime: Date;
  daysLeft: number;
  tvl: bigint;
  resolved: boolean;
  address: `0x${string}`;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetaCell
        label="Resolves"
        value={resolved ? "Settled" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
        sub={resolutionTime.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      />
      <MetaCell
        label="Liquidity"
        value={Number(formatEther(tvl)).toFixed(2)}
        sub="zkLTC"
      />
      <MetaCell label="Fee" value="2.00" sub="% per trade" />
      <MetaCell
        label="Contract"
        value={`${address.slice(0, 6)}…${address.slice(-4)}`}
        sub={
          <a
            href={`https://liteforge.explorer.caldera.xyz/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-silver-200"
          >
            View on explorer ↗
          </a>
        }
      />
    </div>
  );
}

function MetaCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="card rounded-xl px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-base text-silver-100 tabular">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-silver-500">{sub}</div>
    </div>
  );
}

function ResolvedBanner({ winningOutcome }: { winningOutcome: bigint }) {
  const yesWon = winningOutcome === 1n;
  return (
    <div
      className={`rounded-2xl border p-5 ${
        yesWon
          ? "border-accent-bull/20 bg-accent-bull/5"
          : "border-accent-bear/20 bg-accent-bear/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-2 w-2 rounded-full ${
            yesWon ? "bg-accent-bull" : "bg-accent-bear"
          }`}
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-silver-400">
          Final outcome
        </span>
      </div>
      <p className="mt-3 text-silver-100">
        Market resolved{" "}
        <span
          className={`font-semibold ${
            yesWon ? "text-accent-bull" : "text-accent-bear"
          }`}
        >
          {yesWon ? "YES" : "NO"}
        </span>
        . Winners can redeem their tokens 1:1 for zkLTC below.
      </p>
    </div>
  );
}
