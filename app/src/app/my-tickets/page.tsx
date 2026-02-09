'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import Link from 'next/link';
import { IDL, Entry, Raffle, isActive, getStatusLabel, isDrawComplete, isClaimed } from '@/lib/idl/rafflebot';
import { Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatTimeRemaining, shortenAddress } from '@/lib/format';

interface TicketEntry {
  entryPubkey: PublicKey;
  entry: Entry;
  raffle: Raffle;
  rafflePubkey: PublicKey;
}

function EntryCard({ entry: e, isWinner }: { entry: TicketEntry; isWinner: boolean }) {
  const active = isActive(e.raffle.status);
  const odds = e.raffle.totalTickets > 0
    ? ((e.entry.numTickets / e.raffle.totalTickets) * 100)
    : 0;

  return (
    <Link
      href={`/raffle/${e.rafflePubkey.toBase58()}`}
      className={cn(
        'group relative block overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg',
        !active && !isWinner && 'opacity-55'
      )}
    >
      {isWinner && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-400 px-5 py-2">
          <span className="text-sm">🏆</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink">
            You won this raffle!
          </span>
        </div>
      )}

      <div className="flex items-center gap-3.5 px-5 py-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl',
            active && 'bg-carnival-red text-white',
            !active && !isWinner && 'bg-ink/5 text-muted',
            isWinner && 'bg-gold text-ink'
          )}
        >
          <span className="font-display text-xl leading-none">{e.entry.numTickets}</span>
          <span className="text-[7px] uppercase tracking-wider opacity-80">tix</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{e.raffle.name}</div>
          <div className="text-[10px] text-muted">
            No.{e.entry.startTicketIndex}–{e.entry.startTicketIndex + e.entry.numTickets - 1}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase',
              active && 'bg-carnival-red/10 text-carnival-red',
              isWinner && 'bg-gold/15 text-amber-700',
              !active && !isWinner && 'bg-ink/5 text-muted'
            )}
          >
            {active
              ? `${formatTimeRemaining(e.raffle.endTime)} left`
              : isWinner
                ? 'Winner!'
                : getStatusLabel(e.raffle.status)}
          </span>
        </div>
      </div>

      <div className="flex border-t border-ink/5">
        <div className="flex-1 border-r border-ink/5 px-4 py-2.5 text-center">
          <div className="text-xs font-bold text-carnival-red">
            {active ? formatUSDC(e.raffle.totalPot) : isWinner ? formatUSDC(e.raffle.totalPot) : formatUSDC(e.raffle.totalPot)}
          </div>
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">
            {isWinner ? 'Total Pot' : 'Pot'}
          </div>
        </div>
        <div className="flex-1 border-r border-ink/5 px-4 py-2.5 text-center">
          <div className="text-xs font-bold text-ink">
            {formatUSDC(e.raffle.ticketPrice)}
          </div>
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">Per Ticket</div>
        </div>
        <div className="flex-1 border-r border-ink/5 px-4 py-2.5 text-center">
          <div className="text-xs font-bold text-ink">
            {e.raffle.totalTickets.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">Total Sold</div>
        </div>
        <div className="flex-1 px-4 py-2.5 text-center">
          {!active && !isWinner && e.raffle.winner ? (
            <>
              <div className="font-mono text-xs font-bold text-muted">
                {shortenAddress(e.raffle.winner.toBase58())}
              </div>
              <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">Winner</div>
            </>
          ) : (
            <>
              <div className={cn('text-xs font-bold', isWinner ? 'text-gold' : 'text-carnival-blue')}>
                {odds < 1 ? odds.toFixed(1) : odds.toFixed(1)}%
              </div>
              <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">Your Odds</div>
            </>
          )}
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
      <>
        <div className="bg-carnival-red py-12 text-center text-white">
          <h1 className="font-display text-4xl">My Stubs</h1>
          <p className="mx-auto mt-2 max-w-md text-xs opacity-80">
            Your raffle ticket collection
          </p>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span className="mb-4 block text-6xl">🎟️</span>
          <p className="font-display text-lg text-ink/60">Connect Your Wallet</p>
          <p className="mt-1 text-[10px] text-ink/40">
            Connect your wallet to see your ticket stubs
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="bg-carnival-red py-12 text-center text-white">
          <h1 className="font-display text-4xl">My Stubs</h1>
          <p className="mx-auto mt-2 max-w-md text-xs opacity-80">
            Your raffle ticket collection
          </p>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Ticket size={48} className="mx-auto mb-4 animate-bounce text-carnival-red" />
          <p className="font-display text-xs uppercase tracking-widest text-ink/60">
            Fetching your stubs...
          </p>
        </div>
      </>
    );
  }

  const activeEntries = entries.filter((e) => isActive(e.raffle.status));
  const pastEntries = entries.filter((e) => !isActive(e.raffle.status));

  const totalTickets = entries.reduce((sum, e) => sum + e.entry.numTickets, 0);
  const totalSpent = entries.reduce(
    (sum, e) => sum + e.entry.numTickets * e.raffle.ticketPrice.toNumber(),
    0
  ) / 1_000_000;
  const wins = entries.filter(
    (e) => e.raffle.winner && e.raffle.winner.equals(publicKey!)
  ).length;

  return (
    <>
      <div className="bg-carnival-red py-12 text-center text-white">
        <h1 className="font-display text-4xl">My Stubs</h1>
        <p className="mx-auto mt-2 max-w-md text-xs opacity-80">
          Your raffle ticket collection
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div className="-mt-6 mb-8 flex flex-wrap justify-center gap-3">
          {[
            { label: 'Total Tickets', value: totalTickets.toString(), color: 'text-carnival-blue' },
            { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: 'text-carnival-red' },
            { label: 'Wins', value: wins.toString(), color: 'text-gold' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-[140px] rounded-2xl bg-white/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm"
            >
              <div className={cn('text-xl font-black', stat.color)}>{stat.value}</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl bg-surface py-16 text-center">
            <span className="mb-4 block text-6xl">🎪</span>
            <p className="font-display text-lg text-ink/60">No tickets yet</p>
            <p className="mt-1 text-[10px] text-ink/40">
              You haven&apos;t entered any raffles
            </p>
            <Link
              href="/"
              className="mt-4 inline-block font-display text-xs uppercase tracking-widest text-carnival-red"
            >
              Visit the Midway →
            </Link>
          </div>
        ) : (
          <>
            {activeEntries.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="font-display text-sm uppercase text-ink">Active Entries</h2>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-carnival-red" />
                </div>
                <div className="flex flex-col gap-3">
                  {activeEntries.map((e) => (
                    <EntryCard key={e.entryPubkey.toBase58()} entry={e} isWinner={false} />
                  ))}
                </div>
              </div>
            )}

            {pastEntries.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-sm uppercase text-ink/40">Past Entries</h2>
                <div className="flex flex-col gap-3">
                  {pastEntries.map((e) => {
                    const isWinner = !!(e.raffle.winner && e.raffle.winner.equals(publicKey!));
                    return (
                      <EntryCard key={e.entryPubkey.toBase58()} entry={e} isWinner={isWinner} />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="h-12" />
      </div>
    </>
  );
}
