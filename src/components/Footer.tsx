import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#07080a] py-6 px-4 lg:px-8 mt-16 text-sm text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <img src="/profile.png" alt="Twitch Dataset" className="w-5 h-5 rounded-full border border-zinc-700" />
          <span className="text-zinc-300 font-medium">Twitch Dataset Explorer</span>
          <span className="text-zinc-600">•</span>
          <span>GPL-3.0 License</span>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <a
            href="https://github.com/luanaassis/TwitchDataset"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors underline decoration-zinc-700 underline-offset-2"
          >
            luanaassis/TwitchDataset <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
