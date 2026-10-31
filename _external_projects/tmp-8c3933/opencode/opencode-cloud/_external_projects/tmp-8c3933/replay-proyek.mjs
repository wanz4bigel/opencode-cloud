import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const DB = "/home/runner/.local/share/opencode/opencode.db";
const SES = "ses_e7e888397ffebNm0wF9cxrxxzb";
const ROOT = "/home/runner/bokep-id";
const db = new DatabaseSync(DB, { readOnly: true });
const rows = db.prepare("SELECT time_created,data FROM session_message WHERE session_id=? ORDER BY time_created,seq").all(SES);

let nulis = 0, ngedit = 0, gagal = 0;
for (const r of rows) {
  let d;
  try { d = JSON.parse(r.data); } catch { continue; }
  for (const c of d.content || []) {
    if (c.type !== "tool") continue;
    if (!["write", "edit"].includes(c.name)) continue;
    const inp = c.state?.input;
    if (!inp?.path || !inp.path.startsWith(ROOT + "/")) continue;
    const rel = inp.path.slice(ROOT.length + 1);
    const target = path.join(ROOT, rel);
    if (c.name === "write") {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, inp.content ?? "");
      nulis += 1;
    } else {
      if (!existsSync(target)) { console.log("GAGAL edit (belum ada):", rel); gagal += 1; continue; }
      let isi = readFileSync(target, "utf8");
      const { oldString = "", newString = "", replaceAll = false } = inp;
      if (!isi.includes(oldString)) {
        console.log("GAGAL edit (teks tidak cocok):", rel, "|", oldString.slice(0, 60).replace(/\n/g, "\\n"));
        gagal += 1;
        continue;
      }
      isi = replaceAll ? isi.split(oldString).join(newString) : isi.replace(oldString, newString);
      writeFileSync(target, isi);
      ngedit += 1;
    }
  }
}
console.log(`\nselesai: ${nulis} write, ${ngedit} edit, ${gagal} gagal`);
