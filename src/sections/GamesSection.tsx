import React, { useState, useMemo } from 'react';
import { GamesData, GameItem } from '../types';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  TrendingUp, 
  Eye, 
  ShieldAlert, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

interface GamesSectionProps {
  data: GamesData;
}

const LINE_COLORS = ['#00f0ff', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'];

export const GamesSection: React.FC<GamesSectionProps> = ({ data }) => {
  const { topGames, totalUniqueGames, popularityTiers, gamesOverTime } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [matureFilter, setMatureFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'streamCount' | 'totalViewers' | 'avgViewers' | 'matureRate'>('streamCount');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  // Top games to show on line chart
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    'Animals, Aquariums, and Zoos': true,
    'Fortnite': true,
    'Just Chatting': true,
    'Minecraft': true,
    'Animal Crossing: New Horizons': true,
  });

  const toggleLine = (name: string) => {
    setVisibleLines(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Filtered & sorted games
  const filteredGames = useMemo(() => {
    return topGames.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRating = ratingFilter === 'ALL' 
        ? true 
        : ratingFilter === 'UNRATED' 
          ? g.primaryEsrb === 'Unrated' && g.primaryPegi === 'Unrated'
          : g.primaryEsrb.toLowerCase().includes(ratingFilter.toLowerCase()) || g.primaryPegi.toLowerCase().includes(ratingFilter.toLowerCase());

      const matchMature = matureFilter === 'ALL'
        ? true
        : matureFilter === 'MATURE'
          ? g.matureRate >= 15
          : g.matureRate < 15;

      return matchSearch && matchRating && matchMature;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [topGames, searchTerm, ratingFilter, matureFilter, sortField, sortAsc]);

  const handleSort = (field: 'streamCount' | 'totalViewers' | 'avgViewers' | 'matureRate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Games & Categories
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {totalUniqueGames.toLocaleString()} distinct titles matched against IGDB entries.
          </p>
        </div>
      </div>

      {/* Popularity Tiers Grid */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">
          Popularity Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {popularityTiers.map((tier, idx) => (
            <div key={tier.tier} className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs text-zinc-500 block mb-1">
                  {tier.tier.split(':')[0]}
                </span>
                <span className="text-lg font-bold text-white">
                  {tier.count.toLocaleString()} <span className="text-sm font-normal text-zinc-500">games</span>
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800/60 text-xs text-zinc-500 flex items-center justify-between">
                <span>{tier.totalStreams.toLocaleString()} streams</span>
                <span className="text-cyan-400 font-semibold">
                  {((tier.totalStreams / 45185) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Games Over Time Chart */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              Games Over Time
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Daily stream trajectory of leading categories
            </p>
          </div>

          {/* Toggle buttons for chart lines */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {Object.keys(visibleLines).map((gameName, idx) => (
              <button
                key={gameName}
                onClick={() => toggleLine(gameName)}
                className={`px-2 py-1 rounded text-[11px] border font-mono transition-all flex items-center gap-1.5 ${
                  visibleLines[gameName]
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-950 text-zinc-600 border-zinc-900 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }}></span>
                <span className="truncate max-w-[120px]">{gameName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gamesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickFormatter={(val) => val.slice(5)} 
              />
              <YAxis stroke="#52525b" fontSize={10} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
              />
              {Object.keys(visibleLines).map((gameName, idx) => (
                visibleLines[gameName] ? (
                  <Line 
                    key={gameName}
                    type="monotone" 
                    dataKey={gameName} 
                    name={gameName} 
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]} 
                    strokeWidth={2}
                    dot={false}
                  />
                ) : null
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Games Search & Table */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div>
            <h3 className="text-base font-semibold text-white">
              All games &amp; categories
            </h3>
            <span className="text-xs text-zinc-500">
              Showing {filteredGames.length} games
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 w-44 sm:w-56"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
            >
              <option value="ALL">All age ratings</option>
              <option value="Everyone">Everyone (E)</option>
              <option value="Teen">Teen (T)</option>
              <option value="Mature">Mature 17+ (M)</option>
              <option value="PEGI 18">PEGI 18</option>
              <option value="UNRATED">Unrated only</option>
            </select>

            <select
              value={matureFilter}
              onChange={(e) => setMatureFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
            >
              <option value="ALL">All content flags</option>
              <option value="FAMILY">Low mature (&lt;15%)</option>
              <option value="MATURE">High mature (≥15%)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">#</th>
                <th className="py-2.5 font-medium">Game / Category</th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('streamCount')}
                >
                  <span className="flex items-center gap-1">
                    Streams <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('totalViewers')}
                >
                  <span className="flex items-center gap-1">
                    Total viewers <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('avgViewers')}
                >
                  <span className="flex items-center gap-1">
                    Avg viewers <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('matureRate')}
                >
                  <span className="flex items-center gap-1">
                    Mature rate <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th className="py-2.5 font-medium">Age classification</th>
                <th className="py-2.5 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredGames.slice(0, 35).map((game, idx) => (
                <tr 
                  key={game.name} 
                  className="hover:bg-zinc-900/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedGame(selectedGame?.name === game.name ? null : game)}
                >
                  <td className="py-3 text-zinc-500">{idx + 1}</td>
                  <td className="py-3 font-medium text-white max-w-[200px] truncate" title={game.name}>
                    {game.name}
                  </td>
                  <td className="py-3 font-semibold text-white">
                    {game.streamCount.toLocaleString()}
                  </td>
                  <td className="py-3 text-zinc-300">
                    {game.totalViewers.toLocaleString()}
                  </td>
                  <td className="py-3 text-zinc-300">
                    {game.avgViewers.toFixed(1)}
                  </td>
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      game.matureRate > 15
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {game.matureRate}%
                    </span>
                  </td>
                  <td className="py-3 text-zinc-300">
                    <div className="flex items-center gap-1 flex-wrap">
                      {game.primaryEsrb !== 'Unrated' && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300 border border-zinc-800">
                          {game.primaryEsrb}
                        </span>
                      )}
                      {game.primaryPegi !== 'Unrated' && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300 border border-zinc-800">
                          {game.primaryPegi}
                        </span>
                      )}
                      {game.primaryEsrb === 'Unrated' && game.primaryPegi === 'Unrated' && (
                        <span className="text-zinc-600 text-[11px]">Unrated</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 max-w-[240px] truncate">
                      {game.topTags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] border border-zinc-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Game Detail Drawer */}
        {selectedGame && (
          <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-700/80 mt-3 animate-fadeIn">
            <div className="flex items-start justify-between pb-2 border-b border-zinc-800 mb-3">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Selected Game</span>
                <h4 className="text-base font-semibold text-white">{selectedGame.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedGame(null)}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Total streams</span>
                <span className="text-white font-semibold text-sm">{selectedGame.streamCount.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Unique channels</span>
                <span className="text-white font-semibold text-sm">{selectedGame.uniqueChannels.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Peak viewers</span>
                <span className="text-white font-semibold text-sm">{selectedGame.maxViewers.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Mature flag rate</span>
                <span className={`font-semibold text-sm ${selectedGame.matureRate > 15 ? 'text-rose-400' : 'text-zinc-300'}`}>{selectedGame.matureRate}%</span>
              </div>
            </div>

            <div className="text-xs">
              <span className="text-zinc-400 font-medium block mb-1">Most frequent broadcasters:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedGame.topChannels).map(([ch, cnt]) => (
                  <span key={ch} className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                    <span className="text-zinc-400">{ch.slice(0, 8)}...{ch.slice(-4)}</span>: <span className="text-white font-medium">{cnt}</span> captures
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
