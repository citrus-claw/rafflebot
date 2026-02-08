"use client";

import Link from"next/link";
import { usePathname } from"next/navigation";
import { useState } from"react";
import { WalletMultiButton } from"@solana/wallet-adapter-react-ui";
import { LayoutDashboard, Ticket, ScrollText } from"lucide-react";
import { cn } from"@/lib/utils";

export function Navbar() {
 const [mobileOpen, setMobileOpen] = useState(false);
 const pathname = usePathname();

 const links = [
 { href:"/", label:"MIDWAY", icon: LayoutDashboard },
 { href:"/my-tickets", label:"MY STUBS", icon: Ticket },
 { href:"/history", label:"THE BOOKS", icon: ScrollText },
 ];

 return (
 <header className="border-b-2 border-ink bg-surface sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
 <Link href="/"className="shrink-0">
 <h1 className="text-2xl font-display text-carnival-red tracking-wide leading-none">RAFFLE BOT</h1>
 </Link>

 <nav className="hidden md:flex items-center border-2 border-ink rounded-sm bg-paper">
 {links.map((item, i) => (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
"flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-all px-5 h-9",
 i < links.length - 1 &&"border-r-2 border-ink",
 pathname === item.href ?"text-carnival-red bg-surface":"text-ink/60 hover:text-ink hover:bg-surface/50"
 )}
 >
 <item.icon size={14} />
 {item.label}
 </Link>
 ))}
 </nav>

 <div className="flex items-center gap-3">
 <div className="hidden md:flex items-center text-[10px] font-bold uppercase border-2 border-ink text-carnival-blue rounded-sm px-4 h-9 bg-white">
 <span className="w-2 h-2 bg-carnival-blue rounded-full inline-block mr-2 animate-bounce"/>
 Devnet
 </div>
 <div className="hidden md:block">
 <WalletMultiButton />
 </div>
 <button
 onClick={() => setMobileOpen(!mobileOpen)}
 className="md:hidden text-ink hover:text-carnival-red p-2"
 aria-label="Toggle menu"
 >
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2}>
 {mobileOpen ? (
 <path strokeLinecap="round"strokeLinejoin="round"d="M6 18L18 6M6 6l12 12"/>
 ) : (
 <path strokeLinecap="round"strokeLinejoin="round"d="M4 6h16M4 12h16M4 18h16"/>
 )}
 </svg>
 </button>
 </div>
 </div>

 {mobileOpen && (
 <div className="md:hidden px-6 py-4 space-y-1 border-t-2 border-ink bg-paper">
 {links.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setMobileOpen(false)}
 className={cn(
"flex items-center gap-2 py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors",
 pathname === link.href ?"text-carnival-red":"text-ink/60 hover:text-ink"
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
