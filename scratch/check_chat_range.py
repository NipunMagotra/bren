import urllib.request
import json
import time

with open('public/data/bren/vods.json', 'r', encoding='utf-8') as f:
    vods = json.load(f)

print(f"Total VODs to check: {len(vods)}")

gql_url = "https://gql.twitch.tv/gql"
comment_query = """
query($videoID: ID!) {
  video(id: $videoID) {
    id
    createdAt
    comments(first: 5) {
      edges {
        node {
          id
        }
      }
    }
  }
}
"""

vods_with_chat = []

for v in vods:
    vid = v['id']
    req = urllib.request.Request(
        gql_url,
        data=json.dumps({"query": comment_query, "variables": {"videoID": vid}}).encode('utf-8'),
        headers={
            'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        v_data = data.get('data', {}).get('video')
        if v_data and v_data.get('comments'):
            edges = v_data['comments'].get('edges', [])
            if len(edges) > 0:
                vods_with_chat.append({
                    'id': vid,
                    'title': v['title'],
                    'date': v['createdAt'],
                    'game': v['game'],
                    'length': v['lengthSeconds']
                })
        time.sleep(0.05)
    except Exception as e:
        print(f"Error on {vid}: {e}")

print(f"\nVODs with active chat replay: {len(vods_with_chat)} out of {len(vods)}")
if vods_with_chat:
    dates = [x['date'][:10] for x in vods_with_chat]
    print(f"Date Range of streams with chat replay: {min(dates)} to {max(dates)}")
    for x in vods_with_chat:
        print(f"- {x['date'][:10]} | VOD {x['id']} | {x['game']} | {x['title'][:60]}")
