// Opt-in fixture for reviewing leaderboard presentation before connecting ranked scores.
(() => {
  if (!new URLSearchParams(location.search).has('leaderboard-preview')) return;

  const milestones = [1, 3, 5, 10, 25, 50, 100, 1000];
  const toggle = document.createElement('label');
  toggle.className = 'leaderboard-preview';
  toggle.innerHTML = '<span>Leaderboard demo · sample ranks</span><span><input type="checkbox" checked> Vibration</span>';
  document.getElementById('home').append(toggle);
  const vibration = toggle.querySelector('input');
  const reveal = document.createElement('div');
  reveal.className = 'rank-reveal';
  reveal.setAttribute('aria-live', 'polite');
  document.getElementById('retry').before(reveal);
  const ranks = [1204, 984, 943, 87, 48, 23, 9, 4, 3, 1, 7, 3, 1];
  let step = 0;
  let previousResult;
  let reaction;
  window.N99LeaderboardPettyLine = result => result && result === previousResult ? reaction : null;
  const climbs = [
    'Somebody just lost their seat.',
    'You skipped the line. I respect the disrespect.',
    'That spot had somebody’s name on it. Had.'
  ];
  let climbIndex = 0;

  window.addEventListener('n99:result', ({ detail }) => {
    reveal.replaceChildren();
    reaction = null;
    previousResult = detail;
    if (!detail || !Number.isFinite(detail.rawScore) || detail.isSuspicious) return;
    const from = ranks[step];
    step = step === ranks.length - 1 ? 1 : step + 1;
    const to = ranks[step];

    const milestone = milestones.find(limit => from > limit && to <= limit);
    const headline = milestone === 1 ? '#1 IN THE WORLD THIS WEEK'
      : milestone ? `TOP ${milestone.toLocaleString('en-US')}`
      : to < from ? `↑ ${from - to} spots`
      : to > from ? `↓ ${to - from} spots` : 'Rank held';
    if (to < from) {
      reaction = milestone === 1 ? 'I said ninety-nine percent impossible. You took that personally.'
        : milestone === 10 ? 'Top ten? Give me a minute. I had insults prepared.'
        : milestone ? `Top ${milestone}? Okay. You’re officially a problem.`
        : climbs[climbIndex++ % climbs.length];
    }
    reveal.dataset.direction = to > from ? 'down' : 'up';
    reveal.dataset.milestone = milestone ?? '';
    const path = document.createElement('span');
    path.className = 'rank-previous';
    path.textContent = `#${from}`;
    const current = document.createElement('b');
    current.className = 'rank-current';
    current.textContent = `#${to}`;
    const heading = document.createElement('strong');
    heading.textContent = headline;
    const label = document.createElement('small');
    label.textContent = 'DEMO RANK';
    reveal.replaceChildren(label, path, current, heading);
    reveal.classList.remove('rank-animate');
    reveal.getBoundingClientRect();
    reveal.classList.add('rank-animate');
    if (vibration.checked && from !== to) {
      navigator.vibrate?.(milestone === 1 ? [18, 65, 30, 65, 55]
        : milestone && milestone <= 10 ? [20, 55, 36]
        : milestone ? 32 : to < from ? 15 : 8);
    }
  });
})();
