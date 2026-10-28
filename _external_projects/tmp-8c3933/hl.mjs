const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const u="https://dicrotin.sbs/Selly%20Kusuma%20Hijab%20Kesepian%20Colmek%20Enak%20Di%20Wc.mp4";
for (const ref of [undefined,"https://dicrotin.com/","http://localhost:3000/","https://example.com/"]) {
  const h={"user-agent":UA,range:"bytes=0-1000"}; if(ref) h.referer=ref;
  try{const r=await fetch(u,{headers:h,redirect:"follow",signal:AbortSignal.timeout(20000)});
  console.log(String(ref).padEnd(28), r.status, r.headers.get("content-type"), r.headers.get("content-range"));}
  catch(e){console.log(ref,"ERR",e.message)}
}
