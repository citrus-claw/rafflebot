import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Raffle, RaffleStatus } from '../types';
import { ChevronRight, Ticket, Star } from 'lucide-react';

interface RaffleTableProps {
  raffles: Raffle[];
  title: string;
}

export const RaffleTable: React.FC<RaffleTableProps> = ({ raffles, title }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border-2 border-ink rounded-lg shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-8">
      {/* Carnival Header */}
      <div className="bg-carnival-red p-4 border-b-2 border-ink flex justify-between items-center text-white">
        <h2 className="font-display text-xl tracking-wide flex items-center gap-2 drop-shadow-md">
          <Star className="fill-gold text-gold" size={20} />
          {title}
          <Star className="fill-gold text-gold" size={20} />
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-paper text-ink/70 uppercase text-[10px] font-bold tracking-widest border-b-2 border-ink/20 font-display">
            <tr>
              <th className="px-6 py-4">Attraction</th>
              <th className="px-6 py-4 text-right">Ticket Cost</th>
              <th className="px-6 py-4 text-right">Jackpot</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Enter</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/5">
            {raffles.map((raffle) => (
              <tr 
                key={raffle.id} 
                className="hover:bg-gold/10 cursor-pointer transition-colors group"
                onClick={() => navigate(`/raffle/${raffle.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-display text-lg text-carnival-blue group-hover:text-carnival-red transition-colors">{raffle.title}</span>
                    <span className="text-[10px] font-bold text-ink/40 font-mono mt-0.5">{raffle.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold font-mono text-lg">
                  {raffle.ticketPrice.toFixed(2)} <span className="text-[10px] text-ink/50">SOL</span>
                </td>
                <td className="px-6 py-4 text-right font-bold font-mono text-lg text-carnival-red">
                  {raffle.prizePool.toFixed(2)} <span className="text-[10px] text-ink/50">SOL</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-full border-2 ${
                    raffle.status === RaffleStatus.OPEN ? 'bg-white text-green-700 border-green-700' : 
                    raffle.status === RaffleStatus.PAID ? 'bg-ink text-gold border-ink' : 'bg-neutral-200 text-neutral-500 border-neutral-300'
                  }`}>
                    {raffle.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="bg-carnival-blue text-white p-2 rounded-full shadow-sm group-hover:bg-carnival-red group-hover:scale-110 transition-all">
                        <ChevronRight size={16} />
                    </button>
                </td>
              </tr>
            ))}
            {raffles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink/60 font-display italic text-lg">
                  The curtains are closed for now...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};