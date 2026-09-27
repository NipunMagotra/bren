import React from 'react';
import { DataExplorerSection } from './DataExplorerSection';
import { Database, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const GlobalCorpusSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500 font-medium">Research Corpus</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300">
              832 Snapshot Files
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Global Twitch 45,185 Record Corpus
          </h3>
          <p className="text-sm text-zinc-400 mt-0.5">
            Complete multi-channel dataset crawled across 31 consecutive days by Luana Assis, featuring 4,607 distinct channels and 1,032 games.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0">
          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-zinc-500 block text-[10px]">TOTAL RECORDS</span>
            <span className="text-white font-bold font-mono">45,185</span>
          </div>
          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-zinc-500 block text-[10px]">CHANNELS</span>
            <span className="text-white font-bold font-mono">4,607</span>
          </div>
          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-zinc-500 block text-[10px]">GAMES</span>
            <span className="text-white font-bold font-mono">1,032</span>
          </div>
        </div>
      </div>

      {/* Embedded Data Explorer */}
      <DataExplorerSection />
    </div>
  );
};
