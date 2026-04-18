"use client";

import { useState } from "react";
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
}: {
  market: `0x${string}`;
  resolved: boolean;
}) {
  const { address: user } = useAccount();
  const [side, setSide] = useState<Side>("YES");
  const [amount, setAmount] = useState("");

  const { data: allowance } = useReadContract({
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

  const { data: yesBal } = useReadContract({
    address: market,
    abi: marketAbi,
    functionName: "yesBalance",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });

  const { data: noBal } = useReadContract({
    address: market,
    abi: marketAbi,
    functionName: "noBalance",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash });

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const needsApproval =
    user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;

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
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center text-sm text-zinc-400">
        Connect a wallet to trade
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-medium">Your position</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">YES tokens</span>
            <span className="font-mono">
              {Number(formatEther((yesBal as bigint) ?? 0n)).toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">NO tokens</span>
            <span className="font-mono">
              {Number(formatEther((noBal as bigint) ?? 0n)).toFixed(4)}
            </span>
          </div>
        </div>
        <button
          onClick={handleRedeem}
          disabled={isPending || waiting}
          className="mt-4 w-full rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
        >
          {isPending || waiting ? "Redeeming…" : "Redeem winnings"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("YES")}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
            side === "YES"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          Buy YES
        </button>
        <button
          onClick={() => setSide("NO")}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
            side === "NO"
              ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          Buy NO
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-xs uppercase tracking-wide text-zinc-500">
          Amount (zkLTC)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.0"
          className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-lg focus:border-zinc-600 focus:outline-none"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>
            Balance:{" "}
            {Number(formatEther((balance as bigint) ?? 0n)).toFixed(4)} zkLTC
          </span>
          <button
            onClick={() =>
              setAmount(formatEther((balance as bigint) ?? 0n))
            }
            className="hover:text-zinc-300"
          >
            Max
          </button>
        </div>
      </div>

      <button
        onClick={needsApproval ? handleApprove : handleBuy}
        disabled={!parsedAmount || isPending || waiting}
        className="mt-4 w-full rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
      >
        {isPending || waiting
          ? "Confirming…"
          : needsApproval
            ? "Approve zkLTC"
            : `Buy ${side}`}
      </button>

      <div className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <div className="flex justify-between">
          <span>Your YES</span>
          <span className="font-mono">
            {Number(formatEther((yesBal as bigint) ?? 0n)).toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Your NO</span>
          <span className="font-mono">
            {Number(formatEther((noBal as bigint) ?? 0n)).toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
