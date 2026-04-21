# Limero · Builders Program Application · Draft Answers

Ready-to-paste answers for the LitVM Builders Program form
(`https://builders.litvm.com`). Adjust names, wallets and links before
submission.

---

## Project name
Limero

## One-line description
Litecoin-native prediction and yield markets on LitVM — turning zkLTC
into productive, recurring onchain activity.

## Category / track
DeFi · Yield markets · Consumer app (multiple)

## Website / app URL
`https://limero.app` (replace with live URL)

## Demo video
`[Upload 45–60s walkthrough: Hero → Why zkLTC → Vaults → Market trade → Dashboard]`

## Testnet deployment
- Chain: LitVM LiteForge (ID 4441)
- Market factory: `0xbB2b40F1ed12F64966ac2eA6157760Da26020032`
- LIME incentive vault: `0x81ba4b26174B488671791696277111566D66ea9d`
- USDC stable-reference vault: `0xAFf48d4c339737957b04c60E31d5Bcc1e818E842`
- zkLTC native vault: deploying within 30 days

## GitHub / repo
`[link to public or private repo · if private, share access to LitVM reviewers]`

## Team
`[Names, roles, prior shipping credentials, Twitter/X handles]`

## Full-time commitment?
Yes. Team is full-time on Limero through mainnet launch.

---

## What problem are you solving for Litecoin & LitVM?

LitVM's thesis depends on turning Litecoin's large, conservative
hard-money community into active onchain users. That only works if
LTC holders have reasons to keep capital onchain — reasons that
don't require leaving the asset they already trust.

Existing LitVM apps solve adjacent problems: DEX liquidity (LiteSwap),
DeFi breadth (Lester Labs), permissionless prediction (MidasPredict),
lending, payments. What's missing is a protocol specifically designed
to make zkLTC *productive and habit-forming* — where LTC itself earns
yield from recurring market activity, not from being swapped into
something else.

Limero fills that gap. Vault-backed prediction markets that pay
zkLTC holders a fee share for funding market depth, with a daily/
weekly market cadence and a streak-and-points system designed around
retention, not one-shot use.

## How does Limero expand zkLTC utility?

Three direct mechanisms:

1. **zkLTC is the primary collateral** of every vault and every
   market. Not USDC, not LIME, not a wrapped synthetic — zkLTC 1:1
   via BitcoinOS Grail.

2. **Vaults turn zkLTC into productive capital.** LTC holders deposit
   zkLTC; the vault funds LP depth across every live market; depositors
   earn a share of the 2% trading fee. Passive LTC becomes fee-earning
   LTC without the holder picking a side on any single market.

3. **Recurring markets drive daily zkLTC flow.** Daily LTC price
   bands, weekly LitVM milestone markets, seasonal leaderboards.
   Every trade moves zkLTC through the protocol and adds to the
   onchain footprint that LitVM is trying to grow.

## What's different about Limero vs other LitVM builders?

- **vs MidasPredict** — Both are prediction markets. Limero adds the
  vault-yield layer and an LTC-native positioning. Prediction-only is
  a speculation product; prediction-plus-vault is a yield product.
- **vs LiteSwap** — Complementary. LiteSwap provides liquidity primitives
  (swap/LP); Limero vaults consume LP primitives and deploy them into
  market-funding. Different user, different yield curve.
- **vs Lester Labs** — Lester is breadth (many utilities); Limero is
  depth (one vertical, deeply integrated). Both strengthen LitVM.
- **vs lending primitives** — Lending pays passive yield from borrowers;
  Limero pays active yield from traders. Different source of return,
  same underlying asset.

No existing LitVM builder ships zkLTC-denominated prediction markets
with an integrated vault-yield layer. That's Limero's slot.

## What are you building during the 2-month testnet?

See `docs/TESTNET-SCOPE.md` for the full week-by-week plan.
Headline commitments:

- 30 days: Native zkLTC vault, seeded market pack, docs v1
- 60 days: Permissionless market creation, streaks + points season 1
- 90 days: Mainnet readiness, audit firm engaged, UMA oracle spec

Success metrics (on-chain, published weekly):

| Metric                        | 30d   | 60d     |
| ----------------------------- | ----: | ------: |
| Markets created               |    20 |      50 |
| Total zkLTC-eq vault TVL      |   250 |   1,500 |
| Weekly-active wallets         |    60 |     200 |
| Weekly trading volume (zkLTC) |    50 |     400 |

## How does Limero handle oracle / resolution risk?

Today (testnet): single protocol-admin oracle per market, disclosed
honestly in `docs/RISK-MODEL.md`.

Mainnet plan: UMA Optimistic Oracle integration for every market.
Anyone can propose an outcome; any party can dispute with a bond;
unresolved disputes escalate to UMA's voting system. Limero will
never have unilateral mainnet resolution power.

Full resolution-risk write-up: `docs/RISK-MODEL.md` §1.

## What security measures are in place?

- Reentrancy guards on all vault state-changing functions
- CEI pattern enforced (state before external calls)
- Owner access control scoped to market-routing only — cannot touch
  user shares, cannot mint, cannot block withdrawals
- `rescue()` explicitly cannot touch vault underlying
- Solidity 0.8.20 with panic-on-overflow

Pre-mainnet: one external audit via LitVM-recommended firm
(Sherlock / Trail of Bits / OpenZeppelin). Immunefi bug bounty at
launch, minimum $25k critical.

Full threat model: `docs/RISK-MODEL.md`.

## What support do you need from the LitVM Builders Program?

In order of priority:

1. **Audit credit** toward the pre-mainnet security review
2. **Co-marketing support** to reach the Litecoin community
   (cross-posting, LitVM Discord AMA, partner announcements)
3. **Technical review** of the UMA integration plan pre-deployment
4. **Introduction to infrastructure providers** — specifically to a
   decentralized indexing partner for the incentive engine
5. **Consideration for the post-mainnet accelerator** if the 60-day
   metrics are met

## Willingness to contribute back to the LitVM ecosystem?

Yes. Specific offers:

- Publish weekly public impact reports for the testnet duration
- Open-source the FPMM market contract and vault routing contract
  after mainnet launch (MIT license) — other LitVM builders can fork
  the vault-yield pattern for their own asset classes
- Participate in Builders Program demo events
- Cross-link LiteSwap / Lester / Midas where complementary (e.g.
  Limero markets on "will LiteSwap TVL cross $X by Y")
- Provide Limero-curated markets for LitVM ecosystem milestones
  (already seeded in the testnet market pack)

## Any dependencies / risks you need LitVM to know about?

- zkLTC bridge (BitcoinOS Grail) uptime is a hard dependency for the
  native zkLTC vault. No workaround — if Grail is down, zkLTC cannot
  flow.
- UMA availability on LitVM at mainnet. If UMA is not live on LitVM
  at our mainnet target, we will launch with a multi-sig oracle as
  interim and migrate post-UMA-deployment.
- Solidity compiler version — we assume ≥ 0.8.20 support in LitVM
  tooling (confirmed via Caldera).

---

## Screenshots to include

1. Hero view with new zkLTC-first headline
2. Vaults section showing the productive-capital framing
3. A live market page mid-trade
4. Dashboard with user position
5. Admin panel with seeded market pack (curator console)

## Contact

- Primary: `[lead name, email, X handle]`
- Backup: `[cofounder name, email]`
- LitVM Discord: `[handle]`
- Response SLA: < 24h during Builders Program window
