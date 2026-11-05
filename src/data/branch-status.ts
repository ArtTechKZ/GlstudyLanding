import type { BranchStatus } from '../types';

// Public wording of each branch state. Launch dates are never invented.
export const BRANCH_STATUS_LABELS: Record<BranchStatus, string> = {
  active: 'Действующий офлайн-центр',
  online: 'Только онлайн',
  online_launch: 'Начинают работу в онлайн-формате',
  repair: 'Центр на ремонте',
  coming_soon: 'Скоро открытие',
};

/** City order of the supplied branch table, used for the grouped registry (the snapshot lists cities alphabetically). */
export const REGISTRY_CITY_ORDER = ['kostanay', 'rudny', 'astana', 'almaty', 'taraz', 'ekibastuz', 'ust-kamenogorsk', 'kokshetau', 'petropavlovsk'];

/** Order and headings of the grouped branch registry. */
export const BRANCH_GROUPS: { status: BranchStatus; heading: string }[] = [
  { status: 'active', heading: 'Действующие офлайн-центры' },
  { status: 'online', heading: 'Онлайн' },
  { status: 'online_launch', heading: 'Запуск онлайн' },
  { status: 'repair', heading: 'Ремонт' },
  { status: 'coming_soon', heading: 'Скоро открытие' },
];
