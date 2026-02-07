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
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import * as fs from "fs";

const IDL = JSON.parse(fs.readFileSync("./target/idl/rafflebot.json", "utf8"));
const PROGRAM_ID = new PublicKey("HPwwzQZ3NSQ5wcy2jfiBF9GZsGWksw6UbjUxJbaetq7n");
const TEST_USDC = new PublicKey("2BD6xxpUvNSA1KF2FmpUEGVBcoSDepRVCbphWJCkDGK2");
const RAFFLE_PDA = new PublicKey("8JdXnbF8wJVbetoQcnZmH7Xao7e1oA217EeJsgMdfguL");

async function main() {
  // Load wallet (this one already has SOL and test USDC)
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const buyer = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  
  console.log("🎫 Buyer:", buyer.publicKey.toBase58());

  // Connect to devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const balance = await connection.getBalance(buyer.publicKey);
  console.log("SOL Balance:", balance / 1e9);
  
  // Create provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(buyer),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = new Program(IDL, provider);

  // Get buyer's token account
  const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    buyer,
    TEST_USDC,
    buyer.publicKey
  );
  const tokenBalance = await connection.getTokenAccountBalance(buyerTokenAccount.address);
  console.log("USDC Balance:", tokenBalance.value.uiAmount);

  // Fetch raffle to get details
  // @ts-ignore
  const raffle = await program.account.raffle.fetch(RAFFLE_PDA);
  console.log("\n📋 Raffle:", raffle.name);
  console.log("   Ticket price:", raffle.ticketPrice.toNumber() / 1e6, "USDC");
  console.log("   Current pot:", raffle.totalPot.toNumber() / 1e6, "USDC");
  console.log("   Tickets sold:", raffle.totalTickets);

  // Derive PDAs
  const [entryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), RAFFLE_PDA.toBuffer(), buyer.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), RAFFLE_PDA.toBuffer()],
    PROGRAM_ID
  );

  // Buy 5 tickets
  const numTickets = 5;
  console.log(`\n🎟️ Buying ${numTickets} tickets...`);

  try {
    const tx = await program.methods
      .buyTickets(numTickets)
      .accounts({
        raffle: RAFFLE_PDA,
        entry: entryPDA,
        escrow: escrowPDA,
        buyerTokenAccount: buyerTokenAccount.address,
        tokenMint: TEST_USDC,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Tickets purchased!");
    console.log("Transaction:", tx);
    console.log("View on Solana Explorer:");
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Fetch updated raffle
    // @ts-ignore
    const updatedRaffle = await program.account.raffle.fetch(RAFFLE_PDA);
    console.log("\n📊 Updated Raffle State:");
    console.log("   Total pot:", updatedRaffle.totalPot.toNumber() / 1e6, "USDC");
    console.log("   Tickets sold:", updatedRaffle.totalTickets);

    // Fetch entry
    // @ts-ignore
    const entry = await program.account.entry.fetch(entryPDA);
    console.log("\n🎫 Buyer's Entry:");
    console.log("   Tickets:", entry.numTickets);
    console.log("   Ticket range: #" + entry.startTicketIndex + " - #" + (entry.startTicketIndex + entry.numTickets - 1));

  } catch (e) {
    console.error("Error:", e);
  }
}

main();
