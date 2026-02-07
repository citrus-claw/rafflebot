'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgramReadonly, useProgram } from './useProgram';
import { 
  Raffle, 
  Entry, 
  isActive, 
  getEntryPDA, 
  getEscrowPDA,
  PROGRAM_ID 
} from '@/lib/idl/rafflebot';

export interface RaffleWithKey {
  publicKey: PublicKey;
  account: Raffle;
}

export function useRaffles() {
  const { program, connection } = useProgramReadonly();
  const [raffles, setRaffles] = useState<RaffleWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRaffles = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore - account type
      const accounts = await program.account.raffle.all();
      setRaffles(accounts.map((a: any) => ({
        publicKey: a.publicKey,
        account: a.account as Raffle,
      })));
      setError(null);
    } catch (e) {
      console.error('Failed to fetch raffles:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  // Separate active vs ended
  const activeRaffles = raffles.filter(r => isActive(r.account.status));
  const endedRaffles = raffles.filter(r => !isActive(r.account.status));

  return { 
    raffles, 
    activeRaffles, 
    endedRaffles, 
    loading, 
    error, 
    refetch: fetchRaffles 
  };
}

export function useRaffle(publicKey: PublicKey | null) {
  const { program, connection } = useProgramReadonly();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRaffle = useCallback(async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      // @ts-ignore
      const account = await program.account.raffle.fetch(publicKey);
      setRaffle(account as Raffle);
      setError(null);
    } catch (e) {
      console.error('Failed to fetch raffle:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  useEffect(() => {
    fetchRaffle();
  }, [fetchRaffle]);

  return { raffle, loading, error, refetch: fetchRaffle };
}

export function useMyEntry(rafflePubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useProgramReadonly();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntry = useCallback(async () => {
    if (!rafflePubkey || !publicKey) {
      setEntry(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [entryPDA] = getEntryPDA(rafflePubkey, publicKey);
      // @ts-ignore
      const account = await program.account.entry.fetch(entryPDA);
      setEntry(account as Entry);
    } catch (e) {
      // Entry doesn't exist = user hasn't bought tickets
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [program, rafflePubkey, publicKey]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, refetch: fetchEntry };
}
