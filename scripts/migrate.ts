import {readdir,readFile} from 'node:fs/promises';
import {database} from '../server/db';
async function main(){const db=database();try{for(const file of (await readdir('migrations')).filter(f=>f.endsWith('.sql')).sort())await db.query(await readFile('migrations/'+file,'utf8'));console.log('LIVIO schema ready. No existing project was removed.');}finally{await db.end();}}
main().catch(()=>{console.error('Migration failed. Check LIVIO_DATABASE_URL and database access.');process.exitCode=1;});
