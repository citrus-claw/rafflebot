'use client';

import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard, RaffleCardSkeleton } from '@/components/RaffleCard';
import { MockRaffleCard } from '@/components/MockRaffleCard';

// Mock data for development (before devnet deploy)
const MOCK_MODE = true; // Toggle to false when program is deployed

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

export default function Home() {
  const { activeRaffles, endedRaffles, loading, error } = useRaffles();

  // Use mock data in development
  if (MOCK_MODE) {
    const mockActive = mockRaffles.filter(r => r.status === 'active');
    const mockEnded = mockRaffles.filter(r => r.status === 'ended');

    return (
      <div>
        {/* Active Raffles */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Active Raffles</h1>
          <p className="text-gray-400 mb-6">
            Buy tickets for a chance to win. Provably fair with Switchboard VRF.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockActive.map((raffle) => (
              <MockRaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>

          {mockActive.length === 0 && (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-gray-400">No active raffles right now.</p>
              <p className="text-gray-500 text-sm mt-2">
                Check back soon or ask the agent to create one!
              </p>
            </div>
          )}
        </div>

        {/* Ended Raffles */}
        {mockEnded.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Recent Winners</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockEnded.map((raffle) => (
                <MockRaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Real on-chain data
  return (
    <div>
      {/* Active Raffles */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Active Raffles</h1>
        <p className="text-gray-400 mb-6">
          Buy tickets for a chance to win. Provably fair with Switchboard VRF.
        </p>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RaffleCardSkeleton />
            <RaffleCardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-900">
            <p className="text-red-400">Failed to load raffles</p>
            <p className="text-red-500 text-sm mt-2">{error.message}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.publicKey.toBase58()} 
                publicKey={raffle.publicKey}
                raffle={raffle.account}
              />
            ))}
          </div>
        )}

        {!loading && !error && activeRaffles.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-400">No active raffles on-chain.</p>
            <p className="text-gray-500 text-sm mt-2">
              Deploy the program and create your first raffle!
            </p>
          </div>
        )}
      </div>

      {/* Ended Raffles */}
      {endedRaffles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Winners</h2>
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
  );
}
