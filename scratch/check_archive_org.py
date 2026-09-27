import urllib.request
import json

# Check archive.org overrustlelogs collection
print("--- Checking Archive.org OverRustleLogs metadata ---")
url = "https://archive.org/metadata/overrustlelogs"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        meta = json.loads(resp.read().decode('utf-8'))
    print("Title:", meta.get('metadata', {}).get('title'))
    files = meta.get('files', [])
    print(f"Total files in archive: {len(files)}")
    bren_files = [f['name'] for f in files if 'bren' in f['name'].lower()]
    print(f"Bren files found: {len(bren_files)}")
    if bren_files:
        print("Sample files:", bren_files[:10])
except Exception as e:
    print("Archive.org error:", e)
