/**
 * End-to-end devnet test for RaffleBot with Switchboard VRF
 * Tests: create raffle → buy tickets → commit draw → settle draw → claim prize
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as sb from "@switchboard-xyz/on-demand";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU");
const IDL_PATH = path.join(__dirname, "../target/idl/rafflebot.json");
const WALLET_PATH = process.env.HOME + "/.config/solana/id.json";

const RESULTS: { step: string; status: string; detail?: string; tx?: string }[] = [];

function log(step: string, status: string, detail?: string, tx?: string) {
  console.log(`[${status}] ${step}${detail ? ` — ${detail}` : ""}${tx ? ` (tx: ${tx.slice(0, 16)}...)` : ""}`);
  RESULTS.push({ step, status, detail, tx });
}

async function main() {
  console.log("=== RaffleBot E2E Devnet Test ===\n");
  console.log(`Program: ${PROGRAM_ID.toBase58()}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Setup
  const IDL = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const secretKey = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  const program = new Program(IDL, provider);

  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  // Step 1: Create test USDC mint
  let mint: PublicKey;
  try {
    mint = await createMint(connection, wallet, wallet.publicKey, null, 6);
    log("Create test USDC mint", "PASS", mint.toBase58());
  } catch (e: any) {
    log("Create test USDC mint", "FAIL", e.message);
    return printResults();
  }

  // Step 2: Create token accounts
  let authorityATA: any;
  try {
    authorityATA = await getOrCreateAssociatedTokenAccount(connection, wallet, mint, wallet.publicKey);
    log("Create authority token account", "PASS", authorityATA.address.toBase58());
  } catch (e: any) {
    log("Create authority token account", "FAIL", e.message);
    return printResults();
  }

  // Step 3: Mint test tokens
  try {
    await mintTo(connection, wallet, mint, authorityATA.address, wallet, 1_000_000_000); // 1000 USDC
    log("Mint 1000 test USDC", "PASS");
  } catch (e: any) {
    log("Mint test USDC", "FAIL", e.message);
    return printResults();
  }

  // Step 4: Create raffle
  const raffleName = `test-${Date.now().toString(36)}`;
  const ticketPrice = new anchor.BN(1_000_000); // 1 USDC
  const minPot = new anchor.BN(2_000_000); // 2 USDC
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 10); // 10 seconds from now

  const [rafflePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("raffle"), wallet.publicKey.toBuffer(), Buffer.from(raffleName)],
    PROGRAM_ID
  );
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), rafflePDA.toBuffer()],
    PROGRAM_ID
  );

  try {
    const tx = await program.methods
      .createRaffle(raffleName, ticketPrice, minPot, 10, endTime)
      .accounts({
        raffle: rafflePDA,
        escrow: escrowPDA,
        tokenMint: mint,
        platformWallet: wallet.publicKey,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    log("Create raffle", "PASS", `name=${raffleName}, ends in 10s`, tx);
  } catch (e: any) {
    log("Create raffle", "FAIL", e.message);
    return printResults();
  }

  // Step 5: Buy tickets (3 tickets)
  const [entryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), rafflePDA.toBuffer(), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  try {
    const tx = await program.methods
      .buyTickets(3)
      .accounts({
        raffle: rafflePDA,
        entry: entryPDA,
        escrow: escrowPDA,
        buyerTokenAccount: authorityATA.address,
        tokenMint: mint,
        buyer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    log("Buy 3 tickets", "PASS", "cost: 3 USDC", tx);
  } catch (e: any) {
    log("Buy 3 tickets", "FAIL", e.message);
    return printResults();
  }

  // Step 6: Wait for raffle to end
  console.log("\nWaiting 12 seconds for raffle to end...\n");
  await new Promise(r => setTimeout(r, 12000));

  // Step 7: Switchboard VRF - Create randomness account
  let rngKp: Keypair;
  let randomness: sb.Randomness;
  try {
    const sbProgramId = await sb.getProgramId(connection);
    const sbProgram = await anchor.Program.at(sbProgramId, provider);
    const queue = await sb.getDefaultQueue(connection.rpcEndpoint);
    rngKp = Keypair.generate();
    
    const [rng, createIx] = await sb.Randomness.create(sbProgram, rngKp, queue.pubkey);
    randomness = rng;

    const createTx = await sb.asV0Tx({
      connection,
      ixs: [createIx],
      payer: wallet.publicKey,
      signers: [wallet, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const sig = await connection.sendTransaction(createTx);
    await connection.confirmTransaction(sig, "confirmed");
    log("Create Switchboard randomness account", "PASS", rngKp.publicKey.toBase58(), sig);

    // Step 8: Commit draw
    const commitIx = await randomness.commitIx(queue.pubkey);
    const commitDrawIx = await program.methods
      .commitDraw()
      .accounts({
        raffle: rafflePDA,
        authority: wallet.publicKey,
        randomnessAccount: rngKp.publicKey,
      })
      .instruction();

    const commitTx = await sb.asV0Tx({
      connection,
      ixs: [commitIx, commitDrawIx],
      payer: wallet.publicKey,
      signers: [wallet],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const commitSig = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction(commitSig, "confirmed");
    log("Commit draw (Switchboard VRF)", "PASS", undefined, commitSig);

    // Wait for randomness
    console.log("\nWaiting 4 seconds for oracle to generate randomness...\n");
    await new Promise(r => setTimeout(r, 4000));

    // Step 9: Settle draw
    let revealIx: anchor.web3.TransactionInstruction | null = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        revealIx = await randomness.revealIx();
        break;
      } catch (e) {
        console.log(`  Reveal attempt ${attempt}/5 failed, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!revealIx) throw new Error("Failed to get reveal instruction after 5 attempts");

    const settleDrawIx = await program.methods
      .settleDraw()
      .accounts({
        raffle: rafflePDA,
        authority: wallet.publicKey,
        randomnessAccount: rngKp.publicKey,
      })
      .instruction();

    const revealTx = await sb.asV0Tx({
      connection,
      ixs: [revealIx, settleDrawIx],
      payer: wallet.publicKey,
      signers: [wallet],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const revealSig = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction(revealSig, "confirmed");
    log("Settle draw (reveal randomness)", "PASS", undefined, revealSig);

  } catch (e: any) {
    log("VRF draw flow", "FAIL", e.message);
    return printResults();
  }

  // Step 10: Verify raffle state
  try {
    // @ts-ignore
    const raffle = await program.account.raffle.fetch(rafflePDA);
    const status = raffle.status;
    const isDrawComplete = !!status.drawComplete;
    const winningTicket = raffle.winningTicket;
    const hasRandomness = raffle.randomness !== null;

    log("Verify raffle state", isDrawComplete ? "PASS" : "FAIL",
      `status=${isDrawComplete ? "DrawComplete" : JSON.stringify(status)}, winningTicket=${winningTicket}, hasRandomness=${hasRandomness}`);
  } catch (e: any) {
    log("Verify raffle state", "FAIL", e.message);
  }

  // Step 11: Claim prize
  try {
    const platformATA = await getOrCreateAssociatedTokenAccount(connection, wallet, mint, wallet.publicKey);

    const tx = await program.methods
      .claimPrize()
      .accounts({
        raffle: rafflePDA,
        winnerEntry: entryPDA,
        escrow: escrowPDA,
        winnerTokenAccount: authorityATA.address,
        platformTokenAccount: platformATA.address,
        tokenMint: mint,
        winner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    log("Claim prize", "PASS", "90% to winner, 10% platform fee", tx);
  } catch (e: any) {
    log("Claim prize", "FAIL", e.message);
  }

  printResults();
}

function printResults() {
  console.log("\n=== TEST RESULTS ===\n");
  const passed = RESULTS.filter(r => r.status === "PASS").length;
  const failed = RESULTS.filter(r => r.status === "FAIL").length;
  
  for (const r of RESULTS) {
    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} ${r.step}`);
    if (r.detail) console.log(`   ${r.detail}`);
    if (r.tx) console.log(`   tx: ${r.tx}`);
  }
  
  console.log(`\n${passed} passed, ${failed} failed out of ${RESULTS.length} steps`);
  
  // Write results to file
  const resultFile = path.join(__dirname, "../docs/e2e-test-results.md");
  const md = `# E2E Devnet Test Results\n\n**Date:** ${new Date().toISOString()}\n**Program:** HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU\n**Network:** Devnet\n\n## Results: ${passed}/${RESULTS.length} passed\n\n${RESULTS.map(r => {
    const icon = r.status === "PASS" ? "✅" : "❌";
    return `### ${icon} ${r.step}\n${r.detail ? `- ${r.detail}\n` : ""}${r.tx ? `- tx: \`${r.tx}\`\n` : ""}`;
  }).join("\n")}\n`;
  
  fs.writeFileSync(resultFile, md);
  console.log(`\nResults saved to ${resultFile}`);
}

main().catch(e => {
  console.error("Fatal error:", e);
  printResults();
});
