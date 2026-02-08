import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME, NAVIGATION_ITEMS, AGENT_LOGS } from '../constants';
import { Ticket, Tent } from 'lucide-react';

export const Layout: React.FC = () => {
  const [currentLog, setCurrentLog] = useState(AGENT_LOGS[0]);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog = AGENT_LOGS[Math.floor(Math.random() * AGENT_LOGS.length)];
      setCurrentLog(randomLog);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-mono selection:bg-carnival-red selection:text-white">
      {/* Top Striped Border */}
      <div className="h-2 w-full bg-stripes-red"></div>

      {/* Header */}
      <header className="border-b-4 border-double border-ink bg-surface sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="border-2 border-ink bg-carnival-red text-white p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <Tent size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-display text-carnival-red tracking-wide drop-shadow-sm">{APP_NAME}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">Fairness Guaranteed</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center bg-paper px-6 py-2 rounded-full border border-ink/10 shadow-inner">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-all ${
                    isActive ? 'text-carnival-red scale-105' : 'text-ink/60 hover:text-ink'
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center text-[10px] font-bold uppercase border-2 border-carnival-blue text-carnival-blue rounded-full px-3 py-1 bg-white">
              <span className="w-2 h-2 bg-carnival-blue rounded-full inline-block mr-2 animate-bounce"></span>
              Mainnet Open
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 left-0 text-9xl opacity-5 pointer-events-none select-none">🎪</div>
        <div className="absolute bottom-10 right-0 text-9xl opacity-5 pointer-events-none select-none">🎟️</div>
        
        <Outlet />
      </main>

      {/* Footer / Agent Status */}
      <footer className="border-t-4 border-double border-ink bg-surface text-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-stripes-blue opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-ink w-full md:w-auto bg-paper border-2 border-ink px-4 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Ticket size={16} className="text-carnival-red" />
            <span className="font-display text-carnival-red mr-1 tracking-wide">RINGMASTER:</span>
            <span className="truncate font-bold opacity-80">{currentLog}</span>
          </div>
          <div className="flex gap-6 text-ink/60 font-bold uppercase tracking-widest text-[10px]">
             <span>🎡 Solana Powered</span>
             <span>🎯 Verifiable Randomness</span>
             <span>🤖 Automated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};