export interface OverviewData {
  headline: {
    totalRecords: number;
    uniqueChannels: number;
    uniqueGames: number;
    dateMin: string;
    dateMax: string;
    totalDays: number;
    totalSnapshots: number;
    totalViewersTracked: number;
    avgViewers: number;
    medianViewers: number;
    maxViewers: number;
    matureCount: number;
    nonMatureCount: number;
    maturePercentage: number;
    uniqueTagsCount: number;
    uniqueLanguagesCount: number;
  };
  topGames: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  topLanguages: Array<{
    lang: string;
    count: number;
    percentage: number;
  }>;
  sourceTags: Array<{
    sourceTag: string;
    count: number;
    percentage: number;
    matureCount: number;
    matureRate: number;
    avgViewers: number;
  }>;
  dailyTimeline: Array<{
    date: string;
    streams: number;
    channels: number;
    games: number;
    totalViewers: number;
    avgViewers: number;
    matureCount: number;
    matureRate: number;
  }>;
}

export interface GameItem {
  name: string;
  streamCount: number;
  uniqueChannels: number;
  totalViewers: number;
  avgViewers: number;
  maxViewers: number;
  matureCount: number;
  matureRate: number;
  primaryEsrb: string;
  primaryPegi: string;
  topTags: string[];
  topChannels: Record<string, number>;
}

export interface GamesData {
  topGames: GameItem[];
  totalUniqueGames: number;
  popularityTiers: Array<{
    tier: string;
    min: number;
    max?: number;
    count: number;
    totalStreams: number;
  }>;
  gamesOverTime: Array<{
    date: string;
    [gameName: string]: number | string;
  }>;
}

export interface ChannelItem {
  channel: string;
  streams: number;
  totalViewers: number;
  avgViewers: number;
  maxViewers: number;
  primaryGame: string;
  language: string;
  matureRate: number;
  labels: string[];
}

export interface StreamsData {
  topChannels: ChannelItem[];
  totalUniqueChannels: number;
  streamFrequencyBuckets: Array<{
    bucket: string;
    channels: number;
    totalStreams: number;
  }>;
  viewerBuckets: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
  }>;
}

export interface TagItem {
  tag: string;
  count: number;
  percentage: number;
  matureRate: number;
  avgViewers: number;
  topGames: string[];
}

export interface TagCombination {
  tag1: string;
  tag2: string;
  count: number;
  pair: string;
}

export interface TagsData {
  topTags: TagItem[];
  topCombinations: TagCombination[];
  totalUniqueTags: number;
}

export interface ContentAgeData {
  esrbDistribution: Record<string, number>;
  pegiDistribution: Record<string, number>;
  labelStats: Array<{
    label: string;
    count: number;
    percentage: number;
    matureCount: number;
    matureRate: number;
    avgViewers: number;
  }>;
  auditBySource: Array<{
    sourceTag: string;
    totalStreams: number;
    matureStreams: number;
    matureRate: number;
    matureRatedGames: number;
    pegi18RatedGames: number;
    hasClassificationLabels: number;
    profanityCount: number;
    violentCount: number;
    drugsCount: number;
    gamblingCount: number;
    sexualCount: number;
    flaggedTotal: number;
  }>;
}

export interface TrendsData {
  dailyTimeline: Array<{
    date: string;
    streams: number;
    channels: number;
    games: number;
    totalViewers: number;
    avgViewers: number;
    matureCount: number;
    matureRate: number;
  }>;
  hourlyTrends: Array<{
    hour: number;
    streams: number;
    avgViewers: number;
    totalViewers: number;
    matureRate: number;
  }>;
  dayOfWeekTrends: Array<{
    day: string;
    streams: number;
    avgViewers: number;
    totalViewers: number;
    uniqueChannels: number;
    matureRate: number;
  }>;
}

export interface ExplorerData {
  columns: string[];
  channels: string[];
  games: string[];
  sources: string[];
  records: Array<[
    string, // 0: time
    number, // 1: channel_idx
    string, // 2: lang
    number, // 3: game_idx
    number, // 4: viewers
    number, // 5: mature (0 or 1)
    string, // 6: age_rating
    string, // 7: labels
    number, // 8: source_idx
    string  // 9: title
  ]>;
}

