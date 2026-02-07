'use client';

import { useRaffles, RaffleWithKey } from '@/hooks/useRaffles';
import { RaffleCardSkeleton } from '@/components/RaffleCard';
import { getStatusLabel, isClaimed, isDrawComplete, isCancelled } from '@/lib/idl/rafflebot';
import Link from 'next/link';
import { BN } from '@coral-xyz/anchor';

function formatUSDC(amount: BN): string {
  const value = amount.toNumber() / 1_000_000;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatDate(timestamp: BN): string {
  return new Date(timestamp.toNumber() * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function statusBadge(r: RaffleWithKey['account']) {
  if (isClaimed(r.status)) return { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Claimed' };
  if (isDrawComplete(r.status)) return { cls: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30', label: 'Awaiting Claim' };
  if (isCancelled(r.status)) return { cls: 'bg-red-50 text-accent-red border-red-200', label: 'Cancelled' };
  return { cls: 'bg-gray-50 text-text-secondary border-border-light', label: getStatusLabel(r.status) };
}

/* Desktop row */
function HistoryRow({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const badge = statusBadge(r);
  const cancelled = isCancelled(r.status);

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-cream transition-colors border-b border-border-light last:border-b-0 cursor-pointer"
    >
      <div className="col-span-3">
        <p className="text-text-primary font-medium truncate">{r.name}</p>
        <p className="text-text-secondary text-xs font-mono">{formatDate(r.endTime)}</p>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-accent-red font-bold font-mono">{formatUSDC(r.totalPot)}</p>
        <p className="text-text-secondary text-xs">{r.totalTickets} tickets</p>
      </div>
      <div className="col-span-3 text-center">
        {r.winner ? (
          <div>
            <p className="text-accent-gold font-mono text-sm font-bold">🏆 {shortenAddress(r.winner.toBase58())}</p>
            <p className="text-text-secondary text-xs">Ticket №{r.winningTicket}</p>
          </div>
        ) : cancelled ? (
          <p className="text-text-secondary text-sm">Cancelled</p>
        ) : (
          <p className="text-text-secondary text-sm">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        {r.winner ? (
          <p className="text-green-600 font-bold font-mono">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</p>
        ) : (
          <p className="text-text-secondary/30">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </Link>
  );
}

/* Mobile card */
function HistoryCard({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const badge = statusBadge(r);

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="block relative overflow-hidden rounded-lg bg-white border-2 border-border-dark hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#E0DBD2] transition-all cursor-pointer"
    >
      <div className="h-1 carnival-stripe-top" />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <p className="text-text-primary font-display text-lg font-bold truncate">{r.name}</p>
            <p className="text-text-secondary text-xs font-mono">{formatDate(r.endTime)}</p>
          </div>
          <span className={`ml-3 shrink-0 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-secondary text-[11px] uppercase tracking-wider">Pot</p>
            <p className="text-accent-red font-bold font-mono">{formatUSDC(r.totalPot)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-[11px] uppercase tracking-wider">Tickets</p>
            <p className="text-text-primary font-bold font-mono">{r.totalTickets}</p>
          </div>
        </div>
        {r.winner && (
          <div className="mt-3 p-3 bg-accent-gold/10 rounded-lg border border-accent-gold/20">
            <p className="text-accent-gold text-sm font-mono font-bold">
              🏆 {shortenAddress(r.winner.toBase58())}
              <span className="text-green-600 ml-2">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const { endedRaffles, loading, error } = useRaffles();

  const sorted = [...endedRaffles].sort((a, b) =>
    b.account.endTime.toNumber() - a.account.endTime.toNumber()
  );

  const totalPrizes = sorted
    .filter(r => isClaimed(r.account.status))
    .reduce((sum, r) => sum + r.account.totalPot.toNumber() * 0.9, 0);
  const totalRaffles = sorted.length;
  const totalTicketsSold = sorted.reduce((sum, r) => sum + r.account.totalTickets, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-text-primary font-bold mb-2">
          Raffle History
        </h1>
        <p className="text-text-secondary">
          Past raffles and winners — all draws verified with Switchboard VRF.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-lg p-5 border-2 border-border-dark">
          <p className="text-text-secondary text-[11px] uppercase tracking-wider mb-1">Prizes Awarded</p>
          <p className="text-3xl font-bold text-green-600 font-mono">
            ${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg p-5 border-2 border-border-dark">
          <p className="text-text-secondary text-[11px] uppercase tracking-wider mb-1">Completed Raffles</p>
          <p className="text-3xl font-bold text-text-primary font-mono">{totalRaffles}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border-2 border-border-dark">
          <p className="text-text-secondary text-[11px] uppercase tracking-wider mb-1">Tickets Sold</p>
          <p className="text-3xl font-bold text-text-primary font-mono">{totalTicketsSold.toLocaleString()}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-accent-red">
          <p className="text-accent-red font-medium">Failed to load history</p>
          <p className="text-text-secondary text-sm mt-2">{error.message}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-border-dark">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-text-secondary text-lg">No completed raffles yet</p>
          <p className="text-text-secondary/60 text-sm mt-2">
            Once a raffle ends and a winner is drawn, it&apos;ll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg border-2 border-border-dark overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-cream border-b-2 border-border-dark text-text-secondary text-[11px] uppercase tracking-widest font-bold">
              <div className="col-span-3">Raffle</div>
              <div className="col-span-2 text-right">Pot</div>
              <div className="col-span-3 text-center">Winner</div>
              <div className="col-span-2 text-right">Prize (90%)</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {sorted.map((raffle) => (
              <HistoryRow key={raffle.publicKey.toBase58()} raffle={raffle} />
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sorted.map((raffle) => (
              <HistoryCard key={raffle.publicKey.toBase58()} raffle={raffle} />
            ))}
          </div>
        </>
      )}

      {/* Verification footer */}
      <div className="mt-10 p-5 bg-white rounded-lg border-2 border-border-light">
        <p className="text-text-secondary text-sm">
          🔒 <strong className="text-text-primary">Provably Fair</strong> — All winners selected using{' '}
          <a
            href="https://switchboard.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-red hover:text-accent-red/80 underline underline-offset-2"
          >
            Switchboard VRF
          </a>
          . Randomness is committed before the draw and verified on-chain. Anyone can audit the results.
        </p>
      </div>
    </div>
  );
}
