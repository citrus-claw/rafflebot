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

/* ───── Ticket Stub Component ───── */
function TicketStub({ entry: e, isWinner }: { entry: TicketEntry; isWinner: boolean }) {
  const active = isActive(e.raffle.status);

  return (
    <Link 
      href={`/raffle/${e.rafflePubkey.toBase58()}`}
      className="group block relative cursor-pointer"
    >
      <div className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-carnival-surface to-carnival-dark
        border transition-all duration-300
        ${isWinner 
          ? 'border-carnival-gold/40 glow-gold' 
          : active 
            ? 'border-carnival-amber/20 hover:border-carnival-amber/40' 
            : 'border-carnival-border/50 opacity-80 hover:opacity-100'}
        ticket-perforation ticket-notch
      `}>
        {/* Top stripe */}
        <div className={`h-1.5 ${isWinner ? 'bg-gradient-to-r from-carnival-gold to-carnival-amber' : 'bg-carnival-gradient'}`} />

        <div className="p-5 pr-20">
          {/* Raffle name */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <h3 className="font-ticket text-lg text-carnival-cream truncate">
                {isWinner && '🏆 '}{e.raffle.name}
              </h3>
              <p className="text-carnival-cream/30 text-xs font-mono mt-0.5">
                {e.rafflePubkey.toBase58().slice(0, 12)}…
              </p>
            </div>
            <span className={`
              ml-3 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
              ${isWinner 
                ? 'bg-carnival-gold/15 text-carnival-gold border border-carnival-gold/20' 
                : active 
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'bg-carnival-border/50 text-carnival-cream/40'}
            `}>
              {isWinner ? 'Won!' : getStatusLabel(e.raffle.status)}
            </span>
          </div>

          {/* Ticket info */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Tickets</p>
              <p className="text-carnival-amber font-bold text-lg font-mono">{e.entry.numTickets}</p>
            </div>
            <div>
              <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Range</p>
              <p className="text-carnival-cream font-mono text-sm">
                #{e.entry.startTicketIndex} – #{e.entry.startTicketIndex + e.entry.numTickets - 1}
              </p>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-carnival-cream/40">
              <span className="text-carnival-amber font-bold">{formatUSDC(e.raffle.totalPot)}</span> pot
            </span>
            {active && (
              <span className="text-carnival-orange font-semibold text-xs">
                ⏱ {formatTimeRemaining(e.raffle.endTime)}
              </span>
            )}
          </div>

          {/* Odds */}
          {active && e.raffle.totalTickets > 0 && (
            <div className="mt-2 pt-2 border-t border-carnival-border/30">
              <p className="text-carnival-cream/25 text-xs font-mono">
                Your odds: {((e.entry.numTickets / e.raffle.totalTickets) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Stub */}
        <div className="absolute top-0 right-0 w-[72px] h-full flex flex-col items-center justify-center border-l border-dashed border-carnival-amber/20 bg-carnival-dark/50">
          <span className="text-carnival-amber/50 font-mono font-bold text-lg">
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
        <div className="text-6xl mb-4">🎟️</div>
        <h1 className="font-display text-3xl text-carnival-cream mb-3">My Tickets</h1>
        <p className="text-carnival-cream/40">Connect your wallet to see your tickets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-carnival-amber border-t-transparent rounded-full mx-auto"></div>
        <p className="text-carnival-cream/40 mt-4">Loading your tickets...</p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-carnival-cream mb-2">My Tickets 🎟️</h1>
        <p className="text-carnival-cream/40">Your raffle ticket collection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Total Tickets</p>
          <p className="text-3xl font-bold text-carnival-cream font-mono">{totalTickets}</p>
        </div>
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-carnival-cream font-mono">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Wins</p>
          <p className="text-3xl font-bold text-carnival-gold font-mono">{wins} 🏆</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-carnival-surface/50 rounded-2xl border border-carnival-border">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-carnival-cream/50 text-lg">No tickets yet</p>
          <Link href="/" className="text-carnival-amber hover:underline mt-3 block font-medium">
            Browse active raffles →
          </Link>
        </div>
      ) : (
        <>
          {activeEntries.length > 0 && (
            <div className="mb-10">
              <h2 className="font-ticket text-xl text-carnival-amber mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active Entries
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeEntries.map((e) => (
                  <TicketStub key={e.entryPubkey.toBase58()} entry={e} isWinner={false} />
                ))}
              </div>
            </div>
          )}

          {pastEntries.length > 0 && (
            <div>
              <h2 className="font-ticket text-xl text-carnival-cream/50 mb-4">Past Entries</h2>
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
