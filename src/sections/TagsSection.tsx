import React, { useState, useMemo } from 'react';
import { TagsData, TagItem } from '../types';
import { Search } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface TagsSectionProps {
  data: TagsData;
}

export const TagsSection: React.FC<TagsSectionProps> = ({ data }) => {
  const { topTags, topCombinations, totalUniqueTags } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagItem>(topTags[0] || null);

  const filteredTags = useMemo(() => {
    return topTags.filter(t => t.tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topTags, searchTerm]);

  // Find combinations involving the selected tag
  const relatedCombinations = useMemo(() => {
    if (!selectedTag) return [];
    return topCombinations.filter(c => 
      c.tag1.toLowerCase() === selectedTag.tag.toLowerCase() || 
      c.tag2.toLowerCase() === selectedTag.tag.toLowerCase()
    ).slice(0, 8);
  }, [selectedTag, topCombinations]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Tags & Co-Occurrence
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Analyzing {totalUniqueTags.toLocaleString()} unique Twitch tags, usage frequencies, and paired combinations.
          </p>
        </div>
      </div>

      {/* Selected Tag Details Card */}
      {selectedTag && (
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800/60 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs text-zinc-500">
                <span>Selected tag</span>
                <span>•</span>
                <span>{selectedTag.percentage}% of all records</span>
              </div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-1.5">
                <span className="text-cyan-400">#</span>{selectedTag.tag}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-0.5">Occurrences</span>
                <span className="text-base font-semibold text-white">{selectedTag.count.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-0.5">Avg audience</span>
                <span className="text-base font-semibold text-white">{selectedTag.avgViewers.toFixed(1)} v</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-0.5">Mature rate</span>
                <span className={`text-base font-semibold ${selectedTag.matureRate > 15 ? 'text-rose-400' : 'text-zinc-300'}`}>
                  {selectedTag.matureRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
            {/* Top Games with this tag */}
            <div>
              <span className="text-zinc-400 font-medium block mb-2">
                Top games with #{selectedTag.tag}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTag.topGames.map(game => (
                  <span key={game} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {game}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Co-Occurring Tags */}
            <div>
              <span className="text-zinc-400 font-medium block mb-2">
                Frequently paired tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {relatedCombinations.length > 0 ? (
                  relatedCombinations.map(c => {
                    const otherTag = c.tag1.toLowerCase() === selectedTag.tag.toLowerCase() ? c.tag2 : c.tag1;
                    return (
                      <span key={c.pair} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                        <span className="text-cyan-400">#{otherTag}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">({c.count.toLocaleString()})</span>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-zinc-500">No high-frequency pairing data available.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Top Tags Chart vs Top Combinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most used tags bar chart */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Most frequently used tags
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">Top 10 tags by total stream appearances</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTags.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#71717a" fontSize={11} />
                <YAxis dataKey="tag" type="category" stroke="#71717a" fontSize={11} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val.toLocaleString()} streams`, 'Occurrences']}
                />
                <Bar dataKey="count" fill="#00f0ff" radius={[0, 4, 4, 0]}>
                  {topTags.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#00f0ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Tag Combinations */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-800/60">
            <h3 className="text-base font-semibold text-white">
              Leading tag combinations
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">Pairs of tags frequently used together on the same stream</p>
          </div>

          <div className="space-y-1.5 pt-3 flex-1 overflow-y-auto max-h-64 pr-1">
            {topCombinations.slice(0, 12).map((comb, idx) => (
              <div 
                key={comb.pair} 
                className="flex items-center justify-between p-2 rounded-md bg-zinc-900/50 border border-zinc-800/80 text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 truncate max-w-[280px]">
                  <span className="text-zinc-500 font-medium text-[11px] w-5">#{idx + 1}</span>
                  <span className="text-zinc-300">
                    <span className="text-cyan-400 font-medium">#{comb.tag1}</span>
                    <span className="text-zinc-500 mx-1.5">+</span>
                    <span className="text-lime-400 font-medium">#{comb.tag2}</span>
                  </span>
                </div>
                <span className="text-zinc-400 font-medium shrink-0">
                  {comb.count.toLocaleString()} <span className="text-zinc-600 font-normal">streams</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Browser */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div>
            <h3 className="text-base font-semibold text-white">
              Tag browser
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">Select any tag to view its details above</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 w-44 sm:w-56"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto p-0.5">
          {filteredTags.map(tag => {
            const isSelected = selectedTag?.tag === tag.tag;
            return (
              <button
                key={tag.tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-800 text-white border border-zinc-600'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <span>#{tag.tag}</span>
                <span className={`text-[10px] px-1 rounded ${
                  isSelected ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800/80 text-zinc-500'
                }`}>
                  {tag.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
