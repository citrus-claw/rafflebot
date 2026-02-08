import React, { useEffect, useState } from 'react';
import { RaffleTable } from '../components/RaffleTable';
import { Raffle, RaffleStatus } from '../types';
import { getRaffles } from '../services/mockService';
import { Ticket, Cpu, Lock, ArrowRight, Zap, Star } from 'lucide-react';

export const Home: React.FC = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRaffles().then(data => {
      setRaffles(data);
      setLoading(false);
    });
  }, []);

  const activeRaffles = raffles.filter(r => r.status === RaffleStatus.OPEN);
  const pastRaffles = raffles.filter(r => r.status !== RaffleStatus.OPEN);

  return (
    <div className="space-y-12">
      {/* Carnival Masthead */}
      <section className="relative bg-surface border-4 border-double border-ink rounded-xl p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(217,56,30,0.2)] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-carnival-red opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-gold bg-white text-xs font-bold uppercase tracking-widest text-ink shadow-sm transform -rotate-1">
                    <Star size={14} className="fill-gold text-gold" />
                    The Greatest Protocol on Earth
                    <Star size={14} className="fill-gold text-gold" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display text-carnival-red drop-shadow-sm leading-[0.9]">
                    Step Right Up!<br/>
                    <span className="text-ink">Trust is Code.</span>
                </h1>
                <p className="text-xl font-medium text-ink/70 max-w-xl font-mono leading-relaxed border-l-4 border-carnival-blue pl-6">
                    🎪 Experience the thrill of the draw with the security of the blockchain. 
                    Zero clowns. Zero trick mirrors. Just <span className="font-bold text-carnival-blue">pure, verifiable math.</span>
                </p>
            </div>
            
            <div className="md:col-span-4 flex justify-center">
                <div className="bg-carnival-blue text-white p-6 rounded-lg shadow-[6px_6px_0px_0px_#1a1a1a] transform rotate-2 text-center border-2 border-white border-dashed">
                    <div className="text-xs uppercase font-bold text-gold mb-2 tracking-widest">Current Jackpot</div>
                    <div className="text-5xl font-display mb-1 text-gold drop-shadow-md">14,203</div>
                    <div className="text-xl font-mono font-bold">SOL</div>
                    <div className="mt-4 pt-4 border-t border-white/20 text-[10px] uppercase font-bold opacity-80">
                        Paid out automatically
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Raffle Boards */}
        <div className="lg:col-span-8 space-y-8">
            {loading ? (
                <div className="h-64 flex items-center justify-center border-4 border-dotted border-ink/20 rounded-xl bg-paper">
                    <div className="flex flex-col items-center gap-4 text-carnival-red">
                         <Ticket size={48} className="animate-bounce" />
                        <span className="font-display text-xl uppercase tracking-widest">Loading the Attractions...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="text-2xl">🎟️</span>
                             <h3 className="text-2xl font-display text-ink">Now Showing</h3>
                         </div>
                        <RaffleTable raffles={activeRaffles} title="Open Raffles (Get Your Tickets!)" />
                    </div>

                    <div className="space-y-4 pt-8">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                             <span className="text-2xl grayscale">🎪</span>
                             <h3 className="text-2xl font-display text-ink">Previous Shows</h3>
                         </div>
                        <RaffleTable raffles={pastRaffles} title="Settled Games" />
                    </div>
                </>
            )}
        </div>

        {/* Right Column: Sideshow / Info */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Spec Card as a Poster */}
            <div className="bg-paper border-4 border-ink p-1 shadow-[8px_8px_0px_0px_rgba(26,26,26,0.1)]">
                <div className="border-2 border-dashed border-ink p-6 text-center bg-surface">
                    <h3 className="font-display text-2xl text-carnival-red uppercase mb-6 border-b-2 border-ink pb-2">The Rules of the Game</h3>
                    <ul className="space-y-6 text-left">
                        <li className="flex gap-4 items-start">
                            <div className="bg-gold p-2 rounded-full border-2 border-ink shadow-sm shrink-0">
                                <Cpu size={16} className="text-ink" />
                            </div>
                            <div>
                                <strong className="block text-sm font-display uppercase text-carnival-blue">The Automaton</strong>
                                <p className="text-xs text-ink/70 leading-relaxed mt-1">
                                    Our agent runs the show. No human hands touch the levers.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4 items-start">
                             <div className="bg-gold p-2 rounded-full border-2 border-ink shadow-sm shrink-0">
                                <Lock size={16} className="text-ink" />
                            </div>
                            <div>
                                <strong className="block text-sm font-display uppercase text-carnival-blue">Provably Fair</strong>
                                <p className="text-xs text-ink/70 leading-relaxed mt-1">
                                    Winners picked by cryptographic lightning. Check the math yourself.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4 items-start">
                             <div className="bg-gold p-2 rounded-full border-2 border-ink shadow-sm shrink-0">
                                <Ticket size={16} className="text-ink" />
                            </div>
                            <div>
                                <strong className="block text-sm font-display uppercase text-carnival-blue">Golden Tickets</strong>
                                <p className="text-xs text-ink/70 leading-relaxed mt-1">
                                    Every ticket is a permanent NFT on the Solana blockchain.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Fun Stats */}
            <div className="bg-carnival-red text-white border-4 border-double border-white rounded-lg p-6 shadow-md">
                <h3 className="font-display text-xl uppercase tracking-wide mb-4 text-center">Fairground Pulse</h3>
                <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/20 pb-2">
                        <span>Avg. Pot</span>
                        <span className="font-bold text-gold">45.2 SOL</span>
                    </div>
                     <div className="flex justify-between border-b border-white/20 pb-2">
                        <span>Participants</span>
                        <span className="font-bold text-gold">1,204</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Network</span>
                        <span className="font-bold text-gold">Turbo Charged</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};