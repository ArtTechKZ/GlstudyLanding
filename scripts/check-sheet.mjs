// GL-STUDY-31: reconciles the branch snapshot with the supplied Google Sheet ("Лист1"). Read-only: the sheet is never modified.
// Usage: node scripts/check-sheet.mjs [--file sheet.csv]   (default: live export?format=csv&gid=0)
// The export endpoint is used on purpose: the gviz endpoint types a mostly numeric column as "number" and silently drops
// text cells such as "7 707 824 0000" (found in stage 31: D5, D12, D13 were lost that way).
import fs from 'node:fs';
import assert from 'node:assert/strict';

const SHEET_ID = '1mYHt-Ct9usJRn2mBPS8OJNq5BrKzZL1Dx4eKcSpXWek';
const fileArg = process.argv.indexOf('--file');
const checkedAt = new Date().toISOString();
const csv = fileArg > 0 ? fs.readFileSync(process.argv[fileArg + 1], 'utf8') : await (await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`)).text();

function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += ch; }
    else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const digits = value => { const d = String(value ?? '').replace(/\D/g, ''); return d.length === 11 && /^[78]/.test(d) ? '7' + d.slice(1) : d.length === 10 ? '7' + d : d; };
// Sheet row number (as in the first column) -> branch id of the snapshot. Order follows the sheet.
const ROWS = ['kostanay-center', 'kostanay-kzhbi', 'kostanay-ksk', 'kostanay-plaza', 'rudny-center', 'astana-kaysenov', 'astana-rysqulov', 'astana-kabanbay', 'almaty-masanchi', 'almaty-nazarbayev', 'taraz-konaev', 'ekibastuz', 'ust-kamenogorsk-online', 'kokshetau-online', 'petropavlovsk-online', 'almaty-online'];
const STATUS = { 'kostanay-center': 'active', 'almaty-nazarbayev': 'online', 'ekibastuz': 'repair', 'ust-kamenogorsk-online': 'online_launch', 'kokshetau-online': 'online_launch', 'petropavlovsk-online': 'online_launch', 'almaty-online': 'online_launch' };

const snapshot = JSON.parse(fs.readFileSync('src/data/content-snapshot.json', 'utf8'));
const branches = snapshot.data.cities.flatMap(city => city.branches);
const sheet = parseCsv(csv).filter(r => /^\d+$/.test(r[0]?.trim()));
assert.equal(sheet.length, ROWS.length, `sheet has ${sheet.length} branch rows, expected ${ROWS.length}`);

const problems = [];
const report = [];
sheet.forEach((r, i) => {
  const id = ROWS[i], b = branches.find(x => x.id === id), cell = `D${i + 2}`;
  if (!b) { problems.push(`${id}: not in snapshot`); return; }
  const sheetPhone = digits(r[3]), snapPhone = digits(b.phone);
  if (sheetPhone !== snapPhone) problems.push(`${id} ${cell}: sheet "${r[3].trim()}" (${sheetPhone || 'empty'}) vs snapshot "${b.phone ?? 'none'}"`);
  const handle = r[4].trim();
  if (handle !== (b.instagram ?? '')) problems.push(`${id}: instagram sheet "${handle}" vs snapshot "${b.instagram ?? ''}"`);
  const products = r[5].split(/\s*\d+\.\s*/).map(s => s.trim()).filter(Boolean);
  const kazakhSheet = /казахск/i.test(r[5]), kazakhSnap = (b.offerings ?? []).some(o => /казахск/i.test(o));
  if (kazakhSheet !== kazakhSnap) problems.push(`${id}: Kazakh courses sheet=${kazakhSheet} snapshot=${kazakhSnap}`);
  if (!/^Онлайн/i.test(r[5]) && products.length !== (b.offerings ?? []).length) problems.push(`${id}: ${products.length} products in sheet vs ${(b.offerings ?? []).length} in snapshot`);
  const want = STATUS[id] ?? 'active';
  if (b.status !== want) problems.push(`${id}: status ${b.status}, expected ${want}`);
  report.push(`${id.padEnd(24)} ${cell.padEnd(4)} ${String(r[3].trim() || '(empty)').padEnd(20)} -> ${b.phone ?? '(none)'} | ${b.status}`);
});
// Internal sheet field must never reach the public data.
if (/Сотрудники|staff/i.test(JSON.stringify(snapshot.data))) problems.push('internal staff field present in snapshot');

console.log(`Sheet ${SHEET_ID} / Лист1, ${fileArg > 0 ? 'file ' + process.argv[fileArg + 1] : 'live export csv'}, checked ${checkedAt}`);
console.log(report.join('\n'));
if (problems.length) { console.error('MISMATCH:\n' + problems.join('\n')); process.exit(1); }
console.log(`PASS: ${sheet.length} sheet records match the snapshot (phone, instagram, Kazakh courses, product count, status); no internal fields published.`);
