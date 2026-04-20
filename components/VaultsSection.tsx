"use client";

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { addresses, vaultAbi, erc20Abi } from "@/lib/contracts";
import { LimeTokenIcon, UsdcTokenIcon } from "@/components/LimeTokenIcon";
import { fmtGrouped, formatInputAsGrouped, parseGroupedInput, fmtCompact } from "@/lib/format";

/**
 * Vaults section · LIME Vault + USDC Vault.
 * Shows TVL, share price, APY (approximate), user position.
 * Depositing mints vault shares that appreciate as markets accrue fees.
 */
export function VaultsSection() {
  return (
    <section
      id="vaults"
      className="relative overflow-hidden border-y border-space-border bg-space-deep py-20 lg:py-24"
    >
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[20%] h-96 w-96 rounded-full bg-lime-500/[0.04] blur-3xl" />
        <div className="absolute right-[10%] bottom-[10%] h-96 w-96 rounded-full bg-blue-500/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/[0.06] px-3 py-1.5">
              <span className="h-1 w-1 rounded-full bg-lime-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-200">
                Yield vaults
              </span>
            </div>
            <h2
              className="headline-display text-text-primary"
              style={{ fontSize: "clamp(34px, 4.2vw, 60px)" }}
            >
              Deposit once. <span className="text-gradient-lime">Earn everywhere.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Each vault auto-distributes your deposit as liquidity across every
              active market. Collect a share of trading fees without picking
              sides. Withdraw anytime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="terminal-pill">2% FEE SHARE</span>
            <span className="terminal-pill">WITHDRAW ANYTIME</span>
          </div>
        </div>

        {/* Vaults grid */}
        <div className="grid gap-5 md:grid-cols-2">
          <VaultCard
            vaultAddress={addresses.limeVault}
            underlyingAddress={addresses.collateral}
            tokenSymbol="LIME"
            tokenName="Limero Token"
            decimals={18}
            icon={<LimeTokenIcon size={48} />}
            accent="#84cc16"
            description="Native collateral vault. Best for fast onboarding via faucet."
          />
          <VaultCard
            vaultAddress={addresses.usdcVault}
            underlyingAddress={addresses.usdc}
            tokenSymbol="USDC"
            tokenName="USD Coin"
            decimals={6}
            icon={<UsdcTokenIcon size={48} />}
            accent="#60a5fa"
            description="Stable reference vault. Bridge USDC via Arbitrum."
          />
        </div>

        {/* How it works strip */}
        <div className="mt-8 grid gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 md:grid-cols-4">
          <HowStep
            n="01"
            title="Deposit"
            body="Send LIME or USDC to the vault. Receive vault shares."
          />
          <HowStep
            n="02"
            title="Auto-routed"
            body="Vault capital backs liquidity across active markets."
          />
          <HowStep
            n="03"
            title="Fees accrue"
            body="Every trade pays 2%. Your share price rises."
          />
          <HowStep
            n="04"
            title="Withdraw"
            body="Burn shares anytime, receive principal + fees."
          />
        </div>
      </div>
    </section>
  );
}

/* ----------- Vault card ----------- */

