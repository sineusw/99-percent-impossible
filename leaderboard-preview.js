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
  window.N99LeaderboardLine = result => result === previousResult ? reaction : null;
  const lines = {
    petty: {
      climb: ['Somebody just lost their seat.', 'You skipped the line. I respect the disrespect.', 'That spot had somebody’s name on it. Had.', 'Look at you, evicting people.', 'Keep climbing. I’m sure this ends well.'],
      drop: ['I’d tell you where you landed, but I’m still scrolling.', 'You left your spot unattended. Rookie mistake.', 'Somebody passed you. I’d like to hear their side.', 'Careful. Gravity seems to like you.', 'That was a generous donation of rank.'],
      milestone: ['Top {rank}? Who let you in here?', 'Top {rank}. I’m going to need a new insult.', 'You made the top {rank}. Fine. Screenshot it.'],
      first: ['I said ninety-nine percent impossible. You took that personally.', 'I had a roast ready. This is deeply inconvenient.', 'Number one. Fine. I’ll clap once.']
    },
    daisy: {
      climb: ['Look at you climbing!', 'There you go. Who’s next?', 'You’re getting good at this.', 'You just gave somebody a reason to practice.', 'Keep that run going!'],
      drop: ['They got ahead. Give them something to worry about.', 'You’ve got time to climb back.', 'Take a breath. Then take your spot back.', 'A little slide. You know what to do.', 'Let’s see how much you can get back in one run.'],
      milestone: ['Top {rank}! Okay, now we’re making noise.', 'You made the top {rank}! That deserves a screenshot.', 'Look at that. Top {rank} and still climbing!'],
      first: ['Number one this week! Go on, take the screenshot.', 'Look at the very top. That’s your name!', 'You did it! Now everybody’s chasing you.']
    },
    mick: {
      climb: ['Up the board you go, mate.', 'You’ve nicked a spot. Have another crack.', 'Clean overtake. Who’s next?', 'Look at you jumping the queue.', 'Good run, mate. Keep the pressure on.'],
      drop: ['Down a bit, mate. Plenty of game left.', 'Someone’s jumped ahead. Go give them a chase.', 'Bit of a tumble. Have another go.', 'They’ve borrowed your spot. Go nick it back.', 'Shake that one off, mate.'],
      milestone: ['Top {rank}! That’s a bloody good run.', 'Top {rank}, mate. The rest better warm up.', 'You cracked the top {rank}. Give yourself a minute.'],
      first: ['Top of the world this week, mate. Take a bow.', 'Number one. You’ve given everyone else homework.', 'Back the camera up, mate. That’s the whole world behind you.']
    }
  };

  const milestoneLines = {
    petty: ['You made the cut. I’ll alert the authorities.', 'Top hundred? Who let you in here?', 'Top fifty. Now go make it awkward.', 'Top twenty-five. I’m running out of insults.', 'Top ten? Give me a minute.', 'Four people are sweating right now.', 'Get up there. You earned the stupid podium.'],
    daisy: ['You’re on the board! Keep going.', 'Top hundred! Now we’re making noise.', 'Fifty! Look how far you climbed.', 'Top twenty-five! That’s a run worth saving.', 'Top ten! I’m making you take a screenshot.', 'Only four spots ahead. You’ve got this.', 'That podium looks good on you!'],
    mick: ['You made the cut, mate. Have another crack.', 'Top hundred! That’s a bloody good run.', 'Top fifty, mate. Keep the pressure on.', 'Twenty-five. The field’s getting thin.', 'Top ten! The rest better warm up.', 'Top five. Nearly at the pointy end.', 'On the podium, mate. Take a bow.']
  };

  function pickLine(voice, category, milestone) {
    const pool = category === 'milestone'
      ? [milestoneLines[voice][[1000, 100, 50, 25, 10, 5, 3].indexOf(milestone)], ...lines[voice].milestone]
      : lines[voice][category];
    const key = `n99-demo-voice:${voice}:${category}:${milestone ?? ""}`;
    const index = Number(localStorage.getItem(key)) % pool.length || 0;
    localStorage.setItem(key, String((index + 1) % pool.length));
    return pool[index].replace('{rank}', milestone);
  }

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
    const voice = window.N99Character?.get?.() || 'petty';
    const category = milestone === 1 ? 'first' : milestone ? 'milestone' : to < from ? 'climb' : 'drop';
    if (to !== from && lines[voice]) reaction = pickLine(voice, category, milestone);
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
