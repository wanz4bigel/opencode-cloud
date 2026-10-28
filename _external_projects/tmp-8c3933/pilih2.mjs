import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("/tmp/jw-hasil.json", "utf8"));

const normal = (s) =>
  String(s || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:t\.me|telegram|twitter|x\.com)\S*/gi, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|\bsolo\b)/i;
const INDO = /(indo|indonesia|bokep|cewek|cewe|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|jilbab|hijab|sampe|smpe|sampai|banget|bgt|pake|pakai|sange|gemoy|klimaks|muncrat|banjir)/i;
const BUKAN_COLMEK = /(ngentot|entot|sepong|blowjob|creampie|threesome|tresome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|affair|\banal\b|hentai|ngewe|ngemut|hisap|kontol|sucks|ngocokin|colmekin|genjot|jilat|stepson|stepmom|stepsis|stepbro|tiri|prank|ojol|maid|mutual)/i;
const BUKAN_INDO = /(china|douyin|jepang|jepun|korea|thai|arab|india|malay|pinay|filipina|vietnam|russia|ebony|latina|barat|bule|japanese|indian|turkish)/i;
const DILARANG = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak|dede|adik|kakak|underage|preteen|loli|\*{2,})/i;

// Judul untuk tampilan: buang ekstensi, alamat, mention, dan iklan di ujung.
const rapikan = (s) =>
  String(s || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:t\.me|telegram|twitter|x\.com)\S*/gi, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/_+/g, " ")
    // Merek/tempat yang suka ditempel di judul, termasuk kalau dipisah tanda hubung.
    .replace(/\s*[-–|]\s*(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\S*/gi, " ")
    .replace(/\b(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\.[a-z]{2,}\S*/gi, " ")
    .replace(/\b(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\b/gi, " ")
    .replace(/\.(?:mp4|mkv|webm|avi)\b/gi, " ")
    .replace(/\b(?:CEK|JOIN|TELE|TELEGRAM)\b.*$/i, " ")
    .replace(/\b\d{3,4}p\b/gi, " ")
    .replace(/[_\-.]+/g, " ")
    .replace(/[|[\]]+/g, " ")
    .replace(/\s*#+\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–|#.]+|[\s\-–|#.]+$/g, "")
    .trim();

const kunci = (s) => normal(s).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 55);

const sudah = new Set();
const lolos = [];
for (const v of data) {
  const t = normal(v.title);
  const k = kunci(t);
  if (!SINYAL.test(t) || !INDO.test(t) || BUKAN_COLMEK.test(t) || BUKAN_INDO.test(t) || DILARANG.test(t) || sudah.has(k)) continue;
  // Video ini adalah re-upload dari Eporner yang sudah ada di katalog utama.
  if (/f4UyrRM45xI/i.test(v.title)) continue;
  sudah.add(k);
  lolos.push({ code: v.code, title: rapikan(v.title) || rapikan(t), poster: v.poster, asli: v.title });
}

writeFileSync("/tmp/dood-pilih.json", JSON.stringify(lolos, null, 2));
console.log("kandidat:", lolos.length);
for (const v of lolos) console.log("+", v.code, "|", v.title);
