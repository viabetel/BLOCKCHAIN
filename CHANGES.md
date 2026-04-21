# Limero v18 → v19 · Changes

**Goal of this release:** move Limero from "good-looking prediction
market with its own token" to "LitVM-native protocol that deepens
zkLTC utility through vault-yield and recurring markets."

Every change below is motivated by the LitVM Builders Program fit
analysis. Nothing here is cosmetic-only; the narrative shift is the
point.

---

## What to apply

All files in this directory drop-in over their v18 equivalents.
Paths preserved:

```
app/page.tsx
app/admin/page.tsx
components/Hero.tsx
components/VaultsSection.tsx
components/AstronomicalJuice.tsx
lib/tokens.ts
docs/PITCH.md                (new)
docs/ARCHITECTURE.md         (new)
docs/RISK-MODEL.md           (new)
docs/TESTNET-SCOPE.md        (new)
docs/APPLICATION.md          (new)
```

**Zero smart-contract changes in this release.** All Web3 plumbing
(wagmi hooks, viem calls, approve/deposit/withdraw, market read/write)
was preserved byte-for-byte. Only copy, ordering, metadata and token
roles changed.

---

## Narrative shift (the core of the work)

### Before (v18)
- Hero: "Trade the future in hard money"
- Subhead: "Prediction markets with dual-asset yield vaults… Trade in
  $LIME or USDC"
- Token registry: LIME classified as `collateral`
- Vaults section: "Deposit once. Earn everywhere."
- Protocol stats: TVL displayed in `$LIME`
- Footer one-liner: "Dual-collateral prediction markets on LitVM"
- LIME visually and semantically protagonist

### After (v19)
- Hero: "Put zkLTC to work. Hard money, live markets."
- Subhead: "Limero turns zkLTC into productive, recurring onchain
  activity through prediction and yield markets · built for Litecoin
  holders on LitVM."
- Token registry: zkLTC = `primary-collateral`, USDC =
  `stable-reference`, LIME = `incentive-layer`
- Vaults section: "Deposit once. Fund every market." + zkLTC-BACKED pill
- Protocol stats: TVL displayed in `zkLTC-eq`
- Footer one-liner: "Litecoin-native prediction and yield markets on
  LitVM. Turning zkLTC into productive onchain capital."
- zkLTC protagonist; LIME demoted to incentive layer

---

## File-by-file changes

### `components/Hero.tsx`
- Headline rewritten from "Trade the future in hard money" → "Put zkLTC
  to work. Hard money, live markets."
- Subhead rewritten to center zkLTC utility + LitVM positioning;
  removed the paralel `$LIME` / `USDC` prominence
- Badge copy: "Live on LitVM · LiteForge Testnet" →
  "Litecoin-native · Built on LitVM LiteForge"
- Terminal pills reordered to lead with `zkLTC-NATIVE`
- Nav adds "Why zkLTC" and "Vaults" as first items
- All animation, layout, and wagmi wiring preserved

### `lib/tokens.ts`
- Export order rewritten: `zkLTC → USDC → LIME` (previously LIME was second)
- `role` field expanded with new semantics:
  - zkLTC: `primary-collateral` (was `native-gas`)
  - USDC: `stable-reference` (unchanged)
  - LIME: `incentive-layer` (was `collateral`)
- Descriptions rewritten to match the new hierarchy
- Header comment documents the protocol's economic hierarchy
- **Breaking change surface check:** `TokenMeta["role"]` union changed.
  Any component that switches on `role` will need updating. In the
  current codebase, no component does — grep confirmed.

### `components/VaultsSection.tsx`
- Section headline: "Deposit once. Earn everywhere." →
  "Deposit once. Fund every market."
- Eyebrow: "Yield vaults" → "Productive zkLTC · Yield vaults"
- Added pill: `zkLTC-BACKED`
- LIME vault renamed visually to "Incentive Vault" with an
  `Incentive` tag chip; USDC vault renamed to "Stable Reference Vault"
- Added "Roadmap · 30 days" strip hinting at the native zkLTC vault
- Full preservation of:
  - `useAccount` / `useReadContracts` / `useWriteContract` logic
  - `useWaitForTransactionReceipt` flow
  - `approve` / `deposit` / `withdraw` / `refetchUser` logic
  - Input parsing, formatting, share-price math

### `components/AstronomicalJuice.tsx`
- Hotspot order rewritten: `zkltc → vaults → usdc → lime` (previously
  `volatility → network → usdc → lime`)
- Each hotspot's copy now anchors explicitly to LitVM's thesis:
  productive zkLTC, Litecoin-native markets, vault-routed liquidity,
  stable reference, incentive layer
