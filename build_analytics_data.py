import os
import glob
import pandas as pd
import json
from collections import Counter, defaultdict
import ast
import re

print("Starting complete Twitch dataset aggregation...")
files = sorted(glob.glob('TwitchDataset_raw/files/*.xlsx'))
print(f"Loading {len(files)} files...")

all_dfs = []
for i, f in enumerate(files):
    try:
        df = pd.read_excel(f)
        all_dfs.append(df)
    except Exception as e:
        print(f"Error reading {f}: {e}")

df = pd.concat(all_dfs, ignore_index=True)
print(f"Loaded {len(df)} total records.")

# Clean and normalize columns
df['SearchTime'] = pd.to_datetime(df['SearchTime'], errors='coerce')
df['Viewer Count'] = pd.to_numeric(df['Viewer Count'], errors='coerce').fillna(0).astype(int)
df['Is Mature'] = df['Is Mature'].astype(bool)
df['Game Name'] = df['Game Name'].fillna('Unknown / Not Specified').astype(str).str.strip()
# Fix potential encoding artifacts in game names like "Pokmon" -> "Pokémon"
df['Game Name'] = df['Game Name'].str.replace('Pokmon', 'Pokémon', regex=False)
df['Channel Name'] = df['Channel Name'].fillna('Unknown').astype(str).str.strip()
df['Language'] = df['Language'].fillna('other').astype(str).str.lower().str.strip()
df['Stream Title'] = df['Stream Title'].fillna('').astype(str).str.strip()
df['Classification Labels'] = df['Classification Labels'].fillna('').astype(str).str.strip()
df['Source URL'] = df['Source URL'].fillna('').astype(str).str.strip()
df['Stream Tags'] = df['Stream Tags'].fillna('').astype(str).str.strip()
df['Age Rating'] = df['Age Rating'].fillna('').astype(str).str.strip()

# Add helper columns
df['Date'] = df['SearchTime'].dt.strftime('%Y-%m-%d')
df['Hour'] = df['SearchTime'].dt.hour
df['DayOfWeek'] = df['SearchTime'].dt.day_name()

# Extract Source Tag from Source URL
def extract_source_tag(url):
    if not url:
        return 'Unknown'
    parts = url.rstrip('/').split('/')
    return parts[-1] if parts else 'Unknown'

df['SourceTag'] = df['Source URL'].apply(extract_source_tag)

# Parse Age Ratings
def parse_age_ratings(val):
    if not val or val == '[]' or val == 'nan':
        return []
    try:
        res = ast.literal_eval(val)
        if isinstance(res, list):
            return res
        return []
    except:
        return []

df['ParsedAgeRatings'] = df['Age Rating'].apply(parse_age_ratings)

# Extract primary ESRB and PEGI
def get_rating(ratings_list, target_system):
    for sys, code in ratings_list:
        if sys == target_system:
            return code
    return None

df['ESRB'] = df['ParsedAgeRatings'].apply(lambda r: get_rating(r, 'ESRB'))
df['PEGI'] = df['ParsedAgeRatings'].apply(lambda r: get_rating(r, 'PEGI'))
df['CERO'] = df['ParsedAgeRatings'].apply(lambda r: get_rating(r, 'CERO'))
df['USK'] = df['ParsedAgeRatings'].apply(lambda r: get_rating(r, 'USK'))

# Map ESRB codes to standardized readable labels
esrb_map = {
    'E': 'Everyone (E)',
    'E10': 'Everyone 10+ (E10+)',
    'T': 'Teen (T)',
    'M': 'Mature 17+ (M)',
    'AO': 'Adults Only 18+ (AO)',
    'RP': 'Rating Pending (RP)',
    'EC': 'Early Childhood (EC)'
}

pegi_map = {
    'Three': 'PEGI 3',
    'Seven': 'PEGI 7',
    'Twelve': 'PEGI 12',
    'Sixteen': 'PEGI 16',
    'Eighteen': 'PEGI 18'
}

