// Shared WhatsApp assertions for browser checks (GL-STUDY-31).
// A WhatsApp button is verified by reading the link as data: host, recipient, decoded text, target and rel.
// Links are never clicked or opened, so no message can reach a manager and no external request is made.
export const WA_RECIPIENT = '77055589219';
export const WA_TEXT = [
  /^Здравствуйте, пишу с сайта, хотел подробнее узнать про программу ".+"$/,
  /^Здравствуйте, пишу с сайта, мне нужна консультация по услуге ".+"$/,
  /^Здравствуйте, пишу с сайта, хотел подробнее узнать про филиал ".+"$/,
  /^Здравствуйте, пишу с сайта, хотел узнать про бесплатный пробный урок$/,
  /^Здравствуйте, пишу с сайта, хотел задать вопрос$/,
];

/** Reads every WhatsApp link under `scope` as data (decoded text through URLSearchParams). */
export function readWhatsApp(page, scope = 'body') {
  return page.locator(scope).first().evaluate(root => [...root.querySelectorAll('a[href*="wa.me"]')].map(a => {
    const u = new URL(a.href);
    return {href: a.href, kind: a.dataset.whatsapp ?? null, host: u.host, recipient: u.pathname.slice(1), text: u.searchParams.get('text'), label: a.innerText.trim(), target: a.target, rel: a.rel, visible: !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length)};
  }));
}

/** Reads one WhatsApp anchor (a Playwright locator) as data, same shape as readWhatsApp() items. */
export function readWhatsAppLink(anchor) {
  return anchor.evaluate(a => {
    const u = new URL(a.href);
    return {href: a.href, kind: a.dataset.whatsapp ?? null, host: u.host, recipient: u.pathname.slice(1), text: u.searchParams.get('text'), label: a.innerText.trim(), target: a.target, rel: a.rel};
  });
}

/** Returns a list of problems (empty when every link has the right recipient, a prescribed text, _blank and noopener). */
export function whatsappProblems(links) {
  return links.flatMap(l => {
    const bad = [];
    if (l.host !== 'wa.me') bad.push('host ' + l.host);
    if (l.recipient !== WA_RECIPIENT) bad.push('recipient ' + l.recipient);
    if (!WA_TEXT.some(re => re.test(l.text ?? ''))) bad.push('text ' + JSON.stringify(l.text));
    if (l.target !== '_blank' || !/noopener/.test(l.rel)) bad.push('target/rel ' + l.target + '/' + l.rel);
    return bad.map(b => `${b} (${l.label})`);
  });
}
