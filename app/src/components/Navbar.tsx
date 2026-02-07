"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-dark">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎲</span>
              <span className="text-xl font-bold text-white">RaffleBot</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Active Raffles
              </Link>
              <Link
                href="/my-tickets"
                className="text-gray-400 hover:text-white transition-colors"
              >
                My Tickets
              </Link>
              <Link
                href="/history"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Winners
              </Link>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
