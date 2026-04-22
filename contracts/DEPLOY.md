# Limero Contract Deployment

## TL;DR

All deployments are now done **directly from the site's Admin panel**.
No Remix, no external HTML. Just connect wallet → click Deploy.

Path: `/admin` → scroll to "Deploy contracts" section.

## Current on-chain addresses (LitVM LiteForge · Chain 4441)

```
Factory (MarketFactory v1):  0xbB2b40F1ed12F64966ac2eA6157760Da26020032
MockZkLTC (legacy LIME):     0x967662A01D65c6a18D836365eef13De128a2caa7
USDC bridged (Circle):       0x5adf1045C4a7C3e2176DbCbD09a7E6D1b0f75cfB
LimeVault (vLIME):           0x81ba4b26174B488671791696277111566D66ea9d
UsdcVault (vUSDC):           0xAFf48d4c339737957b04c60E31d5Bcc1e818E842
```

## Contracts in this repo

### `LimeToken.sol` — v2, production-grade
- Fixed supply: 100,000,000 LIME minted at deploy to deployer wallet
- EIP-2612 Permit (gasless approvals)
- No mint post-deploy — no backdoors
- When deployed, replaces the legacy `MockZkLTC` in the config

### `LimeroVault.sol` — deposit vault
- Accepts any ERC-20 underlying
- Mints share tokens (vLIME / vUSDC)
- Share price = totalAssets / totalShares (rises as fees accrue)
- Owner-managed routing to authorized markets

## Deploy flow (from Admin panel)

1. Connect admin wallet (`0x375c...f256`)
2. Open `/admin`
3. Scroll to **"Deploy contracts"** card at the top
4. For LIME Token: click **Deploy LIME Token** → confirm in MetaMask
5. For Vaults: click **Preset: LIME** or **Preset: USDC**, then **Deploy Vault**
6. Copy deployed address from the green result banner
7. Paste into `lib/contracts.ts` → `addresses.{limeVault|usdcVault|collateral}`
8. Redeploy site to Vercel

## Migration note (zkLTC-first)

When native zkLTC collateral/vault are deployed, update:

- `addresses.zkltcCollateral`
- `addresses.zkltcVault`

The frontend now resolves primary collateral/vault from those fields first,
falling back to legacy `collateral`/`limeVault` when unset.

## Why no more Remix

The admin page now uses `viem.encodeDeployData` + `walletClient.sendTransaction`
to deploy precompiled bytecode directly through the connected wallet. Same
result, zero copy-paste, automatic transaction tracking, explorer link built in.

Bytecodes live in `lib/bytecodes.ts` — regenerate by running the
compile script if contracts change (see `/tmp/compile-lime.js` for reference).
