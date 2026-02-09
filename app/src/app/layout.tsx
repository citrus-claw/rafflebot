import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { CarnivalFooter } from "@/components/CarnivalFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAFFLE BOT — The Grand On-Chain Lottery",
  description: "AI-powered provably fair raffles on Solana with Switchboard VRF randomness. Step right up!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎟️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-paper selection:bg-carnival-red selection:text-white">
        <WalletProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <CarnivalFooter />
        </WalletProvider>
      </body>
    </html>
  );
}
