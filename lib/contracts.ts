export const addresses = {
  factory: "0xbB2b40F1ed12F64966ac2eA6157760Da26020032" as `0x${string}`,
  collateral: "0x967662A01D65c6a18D836365eef13De128a2caa7" as `0x${string}`,
  usdc: "0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB" as `0x${string}`,
  // Vault addresses — set after deployment via Remix
  // If empty string "" the UI shows "Vault pending deployment"
  limeVault: "" as `0x${string}` | "",
  usdcVault: "" as `0x${string}` | "",
};

// Vault ABI — matches LimeroVault.sol
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
