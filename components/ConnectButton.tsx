"use client";

import { useAccount, useBalance, useConnect, useDisconnect, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { liteforge, ADMIN_WALLET } from "@/lib/wagmi";
import { addresses, erc20Abi } from "@/lib/contracts";
import { fmtZkLTCExact, fmtAddress } from "@/lib/format";
import { LimeTokenIcon } from "@/components/LimeTokenIcon";
import Link from "next/link";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const { data: tokenBalance } = useReadContract({
    address: addresses.collateral,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const { writeContract: mint, data: mintTx, isPending: minting } = useWriteContract();
  const { isLoading: mintWaiting } = useWaitForTransactionReceipt({ hash: mintTx });

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-36" />;

  const wrongChain = isConnected && chainId !== liteforge.id;
  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET;
  const tokenBalBig = (tokenBalance as bigint) ?? 0n;
  const needsTokens = tokenBalBig < parseEther("1");

  const handleClaim = () => {
    if (!address) return;
    mint({
      address: addresses.collateral,
      abi: erc20Abi,
      functionName: "mint",
      args: [address, parseEther("100")],
    });
  };

  if (wrongChain) {
    return (
      <button onClick={() => switchChain({ chainId: liteforge.id })}
        className="btn-bear flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
        Switch Network
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative flex items-center gap-2">
        {/* Balance chip - primary collateral */}
        <div className="hidden items-center gap-2 rounded-xl border border-lime-500/20 bg-lime-500/5 px-3 py-1.5 md:flex">
          <LimeTokenIcon size={20} />
          <span className="font-mono text-xs font-semibold text-lime-200 tabular">
            {fmtZkLTCExact(tokenBalBig)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-300/70">zkLTC collateral</span>
        </div>

        {isAdmin && (
          <Link href="/admin" className="hidden rounded-xl border border-space-border bg-space-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary transition hover:border-lime-500/40 hover:text-lime-300 md:inline-block">
            Admin
          </Link>
        )}

        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 rounded-xl border border-space-border bg-space-surface px-3 py-2 text-sm transition hover:border-space-border-hover">
          <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_0_3px_rgba(132,204,22,0.2)]" />
          <span className="font-mono text-xs font-medium text-text-primary tabular">{fmtAddress(address)}</span>
          <svg className="h-3 w-3 text-text-muted" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-80 animate-fade-up overflow-hidden rounded-2xl border border-space-border bg-space-elevated shadow-2xl">
              <div className="border-b border-space-border bg-space-surface px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Wallet</div>
                <div className="mt-1 break-all font-mono text-xs text-text-primary tabular">{address}</div>
              </div>
              <div className="border-b border-space-border px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">zkLTC collateral balance</div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold text-text-primary tabular tracking-tighter">
                        {fmtZkLTCExact(tokenBalBig)}
                      </span>
                      <span className="text-xs font-medium text-text-muted">zkLTC collateral</span>
                    </div>
                  </div>
                  {needsTokens && (
                    <button
                      onClick={handleClaim}
                      disabled={minting || mintWaiting}
                      className="btn-lime rounded-lg px-3 py-1.5 text-[11px]"
                    >
                      {mintWaiting ? "Claiming..." : minting ? "Waiting..." : "+100 Claim"}
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg border border-space-border bg-space-deep/50 px-2.5 py-1.5 text-[10px] text-text-muted">
                  <span>Native gas</span>
                  <span className="font-mono tabular text-text-secondary">
                    {balance ? fmtZkLTCExact(balance.value) : "0.0000"} zkLTC
                  </span>
                </div>
              </div>
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className="block border-b border-space-border px-4 py-3 text-sm font-semibold text-lime-300 transition hover:bg-space-surface">
                  Admin Panel →
                </Link>
              )}
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="block border-b border-space-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-space-surface hover:text-lime-300">
                Dashboard →
              </Link>
              <button onClick={() => { disconnect(); setOpen(false); }}
                className="w-full bg-space-surface px-4 py-3 text-left text-sm font-medium text-bear transition hover:bg-red-950/30">
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const connector = connectors[0];
  return (
    <button onClick={() => connector && connect({ connector })} disabled={isPending || !connector}
      className="btn-lime rounded-xl px-5 py-2.5 text-sm">
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
