/* 99% IMPOSSIBLE — keep the Store close control reachable on short/mobile viewports. */
(()=>{
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    .cos-box{overscroll-behavior:contain}
    .cos-close{
      position:sticky!important;
      top:0!important;
      right:auto!important;
      z-index:10;
      display:block;
      width:44px;
      height:44px;
      margin:-8px -8px -36px auto;
      border-radius:10px;
      background:linear-gradient(180deg,#171922f7,#0d0e12f7)!important;
      border:1px solid rgba(255,255,255,.12)!important;
      box-shadow:0 4px 14px rgba(0,0,0,.35);
      line-height:1;
      touch-action:manipulation;
    }
    .cos-close:active{transform:translateY(1px);filter:brightness(1.15)}
  `;
  document.head.appendChild(style);
})();