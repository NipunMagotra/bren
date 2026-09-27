import urllib.request
import json

gql_url = "https://gql.twitch.tv/gql"
query = """
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
        }
      }
    }
  }
}
"""

req = urllib.request.Request(
    gql_url,
    data=json.dumps({"query": query}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
)

with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode('utf-8'))

videos_data = res['data']['user']['videos']
total_vods = videos_data.get('totalCount') or len(videos_data['edges'])
edges = videos_data['edges']

print(f"Total archived VODs returned: {len(edges)} (reported totalCount: {total_vods})")
if edges:
    dates = [e['node']['createdAt'][:10] for e in edges]
    print(f"Earliest VOD: {min(dates)}")
    print(f"Latest VOD: {max(dates)}")
    print(f"Full Date Range: {min(dates)} to {max(dates)}")
