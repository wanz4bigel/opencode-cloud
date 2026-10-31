import { makeClient } from './lib.mjs';
const c=makeClient('https://tutorialinjectid.my.id');
const r=await c.get('/');
console.log('status',r.status);
console.log('headers',JSON.stringify(Object.fromEntries(r.headers||[])));
console.log('body',JSON.stringify((r.body||'').slice(0,300)));
