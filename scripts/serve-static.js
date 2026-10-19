import fs from 'node:fs/promises';
import {startStaticServer} from './static-server.js';
const index=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
if(!index.includes('data-ssg="true"'))throw Error('Run npm run build:ssg before serving the static snapshot');
const at=process.argv.indexOf('--port'),port=at<0?4173:Number(process.argv[at+1]);
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
const server=await startStaticServer({port,gzip:process.argv.includes('--gzip')});
console.log('GL Study static SSG: '+server.baseURL+'/ (real directory redirects and HTTP 404)');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await server.close();process.exit(0)});
