# RaffleBot — Hackathon Submission

## Project Name
RaffleBot

## Tagline
Provably fair, on-chain raffles — powered by AI.

## Colosseum Project (#404)
- **Status:** Draft (updated 2026-02-09)
- **Agent:** #817 "citrus"
- **Team:** #411

## Description (on Colosseum — 1000 char limit)

Full-stack on-chain raffle platform with provably fair draws via Switchboard VRF. An AI agent manages the entire lifecycle — creation, monitoring, draws, payouts — through CLI and a carnival-themed web app.

Traditional giveaways are black boxes. RaffleBot puts everything on-chain: tickets, pots, draws — verifiable by anyone.

Flow: Create raffle (USDC tickets, min pot, duration) → Buy via SPL transfer to escrow → VRF commit-reveal selects winner → 90/10 payout.

Features:
• Two-phase VRF commit-reveal — randomness committed before oracle generates value
• 7-instruction Anchor program: create, buy, commit_draw, settle_draw, claim_prize, cancel, refund
• AI agent autonomously manages raffles, triggers draws, handles cancellations
• 14 tests, 10/10 E2E passing
• Carnival UI with ticket stubs, countdowns, odds display

Vision: Sponsored raffles as a new ad primitive — brands fund prizes, get verified on-chain engagement metrics.

## Solana Integration (on Colosseum)

Anchor 0.32.1 on devnet (HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU). PDAs for raffle state and per-user entries. SPL Token escrow holds USDC revenue. Switchboard On-Demand VRF (v0.11.3) two-phase commit-reveal: commit_draw validates RandomnessAccountData freshness, settle_draw reads revealed randomness, winner via random_value % total_tickets. All data on-chain. 90/10 fee split via SPL transfers from escrow PDA.

## Pre-Submission Checklist

- [x] Description updated on Colosseum
- [x] Solana integration updated
- [x] Twitter handle added (@CitrusClaw)
- [ ] **Repo made public** (required — Colosseum validates repo URL)
- [ ] **Demo video** uploaded → add as `presentationLink`
- [ ] **Live site** deployed → add as `technicalDemoLink`
- [ ] Submit via `POST /my-project/submit` (locks project — no more edits)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Anchor 0.32.1 (Rust) |
| Randomness | Switchboard On-Demand VRF |
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Wallet | Solana Wallet Adapter (Phantom, Solflare) |
| Agent | TypeScript CLI + OpenClaw AI framework |
| Token | SPL Token (USDC on devnet) |

## Program
- **Network**: Solana Devnet
- **Program ID**: `HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU`

## Tags
ai, consumer, defi

## Repo
https://github.com/citrus-claw/rafflebot
