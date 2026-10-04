// usage: node preview.mjs <scale> <t1> <t2> ...   → writes out/prev_<t>.jpg
import {chromium} from 'playwright-core';import {serve} from './serve.mjs';import fs from 'fs';
const [scale,...ts]=process.argv.slice(2);fs.mkdirSync('out',{recursive:true});
const s=await serve('.');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--disable-gpu-vsync']});
const p=await b.newPage({viewport:{width:1080*scale,height:1920*scale}});
p.on('console',m=>{const t=m.text();if(!/GPU stall|Failed to load resource/.test(t))console.log('[page]',t)});p.on('pageerror',e=>console.log('ERR',e.message));
let t0=Date.now();await p.goto(`http://localhost:${process.env.PORT||8123}/src/index.html?scale=${scale}`);
await p.waitForFunction('window.__ready||window.__err',null,{timeout:300000});console.log('setup ms',Date.now()-t0,await p.evaluate('window.__err'));
for(const t of ts){t0=Date.now();await p.evaluate(t=>window.renderT(t),+t);const d=await p.evaluate(()=>window.grab(.92));fs.writeFileSync(`out/prev_${t}.jpg`,Buffer.from(d,'base64'));console.log('t',t,'ms',Date.now()-t0)}
if(process.env.PHOTO){const d=await p.evaluate(()=>window.__photo.slice(23));fs.writeFileSync('out/photo.jpg',Buffer.from(d,'base64'))}
await b.close();s.close();
