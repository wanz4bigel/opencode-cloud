import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("/tmp/jw-hasil.json", "utf8"));

// Normalisasi: underscore & strip jadi spasi, buang alamat/mention/telegram sebelum diperiksa.
const normal = (s) =>
  String(s || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:t\.me|telegram|twitter|x\.com)\S*/gi, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|\bsolo\b)/i;
const INDO = /(indo|indonesia|bokep|cewek|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|jilbab|hijab)/i;
const BUKAN_COLMEK = /(ngentot|entot|sepong|blowjob|creampie|threesome|tresome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|affair|\banal\b|hentai|ngewe|ngemut|hisap|kontol|sucks|ngocokin|colmekin|genjot|jilat|stepson|stepmom|stepsis|stepbro|tiri|prank|ojol|maid|mutual)/i;
const BUKAN_INDO = /(china|douyin|jepang|jepun|korea|thai|arab|india|malay|pinay|filipina|vietnam|russia|ebony|latina|barat|bule|japanese|indian|turkish)/i;
const DILARANG = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak|dede|adik|kakak|underage|preteen|loli|\*{2,})/i;

const kunci = (s) => normal(s).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 55);
const sudah = new Set();
const lolos = [];
const ditolak = [];

for (const v of data) {
  const t = normal(v.title);
  let alasan = "";
  if (!SINYAL.test(t)) alasan = "bukan colmek";
  else if (!INDO.test(t)) alasan = "bukan indo";
  else if (BUKAN_COLMEK.test(t)) alasan = "adegan sex";
  else if (BUKAN_INDO.test(t)) alasan = "bukan indo";
  else if (DILARANG.test(t)) alasan = "minor";
  else if (sudah.has(kunci(t))) alasan = "kembar";
  if (alasan) { ditolak.push({ ...v, alasan }); continue; }
  sudah.add(kunci(t));
  lolos.push({ ...v, bersih: t });
}

console.log("lolos:", lolos.length, "· ditolak:", ditolak.length);
for (const v of lolos) console.log("+", v.code, "|", v.bersih);
console.log("\n-- alasan penolakan yang penting --");
for (const v of ditolak.filter((x) => ["minor", "adegan sex", "bukan indo"].includes(x.alasan)).slice(0, 30)) {
  console.log(`[${v.alasan}] ${v.code} ${normal(v.title).slice(0, 80)}`);
}
