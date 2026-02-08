'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import Link from 'next/link';
import { IDL, PROGRAM_ID, Entry, Raffle, isActive, getStatusLabel } from '@/lib/idl/rafflebot';
import { Star, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatTimeRemaining } from '@/lib/format';

interface TicketEntry {
 entryPubkey: PublicKey;
 entry: Entry;
 raffle: Raffle;
 rafflePubkey: PublicKey;
}

/* ───── Carnival Ticket Stub ───── */
function TicketStub({ entry: e, isWinner }: { entry: TicketEntry; isWinner: boolean }) {
 const active = isActive(e.raffle.status);
 const isSpecial = e.entry.startTicketIndex % 2 === 0;
 const bgClass = isSpecial ? 'bg-stripes-red' : 'bg-stripes-blue';
 const accentColor = isSpecial ? 'text-carnival-red' : 'text-carnival-blue';
 const borderAccent = isSpecial ? 'border-carnival-red' : 'border-carnival-blue';

 return (
 <Link href={`/raffle/${e.rafflePubkey.toBase58()}`} className="group block relative mb-6 max-w-2xl mx-auto transform transition-transform hover:scale-[1.01]">
 <div className="flex w-full">
 {/* LEFT SECTION (Main Ticket) */}
 <div className={cn("flex-grow relative p-1 text-paper overflow-hidden rounded-l-sm", bgClass)}>
 <div className="border-2 border-dashed border-paper/50 h-full p-4 relative flex flex-col justify-between">
 <div className="flex justify-between items-start border-b-2 border-paper/30 pb-2 mb-2">
 <div>
 <h3 className="font-display text-2xl tracking-wide uppercase text-white">Admit One</h3>
 <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">RAFFLE BOT Official Entry</p>
 </div>
 <Star className="text-gold fill-gold animate-pulse"size={24} />
 </div>

 <div className="space-y-2 my-2">
 <div className="bg-paper text-ink px-3 py-1 font-bold font-mono text-sm inline-block transform -rotate-1">
 {e.raffle.name}
 </div>
 <div className="text-xs uppercase font-bold opacity-90">
 Tickets: <span className="font-mono text-lg">{e.entry.numTickets}</span>
 <span className="ml-3">Range: No.{e.entry.startTicketIndex}–{e.entry.startTicketIndex + e.entry.numTickets - 1}</span>
 </div>
 <div className="text-[10px] font-mono opacity-80 break-all leading-tight">
 Raffle: {e.rafflePubkey.toBase58().substring(0, 24)}...
 </div>
 </div>

 <div className="mt-auto pt-2 border-t-2 border-paper/30 flex justify-between items-end">
 <div className="text-[10px] font-bold uppercase">NO REFUNDS • BEARER ASSET</div>
 <div className="text-xs font-mono">
 <span className="text-gold font-bold">{formatUSDC(e.raffle.totalPot)}</span> pot
 </div>
 </div>
 </div>

 <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-between py-2 z-10">
 {Array.from({ length: 10 }).map((_, i) => (
 <div key={i} className="w-4 h-4 rounded-full bg-paper mb-1"/>
 ))}
 </div>
 </div>

 {/* CENTER PERFORATION LINE */}
 <div className="w-0 border-l-4 border-dotted border-paper/60 relative z-20"/>

 {/* RIGHT SECTION (The Stub) */}
 <div className="w-28 relative bg-surface p-1 rounded-r-sm flex flex-col">
 <div className={cn("h-full border-2 p-2 flex flex-col items-center justify-center gap-2 rounded-r-sm", borderAccent)}>
 <div className={cn("font-display text-sm uppercase text-center leading-none", accentColor)}>
 Keep<br />This<br />Coupon
 </div>

 <div className={cn("text-3xl font-display", accentColor)}>
 {e.entry.numTickets}×
 </div>

 <div className="mt-auto text-center">
 <span className={cn("block text-[8px] uppercase font-bold", accentColor)}>
 {active ? formatTimeRemaining(e.raffle.endTime) : getStatusLabel(e.raffle.status)}
 </span>
 </div>
 </div>

 <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between py-2 z-10">
 {Array.from({ length: 10 }).map((_, i) => (
 <div key={i} className="w-4 h-4 rounded-full bg-paper mb-1"/>
 ))}
 </div>
 </div>
 </div>

 {isWinner && (
 <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
 <div className="bg-gold text-ink font-display text-3xl uppercase px-8 py-4 border-4 border-ink transform -rotate-12 animate-bounce">
 WINNER!
 </div>
 </div>
 )}
 </Link>
 );
}

