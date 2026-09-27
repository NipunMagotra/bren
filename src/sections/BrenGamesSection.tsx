import React, { useState, useMemo } from 'react';
import { BrenGameItem } from '../types';
import { Search, ArrowUpDown } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface BrenGamesSectionProps {
  data: BrenGameItem[];
}

export const BrenGamesSection: React.FC<BrenGamesSectionProps> = ({ data }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'durationHours' | 'peakViewers' | 'avgViewers' | 'timeShare'>('durationHours');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredGames = useMemo(() => {
    return data
      .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortAsc) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [data, search, sortField, sortAsc]);

  const handleSort = (field: 'durationHours' | 'peakViewers' | 'avgViewers' | 'timeShare') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredGames.slice(start, start + pageSize);
  }, [filteredGames, page, pageSize]);

  const top10Games = useMemo(() => {
    return data.slice(0, 10);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Games &amp; Categories History ({data.length} Titles)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Complete historical catalog of every game Bren has streamed since December 2016, with playtime and viewer metrics.
          </p>
        </div>
      </div>

      {/* Top Games Playtime Chart */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="pb-3 border-b border-zinc-800/60">
          <h3 className="text-base font-semibold text-white">
            Top 10 Most Streamed Games
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5">
            Ranked by total career broadcast hours
          </p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Games} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <XAxis type="number" stroke="#71717a" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={110} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                formatter={(val: any) => [`${val.toLocaleString()} hours`, 'Broadcast Time']}
              />
              <Bar dataKey="durationHours" fill="#00f0ff" radius={[0, 4, 4, 0]}>
                {top10Games.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#06b6d4' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All 200 Games Table */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div>
            <h3 className="text-base font-semibold text-white">
              All Streamed Games Directory
            </h3>
            <span className="text-xs text-zinc-500">
              Showing {filteredGames.length} of {data.length} games
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search game..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">#</th>
                <th className="py-2.5 font-medium">Game Title</th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('durationHours')}
                >
                  <span className="flex items-center gap-1">
                    Hours Played <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('timeShare')}
                >
                  <span className="flex items-center gap-1">
                    Playtime Share <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('peakViewers')}
                >
                  <span className="flex items-center gap-1">
                    Peak Viewers <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('avgViewers')}
                >
                  <span className="flex items-center gap-1">
                    Avg Viewers <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th className="py-2.5 font-medium">Followers / Hr</th>
                <th className="py-2.5 font-medium">Last Broadcast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {paginatedGames.map((game, idx) => (
                <tr key={game.name} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 text-zinc-500">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-3 font-medium text-white max-w-[220px] truncate" title={game.name}>
                    {game.name}
                  </td>
                  <td className="py-3 font-semibold text-white">
                    {game.durationHours.toLocaleString()} hrs
                  </td>
                  <td className="py-3 text-zinc-300">
                    {game.timeShare}%
                  </td>
                  <td className="py-3 text-purple-400 font-medium">
                    {game.peakViewers.toLocaleString()}
                  </td>
                  <td className="py-3 text-zinc-300">
                    {game.avgViewers.toLocaleString()}
                  </td>
                  <td className="py-3 text-emerald-400 font-medium">
                    +{game.followersPerHour}
                  </td>
                  <td className="py-3 text-zinc-400 font-mono text-[11px]">
                    {game.lastSeen || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
