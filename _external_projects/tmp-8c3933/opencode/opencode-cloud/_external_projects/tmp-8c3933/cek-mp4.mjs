const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const target = "https://dicrotin.sbs/Selly%20Kusuma%20Hijab%20Kesepian%20Colmek%20Enak%20Di%20Wc.mp4";
for (const method of ["HEAD", "GET"]) {
  try {
    const r = await fetch(target, {
      method,
      headers: { "user-agent": UA, referer: "https://indopanas.cyou/", range: method === "GET" ? "bytes=0-200000" : undefined },
      redirect: "follow",
      signal: AbortSignal.timeout(30000)
    });
    console.log(`${method} ${r.status} ${r.headers.get("content-type")} len=${r.headers.get("content-length")} cr=${r.headers.get("content-range")} acc=${r.headers.get("accept-ranges")} XFO=${r.headers.get("x-frame-options") || "-"}`);
    if (method === "GET") { const b = await r.arrayBuffer(); console.log("  bytes:", b.byteLength, "head:", Buffer.from(b.slice(0, 12)).toString("hex")); }
  } catch (e) { console.log(`${method} ERR ${e.message}`); }
}
