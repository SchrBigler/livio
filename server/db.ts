import {Pool} from 'pg';
let pool:Pool|undefined;
export function database(){
  if(!process.env.LIVIO_DATABASE_URL)throw new Error('database_unavailable');
  return pool??=new Pool({connectionString:process.env.LIVIO_DATABASE_URL,max:3});
}
