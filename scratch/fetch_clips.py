import urllib.request
import re

url = 'https://twitchtracker.com/bren/subscribers'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
    title = re.findall(r'<title>(.*?)</title>', html)
    print('Title:', title)
    # Check if ecs exists
    ecs = re.findall(r'<meta id="ecs" data-value="([^"]+)"', html)
    print('Subscribers ECS found:', len(ecs))
    if ecs:
        print('ECS length:', len(ecs[0]))
    # Check text snippets
    snippets = re.findall(r'<div class="report-title">.*?</div>', html, re.DOTALL)
    print('Report titles:', snippets[:5])
    # Check any subscriber stats or tables
    stats = re.findall(r'<div[^>]*class="to-value"[^>]*>([^<]+)</div>', html)
    print('Values:', stats)
except Exception as e:
    print('Error:', e)


