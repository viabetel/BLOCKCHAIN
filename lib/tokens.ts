/**
 * Central token metadata registry.
 *
 * ============================================================
 * PROTOCOL ECONOMIC HIERARCHY (v19 · LitVM-aligned)
 * ============================================================
 *
 *  PRIMARY · zkLTC (native gas + primary collateral)
 *     The economic core of Limero. zkLTC is LTC bridged 1:1 via
 *     BitcoinOS Grail into LitVM. All vault-backed liquidity, fee
 *     accrual, and protocol TVL are denominated in zkLTC. This is
 *     how Limero expands LTC utility on LitVM.
 *
 *  COMPLEMENTARY · USDC (stable reference)
 *     Bridged via Arbitrum Bridge. Used for stable-denominated
 *     markets where volatility hedging matters. Complementary,
 *     not central.
 *
 *  INCENTIVE · $LIME (protocol rewards / points-layer)
 *     Limero's native protocol token. Used for incentives,
 *     curator rewards, airdrops, and governance (post-mainnet).
 *     During testnet, LIME is distributed via faucet/mint to
 *     bootstrap market activity; mainnet v2 is fixed-supply
 *     ERC-20 with permit. LIME is NOT the primary collateral
 *     asset of the protocol.
 *
 *  IMPORTANT: USDC uses 6 decimals, zkLTC and LIME use 18.
 *  Every parseUnits / formatUnits call MUST pass the correct
 *  decimals for the token.
 */

export type TokenMeta = {
  /** On-chain ERC20 address (undefined for native zkLTC gas token) */
  address: `0x${string}` | undefined;
  symbol: string;
  name: string;
  decimals: number;
  /** Short description shown in UIs */
  description: string;
  /** Role in the Limero protocol */
  role: "primary-collateral" | "stable-reference" | "incentive-layer";
  /** Faucet URL if applicable */
  faucetUrl?: string;
};

export const TOKENS = {
  zkLTC: {
    address: undefined, // native
    symbol: "zkLTC",
    name: "LitVM zkLTC",
    decimals: 18,
    description:
      "Primary economic asset. LTC bridged 1:1 via BitcoinOS Grail. Native gas and main collateral across Limero vaults and markets.",
    role: "primary-collateral",
    faucetUrl: "https://testnet.litvm.com",
  } satisfies TokenMeta,

  USDC: {
    address: "0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6, // CRITICAL · different from zkLTC/LIME
    description:
      "Stable reference collateral for USD-denominated markets. Bridged to LitVM via Arbitrum Bridge.",
    role: "stable-reference",
    faucetUrl: "https://faucet.circle.com",
  } satisfies TokenMeta,

  LIME: {
    address: "0x967662A01D65c6a18D836365eef13De128a2caa7",
    symbol: "LIME",
    name: "Limero Token",
    decimals: 18,
    description:
      "Protocol incentive token. Powers points, curator rewards and future governance. Not the primary collateral.",
    role: "incentive-layer",
    faucetUrl: undefined, // handled in-app via mint()
  } satisfies TokenMeta,
} as const;

export type TokenKey = keyof typeof TOKENS;

/** Get metadata by symbol */
export function getToken(symbol: TokenKey): TokenMeta {
  return TOKENS[symbol];
}
