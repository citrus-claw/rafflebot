# RaffleBot Skill

Create and manage provably fair raffles on Solana via natural language.

## Commands

### Create a Raffle
"Create a raffle called [name] with [price] USDC tickets, minimum pot [amount], for [hours] hours"

Example: "Create a raffle called Weekend Giveaway with 5 USDC tickets, minimum pot 100, for 48 hours"

### List Raffles
"Show me all raffles" / "What raffles are active?" / "List raffles"

### Check Raffle Status
"How's [raffle name] doing?" / "Status of [raffle]"

### Draw Winner
"Draw the winner for [raffle name]" (only works after deadline + min pot met)

### Cancel Raffle
"Cancel [raffle name]" (refunds enabled)

## Usage

The tools are at: `~/.openclaw/projects/rafflebot/agent/tools.ts`

```bash
cd ~/.openclaw/projects/rafflebot

# List all raffles
npx tsx agent/tools.ts list

# Create raffle: name, price, minPot, maxPerWallet, hours
npx tsx agent/tools.ts create "Raffle Name" 5 100 10 48

# Draw winner
npx tsx agent/tools.ts draw <raffle_address>

# Check what needs attention
npx tsx agent/tools.ts status
```

## Interpreting Requests

When user asks to create a raffle, extract:
- **name**: The raffle name (string)
- **ticketPrice**: Price in USDC (default: 1)
- **minPot**: Minimum pot to proceed (default: 10)
- **maxPerWallet**: Max tickets per person (default: 10)
- **durationHours**: How long until draw (default: 24)

When user asks about raffles, run `list` and format nicely:
- Show name, pot size, tickets sold, time remaining
- Highlight any ending soon (<1 hour)

When user asks to draw, verify:
- Deadline has passed
- Min pot threshold met
- Then run draw command

## Web UI

Users can also interact via: http://localhost:3000
- View raffles, connect wallet, buy tickets
- See their ticket numbers and odds

## On-Chain Details

- **Network**: Solana Devnet
- **Program**: `HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU`
- **Fee Split**: 90% winner, 10% platform
