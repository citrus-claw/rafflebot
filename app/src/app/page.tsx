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

/* ───── Hero ───── */
function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-10 px-4">
        {/* Left text — StockTaper style: big bold monospace, left-aligned */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl leading-tight mb-5 text-text-primary font-bold">
            On-chain raffles.
            <br />
            Actually fair.
          </h1>

          <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">
            <span className="text-text-primary font-semibold">RaffleBot</span> offers provably fair raffles on Solana,
            powered by VRF randomness, so the story is easy to verify,
            even if you don&apos;t have a blockchain degree.
          </p>

          {/* Stats inline — like StockTaper's "Free to use" area */}
          <div className="flex gap-6 mb-8">
            {[
              { value: 'VRF', label: 'Verified Random' },
              { value: '90%', label: 'To Winners' },
              { value: '<1s', label: 'Settlement' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-accent-red font-bold text-lg">{s.value}</p>
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <a
            href="#raffles"
            className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-cream"
            style={{ background: '#393939', border: '2.4px solid #393939', borderRadius: '6px' }}
          >
            Browse Raffles
          </a>
        </div>

        {/* Right illustration — like StockTaper's astronaut */}
        <div className="flex-shrink-0 hidden md:block">
          <RaffleDrum size={260} />
        </div>
      </div>
    </section>
  );
}

/* ───── Premium Features — like StockTaper's feature cards ───── */
function FeaturesSection() {
  const features = [
    {
      illustration: <TicketIllustration size={44} />,
      pill: { text: 'DEFAULT', color: '#8B8B6E' },
      title: 'DEEP-DIVE THE DRAW',
      bullets: [
        'Verifiable randomness via Switchboard VRF',
        'Full on-chain audit trail',
        'Transparent prize distribution',
      ],
    },
    {
      illustration: <TentIllustration size={44} />,
      pill: { text: 'AI', color: '#E8927C' },
      title: 'AI AGENT MANAGED',
      bullets: [
        'Autonomous raffle creation',
        'Automated prize distribution',
        'Smart draw scheduling',
      ],
    },
    {
      illustration: <TrophyIllustration size={44} />,
      pill: { text: 'ON-CHAIN', color: '#B8860B' },
      title: 'FULLY ON-CHAIN',
      bullets: [
        'Every ticket recorded on Solana',
        'Winners verified publicly',
        'Funds held in program escrow',
      ],
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl text-text-primary font-bold text-center mb-8">
          Premium Features
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 relative"
              style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}
            >
              {/* Pill tag — top right like StockTaper */}
              <span
                className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
                style={{ color: f.pill.color, background: `${f.pill.color}15`, border: `0.8px solid ${f.pill.color}40` }}
              >
                {f.pill.text}
              </span>

              <div className="mb-3">{f.illustration}</div>
              <h3 className="text-xs text-text-primary font-bold mb-3 uppercase tracking-wider">{f.title}</h3>
              <ul className="space-y-1.5">
                {f.bullets.map((b) => (
                  <li key={b} className="text-text-secondary text-[11px] leading-relaxed flex gap-2">
                    <span className="text-text-secondary">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── How It Works — numbered steps ───── */
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Create', desc: 'The AI agent creates a raffle with ticket price, duration, and minimum pot.' },
    { num: '02', title: 'Buy', desc: 'Connect your wallet and buy tickets with USDC. Each ticket is an on-chain entry.' },
    { num: '03', title: 'Win', desc: 'VRF selects a winner at random. Prize (90%) is sent directly to the winner\'s wallet.' },
  ];

  return (
    <section id="how-it-works" className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl text-text-primary font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[60%] w-[80%]" style={{ borderTop: '0.8px dashed #393939' }} />
              )}
              <div
                className="inline-flex items-center justify-center w-10 h-10 mb-3"
                style={{ border: '0.8px dashed #393939', borderRadius: '50%' }}
              >
                <span className="font-bold text-accent-red text-xs">{step.num}</span>
              </div>
              <h3 className="text-xs text-text-primary font-bold mb-2 uppercase tracking-wider">{step.title}</h3>
              <p className="text-text-secondary text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Three Column Section — like StockTaper's Opportunity Radar / Sector Pulse / Market Snapshot ───── */
function InfoColumnsSection() {
  return (
    <section className="py-12" style={{ borderTop: '0.8px dashed #393939' }}>
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        {/* Raffle Radar — like Opportunity Radar */}
        <div>
          <h3 className="text-sm text-text-primary font-bold mb-4" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '6px' }}>
            Raffle Radar
          </h3>
          <div className="space-y-4">
            <div className="p-3" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              <p className="text-xs text-text-primary font-bold mb-1">Provably Fair Draws</p>
              <p className="text-[10px] text-text-secondary leading-relaxed mb-2">
                Every winner selected by Switchboard VRF. On-chain entropy ensures no manipulation.
              </p>
              <div className="flex gap-1.5">
                {['VRF', 'SOLANA'].map((t) => (
                  <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded" style={{ color: '#8B8B6E', background: '#8B8B6E15', border: '0.8px solid #8B8B6E40' }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="p-3" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              <p className="text-xs text-text-primary font-bold mb-1">AI Agent Automation</p>
              <p className="text-[10px] text-text-secondary leading-relaxed mb-2">
                Autonomous creation, management, and distribution. No human intervention needed.
              </p>
              <div className="flex gap-1.5">
                {['AI', 'AUTO'].map((t) => (
                  <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded" style={{ color: '#E8927C', background: '#E8927C15', border: '0.8px solid #E8927C40' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prize Distribution — like Sector Pulse */}
        <div>
          <h3 className="text-sm text-text-primary font-bold mb-4" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '6px' }}>
            Prize Structure
          </h3>
          <div className="p-3 mb-3" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <p className="text-xs text-text-primary font-bold mb-1">Winner Takes 90%</p>
            <p className="text-[10px] text-text-secondary leading-relaxed mb-2">
              The vast majority of every pot goes directly to the winner&apos;s wallet. Protocol takes a minimal 10% fee.
            </p>
            <div className="flex gap-1.5">
              {['USDC', 'SPL'].map((t) => (
                <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded" style={{ color: '#B8860B', background: '#B8860B15', border: '0.8px solid #B8860B40' }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="p-3" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <p className="text-xs text-text-primary font-bold mb-1">Minimum Pot Protection</p>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              If the minimum pot isn&apos;t reached, all ticket holders receive a full refund. No risk.
            </p>
          </div>
        </div>

        {/* Quick Stats — like Market Snapshot */}
        <div>
          <h3 className="text-sm text-text-primary font-bold mb-4" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '6px' }}>
            Platform Snapshot
          </h3>
          <div className="space-y-0">
            {[
              { label: 'Network', value: 'Solana Devnet' },
              { label: 'Token', value: 'USDC' },
              { label: 'Winner Share', value: '90%' },
              { label: 'Draw Method', value: 'Switchboard VRF' },
              { label: 'Settlement', value: '< 1 second' },
              { label: 'Refund Policy', value: 'Auto if min not met' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 text-xs" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                <span className="text-text-secondary">{item.label}</span>
                <span className="text-text-primary font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
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
    <section id="raffles" className="py-10" style={{ borderTop: '0.8px dashed #393939' }}>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-lg text-text-primary font-bold">Live Raffles</h2>
        <span
          className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
          style={{ color: '#C41E3A', background: '#C41E3A15', border: '0.8px solid #C41E3A40' }}
        >
          Active
        </span>
      </div>
      <p className="text-text-secondary text-xs mb-6">Grab your tickets before time runs out</p>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <RaffleCardSkeleton />
          <RaffleCardSkeleton />
        </div>
      ) : err ? (
        <div className="text-center py-10" style={{ border: '0.8px dashed #C41E3A', borderRadius: '6px' }}>
          <p className="text-accent-red text-xs">Failed to load raffles</p>
          <p className="text-text-secondary text-[10px] mt-1">{err.message}</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-14" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
          <FerrisWheel size={60} className="mx-auto mb-3 opacity-20" />
          <p className="text-text-secondary text-xs">No active raffles right now</p>
          <p className="text-text-secondary text-[10px] mt-1">Check back soon — new raffles created regularly.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <InfoColumnsSection />

        <RaffleListSection isEmpty={mockActive.length === 0} loading={false}>
          {mockActive.map((raffle) => (
            <MockRaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </RaffleListSection>

        {mockEnded.length > 0 && (
          <section className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <TrophyIllustration size={24} />
              <h2 className="text-base text-text-primary font-bold">Recent Winners</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <InfoColumnsSection />

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
        <section className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <TrophyIllustration size={24} />
            <h2 className="text-base text-text-primary font-bold">Recent Winners</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
