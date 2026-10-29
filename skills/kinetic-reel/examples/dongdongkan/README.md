# 咚咚砍 · kinetic reel (36 s)

Apple-leaning product promo for the H5 casual game **咚咚砍**: black grounds, cream type, Noto Serif SC headlines, beat-locked synthesized score.

## Rebuild
```bash
npm install
node music/score.mjs
ffmpeg -y -i music/score.wav -af "highpass=f=30,equalizer=f=250:t=q:w=1:g=-2,loudnorm=I=-14:TP=-1.2:LRA=8" -c:a aac -b:a 192k assets/score.m4a
node render.mjs --frames --workers=4
node render.mjs --encode --audio=assets/score.m4a --out=out/reel.mp4 --fps=30
```

See `STORYBOARD.md` for the shot list.