df['ESRB_Clean'] = df['ESRB'].map(esrb_map).fillna('Unrated / Unknown')
df['PEGI_Clean'] = df['PEGI'].map(pegi_map).fillna('Unrated / Unknown')

# Parse tags list
def parse_tags(tag_str):
    if not tag_str:
        return []
    return [t.strip() for t in tag_str.split(',') if t.strip()]

df['TagList'] = df['Stream Tags'].apply(parse_tags)

# Parse classification labels list
def parse_labels(lbl_str):
    if not lbl_str:
        return []
    return [l.strip() for l in lbl_str.split(',') if l.strip()]

df['LabelList'] = df['Classification Labels'].apply(parse_labels)

# 1. OVERVIEW DATA
min_date = df['SearchTime'].min().strftime('%Y-%m-%d %H:%M:%S')
max_date = df['SearchTime'].max().strftime('%Y-%m-%d %H:%M:%S')
unique_channels = int(df['Channel Name'].nunique())
unique_games = int(df['Game Name'].nunique())
total_records = len(df)
total_viewers = int(df['Viewer Count'].sum())
avg_viewers = round(float(df['Viewer Count'].mean()), 2)
median_viewers = int(df['Viewer Count'].median())
max_viewers = int(df['Viewer Count'].max())
mature_count = int(df['Is Mature'].sum())
mature_rate = round(mature_count / total_records * 100, 2)
non_mature_count = total_records - mature_count

# All tags counter
all_tags_counter = Counter()
for tags in df['TagList']:
    all_tags_counter.update(tags)

# All labels counter
all_labels_counter = Counter()
for lbls in df['LabelList']:
    all_labels_counter.update(lbls)

# Top games overall
top_games_series = df['Game Name'].value_counts()
top_games_overview = [
    {"name": name, "count": int(count), "percentage": round(count / total_records * 100, 2)}
    for name, count in top_games_series.head(10).items()
]

# Top tags overview
top_tags_overview = [
    {"tag": tag, "count": int(count), "percentage": round(count / total_records * 100, 2)}
    for tag, count in all_tags_counter.most_common(15)
]

# Top languages overview
lang_counts = df['Language'].value_counts()
top_languages = [
    {"lang": lang, "count": int(count), "percentage": round(count / total_records * 100, 2)}
    for lang, count in lang_counts.head(10).items()
]

# Source URLs / Tags breakdown
source_tag_counts = df['SourceTag'].value_counts()
source_tags_overview = [
    {
        "sourceTag": tag,
        "count": int(count),
        "percentage": round(count / total_records * 100, 2),
        "matureCount": int(df[df['SourceTag'] == tag]['Is Mature'].sum()),
        "matureRate": round(df[df['SourceTag'] == tag]['Is Mature'].mean() * 100, 2),
        "avgViewers": round(float(df[df['SourceTag'] == tag]['Viewer Count'].mean()), 1)
    }
    for tag, count in source_tag_counts.items()
]

# Daily timeline
daily_timeline = []
for date, grp in df.groupby('Date'):
    daily_timeline.append({
        "date": date,
        "streams": len(grp),
        "channels": int(grp['Channel Name'].nunique()),
        "games": int(grp['Game Name'].nunique()),
        "totalViewers": int(grp['Viewer Count'].sum()),
        "avgViewers": round(float(grp['Viewer Count'].mean()), 1),
        "matureCount": int(grp['Is Mature'].sum()),
        "matureRate": round(grp['Is Mature'].mean() * 100, 1)
    })
daily_timeline.sort(key=lambda x: x['date'])

overview_data = {
    "headline": {
        "totalRecords": total_records,
        "uniqueChannels": unique_channels,
        "uniqueGames": unique_games,
        "dateMin": min_date,
        "dateMax": max_date,
        "totalDays": len(daily_timeline),
        "totalSnapshots": len(files),
        "totalViewersTracked": total_viewers,
        "avgViewers": avg_viewers,
        "medianViewers": median_viewers,
        "maxViewers": max_viewers,
        "matureCount": mature_count,
        "nonMatureCount": non_mature_count,
        "maturePercentage": mature_rate,
        "uniqueTagsCount": len(all_tags_counter),
        "uniqueLanguagesCount": int(df['Language'].nunique())
    },
    "topGames": top_games_overview,
    "topTags": top_tags_overview,
    "topLanguages": top_languages,
    "sourceTags": source_tags_overview,
    "dailyTimeline": daily_timeline
}

