import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import { type ReactNode } from 'react';

import { usePageSeo } from '../../hooks/usePageSeo';
import type { SeoMeta } from '../../types';
import './InnerPage.scss';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface InnerPageProps {
  title: string;
  subtitle?: string;
  accentWord?: string;
  tag?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  heroColor?: 'violet' | 'orange' | 'violet-light' | 'orange-light' | 'white' | 'lime' | 'pink' | 'cyan' | 'lavender';
  seo?: SeoMeta;
}

export default function InnerPageLayout({
  title,
  subtitle,
  accentWord,
  tag,
  breadcrumbs,
  children,
  heroColor = 'violet',
  seo
}: InnerPageProps) {
  const copy = useCopy();
  const t = useUi();
  usePageSeo(seo);

  return (
    <main id="main-content" className="inner-page">
      <div className={`inner-page__hero inner-page__hero--${heroColor}`}>
        <div className="container inner-page__hero-inner">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="inner-page__breadcrumbs" aria-label={t("InnerPageLayout.khlebnye.kroshki")}>
              <ol className="inner-page__breadcrumbs-list">
                <li>
                  <Link to="/" className="inner-page__breadcrumb-link">{t("InnerPageLayout.glavnaya")}</Link>
                </li>
                {breadcrumbs.map((b, i) => (
                  <li key={i} className="inner-page__breadcrumb-item">
                    <span className="inner-page__breadcrumb-sep" aria-hidden="true">/</span>
                    {b.href ? (
                      <Link to={b.href} className="inner-page__breadcrumb-link">{copy(b.label)}</Link>
                    ) : (
                      <span className="inner-page__breadcrumb-current" aria-current="page">{copy(b.label)}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {tag && (
            <div className="inner-page__tag-wrap">
              <span className="sticker inner-page__tag">{tag}</span>
            </div>
          )}

          <h1 className="inner-page__title">
            {accentWord
              ? title.split(accentWord).flatMap((part, i) =>
                  i < title.split(accentWord).length - 1
                    ? [part, <span key={i} className="inner-page__accent">{copy(accentWord)}</span>]
                    : [part]
                )
              : title}
          </h1>
          {subtitle && <p className="inner-page__subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="inner-page__content">
        {children}
      </div>
    </main>
  );
}
