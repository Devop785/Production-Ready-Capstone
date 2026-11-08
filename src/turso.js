import {createClient} from '@libsql/client';
export function openTurso({url=process.env.TURSO_DATABASE_URL,authToken=process.env.TURSO_AUTH_TOKEN}={}) {
 if(!url)throw new Error('TURSO_DATABASE_URL is required');
 const client=createClient({url,authToken});
 return {
  prepare(sql){return {
   async get(...args){return (await client.execute({sql,args})).rows[0];},
   async all(...args){return (await client.execute({sql,args})).rows;},
   async run(...args){const result=await client.execute({sql,args});return {changes:result.rowsAffected,lastInsertRowid:result.lastInsertRowid};}
  };},
  async exec(sql){await client.executeMultiple(sql);},
  close(){client.close();}
 };
}
