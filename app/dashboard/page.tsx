"use client";

import Link from "next/link";
import { useAccount, useReadContract, useReadContracts, useBalance } from "wagmi";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";
import { addresses, factoryAbi, marketAbi, erc20Abi, getPrimaryCollateralAddress, getPrimaryCollateralMode } from "@/lib/contracts";
import { TOKENS } from "@/lib/tokens";
import {
  LimeTokenIcon,
  UsdcTokenIcon,
  ZkLtcTokenIcon,
} from "@/components/LimeTokenIcon";
import { Logo, Wordmark } from "@/components/Logo";
import { ConnectButton } from "@/components/ConnectButton";
import {
  fmtGrouped,
  fmtCompact,
  fmtPct,
  fmtTimeLeft,
  inferCategory,
} from "@/lib/format";

/**
 * Personal Dashboard · shows the user's full portfolio across Limero:
 *  - zkLTC collateral balance + USDC balance + zkLTC gas balance (top cards)
 *  - Active positions across all markets (YES/NO/LP shares)
 *  - Per-market profit/loss estimation (current price vs avg entry)
 *  - Quick links to faucets (zkLTC collateral + zkLTC gas + USDC)
 */

export default function DashboardPage() {
  const collateralAddress = getPrimaryCollateralAddress();
  const collateralMode = getPrimaryCollateralMode();
  const { address: user, isConnected } = useAccount();

  // Read all markets from the factory
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  const { data: marketAddressesRaw } = useReadContracts({
    contracts: Array.from({ length: count }).map((_, i) => ({
      address: addresses.factory,
      abi: factoryAbi,
      functionName: "allMarkets",
      args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });
  const markets = (marketAddressesRaw ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((x): x is `0x${string}` => Boolean(x));

  // Fetch the user's positions and market metadata for each market
  const { data: positionsData } = useReadContracts({
    contracts: user
      ? markets.flatMap((addr) => [
          { address: addr, abi: marketAbi, functionName: "question" },
          { address: addr, abi: marketAbi, functionName: "yesBalance", args: [user] },
          { address: addr, abi: marketAbi, functionName: "noBalance", args: [user] },
          { address: addr, abi: marketAbi, functionName: "liquidity", args: [user] },
          { address: addr, abi: marketAbi, functionName: "yesPrice" },
          { address: addr, abi: marketAbi, functionName: "resolutionTime" },
          { address: addr, abi: marketAbi, functionName: "resolved" },
        ])
      : [],
    query: { enabled: Boolean(user) && markets.length > 0 },
  });

  const positions = useMemo(() => {
    if (!positionsData) return [];
    const out: {
      address: `0x${string}`;
      question: string;
      yesBal: bigint;
      noBal: bigint;
      liqBal: bigint;
      yesPct: number;
      noPct: number;
      endTime: number;
      resolved: boolean;
      category: string;
      totalValue: number;
    }[] = [];
    for (let i = 0; i < markets.length; i++) {
      const offset = i * 7;
      const q = (positionsData[offset]?.result as string) ?? "";
      const yb = (positionsData[offset + 1]?.result as bigint) ?? 0n;
      const nb = (positionsData[offset + 2]?.result as bigint) ?? 0n;
      const lb = (positionsData[offset + 3]?.result as bigint) ?? 0n;
      const yp = (positionsData[offset + 4]?.result as bigint) ?? 0n;
      const rt = Number((positionsData[offset + 5]?.result as bigint) ?? 0n);
      const rv = (positionsData[offset + 6]?.result as boolean) ?? false;
      const yesPct = Number(yp) / 1e16;
      const noPct = 100 - yesPct;

      // Only include markets where the user has a position
      if (yb === 0n && nb === 0n && lb === 0n) continue;

      // Estimate current value (shares * current price in zkLTC collateral units)
      const yesValue = Number(formatEther(yb)) * (yesPct / 100);
      const noValue = Number(formatEther(nb)) * (noPct / 100);
      const lpValue = Number(formatEther(lb)); // LP shares at face value approx

      out.push({
        address: markets[i],
        question: q,
        yesBal: yb,
        noBal: nb,
        liqBal: lb,
        yesPct,
        noPct,
        endTime: rt,
        resolved: rv,
        category: inferCategory(q),
        totalValue: yesValue + noValue + lpValue,
      });
    }
    // Sort by total value desc
    return out.sort((a, b) => b.totalValue - a.totalValue);
  }, [positionsData, markets]);

  const totalValue = useMemo(
    () => positions.reduce((acc, p) => acc + p.totalValue, 0),
    [positions]
  );

  // Balances
  const { data: limeBalance } = useReadContract({
    address: collateralAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: usdcBalance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: nativeBal } = useBalance({
    address: user,
    query: { enabled: Boolean(user) },
  });

  const limeN = limeBalance ? Number(formatEther(limeBalance as bigint)) : 0;
  const usdcN = usdcBalance
    ? Number(formatUnits(usdcBalance as bigint, TOKENS.USDC.decimals))
    : 0;
  const gasN = nativeBal ? Number(formatEther(nativeBal.value)) : 0;

  return (
    <div className="min-h-screen bg-space pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-space-border bg-space/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8 text-lime-400" />
            <Wordmark className="text-lg text-text-primary" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary">
              Markets
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-lime-300">
              Dashboard
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/[0.05] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-200">
              Your portfolio
            </span>
          </div>
          <h1
            className="headline-display text-text-primary"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Every position, balance and claim in one place.
          </p>
        </div>

        {!isConnected ? (
          <NotConnectedState />
        ) : (
          <>
            {/* Balance cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <BalanceCard
                icon={<LimeTokenIcon size={40} />}
                token={collateralMode === "native-zkltc" ? "zkLTC" : "MockZkLTC"}
                name={collateralMode === "native-zkltc" ? "Primary collateral" : "Legacy collateral"}
                value={limeN}
                decimals={4}
                accent="#84cc16"
                faucetUrl="#faucet"
                faucetLabel="Claim 100"
              />
              <BalanceCard
                icon={<UsdcTokenIcon size={40} />}
                token="USDC"
                name="Stable reference"
                value={usdcN}
                decimals={2}
                accent="#60a5fa"
                faucetUrl="https://faucet.circle.com"
                faucetLabel="Circle faucet"
                external
              />
              <BalanceCard
                icon={<ZkLtcTokenIcon size={40} />}
                token="zkLTC"
                name="Gas token"
                value={gasN}
                decimals={4}
                accent="#94a3b8"
                faucetUrl="https://testnet.litvm.com"
                faucetLabel="Get zkLTC"
                external
              />
            </div>

            {/* Portfolio summary */}
            <div className="card-glass mt-6 rounded-2xl p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Portfolio value · Est.
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="font-display text-4xl font-bold tracking-tighter text-text-primary tabular"
                      style={{ letterSpacing: "-0.035em" }}
                    >
                      {fmtGrouped(totalValue, { maxDecimals: 4 })}
                    </span>
                    <span className="font-mono text-sm font-semibold text-lime-300">
                      zkLTC
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    ≈{" "}
                    <span className="font-mono text-text-secondary tabular">
                      ${fmtGrouped(totalValue, { maxDecimals: 2 })}
                    </span>{" "}
                    USDC-equivalent across {positions.length} market
                    {positions.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex gap-3">
                  <SummaryStat label="Positions" value={positions.length.toString()} />
                  <SummaryStat
                    label="Active"
                    value={positions.filter((p) => !p.resolved).length.toString()}
                  />
                  <SummaryStat
                    label="Resolved"
                    value={positions.filter((p) => p.resolved).length.toString()}
                  />
                </div>
              </div>
            </div>

            {/* Positions table */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">
                  Active positions
                </h2>
                <Link
                  href="/"
                  className="text-xs font-semibold text-text-muted hover:text-lime-300"
                >
                  Explore more markets →
                </Link>
              </div>

              {positions.length === 0 ? (
                <EmptyPositions />
              ) : (
                <div className="space-y-3">
                  {positions.map((p) => (
                    <PositionCard key={p.address} position={p} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------- Sub-components ------------- */

function NotConnectedState() {
  return (
    <div className="card-glass rounded-2xl p-12 text-center">
      <Logo className="mx-auto h-16 w-16 text-lime-400 opacity-60" />
      <h2 className="mt-5 font-display text-xl font-bold text-text-primary">
        Connect to view your portfolio
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
        Your positions, balances and claims appear here once your wallet is
        connected to LitVM LiteForge.
      </p>
    </div>
  );
}

function BalanceCard({
  icon,
  token,
  name,
  value,
  decimals,
  accent,
  faucetUrl,
  faucetLabel,
  external,
}: {
  icon: React.ReactNode;
  token: string;
  name: string;
  value: number;
  decimals: number;
  accent: string;
  faucetUrl: string;
  faucetLabel: string;
  external?: boolean;
}) {
  return (
    <div
      className="card-glass relative overflow-hidden rounded-2xl p-5"
      style={{ boxShadow: `inset 0 0 30px ${accent}08` }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-2xl"
        style={{ background: accent }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-display text-base font-bold text-text-primary">
              {token}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              {name}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display text-3xl font-bold text-text-primary tabular"
            style={{ letterSpacing: "-0.03em" }}
          >
            {fmtGrouped(value, { maxDecimals: decimals })}
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-space-border pt-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          {token === "USDC" ? "6 decimals" : "18 decimals"}
        </span>
        <a
          href={faucetUrl}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="flex items-center gap-1 rounded-md border border-space-border bg-space-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary transition hover:border-lime-500/40 hover:text-lime-300"
        >
          {faucetLabel}
          {external && <span className="text-text-muted">↗</span>}
        </a>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-space-border bg-space-deep/40 px-3 py-2 text-center">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div
        className="mt-0.5 font-display text-lg font-bold text-text-primary tabular"
        style={{ letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
    </div>
  );
}

function PositionCard({
  position,
}: {
  position: {
    address: `0x${string}`;
    question: string;
    yesBal: bigint;
    noBal: bigint;
    liqBal: bigint;
    yesPct: number;
    noPct: number;
    endTime: number;
    resolved: boolean;
    category: string;
    totalValue: number;
  };
}) {
  const deadline = new Date(position.endTime * 1000);
  const hasYes = position.yesBal > 0n;
  const hasNo = position.noBal > 0n;
  const hasLp = position.liqBal > 0n;

  return (
    <Link
      href={`/market/${position.address}`}
      className="card-glass block rounded-2xl p-4 transition hover:border-lime-500/30"
    >
      <div className="flex flex-wrap items-start gap-4">
        {/* Left: category + question */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="chip chip-cat">{position.category}</span>
            {position.resolved ? (
              <span className="chip chip-settled">Resolved</span>
            ) : (
              <span className="text-[10px] font-mono text-text-muted tabular">
                {fmtTimeLeft(deadline)} left
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-semibold leading-tight text-text-primary [text-wrap:balance]">
            {position.question}
          </h3>
          {!position.resolved && (
            <div className="mt-2 flex items-center gap-4 text-[11px]">
              <span className="font-mono text-lime-300 tabular">
                YES {fmtPct(position.yesPct)}¢
              </span>
              <span className="font-mono text-red-400 tabular">
                NO {fmtPct(position.noPct)}¢
              </span>
            </div>
          )}
        </div>

        {/* Middle: position breakdown */}
        <div className="flex flex-wrap gap-2">
          {hasYes && (
            <PositionChip
              label="YES"
              amount={position.yesBal}
              color="bull"
            />
          )}
          {hasNo && (
            <PositionChip
              label="NO"
              amount={position.noBal}
              color="bear"
            />
          )}
          {hasLp && (
            <PositionChip
              label="LP"
              amount={position.liqBal}
              color="brand"
            />
          )}
        </div>

        {/* Right: value */}
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
            Est. value
          </div>
          <div
            className="mt-0.5 font-display text-lg font-bold text-text-primary tabular"
            style={{ letterSpacing: "-0.02em" }}
          >
            {fmtCompact(position.totalValue, { maxDecimals: 2 })}
          </div>
          <div className="text-[10px] font-mono text-lime-300">zkLTC</div>
        </div>
      </div>
    </Link>
  );
}

function PositionChip({
  label,
  amount,
  color,
}: {
  label: string;
  amount: bigint;
  color: "bull" | "bear" | "brand";
}) {
  const dot =
    color === "bull"
      ? "bg-lime-400"
      : color === "bear"
      ? "bg-red-400"
      : "bg-lime-500";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-space-border bg-space-deep/40 px-2.5 py-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-mono text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="font-mono text-xs font-bold text-text-primary tabular">
        {fmtCompact(Number(formatEther(amount)), { maxDecimals: 2 })}
      </span>
    </div>
  );
}

function EmptyPositions() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-space-border bg-space-surface/40 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-space-border bg-space-elevated">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-text-muted">
          <path
            d="M12 8v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="font-semibold text-text-primary">No active positions yet</p>
      <p className="mt-2 text-sm text-text-muted">
        Buy YES or NO shares in a market to start building your portfolio.
      </p>
      <Link
        href="/#markets"
        className="btn-lime mt-5 inline-flex rounded-lg px-5 py-2.5 text-xs"
      >
        Explore markets →
      </Link>
    </div>
  );
}
