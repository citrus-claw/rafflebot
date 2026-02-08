'use client';

import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { Raffle, isActive, getStatusLabel } from '@/lib/idl/rafflebot';
import { ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatTimeRemaining } from '@/lib/format';

interface RaffleCardProps {
 publicKey: PublicKey;
 raffle: Raffle;
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
 <div className={cn(
"bg-surface border-2 border-ink rounded-sm overflow-hidden transition-transform",
 !active &&"opacity-75"
 )}>
 <div className="h-1.5 bg-stripes-red"/>

 <div className="p-5">
 <div className="flex justify-between items-start mb-4">
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-display text-carnival-blue group-hover:text-carnival-red transition-colors truncate uppercase">
 {raffle.name}
 </h3>
 <p className="text-ink/40 text-[10px] font-mono mt-0.5">
 {publicKey.toBase58().slice(0, 8)}
 </p>
 </div>
 <span className={cn(
"ml-3 shrink-0 inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-sm border-2",
 active ?"bg-white text-green-700 border-green-700":"bg-ink text-gold border-ink"
 )}>
 {getStatusLabel(raffle.status)}
 </span>
 </div>

 <div className="grid grid-cols-2 gap-3 mb-4">
 <div>
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Jackpot</p>
 <p className="text-carnival-red font-bold text-lg font-mono">{formatUSDC(raffle.totalPot)}</p>
 </div>
 <div>
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Per Ticket</p>
 <p className="text-ink font-semibold text-base font-mono">{formatUSDC(raffle.ticketPrice)}</p>
 </div>
 </div>

 <div className="flex items-center justify-between text-xs">
 <span className="text-ink/60">
 <span className="text-ink font-bold">{raffle.totalTickets}</span> tickets sold
 </span>
 <div className="flex items-center gap-2">
 {active && (
 <span className="text-carnival-red font-semibold">
 {timeRemaining}
 </span>
 )}
 <div className="bg-carnival-blue text-white p-1.5 rounded-sm group-hover:bg-carnival-red group-hover:scale-110 transition-all">
 <ChevronRight size={14} />
 </div>
 </div>
 </div>

 {active && (
 <div className="mt-3">
 <div className="h-2 bg-paper rounded-sm overflow-hidden border border-ink/10">
 <div
 className="h-full rounded-sm bg-gold"
 style={{ width: `${progress}%` }}
 />
 </div>
 <p className="text-[10px] text-ink/50 mt-1">
 {Math.round(progress)}% of min pot
 </p>
 </div>
 )}

 {raffle.winner && (
 <div className="mt-4 p-3 bg-gold/10 border-2 border-gold rounded-sm">
 <div className="flex items-center gap-1">
 <Star size={12} className="fill-gold text-gold"/>
 <p className="text-gold text-xs font-bold font-display uppercase">Winner</p>
 </div>
 <p className="text-ink text-[10px] truncate mt-1 font-mono">
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
 <div className="bg-surface border-2 border-ink rounded-sm overflow-hidden animate-pulse">
 <div className="h-1.5 bg-paper"/>
 <div className="p-5">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="h-4 w-32 bg-paper rounded-sm"/>
 <div className="h-3 w-20 bg-paper rounded-sm mt-2 opacity-50"/>
 </div>
 <div className="h-6 w-14 bg-paper rounded-sm"/>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <div className="h-3 w-14 bg-paper rounded-sm mb-1 opacity-50"/>
 <div className="h-5 w-24 bg-paper rounded-sm"/>
 </div>
 <div>
 <div className="h-3 w-14 bg-paper rounded-sm mb-1 opacity-50"/>
 <div className="h-5 w-20 bg-paper rounded-sm"/>
 </div>
 </div>
 </div>
 </div>
 );
}
