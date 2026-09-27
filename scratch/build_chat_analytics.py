import json
import re
from collections import Counter

# Load chat database
with open('public/data/bren/chat_database.json', 'r', encoding='utf-8') as f:
    chat_db = json.load(f)

messages = chat_db['messages']
print(f"Analyzing {len(messages)} messages...")

# 1. EMOTES & WORDS ANALYSIS
KNOWN_EMOTES = {
    'KEKW', 'LUL', 'OMEGALUL', 'Pog', 'PogChamp', 'catJAM', 'monkaW', 'monkaS',
    'PepeHands', 'GIGACHAD', 'Sadge', 'Copium', 'Hopium', 'Aware', 'Clueless',
    'W', 'L', 'GG', 'EZ', 'monkaOMEGA', 'widepeepoHappy', 'Pepega', 'ResidentSleeper',
    'BibleThump', 'Kappa', '5Head', 'NODDERS', 'NOPERS', 'pepeJAM'
}

STOP_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
    'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
    'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
    'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is',
    'are', 'was', 'were', 'im', "i'm", 'dont', "don't", 'did', 'does', 'got', 'has'
}

emote_counter = Counter()
word_counter = Counter()

# Esports teams to detect
TEAMS = {
    '100T / 100 Thieves': [r'\b100t\b', r'\b100 thieves\b', r'\bthieves\b'],
    'T1': [r'\bt1\b'],
    'FUT Esports': [r'\bfut\b'],
    'JDG (JD Gaming)': [r'\bjdg\b'],
    'Sentinels': [r'\bsen\b', r'\bsentinels\b'],
    'Fnatic': [r'\bfnc\b', r'\bfnatic\b'],
    'Paper Rex': [r'\bprx\b', r'\bpaper rex\b'],
    'EDward Gaming': [r'\bedg\b', r'\bedward\b'],
    'NRG': [r'\bnrg\b'],
    'LOUD': [r'\bloud\b'],
    'Team Vitality': [r'\bvit\b', r'\bvitality\b'],
    'Global Esports': [r'\bge\b'],
    'Gen.G': [r'\bgeng\b', r'\bgen\.g\b'],
    'DRX': [r'\bdrx\b'],
    'Karmine Corp': [r'\bkc\b', r'\bkarmine\b'],
    'Natus Vincere': [r'\bnavi\b']
}

# Players / Personalities to detect
PLAYERS = {
    'Sideshow': [r'\bsideshow\b', r'\bjosh\b'],
    'Bren': [r'\bbren\b', r'\bbrennon\b'],
    'Faker': [r'\bfaker\b'],
    'TenZ': [r'\btenz\b'],
    'Boaster': [r'\bboaster\b'],
    'Aspas': [r'\baspas\b'],
    'Cryocells': [r'\bcryo\b', r'\bcryocells\b'],
    'Derke': [r'\bderke\b'],
    'Chronicle': [r'\bchronicle\b'],
    'Jaws': [r'\bjaws\b'],
    'Alice / Wahlice': [r'\balice\b', r'\bwhalice\b', r'\bwah\b'],
    'Boostio': [r'\bboostio\b'],
    'Asuna': [r'\basuna\b']
}

team_mentions = Counter()
player_mentions = Counter()

# Sentiment / Vibes metrics
vibe_hype = 0
vibe_laugh = 0
vibe_questions = 0
vibe_positive = 0
vibe_neutral = 0

# Chatter stats
chatter_stats = {}
stream_message_counts = Counter()

