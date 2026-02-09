'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffle, useMyEntry } from '@/hooks/useRaffles';
import { useBuyTickets } from '@/hooks/useBuyTickets';
import { useClaimPrize } from '@/hooks/useClaimPrize';
import { getStatusLabel, isActive, isDrawComplete } from '@/lib/idl/rafflebot';
import Link from 'next/link';
import { ChevronLeft, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSDC, formatTimeRemaining, formatDateTime } from '@/lib/format';

type Tab = 'overview' | 'buy' | 'verification';

function DetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink/5 py-2.5">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={cn(
          'text-xs font-semibold',
          accent ? 'text-carnival-red' : 'text-ink'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function RafflePage() {
  const params = useParams();
  const raffleId = params.id as string;

  const [rafflePubkey, setRafflePubkey] = useState<PublicKey | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

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

  const isWinner =
    raffle?.winner && publicKey && raffle.winner.equals(publicKey);
  const canClaim = isWinner && raffle && isDrawComplete(raffle.status);

  if (!rafflePubkey) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-display text-xs text-carnival-red">
          Invalid raffle ID
        </p>
        <Link
          href="/"
          className="mt-4 block text-xs text-ink/60 hover:text-ink"
        >
          ← Back to raffles
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <Ticket
          size={48}
          className="mx-auto mb-4 animate-bounce text-carnival-red"
        />
        <p className="font-display text-xs uppercase tracking-widest text-ink/60">
          Loading raffle...
        </p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-display text-xs text-carnival-red">
          Failed to load raffle
        </p>
        <p className="mt-2 text-[10px] text-ink/60">{error?.message}</p>
        <Link
          href="/"
          className="mt-4 block text-xs text-ink/60 hover:text-ink"
        >
          ← Back to raffles
        </Link>
      </div>
    );
  }

  const active = isActive(raffle.status);
  const progress =
    raffle.minPot.toNumber() > 0
      ? Math.min(
          100,
          (raffle.totalPot.toNumber() / raffle.minPot.toNumber()) * 100
        )
      : 100;
  const maxTickets =
    raffle.maxPerWallet > 0
      ? raffle.maxPerWallet - (entry?.numTickets || 0)
      : 100;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-xs text-ink/60 transition-colors hover:text-carnival-red"
      >
        <ChevronLeft size={14} />
        Back to raffles
      </Link>

      <div className="mb-1 flex items-center gap-3">
        <h1 className="font-display text-2xl text-ink md:text-3xl">
          {raffle.name}
        </h1>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-[10px] font-bold uppercase',
            active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-stone-200 text-stone-500'
          )}
        >
          {getStatusLabel(raffle.status)}
        </span>
      </div>
      <p className="mb-5 font-mono text-[10px] text-ink/40">
        {rafflePubkey.toBase58()}
      </p>

      {/* Stat Bar */}
      <div className="mb-5 flex overflow-hidden rounded-2xl shadow-lg">
        <div
          className={cn(
            'flex-1 p-4 text-center text-white',
            active ? 'bg-carnival-red' : 'bg-stone-500'
          )}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
            {active ? 'Prize Pool' : 'Final Pool'}
          </div>
          <div className="text-xl font-bold">{formatUSDC(raffle.totalPot)}</div>
        </div>
        <div
          className={cn(
            'flex-1 p-4 text-center text-white',
            active ? 'bg-carnival-blue' : 'bg-stone-400'
          )}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
            {active ? 'Ticket Price' : 'Tickets Sold'}
          </div>
          <div className="text-xl font-bold">
            {active
              ? formatUSDC(raffle.ticketPrice)
              : raffle.totalTickets.toLocaleString()}
          </div>
        </div>
        <div
          className={cn(
            'flex-1 p-4 text-center',
            active
              ? 'bg-ink text-white'
              : 'bg-gold text-ink'
          )}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
            {active ? 'Time Left' : 'Winner Payout'}
          </div>
          <div className="text-xl font-bold">
            {active
              ? formatTimeRemaining(raffle.endTime)
              : formatUSDC(raffle.totalPot.muln(9).divn(10))}
          </div>
        </div>
      </div>

      {/* Winner section for ended raffles */}
      {!active && raffle.winner && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="py-6 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Winner
            </div>
            <div className="mt-1 font-display text-xl text-gold">
              {raffle.winner.toBase58().slice(0, 4)}...
              {raffle.winner.toBase58().slice(-4)}
            </div>
            {raffle.winningTicket !== null && (
              <div className="mt-1 text-xs text-muted">
                Winning Ticket:{' '}
                <strong>No.{raffle.winningTicket}</strong>
              </div>
            )}
          </div>
          {canClaim && (
            <div className="border-t border-ink/5 p-4">
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full rounded-xl bg-gold py-3 text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : 'Claim Prize'}
              </button>
              {claimError && (
                <p className="mt-2 text-center text-[10px] text-carnival-red">
                  {claimError.message}
                </p>
              )}
            </div>
          )}
          {isWinner &&
            !canClaim &&
            raffle.status &&
            'claimed' in raffle.status && (
              <div className="border-t border-ink/5 p-4 text-center text-[10px] font-bold text-gold">
                ✓ Prize claimed
              </div>
            )}
        </div>
      )}

      {/* Tabbed Card */}
      {active && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="px-6 pt-5">
            <div className="flex gap-0.5 rounded-xl bg-ink/5 p-1">
              {(
                [
                  { key: 'overview', label: 'Overview' },
                  { key: 'buy', label: 'Buy Tickets' },
                  { key: 'verification', label: 'Verification' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wider transition-all',
                    activeTab === tab.key
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="px-6 pb-6 pt-5">
              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">Progress to minimum</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted">
                  <span>{formatUSDC(raffle.totalPot)} raised</span>
                  <span>{formatUSDC(raffle.minPot)} target</span>
                </div>
              </div>

              <DetailRow label="Tickets Sold" value={raffle.totalTickets.toString()} />
              <DetailRow
                label="Max / Wallet"
                value={raffle.maxPerWallet > 0 ? raffle.maxPerWallet.toString() : '∞'}
              />
              <DetailRow label="Winner Share" value="90%" />
              <DetailRow label="Protocol Fee" value="10%" />
              <DetailRow
                label="Time Left"
                value={formatTimeRemaining(raffle.endTime)}
              />

              {entry && entry.numTickets > 0 && (
                <div className="mt-5 rounded-xl border-l-[3px] border-gold bg-gold/5 p-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gold">
                    Your Entry
                  </div>
                  <div className="flex gap-5 text-[13px]">
                    <div>
                      <span className="text-muted">Tickets:</span>{' '}
                      <strong>{entry.numTickets}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Range:</span>{' '}
                      <strong>
                        No.{entry.startTicketIndex}–
                        {entry.startTicketIndex + entry.numTickets - 1}
                      </strong>
                    </div>
                    {raffle.totalTickets > 0 && (
                      <div>
                        <span className="text-muted">Chance:</span>{' '}
                        <strong className="text-carnival-red">
                          {(
                            (entry.numTickets / raffle.totalTickets) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buy Tickets Tab */}
          {activeTab === 'buy' && (
            <div className="px-6 pb-6 pt-5">
              {connected ? (
                <>
                  <div className="mb-5 text-center">
                    <div className="text-xs text-muted">Ticket Price</div>
                    <div className="font-display text-3xl text-carnival-red">
                      {formatUSDC(raffle.ticketPrice)}
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-center gap-2.5">
                    <span className="text-xs text-muted">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      max={maxTickets}
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(
                          Math.max(
                            1,
                            Math.min(
                              maxTickets,
                              parseInt(e.target.value) || 1
                            )
                          )
                        )
                      }
                      className="w-20 rounded-lg bg-ink/5 px-3 py-2 text-center font-mono text-lg font-bold text-carnival-red focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    {[1, 5, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          setTicketCount(Math.min(n, maxTickets))
                        }
                        className={cn(
                          'rounded-lg px-3 py-2 text-[10px] font-bold transition-all',
                          ticketCount === n
                            ? 'bg-carnival-red text-white'
                            : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                        )}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center justify-between rounded-xl bg-ink/[0.03] px-4 py-3 text-[13px]">
                    <span className="text-muted">
                      {ticketCount} × {formatUSDC(raffle.ticketPrice)}
                    </span>
                    <span className="font-bold">
                      = {formatUSDC(raffle.ticketPrice.muln(ticketCount))}
                    </span>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={buying || maxTickets <= 0}
                    className="w-full rounded-xl bg-carnival-red py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {buying
                      ? 'Processing...'
                      : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                  </button>

                  {maxTickets <= 0 && (
                    <p className="mt-2 text-center text-[10px] text-carnival-red">
                      Max tickets per wallet reached ({raffle.maxPerWallet})
                    </p>
                  )}
                  {txStatus && (
                    <p
                      className={cn(
                        'mt-3 text-center text-[10px] font-medium',
                        txStatus.includes('Success')
                          ? 'text-gold'
                          : txStatus.includes('failed')
                            ? 'text-carnival-red'
                            : 'text-ink/60'
                      )}
                    >
                      {txStatus}
                    </p>
                  )}
                  {buyError && (
                    <p className="mt-2 text-center text-[10px] text-carnival-red">
                      {buyError.message}
                    </p>
                  )}

                  <div className="mt-3 text-center text-[11px] text-muted">
                    Max {raffle.maxPerWallet > 0 ? raffle.maxPerWallet : '∞'}{' '}
                    tickets per wallet
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-display text-sm text-ink/60">
                    Connect your wallet to buy tickets
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="px-6 pb-6 pt-5">
              <div className="mb-5">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Fairness
                </div>
                <DetailRow label="RNG Method" value="Switchboard VRF" />
                <DetailRow label="Winner Share" value="90%" accent />
                <DetailRow label="Protocol Fee" value="10%" />
                <DetailRow label="Network" value="Solana Devnet" />
              </div>

              <div className="rounded-xl bg-ink p-4 text-white">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gold">
                  On-Chain Accounts
                </div>
                <div className="flex flex-col gap-2.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Raffle Account</span>
                    <span className="font-mono text-white/80">
                      {rafflePubkey.toBase58().slice(0, 8)}...
                      {rafflePubkey.toBase58().slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Token Mint</span>
                    <span className="font-mono text-white/80">
                      {raffle.tokenMint.toBase58().slice(0, 8)}...
                      {raffle.tokenMint.toBase58().slice(-4)}
                    </span>
                  </div>
                  {raffle.randomnessAccount && (
                    <div className="flex justify-between">
                      <span className="text-white/40">VRF Account</span>
                      <span className="font-mono text-white/80">
                        {raffle.randomnessAccount.toBase58().slice(0, 8)}...
                        {raffle.randomnessAccount.toBase58().slice(-4)}
                      </span>
                    </div>
                  )}
                  {raffle.randomness && (
                    <div className="flex justify-between">
                      <span className="text-white/40">Entropy</span>
                      <span className="font-mono text-white/80">
                        {Buffer.from(raffle.randomness)
                          .toString('hex')
                          .slice(0, 16)}
                        …
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ended — show details in a simple card */}
      {!active && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="px-6 py-5">
            <DetailRow label="Prize Pool" value={formatUSDC(raffle.totalPot)} accent />
            <DetailRow label="Ticket Price" value={formatUSDC(raffle.ticketPrice)} />
            <DetailRow label="Tickets Sold" value={raffle.totalTickets.toString()} />
            <DetailRow
              label="Max / Wallet"
              value={
                raffle.maxPerWallet > 0 ? raffle.maxPerWallet.toString() : '∞'
              }
            />
            <DetailRow label="Winner Share" value="90%" accent />
            <DetailRow label="Ended" value={formatDateTime(raffle.endTime)} />
          </div>

          <div className="border-t border-ink/5 bg-ink p-4 text-white">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gold">
              On-Chain Verification
            </div>
            <div className="flex flex-col gap-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/40">Raffle</span>
                <span className="font-mono text-white/80">
                  {rafflePubkey.toBase58().slice(0, 8)}...
                  {rafflePubkey.toBase58().slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Token Mint</span>
                <span className="font-mono text-white/80">
                  {raffle.tokenMint.toBase58().slice(0, 8)}...
                  {raffle.tokenMint.toBase58().slice(-4)}
                </span>
              </div>
              {raffle.randomnessAccount && (
                <div className="flex justify-between">
                  <span className="text-white/40">VRF</span>
                  <span className="font-mono text-white/80">
                    {raffle.randomnessAccount.toBase58().slice(0, 8)}...
                    {raffle.randomnessAccount.toBase58().slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
