import React from 'react';
import { TabType } from '../types';
import { 
  User, 
  TrendingUp, 
  Gamepad2, 
  Calendar, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  followerCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  followerCount = 58316 
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'bren-overview', label: 'Career Overview', icon: <User className="w-4 h-4" /> },
    { id: 'bren-timeline', label: '10-Year Timeline', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'bren-games', label: 'Games (200)', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'bren-chat', label: 'Live Chat (10.3k)', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'bren-clips', label: 'Clips & VODs', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'bren-schedule', label: 'Schedule & Habits', icon: <Calendar className="w-4 h-4" /> },
  ];



  return (
    <header className="border-b border-zinc-800/80 bg-[#07080a]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="px-4 lg:px-8 pt-5 pb-3">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3.5 mb-1.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                <img 
                  src="/profile.png" 
                  alt="Bren" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Bren
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                    Twitch Streamer &amp; Caster
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400">
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
              Followers: <strong className="text-white font-medium">{followerCount.toLocaleString()}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
              Broadcasts: <strong className="text-white font-medium">1,733</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
              Hours: <strong className="text-white font-medium">11,200 hrs</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none" aria-label="Navigation Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-100 ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
