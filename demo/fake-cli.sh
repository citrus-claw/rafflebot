#!/usr/bin/env bash
# Fake RaffleBot CLI simulator for VHS demo
set -e

CMD="$1"
shift 2>/dev/null || true

case "$CMD" in
  list-before)
    sleep 0.8
    cat <<'EOF'

🎟️  RaffleBot — Active Raffles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: Solana Monkey Business #4219
  Price: 2 USDC  |  Tickets: 47/100  |  Pot: 94 USDC
  Ends: 2026-02-10 20:00 UTC
  Status: ✅ Active
  Address: 7kPm2...Qx9R
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: Mad Lads Floor Sweep
  Price: 5 USDC  |  Tickets: 12/50  |  Pot: 60 USDC
  Ends: 2026-02-09 12:00 UTC
  Status: ✅ Active
  Address: 3nVbF...Ek4J
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  2 active raffles  •  154 USDC total pot

EOF
    ;;

  create)
    sleep 0.5
    echo ""
    echo "🎟️  RaffleBot — Create Raffle"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep 0.3
    echo "  ⏳ Initializing raffle account..."
    sleep 1.2
    echo "  ✅ Raffle PDA: 69Xnc...Wipg"
    sleep 0.4
    echo "  ⏳ Registering with Switchboard VRF..."
    sleep 1.5
    echo "  ✅ VRF account: 8fGtL...mN2p"
    sleep 0.3
    echo "  ⏳ Submitting transaction..."
    sleep 1.0
    echo "  ✅ TX: 4sKjR...v7Wy  (confirmed in 0.4s)"
    echo ""
    echo "  🎉 Raffle created!"
    echo "  Name: Demo Raffle"
    echo "  Price: 1 USDC  |  Max Tickets: ∞"
    echo "  Ends: 2026-02-08 18:00 UTC"
    echo "  Address: 69Xnc...Wipg"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    ;;

  list-after)
    sleep 0.8
    cat <<'EOF'

🎟️  RaffleBot — Active Raffles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: Solana Monkey Business #4219
  Price: 2 USDC  |  Tickets: 47/100  |  Pot: 94 USDC
  Ends: 2026-02-10 20:00 UTC
  Status: ✅ Active
  Address: 7kPm2...Qx9R
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: Mad Lads Floor Sweep
  Price: 5 USDC  |  Tickets: 12/50  |  Pot: 60 USDC
  Ends: 2026-02-09 12:00 UTC
  Status: ✅ Active
  Address: 3nVbF...Ek4J
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: Demo Raffle
  Price: 1 USDC  |  Tickets: 0/∞  |  Pot: 0 USDC
  Ends: 2026-02-08 18:00 UTC
  Status: ✅ Active
  Address: 69Xnc...Wipg
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  3 active raffles  •  154 USDC total pot

EOF
    ;;

  status)
    sleep 0.8
    cat <<'EOF'

🎟️  RaffleBot — Status Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Active Raffles:     3
  Total Pot:          154 USDC
  Pending Draws:      0
  VRF Callbacks:      0 awaiting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠️  Attention Needed:
  • Mad Lads Floor Sweep — ends in 13h, only 24% sold
  • Demo Raffle — no tickets sold yet

  ✅ All VRF oracles healthy
  ✅ Program: RFLBotXXX...1111 (v0.3.0)

EOF
    ;;

  *)
    echo "Usage: rafflebot <list|create|draw|status>"
    exit 1
    ;;
esac
