"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContracts,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { addresses, marketAbi, erc20Abi } from "@/lib/contracts";

type Side = "YES" | "NO";

export function TradeBox({
  market,
  resolved,
}: {
  market: `0x${string}`;
  resolved: boolean;
}) {
  const { address: user } = useAccount();
  const [side, setSide] = useState<Side>("YES");
  const [amount, setAmount] = useState("");

  const { data: prices } = useReadContracts({
    contracts: [
      { address: market, abi: marketAbi, functionName: "yesPrice" },
    ],
  });
  const yesPrice = (prices?.[0]?.result as bigint) ?? 0n;
  const yesPct = Number(yesPrice) / 1e16;
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

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch everything after a successful tx
  if (isSuccess && txHash) {
    refetchAllowance();
    refetchYes();
    refetchNo();
    setTimeout(() => {
      reset();
      setAmount("");
    }, 1000);
  }

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const needsApproval =
    user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const balanceBig = (balance as bigint) ?? 0n;
  const insufficient = parsedAmount > balanceBig;

  // Estimated tokens received (naive estimate: amount / price)
  // Real FPMM gives a bit more due to AMM curve, but this is close
  const estTokens =
    parsedAmount > 0n && currentPrice > 0
      ? Number(formatEther(parsedAmount)) / (currentPrice / 100)
      : 0;

  const handleApprove = () => {
    writeContract({
      address: addresses.collateral,
      abi: erc20Abi,
      functionName: "approve",
      args: [market, 2n ** 256n - 1n],
    });
  };

  const handleBuy = () => {
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "buy",
      args: [side === "YES" ? 1n : 0n, parsedAmount, 0n],
    });
  };

  const handleRedeem = () => {
    writeContract({
      address: market,
      abi: marketAbi,
      functionName: "redeem",
      args: [],
    });
  };

  if (!user) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-silver-500">
          Position & Trade
        </div>
        <div className="rounded-xl border border-silver-800 bg-ink-100/50 p-8 text-center">
          <p className="text-sm text-silver-300">
            Connect a wallet to trade this market.
          </p>
        </div>
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="mb-4 text-[10px] uppercase tracking-[0.2em] text-silver-500">
          Your Position
        </div>
        <div className="space-y-3">
          <PositionRow
            label="YES tokens"
            amount={(yesBal as bigint) ?? 0n}
            color="bull"
          />
          <PositionRow
            label="NO tokens"
            amount={(noBal as bigint) ?? 0n}
            color="bear"
          />
        </div>
        <button
          onClick={handleRedeem}
          disabled={isPending || waiting}
          className="btn-primary mt-6 w-full rounded-lg px-4 py-3 text-sm"
        >
          {waiting ? "Confirming…" : isPending ? "Waiting for wallet…" : "Redeem winnings"}
        </button>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6">
      {/* Side selector */}
      <div className="mb-4 text-[10px] uppercase tracking-[0.2em] text-silver-500">
        Place Order
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-200 p-1">
        <SideToggle
          active={side === "YES"}
          onClick={() => setSide("YES")}
          label="YES"
          price={yesPct}
          color="bull"
        />
        <SideToggle
          active={side === "NO"}
          onClick={() => setSide("NO")}
          label="NO"
          price={100 - yesPct}
          color="bear"
        />
      </div>

      {/* Amount input */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] text-silver-500">
            Amount
          </label>
          <span className="text-[11px] text-silver-400">
            Balance:{" "}
            <span className="font-mono text-silver-300 tabular">
              {Number(formatEther(balanceBig)).toFixed(4)}
            </span>{" "}
            zkLTC
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="0.00"
            className="w-full rounded-lg border border-silver-800 bg-ink-50 px-4 py-4 pr-20 font-mono text-2xl text-silver-50 tabular placeholder:text-silver-700 focus:border-silver-600 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-silver-500">
            zkLTC
          </span>
        </div>

        {/* Quick amounts */}
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <button
              key={frac}
              onClick={() =>
                setAmount(
                  formatEther((balanceBig * BigInt(Math.floor(frac * 100))) / 100n)
                )
              }
              className="rounded-md border border-silver-800 bg-ink-100 py-1.5 text-[11px] text-silver-400 transition hover:border-silver-600 hover:text-silver-100"
            >
              {frac === 1 ? "MAX" : `${Math.round(frac * 100)}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Receipt preview */}
      {parsedAmount > 0n && !insufficient && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-silver-800 bg-ink-100/50 p-3 text-[11px]">
          <Row
            label={`Avg price (~${currentPrice.toFixed(1)}¢)`}
            value={`${amount} zkLTC`}
          />
          <Row
            label={`Est. ${side} tokens`}
            value={estTokens.toFixed(4)}
            accent
          />
          <Row
            label="Potential payout"
            value={`${estTokens.toFixed(4)} zkLTC`}
            accent
          />
          <Row
            label="Max profit"
            value={`${Math.max(0, estTokens - Number(amount)).toFixed(4)} zkLTC`}
          />
        </div>
      )}

      {/* CTA */}
      <button
        onClick={needsApproval ? handleApprove : handleBuy}
        disabled={
          !parsedAmount || insufficient || isPending || waiting
        }
        className={`mt-5 w-full rounded-lg px-4 py-3.5 text-sm font-medium transition ${
          side === "YES" && !needsApproval
            ? "bg-accent-bull text-ink-0 hover:bg-accent-bull/90"
            : side === "NO" && !needsApproval
              ? "bg-accent-bear text-white hover:bg-accent-bear/90"
              : "btn-primary"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {waiting
          ? "Confirming on-chain…"
          : isPending
            ? "Waiting for wallet…"
            : insufficient
              ? "Insufficient balance"
              : needsApproval
                ? "Approve zkLTC"
                : parsedAmount === 0n
                  ? "Enter amount"
                  : `Buy ${side} — ${amount} zkLTC`}
      </button>

      {/* Position footer */}
      <div className="mt-5 border-t border-silver-800/60 pt-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-silver-500">
          Your Position
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <PositionMini
            label="YES"
            amount={(yesBal as bigint) ?? 0n}
            color="bull"
          />
          <PositionMini
            label="NO"
            amount={(noBal as bigint) ?? 0n}
            color="bear"
          />
        </div>
      </div>
    </div>
  );
}

