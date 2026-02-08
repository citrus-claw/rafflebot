import { LayoutDashboard, Ticket, ScrollText, Tent } from 'lucide-react';

export const APP_NAME = "RaffleBot";
export const TAGLINE = "The Grand On-Chain Lottery";

export const NAVIGATION_ITEMS = [
  { label: 'MIDWAY', path: '/', icon: LayoutDashboard },
  { label: 'MY STUBS', path: '/ledger', icon: Ticket }, // Renamed for theme
  { label: 'THE BOOKS', path: '/audit', icon: ScrollText }, 
];

// Aesthetic Constants
export const COLORS = {
  PAPER: '#F4E4BC',
  INK: '#1a1a1a',
  RED: '#D9381E',
  BLUE: '#004E7C',
};

// Mock Agent Messages
export const AGENT_LOGS = [
  "🎪 Rolling up the virtual tent flaps...",
  "🎟️ Printing fresh stubs for Series 104...",
  "🎡 Spinning the Verifiable Randomness Wheel...",
  "🍿 Popping corn... I mean, processing transactions...",
  "🤡 Checking the ledger for funny business...",
];