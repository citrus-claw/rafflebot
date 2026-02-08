'use client';

import { ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockRaffle {
 id: string;
 name: string;
 ticketPrice: number;
 totalPot: number;
 minPot: number;
 totalTickets: number;
 endTime: number;
 status: 'active' | 'ended';
 winner?: string;
}

interface MockRaffleCardProps {
 raffle: MockRaffle;
 onClick?: () => void;
}

function formatMockUSDC(amount: number): string {
 return amount.toLocaleString('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 });
}

function formatMockTimeRemaining(endTime: number): string {
 const now = Date.now();
 const diff = endTime - now;
 if (diff <= 0) return 'Ended';
 const days = Math.floor(diff / (86400 * 1000));
 const hours = Math.floor((diff % (86400 * 1000)) / (3600 * 1000));
 const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
 if (days > 0) return `${days}d ${hours}h`;
 if (hours > 0) return `${hours}h ${minutes}m`;
 return `${minutes}m`;
}

export function MockRaffleCard({ raffle, onClick }: MockRaffleCardProps) {
 const active = raffle.status === 'active';
 const timeRemaining = formatMockTimeRemaining(raffle.endTime);
 const progress = raffle.minPot > 0
 ? Math.min(100, (raffle.totalPot / raffle.minPot) * 100)
 : 100;

 return (
 <div onClick={onClick} className="group relative cursor-pointer">
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
 <p className="text-ink/40 text-[10px] font-mono mt-0.5">No.{raffle.id}</p>
 </div>
 <span className={cn(
"ml-3 shrink-0 inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-sm border-2",
 active ?"bg-white text-green-700 border-green-700":"bg-ink text-gold border-ink"
 )}>
 {active ? 'Open' : 'Ended'}
 </span>
 </div>

 <div className="grid grid-cols-2 gap-3 mb-4">
 <div>
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Jackpot</p>
 <p className="text-carnival-red font-bold text-lg font-mono">{formatMockUSDC(raffle.totalPot)}</p>
 </div>
 <div>
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Per Ticket</p>
 <p className="text-ink font-semibold text-base font-mono">{formatMockUSDC(raffle.ticketPrice)}</p>
 </div>
 </div>

 <div className="flex items-center justify-between text-xs">
 <span className="text-ink/60">
 <span className="text-ink font-bold">{raffle.totalTickets}</span> tickets sold
 </span>
 <div className="flex items-center gap-2">
 {active && <span className="text-carnival-red font-semibold">{timeRemaining}</span>}
 <div className="bg-carnival-blue text-white p-1.5 rounded-sm group-hover:bg-carnival-red group-hover:scale-110 transition-all">
 <ChevronRight size={14} />
 </div>
 </div>
 </div>

 {active && (
 <div className="mt-3">
 <div className="h-2 bg-paper rounded-sm overflow-hidden border border-ink/10">
 <div className="h-full rounded-sm bg-gold"style={{ width: `${progress}%` }} />
 </div>
 <p className="text-[10px] text-ink/50 mt-1">{Math.round(progress)}% of min pot</p>
 </div>
 )}

 {raffle.winner && (
 <div className="mt-4 p-3 bg-gold/10 border-2 border-gold rounded-sm">
 <div className="flex items-center gap-1">
 <Star size={12} className="fill-gold text-gold"/>
 <p className="text-gold text-xs font-bold font-display uppercase">Winner</p>
 </div>
 <p className="text-ink text-[10px] truncate mt-1 font-mono">{raffle.winner}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
