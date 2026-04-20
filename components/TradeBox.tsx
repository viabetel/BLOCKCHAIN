"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { addresses, marketAbi, erc20Abi } from "@/lib/contracts";
import {
  fmtPct,
  fmtTokens,
  fmtCompact,
  fmtGrouped,
  formatInputAsGrouped,
  parseGroupedInput,
} from "@/lib/format";

type Side = "YES" | "NO";
type Tab = "Buy" | "Sell" | "Liquidity";

// Symbolic peg for USDC display (1 LIME ≈ 1 USDC in testnet)
const LIME_TO_USDC = 1;

export function TradeBox({
  market,
  resolved,
  yesPct,
  initialSide,
}: {
  market: `0x${string}`;
  resolved: boolean;
  yesPct: number;
  initialSide?: Side;
}) {
  const { address: user } = useAccount();
  const [tab, setTab] = useState<Tab>("Buy");
  const [side, setSide] = useState<Side>(initialSide ?? "YES");
  const [amount, setAmount] = useState(""); // raw numeric string (no commas)
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (initialSide) setSide(initialSide);
  }, [initialSide]);

  const currentPrice = side === "YES" ? yesPct : 100 - yesPct;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.collateral,
    abi: erc20Abi,
    functionName: "allowance",
    args: user ? [user, market] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: balance } = useReadContract({
    address: addresses.collateral,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: yesBal, refetch: refetchYes } = useReadContract({
    address: market,
    abi: marketAbi,
    functionName: "yesBalance",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: noBal, refetch: refetchNo } = useReadContract({
    address: market,
    abi: marketAbi,
    functionName: "noBalance",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });
  const { data: liqBal, refetch: refetchLiq } = useReadContract({
    address: market,
    abi: marketAbi,
    functionName: "liquidity",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash) {
      refetchAllowance();
      refetchYes();
      refetchNo();
      refetchLiq();
      const t = setTimeout(() => {
        reset();
        setAmount("");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, txHash, refetchAllowance, refetchYes, refetchNo, refetchLiq, reset]);

  const parsedAmount = amount ? safeParse(amount) : 0n;
  const balanceBig = (balance as bigint) ?? 0n;
  const yesBalBig = (yesBal as bigint) ?? 0n;
  const noBalBig = (noBal as bigint) ?? 0n;
  const liqBalBig = (liqBal as bigint) ?? 0n;
  const sideBal = side === "YES" ? yesBalBig : noBalBig;
  const maxForTab = tab === "Sell" ? sideBal : balanceBig;
  const insufficient = parsedAmount > maxForTab;
  const needsApproval =
    tab === "Buy" && user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const needsApprovalLiq =
    tab === "Liquidity" && user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;

  const amountN = amount ? Number(amount) : 0;
  const estTokens = amountN > 0 && currentPrice > 0 ? amountN / (currentPrice / 100) : 0;
  const estProceeds = amountN > 0 ? amountN * (currentPrice / 100) : 0;
  const usdcEquivalent = amountN * LIME_TO_USDC;

  const handleAmountChange = (raw: string) => {
    const clean = parseGroupedInput(raw);
    setAmount(clean);
  };

  const setFraction = (frac: number) => {
    const fractional = (maxForTab * BigInt(Math.floor(frac * 1000))) / 1000n;
    setAmount(formatEther(fractional));
  };

  const fractionPreview = (frac: number) => {
    const val = Number(formatEther((maxForTab * BigInt(Math.floor(frac * 1000))) / 1000n));
    return fmtCompact(val, { maxDecimals: 4 });
  };

  const approve = () =>
    writeContract({
      address: addresses.collateral,
      abi: erc20Abi,
      functionName: "approve",
      args: [market, 2n ** 256n - 1n],
    });
  const buy = () =>
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "buy",
      args: [side === "YES" ? 1n : 0n, parsedAmount, 0n],
    });
  const sell = () =>
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "sell",
      args: [side === "YES" ? 1n : 0n, parsedAmount, 0n],
    });
  const addLiq = () =>
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "addLiquidity",
      args: [parsedAmount],
    });
  const removeLiq = () =>
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "removeLiquidity",
      args: [parsedAmount],
    });
  const redeem = () =>
    writeContract({ address: market, abi: marketAbi, functionName: "redeem", args: [] });

  if (!mounted)
    return <div className="h-[560px] rounded-2xl border border-space-border bg-space-surface" />;

  // ----- Not connected -----
  if (!user) {
    return (
      <div className="card-glass rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-space-border pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
            Trade
          </span>
          <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-text-muted">
            FPMM
          </span>
        </div>
        <div className="mt-4 rounded-xl border-2 border-dashed border-space-border bg-space-deep/50 p-8 text-center">
          <p className="text-sm font-semibold text-text-primary">Connect wallet to trade</p>
          <p className="mt-1 text-xs text-text-muted">You need $LIME on LiteForge testnet</p>
        </div>
      </div>
    );
  }

  // ----- Resolved -----
  if (resolved) {
    return (
      <div className="card-glass rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-space-border pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
            Your Position
          </span>
          <span className="chip chip-settled">Settled</span>
        </div>
        <div className="mt-4 space-y-2">
          <PositionRow label="YES shares" amount={yesBalBig} color="bull" />
          <PositionRow label="NO shares" amount={noBalBig} color="bear" />
          {liqBalBig > 0n && (
            <PositionRow label="LP shares" amount={liqBalBig} color="brand" />
          )}
        </div>
        <button
          onClick={redeem}
          disabled={isPending || waiting}
          className="btn-lime mt-4 w-full rounded-lg px-4 py-3 text-sm"
        >
          {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Redeem winnings"}
        </button>
      </div>
    );
  }

  // ----- Active trading -----
  const tabButtons: Tab[] = ["Buy", "Sell", "Liquidity"];
  const displayAmount = formatInputAsGrouped(amount);

  return (
    <div className="card-glass rounded-2xl">
      {/* Tabs */}
      <div className="flex items-center border-b border-space-border px-4">
        {tabButtons.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setAmount("");
            }}
            className={`tab-btn ${tab === t ? "active" : ""}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] font-medium uppercase tracking-widest text-text-muted">
          FPMM
        </span>
      </div>

      <div className="p-5">
        {/* Side buttons */}
        {(tab === "Buy" || tab === "Sell") && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <SideButton
              active={side === "YES"}
              onClick={() => setSide("YES")}
              label={`${tab} YES`}
              price={yesPct}
              color="bull"
            />
            <SideButton
              active={side === "NO"}
              onClick={() => setSide("NO")}
              label={`${tab} NO`}
              price={100 - yesPct}
              color="bear"
            />
          </div>
        )}

        {tab === "Liquidity" && (
          <div className="mb-4 rounded-xl border border-lime-500/20 bg-lime-500/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Provide liquidity
            </div>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Deposit $LIME to earn a share of the 2% trading fees. Your LP
              settles against the winning side at resolution.
            </p>
          </div>
        )}

        {/* Amount input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              Amount
            </label>
            <div className="flex items-baseline gap-1.5 text-[11px]">
              <span className="text-text-muted">
                {tab === "Sell" ? `${side} balance` : "Wallet balance"}
              </span>
              <button
                onClick={() => setAmount(formatEther(maxForTab))}
                className="font-mono font-semibold text-text-secondary tabular hover:text-lime-300"
              >
                {fmtGrouped(Number(formatEther(maxForTab)), { maxDecimals: 4 })}
              </button>
              <span className="font-mono text-[9px] uppercase text-text-muted">
                {tab === "Sell" ? "" : "$LIME"}
              </span>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-space-border bg-space-deep/50 px-4 py-3.5 pr-24 font-display text-2xl font-semibold text-text-primary tabular placeholder:text-text-muted focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/15"
              style={{ letterSpacing: "-0.01em" }}
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="font-mono text-xs font-bold text-lime-300">
                {tab === "Sell" ? side : "$LIME"}
              </span>
            </div>
          </div>

          {/* USDC equivalence hint */}
          {amountN > 0 && tab !== "Sell" && (
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px]">
              <span className="text-text-muted">
                ≈{" "}
                <span className="font-mono font-semibold text-text-secondary tabular">
                  ${fmtGrouped(usdcEquivalent, { maxDecimals: 2 })}
                </span>{" "}
                USDC-equivalent
              </span>
              <span className="font-mono text-text-muted">
                {amount.length > 7 && `${amount.split(".")[0]?.length} digits`}
              </span>
            </div>
          )}

          {/* Quick-action pills with PREVIEW */}
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[
              { frac: 0.25, label: "25%" },
              { frac: 0.5, label: "50%" },
              { frac: 0.75, label: "75%" },
              { frac: 1, label: "MAX" },
            ].map(({ frac, label }) => (
              <button
                key={frac}
                onClick={() => setFraction(frac)}
                className="group flex flex-col items-center rounded-lg border border-space-border bg-space-surface py-2 transition hover:border-lime-500/40 hover:bg-lime-500/5"
              >
                <span className="text-[10px] font-bold text-text-secondary group-hover:text-lime-300">
                  {label}
                </span>
                <span className="mt-0.5 font-mono text-[9px] text-text-muted group-hover:text-lime-400/80 tabular">
                  {fractionPreview(frac)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview rows */}
        {parsedAmount > 0n && !insufficient && tab === "Buy" && (
          <PreviewBox
            rows={[
              ["Avg price", `${fmtPct(currentPrice)}¢`],
              [
                `${side} shares received`,
                fmtGrouped(estTokens, { maxDecimals: 4 }),
              ],
              [
                "Payout if wins",
                `${fmtGrouped(estTokens, { maxDecimals: 4 })} $LIME`,
                true,
              ],
              [
                "Max profit",
                `+${fmtGrouped(Math.max(0, estTokens - amountN), {
                  maxDecimals: 4,
                })} $LIME`,
                false,
                "bull",
              ],
            ]}
          />
        )}
        {parsedAmount > 0n && !insufficient && tab === "Sell" && (
          <PreviewBox
            rows={[
              ["Selling", `${displayAmount} ${side} shares`],
              ["Avg price", `${fmtPct(currentPrice)}¢`],
              [
                "You receive",
                `~${fmtGrouped(estProceeds, { maxDecimals: 4 })} $LIME`,
                true,
              ],
            ]}
          />
        )}
        {parsedAmount > 0n && !insufficient && tab === "Liquidity" && (
          <PreviewBox
            rows={[
              ["Depositing", `${displayAmount} $LIME`],
              ["Your current LP", fmtGrouped(Number(formatEther(liqBalBig)), { maxDecimals: 4 })],
              ["Fee earnings", "Pro-rata from 2% trade fees"],
            ]}
          />
        )}

        {/* Main CTA */}
        <button
          onClick={() => {
            if (tab === "Buy") {
              (needsApproval ? approve : buy)();
            } else if (tab === "Sell") {
              sell();
            } else {
              (needsApprovalLiq ? approve : addLiq)();
            }
          }}
          disabled={!parsedAmount || insufficient || isPending || waiting}
          className={`mt-4 w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
            tab === "Buy" && !needsApproval && side === "YES"
              ? "btn-bull"
              : tab === "Buy" && !needsApproval && side === "NO"
              ? "btn-bear"
              : tab === "Sell"
              ? "btn-ink"
              : "btn-lime"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {waiting
            ? "Confirming onchain..."
            : isPending
            ? "Approve in wallet..."
            : insufficient
            ? "Insufficient balance"
            : parsedAmount === 0n
            ? "Enter amount"
            : tab === "Buy" && needsApproval
            ? "Approve $LIME"
            : tab === "Buy"
            ? `Buy ${side} · ${displayAmount} $LIME`
            : tab === "Sell"
            ? `Sell ${displayAmount} ${side}`
            : tab === "Liquidity" && needsApprovalLiq
            ? "Approve $LIME"
            : `Add ${displayAmount} $LIME liquidity`}
        </button>

        {tab === "Liquidity" && liqBalBig > 0n && (
          <button
            onClick={removeLiq}
            disabled={isPending || waiting}
            className="mt-2 w-full rounded-lg border border-space-border bg-space-surface px-4 py-2.5 text-xs font-semibold text-text-secondary transition hover:border-space-border-hover hover:text-text-primary"
          >
            Remove all LP ({fmtGrouped(Number(formatEther(liqBalBig)), { maxDecimals: 4 })})
          </button>
        )}

        {/* Position strip */}
        <div className="mt-5 border-t border-space-border pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              Your Position
            </span>
            {(yesBalBig > 0n || noBalBig > 0n) && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-lime-400">
                Active
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniPos label="YES" amount={yesBalBig} color="bull" />
            <MiniPos label="NO" amount={noBalBig} color="bear" />
            <MiniPos label="LP" amount={liqBalBig} color="brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------- Sub-components ------------- */

function SideButton({
  active,
  onClick,
  label,
  price,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  price: number;
  color: "bull" | "bear";
}) {
  const bg =
    color === "bull"
      ? "bg-gradient-to-br from-lime-500 to-lime-600 border-lime-400/40"
      : "bg-gradient-to-br from-red-500 to-red-600 border-red-400/40";
  const hover =
    color === "bull"
      ? "hover:border-lime-500/40 hover:bg-lime-500/10"
      : "hover:border-red-500/40 hover:bg-red-500/10";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-xl border p-3 transition ${
        active
          ? `${bg} text-white shadow-lg`
          : `border-space-border bg-space-surface text-text-secondary ${hover}`
      }`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      <span
        className={`font-display text-xl font-bold tracking-tighter tabular ${
          active ? "text-white" : "text-text-primary"
        }`}
      >
        {fmtPct(price, 0)}
        <span
          className={`text-sm ${active ? "text-white/80" : "text-text-muted"}`}
        >
          ¢
        </span>
      </span>
    </button>
  );
}

function PreviewBox({
  rows,
}: {
  rows: Array<[string, string, boolean?, string?]>;
}) {
  return (
    <div className="mt-4 rounded-xl border border-space-border bg-space-deep/40 p-3">
      {rows.map(([label, value, bold, accent], i) => (
        <div key={i} className="flex items-center justify-between py-1 text-xs">
          <span className="text-text-muted">{label}</span>
          <span
            className={`font-mono font-semibold tabular ${
              accent === "bull"
                ? "text-lime-300"
                : bold
                ? "text-text-primary"
                : "text-text-secondary"
            }`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PositionRow({
  label,
  amount,
  color,
}: {
  label: string;
  amount: bigint;
  color: "bull" | "bear" | "brand";
}) {
  const dot =
    color === "bull" ? "bg-lime-400" : color === "bear" ? "bg-red-400" : "bg-lime-500";
  return (
    <div className="flex items-center justify-between rounded-xl border border-space-border bg-space-deep/40 px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="font-mono text-base font-semibold text-text-primary tabular">
        {fmtGrouped(Number(formatEther(amount)), { maxDecimals: 4 })}
      </span>
    </div>
  );
}

function MiniPos({
  label,
  amount,
  color,
}: {
  label: string;
  amount: bigint;
  color: "bull" | "bear" | "brand";
}) {
  const ct =
    color === "bull"
      ? "text-lime-300"
      : color === "bear"
      ? "text-red-400"
      : "text-lime-400";
  return (
    <div className="rounded-lg border border-space-border bg-space-deep/40 px-2.5 py-2">
      <span
        className={`block text-[10px] font-semibold uppercase tracking-widest ${ct}`}
      >
        {label}
      </span>
      <span
        className="mt-0.5 block font-mono text-sm font-semibold text-text-primary tabular"
        title={fmtGrouped(Number(formatEther(amount)), { maxDecimals: 6 })}
      >
        {fmtTokens(amount)}
      </span>
    </div>
  );
}

/** Safely parse a user input string to bigint wei. */
function safeParse(s: string): bigint {
  try {
    const clean = parseGroupedInput(s);
    if (!clean || clean === ".") return 0n;
    return parseEther(clean);
  } catch {
    return 0n;
  }
}
