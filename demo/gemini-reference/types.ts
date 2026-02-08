export enum RaffleStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAWN = 'DRAWN',
  PAID = 'PAID_OUT'
}

export interface Ticket {
  id: string;
  raffleId: string;
  owner: string; // Wallet address
  purchaseSlot: number;
  timestamp: string;
  signature: string;
  isWinner?: boolean;
}

export interface Raffle {
  id: string;
  title: string; // e.g., "Series 104"
  createdAt: string; // ISO Date
  drawSlot: number;
  ticketPrice: number; // in SOL
  totalTickets: number;
  soldTickets: number;
  prizePool: number; // in SOL
  status: RaffleStatus;
  winnerTicketId?: string;
  payoutTx?: string;
  randomnessSignature?: string;
}

export interface TransactionLog {
  hash: string;
  type: 'CREATE' | 'BUY' | 'DRAW' | 'PAYOUT';
  amount?: number;
  timestamp: string;
  relatedId: string; // Raffle ID or Ticket ID
}