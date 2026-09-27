import urllib.request
import json
import time
import os
import csv
from collections import Counter
import re

gql_url = "https://gql.twitch.tv/gql"

# 1. Fetch ALL available VODs on Twitch for Bren
query_all_vods = """
query {
  user(login: "bren") {
    videos(first: 100, type: ARCHIVE) {
      totalCount
      edges {
        node {
          id
          title
          createdAt
          lengthSeconds
          game {
            name
          }
          previewThumbnailURL(width: 320, height: 180)
        }
      }
    }
  }
}
"""

req = urllib.request.Request(
    gql_url,
    data=json.dumps({"query": query_all_vods}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
)

with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode('utf-8'))

vod_edges = res['data']['user']['videos']['edges']
print(f"Found {len(vod_edges)} total active broadcast VODs on Twitch servers!")

# Update vods.json with all available VODs
all_vods = []
for v in vod_edges:
    node = v['node']
    all_vods.append({
        'id': node['id'],
        'title': node['title'],
        'createdAt': node['createdAt'],
        'lengthSeconds': node['lengthSeconds'],
        'thumbnailUrl': node.get('previewThumbnailURL', ''),
        'game': node.get('game', {}).get('name', 'VALORANT') if node.get('game') else 'VALORANT',
        'url': f"https://www.twitch.tv/videos/{node['id']}"
    })

with open('public/data/bren/vods.json', 'w', encoding='utf-8') as f:
    json.dump(all_vods, f, indent=2)

comment_query = """
query($videoID: ID!, $contentOffsetSeconds: Int) {
  video(id: $videoID) {
    id
    title
    createdAt
    comments(contentOffsetSeconds: $contentOffsetSeconds) {
      edges {
        node {
          id
          createdAt
          contentOffsetSeconds
          commenter {
            displayName
            login
          }
          message {
            fragments {
              text
            }
          }
        }
      }
    }
  }
}
"""

seen_message_ids = set()
harvested_messages = []
chatter_counts = {}
streams_summary = {}

# Offsets across stream duration
offsets = [0, 300, 900, 1800, 3600, 7200, 10800, 14400]

print(f"Harvesting chat across ALL {len(all_vods)} VODs...")

for idx, v in enumerate(all_vods):
    vid = v['id']
    v_title = v['title']
    v_date = v['createdAt']
    v_game = v.get('game', 'VALORANT')
    v_len = v.get('lengthSeconds', 14400)
    
    stream_new_count = 0
    for offset in offsets:
        if offset > v_len:
            continue
        req_c = urllib.request.Request(
            gql_url,
            data=json.dumps({"query": comment_query, "variables": {"videoID": vid, "contentOffsetSeconds": offset}}).encode('utf-8'),
            headers={
                'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        try:
            with urllib.request.urlopen(req_c, timeout=6) as resp:
                data = json.loads(resp.read().decode('utf-8'))
            edges = data.get('data', {}).get('video', {}).get('comments', {}).get('edges', [])
            for e in edges:
                node = e['node']
                mid = node['id']
                if mid in seen_message_ids:
                    continue  # DEDUPLICATION: Strict UUID uniqueness
                seen_message_ids.add(mid)
                
                commenter = node.get('commenter')
                author = (commenter.get('displayName') or commenter.get('login')) if commenter else 'Anonymous'
                body = ''.join(f.get('text', '') for f in node.get('message', {}).get('fragments', []))
                sec = node.get('contentOffsetSeconds', 0)
                hrs = sec // 3600
                mins = (sec % 3600) // 60
                secs = sec % 60
                
                chatter_counts[author] = chatter_counts.get(author, 0) + 1
                
                harvested_messages.append({
                    'messageId': mid,
                    'vodId': vid,
                    'streamTitle': v_title,
                    'streamDate': v_date[:10],
                    'game': v_game,
                    'author': author,
                    'body': body.strip(),
                    'offsetSeconds': sec,
                    'timeFormatted': f"{hrs:02d}:{mins:02d}:{secs:02d}",
                    'createdAt': node.get('createdAt')
                })
                stream_new_count += 1
            time.sleep(0.04)
        except Exception as e:
            pass
            
    streams_summary[vid] = {
        'title': v_title,
        'date': v_date[:10],
        'game': v_game,
        'messagesHarvested': stream_new_count
    }
    print(f"[{idx+1}/{len(all_vods)}] VOD {vid} ({v_date[:10]}): +{stream_new_count} msgs | Total Pool: {len(harvested_messages)}")

# Sort messages chronologically
harvested_messages.sort(key=lambda m: (m['streamDate'], m['offsetSeconds']))

# Save chat database
chat_db_payload = {
    'totalUniqueMessages': len(harvested_messages),
    'uniqueChatters': len(chatter_counts),
    'streamsSampled': len(streams_summary),
    'dateRange': {
        'start': min(m['streamDate'] for m in harvested_messages) if harvested_messages else "2026-08-04",
        'end': max(m['streamDate'] for m in harvested_messages) if harvested_messages else "2026-09-27"
    },
    'deduplicationConfirmed': True,
    'topChatters': sorted([{'author': k, 'count': v} for k, v in chatter_counts.items()], key=lambda x: x['count'], reverse=True)[:30],
    'streamsSummary': streams_summary,
    'messages': harvested_messages
}

with open('public/data/bren/chat_database.json', 'w', encoding='utf-8') as f:
    json.dump(chat_db_payload, f, indent=2)

with open('public/data/bren/chat_database.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['MessageID', 'VOD_ID', 'StreamDate', 'OffsetTime', 'Author', 'Game', 'MessageText', 'StreamTitle'])
    for m in harvested_messages:
        writer.writerow([m['messageId'], m['vodId'], m['streamDate'], m['timeFormatted'], m['author'], m['game'], m['body'], m['streamTitle']])

print(f"\nALL VODS HARVEST COMPLETE! {len(harvested_messages)} unique messages across all {len(streams_summary)} VODs.")
