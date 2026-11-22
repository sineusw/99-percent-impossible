// Local skill goals: no purchases, score boosts, penalties or leaderboard mutations.
(function () {
  'use strict';
  const key = 'n99-daily-progress-v1';
  function dayKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function goals(day) {
    const seed = Number(day.replaceAll('-', '')) % 3;
    return [
      {game:'timer', target:[50,35,20][seed], label:`Finish within ${[50,35,20][seed]} ms of 1.000s`},
      {game:'stop', target:[90,93,95][seed], label:`Score ${[90,93,95][seed]}% or better`},
      {game:'reaction', target:[350,320,300][seed], label:`React in ${[350,320,300][seed]} ms or less`}
    ];
  }
  function qualifies(goal, result) {
    if (!result || result.game !== goal.game || result.isSuspicious || !Number.isFinite(result.rawScore)) return false;
    const raw = result.rawScore;
    if (goal.game === 'timer') return raw >= 0 && Math.abs(raw - 1) * 1000 <= goal.target + 1e-8;
    if (goal.game === 'stop') return raw <= 100 && raw >= goal.target;
    return raw >= 100 && raw <= goal.target;
  }
  if (typeof module !== 'undefined') { module.exports = {dayKey, goals, qualifies}; return; }
  const names = {timer:'Timer',stop:'Stop',reaction:'Reaction'};
  const titles = [[30,'Precision Legend'],[14,'Elite Challenger'],[7,'Contender'],[3,'Rising Challenger'],[1,'Challenge Finisher'],[0,'New Challenger']];
  let stored;
  try { stored = JSON.parse(localStorage.getItem(key)); } catch {}
  const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
  let state = {day: validDay(stored?.day) ? stored.day : '', done: Array.isArray(stored?.done) ? [...new Set(stored.done.filter(g=>Object.hasOwn(names,g)))] : [],
    completedDays: Array.isArray(stored?.completedDays) ? [...new Set(stored.completedDays.filter(validDay))].slice(-366) : [],
    completedTotal: Number.isSafeInteger(stored?.completedTotal) && stored.completedTotal >= 0 ? stored.completedTotal : 0};
  state.completedTotal = Math.max(state.completedTotal, state.completedDays.length);
  const section = document.createElement('section'); section.className = 'daily-progress';
  section.innerHTML = '<div class="daily-heading"><span>DAILY SKILL CHALLENGE</span><b class="daily-count"></b></div><p class="daily-title"></p><progress max="3" value="0" aria-label="Daily goals complete"></progress><details><summary>See today’s goals</summary><div class="daily-goals"></div><p class="daily-note">New goals each day on this device. Progress titles are yours to keep. Missing a day never removes progress.</p></details><p class="daily-completion" aria-live="polite"></p>';
  const home = document.getElementById('home'); const sub = home?.querySelector('.sub');
  if (sub) sub.after(section); else home?.append(section);
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }
  function refreshDay() {
    const day = dayKey(new Date());
    if (state.day !== day) { state.day = day; state.done = []; save(); }
    return day;
  }
  function render() {
    refreshDay();
    const count = state.done.length, level = titles.find(([days])=>state.completedTotal >= days)[1];
    section.querySelector('.daily-count').textContent = `${count}/3`;
    section.querySelector('progress').value = count;
    section.querySelector('.daily-title').textContent = `${level} · ${state.completedTotal} challenge day${state.completedTotal===1?'':'s'} complete`;
    const rows = goals(state.day).map(goal=>{
      const row = document.createElement('div'); row.className='daily-goal';
      const text = document.createElement('span'); text.textContent=`${names[goal.game]} · ${goal.label}`;
      const button = document.createElement('button'); button.type='button';
      const complete = state.done.includes(goal.game); button.textContent=complete?'✓ DONE':'PLAY';
      button.setAttribute('aria-label',`${complete?'Replay':'Play'} ${names[goal.game]} challenge`);
      button.addEventListener('click',()=>document.querySelector(`.card[data-g="${goal.game}"]`)?.click());
      row.append(text,button); return row;
    });
    section.querySelector('.daily-goals').replaceChildren(...rows);
    const next = [...titles].reverse().find(([days])=>days>state.completedTotal);
    section.querySelector('.daily-completion').textContent = count===3 ? `TODAY COMPLETE · ${next ? `${next[0]-state.completedTotal} more challenge day${next[0]-state.completedTotal===1?'':'s'} to ${next[1]}` : 'Precision Legend earned'}` : 'Three games. Three goals. One clean sweep.';
  }
  const seen = new WeakSet();
  window.addEventListener('n99:result',({detail})=>{
    if (!detail || typeof detail !== 'object' || seen.has(detail)) return; seen.add(detail);
    const previousDay=state.day; refreshDay();
    const goal=goals(state.day).find(g=>g.game===detail.game);
    if (!goal || state.done.includes(goal.game) || !qualifies(goal,detail)) { if(previousDay!==state.day)render(); return; }
    state.done.push(goal.game);
    if(state.done.length===3&&!state.completedDays.includes(state.day)) {
      state.completedDays.push(state.day); state.completedDays=state.completedDays.slice(-366);state.completedTotal++;
    }
    save();render();
    window.dispatchEvent(new CustomEvent('n99:daily-goal',{detail:{game:goal.game,complete:state.done.length===3}}));
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  window.addEventListener('focus',render);
  function midnight() { const now=new Date(),next=new Date(now);next.setHours(24,0,0,25);setTimeout(()=>{render();midnight();},next-now); }
  render();midnight();
})();
