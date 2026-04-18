"use client";

import { useAccount, useBalance, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatEther } from "viem";
import { liteforge } from "@/lib/wagmi";
import { useState, useEffect } from "react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-32" />;

  const wrongChain = isConnected && chainId !== liteforge.id;

  if (wrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: liteforge.id })}
        className="btn-bear flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
      >
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
        Switch Network
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-paper-pure px-3 py-2 text-sm transition hover:border-ink-pure"
        >
          <span className="h-2 w-2 rounded-full bg-bull shadow-[0_0_0_3px_rgba(0,168,104,0.15)]" />
          <span className="font-mono text-xs font-medium text-ink-900 tabular">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <svg className="h-3 w-3 text-ink-500" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-72 animate-fade-up overflow-hidden rounded-xl border border-ink-200 bg-paper-pure shadow-xl">
              <div className="border-b border-ink-100 bg-paper-off px-4 py-3">
                <div className="text-[10px] font-medium uppercase tracking-widest text-ink-500">
                  Wallet
                </div>
                <div className="mt-1 break-all font-mono text-xs text-ink-900 tabular">
                  {address}
                </div>
              </div>
              <div className="border-b border-ink-100 px-4 py-3">
                <div className="text-[10px] font-medium uppercase tracking-widest text-ink-500">
                  Balance
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-semibold text-ink-pure tabular">
                    {balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"}
                  </span>
                  <span className="text-xs font-medium text-ink-500">zkLTC</span>
                </div>
              </div>
              <div className="px-4 py-2.5">
                <div className="flex items-center justify-between text-[11px] text-ink-500">
                  <span>Network</span>
                  <span className="flex items-center gap-1.5 font-medium text-ink-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-bull" />
                    LiteForge
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="w-full border-t border-ink-100 bg-paper-off px-4 py-3 text-left text-sm font-medium text-bear transition hover:bg-bear-light"
              >
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
    <button
      onClick={() => connector && connect({ connector })}
      disabled={isPending || !connector}
      className="btn-ink rounded-lg px-4 py-2 text-sm"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
