import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import snapshot from '../../src/data/content-snapshot.json';
import {contentHash,validateSnapshot} from '../../cms/content-contract.mjs';
import {findContentLoss,assertNoContentLoss} from '../../cms/export-guard.mjs';
import {exportContent,recordFingerprint} from '../../cms/export-content.mjs';

type Snapshot=typeof snapshot;
const clone=()=>structuredClone(snapshot) as Snapshot;
const rehash=(s:Snapshot)=>{s.revision=contentHash(s.data);return s};

/** What an export from the pre-GL-STUDY-30 CMS mapper would produce from the same cities. */
function legacyFormatSnapshot(){
  const s=clone() as unknown as {data:Record<string,any>};
  delete s.data.services;delete s.data.packages;
  s.data.cities=s.data.cities.filter((c:any)=>c.hasPage!==false||c.branches.length).map((c:any)=>{const {hasPage:_h,...city}=c;return {...city,branches:c.branches.map((b:any)=>{const {instagram:_i,offerings:_o,...branch}=b;return {...branch,status:'active'}})}});
  s.data.company={phone:'+7 705 558 92 19',phoneHref:'tel:+77055589219',internationalPhone:'+7 707 310 68 22',internationalWhatsApp:'https://wa.me/77073106822',instagram:'https://www.instagram.com/glstudy.kz/'};
  return rehash(s as unknown as Snapshot);
}

/** Fake Directus REST API holding legacy-format records (no stage-30 fields). Read-only: no write is ever possible. */
function legacyDirectus(){
  const settings={key:'site-settings',status:'published',approved_ru:true,id:'settings',public_data:{trialProcess:snapshot.data.trialProcess,company:{phone:'+7 705 558 92 19',phoneHref:'tel:+77055589219',internationalPhone:'+7 707 310 68 22',internationalWhatsApp:'https://wa.me/77073106822',instagram:'https://www.instagram.com/glstudy.kz/'},plannedLanguages:snapshot.data.plannedLanguages,summerDestinations:snapshot.data.summerDestinations}};
  const sign=(r:Record<string,any>)=>({...r,approval_hash:recordFingerprint(r)});
  const cities=snapshot.data.cities.filter(c=>c.hasPage!==false).map(c=>sign({id:'c-'+c.id,slug:c.id,name_ru:c.name,status:'published',approved_ru:true,public_data:{}}));
  const branches=snapshot.data.cities.filter(c=>c.hasPage!==false).flatMap(c=>c.branches.map(b=>sign({id:'b-'+b.id,city:c.id,name_ru:b.name,status:'published',approved_ru:true,public_data:{id:b.id,status:'active'}})));
  const tables:Record<string,unknown[]>={cities,branches,texts:[sign(settings)]};
  const requests:string[]=[];
  const fetchImpl=async(url:string|URL,options?:{method?:string})=>{
    const u=new URL(url);requests.push((options?.method??'GET')+' '+u.pathname);
    if(u.pathname.endsWith('/activity'))return {ok:true,json:async()=>({data:[{id:1}]})};
    const name=u.pathname.split('/').at(-1)!.replace('gl_','');const rows=tables[name]??[];
    return {ok:true,json:async()=>({data:rows,meta:{filter_count:rows.length}})};
  };
  return {fetchImpl,requests};
}

const tempTarget=()=>{const directory=fs.mkdtempSync(path.join(os.tmpdir(),'gl-export-'));const target=path.join(directory,'content-snapshot.json');fs.writeFileSync(target,JSON.stringify(snapshot,null,2)+'\n');return {directory,target}};
const cmsArgs=(target:string,fetchImpl:unknown,extra={})=>({url:'http://127.0.0.1:8055',token:'synthetic-token',target,localIntegration:true,fetchImpl:fetchImpl as typeof fetch,acceptedRevision:undefined,...extra});

