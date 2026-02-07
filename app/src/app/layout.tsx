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
      <body className="min-h-screen bg-darker relative noise-overlay">
        <WalletProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
          
          {/* Footer */}
          <footer className="border-t border-carnival-border mt-16 py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-carnival-cream/20 text-sm">
                🎪 RaffleBot — Built on Solana • Powered by Switchboard VRF • Managed by AI
              </p>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
