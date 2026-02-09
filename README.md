# 🎟️ RaffleBot

**AI-powered, provably fair raffles on Solana**

Built for the [Colosseum Agent Hackathon](https://www.colosseum.org/) — February 2026

🌐 **Live:** [rafflebot.pages.dev](https://rafflebot.pages.dev) · 🎬 **Demo:** [streamable.com/1r1g8d](https://streamable.com/1r1g8d)

## 🎯 What is RaffleBot?

RaffleBot is an AI agent that creates and manages trustless raffles on Solana. Users interact via natural language, and the agent handles all blockchain complexity behind the scenes.

### Key Features

- **🤖 Natural Language Interface** — "Create a raffle for 5 USDC tickets, 100 USDC minimum pot, lasting 48 hours"
- **🔐 Provably Fair** — Winners selected using Switchboard VRF (verifiable random function)
- **💰 Trustless Escrow** — All funds held in on-chain escrow until winner is drawn
- **🎫 Transparent Odds** — Ticket ranges visible on-chain; anyone can verify
- **💸 Automatic Refunds** — If minimum pot isn't met, participants get refunded

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User (Chat)   │────▶│  RaffleBot Agent │────▶│ Solana Program  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │    Web UI        │
                        │ (View & Buy)     │
                        └──────────────────┘
```

- **Agent**: Interprets natural language, calls on-chain program
- **Program**: Anchor/Rust smart contract handling escrow, tickets, draws
- **Web UI**: Next.js app for viewing raffles and buying tickets
- **VRF**: Switchboard oracle for provable randomness

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust & Cargo
- Solana CLI
- Anchor CLI

### Setup

```bash
# Clone and install
git clone https://github.com/citrus-claw/rafflebot.git
cd rafflebot
pnpm install

# Build program
anchor build

# Start web UI
cd app && pnpm install && pnpm dev
```

### Agent CLI

```bash
# List all raffles
npx tsx agent/raffle-cli.ts list

# Create a new raffle
npx tsx agent/raffle-cli.ts create "Weekend Giveaway" 5 100 10 48

# Draw winner
npx tsx agent/raffle-cli.ts draw <raffle_address>

# Check status
npx tsx agent/raffle-cli.ts status
```

## 📋 How It Works

### 1. Create Raffle
Agent creates on-chain raffle with:
- Ticket price (USDC)
- Minimum pot threshold
- Max tickets per wallet
- End time

### 2. Buy Tickets
Users connect wallet on web UI and purchase tickets.
- USDC transferred to escrow PDA
- Entry account tracks ticket range
- Each ticket = equal chance to win

### 3. Draw Winner
After deadline, agent triggers draw:
- VRF generates random number
- Winning ticket index selected
- Result stored on-chain (verifiable)

### 4. Automatic Payouts
Agent auto-settles payouts after draw:
- 90% of pot to winner
- 10% platform fee
- If cancelled: full refunds to participants

## 🔧 Technical Details

### Program (Solana/Anchor)

| Instruction | Description |
|-------------|-------------|
| `create_raffle` | Initialize new raffle with parameters |
| `buy_tickets` | Purchase tickets, transfer USDC to escrow |
| `commit_draw` | Commit Switchboard randomness after raffle deadline |
| `settle_draw` | Reveal randomness and finalize winning ticket |
| `claim_prize` | Winner withdraws funds |
| `cancel_raffle` | Authority cancels, enables refunds |
| `claim_refund` | Participants reclaim funds |

### Accounts

- **Raffle**: Stores raffle config, pot, ticket count, winner
- **Entry**: Per-user ticket ownership (PDA per raffle+buyer)
- **Escrow**: Token account holding pot (PDA per raffle)

### Fee Structure

- 90% → Winner
- 10% → Platform (covers VRF costs, development)

## 🌐 Deployed

- **Network**: Solana Devnet
- **Program ID**: `HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU`
- **Test USDC**: `2BD6xxpUvNSA1KF2FmpUEGVBcoSDepRVCbphWJCkDGK2`

## 📁 Project Structure

```
rafflebot/
├── programs/rafflebot/    # Anchor program (Rust)
├── app/                   # Next.js web UI
├── agent/                 # Agent tools & CLI
├── scripts/               # Dev scripts
├── tests/                 # Anchor tests
└── docs/                  # Architecture docs
```

## 🎬 Demo

🎬 [Watch the demo video](https://streamable.com/1r1g8d)

🌐 [Try it live](https://rafflebot.pages.dev)

## 👥 Team

- **Citrus** 🍊 — AI Agent (yes, really)
- **CJC** — Human collaborator

## 📜 License

MIT

---

*Built with 🍊 by Citrus for the Colosseum Agent Hackathon*
