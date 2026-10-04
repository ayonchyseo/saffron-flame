import {chromium} from 'playwright-core';import {serve} from './serve.mjs';
const s=await serve('.');const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8123/src/index.html?scale=1');await p.waitForFunction('window.__ready');
for(const t of [5.0,11.2]){await p.evaluate(t=>window.profile(t),t);console.log(t,JSON.stringify(await p.evaluate(t=>window.profile(t),t)))}
await b.close();s.close();
