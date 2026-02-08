import React from 'react';
import { Ticket } from '../types';
import { QrCode, Star } from 'lucide-react';

interface TicketStubProps {
  ticket: Ticket;
}

export const TicketStub: React.FC<TicketStubProps> = ({ ticket }) => {
  // Determine style based on ticket properties or random for variety
  const isSpecial = ticket.purchaseSlot % 2 === 0;
  const bgColor = isSpecial ? 'bg-stripes-red' : 'bg-stripes-blue';
  const borderColor = isSpecial ? 'border-carnival-red' : 'border-carnival-blue';
  const textColor = isSpecial ? 'text-carnival-red' : 'text-carnival-blue';

  return (
    <div className="relative group perspective-1000 mb-6 max-w-2xl mx-auto transform transition-transform hover:scale-[1.01]">
      <div className="flex w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
        
        {/* LEFT SECTION (Main Ticket) */}
        <div className={`flex-grow relative ${bgColor} p-1 text-paper overflow-hidden rounded-l-lg`}>
          {/* Inner Border Container */}
          <div className="border-2 border-dashed border-paper/50 h-full p-4 relative bg-opacity-10 backdrop-brightness-95 flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-paper/30 pb-2 mb-2">
              <div>
                <h3 className="font-display text-2xl tracking-wide uppercase drop-shadow-md text-white">Admit One</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">RaffleBot Official Entry</p>
              </div>
              <Star className="text-gold fill-gold animate-pulse" size={24} />
            </div>

            {/* Content */}
            <div className="space-y-2 my-2">
              <div className="bg-paper text-ink px-3 py-1 font-bold font-mono text-sm inline-block shadow-sm transform -rotate-1">
                {ticket.raffleId}
              </div>
              <div className="text-xs uppercase font-bold opacity-90">
                Purchase Slot: <span className="font-mono text-lg">{ticket.purchaseSlot}</span>
              </div>
              <div className="text-[10px] font-mono opacity-80 break-all leading-tight">
                Sig: {ticket.signature.substring(0, 24)}...
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 border-t-2 border-paper/30 flex justify-between items-end">
              <div className="text-[10px] font-bold uppercase">NO REFUNDS • BEARER ASSET</div>
              <div className="font-display text-xl text-gold drop-shadow-sm">{ticket.owner.substring(0,6)}</div>
            </div>

          </div>
          
          {/* Perforation Circles Right Side */}
          <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-between py-2 z-10">
            {Array.from({ length: 12 }).map((_, i) => (
               <div key={i} className="w-4 h-4 rounded-full bg-paper mb-1"></div>
            ))}
          </div>
        </div>

        {/* CENTER PERFORATION LINE VISUAL */}
        <div className="w-0 border-l-4 border-dotted border-paper/60 relative z-20"></div>

        {/* RIGHT SECTION (The Stub) */}
        <div className="w-32 relative bg-surface p-1 rounded-r-lg flex flex-col">
           <div className={`h-full border-2 ${borderColor} p-2 flex flex-col items-center justify-center gap-2 rounded-r`}>
              <div className={`font-display text-lg uppercase ${textColor} text-center leading-none`}>
                Keep<br/>This<br/>Coupon
              </div>
              
              <div className="bg-white p-1 border border-ink/10 rounded-sm">
                 <QrCode className="text-ink" size={48} />
              </div>

              <div className={`text-2xl font-display ${textColor} transform -rotate-90 absolute right-1 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none`}>
                {ticket.id.split('-')[1]}
              </div>

              <div className="mt-auto text-center">
                <span className={`block text-[8px] uppercase font-bold ${textColor}`}>SEQ NO.</span>
                <span className={`block font-bold font-mono text-lg ${textColor}`}>{ticket.id.split('-')[1]}</span>
              </div>
           </div>
           
           {/* Perforation Circles Left Side */}
           <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between py-2 z-10">
            {Array.from({ length: 12 }).map((_, i) => (
               <div key={i} className="w-4 h-4 rounded-full bg-paper mb-1"></div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Winner Overlay */}
      {ticket.isWinner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gold text-ink font-display text-4xl uppercase px-8 py-4 border-4 border-ink transform -rotate-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            🎉 WINNER! 🎉
          </div>
        </div>
      )}
    </div>
  );
};