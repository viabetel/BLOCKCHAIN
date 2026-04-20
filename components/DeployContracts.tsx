"use client";

import { useState } from "react";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodeDeployData } from "viem";
import {
  LIME_TOKEN_BYTECODE,
  LIMERO_VAULT_BYTECODE,
  LIME_TOKEN_ABI,
  LIMERO_VAULT_CONSTRUCTOR_ABI,
} from "@/lib/bytecodes";
import { Logo } from "@/components/Logo";

type DeploymentResult = {
  contract: string;
  address: `0x${string}`;
  txHash: `0x${string}`;
};

/**
 * Admin-only panel for deploying protocol contracts directly from the browser.
 *
 * Supports:
 *  - LimeToken (fixed-supply LIME v2, 100M initial supply to deployer)
 *  - LimeroVault (LIME or USDC, configurable name/symbol)
 *
 * All deploys go through the connected wallet via wagmi. No Remix required.
 */
export function DeployContracts() {
  return (
    <div className="card-glass overflow-hidden rounded-2xl">
      <div className="border-b border-space-border bg-space-deep/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="terminal-pill">ADMIN · DEPLOY</span>
              <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-purple-300">
                Onchain
              </span>
            </div>
            <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-text-primary">
              Deploy contracts
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Launch protocol contracts directly to LitVM LiteForge through
              your connected wallet.
            </p>
          </div>
          <Logo className="h-9 w-9 text-lime-400 opacity-60" />
        </div>
      </div>

      <div className="divide-y divide-space-border">
        <LimeTokenDeployer />
        <VaultDeployer />
      </div>
    </div>
  );
}

/* -------------- LIME Token deployer -------------- */

