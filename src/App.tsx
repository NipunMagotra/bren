import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  BrenOverviewData, 
  BrenMonthlyItem, 
  BrenGameItem, 
  BrenStreamItem, 
  BrenWeekItem,
  BrenClipItem,
  BrenVodItem,
  BrenChatDatabase,
  BrenChatAnalytics
} from './types';
import { 
  fetchBrenOverview, 
  fetchBrenMonthly, 
  fetchBrenGames, 
  fetchBrenStreams, 
  fetchBrenWeek,
  fetchBrenClips,
  fetchBrenVods,
  fetchBrenChat,
  fetchBrenChatAnalytics
} from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoadingState, ErrorState } from './components/States';

// Bren Section Views
import { BrenOverviewSection } from './sections/BrenOverviewSection';
import { BrenTimelineSection } from './sections/BrenTimelineSection';
import { BrenGamesSection } from './sections/BrenGamesSection';
import { BrenChatSection } from './sections/BrenChatSection';
import { BrenClipsSection } from './sections/BrenClipsSection';
import { BrenScheduleSection } from './sections/BrenScheduleSection';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('bren-overview');

  // Bren datasets state
  const [brenOverview, setBrenOverview] = useState<BrenOverviewData | null>(null);
  const [brenMonthly, setBrenMonthly] = useState<BrenMonthlyItem[] | null>(null);
  const [brenGames, setBrenGames] = useState<BrenGameItem[] | null>(null);
  const [brenStreams, setBrenStreams] = useState<BrenStreamItem[] | null>(null);
  const [brenWeek, setBrenWeek] = useState<BrenWeekItem[] | null>(null);
  const [brenClips, setBrenClips] = useState<BrenClipItem[] | null>(null);
  const [brenVods, setBrenVods] = useState<BrenVodItem[] | null>(null);
  const [brenChat, setBrenChat] = useState<BrenChatDatabase | null>(null);
  const [brenChatAnalytics, setBrenChatAnalytics] = useState<BrenChatAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Bren lifetime career datasets on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchBrenOverview(),
      fetchBrenMonthly(),
      fetchBrenGames(),
      fetchBrenStreams(),
      fetchBrenWeek(),
      fetchBrenClips().catch(() => []),
      fetchBrenVods().catch(() => []),
      fetchBrenChat().catch(() => null),
      fetchBrenChatAnalytics().catch(() => null)
    ])
      .then(([ov, mo, gm, st, wk, cl, vd, ch, cha]) => {
        if (mounted) {
          setBrenOverview(ov);
          setBrenMonthly(mo);
          setBrenGames(gm);
          setBrenStreams(st);
          setBrenWeek(wk);
          setBrenClips(cl);
          setBrenVods(vd);
          setBrenChat(ch);
          setBrenChatAnalytics(cha);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error("Bren dataset fetch error:", err);
          setError(err.message || 'Failed to load streamer dataset.');
          setLoading(false);
        }
      });


    return () => { mounted = false; };
  }, []);



  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        followerCount={brenOverview?.profile.totalFollowers || 58316} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <LoadingState 
            message="Loading Bren's Streamer Archive..." 
            subtext="Compiling 10-year timeline, 1,733 broadcast records, and 200 games..." 
          />
        ) : error ? (
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
          <div>
            {activeTab === 'bren-overview' && brenOverview && (
              <BrenOverviewSection 
                data={brenOverview} 
                onNavigateToTab={setActiveTab} 
              />
            )}
            {activeTab === 'bren-timeline' && brenMonthly && (
              <BrenTimelineSection data={brenMonthly} />
            )}
            {activeTab === 'bren-games' && brenGames && (
              <BrenGamesSection data={brenGames} />
            )}
            {activeTab === 'bren-chat' && brenChat && brenChatAnalytics && (
              <BrenChatSection chatDb={brenChat} analytics={brenChatAnalytics} />
            )}

            {activeTab === 'bren-clips' && brenClips && brenVods && (
              <BrenClipsSection clips={brenClips} vods={brenVods} />
            )}
            {activeTab === 'bren-schedule' && brenWeek && (
              <BrenScheduleSection data={brenWeek} />
            )}



          </div>
        )}
      </main>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
};

export default App;

