import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { CarnivalFooter } from "@/components/CarnivalFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffleBot — The Grand On-Chain Lottery",
  description: "AI-powered provably fair raffles on Solana with Switchboard VRF randomness. Step right up!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper selection:bg-carnival-red selection:text-white">
        <WalletProvider>
          {/* Top Striped Border */}
          <div className="h-2 w-full bg-stripes-red" />

          <Navbar />
          <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-0 text-9xl opacity-5 pointer-events-none select-none">🎪</div>
            <div className="absolute bottom-10 right-0 text-9xl opacity-5 pointer-events-none select-none">🎟️</div>
            {children}
          </main>

          <CarnivalFooter />
        </WalletProvider>
      </body>
    </html>
  );
}
