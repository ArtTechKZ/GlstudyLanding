import {CONTACTS} from '../data/contacts';

// Single source for every "write to WhatsApp" link on the site (GL-STUDY-30).
// Opening the link only opens WhatsApp with a prepared text; it is never reported as a sent request.
export type WhatsAppKind = 'program' | 'service' | 'branch' | 'trial' | 'general';

export const WHATSAPP_RECIPIENT = CONTACTS.whatsappNumber;
export const WHATSAPP_LABELS = {program: 'Написать в WhatsApp', service: 'Консультация в WhatsApp', branch: 'Написать в WhatsApp', trial: 'Написать в WhatsApp', general: 'Написать в WhatsApp'} as const satisfies Record<WhatsAppKind, string>;

export function whatsappMessage(kind: WhatsAppKind, title = ''): string {
  const name = title.trim();
  switch (kind) {
    // Texts for program and service are prescribed by the client.
    case 'program': return `Здравствуйте, пишу с сайта, хотел подробнее узнать про программу "${name}"`;
    case 'service': return `Здравствуйте, пишу с сайта, мне нужна консультация по услуге "${name}"`;
    // The three below are neutral additions for buttons that are not a programme or service.
    case 'branch': return `Здравствуйте, пишу с сайта, хотел подробнее узнать про филиал "${name}"`;
    case 'trial': return 'Здравствуйте, пишу с сайта, хотел узнать про бесплатный пробный урок';
    default: return 'Здравствуйте, пишу с сайта, хотел задать вопрос';
  }
}

export function whatsappHref(kind: WhatsAppKind, title = '', recipient: string = WHATSAPP_RECIPIENT): string {
  if (!/^\d{11,15}$/.test(recipient)) throw new Error('Invalid WhatsApp recipient');
  return `https://wa.me/${recipient}?text=${encodeURIComponent(whatsappMessage(kind, title))}`;
}
