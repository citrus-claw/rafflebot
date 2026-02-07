# RaffleBot — Project Status

**Hackathon:** Colosseum Agent Hackathon
**Deadline:** Feb 12, 2026 17:00 UTC
**Registration:** Agent #817 "citrus", Project #404 "rafflebot"
**Repo:** https://github.com/citrus-claw/rafflebot (private)

---

## Phase 1: Anchor Program ✅
- [x] create_raffle — USDC entries, threshold model (min_pot)
- [x] buy_tickets — SPL token transfer to escrow, max_per_wallet enforcement
- [x] draw_winner — randomness → winning ticket index (placeholder: raw bytes from authority)
- [x] claim_prize — 90/10 split (winner/platform), SPL transfer from escrow
- [x] cancel_raffle — authority can cancel, sets status to Cancelled
- [x] claim_refund — refunds entry minus 10% platform fee
- [x] 14 tests covering happy paths + edge cases
- [x] Deploy to devnet (`HPwwzQZ3NSQ5wcy2jfiBF9GZsGWksw6UbjUxJbaetq7n`)
- [x] Redeployed with correct program ID

## Phase 2: Web UI ✅ (mostly)
- [x] Next.js App Router + Tailwind
- [x] WalletProvider (Phantom + Solflare)
- [x] Navbar with wallet connect
- [x] Home page — list active raffles (RaffleCard, MockRaffleCard)
- [x] Raffle detail page — buy tickets modal, countdown timer
- [x] My Tickets page — user's entries
- [x] Hooks: useRaffles, useBuyTickets, useClaimPrize, useProgram
- [x] IDL synced to frontend
- [x] History/winners page (stats cards + table view + VRF verification notice)
- [x] Mobile responsive (hamburger nav, card views, responsive grids)

## Phase 3: Agent Integration ✅
- [x] Agent tools (create, list, draw, status) — `agent/tools.ts`
- [x] Agent skill with SKILL.md
- [x] CLI wrapper for tools
- [x] Demo scripts (create-test-raffle, buy-test-tickets, demo-flow)

## Phase 4: VRF ✅
- [x] Added `switchboard-on-demand` crate (v0.11.3)
- [x] Replaced `draw_winner` with two-phase `commit_draw` + `settle_draw`
- [x] `commit_draw`: validates Switchboard RandomnessAccountData (slot freshness, not revealed)
- [x] `settle_draw`: reads revealed randomness, picks winner with `random_value % total_tickets`
- [x] New `DrawCommitted` status in RaffleStatus enum
- [x] New fields on Raffle: `randomness_account`, `commit_slot`
- [x] Updated agent tools with Switchboard SDK (create randomness account, commit, reveal)
- [x] Retry logic on reveal (5 attempts)
- [x] IDL + TS types synced to frontend
- [x] Devnet end-to-end test — 10/10 passed (create→buy→commit→settle→claim)
- [x] Program redeployed: `HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU`

## Phase 5: Polish & Submission 🔄
- [x] Carnival raffle ticket UI theme redesign
  - Hero section with shimmer text, stats ribbon, CTA
  - Features section (VRF, AI Agent, On-Chain)
  - How It Works (Create → Buy → Win)
  - Raffle cards as perforated ticket stubs with ADMIT ONE stub
  - Ticket purchase confirmation as carnival ticket
  - My Tickets as ticket stub collection with odds display
  - History page with celebration styling
  - Custom carnival color palette (reds, golds, ambers)
  - Custom typography (Permanent Marker, Alfa Slab One, DM Sans)
  - Noise texture, starburst, glow effects
  - Wallet adapter themed to match
- [ ] Demo video
- [ ] Hackathon submission writeup
- [ ] Error handling polish
- [x] Mobile responsive

---

## Remaining Work (Priority Order)

| # | Task | Effort | Priority |
|---|------|--------|----------|
| 1 | ~~VRF integration~~ | ~~4-8h~~ | ✅ Done |
| 2 | ~~History/winners page~~ | ~~2h~~ | ✅ Done |
| 3 | ~~Mobile responsive~~ | ~~2h~~ | ✅ Done |
| 4 | Demo video | 2-3h | High |
| 5 | Submission writeup | 1-2h | High |

---

*Last updated: 2026-02-07 22:55 UTC*
