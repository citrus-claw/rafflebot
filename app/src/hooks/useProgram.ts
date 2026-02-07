'use client';

import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, setProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, IDL } from '@/lib/idl/rafflebot';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    return new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    setProvider(provider);
    // @ts-ignore - IDL type mismatch, will fix when using generated IDL
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  return { program, provider, connection, wallet };
}

export function useProgramReadonly() {
  const { connection } = useConnection();

  const program = useMemo(() => {
    // Create a dummy provider for read-only operations
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only'); },
      signAllTransactions: async () => { throw new Error('Read-only'); },
    };
    const provider = new AnchorProvider(connection, dummyWallet as any, {
      commitment: 'confirmed',
    });
    // @ts-ignore
    return new Program(IDL, PROGRAM_ID, provider);
  }, [connection]);

  return { program, connection };
}
