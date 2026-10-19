import {useLocale} from '../../i18n/locale-context';
import { useCopy } from '../../i18n/copy';
import { useUi, type Translator } from "../../i18n/index";
import Icon from '../ui/Icon';
import { useDirectionsTrack } from '../../hooks/useDirectionsTrack';
import { sitePath } from '../../utils/sitePath';
import {Link} from '../../i18n/Link';
import { DEMO_PROGRAMS } from '../../data/demo';
import {programContent} from '../../i18n/content';
import './DirectionsSection.scss';
import { useCityContext } from '../../hooks/useCityContext';

// Image assets mapping from official Brandbook GL STUDY 2026
const cardMedia = (t: Translator): Record<string, { image: string; alt: string; bullet: string; width: number; height: number }> => ({
  'english-children': {
    image: sitePath('/images/home/direction-kids.webp'), width: 599, height: 900,
    alt: t("DirectionsSection.devochka.v.naushnikakh.s.planshetom"),
    bullet: t("DirectionsSection.uvlekatelnye.uroki.v.igrovoy.forme"),
  },
  'english-teens': {
    image: sitePath('/images/home/direction-teens.webp'), width: 599, height: 900,
    alt: t("DirectionsSection.podrostok.s.tetradyami.angliyskiy.dlya"),
    bullet: t("DirectionsSection.svobodnaya.rech.i.podgotovka.k"),
  },
  'english-adults': {
    image: sitePath('/images/home/direction-adults.webp'), width: 594, height: 900,
    alt: t("DirectionsSection.studentka.s.noutbukom.angliyskiy.dlya"),
    bullet: t("DirectionsSection.dlya.raboty.puteshestviy.i.lichnogo"),
  },
  'ielts-prep': {
    image: sitePath('/images/home/ielts-target.webp'), width: 600, height: 600,
    alt: t("DirectionsSection.3d.mishen.so.streloy.podgotovka"),
    bullet: t("DirectionsSection.strategii.vsekh.4.blokov.ekzamena"),
  },
  online: { image: sitePath('/images/home/direction-adults.webp'), width: 594, height: 900, alt: t("DirectionsSection.illyustratsiya.distantsionnogo.obucheniya.devushka.s"), bullet: t("DirectionsSection.zhivoe.obshchenie.v.zoom") },
  offline: { image: sitePath('/images/home/offline-class.webp'), width: 800, height: 1200, alt: t("DirectionsSection.illyustratsiya.ochnogo.zanyatiya.iz.brendbuka"), bullet: t("DirectionsSection.obshchenie.i.komandnaya.rabota") },
  travel: { image: sitePath('/images/home/travel-prague.webp'), width: 800, height: 635, alt: t("DirectionsSection.evropeyskaya.arkhitektura.reklamnaya.illyustratsiya.iz"), bullet: t("DirectionsSection.yazyk.puteshestviya.i.novye.znakomstva") },
});

// Strict brand color assignments for the 7 programs
const CARD_COLORS: Record<string, string> = {
  'english-children':  'violet',
  'english-teens':     'orange',
  'english-adults':    'violet-light',
  'ielts-prep':        'orange-light',
  'online':            'violet',
  'offline':           'violet-light',
  'travel':            'orange',
};

function getProgramLink(progId: string): string {
  switch (progId) {
    case 'english-children':
      return '/programs/english-children';
    case 'english-teens':
      return '/programs/english-teens';
    case 'english-adults':
      return '/programs/english-adults';
    case 'ielts-prep':
      return '/ielts';
    case 'online':
      return '/online';
    case 'offline':
      return '/offline';
    case 'travel':
      return '/#travel';
    default:
      return '/learning';
  }
}

// Editorial syllable breaks also work where the browser has no Russian dictionary.
// Soft hyphens remain invisible whenever the complete word fits.
function optionalHyphens(text: string): string {
  return text
    .replaceAll('Английский', 'Англий\u00adский')
    .replaceAll('подростков', 'под\u00adростков')
    .replaceAll('Подготовка', 'Подго\u00adтовка')
    .replaceAll('Зарубежные', 'Зару\u00adбежные')
    .replaceAll('профессионального', 'профес\u00adсионального')
    .replaceAll('образовательные', 'образова\u00adтельные');
}

