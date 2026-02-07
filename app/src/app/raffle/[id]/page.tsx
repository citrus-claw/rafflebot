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

function formatUSDC(amount: BN): string {
  const value = amount.toNumber() / 1_000_000;
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatTimeRemaining(endTime: BN): string {
  const now = Math.floor(Date.now() / 1000);
  const end = endTime.toNumber();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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
      setTxStatus(`🎉 Success! Tx: ${sig.slice(0, 8)}...`);
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
      setTxStatus(`🏆 Prize claimed! Tx: ${sig.slice(0, 8)}...`);
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
        <div className="text-5xl mb-4">🎪</div>
        <p className="text-carnival-red font-medium text-lg">Invalid raffle ID</p>
        <Link href="/" className="text-carnival-amber hover:underline mt-4 block">
          ← Back to raffles
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-carnival-amber border-t-transparent rounded-full mx-auto"></div>
        <p className="text-carnival-cream/40 mt-4">Loading raffle...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-carnival-red font-medium">Failed to load raffle</p>
        <p className="text-carnival-cream/30 text-sm mt-2">{error?.message}</p>
        <Link href="/" className="text-carnival-amber hover:underline mt-4 block">
          ← Back to raffles
        </Link>
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
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-carnival-cream/40 hover:text-carnival-amber transition-colors mb-6 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to raffles
      </Link>

      {/* Main ticket card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-carnival-surface to-carnival-dark border border-carnival-border">
        {/* Top carnival stripe */}
        <div className="h-2 bg-carnival-gradient" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-carnival-cream mb-1">{raffle.name}</h1>
              <p className="text-carnival-cream/30 text-xs font-mono">
                {rafflePubkey.toBase58()}
              </p>
            </div>
            <span className={`
              px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
              ${active 
                ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                : 'bg-carnival-border/50 text-carnival-cream/40'}
            `}>
              {getStatusLabel(raffle.status)}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Prize Pool', value: formatUSDC(raffle.totalPot), accent: true },
              { label: 'Ticket Price', value: formatUSDC(raffle.ticketPrice), accent: false },
              { label: 'Tickets Sold', value: raffle.totalTickets.toString(), accent: false },
              { label: active ? 'Time Left' : 'Status', value: active ? formatTimeRemaining(raffle.endTime) : getStatusLabel(raffle.status), accent: false },
            ].map((stat) => (
              <div key={stat.label} className="bg-carnival-dark/60 rounded-xl p-4 border border-carnival-border">
                <p className="text-carnival-cream/40 text-[11px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.accent ? 'text-carnival-amber' : 'text-carnival-cream'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-carnival-cream/40 mb-2">
              <span>Minimum pot progress</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-carnival-dark rounded-full overflow-hidden border border-carnival-border">
              <div 
                className="h-full bg-gradient-to-r from-carnival-red via-carnival-orange to-carnival-amber transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-carnival-cream/25 mt-2 font-mono">
              {formatUSDC(raffle.totalPot)} / {formatUSDC(raffle.minPot)} minimum
            </p>
          </div>

          {/* My Tickets */}
          {entry && entry.numTickets > 0 && (
            <div className="bg-carnival-amber/10 border border-carnival-amber/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎟️</span>
                <p className="text-carnival-amber font-bold">Your Tickets</p>
              </div>
              <p className="text-carnival-cream text-lg font-mono">
                {entry.numTickets} ticket{entry.numTickets > 1 ? 's' : ''} 
                <span className="text-carnival-cream/40 text-sm ml-2">
                  (#{entry.startTicketIndex} – #{entry.startTicketIndex + entry.numTickets - 1})
                </span>
              </p>
            </div>
          )}

          {/* Buy Section */}
          {active && connected && (
            <div className="border-t border-carnival-border pt-6">
              <h2 className="font-ticket text-xl text-carnival-amber mb-4">Buy Tickets</h2>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-carnival-cream/40 text-sm block mb-2">Number of tickets</label>
                  <input
                    type="number"
                    min={1}
                    max={maxTickets}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.max(1, Math.min(maxTickets, parseInt(e.target.value) || 1)))}
                    className="w-full bg-carnival-dark border border-carnival-border rounded-xl px-4 py-3 text-carnival-amber font-mono text-lg font-bold focus:border-carnival-amber/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleBuy}
                  disabled={buying || maxTickets <= 0}
                  className="bg-gradient-to-r from-carnival-red to-carnival-orange text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {buying ? 'Buying...' : `🎟️ ${formatUSDC(raffle.ticketPrice.muln(ticketCount))}`}
                </button>
              </div>

              {maxTickets <= 0 && (
                <p className="text-carnival-amber text-sm mt-2">
                  You've reached the maximum tickets per wallet ({raffle.maxPerWallet})
                </p>
              )}

              {txStatus && (
                <p className={`mt-4 text-sm font-medium ${
                  txStatus.includes('Success') || txStatus.includes('🎉') ? 'text-green-400' 
                  : txStatus.includes('failed') ? 'text-carnival-red' 
                  : 'text-carnival-cream/50'
                }`}>
                  {txStatus}
                </p>
              )}

              {buyError && (
                <p className="text-carnival-red text-sm mt-2">{buyError.message}</p>
              )}
            </div>
          )}

          {active && !connected && (
            <div className="border-t border-carnival-border pt-6 text-center">
              <p className="text-carnival-cream/40">Connect your wallet to buy tickets 🎟️</p>
            </div>
          )}

          {/* Winner Display */}
          {raffle.winner && (
            <div className="mt-6 p-5 bg-carnival-gold/10 rounded-xl border border-carnival-gold/20 glow-gold">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-carnival-gold font-bold text-lg flex items-center gap-2">
                    🏆 Winner
                  </p>
                  <p className="text-carnival-cream font-mono text-sm break-all mt-1">
                    {raffle.winner.toBase58()}
                  </p>
                  {raffle.winningTicket !== null && (
                    <p className="text-carnival-amber text-sm mt-2 font-mono">
                      Winning ticket: #{raffle.winningTicket}
                    </p>
                  )}
                </div>
                
                {canClaim && (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="bg-gradient-to-r from-carnival-amber to-carnival-gold text-carnival-dark font-bold py-3 px-6 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 animate-glow-pulse"
                  >
                    {claiming ? 'Claiming...' : '💰 Claim Prize'}
                  </button>
                )}
              </div>
              
              {isWinner && !canClaim && raffle.status && 'claimed' in raffle.status && (
                <p className="text-green-400 text-sm mt-3 font-medium">✅ Prize claimed!</p>
              )}
              
              {claimError && (
                <p className="text-carnival-red text-sm mt-2">{claimError.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom stripe */}
        <div className="h-2 bg-carnival-gradient" />
      </div>

      {/* Verification info */}
      <div className="mt-6 bg-carnival-surface/50 rounded-xl p-5 border border-carnival-border">
        <p className="text-carnival-cream/30 text-[11px] font-bold uppercase tracking-widest mb-3">On-Chain Verification</p>
        <div className="space-y-1.5 text-xs text-carnival-cream/25 font-mono">
          <p>Raffle: {rafflePubkey.toBase58()}</p>
          <p>Token: {raffle.tokenMint.toBase58()}</p>
          {raffle.randomnessAccount && (
            <p>VRF: {raffle.randomnessAccount.toBase58()}</p>
          )}
          {raffle.randomness && (
            <p>Entropy: {Buffer.from(raffle.randomness).toString('hex').slice(0, 32)}…</p>
          )}
        </div>
      </div>
    </div>
  );
}
