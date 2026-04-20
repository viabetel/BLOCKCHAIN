"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useEffect, useState } from "react";
import { addresses, erc20Abi } from "@/lib/contracts";
import { fmtZkLTCExact } from "@/lib/format";
import { Logo } from "@/components/Logo";

const CLAIM_AMOUNT = parseEther("100");
const COOLDOWN_SECONDS = 60 * 60;
const STORAGE_KEY = "limero:lastFaucetClaim";

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !address) return;
    const check = () => {
      const last = Number(localStorage.getItem(`${STORAGE_KEY}:${address}`) ?? 0);
      const elapsed = Math.floor(Date.now() / 1000) - last;
      const left = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setCooldownLeft(left);
    };
    check();
    const i = setInterval(check, 1000);
    return () => clearInterval(i);
  }, [mounted, address]);

  const { data: balance } = useReadContract({
    address: addresses.collateral,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash && address) {
      localStorage.setItem(`${STORAGE_KEY}:${address}`, String(Math.floor(Date.now() / 1000)));
      const t = setTimeout(() => reset(), 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, txHash, address, reset]);

  const claim = () => {
    if (!address) return;
    writeContract({
      address: addresses.collateral,
      abi: erc20Abi,
      functionName: "mint",
      args: [address, CLAIM_AMOUNT],
    });
  };

  if (!mounted) return null;

  const balanceBig = (balance as bigint) ?? 0n;
  const onCooldown = cooldownLeft > 0;
  const cooldownFmt = formatCooldown(cooldownLeft);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Ambient glow backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-lime-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-lime-500/8 blur-3xl" />
      </div>

      {/* Orbit lines as decoration */}
      <div className="pointer-events-none absolute inset-0 flex items-center">
        <div className="absolute left-[5%] h-44 w-44 rounded-full border border-lime-500/10" />
        <div className="absolute left-[2%] h-56 w-56 rounded-full border border-lime-500/5" />
      </div>

      <div className="card-glass relative rounded-2xl">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            {/* $LIME token coin - official logo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full ring-2 ring-lime-400/40"
                style={{
                  background:
                    "linear-gradient(135deg, #fde047 0%, #bef264 50%, #65a30d 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.25), 0 0 40px -5px rgba(132,204,22,0.6)",
                }}
              >
                <Logo className="h-9 w-9 text-space-deep" />
              </div>
              {/* Orbiting dot */}
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.8)]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="terminal-pill">FAUCET · v1</span>
                <span className="chip chip-featured">Free</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tighter text-text-primary">
                Claim your <span className="text-gradient-lime">$LIME</span>
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-secondary">
                One-click drip of <span className="font-mono font-semibold text-lime-300">100 $LIME</span> to
                start trading predictions. Testnet only, 1-hour cooldown per wallet.
              </p>
              {isConnected && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-space-border bg-space-deep/60 px-2.5 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Balance</span>
                  <span className="font-mono text-xs font-bold text-lime-300 tabular">
                    {fmtZkLTCExact(balanceBig)} $LIME
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {!isConnected ? (
              <p className="text-xs text-text-muted">Connect wallet to claim</p>
            ) : isSuccess ? (
              <button disabled className="btn-lime rounded-xl px-6 py-3.5 text-sm">
                +100 $LIME claimed ✓
              </button>
            ) : onCooldown ? (
              <button disabled className="cursor-not-allowed rounded-xl border border-space-border bg-space-surface px-6 py-3.5 text-sm font-semibold text-text-muted">
                Next claim in {cooldownFmt}
              </button>
            ) : (
              <button
                onClick={claim}
                disabled={isPending || waiting}
                className="btn-lime rounded-xl px-6 py-3.5 text-sm"
              >
                {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Claim 100 $LIME →"}
              </button>
            )}
            <a
              href="https://liteforge.hub.caldera.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-text-muted transition hover:text-lime-300 sm:justify-end"
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                <path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Need gas? Get native zkLTC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCooldown(seconds: number): string {
  if (seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  if (m >= 1) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}
