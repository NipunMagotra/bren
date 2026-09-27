import urllib.request
import json

url = 'https://gql.twitch.tv/gql'
query = """
query {
  user(login: "bren") {
    panels {
      id
      type
      ... on DefaultPanel {
        title
        description
        imageURL
        linkURL
      }
    }
    videos(first: 20, type: ARCHIVE) {
      edges {
        node {
          id
          title
          viewCount
          createdAt
          lengthSeconds
          game {
            name
          }
          previewThumbnailURL(width: 320, height: 180)
        }
      }
    }
    clips(first: 20, criteria: { filter: ALL_TIME }) {
      edges {
        node {
          id
          slug
          title
          viewCount
          createdAt
          durationSeconds
          thumbnailURL
          curator {
            displayName
          }
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
    url,
    data=json.dumps({"query": query}).encode('utf-8'),
    headers={
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode('utf-8'))
    print('VODs count:', len(res.get('data', {}).get('user', {}).get('videos', {}).get('edges', [])))
    print('Clips count:', len(res.get('data', {}).get('user', {}).get('clips', {}).get('edges', [])))
    print('Panels count:', len(res.get('data', {}).get('user', {}).get('panels', [])))
    
    with open('scratch/twitch_extra.json', 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=2)
    print('Saved scratch/twitch_extra.json successfully!')
except Exception as e:
    print('GQL Error:', e)
