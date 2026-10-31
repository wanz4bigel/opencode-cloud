const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const kode=process.argv[2];
const get=async(u,extra={})=>fetch(u,{headers:{"user-agent":UA,referer:"https://jwplyr.com/",...extra},redirect:"follow",signal:AbortSignal.timeout(30000)});
const html=await(await get(`https://jwplyr.com/e/${kode}`)).text();
const src=(html.match(/var SRC = '([^']+)'/)||[])[1];
const iframe=new URL(src,'https://jwplyr.com').href;
const ih=await(await get(iframe)).text();
const stream=((ih.match(/https:\/\/jwplyr\.com\/stream\.php[^"']+/)||[])[0]||'').replace(/&amp;/g,'&');
const sh=await(await get(stream,{referer:iframe})).text();
const media=(sh.match(/<source src="([^"]+)"/)||[])[1];
console.log('media',media);
let teks=await(await get(media,{referer:'https://jwplyr.com/'})).text();
if(/#EXT-X-STREAM-INF/i.test(teks)){
  const garis=teks.split('\n').map(s=>s.trim());
  let pilih='';
  for(let i=0;i<garis.length;i++) if(garis[i].startsWith('#EXT-X-STREAM-INF')) pilih=garis.slice(i+1).find(l=>l&&!l.startsWith('#'));
  const url=new URL(pilih,media).href;
  console.log('variant',url);
  teks=await(await get(url,{referer:'https://jwplyr.com/'})).text();
}
let total=0,n=0;
for(const m of teks.matchAll(/#EXTINF:([0-9.]+)/g)){total+=Number(m[1]);n++;}
console.log(JSON.stringify({kode,detik:Math.round(total),segmen:n}));
