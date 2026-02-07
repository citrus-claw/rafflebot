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

function findRafflePda(
  program: Program<Rafflebot>,
  authority: anchor.web3.PublicKey,
  name: string
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("raffle"), authority.toBuffer(), Buffer.from(name)],
    program.programId
  );
}

function findEscrowPda(
  program: Program<Rafflebot>,
  raffle: anchor.web3.PublicKey
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), raffle.toBuffer()],
    program.programId
  );
}

function findEntryPda(
  program: Program<Rafflebot>,
  raffle: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), raffle.toBuffer(), buyer.toBuffer()],
    program.programId
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("rafflebot - full lifecycle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  let tokenMint: anchor.web3.PublicKey;
  let platformWallet: anchor.web3.Keypair;
  let platformTokenAccount: anchor.web3.PublicKey;
  let buyer1: anchor.web3.Keypair;
  let buyer1TokenAccount: anchor.web3.PublicKey;
  let buyer2: anchor.web3.Keypair;
  let buyer2TokenAccount: anchor.web3.PublicKey;

  const TICKET_PRICE = 5_000_000; // 5 USDC
  const MIN_POT = 20_000_000; // 20 USDC
  const MAX_PER_WALLET = 10;
  const RAFFLE_NAME = "lifecycle-test";

  let rafflePda: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;
  let endTime: number;

  before(async () => {
    tokenMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

    platformWallet = anchor.web3.Keypair.generate();
    platformTokenAccount = await createAccount(provider.connection, payer, tokenMint, platformWallet.publicKey);

    buyer1 = anchor.web3.Keypair.generate();
    buyer2 = anchor.web3.Keypair.generate();

    await provider.connection.requestAirdrop(buyer1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(buyer2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await sleep(1000);

    buyer1TokenAccount = await createAccount(provider.connection, payer, tokenMint, buyer1.publicKey);
    buyer2TokenAccount = await createAccount(provider.connection, payer, tokenMint, buyer2.publicKey);

    await mintTo(provider.connection, payer, tokenMint, buyer1TokenAccount, payer.publicKey, 100_000_000);
    await mintTo(provider.connection, payer, tokenMint, buyer2TokenAccount, payer.publicKey, 100_000_000);

    [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    [escrowPda] = findEscrowPda(program, rafflePda);
  });

  it("creates a raffle", async () => {
    endTime = Math.floor(Date.now() / 1000) + 4; // 4 seconds from now

    await program.methods
      .createRaffle(RAFFLE_NAME, new anchor.BN(TICKET_PRICE), new anchor.BN(MIN_POT), MAX_PER_WALLET, new anchor.BN(endTime))
      .accounts({
        raffle: rafflePda,
        escrow: escrowPda,
        tokenMint,
        platformWallet: platformWallet.publicKey,
        authority: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.name).to.equal(RAFFLE_NAME);
    expect(raffle.ticketPrice.toNumber()).to.equal(TICKET_PRICE);
    expect(raffle.minPot.toNumber()).to.equal(MIN_POT);
    expect(raffle.totalTickets).to.equal(0);
    expect(raffle.status).to.deep.equal({ active: {} });
  });

  it("buyer 1 buys 3 tickets", async () => {
    const [entryPda] = findEntryPda(program, rafflePda, buyer1.publicKey);

    await program.methods
      .buyTickets(3)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyer1TokenAccount,
        tokenMint,
        buyer: buyer1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.totalTickets).to.equal(3);
    expect(raffle.totalPot.toNumber()).to.equal(TICKET_PRICE * 3);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.numTickets).to.equal(3);
    expect(entry.startTicketIndex).to.equal(0);
  });

  it("buyer 2 buys 5 tickets", async () => {
    const [entryPda] = findEntryPda(program, rafflePda, buyer2.publicKey);

    await program.methods
      .buyTickets(5)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount: buyer2TokenAccount,
        tokenMint,
        buyer: buyer2.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer2])
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.totalTickets).to.equal(8);
    expect(raffle.totalPot.toNumber()).to.equal(TICKET_PRICE * 8);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.numTickets).to.equal(5);
    expect(entry.startTicketIndex).to.equal(3);
  });

  it("fails to draw winner before deadline", async () => {
    const randomness = new Uint8Array(32);
    randomness.fill(42);

    try {
      await program.methods
        .drawWinner(Array.from(randomness) as any)
        .accounts({ raffle: rafflePda, authority: payer.publicKey })
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("RaffleNotEnded");
    }
  });

  it("draws winner after deadline", async () => {
    // Wait for deadline
    const now = Math.floor(Date.now() / 1000);
    if (now < endTime) {
      await sleep((endTime - now + 2) * 1000);
    }

    // Randomness that selects ticket index 4 (buyer2's range: 3-7)
    const randomness = new Uint8Array(32);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(4)); // 4 % 8 = 4
    randomness.set(buf);

    await program.methods
      .drawWinner(Array.from(randomness) as any)
      .accounts({ raffle: rafflePda, authority: payer.publicKey })
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.status).to.deep.equal({ drawComplete: {} });
    expect(raffle.winningTicket).to.equal(4);
  });

  it("non-winner cannot claim prize", async () => {
    const [entry1Pda] = findEntryPda(program, rafflePda, buyer1.publicKey);

    try {
      await program.methods
        .claimPrize()
        .accounts({
          raffle: rafflePda,
          winnerEntry: entry1Pda,
          escrow: escrowPda,
          winnerTokenAccount: buyer1TokenAccount,
          platformTokenAccount,
          tokenMint,
          winner: buyer1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer1])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("NotWinner");
    }
  });

  it("winner claims prize (90% winner, 10% platform)", async () => {
    const [entry2Pda] = findEntryPda(program, rafflePda, buyer2.publicKey);

    const winnerBefore = await getAccount(provider.connection, buyer2TokenAccount);
    const platformBefore = await getAccount(provider.connection, platformTokenAccount);

    await program.methods
      .claimPrize()
      .accounts({
        raffle: rafflePda,
        winnerEntry: entry2Pda,
        escrow: escrowPda,
        winnerTokenAccount: buyer2TokenAccount,
        platformTokenAccount,
        tokenMint,
        winner: buyer2.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer2])
      .rpc();

    const winnerAfter = await getAccount(provider.connection, buyer2TokenAccount);
    const platformAfter = await getAccount(provider.connection, platformTokenAccount);

    const totalPot = TICKET_PRICE * 8; // 40 USDC
    const expectedFee = totalPot * 0.1; // 4 USDC
    const expectedPrize = totalPot - expectedFee; // 36 USDC

    expect(Number(winnerAfter.amount) - Number(winnerBefore.amount)).to.equal(expectedPrize);
    expect(Number(platformAfter.amount) - Number(platformBefore.amount)).to.equal(expectedFee);

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.status).to.deep.equal({ claimed: {} });
    expect(raffle.winner.toBase58()).to.equal(buyer2.publicKey.toBase58());
  });
});

