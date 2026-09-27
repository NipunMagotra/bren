import json

with open('scratch/twitch_extra.json', 'r', encoding='utf-8') as f:
    d = json.load(f)['data']['user']

print('--- ALL-TIME TOP CLIPS ---')
for c in d['clips']['edges'][:8]:
    node = c['node']
    game_name = node.get('game', {}).get('name') if node.get('game') else 'Unknown'
    curator = node.get('curator', {}).get('displayName', 'Unknown')
    print(f"• {node['title']} | Views: {node['viewCount']:,} | Game: {game_name} | Clipped by: {curator} | Date: {node['createdAt'][:10]}")

print('\n--- RECENT VOD ARCHIVES ---')
for v in d['videos']['edges'][:8]:
    node = v['node']
    game_name = node.get('game', {}).get('name') if node.get('game') else 'Unknown'
    hrs = node['lengthSeconds'] // 3600
    mins = (node['lengthSeconds'] % 3600) // 60
    print(f"• {node['title']} | Game: {game_name} | Views: {node['viewCount']:,} | Duration: {hrs}h {mins}m | Date: {node['createdAt'][:10]}")

print('\n--- OFFICIAL CHANNEL PANELS ---')
for p in d['panels']:
    print(f"• Title: {p.get('title', 'No Title')} | Link: {p.get('linkURL', 'None')}")
