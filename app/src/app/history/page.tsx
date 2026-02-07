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
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function statusColor(r: RaffleWithKey['account']) {
  if (isClaimed(r.status)) return 'bg-green-500/20 text-green-400';
  if (isDrawComplete(r.status)) return 'bg-purple-500/20 text-purple-400';
  if (isCancelled(r.status)) return 'bg-red-500/20 text-red-400';
  return 'bg-gray-500/20 text-gray-400';
}

// Desktop table row
function HistoryRow({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;
  const claimed = isClaimed(r.status);
  const drawn = isDrawComplete(r.status);
  const cancelled = isCancelled(r.status);

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-b-0"
    >
      <div className="col-span-3">
        <p className="text-white font-medium truncate">{r.name}</p>
        <p className="text-gray-500 text-xs">{formatDate(r.endTime)}</p>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-white font-semibold">{formatUSDC(r.totalPot)}</p>
        <p className="text-gray-500 text-xs">{r.totalTickets} tickets</p>
      </div>
      <div className="col-span-3 text-center">
        {r.winner ? (
          <div>
            <p className="text-yellow-400 font-mono text-sm">🏆 {shortenAddress(r.winner.toBase58())}</p>
            <p className="text-gray-500 text-xs">Ticket #{r.winningTicket}</p>
          </div>
        ) : cancelled ? (
          <p className="text-gray-500 text-sm">Cancelled</p>
        ) : drawn ? (
          <p className="text-purple-400 text-sm">Awaiting claim</p>
        ) : (
          <p className="text-gray-500 text-sm">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        {r.winner ? (
          <p className="text-green-400 font-semibold">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</p>
        ) : (
          <p className="text-gray-500">—</p>
        )}
      </div>
      <div className="col-span-2 text-right">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r)}`}>
          {getStatusLabel(r.status)}
        </span>
      </div>
    </Link>
  );
}

// Mobile card
function HistoryCard({ raffle }: { raffle: RaffleWithKey }) {
  const r = raffle.account;

  return (
    <Link
      href={`/raffle/${raffle.publicKey.toBase58()}`}
      className="block bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-white font-medium">{r.name}</p>
          <p className="text-gray-500 text-xs">{formatDate(r.endTime)}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r)}`}>
          {getStatusLabel(r.status)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Pot</p>
          <p className="text-white font-semibold">{formatUSDC(r.totalPot)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">Tickets</p>
          <p className="text-white font-semibold">{r.totalTickets}</p>
        </div>
      </div>
      {r.winner && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-400 text-sm font-mono">
            🏆 {shortenAddress(r.winner.toBase58())} — {formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}
          </p>
        </div>
      )}
    </Link>
  );
}

export default function HistoryPage() {
  const { endedRaffles, loading, error } = useRaffles();

  // Sort by end time descending (most recent first)
  const sorted = [...endedRaffles].sort((a, b) =>
    b.account.endTime.toNumber() - a.account.endTime.toNumber()
  );

  // Stats
  const totalPrizes = sorted
    .filter(r => isClaimed(r.account.status))
    .reduce((sum, r) => sum + r.account.totalPot.toNumber() * 0.9, 0);
  const totalRaffles = sorted.length;
  const totalTicketsSold = sorted.reduce((sum, r) => sum + r.account.totalTickets, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Raffle History</h1>
        <p className="text-gray-400">
          Past raffles and winners. All draws verified with Switchboard VRF.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Prizes Awarded</p>
          <p className="text-2xl font-bold text-green-400">
            ${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Completed Raffles</p>
          <p className="text-2xl font-bold text-white">{totalRaffles}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Tickets Sold</p>
          <p className="text-2xl font-bold text-white">{totalTicketsSold.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="grid gap-4">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-900">
          <p className="text-red-400">Failed to load history</p>
          <p className="text-red-500 text-sm mt-2">{error.message}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-lg">No completed raffles yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Once a raffle ends and a winner is drawn, it will appear here.
          </p>
        </div>
      ) : (
        {/* Desktop table */}
        <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
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
      )}

      {/* Verification notice */}
      <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-sm">
          🔒 <strong className="text-gray-300">Provably Fair</strong> — All winners are selected using{' '}
          <a
            href="https://switchboard.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Switchboard VRF
          </a>
          . Randomness is committed before the draw and verified on-chain. Anyone can audit the results.
        </p>
      </div>
    </div>
  );
}
