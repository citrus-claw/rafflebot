import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Raffle, Ticket, RaffleStatus } from '../types';
import { getRaffleById, getTicketsForRaffle, buyTicket } from '../services/mockService';
import { TicketStub } from '../components/TicketStub';
import { ArrowLeft, CheckCircle2, AlertTriangle, Printer, Info, Coins, Star, Ticket as TicketIcon } from 'lucide-react';

export const RaffleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [raffle, setRaffle] = useState<Raffle | undefined>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1);
  const [purchasing, setPurchasing] = useState(false);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (raffleId: string) => {
    const r = await getRaffleById(raffleId);
    setRaffle(r);
    if (r) {
      const t = await getTicketsForRaffle(raffleId);
      setTickets(t);
    }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!raffle || !id) return;
    setPurchasing(true);
    const newTickets = await buyTicket(id, purchaseAmount);
    setMyTickets([...myTickets, ...newTickets]);
    await loadData(id); // Refresh stats
    setPurchasing(false);
  };

  if (loading) return <div className="p-12 text-center font-display text-xl animate-pulse text-carnival-blue">🎪 Loading The Show...</div>;
  if (!raffle) return <div className="p-12 text-center font-display text-xl text-carnival-red">🚫 Attraction Closed</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-xs font-bold text-ink/60 hover:text-carnival-red hover:underline mb-6 font-display tracking-widest uppercase">
          <ArrowLeft size={12} className="mr-1" /> Back to Midway
        </Link>
        
        <div className="bg-surface border-4 border-double border-ink p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(217,56,30,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-stripes-blue opacity-50"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl md:text-4xl font-display text-carnival-blue drop-shadow-sm">{raffle.title}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 ${
                    raffle.status === RaffleStatus.OPEN ? 'bg-green-100 text-green-800 border-green-600' : 'bg-neutral-100 text-neutral-600 border-neutral-400'
                 }`}>
                    {raffle.status.replace('_', ' ')}
                 </span>
             </div>
             <div className="flex items-center gap-4 text-xs font-mono text-ink/60">
                <span className="bg-paper px-2 py-1 rounded border border-ink/10 font-bold">Ref: {raffle.id}</span>
                <span>Opened: {new Date(raffle.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
          <div className="text-right border-l-4 border-dotted border-ink/20 pl-8 md:pl-0 md:border-l-0 relative z-10">
             <div className="text-xs uppercase font-bold text-carnival-red mb-1 font-display tracking-widest">Grand Prize Pool</div>
             <div className="text-5xl font-display text-ink">{raffle.prizePool.toFixed(2)} <span className="text-2xl text-ink/50">SOL</span></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
        {/* Left Column: Stats & Ledger */}
        <div className="md:col-span-7 space-y-8">
            {/* Info Box */}
            <div className="bg-paper border-2 border-ink p-5 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-carnival-blue text-white p-2 rounded-full">
                        <Info size={20} />
                    </div>
                    <div>
                        <h3 className="font-display text-lg uppercase mb-1 text-carnival-blue">Attraction Rules</h3>
                        <p className="text-sm text-ink/80 leading-relaxed">
                            {raffle.status === RaffleStatus.OPEN 
                                ? "Step right up! Purchase your tickets below. Each ticket is a unique NFT minted directly to your wallet. When the time comes, our Verifiable Randomness Function selects one lucky winner to take it all!"
                                : "This show is over, folks! The winning ticket has been drawn and funds have been automatically disbursed. Check the ledger below to verify."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Winner Section if Closed */}
            {(raffle.status === RaffleStatus.PAID || raffle.status === RaffleStatus.DRAWN) && (
                <div className="bg-gold border-4 border-ink p-6 relative rounded-lg shadow-[8px_8px_0px_0px_#1a1a1a]">
                     <div className="absolute -top-4 -right-4 bg-carnival-red text-white px-4 py-2 text-sm uppercase font-display rotate-3 border-2 border-white shadow-md">
                        🏆 Winner Declared
                     </div>
                     <h4 className="font-display text-xl uppercase mb-4 text-ink border-b-2 border-ink/20 pb-2">The Lucky Number</h4>
                     <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                        <div className="bg-white/50 p-2 rounded border border-ink/10">
                            <span className="block text-[10px] uppercase text-ink/60 font-bold">Winning Ticket ID</span>
                            <span className="font-bold text-lg text-carnival-red">{raffle.winnerTicketId}</span>
                        </div>
                        <div className="bg-white/50 p-2 rounded border border-ink/10">
                            <span className="block text-[10px] uppercase text-ink/60 font-bold">Payout TX</span>
                            <a href="#" className="underline truncate block w-full hover:text-carnival-blue">{raffle.payoutTx}</a>
                        </div>
                     </div>
                </div>
            )}

            {/* Public Ticket Ledger */}
            <div className="bg-surface border-2 border-ink rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b-2 border-ink bg-paper flex justify-between items-center">
                    <h3 className="font-display text-lg uppercase text-ink">
                        Entry Ledger 
                    </h3>
                    <span className="bg-ink text-paper text-xs font-bold px-2 py-1 rounded-full">{tickets.length} Entries</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-white text-ink/50 uppercase font-bold font-display tracking-wider">
                            <tr>
                                <th className="p-3 border-b-2 border-ink/10">Ticket ID</th>
                                <th className="p-3 border-b-2 border-ink/10">Holder</th>
                                <th className="p-3 border-b-2 border-ink/10 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5 font-mono">
                            {tickets.slice(0, 10).map(t => (
                                <tr key={t.id} className="hover:bg-gold/10">
                                    <td className="p-3 font-bold text-carnival-blue">{t.id}</td>
                                    <td className="p-3 text-ink/80">{t.owner}</td>
                                    <td className="p-3 text-right text-ink/50">{new Date(t.timestamp).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tickets.length > 10 && (
                        <div className="p-3 text-center text-[10px] font-bold text-ink/60 uppercase bg-paper/50 border-t-2 border-ink/10">
                            + {tickets.length - 10} more entries on chain
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Ticket Booth */}
        <div className="md:col-span-5 space-y-8">
            
            {/* TICKET BOOTH FORM */}
            {raffle.status === RaffleStatus.OPEN && (
                <div className="bg-carnival-red p-1 rounded-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] sticky top-24">
                    <div className="bg-surface border-2 border-dashed border-ink p-6 rounded-lg">
                        <div className="text-center mb-6 border-b-2 border-ink/10 pb-4">
                            <h3 className="text-2xl font-display uppercase text-carnival-red drop-shadow-sm">Ticket Booth</h3>
                            <p className="text-xs font-bold uppercase text-ink/50 tracking-widest mt-1">Get Your Entry Here</p>
                        </div>
                        
                        {!purchasing && myTickets.length === 0 ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex justify-between text-xs font-bold uppercase text-ink font-display tracking-wider">
                                        <span>How many?</span>
                                        <span className="text-carnival-blue">Max: 100</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="100"
                                            value={purchaseAmount}
                                            onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 1)}
                                            className="w-full border-2 border-ink rounded-lg p-3 font-mono text-2xl text-center focus:outline-none focus:ring-4 focus:ring-gold bg-paper shadow-inner"
                                        />
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-ink/30">
                                            <TicketIcon size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-paper rounded-lg p-4 space-y-2 text-sm border-2 border-ink/10 font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-ink/60">Price per Ticket</span>
                                        <span className="font-bold">{raffle.ticketPrice.toFixed(2)} SOL</span>
                                    </div>
                                    <div className="flex justify-between text-ink/60 text-xs">
                                        <span>Gas Fee</span>
                                        <span>~0.0005 SOL</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-ink/10 text-carnival-red mt-2">
                                        <span>Total</span>
                                        <span>{(raffle.ticketPrice * purchaseAmount + 0.0005).toFixed(4)} SOL</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleBuy}
                                    className="w-full bg-carnival-blue text-white py-4 rounded-lg font-display text-xl uppercase tracking-widest hover:bg-ink transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-[0px_4px_0px_0px_#003352]"
                                >
                                    Purchase Tickets
                                </button>
                                <p className="text-[10px] text-center text-ink/40 font-bold uppercase">
                                    Funds are securely transferred via Solana
                                </p>
                            </div>
                        ) : purchasing ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="inline-block w-12 h-12 border-4 border-carnival-red border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-display uppercase text-carnival-red animate-pulse">Printing Stub...</p>
                            </div>
                        ) : (
                            <div className="text-center py-4 space-y-4">
                                <div className="flex justify-center mb-2 animate-bounce">
                                    <Star size={64} className="fill-gold text-ink" />
                                </div>
                                <h4 className="font-display text-2xl uppercase text-carnival-red">You're In!</h4>
                                <p className="text-sm text-ink/70 mb-6 font-mono">Your tickets have been minted and added to the ledger.</p>
                                <button 
                                    onClick={() => setMyTickets([])} // Reset flow for demo
                                    className="text-xs font-bold uppercase underline text-carnival-blue hover:text-ink"
                                >
                                    Buy More
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* User's Tickets Display */}
            {myTickets.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-6 border-b-2 border-ink pb-2">
                        <h3 className="text-xl font-display uppercase text-ink">Your Stubs</h3>
                        <button className="text-[10px] font-bold bg-white border-2 border-ink px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gold hover:text-white transition-colors">
                            <Printer size={12} /> PRINT
                        </button>
                    </div>
                    <div className="space-y-8">
                        {myTickets.map(ticket => (
                            <TicketStub key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};