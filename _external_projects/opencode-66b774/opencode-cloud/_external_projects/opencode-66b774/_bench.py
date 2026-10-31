import json, time, http.client
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
def run(prompt, max_tokens, stream=True):
    c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=600)
    b=json.dumps({"model":"swift-1.5-iq3_s","stream":stream,"max_tokens":max_tokens,"temperature":0.7,
                  "messages":[{"role":"user","content":prompt}]})
    t0=time.time()
    c.request("POST","/v1/chat/completions",b,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    r=c.getresponse()
    if not stream:
        body=r.read(); dt=time.time()-t0
        j=json.loads(body); u=j.get("usage") or {}
        ct=u.get("completion_tokens"); pt=u.get("prompt_tokens")
        return dict(http=r.status, total=dt, pt=pt, ct=ct, tps=(ct/dt if ct else None))
    first=last=None; n=0; usage=None
    for raw in r:
        l=raw.decode("utf-8","replace").strip()
        if not l.startswith("data: "): continue
        d=l[6:]
        if d=="[DONE]": break
        try: jj=json.loads(d)
        except ValueError: continue
        if jj.get("usage"): usage=jj["usage"]
        ch=(jj.get("choices") or [{}])[0].get("delta") or {}
        txt=(ch.get("content") or "")+(ch.get("reasoning_content") or "")
        if txt:
            n+=1; now=time.time()
            if first is None: first=now
            last=now
    ttft=(first-t0) if first else None
    dec=(last-first) if first and last else 0
    ct=(usage or {}).get("completion_tokens") or n
    return dict(http=r.status, ttft=ttft, decode_s=dec, chunks=n, ct=ct,
                tps_decode=(ct-1)/dec if dec>0 else None,
                tps_total=ct/(last-t0) if last else None)

print("== non-stream, 300 token ==")
print(run("Jelaskan secara singkat cara kerja transformer, 4 poin.", 300, stream=False))
print("== stream, 500 token ==")
print(run("Tulis paragraf panjang tentang sejarah Jakarta dari Sunda Kelapa sampai sekarang.", 500))
print("== stream, 1200 token ==")
print(run("Tulis esai 1000 kata tentang energi terbarukan di Indonesia.", 1200))
