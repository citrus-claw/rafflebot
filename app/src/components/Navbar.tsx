"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "🎪 Raffles" },
    { href: "/my-tickets", label: "🎟️ My Tickets" },
    { href: "/history", label: "🏆 Winners" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-carnival-darker/90 backdrop-blur-xl border-b border-carnival-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:animate-float">🎰</span>
              <span className="font-ticket text-xl text-carnival-amber tracking-wide">
                RaffleBot
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-carnival-red/20 text-carnival-amber border border-carnival-red/30"
                      : "text-carnival-cream/60 hover:text-carnival-cream hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <WalletMultiButton />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-carnival-cream/60 hover:text-carnival-cream p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-carnival-border py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-carnival-amber bg-carnival-red/20 border border-carnival-red/30"
                    : "text-carnival-cream/60 hover:text-carnival-cream hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 sm:hidden">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
