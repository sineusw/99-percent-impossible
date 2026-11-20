(function () {
  'use strict';

  function missDistance(result) {
    if (result.game === 'timer') return Math.round(Math.abs(1 - result.rawScore) * 1e6);
    return Math.round((100 - result.rawScore) * 10000);
  }

  // Distances use integer microseconds or ten-thousandths of a score point.
  function compareStreaks(left, right) {
    return right.perfectCount - left.perfectCount || left.missDistance - right.missDistance;
  }

  function recordStreak(count, result) {
    if (!result || !['timer', 'stop'].includes(result.game) || !Number.isFinite(result.rawScore)) {
      return { count: 0, completed: null };
    }
    if (result.isPerfect) return { count: count + 1, completed: null };
    return {
      count: 0,
      completed: count ? { perfectCount: count, missDistance: missDistance(result) } : null
    };
  }

  if (typeof module !== 'undefined') {
    module.exports = { compareStreaks, recordStreak };
    return;
  }

  let count = 0;
  let mode;
  const streakLabel = document.getElementById('ranked-streak');

  function clearStreak() {
    count = 0;
    streakLabel.textContent = '';
  }

  document.getElementById('back').addEventListener('click', clearStreak);
  window.addEventListener('n99:result', ({ detail }) => {
    if (mode !== detail?.game) clearStreak();
    mode = detail?.game;
    const next = recordStreak(count, detail);
    count = next.count;
    streakLabel.textContent = count ? `${count} PERFECT IN A ROW` : '';
  });
})();
