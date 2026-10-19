import { useUi } from "../../i18n/index";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Branch } from '../../types';
import { MAP_CONFIG } from '../../config/map';
export default function LiveBranchMap({ branches, selected, onSelect, onState }: { branches: Branch[]; selected?: string; onSelect: (id: string) => void; onState: (state: 'ready' | 'error') => void }) {
  const t = useUi();
  const node = useRef<HTMLDivElement>(null), map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.CircleMarker>());
  const callbacks = useRef({ onSelect, onState });
  useEffect(() => { callbacks.current = { onSelect, onState }; }, [onSelect, onState]);
  useEffect(() => {
    const markerIndex = markers.current;
    const instance = L.map(node.current!, { scrollWheelZoom: false }); map.current = instance;
    const tiles = L.tileLayer(MAP_CONFIG.tiles, { attribution: MAP_CONFIG.attribution, maxZoom: MAP_CONFIG.maxZoom }).addTo(instance);
    let failed = false;
    const timeout = setTimeout(() => callbacks.current.onState('error'), 12000);
    tiles.on('tileerror', () => { failed = true; clearTimeout(timeout); callbacks.current.onState('error'); });
    tiles.on('load', () => { clearTimeout(timeout); if (!failed) callbacks.current.onState('ready'); });
    const points: L.LatLngTuple[] = [];
    branches.forEach(b => {
      if (b.lat === undefined || b.lng === undefined) return;
      const position: L.LatLngTuple = [b.lat, b.lng]; points.push(position);
      const label = document.createElement('strong'); label.textContent = b.name;
      const marker = L.circleMarker(position, { radius: 12, color: '#000000', fillColor: '#8D3BED', fillOpacity: 1, weight: 2 }).addTo(instance).bindTooltip(label, { permanent: true });
      marker.on('click', () => callbacks.current.onSelect(b.id)); markers.current.set(b.id, marker);
    });
    if (points.length === 1) instance.setView(points[0], 15); else instance.fitBounds(points, { padding: [35, 35], maxZoom: 16 });
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(node.current!);
    return () => { clearTimeout(timeout); resize.disconnect(); markerIndex.clear(); instance.remove(); map.current = null; };
  }, [branches]);
  useEffect(() => {
    const b = branches.find(b => b.id === selected);
    markers.current.forEach((m, id) => m.setStyle({ fillColor: id === selected ? '#F24C0A' : '#8D3BED' }));
    if (b?.lat !== undefined && b.lng !== undefined) { map.current?.panTo([b.lat, b.lng]); markers.current.get(b.id)?.openTooltip(); }
  }, [selected, branches]);
  return <div ref={node} className="study-map-canvas" aria-label={t("LiveBranchMap.interaktivnaya.karta.filialov")} />;
}
