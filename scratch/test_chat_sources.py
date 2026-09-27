import urllib.request
import json

# Check 1: logs.ivr.fi for channel bren
print("--- Checking logs.ivr.fi ---")
url = "https://logs.ivr.fi/channel/bren"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        html = resp.read().decode('utf-8')
    print("logs.ivr.fi status OK, length:", len(html))
    print("Snippet:", html[:300])
except Exception as e:
    print("logs.ivr.fi error:", e)

# Check 2: Twitch VOD chat comments via GQL
print("\n--- Checking Twitch VOD Chat Comments via GQL ---")
with open('public/data/bren/vods.json', 'r', encoding='utf-8') as f:
    vods = json.load(f)

latest_vod_id = vods[0]['id']
print(f"Testing VOD ID: {latest_vod_id}")


gql_url = "https://gql.twitch.tv/gql"
comment_query = """
query($videoID: ID!) {
  video(id: $videoID) {
    id
    title
    comments(first: 20) {
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

req = urllib.request.Request(
    gql_url,
    data=json.dumps({"query": comment_query, "variables": {"videoID": latest_vod_id}}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
)

try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        res = json.loads(resp.read().decode('utf-8'))
    comments = res.get('data', {}).get('video', {}).get('comments', {}).get('edges', [])
    print(f"VOD Comments found: {len(comments)}")
    for c in comments[:5]:
        node = c['node']
        sender = node.get('commenter', {}).get('displayName', 'Unknown')
        text = ''.join(f.get('text', '') for f in node.get('message', {}).get('fragments', []))
        sec = node.get('contentOffsetSeconds', 0)
        print(f"[{sec//60}:{sec%60:02d}] {sender}: {text}".encode('ascii', 'replace').decode('ascii'))

except Exception as e:
    print("GQL Comments error:", e)
