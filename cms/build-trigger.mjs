import {createServer} from 'node:http';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';import path from 'node:path';
export const signBuildEvent=(secret,body)=>createHmac('sha256',secret).update(body).digest('hex');
export function createBuildTrigger({secret,database,run,now=Date.now,maxPerMinute=12,debounceMs=100}){
 if(typeof secret!=='string'||secret.length<32||typeof run!=='function')throw Error('Private build trigger configuration required');
 fs.mkdirSync(path.dirname(path.resolve(database)),{recursive:true});const db=new DatabaseSync(database);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,at INTEGER NOT NULL,processed INTEGER NOT NULL DEFAULT 0);CREATE TABLE IF NOT EXISTS runs(id INTEGER PRIMARY KEY,state TEXT NOT NULL,at INTEGER NOT NULL);');
 if(!db.prepare('PRAGMA table_info(events)').all().some(c=>c.name==='processed'))db.exec('ALTER TABLE events ADD COLUMN processed INTEGER NOT NULL DEFAULT 0');
 let pending=!!db.prepare('SELECT 1 FROM events WHERE processed=0 LIMIT 1').get(),running=false,closing=false,timer;
 async function build(){
  if(running||closing)return;pending=false;running=true;
  const cutoff=db.prepare('SELECT max(rowid) AS id FROM events WHERE processed=0').get().id;
  const row=db.prepare("INSERT INTO runs(state,at) VALUES('running',?)").run(now());
  try{await run();db.exec('BEGIN IMMEDIATE');try{db.prepare("UPDATE runs SET state='completed' WHERE id=?").run(row.lastInsertRowid);db.prepare('UPDATE events SET processed=1 WHERE rowid<=?').run(cutoff);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
  catch{db.prepare("UPDATE runs SET state='failed' WHERE id=?").run(row.lastInsertRowid)}
  finally{running=false;if(closing)db.close();else if(pending)timer=setTimeout(build,debounceMs)}
 }
 const server=createServer(async(req,res)=>{
  const reply=(code,body)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});res.end(JSON.stringify(body))};
  if(req.url!=='/build-events')return reply(404,{error:'not-found'});if(req.method!=='POST')return reply(405,{error:'post-required'});
  if(!/^application\/json(?:;|$)/.test(req.headers['content-type']??''))return reply(415,{error:'json-required'});
  let raw='';try{for await(const p of req){raw+=p;if(Buffer.byteLength(raw)>4096)return reply(413,{error:'body-too-large'})}}catch{return}
  const signature=req.headers['x-gl-signature'];
  if(typeof signature!=='string'||! /^[a-f\d]{64}$/.test(signature)||!timingSafeEqual(Buffer.from(signBuildEvent(secret,raw)),Buffer.from(signature)))return reply(403,{error:'signature-rejected'});
  let event;try{event=JSON.parse(raw)}catch{return reply(400,{error:'invalid-json'})}
  if(!event||Object.keys(event).some(k=>!['id','timestamp','event'].includes(k))||!/^[-A-Za-z\d_:.]{16,150}$/.test(event.id??'')||!['published','archived','schedule'].includes(event.event)||!Number.isFinite(Date.parse(event.timestamp))||Math.abs(now()-Date.parse(event.timestamp))>60000)return reply(422,{error:'invalid-event'});
  if(db.prepare('SELECT id FROM events WHERE id=?').get(event.id))return reply(409,{error:'event-replayed'});
  if(db.prepare('SELECT count(*) AS n FROM events WHERE at>?').get(now()-60000).n>=maxPerMinute)return reply(429,{error:'rate-limited'});
  db.prepare('INSERT INTO events(id,at) VALUES(?,?)').run(event.id,now());db.prepare('DELETE FROM events WHERE processed=1 AND at<?').run(now()-7*86400000);
  pending=true;clearTimeout(timer);if(!running)timer=setTimeout(build,debounceMs);reply(202,{status:'local-candidate-queued',published:false});
 });
 server.once('listening',()=>{if(pending)timer=setTimeout(build,debounceMs)});
 server.on('close',()=>{closing=true;clearTimeout(timer);if(!running)db.close()});
 return {server,db,idle:()=>!running&&!pending};
}
