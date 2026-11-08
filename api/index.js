import {createApp} from '../src/integration.js';
import {openTurso} from '../src/turso.js';
let app;
export default function handler(req,res){
 try {
  if(!app){
   const origin=process.env.PUBLIC_ORIGIN || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
   app=createApp(openTurso(),{origin});
  }
  return app(req,res);
 }catch{
  res.status(503).json({error:{code:'NOT_CONFIGURED',message:'Database configuration is incomplete.',details:[]}});
 }
}
