"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface BuyTicketsModalProps {
  raffle: {
    id: string;
    name: string;
    ticketPrice: number;
    maxPerWallet: number;
  };
  onClose: () => void;
}

export function BuyTicketsModal({ raffle, onClose }: BuyTicketsModalProps) {
  const { publicKey } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalCost = quantity * raffle.ticketPrice;

  const handleBuy = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Call program to buy tickets
      console.log(`Buying ${quantity} tickets for raffle ${raffle.id}`);
      
      // Simulate transaction
      await new Promise((r) => setTimeout(r, 2000));
      
      alert(`Successfully bought ${quantity} tickets!`);
      onClose();
    } catch (error) {
      console.error("Error buying tickets:", error);
      alert("Failed to buy tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-dark border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Raffle info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Raffle</p>
            <p className="text-white font-medium">{raffle.name}</p>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Number of Tickets (max {raffle.maxPerWallet})
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      raffle.maxPerWallet,
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  )
                }
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-center text-xl font-bold"
                min={1}
                max={raffle.maxPerWallet}
              />
              <button
                onClick={() => setQuantity(Math.min(raffle.maxPerWallet, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                disabled={quantity >= raffle.maxPerWallet}
              >
                +
              </button>
            </div>
          </div>

          {/* Quick select */}
          <div className="flex gap-2">
            {[1, 5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(Math.min(n, raffle.maxPerWallet))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quantity === n
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="border-t border-gray-800 pt-4 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Ticket price</span>
              <span>${raffle.ticketPrice} USDC</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-gray-800">
              <span>Total</span>
              <span>${totalCost} USDC</span>
            </div>
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              `Buy ${quantity} Ticket${quantity > 1 ? "s" : ""} for $${totalCost} USDC`
            )}
          </button>

          <p className="text-gray-500 text-xs text-center">
            By purchasing tickets you agree to the raffle terms. If the minimum pot
            threshold is not met, you will receive a full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
