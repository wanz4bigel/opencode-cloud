function deepMerge(base, over){
  const ov = !!(over && typeof over === 'object' && !Array.isArray(over));
  const ob = !!(base && typeof base === 'object' && !Array.isArray(base));
  console.log('  enter', JSON.stringify(base), JSON.stringify(over), 'ov=', ov, 'ob=', ob);
  if (!ov) return base;
  if (!ob) return over;
  const out = {};
  for (const k of Object.keys(base)) out[k] = deepMerge(base[k], over[k]);
  for (const k of Object.keys(over)) if (!(k in base)) out[k] = over[k];
  return out;
}
console.log('R=', JSON.stringify(deepMerge({b:1,c:2},{b:9})));
