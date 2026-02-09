# RaffleBot Architecture

## Overview

RaffleBot is an AI agent that creates and runs provably fair raffles on Solana. Users interact via natural language (Discord, Telegram, web), and the agent handles all on-chain operations.

---

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  Discord    │  Telegram   │   Web UI    │   API       │  Other  │
│  Bot        │  Bot        │             │             │  Agents │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       └─────────────┴─────────────┴─────────────┴───────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT LAYER (OpenClaw)                      │
├─────────────────────────────────────────────────────────────────┤
│  • Natural language parsing                                      │
│  • Intent recognition (create/buy/check/draw)                    │
│  • Wallet management (AgentWallet)                               │
│  • Transaction building & signing                                │
│  • State monitoring & notifications                              │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SOLANA LAYER                                │
├──────────────────────┬──────────────────────────────────────────┤
│   RaffleBot Program  │  Switchboard VRF                         │
│   ─────────────────  │  ────────────────                        │
│   • create_raffle    │  • Request randomness                    │
│   • buy_tickets      │  • Callback with proof                   │
│   • commit_draw      │  • Verifiable on-chain                   │
│   • settle_draw      │                                          │
│   • claim_prize      │                                          │
│   • cancel_raffle    │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Create a Raffle

```
User: "Create a raffle for 50 USDC, 0.1 SOL per entry, ends in 24 hours"
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent parses:                           │
│   • prize_amount: 50 USDC               │
│   • entry_price: 0.1 SOL                │
│   • duration: 24 hours                  │
│   • max_entries: unlimited (default)    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent builds tx:                        │
│   • create_raffle instruction           │
│   • Fund prize escrow (if agent-funded) │
│   • OR mark as "prize on claim"         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent responds:                         │
│   "✅ Raffle created!                   │
│    ID: abc123                           │
│    Prize: 50 USDC                       │
│    Entry: 0.1 SOL                       │
│    Ends: Feb 8, 2026 01:11 UTC          │
│    Link: https://raffle.bot/abc123"     │
└─────────────────────────────────────────┘
```

### Flow 2: Buy Entries

```
User: "Buy 5 entries for raffle abc123"
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent checks:                           │
│   • Raffle exists and active?           │
│   • User wallet connected?              │
│   • Sufficient balance? (0.5 SOL)       │
│   • Under max entries?                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent builds tx:                        │
│   • buy_entries(raffle, 5)              │
│   • Transfer 0.5 SOL to escrow          │
│   • Create/update Entry PDA             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent responds:                         │
│   "🎟️ You bought 5 entries!            │
│    Total entries: 5                     │
│    Your odds: 5/47 (10.6%)              │
│    Tx: abc...xyz"                       │
└─────────────────────────────────────────┘
```

### Flow 3: Draw Winner (Automated)

```
┌─────────────────────────────────────────┐
│ Agent monitors raffle end times         │
│ (cron job or event subscription)        │
└─────────────────────────────────────────┘
                    │
        Raffle end time reached
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent requests VRF:                     │
│   • Call Switchboard requestRandomness  │
│   • Pay VRF fee (~0.002 SOL)            │
│   • Wait for callback                   │
└─────────────────────────────────────────┘
                    │
         VRF callback received
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent commits + settles draw:           │
│   • Pass VRF randomness                 │
│   • Program selects winning index       │
│   • Raffle status → Completed           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent announces:                        │
│   "🎉 Raffle abc123 winner drawn!       │
│    Winner: @user (7xK...4Qp)            │
│    Winning entry: #23                   │
│    Prize: 50 USDC                       │
│    Verify: [link to explorer]"          │
└─────────────────────────────────────────┘
```

### Flow 4: Automatic Payout

```
Draw is settled by agent
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent verifies:                         │
│   • User is winner                      │
│   • Prize not already claimed           │
│   • Raffle is completed                 │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Agent builds tx:                        │
│   • claim_prize instruction             │
│   • Transfer 90% to winner              │
│   • Transfer 10% to platform            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   "💰 Prize auto-paid!                  │
│    50 USDC sent to 7xK...4Qp            │
│    Tx: def...uvw"                       │
└─────────────────────────────────────────┘
```