describe("rafflebot - cancellation with fee", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  let tokenMint: anchor.web3.PublicKey;
  let platformWallet: anchor.web3.Keypair;
  let platformTokenAccount: anchor.web3.PublicKey;
  let buyer: anchor.web3.Keypair;
  let buyerTokenAccount: anchor.web3.PublicKey;

  const RAFFLE_NAME = "cancel-fee-test";
  const TICKET_PRICE = 10_000_000; // 10 USDC
  const MIN_POT = 1_000_000_000; // Very high — won't be met

  let rafflePda: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;

  before(async () => {
    tokenMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

    platformWallet = anchor.web3.Keypair.generate();
    platformTokenAccount = await createAccount(provider.connection, payer, tokenMint, platformWallet.publicKey);

    buyer = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(buyer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await sleep(1000);

    buyerTokenAccount = await createAccount(provider.connection, payer, tokenMint, buyer.publicKey);
    await mintTo(provider.connection, payer, tokenMint, buyerTokenAccount, payer.publicKey, 100_000_000);

    [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    [escrowPda] = findEscrowPda(program, rafflePda);
  });

  it("creates raffle, buys tickets, then authority cancels", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 3600;

    await program.methods
      .createRaffle(RAFFLE_NAME, new anchor.BN(TICKET_PRICE), new anchor.BN(MIN_POT), 10, new anchor.BN(endTime))
      .accounts({
        raffle: rafflePda,
        escrow: escrowPda,
        tokenMint,
        platformWallet: platformWallet.publicKey,
        authority: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const [entryPda] = findEntryPda(program, rafflePda, buyer.publicKey);

    await program.methods
      .buyTickets(3)
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount,
        tokenMint,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    await program.methods
      .cancelRaffle()
      .accounts({ raffle: rafflePda, authority: payer.publicKey })
      .rpc();

    const raffle = await program.account.raffle.fetch(rafflePda);
    expect(raffle.status).to.deep.equal({ cancelled: {} });
  });

  it("refund deducts 10% platform fee", async () => {
    const [entryPda] = findEntryPda(program, rafflePda, buyer.publicKey);

    const buyerBefore = await getAccount(provider.connection, buyerTokenAccount);
    const platformBefore = await getAccount(provider.connection, platformTokenAccount);

    await program.methods
      .claimRefund()
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount,
        platformTokenAccount,
        tokenMint,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const buyerAfter = await getAccount(provider.connection, buyerTokenAccount);
    const platformAfter = await getAccount(provider.connection, platformTokenAccount);

    const gross = TICKET_PRICE * 3; // 30 USDC
    const fee = gross * 0.1; // 3 USDC
    const netRefund = gross - fee; // 27 USDC

    expect(Number(buyerAfter.amount) - Number(buyerBefore.amount)).to.equal(netRefund);
    expect(Number(platformAfter.amount) - Number(platformBefore.amount)).to.equal(fee);

    const entry = await program.account.entry.fetch(entryPda);
    expect(entry.refunded).to.be.true;
  });

  it("cannot double-claim refund", async () => {
    const [entryPda] = findEntryPda(program, rafflePda, buyer.publicKey);

    try {
      await program.methods
        .claimRefund()
        .accounts({
          raffle: rafflePda,
          entry: entryPda,
          escrow: escrowPda,
          buyerTokenAccount,
          platformTokenAccount,
          tokenMint,
          buyer: buyer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("AlreadyRefunded");
    }
  });
});

describe("rafflebot - validation errors", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  let tokenMint: anchor.web3.PublicKey;
  let platformWallet: anchor.web3.Keypair;
  let buyer: anchor.web3.Keypair;
  let buyerTokenAccount: anchor.web3.PublicKey;

  const RAFFLE_NAME = "validation-test";
  const TICKET_PRICE = 5_000_000;

  before(async () => {
    tokenMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    platformWallet = anchor.web3.Keypair.generate();

    buyer = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(buyer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await sleep(1000);

    buyerTokenAccount = await createAccount(provider.connection, payer, tokenMint, buyer.publicKey);
    await mintTo(provider.connection, payer, tokenMint, buyerTokenAccount, payer.publicKey, 100_000_000);
  });

  it("rejects end time in the past", async () => {
    const pastTime = Math.floor(Date.now() / 1000) - 60;
    const [rafflePda] = findRafflePda(program, payer.publicKey, "past-test");
    const [escrowPda] = findEscrowPda(program, rafflePda);

    try {
      await program.methods
        .createRaffle("past-test", new anchor.BN(TICKET_PRICE), new anchor.BN(TICKET_PRICE), 10, new anchor.BN(pastTime))
        .accounts({
          raffle: rafflePda,
          escrow: escrowPda,
          tokenMint,
          platformWallet: platformWallet.publicKey,
          authority: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("InvalidEndTime");
    }
  });

  it("rejects zero ticket price", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 3600;
    const [rafflePda] = findRafflePda(program, payer.publicKey, "zero-price");
    const [escrowPda] = findEscrowPda(program, rafflePda);

    try {
      await program.methods
        .createRaffle("zero-price", new anchor.BN(0), new anchor.BN(1), 10, new anchor.BN(endTime))
        .accounts({
          raffle: rafflePda,
          escrow: escrowPda,
          tokenMint,
          platformWallet: platformWallet.publicKey,
          authority: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("InvalidTicketPrice");
    }
  });

  it("enforces max tickets per wallet", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 3600;
    const [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    const [escrowPda] = findEscrowPda(program, rafflePda);

    await program.methods
      .createRaffle(RAFFLE_NAME, new anchor.BN(TICKET_PRICE), new anchor.BN(TICKET_PRICE), 2, new anchor.BN(endTime))
      .accounts({
        raffle: rafflePda,
        escrow: escrowPda,
        tokenMint,
        platformWallet: platformWallet.publicKey,
        authority: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const [entryPda] = findEntryPda(program, rafflePda, buyer.publicKey);

    try {
      await program.methods
        .buyTickets(3) // max is 2
        .accounts({
          raffle: rafflePda,
          entry: entryPda,
          escrow: escrowPda,
          buyerTokenAccount,
          tokenMint,
          buyer: buyer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("MaxTicketsExceeded");
    }
  });

  it("non-authority cannot cancel before deadline", async () => {
    const [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    const nonAuthority = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(nonAuthority.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await sleep(1000);

    try {
      await program.methods
        .cancelRaffle()
        .accounts({ raffle: rafflePda, authority: nonAuthority.publicKey })
        .signers([nonAuthority])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("CannotCancel");
    }
  });
});