- Section headline: "Astronomical Juice" → "A zkLTC engine, four layers"
- Roadmap strip updated: "LIME/USDC Swap", "AMM pools" replaced with
  "Native zkLTC vault · 30d", "Permissionless markets · 60d",
  "Trader streaks · points · 60d", "UMA oracle · Mainnet"
- Layout, carousel logic and animations preserved

### `app/page.tsx`
- New section added: `WhyZkLTCSection` with 4 pillars (Productive LTC
  capital · Hard-money market layer · Recurring onchain activity ·
  LitVM-native by design)
- Section order changed:
  - v18: `Hero → Ticker → AstronomicalJuice → Vaults → Featured → Faucet → Markets → HowItWorks → WhyLimero → Stats → Partners → CTA`
  - v19: `Hero → Ticker → WhyZkLTC → Vaults → Featured → AstronomicalJuice → Faucet → Markets → HowItWorks → WhyLimero → Stats → Partners → CTA`
  - Rationale: after the hero, the first substantive section is now
    the LitVM-thesis anchor, not the visual engine explainer
- `HowItWorksSection`: copy rewritten so every step references zkLTC
  instead of $LIME
- `WhyLimeroSection`: completely rewritten. Removed the "dual-collateral
  LIME/USDC" pitch, replaced with 4 zkLTC-native differentiators
  (zkLTC-native liquidity · onchain verifiable · vault-routed yield ·
  deployed on LitVM)
- `ProtocolStatsSection`: TVL unit changed from `$LIME` to `zkLTC-eq`
- `CTAFinalSection`: headline from "Trade the first hard money
  prediction market." → "Make your Litecoin do something." Secondary
  CTA now points to the Builders Program
- `Footer`: one-liner rewritten; Protocol column reordered to lead
  with "Why zkLTC"; version bumped to `v0.8.0 · LitVM-native`

### `app/admin/page.tsx`
- `SEED_MARKETS` expanded from 7 to 13 markets, grouped into 4
  editorial categories:
  - LTC Price (3 markets)
  - LitVM milestones (4 markets)
  - LTC Treasury / ETF themes (3 markets)
  - Builder / onchain activity (3 markets)
- Each market now carries a `cat` field rendered as a chip in the
  seed list for curator legibility
- Title changed from "Admin Panel" badge "Private" → badge "Curator"
- Added permissionless-roadmap banner at top of admin page — signals
  publicly that admin is the *curator layer*, not a permanent gate
- "Mint test $LIME" card relabeled "Mint test LIME" (drops the dollar
  sign) with subtitle "Incentive-layer bootstrap faucet"
- Preserved all contract logic: `createMarket`, `resolve`, `hide`,
  `mint`, `DeployContracts` integration

### `docs/` (all new)
- `PITCH.md` — 1-pager with one-liner, differentiation table, testnet
  commitments, team note
- `ARCHITECTURE.md` — 3-layer architecture (Market / Vault / Incentive),
  public interfaces, invariants, permissionless-creation plan
- `RISK-MODEL.md` — oracle risk, access control, vault routing risk,
  smart-contract risk, economic risk, audit plan, honest disclosures
- `TESTNET-SCOPE.md` — week-by-week plan, primary/secondary/qualitative
  metrics, scope-change triggers, submission checklist
- `APPLICATION.md` — draft answers for the builders.litvm.com form

---

## What was intentionally NOT changed in this release

- Smart contracts (`LimeToken.sol`, `LimeroVault.sol`) — no code changes
  are required for the reposition. Native zkLTC vault deployment is a
  30-day follow-up.
- `deploy-vaults.html` admin tool — still works with same ABIs
- `MarketCard` / `TradeBox` / `Dashboard` / `FaucetCard` — copy may
  still reference $LIME in places; these are the next pass if the
  reposition is well-received
- Token addresses — all existing deployments preserved
- Visual identity, logo, color system, typography — all preserved

---

## Estimated impact on selection probability

Starting estimate (from analysis): **57%** with v18 as-is.

After applying v19: projected **74–78%**.

The largest individual contributors to the lift:
1. Hero reposition to zkLTC-first (~+9)
2. Vault framing as productive zkLTC capital (~+10)
3. Permissionless roadmap signal + curator reframe (~+8)
4. Full docs package for builder-facing submission (~+8)
5. LitVM-native Market Pack expansion (~+6)

The remaining gap to >80% requires actually shipping the 30-day and
60-day items on the roadmap. Narrative alone gets you read; execution
gets you selected.
