import net from 'net';
const ip='203.175.8.18';
const ports=[22,21,25,53,80,110,143,443,465,587,993,995,2082,2083,2086,2087,2095,2096,783,8880,3306,5432,6379,27017];
for (const p of ports){
  const s=net.connect({host:ip,port:p}); s.setTimeout(4000);
  const r=await new Promise(res=>{let d='';s.on('data',x=>d+=x);s.on('connect',()=>{});s.on('close',()=>res('closed '+(d?'banner:'+d.slice(0,60).replace(/\s+/g,' '):'')));s.on('timeout',()=>{s.destroy();res('TIMEOUT')});s.on('error',e=>res('ERR '+e.code));});
  console.log(String(p).padEnd(6), r);
  try{s.destroy()}catch{}
}
