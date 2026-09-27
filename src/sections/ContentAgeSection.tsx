import React from 'react';
import { ContentAgeData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ContentAgeSectionProps {
  data: ContentAgeData;
}

export const ContentAgeSection: React.FC<ContentAgeSectionProps> = ({ data }) => {
  const { esrbDistribution, pegiDistribution, labelStats, auditBySource } = data;

  // Format ESRB data for chart
  const esrbData = Object.entries(esrbDistribution)
    .filter(([rating]) => rating !== 'Unrated / Unknown')
    .map(([rating, count]) => ({
      name: rating,
      count,
      percentage: ((count / 45185) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // Format PEGI data for chart
  const pegiData = Object.entries(pegiDistribution)
    .filter(([rating]) => rating !== 'Unrated / Unknown')
    .map(([rating, count]) => ({
      name: rating,
      count,
      percentage: ((count / 45185) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // Overall compliance metrics
  const totalAuditRecords = auditBySource.reduce((acc, curr) => acc + curr.totalStreams, 0);
  const totalMatureInFamily = auditBySource.reduce((acc, curr) => acc + curr.matureStreams, 0);
  const totalProfanityInFamily = auditBySource.reduce((acc, curr) => acc + curr.profanityCount, 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Content & Age Ratings
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Cross-referencing Twitch streams crawled under family-friendly tags against IGDB Age Ratings and Twitch Content Labels.
          </p>
        </div>
      </div>

      {/* Critical Finding Card */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Tag suitability findings
            </h3>
            <span className="px-2 py-0.5 rounded text-xs bg-rose-950/40 text-rose-300 border border-rose-900/50">
              8,100 mature-rated streams
            </span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            The dataset collection queried tags intended for all-ages audiences (such as <code className="text-cyan-400 font-mono">#FamilyFriendly</code>, <code className="text-cyan-400 font-mono">#SafeSpace</code>, <code className="text-cyan-400 font-mono">#SFW</code>, and <code className="text-cyan-400 font-mono">#kids</code>). 
            Despite these tags, <strong className="text-white">8,100 streams (17.9%)</strong> were flagged with Twitch's <strong className="text-white">Mature (18+)</strong> flag or were playing games officially classified by ESRB/PEGI as <strong className="text-white">Mature 17+ / PEGI 18</strong> (e.g., Grand Theft Auto V, Dead by Daylight) or reported Content Classification Labels for profanity or graphic violence.
          </p>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800/60 text-xs">
          <div className="p-3 rounded-md bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Streams with mature flag</span>
            <span className="text-xl font-semibold text-rose-400">{totalMatureInFamily.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 block mt-1">17.9% of safety-tagged corpus</span>
          </div>
          <div className="p-3 rounded-md bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Streams with profanity label</span>
            <span className="text-xl font-semibold text-amber-400">{totalProfanityInFamily.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 block mt-1">Self-reported vulgarity</span>
          </div>
          <div className="p-3 rounded-md bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Total records analyzed</span>
            <span className="text-xl font-semibold text-white">{totalAuditRecords.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 block mt-1">Across 8 discovery query tags</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: ESRB Distribution & PEGI Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ESRB Ratings */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              ESRB rating distribution
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              North American game age classifications mapped from IGDB
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esrbData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={11} 
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} streams`, 'Streams']}
                />
                <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]}>
                  {esrbData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name.includes('Mature') ? '#f43f5e' : entry.name.includes('Teen') ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Everyone (E/E10+) &amp; Teen titles:</span>
            <span className="text-zinc-200 font-medium">
              {(esrbData.filter(d => d.name.includes('Everyone') || d.name.includes('Teen')).reduce((a, b) => a + b.count, 0)).toLocaleString()} streams
            </span>
          </div>
        </div>

        {/* PEGI Ratings */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              PEGI rating distribution
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              European game age ratings (PEGI 3, 7, 12, 16, 18)
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pegiData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={11} 
                />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} streams`, 'Streams']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {pegiData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'PEGI 18' ? '#f43f5e' : entry.name === 'PEGI 16' ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>PEGI 18 titles under safe tags:</span>
            <span className="text-rose-400 font-medium">
              {(pegiData.find(d => d.name === 'PEGI 18')?.count || 0).toLocaleString()} streams
            </span>
          </div>
        </div>
      </div>

      {/* Twitch Content Classification Labels Breakdown */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="pb-3 border-b border-zinc-800/60">
          <h3 className="text-base font-semibold text-white">
            Twitch Content Classification Labels
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5">
            Content descriptors applied via Twitch Helix API
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {labelStats.map(lbl => (
            <div key={lbl.label} className="p-3.5 rounded-md bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white text-xs">
                    {lbl.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {lbl.percentage}%
                  </span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {lbl.count.toLocaleString()} <span className="text-xs font-normal text-zinc-500">streams</span>
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
                <span>Mature flagged:</span>
                <span className={lbl.matureRate > 50 ? 'text-rose-400 font-medium' : 'text-zinc-300'}>
                  {lbl.matureRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discovery Source Crawl Audit Cross-Tabulation */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="pb-3 border-b border-zinc-800/60">
          <h3 className="text-base font-semibold text-white">
            Tag crawl breakdown
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5">
            Detailed breakdown of mature flags, profanity labels, and adult-rated games for each queried directory tag
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">Source tag</th>
                <th className="py-2.5 font-medium">Total streams</th>
                <th className="py-2.5 font-medium">Mature flag (18+)</th>
                <th className="py-2.5 font-medium">Mature %</th>
                <th className="py-2.5 font-medium">M-rated games</th>
                <th className="py-2.5 font-medium">Profanity labels</th>
                <th className="py-2.5 font-medium">Violence labels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {auditBySource.map(st => (
                <tr key={st.sourceTag} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 font-medium text-cyan-300">
                    #{st.sourceTag}
                  </td>
                  <td className="py-2.5 text-zinc-300">{st.totalStreams.toLocaleString()}</td>
                  <td className="py-2.5 text-rose-400">{st.matureStreams.toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      st.matureRate > 15
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {st.matureRate}%
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-300">{st.matureRatedGames.toLocaleString()}</td>
                  <td className="py-2.5 text-amber-400">{st.profanityCount.toLocaleString()}</td>
                  <td className="py-2.5 text-zinc-300">{st.violentCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
