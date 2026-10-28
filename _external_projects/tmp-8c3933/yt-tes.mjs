const ids = ["9bZkp7q19f0", "dQw4w9WgXcQ", "kJQP7kiw5Fk"];
for (const id of ids) {
  const u = `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;
  for (let i = 1; i <= 2; i += 1) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(6000), headers: { "user-agent": "Mozilla/5.0 Chrome/120", accept: "application/json" } });
      const t = await r.text();
      console.log("oembed", id, i, r.status, t.slice(0, 60).replace(/\s+/g, " "));
    } catch (e) {
      console.log("oembed", id, i, "ERR", e.name, String(e.message).slice(0, 70));
    }
  }
  try {
    const p = await fetch(`https://www.youtube.com/watch?v=${id}`, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "Mozilla/5.0 Chrome/120" } });
    const h = await p.text();
    const m = h.match(/<meta name="title" content="([^"]{0,60})/) || h.match(/<meta property="og:title" content="([^"]{0,60})/);
    console.log("halaman", id, p.status, m ? m[1] : "tanpa judul");
  } catch (e) {
    console.log("halaman", id, "ERR", e.name);
  }
}
