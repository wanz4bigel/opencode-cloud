import json, time, http.client
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
HOST="ai.wanz4bigel.dpdns.org"

def call(prompt, max_tokens, stream=True):
    c=http.client.HTTPSConnection(HOST,443,timeout=600)
    b=json.dumps({"model":"swift-1.5-iq3_s","stream":stream,"max_tokens":max_tokens,
                  "temperature":0.7,"messages":[{"role":"user","content":prompt}]})
    t0=time.time()
    c.request("POST","/v1/chat/completions",b,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    r=c.getresponse()
    if not stream:
        j=json.loads(r.read()); dt=time.time()-t0; u=j.get("usage") or {}
        return {"http":r.status,"pt":u.get("prompt_tokens"),"ct":u.get("completion_tokens"),
                "wall":round(dt,2),"tps":round(u.get("completion_tokens",0)/dt,1)}
    first=last=None; usage=None; n=0
    for raw in r:
        l=raw.decode("utf-8","replace").strip()
        if not l.startswith("data: "): continue
        d=l[6:]
        if d=="[DONE]": break
        try: j=json.loads(d)
        except ValueError: continue
        if j.get("usage"): usage=j["usage"]
        ch=(j.get("choices") or [{}])[0].get("delta") or {}
        if (ch.get("content") or "")+(ch.get("reasoning_content") or ""):
            n+=1; now=time.time()
            if first is None: first=now
            last=now
    ct=(usage or {}).get("completion_tokens") or n
    dec=(last-first) if first and last else 0
    return {"http":r.status,"ct":ct,"chunks":n,"ttft":round(first-t0,2) if first else None,
            "tps_decode":round((ct-1)/dec,1) if dec else None,
            "tps_total":round(ct/(last-t0),1) if last else None}

print("1) non-stream 300 :", call("Jelaskan cara kerja transformer, 4 poin singkat.", 300, False))
print("2) stream 500     :", call("Tulis paragraf panjang tentang sejarah Jakarta dari Sunda Kelapa sampai sekarang.", 500))
print("3) stream 1200    :", call("Tulis esai sekitar 1000 kata tentang energi terbarukan di Indonesia.", 1200))

# body besar: prompt ~400 KB melalui relay
big = "Data uji. " * 40000
print("4) body besar     :", call(big + "\nBalas satu kata: SIAP", 20, False), "| prompt bytes ~%d" % len(big))
