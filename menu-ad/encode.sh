#!/bin/sh
# Frames (out/frames/%04d.jpg) -> H.264 MP4, 1080x1920 @ 60fps, BT.709, web/social friendly.
cd "$(dirname "$0")"
ffmpeg -y -loglevel error -framerate 60 -i out/frames/%04d.jpg \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart \
  SaffronFlame_MenuAd_1080x1920_60fps.mp4
