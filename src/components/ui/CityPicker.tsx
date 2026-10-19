import { useCopy } from '../../i18n/copy';
import { useId } from 'react';
import { useCityContext } from '../../hooks/useCityContext';
export default function CityPicker() {
  const copy = useCopy();
 const id=useId(), {cities,selectedCity,selectCity}=useCityContext();
 return <div className="study-field"><label htmlFor={id}>{copy("Выберите город")}</label><select id={id} value={selectedCity.id} onChange={e=>selectCity(e.target.value)}>{cities.map(c=><option key={c.id} value={c.id}>{copy(c.name)}</option>)}</select></div>;
}
