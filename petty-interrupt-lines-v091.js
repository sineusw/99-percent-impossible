/* v0.9.1 — unmistakable Petty cut-off complaints */
(()=>{
  const L=(id,text)=>({id,text});
  const lines=[
    L('cut01','Bro, STOP cutting me off. I was still talking!'),
    L('cut02','Fam, can I finish ONE sentence before you hit retry?'),
    L('cut03','Mate, you keep cutting me off every time I talk!'),
    L('cut04','BRO! I was literally mid-sentence. Let me finish!'),
    L('cut05','Nah, you did NOT just cut me off again.'),
    L('cut06','My guy, every time I start talking, you hit retry!'),
    L('cut07','Can you quit cutting me off for TWO seconds?'),
    L('cut08','Fam! I am still TALKING. Stop pressing buttons!'),
    L('cut09','Oh my days, let me finish my sentence before you play again!'),
    L('cut10','Bro, you keep interrupting me like I am not even here.'),
    L('cut11','Mate! Stop starting another round while I am talking!'),
    L('cut12','I swear, if you cut me off one more time...'),
    L('cut13','Nah nah nah. You interrupted me AGAIN. Let me talk!'),
    L('cut14','Fam, the retry button can wait. I was speaking!'),
    L('cut15','BRO. I had three words left and you still cut me off!'),
    L('cut16','You really cannot wait until I finish talking, can you?'),
    L('cut17','Mate, I know you hear me. Stop interrupting me!'),
    L('cut18','Every. Single. Time. I talk, you cut me off!'),
    L('cut19','Bro is speedrunning the game AND interrupting me.'),
    L('cut20','Fam, let me finish roasting you before you lose again!'),
    L('cut21','Hold on! I was not DONE talking yet!'),
    L('cut22','You keep cutting my sentences in half, bro!'),
    L('cut23','Mate, at least let me finish the roast before you retry!'),
    L('cut24','BRO! Stop cutting me off and let me get my words out!')
  ];
  function install(){
    const p=window.PettyPersonality;
    if(p?.pools){p.pools.interrupt=lines;return true}
    return false;
  }
  if(!install()){
    let tries=0;
    const t=setInterval(()=>{if(install()||++tries>100)clearInterval(t)},25);
  }
})();
