"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Raffles" },
    { href: "/my-tickets", label: "My Tickets" },
    { href: "/history", label: "Winners" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-cream" style={{ borderBottom: '0.8px solid #393939' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-text-primary text-lg font-bold tracking-tight">
                RaffleBot
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    pathname === link.href
                      ? "text-text-primary font-bold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={pathname === link.href ? { borderBottom: '1.6px solid #393939' } : {}}
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
              className="md:hidden text-text-secondary hover:text-text-primary p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          <div className="md:hidden py-4 space-y-1" style={{ borderTop: '0.8px dashed #393939' }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 px-3 text-sm transition-colors ${
                  pathname === link.href
                    ? "text-text-primary font-bold"
                    : "text-text-secondary hover:text-text-primary"
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
