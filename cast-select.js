/* 99% IMPOSSIBLE — Character selection state with premium entitlement gate. */
(()=>{
'use strict';
const KEY='n99_character';
const chars=['petty','daisy','mick'];
const premium=new Set(['daisy','mick']);

function canUse(c){
  return c==='petty'||(!premium.has(c)?false:!!window.N99Entitlements?.isOwned?.(c));
}

let stored=localStorage.getItem(KEY)||'petty';
if(!chars.includes(stored))stored='petty';
let current=canUse(stored)?stored:'petty';
if(current!==stored)localStorage.setItem(KEY,current);

window.N99Character={
  get:()=>current,
  set:c=>{
    if(!chars.includes(c)||!canUse(c))return false;
    current=c;
    localStorage.setItem(KEY,c);
    return true;
  }
};

window.addEventListener('n99:entitlements',()=>{
  const desired=localStorage.getItem(KEY);
  if(chars.includes(desired)&&canUse(desired))current=desired;
  if(!canUse(current)){current='petty';localStorage.setItem(KEY,current)}
});
})();
