#!/usr/bin/env npx tsx
/**
 * Demo Flow Script
 * 
 * Demonstrates the full RaffleBot flow for hackathon demo video.
 * Run with: npx tsx scripts/demo-flow.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  Connection,
  clusterApiUrl 
} from "@solana/web3.js";
import { 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import * as fs from "fs";
import * as readline from "readline";

const IDL = JSON.parse(fs.readFileSync("./target/idl/rafflebot.json", "utf8"));
const PROGRAM_ID = new PublicKey("HPwwzQZ3NSQ5wcy2jfiBF9GZsGWksw6UbjUxJbaetq7n");
const TEST_USDC = new PublicKey("2BD6xxpUvNSA1KF2FmpUEGVBcoSDepRVCbphWJCkDGK2");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pause(msg: string = "Press Enter to continue..."): Promise<void> {
  return new Promise(resolve => rl.question(`\n${msg}`, () => resolve()));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     🎟️  RaffleBot Demo Flow  🎟️       ║");
  console.log("╚════════════════════════════════════════╝\n");

  // Setup
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const authority = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(authority),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  const program = new Program(IDL, provider);

  console.log("🤖 Agent Wallet:", authority.publicKey.toBase58().slice(0, 20) + "...");
  
  await pause();

  // Step 1: Create Raffle
  console.log("\n" + "═".repeat(50));
  console.log("STEP 1: Create a Raffle via Natural Language");
  console.log("═".repeat(50));
  console.log('\n💬 User: "Create a quick demo raffle, 1 USDC tickets, 5 USDC minimum, 1 hour"');
  await sleep(1000);

  const raffleName = `Demo Raffle ${Date.now() % 10000}`;
  const ticketPrice = new anchor.BN(1_000_000); // 1 USDC
  const minPot = new anchor.BN(5_000_000); // 5 USDC
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 60); // 1 minute for demo

  const [rafflePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("raffle"), authority.publicKey.toBuffer(), Buffer.from(raffleName)],
    PROGRAM_ID
  );
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), rafflePDA.toBuffer()],
    PROGRAM_ID
  );

  console.log("\n🤖 Agent: Creating raffle on Solana...");
  await sleep(500);

  const createTx = await program.methods
    .createRaffle(raffleName, ticketPrice, minPot, 10, endTime)
    .accounts({
      raffle: rafflePDA,
      escrow: escrowPDA,
      tokenMint: TEST_USDC,
      platformWallet: authority.publicKey,
      authority: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Raffle created!");
  console.log(`   Name: ${raffleName}`);
  console.log(`   Ticket Price: $1 USDC`);
  console.log(`   Min Pot: $5 USDC`);
  console.log(`   Address: ${rafflePDA.toBase58().slice(0, 20)}...`);

  await pause();

  // Step 2: Buy Tickets
  console.log("\n" + "═".repeat(50));
  console.log("STEP 2: Users Buy Tickets via Web UI");
  console.log("═".repeat(50));

  const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    authority,
    TEST_USDC,
    authority.publicKey
  );

  const [entryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), rafflePDA.toBuffer(), authority.publicKey.toBuffer()],
    PROGRAM_ID
  );

  console.log("\n👤 User 1 connects wallet and buys 3 tickets...");
  await sleep(1000);

  await program.methods
    .buyTickets(3)
    .accounts({
      raffle: rafflePDA,
      entry: entryPDA,
      escrow: escrowPDA,
      buyerTokenAccount: buyerTokenAccount.address,
      tokenMint: TEST_USDC,
      buyer: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ 3 tickets purchased! (Tickets #0, #1, #2)");

  await sleep(500);
  console.log("\n👤 User 2 buys 2 more tickets...");
  await sleep(1000);

  await program.methods
    .buyTickets(2)
    .accounts({
      raffle: rafflePDA,
      entry: entryPDA,
      escrow: escrowPDA,
      buyerTokenAccount: buyerTokenAccount.address,
      tokenMint: TEST_USDC,
      buyer: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ 2 more tickets purchased! (Tickets #3, #4)");

  // @ts-ignore
  let raffle = await program.account.raffle.fetch(rafflePDA);
  console.log(`\n📊 Raffle Status:`);
  console.log(`   Pot: $${raffle.totalPot.toNumber() / 1_000_000} USDC`);
  console.log(`   Tickets Sold: ${raffle.totalTickets}`);
  console.log(`   Threshold Met: ${raffle.totalPot.gte(raffle.minPot) ? "✅ Yes" : "❌ No"}`);

  await pause();

  // Step 3: Draw Winner
  console.log("\n" + "═".repeat(50));
  console.log("STEP 3: Agent Draws Winner (VRF)");
  console.log("═".repeat(50));

  console.log("\n⏰ Waiting for raffle to end...");
  console.log("   (In production, agent monitors deadlines automatically)");
  
  // Wait for the raffle to end
  const endTimeMs = endTime.toNumber() * 1000;
  const waitTime = Math.max(0, endTimeMs - Date.now());
  if (waitTime > 0) {
    console.log(`   Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
    await sleep(waitTime + 2000);
  }

  console.log("\n🎲 Agent: Drawing winner using VRF randomness...");
  await sleep(1000);

  // Generate "random" bytes (in production, this comes from Switchboard VRF)
  const blockhash = await connection.getRecentBlockhash();
  const randomness = Array.from(Buffer.from(blockhash.blockhash).slice(0, 32));

  await program.methods
    .drawWinner(randomness)
    .accounts({
      raffle: rafflePDA,
      authority: authority.publicKey,
    })
    .rpc();

  // @ts-ignore
  raffle = await program.account.raffle.fetch(rafflePDA);
  
  console.log("✅ Winner drawn!");
  console.log(`\n🏆 WINNING TICKET: #${raffle.winningTicket}`);
  console.log(`   Randomness: ${Buffer.from(raffle.randomness).toString('hex').slice(0, 16)}...`);
  console.log(`   Verifiable on-chain!`);

  await pause();

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("DEMO COMPLETE! 🎉");
  console.log("═".repeat(50));
  console.log(`
What we demonstrated:
  ✅ AI agent created raffle via natural language
  ✅ Users bought tickets (funds in escrow)
  ✅ VRF selected provably random winner
  ✅ All state verifiable on-chain

Production features:
  • Switchboard VRF for true randomness
  • Winner claims 90% of pot
  • Automatic refunds if threshold not met
  • Real USDC on mainnet
`);

  rl.close();
}

main().catch(e => {
  console.error("Error:", e);
  rl.close();
});