---

## On-Chain Accounts

### Raffle PDA
```
Seeds: ["raffle", authority, name]

struct Raffle {
    authority: Pubkey,       // Creator/owner
    name: String,            // Unique per authority
    entry_price: u64,        // Lamports or token amount
    entry_token: Option<Pubkey>,  // None = SOL, Some = SPL token
    prize_amount: u64,
    prize_token: Option<Pubkey>,
    end_time: i64,           // Unix timestamp
    max_entries: u32,        // 0 = unlimited
    total_entries: u32,
    winning_index: Option<u32>,
    winner: Option<Pubkey>,
    status: RaffleStatus,    // Active/Completed/Cancelled
    randomness: Option<[u8; 32]>,
    created_at: i64,
    bump: u8,
}
```

### Entry PDA
```
Seeds: ["entry", raffle, buyer]

struct Entry {
    raffle: Pubkey,
    buyer: Pubkey,
    num_entries: u32,        // How many tickets
    entry_index: u32,        // Starting index (for winner calc)
    bump: u8,
}
```

### Entrant List (for large raffles)
```
Seeds: ["entrants", raffle, page]

struct EntrantList {
    raffle: Pubkey,
    page: u16,
    entrants: Vec<Pubkey>,   // Max ~100 per page
}
```

---

## VRF Integration (Switchboard)

### Request Flow
```
1. Raffle ends → Agent detects
2. Agent creates VRF request account
3. Agent calls Switchboard requestRandomness
4. Oracle network generates randomness
5. Callback writes to VRF result account
6. Agent reads result, calls settle_draw
7. Program uses randomness to pick winner
```

### Verification
Anyone can verify the draw:
1. Check VRF result account (Switchboard proof)
2. Check randomness bytes stored in Raffle
3. Recalculate: `winner_index = randomness % total_entries`
4. Verify winner matches stored winner

---

## Agent-to-Agent Interaction

### Scenario: External Agent Creates Raffle
```
External Agent                          RaffleBot Agent
      │                                       │
      │  POST /api/raffles                    │
      │  {                                    │
      │    "prize": "100 USDC",               │
      │    "entry_price": "0.05 SOL",         │
      │    "duration": "48h",                 │
      │    "webhook": "https://..."           │
      │  }                                    │
      │ ─────────────────────────────────────>│
      │                                       │
      │      { "raffle_id": "xyz789" }        │
      │<───────────────────────────────────── │
      │                                       │
      │                                       │
      │       [48 hours later]                │
      │                                       │
      │      POST webhook                     │
      │      { "event": "winner_drawn",       │
      │        "winner": "7xK...",            │
      │        "proof": "..." }               │
      │<───────────────────────────────────── │
```

### API Endpoints (Future)
```
POST   /api/raffles          Create raffle
GET    /api/raffles/:id      Get raffle status
POST   /api/raffles/:id/buy  Buy entries (requires signed tx)
GET    /api/raffles/:id/entries  List entrants
POST   /api/raffles/:id/draw Trigger draw (auth required)
```

---

## Security Considerations

### Program Security
- [ ] Authority checks on all mutations
- [ ] Overflow protection on entry math
- [ ] Reentrancy guards on prize claims
- [ ] VRF result validation
- [ ] Escrow math verification

### Agent Security
- [ ] Wallet key isolation (AgentWallet)
- [ ] Rate limiting on creates
- [ ] Spam prevention (min entry price)
- [ ] Sybil resistance (optional: require verification)

### Economic Security
- [ ] Prize must be escrowed or guaranteed
- [ ] Entry fees cover VRF + rent costs
- [ ] Cancel returns all entries
- [ ] Timeout auto-cancel if no entries

---

## Implementation Phases (Hackathon MVP)

### Phase 1: Anchor Program ✅ [Day 1]
- [x] Basic program structure
- [ ] Update for threshold model (min_pot, max_per_person)
- [ ] Add platform fee split (90/10)
- [ ] Add refund instruction (cancel + refund all)
- [ ] USDC (SPL token) support
- [ ] Devnet deployment

