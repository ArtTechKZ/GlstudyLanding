import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';
// Native SQLite online backup. Run with the same Node ABI as the isolated CMS.
export async function backupLocal({instance,target}){
 const source=await fs.realpath(instance),destination=path.resolve(target);if(destination===source||destination.startsWith(source+path.sep))throw Error('Backup must be outside instance');
 try{await fs.access(destination);throw Error('Backup target already exists')}catch(e){if(e.code!=='ENOENT')throw e}
 const require=createRequire(path.join(source,'package.json'));const Database=require('better-sqlite3');const db=new Database(path.join(source,'data','gl-study.db'),{readonly:true});
 await fs.mkdir(path.join(destination,'data'),{recursive:true});try{await db.backup(path.join(destination,'data','gl-study.db'))}finally{db.close()}
 for(const name of ['uploads','extensions']){try{await fs.cp(path.join(source,name),path.join(destination,name),{recursive:true,errorOnExist:true,force:false,dereference:false})}catch(e){if(e.code!=='ENOENT')throw e}}
 const files=[];async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Backup contains symlink');if(entry.isDirectory())await walk(file);else files.push({file:path.relative(destination,file),sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex')})}}await walk(destination);
 await fs.writeFile(path.join(destination,'manifest.json'),JSON.stringify(files,null,2));return {target:destination,files:files.length};
}
