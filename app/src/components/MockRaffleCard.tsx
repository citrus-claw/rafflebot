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

function formatMockUSDC(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });
}

function formatMockTimeRemaining(endTime: number): string {
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

function ScallopRow({ count = 14 }: { count?: number }) {
  return (
    <div className="flex justify-around" style={{ margin: '0 6px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full bg-paper"
          style={{ width: 10, height: 10, marginTop: -5, position: 'relative', zIndex: 10 }}
        />
      ))}
    </div>
  );
}

function ScallopRowBottom({ count = 14 }: { count?: number }) {
  return (
    <div className="flex justify-around" style={{ margin: '0 6px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full bg-paper"
          style={{ width: 10, height: 10, marginBottom: -5, position: 'relative', zIndex: 10 }}
        />
      ))}
    </div>
  );
}

export function MockRaffleCard({ raffle, onClick }: MockRaffleCardProps) {
  const active = raffle.status === 'active';
  const timeRemaining = formatMockTimeRemaining(raffle.endTime);
  const progress = raffle.minPot > 0
    ? Math.min(100, (raffle.totalPot / raffle.minPot) * 100)
    : 100;

  if (active) {
    return (
      <div onClick={onClick} className="group w-full max-w-sm cursor-pointer">
        {/* Top scallops */}
        <div className="rounded-t-xl bg-carnival-red" style={{ paddingTop: 1 }}>
          <ScallopRow />
        </div>

        <div className="overflow-hidden bg-carnival-red shadow-xl">
          <div className="px-5 pt-2 pb-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-800 text-xs font-black text-red-200">
                  R
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-200/60">
                  Raffle #{raffle.id}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                <span className="text-[10px] font-bold uppercase text-white">Open</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="mb-3 text-balance text-2xl font-black leading-tight text-white">
              {raffle.name}
            </h3>

            {/* Prize card */}
            <div className="mb-3 overflow-hidden rounded-xl bg-white/15 backdrop-blur-sm">
              <div className="grid grid-cols-2">
                <div className="border-r border-white/10 p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-red-200/70">
                    Prize Pool
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatMockUSDC(raffle.totalPot)}
                  </div>
                </div>
                <div className="p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-red-200/70">
                    Per Ticket
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatMockUSDC(raffle.ticketPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress + stats */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-red-100">
                  <strong className="text-white">{raffle.totalTickets.toLocaleString()}</strong> tickets sold
                </span>
                {timeRemaining !== 'Ended' && (
                  <span className="rounded bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {timeRemaining}
                  </span>
                )}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-red-800/50">
                <div
                  className="h-full rounded-full bg-white/80 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-right text-[9px] text-red-200/60">
                {Math.round(progress)}% of min pot
              </div>
            </div>

            {/* CTA */}
            <button className="w-full rounded-xl bg-white py-2.5 text-sm font-black uppercase tracking-wider text-carnival-red transition hover:bg-red-50">
              Enter Raffle ›
            </button>
          </div>
        </div>

        {/* Bottom scallops */}
        <div className="rounded-b-xl bg-carnival-red" style={{ paddingBottom: 1 }}>
          <ScallopRowBottom />
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="group w-full max-w-sm cursor-pointer">
      {/* Top scallops */}
      <div className="rounded-t-xl bg-stone-400" style={{ paddingTop: 1 }}>
        <ScallopRow />
      </div>

      <div className="relative overflow-hidden bg-stone-400 shadow-xl">
        {/* Diagonal "ENDED" banner */}
        <div
          className="absolute top-[18px] -right-[32px] z-20 rotate-45 bg-carnival-red px-10 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
        >
          Ended
        </div>

        <div className="px-5 pt-2 pb-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-500 text-xs font-black text-stone-300">
                R
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Raffle #{raffle.id}
              </div>
            </div>
          </div>

          {/* Name */}
          <h3 className="mb-3 text-balance text-2xl font-black leading-tight text-stone-600">
            {raffle.name}
          </h3>

          {/* Prize card */}
          <div className="mb-3 overflow-hidden rounded-xl bg-stone-500/30">
            <div className="grid grid-cols-2">
              <div className="border-r border-stone-500/30 p-3 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
                  Prize Pool
                </div>
                <div className="text-2xl font-black text-stone-600">
                  {formatMockUSDC(raffle.totalPot)}
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
                  Per Ticket
                </div>
                <div className="text-2xl font-black text-stone-600">
                  {formatMockUSDC(raffle.ticketPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-3 text-xs text-stone-500">
            <strong className="text-stone-600">{raffle.totalTickets.toLocaleString()}</strong> tickets sold
          </div>

          {/* Winner */}
          {raffle.winner && (
            <div className="rounded-xl border border-amber-600/20 bg-stone-500/30 p-3 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700/50">
                ★ Winner ★
              </div>
              <div className="mt-1 font-mono text-base font-black text-stone-700">
                {raffle.winner}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom scallops */}
      <div className="rounded-b-xl bg-stone-400" style={{ paddingBottom: 1 }}>
        <ScallopRowBottom />
      </div>
    </div>
  );
}
