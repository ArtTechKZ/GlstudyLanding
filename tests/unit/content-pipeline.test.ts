import {describe,expect,it} from 'vitest';import snapshot from '../../src/data/content-snapshot.json';import {contentHash,validateSnapshot,publicFields,fields,safePublicUrl} from '../../cms/content-contract.mjs';import {stripMp4Metadata} from '../../cms/media-sanitize.mjs';
function changed(fn:(data:typeof snapshot.data)=>void){const copy=structuredClone(snapshot);fn(copy.data);copy.revision=contentHash(copy.data);return copy}
describe('validated CMS snapshot used by the actual build',()=>{
 it('validates the real content snapshot and its canonical revision',()=>expect(validateSnapshot(snapshot)).toBe(snapshot));
 it('rejects a corrupt revision rather than falling back to demo',()=>expect(()=>validateSnapshot({...snapshot,revision:'0'.repeat(64)})).toThrow('revision'));
 it.each(['javascript:alert(1)','//tracker.example/photo.jpg','https://tracker.example/photo.jpg','/images/company/../../.env'])('rejects unsafe/remote media %s',src=>expect(()=>validateSnapshot(changed(d=>{d.media[0].src=src}))).toThrow());
 it('rejects malformed coordinates',()=>expect(()=>validateSnapshot(changed(d=>{d.cities[0].branches.push({id:'synthetic',cityId:d.cities[0].id,name:'test',lat:200,lng:50,status:'active'} as never)}))).toThrow('coordinates'));
 it('rejects duplicate identities',()=>expect(()=>validateSnapshot(changed(d=>{d.programs.push({...d.programs[0]})}))).toThrow('Duplicate'));
 it('removes internal prices and secrets at the field allowlist boundary',()=>{const result=publicFields({id:'test',title:'Public title',price:'10000',token:'private',description:'Public copy',features:['One'],additionalOption:{price:'500',includes:['One']}},[...fields.programs,'additionalOption']);expect(JSON.stringify(result)).not.toMatch(/10000|private|500/);expect(result.title).toBe('Public title')});
 it.each(['Курс за 10 000 ₸','Price: 100 USD','Онлайн-занятия в Zoom','https://example.com/?api_key=private'])('enforces brief/privacy rules even on published strings %s',title=>expect(()=>validateSnapshot(changed(d=>{d.programs[0].title=title}))).toThrow());
 it('rejects invalid trip calendar dates',()=>expect(()=>validateSnapshot(changed(d=>{d.trips[0].dateStart='2027-02-31'}))).toThrow());
 it('keeps legal drafts outside the snapshot',()=>expect(()=>validateSnapshot(changed(d=>{d.legal.push({operatorApproved:false} as never)}))).toThrow('legal'));
 it('permits owned local WebP/MP4 files and refuses private protocols',()=>{expect(safePublicUrl('/images/company/lesson-900.webp',{media:true})).toBe(true);expect(safePublicUrl('/images/company/clip.mp4',{media:true})).toBe(true);expect(safePublicUrl('data:text/html,test')).toBe(false)});
});
describe('MP4 public metadata derivative',()=>{
 const box=(type:string,payload:Buffer)=>{const out=Buffer.alloc(8+payload.length);out.writeUInt32BE(out.length);out.write(type,4,4,'latin1');payload.copy(out,8);return out};
 it('strips user metadata while preserving track data and offsets',()=>{const track=box('mdat',Buffer.from('actual video samples')),metadata=box('udta',Buffer.from('GPSLatitude=private')),input=Buffer.concat([box('moov',metadata),track]);const result=stripMp4Metadata(input);expect(result.bytes.length).toBe(input.length);expect(result.bytes.subarray(input.length-track.length)).toEqual(track);expect(result.bytes.includes(Buffer.from('GPSLatitude'))).toBe(false);expect(result.removedMetadataBoxes).toBe(1)});
 it('rejects malformed container lengths',()=>expect(()=>stripMp4Metadata(Buffer.from([0,0,0,1,109,111,111,118]))).toThrow());
});
