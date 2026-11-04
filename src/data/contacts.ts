// GL-STUDY-30 shared contacts, supplied by the client in "Gl study вся инфа.md".
// Branch contacts come from the branch table in the content snapshot and are never mixed with these.
export const CONTACTS = {
  /** Main WhatsApp recipient (digits only, wa.me format). Branch phones are NOT confirmed WhatsApp numbers. */
  whatsappNumber: '77055589219',
  whatsappDisplay: '+7 705 558 92 19',
  /** International department; shown as the footer phone. It is a phone, not a confirmed WhatsApp. */
  internationalPhone: '+7 707 310 68 22',
  internationalPhoneHref: 'tel:+77073106822',
  email: 'grandluxe@yandex.ru',
  instagramHandle: 'grandluxe.kz',
  instagramUrl: 'https://www.instagram.com/grandluxe.kz',
  /** Reception and managers only — this is NOT a class timetable and carries no weekdays. */
  receptionHours: 'Приемная и менеджеры: 09:00-19:00',
} as const;

/** Builds a tel: link from a display phone such as "+7 705 558 92 19" or "8 (705) 558-92-19". */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const national = digits.length === 11 && /^[78]/.test(digits) ? digits.slice(1) : digits.slice(-10);
  return 'tel:+7' + national;
}

export function instagramUrl(handle: string): string {
  return 'https://www.instagram.com/' + handle.replace(/^@/, '') + '/';
}
