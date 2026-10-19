import { BookOpen, PenLine, Headphones, MessagesSquare, MapPin, CircleAlert, Info, Wrench, School, Monitor, GraduationCap, Baby, Backpack, BriefcaseBusiness, Palette, Puzzle, Smartphone, Rocket, Clock, ChartNoAxesCombined, ChartColumn, Zap, Users, ClipboardList, CircleCheck, X, ArrowLeft, ArrowRight, ArrowDown, Plus, Minus, CalendarDays } from 'lucide-react';
import './Icon.scss';
// Small, explicit set of semantic IDs used by this site's data and components.
const icons = { book: BookOpen, writing: PenLine, listening: Headphones, speaking: MessagesSquare, location: MapPin, alert: CircleAlert, info: Info, tools: Wrench, school: School, online: Monitor, education: GraduationCap, child: Baby, teen: Backpack, business: BriefcaseBusiness, art: Palette, puzzle: Puzzle, phoneDevice: Smartphone, project: Rocket, time: Clock, progress: ChartNoAxesCombined, chart: ChartColumn, fast: Zap, people: Users, document: ClipboardList, check: CircleCheck, excluded: X, previous: ArrowLeft, next: ArrowRight, down: ArrowDown, expand: Plus, collapse: Minus, calendar: CalendarDays };
export type IconName = keyof typeof icons;
export default function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const Glyph = icons[name];
  return <Glyph className={`study-icon ${className}`} width={size} height={size} strokeWidth={2} aria-hidden="true" focusable="false" />;
}
