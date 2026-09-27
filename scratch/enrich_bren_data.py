import urllib.request
import json

url = 'https://gql.twitch.tv/gql'
query = """
query {
  user(login: "bren") {
    id
    login
    displayName
    description
    createdAt
    roles {
      isPartner
    }
    profileImageURL(width: 300)
    bannerImageURL
    primaryColorHex
    followers {
      totalCount
    }
    channel {
      socialMedias {
        id
        name
        title
        url
      }
    }
    broadcastSettings {
      title
      game {
        name
      }
    }
    videos(first: 25, type: ARCHIVE) {
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
    clips(first: 25, criteria: { filter: ALL_TIME }) {
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
        'User-Agent': 'Mozilla/5.0'
    }
)

with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode('utf-8'))
user = res['data']['user']

with open('public/data/bren/overview.json', 'r', encoding='utf-8') as f:
    overview = json.load(f)

overview['profile']['accountCreated'] = user['createdAt'][:10]
overview['profile']['bio'] = user['description']
overview['profile']['bannerUrl'] = user['bannerImageURL']
overview['profile']['brandColor'] = user['primaryColorHex']
overview['profile']['socials'] = user.get('channel', {}).get('socialMedias', [])
overview['profile']['latestTitle'] = user.get('broadcastSettings', {}).get('title', '')

# Format top clips
clips = []
for c in user.get('clips', {}).get('edges', []):
    node = c['node']
    clips.append({
        'id': node['id'],
        'slug': node['slug'],
        'title': node['title'],
        'viewCount': node['viewCount'],
        'createdAt': node['createdAt'],
        'durationSeconds': node['durationSeconds'],
        'thumbnailUrl': node['thumbnailURL'],
        'curator': node.get('curator', {}).get('displayName', 'Community') if node.get('curator') else 'Community',
        'game': node.get('game', {}).get('name', 'General') if node.get('game') else 'General',
        'url': f"https://clips.twitch.tv/{node['slug']}"
    })

# Format recent VODs
vods = []
for v in user.get('videos', {}).get('edges', []):
    node = v['node']
    vods.append({
        'id': node['id'],
        'title': node['title'],
        'viewCount': node['viewCount'],
        'createdAt': node['createdAt'],
        'lengthSeconds': node['lengthSeconds'],
        'thumbnailUrl': node.get('previewThumbnailURL', ''),
        'game': node.get('game', {}).get('name', 'VALORANT') if node.get('game') else 'VALORANT',
        'url': f"https://www.twitch.tv/videos/{node['id']}"
    })

with open('public/data/bren/overview.json', 'w', encoding='utf-8') as f:
    json.dump(overview, f, indent=2)

with open('public/data/bren/clips.json', 'w', encoding='utf-8') as f:
    json.dump(clips, f, indent=2)

with open('public/data/bren/vods.json', 'w', encoding='utf-8') as f:
    json.dump(vods, f, indent=2)

print(f"DONE! Saved enriched profile, {len(clips)} top clips, and {len(vods)} VODs.")

