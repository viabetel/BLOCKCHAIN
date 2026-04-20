/**
 * Central token metadata registry.
 *
 * Three tokens matter in the Limero ecosystem:
 *
 *  - zkLTC: native gas token on LitVM LiteForge (decimals: 18)
 *    Backed 1:1 by LTC via BitcoinOS Grail Bridge.
 *
 *  - $LIME: our ERC20 collateral token (decimals: 18)
 *    Currently a MockERC20 with public mint() for testnet onboarding.
 *    Mainnet v2 will be a fixed-supply ERC20.
 *
 *  - USDC: Circle's stablecoin bridged via Arbitrum Bridge (decimals: 6!)
 *    Not deployed by us — it's the canonical USDC bridged to LitVM.
 *
 * IMPORTANT: USDC uses 6 decimals, all others use 18. Every parseUnits/
 * formatUnits call MUST pass the correct decimals.
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
  role: "native-gas" | "collateral" | "stable-reference";
  /** Faucet URL if applicable */
  faucetUrl?: string;
};

export const TOKENS = {
  zkLTC: {
    address: undefined, // native
    symbol: "zkLTC",
    name: "LitVM zkLTC",
    decimals: 18,
    description: "Native gas token. 1:1 backed by LTC via BitcoinOS Grail Bridge.",
    role: "native-gas",
    faucetUrl: "https://testnet.litvm.com",
  } satisfies TokenMeta,

  LIME: {
    address: "0x967662A01D65c6a18D836365eef13De128a2caa7",
    symbol: "LIME",
    name: "Limero Token",
    decimals: 18,
    description: "Native protocol token. Powers markets, liquidity and growth.",
    role: "collateral",
    faucetUrl: undefined, // handled in-app via mint()
  } satisfies TokenMeta,

  USDC: {
    address: "0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6, // CRITICAL — different from LIME/zkLTC
    description: "USDC bridged via Arbitrum Bridge. Stable reference.",
    role: "stable-reference",
    faucetUrl: "https://faucet.circle.com", // Circle official USDC faucet
  } satisfies TokenMeta,
} as const;

export type TokenKey = keyof typeof TOKENS;

/** Get metadata by symbol */
export function getToken(symbol: TokenKey): TokenMeta {
  return TOKENS[symbol];
}
