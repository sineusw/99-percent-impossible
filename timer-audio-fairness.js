/* 99% IMPOSSIBLE — Perfect Timer hidden-phase audio fairness
   Keep the hidden timer behavior while leaving gameplay outcome SFX to the strict 3-asset engine.
*/
(()=>{
  'use strict';

  timerStart=function(){
    audio();
    st.run=1;
    st.start=performance.now();
    primary.textContent='STOP';
    ticks('timer');

    let n=play.querySelector('.num'),q=play.querySelector('.note'),blindCuePlayed=false;

    let loop=()=>{
      let t=(performance.now()-st.start)/1000;

      if(t<.5){
        n.textContent=t.toFixed(3);
        q.textContent='VISIBLE UNTIL 0.500s';
      }else{
        if(!blindCuePlayed){
          blindCuePlayed=true;
          untick();
        }
        n.textContent='???';
        n.classList.add('green');
        q.textContent='TIMER HIDDEN — KEEP COUNTING';
      }

      st.raf=requestAnimationFrame(loop);
    };

    st.raf=requestAnimationFrame(loop);
  };
})();
