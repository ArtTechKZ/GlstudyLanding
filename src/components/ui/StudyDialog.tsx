import LanguagePicker from './LanguagePicker';
import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import { useEffect, useRef, type ReactNode, type KeyboardEventHandler } from 'react';

export default function StudyDialog({ title, onClose, children, wide = false, onKeyDown }: {
  title: string; onClose: () => void; children: ReactNode; wide?: boolean; onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
}) {
  const copy = useCopy();
  const t = useUi();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const keyboard: KeyboardEventHandler<HTMLDialogElement> = event => {
    onKeyDown?.(event);
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const targets = [...ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')]
      .filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return <dialog onKeyDown={keyboard} ref={ref} className={`study-dialog${wide ? ' study-dialog--wide' : ''}`} aria-label={copy(title)} onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="study-dialog__header"><h2>{copy(title)}</h2><LanguagePicker/><button className="study-button" onClick={onClose} autoFocus>{t("StudyDialog.zakryt")}</button></div>{children}
  </dialog>;
}
