export const addresses = {
  factory: "0xbB2b40F1ed12F64966ac2eA6157760Da26020032" as `0x${string}`,
  // Legacy LIME (MockZkLTC with public mint) · currently used as collateral in deployed markets
  collateral: "0x967662A01D65c6a18D836365eef13De128a2caa7" as `0x${string}`,
  // Native zkLTC collateral (set when deployed). Keep empty until available.
  zkltcCollateral: "" as `0x${string}` | "",
  // LIME Token v2 · fixed supply 100M, EIP-2612 permit. Will replace legacy on mainnet.
  limeV2: "0x59a8d18113f6d64e09c3ae8a5fb3782cabea0345" as `0x${string}`,
  // USDC bridged via Arbitrum Bridge
  usdc: "0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB" as `0x${string}`,
  // Yield vaults · deployed on LitVM LiteForge (Chain 4441)
  limeVault: "0x81ba4b26174B488671791696277111566D66ea9d" as `0x${string}` | "",
  usdcVault: "0xAFf48d4c339737957b04c60E31d5Bcc1e818E842" as `0x${string}` | "",
  // Native zkLTC vault (set when deployed). Keep empty until available.
  zkltcVault: "" as `0x${string}` | "",
};

function isDeployedAddress(addr: `0x${string}` | ""): addr is `0x${string}` {
  return Boolean(addr && addr.length === 42);
}

/**
 * Primary market collateral by config:
 *  - prefers native zkLTC once configured
 *  - falls back to current legacy MockZkLTC collateral
 */
export function getPrimaryCollateralAddress(): `0x${string}` {
  return isDeployedAddress(addresses.zkltcCollateral)
    ? addresses.zkltcCollateral
    : addresses.collateral;
}

export function getPrimaryCollateralMode(): "native-zkltc" | "legacy-mock" {
  return isDeployedAddress(addresses.zkltcCollateral) ? "native-zkltc" : "legacy-mock";
}

/**
 * Primary yield vault by config:
 *  - prefers native zkLTC vault once configured
 *  - falls back to current legacy vault so testnet flow keeps working
 */
export function getPrimaryVaultAddress(): `0x${string}` | "" {
  return isDeployedAddress(addresses.zkltcVault) ? addresses.zkltcVault : addresses.limeVault;
}

export function getPrimaryVaultMode(): "native-zkltc" | "legacy-lime-vault" {
  return isDeployedAddress(addresses.zkltcVault) ? "native-zkltc" : "legacy-lime-vault";
}

// Vault ABI · matches LimeroVault.sol
export const vaultAbi = [
  { type: "function", name: "totalAssets", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalShares", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sharePrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sharesOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "convertToShares", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "convertToAssets", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
] as const;

export const factoryAbi = [
  { type: "function", name: "allMarkets", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "marketsLength", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function", name: "createMarket", stateMutability: "nonpayable",
    inputs: [
      { name: "oracle", type: "address" },
      { name: "resolutionTime", type: "uint256" },
      { name: "question", type: "string" },
    ],
    outputs: [{ name: "market", type: "address" }],
  },
] as const;

export const marketAbi = [
  { type: "function", name: "question", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "resolutionTime", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "yesPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "yesReserve", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "noReserve", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "resolved", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "winningOutcome", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "oracle", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalLiquidity", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "yesBalance", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "noBalance", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "liquidity", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  {
    type: "function", name: "buy", stateMutability: "nonpayable",
    inputs: [
      { name: "outcome", type: "uint256" },
      { name: "collateralIn", type: "uint256" },
      { name: "minOutcomeOut", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "sell", stateMutability: "nonpayable",
    inputs: [
      { name: "outcome", type: "uint256" },
      { name: "outcomeIn", type: "uint256" },
      { name: "minCollateralOut", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "addLiquidity", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "removeLiquidity", stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "resolve", stateMutability: "nonpayable",
    inputs: [{ name: "outcome", type: "uint256" }], outputs: [],
  },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "redeemLiquidity", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

export const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ type: "address" }, { type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] },
] as const;
