import json, time, http.client, random
KEY='sk-strata-d71951f458683d6a913c18fb1e31e4b3'
filler = ("Baris %05d: laporan operasional gudang regional, stok aman, tidak ada insiden. ")
lines = [filler % i for i in range(900)]
needle = "\nKODE RAHASIA: KUNING-4821.\n"
lines.insert(650, needle)
prompt = "".join(lines) + "\nPertanyaan: kode rahasia di atas apa? Jawab kodenya saja."
print("prompt bytes:", len(prompt.encode()))
c=http.client.HTTPSConnection("ai.wanz4bigel.dpdns.org",443,timeout=600)
body=json.dumps({"model":"swift-1.5-iq3_s","max_tokens":400,"temperature":0,
                 "messages":[{"role":"user","content":prompt}]})
t0=time.time()
c.request("POST","/v1/chat/completions",body,{"Content-Type":"application/json","Authorization":"Bearer "+KEY})
r=c.getresponse(); d=json.loads(r.read()); c.close()
m=d["choices"][0]["message"]
print("HTTP", r.status, "| total %.2fs" % (time.time()-t0), "| prompt_tokens", d["usage"]["prompt_tokens"])
print("jawab:", repr(m.get("content")))
