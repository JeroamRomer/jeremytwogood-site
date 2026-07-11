#!/usr/bin/env bash
# Hover-loop helper for the work cards on jeremytwogood.com.
#
#   make-loop.sh suggest <video>
#     Print a suggested loop start time in seconds: the scene change nearest
#     to 1/3 of the runtime (a high-motion moment past the intro), falling
#     back to 25% of the runtime when no scene changes are detected.
#
#   make-loop.sh cut <video> <start-seconds> <out-base> [duration]
#     Cut a muted segment (default 4 s) and encode BOTH loop files:
#     <out-base>.mp4 (h264) and <out-base>.webm (vp9), 960x540 @ 24 fps —
#     matching the six existing loops in public/assets/.
set -euo pipefail

MODE="$1"
VIDEO="$2"

DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

if [ "$MODE" = "suggest" ]; then
  LOOP_LEN=4
  TARGET=$(awk "BEGIN{print $DUR / 3}")
  MAX_START=$(awk "BEGIN{print $DUR - $LOOP_LEN}")
  # Scene-change timestamps (score > 0.30), from showinfo on the selected frames.
  SCENES=$(ffmpeg -i "$VIDEO" -vf "select='gt(scene,0.30)',showinfo" -f null - 2>&1 \
    | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 || true)
  SUGGEST=$(echo "$SCENES" | awk -v t="$TARGET" -v max="$MAX_START" '
    BEGIN { best = ""; bd = 1e18 }
    /[0-9]/ { if ($1 <= max) { d = ($1 > t) ? $1 - t : t - $1; if (d < bd) { bd = d; best = $1 } } }
    END { print best }')
  [ -z "$SUGGEST" ] && SUGGEST=$(awk "BEGIN{print $DUR * 0.25}")
  echo "$SUGGEST"
  exit 0
fi

if [ "$MODE" = "cut" ]; then
  START="$3"
  OUT_BASE="$4"
  LEN="${5:-4}"
  # Cover-fit any aspect ratio to the card's 16:9 frame, then conform to 24 fps.
  FILTERS="scale=960:540:force_original_aspect_ratio=increase,crop=960:540,fps=24"

  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" -an \
    -vf "$FILTERS" -c:v libx264 -crf 25 -maxrate 500k -bufsize 1000k \
    -pix_fmt yuv420p -movflags +faststart "${OUT_BASE}.mp4"

  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" -an \
    -vf "$FILTERS" -c:v libvpx-vp9 -b:v 0 -crf 36 "${OUT_BASE}.webm"

  ls -la "${OUT_BASE}.mp4" "${OUT_BASE}.webm"
  exit 0
fi

echo "Unknown mode: $MODE (expected 'suggest' or 'cut')" >&2
exit 1
