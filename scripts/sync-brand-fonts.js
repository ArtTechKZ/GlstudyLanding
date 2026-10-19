import fs from'node:fs';
const endpoint='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@500..800&display=swap';
const response=await fetch(endpoint,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'}});if(!response.ok)throw Error(response.status);const css=await response.text();fs.mkdirSync('.qa/study11',{recursive:true});fs.writeFileSync('.qa/study11/font-source.css',css);
fs.mkdirSync('public/fonts',{recursive:true});let output='',sources=[],preloads=[];const blocks=[...css.matchAll(/\/\* ([^*]+) \*\/\s*(@font-face\s*\{[^}]+\})/g)];
if (!blocks.length) throw Error('Expected subset WOFF2 CSS');
for(const[,subset,block]of blocks){const url=block.match(/url\(([^)]+)\)/)?.[1];if(!url?.endsWith('.woff2'))throw Error('Expected modern WOFF2 subset');const family=block.includes("'Inter'")?'inter':'bebas-neue';const name=family+'-'+subset.trim()+'.woff2';const font=await fetch(url);if(!font.ok)throw Error(url);fs.writeFileSync('public/fonts/'+name,Buffer.from(await font.arrayBuffer()));sources.push({family,subset:subset.trim(),file:name,url});output+='/* '+subset+'; '+url+' */\n'+block.replace(url,'/fonts/'+name)+'\n';if(family==='inter'&&['latin','cyrillic'].includes(subset.trim()))preloads.push(name)}
fs.writeFileSync('src/styles/_fonts.scss',output);
for(const family of ['inter','bebasneue']){const r=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);if(!r.ok)throw Error('Font licence missing');fs.writeFileSync(`public/licenses/${family}-ofl.txt`,await r.text())}
fs.writeFileSync('.qa/study11/font-sources.json',JSON.stringify({endpoint,sources,preloads},null,2));console.log(sources.map(s=>s.file));
