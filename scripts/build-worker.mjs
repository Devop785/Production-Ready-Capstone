import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const assets={};for(const [url,file,type] of [['/','index.html','text/html; charset=utf-8'],['/app.js','app.js','text/javascript; charset=utf-8'],['/style.css','style.css','text/css; charset=utf-8']])assets[url]=[type,readFileSync('public/'+file,'utf8')];
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\nconst SEED='+readFileSync('db/seed.json','utf8')+';\n'+readFileSync('worker/index.js','utf8'));
cpSync('.openai/hosting.json','dist/.openai/hosting.json');cpSync('drizzle','dist/.openai/drizzle',{recursive:true});console.log('Built Worker, embedded assets and migrations.');
