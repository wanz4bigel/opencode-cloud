import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print(raw[:600]); sys.exit()
dd=d.get('data') or d
nr=dd.get('normalized_result') or {}
src=nr.get('source')
if isinstance(src,dict): src=src.get('text')
if src: print(src[:6000])
elif nr:
    print('class:', nr.get('class_name'))
    for m in nr.get('methods', [])[:60]: print('  M', m.get('name'), m.get('reported_signature'))
    for f in nr.get('fields', [])[:30]: print('  F', f)
    if not nr.get('methods') and not nr.get('fields'):
        print(json.dumps(nr)[:800])
else: print(raw[:600])
