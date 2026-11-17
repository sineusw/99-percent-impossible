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

  const contextRoasts = {
    petty: [
      'It’s {day}. I had plans to underestimate you.',
      '{date}. Mark it down. I’m only admitting this once.',
      'It’s {time} and you’re making this everybody’s problem.',
      '{part}? Your thumb has a more demanding schedule than I do.',
      'On a {day}, too. You really couldn’t leave well enough alone.',
      'You picked {date} to start drama with a scoreboard.',
      '{time} on a {day}. Of course this is what you’re doing.',
      'Honestly, I expected a quieter {part}.'
    ],
    daisy: [
      'You picked a {day} to give us all something to talk about.',
      'Put {date} in your calendar. I want a rematch.',
      'It’s {time}. I see your thumb clocked in before the rest of you.',
      'Well, that woke up my {part}.',
      'A little {day} scoreboard drama. I love it.',
      '{date} just became a lot more interesting.',
      '{time} on a {day}? I admire the commitment to chaos.',
      'There goes my quiet {part}.'
    ],
    mick: [
      'Bit of scoreboard drama for a {day}, mate.',
      'Circle {date}, mate. This one’s worth remembering.',
      '{time}? Your thumb’s putting in overtime.',
      'Thought we were having a quiet {part}, mate.',
      'That’s one way to spend a {day}.',
      'Fancy picking {date} to stir up the board.',
      '{time} on a {day}. You’re keeping odd hours, mate.',
      'Oi, leave some action for the rest of the {part}.'
    ]
  };
  const holidayRoasts = {
    petty: ['On {holiday}, too. Apparently the leaderboard doesn’t get a day off.', 'Happy {holiday}. I got you a rank and very conditional respect.', 'You brought scoreboard drama to {holiday}. Bold.'],
    daisy: ['Happy {holiday}! You brought the entertainment.', 'A little {holiday} chaos looks good on you.', 'Well, there’s our {holiday} highlight.'],
    mick: ['Happy {holiday}, mate. The scoreboard’s working the holiday shift.', 'A bit of {holiday} competition never hurt anybody.', 'Save some energy for {holiday}, mate.']
  };

  function localContext(now) {
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = now.getDay();
    const holidays = {
      '1-1': 'New Year’s Day', '2-14': 'Valentine’s Day',
      '7-4': 'the Fourth of July', '10-31': 'Halloween',
      '12-24': 'Christmas Eve', '12-25': 'Christmas', '12-31': 'New Year’s Eve'
    };
    const hours = now.getHours();
    return {
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      part: hours < 5 ? 'late night' : hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening',
      holiday: holidays[`${month}-${day}`] || (month === 11 && weekday === 4 && day >= 22 && day <= 28 ? 'Thanksgiving' : '')
    };
  }

  function nextIndex(key, count) {
    let index = 0;
    try {
      index = Number(localStorage.getItem(key)) % count || 0;
      localStorage.setItem(key, String((index + 1) % count));
    } catch {}
    return index;
  }

  function personalize(voice, now) {
    const context = localContext(now);
    const useHoliday = context.holiday && nextIndex(`n99-demo-holiday:${voice}:${context.date}`, 3) === 0;
    const pool = useHoliday ? holidayRoasts[voice] : contextRoasts[voice];
    return pool[nextIndex(`n99-demo-context:${voice}:${useHoliday ? 'holiday' : 'regular'}`, pool.length)]
      .replace(/\{(\w+)\}/g, (_, name) => context[name]);
  }

  function pickLine(voice, category, milestone) {
    const pool = category === 'milestone'
      ? [milestoneLines[voice][[1000, 100, 50, 25, 10, 5, 3].indexOf(milestone)], ...lines[voice].milestone]
      : lines[voice][category];
    const key = `n99-demo-voice:${voice}:${category}:${milestone ?? ""}`;
    const line = pool[nextIndex(key, pool.length)].replace('{rank}', milestone);
    return `${line} ${personalize(voice, new Date())}`;
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
