'use client';

import { useState } from 'react';
import { useRaffles, RaffleWithKey } from '@/hooks/useRaffles';
import Link from 'next/link';
import { BN } from '@coral-xyz/anchor';
import { Ticket, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatDate, shortenAddress } from '@/lib/format';
import { getStatusLabel, isClaimed, isDrawComplete, isCancelled } from '@/lib/idl/rafflebot';

function statusBadge(r: RaffleWithKey['account']) {
  if (isClaimed(r.status))
    return { className: 'bg-emerald-100 text-emerald-700', label: 'Claimed' };
  if (isDrawComplete(r.status))
    return { className: 'bg-gold/20 text-amber-700', label: 'Awaiting Claim' };
  if (isCancelled(r.status))
    return { className: 'bg-stone-200 text-stone-500', label: 'Cancelled' };
  return { className: 'bg-stone-100 text-stone-500', label: getStatusLabel(r.status) };
}

function AccordionItem({
  raffle,
  isOpen,
  onToggle,
}: {
  raffle: RaffleWithKey;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const r = raffle.account;
  const badge = statusBadge(r);
  const cancelled = isCancelled(r.status);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-md transition-shadow',
        isOpen && 'shadow-lg'
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gold/5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base text-white',
              cancelled ? 'bg-stone-400' : 'bg-carnival-red'
            )}
          >
            🎟
          </div>
          <div className="min-w-0">
            <div
              className={cn(
                'truncate font-display text-sm',
                cancelled ? 'text-stone-400' : 'text-ink'
              )}
            >
              {r.name}
            </div>
            <div className="flex gap-3 text-[11px] text-muted">
              <span>{formatDate(r.endTime)}</span>
              <span>{r.totalTickets} tickets</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              'text-sm font-bold',
              cancelled ? 'text-stone-300' : 'text-ink'
            )}
          >
            {formatUSDC(r.totalPot)}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
              badge.className
            )}
          >
            {badge.label}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-muted transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-ink/5 px-5 pb-5 pt-4">
            <div className="grid grid-cols-3 gap-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Winner
                </div>
                <div className="mt-0.5 font-mono text-xs font-semibold text-carnival-blue">
                  {r.winner ? shortenAddress(r.winner.toBase58()) : '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Prize (90%)
                </div>
                <div className="mt-0.5 font-mono text-xs font-semibold text-carnival-red">
                  {r.winner
                    ? formatUSDC(new BN(r.totalPot.toNumber() * 0.9))
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Total Pot
                </div>
                <div className="mt-0.5 font-mono text-xs font-semibold text-ink">
                  {formatUSDC(r.totalPot)}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Tickets Sold
                </div>
                <div className="mt-0.5 text-xs font-semibold text-ink">
                  {r.totalTickets.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Draw Method
                </div>
                <div className="mt-0.5 text-xs font-semibold text-ink">
                  Switchboard VRF
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Status
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-xs font-semibold',
                    isClaimed(r.status) && 'text-emerald-600',
                    isDrawComplete(r.status) && 'text-amber-600',
                    isCancelled(r.status) && 'text-stone-400'
                  )}
                >
                  {badge.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { endedRaffles, loading, error } = useRaffles();
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = [...endedRaffles].sort(
    (a, b) => b.account.endTime.toNumber() - a.account.endTime.toNumber()
  );

  const totalPrizes = sorted
    .filter((r) => isClaimed(r.account.status))
    .reduce((sum, r) => sum + r.account.totalPot.toNumber() * 0.9, 0);
  const totalRaffles = sorted.length;
  const totalTicketsSold = sorted.reduce(
    (sum, r) => sum + r.account.totalTickets,
    0
  );

  return (
    <>
      <div className="bg-carnival-red py-12 text-center text-white">
        <h1 className="font-display text-4xl">The Books</h1>
        <p className="mx-auto mt-2 max-w-md text-xs opacity-80">
          Past raffles and winners — all draws verified with Switchboard VRF.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div className="-mt-6 mb-8 flex flex-wrap justify-center gap-3">
          {[
            {
              label: 'Prizes Awarded',
              value: `$${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
            { label: 'Completed Raffles', value: totalRaffles.toString() },
            {
              label: 'Tickets Sold',
              value: totalTicketsSold.toLocaleString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-[140px] rounded-2xl bg-white/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm"
            >
              <div className="text-xl font-black text-carnival-red">
                {stat.value}
              </div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-surface">
            <div className="flex flex-col items-center gap-4 text-carnival-red">
              <Ticket size={48} className="animate-bounce" />
              <span className="font-display text-xl uppercase tracking-widest">
                Checking the Ledger...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-surface py-10 text-center">
            <p className="font-display text-xs text-carnival-red">
              Failed to load history
            </p>
            <p className="mt-1 text-[10px] text-ink/60">{error.message}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl bg-surface py-16 text-center">
            <span className="mb-4 block text-6xl">🎪</span>
            <p className="font-display text-lg text-ink/60">
              No completed raffles yet
            </p>
            <p className="mt-1 text-[10px] text-ink/40">
              Once a raffle ends and a winner is drawn, it&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((raffle) => {
              const key = raffle.publicKey.toBase58();
              return (
                <AccordionItem
                  key={key}
                  raffle={raffle}
                  isOpen={openId === key}
                  onToggle={() =>
                    setOpenId(openId === key ? null : key)
                  }
                />
              );
            })}
          </div>
        )}

        <div className="mt-8 border-t border-ink/5 py-4">
          <p className="text-[10px] text-ink/50">
            <span className="font-bold text-ink">Provably Fair</span> — All
            winners selected using{' '}
            <a
              href="https://switchboard.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-carnival-red underline underline-offset-2"
            >
              Switchboard VRF
            </a>
            . Randomness committed before draw, verified on-chain.
          </p>
        </div>
      </div>
    </>
  );
}
