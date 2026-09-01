/* 99% IMPOSSIBLE — final approved layout polish.
   Keeps gameplay behavior untouched; only repositions/centers existing controls. */
(()=>{
'use strict';
if(window.__N99_LAYOUT_POLISH_V1)return;
window.__N99_LAYOUT_POLISH_V1=true;

const style=document.createElement('style');
style.textContent=`
/* Home: large stacked brand at left, voice at upper-right, centered hero copy. */
body:has(#home.on) .app{padding-top:max(24px,env(safe-area-inset-top));}
body:has(#home.on) .brand{display:block;width:44%;margin:0 0 34px 0;line-height:.78;letter-spacing:4px;font-size:20px;text-align:left;}
body:has(#home.on) .brand b{display:block;font-size:72px;line-height:.76;letter-spacing:-2px;margin-bottom:8px;}
body:has(#home.on) #home>.green,
body:has(#home.on) #home>h1,
body:has(#home.on) #home>.sub{text-align:center;}
body:has(#home.on) #home>h1{font-size:clamp(46px,12vw,62px);line-height:.88;margin:6px auto 16px;max-width:500px;}
body:has(#home.on) #home>.sub{margin-left:auto;margin-right:auto;}

/* Voice selector: same control, different placement by screen. */
body:has(#home.on) .cast-picker{position:absolute!important;left:auto!important;right:18px!important;top:max(28px,env(safe-area-inset-top))!important;transform:none!important;width:min(210px,49vw)!important;min-width:0!important;padding:10px 13px 11px!important;}
body:has(#home.on) .cast-picker:active{transform:translateY(1px)!important;}
body:has(#home.on) .cast-picker .cast-current{justify-content:center!important;gap:10px!important;font-size:14px!important;}
body:has(#home.on) .cast-picker .cast-hint{text-align:center!important;margin-bottom:6px!important;}
body:has(#home.on) .cast-picker .cast-arrow{position:absolute;right:12px;bottom:12px;}

body:has(#game.on) .brand{display:none!important;}
body:has(#game.on) .cast-picker{position:absolute!important;left:auto!important;right:18px!important;top:max(18px,env(safe-area-inset-top))!important;transform:none!important;width:min(170px,42vw)!important;min-width:0!important;padding:8px 11px 9px!important;}
body:has(#game.on) .cast-picker:active{transform:translateY(1px)!important;}
body:has(#game.on) .cast-picker .cast-current{justify-content:center!important;gap:8px!important;font-size:13px!important;}
body:has(#game.on) .cast-picker .cast-hint{text-align:center!important;font-size:8px!important;margin-bottom:5px!important;}
body:has(#game.on) .cast-picker .cast-arrow{position:absolute;right:10px;bottom:10px;}

/* Sound left, Colors right, directly beneath each screen's stats. */
.n99-utility-dock{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;margin:18px 0 0!important;padding:0 0 max(10px,env(safe-area-inset-bottom))!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;z-index:40!important;}
.n99-utility-dock .petty-voice-simple{grid-column:1!important;grid-row:1!important;}
.n99-utility-dock .cos-fab{grid-column:2!important;grid-row:1!important;}
body:has(#game.on){padding-bottom:0!important;}
body:has(#game.on) .n99-utility-dock{position:static!important;top:auto!important;bottom:auto!important;}

/* Give game heading enough room for the upper-right voice selector without moving gameplay. */
body:has(#game.on) #game{padding-top:6px;}
body:has(#game.on) #game .head{padding-left:48px;padding-right:min(172px,43vw);min-height:76px;}
body:has(#game.on) #game .head h2{margin-top:7px;}

@media(max-width:390px){
  body:has(#home.on) .brand{width:43%;font-size:17px;letter-spacing:3px;}
  body:has(#home.on) .brand b{font-size:61px;}
  body:has(#home.on) .cast-picker{right:14px!important;width:48vw!important;top:max(24px,env(safe-area-inset-top))!important;}
  body:has(#home.on) #home>h1{font-size:46px;}
  body:has(#game.on) .cast-picker{right:14px!important;width:43vw!important;}
  body:has(#game.on) #game .head{padding-left:44px;padding-right:44vw;}
  .n99-utility-dock{gap:8px!important;}
}

@media(max-height:760px){
  body:has(#home.on) .brand{margin-bottom:24px;}
  body:has(#home.on) .brand b{font-size:58px;}
  body:has(#home.on) #home>h1{font-size:44px;margin-bottom:12px;}
  .n99-utility-dock{margin-top:14px!important;}
}
`;
document.head.appendChild(style);

const home=document.getElementById('home');
const game=document.getElementById('game');

function dock(){return document.querySelector('.n99-utility-dock')}
function sound(){return document.querySelector('.petty-voice-simple')}
function colors(){return document.querySelector('.cos-fab')}
function targetScreen(){return game?.classList.contains('on')?game:home}

function placeControls(){
  const d=dock(), target=targetScreen();
  if(!d||!target)return;
  const stats=target.querySelector('.stats');
  if(stats){
    if(d.parentElement!==target || stats.nextElementSibling!==d)stats.insertAdjacentElement('afterend',d);
  }else if(d.parentElement!==target){
    target.appendChild(d);
  }
  const s=sound(), c=colors();
  if(s&&s.parentElement===d&&d.firstElementChild!==s)d.insertBefore(s,d.firstElementChild);
  if(c&&c.parentElement===d&&s&&s.nextElementSibling!==c)d.appendChild(c);
}

const observer=new MutationObserver(()=>requestAnimationFrame(placeControls));
if(home)observer.observe(home,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});
if(game)observer.observe(game,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});
observer.observe(document.body,{childList:true,subtree:false});

placeControls();
setTimeout(placeControls,0);
setTimeout(placeControls,300);
setTimeout(placeControls,800);
window.addEventListener('resize',placeControls,{passive:true});
})();
