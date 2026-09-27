import urllib.request
import json
import time

gql_url = "https://gql.twitch.tv/gql"

# 1. Fetch the 30 active VODs
query_vods = """
query {
  user(login: "bren") {
    videos(first: 30, type: ARCHIVE) {
      edges {
        node {
          id
          title
          createdAt
          lengthSeconds
          game {
            name
          }
        }
      }
    }
  }
}
"""

req = urllib.request.Request(
    gql_url,
    data=json.dumps({"query": query_vods}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
)

with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode('utf-8'))

vods = res['data']['user']['videos']['edges']
print(f"Loaded {len(vods)} VODs")

comment_query = """
query($videoID: ID!) {
  video(id: $videoID) {
    id
    title
    createdAt
    comments(first: 50) {
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

streams_chat_data = []

# Fetch comments for the top 5 most recent streams
for v in vods[:5]:
    node = v['node']
    vid = node['id']
    title = node['title']
    date = node['createdAt']
    game = node.get('game', {}).get('name', 'VALORANT') if node.get('game') else 'VALORANT'
    
    req_c = urllib.request.Request(
        gql_url,
        data=json.dumps({"query": comment_query, "variables": {"videoID": vid}}).encode('utf-8'),
        headers={
            'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    try:
        with urllib.request.urlopen(req_c, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        v_data = data.get('data', {}).get('video')
        if v_data and v_data.get('comments'):
            edges = v_data['comments'].get('edges', [])
            messages = []
            for e in edges:
                c_node = e['node']
                commenter = c_node.get('commenter')
                if commenter:
                    author = commenter.get('displayName') or commenter.get('login')
                else:
                    author = 'Anonymous'
                text = ''.join(frag.get('text', '') for frag in c_node.get('message', {}).get('fragments', []))
                offset = c_node.get('contentOffsetSeconds', 0)
                messages.append({
                    'id': c_node['id'],
                    'timestamp': c_node['createdAt'],
                    'offsetSeconds': offset,
                    'author': author,
                    'body': text
                })
            streams_chat_data.append({
                'vodId': vid,
                'title': title,
                'date': date,
                'game': game,
                'messageCountSampled': len(messages),
                'messages': messages
            })
            print(f"Captured {len(messages)} chat messages for VOD {vid} ({date[:10]})")
        time.sleep(0.1)
    except Exception as e:
        print(f"Error on VOD {vid}: {e}")

# Save chat summary and samples
chat_metadata = {
    'totalStreamsWithChatReplay': len(vods),
    'dateRange': {
        'start': min(v['node']['createdAt'][:10] for v in vods),
        'end': max(v['node']['createdAt'][:10] for v in vods)
    },
    'retentionPolicy': 'Twitch 60-day Partner VOD & Chat Replay retention window',
    'academicRepoHasChat': False,
    'academicRepoDetails': 'TwitchDataset (Luana Assis) collected stream metadata, category tags, and age ratings (2024-10-13 to 2024-11-12), but 0 chat messages.',
    'sampledStreams': streams_chat_data
}

with open('public/data/bren/chat_summary.json', 'w', encoding='utf-8') as f:
    json.dump(chat_metadata, f, indent=2)

print("Saved chat metadata and samples to public/data/bren/chat_summary.json!")
