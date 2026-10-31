// Kenapa panggilan oEmbed pertama dari proses baru sering gagal?
const id = "9bZkp7q19f0";
const u = `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;
const ua = { "user-agent": "Mozilla/5.0 Chrome/124", accept: "application/json", connection: "close" };

for (let i = 1; i <= 3; i += 1) {
  const t0 = Date.now();
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(12000), headers: ua });
    const t = await r.text();
    console.log(`#${i} ${Date.now() - t0}ms status=${r.status} body=${t.slice(0, 50).replace(/\s+/g, " ")}`);
  } catch (err) {
    console.log(`#${i} ${Date.now() - t0}ms LEMPAR ${err.name}: ${String(err.message).slice(0, 60)} | cause=${err.cause?.name || err.cause?.code || err.cause?.message || "-"}`);
  }
}
