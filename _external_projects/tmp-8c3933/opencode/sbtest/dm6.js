function t(over){
  const ov = !!(over && typeof over === 'object' && !Array.isArray(over));
  console.log('over=', over, 'typeof=', typeof over, 'ov=', ov);
  if (!ov) return 'EARLY';
  return 'PASS';
}
console.log(t(9));
console.log(t({b:9}));
const x = 9;
console.log('inline:', !!(x && typeof x === 'object' && !Array.isArray(x)));
