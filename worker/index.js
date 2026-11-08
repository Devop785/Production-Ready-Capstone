// Build supplies ASSETS and SEED. D1 uses the same schema as local SQLite.
const buckets=new Map();
let seeded;
async function handle(request,env){
 const url=new URL(request.url),path=url.pathname;
 const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
 const error=(status,code,message,details=[])=>json({error:{code,message,details}},status);
 if(path==='/health/live')return json({data:{status:'ok'}});
 if(path==='/health/ready'||path==='/health'){try{await env.DB.prepare('SELECT count(*) FROM internships').first();return json({data:{status:'ready'}});}catch{return error(503,'NOT_READY','Database unavailable.');}}
 if(path.startsWith('/api/')){
  const now=Date.now(),ip=request.headers.get('CF-Connecting-IP')||'unknown';
  for(const [key,b] of buckets)if(b.end<now)buckets.delete(key);
  for(const [suffix,limit] of [['api',120],...(path==='/api/applications'?[['apply',5]]:[])]){const key=ip+suffix;let b=buckets.get(key);if(!b){b={end:now+60000,count:0};buckets.set(key,b);}if(++b.count>limit)return json({error:{code:'RATE_LIMITED',message:'Too many requests. Wait before retrying.',details:[]}},429,{'Retry-After':String(Math.ceil((b.end-now)/1000))});}
  if(!seeded)seeded=env.DB.batch(SEED.map(r=>env.DB.prepare('INSERT INTO internships (id,company,role,domain,location,durationWeeks,stipend,description) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(r.id,r.company,r.role,r.domain,r.location,r.durationWeeks,r.stipend,r.description))).catch(e=>{seeded=null;throw e;});
  await seeded;
 }
 if(path==='/api/internships'&&request.method==='GET'){
  const q=url.searchParams;if([...q.keys()].some(k=>!['page','limit','domain','q'].includes(k)||q.getAll(k).length>1))return error(400,'VALIDATION_ERROR','Invalid query.');
  const page=q.get('page')||'1',limit=q.get('limit')||'10';
  if(!/^\d+$/.test(page)||!/^\d+$/.test(limit)||+page<1||+page>1000000||+limit<1||+limit>100||(q.get('q')||'').length>120||(q.get('domain')||'').length>120)return error(400,'VALIDATION_ERROR','Invalid pagination or filter.');
  const clauses=[],params=[];if(q.get('domain')){clauses.push('domain=? COLLATE NOCASE');params.push(q.get('domain').trim());}if(q.get('q')){clauses.push("instr(lower(company || ' ' || role || ' ' || description),lower(?))>0");params.push(q.get('q').trim());}const where=clauses.length?' WHERE '+clauses.join(' AND '):'';
  const total=await env.DB.prepare('SELECT count(*) AS total FROM internships'+where).bind(...params).first('total');const result=await env.DB.prepare('SELECT * FROM internships'+where+' ORDER BY id LIMIT ? OFFSET ?').bind(...params,+limit,(+page-1)*+limit).all();return json({data:result.results,meta:{page:+page,limit:+limit,total,totalPages:Math.ceil(total/+limit)}});
 }
 if(/^\/api\/internships\/[^/]+$/.test(path)&&request.method==='GET'){
  const id=path.split('/').pop();if(!/^[1-9]\d*$/.test(id)||!Number.isSafeInteger(+id))return error(400,'VALIDATION_ERROR','Invalid ID.');const data=await env.DB.prepare('SELECT * FROM internships WHERE id=?').bind(+id).first();return data?json({data}):error(404,'NOT_FOUND','Internship not found.');
 }
 if(path==='/api/applications'&&request.method==='POST'){
  if((request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)||request.headers.get('Sec-Fetch-Site')==='cross-site'||request.headers.get('X-Application-Request')!=='1')return error(403,'FORBIDDEN','Cross-origin or invalid request.');
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return error(415,'UNSUPPORTED_MEDIA_TYPE','Use application/json.');
  const reader=request.body?.getReader();let size=0,chunks=[];if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();return error(413,'PAYLOAD_TOO_LARGE','Body exceeds 16kb.');}chunks.push(value);}}
  const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}let b;try{b=JSON.parse(new TextDecoder().decode(bytes));}catch{return error(400,'INVALID_JSON','Invalid JSON.');}
  if(!b||typeof b!=='object'||Array.isArray(b))return error(400,'VALIDATION_ERROR','Object required.');
  const details=[];for(const k of Object.keys(b))if(!['internshipId','fullName','email','coverLetter','consent'].includes(k))details.push(k+': unknown field');
  const name=typeof b.fullName==='string'?b.fullName.trim():'',email=typeof b.email==='string'?b.email.trim().toLowerCase():'',letter=typeof b.coverLetter==='string'?b.coverLetter.trim():'';
  if(!Number.isSafeInteger(b.internshipId)||b.internshipId<1)details.push('internshipId: positive integer required');if(name.length<2||name.length>100||/[\x00-\x1f]/.test(name))details.push('fullName: 2–100 characters required');if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))details.push('email: valid email required');if(letter.length<30||letter.length>3000)details.push('coverLetter: 30–3000 characters required');if(b.consent!==true)details.push('consent: required');
  if(details.length)return error(400,'VALIDATION_ERROR','Please correct your application.',details);
  if(!await env.DB.prepare('SELECT id FROM internships WHERE id=?').bind(b.internshipId).first())return error(404,'NOT_FOUND','Internship not found.');
  const r=await env.DB.prepare('INSERT INTO applications (internshipId,fullName,email,coverLetter,consent) VALUES (?,?,?,?,1) ON CONFLICT(internshipId,email) DO NOTHING').bind(b.internshipId,name,email,letter).run();return r.meta.changes?json({data:{id:r.meta.last_row_id,status:'received'}},201):error(409,'ALREADY_SUBMITTED','An application for this email and role has already been received.');
 }
 if(path.startsWith('/api/')&&!['GET','HEAD'].includes(request.method))return error(405,'METHOD_NOT_ALLOWED','Method not allowed.');
 if(ASSETS[path]&&['GET','HEAD'].includes(request.method)){const [type,body]=ASSETS[path];return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':type,'Cache-Control':path==='/'?'no-cache':'public,max-age=300'}});}
 return error(404,'NOT_FOUND','Route not found.');
}
export default {async fetch(request,env){const started=Date.now(),id=crypto.randomUUID();let response;try{response=await handle(request,env);}catch{response=new Response(JSON.stringify({error:{code:'INTERNAL_ERROR',message:'Request failed. Please retry.',details:[]}}),{status:500,headers:{'Content-Type':'application/json'}});}
 const headers=new Headers(response.headers);headers.set('X-Request-Id',id);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');headers.set('Strict-Transport-Security','max-age=31536000');headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");console.log(JSON.stringify({event:'request',requestId:id,method:request.method,path:new URL(request.url).pathname,status:response.status,durationMs:Date.now()-started}));return new Response(response.body,{status:response.status,headers});}};
