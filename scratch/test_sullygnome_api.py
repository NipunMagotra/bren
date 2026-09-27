import urllib.request
import json

url = 'https://sullygnome.com/api/panelviews/updatepanel/streamgames/streams/30/1676238/bren/start/desc'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://sullygnome.com/channel/bren'
})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read().decode('utf-8')
    import re
    cells = re.findall(r'<div class="InfoPanelCombinedRow[^"]*"[^>]*>(.*?)</div>', data, re.DOTALL)
    print('Row divs count:', len(cells))
    # print text of first 3 rows
    for i, c in enumerate(cells[:5]):
        text = re.sub(r'<[^>]+>', ' ', c)
        text = ' '.join(text.split())
        print(f'Row {i}: {text}')




except Exception as e:
    print('Error:', e)