# 2. GAMES DATA
games_data = []
for game, grp in df.groupby('Game Name'):
    game_stream_count = len(grp)
    tot_viewers = int(grp['Viewer Count'].sum())
    avg_v = round(float(grp['Viewer Count'].mean()), 1)
    max_v = int(grp['Viewer Count'].max())
    m_count = int(grp['Is Mature'].sum())
    m_rate = round(m_count / game_stream_count * 100, 1)
    
    # Top tags for this game
    g_tags = Counter()
    for t_list in grp['TagList']:
        g_tags.update(t_list)
    top_g_tags = [t for t, _ in g_tags.most_common(5)]
    
    # Top channels streaming this game
    top_g_channels = grp['Channel Name'].value_counts().head(3).to_dict()
    
    # ESRB & PEGI mode
    esrb_counts = grp['ESRB_Clean'].value_counts()
    primary_esrb = esrb_counts.index[0] if len(esrb_counts) > 0 and esrb_counts.index[0] != 'Unrated / Unknown' else (esrb_counts.index[1] if len(esrb_counts) > 1 else 'Unrated')
    pegi_counts = grp['PEGI_Clean'].value_counts()
    primary_pegi = pegi_counts.index[0] if len(pegi_counts) > 0 and pegi_counts.index[0] != 'Unrated / Unknown' else (pegi_counts.index[1] if len(pegi_counts) > 1 else 'Unrated')

    games_data.append({
        "name": game,
        "streamCount": game_stream_count,
        "uniqueChannels": int(grp['Channel Name'].nunique()),
        "totalViewers": tot_viewers,
        "avgViewers": avg_v,
        "maxViewers": max_v,
        "matureCount": m_count,
        "matureRate": m_rate,
        "primaryEsrb": primary_esrb,
        "primaryPegi": primary_pegi,
        "topTags": top_g_tags,
        "topChannels": top_g_channels
    })

games_data.sort(key=lambda x: x['streamCount'], reverse=True)

# Top 10 games over time (daily stream count)
top_10_game_names = [g['name'] for g in games_data[:10]]
games_over_time = []
for d in daily_timeline:
    date_val = d['date']
    date_df = df[df['Date'] == date_val]
    row = {"date": date_val}
    for gname in top_10_game_names:
        row[gname] = int((date_df['Game Name'] == gname).sum())
    games_over_time.append(row)

# Game popularity distribution buckets
tiers = [
    {"tier": "Tier 1: Mega (>1,000 streams)", "min": 1000, "count": 0, "totalStreams": 0},
    {"tier": "Tier 2: Major (200 - 999)", "min": 200, "max": 999, "count": 0, "totalStreams": 0},
    {"tier": "Tier 3: Moderate (50 - 199)", "min": 50, "max": 199, "count": 0, "totalStreams": 0},
    {"tier": "Tier 4: Niche (10 - 49)", "min": 10, "max": 49, "count": 0, "totalStreams": 0},
    {"tier": "Tier 5: Long Tail (1 - 9)", "min": 1, "max": 9, "count": 0, "totalStreams": 0}
]
for g in games_data:
    sc = g['streamCount']
    if sc >= 1000:
        tiers[0]['count'] += 1
        tiers[0]['totalStreams'] += sc
    elif sc >= 200:
        tiers[1]['count'] += 1
        tiers[1]['totalStreams'] += sc
    elif sc >= 50:
        tiers[2]['count'] += 1
        tiers[2]['totalStreams'] += sc
    elif sc >= 10:
        tiers[3]['count'] += 1
        tiers[3]['totalStreams'] += sc
    else:
        tiers[4]['count'] += 1
        tiers[4]['totalStreams'] += sc

