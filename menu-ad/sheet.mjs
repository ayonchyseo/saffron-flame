import {chromium} from 'playwright-core';import {serve} from './serve.mjs';import fs from 'fs';import {execSync} from 'child_process';
const [scale,out,...ts]=process.argv.slice(2);fs.mkdirSync('out',{recursive:true});
const s=await serve('.');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:1080*scale,height:1920*scale}});
p.on('console',m=>{const t=m.text();if(!/GPU stall|Failed to load resource/.test(t))console.log('[page]',t)});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:8123/src/index.html?scale=${scale}`);await p.waitForFunction('window.__ready||window.__err',null,{timeout:300000});
const files=[];for(const t of ts){await p.evaluate(t=>window.renderT(t),+t);const d=await p.evaluate(()=>window.grab(.9));const f=`out/s_${t}.jpg`;fs.writeFileSync(f,Buffer.from(d,'base64'));files.push(f)}
await b.close();s.close();
const cols=+process.env.COLS||6;const rows=[];
for(let i=0;i<files.length;i+=cols){const row=files.slice(i,i+cols);const rf=`out/_row${i/cols}.jpg`;
 execSync(`ffmpeg -y -loglevel error ${row.map(f=>'-i '+f).join(' ')} -filter_complex "${row.map((_,k)=>`[${k}:v]drawtext=text='${ts[i+k]}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@.5[v${k}]`).join(';')};${row.map((_,k)=>`[v${k}]`).join('')}hstack=inputs=${row.length}" ${rf}`);rows.push(rf)}
execSync(rows.length>1?`ffmpeg -y -loglevel error ${rows.map(f=>'-i '+f).join(' ')} -filter_complex vstack=inputs=${rows.length} ${out}`:`cp ${rows[0]} ${out}`);