export default function MyTicketsPage() {
 const { publicKey, connected } = useWallet();
 const { connection } = useConnection();
 const [entries, setEntries] = useState<TicketEntry[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function fetchMyEntries() {
 if (!publicKey) {
 setEntries([]);
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 const dummyWallet = {
 publicKey: PublicKey.default,
 signTransaction: async () => { throw new Error('Read-only'); },
 signAllTransactions: async () => { throw new Error('Read-only'); },
 };
 const provider = new AnchorProvider(connection, dummyWallet as any, {
 commitment: 'confirmed',
 });
 const program = new Program(IDL, provider);

 // @ts-ignore
 const allEntries = await program.account.entry.all([
 {
 memcmp: {
 offset: 8 + 32,
 bytes: publicKey.toBase58(),
 },
 },
 ]);

 const ticketEntries: TicketEntry[] = [];

 for (const e of allEntries) {
 try {
 // @ts-ignore
 const raffle = await program.account.raffle.fetch(e.account.raffle);
 ticketEntries.push({
 entryPubkey: e.publicKey,
 entry: e.account as Entry,
 raffle: raffle as Raffle,
 rafflePubkey: e.account.raffle,
 });
 } catch {
 // Raffle might not exist anymore
 }
 }

 ticketEntries.sort((a, b) => {
 const aActive = isActive(a.raffle.status);
 const bActive = isActive(b.raffle.status);
 if (aActive && !bActive) return -1;
 if (!aActive && bActive) return 1;
 return b.raffle.endTime.toNumber() - a.raffle.endTime.toNumber();
 });

 setEntries(ticketEntries);
 } catch (e) {
 console.error('Failed to fetch entries:', e);
 } finally {
 setLoading(false);
 }
 }

 fetchMyEntries();
 }, [publicKey, connection]);

 if (!connected) {
 return (
 <div className="text-center py-20">
 <span className="text-6xl mb-4 block">🎟️</span>
 <h1 className="text-3xl font-display text-carnival-red mb-3">My Stubs</h1>
 <p className="text-ink/60 text-sm">Connect your wallet to see your ticket stubs</p>
 </div>
 );
 }

 if (loading) {
 return (
 <div className="text-center py-20">
 <Ticket size={48} className="text-carnival-red animate-bounce mx-auto mb-4"/>
 <p className="text-ink/60 text-xs font-display uppercase tracking-widest">Fetching your stubs...</p>
 </div>
 );
 }

 const activeEntries = entries.filter(e => isActive(e.raffle.status));
 const pastEntries = entries.filter(e => !isActive(e.raffle.status));

 const totalTickets = entries.reduce((sum, e) => sum + e.entry.numTickets, 0);
 const totalSpent = entries.reduce((sum, e) =>
 sum + (e.entry.numTickets * e.raffle.ticketPrice.toNumber()), 0
 ) / 1_000_000;
 const wins = entries.filter(e =>
 e.raffle.winner && e.raffle.winner.equals(publicKey!)
 ).length;

 return (
 <div>
 <h1 className="text-3xl font-display text-ink mb-1">My Stubs</h1>
 <p className="text-ink/60 text-xs mb-8">Your raffle ticket collection</p>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
 {[
 { label: 'Total Tickets', value: totalTickets.toString(), color: 'text-carnival-blue' },
 { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: 'text-carnival-red' },
 { label: 'Wins', value: `${wins}`, color: 'text-gold' },
 ].map((stat) => (
 <div key={stat.label} className="bg-surface border-2 border-dashed border-ink p-5 rounded-sm text-center">
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display mb-1">{stat.label}</p>
 <p className={cn("text-3xl font-display", stat.color)}>{stat.value}</p>
 </div>
 ))}
 </div>

 {entries.length === 0 ? (
 <div className="text-center py-16 border-4 border-dotted border-ink/20 rounded-sm bg-paper">
 <span className="text-6xl mb-4 block">🎪</span>
 <p className="text-ink/60 font-display text-lg">No tickets yet</p>
 <Link href="/"className="text-carnival-red text-xs mt-3 block font-display uppercase tracking-widest">
 Visit the Midway →
 </Link>
 </div>
 ) : (
 <>
 {activeEntries.length > 0 && (
 <div className="mb-10">
 <div className="flex items-center gap-2 mb-6">
 <h2 className="text-xl font-display text-carnival-red uppercase">Active Entries</h2>
 <span className="w-2 h-2 rounded-full bg-carnival-red animate-pulse"/>
 </div>
 {activeEntries.map((e) => (
 <TicketStub key={e.entryPubkey.toBase58()} entry={e} isWinner={false} />
 ))}
 </div>
 )}

 {pastEntries.length > 0 && (
 <div>
 <h2 className="text-xl font-display text-ink/60 uppercase mb-6">Past Entries</h2>
 {pastEntries.map((e) => {
 const isWinner = !!(e.raffle.winner && e.raffle.winner.equals(publicKey!));
 return (
 <TicketStub key={e.entryPubkey.toBase58()} entry={e} isWinner={isWinner} />
 );
 })}
 </div>
 )}
 </>
 )}
 </div>
 );
}
