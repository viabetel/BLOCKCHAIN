"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useEffect, useState } from "react";
import { addresses, erc20Abi } from "@/lib/contracts";
import { fmtZkLTC } from "@/lib/format";

const CLAIM_AMOUNT = parseEther("100");
const COOLDOWN_SECONDS = 60 * 60; // 1 hour
const STORAGE_KEY = "silvercast:lastFaucetClaim";

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => setMounted(true), []);

  // Cooldown ticker
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
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-paper-pure">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-pure">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-paper-pure">
              <path
                d="M12 2L4 9v11a1 1 0 001 1h14a1 1 0 001-1V9l-8-7z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
              />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink-pure">
                Testnet Faucet
              </h3>
              <span className="chip chip-cat">Free</span>
            </div>
            <p className="mt-1 max-w-md text-sm text-ink-600">
              Claim <span className="font-mono font-semibold text-ink-pure">100 zkLTC</span> to trade on Silvercast.
              Testnet tokens only, no real value. Cooldown: 1 hour per wallet.
            </p>
            {isConnected && (
              <p className="mt-1.5 text-xs text-ink-500">
                Your balance:{" "}
                <span className="font-mono font-semibold text-ink-800 tabular">
                  {fmtZkLTC(balanceBig, 2)}
                </span>{" "}
                zkLTC
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {!isConnected ? (
            <p className="text-xs text-ink-500">Connect wallet to claim</p>
          ) : isSuccess ? (
            <button disabled className="btn-bull rounded-lg px-5 py-2.5 text-sm">
              +100 zkLTC claimed ✓
            </button>
          ) : onCooldown ? (
            <button disabled className="cursor-not-allowed rounded-lg border border-ink-200 bg-paper-off px-5 py-2.5 text-sm font-semibold text-ink-500">
              Next claim in {cooldownFmt}
            </button>
          ) : (
            <button
              onClick={claim}
              disabled={isPending || waiting}
              className="btn-ink rounded-lg px-5 py-2.5 text-sm"
            >
              {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Claim 100 zkLTC"}
            </button>
          )}
          <a
            href="https://liteforge.hub.caldera.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-ink-500 transition hover:text-ink-pure sm:text-right"
          >
            Need native zkLTC for gas? →
          </a>
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
