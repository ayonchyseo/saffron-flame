// Extracts PLAN/CUES from the timeline source (no browser needed) -> plan.json, cues.json
import fs from 'fs';
const src=fs.readFileSync('src/components/SceneTimeline.js','utf8');
const grab=n=>{const m=src.match(new RegExp('export const '+n+' = (\\[[\\s\\S]*?\\n\\]);'));return Function('return '+m[1])()};
fs.writeFileSync('plan.json',JSON.stringify(grab('PLAN'),null,2));fs.writeFileSync('cues.json',JSON.stringify({bpm:120,beat_seconds:.5,cues:grab('CUES')},null,2));console.log('ok');
