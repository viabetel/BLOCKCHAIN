"use client";

import { useAccount, useBalance, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatEther } from "viem";
import { liteforge } from "@/lib/wagmi";
import { useState } from "react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [open, setOpen] = useState(false);

  const wrongChain = isConnected && chainId !== liteforge.id;

  if (wrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: liteforge.id })}
        className="btn-secondary group flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
      >
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-bear" />
        <span>Switch to LiteForge</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="btn-secondary flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-bull shadow-[0_0_8px_rgba(63,185,129,0.6)]" />
            <span className="text-[11px] uppercase tracking-widest text-silver-400">LiteForge</span>
          </span>
          <span className="h-3 w-px bg-silver-800" />
          <span className="font-mono text-xs tabular">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-72 animate-fade-up overflow-hidden rounded-xl border border-silver-800 bg-ink-100 shadow-2xl">
              <div className="border-b border-silver-800 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-silver-500">
                  Connected Account
                </div>
                <div className="mt-1 font-mono text-xs text-silver-200 tabular">
                  {address}
                </div>
              </div>
              <div className="border-b border-silver-800 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-silver-500">
                  Balance
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-lg text-silver-100 tabular">
                    {balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"}
                  </span>
                  <span className="text-xs text-silver-400">zkLTC</span>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-silver-300 transition hover:bg-ink-200"
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
      className="btn-primary rounded-lg px-4 py-2 text-sm"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
