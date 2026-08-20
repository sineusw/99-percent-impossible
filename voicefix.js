/* Petty British voice quality fix — additive, no gameplay patches */
(()=>{
  if(!('speechSynthesis' in window))return;
  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  if(synth.__pettyBritishFix)return;
  synth.__pettyBritishFix=true;

  let voices=[];
  const refresh=()=>{voices=synth.getVoices?.()||[]};
  refresh();
  synth.addEventListener?.('voiceschanged',refresh);

  function scoreVoice(v){
    const lang=(v.lang||'').toLowerCase();
    const name=(v.name||'').toLowerCase();
    if(!lang.startsWith('en-gb'))return -999;
    let s=100;
    // Prefer commonly available natural-sounding Apple UK voices when present.
    if(/daniel|arthur|martha|serena|kate|oliver/.test(name))s+=35;
    if(/enhanced|premium/.test(name))s+=30;
    if(/compact/.test(name))s-=45;
    if(v.localService)s+=5;
    return s;
  }

  function bestBritish(){
    refresh();
    return voices.slice().sort((a,b)=>scoreVoice(b)-scoreVoice(a)).find(v=>scoreVoice(v)>0)||null;
  }

  function speakBritish(utterance){
    const v=bestBritish();
    if(v){utterance.voice=v;utterance.lang=v.lang||'en-GB';nativeSpeak(utterance);return;}
    // iOS often populates voices asynchronously. Give it a brief window before
    // allowing the browser to fall back to a generic voice.
    let tries=0;
    const wait=()=>{
      const found=bestBritish();
      if(found){utterance.voice=found;utterance.lang=found.lang||'en-GB';nativeSpeak(utterance);return;}
      if(++tries<12){setTimeout(wait,100);return;}
      utterance.lang='en-GB';nativeSpeak(utterance);
    };
    wait();
  }

  synth.speak=speakBritish;
})();