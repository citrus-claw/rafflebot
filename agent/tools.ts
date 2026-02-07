/**
 * RaffleBot Agent Tools
 * 
 * These functions can be called by the OpenClaw agent to manage raffles.
 * The agent interprets natural language requests and calls these tools.
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
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import * as sb from "@switchboard-xyz/on-demand";
import * as fs from "fs";
import * as path from "path";

// Config
const PROGRAM_ID = new PublicKey("HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU");
const TEST_USDC = new PublicKey("2BD6xxpUvNSA1KF2FmpUEGVBcoSDepRVCbphWJCkDGK2");
const IDL_PATH = path.join(__dirname, "../target/idl/rafflebot.json");
const WALLET_PATH = process.env.HOME + "/.config/solana/id.json";

function loadWallet(): Keypair {
  const secretKey = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function getProgram(): { program: Program; provider: anchor.AnchorProvider; wallet: Keypair } {
  const IDL = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const wallet = loadWallet();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  const program = new Program(IDL, provider);
  return { program, provider, wallet };
}

export interface CreateRaffleParams {
  name: string;
  ticketPriceUsdc: number;
  minPotUsdc: number;
  maxPerWallet: number;
  durationHours: number;
}

export interface RaffleInfo {
  address: string;
  name: string;
  ticketPrice: number;
  totalPot: number;
  minPot: number;
  totalTickets: number;
  endTime: Date;
  status: string;
  winner?: string;
}

/**
 * Create a new raffle
 */
