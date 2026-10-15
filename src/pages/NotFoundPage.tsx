import { Link } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';

export default function NotFoundPage() {
  return (
    <InnerPageLayout
      title="404 — Страница не найдена"
      subtitle="К сожалению, запрашиваемая страница перемещена или не существует"
      heroColor="orange"
    >
      <div className="container" style={{ textAlign: 'center', padding: '3rem 0 6rem' }}>
        <div style={{ fontSize: '7rem', fontFamily: 'var(--font-accent)', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          404
        </div>
        <p style={{ fontSize: '1.25rem', color: 'var(--gl-black)', opacity: 0.8, marginBottom: '2.5rem' }}>
          Кажется, вы перешли по неверной ссылке или страница была обновлена.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
            На главную
          </Link>
          <Link to="/branches" className="btn btn-violet" style={{ padding: '1rem 2.5rem' }}>
            Наши филиалы
          </Link>
        </div>
      </div>
    </InnerPageLayout>
  );
}
