// 咚咚砍 score — Apple-leaning: spacious pads, punchy impacts, beat-locked hits. No whooshes.
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const C = require('../reel/cues.js'), S = C.S, Hh = C.hits;
const SR = 44100, DUR = C.dur + 1.2, N = Math.ceil(SR * DUR), BEAT = .5, TAU = Math.PI * 2;
const L = new Float32Array(N), R = new Float32Array(N), sendL = new Float32Array(N), sendR = new Float32Array(N);
const duck = new Float32Array(N).fill(1);
const musL = new Float32Array(N), musR = new Float32Array(N);
let seed = 11; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function put(t0, len, gen, { gain = 1, pan = 0, rev = 0, bus = 'drum' } = {}) {
  const i0 = Math.max(0, Math.floor(t0 * SR)), i1 = Math.min(N, Math.floor((t0 + len) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  const BL = bus === 'mus' ? musL : L, BR = bus === 'mus' ? musR : R;
  for (let i = i0; i < i1; i++) { const v = gen(Math.max(0, (i - t0 * SR) / SR)); BL[i] += v * gl; BR[i] += v * gr; sendL[i] += v * gl * rev; sendR[i] += v * gr * rev; }
}
function noise(t0, len, env, filt, o = {}) {
  let lp = 0, bp = 0;
  put(t0, len, tt => { const n = rnd() * 2 - 1, [fc, q0] = filt(tt), q = Math.max(q0, .45), f = Math.min(.85, 2 * Math.sin(Math.PI * Math.min(fc, SR / 7) / SR)); lp += f * bp; const hp = n - lp - q * bp; bp += f * hp; return env(tt) * (o.hp ? hp : o.lp ? lp : bp); }, o);
}
const kick = (t, v = 1) => {
  put(t, .55, tt => v * Math.sin(TAU * (46 * tt + 100 * (1 - Math.exp(-tt * 28)) / 28)) * Math.exp(-tt * 5.8) * (tt < .004 ? tt / .004 : 1), { gain: .9 });
  noise(t, .015, tt => v * .35 * Math.exp(-tt * 280), () => [2800, .5], { gain: .4 });
  const i0 = Math.floor(t * SR); for (let i = 0; i < SR * .28 && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - .55 * Math.exp(-i / SR * 10));
};
const clap = (t, v = 1) => { for (let k = 0; k < 3; k++) noise(t + k * .012, .22, tt => v * (k === 2 ? .7 * Math.exp(-tt * 12) : .5 * Math.exp(-tt * 65)), () => [1300, .5], { gain: .65, rev: .28 }); };
const hat = (t, v = 1, open = false) => noise(t, open ? .28 : .05, tt => v * .38 * Math.exp(-tt * (open ? 11 : 75)), () => [8500, .55], { gain: .45, pan: .2, hp: true });
const tick = (t, v = 1) => put(t, .028, tt => v * .28 * Math.sin(TAU * 2400 * tt) * Math.exp(-tt * 170), { gain: .45, pan: -.25 });
const impact = (t, v = 1) => { kick(t, v); noise(t, 1.2, tt => v * .75 * Math.exp(-tt * 3.0), tt => [1600 * Math.exp(-tt * 2) + 180, .65], { gain: .65, rev: .55, lp: true }); put(t, 1.5, tt => v * .45 * Math.sin(TAU * (36 * tt + 28 * (1 - Math.exp(-tt * 7)) / 7)) * Math.exp(-tt * 2.0), { gain: .75 }); };
const softImpact = (t, v = 1) => { kick(t, v); put(t, 1.3, tt => v * .38 * Math.sin(TAU * (38 * tt + 22 * (1 - Math.exp(-tt * 7)) / 7)) * Math.exp(-tt * 2.4), { gain: .75 }); };
const riser = (t, len, v = 1) => { noise(t, len, tt => v * .28 * Math.pow(tt / len, 2.4), tt => [350 * Math.pow(10, tt / len), .55], { gain: .5, rev: .45, lp: true }); put(t, len, tt => v * .1 * Math.sin(TAU * (200 * tt + 360 * tt * tt / len)) * Math.pow(tt / len, 2), { gain: .55, rev: .35, bus: 'mus' }); };
const blip = (t, m = 93, v = 1, pan = 0) => put(t, .14, tt => v * .26 * Math.sin(TAU * mtof(m) * tt) * Math.exp(-tt * 26), { gain: .65, pan, rev: .4, bus: 'mus' });
const stab = (t, notes, v = 1) => notes.forEach((m, i) => put(t, .75, tt => v * .11 * (Math.sin(TAU * mtof(m) * tt) + .45 * Math.sin(TAU * mtof(m) * 2.001 * tt) + .2 * Math.sin(TAU * mtof(m) * 3 * tt)) * Math.exp(-tt * 4.5), { gain: .75, pan: (i - 1) * .35, rev: .5, bus: 'mus' }));
const odo = (t, len, v = 1) => { for (let k = 0; k < len / .045; k++) tick(t + k * .045 * (1 + k * .015), v * (.45 + .5 * rnd())); };
const bass = (t, m, len, v = 1) => { let ph = 0; put(t, len + .05, tt => { ph += mtof(m) / SR; const saw = 2 * (ph % 1) - 1, env = Math.min(1, tt / .008) * (tt < len ? 1 : Math.exp(-(tt - len) * 50)); return v * .28 * env * Math.tanh(1.6 * (saw * .5 + Math.sin(TAU * ph * .5) * .9)); }, { gain: .7, bus: 'mus' }); };
const pluck = (t, m, v = 1, pan = 0) => put(t, .55, tt => v * .14 * (Math.sin(TAU * mtof(m) * tt) + .3 * Math.sin(TAU * mtof(m) * 2 * tt) * Math.exp(-tt * 10)) * Math.exp(-tt * 8), { gain: .75, pan, rev: .35, bus: 'mus' });
const pad = (t, notes, len, v = 1) => notes.forEach((m, i) => { const d = [1, 1.003, .997]; put(t, len + 1.0, tt => { let s = 0; for (const k of d) for (let h = 1; h <= 4; h++) s += Math.sin(TAU * mtof(m) * k * h * tt + h) / (h * h); return v * .03 * s * Math.min(1, tt / .55) * (tt > len ? Math.exp(-(tt - len) * 3.2) : 1); }, { gain: .85, pan: (i - 1) * .45, rev: .7, bus: 'mus' }); });
const swell = (tEnd, notes, len = 1.8, v = 1) => notes.forEach((m, i) => put(tEnd - len, len + .06, tt => {
  const q = tt / len, env = q < 1 ? Math.pow(q, 2.8) : Math.max(0, 1 - (tt - len) / .06); let s = 0;
  for (let h = 1; h <= 3; h++) s += Math.sin(TAU * mtof(m) * h * tt + h) / (h * h);
  return v * .08 * s * env;
}, { gain: .85, pan: (i / Math.max(1, notes.length - 1) - .5) * .55, rev: .4, bus: 'mus' }));
const bloom = (t, notes, v = 1) => notes.forEach((m, i) => put(t + i * .035, 1.8, tt => v * .07 * (Math.sin(TAU * mtof(m) * tt) + .28 * Math.sin(TAU * mtof(m) * 2.01 * tt)) * Math.min(1, tt / .1) * Math.exp(-tt * 2.1), { gain: .85, pan: (i - 1) * .35, rev: .65, bus: 'mus' }));
const glide = (t, len, m0, m1, v = 1) => { let ph = 0; put(t, len + .15, tt => { const q = Math.min(1, tt / len), f = mtof(m0 + (m1 - m0) * q * q * (3 - 2 * q)); ph += f / SR; const tri = 1 - 4 * Math.abs((ph % 1) - .5); return v * .065 * tri * Math.sin(Math.PI * Math.min(1, tt / (len + .15))); }, { gain: .8, rev: .5, bus: 'mus' }); };

const AM = [57, 64, 69, 72], FM = [53, 60, 65, 69], CM = [48, 55, 60, 67], EM = [52, 59, 64, 71];
const CHORDS = [AM, FM, CM, EM];
const ROOT = [33, 29, 36, 28];

// —— OPEN: quiet space ——
pad(0, AM, 3.2, .95);
riser(0.3, 1.6, .55);
blip(Hh.dot, 81, .7);
softImpact(Hh.mark, .85);
bloom(Hh.mark, [69, 76, 81], .8);

// —— TITLE: emotional pad bed ——
swell(S.title, AM, 1.5, 1);
bloom(S.title, [64, 69, 76], .95);
pad(S.title, AM, 5.2, .9);
for (let i = 0; i < 10; i++) tick(Hh.title + i * .04, .55);
[0, 1, 2].forEach(i => blip(Hh.chips + i * .18, 84 + i * 3, .55, -.3 + i * .3));
// sparse kicks under title (Apple: breathe)
for (let t = S.title; t < S.tap; t += BEAT * 2) kick(t, .55);
hat(S.title + 1, .35); hat(S.title + 2, .4); hat(S.title + 3, .35);

// —— TAP: energy up, tile ticks ——
swell(S.tap, FM, 1.4, .95);
pad(S.tap, FM, 7.2, .85);
for (let t = S.tap; t < S.hold; t += BEAT) {
  const b = Math.round(t / BEAT) % 4;
  kick(t, b === 0 ? .95 : .7);
  if (b === 1 || b === 3) clap(t, .55);
  hat(t, .4); hat(t + BEAT / 2, .55, b === 3);
  bass(t, ROOT[1] + 12, BEAT * .42, .75);
  if (b === 0) pluck(t + .125, 72, .4, -.2); pluck(t + .375, 76, .35, .25);
}
Hh.tiles.forEach((tt, i) => { tick(tt, .85); blip(tt, 88 + (i % 4) * 2, .55, (i % 3 - 1) * .35); });
stab(Hh.tiles[0], [69, 72, 76], .7);
stab(Hh.tiles[8], [72, 76, 81], .9);

// —— HOLD: driving combo ——
swell(S.hold, CM, 1.3, 1);
pad(S.hold, CM, 7.2, .9);
for (let t = S.hold; t < S.burst; t += BEAT) {
  const b = Math.round(t / BEAT) % 4;
  kick(t, 1);
  if (b === 1 || b === 3) clap(t, .7);
  for (let e = 0; e < 2; e++) hat(t + e * BEAT / 2, e ? .85 : .4, e === 1 && b === 3);
  // 16ths on lead energy
  if (b === 0 || b === 2) { hat(t + BEAT / 4, .3); hat(t + 3 * BEAT / 4, .35); }
  bass(t, ROOT[2] + 12, BEAT * .4, .85);
  bass(t + BEAT / 2, ROOT[2] + (b === 3 ? 19 : 12), BEAT * .35, .7);
  pluck(t, 67 + b, .4, -.3); pluck(t + BEAT / 2, 72 + (b % 2) * 3, .35, .3);
}
odo(Hh.combo, 4.2, .85);
stab(Hh.combo + 4.2, [72, 76, 79, 84], 1);

// —— BURST: silence then slam ——
// strip drums for pause
pad(S.burst, EM, 2.2, .55);
softImpact(Hh.pause, .4);
// breath
put(Hh.pause + .2, 1.8, tt => .04 * Math.sin(TAU * mtof(52) * tt) * Math.min(1, tt / .3) * Math.exp(-tt * .6), { gain: .6, rev: .8, bus: 'mus' });
swell(Hh.boom, AM, 1.5, 1.1);
impact(Hh.boom, 1.15);
stab(Hh.boom, [57, 64, 69, 76], 1.1);
pad(Hh.boom, AM, 4.5, 1);
for (let t = Hh.boom; t < S.end; t += BEAT) {
  const b = Math.round(t / BEAT) % 4;
  kick(t, b === 0 ? 1 : .6);
  if (b === 2) clap(t, .5);
  hat(t + BEAT / 2, .45);
}

// —— END: resolve ——
swell(S.end, AM, 1.6, 1);
bloom(S.end, [64, 69, 76, 81], 1);
pad(S.end, AM, 8, 1);
for (let i = 0; i < 12; i++) tick(Hh.endLine + i * .038, .5);
softImpact(Hh.name, .9);
stab(Hh.name, [69, 72, 76], .85);
softImpact(Hh.endDot, .8);
put(Hh.endDot, 1.4, tt => .22 * Math.sin(TAU * 1760 * tt) * Math.exp(-tt * 3.5), { gain: .55, rev: .85, bus: 'mus' });
// final sparse kicks
for (let t = S.end; t < Hh.endDot; t += BEAT * 2) kick(t, .5);

// ---------- mix ----------
function verb(inp, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map(d => ({ b: new Float32Array(d + spread), i: 0, s: 0 })), aps = [556, 441, 341].map(d => ({ b: new Float32Array(d + spread), i: 0 }));
  const o = new Float32Array(N);
  for (let n = 0; n < N; n++) { const x = inp[n] * .02; let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .7 + c.s * .3; c.b[c.i] = x + c.s * .82; c.i = (c.i + 1) % c.b.length; y += v; } for (const a of aps) { const v = a.b[a.i]; a.b[a.i] = y + v * .5; a.i = (a.i + 1) % a.b.length; y = v - y; } o[n] = y; }
  return o;
}
const wl = verb(sendL, 0), wr = verb(sendR, 23);
const oL = new Float32Array(N), oR = new Float32Array(N); let peak = 0;
for (let n = 0; n < N; n++) {
  let l = L[n] + musL[n] * duck[n] + wl[n] * 4.2, r = R[n] + musR[n] * duck[n] + wr[n] * 4.2;
  l = Math.tanh(l * 1.15) / 1.15 * 1.05; r = Math.tanh(r * 1.15) / 1.15 * 1.05;
  oL[n] = l; oR[n] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const g = .88 / Math.max(peak, 1e-6), fadeOut = Math.floor((C.dur - .25) * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  const f = Math.min(1, n / (.03 * SR)) * (n > fadeOut ? Math.max(0, 1 - (n - fadeOut) / (1.3 * SR)) : 1);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, oL[n] * g * f)) * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, oR[n] * g * f)) * 32767), 46 + n * 4);
}
writeFileSync(new URL('./score.wav', import.meta.url), buf);
console.log(`score.wav: ${DUR} s, peak ${peak.toFixed(2)} → normalized`);
