'use client';

import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard, RaffleCardSkeleton } from '@/components/RaffleCard';
import { MockRaffleCard } from '@/components/MockRaffleCard';
import { Ticket } from 'lucide-react';

const MOCK_MODE = false;

const mockRaffles = [
  {
    id: "abc123",
    name: "Solana Summer Jackpot",
    ticketPrice: 5,
    totalPot: 8750,
    minPot: 10000,
    totalTickets: 1750,
    endTime: Date.now() + 86400000 * 2,
    status: "active" as const,
  },
  {
    id: "def456",
    name: "DeFi Degen Draw",
    ticketPrice: 10,
    totalPot: 4200,
    minPot: 5000,
    totalTickets: 420,
    endTime: Date.now() + 86400000 * 5,
    status: "active" as const,
  },
  {
    id: "jkl012",
    name: "Community 50/50",
    ticketPrice: 2,
    totalPot: 1640,
    minPot: 2000,
    totalTickets: 820,
    endTime: Date.now() + 86400000 * 1,
    status: "active" as const,
  },
  {
    id: "ghi789",
    name: "Valentine's USDC Drop",
    ticketPrice: 25,
    totalPot: 15000,
    minPot: 10000,
    totalTickets: 600,
    endTime: Date.now() - 86400000,
    status: "ended" as const,
    winner: "7xKX...9pQr",
  },
];

const MARQUEE_ITEMS = [
  { icon: "🤖", label: "The Automaton", value: "AI-Powered, Trustless" },
  { icon: "🔒", label: "Provably Fair", value: "Switchboard VRF" },
  { icon: "🎟", label: "On-Chain Tickets", value: "Solana Blockchain" },
  { icon: "🏆", label: "Winner Share", value: "90%" },
  { icon: "🎲", label: "Draw Method", value: "VRF" },
  { icon: "🌐", label: "Network", value: "Solana Devnet" },
];

function Marquee() {
  return (
    <div className="relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2 px-7 py-3">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {item.label}
            </span>
            <span className="text-[11px] font-bold text-gold">
              {item.value}
            </span>
            {i < MARQUEE_ITEMS.length * 2 - 1 && (
              <span className="ml-5 text-white/10">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero({ jackpot, loading }: { jackpot: number; loading: boolean }) {
  return (
    <section className="relative overflow-hidden bg-carnival-red py-16 text-center md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm">
          <span className="text-gold">★</span>
          The Greatest Protocol on Earth
          <span className="text-gold">★</span>
        </div>
        <h1 className="mb-4 font-display text-5xl leading-[0.95] text-white md:text-7xl">
          Step Right Up!
          <br />
          <span className="text-white/50">Trust is Code.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
          The thrill of the draw with the security of the blockchain. Just{' '}
          <strong className="text-white">pure, verifiable math.</strong>
        </p>
        <div className="inline-flex items-center gap-5 rounded-2xl bg-white/10 px-8 py-4 backdrop-blur-sm">
          <div className="text-left">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
              Current Jackpot
            </div>
            <div className="text-[8px] uppercase tracking-wider text-white/30">
              Paid out automatically
            </div>
          </div>
          <div className="font-display text-4xl text-white">
            {loading ? '...' : jackpot.toLocaleString()}
          </div>
          <div className="text-sm font-bold text-white/50">USDC</div>
        </div>
      </div>
    </section>
  );
}

function RaffleListSection({
  children,
  isEmpty,
  loading: isLoading,
  error: err,
}: {
  children: React.ReactNode;
  isEmpty: boolean;
  loading: boolean;
  error?: Error | null;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-center font-display text-2xl text-ink">Now Showing</h3>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface">
          <div className="flex flex-col items-center gap-4 text-carnival-red">
            <Ticket size={48} className="animate-bounce" />
            <span className="font-display text-xl uppercase tracking-widest">
              Loading the Attractions...
            </span>
          </div>
        </div>
      ) : err ? (
        <div className="rounded-xl bg-surface py-10 text-center">
          <p className="font-display text-xs text-carnival-red">Failed to load raffles</p>
          <p className="mt-1 text-[10px] text-ink/60">{err.message}</p>
        </div>
      ) : isEmpty ? (
        <div className="rounded-xl bg-surface py-14 text-center">
          <p className="font-display text-sm text-ink/60">
            The curtains are closed for now...
          </p>
          <p className="mt-1 text-[10px] text-ink/40">
            Check back soon — new raffles created regularly.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { activeRaffles, endedRaffles, loading, error } = useRaffles();

  if (MOCK_MODE) {
    const mockActive = mockRaffles.filter((r) => r.status === 'active');
    const mockEnded = mockRaffles.filter((r) => r.status === 'ended');

    const mockJackpot = mockActive.reduce((sum, r) => sum + r.minPot, 0);
    return (
      <>
        <Hero jackpot={mockJackpot} loading={false} />
        <Marquee />
        <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
          <RaffleListSection isEmpty={mockActive.length === 0} loading={false}>
            {mockActive.map((raffle) => (
              <MockRaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </RaffleListSection>
          {mockEnded.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-center font-display text-2xl text-ink/40">
                Previous Shows
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockEnded.map((raffle) => (
                  <MockRaffleCard key={raffle.id} raffle={raffle} />
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Jackpot = sum of all active raffle min pots (the target prize pools)
  const jackpot = activeRaffles.reduce(
    (sum, r) => sum + r.account.minPot.toNumber() / 1_000_000,
    0
  );

  return (
    <>
      <Hero jackpot={jackpot} loading={loading} />
      <Marquee />
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <RaffleListSection
          isEmpty={activeRaffles.length === 0}
          loading={loading}
          error={error}
        >
          {activeRaffles.map((raffle) => (
            <RaffleCard
              key={raffle.publicKey.toBase58()}
              publicKey={raffle.publicKey}
              raffle={raffle.account}
            />
          ))}
        </RaffleListSection>

        {endedRaffles.length > 0 && (
          <div className="space-y-5">
            <h3 className="text-center font-display text-2xl text-ink/40">
              Previous Shows
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
