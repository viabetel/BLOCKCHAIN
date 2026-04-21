# Limero · Testnet Scope & Impact Plan

Built for the LitVM Builders Program 2-month testnet window.

---

## Commitments summary

| Window | Shipping                                                   | Measurable output             |
| ------ | ---------------------------------------------------------- | ----------------------------- |
| 30d    | Native zkLTC vault · docs v1 · seeded market pack          | 250 zkLTC-eq TVL, 20 markets  |
| 60d    | Permissionless market creation · streaks/points · season 1 | 1,500 zkLTC TVL, 50 markets   |
| 90d    | Mainnet readiness · audit scoped · UMA integration drafted | Audit firm engaged, UMA spec  |

## Week-by-week execution

### Week 1 — Narrative lock-in + zkLTC vault

- Ship repositioned frontend (this release, v19): zkLTC-first copy,
  "Why zkLTC" section, reordered flow, admin banner signaling
  permissionless roadmap
- Deploy native zkLTC vault on LiteForge testnet
- Publish `/docs/PITCH.md`, `/docs/ARCHITECTURE.md`, `/docs/RISK-MODEL.md`
- Submit Builders Program application with video demo

### Week 2 — Market pack + distribution

- Seed the full 13-market "LitVM-native Market Pack" via admin
- Announce on Litecoin subreddit, X, and LitVM Discord
- Publish "Why hard-money markets" explainer post
- Start weekly impact report cadence

### Week 3 — Incentive engine skeleton

- Deploy off-chain event indexer (listens to all market + vault events)
- Publish leaderboard page at `/leaderboard`
- Start points accrual for: trader volume, LP time, winning prediction
- No LIME payouts yet — points only

### Week 4 — 30d checkpoint

- Public checkpoint post with metrics
- Gather feedback from first cohort of users
- Submit 30d impact report to LitVM program

### Week 5 — Permissionless market creation ships

- Public `/create-market` UI
- Bond + cooldown on-chain
- Factory signature check for vault routing safety
- Admin panel becomes curator console

### Week 6 — Streaks + points season 1

- Daily LTC price markets auto-generated
- Weekly ecosystem milestone markets auto-generated
- Streak tracking live on user profile
- First Merkle root published

### Week 7 — Community markets round 1

- Invite 3 community members to curator-feature markets
- Run first "community season" with public market creation

### Week 8 — 60d checkpoint + mainnet prep

- Final impact report
- Begin audit engagement (firm selected from LitVM-recommended list)
- UMA oracle integration spec published
- Mainnet launch timeline committed

---

## Impact metrics — what we're measuring publicly

All metrics are measured on-chain and published weekly.

### Primary (must-hit)

| Metric                                  | 30d    | 60d      | Definition                                                |
| --------------------------------------- | -----: | -------: | --------------------------------------------------------- |
| Markets created                         |     20 |       50 | Via `LimeroFactory.createMarket` events                   |
| Total zkLTC-eq vault TVL                |    250 |    1,500 | Sum of `totalAssets()` across all vaults, normalized      |
| Unique weekly-active wallets (WAW)      |     60 |      200 | Distinct wallets with ≥1 market tx in trailing 7d         |
| Weekly trading volume (zkLTC-eq)        |     50 |      400 | Sum of `collateralIn` across all `Buy` events in week     |

### Secondary (track, publish, don't gate)

- Number of markets with non-trivial volume (> 5 trades)
- Ratio of LP depositors to traders (target > 1:3)
- Average hold time for LP positions
- Return rate: wallets trading in 2+ different weeks
- Number of distinct market creators (post-permissionless)

### Qualitative

- Weekly impact report quality (judged by LitVM program reviewers)
- Community response on X / Litecoin subreddit / LitVM Discord
- Number of LitVM ecosystem collaborations (co-marketing with other builders)

---

## Why these targets are credible (not sandbagged, not overpromised)

- **250 zkLTC-eq at 30d** — roughly 3 ETH equivalent at current prices.
  Achievable from protocol-seeded liquidity + first-cohort external
  depositors. Not a moonshot number.
- **60 WAW at 30d** — one wallet per Limero contributor's existing
  audience plus Litecoin community outreach. Realistic with single
  launch post.
- **50 markets at 60d** — 13 seeded + ~15 auto-generated recurring +
  ~22 user-created post-permissionless. Paced, not front-loaded.
- **1,500 zkLTC-eq TVL at 60d** — 6x growth from 30d, assuming
  streak/points incentive goes live. Aggressive but not absurd.

We are explicitly NOT committing to specific revenue or dollar-denominated
targets, because zkLTC price is volatile and because the testnet is
not revenue-generating by design.

---

## What triggers a scope change

Limero will openly communicate and adjust scope if any of the following
happens:

- Critical security issue discovered in deployed contracts (pauses
  growth targets, prioritizes fix)
- LitVM infrastructure downtime >48h (shifts all dates by the outage
  duration)
- LTC price shock (±40% intraday) that makes zkLTC-denominated targets
  non-comparable (switch to TVL-in-LTC, not TVL-in-USD)

This document is updated weekly alongside the impact report.

---

## Deliverables checklist for Builders Program submission

- [x] Testnet deployment live on LitVM LiteForge
- [x] Frontend at production quality
- [x] Smart contracts with reasonable code quality (pre-audit)
- [x] Seeded market pack
- [x] Pitch one-pager (`docs/PITCH.md`)
- [x] Architecture doc (`docs/ARCHITECTURE.md`)
- [x] Risk model (`docs/RISK-MODEL.md`)
- [x] This testnet scope doc
- [ ] 45-60s demo video
- [ ] 3 production-quality screenshots
- [ ] Application form completed (see `docs/APPLICATION.md` for draft)
