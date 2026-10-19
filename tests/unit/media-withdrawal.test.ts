import {describe,it,expect} from 'vitest';
import snapshot from '../../src/data/content-snapshot.json';
import policy from '../../cms/media-policy.json';
import {isWithdrawnMedia} from '../../cms/media-policy.mjs';
import {exportApprovedAssets} from '../../cms/media-export.mjs';
import {contentHash,validateSnapshot} from '../../cms/content-contract.mjs';
describe('withdrawn stage24 publication approval',()=>{
 it('blocks a republished record and native file even with new outer identities',()=>{
  expect(isWithdrawnMedia({id:'new-record',status:'published',rights_confirmed:true,public_data:{id:policy.mediaIds[0]}})).toBe(true);
  expect(isWithdrawnMedia({id:'new-record',file:policy.cmsFileIds[0],public_data:{id:'new-media'}})).toBe(true);
 });
 it('blocks a clone with the same reviewed bytes or a known derivative',()=>{
  expect(isWithdrawnMedia({public_data:{id:'cloned',assetSha256:policy.assetSha256[0]}})).toBe(true);
  expect(isWithdrawnMedia({srcSet:policy.publicPaths[0]+' 480w, /images/company/other.webp 900w'})).toBe(true);
 });
 it('never requests or writes a withdrawn asset through the exporter',async()=>{
  let requests=0;const adapter={request:async()=>{requests++;throw Error('Withdrawn file requested')}};
  const rows=[{id:'new-record',file:policy.cmsFileIds[0],rights_confirmed:true,public_data:{id:'cloned'}}];
  expect(await exportApprovedAssets(adapter,rows)).toEqual([]);expect(requests).toBe(0);
 });
 it('rejects a stale snapshot with a valid hash before building',()=>{
  const copy=structuredClone(snapshot);copy.data.media.push({id:policy.mediaIds[0],type:'image',src:policy.publicPaths.find(x=>x.endsWith('.webp')),width:480,height:320,alt:{ru:'Fixture',kk:'Fixture',en:'Fixture'},caption:{ru:'Fixture',kk:'Fixture',en:'Fixture'},rightsSource:'Fixture',section:'unit',order:1} as never);copy.revision=contentHash(copy.data);
  expect(()=>validateSnapshot(copy)).toThrow('Withdrawn media');
 });
 it('retains the clean content and permits unrelated future reviewed media',()=>{
  expect(snapshot.data.media).toEqual([]);expect(validateSnapshot(snapshot)).toBe(snapshot);
  expect(isWithdrawnMedia({id:'unrelated',src:'/images/company/future-reviewed.webp',assetSha256:'f'.repeat(64)})).toBe(false);
 });
});
