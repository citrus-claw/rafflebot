"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Tent, LayoutDashboard, Ticket, ScrollText } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "MIDWAY", icon: LayoutDashboard },
    { href: "/my-tickets", label: "MY STUBS", icon: Ticket },
    { href: "/history", label: "THE BOOKS", icon: ScrollText },
  ];

  return (
    <header className="border-b-4 border-double border-ink bg-surface sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="border-2 border-ink bg-carnival-red text-white p-2 rounded-lg shadow-chunky-sm">
            <Tent size={24} strokeWidth={2.5} />
          </div>
          <Link href="/" className="flex flex-col">
            <h1 className="text-2xl font-display text-carnival-red tracking-wide drop-shadow-sm">RaffleBot</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">Fairness Guaranteed</p>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 items-center bg-paper px-6 py-2 rounded-full border border-ink/10 shadow-inner">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-all ${
                pathname === item.href ? 'text-carnival-red scale-105' : 'text-ink/60 hover:text-ink'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center text-[10px] font-bold uppercase border-2 border-carnival-blue text-carnival-blue rounded-full px-3 py-1 bg-white">
            <span className="w-2 h-2 bg-carnival-blue rounded-full inline-block mr-2 animate-bounce" />
            Devnet
          </div>
          <div className="hidden sm:block">
            <WalletMultiButton />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-ink hover:text-carnival-red p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 py-4 space-y-1 border-t-2 border-dashed border-ink/20 bg-paper">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                pathname === link.href
                  ? "text-carnival-red"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              <link.icon size={14} />
              {link.label}
            </Link>
          ))}
          <div className="pt-2 sm:hidden">
            <WalletMultiButton />
          </div>
        </div>
      )}
    </header>
  );
}
