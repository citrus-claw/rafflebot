'use client';

import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Raffle, isActive, getStatusLabel } from '@/lib/idl/rafflebot';

interface RaffleCardProps {
  publicKey: PublicKey;
  raffle: Raffle;
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
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function RaffleCard({ publicKey, raffle }: RaffleCardProps) {
  const active = isActive(raffle.status);
  const timeRemaining = formatTimeRemaining(raffle.endTime);
  const progress = raffle.minPot.toNumber() > 0 
    ? Math.min(100, (raffle.totalPot.toNumber() / raffle.minPot.toNumber()) * 100)
    : 100;

  return (
    <Link 
      href={`/raffle/${publicKey.toBase58()}`}
      className="group block relative cursor-pointer"
    >
      {/* Main ticket body */}
      <div className={`
        relative overflow-hidden rounded-lg
        bg-white
        border-2 transition-all duration-300
        ${active 
          ? 'border-border-dark hover:-translate-y-1 hover:shadow-[4px_4px_0_#E0DBD2]' 
          : 'border-border-light opacity-85'}
        ticket-perf-edge ticket-notch
      `}>
        {/* Top carnival stripe */}
        <div className="h-1.5 carnival-stripe-top" />
        
        {/* Content */}
        <div className="p-5 pr-[76px]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-text-primary font-bold tracking-tight truncate">
                {raffle.name}
              </h3>
              <p className="text-text-secondary text-xs font-mono mt-0.5">
                №{publicKey.toBase58().slice(0, 8)}
              </p>
            </div>
            <span className={`
              ml-3 shrink-0 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
              ${active 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-text-secondary border-border-light'}
            `}>
              {getStatusLabel(raffle.status)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-[11px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-accent-red font-bold text-xl font-mono">{formatUSDC(raffle.totalPot)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[11px] uppercase tracking-wider">Per Ticket</p>
              <p className="text-text-primary font-semibold text-lg">{formatUSDC(raffle.ticketPrice)}</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              <span className="text-text-primary font-bold">{raffle.totalTickets}</span> tickets sold
            </span>
            {active && (
              <span className="text-accent-red font-semibold">
                ⏱ {timeRemaining}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {active && (
            <div className="mt-3">
              <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-red transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1 font-mono">
                {Math.round(progress)}% of min pot
              </p>
            </div>
          )}
        </div>

        {/* Ticket stub (right side) */}
        <div className="absolute top-0 right-0 w-[68px] h-full flex flex-col items-center justify-center bg-cream/50">
          <span className="text-accent-red/50 text-[9px] uppercase tracking-[0.2em] font-mono font-bold" style={{ writingMode: 'vertical-rl' }}>
            ADMIT ONE
          </span>
        </div>

        {/* Winner display */}
        {raffle.winner && (
          <div className="mx-5 mb-4 p-3 bg-accent-gold/10 rounded-lg border-2 border-accent-gold/30">
            <p className="text-accent-gold text-sm font-bold">🏆 Winner</p>
            <p className="text-text-primary font-mono text-xs truncate">
              {raffle.winner.toBase58()}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function RaffleCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white border-2 border-border-light animate-pulse">
      <div className="h-1.5 bg-border-light" />
      <div className="p-5 pr-[76px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-5 w-32 bg-border-light rounded" />
            <div className="h-3 w-20 bg-border-light/50 rounded mt-2" />
          </div>
          <div className="h-5 w-16 bg-border-light rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="h-3 w-14 bg-border-light/50 rounded mb-1" />
            <div className="h-6 w-24 bg-border-light rounded" />
          </div>
          <div>
            <div className="h-3 w-14 bg-border-light/50 rounded mb-1" />
            <div className="h-6 w-20 bg-border-light rounded" />
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-[68px] h-full bg-cream/30" />
    </div>
  );
}
