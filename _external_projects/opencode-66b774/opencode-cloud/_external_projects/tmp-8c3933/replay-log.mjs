import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
const DB="/home/runner/.local/share/opencode/opencode.db";
const SES="ses_e7e888397ffebNm0wF9cxrxxzb";
const ROOT="/tmp/replay2/bokep-id";
const db=new DatabaseSync(DB,{readOnly:true});
const rows=db.prepare("SELECT time_created,data FROM session_message WHERE session_id=? ORDER BY time_created,seq").all(SES);
let nulis=0,ngedit=0,gagal=0;
for(const r of rows){let d;try{d=JSON.parse(r.data)}catch{continue} for(const c of d.content||[]){if(c.type!=="tool"||!["write","edit"].includes(c.name))continue;const inp=c.state?.input;if(!inp?.path||!inp.path.startsWith("/home/runner/bokep-id/"))continue;const rel=inp.path.slice("/home/runner/bokep-id/".length);const target=path.join(ROOT,rel);if(c.name==="write"){mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,inp.content??"");nulis++;}else{if(!existsSync(target)){console.log("FAIL-MISSING",rel);gagal++;continue;}let isi=readFileSync(target,"utf8");const {oldString="",newString="",replaceAll=false}=inp;if(!isi.includes(oldString)){gagal++;console.log("\n=== FAIL",rel,"t="+new Date(r.time_created).toISOString());console.log("--- OLD ---\n"+oldString.slice(0,1500));console.log("--- NEW ---\n"+newString.slice(0,1500));continue;}isi=replaceAll?isi.split(oldString).join(newString):isi.replace(oldString,newString);writeFileSync(target,isi);ngedit++;}}}
console.log(`\nselesai: ${nulis} write, ${ngedit} edit, ${gagal} gagal`);
