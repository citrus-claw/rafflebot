import { RaffleCard } from "@/components/RaffleCard";

// Mock data for now - will fetch from chain later
const mockRaffles = [
  {
    id: "abc123",
    name: "Weekly USDC Raffle",
    ticketPrice: 5,
    totalPot: 2500,
    minPot: 10000,
    totalTickets: 500,
    endTime: Date.now() + 86400000 * 3, // 3 days
    status: "active" as const,
  },
  {
    id: "def456",
    name: "Community Giveaway",
    ticketPrice: 2,
    totalPot: 800,
    minPot: 5000,
    totalTickets: 400,
    endTime: Date.now() + 86400000 * 5, // 5 days
    status: "active" as const,
  },
];

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Active Raffles</h1>
        <p className="text-gray-400">
          Buy tickets for a chance to win. Provably fair with Switchboard VRF.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockRaffles.map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} />
        ))}
      </div>

      {mockRaffles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No active raffles right now.</p>
          <p className="text-gray-500 text-sm mt-2">
            Check back soon or ask the agent to create one!
          </p>
        </div>
      )}
    </div>
  );
}
