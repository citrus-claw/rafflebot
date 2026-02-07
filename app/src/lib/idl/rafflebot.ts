// Auto-generated types from Anchor IDL
// After `anchor build`, replace with: import idl from '../../../target/idl/rafflebot.json'

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey('RafF1eBotxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

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

// IDL placeholder - replace after anchor build
export const IDL = {
  version: "0.1.0",
  name: "rafflebot",
  instructions: [
    {
      name: "createRaffle",
      accounts: [
        { name: "raffle", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "platformWallet", isMut: false, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "ticketPrice", type: "u64" },
        { name: "minPot", type: "u64" },
        { name: "maxPerWallet", type: "u32" },
        { name: "endTime", type: "i64" },
      ],
    },
    {
      name: "buyTickets",
      accounts: [
        { name: "raffle", isMut: true, isSigner: false },
        { name: "entry", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "buyerTokenAccount", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "numTickets", type: "u32" },
      ],
    },
    {
      name: "drawWinner",
      accounts: [
        { name: "raffle", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [
        { name: "randomness", type: { array: ["u8", 32] } },
      ],
    },
    {
      name: "claimPrize",
      accounts: [
        { name: "raffle", isMut: true, isSigner: false },
        { name: "winnerEntry", isMut: false, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "winnerTokenAccount", isMut: true, isSigner: false },
        { name: "platformTokenAccount", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "winner", isMut: false, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "cancelRaffle",
      accounts: [
        { name: "raffle", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: "claimRefund",
      accounts: [
        { name: "raffle", isMut: false, isSigner: false },
        { name: "entry", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "buyerTokenAccount", isMut: true, isSigner: false },
        { name: "platformTokenAccount", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "buyer", isMut: false, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    { name: "Raffle", type: { kind: "struct", fields: [] } },
    { name: "Entry", type: { kind: "struct", fields: [] } },
  ],
} as const;
