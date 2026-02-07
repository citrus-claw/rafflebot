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
  if (isClaimed(r.status)) return { cls: 'bg-green-500/15 text-green-400 border-green-500/20', label: 'Claimed' };
  if (isDrawComplete(r.status)) return { cls: 'bg-carnival-amber/15 text-carnival-amber border-carnival-amber/20', label: 'Awaiting Claim' };
  if (isCancelled(r.status)) return { cls: 'bg-carnival-red/15 text-carnival-red border-carnival-red/20', label: 'Cancelled' };
  return { cls: 'bg-carnival-border/50 text-carnival-cream/40 border-carnival-border', label: getStatusLabel(r.status) };
}

/* Desktop row */
function HistoryRow({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const badge = statusBadge(r);
  const cancelled = isCancelled(r.status);

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-carnival-surface/50 transition-colors border-b border-carnival-border/30 last:border-b-0 cursor-pointer"
    >
      <div className="col-span-3">
        <p className="text-carnival-cream font-medium truncate">{r.name}</p>
        <p className="text-carnival-cream/25 text-xs font-mono">{formatDate(r.endTime)}</p>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-carnival-amber font-bold font-mono">{formatUSDC(r.totalPot)}</p>
        <p className="text-carnival-cream/25 text-xs">{r.totalTickets} tickets</p>
      </div>
      <div className="col-span-3 text-center">
        {r.winner ? (
          <div>
            <p className="text-carnival-gold font-mono text-sm">🏆 {shortenAddress(r.winner.toBase58())}</p>
            <p className="text-carnival-cream/25 text-xs">Ticket #{r.winningTicket}</p>
          </div>
        ) : cancelled ? (
          <p className="text-carnival-cream/30 text-sm">Cancelled</p>
        ) : (
          <p className="text-carnival-cream/30 text-sm">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        {r.winner ? (
          <p className="text-green-400 font-bold font-mono">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</p>
        ) : (
          <p className="text-carnival-cream/20">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}>
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
      className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-carnival-surface to-carnival-dark border border-carnival-border hover:border-carnival-amber/30 transition-all cursor-pointer"
    >
      <div className="h-1 bg-carnival-gradient" />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <p className="text-carnival-cream font-ticket text-lg truncate">{r.name}</p>
            <p className="text-carnival-cream/25 text-xs font-mono">{formatDate(r.endTime)}</p>
          </div>
          <span className={`ml-3 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Pot</p>
            <p className="text-carnival-amber font-bold font-mono">{formatUSDC(r.totalPot)}</p>
          </div>
          <div className="text-right">
            <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Tickets</p>
            <p className="text-carnival-cream font-bold font-mono">{r.totalTickets}</p>
          </div>
        </div>
        {r.winner && (
          <div className="mt-3 p-3 bg-carnival-gold/10 rounded-xl border border-carnival-gold/15">
            <p className="text-carnival-gold text-sm font-mono font-bold">
              🏆 {shortenAddress(r.winner.toBase58())}
              <span className="text-green-400 ml-2">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
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
        <h1 className="font-display text-3xl md:text-4xl text-carnival-cream mb-2">
          🏆 Raffle History
        </h1>
        <p className="text-carnival-cream/40">
          Past raffles and winners — all draws verified with Switchboard VRF.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Prizes Awarded</p>
          <p className="text-3xl font-bold text-green-400 font-mono">
            ${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Completed Raffles</p>
          <p className="text-3xl font-bold text-carnival-cream font-mono">{totalRaffles}</p>
        </div>
        <div className="bg-carnival-surface rounded-2xl p-5 border border-carnival-border">
          <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Tickets Sold</p>
          <p className="text-3xl font-bold text-carnival-cream font-mono">{totalTicketsSold.toLocaleString()}</p>
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
        <div className="text-center py-12 bg-carnival-red/10 rounded-2xl border border-carnival-red/20">
          <p className="text-carnival-red font-medium">Failed to load history</p>
          <p className="text-carnival-cream/30 text-sm mt-2">{error.message}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-carnival-surface/50 rounded-2xl border border-carnival-border">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-carnival-cream/50 text-lg">No completed raffles yet</p>
          <p className="text-carnival-cream/30 text-sm mt-2">
            Once a raffle ends and a winner is drawn, it'll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-carnival-surface rounded-2xl border border-carnival-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-carnival-dark/50 border-b border-carnival-border text-carnival-cream/30 text-[11px] uppercase tracking-widest font-bold">
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
      <div className="mt-10 p-5 bg-carnival-surface/50 rounded-2xl border border-carnival-border">
        <p className="text-carnival-cream/40 text-sm">
          🔒 <strong className="text-carnival-cream/60">Provably Fair</strong> — All winners selected using{' '}
          <a
            href="https://switchboard.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-carnival-amber hover:text-carnival-gold underline underline-offset-2"
          >
            Switchboard VRF
          </a>
          . Randomness is committed before the draw and verified on-chain. Anyone can audit the results.
        </p>
      </div>
    </div>
  );
}
