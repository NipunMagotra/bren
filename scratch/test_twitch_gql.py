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
      isAffiliate
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
        id
        name
        displayName
      }
    }
    stream {
      id
      title
      type
      viewersCount
      createdAt
      game {
        name
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
    print(json.dumps(res, indent=2))
except Exception as e:
    print('GQL Error:', e)
