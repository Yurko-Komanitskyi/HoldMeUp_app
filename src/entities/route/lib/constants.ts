export const GRADES = [
  '4', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
] as const;

export interface RouteColorEntry {
  label: string;
  value: string;
  hex: string | null;
}

export const ROUTE_COLORS: RouteColorEntry[] = [
  { label: 'Кольоровий', value: 'multicolor', hex: null },
  { label: 'Червоний',   value: 'red',        hex: '#ef4444' },
  { label: 'Помаранч.',  value: 'orange',      hex: '#f97316' },
  { label: 'Жовтий',     value: 'yellow',      hex: '#eab308' },
  { label: 'Зелений',    value: 'green',       hex: '#22c55e' },
  { label: 'Синій',      value: 'blue',        hex: '#3b82f6' },
  { label: 'Фіолет.',    value: 'purple',      hex: '#a855f7' },
  { label: 'Рожевий',    value: 'pink',        hex: '#ec4899' },
  { label: 'Чорний',     value: 'black',       hex: '#1f2937' },
  { label: 'Білий',      value: 'white',       hex: '#f9fafb' },
  { label: 'Сірий',      value: 'grey',        hex: '#9ca3af' },
  { label: 'Бірюзов.',   value: 'teal',        hex: '#14b8a6' },
  { label: 'Коричн.',    value: 'brown',       hex: '#a16207' },
];

export interface HoldTypeEntry {
  value: string;
  label: string;
}

export const HOLD_TYPES: HoldTypeEntry[] = [
  { value: 'crimp',      label: 'Кримп'       },
  { value: 'sloper',     label: 'Слопер'      },
  { value: 'jug',        label: 'Джаг'        },
  { value: 'pinch',      label: 'Пінч'        },
  { value: 'pocket',     label: 'Покет'       },
  { value: 'volume',     label: "Об'єм"       },
  { value: 'undercling', label: 'Андерклінг'  },
  { value: 'sidepull',   label: 'Сайдпул'     },
];

export const STYLE_LABELS: Record<string, string> = {
  boulder:  'Болдер',
  lead:     'Лід',
  top_rope: 'Верхня',
  speed:    'Швидкість',
};

export const HOLD_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  HOLD_TYPES.map((h) => [h.value, h.label])
);
