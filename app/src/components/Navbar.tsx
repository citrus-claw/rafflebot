"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LayoutDashboard, Ticket, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "MIDWAY", icon: LayoutDashboard },
    { href: "/my-tickets", label: "MY STUBS", icon: Ticket },
    { href: "/history", label: "THE BOOKS", icon: ScrollText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-carnival-red">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="shrink-0">
          <h1 className="font-display text-base tracking-wide text-white">
            RAFFLE BOT
          </h1>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all",
                pathname === item.href
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletMultiButton />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white/80 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="space-y-1 border-t border-white/10 px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                pathname === link.href
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white"
              )}
            >
              <link.icon size={14} />
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <WalletMultiButton />
          </div>
        </div>
      )}
    </header>
  );
}
