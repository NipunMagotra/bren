import React, { useState, useMemo } from 'react';
import { StreamsData } from '../types';
import { Search, ArrowUpDown, Copy, Check } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface StreamsSectionProps {
  data: StreamsData;
}

export const StreamsSection: React.FC<StreamsSectionProps> = ({ data }) => {
  const { topChannels, totalUniqueChannels, streamFrequencyBuckets, viewerBuckets } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'streams' | 'totalViewers' | 'avgViewers' | 'maxViewers' | 'matureRate'>('streams');
  const [sortAsc, setSortAsc] = useState(false);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filtered and sorted channels
  const filteredChannels = useMemo(() => {
    return topChannels.filter(ch => {
      const matchSearch = ch.channel.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ch.primaryGame.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLang = langFilter === 'ALL' ? true : ch.language.toLowerCase() === langFilter.toLowerCase();
      return matchSearch && matchLang;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [topChannels, searchTerm, langFilter, sortField, sortAsc]);

  const handleSort = (field: 'streams' | 'totalViewers' | 'avgViewers' | 'maxViewers' | 'matureRate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Top languages list
  const availableLangs = useMemo(() => {
    const s = new Set<string>();
    topChannels.forEach(c => s.add(c.language));
    return Array.from(s).sort();
  }, [topChannels]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Streams & Broadcasters
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {totalUniqueChannels.toLocaleString()} unique channels, capture frequencies, and audience distributions.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Frequency Distribution & Viewer Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stream Frequency Chart */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Broadcaster capture frequency
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Snapshot appearance count per channel (single capture vs recurrent streamers)
            </p>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamFrequencyBuckets} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <XAxis 
                  dataKey="bucket" 
                  stroke="#71717a" 
                  fontSize={11} 
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} channels`, 'Channels']}
                />
                <Bar dataKey="channels" fill="#00f0ff" radius={[4, 4, 0, 0]}>
                  {streamFrequencyBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : index > 3 ? '#a855f7' : '#00f0ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>High-frequency streamers (&gt;20 captures):</span>
            <span className="text-zinc-200 font-medium">
              {streamFrequencyBuckets.slice(3).reduce((acc, curr) => acc + curr.channels, 0).toLocaleString()} channels
            </span>
          </div>
        </div>

        {/* Viewer Distribution Histogram */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Audience size distribution
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Concurrent viewer count tiers across all collected stream records
            </p>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewerBuckets} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis 
                  dataKey="range" 
                  stroke="#71717a" 
                  fontSize={11} 
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} records`, 'Streams']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>0 to 5 viewers:</span>
            <span className="text-zinc-200 font-medium">
              {(((viewerBuckets[0].count + viewerBuckets[1].count) / 45185) * 100).toFixed(1)}% of all records
            </span>
          </div>
        </div>
      </div>

      {/* Top Channels Table */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div>
            <h3 className="text-base font-semibold text-white">
              Most active broadcasters
            </h3>
            <span className="text-xs text-zinc-500">
              Showing {filteredChannels.length} channels
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search channel or game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 w-48 sm:w-56"
              />
            </div>

            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-600"
            >
              <option value="ALL">All languages</option>
              {availableLangs.map(l => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">#</th>
                <th className="py-2.5 font-medium">Channel hash</th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('streams')}
                >
                  <span className="flex items-center gap-1">
                    Captures <ArrowUpDown className="w-3 h-3 text-zinc-500" />
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
                  onClick={() => handleSort('maxViewers')}
                >
                  <span className="flex items-center gap-1">
                    Peak <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
                <th className="py-2.5 font-medium">Primary game</th>
                <th className="py-2.5 font-medium">Language</th>
                <th 
                  className="py-2.5 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('matureRate')}
                >
                  <span className="flex items-center gap-1">
                    Mature % <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredChannels.slice(0, 30).map((ch, idx) => (
                <tr key={ch.channel} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 text-zinc-500">{idx + 1}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <code className="text-zinc-300 bg-zinc-900/80 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-800" title={ch.channel}>
                        {ch.channel.slice(0, 8)}...{ch.channel.slice(-6)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(ch.channel)}
                        className="text-zinc-500 hover:text-zinc-200 p-0.5 transition-colors"
                        title="Copy hash"
                      >
                        {copiedHash === ch.channel ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 font-semibold text-white">
                    {ch.streams}
                  </td>
                  <td className="py-2.5 text-zinc-300">
                    {ch.totalViewers.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-zinc-300">
                    {ch.avgViewers.toFixed(1)}
                  </td>
                  <td className="py-2.5 text-zinc-300">
                    {ch.maxViewers.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-zinc-200 max-w-[170px] truncate" title={ch.primaryGame}>
                    {ch.primaryGame}
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-zinc-800">
                      {ch.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      ch.matureRate > 15
                        ? 'text-rose-400 bg-rose-950/40 border border-rose-900/50'
                        : 'text-zinc-400 bg-zinc-900 border border-zinc-800'
                    }`}>
                      {ch.matureRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
