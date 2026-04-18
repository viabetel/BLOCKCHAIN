# Silvercast

> Hard money prediction markets on LitVM. Binary YES/NO markets, denominated in zkLTC, using an FPMM — same model as Gnosis/Polymarket's original AMM.

**LiteForge testnet** · Chain ID `4441` · RPC `https://liteforge.rpc.caldera.xyz/http` · Explorer `https://liteforge.explorer.caldera.xyz`

---

## What's here

```
silvercast/
├── contracts/          Foundry project — Market, MarketFactory, MockZkLTC
│   ├── src/
│   ├── test/
│   ├── script/
│   └── foundry.toml
└── frontend/           Next.js 14 + wagmi v2 + RainbowKit
    ├── app/
    ├── components/
    └── lib/
```

## Contracts

**`Market.sol`** — one contract per market. Holds zkLTC as collateral, issues YES/NO outcome tokens via an FPMM. Key functions:

- `addLiquidity(amount)` — seed the pool; first LP sets 50/50 price
- `removeLiquidity(shares)` — pull proportional collateral + any skewed outcome tokens
- `buy(outcome, collateralIn, minOut)` — buy YES (`1`) or NO (`0`) with zkLTC
- `sell(outcome, outcomeIn, minOut)` — swap outcome tokens back for collateral
- `resolve(outcome)` — oracle-only, after `resolutionTime`. Snapshots reserves for LP payouts.
- `redeem()` — winning outcome tokens → 1:1 zkLTC after resolution
- `redeemLiquidity()` — LPs claim their share of the winning side

**Trading fee**: 2% per trade, kept as `accumulatedFees` in the contract (claimable in v2).

**`MarketFactory.sol`** — deploys `Market` instances and indexes them.

**`MockZkLTC.sol`** — test-only ERC20; real zkLTC is the LitVM gas token.

## Quickstart

### 1. Contracts

```bash
cd contracts
forge init --force --no-git --no-commit .
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge test -vv
```

### 2. Deploy on local anvil

```bash
anvil &
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 3. Deploy on LiteForge testnet

```bash
export PRIVATE_KEY=0x...            # your deployer key (have some zkLTC from the faucet)
export ORACLE=0x...                 # address that can resolve (you, for v1)

forge script script/Deploy.s.sol \
  --rpc-url https://liteforge.rpc.caldera.xyz/http \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Faucet: https://liteforge.hub.caldera.xyz/

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
# paste factory + collateral addresses from the deploy logs
pnpm install    # or npm / yarn / bun
pnpm dev
```

Open http://localhost:3000.

---

## How the AMM works (in 30 seconds)

For each market, the pool holds equal amounts of YES and NO outcome tokens, tracked as `yesReserve` and `noReserve`. The invariant is `yesReserve * noReserve = k`.

**Buying YES with `X` zkLTC:**
1. Mint `X` YES and `X` NO into the pool (reserves both grow by `X`).
2. Keep `newNoReserve = noReserve + X`. Solve for the `newYesReserve` that preserves `k`.
3. The difference `(yesReserve + X) - newYesReserve` is what the buyer receives.

**Marginal YES price** = `noReserve / (yesReserve + noReserve)` ∈ [0, 1]. Always sums to 1 with NO price — that's the probability interpretation.

**On resolution**, winning outcome tokens redeem 1:1 for zkLTC. Losing side → 0. LPs get their share of the winning-side reserve.

---

## Roadmap

### v1 — Testnet MVP (this repo)
- [x] Binary FPMM market
- [x] Factory + indexing
- [x] Manual/trusted oracle (you resolve via `resolve()`)
- [x] Minimal frontend (list + detail + trade box)

### v1.5 — Polish for Builders Program submission
- [ ] Fee collection + claim
- [ ] Indexer (Ponder or minimal Subgraph) — markets, trades, prices
- [ ] Price history chart on market page
- [ ] Share liquidity UI (add/remove LP)
- [ ] 3–5 seeded markets themed on LitVM itself ("Will the Builders Program hit 200 teams?", "$LITVM TGE before Sep 2026?", LTC price targets)

### v2 — Post-TGE
- [ ] UMA Optimistic Oracle integration (replace manual resolution)
- [ ] Scalar markets (Kalshi-style ranges)
- [ ] Categorical markets (>2 outcomes) via ERC1155 outcome tokens
- [ ] Creator-set fees + market creator revenue share
- [ ] Limit orders (CTF-style orderbook on top of FPMM)

---

## Known gaps / things to verify before mainnet

- No auditing yet — contracts are *fine* for testnet, not production.
- `sell()` quadratic solver uses integer `sqrt`; rounding favors the pool, which is acceptable but worth fuzzing.
- Oracle is trusted in v1 by design. Do **not** re-use this oracle model on mainnet without Optimistic Oracle / multisig / timelock.
- `accumulatedFees` is tracked but not yet withdrawable.
- No pause / emergency stop.

---

## References

- LitVM docs: https://docs.litvm.com
- LiteForge testnet hub: https://testnet.litvm.com
- Builders Program: https://builders.litvm.com
- Gnosis FPMM (reference implementation): https://github.com/gnosis/conditional-tokens-market-makers
- Polymarket CTF Exchange: https://github.com/Polymarket/ctf-exchange
