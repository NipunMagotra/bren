import urllib.request
import json

gql_url = "https://gql.twitch.tv/gql"
vod_id = "2885311847"

comment_query = """
query($videoID: ID!, $contentOffsetSeconds: Int) {
  video(id: $videoID) {
    id
    comments(contentOffsetSeconds: $contentOffsetSeconds) {
      edges {
        node {
          id
          createdAt
          contentOffsetSeconds
          commenter {
            displayName
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

req = urllib.request.Request(
    gql_url,
    data=json.dumps({"query": comment_query, "variables": {"videoID": vod_id, "contentOffsetSeconds": 600}}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
)

with urllib.request.urlopen(req, timeout=8) as resp:
    data = json.loads(resp.read().decode('utf-8'))

edges = data.get('data', {}).get('video', {}).get('comments', {}).get('edges', [])
print(f"Comments at offset 600s (10 min in): {len(edges)}")
for e in edges[:5]:
    node = e['node']
    sec = node['contentOffsetSeconds']
    user = node.get('commenter', {}).get('displayName', 'Anon') if node.get('commenter') else 'Anon'
    msg = ''.join(f['text'] for f in node['message']['fragments'])
    print(f"[{sec//60}:{sec%60:02d}] {user}: {msg}".encode('ascii', 'replace').decode('ascii'))
