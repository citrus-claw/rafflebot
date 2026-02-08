"use client";

import { useState } from"react";
import { useWallet } from"@solana/wallet-adapter-react";
import { Star, Ticket as TicketIcon } from"lucide-react";
import { cn } from"@/lib/utils";

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
 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
 <div className="max-w-sm w-full bg-carnival-red p-1 rounded-sm">
 <div className="bg-surface border-2 border-ink p-8 rounded-sm text-center">
 <div className="flex justify-center mb-4 animate-bounce">
 <Star size={64} className="fill-gold text-ink"/>
 </div>
 <h4 className="font-display text-2xl uppercase text-carnival-red mb-2">You&apos;re In!</h4>
 <p className="text-ink/70 text-sm font-mono mb-6">
 {quantity} ticket{quantity > 1 ? 's' : ''} minted to your wallet.
 </p>

 <div className="bg-paper border-2 border-dashed border-ink p-4 rounded-sm mb-6 text-left">
 <p className="text-ink/60 text-[10px] uppercase tracking-wider mb-1 font-display">Raffle</p>
 <p className="text-ink text-sm font-bold">{raffle.name}</p>
 <div className="mt-3 pt-3 border-t-2 border-ink/10 flex justify-between">
 <div>
 <p className="text-ink/60 text-[10px] uppercase tracking-wider">Qty</p>
 <p className="text-carnival-red font-bold text-lg font-display">{quantity}</p>
 </div>
 <div>
 <p className="text-ink/60 text-[10px] uppercase tracking-wider">Total</p>
 <p className="text-carnival-red font-bold text-lg font-display">${totalCost} USDC</p>
 </div>
 </div>
 </div>

 <p className="text-ink/40 text-[10px] mb-4 uppercase tracking-wider font-bold">
 ★ Keep this coupon ★
 </p>

 <button
 onClick={onClose}
 className="w-full bg-carnival-blue text-white py-3 rounded-sm font-display text-sm uppercase tracking-widest hover:bg-ink transition-all"
 >
 Done
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
 <div className="bg-carnival-red p-1 rounded-sm max-w-md w-full">
 <div className="bg-surface border-2 border-ink p-6 rounded-sm">
 <div className="text-center mb-6 border-b-2 border-ink/10 pb-4">
 <h3 className="text-2xl font-display uppercase text-carnival-red">Ticket Booth</h3>
 <p className="text-xs font-bold uppercase text-ink/50 tracking-widest mt-1">Get Your Entry Here</p>
 </div>

 <div className="space-y-6">
 <div className="space-y-2">
 <label className="flex justify-between text-xs font-bold uppercase text-ink font-display tracking-wider">
 <span>How many?</span>
 <span className="text-carnival-blue">Max: {raffle.maxPerWallet}</span>
 </label>
 <div className="relative">
 <input
 type="number"
 min="1"
 max={raffle.maxPerWallet}
 value={quantity}
 onChange={(e) =>
 setQuantity(Math.min(raffle.maxPerWallet, Math.max(1, parseInt(e.target.value) || 1)))
 }
 className="w-full border-2 border-ink rounded-sm p-3 font-mono text-2xl text-center focus:outline-none focus:ring-4 focus:ring-gold bg-paper"
 />
 <div className="absolute top-1/2 right-4 -translate-y-1/2 text-ink/30">
 <TicketIcon size={20} />
 </div>
 </div>
 </div>

 <div className="flex gap-2">
 {[1, 5, 10, 25].map((n) => (
 <button
 key={n}
 onClick={() => setQuantity(Math.min(n, raffle.maxPerWallet))}
 className={cn(
"flex-1 py-2 text-xs font-bold rounded-sm border-2 transition-all",
 quantity === n
 ?"bg-ink text-gold border-ink"
 :"bg-paper text-ink/60 border-ink/20 hover:border-ink"
 )}
 >
 {n}×
 </button>
 ))}
 </div>

 <div className="bg-paper rounded-sm p-4 space-y-2 text-sm border-2 border-ink/10 font-mono">
 <div className="flex justify-between">
 <span className="text-ink/60">Price per Ticket</span>
 <span className="font-bold">${raffle.ticketPrice} USDC</span>
 </div>
 <div className="flex justify-between text-ink/60 text-xs">
 <span>Gas Fee</span>
 <span>~0.0005 SOL</span>
 </div>
 <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-ink/10 text-carnival-red mt-2">
 <span>Total</span>
 <span>${totalCost} USDC</span>
 </div>
 </div>

 <button
 onClick={handleBuy}
 disabled={loading}
 className="w-full bg-carnival-blue text-white py-4 rounded-sm font-display text-xl uppercase tracking-widest hover:bg-ink transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <span className="flex items-center justify-center gap-2">
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
 Printing Stub...
 </span>
 ) : (
 `Purchase ${quantity} Ticket${quantity > 1 ?"s":""}`
 )}
 </button>
 <p className="text-[10px] text-center text-ink/40 font-bold uppercase">
 Funds are securely transferred via Solana
 </p>

 <button
 onClick={onClose}
 className="w-full text-xs font-bold uppercase text-ink/50 hover:text-carnival-red transition-colors py-2"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
