import {createApp} from '../src/integration.js';
import {openTurso} from '../src/turso.js';

// Vercel's rewrites capture a :path segment that the /api/index destination does
// not consume, so it arrives as an injected query parameter and the records API's
// strict allowlist rejects the request. Drop it only when it matches the captured
// route segments, so a genuinely unexpected ?path= is still refused.
export function normalizeRewriteQuery(url) {
 const [pathname,search]=url.split('?');
 if(!search)return url;
 const params=new URLSearchParams(search);
 if(!params.has('path'))return url;
 const captured=params.getAll('path').join('/');
 const expected=pathname.replace(/^\/(?:api|health)\/?/,'');
 if(captured!==expected)return url;
 params.delete('path');
 const rest=params.toString();
 return rest?`${pathname}?${rest}`:pathname;
}

let app;
export default function handler(req,res){
 try {
  if(!app){
   const origin=process.env.PUBLIC_ORIGIN || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
   app=createApp(openTurso(),{origin});
  }
  req.url=normalizeRewriteQuery(req.url);
  return app(req,res);
 }catch{
  res.status(503).json({error:{code:'NOT_CONFIGURED',message:'Database configuration is incomplete.',details:[]}});
 }
}
