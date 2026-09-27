import json
import datetime

print("Compiling full Bren career analytics dataset...")

# Load raw decoded files
with open('bren_all_time_stats.json', 'r', encoding='utf-8') as f:
    stats_data = json.load(f)

with open('bren_games_ecs.json', 'r', encoding='utf-8') as f:
    games_data = json.load(f)

with open('bren_streams_ecs.json', 'r', encoding='utf-8') as f:
    streams_data = json.load(f)

# 1. Profile and Headline Metrics
overview = {
    "profile": {
        "name": "Bren",
        "displayName": "Bren (Brennon Hook)",
        "channelId": "60955605",
        "avatarUrl": "/profile.png",
        "twitchUrl": "https://www.twitch.tv/bren",
        "twitchTrackerUrl": "https://twitchtracker.com/bren",
        "firstStreamDate": "2016-12-11",
        "latestStreamDate": "2026-09-27",
        "totalFollowers": 58316,
        "hoursStreamed": 11200,
        "hoursWatched": 2062185,
        "averageViewers": 184,
        "peakViewers": 5730,
        "activeDays": 1812,
        "totalGamesStreamed": len(games_data.get('games', [])),
        "rank": 20446,
        "rankCategory": "Top 0.3% of Twitch Streamers Worldwide",
        "rankEnglish": 9296,
        "followersPerHour": 5.2,
        "dailyBroadcastTime": 6.0,
        "activeDaysPerWeek": 3.5,
        "followersPerStream": 33,
        "gamesPerStream": 1.7
    },
    "firstStream": {
        "date": "2016-12-11 19:31 UTC",
        "durationMinutes": 73,
        "avgViewers": 26,
        "peakViewers": 28,
        "followers": 408,
        "games": ["Team Fortress 2", "Social Eating"]
    },
    "latestStream": {
        "date": "2026-09-27 05:40 UTC",
        "durationMinutes": 253,
        "avgViewers": 121,
        "peakViewers": 250,
        "followers": 58316,
        "games": ["VALORANT"]
    },
    "topGamesSummary": [
        {"name": g["name"], "durationHours": round(g["duration"] / 60, 1), "timeShare": g["time_share"], "peakViewers": g["max_viewers"], "avgViewers": g["avg_viewers"]}
        for g in games_data.get('games', [])[:8]
    ]
}

# 2. Monthly Timeline (116 months)
monthly_table = []
for row in stats_data.get('table', []):
    # ['2026-09-01', 106, -57, -35, 756, 87.8, 30.4, 53.1, 58316, 208, 0.4, 2.4]
    month_date = row[0]
    avg_v = row[1]
    gain_v = row[2]
    pct_v = row[3]
    peak_v = row[4]
    hours_s = row[5]
    gain_s = row[6]
    pct_s = row[7]
    followers = row[8]
    gain_f = row[9]
    pct_f = row[10]
    per_hour = row[11]

    monthly_table.append({
        "month": month_date,
        "year": int(month_date[:4]),
        "avgViewers": avg_v,
        "peakViewers": peak_v,
        "hoursStreamed": hours_s,
        "followers": followers,
        "followersGain": gain_f if gain_f is not None else 0,
        "followersPerHour": per_hour if per_hour is not None else 0
    })

# 3. Daily Growth Timeline (1,812 entries)
daily_growth = []
for entry in stats_data.get('growth', []):
    # [timestamp_ms, duration_min, avg_viewers, peak_viewers, hours_watched, followers_start, followers_end, [game_ids]]
    ts = entry[0] / 1000.0
    dt = datetime.datetime.utcfromtimestamp(ts).strftime('%Y-%m-%d')
    daily_growth.append({
        "date": dt,
        "timestamp": entry[0],
        "durationMinutes": entry[1],
        "durationHours": round(entry[1] / 60, 1),
        "avgViewers": entry[2],
        "peakViewers": entry[3],
        "hoursWatched": entry[4],
        "followers": entry[6]
    })

# 4. Games List (All 200 games)
all_games = []
for g in games_data.get('games', []):
    all_games.append({
        "id": g.get("id"),
        "name": g.get("name"),
        "durationMinutes": g.get("duration", 0),
        "durationHours": round(g.get("duration", 0) / 60, 1),
        "timeShare": g.get("time_share", 0),
        "avgViewers": g.get("avg_viewers", 0),
        "peakViewers": g.get("max_viewers", 0),
        "followersPerHour": g.get("followers_hour", 0),
        "lastSeen": g.get("last_seen", "")[:10] if g.get("last_seen") else ""
    })

# 5. Streams List (1,733 past streams)
all_streams = []
for dt_str, sinfo in streams_data.get('complicator', {}).items():
    games_list = [g.get('name', 'Unknown') for g in sinfo.get('games', [])]
    all_streams.append({
        "date": dt_str,
        "streamId": sinfo.get('id', ''),
        "games": games_list,
        "primaryGame": games_list[0] if games_list else "Unknown"
    })

# Sort streams descending by date
all_streams.sort(key=lambda s: s['date'], reverse=True)

# 6. Days of the Week
week_data = []
days_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
for idx, w in enumerate(stats_data.get('week', [])):
    week_data.append({
        "day": days_names[idx],
        "activeDays": w.get("days_amount", 0),
        "avgHours": round(w.get("mean_duration", 0) / 60, 1),
        "avgViewers": round(w.get("mean_viewers", 0), 1),
        "avgFollowers": round(w.get("mean_followers", 0), 1)
    })

# Save everything to public/data/
import os
os.makedirs('public/data/bren', exist_ok=True)

with open('public/data/bren/overview.json', 'w', encoding='utf-8') as f:
    json.dump(overview, f, indent=2)

with open('public/data/bren/monthly.json', 'w', encoding='utf-8') as f:
    json.dump(monthly_table, f, indent=2)

with open('public/data/bren/daily.json', 'w', encoding='utf-8') as f:
    json.dump(daily_growth, f, indent=2)

with open('public/data/bren/games.json', 'w', encoding='utf-8') as f:
    json.dump(all_games, f, indent=2)

with open('public/data/bren/streams.json', 'w', encoding='utf-8') as f:
    json.dump(all_streams, f, indent=2)

with open('public/data/bren/week.json', 'w', encoding='utf-8') as f:
    json.dump(week_data, f, indent=2)

print("SUCCESS! Created complete Bren lifetime datasets:")
print(f"  - Monthly records: {len(monthly_table)} months (2016 - 2026)")
print(f"  - Daily stream entries: {len(daily_growth)} entries")
print(f"  - Total games: {len(all_games)} games")
print(f"  - Total streams: {len(all_streams)} streams")
