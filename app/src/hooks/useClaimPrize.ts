'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getEntryPDA, getEscrowPDA, Raffle } from '@/lib/idl/rafflebot';

export function useClaimPrize() {
  const { program, provider } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const claimPrize = useCallback(async (
    rafflePubkey: PublicKey,
    raffle: Raffle,
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

      // Get winner's token account
      const winnerTokenAccount = await getAssociatedTokenAddress(
        raffle.tokenMint,
        publicKey
      );

      // Get platform token account
      const platformTokenAccount = await getAssociatedTokenAddress(
        raffle.tokenMint,
        raffle.platformWallet
      );

      // Build instruction
      // @ts-ignore - method typing
      const ix = await program.methods
        .claimPrize()
        .accounts({
          raffle: rafflePubkey,
          winnerEntry: entryPDA,
          escrow: escrowPDA,
          winnerTokenAccount: winnerTokenAccount,
          platformTokenAccount: platformTokenAccount,
          tokenMint: raffle.tokenMint,
          winner: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
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
      console.error('Claim prize failed:', e);
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [program, provider, publicKey, sendTransaction]);

  return { claimPrize, loading, error };
}
