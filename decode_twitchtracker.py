import base64
import json
import re

html_path = r'C:\Users\Nipun Magotra\.gemini\antigravity-ide\brain\73144294-9288-4fd4-89fe-4639fa7c907c\.system_generated\steps\559\content.md'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'<meta id="ecs" content="([^"]+)"', text)
if not m:
    print('No meta ecs found')
    exit()

content = m.group(1)
print(f'Content length: {len(content)}')
first_char = content[0]
print(f'First char: {first_char}')

# Split by '!'
parts = content.split('!')
print(f'Number of parts: {len(parts)}')

last_part = parts.pop()

def db(s, char):
    return s.replace(char, 'W')

def safe_b64decode(s):
    s = s.strip()
    padding = (4 - len(s) % 4) % 4
    return base64.b64decode(s + '=' * padding)

decoded_keys = json.loads(safe_b64decode(db(last_part, first_char)).decode('utf-8'))
print('Decoded keys (properties on Y):', decoded_keys)

result = {}
for idx, key in enumerate(decoded_keys):
    part_str = db(parts[idx], first_char)
    decoded_val = json.loads(safe_b64decode(part_str).decode('utf-8'))
    result[key] = decoded_val
    print(f'Key: {key}, type: {type(decoded_val)}, len: {len(decoded_val) if isinstance(decoded_val, (list, dict)) else decoded_val}')

print('Successfully decoded TwitchTracker Y object!')
if 'table' in result:
    print('Sample table row (most recent month):', result['table'][0])
    print('Total months:', len(result['table']))
    print('Oldest month in table:', result['table'][-1])

if 'growth' in result:
    print('Total daily growth entries:', len(result['growth']))
    print('First stream entry in growth:', result['growth'][0])
    print('Latest stream entry in growth:', result['growth'][-1])

with open('bren_all_time_stats.json', 'w', encoding='utf-8') as out:
    json.dump(result, out, indent=2)
print('Saved to bren_all_time_stats.json!')
