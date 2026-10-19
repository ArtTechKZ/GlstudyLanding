import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import Icon from './Icon';
import { useId, useState } from 'react';
import StudyDialog from './StudyDialog';
import './StudyGallery.scss';

export interface GalleryImage {
  src: string;
  thumbnail?: string;
  srcSet?: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

function GalleryPhoto({ photo, thumbnail = false }: { photo: GalleryImage; thumbnail?: boolean }) {
  const copy = useCopy();
  const t = useUi();
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="study-gallery__error" role="status">{t("StudyGallery.izobrazhenie.nedostupno")}{copy(photo.alt)}</span>;
  return <img src={thumbnail ? photo.thumbnail ?? photo.src : photo.src} srcSet={thumbnail ? undefined : photo.srcSet}
    sizes={photo.srcSet ? '(max-width: 767px) 90vw, 900px' : undefined} alt={copy(photo.alt)} width={photo.width} height={photo.height}
    loading={thumbnail ? 'lazy' : 'eager'} decoding="async" onError={() => setFailed(true)} />;
}

export default function StudyGallery({ images, title: suppliedTitle }: { images: GalleryImage[]; title?: string }) {
  const copy = useCopy();
  const t = useUi();
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const title = suppliedTitle ?? t("StudyGallery.fotografii.programmy");
  const photo = active === null ? undefined : images[active];
  const move = (direction: number) => setActive(current => current === null ? null : (current + direction + images.length) % images.length);
  return <section className="study-gallery" aria-labelledby={id}>
    <h2 id={id}>{copy(title)}</h2>
    {images.length === 0 ? <p>{t("StudyGallery.fotografii.etoy.programmy.eshchyo.ne")}</p> :
      <ul className="study-gallery__thumbnails">{images.map((item, index) => <li key={item.src}>
        <button type="button" onClick={() => setActive(index)} aria-label={t("StudyGallery.otkryt.foto.v0.v1", {v0: index + 1, v1: copy(item.caption)})}><GalleryPhoto photo={item} thumbnail /></button>
        <p>{copy(item.caption)}</p>
      </li>)}</ul>}
    {photo && <StudyDialog title={copy(title)} onClose={() => setActive(null)} wide onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
      }}>
      <div className="study-gallery__viewer">
        <figure><GalleryPhoto key={photo.src} photo={photo} /><figcaption>{copy(photo.caption)}</figcaption></figure>
        <div className="study-gallery__controls">
          <button type="button" className="study-button" aria-label={t("StudyGallery.predydushchee.foto")} onClick={() => move(-1)} disabled={images.length < 2}><Icon name="previous" />{t("StudyGallery.predydushchee.foto.2")}</button>
          <span role="status" aria-live="polite">{copy(active! + 1)} / {copy(images.length)}</span>
          <button type="button" className="study-button" aria-label={t("StudyGallery.sleduyushchee.foto")} onClick={() => move(1)} disabled={images.length < 2}>{t("StudyGallery.sleduyushchee.foto.2")}<Icon name="next" /></button>
        </div>
      </div>
    </StudyDialog>}
  </section>;
}
