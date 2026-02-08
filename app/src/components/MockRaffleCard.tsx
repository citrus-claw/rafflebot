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
    <div onClick={onClick} className="group relative cursor-pointer">
      <div
        className="relative overflow-hidden"
        style={{
          border: active ? '0.8px dashed #D4D0C8' : '0.8px dashed #E8E4D8',
          borderRadius: '6px',
          opacity: active ? 1 : 0.75,
        }}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-text-primary font-bold tracking-tight truncate">
                {raffle.name}
              </h3>
              <p className="text-text-secondary text-[10px] mt-1">
                №{raffle.id}
              </p>
            </div>
            <span
              className="ml-3 shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
              style={{
                color: active ? '#8B4513' : '#8B8B6E',
                background: active ? '#8B451310' : '#8B8B6E10',
                border: `0.8px solid ${active ? '#8B451330' : '#8B8B6E30'}`,
              }}
            >
              {active ? 'Active' : 'Ended'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Prize Pool</p>
              <p className="text-text-primary font-bold text-lg">{formatUSDC(raffle.totalPot)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider">Per Ticket</p>
              <p className="text-text-primary font-semibold text-base">{formatUSDC(raffle.ticketPrice)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">
              <span className="text-text-primary font-bold">{raffle.totalTickets}</span> tickets sold
            </span>
            {active && (
              <span className="text-text-primary font-semibold">{timeRemaining}</span>
            )}
          </div>

          {active && (
            <div className="mt-3">
              <div className="h-1 bg-border-light rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#8B4513' }} />
              </div>
              <p className="text-[10px] text-text-secondary mt-1">{Math.round(progress)}% of min pot</p>
            </div>
          )}

          {raffle.winner && (
            <div className="mt-4 p-3 rounded" style={{ border: '0.8px solid #B8860B40', background: '#B8860B08' }}>
              <p className="text-accent-gold text-xs font-bold">Winner</p>
              <p className="text-text-primary text-[10px] truncate mt-1">{raffle.winner}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
