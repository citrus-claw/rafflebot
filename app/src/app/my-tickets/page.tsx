'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import Link from 'next/link';
import { IDL, PROGRAM_ID, Entry, Raffle, isActive, getStatusLabel } from '@/lib/idl/rafflebot';

interface TicketEntry {
  entryPubkey: PublicKey;
  entry: Entry;
  raffle: Raffle;
  rafflePubkey: PublicKey;
}

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

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Soon';
}

export default function MyTicketsPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [entries, setEntries] = useState<TicketEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEntries() {
      if (!publicKey) {
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Create read-only provider
        const dummyWallet = {
          publicKey: PublicKey.default,
          signTransaction: async () => { throw new Error('Read-only'); },
          signAllTransactions: async () => { throw new Error('Read-only'); },
        };
        const provider = new AnchorProvider(connection, dummyWallet as any, {
          commitment: 'confirmed',
        });
        const program = new Program(IDL, provider);

        // Fetch all entries for this user
        // @ts-ignore
        const allEntries = await program.account.entry.all([
          {
            memcmp: {
              offset: 8 + 32, // After discriminator + raffle pubkey
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        // Fetch corresponding raffles
        const ticketEntries: TicketEntry[] = [];
        
        for (const e of allEntries) {
          try {
            // @ts-ignore
            const raffle = await program.account.raffle.fetch(e.account.raffle);
            ticketEntries.push({
              entryPubkey: e.publicKey,
              entry: e.account as Entry,
              raffle: raffle as Raffle,
              rafflePubkey: e.account.raffle,
            });
          } catch {
            // Raffle might not exist anymore
          }
        }

        // Sort by raffle end time (active first)
        ticketEntries.sort((a, b) => {
          const aActive = isActive(a.raffle.status);
          const bActive = isActive(b.raffle.status);
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return b.raffle.endTime.toNumber() - a.raffle.endTime.toNumber();
        });

        setEntries(ticketEntries);
      } catch (e) {
        console.error('Failed to fetch entries:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchMyEntries();
  }, [publicKey, connection]);

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">My Tickets</h1>
        <p className="text-gray-400">Connect your wallet to see your tickets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading your tickets...</p>
      </div>
    );
  }

  const activeEntries = entries.filter(e => isActive(e.raffle.status));
  const pastEntries = entries.filter(e => !isActive(e.raffle.status));

  // Calculate total stats
  const totalTickets = entries.reduce((sum, e) => sum + e.entry.numTickets, 0);
  const totalSpent = entries.reduce((sum, e) => 
    sum + (e.entry.numTickets * e.raffle.ticketPrice.toNumber()), 0
  ) / 1_000_000;
  const wins = entries.filter(e => 
    e.raffle.winner && e.raffle.winner.equals(publicKey!)
  ).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
      <p className="text-gray-400 mb-8">Track your entries across all raffles</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Tickets</p>
          <p className="text-2xl font-bold text-white">{totalTickets}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Wins</p>
          <p className="text-2xl font-bold text-yellow-400">{wins} 🏆</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-gray-400">You haven't entered any raffles yet</p>
          <Link href="/" className="text-purple-400 hover:underline mt-2 block">
            Browse active raffles →
          </Link>
        </div>
      ) : (
        <>
          {/* Active Entries */}
          {activeEntries.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Active Raffles</h2>
              <div className="space-y-4">
                {activeEntries.map((e) => (
                  <Link 
                    key={e.entryPubkey.toBase58()}
                    href={`/raffle/${e.rafflePubkey.toBase58()}`}
                    className="block bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{e.raffle.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {e.entry.numTickets} ticket{e.entry.numTickets > 1 ? 's' : ''} 
                          <span className="text-gray-500"> • </span>
                          #{e.entry.startTicketIndex} - #{e.entry.startTicketIndex + e.entry.numTickets - 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatUSDC(e.raffle.totalPot)} pot</p>
                        <p className="text-gray-400 text-sm">{formatTimeRemaining(e.raffle.endTime)} left</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Your odds: {((e.entry.numTickets / e.raffle.totalTickets) * 100).toFixed(1)}%
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past Entries */}
          {pastEntries.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Past Raffles</h2>
              <div className="space-y-4">
                {pastEntries.map((e) => {
                  const isWinner = e.raffle.winner && e.raffle.winner.equals(publicKey!);
                  return (
                    <Link 
                      key={e.entryPubkey.toBase58()}
                      href={`/raffle/${e.rafflePubkey.toBase58()}`}
                      className={`block bg-gray-800 rounded-xl p-4 border transition-colors ${
                        isWinner ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-700 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {isWinner && '🏆 '}{e.raffle.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {e.entry.numTickets} ticket{e.entry.numTickets > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isWinner 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {isWinner ? 'Won!' : getStatusLabel(e.raffle.status)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
