"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { marketAbi } from "@/lib/contracts";
import { TradeBox } from "@/components/TradeBox";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { useMemo } from "react";

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

  const question = (data?.[0]?.result as string) ?? "Loading...";
  const yesPrice = (data?.[1]?.result as bigint) ?? 50n * 10n ** 16n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const winningOutcome = (data?.[4]?.result as bigint) ?? 0n;
  const yesReserve = (data?.[5]?.result as bigint) ?? 0n;
  const noReserve = (data?.[6]?.result as bigint) ?? 0n;

  const yesPct = Number(yesPrice) / 1e16;
  const noPct = 100 - yesPct;
  const deadline = new Date(Number(resolutionTime) * 1000);
  const tvl = yesReserve < noReserve ? yesReserve : noReserve;
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000));
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 3_600_000));

  const chart = useMemo(() => generateChart(address, yesPct), [address, yesPct]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-paper-pure/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <Wordmark className="text-lg text-ink-pure" />
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition hover:text-ink-pure"
        >
          <span>←</span> All markets
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT column */}
          <div className="animate-fade-up space-y-6">
            {/* Status row */}
            <div className="flex items-center gap-3">
              {resolved ? (
                <span className="chip chip-settled">Settled</span>
              ) : (
                <span className="chip chip-live">
                  <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
                  Live
                </span>
              )}
              <span className="text-xs text-ink-500">
                Resolves{" "}
                <span className="font-mono font-semibold text-ink-800 tabular">
                  {deadline.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>

            {/* Question */}
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink-pure sm:text-5xl lg:text-6xl [text-wrap:balance]">
              {question}
            </h1>

            {/* Big price display */}
            <div className="rounded-2xl border border-ink-200 bg-paper-pure p-6">
              <div className="grid grid-cols-2 gap-6">
                <PriceBlock
                  label="YES"
                  pct={yesPct}
                  color="bull"
                  won={resolved && winningOutcome === 1n}
                  lost={resolved && winningOutcome !== 1n}
                />
                <PriceBlock
                  label="NO"
                  pct={noPct}
                  color="bear"
                  won={resolved && winningOutcome === 0n}
                  lost={resolved && winningOutcome !== 0n}
                />
              </div>

              {/* Split probability bar */}
              <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="bg-bull transition-all duration-700" style={{ width: `${yesPct}%` }} />
                <div className="bg-bear transition-all duration-700" style={{ width: `${noPct}%` }} />
              </div>
            </div>

            {/* Price chart */}
            <div className="rounded-2xl border border-ink-200 bg-paper-pure p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
                    YES price history
                  </div>
                  <div className="mt-1 font-mono text-xs text-ink-500">
                    Last 24 hours
                  </div>
                </div>
                <div className="flex gap-1 text-[11px] font-medium">
                  {(["1H", "1D", "1W", "ALL"] as const).map((t, i) => (
                    <button
                      key={t}
                      className={`rounded-md px-2 py-1 transition ${
                        i === 1
                          ? "bg-ink-pure text-paper-pure"
                          : "text-ink-500 hover:text-ink-pure"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Chart points={chart} resolved={resolved} winningOutcome={winningOutcome} />
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetaCell
                label="Ends in"
                value={resolved ? "Ended" : daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
              />
              <MetaCell
                label="Liquidity"
                value={Number(formatEther(tvl)).toFixed(2)}
                unit="zkLTC"
              />
              <MetaCell label="Fee" value="2.00" unit="%" />
              <MetaCell
                label="Contract"
                value={`${address.slice(0, 6)}...${address.slice(-4)}`}
                link={`https://liteforge.explorer.caldera.xyz/address/${address}`}
              />
            </div>

            {resolved && <ResolvedBanner winningOutcome={winningOutcome} />}
          </div>

          {/* RIGHT column - Trade box */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TradeBox market={address} resolved={resolved} yesPct={yesPct} />
          </div>
        </div>
      </main>
    </>
  );
}

function PriceBlock({
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
  const colorText = color === "bull" ? "text-bull" : "text-bear";
  const dim = lost ? "opacity-30" : "";

  return (
    <div className={dim}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${colorText}`}>
          {label}
        </span>
        {won && (
          <span className="rounded border border-bull/30 bg-bull-light px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-bull-dark">
            Won
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-display text-6xl font-bold tracking-tightest tabular ${colorText}`}>
          {pct.toFixed(1)}
        </span>
        <span className="text-2xl font-medium text-ink-400">¢</span>
      </div>
      <div className="mt-1 text-xs text-ink-500">
        Pays 1 zkLTC if {label.toLowerCase()} wins
      </div>
    </div>
  );
}

function Chart({
  points,
  resolved,
  winningOutcome,
}: {
  points: number[];
  resolved: boolean;
  winningOutcome: bigint;
}) {
  const w = 720;
  const h = 200;
  const padX = 8;
  const padY = 16;

  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (w - padX * 2));
  const ys = points.map((p) => padY + (1 - p / 100) * (h - padY * 2));

  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${xs[xs.length - 1]},${h} L ${xs[0]},${h} Z`;

  const lastPct = points[points.length - 1];
  const lineColor = resolved
    ? winningOutcome === 1n
      ? "#00a868"
      : "#cf202f"
    : lastPct >= 50
      ? "#00a868"
      : "#cf202f";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines at 25/50/75 */}
      {[25, 50, 75].map((v) => {
        const y = padY + (1 - v / 100) * (h - padY * 2);
        return (
          <g key={v}>
            <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="#e5e5e5" strokeDasharray="2 4" strokeWidth="1" />
            <text x={w - padX} y={y - 4} textAnchor="end" className="fill-ink-400" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* Area + line */}
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={path} stroke={lineColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill={lineColor} />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="8" fill={lineColor} opacity="0.2" />
    </svg>
  );
}

function MetaCell({
  label,
  value,
  unit,
  link,
}: {
  label: string;
  value: string;
  unit?: string;
  link?: string;
}) {
  const content = (
    <>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-mono text-base font-semibold text-ink-pure tabular">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-ink-500">{unit}</span>}
        {link && <span className="text-xs text-ink-400">↗</span>}
      </div>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-ink-200 bg-paper-pure px-4 py-3 transition hover:border-ink-pure"
      >
        {content}
      </a>
    );
  }
  return (
    <div className="rounded-xl border border-ink-200 bg-paper-pure px-4 py-3">
      {content}
    </div>
  );
}

function ResolvedBanner({ winningOutcome }: { winningOutcome: bigint }) {
  const yesWon = winningOutcome === 1n;
  return (
    <div
      className={`rounded-2xl border p-5 ${
        yesWon ? "border-bull/30 bg-bull-light" : "border-bear/30 bg-bear-light"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${yesWon ? "bg-bull" : "bg-bear"}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-700">
          Final outcome
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-ink-pure">
        Market resolved{" "}
        <span className={`font-bold ${yesWon ? "text-bull-dark" : "text-bear-dark"}`}>
          {yesWon ? "YES" : "NO"}
        </span>
        . Winners can redeem their shares 1:1 for zkLTC.
      </p>
    </div>
  );
}

function generateChart(seed: string, endPoint: number): number[] {
  const n = 60;
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;

  let v = 50 + ((h & 0x1f) - 16);
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) & 0xffffff;
    const step = ((h & 0xff) / 255 - 0.5) * 6;
    v = Math.max(8, Math.min(92, v + step));
    out.push(v);
  }
  // Smooth toward current price on last 10%
  const tail = Math.floor(n * 0.1);
  for (let i = n - tail; i < n; i++) {
    const t = (i - (n - tail)) / (tail - 1);
    out[i] = out[i] * (1 - t) + endPoint * t;
  }
  out[n - 1] = endPoint;
  return out;
}
