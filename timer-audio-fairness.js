/* 99% IMPOSSIBLE — Perfect Timer hidden-phase audio fairness
   Keep one subtle start/tick cue and one blind cue at 0.500s.
   The cues route through the Safari-safe non-beep SFX layer.
*/
(()=>{
  'use strict';

  timerStart=function(){
    audio();
    window.N99SFX?.prime?.();
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
          window.N99SFX?.play?.('blind');
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
