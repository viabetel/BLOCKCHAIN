"use client";

import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { addresses, factoryAbi, marketAbi, erc20Abi } from "@/lib/contracts";
import { ADMIN_WALLET } from "@/lib/wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { Logo, Wordmark } from "@/components/Logo";
import { DeployContracts } from "@/components/DeployContracts";
import { fmtAddress, fmtTimeLeft } from "@/lib/format";
import { useHiddenMarkets } from "@/lib/useHiddenMarkets";

const DURATION_PRESETS = [
  { label: "7d", seconds: 7 * 86400 },
  { label: "30d", seconds: 30 * 86400 },
  { label: "90d", seconds: 90 * 86400 },
  { label: "180d", seconds: 180 * 86400 },
  { label: "1y", seconds: 365 * 86400 },
];

/**
 * LitVM-native Market Pack (v19).
 *
 * Seeds are grouped into 4 editorial buckets that signal alignment with
 * the LitVM thesis: LTC price bands, LitVM ecosystem milestones, Litecoin
 * treasury / ETF themes, and builder / onchain activity. Every market is
 * designed to generate recurring LTC-denominated activity.
 */
const SEED_MARKETS = [
  // --- LTC price bands (recurring, habit-forming) ---
  { q: "Will LTC close above $120 on December 31, 2026?", days: 260, cat: "LTC Price" },
  { q: "Will LTC trade above $150 at any point before October 1, 2026?", days: 170, cat: "LTC Price" },
  { q: "Will LTC outperform BTC on a 90-day basis by August 1, 2026?", days: 110, cat: "LTC Price" },

  // --- LitVM ecosystem milestones ---
  { q: "Will the LitVM Builders Program exceed 200 participating teams by June 7, 2026?", days: 60, cat: "LitVM" },
  { q: "Will $LITVM Token Generation Event happen before September 1, 2026?", days: 140, cat: "LitVM" },
  { q: "Will LitVM Mainnet launch before November 1, 2026?", days: 200, cat: "LitVM" },
  { q: "Will LitVM daily active wallets exceed 10,000 by August 2026?", days: 110, cat: "LitVM" },

  // --- Litecoin treasury / ETF themes ---
  { q: "Will the Canary Litecoin ETF (LTCC) exceed $500M AUM by end of 2026?", days: 260, cat: "LTC Treasury" },
  { q: "Will Luxxfolio hold 500,000+ LTC in treasury by end of 2026?", days: 260, cat: "LTC Treasury" },
  { q: "Will a second public company announce an LTC treasury before Q4 2026?", days: 200, cat: "LTC Treasury" },

  // --- Builder / onchain activity ---
  { q: "Will Limero vault TVL exceed 10,000 zkLTC by September 1, 2026?", days: 140, cat: "Builder" },
  { q: "Will more than 5 LitVM builder projects reach mainnet launch by December 2026?", days: 260, cat: "Builder" },
  { q: "Will Bitcoin dominance drop below 55% before November 2026?", days: 200, cat: "Builder" },
];

const PRESET_QUESTIONS = SEED_MARKETS.map((m) => m.q);

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
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition hover:text-text-primary">
          <span>←</span> Back to markets
        </Link>

        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tighter text-text-primary">Admin Panel</h1>
          <span className="chip chip-cat">Curator</span>
        </div>

        {/* Permissionless roadmap banner · signals the protocol is moving past admin-centric ops */}
        <div className="mb-6 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/[0.08] via-purple-500/[0.04] to-transparent p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-purple-400/40 bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-purple-200">
              Roadmap · 60d
            </span>
            <p className="flex-1 text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Permissionless market creation</span>{" "}
              ships in 60 days. This panel becomes the{" "}
              <span className="font-semibold text-text-primary">editorial curator layer</span>{" "}
              for featured markets · not a gate. See{" "}
              <a href="/docs/architecture" className="underline underline-offset-2 hover:text-lime-200">
                architecture
              </a>
              .
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="rounded-xl border border-space-border bg-space p-5">
            <p className="text-sm text-text-secondary">Connect your wallet to continue.</p>
          </div>
        ) : !isAdmin ? (
          <div className="rounded-xl border border-space-border bg-space p-5">
            <p className="font-semibold text-red-400">Access denied</p>
            <p className="mt-1 text-sm text-text-secondary">
              Only the admin wallet can access this page. Connected: <span className="font-mono">{fmtAddress(address ?? "")}</span>
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <DeployContracts />
            </div>
            <SeedMarketsCard />
            <CreateMarketCard />
            <MintTokensCard />
            <div className="lg:col-span-2">
              <ManageMarketsCard />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-space-border bg-space/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <Wordmark className="text-lg text-text-primary" />
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}

