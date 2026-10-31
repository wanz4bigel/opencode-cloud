const API = "https://www.eporner.com/api/v2/video/search/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const COLM = /(colmek|masturbat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo)/i;
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber)/i;
const TOLAK = /(\bsmp\b|\bsd\b|sekolah dasar|bocah|anak kecil|underage|preteen|loli)/i;
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
async function page(q, p) {
  const u = `${API}?query=${encodeURIComponent(q)}&format=json&per_page=100&page=${p}&sort=views&status=active`;
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return [];
    const d = await r.json();
    return d.videos || [];
  } catch { return []; }
}
const qs = process.argv.slice(2);
for (const q of qs) {
  const pages = await Promise.all([1,2,3,4,5,6].map(p => page(q, p)));
  const all = pages.flat();
  const ok = all.filter(v => v.title && !BUKAN.test(v.title) && COLM.test(v.title) && !TOLAK.test(v.title));
  const uniq = new Set(ok.map(v => norm(v.title)));
  console.log(`${q.padEnd(24)} ambil ${String(all.length).padStart(4)} · lolos ${String(ok.length).padStart(4)} · unik ${String(uniq.size).padStart(4)}`);
}
