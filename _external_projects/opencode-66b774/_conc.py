import json, time, http.client, threading
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
def chat(prompt, mt=256, out=None):
    c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=300)
    body=json.dumps({"model":"swift-1.5-iq3_s","max_tokens":mt,"temperature":0,
                     "messages":[{"role":"user","content":prompt}]})
    t0=time.time(); c.request("POST","/v1/chat/completions",body,
        {"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    r=c.getresponse(); d=json.loads(r.read()); c.close()
    out.append((r.status, time.time()-t0, d.get("usage",{}).get("completion_tokens"),
                (d.get("timings") or {}).get("predicted_per_second"), d["choices"][0]["message"].get("content")))
res=[]
ths=[threading.Thread(target=chat,args=(f"Sebutkan {n} bilangan prima pertama, satu baris.",256,res)) for n in (3,5,7)]
t0=time.time()
[t.start() for t in ths]; [t.join() for t in ths]
print("total wall %.2fs untuk 3 request paralel" % (time.time()-t0))
for r in res: print(" status=%s wall=%.2fs tok=%s tps=%s -> %r" % (r[0], r[1], r[2], r[3], (r[4] or "")[:60]))
