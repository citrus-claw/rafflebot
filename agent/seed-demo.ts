#!/usr/bin/env npx tsx
/**
 * Seed demo raffles with substantial prize pools
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Connection, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU");
const TEST_USDC = new PublicKey("2BD6xxpUvNSA1KF2FmpUEGVBcoSDepRVCbphWJCkDGK2");
const IDL_PATH = path.join(__dirname, "../target/idl/rafflebot.json");
const WALLET_PATH = process.env.HOME + "/.config/solana/id.json";

function loadWallet(): Keypair {
  const secretKey = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function getProgram() {
  const IDL = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const wallet = loadWallet();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: "confirmed" });
  anchor.setProvider(provider);
  const program = new Program(IDL, provider);
  return { program, provider, wallet, connection };
}

interface DemoRaffle {
  name: string;
  ticketPrice: number; // USDC
  minPot: number;
  maxPerWallet: number;
  durationHours: number;
  ticketsToBuy: number; // how many tickets to buy to seed the pool
}

const DEMO_RAFFLES: DemoRaffle[] = [
  {
    name: "Solana Summer Jackpot",
    ticketPrice: 25,
    minPot: 5000,
    maxPerWallet: 10,
    durationHours: 72,
    ticketsToBuy: 8, // $200 in pool
  },
  {
    name: "Colosseum Grand Prize",
    ticketPrice: 50,
    minPot: 10000,
    maxPerWallet: 5,
    durationHours: 168, // 1 week
    ticketsToBuy: 5, // $250 in pool
  },
  {
    name: "Community Raffle #42",
    ticketPrice: 10,
    minPot: 2500,
    maxPerWallet: 20,
    durationHours: 48,
    ticketsToBuy: 10, // $100 in pool
  },
  {
    name: "Weekend Winners Circle",
    ticketPrice: 5,
    minPot: 1000,
    maxPerWallet: 50,
    durationHours: 24,
    ticketsToBuy: 10, // $50 in pool
  },
];

async function main() {
  const { program, wallet, connection } = getProgram();

  // Get wallet's USDC token account
  const walletTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, wallet, TEST_USDC, wallet.publicKey
  );
  console.log(`Wallet USDC balance: ${Number(walletTokenAccount.amount) / 1_000_000} USDC\n`);

  for (const demo of DEMO_RAFFLES) {
    console.log(`\n🎲 Creating "${demo.name}"...`);
    
    const ticketPrice = new anchor.BN(demo.ticketPrice * 1_000_000);
    const minPot = new anchor.BN(demo.minPot * 1_000_000);
    const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + demo.durationHours * 3600);

    const [rafflePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("raffle"), wallet.publicKey.toBuffer(), Buffer.from(demo.name)],
      PROGRAM_ID
    );
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePDA.toBuffer()],
      PROGRAM_ID
    );
    const [entryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), rafflePDA.toBuffer(), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    try {
      // Create raffle
      await program.methods
        .createRaffle(demo.name, ticketPrice, minPot, demo.maxPerWallet, endTime)
        .accounts({
          raffle: rafflePDA,
          escrow: escrowPDA,
          tokenMint: TEST_USDC,
          platformWallet: wallet.publicKey,
          authority: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log(`   ✅ Created: ${rafflePDA.toBase58()}`);

      // Buy tickets to seed the pool
      if (demo.ticketsToBuy > 0) {
        await program.methods
          .buyTickets(demo.ticketsToBuy)
          .accounts({
            raffle: rafflePDA,
            entry: entryPDA,
            escrow: escrowPDA,
            buyerTokenAccount: walletTokenAccount.address,
            tokenMint: TEST_USDC,
            buyer: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        const poolValue = demo.ticketsToBuy * demo.ticketPrice;
        console.log(`   🎟️ Bought ${demo.ticketsToBuy} tickets ($${poolValue} in pool)`);
      }

      console.log(`   💰 $${demo.ticketPrice}/ticket, $${demo.minPot} min pot, ${demo.durationHours}h`);
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  }

  console.log("\n✅ Done seeding demo raffles!");
}

main().catch(console.error);
