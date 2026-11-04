import type {ReactNode} from 'react';
import {useCopy} from '../../i18n/copy';
import {whatsappHref, WHATSAPP_LABELS, type WhatsAppKind} from '../../features/whatsapp';

// Every WhatsApp button goes through this component and the shared helper.
// `title` is always the Russian source name so managers see a consistent text.
export default function WhatsAppLink({kind, title, className = 'study-button', children, cta, onClick, ariaLabel}: {kind: WhatsAppKind; title?: string; className?: string; children?: ReactNode; cta?: string; onClick?: () => void; ariaLabel?: string}) {
  const copy = useCopy();
  return <a href={whatsappHref(kind, title)} className={className} target="_blank" rel="noopener noreferrer" data-whatsapp={kind} data-cta={cta} onClick={onClick} aria-label={ariaLabel}>{children ?? copy(WHATSAPP_LABELS[kind])}</a>;
}
