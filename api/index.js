import {createApp} from '../src/integration.js';
import {openTurso} from '../src/turso.js';

// Vercel appends any rewrite capture its destination does not consume to the
// query string, which the records API's strict allowlist then refuses. The
// rewrites in vercel.json name that capture __rewritepath so this handler can
// drop exactly one known key instead of guessing the platform's naming.
const REWRITE_CAPTURE='__rewritepath';

export function normalizeRewriteQuery(url) {
 const [pathname,search]=url.split('?');
 if(!search)return url;
 const params=new URLSearchParams(search);
 if(!params.has(REWRITE_CAPTURE))return url;
 params.delete(REWRITE_CAPTURE);
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
