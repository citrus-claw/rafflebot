import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffleBot — Provably Fair On-Chain Raffles",
  description: "AI-powered provably fair raffles on Solana with Switchboard VRF randomness. Buy tickets, win prizes, verify everything on-chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">
        <WalletProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
          
          <footer className="mt-16 py-10" style={{ borderTop: '1px solid #D4D0C8' }}>
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  {/* Small ticket illustration */}
                  <svg width="24" height="24" viewBox="0 0 200 200" fill="none" className="opacity-30">
                    <rect x="25" y="60" width="150" height="80" rx="4" stroke="#141414" strokeWidth="3" />
                    <line x1="140" y1="60" x2="140" y2="140" stroke="#141414" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx="140" cy="60" r="8" fill="#FBF7EB" stroke="#141414" strokeWidth="2" />
                    <circle cx="140" cy="140" r="8" fill="#FBF7EB" stroke="#141414" strokeWidth="2" />
                    <line x1="40" y1="85" x2="120" y2="85" stroke="#141414" strokeWidth="2" />
                    <line x1="40" y1="100" x2="100" y2="100" stroke="#141414" strokeWidth="1.5" />
                    <line x1="40" y1="115" x2="110" y2="115" stroke="#141414" strokeWidth="1.5" />
                  </svg>
                  <p className="text-text-secondary text-xs">
                    RaffleBot — Built on Solana · Powered by Switchboard VRF · Managed by AI
                  </p>
                </div>
                <div className="flex gap-6">
                  <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-xs hover:text-text-primary transition-colors">Solana</a>
                  <a href="https://switchboard.xyz" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-xs hover:text-text-primary transition-colors">Switchboard</a>
                </div>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