export interface BrenOverviewData {
  profile: {
    name: string;
    displayName: string;
    channelId: string;
    avatarUrl: string;
    twitchUrl: string;
    twitchTrackerUrl: string;
    firstStreamDate: string;
    latestStreamDate: string;
    totalFollowers: number;
    hoursStreamed: number;
    hoursWatched: number;
    averageViewers: number;
    peakViewers: number;
    activeDays: number;
    totalGamesStreamed: number;
    rank: number;
    rankCategory: string;
    rankEnglish: number;
    followersPerHour: number;
    dailyBroadcastTime: number;
    activeDaysPerWeek: number;
    followersPerStream: number;
    gamesPerStream: number;
    accountCreated?: string;
    bio?: string;
    bannerUrl?: string;
    brandColor?: string;
    socials?: Array<{
      id: string;
      name: string;
      title: string;
      url: string;
    }>;
    latestTitle?: string;
  };
  firstStream: {
    date: string;
    durationMinutes: number;
    avgViewers: number;
    peakViewers: number;
    followers: number;
    games: string[];
  };
  latestStream: {
    date: string;
    durationMinutes: number;
    avgViewers: number;
    peakViewers: number;
    followers: number;
    games: string[];
  };
  topGamesSummary: Array<{
    name: string;
    durationHours: number;
    timeShare: number;
    peakViewers: number;
    avgViewers: number;
  }>;
}

export interface BrenMonthlyItem {
  month: string;
  year: number;
  avgViewers: number;
  peakViewers: number;
  hoursStreamed: number;
  followers: number;
  followersGain: number;
  followersPerHour: number;
}

export interface BrenDailyItem {
  date: string;
  timestamp: number;
  durationMinutes: number;
  durationHours: number;
  avgViewers: number;
  peakViewers: number;
  hoursWatched: number;
  followers: number;
}

export interface BrenGameItem {
  id: number;
  name: string;
  durationMinutes: number;
  durationHours: number;
  timeShare: number;
  avgViewers: number;
  peakViewers: number;
  followersPerHour: number;
  lastSeen: string;
}

export interface BrenStreamItem {
  date: string;
  streamId: string;
  games: string[];
  primaryGame: string;
}

export interface BrenWeekItem {
  day: string;
  activeDays: number;
  avgHours: number;
  avgViewers: number;
  avgFollowers: number;
}

export interface BrenClipItem {
  id: string;
  slug: string;
  title: string;
  viewCount: number;
  createdAt: string;
  durationSeconds: number;
  thumbnailUrl: string;
  curator: string;
  game: string;
  url: string;
}

export interface BrenVodItem {
  id: string;
  title: string;
  viewCount: number;
  createdAt: string;
  lengthSeconds: number;
  thumbnailUrl: string;
  game: string;
  url: string;
}

export interface BrenChatMessage {
  messageId: string;
  vodId: string;
  streamTitle: string;
  streamDate: string;
  game: string;
  author: string;
  body: string;
  offsetSeconds: number;
  timeFormatted: string;
  createdAt: string;
}

export interface BrenChatDatabase {
  totalUniqueMessages: number;
  uniqueChatters: number;
  streamsSampled: number;
  dateRange: {
    start: string;
    end: string;
  };
  deduplicationConfirmed: boolean;
  topChatters: Array<{
    author: string;
    count: number;
  }>;
  streamsSummary: Record<string, {
    title: string;
    date: string;
    game: string;
    messagesHarvested: number;
  }>;
  messages: BrenChatMessage[];
}

export interface BrenChatAnalytics {
  meta: {
    totalMessages: number;
    uniqueChatters: number;
    totalStreams: number;
    dateRange: {
      start: string;
      end: string;
    };
    avgMessagesPerChatter: number;
  };
  vibes: {
    hypeCount: number;
    hypePercent: number;
    laughCount: number;
    laughPercent: number;
    questionCount: number;
    questionPercent: number;
    positiveCount: number;
    positivePercent: number;
    neutralPercent: number;
  };
  topEmotes: Array<{ name: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
  topChatters: Array<{ author: string; messages: number; share: number }>;
  teams: Array<{ name: string; count: number }>;
  players: Array<{ name: string; count: number }>;
  superfans: Array<{
    author: string;
    messages: number;
    streamsActiveCount: number;
    emotesUsed: number;
    avgLength: number;
    loyaltyScore: number;
  }>;
  hypedMatches: Array<{
    vodId: string;
    title: string;
    date: string;
    game: string;
    messageCount: number;
    hypeVelocity: number;
  }>;
}

export type TabType = 

  | 'bren-overview'
  | 'bren-timeline'
  | 'bren-games'
  | 'bren-streams'
  | 'bren-chat'
  | 'bren-clips'
  | 'bren-schedule'
  | 'global-corpus'
  | 'about';



