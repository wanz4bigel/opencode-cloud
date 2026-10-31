import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
const db = new DatabaseSync("/home/runner/.local/share/opencode/opencode.db", { readOnly: true });
const rows = db.prepare("SELECT time_created,data FROM session_message WHERE session_id=? ORDER BY time_created,seq").all("ses_e7e888397ffebNm0wF9cxrxxzb");
const ROOT="/home/runner/bokep-id";
let i=0;
for (const r of rows) {
  let d; try { d=JSON.parse(r.data); } catch { continue; }
  for (const c of d.content||[]) {
    if (c.type!=="tool" || c.name!=="edit") continue;
    const inp=c.state?.input; if(!inp?.path?.startsWith(ROOT+"/")) continue;
    const f=path.join(ROOT, inp.path.slice(ROOT.length+1));
    if(!existsSync(f)){console.log("FILE HILANG",f);continue;}
    const isi=readFileSync(f,"utf8");
    const adaOld=isi.includes(inp.oldString||"");
    const adaNew=isi.includes(inp.newString||"");
    if(!adaOld && !adaNew){
      i++;
      console.log(`\n[${i}] ${inp.path.replace(ROOT+"/","")} t=${new Date(r.time_created).toISOString().slice(11,19)}`);
      console.log("  OLD:", (inp.oldString||"").slice(0,180).replace(/\n/g,"\\n"));
      console.log("  NEW:", (inp.newString||"").slice(0,180).replace(/\n/g,"\\n"));
    }
  }
}
console.log("\ntotal belum terpasang:",i);
