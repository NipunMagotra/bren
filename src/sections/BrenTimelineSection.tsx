import React, { useState, useMemo } from 'react';
import { BrenMonthlyItem } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';

interface BrenTimelineSectionProps {
  data: BrenMonthlyItem[];
}

export const BrenTimelineSection: React.FC<BrenTimelineSectionProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'avgViewers' | 'peakViewers' | 'hoursStreamed' | 'followersGain'>('avgViewers');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const availableYears = useMemo(() => {
    const s = new Set<number>();
    data.forEach(d => s.add(d.year));
    return Array.from(s).sort((a, b) => b - a);
  }, [data]);

  const filteredData = useMemo(() => {
    if (yearFilter === 'ALL') return data;
    return data.filter(d => d.year.toString() === yearFilter);
  }, [data, yearFilter]);

  // Chronological for chart (oldest to newest)
  const chartData = useMemo(() => {
    return [...filteredData].reverse();
  }, [filteredData]);

  // Paginated table data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedTable = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            10-Year Career Timeline (2016 – 2026)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Historical monthly metrics tracking Bren from his very first broadcast in December 2016 through today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-600"
          >
            <option value="ALL">All 10 Years ({data.length} months)</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/60 gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              Career Trajectory &amp; Growth
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Continuous 116-month monitoring across all broadcast periods
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedMetric('avgViewers')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedMetric === 'avgViewers' 
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-medium' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Avg Viewers
            </button>
            <button
              onClick={() => setSelectedMetric('peakViewers')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedMetric === 'peakViewers' 
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-medium' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Peak Viewers
            </button>
            <button
              onClick={() => setSelectedMetric('hoursStreamed')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedMetric === 'hoursStreamed' 
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-medium' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Hours Streamed
            </button>
            <button
              onClick={() => setSelectedMetric('followersGain')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedMetric === 'followersGain' 
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-medium' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Followers Gain
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="brenTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#71717a" 
                fontSize={11} 
                tickFormatter={(val) => val.slice(0, 7)} 
              />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(val: any) => [
                  selectedMetric === 'hoursStreamed' ? `${val} hrs` : val.toLocaleString(),
                  selectedMetric === 'avgViewers' ? 'Avg Viewers' : 
                  selectedMetric === 'peakViewers' ? 'Peak Viewers' :
                  selectedMetric === 'hoursStreamed' ? 'Broadcast Hours' : 'Followers Gain'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#00f0ff" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#brenTimelineGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Stats Table */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
          <div>
            <h3 className="text-base font-semibold text-white">
              Monthly Breakdown Records
            </h3>
            <span className="text-xs text-zinc-500">
              Showing {filteredData.length} recorded months from {data[data.length - 1]?.month} to {data[0]?.month}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">Month</th>
                <th className="py-2.5 font-medium">Avg Viewers</th>
                <th className="py-2.5 font-medium">Peak Viewers</th>
                <th className="py-2.5 font-medium">Hours Streamed</th>
                <th className="py-2.5 font-medium">Total Followers</th>
                <th className="py-2.5 font-medium">Followers Gained</th>
                <th className="py-2.5 font-medium">Followers / Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {paginatedTable.map((row) => (
                <tr key={row.month} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-medium text-white">
                    {row.month.slice(0, 7)}
                  </td>
                  <td className="py-3 text-zinc-200 font-semibold">
                    {row.avgViewers.toLocaleString()}
                  </td>
                  <td className="py-3 text-purple-400 font-medium">
                    {row.peakViewers.toLocaleString()}
                  </td>
                  <td className="py-3 text-zinc-300">
                    {row.hoursStreamed} hrs
                  </td>
                  <td className="py-3 text-zinc-300">
                    {row.followers.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`font-medium ${row.followersGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.followersGain > 0 ? `+${row.followersGain.toLocaleString()}` : row.followersGain.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">
                    {row.followersPerHour} /hr
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
