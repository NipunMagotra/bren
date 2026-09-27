import React, { useState, useMemo } from 'react';
import { BrenClipItem, BrenVodItem } from '../types';
import { Play, Video, ExternalLink, Search, Clock, Eye, Sparkles } from 'lucide-react';

interface Props {
  clips: BrenClipItem[];
  vods: BrenVodItem[];
}

export const BrenClipsSection: React.FC<Props> = ({ clips, vods }) => {
  const [activeSubTab, setActiveSubTab] = useState<'clips' | 'vods'>('clips');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');

  // Extract unique games
  const uniqueGames = useMemo(() => {
    const list = new Set<string>();
    clips.forEach(c => list.add(c.game));
    vods.forEach(v => list.add(v.game));
    return ['ALL', ...Array.from(list).sort()];
  }, [clips, vods]);

  // Filter clips
  const filteredClips = useMemo(() => {
    return clips.filter(clip => {
      const matchSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clip.curator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGame = selectedGame === 'ALL' || clip.game === selectedGame;
      return matchSearch && matchGame;
    });
  }, [clips, searchTerm, selectedGame]);

  // Filter VODs
  const filteredVods = useMemo(() => {
    return vods.filter(vod => {
      const matchSearch = vod.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGame = selectedGame === 'ALL' || vod.game === selectedGame;
      return matchSearch && matchGame;
    });
  }, [vods, searchTerm, selectedGame]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#26262b]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white tracking-tight">Top Clips & Broadcast VODs</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#1e2026] text-purple-400 border border-purple-500/20">
              Twitch Public Media Archive
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Official high-engagement clips from Bren's stream history and recent broadcast archives.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center bg-[#14151a] p-1 rounded-lg border border-[#26262b] self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('clips')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeSubTab === 'clips'
                ? 'bg-[#26262b] text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top Clips ({clips.length})
          </button>
          <button
            onClick={() => setActiveSubTab('vods')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeSubTab === 'vods'
                ? 'bg-[#26262b] text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-blue-400" />
            Recent VODs ({vods.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeSubTab === 'clips' ? "Search clips by title or clipper..." : "Search VOD titles..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#14151a] border border-[#26262b] rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-[#14151a] border border-[#26262b] rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-[#3f3f46]"
        >
          {uniqueGames.map((g) => (
            <option key={g} value={g}>
              {g === 'ALL' ? 'All Categories' : g}
            </option>
          ))}
        </select>
      </div>

      {/* CLIPS GRID */}
      {activeSubTab === 'clips' && (
        <div>
          {filteredClips.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              No clips found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClips.map((clip) => (
                <a
                  key={clip.id}
                  href={clip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#14151a] rounded-xl border border-[#26262b] overflow-hidden hover:border-[#3f3f46] transition-all flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-mono text-neutral-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {clip.durationSeconds}s
                    </div>

                    {/* View Count */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1">
                      <Eye className="w-3 h-3 text-amber-400" />
                      {clip.viewCount.toLocaleString()} views
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {clip.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                        <span className="px-2 py-0.5 rounded bg-[#1e2026] text-neutral-300 border border-[#2b2d35]">
                          {clip.game}
                        </span>
                        <span>•</span>
                        <span>{clip.createdAt.slice(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#1e2026]">
                      <span>Clipped by <span className="text-neutral-300 font-medium">{clip.curator}</span></span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VODS GRID */}
      {activeSubTab === 'vods' && (
        <div>
          {filteredVods.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              No broadcast VODs found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVods.map((vod) => {
                const hrs = Math.floor(vod.lengthSeconds / 3600);
                const mins = Math.floor((vod.lengthSeconds % 3600) / 60);
                return (
                  <a
                    key={vod.id}
                    href={vod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-[#14151a] rounded-xl border border-[#26262b] overflow-hidden hover:border-[#3f3f46] transition-all flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                      {vod.thumbnailUrl ? (
                        <img
                          src={vod.thumbnailUrl}
                          alt={vod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1a1b22] text-neutral-600">
                          <Video className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-mono text-neutral-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                      </div>

                      {/* Views */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        {vod.viewCount.toLocaleString()} views
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {vod.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                          <span className="px-2 py-0.5 rounded bg-[#1e2026] text-neutral-300 border border-[#2b2d35]">
                            {vod.game}
                          </span>
                          <span>•</span>
                          <span>{vod.createdAt.slice(0, 10)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#1e2026]">
                        <span>Broadcast Archive</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
