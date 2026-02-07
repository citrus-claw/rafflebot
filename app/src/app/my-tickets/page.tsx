'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import Link from 'next/link';
import { IDL, PROGRAM_ID, Entry, Raffle, isActive, getStatusLabel } from '@/lib/idl/rafflebot';

interface TicketEntry {
  entryPubkey: PublicKey;
  entry: Entry;
  raffle: Raffle;
  rafflePubkey: PublicKey;
}

function formatUSDC(amount: BN): string {
  const value = amount.toNumber() / 1_000_000;
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatTimeRemaining(endTime: BN): string {
  const now = Math.floor(Date.now() / 1000);
  const end = endTime.toNumber();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Soon';
}

function TicketStub({ entry: e, isWinner }: { entry: TicketEntry; isWinner: boolean }) {
  const active = isActive(e.raffle.status);

  return (
    <Link 
      href={`/raffle/${e.rafflePubkey.toBase58()}`}
      className="group block relative"
    >
      <div
        className="relative overflow-hidden"
        style={{
          border: isWinner ? '1.6px solid #B8860B' : active ? '0.8px dashed #393939' : '0.8px dashed #D4D0C8',
          borderRadius: '6px',
          opacity: active || isWinner ? 1 : 0.75,
        }}
      >
        <div className="p-5 pr-16">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <h3 className="text-sm text-text-primary font-bold truncate">
                {isWinner && '★ '}{e.raffle.name}
              </h3>
              <p className="text-text-secondary text-[10px] mt-1">
                №{e.rafflePubkey.toBase58().slice(0, 12)}…
              </p>
            </div>
            <span
              className="ml-3 shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
              style={{
                color: isWinner ? '#B8860B' : active ? '#C41E3A' : '#8B8B6E',
                background: isWinner ? '#B8860B15' : active ? '#C41E3A15' : '#8B8B6E15',
                border: `0.8px solid ${isWinner ? '#B8860B40' : active ? '#C41E3A40' : '#8B8B6E40'}`,
              }}
            >
              {isWinner ? 'Won!' : getStatusLabel(e.raffle.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Tickets</p>
              <p className="text-accent-red font-bold text-lg">{e.entry.numTickets}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Range</p>
              <p className="text-text-primary text-xs">
                №{e.entry.startTicketIndex} – №{e.entry.startTicketIndex + e.entry.numTickets - 1}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">
              <span className="text-accent-red font-bold">{formatUSDC(e.raffle.totalPot)}</span> pot
            </span>
            {active && (
              <span className="text-accent-red font-semibold text-[10px]">
                {formatTimeRemaining(e.raffle.endTime)}
              </span>
            )}
          </div>

          {active && e.raffle.totalTickets > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: '0.8px dashed #D4D0C8' }}>
              <p className="text-text-secondary text-[10px]">
                Your odds: {((e.entry.numTickets / e.raffle.totalTickets) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        <div
          className="absolute top-0 right-0 w-14 h-full flex flex-col items-center justify-center"
          style={{ borderLeft: '0.8px dashed #393939' }}
        >
          <span className="text-text-secondary font-bold text-sm">
            {e.entry.numTickets}×
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MyTicketsPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [entries, setEntries] = useState<TicketEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEntries() {
      if (!publicKey) {
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const dummyWallet = {
          publicKey: PublicKey.default,
          signTransaction: async () => { throw new Error('Read-only'); },
          signAllTransactions: async () => { throw new Error('Read-only'); },
        };
        const provider = new AnchorProvider(connection, dummyWallet as any, {
          commitment: 'confirmed',
        });
        const program = new Program(IDL, provider);

        // @ts-ignore
        const allEntries = await program.account.entry.all([
          {
            memcmp: {
              offset: 8 + 32,
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        const ticketEntries: TicketEntry[] = [];
        
        for (const e of allEntries) {
          try {
            // @ts-ignore
            const raffle = await program.account.raffle.fetch(e.account.raffle);
            ticketEntries.push({
              entryPubkey: e.publicKey,
              entry: e.account as Entry,
              raffle: raffle as Raffle,
              rafflePubkey: e.account.raffle,
            });
          } catch {
            // Raffle might not exist anymore
          }
        }

        ticketEntries.sort((a, b) => {
          const aActive = isActive(a.raffle.status);
          const bActive = isActive(b.raffle.status);
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return b.raffle.endTime.toNumber() - a.raffle.endTime.toNumber();
        });

        setEntries(ticketEntries);
      } catch (e) {
        console.error('Failed to fetch entries:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchMyEntries();
  }, [publicKey, connection]);

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl text-text-primary font-bold mb-3">My Tickets</h1>
        <p className="text-text-secondary text-sm">Connect your wallet to see your tickets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-6 w-6 rounded-full mx-auto" style={{ border: '1.6px solid #393939', borderTopColor: 'transparent' }} />
        <p className="text-text-secondary text-xs mt-4">Loading your tickets...</p>
      </div>
    );
  }

  const activeEntries = entries.filter(e => isActive(e.raffle.status));
  const pastEntries = entries.filter(e => !isActive(e.raffle.status));

  const totalTickets = entries.reduce((sum, e) => sum + e.entry.numTickets, 0);
  const totalSpent = entries.reduce((sum, e) => 
    sum + (e.entry.numTickets * e.raffle.ticketPrice.toNumber()), 0
  ) / 1_000_000;
  const wins = entries.filter(e => 
    e.raffle.winner && e.raffle.winner.equals(publicKey!)
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-text-primary font-bold mb-2">My Tickets</h1>
        <p className="text-text-secondary text-sm">Your raffle ticket collection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Tickets', value: totalTickets.toString() },
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}` },
          { label: 'Wins', value: `${wins}`, accent: true },
        ].map((stat) => (
          <div key={stat.label} className="p-5" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.accent ? 'text-accent-gold' : 'text-text-primary'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
          <p className="text-text-secondary text-sm">No tickets yet</p>
          <Link href="/" className="text-accent-red text-xs mt-3 block font-medium">
            Browse active raffles →
          </Link>
        </div>
      ) : (
        <>
          {activeEntries.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base text-text-primary font-bold">Active Entries</h2>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {activeEntries.map((e) => (
                  <TicketStub key={e.entryPubkey.toBase58()} entry={e} isWinner={false} />
                ))}
              </div>
            </div>
          )}

          {pastEntries.length > 0 && (
            <div>
              <h2 className="text-base text-text-secondary font-bold mb-4">Past Entries</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pastEntries.map((e) => {
                  const isWinner = !!(e.raffle.winner && e.raffle.winner.equals(publicKey!));
                  return (
                    <TicketStub key={e.entryPubkey.toBase58()} entry={e} isWinner={isWinner} />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
