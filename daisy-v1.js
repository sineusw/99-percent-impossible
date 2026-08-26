/* 99% IMPOSSIBLE — Daisy Personality v1
   Aunt Shirley voice target. Data-only until Daisy audio assets are added.
   Does not override Petty, gameplay, or speech transport. */
(()=>{
  if(window.DaisyPersonality?.__v1)return;
  const L=(id,text)=>({id:'daisy_'+id,text});
  const pools={
    timer:[
      L('t01','Oh, honey… were you even counting?'),
      L('t02','One second, sweetheart. Just the one.'),
      L('t03','Aww. You really trusted that guess.'),
      L('t04','Baby, that timer did not deserve this.'),
      L('t05','Okay… so counting is not our ministry.'),
      L('t06','Bless your heart. Run that back.')
    ],
    stop:[
      L('s01','Sweetie… the box was right there.'),
      L('s02','Aww. Did the target scare you?'),
      L('s03','Honey, where exactly were we aiming?'),
      L('s04','That was a choice. Not a good one, but a choice.'),
      L('s05','Baby, the target was not hiding.'),
      L('s06','Oh, sweetheart. Open your eyes next time.')
    ],
    reaction:[
      L('r01','Oh baby… we were waiting on you.'),
      L('r02','Sweetheart, green means go. Eventually is not part of it.'),
      L('r03','Aww. Your thumb needed a little meeting first?'),
      L('r04','Honey, that reaction came with standard shipping.'),
      L('r05','Baby, the light had time to get comfortable.'),
      L('r06','Oh sweetheart… wake it up.')
    ],
    early:[
      L('e01','Girl— the light was not even green yet.'),
      L('e02','Aww, look at you reacting to absolutely nothing.'),
      L('e03','Sweetheart. We said wait.'),
      L('e04','Baby, you cannot beat the signal if the signal never happened.'),
      L('e05','Oh honey. That was panic with confidence.'),
      L('e06','Bless your heart. You tapped on a feeling.')
    ],
    suspicious:[
      L('x01','Ummm… are you a robot? Because I am watching you.'),
      L('x02','Okay, baby. That was suspicious.'),
      L('x03','Sweetheart… humans usually need a little more time than that.'),
      L('x04','Oh? So we are predicting the future now?'),
      L('x05','Baby, I need to see your hands.'),
      L('x06','Mmm-hmm. Very normal. Completely believable.')
    ],
    good:[
      L('g01','Okayyy! Look at you doing something right.'),
      L('g02','Aww, see? There is hope for you.'),
      L('g03','Well now. That was actually cute.'),
      L('g04','Okay, sweetheart. I see you.'),
      L('g05','Baby, that one was clean.'),
      L('g06','Mmm! Much better.')
    ],
    veryClose:[
      L('vc01','Awww, you were so close. That is actually tragic.'),
      L('vc02','Oh baby… that one hurt me a little.'),
      L('vc03','Sweetheart, you were right there.'),
      L('vc04','Aww. Close enough to taste it, not close enough to have it.'),
      L('vc05','Honey, one tiny little mistake ruined everything.'),
      L('vc06','Ohhh, that was almost beautiful.')
    ],
    pb:[
      L('pb01','Okayyy! Look at you improving.'),
      L('pb02','A new personal best? Well, somebody has been practicing.'),
      L('pb03','Aww, you got better. I am almost proud.'),
      L('pb04','Sweetheart, that is progress. Do not get cocky.'),
      L('pb05','Okay baby, I cannot even hate on that.'),
      L('pb06','Well now. New best. Look at you.')
    ],
    perfect:[
      L('pf01','Okayyy! Look at you actually being good at something.'),
      L('pf02','Oh! You did it. Now do not become annoying.'),
      L('pf03','Well, sweetheart… that was perfect.'),
      L('pf04','Aww, baby. I had a roast ready and everything.'),
      L('pf05','Okay, show-off. I see you.'),
      L('pf06','Mmm! Perfect. I hate how cute that was.')
    ],
    streak:[
      L('st01','Aww… and there goes your little streak.'),
      L('st02','Oh baby. You had momentum and everything.'),
      L('st03','Sweetheart, you just ruined a perfectly good run.'),
      L('st04','Well… that streak was nice while it lasted.'),
      L('st05','Aww. You fumbled it.'),
      L('st06','Honey, I was starting to believe in you.')
    ],
    generic:[
      L('n01','Oh, honey.'),
      L('n02','Sweetheart… be serious.'),
      L('n03','Aww. Try that again.'),
      L('n04','Baby, what was that?'),
      L('n05','Bless your heart.'),
      L('n06','Okay. We are going to pretend that did not happen.')
    ]
  };
  function classify(game,score,meta=''){
    const pb=/NEW PERSONAL BEST/i.test(meta);
    if(game==='PERFECT TIMER'){
      const v=parseFloat(score),perfect=/^1\.000s$/.test(score),diff=Math.abs(v-1);
      if(perfect)return 'perfect'; if(pb)return 'pb'; if(diff<=.015)return 'veryClose'; if(diff<=.06)return 'good'; return 'timer';
    }
    if(game==='PERFECT STOP'){
      const v=parseFloat(score); if(v>=99.95)return 'perfect'; if(pb)return 'pb'; if(v>=97)return 'veryClose'; if(v>=90)return 'good'; return 'stop';
    }
    if(game==='REACTION TEST'){
      if(score==='TOO EARLY')return 'early'; const v=parseFloat(score);
      if(v<100)return 'suspicious'; if(v<=170)return 'perfect'; if(pb)return 'pb'; if(v<=210)return 'veryClose'; if(v<=280)return 'good'; return 'reaction';
    }
    return pb?'pb':'generic';
  }
  window.DaisyPersonality={__v1:true,voiceTarget:'Aunt Shirley',assetRoot:'/assets/daisy-audio/',pools,classify};
})();
