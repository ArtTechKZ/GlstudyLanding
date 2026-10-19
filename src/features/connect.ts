import { COMPANY } from '../data/company';

// BLOCKED: the supplied script has no approved cross-origin embed. A same-origin
// srcdoc with allow-scripts + allow-same-origin cannot protect parent DOM/storage.
// No unsafe override, proxy, null-origin CORS workaround or remote script loader.
export function installConnect() {
  if (__GL_PUBLIC_RU__ || window.__GL_SSG__ || window.__GL_CONNECT__) return;
  window.__GL_CONNECT__ = true;
  const labels=()=>window.__GL_CONNECT_LABELS__!;
  window.addEventListener('gl:language-labels',()=>{if(!dialog)return;dialog.querySelector('h2')!.textContent=labels().title;dialog.querySelector('button')!.textContent=labels().close;dialog.querySelector('p')!.textContent=labels().text});
  let dialog: HTMLDialogElement | undefined, previous: HTMLElement | null = null;
  const dismiss = () => {
    if (!dialog) return;
    dialog.close(); dialog.remove(); dialog = undefined;
    if (previous?.isConnected && previous.checkVisibility()) previous.focus();
  };
  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-connect-open]') : null;
    if (!trigger || dialog) return;
    previous = trigger;
    dialog = document.createElement('dialog'); dialog.className = 'study-dialog'; dialog.dataset.connectStatus = 'blocked';
    dialog.setAttribute('aria-labelledby', 'gl-connect-title');
    const header = document.createElement('div'); header.className = 'study-dialog__header';
    const title = document.createElement('h2'); title.id = 'gl-connect-title'; title.textContent = labels().title;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'study-button'; close.textContent = labels().close; close.onclick = dismiss;
    header.append(title, close);
    const text = document.createElement('p'); text.textContent = labels().text;
    const actions = document.createElement('div'); actions.className = 'study-actions';
    const phone = document.createElement('a'); phone.href = COMPANY.phoneHref; phone.className = 'study-phone-number'; phone.textContent = COMPANY.phone;
    const whatsapp = document.createElement('a'); whatsapp.href = COMPANY.internationalWhatsApp; whatsapp.target = '_blank'; whatsapp.rel = 'noreferrer';
    whatsapp.append('WhatsApp: '); const number = document.createElement('span'); number.className = 'study-phone-number'; number.textContent = COMPANY.internationalPhone; whatsapp.append(number);
    actions.append(phone, whatsapp); dialog.append(header, text, actions); document.body.append(dialog); dialog.showModal(); close.focus();
    dialog.oncancel = event => { event.preventDefault(); dismiss(); };
    dialog.onkeydown = event => {
      if (event.key !== 'Tab' || !dialog) return;
      const targets = [...dialog.querySelectorAll<HTMLElement>('button,a[href]')].filter(element => element.checkVisibility());
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
  });
  window.addEventListener('pagehide', dismiss);
}
