import urllib.request
import json
data = json.dumps({'branch': 'jules-3434715169239433864-feb0d013'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8080/submit', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as f:
        print(f.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
