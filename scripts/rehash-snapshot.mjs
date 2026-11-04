// Recomputes `revision` of a content snapshot with the same contentHash() the CMS export and the
// build validator use, then validates the result. Run after any manual snapshot edit:
//   npm run content:rehash [-- path/to/snapshot.json]
import fs from 'node:fs';
import path from 'node:path';
import {contentHash, validateSnapshot} from '../cms/content-contract.mjs';

const target = path.resolve(process.argv[2] ?? 'src/data/content-snapshot.json');
const snapshot = JSON.parse(fs.readFileSync(target, 'utf8'));
const previous = snapshot.revision;
snapshot.revision = contentHash(snapshot.data);
validateSnapshot(snapshot);
const text = JSON.stringify(snapshot, null, 2) + '\n';
if (fs.readFileSync(target, 'utf8') !== text) fs.writeFileSync(target, text);
console.log(JSON.stringify({target, previous, revision: snapshot.revision, changed: previous !== snapshot.revision}));