function LimeTokenDeployer() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deploy = async () => {
    if (!walletClient || !publicClient || !address) {
      setError("Connect wallet first");
      return;
    }
    setPending(true);
    setError(null);
    setResult(null);

    try {
      const deployData = encodeDeployData({
        abi: LIME_TOKEN_ABI,
        bytecode: LIME_TOKEN_BYTECODE,
        args: [],
      });

      const txHash = await walletClient.sendTransaction({
        data: deployData,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (!receipt.contractAddress) {
        throw new Error("No contract address in receipt");
      }
      setResult({
        contract: "LimeToken",
        address: receipt.contractAddress,
        txHash,
      });
    } catch (e: any) {
      setError(e.shortMessage || e.message || "Deploy failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <DeploySection
      title="LIME Token (v2)"
      subtitle="Fixed supply · 100,000,000 LIME"
      description="Production-grade ERC-20 with EIP-2612 Permit. Total supply minted to deployer at creation. No mint after deploy."
      deployed={Boolean(result)}
      contractName="LimeToken"
    >
      <div className="grid grid-cols-3 gap-2">
        <MetaRow label="Name" value="Limero" />
        <MetaRow label="Symbol" value="LIME" />
        <MetaRow label="Decimals" value="18" />
        <MetaRow label="Initial supply" value="100,000,000" span2 />
        <MetaRow label="Permit" value="EIP-2612" />
      </div>

      <DeployButton
        onClick={deploy}
        disabled={!isConnected || pending}
        pending={pending}
        label="Deploy LIME Token"
      />

      {error && <ErrorBanner message={error} />}
      {result && <ResultBanner result={result} label="LIME Token" />}
    </DeploySection>
  );
}

/* -------------- Vault deployer -------------- */

function VaultDeployer() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [underlying, setUnderlying] = useState("");
  const [vaultName, setVaultName] = useState("Limero LIME Vault");
  const [vaultSymbol, setVaultSymbol] = useState("vLIME");

  const deploy = async () => {
    if (!walletClient || !publicClient || !address) {
      setError("Connect wallet first");
      return;
    }
    if (!underlying.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Invalid underlying token address");
      return;
    }
    setPending(true);
    setError(null);
    setResult(null);

    try {
      const deployData = encodeDeployData({
        abi: LIMERO_VAULT_CONSTRUCTOR_ABI,
        bytecode: LIMERO_VAULT_BYTECODE,
        args: [underlying as `0x${string}`, vaultName, vaultSymbol],
      });

      const txHash = await walletClient.sendTransaction({
        data: deployData,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (!receipt.contractAddress) {
        throw new Error("No contract address in receipt");
      }
      setResult({
        contract: "LimeroVault",
        address: receipt.contractAddress,
        txHash,
      });
    } catch (e: any) {
      setError(e.shortMessage || e.message || "Deploy failed");
    } finally {
      setPending(false);
    }
  };

  const presetLime = () => {
    setUnderlying("0x967662A01D65c6a18D836365eef13De128a2caa7");
    setVaultName("Limero LIME Vault");
    setVaultSymbol("vLIME");
  };
  const presetUsdc = () => {
    setUnderlying("0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB");
    setVaultName("Limero USDC Vault");
    setVaultSymbol("vUSDC");
  };

  return (
    <DeploySection
      title="Yield Vault"
      subtitle="LIME or USDC backing"
      description="Deposit-only vault that routes liquidity to markets. Share price rises as fees accrue."
      deployed={Boolean(result)}
      contractName="LimeroVault"
    >
      {/* Presets */}
      <div className="flex gap-2">
        <button
          onClick={presetLime}
          className="flex-1 rounded-lg border border-space-border bg-space-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary transition hover:border-lime-500/40 hover:text-lime-300"
        >
          Preset: LIME
        </button>
        <button
          onClick={presetUsdc}
          className="flex-1 rounded-lg border border-space-border bg-space-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary transition hover:border-blue-500/40 hover:text-blue-300"
        >
          Preset: USDC
        </button>
      </div>

      {/* Form */}
      <div className="space-y-2">
        <InputField
          label="Underlying token"
          value={underlying}
          onChange={setUnderlying}
          placeholder="0x..."
          mono
        />
        <div className="grid grid-cols-2 gap-2">
          <InputField
            label="Vault name"
            value={vaultName}
            onChange={setVaultName}
            placeholder="Limero LIME Vault"
          />
          <InputField
            label="Vault symbol"
            value={vaultSymbol}
            onChange={setVaultSymbol}
            placeholder="vLIME"
          />
        </div>
      </div>

      <DeployButton
        onClick={deploy}
        disabled={!isConnected || pending || !underlying}
        pending={pending}
        label="Deploy Vault"
      />

      {error && <ErrorBanner message={error} />}
      {result && <ResultBanner result={result} label="Vault" />}
    </DeploySection>
  );
}

/* -------------- Shared UI -------------- */

function DeploySection({
  title,
  subtitle,
  description,
  children,
  deployed,
  contractName,
}: {
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  deployed?: boolean;
  contractName: string;
}) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display text-base font-bold tracking-tight text-text-primary">
              {title}
            </h4>
            {deployed && (
              <span className="rounded-md border border-lime-500/30 bg-lime-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-lime-300">
                Deployed
              </span>
            )}
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {contractName}.sol
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-muted">{subtitle}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-space-border bg-space-deep/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-lime-500/50 focus:outline-none ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

function MetaRow({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={`rounded-lg border border-space-border bg-space-deep/40 px-3 py-2 ${span2 ? "col-span-2" : ""}`}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xs font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function DeployButton({
  onClick,
  disabled,
  pending,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-lime w-full rounded-lg px-4 py-2.5 text-sm"
    >
      {pending ? "Deploying..." : label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-300">
      ✗ {message}
    </div>
  );
}

function ResultBanner({ result, label }: { result: DeploymentResult; label: string }) {
  const copy = (text: string) => navigator.clipboard.writeText(text);
  return (
    <div className="space-y-2 rounded-lg border border-lime-500/30 bg-lime-500/5 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-lime-300">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />✓ {label} deployed
      </div>
      <div className="flex items-center justify-between gap-2 rounded border border-space-border bg-space-deep/60 px-2 py-1.5">
        <span className="break-all font-mono text-[10px] text-text-primary">{result.address}</span>
        <button
          onClick={() => copy(result.address)}
          className="shrink-0 rounded border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-lime-300 hover:bg-lime-500/20"
        >
          Copy
        </button>
      </div>
      <a
        href={`https://liteforge.explorer.caldera.xyz/tx/${result.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-lime-300"
      >
        View tx on LitVM Explorer
        <span>↗</span>
      </a>
    </div>
  );
}
