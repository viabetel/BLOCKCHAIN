# Limero · Architecture

Limero is a three-layer protocol. Every primitive in the codebase maps
back to exactly one layer, and layers only interact through
well-defined interfaces. This document is the canonical reference.

```
┌────────────────────────────────────────────────────────────────┐
│                       INCENTIVE ENGINE                         │
│   Points · Streaks · Curator rewards · LP incentives · $LIME   │
│                                                                │
│   Off-chain indexer + on-chain claim contracts (post-mainnet)  │
└──────────────────────┬─────────────────────────────────────────┘
                       │  reads events
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                        VAULT ENGINE                            │
│      Deposit / Withdraw · Share pricing · Market routing       │
│                                                                │
│   LimeroVault.sol · one instance per underlying (zkLTC, USDC)  │
└──────────────────────┬─────────────────────────────────────────┘
                       │  addLiquidity / removeLiquidity
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                        MARKET ENGINE                           │
│     FPMM curve · YES/NO tokens · Oracle resolution · Fees      │
│                                                                │
│   LimeroFactory.sol  →  LimeroMarket.sol (one per question)    │
└────────────────────────────────────────────────────────────────┘
```

## Layer 1 · Market engine

**Contracts:** `LimeroFactory.sol`, `LimeroMarket.sol`

**Responsibilities:**
- Create new markets via `factory.createMarket(oracle, resolutionTime, question)`
- Maintain a Fixed Product Market Maker curve per market:
  `yesReserve * noReserve = k`
- Hold YES/NO outcome-token balances per user
- Hold per-user liquidity-provider shares
- Collect 2% trading fee on every `buy` / `sell`, accrued in-reserve
- Expose `resolve(outcome)` to an authorized oracle
- Allow `redeem()` and `redeemLiquidity()` post-resolution

**Public interface (partial):**
```solidity
function buy(uint256 outcome, uint256 collateralIn, uint256 minOut) external returns (uint256);
function sell(uint256 outcome, uint256 outcomeIn, uint256 minCollateralOut) external returns (uint256);
function addLiquidity(uint256 amount) external;
function removeLiquidity(uint256 shares) external;
function resolve(uint256 outcome) external;  // oracle-only
function redeem() external;
function redeemLiquidity() external;
```

**Invariants:**
- Collateral conservation: sum of (reserves + outstanding outcome tokens)
  never exceeds `totalLiquidity` before resolution
- After resolution: `winningReserve` exactly covers redemption of
  winning outcome tokens; losing reserve is distributed to LPs
- Fee accounting: 2% of every trade stays in reserves and is implicitly
  distributed to LPs as their share grows

## Layer 2 · Vault engine

**Contracts:** `LimeroVault.sol` (one deployment per underlying asset)

**Responsibilities:**
- Accept user deposits in the underlying (zkLTC, USDC, LIME)
- Mint vault shares `vToken` priced at `totalAssets / totalShares`
- Route capital into authorized markets via `routeToMarket(market, amount)`
- Pull capital back via `pullFromMarket(market, shares)`
- Reflect fee accrual automatically: when `pullFromMarket` returns more
  underlying than was routed in, the share price rises
- Never hold user funds in an unauthorized market

**Public interface:**
```solidity
function deposit(uint256 assets) external returns (uint256 shares);
function withdraw(uint256 shares) external returns (uint256 assets);
function totalAssets() external view returns (uint256);
function sharePrice() external view returns (uint256);

// owner / curator only
function authorizeMarket(address market) external;     // onlyOwner
function routeToMarket(address market, uint256 a) external;  // onlyOwner
function pullFromMarket(address market, uint256 s) external; // onlyOwner
function harvest() external;                           // onlyOwner (no-op event)
```

**Invariants:**
- `sharePrice` never decreases in the absence of market losses
- Only authorized markets can receive vault capital
- Withdraw cannot fail due to vault-internal state (only insufficient
  liquidity at moment of pull — which is why pull-first-withdraw-second
  is the operational model)
- `rescue()` cannot touch the underlying

**Deployment plan:**

| Vault            | Underlying | Status               |
| ---------------- | ---------- | -------------------- |
| zkLTC Vault      | zkLTC      | 30-day roadmap       |
| USDC Vault       | USDC       | Deployed on testnet  |
| LIME Vault       | LIME       | Deployed (incentive) |

## Layer 3 · Incentive engine

**Status:** 60-day roadmap, off-chain indexer + on-chain claim contract.

**Responsibilities:**
- Subscribe to all `Buy`, `Sell`, `AddLiquidity`, `RemoveLiquidity`,
  `Resolve`, `Redeem` events from every market + vault
- Compute per-wallet points for:
  - Trader volume
  - LP time-weighted deposit
  - Winning outcome prediction accuracy
  - Daily/weekly streak maintenance
  - Market creation (post-permissionless)
  - Curator action (featured market selection quality)
- Publish per-season leaderboards
- Emit a Merkle root on-chain every season
- Users claim accrued $LIME (or points → LIME conversion at TGE) via
  a standard Merkle-claim contract

**Why off-chain indexer?**
- Keeps gas costs per trade low
- Gives flexibility to tune point formulas between seasons without
  redeploying market/vault contracts
- Makes the incentive layer independent of the market/vault layer
  — a failure in incentive accounting cannot corrupt core funds

## Interaction boundaries (strict)

- **Markets never read from vaults.** Markets only know that someone
  called `addLiquidity` — they don't care whether it was a human or a
  vault.
- **Vaults never read market state beyond LP share balance.** Vaults
  route in, later pull out, and observe the underlying delta.
- **Incentive engine never writes to markets or vaults.** It only
  reads events and mints points to its own ledger.

This separation is what makes the protocol auditable: each layer can
be reasoned about, tested, and upgraded independently.

## Permissionless market creation (60-day roadmap)

Today, `factory.createMarket` has no caller restriction, but the UI
only surfaces it via the admin panel. The 60-day change:

1. **Public creation UI** at `/create-market` — any wallet can deploy
   a market by paying a small zkLTC bond.
2. **Curator featured layer** — admin panel evolves into a curator
   console that *flags* markets as Featured; featured markets get
   vault liquidity routing priority.
3. **Bond + cooldown** — creator posts 10 zkLTC bond returned at
   resolution; spam markets are filtered by cost, not by gating.

This is the single biggest architectural shift on the testnet roadmap
and the one that pushes Limero from "admin-centric" to "ecosystem
primitive."
