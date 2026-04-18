"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { addresses, marketAbi, erc20Abi } from "@/lib/contracts";

type Side = "YES" | "NO";

export function TradeBox({
  market,
  resolved,
  yesPct,
}: {
  market: `0x${string}`;
  resolved: boolean;
  yesPct: number;
}) {
  const { address: user } = useAccount();
  const [side, setSide] = useState<Side>("YES");
  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash) {
      refetchAllowance();
      refetchYes();
      refetchNo();
      const t = setTimeout(() => {
        reset();
        setAmount("");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isSuccess, txHash, refetchAllowance, refetchYes, refetchNo, reset]);

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const needsApproval = user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const balanceBig = (balance as bigint) ?? 0n;
  const insufficient = parsedAmount > balanceBig;

  const estTokens =
    parsedAmount > 0n && currentPrice > 0
      ? Number(formatEther(parsedAmount)) / (currentPrice / 100)
      : 0;
  const maxProfit = Math.max(0, estTokens - Number(amount || 0));
  const returnPct = Number(amount || 0) > 0 ? (maxProfit / Number(amount)) * 100 : 0;

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

  if (!mounted) {
    return <div className="h-[420px] rounded-2xl border border-ink-200 bg-paper-pure" />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-paper-pure p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Trade
        </div>
        <div className="mt-4 rounded-xl border-2 border-dashed border-ink-200 bg-paper-off p-8 text-center">
          <p className="text-sm font-medium text-ink-pure">
            Connect wallet to trade
          </p>
          <p className="mt-1 text-xs text-ink-500">
            You need zkLTC on LiteForge testnet
          </p>
        </div>
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-paper-pure p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Your position
        </div>
        <div className="mt-4 space-y-2.5">
          <PositionRow label="YES tokens" amount={(yesBal as bigint) ?? 0n} color="bull" />
          <PositionRow label="NO tokens" amount={(noBal as bigint) ?? 0n} color="bear" />
        </div>
        <button
          onClick={handleRedeem}
          disabled={isPending || waiting}
          className="btn-ink mt-5 w-full rounded-lg px-4 py-3 text-sm"
        >
          {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Redeem winnings"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-paper-pure p-6">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Place trade
        </div>
        <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink-400">
          FPMM
        </div>
      </div>

      {/* Side selector - Polymarket style */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <SideButton
          active={side === "YES"}
          onClick={() => setSide("YES")}
          label="Buy YES"
          price={yesPct}
          color="bull"
        />
        <SideButton
          active={side === "NO"}
          onClick={() => setSide("NO")}
          label="Buy NO"
          price={100 - yesPct}
          color="bear"
        />
      </div>

      {/* Amount */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
            Amount
          </label>
          <span className="text-[11px] text-ink-500">
            Balance:{" "}
            <span className="font-mono font-semibold text-ink-800 tabular">
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
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full rounded-xl border border-ink-200 bg-paper-off px-4 py-4 pr-20 font-display text-3xl font-semibold text-ink-pure tabular placeholder:text-ink-300 focus:border-ink-pure focus:bg-paper-pure focus:outline-none"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-ink-500">
            zkLTC
          </span>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <button
              key={frac}
              onClick={() =>
                setAmount(formatEther((balanceBig * BigInt(Math.floor(frac * 100))) / 100n))
              }
              className="rounded-md border border-ink-200 bg-paper-off py-1.5 text-[11px] font-semibold text-ink-700 transition hover:border-ink-pure hover:bg-paper-pure"
            >
              {frac === 1 ? "MAX" : `${Math.round(frac * 100)}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Trade preview */}
      {parsedAmount > 0n && !insufficient && (
        <div className="mt-4 rounded-xl border border-ink-200 bg-paper-off p-4">
          <Row
            label={`Avg price`}
            value={`${currentPrice.toFixed(1)}¢`}
          />
          <Row
            label={`${side} shares`}
            value={estTokens.toFixed(4)}
          />
          <div className="my-2 divider-dashed" />
          <Row
            label="Payout if wins"
            value={`${estTokens.toFixed(4)} zkLTC`}
            bold
          />
          <Row
            label="Max profit"
            value={`+${maxProfit.toFixed(4)} zkLTC (${returnPct.toFixed(0)}%)`}
            accent="bull"
          />
        </div>
      )}

      {/* CTA */}
      <button
        onClick={needsApproval ? handleApprove : handleBuy}
        disabled={!parsedAmount || insufficient || isPending || waiting}
        className={`mt-5 w-full rounded-xl px-4 py-4 text-sm font-semibold transition ${
          needsApproval
            ? "btn-ink"
            : side === "YES"
              ? "btn-bull"
              : "btn-bear"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {waiting
          ? "Confirming onchain..."
          : isPending
            ? "Approve in wallet..."
            : insufficient
              ? "Insufficient balance"
              : needsApproval
                ? "Approve zkLTC to trade"
                : parsedAmount === 0n
                  ? "Enter amount"
                  : `Buy ${side} ${amount} zkLTC`}
      </button>

      {/* Position summary */}
      <div className="mt-5 border-t border-ink-100 pt-4">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Your position
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MiniPosition label="YES" amount={(yesBal as bigint) ?? 0n} color="bull" />
          <MiniPosition label="NO" amount={(noBal as bigint) ?? 0n} color="bear" />
        </div>
      </div>
    </div>
  );
}

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
  const bg = color === "bull" ? "bg-bull" : "bg-bear";
  const activeText = "text-paper-pure";
  const inactiveHover =
    color === "bull"
      ? "hover:border-bull hover:text-bull"
      : "hover:border-bear hover:text-bear";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border p-4 transition ${
        active
          ? `${bg} border-transparent ${activeText}`
          : `border-ink-200 bg-paper-pure text-ink-700 ${inactiveHover}`
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
      <span className={`font-display text-2xl font-bold tracking-tighter tabular ${active ? activeText : "text-ink-pure"}`}>
        {price.toFixed(0)}
        <span className={`text-base ${active ? activeText : "text-ink-500"}`}>¢</span>
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: "bull";
  bold?: boolean;
}) {
  const colorClass =
    accent === "bull" ? "text-bull" : bold ? "text-ink-pure" : "text-ink-800";
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-ink-500">{label}</span>
      <span className={`font-mono font-semibold tabular ${colorClass}`}>
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
  const dotColor = color === "bull" ? "bg-bull" : "bg-bear";
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-paper-off px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-semibold text-ink-800">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
      <span className="font-mono text-base font-semibold text-ink-pure tabular">
        {Number(formatEther(amount)).toFixed(4)}
      </span>
    </div>
  );
}

function MiniPosition({
  label,
  amount,
  color,
}: {
  label: string;
  amount: bigint;
  color: "bull" | "bear";
}) {
  const colorText = color === "bull" ? "text-bull" : "text-bear";
  return (
    <div className="rounded-lg border border-ink-200 bg-paper-off px-3 py-2.5">
      <span className={`block text-[10px] font-semibold uppercase tracking-widest ${colorText}`}>
        {label}
      </span>
      <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-pure tabular">
        {Number(formatEther(amount)).toFixed(4)}
      </span>
    </div>
  );
}
