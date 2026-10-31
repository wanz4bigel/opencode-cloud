function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function deepMerge(base, over){
  console.error('ENTER base=', JSON.stringify(base), 'over=', JSON.stringify(over), 'isObj(over)=', isObj(over), 'isObj(base)=', isObj(base));
  if (!isObj(over)) return base;
  if (!isObj(base)) return over;
  const out = {};
  for (const k of Object.keys(base)) out[k] = deepMerge(base[k], over[k]);
  for (const k of Object.keys(over)) if (!(k in base)) out[k] = over[k];
  console.error('EXIT ->', JSON.stringify(out));
  return out;
}
console.log('RESULT', JSON.stringify(deepMerge({a:{b:1,c:2}},{a:{b:9}})));
