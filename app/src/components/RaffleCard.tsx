"use client";

import Link from "next/link";
import { Countdown } from "./Countdown";

interface RaffleCardProps {
  raffle: {
    id: string;
    name: string;
    ticketPrice: number;
    totalPot: number;
    minPot: number;
    totalTickets: number;
    endTime: number;
    status: "active" | "completed" | "cancelled";
  };
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const progress = (raffle.totalPot / raffle.minPot) * 100;
  const thresholdMet = raffle.totalPot >= raffle.minPot;

  return (
    <Link href={`/raffle/${raffle.id}`}>
      <div className="bg-dark border border-gray-800 rounded-xl p-6 hover:border-primary transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">{raffle.name}</h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              thresholdMet
                ? "bg-secondary/20 text-secondary"
                : "bg-yellow-500/20 text-yellow-500"
            }`}
          >
            {thresholdMet ? "Threshold Met" : "Building..."}
          </span>
        </div>

        <div className="space-y-4">
          {/* Pot progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Current Pot</span>
              <span className="text-white font-medium">
                ${raffle.totalPot.toLocaleString()} / ${raffle.minPot.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  thresholdMet ? "bg-secondary" : "bg-primary"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Ticket Price</p>
              <p className="text-white font-medium">${raffle.ticketPrice} USDC</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tickets Sold</p>
              <p className="text-white font-medium">{raffle.totalTickets}</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Ends in</p>
            <Countdown endTime={raffle.endTime} />
          </div>
        </div>
      </div>
    </Link>
  );
}
