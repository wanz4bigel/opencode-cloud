import json, time, http.client
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=300)
body=json.dumps({"model":"swift-1.5-iq3_s","stream":True,"max_tokens":400,"temperature":0,
 "messages":[{"role":"user","content":"Tulis 5 kalimat tentang kopi arabika Gayo, bahasa Indonesia."}]})
t0=time.time()
c.request("POST","/v1/chat/completions",body,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
r=c.getresponse()
print("status", r.status, "headers t=%.2fs" % (time.time()-t0))
first=None; n=0; text=""
for raw in r:
    line=raw.decode("utf-8","replace").strip()
    if not line.startswith("data: "): continue
    data=line[6:]
    if data=="[DONE]": break
    try: d=json.loads(data)
    except ValueError: continue
    delta=(d.get("choices") or [{}])[0].get("delta",{}).get("content") or ""
    if delta and first is None: first=time.time()-t0
    text+=delta; n+=1
end=time.time()-t0
print("TTFT %.2fs | %d chunk | total %.2fs | char %d" % (first or -1, n, end, len(text)))
print("teks:", text.strip()[:200].replace("\n"," "))
