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
import { TicketIllustration } from '@/components/illustrations/TicketIllustration';

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

function formatDate(timestamp: BN): string {
  return new Date(timestamp.toNumber() * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* Key-value row for sidebar, StockTaper style */
function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-2" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
      <span className="text-text-secondary text-xs">{label}</span>
      <span className={`text-xs font-semibold ${accent ? 'text-accent-red' : 'text-text-primary'}`}>{value}</span>
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
        <p className="text-accent-red text-xs">Invalid raffle ID</p>
        <Link href="/" className="text-text-secondary hover:text-text-primary text-xs mt-4 block">← Back to raffles</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-5 w-5 rounded-full mx-auto" style={{ border: '1.6px solid #393939', borderTopColor: 'transparent' }} />
        <p className="text-text-secondary text-xs mt-4">Loading raffle...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="text-center py-16">
        <p className="text-accent-red text-xs">Failed to load raffle</p>
        <p className="text-text-secondary text-[10px] mt-2">{error?.message}</p>
        <Link href="/" className="text-text-secondary hover:text-text-primary text-xs mt-4 block">← Back to raffles</Link>
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
      <Link href="/" className="text-text-secondary hover:text-text-primary text-xs mb-4 inline-block">← Back to raffles</Link>

      {/* Title row — like TSM header */}
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl md:text-2xl text-text-primary font-bold">{raffle.name}</h1>
        <span
          className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
          style={{
            color: active ? '#C41E3A' : '#8B8B6E',
            background: active ? '#C41E3A15' : '#8B8B6E15',
            border: `0.8px solid ${active ? '#C41E3A40' : '#8B8B6E40'}`,
          }}
        >
          {getStatusLabel(raffle.status)}
        </span>
      </div>
      <p className="text-text-secondary text-[10px] mb-6">№{rafflePubkey.toBase58()}</p>

      {/* Two-column layout like StockTaper TSM page */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* ───── Main Column (left, ~70%) ───── */}
        <div className="flex-1 min-w-0">

          {/* Prize Pool Progress — like the stock chart area */}
          <div className="mb-6 p-5" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Total Prize Pool</p>
                <p className="text-accent-red font-bold text-3xl">{formatUSDC(raffle.totalPot)}</p>
              </div>
              <div className="text-right">
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Min Target</p>
                <p className="text-text-primary font-semibold text-sm">{formatUSDC(raffle.minPot)}</p>
              </div>
            </div>
            {/* Progress bar — salmon/coral like StockTaper charts */}
            <div className="h-6 bg-border-light rounded overflow-hidden mb-2" style={{ border: '0.8px solid #D4D0C8' }}>
              <div
                className="h-full rounded"
                style={{ width: `${progress}%`, background: '#E8927C' }}
              />
            </div>
            <p className="text-text-secondary text-[10px]">{Math.round(progress)}% of minimum pot reached</p>
          </div>

          {/* Raffle Stats table — like Income Statement */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-text-primary font-bold">Raffle Details</h2>
            </div>
            <div style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              {/* Table header */}
              <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-bold" style={{ borderBottom: '1.6px solid #393939' }}>
                <div>Metric</div>
                <div className="text-right">Value</div>
                <div className="text-right">Metric</div>
                <div className="text-right">Value</div>
              </div>
              {/* Row 1 */}
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                <div className="text-text-secondary text-xs">Prize Pool</div>
                <div className="text-right text-xs font-semibold text-accent-red">{formatUSDC(raffle.totalPot)}</div>
                <div className="text-text-secondary text-xs">Ticket Price</div>
                <div className="text-right text-xs font-semibold">{formatUSDC(raffle.ticketPrice)}</div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                <div className="text-text-secondary text-xs">Tickets Sold</div>
                <div className="text-right text-xs font-semibold">{raffle.totalTickets}</div>
                <div className="text-text-secondary text-xs">Max/Wallet</div>
                <div className="text-right text-xs font-semibold">{raffle.maxPerWallet || '∞'}</div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5">
                <div className="text-text-secondary text-xs">Winner Share</div>
                <div className="text-right text-xs font-semibold text-accent-red">90%</div>
                <div className="text-text-secondary text-xs">{active ? 'Time Left' : 'Ended'}</div>
                <div className="text-right text-xs font-semibold">{active ? formatTimeRemaining(raffle.endTime) : formatDate(raffle.endTime)}</div>
              </div>
            </div>
          </div>

          {/* Buy Tickets Section */}
          {active && connected && (
            <div className="mb-6 p-5" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              <h2 className="text-sm text-text-primary font-bold mb-4">Buy Tickets</h2>
              
              <div className="flex gap-3 items-end mb-3">
                <div className="flex-1">
                  <label className="text-text-secondary text-[10px] uppercase tracking-wider block mb-2">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={maxTickets}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.max(1, Math.min(maxTickets, parseInt(e.target.value) || 1)))}
                    className="w-full bg-transparent px-3 py-2 text-accent-red text-lg font-bold focus:outline-none"
                    style={{ border: '1.6px solid #393939', borderRadius: '6px' }}
                  />
                </div>
                <div className="flex gap-1.5 pb-0.5">
                  {[1, 5, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTicketCount(Math.min(n, maxTickets))}
                      className={`px-2.5 py-2 text-[10px] font-bold ${ticketCount === n ? 'text-cream' : 'text-text-secondary'}`}
                      style={{
                        background: ticketCount === n ? '#393939' : 'transparent',
                        border: ticketCount === n ? '1.6px solid #393939' : '0.8px dashed #393939',
                        borderRadius: '6px',
                      }}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost summary like a mini table */}
              <div className="mb-4" style={{ borderTop: '0.8px dashed #D4D0C8', paddingTop: '12px' }}>
                <div className="flex justify-between text-xs text-text-secondary py-1">
                  <span>{ticketCount} × {formatUSDC(raffle.ticketPrice)}</span>
                  <span className="text-text-primary font-bold text-base text-accent-red">{formatUSDC(raffle.ticketPrice.muln(ticketCount))}</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={buying || maxTickets <= 0}
                className="w-full py-3 text-xs font-bold text-cream disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#393939', border: '2.4px solid #393939', borderRadius: '6px' }}
              >
                {buying ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
              </button>

              {maxTickets <= 0 && (
                <p className="text-accent-red text-[10px] mt-2">Max tickets per wallet reached ({raffle.maxPerWallet})</p>
              )}
              {txStatus && (
                <p className={`mt-3 text-[10px] font-medium ${txStatus.includes('Success') ? 'text-accent-gold' : txStatus.includes('failed') ? 'text-accent-red' : 'text-text-secondary'}`}>
                  {txStatus}
                </p>
              )}
              {buyError && <p className="text-accent-red text-[10px] mt-2">{buyError.message}</p>}
            </div>
          )}

          {active && !connected && (
            <div className="mb-6 p-5 text-center" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
              <p className="text-text-secondary text-xs">Connect your wallet to buy tickets</p>
            </div>
          )}

          {/* Winner Display */}
          {raffle.winner && (
            <div className="mb-6 p-5" style={{ border: '1.6px solid #B8860B', borderRadius: '6px', background: '#B8860B08' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm text-accent-gold font-bold mb-2">Winner</h2>
                  <p className="text-text-primary text-xs break-all">{raffle.winner.toBase58()}</p>
                  {raffle.winningTicket !== null && (
                    <p className="text-accent-gold text-[10px] mt-2">Winning ticket: №{raffle.winningTicket}</p>
                  )}
                </div>
                {canClaim && (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="text-cream font-bold py-2 px-4 text-[10px] disabled:opacity-50"
                    style={{ background: '#393939', border: '2.4px solid #393939', borderRadius: '6px' }}
                  >
                    {claiming ? 'Claiming...' : 'Claim Prize'}
                  </button>
                )}
              </div>
              {isWinner && !canClaim && raffle.status && 'claimed' in raffle.status && (
                <p className="text-accent-gold text-[10px] mt-3">✓ Prize claimed</p>
              )}
              {claimError && <p className="text-accent-red text-[10px] mt-2">{claimError.message}</p>}
            </div>
          )}

          {/* On-Chain Verification — like the 5-Year Trend Analysis section */}
          <div className="p-5" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <h2 className="text-sm text-text-primary font-bold mb-3">On-Chain Verification</h2>
            <div className="space-y-0">
              <div className="flex justify-between py-2 text-[10px]" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                <span className="text-text-secondary">Raffle Account</span>
                <span className="text-text-primary break-all ml-4 text-right">{rafflePubkey.toBase58()}</span>
              </div>
              <div className="flex justify-between py-2 text-[10px]" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                <span className="text-text-secondary">Token Mint</span>
                <span className="text-text-primary break-all ml-4 text-right">{raffle.tokenMint.toBase58()}</span>
              </div>
              {raffle.randomnessAccount && (
                <div className="flex justify-between py-2 text-[10px]" style={{ borderBottom: '0.8px dashed #D4D0C8' }}>
                  <span className="text-text-secondary">VRF Account</span>
                  <span className="text-text-primary break-all ml-4 text-right">{raffle.randomnessAccount.toBase58()}</span>
                </div>
              )}
              {raffle.randomness && (
                <div className="flex justify-between py-2 text-[10px]">
                  <span className="text-text-secondary">Entropy</span>
                  <span className="text-text-primary ml-4 text-right">{Buffer.from(raffle.randomness).toString('hex').slice(0, 32)}…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───── Sidebar (right, ~30%) — like StockTaper's About/Industry sidebar ───── */}
        <div className="w-full md:w-72 flex-shrink-0">

          {/* About Raffle — like "About Taiwan Semiconductor" */}
          <div className="mb-5 p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <h3 className="text-xs text-text-primary font-bold mb-3" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '8px' }}>
              About This Raffle
            </h3>
            <p className="text-text-secondary text-[10px] leading-relaxed mb-4">
              Provably fair on-chain raffle powered by Switchboard VRF. 90% of the pot goes to the winner, verified on Solana.
            </p>
            <div className="flex justify-center mb-2">
              <TicketIllustration size={80} />
            </div>
          </div>

          {/* Key Stats — like Industry/Sector/IPO sidebar */}
          <div className="mb-5 p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <h3 className="text-xs text-text-primary font-bold mb-3" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '8px' }}>
              Raffle Info
            </h3>
            <InfoRow label="Status" value={getStatusLabel(raffle.status)} accent={active} />
            <InfoRow label="Ticket Price" value={formatUSDC(raffle.ticketPrice)} />
            <InfoRow label="Total Tickets" value={raffle.totalTickets.toString()} />
            <InfoRow label="Prize Pool" value={formatUSDC(raffle.totalPot)} accent />
            <InfoRow label="Min Pot" value={formatUSDC(raffle.minPot)} />
            <InfoRow label="Max/Wallet" value={raffle.maxPerWallet > 0 ? raffle.maxPerWallet.toString() : '∞'} />
            <div className="flex justify-between items-baseline py-2">
              <span className="text-text-secondary text-xs">{active ? 'Time Left' : 'End Time'}</span>
              <span className="text-xs font-semibold text-text-primary">
                {active ? formatTimeRemaining(raffle.endTime) : formatDate(raffle.endTime)}
              </span>
            </div>
          </div>

          {/* Your Entry — like Compensation Summary */}
          {entry && entry.numTickets > 0 && (
            <div className="mb-5 p-4" style={{ border: '1.6px solid #B8860B', borderRadius: '6px', background: '#B8860B08' }}>
              <h3 className="text-xs text-accent-gold font-bold mb-3" style={{ borderBottom: '0.8px dashed #B8860B40', paddingBottom: '8px' }}>
                Your Entry
              </h3>
              <InfoRow label="Tickets" value={entry.numTickets.toString()} />
              <InfoRow label="Ticket Range" value={`№${entry.startTicketIndex}–${entry.startTicketIndex + entry.numTickets - 1}`} />
              {raffle.totalTickets > 0 && (
                <div className="flex justify-between items-baseline py-2">
                  <span className="text-text-secondary text-xs">Win Chance</span>
                  <span className="text-xs font-semibold text-accent-red">
                    {((entry.numTickets / raffle.totalTickets) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Randomness — like Ratings Snapshot */}
          <div className="p-4" style={{ border: '0.8px dashed #393939', borderRadius: '6px' }}>
            <h3 className="text-xs text-text-primary font-bold mb-3" style={{ borderBottom: '1.6px solid #393939', paddingBottom: '8px' }}>
              Fairness
            </h3>
            <InfoRow label="RNG Method" value="Switchboard VRF" />
            <InfoRow label="Winner Share" value="90%" accent />
            <InfoRow label="Protocol Fee" value="10%" />
            <div className="flex justify-between items-baseline py-2">
              <span className="text-text-secondary text-xs">Network</span>
              <span className="text-xs font-semibold text-text-primary">Solana Devnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
