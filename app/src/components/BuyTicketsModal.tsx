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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="animate-ticket-enter max-w-sm w-full">
          {/* Ticket shape */}
          <div className="relative bg-white rounded-lg overflow-hidden border-2 border-border-dark shadow-[6px_6px_0_#E0DBD2] ticket-notch">
            <div className="h-2 carnival-stripe-top" />
            
            <div className="p-6 text-center">
              <div className="text-5xl mb-3">🎟️</div>
              <h2 className="font-display text-2xl text-accent-red font-bold mb-1">
                YOU&apos;RE IN!
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                {quantity} ticket{quantity > 1 ? 's' : ''} purchased
              </p>

              {/* Ticket details */}
              <div className="bg-cream rounded-lg p-4 border-2 border-border-light mb-6">
                <p className="text-text-secondary text-[11px] uppercase tracking-wider mb-1">Raffle</p>
                <p className="font-display text-text-primary text-lg font-bold">{raffle.name}</p>
                <div className="mt-3 pt-3 border-t-2 border-dashed border-border-light flex justify-between">
                  <div>
                    <p className="text-text-secondary text-[11px] uppercase tracking-wider">Qty</p>
                    <p className="text-accent-red font-bold text-lg font-mono">{quantity}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-[11px] uppercase tracking-wider">Total</p>
                    <p className="text-accent-red font-bold text-lg font-mono">${totalCost} USDC</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary text-xs mb-4 font-mono uppercase tracking-wider">
                ★ Keep this coupon ★
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-bold text-white bg-accent-red border-2 border-border-dark hover:bg-accent-red/90 transition-colors shadow-[3px_3px_0_#2A2A2A]"
              >
                Done
              </button>
            </div>

            <div className="h-2 carnival-stripe-top" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-border-dark rounded-lg p-6 max-w-md w-full shadow-[6px_6px_0_#E0DBD2]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl text-text-primary font-bold">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Raffle info */}
          <div className="bg-cream rounded-lg p-4 border-2 border-border-light">
            <p className="text-text-secondary text-[11px] uppercase tracking-wider">Raffle</p>
            <p className="text-text-primary font-display text-lg font-bold">{raffle.name}</p>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              How many tickets? <span className="text-text-secondary/50">(max {raffle.maxPerWallet})</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-lg bg-white border-2 border-border-dark text-text-primary hover:bg-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg"
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
                className="flex-1 bg-white border-2 border-border-dark rounded-lg px-4 py-3 text-accent-red text-center text-2xl font-bold font-mono focus:border-accent-red focus:outline-none"
                min={1}
                max={raffle.maxPerWallet}
              />
              <button
                onClick={() => setQuantity(Math.min(raffle.maxPerWallet, quantity + 1))}
                disabled={quantity >= raffle.maxPerWallet}
                className="w-12 h-12 rounded-lg bg-white border-2 border-border-dark text-text-primary hover:bg-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg"
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
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                  quantity === n
                    ? "bg-accent-red text-white border-border-dark"
                    : "bg-white border-border-light text-text-secondary hover:text-text-primary hover:border-border-dark"
                }`}
              >
                {n}×
              </button>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="border-t-2 border-dashed border-border-light pt-4 space-y-2">
            <div className="flex justify-between text-text-secondary text-sm">
              <span>Ticket price</span>
              <span className="font-mono">${raffle.ticketPrice} USDC</span>
            </div>
            <div className="flex justify-between text-text-secondary text-sm">
              <span>Quantity</span>
              <span className="font-mono">× {quantity}</span>
            </div>
            <div className="flex justify-between text-text-primary text-xl font-bold pt-3 border-t-2 border-border-dark">
              <span>Total</span>
              <span className="font-mono text-accent-red">${totalCost} USDC</span>
            </div>
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-accent-red hover:bg-accent-red/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all text-lg border-2 border-border-dark shadow-[3px_3px_0_#2A2A2A]"
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

          <p className="text-text-secondary/50 text-xs text-center font-mono">
            If minimum pot isn&apos;t met, you&apos;ll receive a full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
