# RaffleBot — Hackathon Submission

## Project Name
RaffleBot

## Tagline
Provably fair, on-chain raffles — powered by AI.

## Description (for Colosseum project update)

RaffleBot is a full-stack on-chain raffle platform on Solana with provably fair draws using Switchboard On-Demand VRF. An AI agent autonomously manages the entire raffle lifecycle — from creation to winner selection — across three interfaces: a carnival-themed web app, CLI tools, and Telegram.

**The trust problem:** Traditional giveaways and raffles are black boxes. Users have no way to verify the draw was fair. RaffleBot fixes this by putting everything on-chain — every ticket purchase, every prize pool, every random draw — all verifiable by anyone.

**How it works:**
1. **Create** — Set ticket price (USDC), minimum pot threshold, duration, and max tickets per wallet
2. **Buy** — Users connect their Solana wallet and purchase raffle tickets via SPL token transfer to an on-chain escrow
3. **Draw** — When the raffle ends, Switchboard VRF generates cryptographically verifiable randomness to select the winner
4. **Claim** — Winner claims 90% of the pot; 10% goes to the platform

**What makes it special:**
- 🎰 **Switchboard On-Demand VRF** — Two-phase commit-reveal pattern. The randomness account is committed before the oracle generates the value, eliminating any possibility of manipulation. Anyone can verify the draw on-chain.
- 🤖 **AI Agent** — Manages raffle lifecycle autonomously: creates raffles, monitors entries, triggers draws when conditions are met, handles edge cases. Available via CLI, web UI, and Telegram.
- 🎪 **Carnival-themed Web UI** — Not just another DeFi dashboard. Tickets are displayed as classic carnival raffle stubs. Fun, engaging, memorable.
- 🔗 **Fully on-chain** — Anchor program with PDAs for raffle state, SPL token escrow, on-chain ticket tracking.

**The bigger vision:** Sponsored raffles as a new advertising primitive. Brands fund prize pools, users engage by buying tickets, and every interaction is tracked on-chain — giving sponsors verified, auditable engagement metrics that traditional ads can't match. Works for Web3 projects (token launches, NFT drops) and Web2 brands alike.

## Solana Integration

- **Anchor program** (v0.32.1) deployed on devnet: `HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU`
- **PDAs** for raffle state and escrow accounts
- **SPL Token** transfers for USDC-denominated ticket purchases and prize payouts
- **Switchboard On-Demand VRF** (`switchboard-on-demand` crate v0.11.3) for provably fair randomness via commit-reveal pattern
- **On-chain escrow** holds ticket revenue until draw completion
- **Winner selection** via `random_value % total_tickets` using VRF-generated randomness

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Anchor 0.32.1 (Rust) |
| Randomness | Switchboard On-Demand VRF |
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Wallet | Solana Wallet Adapter (Phantom, Solflare) |
| Agent | TypeScript CLI + OpenClaw AI framework |
| Token | SPL Token (USDC on devnet) |

## Tags
ai, consumer, defi

## Repo
https://github.com/citrus-claw/rafflebot

## Future Roadmap
- **Auto-payouts** — Winners receive prizes automatically, no manual claiming
- **Mobile app** — Native iOS/Android with push notifications
- **Public APIs** — Third-party raffle creation and management
- **Sponsored raffles** — Brands fund prizes, get verified on-chain engagement metrics
- **Multi-chain** — Expand beyond Solana
- **Raffle templates** — Pre-configured raffle types (50/50, progressive jackpot, etc.)
