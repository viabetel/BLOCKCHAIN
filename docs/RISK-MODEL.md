# Limero · Risk Model

Every risk category that a serious LitVM reviewer should ask about,
answered honestly. No hand-waving.

---

## 1. Oracle & market resolution

### Current design (testnet)

Each market is deployed with an `oracle` address, set at creation time.
Only that oracle can call `resolve(outcome)`. Outside of the
resolution-time window, `resolve` reverts.

**On the current testnet, the oracle is the protocol admin wallet.**
This is acceptable for testnet demonstration but explicitly not
acceptable for mainnet.

### Resolution states a market can reach

| State                           | Behavior                                         |
| ------------------------------- | ------------------------------------------------ |
| Active, pre-resolution          | `buy`, `sell`, `addLiquidity`, `removeLiquidity` |
| Past resolutionTime, unresolved | Trading halts; oracle can resolve                |
| Resolved                        | `redeem`, `redeemLiquidity` only                 |

### Ambiguous-outcome policy

For markets where the outcome is genuinely contested (e.g. a delayed
event, a technical failure to measure):

- **Testnet:** oracle may extend `resolutionTime` by up to 30 days
  via a governance-only function (not yet implemented on-chain,
  covered manually by pausing trading via admin).
- **Mainnet plan:** integrate UMA Optimistic Oracle for every market.
  Anyone can propose an outcome; any other party can dispute within
  48 hours by posting a bond. Disputes escalate to UMA's voting
  system. Limero never has unilateral resolution power.

### Oracle failure fallback

If the oracle is unreachable or refuses to resolve:

- **Testnet:** manual intervention by admin via governance function
  to set a fallback oracle.
- **Mainnet:** UMA provides sovereign dispute resolution; Limero
  protocol cannot override a finalized UMA outcome.

## 2. Access control

### Market engine

| Action               | Permission                             |
| -------------------- | -------------------------------------- |
| `createMarket`       | Anyone (currently; gated by UI today)  |
| `buy` / `sell`       | Anyone                                 |
| `addLiquidity`       | Anyone                                 |
| `removeLiquidity`    | Only the LP themselves (by share bal)  |
| `resolve`            | Only the oracle address of that market |
| `redeem`             | Anyone with winning outcome balance    |
| `redeemLiquidity`    | Anyone with LP shares                  |

### Vault engine

| Action               | Permission                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `deposit`            | Anyone                                                            |
| `withdraw`           | Only the depositor themselves (by share balance)                  |
| `authorizeMarket`    | Only `owner`                                                      |
| `routeToMarket`      | Only `owner` (and only to authorized markets)                     |
| `pullFromMarket`     | Only `owner` (and only from authorized markets)                   |
| `rescue`             | Only `owner` — explicitly reverts if token is the underlying      |
| `transferOwnership`  | Only `owner`                                                      |

**Owner powers in scope:** route vault capital in/out of authorized
markets; authorize new markets; transfer ownership; rescue
mistakenly-sent ERC-20s that are NOT the underlying.

**Owner powers NOT in scope:**
- Cannot touch user shares directly
- Cannot touch underlying balance outside of market routing
- Cannot change share accounting formula
- Cannot mint shares
- Cannot block withdraws

### Pausable?

- **Markets:** no pause function today. Trading can only be halted by
  letting `resolutionTime` pass.
- **Vaults:** no pause function today. 60-day roadmap: add
  `pauseDeposits()` (does not block withdrawals) for emergency.

### Ownership roadmap

- **Testnet:** single EOA owner for speed of iteration.
- **Pre-mainnet:** 2-of-3 multisig (Limero core + 1 external LitVM
  signer + 1 security advisor).
- **Post-mainnet v2:** transition to DAO governance with timelock.

## 3. Vault routing risk

### Scenario: routed market resolves against vault-held LP

Vaults hold LP shares in markets. LP shares entitle the holder to a
proportional slice of the winning-outcome reserve after resolution.
If a market resolves, the vault's LP position is worth
`(winningReserve * vaultLPshares) / totalLPshares`, minus the losing
reserve already paid out.