function Card({ title, subtitle, accent, children }: { title?: string; subtitle?: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-brand bg-brand/5" : "border-space-border bg-space"}`}>
      {title && (
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function SeedMarketsCard() {
  const { address } = useAccount();
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);

  const { writeContract, data: txHash, isPending, reset, error } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && currentIdx !== null) {
      setCompleted((c) => c + 1);
      const next = currentIdx + 1;
      if (next < SEED_MARKETS.length) {
        setTimeout(() => {
          setCurrentIdx(next);
          submitOne(next);
        }, 800);
      } else {
        setCurrentIdx(null);
        reset();
      }
    }
  }, [isSuccess, currentIdx]);

  const submitOne = (idx: number) => {
    if (!address) return;
    const m = SEED_MARKETS[idx];
    const resolutionTime = BigInt(Math.floor(Date.now() / 1000) + m.days * 86400);
    writeContract({
      address: addresses.factory, abi: factoryAbi, functionName: "createMarket",
      args: [address, resolutionTime, m.q],
    });
  };

  const startSeed = () => {
    setCompleted(0);
    setCurrentIdx(0);
    submitOne(0);
  };

  const running = currentIdx !== null;

  return (
    <Card title="Seed LitVM-native Market Pack" subtitle={`${SEED_MARKETS.length} curated markets · LTC price, LitVM milestones, treasury themes, builder activity`} accent>
      <div className="space-y-3">
        <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-space-border bg-space p-3">
          {SEED_MARKETS.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                i < completed ? "bg-lime-500 text-white" :
                i === currentIdx ? "bg-space-elevated text-white animate-pulse" :
                "bg-space-elevated text-text-muted"
              }`}>
                {i < completed ? "✓" : i + 1}
              </span>
              <span className="shrink-0 rounded border border-space-border bg-space-deep px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                {m.cat}
              </span>
              <span className={`truncate ${i < completed ? "text-text-muted line-through" : "text-text-secondary"}`}>
                {m.q}
              </span>
            </div>
          ))}
        </div>

        <button onClick={startSeed} disabled={running || !address}
          className="btn-ink w-full rounded-lg px-4 py-3 text-sm">
          {running ? `Creating ${completed + 1} / ${SEED_MARKETS.length}...` :
           completed === SEED_MARKETS.length ? `Seeded ${completed} markets ✓` :
           `Seed All ${SEED_MARKETS.length} Markets`}
        </button>
        <p className="text-[11px] text-text-muted">
          One transaction per market ({SEED_MARKETS.length} total). Each costs ~0.005 zkLTC-eq in gas. These are the curator-picked featured markets for the testnet launch.
        </p>
        {error && <p className="text-[11px] text-red-400">Error: {error.message.slice(0, 120)}</p>}
      </div>
    </Card>
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
    <Card title="Create single market" subtitle="Custom question and duration">
      <div className="space-y-3">
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will [event] happen by [date]?" rows={3}
          className="w-full rounded-lg border border-space-border bg-space-deep px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-lime-500/50 focus:bg-space focus:outline-none" />

        <select onChange={(e) => setQuestion(e.target.value)} defaultValue=""
          className="w-full rounded-lg border border-space-border bg-space-deep px-3 py-2 text-sm text-text-primary focus:border-lime-500/50 focus:outline-none">
          <option value="">Or pick a preset...</option>
          {PRESET_QUESTIONS.map((q) => <option key={q} value={q}>{q.slice(0, 70)}...</option>)}
        </select>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">Duration</label>
          <div className="grid grid-cols-5 gap-1.5">
            {DURATION_PRESETS.map((d) => (
              <button key={d.label} onClick={() => setDuration(d.seconds)}
                className={`rounded-md border py-2 text-xs font-semibold transition ${
                  duration === d.seconds
                    ? "border-lime-500 bg-space-elevated text-space-deep"
                    : "border-space-border bg-space-deep text-text-secondary hover:border-lime-500/40"
                }`}>{d.label}</button>
            ))}
          </div>
        </div>

        <button onClick={create} disabled={!question || isPending || waiting}
          className="btn-ink w-full rounded-lg px-4 py-3 text-sm">
          {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : isSuccess ? "Created ✓" : "Create Market"}
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
    <Card title="Mint test LIME" subtitle="Incentive-layer bootstrap faucet">
      <div className="space-y-3">
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
          placeholder={address ? `${fmtAddress(address)} (you)` : "0x..."}
          className="w-full rounded-lg border border-space-border bg-space-deep px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-lime-500/50 focus:outline-none" />
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-full rounded-lg border border-space-border bg-space-deep px-3 py-2.5 font-mono text-sm text-text-primary focus:border-lime-500/50 focus:outline-none" />
        <div className="flex gap-1.5">
          {["100", "1000", "10000"].map((v) => (
            <button key={v} onClick={() => setAmount(v)}
              className="flex-1 rounded-md border border-space-border bg-space-deep py-1.5 text-[11px] font-semibold text-text-secondary hover:border-lime-500/40">
              {v}
            </button>
          ))}
        </div>
        <button onClick={mint} disabled={!amount || isPending || waiting}
          className="btn-ink w-full rounded-lg px-4 py-3 text-sm">
          {waiting ? "Confirming..." : isPending ? "Approve..." : isSuccess ? "Minted ✓" : `Mint ${amount} LIME`}
        </button>
      </div>
    </Card>
  );
}

function ManageMarketsCard() {
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
    <Card title="Manage markets" subtitle="Resolve, hide, or archive markets">
      {markets.length === 0 ? (
        <p className="text-sm text-text-muted">No markets yet.</p>
      ) : (
        <div className="divide-y divide-space-border">
          {markets.map((addr) => <ManageRow key={addr} address={addr} />)}
        </div>
      )}
    </Card>
  );
}

function ManageRow({ address }: { address: `0x${string}` }) {
  const { hide, unhide, isHidden, mounted } = useHiddenMarkets();
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
  const hidden = mounted && isHidden(address);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash });

  const resolve = (outcome: 0 | 1) => {
    writeContract({ address, abi: marketAbi, functionName: "resolve", args: [BigInt(outcome)] });
  };

  return (
    <div className={`flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between ${hidden ? "opacity-50" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {hidden && <span className="chip chip-cat">Hidden</span>}
          <p className="truncate text-sm font-semibold text-text-primary">{question}</p>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
          <a href={`https://liteforge.explorer.caldera.xyz/address/${address}`}
            target="_blank" rel="noopener noreferrer" className="font-mono tabular hover:text-lime-300">
            {fmtAddress(address)}
          </a>
          <span>·</span>
          <span className="font-mono tabular">
            {resolved ? "Settled" : canResolve ? "Ready to resolve" : `Ends in ${fmtTimeLeft(deadline)}`}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {resolved ? (
          <span className={`chip ${winningOutcome === 1n ? "chip-live" : "chip-settled"}`}>
            {winningOutcome === 1n ? "YES won" : "NO won"}
          </span>
        ) : canResolve ? (
          <>
            <button onClick={() => resolve(1)} disabled={isPending || waiting}
              className="btn-bull rounded-md px-3 py-1.5 text-xs">YES wins</button>
            <button onClick={() => resolve(0)} disabled={isPending || waiting}
              className="btn-bear rounded-md px-3 py-1.5 text-xs">NO wins</button>
          </>
        ) : null}
        <button
          onClick={() => (hidden ? unhide(address) : hide(address))}
          className="rounded-md border border-space-border bg-space px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary transition hover:border-lime-500/40 hover:text-text-primary">
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
    </div>
  );
}
