/* 99% IMPOSSIBLE — Character selection state only. No audio logic here. */
(()=>{
'use strict';
const KEY='n99_character';
let current=localStorage.getItem(KEY)||'petty';
if(!['petty','daisy','mick'].includes(current))current='petty';
window.N99Character={
  get:()=>current,
  set:c=>{if(['petty','daisy','mick'].includes(c)){current=c;localStorage.setItem(KEY,c)}}
};
})();
