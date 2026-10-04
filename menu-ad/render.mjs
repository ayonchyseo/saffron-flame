// usage: node render.mjs <workerIndex> <workerCount> [portBase]
import {chromium} from 'playwright-core';import {serve} from './serve.mjs';import fs from 'fs';
import {CONFIG} from './src/config.js';
const [wi,wn]=process.argv.slice(2).map(Number);const FPS=CONFIG.FPS,N=Math.round(CONFIG.DURATION*FPS);
fs.mkdirSync('out/frames',{recursive:true});
process.env.PORT=String(8200+wi);
const s=await serve('.',8200+wi);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:CONFIG.WIDTH,height:CONFIG.HEIGHT}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${8200+wi}/src/index.html?scale=1`);await p.waitForFunction('window.__ready||window.__err',null,{timeout:600000});
for(let i=wi;i<N;i+=wn){const f=`out/frames/${String(i).padStart(4,'0')}.jpg`;if(fs.existsSync(f))continue;
  const t0=Date.now();await p.evaluate(t=>window.renderT(t),i/FPS);const d=await p.evaluate(()=>window.grab(.97));fs.writeFileSync(f+'.tmp',Buffer.from(d,'base64'));fs.renameSync(f+'.tmp',f);
  console.log(`w${wi} frame ${i}/${N} ${((Date.now()-t0)/1000).toFixed(1)}s`);}
await b.close();s.close();console.log('worker done',wi);
