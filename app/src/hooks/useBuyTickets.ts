'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { getEntryPDA, getEscrowPDA, Raffle } from '@/lib/idl/rafflebot';

export function useBuyTickets() {
  const { program, provider } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buyTickets = useCallback(async (
    rafflePubkey: PublicKey,
    raffle: Raffle,
    numTickets: number
  ): Promise<string | null> => {
    if (!program || !provider || !publicKey) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Derive PDAs
      const [entryPDA] = getEntryPDA(rafflePubkey, publicKey);
      const [escrowPDA] = getEscrowPDA(rafflePubkey);

      // Get buyer's token account
      const buyerTokenAccount = await getAssociatedTokenAddress(
        raffle.tokenMint,
        publicKey
      );

      // Build instruction
      // @ts-ignore - method typing
      const ix = await program.methods
        .buyTickets(numTickets)
        .accounts({
          raffle: rafflePubkey,
          entry: entryPDA,
          escrow: escrowPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenMint: raffle.tokenMint,
          buyer: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: PublicKey.default, // SystemProgram.programId
        })
        .instruction();

      // Create and send transaction
      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(tx, provider.connection);
      await provider.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (e) {
      console.error('Buy tickets failed:', e);
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [program, provider, publicKey, sendTransaction]);

  return { buyTickets, loading, error };
}
