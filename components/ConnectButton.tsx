"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono transition hover:border-zinc-600"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const connector = connectors[0];
  return (
    <button
      onClick={() => connector && connect({ connector })}
      disabled={isPending || !connector}
      className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
