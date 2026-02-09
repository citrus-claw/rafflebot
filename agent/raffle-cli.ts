#!/usr/bin/env npx tsx
/**
 * RaffleBot CLI - Human-friendly interface for agent use
 */

import { 
  createRaffle, 
  listRaffles, 
  getRaffle, 
  drawWinner, 
  cancelRaffle,
  getRafflesNeedingAttention,
  RaffleInfo 
} from "./tools";

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  
  if (diff <= 0) return "Ended";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function formatRaffle(r: RaffleInfo): string {
  const timeLeft = formatTime(r.endTime);
  const progress = r.minPot > 0 ? Math.round((r.totalPot / r.minPot) * 100) : 100;
  
  return `📋 ${r.name}
   💰 Pot: $${r.totalPot} / $${r.minPot} min (${progress}%)
   🎟️ Tickets: ${r.totalTickets} sold @ $${r.ticketPrice} each
   ⏰ ${timeLeft} remaining
   📍 ${r.address.slice(0, 8)}...${r.winner ? `\n   🏆 Winner: ${r.winner.slice(0, 8)}...` : ''}`;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "list": {
      const raffles = await listRaffles();
      if (raffles.length === 0) {
        console.log("No raffles found.");
        return;
      }
      
      const active = raffles.filter(r => r.status === "Active");
      const ended = raffles.filter(r => r.status !== "Active");
      
      if (active.length > 0) {
        console.log("🎲 ACTIVE RAFFLES\n");
        active.forEach(r => console.log(formatRaffle(r) + "\n"));
      }
      
      if (ended.length > 0) {
        console.log("📜 PAST RAFFLES\n");
        ended.forEach(r => console.log(formatRaffle(r) + "\n"));
      }
      break;
    }

    case "create": {
      const name = args[1];
      const price = parseFloat(args[2]) || 1;
      const minPot = parseFloat(args[3]) || 10;
      const maxWallet = parseInt(args[4]) || 10;
      const hours = parseFloat(args[5]) || 24;

      if (!name) {
        console.log("Usage: raffle-cli create <name> [price] [minPot] [maxWallet] [hours]");
        return;
      }

      console.log(`Creating raffle "${name}"...`);
      console.log(`  Ticket price: $${price} USDC`);
      console.log(`  Min pot: $${minPot} USDC`);
      console.log(`  Max per wallet: ${maxWallet}`);
      console.log(`  Duration: ${hours} hours\n`);

      const result = await createRaffle({
        name,
        ticketPriceUsdc: price,
        minPotUsdc: minPot,
        maxPerWallet: maxWallet,
        durationHours: hours,
      });

      if (result.success && result.raffle) {
        console.log("✅ Raffle created!\n");
        console.log(formatRaffle(result.raffle));
        console.log(`\n🔗 View at: http://localhost:3000/raffle/${result.raffle.address}`);
      } else {
        console.log("❌ Failed:", result.error);
      }
      break;
    }

    case "draw": {
      const address = args[1];
      if (!address) {
        console.log("Usage: raffle-cli draw <raffle_address>");
        return;
      }

      console.log("🎲 Drawing winner...\n");
      const result = await drawWinner(address);

      if (result.success) {
        console.log(`✅ Winner drawn and auto-paid: ${result.winner}`);
      } else {
        console.log("❌ Failed:", result.error);
      }
      break;
    }

    case "cancel": {
      const address = args[1];
      if (!address) {
        console.log("Usage: raffle-cli cancel <raffle_address>");
        return;
      }

      console.log("Cancelling raffle...\n");
      const result = await cancelRaffle(address);

      if (result.success) {
        console.log("✅ Raffle cancelled. Refunds are being auto-processed.");
      } else {
        console.log("❌ Failed:", result.error);
      }
      break;
    }

    case "status": {
      const { endingSoon, readyToDraw } = await getRafflesNeedingAttention();

      if (readyToDraw.length > 0) {
        console.log("🚨 READY TO DRAW:\n");
        readyToDraw.forEach(r => {
          console.log(`  ${r.name} - $${r.totalPot} pot, ${r.totalTickets} tickets`);
          console.log(`    Run: npx tsx agent/raffle-cli.ts draw ${r.address}\n`);
        });
      }

      if (endingSoon.length > 0) {
        console.log("⚠️ ENDING SOON (<1 hour):\n");
        endingSoon.forEach(r => {
          console.log(`  ${r.name} - ${formatTime(r.endTime)} left`);
        });
      }

      if (readyToDraw.length === 0 && endingSoon.length === 0) {
        console.log("✅ No raffles need attention right now.");
      }
      break;
    }

    case "get": {
      const query = args[1];
      if (!query) {
        console.log("Usage: raffle-cli get <name_or_address>");
        return;
      }

      const raffle = await getRaffle(query);
      if (raffle) {
        console.log(formatRaffle(raffle));
      } else {
        console.log("Raffle not found.");
      }
      break;
    }

    default:
      console.log(`RaffleBot CLI

Commands:
  list                List all raffles
  create <name> [price] [minPot] [maxWallet] [hours]
                      Create a new raffle
  get <name|address>  Get raffle details
  draw <address>      Draw winner
  cancel <address>    Cancel raffle
  status              Check what needs attention

Examples:
  raffle-cli list
  raffle-cli create "Weekend Giveaway" 5 100 10 48
  raffle-cli draw 8JdXnbF8wJV...
`);
  }
}

main().catch(console.error);
