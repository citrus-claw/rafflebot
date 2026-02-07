import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffleBot - Provably Fair Solana Raffles",
  description: "AI-powered provably fair raffles on Solana with VRF randomness",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-darker">
        <WalletProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
