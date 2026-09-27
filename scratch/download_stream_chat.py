import urllib.request
import json
import time

gql_url = "https://gql.twitch.tv/gql"
vod_id = "2885311847"

comment_query = """
query($videoID: ID!, $cursor: Cursor) {
  video(id: $videoID) {
    id
    comments(after: $cursor) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
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


all_comments = []
cursor = None
max_batches = 5 # fetch 500 messages to test speed

for i in range(max_batches):
    variables = {"videoID": vod_id}
    if cursor:
        variables["cursor"] = cursor
        
    req = urllib.request.Request(
        gql_url,
        data=json.dumps({"query": comment_query, "variables": variables}).encode('utf-8'),
        headers={
            'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        print("Raw response keys:", data.keys())
        if 'errors' in data:
            print("GQL Errors:", data['errors'])
        v = data.get('data', {}).get('video', {})
        print("Video keys:", v.keys() if v else None)
        comments_obj = v.get('comments', {}) if v else {}
        edges = comments_obj.get('edges', [])
        print("Edges found:", len(edges))

        for e in edges:
            node = e['node']
            author = node.get('commenter', {}).get('displayName', 'Anonymous') if node.get('commenter') else 'Anonymous'
            body = ''.join(f.get('text', '') for f in node.get('message', {}).get('fragments', []))
            all_comments.append({
                'time': node['contentOffsetSeconds'],
                'author': author,
                'body': body
            })
        cursor = edges[-1]['cursor']
        if not comments_obj.get('pageInfo', {}).get('hasNextPage'):
            break
        time.sleep(0.05)
    except Exception as e:
        print(f"Error on batch {i}: {e}")
        break

print(f"Successfully fetched {len(all_comments)} live chat messages from VOD {vod_id} without any API key!")
print("Sample first 3 messages:")
for m in all_comments[:3]:
    print(f"  [{m['time']//60}:{m['time']%60:02d}] {m['author']}: {m['body']}")
print("Sample last 3 messages:")
for m in all_comments[-3:]:
    print(f"  [{m['time']//60}:{m['time']%60:02d}] {m['author']}: {m['body']}")
