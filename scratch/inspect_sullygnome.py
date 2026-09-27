import urllib.request
import re
import json

url = 'https://sullygnome.com/channel/bren'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
    
    print('Length:', len(html))
    
    # Check for scripts with JSON data or variables
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    print(f'Total script tags: {len(scripts)}')
    
    matches = re.findall(r'UpdateCombinedPanel\([^)]+\)', html)
    print('UpdateCombinedPanel calls:', len(matches))
    for m in matches[:10]:
        print(m)
    # Also find any DataTable or ajax calls
    tables = re.findall(r'\$\(\"#([^\"]+)\"\)\.DataTable', html)
    print('DataTables:', tables)
    # Check what JS files SullyJS loads
    js_files = re.findall(r'src="([^"]*sully[^"]*)"', html, re.I)
    print('Sully JS files:', js_files)


            
    # Check for meta tags or OpenGraph
    og = re.findall(r'<meta property="og:([^"]+)" content="([^"]+)"', html)
    print('OG tags:', og)
    
except Exception as e:
    print('Error:', e)
