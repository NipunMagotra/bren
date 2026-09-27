import { 
  OverviewData, 
  GamesData, 
  StreamsData, 
  TagsData, 
  ContentAgeData, 
  TrendsData, 
  ExplorerData 
} from '../types';

const cache = new Map<string, any>();

async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load dataset resource from ${url} (HTTP ${res.status})`);
  }
  const data = await res.json();
  cache.set(url, data);
  return data as T;
}

export const fetchOverview = () => fetchJson<OverviewData>('/data/overview.json');
export const fetchGames = () => fetchJson<GamesData>('/data/games.json');
export const fetchStreams = () => fetchJson<StreamsData>('/data/streams.json');
export const fetchTags = () => fetchJson<TagsData>('/data/tags.json');
export const fetchContentAge = () => fetchJson<ContentAgeData>('/data/content_age.json');
export const fetchTrends = () => fetchJson<TrendsData>('/data/trends.json');
export const fetchExplorerRecords = () => fetchJson<ExplorerData>('/data/explorer_records.json');

// Bren Lifetime Career Data APIs
export const fetchBrenOverview = () => fetchJson<import('../types').BrenOverviewData>('/data/bren/overview.json');
export const fetchBrenMonthly = () => fetchJson<import('../types').BrenMonthlyItem[]>('/data/bren/monthly.json');
export const fetchBrenDaily = () => fetchJson<import('../types').BrenDailyItem[]>('/data/bren/daily.json');
export const fetchBrenGames = () => fetchJson<import('../types').BrenGameItem[]>('/data/bren/games.json');
export const fetchBrenStreams = () => fetchJson<import('../types').BrenStreamItem[]>('/data/bren/streams.json');
export const fetchBrenWeek = () => fetchJson<import('../types').BrenWeekItem[]>('/data/bren/week.json');
export const fetchBrenClips = () => fetchJson<import('../types').BrenClipItem[]>('/data/bren/clips.json');
export const fetchBrenVods = () => fetchJson<import('../types').BrenVodItem[]>('/data/bren/vods.json');
export const fetchBrenChat = () => fetchJson<import('../types').BrenChatDatabase>('/data/bren/chat_database.json');
export const fetchBrenChatAnalytics = () => fetchJson<import('../types').BrenChatAnalytics>('/data/bren/chat_analytics.json');




