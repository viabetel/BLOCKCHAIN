"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useEffect, useState } from "react";
import { addresses, erc20Abi } from "@/lib/contracts";
import { fmtZkLTCExact } from "@/lib/format";
import { LimeTokenIcon, ZkLtcTokenIcon } from "@/components/LimeTokenIcon";

const CLAIM_AMOUNT = parseEther("100");
const COOLDOWN_SECONDS = 60 * 60;
const STORAGE_KEY = "limero:lastFaucetClaim";

/**
 * Simple faucet card - just two options:
 *   - Claim 100 zkLTC collateral units (legacy MockZkLTC mint)
 *   - Get zkLTC (link to LitVM official faucet for gas)
 */
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
      setCooldownLeft(Math.max(0, COOLDOWN_SECONDS - elapsed));
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

  return (
    <div className="card-glass rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-space-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Testnet Faucet
          </span>
          <span className="chip chip-featured">Free</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          LitVM LiteForge
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* zkLTC collateral claim (legacy MockZkLTC) */}
        <div className="rounded-xl border border-lime-500/20 bg-lime-500/[0.03] p-4">
          <div className="flex items-start gap-3">
            <LimeTokenIcon size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-text-primary">
                zkLTC collateral
              </div>
              <div className="text-[11px] text-text-muted">
                Trade markets, provide liquidity
              </div>
              {isConnected && (
                <div className="mt-1.5 font-mono text-[10px] tabular text-lime-300">
                  Balance{" "}
                  <span className="font-semibold text-text-secondary">
                    {fmtZkLTCExact(balanceBig)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            {!isConnected ? (
              <div className="text-center text-[11px] text-text-muted">
                Connect wallet to claim
              </div>
            ) : isSuccess ? (
              <button disabled className="btn-lime w-full rounded-lg py-2.5 text-xs">
                +100 zkLTC claimed ✓
              </button>
            ) : onCooldown ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-space-border bg-space-surface py-2.5 text-xs font-semibold text-text-muted"
              >
                Next claim in {formatCooldown(cooldownLeft)}
              </button>
            ) : (
              <button
                onClick={claim}
                disabled={isPending || waiting}
                className="btn-lime w-full rounded-lg py-2.5 text-xs"
              >
                {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Claim 100 zkLTC"}
              </button>
            )}
          </div>
        </div>

        {/* zkLTC external link */}
        <div className="rounded-xl border border-slate-500/20 bg-slate-500/[0.03] p-4">
          <div className="flex items-start gap-3">
            <ZkLtcTokenIcon size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-text-primary">
                zkLTC gas
              </div>
              <div className="text-[11px] text-text-muted">
                Pay transaction fees on LitVM
              </div>
              <div className="mt-1.5 font-mono text-[10px] tabular text-text-muted">
                Native token · 1:1 backed by LTC
              </div>
            </div>
          </div>
          <div className="mt-3">
            <a
              href="https://testnet.litvm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs"
            >
              Get zkLTC
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                <path
                  d="M3 9L9 3M9 3H4M9 3V8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
