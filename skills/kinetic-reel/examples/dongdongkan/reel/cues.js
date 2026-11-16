// 咚咚砍 · Apple-leaning kinetic reel timeline. 120 BPM. Shared by reel.js + score.mjs.
var KCUE = (() => {
  const B = n => +(n * 0.5).toFixed(4);
  const S = {
    open: 0,
    title: 3,
    tap: 8,
    hold: 15,
    burst: 22,
    end: 28,
  };
  return {
    bpm: 120, fps: 30, dur: 36, B, S,
    CH: [
      ['OPEN', 0, 3],
      ['01 TITLE', 3, 8],
      ['02 TAP', 8, 15],
      ['03 HOLD', 15, 22],
      ['04 BURST', 22, 28],
      ['END', 28, 36],
    ],
    hits: {
      dot: 1.0,
      mark: 2.0,
      title: 3.15,
      sub: 4.6,
      chips: 5.5,
      // tap grid: 9 tiles slash on beats
      tiles: [8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5],
      tapWord: 8.2,
      // hold combo
      holdWord: 15.2,
      combo: 16.0,
      // burst
      pause: 22.3,
      boom: 24.5,
      // end
      endLine: 28.3,
      name: 30.5,
      endDot: 34.5,
    },
  };
})();
if (typeof module !== 'undefined') module.exports = KCUE;
