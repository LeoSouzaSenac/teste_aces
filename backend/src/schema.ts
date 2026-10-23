import {db} from './db';async function main(){await db.initialize();await db.synchronize();console.log('Esquema atualizado');await db.destroy();}main().catch(e=>{console.error(e);process.exit(1)});
