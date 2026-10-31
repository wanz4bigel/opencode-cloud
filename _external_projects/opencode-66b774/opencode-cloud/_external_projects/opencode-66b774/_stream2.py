import json, time, http.client
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
def run(stream=True, mt=700):
    c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=300)
    body=json.dumps({"model":"swift-1.5-iq3_s","stream":stream,"max_tokens":mt,"temperature":0,
      "messages":[{"role":"user","content":"Jelaskan cara kerja turbocharger pada mesin diesel, 6 paragraf, bahasa Indonesia."}]})
    t0=time.time()
    c.request("POST","/v1/chat/completions",body,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    r=c.getresponse()
    first=None; nchunk=0; text=""; data=b""
    if stream:
        for raw in r:
            line=raw.decode("utf-8","replace").strip()
            if not line.startswith("data: "): continue
            d=line[6:]
            if d=="[DONE]": break
            try: j=json.loads(d)
            except ValueError: continue
            delta=(j.get("choices") or [{}])[0].get("delta",{}).get("content") or ""
            if delta and first is None: first=time.time()-t0
            text+=delta; nchunk+=1
        print("stream: HTTP %s | TTFT %.2fs | %d chunk | total %.2fs | %d char" % (r.status, first or -1, nchunk, time.time()-t0, len(text)))
    else:
        d=json.loads(r.read()); j=d["choices"][0]["message"]
        print("non-stream: HTTP %s | total %.2fs | %s char | tps %s" % (r.status, time.time()-t0, len(j.get("content") or ""), (d.get("timings") or {}).get("predicted_per_second")))
    c.close()
run(True, 700)
run(False, 200)