**Net effect on vault share price:**
- Vault receives back the LP share of the *total* collateral in the
  market at resolution (regardless of outcome), plus its 2% fee share
- Vault share price is therefore bounded below only by the market
  resolving at an extreme skew before the vault can `pullFromMarket`
- In practice, impermanent loss from skew is small relative to
  accumulated fee income over the life of a market

**Mitigation:**
- Vault diversification across many markets — one catastrophic
  outcome is diluted
- Owner can call `pullFromMarket` at any time to reduce exposure
  to a specific market
- 60-day roadmap: per-market exposure cap (e.g. no single market
  may hold > 10% of vault TVL)

### Scenario: owner routes to a malicious market

Not possible: `authorizeMarket` is required first. Only markets
deployed via `LimeroFactory` should be authorized. This is an
operational discipline enforced by the deployment runbook; 60-day
roadmap makes it on-chain by requiring markets to have a factory
signature.

## 4. Smart contract risk

### Reentrancy

All user-facing vault functions (`deposit`, `withdraw`) use a
`nonReentrant` modifier. Follow CEI: state changes happen before
external token transfers.

### Integer overflow

Solidity ≥ 0.8.0 panics on overflow; explicit `unchecked` blocks are
only used in arithmetic we've verified cannot underflow (e.g.
allowance decrements after bounds check).

### External token risk

Underlying ERC-20s (USDC, zkLTC, LIME) are treated as adversarial.
Return values of `transfer` / `transferFrom` are checked and revert
on false. Non-standard tokens (fee-on-transfer, rebasing) are NOT
supported.

### Known simplifications on testnet

- `LIME` testnet collateral is a MockZkLTC with a public `mint()`
  for faucet onboarding. Mainnet LIME is fixed-supply with permit
  (see `LimeToken.sol`).
- Vault `totalAssets()` only counts direct balance, not assets
  currently routed to markets. This means during the window between
  `routeToMarket` and `pullFromMarket`, the vault's reported TVL is
  understated. Withdraws during that window may fail if vault has
  insufficient unrouted balance — operational mitigation:
  owner maintains a liquidity buffer.

## 5. Economic risk

### Fee-share model

- Trading fee: 2% of trade size, stays in market reserves
- LP share of fees: proportional to LP's share of total liquidity
- Vault share of fees: proportional to vault's share of total LP

This implicitly distributes fees without explicit fee-collection
logic. Risk: if a market has very thin liquidity outside the vault,
the vault effectively pays fees to itself (neutral, not a loss).

### Bootstrap concentration

During testnet, vaults may be majority-funded by the protocol to
seed liquidity. This is explicitly time-bounded and disclosed.
Post-testnet target: external LPs hold ≥ 70% of vault shares.

## 6. Audit & security plan

- **Pre-mainnet:** one external audit via a LitVM-program-approved
  firm (e.g. Sherlock, Trail of Bits, OpenZeppelin). Scope: all
  market, vault, and incentive-claim contracts.
- **Ongoing:** Immunefi-style bug bounty at mainnet launch, minimum
  $25k critical-bug reward.
- **Testing:** Foundry test suite targeting 85%+ line coverage for
  market and vault contracts before mainnet.
- **Monitoring:** Tenderly alerts on all owner-only vault functions;
  public transparency dashboard showing every `authorizeMarket`,
  `routeToMarket`, `pullFromMarket` call.

## 7. What Limero is NOT claiming today

- Not audited (pre-audit)
- Not pausable (roadmap)
- Not governed by a DAO (roadmap)
- Not using decentralized oracle (roadmap → UMA)
- Not censorship-resistant at the creator-wallet layer on mainnet
  (post-launch, curator layer becomes editorial-only; permissionless
   creation is already the 60-day target)

Listing these honestly is the point of this document. A serious
reviewer already knows where early-stage protocols stand — what
matters is whether the team has a coherent plan to close each gap.
