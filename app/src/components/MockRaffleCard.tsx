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
      className={`
        bg-gray-800 rounded-xl p-6 border border-gray-700 
        hover:border-purple-500 transition-all cursor-pointer
        ${active ? '' : 'opacity-75'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{raffle.name}</h3>
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
        `}>
          {active ? 'Active' : 'Ended'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Pot Size</p>
          <p className="text-white font-semibold">{formatUSDC(raffle.totalPot)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Ticket Price</p>
          <p className="text-white font-semibold">{formatUSDC(raffle.ticketPrice)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Tickets Sold</p>
          <p className="text-white font-semibold">{raffle.totalTickets}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">{active ? 'Time Left' : 'Status'}</p>
          <p className="text-white font-semibold">{active ? timeRemaining : 'Completed'}</p>
        </div>
      </div>

      {/* Progress bar for min pot */}
      {active && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Min pot progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatUSDC(raffle.totalPot)} / {formatUSDC(raffle.minPot)} min
          </p>
        </div>
      )}

      {/* Winner display */}
      {raffle.winner && (
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-yellow-400 text-sm font-medium">🏆 Winner</p>
          <p className="text-white font-mono text-xs truncate">
            {raffle.winner}
          </p>
        </div>
      )}
    </div>
  );
}
