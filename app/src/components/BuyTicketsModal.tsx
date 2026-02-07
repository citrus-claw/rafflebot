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

  if (purchased) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="max-w-sm w-full bg-cream" style={{ border: '1.6px solid #393939', borderRadius: '6px' }}>
          <div className="p-8 text-center">
            <p className="text-2xl text-text-primary font-bold mb-2">
              YOU&apos;RE IN!
            </p>
            <p className="text-text-secondary text-xs mb-6">
              {quantity} ticket{quantity > 1 ? 's' : ''} purchased
            </p>

            <div className="p-4 mb-6" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1">Raffle</p>
              <p className="text-text-primary text-sm font-bold">{raffle.name}</p>
              <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: '0.8px dashed #393939' }}>
                <div>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider">Qty</p>
                  <p className="text-accent-red font-bold text-lg">{quantity}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider">Total</p>
                  <p className="text-accent-red font-bold text-lg">${totalCost} USDC</p>
                </div>
              </div>
            </div>

            <p className="text-text-secondary text-[10px] mb-4 uppercase tracking-wider">
              ★ Keep this coupon ★
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-bold text-cream"
              style={{ background: '#393939', border: '2.4px solid #393939', borderRadius: '6px' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-cream p-6 max-w-md w-full" style={{ border: '1.6px solid #393939', borderRadius: '6px' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base text-text-primary font-bold">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          <div className="p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <p className="text-text-secondary text-[10px] uppercase tracking-wider">Raffle</p>
            <p className="text-text-primary text-sm font-bold">{raffle.name}</p>
          </div>

          <div>
            <label className="block text-text-secondary text-xs mb-3">
              How many tickets? <span className="text-text-secondary/50">(max {raffle.maxPerWallet})</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-text-primary disabled:opacity-30 font-bold"
                style={{ border: '1.6px solid #393939', borderRadius: '6px' }}
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(raffle.maxPerWallet, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="flex-1 bg-transparent px-4 py-2.5 text-accent-red text-center text-xl font-bold focus:outline-none"
                style={{ border: '1.6px solid #393939', borderRadius: '6px' }}
                min={1}
                max={raffle.maxPerWallet}
              />
              <button
                onClick={() => setQuantity(Math.min(raffle.maxPerWallet, quantity + 1))}
                disabled={quantity >= raffle.maxPerWallet}
                className="w-10 h-10 flex items-center justify-center text-text-primary disabled:opacity-30 font-bold"
                style={{ border: '1.6px solid #393939', borderRadius: '6px' }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {[1, 5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(Math.min(n, raffle.maxPerWallet))}
                className={`flex-1 py-2 text-xs font-bold ${
                  quantity === n ? "text-cream" : "text-text-secondary"
                }`}
                style={{
                  background: quantity === n ? '#393939' : 'transparent',
                  border: quantity === n ? '1.6px solid #393939' : '0.8px dashed #393939',
                  borderRadius: '6px',
                }}
              >
                {n}×
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-2" style={{ borderTop: '0.8px dashed #393939' }}>
            <div className="flex justify-between text-text-secondary text-xs">
              <span>Ticket price</span>
              <span>${raffle.ticketPrice} USDC</span>
            </div>
            <div className="flex justify-between text-text-secondary text-xs">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="flex justify-between text-text-primary text-lg font-bold pt-3" style={{ borderTop: '1.6px solid #393939' }}>
              <span>Total</span>
              <span className="text-accent-red">${totalCost} USDC</span>
            </div>
          </div>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full py-3 text-sm font-bold text-cream disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#393939', border: '2.4px solid #393939', borderRadius: '6px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Buy ${quantity} Ticket${quantity > 1 ? "s" : ""} →`
            )}
          </button>

          <p className="text-text-secondary text-[10px] text-center">
            If minimum pot isn&apos;t met, you&apos;ll receive a full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
