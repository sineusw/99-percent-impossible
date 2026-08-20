/* 99% IMPOSSIBLE — Petty v6: one visible Petty line, faster result pickup, every-open greeting */
(()=>{
 const pp=window.PettyPersonality;if(!pp||pp.__v6)return;pp.__v6=true;
 const q=s=>document.querySelector(s),mr=q('#mr');
 // The modal should show ONE commentary sentence: the same sentence Petty says.
 const hideLegacy=()=>{if(!mr)return;Array.from(mr.childNodes).forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent='';else if(n.nodeType===1&&!n.classList.contains('petty-aside')&&!n.classList.contains('streak-dead'))n.style.display='none'})};
 if(mr)new MutationObserver(hideLegacy).observe(mr,{childList:true,subtree:true,characterData:true});
 const modal=q('#modal');if(modal)new MutationObserver(()=>{if(!modal.classList.contains('hide'))requestAnimationFrame(hideLegacy)}).observe(modal,{attributes:true,attributeFilter:['class']});
 // Make the first interaction of every page/app open produce a greeting, even for short returns.
 const greetings=['Oh, good. You opened it again. I was worried you had developed hobbies.','Welcome back. Your previous decisions have been preserved for review.','There you are. I kept the buttons warm and the expectations low.','Back for another completely voluntary performance review, are we?','Welcome. The game is ready. Whether you are is an unrelated question.','Ah. My favourite recurring statistical anomaly has arrived.','You opened the app. Bold start. Let us see whether the confidence survives contact with a button.','Welcome back. I have made no improvements to your reflexes while you were away.','There you are. I was just explaining your score history to absolutely no one.','Excellent. Another session. I will alert the Department of Unnecessary Confidence.','Welcome back. I assume the plan is to blame timing again.','You returned. The evidence from last time remains admissible.'];
 let greeted=false;
 addEventListener('pointerdown',e=>{if(greeted||e.target?.classList?.contains('petty-voice')||window.__PETTY_AD_BANTER_LOCK)return;greeted=true;setTimeout(()=>pp.speak(greetings[Math.floor(Math.random()*greetings.length)],true),35)},{capture:true,once:false});
 pp.version='6.0';
})();