<div align="center">

# kinetic-reel

<a href="README.md"><img src="https://img.shields.io/badge/English-0E0F0E?style=for-the-badge" alt="English"></a>
<a href="README.zh-CN.md"><img src="https://img.shields.io/badge/简体中文-DDF53D?style=for-the-badge" alt="简体中文"></a>

A Claude Code skill for producing kinetic-typography motion reels with Claude Opus 5.5.
Part of [opus-video-skills](../../README.md).

</div>

![Work Reel ’26](docs/work-reel-sheet.jpg)

## Overview

The skill enables Claude Opus 5.5 to produce editorial, high-energy motion reels of the kind used for portfolios, showreels and product introductions. It covers the time budget, storyboarding, typographic animation, generative backgrounds, transitions, a synthesized score and the final encode. All imagery and all music are generated in code.

## How It Works

1. **Time budget and storyboard.** Claude decides which part leads and what share of the runtime each part receives. It then writes a shot list with a headline, a visual mechanism, a transition and a sound for every shot.
2. **Drawing.** Each shot is a JavaScript function that paints the complete frame: a 2D canvas for type and diagrams, three.js layers for generative backgrounds, and a WebGL post pass for RGB split, slice glitch and grain. Every frame is a pure function of time.
3. **Review.** Contact sheets, full-resolution stills and transition strips are rendered in headless Chrome. Claude inspects them for collisions, legibility and clean transitions, and revises the code.
4. **Score.** A small synthesizer in Node reads the same timeline as the picture and writes the music: drums, bass, arpeggios, pads, and in-key cues for every hit and transition.
5. **Output.** Frames are rendered in parallel (typically 8–40 ms per frame on a Mac GPU) and encoded to MP4 with ffmpeg.

## Characteristics

- **Type-led design.** Condensed display type for headlines, a wide grotesk for slams, an italic serif for a single voice line, and monospaced micro-type for labels, arranged on a fixed HUD grid.
- **A mechanism in every shot.** Each claim is illustrated by a working diagram: a tool grid that routes, an evaluation matrix that scans, a token that moves through a state machine, ranked lists that fuse, answers that pass through safety gates.
- **Shape-continuity transitions.** Zoom through the element in focus, iris from a highlighted node, wipe, slats, pixel grid and push. Each is 0.45–0.6 s and they are varied throughout.
- **Beat-locked picture and sound.** The picture and the score read one timeline at 120 BPM, so letters, counters and cuts land on beats. Transitions use in-key cues instead of repeated noise sweeps.
- **Sourced figures.** On-screen numbers come only from the provided source and carry their evaluation scope. Illustrative content is labelled SCHEMATIC.

## Example: Work Reel ’26

<p align="center"><img src="docs/work-reel.gif" width="640" alt="Work Reel ’26"></p>

An 84-second portfolio reel for an AI engineer. The time budget follows the order of emphasis: 30 seconds for an internship at Microsoft Cloud & AI (tool-calling evaluation, constrained decoding, a ReAct agent, a planner–reviewer multi-agent system, an incident-response pipeline, reliability), 18 seconds for clinical AI research at the UW–Madison Department of Surgery, and 14 seconds for an enterprise RAG system. It ends with the whole reel laid out as an agent trace. The reel also ships as the entry page of the author's website, with skip, sound, replay and enter controls in the same visual language.

The source is in [examples/work-reel-26](examples/work-reel-26/), and the entry page in [examples/site-intro](examples/site-intro/).

## Requirements

- Claude Code with Claude Opus 5.5
- Node.js, Google Chrome, ffmpeg

## Installation

See the [collection README](../../README.md#installation). As a plugin:

```
/plugin marketplace add tuzhechen2005/opus-video-skills
/plugin install kinetic-reel@opus-video-skills
```

## Usage

Describe the reel in Claude Code, for example:

> Make a 60-second kinetic-type reel of my three projects from this résumé. The first project should lead.

The skill can also be invoked directly with `/kinetic-reel`. It scaffolds a project from `template/` (a 17-second demo that uses every technique), presents a storyboard, builds and reviews each shot, synthesizes the score and writes `out/reel.mp4`.

## Directory Structure

| Path | Description |
|---|---|
| `SKILL.md` | Workflow and rules followed by Claude |
| `template/` | Engine and demo reel: `reel/reel.js`, `reel/cues.js`, `music/score.mjs`, `render.mjs` |
| `scripts/new_project.sh` | Project scaffolding and toolchain check |
| `references/style-guide.md` | Palette, typography, layout grid, motion helpers, GL layers, transition catalogue |
| `references/sound.md` | Synthesizer, transition sound rules, arrangement, known pitfalls |
| `examples/work-reel-26/` | Full source of the 84-second example |
| `examples/site-intro/` | The reel as a website entry page, with a Cloudflare Worker for HTTP Range |
| `examples/dongdongkan/` | 36-second Apple-leaning product reel for the H5 game 咚咚砍 |

## License

MIT. The renderer is derived from [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT). See the repository [LICENSE](../../LICENSE).
