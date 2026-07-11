#!/usr/bin/env bash
# Extract N candidate thumbnail stills from a video, spread across its runtime.
# Each candidate is the most representative frame of its window (ffmpeg
# `thumbnail` filter), at full source resolution, as a high-quality JPEG.
#
# Usage: extract-frames.sh <video> <out-dir> [count]   (count defaults to 4)
# Prints the candidate paths, one per line.
set -euo pipefail

VIDEO="$1"
OUT="$2"
COUNT="${3:-4}"

mkdir -p "$OUT"
DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

for i in $(seq 1 "$COUNT"); do
  # Window i covers [(i-1)/COUNT, i/COUNT) of the runtime; sample its middle
  # 60% so candidates never sit on a hard cut at a window edge.
  START=$(awk "BEGIN{print (($i - 1) + 0.2) / $COUNT * $DUR}")
  LEN=$(awk "BEGIN{print 0.6 / $COUNT * $DUR}")
  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" \
    -vf "thumbnail=48" -frames:v 1 -q:v 2 "$OUT/candidate-$i.jpg"
done

ls "$OUT"/candidate-*.jpg
