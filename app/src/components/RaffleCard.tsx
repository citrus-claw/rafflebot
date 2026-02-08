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
      className="group block relative"
    >
      <div
        className="relative overflow-hidden"
        style={{
          border: active ? '0.8px dashed #D4D0C8' : '0.8px dashed #E8E4D8',
          borderRadius: '6px',
          opacity: active ? 1 : 0.75,
        }}
      >
        <div className="p-5 group-hover:border-color-[#393939]" style={ active ? { borderColor: undefined } : {}}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-text-primary font-bold tracking-tight truncate">
                {raffle.name}
              </h3>
              <p className="text-text-secondary text-[10px] mt-1">
                №{publicKey.toBase58().slice(0, 8)}
              </p>
            </div>
            <span
              className="ml-3 shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
              style={{
                color: active ? '#8B4513' : '#8B8B6E',
                background: active ? '#8B451310' : '#8B8B6E10',
                border: `0.8px solid ${active ? '#8B451330' : '#8B8B6E30'}`,
              }}
            >
              {getStatusLabel(raffle.status)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-text-primary font-bold text-lg">{formatUSDC(raffle.totalPot)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Per Ticket</p>
              <p className="text-text-primary font-semibold text-base">{formatUSDC(raffle.ticketPrice)}</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">
              <span className="text-text-primary font-bold">{raffle.totalTickets}</span> tickets sold
            </span>
            {active && (
              <span className="text-text-primary font-semibold">
                {timeRemaining}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {active && (
            <div className="mt-3">
              <div className="h-1 bg-border-light rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ width: `${progress}%`, background: '#8B4513' }}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                {Math.round(progress)}% of min pot
              </p>
            </div>
          )}

          {/* Winner display */}
          {raffle.winner && (
            <div className="mt-4 p-3 rounded" style={{ border: '0.8px solid #B8860B40', background: '#B8860B08' }}>
              <p className="text-accent-gold text-xs font-bold">Winner</p>
              <p className="text-text-primary text-[10px] truncate mt-1">
                {raffle.winner.toBase58()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RaffleCardSkeleton() {
  return (
    <div
      className="overflow-hidden animate-pulse"
      style={{ border: '0.8px dashed #D4D0C8', borderRadius: '6px' }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-4 w-32 bg-border-light rounded" />
            <div className="h-3 w-20 bg-border-light rounded mt-2" style={{ opacity: 0.5 }} />
          </div>
          <div className="h-4 w-14 bg-border-light rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="h-3 w-14 bg-border-light rounded mb-1" style={{ opacity: 0.5 }} />
            <div className="h-5 w-24 bg-border-light rounded" />
          </div>
          <div>
            <div className="h-3 w-14 bg-border-light rounded mb-1" style={{ opacity: 0.5 }} />
            <div className="h-5 w-20 bg-border-light rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
