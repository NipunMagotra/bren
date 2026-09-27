import React, { useState, useEffect, useMemo } from 'react';
import { ExplorerData } from '../types';
import { fetchExplorerRecords } from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { 
  Search, 
  Download, 
  ArrowUpDown, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw
} from 'lucide-react';

export const DataExplorerSection: React.FC = () => {
  const [data, setData] = useState<ExplorerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [selectedLang, setSelectedLang] = useState('ALL');
  const [selectedMature, setSelectedMature] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');

  // Sorting state
  const [sortCol, setSortCol] = useState<number>(0); // 0: time, 4: viewers, 5: mature, 3: game
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Copied hash state
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Row expansion state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Lazy load records
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchExplorerRecords()
      .then(res => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message || 'Failed to load Explorer records');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Top games list for filter dropdown
  const gameOptions = useMemo(() => {
    if (!data) return [];
    return data.games.slice(0, 50);
  }, [data]);

  // Languages list
  const langOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.records.slice(0, 5000).forEach(r => set.add(r[2]));
    return Array.from(set).sort();
  }, [data]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!data) return [];
    const sLower = search.toLowerCase().trim();

    return data.records.filter(r => {
      // 0: time, 1: ch_idx, 2: lang, 3: game_idx, 4: viewers, 5: mature, 6: age_rating, 7: labels, 8: src_idx, 9: title
      const chName = data.channels[r[1]];
      const gmName = data.games[r[3]];
      const srcName = data.sources[r[8]];
      const title = r[9];

      // Text search
      if (sLower) {
        const matchTitle = title.toLowerCase().includes(sLower);
        const matchGame = gmName.toLowerCase().includes(sLower);
        const matchCh = chName.toLowerCase().includes(sLower);
        if (!matchTitle && !matchGame && !matchCh) return false;
      }

      // Game filter
      if (selectedGame !== 'ALL' && gmName !== selectedGame) {
        return false;
      }

      // Language filter
      if (selectedLang !== 'ALL' && r[2].toLowerCase() !== selectedLang.toLowerCase()) {
        return false;
      }

      // Mature filter
      if (selectedMature === 'FAMILY' && r[5] === 1) return false;
      if (selectedMature === 'MATURE' && r[5] === 0) return false;

      // Source Crawl Tag filter
      if (selectedSource !== 'ALL' && srcName !== selectedSource) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortCol];
      let valB: any = b[sortCol];

      if (sortCol === 1) {
        valA = data.channels[a[1]];
        valB = data.channels[b[1]];
      } else if (sortCol === 3) {
        valA = data.games[a[3]];
        valB = data.games[b[3]];
      }

      if (sortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [data, search, selectedGame, selectedLang, selectedMature, selectedSource, sortCol, sortAsc]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGame, selectedLang, selectedMature, selectedSource, pageSize]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Handle Sort
  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIndex);
      setSortAsc(false);
    }
  };

  // CSV Export handler
  const handleExportCsv = () => {
    if (!data || filteredRecords.length === 0) return;

    const headers = ["Timestamp", "Channel Hash", "Language", "Game", "Viewer Count", "Is Mature", "Age Rating", "Classification Labels", "Source Tag", "Stream Title"];
    
    const exportLimit = Math.min(filteredRecords.length, 10000);
    const rows = filteredRecords.slice(0, exportLimit).map(r => [
      `"${r[0]}"`,
      `"${data.channels[r[1]]}"`,
      `"${r[2]}"`,
      `"${data.games[r[3]].replace(/"/g, '""')}"`,
      r[4],
      r[5] ? "TRUE" : "FALSE",
      `"${r[6]}"`,
      `"${r[7].replace(/"/g, '""')}"`,
      `"${data.sources[r[8]]}"`,
      `"${r[9].replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `twitch_dataset_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedGame('ALL');
    setSelectedLang('ALL');
    setSelectedMature('ALL');
    setSelectedSource('ALL');
  };

  if (loading) {
    return (
      <LoadingState 
        message="Loading stream records..." 
        subtext="Indexing dataset snapshots and metadata..." 
      />
    );
  }

  if (error || !data) {
    return <ErrorState error={error || 'Failed to initialize dataset index'} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Record Explorer
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Search, filter, and inspect {data.records.length.toLocaleString()} stream records with complete metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredRecords.length === 0}
            className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredRecords.length.toLocaleString()})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <span className="text-xs font-medium text-zinc-300">
            Filters
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search title, channel, game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Game filter */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All games ({data.games.length})</option>
            {gameOptions.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Language filter */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All languages</option>
            {langOptions.map(l => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>

          {/* Mature filter */}
          <select
            value={selectedMature}
            onChange={(e) => setSelectedMature(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All ratings</option>
            <option value="FAMILY">Non-mature only</option>
            <option value="MATURE">Mature (18+) only</option>
          </select>

          {/* Source Crawl Tag filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All crawl tags</option>
            {data.sources.map(s => (
              <option key={s} value={s}>#{s}</option>
            ))}
          </select>
        </div>

        {/* Filter stats bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-800/40">
          <span>
            Showing <strong className="text-zinc-300 font-medium">{filteredRecords.length.toLocaleString()}</strong> of {data.records.length.toLocaleString()} records
          </span>
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            {[15, 25, 50, 100].map(size => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-1.5 py-0.5 rounded text-xs ${
                  pageSize === size ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState onAction={resetFilters} />
      ) : (
        <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th 
                    className="py-2.5 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort(0)}
                  >
                    <span className="flex items-center gap-1">
                      Time (UTC) <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </span>
                  </th>
                  <th className="py-2.5 font-medium">Channel hash</th>
                  <th 
                    className="py-2.5 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort(3)}
                  >
                    <span className="flex items-center gap-1">
                      Game / Category <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </span>
                  </th>
                  <th 
                    className="py-2.5 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort(4)}
                  >
                    <span className="flex items-center gap-1">
                      Viewers <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </span>
                  </th>
                  <th 
                    className="py-2.5 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort(5)}
                  >
                    <span className="flex items-center gap-1">
                      Rating <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </span>
                  </th>
                  <th className="py-2.5 font-medium">Age rating</th>
                  <th className="py-2.5 font-medium">Crawl tag</th>
                  <th className="py-2.5 font-medium">Stream title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedRecords.map((r, rowIdx) => {
                  const chName = data.channels[r[1]];
                  const gmName = data.games[r[3]];
                  const srcName = data.sources[r[8]];
                  const isExpanded = expandedIndex === rowIdx;

                  return (
                    <React.Fragment key={`${r[0]}-${r[1]}-${rowIdx}`}>
                      <tr 
                        className="hover:bg-zinc-900/40 transition-colors cursor-pointer"
                        onClick={() => setExpandedIndex(isExpanded ? null : rowIdx)}
                      >
                        <td className="py-2.5 text-zinc-400 whitespace-nowrap">
                          {r[0]}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <code className="text-zinc-300 bg-zinc-900/80 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-800" title={chName}>
                              {chName.slice(0, 8)}...{chName.slice(-4)}
                            </code>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(chName); }}
                              className="text-zinc-500 hover:text-zinc-300 p-0.5"
                              title="Copy SHA-256 hash"
                            >
                              {copiedHash === chName ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 font-medium text-zinc-200 max-w-[170px] truncate" title={gmName}>
                          {gmName}
                        </td>
                        <td className="py-2.5 font-semibold text-white">
                          {r[4].toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          {r[5] ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/50 text-[10px] font-medium">
                              18+ Mature
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px]">
                              Safe
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-zinc-300">
                          {r[6] !== 'Unrated' ? (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300 border border-zinc-800">
                              {r[6]}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">Unrated</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span className="text-zinc-400 text-xs">
                            #{srcName}
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-400 max-w-[220px] truncate" title={r[9]}>
                          {r[9] || <span className="text-zinc-600 italic">No Title</span>}
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-zinc-950/80">
                          <td colSpan={8} className="p-4 border-y border-zinc-800 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-zinc-500 block mb-0.5">Stream title</span>
                                <p className="text-zinc-200">{r[9] || 'No Title'}</p>
                                <span className="text-zinc-500 block mt-2.5 mb-0.5">Classification labels</span>
                                <p className="text-zinc-300">{r[7] || 'None'}</p>
                              </div>
                              <div>
                                <span className="text-zinc-500 block mb-0.5">Broadcaster hash (SHA-256)</span>
                                <code className="text-zinc-300 font-mono block break-all select-all bg-zinc-900 p-2 rounded border border-zinc-800">{chName}</code>
                                <div className="flex items-center gap-4 mt-2.5 text-zinc-400">
                                  <span>Language: <strong className="text-zinc-200">{r[2].toUpperCase()}</strong></span>
                                  <span>Crawl tag: <strong className="text-zinc-200">#{srcName}</strong></span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
            <div className="text-zinc-500">
              Page <strong className="text-zinc-300">{currentPage}</strong> of <strong className="text-zinc-300">{totalPages}</strong> ({filteredRecords.length.toLocaleString()} records)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-white font-medium">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
