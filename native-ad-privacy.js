// UMP owns consent decisions. No ad SDK initialization or requests before permission.
(()=>{
  if(!window.Capacitor?.isNativePlatform?.())return;
  const sdk=window.Capacitor?.Plugins?.AdMob;
  let allowed=false,busy=false,required=false,overlay=null,previousAudioLock=false;
  const privacy={get canRequestAds(){return allowed&&!busy},get busy(){return busy},ready:null};
  window.N99AdPrivacy=privacy;
  const button=document.createElement('button');
  button.id='n99-ad-privacy';button.type='button';button.textContent='AD PRIVACY';
  button.setAttribute('aria-label','Ad privacy options');
  button.style.cssText='display:block;margin:16px auto;padding:12px 20px;border:1px solid #666;border-radius:8px;background:#151515;color:#fff;font:inherit;min-height:44px';
  document.querySelector('#home')?.appendChild(button);
  function lock(value){
    busy=value;button.disabled=value;
    document.querySelector('main')?.toggleAttribute('inert',value);
    if(value){
      previousAudioLock=!!window.__PETTY_AD_BANTER_LOCK;
      window.__PETTY_AD_BANTER_LOCK=true;
      try{window.speechSynthesis?.cancel?.();window.N99CastStaticAudio?.stop?.();window.N99SFX?.stop?.()}catch{}
      overlay=document.createElement('div');overlay.id='n99-privacy-loading';
      overlay.setAttribute('role','status');overlay.textContent='Checking ad privacy…';
      overlay.style.cssText='position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:#050505;color:#fff;font:16px system-ui';
      document.body.appendChild(overlay);
    }else{overlay?.remove();overlay=null;window.__PETTY_AD_BANTER_LOCK=previousAudioLock}
  }
  function apply(info){
    allowed=info?.canRequestAds===true;
    required=info?.privacyOptionsRequirementStatus==='REQUIRED';
    button.textContent=required?'PRIVACY CHOICES':'AD PRIVACY';
  }
  async function info(){
    // Only the non-presenting network request may time out. Never release gameplay under a form.
    let timer;
    try{return await Promise.race([
      sdk.requestConsentInfo(),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Consent information unavailable')),10000)})
    ])}finally{clearTimeout(timer)}
  }
  async function startup(){
    lock(true);
    try{
      let state=await info();
      if(state.status==='REQUIRED'&&state.isConsentFormAvailable)state=await sdk.showConsentForm();
      apply(state);
    }catch(error){allowed=false;console.warn('[N99 PRIVACY] Ads disabled:',error?.message||error)}
    finally{lock(false)}
  }
  button.addEventListener('click',async()=>{
    if(busy||window.N99Ads?.adOpen)return;
    lock(true);allowed=false;
    try{
      let state=await info();
      if(state.privacyOptionsRequirementStatus==='REQUIRED'){
        await sdk.showPrivacyOptionsForm();state=await info();
      }else if(state.status==='REQUIRED'&&state.isConsentFormAvailable){
        state=await sdk.showConsentForm();
      }else{
        window.alert('Ad privacy choices are not currently required for your region. This app requests non-personalized ads and does not request tracking permission. See the Privacy Policy for details.');
      }
      apply(state);
    }catch(error){allowed=false;window.alert('Ad privacy options are unavailable. Ads will stay off. Please try again when connected.');console.warn('[N99 PRIVACY]',error?.message||error)}
    finally{lock(false)}
  });
  privacy.ready=startup();
})();
