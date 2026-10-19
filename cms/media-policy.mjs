import policy from './media-policy.json' with {type:'json'};
// Withdrawal is separate from CMS status/approval. Re-publishing an old record,
// reusing its native file, or cloning its known bytes must not restore it.
export function isWithdrawnMedia(record){
 if(!record||typeof record!=='object')return false;
 const data=record.public_data??record,file=typeof record.file==='object'?record.file?.id:record.file;
 return [record.id,data.id,record.slug].some(id=>policy.mediaIds.includes(id))||policy.cmsFileIds.includes(file)||[record.assetSha256,data.assetSha256].some(sha=>typeof sha==='string'&&policy.assetSha256.includes(sha.toLowerCase()))||[data.src,data.thumbnail,data.poster,data.srcSet].some(value=>typeof value==='string'&&policy.publicPaths.some(path=>value.includes(path)));
}
