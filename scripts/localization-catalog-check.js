import fs from 'node:fs';import assert from 'node:assert/strict';
import ts from 'typescript';
const exceptions=JSON.parse(fs.readFileSync('scripts/localization-exceptions.json','utf8'));
const object=file=>{
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 const statement=source.statements.find(s=>ts.isVariableStatement(s)&&s.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword));
 assert.ok(statement,'Exported catalog in '+file);let expression=statement.declarationList.declarations[0].initializer;
 while(ts.isAsExpression(expression)||ts.isSatisfiesExpression(expression)||ts.isParenthesizedExpression(expression))expression=expression.expression;
 assert.ok(ts.isObjectLiteralExpression(expression),'Literal catalog in '+file);const entries=[];
 for(const property of expression.properties){
  if(ts.isSpreadAssignment(property)){assert.equal(property.expression.getText(source),'contentRu','Only the explicit RU content catalog spread is supported');continue;}
  assert.ok(ts.isPropertyAssignment(property)&&ts.isStringLiteral(property.name)&&ts.isStringLiteral(property.initializer),'Literal message in '+file);
  entries.push([property.name.text,property.initializer.text]);
 }
 assert.equal(new Set(entries.map(([key])=>key)).size,entries.length,'No duplicate catalog keys in '+file);return Object.fromEntries(entries);
};
export function checkCatalogs(){
 const ru={...object('src/i18n/content-ru.ts'),...object('src/i18n/ru.ts')},catalogs={ru,kk:object('src/i18n/kk.ts'),en:object('src/i18n/en.ts')};
 const slots=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
 for(const locale of ['kk','en']){assert.deepEqual(Object.keys(catalogs[locale]).sort(),Object.keys(ru).sort(),locale+' keys');for(const[key,source]of Object.entries(ru)){const value=catalogs[locale][key];assert.ok(typeof value==='string'&&value.trim(),locale+' '+key);assert.deepEqual(slots(value),slots(source),locale+' placeholders '+key);assert.doesNotMatch(value,/DRAFT|TODO|undefined|\[object Object\]|Content\.[a-f0-9]{12}/,locale+' '+key);}}
 const numbers=value=>(value.replace(/(\d)[ ,\u00a0](?=\d{3}(?:\D|$))/g,'$1').match(/\d+(?:[,.]\d+)?/g)||[]).map(v=>Number(v.replace(',','.'))).sort((a,b)=>a-b);
 for(const locale of ['kk','en'])for(const[key,source]of Object.entries(ru)){
  if(exceptions.legalBodyKeys.includes(key))continue;
  let value=catalogs[locale][key];
  if(locale==='kk'&&source.includes('24/7')){assert.ok(value.includes('тәулік бойы'));value=value.replace('тәулік бойы','24/7')}
  const lexical=exceptions.numericLexicalExceptions[key]?.[locale];if(lexical){assert.ok(value.includes(lexical));value=value.replace(lexical,key==='Content.8750a3358535'?'1-на-1':'3')}
  assert.deepEqual(numbers(value),numbers(source),locale+' changed numeric fact '+key);
 }
 const keyFor=source=>Object.entries(ru).find(([,v])=>v===source)?.[0];
 for(const locale of ['kk','en'])for(const[source,numbers]of [['2–12 января 2027',['2','12','2027']],['3–17 января 2027',['3','17','2027']],['45–50 часов английского',['45','50']],['Более 25 стран · 1 800 университетов',['25','1','800']],['Групповой пробный урок длится 60 или 90 минут в зависимости от группы. Индивидуальный пробный урок проходит индивидуально; его продолжительность уточняется отдельно.',['60','90']]]){const value=catalogs[locale][keyFor(source)];assert.ok(value,source);for(const number of numbers)assert.ok(value.includes(number),locale+' fact '+source);}
 assert.ok(catalogs.kk[keyFor('Костанай')]==='Қостанай'&&catalogs.en[keyFor('Рудный')]==='Rudny');
 const legalNoticeKey='Legal.localNotice',legalBodyKeys=Object.keys(ru).filter(k=>/Настоящ|настоящ|1\. Общие|2\. Состав|3\. Цели|4\. Меры|1\. Предмет|2\. Перечень|3\. Способы|4\. Срок|Предоставленные данные|GL Study принимает|Обработка данных может/.test(ru[k]));
 for(const locale of ['kk','en'])for(const key of legalBodyKeys)assert.equal(catalogs[locale][key],catalogs[locale][legalNoticeKey],'Legal body must remain a notice, not a legal translation');
 console.log('PASS real RU/KK/EN catalogs: '+Object.keys(ru).length+' keys each; exact placeholders, no empty/draft/key leaks; programme facts; legal notice only');return catalogs;
}
