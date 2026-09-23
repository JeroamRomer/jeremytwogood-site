# Preview shot boundaries

Audited September 17, 2026. All seven sequence previews now contain complete
shots, starting on the first frame after a source edit and ending immediately
before another source edit. Frame indices are zero-based; the end is exclusive.
The previews retain source cadence. Full project durations in `projects.json`
and the full Thales graded/ungraded comparison assets are unchanged.

| Preview | Source | Source fps | Start frame | End frame | Frames | Duration (seconds) |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| shell-loop | YouTube `dWlO9T5k4yw` | 30000/1001 | 9159 | 9396 | 237 | 7.9079 |
| simbility-loop | `SymbilityDeskSeries_Ep2_MASTER_H264.mov` | 24000/1001 | 688 | 785 | 97 | 4.045708 |
| chefnuit-loop | YouTube `xi8JhK9OPq8` | 24000/1001 | 673 | 1051 | 378 | 15.76575 |
| xbox-loop | YouTube `sVqY9m7QUTM` | 24000/1001 | 1365 | 1418 | 53 | 2.211458 |
| thales-loop | `public/assets/thales-graded.mp4` | 30000/1001 | 601 | 694 | 93 | 3.1031 |
| fivepoints-loop | YouTube `kG6aFDd9j_g` | 24000/1001 | 3315 | 3412 | 97 | 4.045708 |
| nshealth-loop | YouTube `5Ux0sDZ6MY0` | 24000/1001 | 1902 | 2076 | 174 | 7.25725 |
| retailprophet-loop | YouTube `zidZCkwoEnE` | 24000/1001 | 1682 | 1995 | 313 | 13.045958 |

The local Simbility source is in
`/Users/romer/Movies/+Work/+Renders/Simbility Outputs/H264/`.
Use the matching published YouTube source for the other five films; do not
derive a fresh preview from the already compressed four-second legacy loops.

## Why these cuts

- Shell: complete mural shot; removes the short ending of the preceding angle
  and restores the rest of the selected shot.
- Simbility: the full figure close-up and reverse shot of the USB character;
  removes incomplete shots at both original excerpt edges.
- Chef Nuit: complete close-up of preparing the leaf. Its source shot continues
  cleanly for another five seconds, so the preview now carries that fuller
  moment. A scene-score spike at the legacy preview's second frame was hand
  movement, not a cut.
- Xbox: the overhead red-car cornering shot, beginning as the car enters the
  aerial view and ending on the natural cut to the in-car angle.
- Thales: the complete daylight ship shot. This separate short preview avoids
  using the entire 28.7-second comparison film in the program monitor.
- Five Points: both complete sandwich shots; removes the partial interview
  shot at the old excerpt's tail and restores the first shot's beginning.
- NS Health: the complete outdoor close-up. The old loop cut through the
  middle of this uninterrupted shot at both ends.
- Retail Prophet: the complete alley walk-and-talk shot of Doug Stephens.
  Scene-detection scores of 0.28 and 0.45 at frames 1682 and 1995 confirm
  real source edits at both boundaries; the clip's first/last frames pixel-match
  their source frames (avg diff ~1-5) and clearly diverge from the excluded
  neighbouring frames (avg diff ~44-53), so no flash frame bleeds in from
  either adjacent shot.

## Reproduce and review

Use `ffmpeg` scene detection to identify candidates, then visually inspect the
two source frames on each side of each proposed boundary. Scene scores alone
are insufficient: hand movement and camera motion can produce false positives.

```sh
ffmpeg -i SOURCE -vf "select='gt(scene,0.08)',showinfo" -an -f null -
node scripts/render-preview.mjs SOURCE START_FRAME END_FRAME /tmp/preview-name
```

The export script uses decoded source frame indices, preserves source cadence,
exports silent 960×540 MP4 and WebM, refuses existing output paths, and checks
both output frame counts. Review both encodes before replacing the exact
`public/assets/*-loop` files. The 2026-09-17 audit additionally compared every
decoded output frame with the corresponding source frame and visually reviewed
incoming/outgoing frames. Both formats have identical frame counts and cuts.
