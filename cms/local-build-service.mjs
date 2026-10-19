import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash,randomUUID} from 'node:crypto';import {pathToFileURL} from 'node:url';
import {exportContent} from './export-content.mjs';import {createBuildTrigger} from './build-trigger.mjs';
// Content alone cannot identify a candidate after application or build-tool changes.
export function buildSourceRevision(workspace){
 const files=[];const visit=relative=>{const absolute=path.join(workspace,relative);if(!fs.existsSync(absolute))return;const stat=fs.lstatSync(absolute);if(stat.isSymbolicLink())throw Error('Build inputs must not be symlinks');if(stat.isDirectory()){for(const name of fs.readdirSync(absolute).sort())if(!['node_modules','.git','.qa','dist','uploads'].includes(name))visit(path.join(relative,name));}else files.push(relative);};
 for(const name of ['src','public','scripts','cms','index.html','package.json','package-lock.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json'])visit(name);
 const hash=createHash('sha256');for(const file of files.sort()){hash.update(file.replaceAll('\\','/')+'\0');hash.update(fs.readFileSync(path.join(workspace,file)));hash.update('\0');}return hash.digest('hex');
}
export function createLocalBuildService({access,secret,outputRoot}){
 if(!['127.0.0.1','localhost'].includes(new URL(access.url).hostname))throw Error('Local CMS access required');
 const root=path.resolve(outputRoot),workspace=path.resolve('.');if(!root.startsWith(workspace+path.sep+'.qa'+path.sep))throw Error('Local build evidence must be outside public serving paths');fs.mkdirSync(root,{recursive:true});
 const pointer=path.join(root,'current.json'),selected=path.join(root,'latest-snapshot.json');
 const run=async()=>{
  const snapshot=await exportContent({...access,target:selected,localIntegration:true});
  const sourceRevision=buildSourceRevision(workspace);
  const previous=fs.existsSync(pointer)?JSON.parse(fs.readFileSync(pointer,'utf8')):null;
  if(previous?.revision===snapshot.revision&&previous?.sourceRevision===sourceRevision&&fs.existsSync(path.join(previous.directory,'index.html')))return;
  const candidate=path.join(root,'candidates',snapshot.revision.slice(0,16)+'-'+randomUUID());fs.mkdirSync(path.dirname(candidate),{recursive:true});
  const frozen=path.join(root,'snapshot-'+randomUUID()+'.json');fs.copyFileSync(selected,frozen);
  const log=fs.openSync(path.join(root,'build.log'),'a');
  try{await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,[process.env.npm_execpath??path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),'run','build:cms'],{cwd:workspace,windowsHide:true,stdio:['ignore',log,log],env:{...process.env,GL_CONTENT_SOURCE:'snapshot',GL_CONTENT_SNAPSHOT:frozen,GL_DIST_DIR:candidate}});
   child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Local candidate build failed')));
  })}finally{fs.closeSync(log)}
  const produced=JSON.parse(fs.readFileSync(path.join(candidate,'content-revision.json'),'utf8'));if(produced.revision!==snapshot.revision||!fs.existsSync(path.join(candidate,'index.html')))throw Error('Candidate revision mismatch');
  if(buildSourceRevision(workspace)!==sourceRevision)throw Error('Build inputs changed during candidate creation; previous candidate retained');
  fs.writeFileSync(pointer+'.tmp',JSON.stringify({directory:candidate,revision:snapshot.revision,sourceRevision,createdAt:new Date().toISOString(),published:false},null,2));fs.renameSync(pointer+'.tmp',pointer);
 };
 return createBuildTrigger({secret,database:path.join(root,'events.sqlite'),run,debounceMs:500});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.env.GL_LOCAL_BUILD_CONFIG)throw Error('Choose a private local build service configuration file');
 const config=JSON.parse(fs.readFileSync(process.env.GL_LOCAL_BUILD_CONFIG,'utf8')),access=JSON.parse(fs.readFileSync(config.cmsAccessFile,'utf8')),{secret}=JSON.parse(fs.readFileSync(config.secretFile,'utf8'));
 const app=createLocalBuildService({access,secret,outputRoot:config.outputRoot});app.server.listen(8791,'127.0.0.1',()=>console.log('GL local signed candidate builder on loopback:8791; no deployment'));
}
