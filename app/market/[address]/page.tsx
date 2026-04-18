"use client";

import { useReadContracts } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { marketAbi } from "@/lib/contracts";
import { TradeBox } from "@/components/TradeBox";
import { ConnectButton } from "@/components/ConnectButton";

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

  const question = (data?.[0]?.result as string) ?? "…";
  const yesPrice = (data?.[1]?.result as bigint) ?? 0n;
  const resolutionTime = (data?.[2]?.result as bigint) ?? 0n;
  const resolved = (data?.[3]?.result as boolean) ?? false;
  const winningOutcome = (data?.[4]?.result as bigint) ?? 0n;
  const yesReserve = (data?.[5]?.result as bigint) ?? 0n;
  const noReserve = (data?.[6]?.result as bigint) ?? 0n;

  const yesPct = Number(yesPrice) / 1e16;
  const deadline = new Date(Number(resolutionTime) * 1000);
  const tvl = yesReserve < noReserve ? yesReserve : noReserve;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ← Silvercast
        </Link>
        <ConnectButton />
      </header>

      <section className="mt-8">
        <h1 className="text-xl font-semibold leading-snug">{question}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="YES price" value={`${yesPct.toFixed(1)}¢`} accent="emerald" />
          <Stat label="NO price" value={`${(100 - yesPct).toFixed(1)}¢`} accent="rose" />
          <Stat label="TVL" value={`${Number(formatEther(tvl)).toFixed(2)} zkLTC`} />
        </div>

        {resolved ? (
          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-sm text-zinc-400">
              Resolved ·{" "}
              <span className={winningOutcome === 1n ? "font-medium text-emerald-400" : "font-medium text-rose-400"}>
                {winningOutcome === 1n ? "YES" : "NO"} won
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            Resolves on{" "}
            {deadline.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </section>

      <section className="mt-8">
        <TradeBox market={address} resolved={resolved} />
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  const color =
    accent === "emerald" ? "text-emerald-400" :
    accent === "rose" ? "text-rose-400" :
    "text-zinc-100";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 font-mono text-lg ${color}`}>{value}</div>
    </div>
  );
}
