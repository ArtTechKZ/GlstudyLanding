import { useState, useRef, useEffect } from 'react';
import type { Branch, City } from '../../types';
import './BranchMap.scss';

interface BranchMapProps {
  city: City;
  branches: Branch[];
}

export default function BranchMap({ city, branches }: BranchMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMapLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const branchesWithCoords = branches.filter((b) => b.lat !== undefined && b.lng !== undefined);
  const hasRealCoords = branchesWithCoords.length > 0;

  return (
    <div className="branch-map-container" ref={containerRef} aria-label={`Карта филиалов — ${city.name}`}>
      {/* Polished interactive-styled UI preview */}
      <div className="branch-map-viewport gl-bg-pattern-grid-violet">
        {/* Mockup Map Controls */}
        <div className="branch-map-ui-controls" aria-hidden="true">
          <div className="branch-map-ui-btn">+</div>
          <div className="branch-map-ui-btn">−</div>
        </div>

        {hasRealCoords && mapLoaded ? (
          <div className="branch-map-live">
            <div className="branch-map-ready-msg">
              Интерактивная карта готова к подключению провайдера.
            </div>
          </div>
        ) : (
          <div className="branch-map-preview">
            <div className="branch-map-pin-pulse">
              <span className="branch-map-pin-icon" aria-hidden="true">📍</span>
            </div>
            <h4 className="branch-map-preview__title">Филиалы в г.&nbsp;{city.name}</h4>
            <p className="branch-map-preview__desc">
              Удобные локации рядом с транспортом и учебными заведениями.
              Точный маршрут и парковку подскажет координатор филиала.
            </p>
            <div className="branch-map-preview__badge">
              <span>📍 Навигация и адреса по запросу</span>
            </div>
          </div>
        )}
      </div>

      {/* Accessible textual fallback list */}
      <div className="branch-map-text-list" aria-label="Адреса и контакты филиалов">
        <h5 className="branch-map-text-list__heading">Список отделений — {city.name}:</h5>
        <ul className="branch-map-text-list__items" role="list">
          {branches.map((b) => (
            <li key={b.id} className="branch-map-text-item">
              <div className="branch-map-text-item__header">
                <strong className="branch-map-text-item__name">{b.name}</strong>
                {b.hasIelts && <span className="branch-map-text-item__badge">IELTS центр</span>}
              </div>
              <div className="branch-map-text-item__addr">
                {b.address ? (
                  <span>📍 {b.address}</span>
                ) : (
                  <span className="branch-map-text-item__pending">Адрес: центральный район города (уточняйте у менеджера)</span>
                )}
              </div>
              <div className="branch-map-text-item__phone">
                {b.phone ? (
                  <a href={`tel:${b.phone}`}>📞 {b.phone}</a>
                ) : (
                  <span className="branch-map-text-item__pending">Телефон: единая линия консультаций</span>
                )}
              </div>
              {b.schedule && (
                <div className="branch-map-text-item__schedule">🕒 {b.schedule}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
