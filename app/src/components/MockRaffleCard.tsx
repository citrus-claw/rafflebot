'use client';

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

function formatUSDC(amount: number): string {
  return amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
  });
}

function formatTimeRemaining(endTime: number): string {
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
  const timeRemaining = formatTimeRemaining(raffle.endTime);
  const progress = raffle.minPot > 0 
    ? Math.min(100, (raffle.totalPot / raffle.minPot) * 100)
    : 100;

  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-carnival-surface to-carnival-dark
        border transition-all duration-300
        ${active 
          ? 'border-carnival-amber/20 hover:border-carnival-amber/50' 
          : 'border-carnival-border/50 opacity-80'}
        ticket-perforation ticket-notch
      `}>
        <div className="h-1.5 bg-carnival-gradient" />
        
        <div className="p-5 pr-20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-ticket text-lg text-carnival-cream tracking-wide truncate">
                {raffle.name}
              </h3>
              <p className="text-carnival-cream/40 text-xs font-mono mt-0.5">
                #{raffle.id}
              </p>
            </div>
            <span className={`
              ml-3 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
              ${active 
                ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                : 'bg-carnival-border/50 text-carnival-cream/40'}
            `}>
              {active ? 'Active' : 'Ended'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-carnival-amber font-bold text-xl font-mono">{formatUSDC(raffle.totalPot)}</p>
            </div>
            <div>
              <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Per Ticket</p>
              <p className="text-carnival-cream font-semibold text-lg">{formatUSDC(raffle.ticketPrice)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-carnival-cream/50">
              <span className="text-carnival-cream font-bold">{raffle.totalTickets}</span> tickets sold
            </span>
            {active && (
              <span className="text-carnival-orange font-semibold">
                ⏱ {timeRemaining}
              </span>
            )}
          </div>

          {active && (
            <div className="mt-3">
              <div className="h-1.5 bg-carnival-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-carnival-red to-carnival-amber transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-carnival-cream/30 mt-1 font-mono">
                {Math.round(progress)}% of min pot
              </p>
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-[72px] h-full flex flex-col items-center justify-center border-l border-dashed border-carnival-amber/20 bg-carnival-dark/50">
          <span className="text-carnival-amber/60 text-[10px] uppercase tracking-widest font-bold" style={{ writingMode: 'vertical-rl' }}>
            ADMIT ONE
          </span>
        </div>

        {raffle.winner && (
          <div className="mx-5 mb-4 p-3 bg-carnival-amber/10 rounded-xl border border-carnival-amber/20">
            <p className="text-carnival-gold text-sm font-bold">🏆 Winner</p>
            <p className="text-carnival-cream font-mono text-xs truncate">{raffle.winner}</p>
          </div>
        )}
      </div>
    </div>
  );
}