describe('GL-STUDY-31 export guard: GL-STUDY-30 content survives an old-format CMS export',()=>{
  it('the committed snapshot carries the stage-30 content the guard protects, and its revision is canonical',()=>{
    expect(validateSnapshot(snapshot)).toBe(snapshot);expect(snapshot.revision).toBe(contentHash(snapshot.data));
    const branches=snapshot.data.cities.flatMap(c=>c.branches);
    expect(branches.filter(b=>['online','online_launch','repair'].includes(b.status))).toHaveLength(6);
    expect(snapshot.data.services).toHaveLength(5);expect(snapshot.data.packages).toHaveLength(3);
  });
  it('reports every kind of stage-30 content that an old-format export would drop',()=>{
    const lost=findContentLoss(snapshot,legacyFormatSnapshot()).join('\n');
    expect(lost).toMatch(/services:/);expect(lost).toMatch(/packages:/);expect(lost).toMatch(/city-page-flag:ekibastuz/);
    expect(lost).toMatch(/branch-instagram:kostanay-center/);expect(lost).toMatch(/branch-offerings:kostanay-center/);
    expect(lost).toMatch(/branch-status:ekibastuz repair->active/);expect(lost).toMatch(/company\.instagram/);expect(lost).toMatch(/company\.internationalWhatsApp/);
  });
  it('lets an identical export and an ordinary editorial change through',()=>{
    expect(findContentLoss(snapshot,clone())).toEqual([]);
    const edited=clone();const branch=edited.data.cities.flatMap(c=>c.branches).find(b=>b.id==='taraz-konaev')!;delete (branch as {phone?:string}).phone;branch.address='Конаева 16';rehash(edited);
    expect(findContentLoss(snapshot,edited)).toEqual([]);
    const reopened=clone();reopened.data.cities.flatMap(c=>c.branches).find(b=>b.id==='ekibastuz')!.status='active';rehash(reopened);
    expect(findContentLoss(snapshot,reopened)).toEqual([]);
  });
  it('stops an old-format Directus export before the committed snapshot is replaced',async()=>{
    const {directory,target}=tempTarget();const before=fs.readFileSync(target,'utf8');const cms=legacyDirectus();
    try{
      await expect(exportContent(cmsArgs(target,cms.fetchImpl))).rejects.toThrow(/GL-STUDY-30 content.*Previous snapshot retained/s);
      expect(fs.readFileSync(target,'utf8')).toBe(before);
      expect(fs.readdirSync(directory)).toEqual(['content-snapshot.json']);
      await expect(exportContent(cmsArgs(target,cms.fetchImpl))).rejects.toThrow(/GL_ACCEPT_CONTENT_LOSS=/);
      expect(fs.readFileSync(target,'utf8')).toBe(before);
      expect(cms.requests.every(r=>r.startsWith('GET '))).toBe(true);
    }finally{fs.rmSync(directory,{recursive:true,force:true})}
  });
  it('accepts the removal only with the revision of the snapshot being replaced',async()=>{
    const {directory,target}=tempTarget();const cms=legacyDirectus();
    try{
      await expect(exportContent(cmsArgs(target,cms.fetchImpl,{acceptedRevision:'0'.repeat(64)}))).rejects.toThrow(/Previous snapshot retained/);
      const result=await exportContent(cmsArgs(target,cms.fetchImpl,{acceptedRevision:snapshot.revision}));
      expect(result.unchanged).toBe(false);
      const written=JSON.parse(fs.readFileSync(target,'utf8'));expect(written.revision).toBe(contentHash(written.data));expect(written.data.services).toBeUndefined();
      // Repeatable: the same export of the same CMS yields byte-identical output and the same revision.
      const again=await exportContent(cmsArgs(target,cms.fetchImpl,{acceptedRevision:written.revision}));
      expect(again.unchanged).toBe(true);expect(again.revision).toBe(written.revision);
    }finally{fs.rmSync(directory,{recursive:true,force:true})}
  });
  it('does not mistake a missing previous snapshot for a loss',()=>{
    expect(()=>assertNoContentLoss(undefined,legacyFormatSnapshot())).not.toThrow();
  });
});
