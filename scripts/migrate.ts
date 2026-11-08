import {readFile} from 'node:fs/promises';
import {database} from '../server/db';
async function main(){const db=database();try{await db.query(await readFile('migrations/001_livio.sql','utf8'));console.log('LIVIO schema ready. No existing project was removed.');}finally{await db.end();}}
main().catch(()=>{console.error('Migration failed. Check LIVIO_DATABASE_URL and database access.');process.exitCode=1;});
