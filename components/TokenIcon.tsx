"use client";

import { useMemo } from "react";

// Trust Wallet Assets CDN - open-source MIT licensed token icons
// https://github.com/trustwallet/assets
const TRUSTWALLET_BASE = "https://assets-cdn.trustwallet.com/blockchains";

type TokenSymbol = "LTC" | "BTC" | "ETH" | "USDC" | "USDT" | "SOL" | "ARB" | "MATIC";

const TOKEN_MAP: Record<TokenSymbol, string> = {
  LTC: `${TRUSTWALLET_BASE}/litecoin/info/logo.png`,
  BTC: `${TRUSTWALLET_BASE}/bitcoin/info/logo.png`,
  ETH: `${TRUSTWALLET_BASE}/ethereum/info/logo.png`,
  USDC: `${TRUSTWALLET_BASE}/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
  USDT: `${TRUSTWALLET_BASE}/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
  SOL: `${TRUSTWALLET_BASE}/solana/info/logo.png`,
  ARB: `${TRUSTWALLET_BASE}/arbitrum/info/logo.png`,
  MATIC: `${TRUSTWALLET_BASE}/polygon/info/logo.png`,
};

// Brand accent colors (for fallback backgrounds)
const BRAND_COLORS: Record<TokenSymbol, string> = {
  LTC: "#345D9D",
  BTC: "#F7931A",
  ETH: "#627EEA",
  USDC: "#2775CA",
  USDT: "#26A17B",
  SOL: "#14F195",
  ARB: "#28A0F0",
  MATIC: "#8247E5",
};

export function TokenIcon({
  symbol,
  size = 24,
  className = "",
}: {
  symbol: TokenSymbol;
  size?: number;
  className?: string;
}) {
  const url = TOKEN_MAP[symbol];
  return (
    <img
      src={url}
      alt={symbol}
      width={size}
      height={size}
      className={`inline-block rounded-full ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={(e) => {
        // Fallback to colored circle with symbol if image fails
        const el = e.currentTarget;
        el.style.display = "none";
        const next = el.nextElementSibling as HTMLElement | null;
        if (next) next.style.display = "inline-flex";
      }}
    />
  );
}

/**
 * Detect which tokens are referenced in a market question and return icons.
 */
export function TokensFromQuestion({ question, size = 20 }: { question: string; size?: number }) {
  const tokens = useMemo(() => detectTokens(question), [question]);
  if (tokens.length === 0) return null;

  return (
    <div className="flex items-center -space-x-1.5">
      {tokens.map((t) => (
        <div
          key={t}
          className="flex items-center justify-center rounded-full border-2 border-space-elevated bg-space-elevated"
          style={{ width: size + 4, height: size + 4 }}
        >
          <TokenIcon symbol={t} size={size} />
        </div>
      ))}
    </div>
  );
}

function detectTokens(q: string): TokenSymbol[] {
  const lower = q.toLowerCase();
  const found: TokenSymbol[] = [];
  if (/\bltc\b|litecoin/.test(lower)) found.push("LTC");
  if (/\bbtc\b|bitcoin/.test(lower)) found.push("BTC");
  if (/\beth\b|ethereum/.test(lower)) found.push("ETH");
  if (/\busdc\b/.test(lower)) found.push("USDC");
  if (/\busdt\b|tether/.test(lower)) found.push("USDT");
  if (/\bsol\b|solana/.test(lower)) found.push("SOL");
  return found;
}

// Official LitVM infrastructure partners (verifiable on docs.litvm.com)
// No false sponsorship claims · only infra/stack providers.
export const ECOSYSTEM_PARTNERS = [
  { name: "LitVM", role: "L2 rollup", color: "#22d3ee" },
  { name: "Arbitrum Orbit", role: "Stack", color: "#28A0F0" },
  { name: "Caldera", role: "Infra", color: "#ef4444" },
  { name: "Espresso", role: "Sequencer", color: "#a855f7" },
];
