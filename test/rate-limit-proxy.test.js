import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/integration.js';
import {openDatabase} from '../src/database.js';

function serve(options) {
 const db=openDatabase(':memory:');
 const server=createApp(db,options).listen(0,'127.0.0.1');
 return new Promise(resolve=>server.on('listening',()=>resolve({
  url:`http://127.0.0.1:${server.address().port}`,
  async close(){await new Promise(done=>server.close(done));db.close();}
 })));
}

const get=(url,ip)=>fetch(`${url}/api/internships`,{headers:{'X-Forwarded-For':ip}});

test('behind a trusted proxy each client address gets its own bucket',async()=>{
 const warnings=[];
 const realError=console.error;
 console.error=(...args)=>{warnings.push(args.map(String).join(' '));};
 const app=await serve({trustProxy:1,apiLimit:2});
 try {
  assert.equal((await get(app.url,'203.0.113.10')).status,200);
  assert.equal((await get(app.url,'203.0.113.10')).status,200);
  // The same client exhausts only its own allowance.
  assert.equal((await get(app.url,'203.0.113.10')).status,429);
  // A different client is unaffected by that exhaustion.
  assert.equal((await get(app.url,'198.51.100.7')).status,200);
 } finally {
  console.error=realError;
  await app.close();
 }
 const leaked=warnings.filter(w=>w.includes('ERR_ERL'));
 assert.deepEqual(leaked,[],`express-rate-limit still warned: ${leaked.join(' | ')}`);
});

test('without a trusted proxy forwarded addresses are ignored',async()=>{
 const app=await serve({trustProxy:false,apiLimit:2});
 try {
  assert.equal((await get(app.url,'203.0.113.10')).status,200);
  assert.equal((await get(app.url,'203.0.113.10')).status,200);
  // A spoofed address cannot buy a fresh allowance when the proxy is untrusted.
  assert.equal((await get(app.url,'198.51.100.7')).status,429);
 } finally {
  await app.close();
 }
});
