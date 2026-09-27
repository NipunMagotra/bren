import React, { useState } from 'react';
import { TrendsData } from '../types';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface TrendsSectionProps {
  data: TrendsData;
}

export const TrendsSection: React.FC<TrendsSectionProps> = ({ data }) => {
  const { dailyTimeline, hourlyTrends, dayOfWeekTrends } = data;

  const [activeMetric, setActiveMetric] = useState<'streams' | 'totalViewers' | 'matureRate'>('streams');

  // Peak calculations
  const maxDayStreams = dailyTimeline.reduce((prev, current) => (prev.streams > current.streams) ? prev : current);
  const peakHour = hourlyTrends.reduce((prev, current) => (prev.streams > current.streams) ? prev : current);
  const peakDayOfWeek = dayOfWeekTrends.reduce((prev, current) => (prev.streams > current.streams) ? prev : current);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Trends &amp; Timeline
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Analyzing 31 consecutive collection days (Oct 13 – Nov 12, 2024), diurnal hourly cycles, and day-of-week distribution.
          </p>
        </div>
      </div>

      {/* Summary Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="text-xs text-zinc-500 mb-1">
            Peak activity date
          </div>
          <div className="text-2xl font-bold text-white">
            {maxDayStreams.date}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {maxDayStreams.streams.toLocaleString()} streams • {maxDayStreams.channels.toLocaleString()} active channels
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="text-xs text-zinc-500 mb-1">
            Peak diurnal hour
          </div>
          <div className="text-2xl font-bold text-white">
            {peakHour.hour}:00 UTC
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {peakHour.streams.toLocaleString()} captures • {peakHour.avgViewers.toFixed(1)} avg viewers
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="text-xs text-zinc-500 mb-1">
            Busiest day of week
          </div>
          <div className="text-2xl font-bold text-white">
            {peakDayOfWeek.day}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {peakDayOfWeek.streams.toLocaleString()} total streams captured
          </p>
        </div>
      </div>

      {/* Main Interactive Daily Timeline */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/60 gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              Daily timeline
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">31-day monitoring window from Oct 13 to Nov 12, 2024</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveMetric('streams')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMetric === 'streams' 
                  ? 'bg-zinc-800 text-white border border-zinc-700' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Stream Volume
            </button>
            <button
              onClick={() => setActiveMetric('totalViewers')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMetric === 'totalViewers' 
                  ? 'bg-zinc-800 text-white border border-zinc-700' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Total Viewers
            </button>
            <button
              onClick={() => setActiveMetric('matureRate')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMetric === 'matureRate' 
                  ? 'bg-zinc-800 text-white border border-zinc-700' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Mature %
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="cleanTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={activeMetric === 'matureRate' ? '#f43f5e' : activeMetric === 'totalViewers' ? '#10b981' : '#00f0ff'} 
                    stopOpacity={0.2}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={activeMetric === 'matureRate' ? '#f43f5e' : activeMetric === 'totalViewers' ? '#10b981' : '#00f0ff'} 
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#71717a" 
                fontSize={11} 
                tickFormatter={(val) => val.slice(5)} 
              />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(val: any) => [
                  activeMetric === 'matureRate' ? `${val}%` : val.toLocaleString(),
                  activeMetric === 'streams' ? 'Streams' : activeMetric === 'totalViewers' ? 'Audience' : 'Mature Rate'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={activeMetric === 'matureRate' ? '#f43f5e' : activeMetric === 'totalViewers' ? '#10b981' : '#00f0ff'} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#cleanTrendGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: 24-Hour Diurnal Cycle & Day of Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 24-Hour UTC Activity Pattern */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              24-hour diurnal cycle (UTC)
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">Stream volume distribution across hours of the day</p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="hour" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickFormatter={(val) => `${val}h`} 
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  labelFormatter={(val) => `${val}:00 - ${Number(val) + 1}:00 UTC`}
                  formatter={(val: any) => [`${val.toLocaleString()} streams`, 'Streams']}
                />
                <Bar dataKey="streams" fill="#00f0ff" radius={[4, 4, 0, 0]}>
                  {hourlyTrends.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hour >= 15 && entry.hour <= 22 ? '#00f0ff' : '#27272a'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Peak broadcast window:</span>
            <span className="text-zinc-200 font-medium">15:00 – 22:00 UTC</span>
          </div>
        </div>

        {/* Day of Week Analysis */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Day-of-week distribution
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">Aggregated stream volume by weekday</p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickFormatter={(val) => val.slice(0, 3)} 
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} streams`, 'Streams']}
                />
                <Bar dataKey="streams" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {dayOfWeekTrends.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.day === 'Saturday' || entry.day === 'Sunday' ? '#a3e635' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Weekend activity:</span>
            <span className="text-zinc-200 font-medium">Slightly elevated on Saturdays and Sundays</span>
          </div>
        </div>
      </div>
    </div>
  );
};
