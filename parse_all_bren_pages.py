import re
import json
import base64

def decode_ecs(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        text = f.read()

    m = re.search(r'<meta id="ecs" content="([^"]+)"', text)
    if not m:
        return None, text

    content = m.group(1)
    first_char = content[0]
    parts = content.split('!')
    last_part = parts.pop()

    def db(s, char):
        return s.replace(char, 'W')

    def safe_b64decode(s):
        s = s.strip()
        padding = (4 - len(s) % 4) % 4
        return base64.b64decode(s + '=' * padding)

    decoded_keys = json.loads(safe_b64decode(db(last_part, first_char)).decode('utf-8'))
    result = {}
    for idx, key in enumerate(decoded_keys):
        part_str = db(parts[idx], first_char)
        decoded_val = json.loads(safe_b64decode(part_str).decode('utf-8'))
        result[key] = decoded_val
    return result, text

# Check games page
print("=== Checking Games Page ===")
games_ecs, games_html = decode_ecs(r'C:\Users\Nipun Magotra\.gemini\antigravity-ide\brain\73144294-9288-4fd4-89fe-4639fa7c907c\.system_generated\steps\569\content.md')
if games_ecs:
    print("Games ECS Keys:", list(games_ecs.keys()))
    for k in games_ecs:
        print(f"  {k}: length={len(games_ecs[k]) if isinstance(games_ecs[k], list) else games_ecs[k]}")
    with open('bren_games_ecs.json', 'w', encoding='utf-8') as f:
        json.dump(games_ecs, f, indent=2)

# Check streams page
print("=== Checking Streams Page ===")
streams_ecs, streams_html = decode_ecs(r'C:\Users\Nipun Magotra\.gemini\antigravity-ide\brain\73144294-9288-4fd4-89fe-4639fa7c907c\.system_generated\steps\571\content.md')
if streams_ecs:
    print("Streams ECS Keys:", list(streams_ecs.keys()))
    for k in streams_ecs:
        print(f"  {k}: length={len(streams_ecs[k]) if isinstance(streams_ecs[k], list) else streams_ecs[k]}")
    with open('bren_streams_ecs.json', 'w', encoding='utf-8') as f:
        json.dump(streams_ecs, f, indent=2)

# Check subscribers page
print("=== Checking Subscribers Page ===")
subs_ecs, subs_html = decode_ecs(r'C:\Users\Nipun Magotra\.gemini\antigravity-ide\brain\73144294-9288-4fd4-89fe-4639fa7c907c\.system_generated\steps\573\content.md')
if subs_ecs:
    print("Subs ECS Keys:", list(subs_ecs.keys()))
    for k in subs_ecs:
        print(f"  {k}: length={len(subs_ecs[k]) if isinstance(subs_ecs[k], list) else subs_ecs[k]}")
    with open('bren_subs_ecs.json', 'w', encoding='utf-8') as f:
        json.dump(subs_ecs, f, indent=2)
