/* 99% IMPOSSIBLE — Petty v6.2: contextual every-open greeting */
(()=>{
 const pp=window.PettyPersonality;if(!pp||pp.__v6)return;pp.__v6=true;
 const q=s=>document.querySelector(s),mr=q('#mr');
 const hideLegacy=()=>{if(!mr)return;Array.from(mr.childNodes).forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent='';else if(n.nodeType===1&&!n.classList.contains('petty-aside')&&!n.classList.contains('streak-dead'))n.style.display='none'})};
 if(mr)new MutationObserver(hideLegacy).observe(mr,{childList:true,subtree:true,characterData:true});
 const modal=q('#modal');if(modal)new MutationObserver(()=>{if(!modal.classList.contains('hide'))requestAnimationFrame(hideLegacy)}).observe(modal,{attributes:true,attributeFilter:['class']});
 const pick=a=>a[Math.floor(Math.random()*a.length)],d=new Date(),hr=d.getHours(),day=d.getDay(),m=d.getMonth()+1,date=d.getDate();
 const fourthThursday=()=>{const x=new Date(d.getFullYear(),10,1);return 1+((4-x.getDay()+7)%7)+21};
 let pool=[];
 const holiday=(m===1&&date===1)?['Happy New Year. Same thumbs, though.','New year, new you? We shall see.']:(m===2&&date===14)?['Happy Valentine’s Day. The target still does not love you.','Romance later. Missed milliseconds now.']:(m===3&&date===17)?['Happy St Patrick’s Day. You may need the luck.']:(m===7&&date===4)?['Happy Fourth. Your reflexes remain under British supervision.']:(m===10&&date===31)?['Happy Halloween. Your score is frightening enough.','Spooky season. Your timing understood the assignment.']:(m===11&&date===fourthThursday())?['Happy Thanksgiving. I am grateful you are funding my existence.','Thanksgiving. Be grateful the retry button is unlimited.']:(m===12&&date===25)?['Merry Christmas. Your gift is another attempt.','Merry Christmas. I got you disappointment.']:(m===12&&date===31)?['New Year’s Eve. One last bad decision for the road.']:null;
 if(holiday)pool.push(...holiday);
 if(hr<5)pool.push('It is absurdly late. Fam, go to bed after this.','Still awake? Your circadian rhythm is cooked.','At this hour, even I am judging less efficiently.');
 else if(hr<11)pool.push('Morning. Starting the day with violence against milliseconds?','Good morning. Rise, grind, miss the target.','Breakfast can wait. Apparently this cannot.');
 else if(hr<14)pool.push('Lunch break? Bold use of company time.','Midday already. Productivity has taken a curious turn.');
 else if(hr<18)pool.push('Afternoon. Plenty of day left to improve. Allegedly.','Good afternoon. Let us ruin your confidence efficiently.');
 else if(hr<22)pool.push('Evening. Perfect time for unnecessary competition.','Good evening. Your thumbs have been summoned.');
 else pool.push('Late night gaming. Excellent judgement.','It is getting late. Naturally, you opened this.');
 if(day===1)pool.push('Monday. You chose additional suffering. Admirable.','It is Monday, fam. The week was already doing enough.');
 if(day===5)pool.push('Friday. And this is how we are celebrating?','Friday night. Wild plans, my guy.');
 if(day===0||day===6)pool.push('Weekend. No work, just emotional damage.','Weekend plans: apparently me.');
 pool.push('Oh, you came back. Interesting.','Welcome back, victim.','There you are. I kept the disappointment fresh.','Back again? The confidence is impressive.','Welcome. I have reviewed your previous work.','You returned. The evidence remains.','Oh good. More data.','Right. Let us see what today’s excuse is.','Fam, we are really doing this again?','Welcome back. I assume timing is still the problem.','My guy returned voluntarily. Fascinating.','Ah. The rematch nobody requested.','You again. Lovely.','Back for another character-building exercise?','Excellent. Another chance to humble yourself.','Welcome back. Your score history sends its regards.');
 const greeting=pick(pool);
 try{window.preloadPettyVoice?.(greeting)}catch{}
 let greeted=false;
 addEventListener('pointerdown',e=>{if(greeted||e.target?.classList?.contains('petty-voice')||window.__PETTY_AD_BANTER_LOCK)return;greeted=true;pp.interruptAndSpeak?pp.interruptAndSpeak(greeting):pp.speak(greeting,true)},{capture:true});
 pp.version='6.2';
})();