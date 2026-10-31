const fs=require('fs'),zlib=require('zlib');
function readPNG(f){const b=fs.readFileSync(f);let p=8,w,h,bd,ct,idat=[];while(p<b.length){const len=b.readUInt32BE(p),type=b.toString('ascii',p+4,p+8);const d=b.slice(p+8,p+8+len);if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);bd=d[8];ct=d[9];}else if(type==='IDAT')idat.push(d);else if(type==='IEND')break;p+=12+len;}
const raw=zlib.inflateSync(Buffer.concat(idat));const ch=ct===6?4:ct===2?3:1;const stride=w*ch;const out=Buffer.alloc(w*h*ch);
for(let y=0;y<h;y++){const ft=raw[y*(stride+1)];const line=raw.slice(y*(stride+1)+1,(y+1)*(stride+1));const prev=y>0?out.slice((y-1)*stride,y*stride):Buffer.alloc(stride);
for(let x=0;x<stride;x++){const a=x>=ch?out[y*stride+x-ch]:0,b2=prev[x],c=x>=ch?prev[x-ch]:0;let v=line[x];
if(ft===1)v+=a;else if(ft===2)v+=b2;else if(ft===3)v+=(a+b2)>>1;else if(ft===4){const pp=a+b2-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b2),pc=Math.abs(pp-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b2:c;}out[y*stride+x]=v&255;}}
return{w,h,ch,data:out};}
function writePNG(f,img){const{w,h,ch,data}=img;const raw=Buffer.alloc(h*(w*ch+1));for(let y=0;y<h;y++){raw[y*(w*ch+1)]=0;data.copy(raw,y*(w*ch+1)+1,y*w*ch,(y+1)*w*ch);}
function chunk(t,d){const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const crc=Buffer.alloc(4);crc.writeUInt32BE(zlib.crc32?zlib.crc32(td):crc32(td));return Buffer.concat([len,td,crc]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=ch===4?6:ch===3?2:0;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
fs.writeFileSync(f,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));}
function crc32(buf){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let crc=0xffffffff;for(const x of buf)crc=t[(crc^x)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
const [,,file,x,y,cw,chh,scale]=process.argv;const im=readPNG(file);const s=+scale||3;const out={w:+cw*s,h:+chh*s,ch:im.ch,data:Buffer.alloc(+cw*s*+chh*s*im.ch)};
for(let yy=0;yy<+chh*s;yy++)for(let xx=0;xx<+cw*s;xx++){const sx=+x+Math.floor(xx/s),sy=+y+Math.floor(yy/s);for(let c=0;c<im.ch;c++)out.data[(yy*out.w+xx)*im.ch+c]=im.data[(sy*im.w+sx)*im.ch+c];}
writePNG('/tmp/opencode/crop.png',out);console.log('ok',out.w,out.h);