function VaultCard({
  vaultAddress,
  underlyingAddress,
  tokenSymbol,
  tokenName,
  decimals,
  icon,
  accent,
  description,
}: {
  vaultAddress: `0x${string}` | "";
  underlyingAddress: `0x${string}`;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  icon: React.ReactNode;
  accent: string;
  description: string;
}) {
  const { address: user, isConnected } = useAccount();
  const [action, setAction] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const deployed = Boolean(vaultAddress && vaultAddress.length === 42);

  // Read vault state (only if deployed)
  const { data: vaultReads } = useReadContracts({
    contracts: deployed
      ? [
          { address: vaultAddress as `0x${string}`, abi: vaultAbi, functionName: "totalAssets" },
          { address: vaultAddress as `0x${string}`, abi: vaultAbi, functionName: "totalShares" },
          { address: vaultAddress as `0x${string}`, abi: vaultAbi, functionName: "sharePrice" },
        ]
      : [],
    query: { enabled: deployed },
  });

  const { data: userReads, refetch: refetchUser } = useReadContracts({
    contracts: deployed && user
      ? [
          { address: vaultAddress as `0x${string}`, abi: vaultAbi, functionName: "sharesOf", args: [user] },
          { address: underlyingAddress, abi: erc20Abi, functionName: "balanceOf", args: [user] },
          { address: underlyingAddress, abi: erc20Abi, functionName: "allowance", args: [user, vaultAddress as `0x${string}`] },
        ]
      : [],
    query: { enabled: deployed && Boolean(user) },
  });

  const totalAssets = (vaultReads?.[0]?.result as bigint) ?? 0n;
  const totalShares = (vaultReads?.[1]?.result as bigint) ?? 0n;
  const sharePrice = (vaultReads?.[2]?.result as bigint) ?? 10n ** 18n;
  const userShares = (userReads?.[0]?.result as bigint) ?? 0n;
  const userBal = (userReads?.[1]?.result as bigint) ?? 0n;
  const allowance = (userReads?.[2]?.result as bigint) ?? 0n;

  const totalAssetsN = Number(formatUnits(totalAssets, decimals));
  const userSharesN = Number(formatUnits(userShares, decimals));
  const userBalN = Number(formatUnits(userBal, decimals));
  const userAssetValue = (userSharesN * Number(sharePrice)) / 1e18;
  const sharePriceN = Number(sharePrice) / 1e18;
  // APR is a projection until we have real fee data
  const projectedApr = totalAssets > 0n ? 12.5 : 0;

  const parsedAmount = amount ? safeParse(amount, decimals) : 0n;
  const maxForAction = action === "deposit" ? userBal : userShares;
  const insufficient = parsedAmount > maxForAction;
  const needsApproval = action === "deposit" && parsedAmount > 0n && allowance < parsedAmount;

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isSuccess) {
    setTimeout(() => {
      reset();
      setAmount("");
      refetchUser();
    }, 1500);
  }

  const handleApprove = () => {
    writeContract({
      address: underlyingAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [vaultAddress as `0x${string}`, 2n ** 256n - 1n],
    });
  };
  const handleDeposit = () => {
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: vaultAbi,
      functionName: "deposit",
      args: [parsedAmount],
    });
  };
  const handleWithdraw = () => {
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: vaultAbi,
      functionName: "withdraw",
      args: [parsedAmount],
    });
  };

  const displayAmount = formatInputAsGrouped(amount);

  return (
    <div
      className="card-glass relative overflow-hidden rounded-2xl"
      style={{
        boxShadow: `0 20px 60px -20px rgba(0,0,0,0.8), inset 0 0 60px ${accent}05`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold tracking-tight text-text-primary">
                  {tokenSymbol} Vault
                </h3>
                {!deployed && (
                  <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-purple-300">
                    Coming soon
                  </span>
                )}
                {deployed && (
                  <span className="rounded-md border border-lime-500/30 bg-lime-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-lime-300">
                    Live
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-muted">{description}</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <VaultMetric
            label="TVL"
            value={deployed ? fmtCompact(totalAssetsN, { maxDecimals: 2 }) : "-"}
            unit={tokenSymbol}
          />
          <VaultMetric
            label="Share price"
            value={deployed ? sharePriceN.toFixed(4) : "-"}
            unit=""
            mono
          />
          <VaultMetric
            label="Est. APR"
            value={deployed ? `${projectedApr.toFixed(1)}%` : "-"}
            unit=""
            accent
          />
        </div>

        {/* Your position (if connected + has shares) */}
        {deployed && isConnected && userShares > 0n && (
          <div
            className="mb-4 rounded-xl border p-3"
            style={{
              borderColor: `${accent}30`,
              background: `linear-gradient(135deg, ${accent}08, transparent)`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                Your position
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {fmtCompact(userSharesN, { maxDecimals: 4 })} v{tokenSymbol}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className="font-display text-2xl font-bold text-text-primary tabular"
                style={{ letterSpacing: "-0.02em" }}
              >
                {fmtGrouped(userAssetValue, { maxDecimals: 4 })}
              </span>
              <span className="font-mono text-xs font-semibold" style={{ color: accent }}>
                {tokenSymbol}
              </span>
            </div>
          </div>
        )}

        {/* Action selector */}
        {deployed ? (
          <>
            <div className="mb-3 flex gap-1 rounded-lg border border-space-border bg-space-deep/40 p-0.5">
              <button
                onClick={() => {
                  setAction("deposit");
                  setAmount("");
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  action === "deposit"
                    ? "bg-lime-500/15 text-lime-300"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => {
                  setAction("withdraw");
                  setAmount("");
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  action === "withdraw"
                    ? "bg-lime-500/15 text-lime-300"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Input */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Amount
                </label>
                <button
                  onClick={() =>
                    setAmount(formatUnits(maxForAction, decimals))
                  }
                  className="text-[10px] text-text-muted hover:text-lime-300"
                >
                  Max{" "}
                  <span className="font-mono tabular">
                    {fmtCompact(
                      Number(formatUnits(maxForAction, decimals)),
                      { maxDecimals: 4 }
                    )}
                  </span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={(e) => setAmount(parseGroupedInput(e.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-space-border bg-space-deep/50 px-3 py-2.5 pr-16 font-display text-lg font-semibold text-text-primary tabular placeholder:text-text-muted focus:border-lime-500/50 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-text-muted">
                  {action === "deposit" ? tokenSymbol : `v${tokenSymbol}`}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={
                !isConnected
                  ? undefined
                  : action === "deposit"
                  ? needsApproval
                    ? handleApprove
                    : handleDeposit
                  : handleWithdraw
              }
              disabled={!isConnected || !parsedAmount || insufficient || isPending || waiting}
              className="btn-lime mt-3 w-full rounded-lg px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {!isConnected
                ? "Connect wallet"
                : waiting
                ? "Confirming..."
                : isPending
                ? "Approve in wallet..."
                : insufficient
                ? "Insufficient balance"
                : parsedAmount === 0n
                ? "Enter amount"
                : action === "deposit" && needsApproval
                ? `Approve ${tokenSymbol}`
                : action === "deposit"
                ? `Deposit ${displayAmount} ${tokenSymbol}`
                : `Withdraw ${displayAmount} v${tokenSymbol}`}
            </button>
          </>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-space-border bg-space-deep/30 p-6 text-center">
            <p className="text-sm font-semibold text-text-primary">
              Vault deployment pending
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Contract will go live after Remix deployment on LiteForge testnet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VaultMetric({
  label,
  value,
  unit,
  mono,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-space-border bg-space-deep/40 p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </div>
      <div
        className={`mt-1 flex items-baseline gap-1 text-sm font-bold tabular ${
          mono ? "font-mono" : "font-display"
        } ${accent ? "text-lime-300" : "text-text-primary"}`}
      >
        {value}
        {unit && <span className="text-[10px] font-medium text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-[10px] font-bold text-lime-400">{n}</span>
        <h4 className="font-display text-sm font-semibold text-text-primary">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-text-muted">{body}</p>
    </div>
  );
}

function safeParse(s: string, decimals: number): bigint {
  try {
    const clean = parseGroupedInput(s);
    if (!clean || clean === ".") return 0n;
    return parseUnits(clean, decimals);
  } catch {
    return 0n;
  }
}
