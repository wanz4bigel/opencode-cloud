import json, time, http.client
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=300)
b=json.dumps({"model":"swift-1.5-iq3_s","stream":True,"max_tokens":500,"temperature":0,
 "messages":[{"role":"user","content":"Sebutkan 3 fakta singkat tentang Danau Toba, bahasa Indonesia."}]})
t0=time.time(); c.request("POST","/v1/chat/completions",b,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
r=c.getresponse(); first=None; n=0; txt=""
for raw in r:
    l=raw.decode("utf-8","replace").strip()
    if not l.startswith("data: "): continue
    d=l[6:]
    if d=="[DONE]": break
    try: j=json.loads(d)
    except ValueError: continue
    de=(j.get("choices") or [{}])[0].get("delta",{}).get("content") or ""
    if de and first is None: first=time.time()-t0
    txt+=de; n+=1
print("stream HTTP %s | TTFT %.2fs | %d chunk | total %.2fs" % (r.status, first or -1, n, time.time()-t0))
print("teks:", txt.strip()[:180].replace("\n"," "))
