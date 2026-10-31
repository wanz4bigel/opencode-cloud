import net from 'net';
const targets=[[80,'203.175.8.18'],[80,'tutorialinjectid.my.id'],[2086,'203.175.8.18'],[2082,'203.175.8.18']];
const hosts=['localhost','203.175.8.18',' nonexistent.local','tutorialinjectid.my.id'];
for (const [port,ip] of targets) {
  for (const h of hosts) {
    const s=net.connect({host:ip,port}); s.setTimeout(9000); let buf='';
    const host=h===' nonexistent.local'?'x'+Date.now()+'.invalid':h;
    await new Promise(res=>{
      s.on('data',d=>{buf+=d; if(buf.length>900||/Connection: close/i.test(buf)) s.end();});
      s.on('close',res); s.on('timeout',()=>{s.destroy();res();}); s.on('error',e=>{buf+='ERR:'+e.code;res();});
      s.write(`GET / HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: curl/8\r\nAccept: */*\r\nConnection: close\r\n\r\n`);
    });
    const first=buf.split('\r\n')[0]||buf.slice(0,60);
    const srv=(buf.match(/^Server: .*$/im)||[''])[0];
    const loc=(buf.match(/^Location: .*$/im)||[''])[0];
    console.log(`:${port} Host=${host.padEnd(22)} | ${first.padEnd(34)} | ${srv} ${loc}`);
    try{s.destroy();}catch{}
  }
}