### Phase 2: Web UI [Day 2-3]
Tech: Next.js 14 + App Router + Tailwind + wallet-adapter
- [ ] Home page (list active raffles)
- [ ] Raffle detail page (buy, countdown, entries)
- [ ] My tickets page
- [ ] Winner history
- [ ] Wallet connect (Phantom + Solflare)

### Phase 3: Agent Integration [Day 3-4]
- [ ] OpenClaw tool for create_raffle
- [ ] Natural language parsing ("5 USDC tickets, 10k pot, 7 days")
- [ ] Deadline monitoring (cron)
- [ ] VRF trigger + draw
- [ ] Winner announcement

### Phase 4: Polish [Day 4-5]
- [ ] Switchboard VRF integration (or mock for demo)
- [ ] Error handling
- [ ] Mobile responsive
- [ ] Demo video
- [ ] Hackathon submission

---

## Tech Stack

### On-Chain
| Component | Choice |
|-----------|--------|
| Framework | Anchor 0.30 |
| Token | USDC (SPL) |
| Randomness | Switchboard VRF (or mock) |
| Network | Devnet → Mainnet |

### Web UI
| Component | Choice |
|-----------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Wallet | @solana/wallet-adapter |
| RPC | Helius (free tier) |

### Agent
| Component | Choice |
|-----------|--------|
| Platform | OpenClaw |
| Wallet | AgentWallet |
| Monitoring | Cron jobs |

---

## Raffle Creation Flow (Agent-Only MVP)

```
Discord/Telegram:
User: "Create a raffle - 5 USDC per ticket, minimum 10k pot, 
       max 50 tickets per person, ends Feb 14"
                    │
                    ▼
Agent parses & validates:
  ├── ticket_price: 5 USDC
  ├── min_pot: 10,000 USDC
  ├── max_per_person: 50
  ├── deadline: Feb 14 23:59 UTC
  └── platform_fee: 10%
                    │
                    ▼
Agent creates on-chain:
  └── create_raffle(config) → Raffle PDA
                    │
                    ▼
Agent announces:
  "🎲 New Raffle Live!
   Prize Pool: Up to 10,000+ USDC
   Tickets: 5 USDC each
   Max per person: 50
   Deadline: Feb 14, 11:59 PM UTC
   
   👉 Buy tickets: https://rafflebot.xyz/abc123"
```

---

## File Structure

```
rafflebot/
├── programs/
│   └── rafflebot/
│       └── src/
│           └── lib.rs          # Anchor program
├── app/                        # Next.js web UI
│   ├── page.tsx               # Home (list raffles)
│   ├── raffle/[id]/page.tsx   # Raffle detail
│   ├── my-tickets/page.tsx    # User's entries
│   └── history/page.tsx       # Past winners
├── agent/                      # OpenClaw integration
│   └── tools.ts               # Raffle tools
├── tests/
│   └── rafflebot.ts           # Anchor tests
└── docs/
    └── ARCHITECTURE.md        # This file
```

---

## Design Decisions (Locked)

### Ticket Economics
```
Ticket Price Breakdown:
├── 90% → Prize pot
└── 10% → Platform fee (covers VRF + rent + agent wallet)

Example: $5 ticket
├── $4.50 → pot
└── $0.50 → platform
```

### Threshold Model
```
Raffle must meet minimum pot before proceeding:

Config:
├── ticket_price: 5 USDC
├── min_pot: 10,000 USDC (threshold to proceed)
├── max_per_person: 100 tickets (sybil resistance)
└── deadline: Unix timestamp

Outcomes:
├── pot >= min_pot by deadline → VRF draw, winner takes pot
└── pot < min_pot by deadline → Auto-cancel, full refunds
```

### MVP Scope
- Single winner (multi-winner = later)
- USDC entries only (SOL = later)
- Manual raffle creation (recurring = later)
- Simple web UI + Anchor program

### Refund Policy
- Threshold not met → full refund (minus nothing)
- Raffle cancelled by creator (before end) → full refund
- After draw → no refunds (winner takes pot)