export async function createRaffle(params: CreateRaffleParams): Promise<{ success: boolean; raffle?: RaffleInfo; error?: string }> {
  try {
    const { program, wallet } = getProgram();
    
    const ticketPrice = new anchor.BN(params.ticketPriceUsdc * 1_000_000);
    const minPot = new anchor.BN(params.minPotUsdc * 1_000_000);
    const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + params.durationHours * 3600);

    // Derive PDAs
    const [rafflePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("raffle"), wallet.publicKey.toBuffer(), Buffer.from(params.name)],
      PROGRAM_ID
    );
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePDA.toBuffer()],
      PROGRAM_ID
    );

    const tx = await program.methods
      .createRaffle(params.name, ticketPrice, minPot, params.maxPerWallet, endTime)
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

    return {
      success: true,
      raffle: {
        address: rafflePDA.toBase58(),
        name: params.name,
        ticketPrice: params.ticketPriceUsdc,
        totalPot: 0,
        minPot: params.minPotUsdc,
        totalTickets: 0,
        endTime: new Date(endTime.toNumber() * 1000),
        status: "Active",
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * List all raffles
 */
export async function listRaffles(): Promise<RaffleInfo[]> {
  const { program } = getProgram();
  
  // @ts-ignore
  const raffles = await program.account.raffle.all();
  
  return raffles.map((r: any) => {
    const status = r.account.status;
    let statusStr = "Unknown";
    if (status.active) statusStr = "Active";
    else if (status.drawCommitted) statusStr = "Draw Committed";
    else if (status.drawComplete) statusStr = "Draw Complete";
    else if (status.claimed) statusStr = "Claimed";
    else if (status.cancelled) statusStr = "Cancelled";

    return {
      address: r.publicKey.toBase58(),
      name: r.account.name,
      ticketPrice: r.account.ticketPrice.toNumber() / 1_000_000,
      totalPot: r.account.totalPot.toNumber() / 1_000_000,
      minPot: r.account.minPot.toNumber() / 1_000_000,
      totalTickets: r.account.totalTickets,
      endTime: new Date(r.account.endTime.toNumber() * 1000),
      status: statusStr,
      winner: r.account.winner?.toBase58(),
    };
  });
}

/**
 * Get a specific raffle by address or name
 */
export async function getRaffle(addressOrName: string): Promise<RaffleInfo | null> {
  const raffles = await listRaffles();
  
  return raffles.find(r => 
    r.address === addressOrName || 
    r.name.toLowerCase() === addressOrName.toLowerCase()
  ) || null;
}

/**
 * Draw winner for a raffle using Switchboard On-Demand VRF
 * Two-phase: commit (bundle with Switchboard commitIx) → settle (bundle with revealIx)
 */
export async function drawWinner(raffleAddress: string): Promise<{ success: boolean; winner?: string; error?: string }> {
  try {
    const { program, provider, wallet } = getProgram();
    const rafflePubkey = new PublicKey(raffleAddress);
    const connection = provider.connection;

    // Load Switchboard program
    const sbProgramId = await sb.getProgramId(connection);
    const sbProgram = await anchor.Program.at(sbProgramId, provider);

    // Get the default Switchboard queue
    const queue = await sb.getDefaultQueue(connection.rpcEndpoint);

    // Generate a keypair for the randomness account
    const rngKp = Keypair.generate();

    // Create the Switchboard randomness account
    const [randomness, createIx] = await sb.Randomness.create(sbProgram, rngKp, queue.pubkey);

    const createTx = await sb.asV0Tx({
      connection,
      ixs: [createIx],
      payer: wallet.publicKey,
      signers: [wallet, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const createSig = await connection.sendTransaction(createTx);
    await connection.confirmTransaction(createSig, "confirmed");
    console.log("Randomness account created:", rngKp.publicKey.toBase58());

    // Phase 1: Commit — bundle Switchboard commitIx + our commit_draw
    const commitIx = await randomness.commitIx(queue.pubkey);

    const commitDrawIx = await program.methods
      .commitDraw()
      .accounts({
        raffle: rafflePubkey,
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
    console.log("Draw committed! Tx:", commitSig);

    // Wait for slot to advance so oracle can generate randomness
    console.log("Waiting for randomness generation...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Phase 2: Settle — bundle Switchboard revealIx + our settle_draw
    let revealIx: anchor.web3.TransactionInstruction | null = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        revealIx = await randomness.revealIx();
        break;
      } catch (e) {
        console.log(`Reveal attempt ${attempt}/5 failed, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!revealIx) throw new Error("Failed to get reveal instruction after 5 attempts");

    const settleDrawIx = await program.methods
      .settleDraw()
      .accounts({
        raffle: rafflePubkey,
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
    console.log("Draw settled! Tx:", revealSig);

    // Fetch updated raffle to get winning ticket
    // @ts-ignore
    const raffle = await program.account.raffle.fetch(rafflePubkey);
    
    return {
      success: true,
      winner: `Ticket #${raffle.winningTicket}`,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Cancel a raffle (authority only)
 */
export async function cancelRaffle(raffleAddress: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { program, wallet } = getProgram();
    const rafflePubkey = new PublicKey(raffleAddress);

    await program.methods
      .cancelRaffle()
      .accounts({
        raffle: rafflePubkey,
        authority: wallet.publicKey,
      })
      .rpc();

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Get raffles that need attention (ending soon or ready to draw)
 */
export async function getRafflesNeedingAttention(): Promise<{
  endingSoon: RaffleInfo[];
  readyToDraw: RaffleInfo[];
}> {
  const raffles = await listRaffles();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const active = raffles.filter(r => r.status === "Active");
  
  const endingSoon = active.filter(r => {
    const timeLeft = r.endTime.getTime() - now;
    return timeLeft > 0 && timeLeft < oneHour;
  });

  const readyToDraw = active.filter(r => {
    return r.endTime.getTime() <= now && r.totalPot >= r.minPot;
  });

  return { endingSoon, readyToDraw };
}

// CLI interface for testing
if (require.main === module) {
  const command = process.argv[2];
  
  async function run() {
    switch (command) {
      case "list":
        const raffles = await listRaffles();
        console.log(JSON.stringify(raffles, null, 2));
        break;
        
      case "create":
        const result = await createRaffle({
          name: process.argv[3] || "Agent Raffle",
          ticketPriceUsdc: parseFloat(process.argv[4]) || 1,
          minPotUsdc: parseFloat(process.argv[5]) || 10,
          maxPerWallet: parseInt(process.argv[6]) || 10,
          durationHours: parseFloat(process.argv[7]) || 24,
        });
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case "draw":
        const drawResult = await drawWinner(process.argv[3]);
        console.log(JSON.stringify(drawResult, null, 2));
        break;
        
      case "status":
        const attention = await getRafflesNeedingAttention();
        console.log(JSON.stringify(attention, null, 2));
        break;
        
      default:
        console.log("Usage: tools.ts <list|create|draw|status> [args]");
    }
  }
  
  run().catch(console.error);
}
