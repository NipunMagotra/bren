import React from 'react';
import { BrenOverviewData, TabType } from '../types';
import { MetricCard } from '../components/MetricCard';
import { 
  Users, 
  Clock, 
  Eye, 
  Flame, 
  Calendar, 
  Gamepad2, 
  Trophy, 
  Sparkles,
  ExternalLink,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface BrenOverviewSectionProps {
  data: BrenOverviewData;
  onNavigateToTab: (tab: TabType) => void;
}

export const BrenOverviewSection: React.FC<BrenOverviewSectionProps> = ({ 
  data, 
  onNavigateToTab 
}) => {
  const { profile, firstStream, latestStream, topGamesSummary } = data;

  return (
    <div className="space-y-6">
      {/* Streamer Hero Banner */}
      <div className="p-6 rounded-lg bg-[#0c0e14] border border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img 
              src={profile.avatarUrl} 
              alt={profile.displayName} 
              className="w-16 h-16 rounded-xl object-cover border border-zinc-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {profile.displayName}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-medium">
                  Twitch Partner
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                {profile.bio || "Esports commentator, content creator, and variety streamer"} • Channel ID: <span className="font-mono text-zinc-300">{profile.channelId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile.socials && profile.socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors capitalize"
              >
                {s.name} <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            ))}
            <a
              href={profile.twitchUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Twitch <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={profile.twitchTrackerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              TwitchTracker <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Global Rank and Accolades Pill Strip */}
        <div className="mt-5 pt-4 border-t border-zinc-800/60 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Twitch Rank #{profile.rank.toLocaleString()} ({profile.rankCategory})
          </span>
          <span>•</span>
          <span>Rank #{profile.rankEnglish.toLocaleString()} among English streamers</span>
          <span>•</span>
          <span>Member since {profile.accountCreated || "April 2014"}</span>
          <span>•</span>
          <span>10 Years Active (Dec 2016 – Sep 2026)</span>
        </div>


      </div>


      {/* 8 Primary Career Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Total Followers"
          value={profile.totalFollowers.toLocaleString()}
          subtext="+5.2 followers per stream hour"
          icon={<Users className="w-4 h-4" />}
          accent="cyan"
        />
        <MetricCard
          label="Hours Streamed"
          value={`${profile.hoursStreamed.toLocaleString()} hrs`}
          subtext="Across 1,812 active streaming days"
          icon={<Clock className="w-4 h-4" />}
          accent="lime"
        />
        <MetricCard
          label="Hours Watched"
          value={profile.hoursWatched.toLocaleString()}
          subtext="2.06M total community watch time"
          icon={<Eye className="w-4 h-4" />}
          accent="purple"
        />
        <MetricCard
          label="Peak Viewership"
          value={profile.peakViewers.toLocaleString()}
          subtext="All-time concurrent audience peak"
          icon={<Flame className="w-4 h-4" />}
          accent="pink"
        />
        <MetricCard
          label="Average Viewers"
          value={profile.averageViewers.toLocaleString()}
          subtext="Career average concurrent viewers"
          icon={<Users className="w-4 h-4" />}
          accent="cyan"
        />
        <MetricCard
          label="Games Streamed"
          value={profile.totalGamesStreamed}
          subtext="VALORANT, Overwatch, and 198 more"
          icon={<Gamepad2 className="w-4 h-4" />}
          accent="amber"
        />
        <MetricCard
          label="Active Broadcast Days"
          value={profile.activeDays.toLocaleString()}
          subtext="Avg. 3.5 streaming days per week"
          icon={<Calendar className="w-4 h-4" />}
          accent="lime"
        />
        <MetricCard
          label="Broadcast Cadence"
          value={`${profile.dailyBroadcastTime} hrs`}
          subtext="Average stream length per broadcast"
          icon={<Clock className="w-4 h-4" />}
          accent="purple"
        />
      </div>

      {/* First Stream vs Latest Stream Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Stream */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <span className="text-xs font-medium text-zinc-400">The Beginning</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300">
              First Stream Ever
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block mb-0.5">Broadcast Date</span>
            <h4 className="text-lg font-semibold text-white">{firstStream.date}</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Duration</span>
              <span className="text-white font-medium">{firstStream.durationMinutes} min</span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Peak</span>
              <span className="text-white font-medium">{firstStream.peakViewers} viewers</span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Followers</span>
              <span className="text-white font-medium">{firstStream.followers}</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400">
            <span>Games played: </span>
            <span className="text-zinc-200 font-medium">{firstStream.games.join(', ')}</span>
          </div>
        </div>

        {/* Latest Stream */}
        <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <span className="text-xs font-medium text-emerald-400">Most Recent</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/40 border border-emerald-900/50 text-emerald-300">
              Latest Stream Broadcast
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block mb-0.5">Broadcast Date</span>
            <h4 className="text-lg font-semibold text-white">{latestStream.date}</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Duration</span>
              <span className="text-white font-medium">{Math.round(latestStream.durationMinutes / 60 * 10) / 10} hrs</span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Peak</span>
              <span className="text-white font-medium">{latestStream.peakViewers} viewers</span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block mb-0.5">Followers</span>
              <span className="text-white font-medium">{latestStream.followers.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400">
            <span>Primary game: </span>
            <span className="text-cyan-400 font-medium">{latestStream.games.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Primary Games Distribution */}
      <div className="p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/60 gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">
              Primary Broadcast Games
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Bren's most played categories by total hours streamed across his entire career
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('bren-games')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            View all 200 games <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topGamesSummary.map((game, idx) => (
            <div key={game.name} className="p-3.5 rounded-md bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate max-w-[140px]" title={game.name}>
                    #{idx + 1} {game.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    {game.timeShare}%
                  </span>
                </div>
                <span className="text-xl font-bold text-white">
                  {game.durationHours.toLocaleString()} <span className="text-xs font-normal text-zinc-500">hrs</span>
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-800/50 text-xs text-zinc-400 flex items-center justify-between">
                <span>Peak: <strong className="text-zinc-200">{game.peakViewers.toLocaleString()}</strong></span>
                <span>Avg: <strong className="text-zinc-200">{game.avgViewers}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
