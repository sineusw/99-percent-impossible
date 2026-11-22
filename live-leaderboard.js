// Game Center is the source of truth. Never synthesize ranks or submit sample data.
(() => {
  if (!window.Capacitor?.isNativePlatform?.()) return;
  const gc = window.Capacitor.Plugins?.N99GameCenter;
  if (!gc) return;
  const names = {timer: 'Perfect Timer', stop: 'Perfect Stop', reaction: 'Reaction'};
  const states = new Map();
  const commentRanks = new Map();
  const decisions = window.N99LeaderboardCommentary.create();
  let selected = 'timer', authenticated = false, activeResult, pending = false, line = null;
  let requestID = 0, lastRefresh = 0, playerID = '';
  const home = document.getElementById('home');
  const card = document.createElement('button');
  card.type = 'button';
  card.setAttribute('aria-label', 'Open live leaderboard');
  card.setAttribute('aria-haspopup', 'dialog');
  card.setAttribute('aria-describedby', 'home-rank-value home-rank-status');
  card.className = 'home-rank live-home-rank';
  const trophy = '<svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="35" stroke="currentColor" stroke-opacity=".15"/><circle cx="40" cy="40" r="28" fill="currentColor" fill-opacity=".07"/><path d="M27 20h26v17a13 13 0 0 1-26 0V20Z" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="2.5"/><path d="M27 25H18v8a11 11 0 0 0 12 11m23-19h9v8a11 11 0 0 1-12 11M40 50v11m-10 4h20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="m40 27 2.5 5 5.5.8-4 4 .9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-4 5.5-.8 2.5-5Z" fill="currentColor"/></svg>';
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  card.setAttribute('aria-controls', 'live-leaderboard-page');
  card.innerHTML = '<span class="rank-emblem" aria-hidden="true">'+trophy+'</span><span class="rank-copy"><span class="rank-eyebrow">THE WEEKLY CLIMB</span><span class="rank-headline"><span>Your world rank</span><strong id="home-rank-value">—</strong></span><small id="home-rank-status" class="live-rank-status">Connecting to Game Center…</small></span><span class="live-open" aria-hidden="true"><span class="rank-open-label">VIEW BOARD</span><span class="rank-open-glyph">'+arrow+'</span></span>';

  home.querySelector('.sub')?.after(card);
  const dialog = document.createElement('dialog');
  dialog.className = 'live-board';
  dialog.id = 'live-leaderboard-page';
  dialog.setAttribute('aria-labelledby','live-board-title');
  dialog.innerHTML = '<div class="live-board-header"><div><span class="board-brand">99% IMPOSSIBLE</span><h2 id="live-board-title">THE LEADERBOARD</h2></div><button type="button" class="live-close" aria-label="Close leaderboard"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div><div class="board-hero"><div><span class="board-eyebrow">WORLDWIDE · THIS WEEK</span><p><em>MAKE YOUR MOVE.</em></p></div><span class="board-hero-art">'+trophy+'</span></div><div class="live-tabs" role="group" aria-label="Leaderboard game"></div><p class="live-rules"></p><section class="live-own" aria-label="Your leaderboard position"><div><span class="board-own-label">YOUR WEEKLY POSITION</span><strong class="board-your-rank">UNRANKED</strong></div><div class="board-own-copy"><strong class="board-your-name"></strong><span class="board-your-score"></span></div></section><button type="button" class="live-connect">CONNECT GAME CENTER '+arrow+'</button><div class="board-standings-heading"><div><span class="board-eyebrow">THE COMPETITION</span><h3>World standings <span class="board-count"></span></h3></div><button type="button" class="live-refresh" aria-label="Refresh leaderboard"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><p class="live-message" aria-live="polite"></p><div class="board-podium" aria-label="Leading players" hidden></div><div class="board-table-labels" aria-hidden="true" hidden><span>RANK / PLAYER</span><span>BEST RESULT</span></div><ol class="live-entries"></ol><section class="board-empty"><div class="board-empty-art" aria-hidden="true"><svg viewBox="0 0 160 90" fill="none"><path d="M10 78h140" stroke="currentColor" stroke-opacity=".2"/><rect x="19" y="45" width="37" height="33" rx="5" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-opacity=".3"/><rect x="61" y="24" width="38" height="54" rx="5" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-opacity=".5"/><rect x="104" y="54" width="37" height="24" rx="5" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-opacity=".2"/><path d="m80 7 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9L80 7Z" fill="currentColor"/></svg></div><h3></h3><p></p><button type="button" class="board-play">PLAY PERFECT TIMER</button></section>';

  document.body.append(dialog);
  const reveal = document.createElement('div');
  reveal.className = 'rank-reveal'; reveal.setAttribute('aria-live', 'polite');
  document.getElementById('retry').before(reveal);
  const status = card.querySelector('small');
  const message = dialog.querySelector('.live-message');
  window.N99LeaderboardPending = result => result === activeResult && pending;
  window.N99LeaderboardLine = result => result === activeResult ? line : null;
  const rank = data => Number.isInteger(data?.local?.rank) && data.local.rank > 0 ? data.local.rank : null;
  function scoreText(game, score) {
    if (game === 'reaction') return `${score} ms`;
    const count = Math.floor(score / 60000001), precision = score % 60000001;
    return `${count} perfect${count === 1 ? '' : 's'}${precision ? ` · miss ${(60000000 - precision) / (game === 'timer' ? 1000 : 10000)}${game === 'timer' ? ' ms' : '%'}` : ''}`;
  }
  function initials(alias) {
    return Array.from(String(alias || '')).filter(c => /[\p{L}\p{N}]/u.test(c)).slice(0,2).join('').toUpperCase() || '•';
  }
  function avatar(entry) {
    const icon = document.createElement('span'); icon.className = 'board-avatar';
    icon.textContent = initials(entry.alias); icon.setAttribute('aria-hidden','true'); return icon;
  }
  function render() {
    const data = states.get(selected), ownRank = rank(data), entries = data?.entries || [];
    card.dataset.ranked = String(!!ownRank);
    dialog.dataset.game = selected;
    card.querySelector('strong').textContent = ownRank ? `#${ownRank.toLocaleString('en-US')}` : '—';
    status.textContent = !authenticated ? 'Connect Game Center to rank' : data ? `${names[selected]} · ${ownRank ? 'This week' : 'Not ranked yet'}` : `${names[selected]} · Loading standings…`;
    dialog.querySelector('.live-connect').hidden = authenticated;
    dialog.querySelector('.board-your-rank').textContent = ownRank ? `#${ownRank.toLocaleString('en-US')}` : 'UNRANKED';
    dialog.querySelector('.board-your-name').textContent = ownRank ? data.local.alias || 'You' : authenticated ? 'Your next run starts here' : 'Join the weekly climb';
    dialog.querySelector('.board-your-score').textContent = ownRank ? scoreText(selected, data.local.score) : authenticated ? 'Set a qualifying score to join' : 'Sign in with Game Center';
    dialog.querySelector('.live-own').classList.toggle('is-ranked',!!ownRank);
    dialog.querySelector('.live-rules').textContent = selected === 'reaction' ? 'Fastest valid reaction wins · 100 ms minimum' : 'Longest perfect streak wins · Closest first miss breaks ties';
    for (const button of dialog.querySelectorAll('.live-tabs button')) button.setAttribute('aria-pressed', String(button.dataset.game === selected));
    dialog.querySelector('.board-count').textContent = data ? `${data.totalPlayers || 0} players` : '';
    const podium = dialog.querySelector('.board-podium');
    const top = entries.filter(entry => entry.rank <= 3).slice(0,3);
    const order = top.length === 3 ? [top[1],top[0],top[2]] : top;
    podium.hidden = !order.length; podium.dataset.count = String(order.length);
    podium.replaceChildren(...order.map(entry => {
      const item = document.createElement('div'); item.className = 'podium-player'; item.dataset.place = String(entry.rank);
      const badge = document.createElement('b'); badge.className='podium-place'; badge.textContent=`#${entry.rank}`;
      const name = document.createElement('strong'); name.textContent = entry.alias;
      const score = document.createElement('span'); score.className='podium-score'; score.textContent=scoreText(selected,entry.score);
      item.append(badge,avatar(entry),name,score); return item;
    }));
    const rows = entries.map(entry => {
      const row = document.createElement('li'); row.value = entry.rank;
      const place = document.createElement('b'); place.className='board-row-rank'; place.textContent=String(entry.rank);
      const alias = document.createElement('strong'); alias.className='board-row-name'; alias.textContent = `${entry.alias}${entry.isYou ? ' (YOU)' : ''}`;
      const score = document.createElement('span'); score.className='board-row-score'; score.textContent = scoreText(selected, entry.score);
      if (entry.isYou) row.classList.add('is-you'); row.append(place,avatar(entry),alias,score); return row;
    });
    dialog.querySelector('.live-entries').replaceChildren(...rows);
    dialog.querySelector('.board-table-labels').hidden = !rows.length;
    const empty=dialog.querySelector('.board-empty'); empty.hidden=!!rows.length;
    empty.querySelector('h3').textContent=!authenticated?'Your score belongs here.':data?'The climb starts with you.':'Finding your competition…';
    empty.querySelector('p').textContent=!authenticated?'Connect Game Center to see real worldwide standings and put your name on the board.':data?'No scores are available for this board yet. Play a qualifying round to make your mark.':'Standings appear here when Game Center responds.';
    empty.querySelector('.board-play').textContent=`PLAY ${names[selected].toUpperCase()}`;
  }
  function apply(game, data) {
    if (!data.authenticated) return;
    if (playerID && data.playerID !== playerID) { states.clear(); commentRanks.clear(); }
    playerID = data.playerID; authenticated = true;
    states.set(game, data);
    if (!commentRanks.has(game) && rank(data)) commentRanks.set(game, rank(data));
    render();
  }
  async function refresh(force = false) {
    if (!authenticated || (!force && Date.now() - lastRefresh < 15000)) return;
    lastRefresh = Date.now(); const game = selected;
    message.textContent = 'Refreshing…';
    try {
      const data = await gc.standings({game});
      if (!data.authenticated) { authenticated = false; states.clear(); commentRanks.clear(); render(); }
      else apply(game, data);
      if (game !== selected) return;
      message.textContent = data.authenticated ? `${data.totalPlayers || 0} ranked players · Updated just now` : 'Sign in to Game Center to see your standings.';
    } catch { if (game !== selected) return; message.textContent = states.has(game) ? 'Could not refresh · Showing the last received standings' : 'Could not load standings · Tap refresh to try again'; status.textContent = 'Offline · Rank may have changed'; }
  }
  async function authenticate(interactive = false) {
    try {
      const data = await gc.authenticate({interactive});
      authenticated = !!data.authenticated;
      if (!authenticated) { states.clear(); commentRanks.clear(); }
      render();
      if (authenticated) await refresh(true);
      else message.textContent = 'Connect Game Center to compete. You can keep playing without signing in.';
    } catch { status.textContent = 'Game Center unavailable · Tap to retry'; }
  }
  for (const [game, name] of Object.entries(names)) {
    const icons = {timer:'<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2M9 3h6"/>',stop:'<rect x="3" y="7" width="18" height="10" rx="4"/><path d="M13 4v16M10 10h6"/>',reaction:'<path d="m14 2-9 12h7l-2 8 9-13h-7l2-7Z"/>'};
    const button = document.createElement('button'); button.type = 'button'; button.dataset.game = game;
    button.setAttribute('aria-label',name+' leaderboard');
    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[game]+'</svg><span>'+({timer:'TIMER',stop:'STOP',reaction:'REACTION'}[game])+'</span>';
    button.addEventListener('click', () => { selected = game; render(); refresh(true); });
    dialog.querySelector('.live-tabs').append(button);
  }
  card.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); render(); refresh(true); });
  dialog.querySelector('.live-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.board-play').addEventListener('click', () => { dialog.close(); document.querySelector(`.card[data-g="${selected}"]`)?.click(); });
  dialog.querySelector('.live-connect').addEventListener('click', () => authenticate(true));
  dialog.querySelector('.live-refresh').addEventListener('click', () => authenticated ? refresh(true) : authenticate(true));
  document.querySelectorAll('[data-g]').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.g; gc.resetRun().catch(() => {}); render(); refresh();
  }));
  document.getElementById('back').addEventListener('click', () => { gc.resetRun().catch(() => {}); refresh(); });
  window.addEventListener('n99:result', async ({detail}) => {
    const serial = ++requestID;
    activeResult = detail; line = null; pending = false;
    if (!detail || !Number.isFinite(detail.rawScore) || detail.isSuspicious) {
      reveal.textContent = 'UNRANKED ATTEMPT · RANK UNCHANGED'; return;
    }
    if (!authenticated) { reveal.textContent = 'Connect Game Center to join the live leaderboard.'; return; }
    const game = detail.game, from = commentRanks.get(game) ?? rank(states.get(game));
    pending = true; reveal.textContent = 'SYNCING WEEKLY RANK…';
    // Network work never blocks input. An old response must not speak over a later result.
    let expired = false;
    const timeout = setTimeout(() => {
      expired = true;
      if (serial !== requestID) return;
      pending = false; reveal.textContent = 'Rank sync delayed · Keep playing';
      window.dispatchEvent(new Event('n99:rank-ready'));
    }, 6000);
    try {
      const data = await gc.submit({game, rawScore: detail.rawScore, attempt: detail.attemptNumber, isSuspicious: !!detail.isSuspicious});
      if (serial !== requestID) return;
      apply(game, data);
      if (expired || window.N99Result !== detail) return;
      const to = rank(data);
      if (to) commentRanks.set(game, to);
      reveal.textContent = to ? `WEEKLY RANK #${to}${from && to !== from ? ` · ${to < from ? '↑' : '↓'} ${Math.abs(to - from)} spots` : ''}` : 'NOT RANKED YET · Get a perfect streak to join';
      const voice = window.N99Character?.get?.() || 'petty';
      const decision = decisions(`${voice}:${game}`, from, to);
      const milestone = [1,3,5,10,25,50,100,1000].find(limit => from > limit && to && to <= limit);
      if (decision?.type === 'silent') line = '';
      else if (decision?.type === 'rank') line = window.N99RankLine(voice, milestone === 1 ? 'first' : milestone ? 'milestone' : decision.streak >= 3 ? 'streak' : to < from ? 'climb' : 'drop', milestone);
    } catch {
      if (serial === requestID && !expired) reveal.textContent = 'SCORE NOT SYNCED · Check your connection';
    } finally {
      clearTimeout(timeout);
      if (serial === requestID && !expired) { pending = false; window.dispatchEvent(new Event('n99:rank-ready')); }
    }
  });
  gc.addListener('authenticationChanged', data => {
    if (playerID && data.playerID !== playerID) { states.clear(); commentRanks.clear(); gc.resetRun().catch(() => {}); }
    playerID = data.playerID || ''; authenticated = !!data.authenticated; render(); if (authenticated) refresh(true);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) authenticate(); });
  setInterval(() => { if (!document.hidden && (home.classList.contains('on') || dialog.open)) refresh(); }, 30000);
  render(); authenticate();
})();
