---
name: kinetic-reel
description: >-
  Make kinetic-typography motion reels (MP4) in code: showreels, portfolio or work reels, product promos, intro films, "motion design"-style videos with bold condensed type, HUD micro-type, black/cream/lime palette, three.js generative layers (particle terrain, liquid marble, chrome knot, particle clouds), shape-continuity transitions and a synthesized, beat-locked score. Canvas 2D + WebGL rendered frame by frame in headless Chrome, encoded with ffmpeg. Use when the user asks for a reel, showreel, motion-graphics / kinetic-type video, a "Work Reel" in this style, or to extend/re-cut the Work Reel ’26.
---

# Kinetic reel

A method for making editorial, high-energy motion reels entirely in code, distilled from "Work Reel ’26" (an 84 s
portfolio reel: Microsoft → UW–Madison Surgery → Enterprise RAG → trace finale). It's bundled as a runnable
`template/` (a 17 s demo that uses every technique) and a full worked example in `examples/work-reel-26/`.

**How it works.** Every frame is a pure function of `t`. `reel/index.html` loads `reel/cues.js` (the timeline) and
`reel/reel.js` (an ES module: three.js layers, a 2D type canvas and a WebGL post pass). `render.mjs` drives headless
Chrome to render contact sheets, strips and stills for review, or every frame in parallel, and ffmpeg encodes the MP4.
`music/score.mjs` synthesizes the score in Node from the same `cues.js`, so every hit lands on its frame.

## Workflow

### 0. Scaffold
```bash
bash ~/.claude/skills/kinetic-reel/scripts/new_project.sh <project-dir>
```
Then read [references/style-guide.md](references/style-guide.md) (the look, the motion vocabulary, the transition
catalogue, layout rules) and [references/sound.md](references/sound.md) in full before designing. Skim
`examples/work-reel-26/reel.js` for how a long reel is organised.

### 1. Decide the emphasis, then storyboard
- Ask (or settle) **what leads and how much time each part gets**. Viewers notice proportions: v2 of the Work Reel had
  Microsoft at ~60% and had to be rebalanced. The fix was to *add* runtime for the other chapters rather than cut the
  one people loved. Aim for the lead ≈ 35–40%.
- Write `STORYBOARD.md` from the template: time budget, the source of truth for facts, a unifying device, and one row
  per shot (headline, visual mechanism, transition in, sound).
- **Facts are sacred.** Only figures from the provided source, each with its scope ("~180 self-built cases",
  "320 bilingual prompts"). Anything illustrative (tool IDs, doc IDs, example answers, an AST) is labelled
  `SCHEMATIC` in the HUD. Never draw per-dimension data you don't have. Visualise the *process*. Medical/clinical
  work: no efficacy claims, say "in development / not yet validated" when true.

### 2. Build
- `reel/cues.js`: `S` (scene starts), `hits` (every beat that matters), `CH` (chapters → the segmented progress bar),
  `dur`. 120 BPM: cuts on beats, chapter changes on bars.
- `reel/reel.js`: one function per shot, `sName(t)`. Each paints the whole frame: `bg()` → GL layer via
  `glShot(...)` → type and shapes → `hud(t, {...})`. Register the shot in `SCENES` with a key; add a transition into it
  in `TR` (or leave it out for a hard cut on the beat).
- Keep the `CJK` constant listing every Chinese character you draw (fonts load as a subset).

### 3. Look at it, every shot, several times
```bash
node render.mjs --sheet=1,4,7,10,13,15.5 --cols=3 --w=640 --out=out/check/sheet.jpg   # key frames
node render.mjs --stills=10.4 --out=out/stills                                          # full-res detail
ffmpeg -ss 16.0 -t .6 -i out/reel.mp4 -vf "fps=10,scale=320:-1,tile=6x1" out/check/tr.jpg   # a transition, from the encode
```
Open every image with Read. Check for collisions (labels over lines, stats over stats, text into HUD bands), empty
frames on a cut, legibility at 1600 px wide, and that each transition *starts on something* and lands cleanly.
Budget: a sheet per chapter, a full-res still per dense shot, a strip per transition type.

### 4. Score, render, encode
```bash
node music/score.mjs && ffmpeg -y -i music/score.wav -af "highpass=f=30,equalizer=f=250:t=q:w=1:g=-2,loudnorm=I=-14:TP=-1.2:LRA=8" -c:a aac -b:a 192k assets/score.m4a
node render.mjs --frames --workers=4                                    # ~8–40 ms/frame on a Mac GPU: seconds, not minutes
node render.mjs --encode --audio=assets/score.m4a --out=out/reel.mp4 --fps=30
# web copy: ffmpeg -i out/reel.mp4 -vf scale=1600:900:flags=lanczos -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart out/reel-web.mp4
```
You can't hear the score: check it with `showspectrumpic` and per-section RMS, and say so when you report. Audio-only
changes don't need a re-render: remux (`-map 0:v -map 1:a -c:v copy`).

## The rules that matter most
1. **Type is the hero.** Condensed display (Anton) for headlines, one wide grotesk (Archivo Black) for slams, italic
   serif (Instrument Serif) for the one "voice" line, mono (JetBrains Mono) for every label. Big English headlines,
   small Chinese annotations when the audience is bilingual.
2. **Every shot has a mechanism**, not just words: a grid routing, a matrix scanning, a token hopping a state machine,
   lists fusing, packets passing gates. The headline names it; the mechanism proves it.
3. **Beat-locked.** Letters, chips, counters and cuts sit on `hits`. Fast in (expo-out), hold, next.
4. **Continuity.** Prefer shape-continuity transitions (zoom through the element the eye is on, iris from the thing
   that just lit up) to hard cuts inside a chapter. Hard cuts + an impact are for chapter slams.
5. **No noise whooshes.** In-key swells into chapters, quiet tonal cues inside them, silence on about half the cuts.
6. **Honest data** (see step 1) and a `SCHEMATIC` label on anything illustrative.
7. **Guard the math.** Radii from `backOut()` can dip below 0 (canvas throws): `circle`/`starburst`/`jelly` already guard.
   In the synth, clamp local time to ≥ 0 before `pow()` and clamp SVF `f`/`q` (both already in the template).

## Shipping a reel as a site intro
The Work Reel ships as its site's entry page: `index.html` plays the reel full-screen and hands off to the portfolio.
The pattern is bundled in [examples/site-intro/](examples/site-intro/) (`index.html`, `css/intro-reel.css`,
`js/intro-reel.js`, plus a Cloudflare Worker that adds HTTP Range support):
- Try to autoplay with sound. If refused, play muted with a pulsing "tap for sound". If that is refused too, or
  `prefers-reduced-motion`, show the end screen in "start" mode (play is the lead button).
- During playback: small glass pills at top centre, since the reel's HUD owns the corners. "Skip intro" carries a
  ring that fills with the reel. A sound toggle's equalizer bars pulse at the reel's BPM. Esc skips, M mutes.
- End screen: the reel's grammar in HTML. Corner brackets, the name as drop-in letters (Anton), mono micro-type,
  a segmented trace bar, a 2D dot-field version of the particle terrain, a lime primary CTA (text roll on hover,
  sheen, magnetic, a pulse every bar), and a ghost "watch again".
- Leave through a lime iris from the pressed control, duck the audio, then navigate.
- Two encodes (1600×900 at ~1.3 Mbps, 960×540 at ~0.6 Mbps for phones / save-data), `preload="auto"`, a poster.
  Serve them with HTTP Range (206), or seeking and Safari break.
