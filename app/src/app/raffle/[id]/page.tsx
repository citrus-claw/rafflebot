"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Countdown } from "@/components/Countdown";
import { BuyTicketsModal } from "@/components/BuyTicketsModal";

// Mock data - will fetch from chain
const mockRaffle = {
  id: "abc123",
  name: "Weekly USDC Raffle",
  ticketPrice: 5,
  totalPot: 2500,
  minPot: 10000,
  maxPerWallet: 100,
  totalTickets: 500,
  endTime: Date.now() + 86400000 * 3,
  status: "active" as const,
  authority: "RafF1e...",
  escrow: "EsCr0w...",
};

export default function RafflePage() {
  const params = useParams();
  const { connected } = useWallet();
  const [showBuyModal, setShowBuyModal] = useState(false);

  const raffle = mockRaffle; // Will fetch by params.id
  const progress = (raffle.totalPot / raffle.minPot) * 100;
  const thresholdMet = raffle.totalPot >= raffle.minPot;
  const prizeAmount = raffle.totalPot * 0.9; // 90% to winner

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <span>Raffle</span>
          <span>•</span>
          <span className="font-mono">{params.id}</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">{raffle.name}</h1>
        <div className="flex gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              thresholdMet
                ? "bg-secondary/20 text-secondary"
                : "bg-yellow-500/20 text-yellow-500"
            }`}
          >
            {thresholdMet ? "✓ Threshold Met" : "Building..."}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
            Active
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Prize info */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Prize Pool</h2>
            <div className="text-5xl font-bold text-secondary mb-2">
              ${prizeAmount.toLocaleString()}
            </div>
            <p className="text-gray-400">
              90% of pot goes to winner • 10% platform fee
            </p>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Pot Progress</span>
                <span className="text-white">
                  ${raffle.totalPot.toLocaleString()} / ${raffle.minPot.toLocaleString()} USDC
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    thresholdMet ? "bg-secondary" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {!thresholdMet && (
                <p className="text-yellow-500 text-sm mt-2">
                  ⚠️ Raffle needs ${(raffle.minPot - raffle.totalPot).toLocaleString()} more to proceed
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Ticket Price</p>
              <p className="text-2xl font-bold text-white">${raffle.ticketPrice}</p>
              <p className="text-gray-500 text-sm">USDC</p>
            </div>
            <div className="bg-dark border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Tickets Sold</p>
              <p className="text-2xl font-bold text-white">{raffle.totalTickets}</p>
              <p className="text-gray-500 text-sm">entries</p>
            </div>
            <div className="bg-dark border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Max Per Wallet</p>
              <p className="text-2xl font-bold text-white">{raffle.maxPerWallet}</p>
              <p className="text-gray-500 text-sm">tickets</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">How it Works</h2>
            <ol className="space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                <span>Buy tickets with USDC (max {raffle.maxPerWallet} per wallet)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                <span>Wait for deadline & minimum pot threshold</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</span>
                <span>Winner drawn using Switchboard VRF (verifiable randomness)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">4</span>
                <span>Winner claims 90% of the pot!</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Countdown */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Time Remaining</h2>
            <Countdown endTime={raffle.endTime} />
          </div>

          {/* Buy tickets */}
          <div className="bg-dark border border-primary rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Buy Tickets</h2>
            {connected ? (
              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Buy Tickets
              </button>
            ) : (
              <p className="text-gray-400 text-center">
                Connect your wallet to buy tickets
              </p>
            )}
          </div>

          {/* Your entries */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Entries</h2>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-gray-400">tickets</p>
            </div>
          </div>
        </div>
      </div>

      {showBuyModal && (
        <BuyTicketsModal
          raffle={raffle}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
}
