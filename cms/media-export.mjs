import {stripMp4Metadata} from './media-sanitize.mjs';
import {isWithdrawnMedia} from './media-policy.mjs';
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
export async function exportApprovedAssets(adapter,rows,publicRoot='public'){
 const allowed=rows.filter(row=>!isWithdrawnMedia(row));if(!allowed.length)return [];
 const root=path.resolve(publicRoot,'images/company');fs.mkdirSync(root,{recursive:true});const result=[];
 for(const row of allowed){if(!row.rights_confirmed||!row.file){result.push(row);continue}if(!/^[a-f\d-]{36}$/i.test(row.file))throw Error('Invalid CMS file relationship');
  const meta=(await adapter.request('files/'+row.file+'?fields=id,type,width,height,filesize')).data;if(!meta||!['image/webp','image/jpeg','image/png','video/mp4'].includes(meta.type)||meta.type!=='video/mp4'&&(!Number.isInteger(meta.width)||!Number.isInteger(meta.height))||Number(meta.filesize)>20000000)throw Error('CMS media metadata rejected');
  const fetchFile=async(suffix='')=>{const url=new URL('assets/'+row.file+suffix,adapter.url.href.replace(/\/?$/,'/'));const r=await adapter.fetch(url,{headers:adapter.token?{Authorization:'Bearer '+adapter.token}:{},signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok||!r.headers.get('content-type')?.match(/^(?:image\/|video\/mp4)/))throw Error('CMS asset unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length>20000000)throw Error('Asset size limit');return bytes};
  const raw=await fetchFile(),sha=createHash('sha256').update(raw).digest('hex');if(row.public_data?.assetSha256!==sha)throw Error('CMS file changed since review; reapproval required');
  if(meta.type==='video/mp4'){const name='cms-'+row.file+'-'+sha.slice(0,10)+'.mp4';fs.writeFileSync(path.join(root,name),stripMp4Metadata(raw).bytes);result.push({...row,public_data:{...row.public_data,src:'/images/company/'+name}});continue}
  const widths=[480,900,1440].filter(w=>w<=meta.width);if(!widths.length)widths.push(meta.width);const stem='cms-'+row.file+'-'+sha.slice(0,10),paths=[];
  for(const width of widths){const bytes=await fetchFile('?'+new URLSearchParams({width:String(width),format:'webp',quality:'82'}));const name=stem+'-'+width+'.webp';fs.writeFileSync(path.join(root,name),bytes);paths.push({width,url:'/images/company/'+name})}
  const preferred=paths.find(p=>p.width===900)??paths.at(-1);const media={...row.public_data,src:preferred.url,thumbnail:paths[0].url,srcSet:paths.map(p=>p.url+' '+p.width+'w').join(', '),width:preferred.width,height:Math.round(meta.height*preferred.width/meta.width),alt:{...row.public_data.alt,ru:row.alt_ru},caption:{...row.public_data.caption,ru:row.caption}};
  result.push({...row,public_data:media});
 }return result;
}
