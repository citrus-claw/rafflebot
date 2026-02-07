'use client';

import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard, RaffleCardSkeleton } from '@/components/RaffleCard';
import { MockRaffleCard } from '@/components/MockRaffleCard';
import Link from 'next/link';

const MOCK_MODE = false;

const mockRaffles = [
  {
    id: "abc123",
    name: "Weekly USDC Raffle",
    ticketPrice: 5,
    totalPot: 2500,
    minPot: 10000,
    totalTickets: 500,
    endTime: Date.now() + 86400000 * 3,
    status: "active" as const,
  },
  {
    id: "def456",
    name: "Community Giveaway",
    ticketPrice: 2,
    totalPot: 800,
    minPot: 5000,
    totalTickets: 400,
    endTime: Date.now() + 86400000 * 5,
    status: "active" as const,
  },
  {
    id: "ghi789",
    name: "Early Supporter Draw",
    ticketPrice: 10,
    totalPot: 15000,
    minPot: 10000,
    totalTickets: 1500,
    endTime: Date.now() - 86400000,
    status: "ended" as const,
    winner: "7xKX...9pQr",
  },
];

/* ───── Hero Section ───── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 -mt-8">
      {/* Background effects */}
      <div className="absolute inset-0 starburst opacity-50" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-carnival-red/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-carnival-amber/10 rounded-full blur-[100px]" />

      <div className="relative max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-carnival-surface border border-carnival-border mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-carnival-cream/60 text-sm font-medium">Live on Solana Devnet</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6">
          <span className="text-shimmer">On-Chain Raffles</span>
          <br />
          <span className="text-carnival-cream">Provably Fair</span>
        </h1>

        <p className="text-carnival-cream/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered raffles on Solana with <span className="text-carnival-amber font-semibold">VRF randomness</span>. 
          Create or enter raffles with USDC — every draw is verifiable on-chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#raffles"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-carnival-red to-carnival-orange text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            🎟️ Browse Raffles
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-carnival-surface border border-carnival-border text-carnival-cream/70 font-semibold text-lg hover:border-carnival-amber/30 hover:text-carnival-cream transition-all"
          >
            How It Works
          </a>
        </div>

        {/* Stats ribbon */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: 'VRF', label: 'Verified Random' },
            { value: '90%', label: 'To Winners' },
            { value: '< 1s', label: 'Settlement' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-carnival-amber font-bold text-2xl md:text-3xl font-mono">{stat.value}</p>
              <p className="text-carnival-cream/30 text-xs uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Features Section ───── */
function FeaturesSection() {
  const features = [
    {
      icon: '🎲',
      title: 'Provably Fair',
      desc: 'Switchboard VRF provides verifiable randomness. No one can predict or manipulate the outcome.',
    },
    {
      icon: '🤖',
      title: 'AI Agent Managed',
      desc: 'An autonomous AI agent creates raffles, manages draws, and distributes prizes automatically.',
    },
    {
      icon: '🔗',
      title: 'Fully On-Chain',
      desc: 'Every ticket, draw, and payout is recorded on Solana. Complete transparency, always auditable.',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-carnival-cream mb-3">
            Why RaffleBot?
          </h2>
          <p className="text-carnival-cream/40 max-w-xl mx-auto">
            Built for trust, speed, and fairness on Solana.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative group p-6 rounded-2xl bg-carnival-surface border border-carnival-border hover:border-carnival-amber/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-ticket text-lg text-carnival-amber mb-2">{f.title}</h3>
              <p className="text-carnival-cream/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── How It Works ───── */
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Create', desc: 'The AI agent creates a raffle with ticket price, duration, and minimum pot.' },
    { num: '02', title: 'Buy', desc: 'Connect your wallet and buy tickets with USDC. Each ticket is an on-chain entry.' },
    { num: '03', title: 'Win', desc: 'VRF selects a winner at random. Prize (90%) is sent directly to the winner\'s wallet.' },
  ];

  return (
    <section id="how-it-works" className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-carnival-cream mb-3">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-carnival-amber/30 to-transparent" />
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-carnival-red/15 border border-carnival-red/30 mb-4">
                <span className="font-mono font-bold text-carnival-amber text-xl">{step.num}</span>
              </div>
              <h3 className="font-ticket text-xl text-carnival-cream mb-2">{step.title}</h3>
              <p className="text-carnival-cream/40 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Raffle List (shared between mock and real) ───── */
function RaffleListSection({ children, isEmpty, loading: isLoading, error: err }: {
  children: React.ReactNode;
  isEmpty: boolean;
  loading: boolean;
  error?: Error | null;
}) {
  return (
    <section id="raffles" className="py-12">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-3xl text-carnival-cream">Live Raffles</h2>
        <span className="px-2.5 py-0.5 rounded-full bg-carnival-red/15 text-carnival-red text-xs font-bold uppercase tracking-wider border border-carnival-red/20">
          Active
        </span>
      </div>
      <p className="text-carnival-cream/40 mb-8">
        Grab your tickets before time runs out 🎪
      </p>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : err ? (
        <div className="text-center py-12 bg-carnival-red/10 rounded-2xl border border-carnival-red/20">
          <p className="text-carnival-red font-medium">Failed to load raffles</p>
          <p className="text-carnival-cream/30 text-sm mt-2">{err.message}</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-carnival-surface/50 rounded-2xl border border-carnival-border">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-carnival-cream/50 text-lg">No active raffles right now</p>
          <p className="text-carnival-cream/30 text-sm mt-2">
            Check back soon — the AI agent creates new raffles regularly!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { activeRaffles, endedRaffles, loading, error } = useRaffles();

  if (MOCK_MODE) {
    const mockActive = mockRaffles.filter(r => r.status === 'active');
    const mockEnded = mockRaffles.filter(r => r.status === 'ended');

    return (
      <div>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />

        <RaffleListSection isEmpty={mockActive.length === 0} loading={false}>
          {mockActive.map((raffle) => (
            <MockRaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </RaffleListSection>

        {mockEnded.length > 0 && (
          <section className="py-8">
            <h2 className="font-display text-2xl text-carnival-cream mb-6">🏆 Recent Winners</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockEnded.map((raffle) => (
                <MockRaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />

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
        <section className="py-8">
          <h2 className="font-display text-2xl text-carnival-cream mb-6">🏆 Recent Winners</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {endedRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.publicKey.toBase58()} 
                publicKey={raffle.publicKey}
                raffle={raffle.account}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
