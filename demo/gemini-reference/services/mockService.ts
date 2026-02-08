import { Raffle, RaffleStatus, Ticket, TransactionLog } from '../types';

// Generators
const generateId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
const generateHash = () => Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const generateWallet = () => `8x${Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...${Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

// Initial Data
const RAFFLES: Raffle[] = [
  {
    id: 'RF-2024-001',
    title: 'High Stakes Series A',
    createdAt: '2023-10-24T08:00:00Z',
    drawSlot: 240501200,
    ticketPrice: 1.5,
    totalTickets: 1000,
    soldTickets: 1000,
    prizePool: 1500,
    status: RaffleStatus.PAID,
    winnerTicketId: 'TKT-993821',
    payoutTx: generateHash(),
    randomnessSignature: generateHash(),
  },
  {
    id: 'RF-2024-002',
    title: 'Standard Weekly Draw',
    createdAt: '2023-10-25T10:00:00Z',
    drawSlot: 240600000,
    ticketPrice: 0.1,
    totalTickets: 500,
    soldTickets: 342,
    prizePool: 34.2,
    status: RaffleStatus.OPEN,
  },
  {
    id: 'RF-2024-003',
    title: 'Micro-Transaction Pool',
    createdAt: '2023-10-26T09:30:00Z',
    drawSlot: 240650000,
    ticketPrice: 0.05,
    totalTickets: 2000,
    soldTickets: 12,
    prizePool: 0.6,
    status: RaffleStatus.OPEN,
  },
];

const TICKETS: Ticket[] = [
  {
    id: 'TKT-993821',
    raffleId: 'RF-2024-001',
    owner: '8x2F...9A1B',
    purchaseSlot: 240500100,
    timestamp: '2023-10-24T12:00:00Z',
    signature: generateHash(),
    isWinner: true,
  }
];

const LOGS: TransactionLog[] = [
  { hash: generateHash(), type: 'PAYOUT', amount: 1500, timestamp: '2023-10-24T14:00:00Z', relatedId: 'RF-2024-001' },
  { hash: generateHash(), type: 'CREATE', timestamp: '2023-10-24T08:00:00Z', relatedId: 'RF-2024-001' },
];

export const getRaffles = async (): Promise<Raffle[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(RAFFLES), 500));
};

export const getRaffleById = async (id: string): Promise<Raffle | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(RAFFLES.find(r => r.id === id)), 300));
};

export const getTicketsForRaffle = async (raffleId: string): Promise<Ticket[]> => {
  // Generate fake tickets if empty for open raffles to populate the list
  const existing = TICKETS.filter(t => t.raffleId === raffleId);
  if (existing.length === 0) {
    const fakeTickets: Ticket[] = Array.from({ length: 5 }).map((_, i) => ({
      id: generateId('TKT'),
      raffleId,
      owner: generateWallet(),
      purchaseSlot: 240600000 - i * 100,
      timestamp: new Date().toISOString(),
      signature: generateHash(),
      isWinner: false,
    }));
    return new Promise((resolve) => setTimeout(() => resolve(fakeTickets), 400));
  }
  return new Promise((resolve) => setTimeout(() => resolve(existing), 400));
};

export const buyTicket = async (raffleId: string, quantity: number): Promise<Ticket[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTickets: Ticket[] = [];
      for (let i = 0; i < quantity; i++) {
        newTickets.push({
          id: generateId('TKT'),
          raffleId,
          owner: 'YOU (0xUser...Wallet)',
          purchaseSlot: 240700000 + i,
          timestamp: new Date().toISOString(),
          signature: generateHash(),
          isWinner: false
        });
      }
      // Update local state for "realism" in this session
      TICKETS.push(...newTickets);
      const raffle = RAFFLES.find(r => r.id === raffleId);
      if (raffle) {
        raffle.soldTickets += quantity;
        raffle.prizePool += quantity * raffle.ticketPrice;
      }
      resolve(newTickets);
    }, 1500);
  });
};

export const getLedger = async (): Promise<TransactionLog[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(LOGS), 600));
}