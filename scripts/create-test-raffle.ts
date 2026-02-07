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
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import * as fs from "fs";

const IDL = JSON.parse(fs.readFileSync("./target/idl/rafflebot.json", "utf8"));
const PROGRAM_ID = new PublicKey("HPwwzQZ3NSQ5wcy2jfiBF9GZsGWksw6UbjUxJbaetq7n");

async function main() {
  // Load wallet
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  
  console.log("Wallet:", wallet.publicKey.toBase58());

  // Connect to devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / 1e9, "SOL");

  // Create provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = new Program(IDL, provider);

  // Create test USDC mint (6 decimals like real USDC)
  console.log("\nCreating test USDC mint...");
  const usdcMint = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    null,
    6 // decimals
  );
  console.log("Test USDC mint:", usdcMint.toBase58());

  // Create platform wallet token account
  const platformWallet = wallet.publicKey;
  const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    usdcMint,
    platformWallet
  );
  console.log("Platform token account:", platformTokenAccount.address.toBase58());

  // Mint some test USDC to ourselves for testing
  await mintTo(
    connection,
    wallet,
    usdcMint,
    platformTokenAccount.address,
    wallet,
    1000_000_000 // 1000 USDC
  );
  console.log("Minted 1000 test USDC");

  // Create raffle
  const raffleName = "Test Raffle #1";
  const ticketPrice = new anchor.BN(1_000_000); // 1 USDC
  const minPot = new anchor.BN(10_000_000); // 10 USDC minimum
  const maxPerWallet = 10;
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 24 hours

  // Derive PDAs
  const [rafflePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("raffle"), wallet.publicKey.toBuffer(), Buffer.from(raffleName)],
    PROGRAM_ID
  );
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), rafflePDA.toBuffer()],
    PROGRAM_ID
  );

  console.log("\nCreating raffle...");
  console.log("Raffle PDA:", rafflePDA.toBase58());
  console.log("Escrow PDA:", escrowPDA.toBase58());

  try {
    const tx = await program.methods
      .createRaffle(raffleName, ticketPrice, minPot, maxPerWallet, endTime)
      .accounts({
        raffle: rafflePDA,
        escrow: escrowPDA,
        tokenMint: usdcMint,
        platformWallet: platformWallet,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Raffle created!");
    console.log("Transaction:", tx);
    console.log("\nRaffle details:");
    console.log("  Name:", raffleName);
    console.log("  Ticket price: 1 USDC");
    console.log("  Min pot: 10 USDC");
    console.log("  Max per wallet:", maxPerWallet);
    console.log("  Ends in: 24 hours");
    console.log("\nTest USDC mint (save this!):", usdcMint.toBase58());
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
