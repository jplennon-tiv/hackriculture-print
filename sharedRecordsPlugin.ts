import type {Plugin} from 'vite';
import path from 'node:path';
import {refreshGenerated} from '../hackriculture-data/lib/records.mjs';
export function sharedRecordsPlugin():Plugin {
 let root:string;
 return {name:'shared-records',enforce:'pre',
  configResolved(config){root=path.resolve(config.root,'../hackriculture-data');refreshGenerated(root);},
  configureServer(server){
   const targets=['records.json','vegetables','troubles'].map(p=>path.join(root,p));server.watcher.add(targets);
   const changed=(file:string)=>{
    if(!targets.some(p=>file===p||file.startsWith(p+path.sep)))return;
    try{refreshGenerated(root);}catch(err){server.config.logger.error('Shared data refresh failed: '+String(err));}
   };
   server.watcher.on('add',changed).on('change',changed).on('unlink',changed);
  },
 };
}
