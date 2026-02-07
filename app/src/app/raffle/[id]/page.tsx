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
        <p className="text-accent-red font-medium text-lg">Invalid raffle ID</p>
        <Link href="/" className="text-accent-gold hover:underline mt-4 block">
          ← Back to raffles
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-accent-red border-t-transparent rounded-full mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading raffle...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-accent-red font-medium">Failed to load raffle</p>
        <p className="text-text-secondary text-sm mt-2">{error?.message}</p>
        <Link href="/" className="text-accent-gold hover:underline mt-4 block">
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
      <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors mb-6 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to raffles
      </Link>

      {/* Main ticket card */}
      <div className="relative overflow-hidden rounded-lg bg-white border-2 border-border-dark shadow-[6px_6px_0_#E0DBD2]">
        {/* Top carnival stripe */}
        <div className="h-2 carnival-stripe-top" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-text-primary font-bold mb-1">{raffle.name}</h1>
              <p className="text-text-secondary text-xs font-mono">
                №{rafflePubkey.toBase58()}
              </p>
            </div>
            <span className={`
              px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border-2
              ${active 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-text-secondary border-border-light'}
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
              <div key={stat.label} className="bg-cream rounded-lg p-4 border-2 border-border-light">
                <p className="text-text-secondary text-[11px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.accent ? 'text-accent-red' : 'text-text-primary'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Minimum pot progress</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-cream rounded-full overflow-hidden border-2 border-border-light">
              <div 
                className="h-full bg-accent-red transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2 font-mono">
              {formatUSDC(raffle.totalPot)} / {formatUSDC(raffle.minPot)} minimum
            </p>
          </div>

          {/* My Tickets */}
          {entry && entry.numTickets > 0 && (
            <div className="bg-accent-gold/10 border-2 border-accent-gold/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎟️</span>
                <p className="text-accent-gold font-bold font-display">Your Tickets</p>
              </div>
              <p className="text-text-primary text-lg font-mono">
                {entry.numTickets} ticket{entry.numTickets > 1 ? 's' : ''} 
                <span className="text-text-secondary text-sm ml-2">
                  (№{entry.startTicketIndex} – №{entry.startTicketIndex + entry.numTickets - 1})
                </span>
              </p>
            </div>
          )}

          {/* Buy Section */}
          {active && connected && (
            <div className="border-t-2 border-dashed border-border-light pt-6">
              <h2 className="font-display text-xl text-text-primary font-bold mb-4">Buy Tickets</h2>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-text-secondary text-sm block mb-2">Number of tickets</label>
                  <input
                    type="number"
                    min={1}
                    max={maxTickets}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.max(1, Math.min(maxTickets, parseInt(e.target.value) || 1)))}
                    className="w-full bg-white border-2 border-border-dark rounded-lg px-4 py-3 text-accent-red font-mono text-lg font-bold focus:border-accent-red focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleBuy}
                  disabled={buying || maxTickets <= 0}
                  className="bg-accent-red text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-border-dark shadow-[3px_3px_0_#2A2A2A]"
                >
                  {buying ? 'Buying...' : `🎟️ ${formatUSDC(raffle.ticketPrice.muln(ticketCount))}`}
                </button>
              </div>

              {maxTickets <= 0 && (
                <p className="text-accent-red text-sm mt-2">
                  You&apos;ve reached the maximum tickets per wallet ({raffle.maxPerWallet})
                </p>
              )}

              {txStatus && (
                <p className={`mt-4 text-sm font-medium ${
                  txStatus.includes('Success') || txStatus.includes('🎉') ? 'text-green-600' 
                  : txStatus.includes('failed') ? 'text-accent-red' 
                  : 'text-text-secondary'
                }`}>
                  {txStatus}
                </p>
              )}

              {buyError && (
                <p className="text-accent-red text-sm mt-2">{buyError.message}</p>
              )}
            </div>
          )}

          {active && !connected && (
            <div className="border-t-2 border-dashed border-border-light pt-6 text-center">
              <p className="text-text-secondary">Connect your wallet to buy tickets 🎟️</p>
            </div>
          )}

          {/* Winner Display */}
          {raffle.winner && (
            <div className="mt-6 p-5 bg-accent-gold/10 rounded-lg border-2 border-accent-gold/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-accent-gold font-bold text-lg flex items-center gap-2 font-display">
                    🏆 Winner
                  </p>
                  <p className="text-text-primary font-mono text-sm break-all mt-1">
                    {raffle.winner.toBase58()}
                  </p>
                  {raffle.winningTicket !== null && (
                    <p className="text-accent-gold text-sm mt-2 font-mono">
                      Winning ticket: №{raffle.winningTicket}
                    </p>
                  )}
                </div>
                
                {canClaim && (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="bg-accent-gold text-white font-bold py-3 px-6 rounded-lg transition-all hover:bg-accent-gold/90 disabled:opacity-50 border-2 border-border-dark shadow-[3px_3px_0_#2A2A2A]"
                  >
                    {claiming ? 'Claiming...' : '💰 Claim Prize'}
                  </button>
                )}
              </div>
              
              {isWinner && !canClaim && raffle.status && 'claimed' in raffle.status && (
                <p className="text-green-600 text-sm mt-3 font-medium">✅ Prize claimed!</p>
              )}
              
              {claimError && (
                <p className="text-accent-red text-sm mt-2">{claimError.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom stripe */}
        <div className="h-2 carnival-stripe-top" />
      </div>

      {/* Verification info */}
      <div className="mt-6 bg-white rounded-lg p-5 border-2 border-border-light">
        <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-3">On-Chain Verification</p>
        <div className="space-y-1.5 text-xs text-text-secondary font-mono">
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
