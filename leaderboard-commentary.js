// Rank commentary cadence, independent of the rank presentation or audio transport.
(function () {
  function create() {
    const states = new Map();
    return function decide(key, from, to) {
      if (![from, to].every(rank => Number.isInteger(rank) && rank > 0)) return null;
      const state = states.get(key) || { rises: 0, drops: 0, band: null, turn: 0 };
      states.set(key, state);
      if (to >= from) {
        state.rises = 0;
        if (to === from) return { type: 'roast', streak: 0 };
        state.drops++;
        return { type: state.drops % 2 === 0 ? 'rank' : 'silent', streak: 0 };
      }
      state.rises++;
      const band = to <= 10 ? 'top10' : to <= 100 ? 'top100' : 'field';
      if (state.band !== band) { state.band = band; state.turn = 0; }
      state.turn++;
      const comment = band === 'top10' || (band === 'top100' ? state.turn % 3 !== 0 : state.turn % 2 === 1);
      return { type: comment ? 'rank' : 'roast', streak: state.rises };
    };
  }
  if (typeof module !== 'undefined') module.exports = { create };
  else window.N99LeaderboardCommentary = { create };
})();