# 3. STREAMS DATA
# Channel frequency
channel_stats = []
for ch, grp in df.groupby('Channel Name'):
    channel_stats.append({
        "channel": ch,
        "streams": len(grp),
        "totalViewers": int(grp['Viewer Count'].sum()),
        "avgViewers": round(float(grp['Viewer Count'].mean()), 1),
        "maxViewers": int(grp['Viewer Count'].max()),
        "primaryGame": grp['Game Name'].value_counts().index[0],
        "language": grp['Language'].value_counts().index[0],
        "matureRate": round(grp['Is Mature'].mean() * 100, 1),
        "labels": list(set([lbl for lbls in grp['LabelList'] for lbl in lbls]))
    })
channel_stats.sort(key=lambda x: x['streams'], reverse=True)

# Stream frequency buckets (e.g. channels with 1 stream, 2-5, 6-20, 21-50, 50+)
stream_freq_buckets = [
    {"bucket": "1 snapshot", "channels": 0, "totalStreams": 0},
    {"bucket": "2 - 5 snapshots", "channels": 0, "totalStreams": 0},
    {"bucket": "6 - 20 snapshots", "channels": 0, "totalStreams": 0},
    {"bucket": "21 - 50 snapshots", "channels": 0, "totalStreams": 0},
    {"bucket": "51 - 100 snapshots", "channels": 0, "totalStreams": 0},
    {"bucket": "> 100 snapshots", "channels": 0, "totalStreams": 0},
]
for ch in channel_stats:
    cnt = ch['streams']
    if cnt == 1:
        stream_freq_buckets[0]['channels'] += 1
        stream_freq_buckets[0]['totalStreams'] += cnt
    elif cnt <= 5:
        stream_freq_buckets[1]['channels'] += 1
        stream_freq_buckets[1]['totalStreams'] += cnt
    elif cnt <= 20:
        stream_freq_buckets[2]['channels'] += 1
        stream_freq_buckets[2]['totalStreams'] += cnt
    elif cnt <= 50:
        stream_freq_buckets[3]['channels'] += 1
        stream_freq_buckets[3]['totalStreams'] += cnt
    elif cnt <= 100:
        stream_freq_buckets[4]['channels'] += 1
        stream_freq_buckets[4]['totalStreams'] += cnt
    else:
        stream_freq_buckets[5]['channels'] += 1
        stream_freq_buckets[5]['totalStreams'] += cnt

# Viewer count distribution histogram
viewer_buckets = [
    {"range": "0 - 1", "min": 0, "max": 1, "count": int(((df['Viewer Count'] >= 0) & (df['Viewer Count'] <= 1)).sum())},
    {"range": "2 - 5", "min": 2, "max": 5, "count": int(((df['Viewer Count'] >= 2) & (df['Viewer Count'] <= 5)).sum())},
    {"range": "6 - 15", "min": 6, "max": 15, "count": int(((df['Viewer Count'] >= 6) & (df['Viewer Count'] <= 15)).sum())},
    {"range": "16 - 50", "min": 16, "max": 50, "count": int(((df['Viewer Count'] >= 16) & (df['Viewer Count'] <= 50)).sum())},
    {"range": "51 - 200", "min": 51, "max": 200, "count": int(((df['Viewer Count'] >= 51) & (df['Viewer Count'] <= 200)).sum())},
    {"range": "201 - 1,000", "min": 201, "max": 1000, "count": int(((df['Viewer Count'] >= 201) & (df['Viewer Count'] <= 1000)).sum())},
    {"range": "> 1,000", "min": 1001, "max": 9999999, "count": int((df['Viewer Count'] > 1000).sum())}
]

# 4. TAGS DATA
# Tag co-occurrence calculation (Tag Combinations)
tag_pair_counter = Counter()
tag_meta = defaultdict(lambda: {"count": 0, "matureCount": 0, "viewers": 0, "games": Counter()})

