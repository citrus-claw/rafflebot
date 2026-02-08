'use client';

import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard, RaffleCardSkeleton } from '@/components/RaffleCard';
import { MockRaffleCard } from '@/components/MockRaffleCard';
import Link from 'next/link';
import { Ticket, Cpu, Lock, Star } from 'lucide-react';

const MOCK_MODE = false;

const mockRaffles = [
 {
 id:"abc123",
 name:"Weekly USDC Raffle",
 ticketPrice: 5,
 totalPot: 2500,
 minPot: 10000,
 totalTickets: 500,
 endTime: Date.now() + 86400000 * 3,
 status:"active"as const,
 },
 {
 id:"def456",
 name:"Community Giveaway",
 ticketPrice: 2,
 totalPot: 800,
 minPot: 5000,
 totalTickets: 400,
 endTime: Date.now() + 86400000 * 5,
 status:"active"as const,
 },
 {
 id:"ghi789",
 name:"Early Supporter Draw",
 ticketPrice: 10,
 totalPot: 15000,
 minPot: 10000,
 totalTickets: 1500,
 endTime: Date.now() - 86400000,
 status:"ended"as const,
 winner:"7xKX...9pQr",
 },
];

/* ───── Carnival Masthead ───── */
function Masthead() {
 return (
 <section className="relative bg-surface border-2 border-ink rounded-sm p-8 md:p-12 overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-carnival-red opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"/>

 <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
 <div className="md:col-span-8 space-y-6">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border-2 border-dashed border-gold bg-white text-xs font-bold uppercase tracking-widest text-ink transform -rotate-1">
 <Star size={14} className="fill-gold text-gold"/>
 The Greatest Protocol on Earth
 <Star size={14} className="fill-gold text-gold"/>
 </div>
 <h1 className="text-5xl md:text-7xl font-display text-carnival-red leading-[0.9]">
 Step Right Up!<br />
 <span className="text-ink">Trust is Code.</span>
 </h1>
 <p className="text-xl font-medium text-ink/70 max-w-xl font-mono leading-relaxed border-l-4 border-carnival-blue pl-6">
 Experience the thrill of the draw with the security of the blockchain.
 Zero clowns. Zero trick mirrors. Just <span className="font-bold text-carnival-blue">pure, verifiable math.</span>
 </p>
 </div>

 <div className="md:col-span-4 flex justify-center">
 <div className="bg-carnival-blue text-white p-6 rounded-sm transform rotate-2 text-center border-2 border-dashed border-white">
 <div className="text-xs uppercase font-bold text-gold mb-2 tracking-widest">Current Jackpot</div>
 <div className="text-5xl font-display mb-1 text-gold">&mdash;</div>
 <div className="text-xl font-mono font-bold">USDC</div>
 <div className="mt-4 pt-4 border-t border-dashed border-white/20 text-[10px] uppercase font-bold opacity-80">
 Paid out automatically
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

/* ───── Sidebar Rules ───── */
function RulesCard() {
 return (
 <div className="bg-surface border-2 border-ink p-6 text-center rounded-sm">
 <h3 className="font-display text-2xl text-carnival-red uppercase mb-6 border-b-2 border-ink pb-2">The Rules of the Game</h3>
 <ul className="space-y-6 text-left">
 <li className="flex gap-4 items-start">
 <div className="bg-gold p-2 rounded-sm border-2 border-ink shrink-0">
 <Cpu size={16} className="text-ink"/>
 </div>
 <div>
 <strong className="block text-sm font-display uppercase text-carnival-blue">The Automaton</strong>
 <p className="text-xs text-ink/70 leading-relaxed mt-1">
 Our AI agent runs the show. No human hands touch the levers.
 </p>
 </div>
 </li>
 <li className="flex gap-4 items-start">
 <div className="bg-gold p-2 rounded-sm border-2 border-ink shrink-0">
 <Lock size={16} className="text-ink"/>
 </div>
 <div>
 <strong className="block text-sm font-display uppercase text-carnival-blue">Provably Fair</strong>
 <p className="text-xs text-ink/70 leading-relaxed mt-1">
 Winners picked by cryptographic randomness via Switchboard VRF. Check the math yourself.
 </p>
 </div>
 </li>
 <li className="flex gap-4 items-start">
 <div className="bg-gold p-2 rounded-sm border-2 border-ink shrink-0">
 <Ticket size={16} className="text-ink"/>
 </div>
 <div>
 <strong className="block text-sm font-display uppercase text-carnival-blue">On-Chain Tickets</strong>
 <p className="text-xs text-ink/70 leading-relaxed mt-1">
 Every ticket is recorded permanently on the Solana blockchain.
 </p>
 </div>
 </li>
 </ul>
 </div>
 );
}

/* ───── Stats Card ───── */
function StatsCard() {
 return (
 <div className="bg-carnival-red text-white border-2 border-white rounded-sm p-6">
 <h3 className="font-display text-xl uppercase tracking-wide mb-4 text-center">Fairground Pulse</h3>
 <div className="space-y-3 font-mono text-sm">
 <div className="flex justify-between border-b border-dashed border-white/20 pb-2">
 <span>Winner Share</span>
 <span className="font-bold text-gold">90%</span>
 </div>
 <div className="flex justify-between border-b border-dashed border-white/20 pb-2">
 <span>Draw Method</span>
 <span className="font-bold text-gold">VRF</span>
 </div>
 <div className="flex justify-between">
 <span>Network</span>
 <span className="font-bold text-gold">Solana Devnet</span>
 </div>
 </div>
 </div>
 );
}

/* ───── Raffle List Section ───── */
function RaffleListSection({ children, isEmpty, loading: isLoading, error: err }: {
 children: React.ReactNode;
 isEmpty: boolean;
 loading: boolean;
 error?: Error | null;
}) {
 return (
 <div className="space-y-4">
 <h3 className="text-2xl font-display text-ink mb-2">Now Showing</h3>

 {isLoading ? (
 <div className="h-64 flex items-center justify-center border-2 border-ink/20 rounded-sm bg-paper">
 <div className="flex flex-col items-center gap-4 text-carnival-red">
 <Ticket size={48} className="animate-bounce"/>
 <span className="font-display text-xl uppercase tracking-widest">Loading the Attractions...</span>
 </div>
 </div>
 ) : err ? (
 <div className="text-center py-10 border-2 border-ink rounded-sm bg-surface">
 <p className="text-carnival-red text-xs font-display">Failed to load raffles</p>
 <p className="text-ink/60 text-[10px] mt-1">{err.message}</p>
 </div>
 ) : isEmpty ? (
 <div className="text-center py-14 border-2 border-ink/20 rounded-sm bg-paper">
 <p className="text-ink/60 text-sm font-display">The curtains are closed for now...</p>
 <p className="text-ink/40 text-[10px] mt-1">Check back soon — new raffles created regularly.</p>
 </div>
 ) : (
 <div className="grid gap-6 md:grid-cols-2">
 {children}
 </div>
 )}
 </div>
 );
}

export default function Home() {
 const { activeRaffles, endedRaffles, loading, error } = useRaffles();

 if (MOCK_MODE) {
 const mockActive = mockRaffles.filter(r => r.status === 'active');
 const mockEnded = mockRaffles.filter(r => r.status === 'ended');

 return (
 <div className="space-y-12">
 <Masthead />
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <div className="lg:col-span-8 space-y-8">
 <RaffleListSection isEmpty={mockActive.length === 0} loading={false}>
 {mockActive.map((raffle) => (
 <MockRaffleCard key={raffle.id} raffle={raffle} />
 ))}
 </RaffleListSection>
 {mockEnded.length > 0 && (
 <div className="space-y-4 pt-8">
 <h3 className="text-2xl font-display text-ink/60 mb-2">Previous Shows</h3>
 <div className="grid gap-6 md:grid-cols-2">
 {mockEnded.map((raffle) => (
 <MockRaffleCard key={raffle.id} raffle={raffle} />
 ))}
 </div>
 </div>
 )}
 </div>
 <div className="lg:col-span-4 space-y-6">
 <RulesCard />
 <StatsCard />
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-12">
 <Masthead />
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <div className="lg:col-span-8 space-y-8">
 <RaffleListSection isEmpty={activeRaffles.length === 0} loading={loading} error={error}>
 {activeRaffles.map((raffle) => (
 <RaffleCard
 key={raffle.publicKey.toBase58()}
 publicKey={raffle.publicKey}
 raffle={raffle.account}
 />
 ))}
 </RaffleListSection>

 {endedRaffles.length > 0 && (
 <div className="space-y-4 pt-8">
 <h3 className="text-2xl font-display text-ink/60 mb-2">Previous Shows</h3>
 <div className="grid gap-6 md:grid-cols-2">
 {endedRaffles.map((raffle) => (
 <RaffleCard
 key={raffle.publicKey.toBase58()}
 publicKey={raffle.publicKey}
 raffle={raffle.account}
 />
 ))}
 </div>
 </div>
 )}
 </div>
 <div className="lg:col-span-4 space-y-6">
 <RulesCard />
 <StatsCard />
 </div>
 </div>
 </div>
 );
}