function SideToggle({
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
  const accentBg =
    color === "bull" ? "bg-accent-bull/15" : "bg-accent-bear/15";
  const accentText =
    color === "bull" ? "text-accent-bull" : "text-accent-bear";
  const accentBorder =
    color === "bull" ? "border-accent-bull/40" : "border-accent-bear/40";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start rounded-md px-4 py-3 transition ${
        active
          ? `${accentBg} border ${accentBorder}`
          : "hover:bg-ink-100 border border-transparent"
      }`}
    >
      <span
        className={`font-mono text-xs font-medium tracking-widest ${
          active ? accentText : "text-silver-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-1 font-mono text-base tabular ${
          active ? "text-silver-50" : "text-silver-400"
        }`}
      >
        {price.toFixed(1)}¢
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver-500">{label}</span>
      <span
        className={`font-mono tabular ${accent ? "text-silver-50" : "text-silver-300"}`}
      >
        {value}
      </span>
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
  color: "bull" | "bear";
}) {
  const accent =
    color === "bull" ? "text-accent-bull" : "text-accent-bear";
  return (
    <div className="flex items-baseline justify-between rounded-lg border border-silver-800/60 bg-ink-100/50 px-4 py-3">
      <span className={`font-mono text-xs tracking-widest ${accent}`}>
        {label}
      </span>
      <span className="font-mono text-lg text-silver-100 tabular">
        {Number(formatEther(amount)).toFixed(4)}
      </span>
    </div>
  );
}

function PositionMini({
  label,
  amount,
  color,
}: {
  label: string;
  amount: bigint;
  color: "bull" | "bear";
}) {
  const accent =
    color === "bull" ? "text-accent-bull" : "text-accent-bear";
  return (
    <div className="rounded-md border border-silver-800/60 bg-ink-100/40 px-3 py-2">
      <span
        className={`block font-mono text-[10px] tracking-widest ${accent}`}
      >
        {label}
      </span>
      <span className="mt-0.5 block font-mono text-sm text-silver-100 tabular">
        {Number(formatEther(amount)).toFixed(4)}
      </span>
    </div>
  );
}
