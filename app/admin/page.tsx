"use client";

import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { addresses, factoryAbi, marketAbi, erc20Abi } from "@/lib/contracts";
import { ADMIN_WALLET } from "@/lib/wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { fmtAddress, fmtTimeLeft } from "@/lib/format";

const DURATION_PRESETS = [
  { label: "7 days", seconds: 7 * 86400 },
  { label: "30 days", seconds: 30 * 86400 },
  { label: "90 days", seconds: 90 * 86400 },
  { label: "180 days", seconds: 180 * 86400 },
  { label: "1 year", seconds: 365 * 86400 },
];

const PRESET_MARKETS = [
  "Will the LitVM Builders Program exceed 200 participating teams by June 7, 2026?",
  "Will $LITVM Token Generation Event happen before September 1, 2026?",
  "Will LTC close above $120 on December 31, 2026?",
  "Will the Canary Litecoin ETF (LTCC) exceed $500M AUM by end of 2026?",
  "Will LitVM Mainnet launch before November 1, 2026?",
  "Will Luxxfolio hold 500,000+ LTC in treasury by end of 2026?",
  "Will Bitcoin dominance drop below 55% before November 2026?",
];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition hover:text-ink-pure">
          <span>←</span> Back to markets
        </Link>

        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tighter text-ink-pure">Admin Panel</h1>
          <span className="chip chip-cat">Private</span>
        </div>

        {!isConnected ? (
          <Card>
            <p className="text-sm text-ink-600">Connect your wallet to continue.</p>
          </Card>
        ) : !isAdmin ? (
          <Card>
            <div className="text-sm">
              <p className="font-semibold text-bear">Access denied</p>
              <p className="mt-1 text-ink-600">
                Only the admin wallet can access this page. Connected: <span className="font-mono">{fmtAddress(address ?? "")}</span>
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <CreateMarketCard />
            <MintTokensCard />
            <div className="lg:col-span-2">
              <ResolveMarketsCard />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-paper-pure/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <Wordmark className="text-lg text-ink-pure" />
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}

function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-paper-pure p-5">
      {title && (
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold text-ink-pure">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function CreateMarketCard() {
  const { address } = useAccount();
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState(30 * 86400);

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => { reset(); setQuestion(""); }, 2000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, reset]);

  const create = () => {
    if (!address || !question) return;
    const resolutionTime = BigInt(Math.floor(Date.now() / 1000) + duration);
    writeContract({
      address: addresses.factory, abi: factoryAbi, functionName: "createMarket",
      args: [address, resolutionTime, question],
    });
  };

  return (
    <Card title="Create Market" subtitle="Deploy a new binary prediction market">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Question
          </label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will [event] happen by [date]?" rows={3}
            className="w-full rounded-lg border border-ink-200 bg-paper-off px-3 py-2.5 text-sm text-ink-pure placeholder:text-ink-400 focus:border-ink-pure focus:bg-paper-pure focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Preset questions
          </label>
          <select onChange={(e) => setQuestion(e.target.value)} defaultValue=""
            className="w-full rounded-lg border border-ink-200 bg-paper-off px-3 py-2 text-sm text-ink-pure focus:border-ink-pure focus:outline-none">
            <option value="">Select a preset...</option>
            {PRESET_MARKETS.map((q) => <option key={q} value={q}>{q.slice(0, 60)}...</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Duration
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {DURATION_PRESETS.map((d) => (
              <button key={d.label} onClick={() => setDuration(d.seconds)}
                className={`rounded-md border py-2 text-xs font-semibold transition ${
                  duration === d.seconds
                    ? "border-ink-pure bg-ink-pure text-paper-pure"
                    : "border-ink-200 bg-paper-off text-ink-700 hover:border-ink-pure"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink-200 bg-paper-off p-3 text-xs text-ink-600">
          <div className="flex justify-between">
            <span>Oracle (you)</span>
            <span className="font-mono tabular">{address ? fmtAddress(address) : "—"}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Resolves at</span>
            <span className="font-mono tabular">
              {new Date(Date.now() + duration * 1000).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
        </div>

        <button onClick={create} disabled={!question || isPending || waiting}
          className="btn-ink w-full rounded-lg px-4 py-3 text-sm">
          {waiting ? "Confirming onchain..." : isPending ? "Approve in wallet..." : isSuccess ? "Market created ✓" : "Create Market"}
        </button>
      </div>
    </Card>
  );
}

function MintTokensCard() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("1000");
  const [recipient, setRecipient] = useState("");

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) { const t = setTimeout(() => reset(), 2000); return () => clearTimeout(t); }
  }, [isSuccess, reset]);

  const mint = () => {
    const to = (recipient || address) as `0x${string}`;
    if (!to) return;
    writeContract({
      address: addresses.collateral, abi: erc20Abi, functionName: "mint",
      args: [to, parseEther(amount || "0")],
    });
  };

  return (
    <Card title="Mint zkLTC" subtitle="Faucet for testing. MockZkLTC contract only.">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Recipient
          </label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
            placeholder={address ? `${fmtAddress(address)} (you)` : "0x..."}
            className="w-full rounded-lg border border-ink-200 bg-paper-off px-3 py-2.5 font-mono text-sm text-ink-pure placeholder:text-ink-400 focus:border-ink-pure focus:bg-paper-pure focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Amount
          </label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full rounded-lg border border-ink-200 bg-paper-off px-3 py-2.5 font-mono text-sm text-ink-pure focus:border-ink-pure focus:bg-paper-pure focus:outline-none" />
          <div className="mt-1.5 flex gap-1.5">
            {["100", "1000", "10000"].map((v) => (
              <button key={v} onClick={() => setAmount(v)}
                className="rounded-md border border-ink-200 bg-paper-off px-2 py-1 text-[11px] font-semibold text-ink-700 hover:border-ink-pure">
                {v}
              </button>
            ))}
          </div>
        </div>
        <button onClick={mint} disabled={!amount || isPending || waiting}
          className="btn-ink w-full rounded-lg px-4 py-3 text-sm">
          {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : isSuccess ? "Minted ✓" : `Mint ${amount} zkLTC`}
        </button>
      </div>
    </Card>
  );
}

function ResolveMarketsCard() {
  const { data: length } = useReadContract({
    address: addresses.factory, abi: factoryAbi, functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  const { data: marketAddresses } = useReadContracts({
    contracts: Array.from({ length: count }).map((_, i) => ({
      address: addresses.factory, abi: factoryAbi, functionName: "allMarkets", args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });

  const markets = (marketAddresses ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((x): x is `0x${string}` => Boolean(x));

  return (
    <Card title="Resolve Markets" subtitle="Settle outcomes after resolution time has passed">
      {markets.length === 0 ? (
        <p className="text-sm text-ink-500">No markets yet.</p>
      ) : (
        <div className="divide-y divide-ink-100">
          {markets.map((addr) => <ResolveRow key={addr} address={addr} />)}
        </div>
      )}
    </Card>
  );
}

function ResolveRow({ address }: { address: `0x${string}` }) {
  const { data } = useReadContracts({
    contracts: [
      { address, abi: marketAbi, functionName: "question" },
      { address, abi: marketAbi, functionName: "resolutionTime" },
      { address, abi: marketAbi, functionName: "resolved" },
      { address, abi: marketAbi, functionName: "winningOutcome" },
    ],
  });

  const question = (data?.[0]?.result as string) ?? "...";
  const resolutionTime = Number((data?.[1]?.result as bigint) ?? 0n);
  const resolved = (data?.[2]?.result as boolean) ?? false;
  const winningOutcome = (data?.[3]?.result as bigint) ?? 0n;

  const deadline = new Date(resolutionTime * 1000);
  const canResolve = !resolved && Date.now() / 1000 >= resolutionTime;

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash });

  const resolve = (outcome: 0 | 1) => {
    writeContract({
      address, abi: marketAbi, functionName: "resolve", args: [BigInt(outcome)],
    });
  };

  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-ink-pure">{question}</p>
        <p className="mt-0.5 flex items-center gap-3 text-xs text-ink-500">
          <span className="font-mono tabular">{fmtAddress(address)}</span>
          <span>·</span>
          <span className="font-mono tabular">
            {resolved ? "Settled" : canResolve ? "Ready to resolve" : `Resolves ${fmtTimeLeft(deadline)}`}
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        {resolved ? (
          <span className={`chip ${winningOutcome === 1n ? "chip-live" : "chip-settled"}`}>
            {winningOutcome === 1n ? "YES won" : "NO won"}
          </span>
        ) : canResolve ? (
          <>
            <button onClick={() => resolve(1)} disabled={isPending || waiting}
              className="btn-bull rounded-md px-3 py-1.5 text-xs">
              YES wins
            </button>
            <button onClick={() => resolve(0)} disabled={isPending || waiting}
              className="btn-bear rounded-md px-3 py-1.5 text-xs">
              NO wins
            </button>
          </>
        ) : (
          <span className="text-xs text-ink-400">Locked</span>
        )}
      </div>
    </div>
  );
}
