# Limero · Pitch One-Pager

**Litecoin-native prediction and yield markets on LitVM.**

---

## One-liner

Limero is a Litecoin-native prediction and yield market protocol on LitVM,
designed to turn zkLTC into productive, recurring onchain activity through
event markets, vault-backed liquidity, and habit-forming daily participation.

## The problem Limero solves for LitVM

LitVM's entire thesis rests on turning Litecoin — one of the oldest, most
conservative hard-money communities in crypto — into an active onchain
economy. That only works if LTC holders have reasons to keep their capital
onchain instead of bridging in, doing one action, and leaving.

Today the LitVM hub already has solid infrastructure pieces: a DEX
(LiteSwap), a DeFi utility suite (Lester Labs), a permissionless prediction
market (MidasPredict), lending primitives, and a payments layer. What is
still missing is a protocol purpose-built to **deepen zkLTC utility through
recurring, yield-bearing activity** — where LTC itself is the productive
asset, not a deposit that gets swapped into something else.

Limero fills that slot.

## What Limero is

A Litecoin-native market protocol with three tightly coupled layers:

1. **Market engine** — Fixed Product Market Maker (FPMM) for YES/NO event
   markets, denominated in zkLTC. Continuous pricing, instant exits,
   onchain resolution.

2. **Vault engine** — Depositors park zkLTC (or USDC as stable reference)
   into a vault. The vault auto-routes liquidity across every active market,
   earning a share of the 2% trading fee. Withdrawable anytime. This is the
   piece that turns passive LTC into productive capital.

3. **Incentive engine** — Points, trader streaks, LP streaks, curator
   rewards, and (post-mainnet) governance. Powered by $LIME, which is
   explicitly the incentive layer and not the primary collateral.

## How Limero is aligned with LitVM's stated priorities

| LitVM priority                                      | How Limero delivers                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Expand utility for native Litecoin assets           | All markets and vaults denominated in zkLTC                                          |
| Create yield opportunities for LTC holders          | Vault engine earns 2% trading fee share, routed automatically across every market    |
| Deliver yield-markets primitives                    | Combines prediction markets + vault yield into one protocol — not offered elsewhere  |
| Grow DeFi + rewards ecosystem                       | Incentive engine with points, streaks, LP rewards                                    |
| Generate recurring, habit-forming onchain activity  | Daily LTC price markets, weekly milestone markets, seasonal leaderboards             |
| Honor Litecoin's hard-money community               | No wrapped detours, no synthetic LTC; zkLTC 1:1 via BitcoinOS Grail                  |

## What makes Limero differentiated from existing LitVM builders

- **vs MidasPredict** — Midas is a permissionless prediction market focused
  on daily habit. Limero ships the same permissionless surface (60-day
  roadmap) plus a vault-yield layer that prediction markets alone don't
  have. Result: Limero is prediction markets + productive capital, in one
  protocol.

- **vs LiteSwap** — LiteSwap is core liquidity infra (swap/LP/staking).
  Limero's vaults consume that liquidity primitive and put it to work
  funding market depth. Complementary, not competing.

- **vs Lester Labs** — Lester is breadth (minter, launchpad, vesting,
  airdrop, governance). Limero is depth — one tightly integrated vertical
  that maximizes recurring zkLTC usage.

- **vs lending primitives (LendVault / Ayni)** — Lending provides passive
  yield from borrowing demand. Limero provides active yield from trader
  demand. Different yield curve, different user, same asset.

## Current status (testnet)

- **Live on LitVM LiteForge** (Chain 4441, Arbitrum Orbit / Caldera)
- Market factory deployed: `0xbB2b40F1ed12F64966ac2eA6157760Da26020032`
- Vaults deployed (LIME + USDC, zkLTC vault in 30-day roadmap)
- Seeded market pack: 13 curated markets across LTC price, LitVM
  milestones, Litecoin treasury themes, builder activity
- Production-grade frontend with dashboard, trade box, activity feed,
  onchain-verifiable resolution

## Testnet incentive plan

During the 2-month LitVM testnet program, Limero commits to:

- **Ship native zkLTC vault** in 30 days
- **Ship permissionless market creation** in 60 days (with curated
  "Featured" layer maintained editorially)
- **Ship trader/LP streaks + points season** in 60 days
- **Seed ≥30 markets** across four editorial categories
- **Publish weekly impact reports** with onchain metrics

## Success metrics committed for testnet

| Metric                                | 30d target | 60d target |
| ------------------------------------- | ---------: | ---------: |
| Markets created                       |         20 |         50 |
| zkLTC-eq vault TVL                    |        250 |      1,500 |
| Unique weekly-active wallets          |         60 |        200 |
| Markets with non-trivial volume (>5%) |         10 |         30 |

## Team commitments

- Full-time on Limero through mainnet
- Open to co-marketing with LitVM and Litecoin community
- Open to security review / audit via LitVM program credits
- Open to participating in LitVM accelerator post-mainnet

## Links

- Testnet app: `https://limero.app` (replace with live URL)
- Block explorer: `https://liteforge.explorer.caldera.xyz`
- Docs: see `/docs/ARCHITECTURE.md`, `/docs/RISK-MODEL.md`, `/docs/TESTNET-SCOPE.md`
