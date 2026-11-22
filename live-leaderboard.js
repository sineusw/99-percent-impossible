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
  const card = document.createElement('section');
  card.className = 'home-rank live-home-rank';
  card.innerHTML = '<span>YOUR WEEKLY RANK</span><strong id="home-rank-value">—</strong><small class="live-rank-status">Connecting to Game Center…</small><button type="button" class="live-open">LIVE LEADERBOARD ↗</button>';
  home.querySelector('.sub')?.after(card);
  const dialog = document.createElement('dialog');
  dialog.className = 'live-board';
  dialog.innerHTML = '<div class="live-board-header"><h2>LIVE LEADERBOARD</h2><button type="button" class="live-close" aria-label="Close leaderboard">×</button></div><p>Worldwide · This week · Game Center</p><div class="live-tabs" role="group" aria-label="Leaderboard game"></div><p class="live-rules"></p><p class="live-message" aria-live="polite"></p><button type="button" class="live-connect">CONNECT GAME CENTER</button><button type="button" class="live-refresh">REFRESH</button><p class="live-own"></p><ol class="live-entries"></ol>';
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
  function render() {
    const data = states.get(selected), ownRank = rank(data);
    card.querySelector('strong').textContent = ownRank ? `#${ownRank.toLocaleString('en-US')}` : '—';
    status.textContent = !authenticated ? 'Connect Game Center to rank' : data ? `${names[selected]} · ${ownRank ? 'Updated from Game Center' : 'Not ranked yet'}` : `${names[selected]} · Loading standings…`;
    dialog.querySelector('.live-connect').hidden = authenticated;
    dialog.querySelector('.live-own').textContent = ownRank ? `YOU · #${ownRank} · ${scoreText(selected, data.local.score)}` : 'YOUR RANK · Not ranked yet';
    dialog.querySelector('.live-rules').textContent = selected === 'reaction' ? 'Fastest valid reaction wins. Attempts below 100 ms are unranked.' : 'Longest perfect streak wins. A closer first miss breaks ties. Get one perfect to join.';
    for (const button of dialog.querySelectorAll('.live-tabs button')) button.setAttribute('aria-pressed', String(button.dataset.game === selected));
    const rows = (data?.entries || []).map(entry => {
      const row = document.createElement('li'); row.value = entry.rank;
      const alias = document.createElement('strong'); alias.textContent = `${entry.alias}${entry.isYou ? ' (YOU)' : ''}`;
      const score = document.createElement('span'); score.textContent = scoreText(selected, entry.score);
      if (entry.isYou) row.classList.add('is-you'); row.append(alias, score); return row;
    });
    dialog.querySelector('.live-entries').replaceChildren(...rows);
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
      message.textContent = data.authenticated ? `${data.totalPlayers || 0} ranked players · Updated just now` : 'Sign in to Game Center to see your standings.';
    } catch { message.textContent = 'Could not refresh. Showing the last standings received. Try again.'; status.textContent = 'Offline · Rank may have changed'; }
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
    const button = document.createElement('button'); button.type = 'button'; button.textContent = name; button.dataset.game = game;
    button.addEventListener('click', () => { selected = game; render(); refresh(true); });
    dialog.querySelector('.live-tabs').append(button);
  }
  card.querySelector('button').addEventListener('click', () => { dialog.showModal(); render(); refresh(true); });
  dialog.querySelector('.live-close').addEventListener('click', () => dialog.close());
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
