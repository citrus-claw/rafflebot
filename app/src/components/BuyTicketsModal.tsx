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
  const [purchased, setPurchased] = useState(false);

  const totalCost = quantity * raffle.ticketPrice;

  const handleBuy = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      console.log(`Buying ${quantity} tickets for raffle ${raffle.id}`);
      await new Promise((r) => setTimeout(r, 2000));
      setPurchased(true);
    } catch (error) {
      console.error("Error buying tickets:", error);
      alert("Failed to buy tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show carnival ticket confirmation
  if (purchased) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="animate-ticket-enter max-w-sm w-full">
          {/* Ticket shape */}
          <div className="relative bg-gradient-to-br from-carnival-surface to-carnival-dark rounded-2xl overflow-hidden border border-carnival-amber/30 glow-gold ticket-notch">
            <div className="h-2 bg-carnival-gradient" />
            
            <div className="p-6 text-center">
              <div className="text-5xl mb-3">🎟️</div>
              <h2 className="font-display text-2xl text-carnival-amber mb-1">
                YOU'RE IN!
              </h2>
              <p className="text-carnival-cream/60 text-sm mb-6">
                {quantity} ticket{quantity > 1 ? 's' : ''} purchased
              </p>

              {/* Ticket details */}
              <div className="bg-carnival-dark/60 rounded-xl p-4 border border-carnival-border mb-6">
                <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">Raffle</p>
                <p className="font-ticket text-carnival-cream text-lg">{raffle.name}</p>
                <div className="mt-3 pt-3 border-t border-carnival-border/50 flex justify-between">
                  <div>
                    <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Qty</p>
                    <p className="text-carnival-amber font-bold text-lg">{quantity}</p>
                  </div>
                  <div>
                    <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Total</p>
                    <p className="text-carnival-amber font-bold text-lg">${totalCost} USDC</p>
                  </div>
                </div>
              </div>

              <p className="text-carnival-cream/40 text-xs mb-4">
                ✨ Good luck! Winners drawn with verifiable randomness.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-carnival-dark bg-gradient-to-r from-carnival-amber to-carnival-gold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>

            <div className="h-2 bg-carnival-gradient" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-carnival-surface border border-carnival-border rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-ticket text-xl text-carnival-amber">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="text-carnival-cream/40 hover:text-carnival-cream transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Raffle info */}
          <div className="bg-carnival-dark/60 rounded-xl p-4 border border-carnival-border">
            <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider">Raffle</p>
            <p className="text-carnival-cream font-ticket text-lg">{raffle.name}</p>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="block text-carnival-cream/50 text-sm mb-3">
              How many tickets? <span className="text-carnival-cream/30">(max {raffle.maxPerWallet})</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-xl bg-carnival-dark border border-carnival-border text-carnival-cream hover:border-carnival-amber/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(raffle.maxPerWallet, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="flex-1 bg-carnival-dark border border-carnival-border rounded-xl px-4 py-3 text-carnival-amber text-center text-2xl font-bold font-mono focus:border-carnival-amber/50 focus:outline-none"
                min={1}
                max={raffle.maxPerWallet}
              />
              <button
                onClick={() => setQuantity(Math.min(raffle.maxPerWallet, quantity + 1))}
                disabled={quantity >= raffle.maxPerWallet}
                className="w-12 h-12 rounded-xl bg-carnival-dark border border-carnival-border text-carnival-cream hover:border-carnival-amber/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg"
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
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  quantity === n
                    ? "bg-carnival-red text-carnival-cream border border-carnival-red"
                    : "bg-carnival-dark border border-carnival-border text-carnival-cream/50 hover:text-carnival-cream hover:border-carnival-amber/30"
                }`}
              >
                {n}×
              </button>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="border-t border-carnival-border pt-4 space-y-2">
            <div className="flex justify-between text-carnival-cream/50 text-sm">
              <span>Ticket price</span>
              <span>${raffle.ticketPrice} USDC</span>
            </div>
            <div className="flex justify-between text-carnival-cream/50 text-sm">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="flex justify-between text-carnival-amber text-xl font-bold pt-3 border-t border-carnival-border">
              <span>Total</span>
              <span>${totalCost} USDC</span>
            </div>
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-gradient-to-r from-carnival-red to-carnival-orange hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-all text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `🎟️ Buy ${quantity} Ticket${quantity > 1 ? "s" : ""}`
            )}
          </button>

          <p className="text-carnival-cream/25 text-xs text-center">
            If minimum pot isn't met, you'll receive a full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
