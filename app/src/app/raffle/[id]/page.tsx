'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffle, useMyEntry } from '@/hooks/useRaffles';
import { useBuyTickets } from '@/hooks/useBuyTickets';
import { useClaimPrize } from '@/hooks/useClaimPrize';
import { getStatusLabel, isActive, isDrawComplete } from '@/lib/idl/rafflebot';
import { BN } from '@coral-xyz/anchor';
import Link from 'next/link';
import { Star, Ticket, Shield, ChevronLeft } from 'lucide-react';
import { TicketIllustration } from '@/components/illustrations/TicketIllustration';
import { cn } from '@/lib/utils';
import { formatUSDC, formatTimeRemaining, formatDateTime } from '@/lib/format';

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
 return (
 <div className="flex justify-between items-baseline py-2 border-b border-dashed border-ink/15">
 <span className="text-ink/50 text-xs">{label}</span>
 <span className={cn("text-xs font-semibold", accent ?"text-carnival-red":"text-ink")}>{value}</span>
 </div>
 );
}

export default function RafflePage() {
 const params = useParams();
 const raffleId = params.id as string;

 const [rafflePubkey, setRafflePubkey] = useState<PublicKey | null>(null);
 const [ticketCount, setTicketCount] = useState(1);
 const [txStatus, setTxStatus] = useState<string | null>(null);

 const { publicKey, connected } = useWallet();
 const { raffle, loading, error, refetch } = useRaffle(rafflePubkey);
 const { entry, refetch: refetchEntry } = useMyEntry(rafflePubkey);
 const { buyTickets, loading: buying, error: buyError } = useBuyTickets();
 const { claimPrize, loading: claiming, error: claimError } = useClaimPrize();

 useEffect(() => {
 try {
 setRafflePubkey(new PublicKey(raffleId));
 } catch {
 setRafflePubkey(null);
 }
 }, [raffleId]);

 const handleBuy = async () => {
 if (!rafflePubkey || !raffle) return;
 setTxStatus('Sending transaction...');
 const sig = await buyTickets(rafflePubkey, raffle, ticketCount);
 if (sig) {
 setTxStatus(`Success! Tx: ${sig.slice(0, 8)}...`);
 refetch();
 refetchEntry();
 setTimeout(() => setTxStatus(null), 5000);
 } else {
 setTxStatus('Transaction failed');
 }
 };

 const handleClaim = async () => {
 if (!rafflePubkey || !raffle) return;
 setTxStatus('Claiming prize...');
 const sig = await claimPrize(rafflePubkey, raffle);
 if (sig) {
 setTxStatus(`Prize claimed! Tx: ${sig.slice(0, 8)}...`);
 refetch();
 } else {
 setTxStatus('Claim failed');
 }
 };

 const isWinner = raffle?.winner && publicKey && raffle.winner.equals(publicKey);
 const canClaim = isWinner && raffle && isDrawComplete(raffle.status);

 if (!rafflePubkey) {
 return (
 <div className="text-center py-16">
 <p className="text-carnival-red text-xs font-display">Invalid raffle ID</p>
 <Link href="/"className="text-ink/60 hover:text-ink text-xs mt-4 block">← Back to raffles</Link>
 </div>
 );
 }

 if (loading) {
 return (
 <div className="text-center py-16">
 <Ticket size={48} className="text-carnival-red animate-bounce mx-auto mb-4"/>
 <p className="text-ink/60 text-xs font-display uppercase tracking-widest">Loading raffle...</p>
 </div>
 );
 }

 if (error || !raffle) {
 return (
 <div className="text-center py-16">
 <p className="text-carnival-red text-xs font-display">Failed to load raffle</p>
 <p className="text-ink/60 text-[10px] mt-2">{error?.message}</p>
 <Link href="/"className="text-ink/60 hover:text-ink text-xs mt-4 block">← Back to raffles</Link>
 </div>
 );
 }

 const active = isActive(raffle.status);
 const progress = raffle.minPot.toNumber() > 0
 ? Math.min(100, (raffle.totalPot.toNumber() / raffle.minPot.toNumber()) * 100)
 : 100;
 const maxTickets = raffle.maxPerWallet > 0
 ? raffle.maxPerWallet - (entry?.numTickets || 0)
 : 100;

 return (
 <div>
 {/* Breadcrumb */}
 <Link href="/"className="inline-flex items-center gap-1 text-ink/60 hover:text-carnival-red text-xs mb-6 transition-colors">
 <ChevronLeft size={14} />
 Back to raffles
 </Link>

 {/* Title row */}
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-2xl md:text-3xl font-display text-ink">{raffle.name}</h1>
 <span className={cn(
"px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border-2",
 active ?"text-green-700 bg-white border-green-700":"text-muted bg-white border-ink/30"
 )}>
 {getStatusLabel(raffle.status)}
 </span>
 </div>
 <p className="text-ink/40 text-[10px] font-mono mb-8">No.{rafflePubkey.toBase58()}</p>

 {/* Two-column layout */}
 <div className="flex flex-col md:flex-row gap-6">

 {/* ───── Main Column ───── */}
 <div className="flex-1 min-w-0 space-y-6">

 {/* Prize Pool Progress */}
 <div className="bg-surface border-2 border-ink rounded-sm p-5">
 <div className="flex items-baseline justify-between mb-4">
 <div>
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Total Prize Pool</p>
 <p className="text-carnival-red font-bold text-3xl font-display">{formatUSDC(raffle.totalPot)}</p>
 </div>
 <div className="text-right">
 <p className="text-ink/50 text-[10px] uppercase tracking-wider font-display">Min Target</p>
 <p className="text-ink font-semibold text-sm font-mono">{formatUSDC(raffle.minPot)}</p>
 </div>
 </div>
 <div className="h-4 bg-paper rounded-sm overflow-hidden border border-ink/10 mb-2">
 <div
 className="h-full rounded-sm bg-gold"
 style={{ width: `${progress}%` }}
 />
 </div>
 <p className="text-ink/50 text-[10px]">{Math.round(progress)}% of minimum pot reached</p>
 </div>

 {/* Raffle Details Table */}
 <div className="bg-surface border-2 border-ink rounded-sm overflow-hidden">
 <div className="bg-carnival-blue px-5 py-3 border-b-2 border-ink">
 <h2 className="text-sm font-display text-white uppercase tracking-wider">Raffle Details</h2>
 </div>
 <div className="p-5">
 <div className="grid grid-cols-2 gap-x-8">
 <InfoRow label="Prize Pool"value={formatUSDC(raffle.totalPot)} accent />
 <InfoRow label="Ticket Price"value={formatUSDC(raffle.ticketPrice)} />
 <InfoRow label="Tickets Sold"value={raffle.totalTickets.toString()} />
 <InfoRow label="Max/Wallet"value={raffle.maxPerWallet > 0 ? raffle.maxPerWallet.toString() : '∞'} />
 <InfoRow label="Winner Share"value="90%"accent />
 <InfoRow label={active ? 'Time Left' : 'Ended'} value={active ? formatTimeRemaining(raffle.endTime) : formatDateTime(raffle.endTime)} />
 </div>
 </div>
 </div>

 {/* Buy Tickets Section */}
 {active && connected && (
 <div className="bg-surface border-2 border-ink rounded-sm p-5">
 <h2 className="text-sm font-display text-carnival-red uppercase tracking-wider mb-4">Buy Tickets</h2>

 <div className="flex gap-3 items-end mb-3">
 <div className="flex-1">
 <label className="text-ink/50 text-[10px] uppercase tracking-wider font-display block mb-2">Quantity</label>
 <input
 type="number"
 min={1}
 max={maxTickets}
 value={ticketCount}
 onChange={(e) => setTicketCount(Math.max(1, Math.min(maxTickets, parseInt(e.target.value) || 1)))}
 className="w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-carnival-red text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-gold"
 />
 </div>
 <div className="flex gap-1.5 pb-0.5">
 {[1, 5, 10].map((n) => (
 <button
 key={n}
 onClick={() => setTicketCount(Math.min(n, maxTickets))}
 className={cn(
"px-3 py-2 text-[10px] font-bold rounded-sm border-2 transition-all",
 ticketCount === n
 ?"bg-ink text-gold border-ink"
 :"bg-paper text-ink/60 border-ink/20 hover:border-ink"
 )}
 >
 {n}×
 </button>
 ))}
 </div>
 </div>

 <div className="mb-4 pt-3 border-t-2 border-ink/10">
 <div className="flex justify-between text-xs text-ink/60 py-1">
 <span className="font-mono">{ticketCount} × {formatUSDC(raffle.ticketPrice)}</span>
 <span className="text-carnival-red font-bold text-base">{formatUSDC(raffle.ticketPrice.muln(ticketCount))}</span>
 </div>
 </div>

 <button
 onClick={handleBuy}
 disabled={buying || maxTickets <= 0}
 className="w-full py-3 text-xs font-bold font-display uppercase tracking-widest text-white bg-carnival-blue rounded-sm border-2 border-ink hover:bg-ink transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {buying ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
 </button>

 {maxTickets <= 0 && (
 <p className="text-carnival-red text-[10px] mt-2">Max tickets per wallet reached ({raffle.maxPerWallet})</p>
 )}
 {txStatus && (
 <p className={cn(
"mt-3 text-[10px] font-medium",
 txStatus.includes('Success') ?"text-gold": txStatus.includes('failed') ?"text-carnival-red":"text-ink/60"
 )}>
 {txStatus}
 </p>
 )}
 {buyError && <p className="text-carnival-red text-[10px] mt-2">{buyError.message}</p>}
 </div>
 )}

 {active && !connected && (
 <div className="bg-surface border-2 border-ink rounded-sm p-5 text-center">
 <p className="text-ink/60 text-xs font-display">Connect your wallet to buy tickets</p>
 </div>
 )}

 {/* Winner Display */}
 {raffle.winner && (
 <div className="bg-gold/10 border-2 border-gold rounded-sm p-5">
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center gap-1 mb-2">
 <Star size={14} className="fill-gold text-gold"/>
 <h2 className="text-sm font-display text-gold uppercase">Winner</h2>
 </div>
 <p className="text-ink text-xs break-all font-mono">{raffle.winner.toBase58()}</p>
 {raffle.winningTicket !== null && (
 <p className="text-gold text-[10px] mt-2 font-mono">Winning ticket: No.{raffle.winningTicket}</p>
 )}
 </div>
 {canClaim && (
 <button
 onClick={handleClaim}
 disabled={claiming}
 className="text-white font-bold font-display py-2 px-4 text-[10px] uppercase bg-carnival-red rounded-sm border-2 border-ink disabled:opacity-50"
 >
 {claiming ? 'Claiming...' : 'Claim Prize'}
 </button>
 )}
 </div>
 {isWinner && !canClaim && raffle.status && 'claimed' in raffle.status && (
 <p className="text-gold text-[10px] mt-3 font-bold">✓ Prize claimed</p>
 )}
 {claimError && <p className="text-carnival-red text-[10px] mt-2">{claimError.message}</p>}
 </div>
 )}

 {/* On-Chain Verification */}
 <div className="bg-surface border-2 border-ink rounded-sm overflow-hidden">
 <div className="bg-ink px-5 py-3">
 <div className="flex items-center gap-2">
 <Shield size={14} className="text-gold"/>
 <h2 className="text-sm font-display text-white uppercase tracking-wider">On-Chain Verification</h2>
 </div>
 </div>
 <div className="p-5 space-y-0">
 <div className="flex justify-between py-2 text-[10px] border-b border-dashed border-ink/15">
 <span className="text-ink/50">Raffle Account</span>
 <span className="text-ink break-all ml-4 text-right font-mono">{rafflePubkey.toBase58()}</span>
 </div>
 <div className="flex justify-between py-2 text-[10px] border-b border-dashed border-ink/15">
 <span className="text-ink/50">Token Mint</span>
 <span className="text-ink break-all ml-4 text-right font-mono">{raffle.tokenMint.toBase58()}</span>
 </div>
 {raffle.randomnessAccount && (
 <div className="flex justify-between py-2 text-[10px] border-b border-dashed border-ink/15">
 <span className="text-ink/50">VRF Account</span>
 <span className="text-ink break-all ml-4 text-right font-mono">{raffle.randomnessAccount.toBase58()}</span>
 </div>
 )}
 {raffle.randomness && (
 <div className="flex justify-between py-2 text-[10px]">
 <span className="text-ink/50">Entropy</span>
 <span className="text-ink ml-4 text-right font-mono">{Buffer.from(raffle.randomness).toString('hex').slice(0, 32)}…</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* ───── Sidebar ───── */}
 <div className="w-full md:w-72 flex-shrink-0 space-y-5">

 {/* About Raffle */}
 <div className="bg-surface border-2 border-ink rounded-sm p-4">
 <h3 className="text-xs font-display text-ink uppercase tracking-wider mb-3 pb-2 border-b-2 border-ink">
 About This Raffle
 </h3>
 <p className="text-ink/60 text-[10px] leading-relaxed mb-4">
 Provably fair on-chain raffle powered by Switchboard VRF. 90% of the pot goes to the winner, verified on Solana.
 </p>
 <div className="flex justify-center mb-2">
 <TicketIllustration size={80} />
 </div>
 </div>

 {/* Raffle Info */}
 <div className="bg-surface border-2 border-ink rounded-sm p-4">
 <h3 className="text-xs font-display text-ink uppercase tracking-wider mb-3 pb-2 border-b-2 border-ink">
 Raffle Info
 </h3>
 <InfoRow label="Status"value={getStatusLabel(raffle.status)} accent={active} />
 <InfoRow label="Ticket Price"value={formatUSDC(raffle.ticketPrice)} />
 <InfoRow label="Total Tickets"value={raffle.totalTickets.toString()} />
 <InfoRow label="Prize Pool"value={formatUSDC(raffle.totalPot)} accent />
 <InfoRow label="Min Pot"value={formatUSDC(raffle.minPot)} />
 <InfoRow label="Max/Wallet"value={raffle.maxPerWallet > 0 ? raffle.maxPerWallet.toString() : '∞'} />
 <div className="flex justify-between items-baseline py-2">
 <span className="text-ink/50 text-xs">{active ? 'Time Left' : 'End Time'}</span>
 <span className="text-xs font-semibold text-ink">
 {active ? formatTimeRemaining(raffle.endTime) : formatDateTime(raffle.endTime)}
 </span>
 </div>
 </div>

 {/* Your Entry */}
 {entry && entry.numTickets > 0 && (
 <div className="bg-gold/10 border-2 border-gold rounded-sm p-4">
 <h3 className="text-xs font-display text-gold uppercase tracking-wider mb-3 pb-2 border-b border-dashed border-gold/40">
 Your Entry
 </h3>
 <InfoRow label="Tickets"value={entry.numTickets.toString()} />
 <InfoRow label="Ticket Range"value={`No.${entry.startTicketIndex}–${entry.startTicketIndex + entry.numTickets - 1}`} />
 {raffle.totalTickets > 0 && (
 <div className="flex justify-between items-baseline py-2">
 <span className="text-ink/50 text-xs">Win Chance</span>
 <span className="text-xs font-semibold text-carnival-red">
 {((entry.numTickets / raffle.totalTickets) * 100).toFixed(1)}%
 </span>
 </div>
 )}
 </div>
 )}

 {/* Fairness */}
 <div className="bg-surface border-2 border-ink rounded-sm p-4">
 <h3 className="text-xs font-display text-ink uppercase tracking-wider mb-3 pb-2 border-b-2 border-ink">
 Fairness
 </h3>
 <InfoRow label="RNG Method"value="Switchboard VRF"/>
 <InfoRow label="Winner Share"value="90%"accent />
 <InfoRow label="Protocol Fee"value="10%"/>
 <div className="flex justify-between items-baseline py-2">
 <span className="text-ink/50 text-xs">Network</span>
 <span className="text-xs font-semibold text-ink">Solana Devnet</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