for idx, row in df[['TagList', 'Is Mature', 'Viewer Count', 'Game Name']].iterrows():
    tags = row['TagList']
    is_m = row['Is Mature']
    v = row['Viewer Count']
    g = row['Game Name']
    for t in tags:
        tag_meta[t]["count"] += 1
        if is_m:
            tag_meta[t]["matureCount"] += 1
        tag_meta[t]["viewers"] += v
        tag_meta[t]["games"][g] += 1
    
    # Pairs (combinations)
    sorted_tags = sorted(set(tags))
    for i in range(len(sorted_tags)):
        for j in range(i + 1, len(sorted_tags)):
            tag_pair_counter[(sorted_tags[i], sorted_tags[j])] += 1

top_tags_list = []
for tag, count in all_tags_counter.most_common(120):
    meta = tag_meta[tag]
    m_pct = round(meta["matureCount"] / count * 100, 1)
    avg_v = round(meta["viewers"] / count, 1)
    top_g = [gname for gname, _ in meta["games"].most_common(3)]
    top_tags_list.append({
        "tag": tag,
        "count": count,
        "percentage": round(count / total_records * 100, 2),
        "matureRate": m_pct,
        "avgViewers": avg_v,
        "topGames": top_g
    })

# Top tag combinations
top_tag_combinations = [
    {"tag1": pair[0], "tag2": pair[1], "count": count, "pair": f"{pair[0]} + {pair[1]}"}
    for pair, count in tag_pair_counter.most_common(50)
]

# 5. CONTENT & AGE RATING AUDIT DATA
esrb_distribution = df['ESRB_Clean'].value_counts().to_dict()
pegi_distribution = df['PEGI_Clean'].value_counts().to_dict()

# Twitch Classification Labels distribution
label_stats = []
for lbl, count in all_labels_counter.most_common():
    lbl_df = df[df['Classification Labels'].str.contains(lbl, regex=False)]
    label_stats.append({
        "label": lbl,
        "count": count,
        "percentage": round(count / total_records * 100, 2),
        "matureCount": int(lbl_df['Is Mature'].sum()),
        "matureRate": round(lbl_df['Is Mature'].mean() * 100, 1),
        "avgViewers": round(float(lbl_df['Viewer Count'].mean()), 1)
    })

# The Safety/Audit Mismatch Analysis:
# How many streams marked with "Safe/Kids/Family" tags have mature flags or mature games?
audit_by_source = []
for tag in df['SourceTag'].unique():
    s_df = df[df['SourceTag'] == tag]
    total_s = len(s_df)
    m_streams = int(s_df['Is Mature'].sum())
    m_rated_games = int(s_df['ESRB_Clean'].isin(['Mature 17+ (M)', 'Adults Only 18+ (AO)']).sum())
    pegi18_games = int(s_df['PEGI_Clean'].isin(['PEGI 18']).sum())
    has_labels = int((s_df['Classification Labels'] != '').sum())
    profanity = int(s_df['Classification Labels'].str.contains('ProfanityVulgarity').sum())
    violent = int(s_df['Classification Labels'].str.contains('ViolentGraphic').sum())
    drugs = int(s_df['Classification Labels'].str.contains('DrugsIntoxication').sum())
    gambling = int(s_df['Classification Labels'].str.contains('Gambling').sum())
    sexual = int(s_df['Classification Labels'].str.contains('SexualThemes').sum())
    
    audit_by_source.append({
        "sourceTag": tag,
        "totalStreams": total_s,
        "matureStreams": m_streams,
        "matureRate": round(m_streams / total_s * 100, 2),
        "matureRatedGames": m_rated_games,
        "pegi18RatedGames": pegi18_games,
        "hasClassificationLabels": has_labels,
        "profanityCount": profanity,
        "violentCount": violent,
        "drugsCount": drugs,
        "gamblingCount": gambling,
        "sexualCount": sexual,
        "flaggedTotal": int(((s_df['Is Mature']) | (s_df['Classification Labels'] != '') | (s_df['ESRB_Clean'] == 'Mature 17+ (M)')).sum())
    })

audit_by_source.sort(key=lambda x: x['totalStreams'], reverse=True)

