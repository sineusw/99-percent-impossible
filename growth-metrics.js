// Bounded on-device aggregates. No account identifiers, raw scores or network requests.
(() => {
  const key='n99-play-metrics-v1';let data;
  try{data=JSON.parse(localStorage.getItem(key))}catch{}
  if(!data||typeof data!=='object'||Array.isArray(data))data={};
  const allowed=new Set(['sessions','rounds','validRounds','personalBests','perfects','dailyGoals','dailyCompletions','adAttempts','adShown','adDismissed','adFailures','adInterruptedExit']);
  const date=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const clean={};
  for(const day of Object.keys(data).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().slice(-30)){
    clean[day]={};for(const [field,value]of Object.entries(data[day]||{}))if(allowed.has(field)&&Number.isSafeInteger(value)&&value>=0)clean[day][field]=Math.min(value,1000000);
  }data=clean;
  let timer=0;
  function flush(){clearTimeout(timer);timer=0;try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
  function record(name){if(!allowed.has(name))return;const day=date();data[day]??={};data[day][name]=Math.min((data[day][name]||0)+1,1000000);for(const stale of Object.keys(data).sort().slice(0,-30))delete data[stale];if(!timer)timer=setTimeout(flush,1000);}
  const seen=new WeakSet();
  window.N99Metrics={record,summary:()=>JSON.parse(JSON.stringify({scope:'This device only; no revenue or population retention data',days:data})),flush};
  record('sessions');
  window.addEventListener('n99:result',({detail})=>{if(!detail||typeof detail!=='object'||seen.has(detail))return;seen.add(detail);record('rounds');if(Number.isFinite(detail.rawScore)&&!detail.isSuspicious){record('validRounds');if(detail.isPB)record('personalBests');if(detail.isPerfect)record('perfects');}});
  window.addEventListener('n99:daily-goal',({detail})=>{record('dailyGoals');if(detail?.complete)record('dailyCompletions');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(window.N99Ads?.adOpened)record('adInterruptedExit');flush();}});
  window.addEventListener('pagehide',flush);
})();
