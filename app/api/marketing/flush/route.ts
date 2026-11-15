import {staff} from '../../../../server/auth';
import {sameOrigin,json,failure} from '../../../../server/http';
import {flush} from '../../../../server/marketing/outbox';
export const dynamic='force-dynamic';
export async function POST(r:Request){try{sameOrigin(r);staff(r);return json(await flush());}catch(e){return failure(e);}}