# 6. TRENDS DATA
# Hourly trends (24h UTC)
hourly_trends = []
for h, grp in df.groupby('Hour'):
    hourly_trends.append({
        "hour": int(h),
        "streams": len(grp),
        "avgViewers": round(float(grp['Viewer Count'].mean()), 1),
        "totalViewers": int(grp['Viewer Count'].sum()),
        "matureRate": round(grp['Is Mature'].mean() * 100, 1)
    })
hourly_trends.sort(key=lambda x: x['hour'])

# Day of week trends
days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
dow_trends = []
for dname in days_order:
    grp = df[df['DayOfWeek'] == dname]
    if len(grp) > 0:
        dow_trends.append({
            "day": dname,
            "streams": len(grp),
            "avgViewers": round(float(grp['Viewer Count'].mean()), 1),
            "totalViewers": int(grp['Viewer Count'].sum()),
            "uniqueChannels": int(grp['Channel Name'].nunique()),
            "matureRate": round(grp['Is Mature'].mean() * 100, 1)
        })

# Save JSON outputs to a directory `data`
os.makedirs('processed_data', exist_ok=True)

with open('processed_data/overview.json', 'w', encoding='utf-8') as f:
    json.dump(overview_data, f, indent=2)

with open('processed_data/games.json', 'w', encoding='utf-8') as f:
    json.dump({
        "topGames": games_data[:250],
        "totalUniqueGames": len(games_data),
        "popularityTiers": tiers,
        "gamesOverTime": games_over_time
    }, f, indent=2)

with open('processed_data/streams.json', 'w', encoding='utf-8') as f:
    json.dump({
        "topChannels": channel_stats[:200],
        "totalUniqueChannels": len(channel_stats),
        "streamFrequencyBuckets": stream_freq_buckets,
        "viewerBuckets": viewer_buckets
    }, f, indent=2)

with open('processed_data/tags.json', 'w', encoding='utf-8') as f:
    json.dump({
        "topTags": top_tags_list,
        "topCombinations": top_tag_combinations,
        "totalUniqueTags": len(all_tags_counter)
    }, f, indent=2)

with open('processed_data/content_age.json', 'w', encoding='utf-8') as f:
    json.dump({
        "esrbDistribution": esrb_distribution,
        "pegiDistribution": pegi_distribution,
        "labelStats": label_stats,
        "auditBySource": audit_by_source
    }, f, indent=2)

with open('processed_data/trends.json', 'w', encoding='utf-8') as f:
    json.dump({
        "dailyTimeline": daily_timeline,
        "hourlyTrends": hourly_trends,
        "dayOfWeekTrends": dow_trends
    }, f, indent=2)

# 7. DATA EXPLORER RECORDS
# Compact format for fast client-side table rendering, search, filtering, and CSV download
# Store records in light format:
records_compact = []
for idx, r in df.iterrows():
    records_compact.append([
        r['SearchTime'].strftime('%Y-%m-%d %H:%M') if pd.notnull(r['SearchTime']) else '',
        r['Channel Name'],
        r['Language'],
        r['Game Name'],
        r['Viewer Count'],
        1 if r['Is Mature'] else 0,
        r['ESRB_Clean'] if r['ESRB_Clean'] != 'Unrated / Unknown' else (r['PEGI_Clean'] if r['PEGI_Clean'] != 'Unrated / Unknown' else 'Unrated'),
        r['Classification Labels'],
        r['SourceTag'],
        r['Stream Title'][:100]  # truncate long titles
    ])

with open('processed_data/explorer_records.json', 'w', encoding='utf-8') as f:
    # Save compact array: columns mapping is:
    # [time, channel, lang, game, viewers, is_mature, age_rating, labels, source_tag, title]
    json.dump({
        "columns": ["time", "channel", "lang", "game", "viewers", "mature", "age_rating", "labels", "source_tag", "title"],
        "records": records_compact
    }, f, separators=(',', ':'))

print("All preprocessed JSON datasets generated successfully in processed_data/!")
