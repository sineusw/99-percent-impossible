// Capture the device speech engine before the static character transports wrap it.
(() => {
  const synth=window.speechSynthesis;
  if(!synth)return;
  const speak=synth.speak.bind(synth);
  window.N99LeaderboardSpeech={speak(utterance){
    const character=window.N99Character?.get?.()||'petty';
    const voices=synth.getVoices?.()||[];
    const lang=character==='mick'?'en-AU':character==='daisy'?'en-US':'en-GB';
    utterance.voice=voices.find(v=>v.lang===lang)||voices.find(v=>v.lang?.startsWith('en'))||null;
    utterance.lang=utterance.voice?.lang||lang;
    utterance.pitch=character==='daisy'?1.1:character==='mick'?.95:.86;
    return speak(utterance);
  }};
})();
