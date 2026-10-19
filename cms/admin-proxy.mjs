import {createServer,request} from 'node:http';
import {pathToFileURL} from 'node:url';
export function createAdminProxy({upstream='http://127.0.0.1:8055'}={}){
 const target=new URL(upstream);if(target.protocol!=='http:'||!['127.0.0.1','localhost'].includes(target.hostname))throw Error('Local CMS upstream required');
 return createServer((req,res)=>{
  const headers={...req.headers,host:target.host};delete headers['proxy-authorization'];delete headers['proxy-connection'];
  const forward=request({hostname:target.hostname,port:target.port,path:req.url,method:req.method,headers},response=>{
   const out={...response.headers,'x-robots-tag':'noindex, nofollow, noarchive','x-content-type-options':'nosniff','referrer-policy':'same-origin'};
   if(out.location?.startsWith(target.origin))out.location=new URL(out.location).pathname;
   res.writeHead(response.statusCode??502,out);response.pipe(res);
  });
  forward.setTimeout(15000,()=>forward.destroy());forward.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'X-Robots-Tag':'noindex, nofollow','Content-Type':'text/plain'});res.end('Local CMS unavailable')});req.on('aborted',()=>forward.destroy());req.pipe(forward);
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)createAdminProxy().listen(8056,'127.0.0.1',()=>console.log('Private local CMS: http://127.0.0.1:8056/admin/ (noindex proxy)'));
