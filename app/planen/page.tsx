import type {Metadata} from 'next';
import Configurator from '../livio-configurator';
export const metadata: Metadata = {title:'Insektenschutz planen | BIGLER LIVIO', robots:{index:false,follow:true}};
export default function PlanPage(){return <Configurator/>;}
