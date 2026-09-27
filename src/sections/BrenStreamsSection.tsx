import React, { useState, useMemo } from 'react';
import { BrenStreamItem } from '../types';
import { Search, Download, ExternalLink } from 'lucide-react';

interface BrenStreamsSectionProps {
  data: BrenStreamItem[];
}

export const BrenStreamsSection: React.FC<BrenStreamsSectionProps> = ({ data }) => {
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Extract unique games for filter dropdown
  const uniqueGames = useMemo(() => {
    const s = new Set<string>();
    data.forEach(st => {
      st.games.forEach(g => s.add(g));
    });
    return Array.from(s).sort();
  }, [data]);

  const filteredStreams = useMemo(() => {
    const sLower = search.toLowerCase().trim();
    return data.filter(st => {
      const matchSearch = !sLower || 
        st.date.toLowerCase().includes(sLower) || 
        st.streamId.includes(sLower) ||
        st.games.some(g => g.toLowerCase().includes(sLower));

      const matchGame = selectedGame === 'ALL' || st.games.includes(selectedGame);
      return matchSearch && matchGame;
    });
  }, [data, search, selectedGame]);

  const totalPages = Math.max(1, Math.ceil(filteredStreams.length / pageSize));
  const paginatedStreams = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStreams.slice(start, start + pageSize);
  }, [filteredStreams, page, pageSize]);

  // CSV Export handler
  const handleExportCsv = () => {
    if (filteredStreams.length === 0) return;

    const headers = ["Broadcast Date (UTC)", "Stream ID", "Primary Game", "All Games Played"];
    const rows = filteredStreams.map(st => [
      `"${st.date}"`,
      `"${st.streamId}"`,
      `"${st.primaryGame.replace(/"/g, '""')}"`,
      `"${st.games.join(', ').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bren_streams_archive_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Broadcast Archive ({data.length.toLocaleString()} Recorded Streams)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Complete stream-by-stream logs from December 11, 2016 to the latest stream on September 27, 2026.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={filteredStreams.length === 0}
          className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV ({filteredStreams.length.toLocaleString()} Streams)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search date, stream ID, or game..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>

          <select
            value={selectedGame}
            onChange={(e) => { setSelectedGame(e.target.value); setPage(1); }}
            className="w-full sm:w-64 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All Games ({uniqueGames.length})</option>
            {uniqueGames.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-500 pt-1 border-t border-zinc-800/40">
          Showing <strong className="text-zinc-300">{filteredStreams.length.toLocaleString()}</strong> matching broadcasts
        </div>
      </div>

      {/* Streams Table */}
      <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">#</th>
                <th className="py-2.5 font-medium">Broadcast Date (UTC)</th>
                <th className="py-2.5 font-medium">Stream ID</th>
                <th className="py-2.5 font-medium">Primary Category</th>
                <th className="py-2.5 font-medium">All Games Broadcast</th>
                <th className="py-2.5 font-medium text-right">Twitch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {paginatedStreams.map((st, idx) => (
                <tr key={`${st.streamId}-${st.date}`} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 text-zinc-500">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-3 font-medium text-white font-mono text-[11px] whitespace-nowrap">
                    {st.date}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-zinc-400">
                    {st.streamId || '—'}
                  </td>
                  <td className="py-3 font-medium text-cyan-300">
                    {st.primaryGame}
                  </td>
                  <td className="py-3 text-zinc-300">
                    <div className="flex flex-wrap gap-1 max-w-[320px]">
                      {st.games.map(g => (
                        <span key={g} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href="https://www.twitch.tv/bren"
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-purple-400 inline-flex items-center gap-1 transition-colors"
                      title="Visit Twitch Channel"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
