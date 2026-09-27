import React from 'react';
import { OverviewData } from '../types';
import { MetricCard } from '../components/MetricCard';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Database, 
  Users, 
  Gamepad2, 
  Calendar, 
  Eye, 
  ShieldAlert, 
  Globe2, 
  Award,
  ArrowUpRight
} from 'lucide-react';

interface OverviewSectionProps {
  data: OverviewData;
  onNavigateToTab: (tab: any) => void;
}

const COLORS = ['#00f0ff', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6', '#eab308'];

export const OverviewSection: React.FC<OverviewSectionProps> = ({ data, onNavigateToTab }) => {
  const { headline, topGames, topTags, topLanguages, sourceTags, dailyTimeline } = data;

  return (
    <div className="space-y-8">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Total Records"
          value={headline.totalRecords.toLocaleString()}
          subtext="832 snapshots over 31 days"
          accent="cyan"
          icon={<Database className="w-4 h-4" />}
        />
        <MetricCard
          label="Unique Channels"
          value={headline.uniqueChannels.toLocaleString()}
          subtext="Distinct broadcaster identities"
          accent="lime"
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          label="Games Tracked"
          value={headline.uniqueGames.toLocaleString()}
          subtext="Matched against IGDB catalog"
          accent="purple"
          icon={<Gamepad2 className="w-4 h-4" />}
        />
        <MetricCard
          label="Collection Window"
          value={`${headline.totalDays} Days`}
          subtext="Oct 13 – Nov 12, 2024"
          accent="amber"
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Total Viewers"
          value={headline.totalViewersTracked.toLocaleString()}
          subtext={`Avg ${headline.avgViewers.toFixed(0)} per stream · Peak ${headline.maxViewers.toLocaleString()}`}
          accent="cyan"
          icon={<Eye className="w-4 h-4" />}
        />
        <MetricCard
          label="Mature Flagged"
          value={`${headline.maturePercentage}%`}
          subtext={`${headline.matureCount.toLocaleString()} streams with 18+ flags`}
          accent="pink"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <MetricCard
          label="Unique Tags"
          value={headline.uniqueTagsCount.toLocaleString()}
          subtext="Streamer-applied metadata tags"
          accent="lime"
          icon={<Award className="w-4 h-4" />}
        />
        <MetricCard
          label="Languages"
          value={headline.uniqueLanguagesCount}
          subtext={`Most common: ${topLanguages[0]?.lang.toUpperCase()} (${topLanguages[0]?.percentage}%)`}
          accent="purple"
          icon={<Globe2 className="w-4 h-4" />}
        />
      </div>

      {/* Charts: Daily Activity + Top Games */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Stream Timeline */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
            <div>
              <h3 className="text-base font-semibold text-white">Daily Stream Activity</h3>
              <p className="text-sm text-zinc-500 mt-0.5">Stream volume and active channels over the collection period</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Streams
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Channels
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="channelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#3f3f46" 
                  fontSize={11} 
                  tickFormatter={(val) => val.slice(5)} 
                />
                <YAxis stroke="#3f3f46" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0e14', borderColor: '#27272a', borderRadius: '8px', fontSize: '13px' }}
                  labelStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="streams" name="Streams" stroke="#00f0ff" strokeWidth={1.5} fillOpacity={1} fill="url(#streamGrad)" />
                <Area type="monotone" dataKey="channels" name="Active Channels" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#channelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Games */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col">
          <div className="pb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Top Games</h3>
            <button 
              onClick={() => onNavigateToTab('games')}
              className="text-sm text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1 transition-colors"
            >
              See all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {topGames.slice(0, 6).map((game, idx) => (
              <div key={game.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 truncate max-w-[180px]" title={game.name}>
                    <span className="text-zinc-600 mr-1.5">{idx + 1}.</span>
                    {game.name}
                  </span>
                  <span className="text-zinc-400 tabular-nums">{game.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500/70 rounded-full" 
                    style={{ width: `${(game.count / topGames[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Tags Table + Language Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Source Tags */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Source Tag Breakdown</h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                Tags crawled by the collector and their mature content rates
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('content-age')}
              className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2 font-medium">Tag</th>
                  <th className="pb-2 font-medium">Records</th>
                  <th className="pb-2 font-medium">Share</th>
                  <th className="pb-2 font-medium">Mature</th>
                  <th className="pb-2 font-medium">Mature %</th>
                  <th className="pb-2 font-medium">Avg Viewers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {sourceTags.slice(0, 7).map((st) => (
                  <tr key={st.sourceTag} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 font-medium text-zinc-200">
                      #{st.sourceTag}
                    </td>
                    <td className="py-2.5 text-zinc-400 tabular-nums">{st.count.toLocaleString()}</td>
                    <td className="py-2.5 text-zinc-500 tabular-nums">{st.percentage}%</td>
                    <td className="py-2.5 text-pink-400 tabular-nums">{st.matureCount.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={`tabular-nums ${st.matureRate > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {st.matureRate}%
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-400 tabular-nums">{st.avgViewers.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-4">
            <h3 className="text-base font-semibold text-white">Languages</h3>
            <p className="text-sm text-zinc-500 mt-0.5">Broadcast language distribution</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topLanguages}
                  dataKey="count"
                  nameKey="lang"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={38}
                  paddingAngle={3}
                >
                  {topLanguages.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0e14', borderColor: '#27272a', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(val: any, name: any) => [`${val.toLocaleString()} streams`, String(name).toUpperCase()]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3 border-t border-zinc-800/60 text-sm">
            {topLanguages.slice(0, 6).map((lang, idx) => (
              <div key={lang.lang} className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {lang.lang.toUpperCase()}
                </span>
                <span className="text-zinc-300 tabular-nums">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Tags */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Popular Tags</h3>
            <p className="text-sm text-zinc-500 mt-0.5">Most frequently used streamer tags</p>
          </div>
          <button
            onClick={() => onNavigateToTab('tags')}
            className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            Tag matrix <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <button 
              key={tag.tag}
              className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors flex items-center gap-2 text-sm"
              onClick={() => onNavigateToTab('tags')}
            >
              <span className="text-zinc-300">#{tag.tag}</span>
              <span className="text-zinc-600 tabular-nums">{tag.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
