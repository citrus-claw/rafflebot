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
import * as sb from "@switchboard-xyz/on-demand";
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

async function runVrfDraw(
  program: Program<Rafflebot>,
  provider: anchor.AnchorProvider,
  authority: anchor.web3.Keypair,
  rafflePda: anchor.web3.PublicKey
) {
  const connection = provider.connection;
  const sbProgramId = await sb.getProgramId(connection);
  const sbProgram = await anchor.Program.at(sbProgramId, provider);
  const queue = await sb.getDefaultQueue(connection.rpcEndpoint);
  const rngKp = anchor.web3.Keypair.generate();

  const [randomness, createIx] = await sb.Randomness.create(
    sbProgram,
    rngKp,
    queue.pubkey
  );

  const createTx = await sb.asV0Tx({
    connection,
    ixs: [createIx],
    payer: authority.publicKey,
    signers: [authority, rngKp],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });
  const createSig = await connection.sendTransaction(createTx);
  await connection.confirmTransaction(createSig, "confirmed");

  const commitIx = await randomness.commitIx(queue.pubkey);
  const commitDrawIx = await program.methods
    .commitDraw()
    .accounts({
      raffle: rafflePda,
      authority: authority.publicKey,
      randomnessAccount: rngKp.publicKey,
    })
    .instruction();

  const commitTx = await sb.asV0Tx({
    connection,
    ixs: [commitIx, commitDrawIx],
    payer: authority.publicKey,
    signers: [authority],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });
  const commitSig = await connection.sendTransaction(commitTx);
  await connection.confirmTransaction(commitSig, "confirmed");

  let revealIx: anchor.web3.TransactionInstruction | null = null;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      revealIx = await randomness.revealIx();
      break;
    } catch (e) {
      if (attempt === 6) throw e;
      await sleep(2000);
    }
  }
  if (!revealIx) throw new Error("Failed to get reveal instruction");

  const settleDrawIx = await program.methods
    .settleDraw()
    .accounts({
      raffle: rafflePda,
      authority: authority.publicKey,
      randomnessAccount: rngKp.publicKey,
    })
    .instruction();

  const revealTx = await sb.asV0Tx({
    connection,
    ixs: [revealIx, settleDrawIx],
    payer: authority.publicKey,
    signers: [authority],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });
  const revealSig = await connection.sendTransaction(revealTx);
  await connection.confirmTransaction(revealSig, "confirmed");

  return { randomnessPubkey: rngKp.publicKey };
}

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
    platformTokenAccount = await createAccount(
      provider.connection,
      payer,
      tokenMint,
      platformWallet.publicKey
    );

    buyer1 = anchor.web3.Keypair.generate();
    buyer2 = anchor.web3.Keypair.generate();

    await provider.connection.requestAirdrop(
      buyer1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      buyer2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await sleep(1000);

    buyer1TokenAccount = await createAccount(
      provider.connection,
      payer,
      tokenMint,
      buyer1.publicKey
    );
    buyer2TokenAccount = await createAccount(
      provider.connection,
      payer,
      tokenMint,
      buyer2.publicKey
    );

    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      buyer1TokenAccount,
      payer.publicKey,
      100_000_000
    );
    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      buyer2TokenAccount,
      payer.publicKey,
      100_000_000
    );

    [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    [escrowPda] = findEscrowPda(program, rafflePda);
  });

  it("creates a raffle", async () => {
    endTime = Math.floor(Date.now() / 1000) + 8;

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

  it("buyers purchase tickets", async () => {
    const [entry1Pda] = findEntryPda(program, rafflePda, buyer1.publicKey);
    const [entry2Pda] = findEntryPda(program, rafflePda, buyer2.publicKey);

    await program.methods
      .buyTickets(3)
      .accounts({
        raffle: rafflePda,
        entry: entry1Pda,
        escrow: escrowPda,
        buyerTokenAccount: buyer1TokenAccount,
        tokenMint,
        buyer: buyer1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    await program.methods
      .buyTickets(5)
      .accounts({
        raffle: rafflePda,
        entry: entry2Pda,
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
  });

  it("fails to commit draw before deadline", async () => {
    try {
      await program.methods
        .commitDraw()
        .accounts({
          raffle: rafflePda,
          authority: payer.publicKey,
          randomnessAccount: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("RaffleNotEnded");
    }
  });

  it("draws winner via VRF and allows auto-payout without winner signer", async () => {
    const now = Math.floor(Date.now() / 1000);
    if (now < endTime) {
      await sleep((endTime - now + 2) * 1000);
    }

    await runVrfDraw(program, provider, payer, rafflePda);

    const raffleAfterDraw = await program.account.raffle.fetch(rafflePda);
    expect(raffleAfterDraw.status).to.deep.equal({ drawComplete: {} });
    expect(raffleAfterDraw.winningTicket).to.not.equal(null);

    const winningTicket = Number(raffleAfterDraw.winningTicket);
    const [entry1Pda] = findEntryPda(program, rafflePda, buyer1.publicKey);
    const [entry2Pda] = findEntryPda(program, rafflePda, buyer2.publicKey);
    const entry1 = await program.account.entry.fetch(entry1Pda);
    const entry2 = await program.account.entry.fetch(entry2Pda);

    let winnerPubkey: anchor.web3.PublicKey;
    let winnerEntryPda: anchor.web3.PublicKey;
    let winnerTokenAccount: anchor.web3.PublicKey;
    if (
      winningTicket >= entry1.startTicketIndex &&
      winningTicket < entry1.startTicketIndex + entry1.numTickets
    ) {
      winnerPubkey = buyer1.publicKey;
      winnerEntryPda = entry1Pda;
      winnerTokenAccount = buyer1TokenAccount;
    } else {
      winnerPubkey = buyer2.publicKey;
      winnerEntryPda = entry2Pda;
      winnerTokenAccount = buyer2TokenAccount;
    }

    const winnerBefore = await getAccount(provider.connection, winnerTokenAccount);
    const platformBefore = await getAccount(provider.connection, platformTokenAccount);

    // Auto-payout style: authority pays out; winner does not sign this transaction.
    await program.methods
      .claimPrize()
      .accounts({
        raffle: rafflePda,
        winnerEntry: winnerEntryPda,
        escrow: escrowPda,
        winnerTokenAccount,
        platformTokenAccount,
        tokenMint,
        winner: winnerPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const winnerAfter = await getAccount(provider.connection, winnerTokenAccount);
    const platformAfter = await getAccount(provider.connection, platformTokenAccount);

    const totalPot = TICKET_PRICE * 8; // 40 USDC
    const expectedFee = totalPot * 0.1; // 4 USDC
    const expectedPrize = totalPot - expectedFee; // 36 USDC

    expect(Number(winnerAfter.amount) - Number(winnerBefore.amount)).to.equal(
      expectedPrize
    );
    expect(Number(platformAfter.amount) - Number(platformBefore.amount)).to.equal(
      expectedFee
    );

    const raffleAfterClaim = await program.account.raffle.fetch(rafflePda);
    expect(raffleAfterClaim.status).to.deep.equal({ claimed: {} });
    expect(raffleAfterClaim.winner?.toBase58()).to.equal(winnerPubkey.toBase58());
  });
});

describe("rafflebot - cancellation with full refund", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Rafflebot as Program<Rafflebot>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  let tokenMint: anchor.web3.PublicKey;
  let buyer: anchor.web3.Keypair;
  let buyerTokenAccount: anchor.web3.PublicKey;

  const RAFFLE_NAME = "cancel-full-refund-test";
  const TICKET_PRICE = 10_000_000; // 10 USDC
  const MIN_POT = 1_000_000_000; // Very high — won't be met

  let rafflePda: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;

  before(async () => {
    tokenMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    buyer = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await sleep(1000);

    buyerTokenAccount = await createAccount(
      provider.connection,
      payer,
      tokenMint,
      buyer.publicKey
    );
    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      buyerTokenAccount,
      payer.publicKey,
      100_000_000
    );

    [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    [escrowPda] = findEscrowPda(program, rafflePda);
  });

  it("creates raffle, buys tickets, then authority cancels", async () => {
    const endTime = Math.floor(Date.now() / 1000) + 3600;

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
        tokenMint,
        platformWallet: payer.publicKey,
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

  it("refund is full amount and can be processed without buyer signature", async () => {
    const [entryPda] = findEntryPda(program, rafflePda, buyer.publicKey);

    const buyerBefore = await getAccount(provider.connection, buyerTokenAccount);

    // Automation style: authority processes refund for the buyer.
    await program.methods
      .claimRefund()
      .accounts({
        raffle: rafflePda,
        entry: entryPda,
        escrow: escrowPda,
        buyerTokenAccount,
        tokenMint,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const buyerAfter = await getAccount(provider.connection, buyerTokenAccount);
    const gross = TICKET_PRICE * 3; // 30 USDC

    expect(Number(buyerAfter.amount) - Number(buyerBefore.amount)).to.equal(gross);

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
          tokenMint,
          buyer: buyer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
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
    await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await sleep(1000);

    buyerTokenAccount = await createAccount(
      provider.connection,
      payer,
      tokenMint,
      buyer.publicKey
    );
    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      buyerTokenAccount,
      payer.publicKey,
      100_000_000
    );
  });

  it("rejects end time in the past", async () => {
    const pastTime = Math.floor(Date.now() / 1000) - 60;
    const [rafflePda] = findRafflePda(program, payer.publicKey, "past-test");
    const [escrowPda] = findEscrowPda(program, rafflePda);

    try {
      await program.methods
        .createRaffle(
          "past-test",
          new anchor.BN(TICKET_PRICE),
          new anchor.BN(TICKET_PRICE),
          10,
          new anchor.BN(pastTime)
        )
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
      .createRaffle(
        RAFFLE_NAME,
        new anchor.BN(TICKET_PRICE),
        new anchor.BN(TICKET_PRICE),
        2,
        new anchor.BN(endTime)
      )
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
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("MaxTicketsExceeded");
    }
  });

  it("non-authority cannot cancel before deadline", async () => {
    const [rafflePda] = findRafflePda(program, payer.publicKey, RAFFLE_NAME);
    const nonAuthority = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      nonAuthority.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
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
