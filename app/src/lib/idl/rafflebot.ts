// IDL types generated from Anchor build
import { PublicKey } from '@solana/web3.js';
import { BN, Idl } from '@coral-xyz/anchor';

// Import the generated IDL
import RaffleBotIDL from './rafflebot.json';

export const IDL = RaffleBotIDL as Idl;
export const PROGRAM_ID = new PublicKey(RaffleBotIDL.address);

export interface Raffle {
  authority: PublicKey;
  name: string;
  tokenMint: PublicKey;
  escrow: PublicKey;
  platformWallet: PublicKey;
  ticketPrice: BN;
  minPot: BN;
  maxPerWallet: number;
  endTime: BN;
  totalTickets: number;
  totalPot: BN;
  status: RaffleStatus;
  winner: PublicKey | null;
  winningTicket: number | null;
  randomness: number[] | null;
  createdAt: BN;
  bump: number;
  escrowBump: number;
}

export interface Entry {
  raffle: PublicKey;
  buyer: PublicKey;
  startTicketIndex: number;
  numTickets: number;
  isInitialized: boolean;
  refunded: boolean;
  bump: number;
}

export type RaffleStatus = 
  | { active: {} }
  | { drawComplete: {} }
  | { claimed: {} }
  | { cancelled: {} };

export function isActive(status: RaffleStatus): boolean {
  return 'active' in status;
}

export function isDrawComplete(status: RaffleStatus): boolean {
  return 'drawComplete' in status;
}

export function isClaimed(status: RaffleStatus): boolean {
  return 'claimed' in status;
}

export function isCancelled(status: RaffleStatus): boolean {
  return 'cancelled' in status;
}

export function getStatusLabel(status: RaffleStatus): string {
  if ('active' in status) return 'Active';
  if ('drawComplete' in status) return 'Draw Complete';
  if ('claimed' in status) return 'Claimed';
  if ('cancelled' in status) return 'Cancelled';
  return 'Unknown';
}

// PDA derivation helpers
export function getRafflePDA(authority: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('raffle'), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

export function getEscrowPDA(raffle: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), raffle.toBuffer()],
    PROGRAM_ID
  );
}

export function getEntryPDA(raffle: PublicKey, buyer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('entry'), raffle.toBuffer(), buyer.toBuffer()],
    PROGRAM_ID
  );
}
