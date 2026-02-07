'use client';

import { useRaffles, RaffleWithKey } from '@/hooks/useRaffles';
import { RaffleCardSkeleton } from '@/components/RaffleCard';
import { getStatusLabel, isClaimed, isDrawComplete, isCancelled } from '@/lib/idl/rafflebot';
import { TrophyIllustration } from '@/components/illustrations/TrophyIllustration';
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
  });
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function statusPill(r: RaffleWithKey['account']) {
  if (isClaimed(r.status)) return { color: '#B8860B', label: 'Claimed' };
  if (isDrawComplete(r.status)) return { color: '#E8927C', label: 'Awaiting Claim' };
  if (isCancelled(r.status)) return { color: '#C41E3A', label: 'Cancelled' };
  return { color: '#8B8B6E', label: getStatusLabel(r.status) };
}

/* Desktop row — StockTaper data table style with dashed row borders */
function HistoryRow({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const badge = statusPill(r);
  const cancelled = isCancelled(r.status);

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-cream/50 cursor-pointer text-xs"
      style={{ borderBottom: '0.8px dashed #D4D0C8' }}
    >
      <div className="col-span-3">
        <p className="text-text-primary font-medium truncate">{r.name}</p>
        <p className="text-text-secondary text-[10px]">{formatDate(r.endTime)}</p>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-accent-red font-bold">{formatUSDC(r.totalPot)}</p>
      </div>
      <div className="col-span-1 text-right">
        <p className="text-text-primary">{r.totalTickets}</p>
      </div>
      <div className="col-span-3 text-center">
        {r.winner ? (
          <span className="text-accent-gold font-bold">{shortenAddress(r.winner.toBase58())}</span>
        ) : cancelled ? (
          <span className="text-text-secondary">—</span>
        ) : (
          <span className="text-text-secondary">—</span>
        )}
      </div>
      <div className="col-span-1 text-right">
        {r.winner ? (
          <span className="font-bold" style={{ color: '#B8860B' }}>{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
        ) : (
          <span className="text-text-secondary">—</span>
        )}
      </div>
      <div className="col-span-2 text-right">
        <span
          className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
          style={{ color: badge.color, background: `${badge.color}15`, border: `0.8px solid ${badge.color}40` }}
        >
          {badge.label}
        </span>
      </div>
    </Link>
  );
}

/* Mobile card */
function HistoryCard({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const badge = statusPill(r);

  return (
    <Link href={`/raffle/${raffle.publicKey.toBase58()}`} className="block">
      <div className="p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <p className="text-text-primary text-xs font-bold truncate">{r.name}</p>
            <p className="text-text-secondary text-[10px]">{formatDate(r.endTime)}</p>
          </div>
          <span
            className="ml-2 shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
            style={{ color: badge.color, background: `${badge.color}15`, border: `0.8px solid ${badge.color}40` }}
          >
            {badge.label}
          </span>
        </div>
        <div className="flex justify-between text-xs" style={{ borderTop: '0.8px dashed #D4D0C8', paddingTop: '8px' }}>
          <div>
            <p className="text-text-secondary text-[10px]">Pot</p>
            <p className="text-accent-red font-bold">{formatUSDC(r.totalPot)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-[10px]">Tickets</p>
            <p className="text-text-primary font-bold">{r.totalTickets}</p>
          </div>
        </div>
        {r.winner && (
          <div className="mt-2 pt-2 flex justify-between items-center text-xs" style={{ borderTop: '0.8px dashed #D4D0C8' }}>
            <span className="text-accent-gold font-bold">{shortenAddress(r.winner.toBase58())}</span>
            <span style={{ color: '#B8860B' }} className="font-bold">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
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
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl md:text-2xl text-text-primary font-bold">Raffle History</h1>
      </div>
      <p className="text-text-secondary text-xs mb-8">
        Past raffles and winners — all draws verified with Switchboard VRF.
      </p>

      {/* Stats row — like StockTaper key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Prizes Awarded', value: `$${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#B8860B' },
          { label: 'Completed Raffles', value: totalRaffles.toString(), color: '#141414' },
          { label: 'Tickets Sold', value: totalTicketsSold.toLocaleString(), color: '#141414' },
        ].map((stat) => (
          <div key={stat.label} className="p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12" style={{ border: '0.8px dashed #C41E3A', borderRadius: '6px' }}>
          <p className="text-accent-red text-xs">Failed to load history</p>
          <p className="text-text-secondary text-[10px] mt-2">{error.message}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
          <TrophyIllustration size={60} className="mx-auto mb-4 opacity-30" />
          <p className="text-text-secondary text-xs">No completed raffles yet</p>
          <p className="text-text-secondary text-[10px] mt-1">
            Once a raffle ends and a winner is drawn, it&apos;ll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table — StockTaper Income Statement style */}
          <div className="hidden md:block" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            {/* Table header — solid border like StockTaper */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] text-text-secondary uppercase tracking-widest font-bold" style={{ borderBottom: '1.6px solid #393939' }}>
              <div className="col-span-3">Raffle</div>
              <div className="col-span-2 text-right">Pot</div>
              <div className="col-span-1 text-right">Tix</div>
              <div className="col-span-3 text-center">Winner</div>
              <div className="col-span-1 text-right">Prize</div>
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

      {/* Verification — like StockTaper footer note */}
      <div className="mt-8 py-4" style={{ borderTop: '0.8px dashed #393939' }}>
        <p className="text-text-secondary text-[10px]">
          <span className="text-text-primary font-bold">Provably Fair</span> — All winners selected using{' '}
          <a href="https://switchboard.xyz" target="_blank" rel="noopener noreferrer" className="text-accent-red underline underline-offset-2">
            Switchboard VRF
          </a>. Randomness committed before draw, verified on-chain.
        </p>
      </div>
    </div>
  );
}