for m in messages:
    body = m['body']
    author = m['author']
    vid = m['vodId']
    stream_message_counts[vid] += 1
    
    # Chatter tracking
    if author not in chatter_stats:
        chatter_stats[author] = {
            'author': author,
            'messages': 0,
            'totalChars': 0,
            'streamsActive': set(),
            'emotesUsed': 0
        }
    chatter_stats[author]['messages'] += 1
    chatter_stats[author]['totalChars'] += len(body)
    chatter_stats[author]['streamsActive'].add(vid)
    
    # Vibe analysis
    body_lower = body.lower()
    if '!' in body or 'let\'s go' in body_lower or 'hype' in body_lower or 'w' == body_lower:
        vibe_hype += 1
    if any(k in body_lower for k in ['lol', 'lmao', 'haha', 'kekw', 'lul', 'xd']):
        vibe_laugh += 1
    if '?' in body:
        vibe_questions += 1
    if any(k in body_lower for k in ['good', 'nice', 'great', 'love', 'goat', 'based', 'pog', 'huge', 'wp']):
        vibe_positive += 1
    else:
        vibe_neutral += 1

    # Team tracking
    for team, patterns in TEAMS.items():
        if any(re.search(pat, body_lower) for pat in patterns):
            team_mentions[team] += 1

    # Player tracking
    for player, patterns in PLAYERS.items():
        if any(re.search(pat, body_lower) for pat in patterns):
            player_mentions[player] += 1

    # Words and Emotes tokens
    tokens = re.findall(r'[A-Za-z0-9_]+', body)
    for tok in tokens:
        if tok in KNOWN_EMOTES:
            emote_counter[tok] += 1
            chatter_stats[author]['emotesUsed'] += 1
        elif tok.lower() in KNOWN_EMOTES:
            emote_counter[tok.upper()] += 1
            chatter_stats[author]['emotesUsed'] += 1
        else:
            low = tok.lower()
            if len(low) > 2 and low not in STOP_WORDS and not low.isdigit():
                word_counter[low] += 1

# Process Superfans
superfans = []
for a, s in chatter_stats.items():
    if a.lower() in ['nightbot', 'streamelements']:
        continue
    avg_len = round(s['totalChars'] / max(1, s['messages']), 1)
    superfans.append({
        'author': a,
        'messages': s['messages'],
        'streamsActiveCount': len(s['streamsActive']),
        'emotesUsed': s['emotesUsed'],
        'avgLength': avg_len,
        'loyaltyScore': min(100, int((s['messages'] * 1.5) + (len(s['streamsActive']) * 10)))
    })

superfans.sort(key=lambda x: x['messages'], reverse=True)

# Process Hyped Matches
hyped_streams = []
for vid, info in chat_db['streamsSummary'].items():
    cnt = stream_message_counts.get(vid, 0)
    hyped_streams.append({
        'vodId': vid,
        'title': info['title'],
        'date': info['date'],
        'game': info['game'],
        'messageCount': cnt,
        'hypeVelocity': round(cnt / 4.2, 1)  # approx msgs/min based on sample density
    })

hyped_streams.sort(key=lambda x: x['messageCount'], reverse=True)

# Build Comprehensive Analytics Data Object
chat_analytics_payload = {
    'meta': {
        'totalMessages': len(messages),
        'uniqueChatters': len(chatter_stats),
        'totalStreams': len(chat_db['streamsSummary']),
        'dateRange': chat_db['dateRange'],
        'avgMessagesPerChatter': round(len(messages) / max(1, len(chatter_stats)), 1)
    },
    'vibes': {
        'hypeCount': vibe_hype,
        'hypePercent': round((vibe_hype / len(messages)) * 100, 1),
        'laughCount': vibe_laugh,
        'laughPercent': round((vibe_laugh / len(messages)) * 100, 1),
        'questionCount': vibe_questions,
        'questionPercent': round((vibe_questions / len(messages)) * 100, 1),
        'positiveCount': vibe_positive,
        'positivePercent': round((vibe_positive / len(messages)) * 100, 1),
        'neutralPercent': round((vibe_neutral / len(messages)) * 100, 1)
    },
    'topEmotes': [{'name': k, 'count': v} for k, v in emote_counter.most_common(15)],
    'topWords': [{'word': k, 'count': v} for k, v in word_counter.most_common(20)],
    'topChatters': [{'author': s['author'], 'messages': s['messages'], 'share': round((s['messages']/len(messages))*100, 1)} for s in superfans[:20]],
    'teams': [{'name': k, 'count': v} for k, v in team_mentions.most_common(12)],
    'players': [{'name': k, 'count': v} for k, v in player_mentions.most_common(12)],
    'superfans': superfans[:15],
    'hypedMatches': hyped_streams
}

with open('public/data/bren/chat_analytics.json', 'w', encoding='utf-8') as f:
    json.dump(chat_analytics_payload, f, indent=2)

print("Saved chat_analytics.json with complete modules for:")
print("- STATS OVERVIEW")
print("- WHO TYPED IT MOST?")
print("- EMOTES & WORDS")
print("- CHAT VIBES")
print("- TEAMS & PLAYERS")
print("- SUPERFANS")
print("- HYPED MATCHES")
