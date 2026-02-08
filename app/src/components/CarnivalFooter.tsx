'use client';

import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';

const AGENT_LOGS = [
"Rolling up the virtual tent flaps...",
"Printing fresh stubs for the next draw...",
"Spinning the Verifiable Randomness Wheel...",
"Popping corn... I mean, processing transactions...",
"Checking the ledger for funny business...",
];

export function CarnivalFooter() {
 const [currentLog, setCurrentLog] = useState(AGENT_LOGS[0]);

 useEffect(() => {
 const interval = setInterval(() => {
 setCurrentLog(AGENT_LOGS[Math.floor(Math.random() * AGENT_LOGS.length)]);
 }, 5000);
 return () => clearInterval(interval);
 }, []);

 return (
 <footer className="border-t-2 border-ink bg-surface text-xs relative overflow-hidden">
 <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
 <div className="flex items-center gap-2 text-ink w-full md:w-auto bg-paper border-2 border-dashed border-ink px-4 py-2 rounded-sm">
 <Ticket size={16} className="text-carnival-red"/>
 <span className="font-display text-carnival-red mr-1 tracking-wide">RINGMASTER:</span>
 <span className="truncate font-bold opacity-80">{currentLog}</span>
 </div>
 <div className="flex gap-6 text-ink/60 font-bold uppercase tracking-widest text-[10px]">
 <span>Solana Powered</span>
 <span>Verifiable Randomness</span>
 <span>Automated</span>
 </div>
 </div>
 </footer>
 );
}
