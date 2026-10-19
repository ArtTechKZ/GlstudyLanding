import fs from 'node:fs';import {createDeliveryServer} from '../../server/lead-api.mjs';
const config=JSON.parse(fs.readFileSync(process.argv[2]));const app=createDeliveryServer(config);
app.server.listen(0,'127.0.0.1',()=>process.send({port:app.server.address().port}));
process.on('message',async m=>{if(m==='tick'){await app.worker.tick();process.send({ticked:true})}});
