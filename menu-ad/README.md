# Saffron Flame — cinematic menu-card ad

Deterministic 3D render (Three.js, PBR + custom cinematic post stack) → frames → H.264 MP4.
`SaffronFlame_MenuAd_1080x1920_60fps.mp4` is the output (14 s, 1080×1920, 60 fps, silent).

## Re-brand without touching the animation
Edit **`src/config.js`** only: `RESTAURANT_NAME`, `DISH_NAME`, `DESCRIPTION`, `PRICE`, `EXTRA_DISHES`, `INGREDIENTS`, `CTA`, `COLORS`, `LOGO`, `FOOD_IMAGE`, `FOOD_3D_ASSET`.
(`LOGO` / `FOOD_IMAGE` / `FOOD_3D_ASSET` are hooks — see Limitations.)

## Modules (`src/components`)
MenuCard · FoodHero (+FoodParts, Dishes) · Ingredient · Typography · Camera · Lighting · Particles (steam/dust) · Post · SceneTimeline · FinalCTA

## Commands
    npm i
    node preview.mjs 0.5 1.5 4.5          # quick stills -> out/prev_*.jpg
    COLS=6 node sheet.mjs 0.3 out/s.jpg 1 2 3 4 5 6   # contact sheet
    node render.mjs 0 3 & node render.mjs 1 3 & node render.mjs 2 3   # full render (3 workers) -> out/frames
    ./encode.sh

`plan.json` = timestamped scene plan, `cues.json` = beat-aligned sound-design cue sheet (120 BPM, every hit lands on a 0.5 s beat).
