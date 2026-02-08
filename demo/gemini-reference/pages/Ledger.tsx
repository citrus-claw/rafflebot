import React, { useEffect, useState } from 'react';
import { getLedger } from '../services/mockService';
import { TransactionLog } from '../types';
import { ExternalLink } from 'lucide-react';

export const Ledger: React.FC = () => {
  const [logs, setLogs] = useState<TransactionLog[]>([]);

  useEffect(() => {
    getLedger().then(setLogs);
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-ink pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Master Ledger</h1>
        <p className="text-charcoal mt-2">Full chronological record of all protocol interactions.</p>
      </div>

      <div className="border-2 border-ink bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono whitespace-nowrap">
            <thead className="bg-neutral-100 text-xs uppercase border-b-2 border-ink">
              <tr>
                <th className="p-4 border-r border-ink/10 font-bold">Slot / Time</th>
                <th className="p-4 border-r border-ink/10 font-bold">Type</th>
                <th className="p-4 border-r border-ink/10 font-bold">Reference ID</th>
                <th className="p-4 border-r border-ink/10 font-bold text-right">Volume</th>
                <th className="p-4 font-bold">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.hash} className="border-b border-ink/10 hover:bg-neutral-50">
                  <td className="p-4 border-r border-ink/10 text-charcoal">
                    {new Date(log.timestamp).toISOString()}
                  </td>
                  <td className="p-4 border-r border-ink/10">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border border-ink ${
                        log.type === 'PAYOUT' ? 'bg-stamp text-white border-stamp' :
                        log.type === 'CREATE' ? 'bg-ink text-paper' : 'bg-white'
                    }`}>
                        {log.type}
                    </span>
                  </td>
                  <td className="p-4 border-r border-ink/10 font-bold">{log.relatedId}</td>
                  <td className="p-4 border-r border-ink/10 text-right">
                    {log.amount ? `${log.amount.toFixed(2)} SOL` : '-'}
                  </td>
                  <td className="p-4 flex items-center gap-2 text-xs text-charcoal">
                    <span className="truncate w-32 md:w-64">{log.hash}</span>
                    <ExternalLink size={12} className="cursor-pointer hover:text-ink" />
                  </td>
                </tr>
              ))}
              {/* Filler rows to make it look like a full page ledger */}
              {Array.from({ length: 15 }).map((_, i) => (
                 <tr key={i} className="border-b border-ink/5 text-transparent select-none">
                    <td className="p-4 border-r border-ink/10">.</td>
                    <td className="p-4 border-r border-ink/10">.</td>
                    <td className="p-4 border-r border-ink/10">.</td>
                    <td className="p-4 border-r border-ink/10">.</td>
                    <td className="p-4">.</td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-charcoal uppercase">
         End of Record • Page 1 of 1
      </div>
    </div>
  );
};