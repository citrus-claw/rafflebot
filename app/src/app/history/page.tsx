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
      {/* Name */}
      <div className="col-span-3">
        <p className="text-white font-medium truncate">{r.name}</p>
        <p className="text-gray-500 text-xs">{formatDate(r.endTime)}</p>
      </div>

      {/* Pot */}
      <div className="col-span-2 text-right">
        <p className="text-white font-semibold">{formatUSDC(r.totalPot)}</p>
        <p className="text-gray-500 text-xs">{r.totalTickets} tickets</p>
      </div>

      {/* Winner */}
      <div className="col-span-3 text-center">
        {r.winner ? (
          <div>
            <p className="text-yellow-400 font-mono text-sm">
              🏆 {shortenAddress(r.winner.toBase58())}
            </p>
            <p className="text-gray-500 text-xs">
              Ticket #{r.winningTicket}
            </p>
          </div>
        ) : cancelled ? (
          <p className="text-gray-500 text-sm">Cancelled — refunds enabled</p>
        ) : drawn ? (
          <p className="text-purple-400 text-sm">Winner drawn — awaiting claim</p>
        ) : (
          <p className="text-gray-500 text-sm">—</p>
        )}
      </div>

      {/* Prize */}
      <div className="col-span-2 text-right">
        {r.winner ? (
          <p className="text-green-400 font-semibold">
            {formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}
          </p>
        ) : (
          <p className="text-gray-500">—</p>
        )}
      </div>

      {/* Status */}
      <div className="col-span-2 text-right">
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${claimed ? 'bg-green-500/20 text-green-400' :
            drawn ? 'bg-purple-500/20 text-purple-400' :
            cancelled ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'}
        `}>
          {getStatusLabel(r.status)}
        </span>
      </div>
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
      <div className="grid grid-cols-3 gap-4 mb-8">
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
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
            <div className="col-span-3">Raffle</div>
            <div className="col-span-2 text-right">Pot</div>
            <div className="col-span-3 text-center">Winner</div>
            <div className="col-span-2 text-right">Prize (90%)</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Rows */}
          {sorted.map((raffle) => (
            <HistoryRow key={raffle.publicKey.toBase58()} raffle={raffle} />
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
