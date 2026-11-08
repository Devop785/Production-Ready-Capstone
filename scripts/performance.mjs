import {performance} from 'node:perf_hooks';
import {openDatabase} from '../src/database.js';
import {createApp} from '../src/integration.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {once} from 'node:events';
const db=openDatabase(':memory:');db.exec(readFileSync('db/seed.sql','utf8'));const server=createApp(db,{apiLimit:10000}).listen(0,'127.0.0.1');await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}/api/internships?limit=3`;const times=[];for(let i=0;i<110;i++){const start=performance.now();const r=await fetch(url);await r.json();if(r.status!==200)throw Error('Benchmark request failed');if(i>=10)times.push(performance.now()-start);}times.sort((a,b)=>a-b);const report={environment:'Local loopback, in-memory SQLite, six sample records; not a public-load benchmark',requests:times.length,medianMs:times[50],p95Ms:times[95],maxMs:times.at(-1),staticBytes:['index.html','style.css','app.js'].reduce((n,f)=>n+readFileSync('public/'+f).length,0)};writeFileSync('docs/performance.json',JSON.stringify(report,null,2));await new Promise(r=>server.close(r));db.close();console.log(report);
