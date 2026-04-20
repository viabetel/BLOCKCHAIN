# Limero Vault Deployment Guide

## Overview

Two vault contracts to deploy via Remix on LitVM LiteForge testnet:
- **LIME Vault** — accepts $LIME deposits, provides liquidity to $LIME-collateralized markets
- **USDC Vault** — accepts USDC deposits, provides liquidity to USDC-collateralized markets (future)

Both use the same `LimeroVault.sol` contract, just different constructor parameters.

## Prerequisites

- Remix IDE: https://remix.ethereum.org
- MetaMask connected to **LitVM LiteForge (Chain 4441)**
- Some zkLTC for gas (get from https://testnet.litvm.com)

## Step 1 — Deploy LIME Vault

1. Open Remix, create new file `LimeroVault.sol`, paste the entire contract
2. Compile with Solidity `0.8.20` or higher (optimization: 200 runs)
3. In "Deploy & Run Transactions":
   - Environment: **Injected Provider - MetaMask**
   - Ensure wallet is on Chain 4441
   - Contract: `LimeroVault`
   - Constructor parameters:
     - `_underlying`: `0x967662A01D65c6a18D836365eef13De128a2caa7` (LIME token)
     - `_name`: `"Limero LIME Vault"`
     - `_symbol`: `"vLIME"`
4. Deploy and confirm in MetaMask
5. **Copy the deployed address → this is `LIME_VAULT_ADDRESS`**

## Step 2 — Deploy USDC Vault

Same steps, different params:
   - `_underlying`: `0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB` (USDC bridged)
   - `_name`: `"Limero USDC Vault"`
   - `_symbol`: `"vUSDC"`

**Copy the deployed address → this is `USDC_VAULT_ADDRESS`**

## Step 3 — Authorize markets (optional for first demo)

For each of your existing markets you want the vault to supply liquidity to:

```
LimeroVault.authorizeMarket(0x... market address)
```

You can do this from the vault's Remix UI using the deployed instance.

## Step 4 — Tell me the addresses

Send me in the next message:
```
LIME_VAULT = 0x...
USDC_VAULT = 0x...
```

I'll update `lib/tokens.ts` and `lib/contracts.ts`, and the Vaults UI will go live.

## Technical notes

**Share price mechanism:**
- First depositor gets 1:1 shares (share price = 1e18)
- As fees accrue in the vault's balance, `sharePrice()` rises above 1e18
- Later depositors get fewer shares for the same amount (fair to existing holders)
- Withdrawers always get `shares × currentSharePrice` in underlying

**Why no ERC4626:**
- Full ERC4626 compliance would add ~200 lines and we don't need the extra surface area
- We have the core: `deposit()`, `withdraw()`, `convertToAssets()`, `convertToShares()`

**Decimals:**
- The vault inherits `decimals()` from the underlying token at deploy time
- vLIME will have 18 decimals (same as LIME)
- vUSDC will have 6 decimals (same as USDC)

**Security considerations:**
- Reentrancy-guarded on all state-changing functions
- CEI (Checks-Effects-Interactions) pattern in deposit/withdraw
- Owner can only route to AUTHORIZED markets
- `rescue()` cannot pull the underlying token (prevents rug)
- No emergency pause — simplicity trade-off for testnet
- No `upgrade` path — testnet is disposable

**Funding the first market:**
After users deposit some LIME, you (owner) can call:
```
routeToMarket(marketAddress, amount)
```
This calls the market's `addLiquidity(amount)` using the vault's LIME.
The vault now holds LP shares in that market.

When you want to realize fees:
```
pullFromMarket(marketAddress, liqShares)
```
LP shares burn, vault gets back underlying + accrued fees. Share price rises.
