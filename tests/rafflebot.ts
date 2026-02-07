import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Rafflebot } from "../target/types/rafflebot";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("rafflebot", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  
  // Test accounts
  let tokenMint: anchor.web3.PublicKey;
  let platformWallet: anchor.web3.Keypair;
  let platformTokenAccount: anchor.web3.PublicKey;
  let buyer1: anchor.web3.Keypair;
  let buyer1TokenAccount: anchor.web3.PublicKey;
  let buyer2: anchor.web3.Keypair;
  let buyer2TokenAccount: anchor.web3.PublicKey;

  const TICKET_PRICE = 5_000_000; // 5 USDC (6 decimals)
  const MIN_POT = 20_000_000; // 20 USDC
  const MAX_PER_WALLET = 10;
  const RAFFLE_NAME = "test-raffle-1";

  before(async () => {
    // Create test token mint (mock USDC)
    tokenMint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      provider.wallet.publicKey,
      null,
      6 // USDC decimals
    );

    // Setup platform wallet
    platformWallet = anchor.web3.Keypair.generate();
    platformTokenAccount = await createAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      platformWallet.publicKey
    );

    // Setup buyer 1
    buyer1 = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      buyer1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await new Promise((r) => setTimeout(r, 1000));
    
    buyer1TokenAccount = await createAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyer1.publicKey
    );
    
    // Mint tokens to buyer 1
    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyer1TokenAccount,
      provider.wallet.publicKey,
      100_000_000 // 100 USDC
    );

    // Setup buyer 2
    buyer2 = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      buyer2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await new Promise((r) => setTimeout(r, 1000));
    
    buyer2TokenAccount = await createAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyer2.publicKey
    );
    
    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyer2TokenAccount,
      provider.wallet.publicKey,
      100_000_000
    );
  });

  it("Creates a raffle", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now

    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePda.toBuffer()],
      program.programId
    );

    await program.methods
      .createRaffle(
        RAFFLE_NAME,
        new anchor.BN(TICKET_PRICE),
        new anchor.BN(MIN_POT),
        MAX_PER_WALLET,
        new anchor.BN(endTime)
      )
      .accounts({
        raffle: rafflePda,
        escrow: escrowPda,
        tokenMint: tokenMint,
        platformWallet: platformWallet.publicKey,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.name).to.equal(RAFFLE_NAME);
    expect(raffle.ticketPrice.toNumber()).to.equal(TICKET_PRICE);
    expect(raffle.minPot.toNumber()).to.equal(MIN_POT);
    expect(raffle.totalTickets).to.equal(0);
    expect(raffle.status).to.deep.equal({ active: {} });
  });

  it("Buyer 1 purchases tickets", async () => {
    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePda.toBuffer()],
      program.programId
    );

    const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), rafflePda.toBuffer(), buyer1.publicKey.toBuffer()],
      program.programId
    );

    const numTickets = 3;

    await program.methods
      .buyTickets(numTickets)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyer1TokenAccount,
        buyer: buyer1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.totalTickets).to.equal(numTickets);
    expect(raffle.totalPot.toNumber()).to.equal(TICKET_PRICE * numTickets);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.numTickets).to.equal(numTickets);
    expect(entry.startTicketIndex).to.equal(0);
  });

  it("Buyer 2 purchases tickets", async () => {
    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePda.toBuffer()],
      program.programId
    );

    const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), rafflePda.toBuffer(), buyer2.publicKey.toBuffer()],
      program.programId
    );

    const numTickets = 5;

    await program.methods
      .buyTickets(numTickets)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyer2TokenAccount,
        buyer: buyer2.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer2])
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.totalTickets).to.equal(8); // 3 + 5
    expect(raffle.totalPot.toNumber()).to.equal(TICKET_PRICE * 8);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.numTickets).to.equal(numTickets);
    expect(entry.startTicketIndex).to.equal(3); // Starts after buyer1's tickets
  });

  it("Fails to draw winner before deadline", async () => {
    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const mockRandomness = new Uint8Array(32);
    mockRandomness.fill(42);

    try {
      await program.methods
        .drawWinner(Array.from(mockRandomness) as any)
        .accounts({
          raffle: rafflePda,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      expect.fail("Should have thrown error");
    } catch (e) {
      expect(e.message).to.include("RaffleNotEnded");
    }
  });

  // Note: Full draw + claim tests require waiting for deadline
  // or creating a raffle with a past end_time (which fails validation)
  // In production tests, we'd use a test validator with warp_to_slot
});

describe("rafflebot - cancellation flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  
  let tokenMint: anchor.web3.PublicKey;
  let platformWallet: anchor.web3.Keypair;
  let buyer: anchor.web3.Keypair;
  let buyerTokenAccount: anchor.web3.PublicKey;

  const RAFFLE_NAME = "cancel-test";
  const TICKET_PRICE = 5_000_000;
  const MIN_POT = 1_000_000_000; // Very high threshold (won't be met)

  before(async () => {
    tokenMint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      provider.wallet.publicKey,
      null,
      6
    );

    platformWallet = anchor.web3.Keypair.generate();

    buyer = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await new Promise((r) => setTimeout(r, 1000));

    buyerTokenAccount = await createAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyer.publicKey
    );

    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      tokenMint,
      buyerTokenAccount,
      provider.wallet.publicKey,
      100_000_000
    );
  });

  it("Authority can cancel active raffle", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePda.toBuffer()],
      program.programId
    );

    // Create raffle
    await program.methods
      .createRaffle(
        RAFFLE_NAME,
        new anchor.BN(TICKET_PRICE),
        new anchor.BN(MIN_POT),
        10,
        new anchor.BN(endTime)
      )
      .accounts({
        raffle: rafflePda,
        escrow: escrowPda,
        tokenMint: tokenMint,
        platformWallet: platformWallet.publicKey,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Buy some tickets
    const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), rafflePda.toBuffer(), buyer.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .buyTickets(2)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyerTokenAccount,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    // Cancel
    await program.methods
      .cancelRaffle()
      .accounts({
        raffle: rafflePda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.status).to.deep.equal({ cancelled: {} });
  });

  it("Buyer can claim refund after cancellation", async () => {
    const [rafflePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(RAFFLE_NAME),
      ],
      program.programId
    );

    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), rafflePda.toBuffer()],
      program.programId
    );

    const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), rafflePda.toBuffer(), buyer.publicKey.toBuffer()],
      program.programId
    );

    const balanceBefore = await getAccount(provider.connection, buyerTokenAccount);

    await program.methods
      .claimRefund()
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyerTokenAccount,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const balanceAfter = await getAccount(provider.connection, buyerTokenAccount);
    const refundAmount = TICKET_PRICE * 2;
    
    expect(Number(balanceAfter.amount) - Number(balanceBefore.amount)).to.equal(refundAmount);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.refunded).to.be.true;
  });
});
