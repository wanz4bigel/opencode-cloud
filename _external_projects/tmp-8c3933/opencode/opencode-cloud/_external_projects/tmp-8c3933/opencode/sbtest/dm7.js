function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function deepMerge(base, over){
  if (!isObj(over)) return base;
  if (!isObj(base)) return over;
  const out = {};
  for (const k of Object.keys(base)) out[k] = deepMerge(base[k], over[k]);
  for (const k of Object.keys(over)) if (!(k in base)) out[k] = over[k];
  return out;
}
const B={b:1,c:2}, O={b:9};
console.log('direct isObj(B)=', isObj(B), 'isObj(O)=', isObj(O));
console.log('direct deepMerge(B,O)=', JSON.stringify(deepMerge(B,O)));
console.log('manual step:');
const out={};
for (const k of Object.keys(B)) out[k]=deepMerge(B[k],O[k]);
console.log('manual out=', JSON.stringify(out));
