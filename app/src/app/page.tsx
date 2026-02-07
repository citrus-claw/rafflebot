'use client';

import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard, RaffleCardSkeleton } from '@/components/RaffleCard';
import { MockRaffleCard } from '@/components/MockRaffleCard';
import { RaffleDrum } from '@/components/illustrations/RaffleDrum';
import { TicketIllustration } from '@/components/illustrations/TicketIllustration';
import { TentIllustration } from '@/components/illustrations/TentIllustration';
import { TrophyIllustration } from '@/components/illustrations/TrophyIllustration';
import { FerrisWheel } from '@/components/illustrations/StarDecoration';
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
    <section className="relative py-20 md:py-28 -mt-8">
      {/* Decorative ferris wheel */}
      <div className="absolute -top-10 -right-16 opacity-[0.07] pointer-events-none">
        <FerrisWheel size={300} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-border-dark mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-text-secondary text-sm font-medium">Live on Solana Devnet</span>
        </div>

        {/* Drum illustration */}
        <div className="flex justify-center mb-8">
          <RaffleDrum size={140} className="animate-float" />
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 text-text-primary font-bold">
          On-Chain Raffles
          <br />
          <span className="italic text-accent-red">Provably Fair</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered raffles on Solana with <span className="text-accent-gold font-semibold">VRF randomness</span>. 
          Create or enter raffles with USDC — every draw is verifiable on-chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#raffles"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-accent-red text-white font-bold text-lg border-2 border-border-dark hover:bg-accent-red/90 transition-colors shadow-[3px_3px_0_#2A2A2A]"
          >
            🎟️ Browse Raffles
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white text-text-primary font-semibold text-lg border-2 border-border-dark hover:bg-cream transition-colors shadow-[3px_3px_0_#E0DBD2]"
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
              <p className="text-accent-red font-bold text-2xl md:text-3xl font-mono">{stat.value}</p>
              <p className="text-text-secondary text-xs uppercase tracking-wider mt-1">{stat.label}</p>
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
      illustration: <TicketIllustration size={60} />,
      title: 'Provably Fair',
      desc: 'Switchboard VRF provides verifiable randomness. No one can predict or manipulate the outcome.',
    },
    {
      illustration: <TentIllustration size={60} />,
      title: 'AI Agent Managed',
      desc: 'An autonomous AI agent creates raffles, manages draws, and distributes prizes automatically.',
    },
    {
      illustration: <TrophyIllustration size={60} />,
      title: 'Fully On-Chain',
      desc: 'Every ticket, draw, and payout is recorded on Solana. Complete transparency, always auditable.',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-text-primary font-bold mb-3">
            Why RaffleBot?
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Built for trust, speed, and fairness on Solana.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative p-6 rounded-lg bg-white border-2 border-border-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0_#E0DBD2]"
            >
              <div className="mb-4">{f.illustration}</div>
              <h3 className="font-display text-lg text-text-primary font-bold mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
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
          <h2 className="font-display text-3xl md:text-4xl text-text-primary font-bold mb-3">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border-light" />
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white border-2 border-border-dark mb-4 shadow-[3px_3px_0_#E0DBD2]">
                <span className="font-mono font-bold text-accent-red text-xl">{step.num}</span>
              </div>
              <h3 className="font-display text-xl text-text-primary font-bold mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Raffle List ───── */
function RaffleListSection({ children, isEmpty, loading: isLoading, error: err }: {
  children: React.ReactNode;
  isEmpty: boolean;
  loading: boolean;
  error?: Error | null;
}) {
  return (
    <section id="raffles" className="py-12">
      {/* Divider stripe */}
      <div className="h-1 carnival-stripe-top rounded-full mb-10 opacity-40" />
      
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-3xl text-text-primary font-bold">Live Raffles</h2>
        <span className="px-2.5 py-0.5 rounded-md bg-accent-red text-white text-xs font-bold uppercase tracking-wider border-2 border-border-dark">
          Active
        </span>
      </div>
      <p className="text-text-secondary mb-8">
        Grab your tickets before time runs out
      </p>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : err ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-accent-red">
          <p className="text-accent-red font-medium">Failed to load raffles</p>
          <p className="text-text-secondary text-sm mt-2">{err.message}</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-border-dark">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-text-secondary text-lg">No active raffles right now</p>
          <p className="text-text-secondary/60 text-sm mt-2">
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
            <h2 className="font-display text-2xl text-text-primary font-bold mb-6 flex items-center gap-2">
              <TrophyIllustration size={32} /> Recent Winners
            </h2>
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
          <h2 className="font-display text-2xl text-text-primary font-bold mb-6">🏆 Recent Winners</h2>
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
