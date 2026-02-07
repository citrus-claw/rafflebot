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
          
          <footer className="border-t mt-16 py-10" style={{ borderTop: '0.8px solid #393939' }}>
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-text-secondary text-xs">
                  RaffleBot — Built on Solana · Powered by Switchboard VRF · Managed by AI
                </p>
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
