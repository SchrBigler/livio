import {staff} from '../../../../server/auth';
import {database} from '../../../../server/db';
import {failure,json} from '../../../../server/http';
import {SupplierSource} from '../../../../lib/supplier';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{staff(r);const row=(await database().query("SELECT value FROM livio_settings WHERE key='supplier-source'")).rows[0];if(!row)throw new Error('not_found');return json(SupplierSource.parse(row.value));}catch(e){return failure(e);}}
