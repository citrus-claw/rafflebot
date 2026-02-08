'use client';

import { useRaffles, RaffleWithKey } from '@/hooks/useRaffles';
import Link from 'next/link';
import { BN } from '@coral-xyz/anchor';
import { ChevronRight, Star, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatDate, shortenAddress } from '@/lib/format';
import { getStatusLabel, isClaimed, isDrawComplete, isCancelled } from '@/lib/idl/rafflebot';

function statusPill(r: RaffleWithKey['account']) {
 if (isClaimed(r.status)) return { color: 'text-gold', bg: 'bg-ink', border: 'border-ink', label: 'Claimed' };
 if (isDrawComplete(r.status)) return { color: 'text-gold', bg: 'bg-white', border: 'border-gold', label: 'Awaiting Claim' };
 if (isCancelled(r.status)) return { color: 'text-carnival-red', bg: 'bg-white', border: 'border-carnival-red', label: 'Cancelled' };
 return { color: 'text-muted', bg: 'bg-white', border: 'border-ink/30', label: getStatusLabel(r.status) };
}

function HistoryRow({ raffle }: { raffle: RaffleWithKey }) {
 const r = raffle.account;
 const badge = statusPill(r);

 return (
 <Link
 href={`/raffle/${raffle.publicKey.toBase58()}`}
 className="grid grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-gold/10 cursor-pointer text-sm transition-colors group border-b-2 border-ink/5"
 >
 <div className="col-span-3">
 <p className="font-display text-carnival-blue group-hover:text-carnival-red transition-colors truncate">{r.name}</p>
 <p className="text-ink/40 text-[10px] font-mono mt-0.5">{formatDate(r.endTime)}</p>
 </div>
 <div className="col-span-2 text-right font-bold font-mono text-carnival-red">
 {formatUSDC(r.totalPot)}
 </div>
 <div className="col-span-1 text-right font-mono">{r.totalTickets}</div>
 <div className="col-span-3 text-center">
 {r.winner ? (
 <span className="text-gold font-bold font-mono">{shortenAddress(r.winner.toBase58())}</span>
 ) : (
 <span className="text-ink/30">&mdash;</span>
 )}
 </div>
 <div className="col-span-1 text-right">
 {r.winner ? (
 <span className="font-bold text-gold font-mono">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
 ) : (
 <span className="text-ink/30">&mdash;</span>
 )}
 </div>
 <div className="col-span-2 text-right">
 <span className={cn("inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-sm border-2", badge.bg, badge.border, badge.color)}>
 {badge.label}
 </span>
 </div>
 </Link>
 );
}

function HistoryCard({ raffle }: { raffle: RaffleWithKey }) {
 const r = raffle.account;
 const badge = statusPill(r);

 return (
 <Link href={`/raffle/${raffle.publicKey.toBase58()}`} className="block">
 <div className="bg-surface border-2 border-dashed border-ink rounded-sm overflow-hidden">
 <div className="h-1 bg-stripes-red"/>
 <div className="p-4">
 <div className="flex justify-between items-start mb-2">
 <div className="min-w-0">
 <p className="text-sm font-display text-carnival-blue truncate">{r.name}</p>
 <p className="text-ink/40 text-[10px] font-mono">{formatDate(r.endTime)}</p>
 </div>
 <span className={cn("ml-2 shrink-0 px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm border-2", badge.bg, badge.border, badge.color)}>
 {badge.label}
 </span>
 </div>
 <div className="flex justify-between text-xs border-t-2 border-ink/10 pt-2 mt-2">
 <div>
 <p className="text-ink/50 text-[10px] font-display uppercase">Pot</p>
 <p className="text-carnival-red font-bold font-mono">{formatUSDC(r.totalPot)}</p>
 </div>
 <div className="text-right">
 <p className="text-ink/50 text-[10px] font-display uppercase">Tickets</p>
 <p className="text-ink font-bold font-mono">{r.totalTickets}</p>
 </div>
 </div>
 {r.winner && (
 <div className="mt-2 pt-2 flex justify-between items-center text-xs border-t-2 border-ink/10">
 <span className="text-gold font-bold font-mono">{shortenAddress(r.winner.toBase58())}</span>
 <span className="text-gold font-bold font-mono">{formatUSDC(new BN(r.totalPot.toNumber() * 0.9))}</span>
 </div>
 )}
 </div>
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
 <h1 className="text-3xl font-display text-ink mb-1">The Books</h1>
 <p className="text-ink/60 text-xs mb-8">
 Past raffles and winners — all draws verified with Switchboard VRF.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
 {[
 { label: 'Prizes Awarded', value: `$${(totalPrizes / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-gold' },
 { label: 'Completed Raffles', value: totalRaffles.toString(), color: 'text-carnival-red' },
 { label: 'Tickets Sold', value: totalTicketsSold.toLocaleString(), color: 'text-carnival-blue' },
 ].map((stat) => (
 <div key={stat.label} className="bg-surface border-2 border-dashed border-ink p-4 rounded-sm text-center">
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display mb-1">{stat.label}</p>
 <p className={cn("text-2xl font-display", stat.color)}>{stat.value}</p>
 </div>
 ))}
 </div>

 {loading ? (
 <div className="h-64 flex items-center justify-center border-4 border-dotted border-ink/20 rounded-sm bg-paper">
 <div className="flex flex-col items-center gap-4 text-carnival-red">
 <Ticket size={48} className="animate-bounce"/>
 <span className="font-display text-xl uppercase tracking-widest">Checking the Ledger...</span>
 </div>
 </div>
 ) : error ? (
 <div className="text-center py-12 border-2 border-dashed border-ink rounded-sm bg-surface">
 <p className="text-carnival-red text-xs font-display">Failed to load history</p>
 <p className="text-ink/60 text-[10px] mt-2">{error.message}</p>
 </div>
 ) : sorted.length === 0 ? (
 <div className="text-center py-16 border-4 border-dotted border-ink/20 rounded-sm bg-paper">
 <span className="text-6xl mb-4 block">🎪</span>
 <p className="text-ink/60 font-display text-lg">No completed raffles yet</p>
 <p className="text-ink/40 text-[10px] mt-1">
 Once a raffle ends and a winner is drawn, it&apos;ll appear here.
 </p>
 </div>
 ) : (
 <>
 <div className="hidden md:block bg-surface border-2 border-dashed border-ink rounded-sm overflow-hidden">
 <div className="bg-carnival-red p-4 border-b-2 border-ink flex items-center gap-2 text-white">
 <Star className="fill-gold text-gold"size={20} />
 <h2 className="font-display text-xl tracking-wide">Settled Games</h2>
 <Star className="fill-gold text-gold"size={20} />
 </div>
 <div className="bg-paper text-ink/70 uppercase text-[10px] font-bold tracking-widest font-display grid grid-cols-12 gap-3 px-6 py-3 border-b-2 border-ink/20">
 <div className="col-span-3">Attraction</div>
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

 <div className="md:hidden space-y-3">
 {sorted.map((raffle) => (
 <HistoryCard key={raffle.publicKey.toBase58()} raffle={raffle} />
 ))}
 </div>
 </>
 )}

 <div className="mt-8 py-4 border-t-2 border-ink/20">
 <p className="text-ink/50 text-[10px]">
 <span className="text-ink font-bold font-display">Provably Fair</span> — All winners selected using{' '}
 <a href="https://switchboard.xyz"target="_blank"rel="noopener noreferrer"className="text-carnival-red underline underline-offset-2">
 Switchboard VRF
 </a>. Randomness committed before draw, verified on-chain.
 </p>
 </div>
 </div>
 );
}
