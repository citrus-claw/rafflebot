import type { Metadata } from"next";
import { WalletProvider } from"@/components/WalletProvider";
import { Navbar } from"@/components/Navbar";
import { CarnivalFooter } from"@/components/CarnivalFooter";
import"./globals.css";

export const metadata: Metadata = {
 title:"RAFFLE BOT — The Grand On-Chain Lottery",
 description:"AI-powered provably fair raffles on Solana with Switchboard VRF randomness. Step right up!",
 icons: {
 icon:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎟️</text></svg>",
 },
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en">
 <body className="min-h-screen flex flex-col bg-paper selection:bg-carnival-red selection:text-white">
 <WalletProvider>
 {/* Top Striped Border */}
 <div className="h-2 w-full bg-stripes-red"/>

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
