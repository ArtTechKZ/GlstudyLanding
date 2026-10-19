import {useUi} from '../../i18n';
import {useCopy} from '../../i18n/copy';
import type {TravelProgram} from '../../types';
export default function TripItinerary({program}:{program:TravelProgram}){const t=useUi(),copy=useCopy();return <section data-trip-itinerary><h2>{t('Full.itinerary')}</h2>{program.itinerary?.length?<ol>{program.itinerary.map(day=><li key={day.dayNumber}><details><summary>{t('Full.day',{day:day.dayNumber})}: {copy(day.title)}</summary><p>{copy(day.description)}</p></details></li>)}</ol>:<p className="study-panel">{t('Full.itineraryPending')}</p>}</section>}