export default function DirectionsSection() {
  const copy = useCopy();
  const {locale}=useLocale();
  const t = useUi();
  const CARD_MEDIA = cardMedia(t);
  const { availablePrograms } = useCityContext();
  const programs = DEMO_PROGRAMS.filter(p => p.published && (availablePrograms === undefined || availablePrograms.includes(p.slug))).map(program=>({...program,...programContent(program,locale)}));

  const { section, panel, viewport, track, mode, range, move, onFocusCapture, skip } = useDirectionsTrack(programs.length);

  return (
    <section ref={section} className="directions section" id="directions" aria-labelledby="directions-heading">
      <div ref={panel} className="directions__panel">
        {/* Brand header */}
        <header className="container directions__header">
          <div>
            <div className="directions__tag-badge">
              <span className="directions__tag-dot" aria-hidden="true" />{t("DirectionsSection.programmy.obucheniya")}</div>
            <h2 className="directions__heading" id="directions-heading">{t("DirectionsSection.napravleniya")}{copy(' ')}
              <span className="directions__heading-accent">{t("DirectionsSection.obucheniya")}</span>
              {copy(' ')}{t("DirectionsSection.v.gl.study")}</h2>
          </div>
          <p className="directions__sub">{t("DirectionsSection.individualnye.i.gruppovye.kursy.angliyskogo")}</p>
        </header>

        {/* Dynamic cards grid with genuine brandbook assets and textures */}
        <div ref={viewport} className="directions__viewport" onFocusCapture={onFocusCapture}>
        <div ref={track} className="directions__grid" role="list" id="directions-cards">
          {programs.map((prog, i) => {
            const color = CARD_COLORS[prog.id] ?? 'violet';
            const media = CARD_MEDIA[prog.id];
            const hasMedia = Boolean(media);
            const gridPatternClass = (color === 'violet' || color === 'orange')
              ? 'gl-bg-pattern-grid-white'
              : 'gl-bg-pattern-grid-violet';

            return (
              <article
                data-program={prog.id}
                lang={locale}
                key={prog.id}
                className={`directions__card directions__card--${color} directions__card--pos-${i} ${gridPatternClass}${hasMedia ? ' directions__card--has-media' : ''}`}
                role="listitem"
              >
                <div className="directions__card-inner">
                  {/* Top row: Age badge + format */}
                  <div className="directions__card-top">
                    {prog.ageRange && <span className="directions__card-age">{copy(prog.ageRange)}</span>}
                    <span className="directions__card-format">
                      {copy(prog.format === 'online' && t("DirectionsSection.onlayn"))}
                      {copy(prog.format === 'offline' && t("DirectionsSection.oflayn"))}
                      {copy(prog.format === 'hybrid' && t("DirectionsSection.onlayn.oflayn"))}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="directions__card-title">{copy(optionalHyphens(prog.title))}</h3>

                  {/* Short description */}
                  <p className="directions__card-desc">{copy(optionalHyphens(prog.shortDesc))}</p>

                  {/* Feature bullet with 3D pin icon */}
                  {media?.bullet && (
                    <div className="directions__card-bullet">
                      <img
                        src={sitePath('/images/home/brand-pin.webp')}
                        alt=""
                        className="directions__card-pin-icon"
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                      <span>{copy(media.bullet)}</span>
                    </div>
                  )}

                  {/* Optional cutout character illustration from Brandbook */}
                  {hasMedia && (
                    <div className="directions__card-media">
                      <img
                        src={media.image.replace('.webp', '-480.webp')}
                        srcSet={`${media.image.replace('.webp', '-240.webp')} 240w, ${media.image.replace('.webp', '-480.webp')} 480w`}
                        sizes="(max-width: 639px) 180px, 200px"
                        alt={copy(media.alt)}
                        className="directions__card-img"
                        width={media.width}
                        height={media.height}
                        decoding="async"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="directions__card-actions">
                    <Link
                      to={getProgramLink(prog.id)}
                      className="directions__card-link"
                    >
                      <span>{t("DirectionsSection.podrobnee")}</span>
                      <Icon name="next" size={14} />
                    </Link>
                    <a
                      href="#lead-form"
                      className="btn directions__card-cta"
                    >{t("DirectionsSection.zapisatsya")}</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        </div>
        <div className="container directions__navigation" hidden={mode === 'grid'}>
          <div className="directions__arrows">
            <button type="button" aria-label={t("DirectionsSection.predydushchee.napravlenie")} aria-controls="directions-cards" aria-disabled={range.start} onClick={() => move(-1)}><Icon name="previous" /></button>
            <span className="directions__progress" aria-label={t("DirectionsSection.vidny.napravleniya.v0.v1.iz", {v0: range.first, v1: range.last, v2: programs.length})}>{copy(range.first)}–{copy(range.last)} / {copy(programs.length)}</span>
            <button type="button" aria-label={t("DirectionsSection.sleduyushchee.napravlenie")} aria-controls="directions-cards" aria-disabled={range.end} onClick={() => move(1)}><Icon name="next" /></button>
          </div>
          <button type="button" className="directions__skip" aria-label={t("DirectionsSection.k.sleduyushchemu.razdelu")} onClick={skip}>{t("DirectionsSection.k.sleduyushchemu.razdelu.2")}<Icon name="down" size={18} /></button>
        </div>
        <p className="container directions__media-note">{t("DirectionsSection.izobrazheniya.iz.brendbuka.illyustriruyut.napravleniya")}</p>
      </div>
    </section>
  );
}
