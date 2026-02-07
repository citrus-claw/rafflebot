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
      <body className="min-h-screen bg-cream relative paper-texture">
        <WalletProvider>
          <Navbar />
          <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">{children}</main>
          
          {/* Footer */}
          <footer className="relative z-10 border-t-2 border-border-light mt-16 py-10">
            <div className="container mx-auto px-4 text-center">
              <p className="text-text-secondary text-sm font-mono">
                🎪 RaffleBot — Built on Solana • Powered by Switchboard VRF • Managed by AI
              </p>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
