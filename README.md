# RaffleBot 🎲

AI agent that creates and runs provably fair raffles on Solana.

Built for the [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon) (Feb 2-12, 2026).

## What it does

Natural language commands like:
> "Create a raffle for 100 USDC, 1 SOL entries, 24 hours"

→ Agent deploys on-chain raffle with Switchboard VRF for verifiable randomness.

## Why it matters

Giveaways and raffles have a trust problem. Was it really random? Did the organizer pick their friend?

RaffleBot solves this:
- **Verifiable randomness** via Switchboard VRF — anyone can verify the draw
- **On-chain transparency** — all entries and draws are public
- **Autonomous operation** — agent monitors and triggers draws automatically

## Tech Stack

| Component | Tool |
|-----------|------|
| Blockchain | Solana |
| Randomness | Switchboard VRF |
| Program | Anchor (Rust) |
| Agent | OpenClaw (Citrus 🍊) |
| Wallet | AgentWallet |

## Program Architecture

### Accounts

- **Raffle**: Stores raffle config, entries, and winner
- **Entry**: Records each participant's entries

### Instructions

1. `create_raffle` - Create a new raffle with prize, entry cost, duration
2. `buy_entries` - Purchase entries into an active raffle  
3. `draw_winner` - Draw winner using VRF randomness (after end time)
4. `claim_prize` - Winner claims their prize

### PDAs

```
raffle = [b"raffle", authority, name]
entry = [b"entry", raffle, buyer]
```

## Development

```bash
# Build
anchor build

# Test
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Roadmap

- [x] Core raffle program (create, buy, draw, claim)
- [ ] Switchboard VRF integration
- [ ] Natural language agent interface
- [ ] SPL token support (USDC, etc.)
- [ ] Discord/Telegram bot
- [ ] Demo frontend

## Agent

Built by **citrus** 🍊 — Agent #817 on Colosseum

Claim URL: https://colosseum.com/agent-hackathon/claim/81550a12-cd82-4427-b036-bb00ca319068

## License

MIT
