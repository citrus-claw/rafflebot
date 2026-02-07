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
          border: active ? '0.8px dashed #393939' : '0.8px dashed #D4D0C8',
          borderRadius: '6px',
          opacity: active ? 1 : 0.75,
        }}
      >
        {/* Content area */}
        <div className="p-5 pr-16">
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
              className="ml-3 shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
              style={{
                color: active ? '#C41E3A' : '#8B8B6E',
                background: active ? '#C41E3A15' : '#8B8B6E15',
                border: `0.8px solid ${active ? '#C41E3A40' : '#8B8B6E40'}`,
              }}
            >
              {getStatusLabel(raffle.status)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-accent-red font-bold text-lg">{formatUSDC(raffle.totalPot)}</p>
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
              <span className="text-accent-red font-semibold">
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
                  style={{ width: `${progress}%`, background: '#E8927C' }}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                {Math.round(progress)}% of min pot
              </p>
            </div>
          )}
        </div>

        {/* Ticket stub (right side) */}
        <div
          className="absolute top-0 right-0 w-14 h-full flex flex-col items-center justify-center"
          style={{ borderLeft: '0.8px dashed #393939' }}
        >
          <span
            className="text-[8px] uppercase tracking-[0.15em] font-bold text-text-secondary"
            style={{ writingMode: 'vertical-rl' }}
          >
            ADMIT ONE
          </span>
        </div>

        {/* Winner display */}
        {raffle.winner && (
          <div className="mx-5 mb-4 p-3 rounded" style={{ border: '0.8px dashed #B8860B', background: '#B8860B10' }}>
            <p className="text-accent-gold text-xs font-bold">Winner</p>
            <p className="text-text-primary text-[10px] truncate mt-1">
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
    <div
      className="overflow-hidden animate-pulse"
      style={{ border: '0.8px dashed #D4D0C8', borderRadius: '6px' }}
    >
      <div className="p-5 pr-16">
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
      <div className="absolute top-0 right-0 w-14 h-full" style={{ borderLeft: '0.8px dashed #D4D0C8' }} />
    </div>
  );
}
