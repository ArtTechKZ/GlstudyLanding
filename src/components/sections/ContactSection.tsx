import { useCopy } from '../../i18n/copy';
import { CONTACTS } from '../../data/contacts';
import { COMPANY } from '../../data/company';
import WhatsAppLink from '../ui/WhatsAppLink';
import type { WhatsAppKind } from '../../features/whatsapp';
import './ContactSection.scss';

// GL-STUDY-30: replaces the demo lead form, which never delivered data (see GL-STUDY-30.md).
// Restore LeadFormSection only together with an approved lead endpoint and legal texts.
export default function ContactSection({ heading = 'СВЯЖИТЕСЬ С НАМИ', kind = 'general', title }: { heading?: string; kind?: WhatsAppKind; title?: string }) {
  const copy = useCopy();
  return <section className="contact-block section" id="contact-whatsapp" aria-labelledby="contact-whatsapp-heading"><div className="container">
    <div className="study-panel contact-block__panel">
      <h2 className="section-heading" id="contact-whatsapp-heading">{copy(heading)}</h2>
      <p>{copy("Напишите в WhatsApp — менеджер подскажет программу, формат и подходящий филиал. Откроется чат с готовым текстом; сообщение отправляете вы сами.")}</p>
      <div className="study-actions">
        <WhatsAppLink kind={kind} title={title} cta="contact-whatsapp">{copy("Написать в WhatsApp")}</WhatsAppLink>
        <a className="study-button" href={COMPANY.phoneHref}>{copy("Позвонить: ")}<span className="study-phone-number">{copy(COMPANY.phone)}</span></a>
      </div>
      <p className="contact-block__hours">{copy(CONTACTS.receptionHours)}</p>
    </div>
  </div></section>;
}
