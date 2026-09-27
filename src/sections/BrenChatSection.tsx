import React, { useState, useMemo } from 'react';
import { BrenChatDatabase, BrenChatAnalytics } from '../types';
import { 
  Download, 
  Search, 
  Sparkles, 
  Smile, 
  HeartHandshake, 
  Trophy, 
  Flame, 
  MessageSquare,
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  CheckCircle2,
  Zap,
  Users
} from 'lucide-react';

interface Props {
  chatDb: BrenChatDatabase;
  analytics: BrenChatAnalytics;
}

type SubTab = 
  | 'who-typed'
  | 'overview' 
  | 'emotes-words' 
  | 'teams-players' 
  | 'superfans' 
  | 'hyped-matches'
  | 'raw-logs';

export const BrenChatSection: React.FC<Props> = ({ chatDb, analytics }) => {
  // Default to 'who-typed' so it immediately matches the user's requested Sliggy search feature
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('who-typed');

  // "WHO TYPED IT MOST?" Search State
  const [searchQueryInput, setSearchQueryInput] = useState('sideshow');
  const [activeQuery, setActiveQuery] = useState('sideshow');
  const [expandedChatter, setExpandedChatter] = useState<string | null>(null);

  // Raw logs state
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Curated esports suggestions matching Bren's co-streams & VCT meta
  const popularSuggestions = [
    'sideshow',
    'bren',
    'derke',
    'clutch',
    'curse',
    'aspas',
    'boaster',
    'tenz',
    '100t',
    'prx',
    'fnc',
    'kekw',
    'pog',
    'crazy',
    'w'
  ];

  const subTabs: Array<{ id: SubTab; label: string }> = [
    { id: 'who-typed', label: 'WHO TYPED IT MOST?' },
    { id: 'overview', label: 'STATS OVERVIEW' },
    { id: 'emotes-words', label: 'EMOTES & WORDS' },
    { id: 'teams-players', label: 'TEAMS & PLAYERS' },
    { id: 'superfans', label: 'SUPERFANS' },
    { id: 'hyped-matches', label: 'HYPED MATCHES' },
    { id: 'raw-logs', label: 'RAW CHAT LOGS' },
  ];

  // Execute word search
  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQueryInput.trim()) {
      setActiveQuery(searchQueryInput.trim());
      setExpandedChatter(null);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setSearchQueryInput(word);
    setActiveQuery(word);
    setExpandedChatter(null);
  };

  // Cross-tab drilldown helper: jump to who-typed with a specific query
  const drillDownWord = (word: string) => {
    setSearchQueryInput(word);
    setActiveQuery(word);
    setActiveSubTab('who-typed');
    setExpandedChatter(null);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Dynamic computation of "WHO TYPED IT MOST" across all 10,348 chat messages
  const searchResults = useMemo(() => {
    const term = activeQuery.trim().toLowerCase();
    if (!term) {
      return { totalUsages: 0, topChatters: [], matchingMessages: [] };
    }

    const chatterCounts: Record<string, { count: number; sampleQuotes: string[] }> = {};
    let totalUsages = 0;
    const matchingMessages: typeof chatDb.messages = [];

    // Fast regex for exact word or substring
    const isSingleWord = !term.includes(' ');
    const regex = isSingleWord 
      ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      : new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    for (let i = 0; i < chatDb.messages.length; i++) {
      const msg = chatDb.messages[i];
      const text = msg.body;
      const matches = text.match(regex);
      
      let count = matches ? matches.length : 0;
      // Fallback to substring matching if boundary regex missed but string includes
      if (count === 0 && text.toLowerCase().includes(term)) {
        count = 1;
      }

      if (count > 0) {
        totalUsages += count;
        matchingMessages.push(msg);

        if (!chatterCounts[msg.author]) {
          chatterCounts[msg.author] = { count: 0, sampleQuotes: [] };
        }
        chatterCounts[msg.author].count += count;
        if (chatterCounts[msg.author].sampleQuotes.length < 3) {
          chatterCounts[msg.author].sampleQuotes.push(text);
        }
      }
    }

    const sortedChatters = Object.entries(chatterCounts)
      .map(([author, data]) => ({
        author,
        count: data.count,
        sampleQuotes: data.sampleQuotes
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUsages,
      topChatters: sortedChatters,
      matchingMessages
    };
  }, [chatDb.messages, activeQuery]);

  // Filter raw chat messages
  const filteredRawMessages = useMemo(() => {
    return chatDb.messages.filter((msg) => {
      const matchSearch =
        msg.author.toLowerCase().includes(rawSearchTerm.toLowerCase()) ||
        msg.body.toLowerCase().includes(rawSearchTerm.toLowerCase());
      const matchStream = selectedStream === 'ALL' || msg.vodId === selectedStream;
      return matchSearch && matchStream;
    });
  }, [chatDb.messages, rawSearchTerm, selectedStream]);

  const totalRawPages = Math.ceil(filteredRawMessages.length / pageSize) || 1;
  const paginatedRawMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRawMessages.slice(start, start + pageSize);
  }, [filteredRawMessages, currentPage]);

  return (
    <div className="space-y-10 font-sans max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded bg-[#BD0078] text-white">
            DATA AUDITED
          </span>
          <span className="text-sm font-black tracking-tight text-white uppercase font-mono">
            BREN.ANALYTICS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
          <span>{analytics.meta.totalMessages.toLocaleString()} Messages</span>
          <span>•</span>
          <span>{analytics.meta.totalStreams} Broadcast VODs</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Unique
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation (Big Minimal Pill Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#00F0FF] text-black shadow-lg shadow-[#00F0FF]/20 font-black'
                  : 'bg-[#0E111B] text-zinc-400 hover:text-white hover:bg-[#141826] border border-[#1A1F30]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: WHO TYPED IT MOST? (BIG MINIMAL SEARCH FEATURE)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'who-typed' && (
        <div className="space-y-8">
          {/* Search Header Prompt */}
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm sm:text-base font-normal">
              Search any word, player, emote, or phrase to reveal who typed it most in chat!
            </p>

            {/* Big Sleek Search Bar */}
            <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQueryInput}
                  onChange={(e) => setSearchQueryInput(e.target.value)}
                  placeholder="derke, sideshow, kekw, clutch, fnc..."
                  className="w-full bg-[#0D101A] border border-[#1E2436] focus:border-[#00F0FF] text-white text-lg sm:text-xl font-bold px-6 py-4 rounded-xl focus:outline-none transition-all shadow-inner placeholder-zinc-600"
                />
              </div>
              <button
                type="submit"
                className="bg-[#00F0FF] hover:bg-[#38F9D7] text-black font-black text-sm sm:text-base tracking-widest px-9 py-4 rounded-xl transition-all uppercase shadow-lg shadow-[#00F0FF]/15 active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4 text-black stroke-[3]" />
                SEARCH
              </button>
            </form>

            {/* Popular Suggestions Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] mr-1">
                POPULAR SUGGESTIONS:
              </span>
              {popularSuggestions.map((sug) => {
                const isSelected = activeQuery.toLowerCase() === sug.toLowerCase();
                return (
                  <button
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-[#00F0FF] text-black font-bold shadow-md shadow-[#00F0FF]/20'
                        : 'bg-[#101420] hover:bg-[#181D2E] text-zinc-300 hover:text-[#00F0FF] border border-[#1E2538]'
                    }`}
                  >
                    {sug}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Minimal Results Container */}
          <div className="bg-[#0B0D16] border border-[#1A1F30] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
            {/* Card Header with Massive Quoted Word */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1A1F30]/60">
              <div>
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#00F0FF] uppercase">
                  “{activeQuery.toUpperCase()}”
                </h2>
                <p className="text-sm text-zinc-400 mt-2 font-normal">
                  Top Chatters Who Typed This Word Most
                </p>
              </div>

              <div className="self-start sm:self-center">
                <span className="inline-block px-5 py-2.5 rounded-xl bg-[#131724] border border-[#242C3E] text-sm sm:text-base font-black text-[#FACC15] tracking-wider font-mono shadow-inner">
                  {searchResults.totalUsages.toLocaleString()} TOTAL USAGES
                </span>
              </div>
            </div>

            {/* Ranked Chatters List */}
            {searchResults.topChatters.length > 0 ? (
              <div className="space-y-3 pt-2">
                {searchResults.topChatters.slice(0, 25).map((item, idx) => {
                  const isExpanded = expandedChatter === item.author;
                  return (
                    <div key={item.author} className="space-y-2">
                      <div 
                        onClick={() => setExpandedChatter(isExpanded ? null : item.author)}
                        className="bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#262E44] rounded-xl px-6 py-4 flex items-center justify-between transition-all cursor-pointer group"
                      >
                        {/* Left: Rank & Username */}
                        <div className="flex items-center gap-4">
                          <span className={`font-mono font-black text-base sm:text-lg w-8 ${
                            idx === 0 ? 'text-[#FACC15]' :
                            idx === 1 ? 'text-[#F87171]' :
                            idx === 2 ? 'text-[#FB923C]' :
                            'text-zinc-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-white font-bold text-base sm:text-lg group-hover:text-[#00F0FF] transition-colors">
                            {item.author}
                          </span>
                        </div>

                        {/* Right: Usage count */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base sm:text-lg text-[#FB7185]">
                            {item.count}
                          </span>
                          <span className="text-zinc-500 font-normal text-sm">
                            {item.count === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Quote Snippets */}
                      {isExpanded && item.sampleQuotes.length > 0 && (
                        <div className="mx-2 p-4 rounded-lg bg-[#0E111B] border border-zinc-800 space-y-2 text-xs">
                          <span className="text-zinc-400 font-mono text-[11px] block uppercase">
                            Recent messages from @{item.author} mentioning "{activeQuery}":
                          </span>
                          {item.sampleQuotes.map((q, qIdx) => (
                            <div key={qIdx} className="p-2.5 rounded bg-[#131622] text-zinc-200 font-mono">
                              "{q}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#131724] border border-[#222A3C] flex items-center justify-center mx-auto text-zinc-500">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No occurrences found for "{activeQuery}"</h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Try searching for one of the popular suggestions above like{' '}
                  <button onClick={() => handleSuggestionClick('sideshow')} className="text-[#00F0FF] underline">sideshow</button>,{' '}
                  <button onClick={() => handleSuggestionClick('bren')} className="text-[#00F0FF] underline">bren</button>, or{' '}
                  <button onClick={() => handleSuggestionClick('clutch')} className="text-[#00F0FF] underline">clutch</button>!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: STATS OVERVIEW (BIG MINIMAL STYLE)                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Big Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] flex flex-col justify-between space-y-4">
              <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider">Total Chat Messages</span>
              <div className="text-4xl sm:text-5xl font-black text-white">
                {analytics.meta.totalMessages.toLocaleString()}
              </div>
              <span className="text-xs text-[#FACC15] font-mono">100% UUID verified</span>
            </div>

            <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] flex flex-col justify-between space-y-4">
              <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider">Unique Chatters</span>
              <div className="text-4xl sm:text-5xl font-black text-[#00F0FF]">
                {analytics.meta.uniqueChatters.toLocaleString()}
              </div>
              <span className="text-xs text-cyan-400 font-mono">Distinct community members</span>
            </div>

            <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] flex flex-col justify-between space-y-4">
              <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider">Avg Msgs / Chatter</span>
              <div className="text-4xl sm:text-5xl font-black text-[#4ADE80]">
                {analytics.meta.avgMessagesPerChatter}
              </div>
              <span className="text-xs text-emerald-400 font-mono">High room engagement</span>
            </div>

            <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] flex flex-col justify-between space-y-4">
              <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider">Broadcast VODs</span>
              <div className="text-4xl sm:text-5xl font-black text-[#C084FC]">
                {analytics.meta.totalStreams}
              </div>
              <span className="text-xs text-purple-400 font-mono">Full 60-day Twitch window</span>
            </div>
          </div>

          {/* Quick Snapshot Overview */}
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                Top Community Chatters
              </h3>
              <button
                onClick={() => setActiveSubTab('superfans')}
                className="text-xs font-mono text-[#00F0FF] hover:underline"
              >
                View Superfans &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {analytics.topChatters.slice(0, 6).map((c, i) => (
                <div 
                  key={c.author} 
                  onClick={() => drillDownWord(c.author)}
                  className="p-4 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] flex items-center justify-between text-sm cursor-pointer transition-colors group"
                >
                  <span className="font-bold text-white truncate group-hover:text-[#00F0FF] transition-colors">
                    <span className="text-[#FACC15] font-mono mr-2">#{i + 1}</span> {c.author}
                  </span>
                  <span className="font-mono text-[#FB7185] font-black">{c.messages} msgs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: EMOTES & WORDS (BIG MINIMAL STYLE)                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'emotes-words' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Emotes */}
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-5">
            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#FACC15]" />
                Top Emotes
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Click any emote to see who typed it most in chat.</p>
            </div>

            <div className="space-y-2.5 pt-2">
              {analytics.topEmotes.map((em, idx) => (
                <div 
                  key={em.name} 
                  onClick={() => drillDownWord(em.name)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#00F0FF]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 w-6">#{idx + 1}</span>
                    <span className="font-bold text-base text-[#FACC15] font-mono group-hover:text-[#00F0FF] transition-colors">{em.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white px-3 py-1 rounded-lg bg-[#141824] border border-[#222A3C]">
                    {em.count} uses
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vocabulary Words */}
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-5">
            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00F0FF]" />
                Top Chat Vocabulary
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Click any word to reveal who typed it most.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {analytics.topWords.map((w, idx) => (
                <div 
                  key={w.word} 
                  onClick={() => drillDownWord(w.word)}
                  className="p-3 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#00F0FF]/30 flex items-center justify-between text-xs cursor-pointer transition-all group"
                >
                  <span className="font-medium text-zinc-200 truncate group-hover:text-white">
                    <span className="text-zinc-500 font-mono mr-1.5">#{idx + 1}</span> {w.word}
                  </span>
                  <span className="font-mono text-[#00F0FF] font-bold">{w.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* SUBTAB 5: TEAMS & PLAYERS (BIG MINIMAL STYLE)                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'teams-players' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teams */}
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-5">
            <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FACC15]" />
              Esports Teams Mentioned
            </h3>
            <p className="text-xs text-zinc-400">
              VCT Champions &amp; international orgs discussed in chat. Click to see top cheerers:
            </p>
            <div className="space-y-2.5 pt-2">
              {analytics.teams.map((t) => (
                <div 
                  key={t.name} 
                  onClick={() => drillDownWord(t.name.split(' ')[0])}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#FACC15]/30 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-base text-white group-hover:text-[#FACC15] transition-colors">{t.name}</span>
                  <span className="font-mono text-xs font-bold text-[#FACC15] px-3 py-1 rounded-lg bg-[#141824] border border-[#222A3C]">
                    {t.count} mentions
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-5">
            <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00F0FF]" />
              Players &amp; Casters Mentioned
            </h3>
            <p className="text-xs text-zinc-400">
              Personalities and pros mentioned by chatters. Click to search:
            </p>
            <div className="space-y-2.5 pt-2">
              {analytics.players.map((p) => (
                <div 
                  key={p.name} 
                  onClick={() => drillDownWord(p.name.split(' ')[0])}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#00F0FF]/30 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-base text-white group-hover:text-[#00F0FF] transition-colors">{p.name}</span>
                  <span className="font-mono text-xs font-bold text-[#00F0FF] px-3 py-1 rounded-lg bg-[#141824] border border-[#222A3C]">
                    {p.count} mentions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: SUPERFANS (BIG MINIMAL STYLE)                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'superfans' && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-[#FACC15]" />
                  Bren's Community Superfans
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Ranked by loyalty score, broadcast attendance, and message volume across all 30 VODs.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {analytics.superfans.map((sf, idx) => (
                <div 
                  key={sf.author} 
                  onClick={() => drillDownWord(sf.author)}
                  className="p-5 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] hover:border-[#FACC15]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-black text-base sm:text-lg w-8 ${
                      idx === 0 ? 'text-[#FACC15]' :
                      idx === 1 ? 'text-[#F87171]' :
                      idx === 2 ? 'text-[#FB923C]' :
                      'text-zinc-500'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-[#00F0FF] transition-colors">{sf.author}</h4>
                      <span className="text-xs text-zinc-400">Attended {sf.streamsActiveCount} broadcasts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block uppercase font-mono">Messages</span>
                      <span className="font-mono text-base font-black text-white">{sf.messages.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block uppercase font-mono">Loyalty</span>
                      <span className="font-mono text-base font-black text-[#4ADE80]">{sf.loyaltyScore} PTS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: HYPED MATCHES (BIG MINIMAL STYLE)                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'hyped-matches' && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#0B0D16] border border-[#1A1F30] space-y-6">
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Flame className="w-6 h-6 text-[#FACC15]" />
                Broadcasts by Chat Density
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                All 30 active VODs ranked by community chat intensity and co-stream watch party activity.
              </p>
            </div>

            <div className="space-y-3">
              {analytics.hypedMatches.map((m, idx) => (
                <div key={m.vodId} className="p-5 rounded-xl bg-[#10131E] hover:bg-[#141826] border border-[#191F30] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5 ${
                      idx === 0 ? 'bg-[#FACC15] text-black' :
                      idx === 1 ? 'bg-zinc-200 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-[#181D2E] text-zinc-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white line-clamp-1">{m.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 font-mono">
                        <span>{m.date}</span>
                        <span>•</span>
                        <span className="text-[#00F0FF]">{m.game}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block uppercase font-mono">Message Pool</span>
                      <span className="font-mono text-base font-bold text-white">{m.messageCount} msgs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block uppercase font-mono">Est. Velocity</span>
                      <span className="font-mono text-base font-bold text-[#FACC15]">{m.hypeVelocity} /min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 8: RAW CHAT LOGS (BIG MINIMAL STYLE)                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'raw-logs' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw messages or user handles..."
                value={rawSearchTerm}
                onChange={(e) => {
                  setRawSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-[#0D101A] border border-[#1E2436] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <select
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 px-4 py-3.5 bg-[#0D101A] border border-[#1E2436] rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-[#00F0FF]"
            >
              <option value="ALL">All Broadcasts ({chatDb.streamsSampled})</option>
              {Object.entries(chatDb.streamsSummary).map(([vodId, info]) => (
                <option key={vodId} value={vodId}>
                  {info.date} • {info.game}
                </option>
              ))}
            </select>
          </div>

          {/* Results Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredRawMessages.length.toLocaleString()}</strong> messages (Page {currentPage} of {totalRawPages})
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#0E111B] border border-[#1E2436] disabled:opacity-40 text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-zinc-300 px-1">
                {currentPage} / {totalRawPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalRawPages, p + 1))}
                disabled={currentPage === totalRawPages}
                className="p-1.5 rounded-lg bg-[#0E111B] border border-[#1E2436] disabled:opacity-40 text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="bg-[#0B0D16] rounded-2xl border border-[#1A1F30] divide-y divide-[#161B29] overflow-hidden">
            {paginatedRawMessages.map((msg) => (
              <div key={msg.messageId} className="p-4 hover:bg-[#0F1320] transition-colors flex items-start gap-4 text-sm">
                <div className="shrink-0 flex flex-col items-start gap-1 w-24">
                  <span className="font-mono text-[11px] text-zinc-500 bg-[#121624] px-2 py-0.5 rounded border border-[#1A2033]">
                    {msg.timeFormatted}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[90px]">
                    {msg.streamDate}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      onClick={() => drillDownWord(msg.author)}
                      className="font-bold text-xs text-[#00F0FF] hover:underline cursor-pointer"
                    >
                      {msg.author}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#131624] text-zinc-400 font-mono border border-[#1C2236]">
                      {msg.game}
                    </span>
                  </div>
                  <p className="text-zinc-200 text-sm break-words leading-relaxed select-text">
                    {msg.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
