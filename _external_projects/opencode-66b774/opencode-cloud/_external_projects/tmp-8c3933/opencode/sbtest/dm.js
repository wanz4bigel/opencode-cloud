function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function deepMerge(base, over){
  if (!isObj(over)) return base;
  if (!isObj(base)) return over;
  const out = {};
  for (const k of Object.keys(base)) out[k] = deepMerge(base[k], over[k]);
  for (const k of Object.keys(over)) if (!(k in base)) out[k] = over[k];
  return out;
}
module.exports = { deepMerge, isObj };
if (require.main === module) {
  const base={a:{b:1,c:2}}, over={a:{b:9}};
  console.log('isObj(over)', isObj(over), 'isObj(base)', isObj(base));
  console.log('keys', Object.keys(base));
  const inner = deepMerge(base.a, over.a);
  console.log('inner', JSON.stringify(inner));
  console.log('outer', JSON.stringify(deepMerge(base, over)));
}
