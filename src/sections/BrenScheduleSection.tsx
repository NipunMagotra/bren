import React from 'react';
import { BrenWeekItem } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Calendar, Clock, Eye, Users } from 'lucide-react';

interface BrenScheduleSectionProps {
  data: BrenWeekItem[];
}

export const BrenScheduleSection: React.FC<BrenScheduleSectionProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Broadcasting Schedule &amp; Day-of-Week Habits
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Analyzing Bren's weekly streaming patterns, active days, duration, and audience trends (UTC).
          </p>
        </div>
      </div>

      {/* 7 Days Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {data.map((day) => (
          <div key={day.day} className="p-3.5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-white block mb-1">
                {day.day}
              </span>
              <span className="text-xl font-bold text-cyan-400 block">
                {day.activeDays} <span className="text-xs font-normal text-zinc-500">days</span>
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] space-y-1 text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Avg Duration:</span>
                <span className="text-zinc-200 font-medium">{day.avgHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Viewers:</span>
                <span className="text-zinc-200 font-medium">{day.avgViewers}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Active Days vs Average Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Days Chart */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Total Active Days by Weekday
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Which days of the week Bren streams most consistently
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickFormatter={(val) => val.slice(0, 3)} 
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} broadcasts`, 'Active Days']}
                />
                <Bar dataKey="activeDays" fill="#00f0ff" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.day === 'Saturday' || entry.day === 'Sunday' ? '#a3e635' : '#00f0ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Viewers by Day */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Average Viewers by Weekday
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Concurrent audience viewership performance on each day of the week
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickFormatter={(val) => val.slice(0, 3)} 
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} viewers`, 'Average Viewers']}
                />
                <Bar dataKey="avgViewers" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
