import {Link} from '../i18n/Link';
import { useCopy } from '../i18n/copy';

import InnerPageLayout from '../components/layout/InnerPageLayout';
import { SEO_METADATA } from '../data/seo';

export default function NotFoundPage() {
  const copy = useCopy();
  return (
    <InnerPageLayout
      title={copy("404 — Страница не найдена")}
      subtitle={copy("К сожалению, запрашиваемая страница перемещена или не существует")}
      heroColor="orange"
      seo={SEO_METADATA.notFound}
    >
      <div className="container" data-not-found style={{ textAlign: 'center', padding: '3rem 0 6rem' }}>
        <div style={{ fontSize: '7rem', fontFamily: 'var(--font-accent)', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          404
        </div>
        <p style={{ fontSize: '1.25rem', color: 'var(--gl-black)', opacity: 0.8, marginBottom: '2.5rem' }}>
          {copy("Кажется, вы перешли по неверной ссылке или страница была обновлена.")}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
            {copy("На главную")}</Link>
          <Link to="/branches" className="btn btn-violet" style={{ padding: '1rem 2.5rem' }}>
            {copy("Наши филиалы")}</Link>
        </div>
      </div>
    </InnerPageLayout>
  );
}
