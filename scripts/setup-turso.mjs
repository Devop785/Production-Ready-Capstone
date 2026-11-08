import {readFileSync} from 'node:fs';
import {openTurso} from '../src/turso.js';
const db=openTurso();
try {
 await db.exec(readFileSync(new URL('../db/schema.sql',import.meta.url),'utf8'));
 await db.exec(readFileSync(new URL('../db/seed.sql',import.meta.url),'utf8'));
 console.log('Database schema and demo roles are ready. Existing records preserved.');
}finally{db.close();}
