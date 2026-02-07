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
        relative overflow-hidden rounded-lg
        bg-white
        border-2 transition-all duration-300
        ${active 
          ? 'border-border-dark hover:-translate-y-1 hover:shadow-[4px_4px_0_#E0DBD2]' 
          : 'border-border-light opacity-85'}
        ticket-perf-edge ticket-notch
      `}>
        <div className="h-1.5 carnival-stripe-top" />
        
        <div className="p-5 pr-[76px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-text-primary font-bold tracking-tight truncate">
                {raffle.name}
              </h3>
              <p className="text-text-secondary text-xs font-mono mt-0.5">
                №{raffle.id}
              </p>
            </div>
            <span className={`
              ml-3 shrink-0 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
              ${active 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-text-secondary border-border-light'}
            `}>
              {active ? 'Active' : 'Ended'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-[11px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-accent-red font-bold text-xl font-mono">{formatUSDC(raffle.totalPot)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[11px] uppercase tracking-wider">Per Ticket</p>
              <p className="text-text-primary font-semibold text-lg">{formatUSDC(raffle.ticketPrice)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              <span className="text-text-primary font-bold">{raffle.totalTickets}</span> tickets sold
            </span>
            {active && (
              <span className="text-accent-red font-semibold">
                ⏱ {timeRemaining}
              </span>
            )}
          </div>

          {active && (
            <div className="mt-3">
              <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-red transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1 font-mono">
                {Math.round(progress)}% of min pot
              </p>
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-[68px] h-full flex flex-col items-center justify-center bg-cream/50">
          <span className="text-accent-red/50 text-[9px] uppercase tracking-[0.2em] font-mono font-bold" style={{ writingMode: 'vertical-rl' }}>
            ADMIT ONE
          </span>
        </div>

        {raffle.winner && (
          <div className="mx-5 mb-4 p-3 bg-accent-gold/10 rounded-lg border-2 border-accent-gold/30">
            <p className="text-accent-gold text-sm font-bold">🏆 Winner</p>
            <p className="text-text-primary font-mono text-xs truncate">{raffle.winner}</p>
          </div>
        )}
      </div>
    </div>
  );
}
