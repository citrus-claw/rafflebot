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
      setTxStatus(`🎉 Prize claimed! Tx: ${sig.slice(0, 8)}...`);
      refetch();
    } else {
      setTxStatus('Claim failed');
    }
  };

  // Check if current user is the winner
  const isWinner = raffle?.winner && publicKey && raffle.winner.equals(publicKey);
  const canClaim = isWinner && raffle && isDrawComplete(raffle.status);

  if (!rafflePubkey) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Invalid raffle ID</p>
        <Link href="/" className="text-purple-400 hover:underline mt-4 block">
          ← Back to raffles
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading raffle...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load raffle</p>
        <p className="text-gray-500 text-sm mt-2">{error?.message}</p>
        <Link href="/" className="text-purple-400 hover:underline mt-4 block">
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
      <Link href="/" className="text-purple-400 hover:underline mb-6 block">
        ← Back to raffles
      </Link>

      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-white">{raffle.name}</h1>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
          `}>
            {getStatusLabel(raffle.status)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Current Pot</p>
            <p className="text-2xl font-bold text-white">{formatUSDC(raffle.totalPot)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Ticket Price</p>
            <p className="text-2xl font-bold text-white">{formatUSDC(raffle.ticketPrice)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Tickets Sold</p>
            <p className="text-2xl font-bold text-white">{raffle.totalTickets}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{active ? 'Time Left' : 'Ended'}</p>
            <p className="text-2xl font-bold text-white">{formatTimeRemaining(raffle.endTime)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Min pot progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {formatUSDC(raffle.totalPot)} / {formatUSDC(raffle.minPot)} minimum
          </p>
        </div>

        {/* My Tickets */}
        {entry && entry.numTickets > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
            <p className="text-purple-400 font-medium">🎟️ Your Tickets</p>
            <p className="text-white text-lg">
              {entry.numTickets} ticket{entry.numTickets > 1 ? 's' : ''} 
              <span className="text-gray-400 text-sm ml-2">
                (#{entry.startTicketIndex} - #{entry.startTicketIndex + entry.numTickets - 1})
              </span>
            </p>
          </div>
        )}

        {/* Buy Section */}
        {active && connected && (
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Buy Tickets</h2>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-gray-400 text-sm block mb-2">Number of tickets</label>
                <input
                  type="number"
                  min={1}
                  max={maxTickets}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Math.min(maxTickets, parseInt(e.target.value) || 1)))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleBuy}
                disabled={buying || maxTickets <= 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buying ? 'Buying...' : `Buy for ${formatUSDC(raffle.ticketPrice.muln(ticketCount))}`}
              </button>
            </div>

            {maxTickets <= 0 && (
              <p className="text-yellow-400 text-sm mt-2">
                You've reached the maximum tickets per wallet ({raffle.maxPerWallet})
              </p>
            )}

            {txStatus && (
              <p className={`mt-4 text-sm ${txStatus.includes('Success') ? 'text-green-400' : txStatus.includes('failed') ? 'text-red-400' : 'text-gray-400'}`}>
                {txStatus}
              </p>
            )}

            {buyError && (
              <p className="text-red-400 text-sm mt-2">{buyError.message}</p>
            )}
          </div>
        )}

        {active && !connected && (
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400">Connect your wallet to buy tickets</p>
          </div>
        )}

        {/* Winner Display */}
        {raffle.winner && (
          <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-400 font-medium">🏆 Winner</p>
                <p className="text-white font-mono text-sm break-all">
                  {raffle.winner.toBase58()}
                </p>
                {raffle.winningTicket !== null && (
                  <p className="text-yellow-300 text-sm mt-1">
                    Winning ticket: #{raffle.winningTicket}
                  </p>
                )}
              </div>
              
              {/* Claim button for winner */}
              {canClaim && (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {claiming ? 'Claiming...' : '💰 Claim Prize'}
                </button>
              )}
            </div>
            
            {isWinner && !canClaim && raffle.status && 'claimed' in raffle.status && (
              <p className="text-green-400 text-sm mt-2">✅ Prize claimed!</p>
            )}
            
            {claimError && (
              <p className="text-red-400 text-sm mt-2">{claimError.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Verification info */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">On-Chain Details</p>
        <div className="space-y-1 text-xs text-gray-600 font-mono">
          <p>Raffle: {rafflePubkey.toBase58()}</p>
          <p>Token: {raffle.tokenMint.toBase58()}</p>
          {raffle.randomnessAccount && (
            <p>VRF Account: {raffle.randomnessAccount.toBase58()}</p>
          )}
          {raffle.randomness && (
            <p>Randomness: {Buffer.from(raffle.randomness).toString('hex').slice(0, 32)}...</p>
          )}
        </div>
      </div>
    </div>
  );
}
