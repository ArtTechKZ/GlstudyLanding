export function normalizePhone(value) {
  const clean=value.trim();
  if (value.length>30 || /[\r\n\t]/.test(value) || !/^\+?[\d() -]+$/.test(clean)) return '';
  let digits = clean.replace(/\D/g, '');
  if (clean.startsWith('+') && !digits.startsWith('7')) return '';
  if (/^8\d{10}$/.test(digits)) digits = '7' + digits.slice(1);
  return /^7\d{10}$/.test(digits) ? '+' + digits : '';
}

export function routingKind(context,format){
 if(context.type==='travel'||context.program==='travel'||context.program==='admissions'||context.program?.startsWith('summer-')||(!context.program&&context.intent==='international'))return 'international';
 if(format==='online'||context.format==='online'||context.program==='online'||context.program?.startsWith('language-')||(!context.program&&context.intent==='language-start'))return 'online';
 return 'course';
}
