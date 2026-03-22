export const GRADES = [
  '4', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
] as const;

export interface RouteColorEntry {
  value: string;
  hex: string | null;
}

export const ROUTE_COLORS: RouteColorEntry[] = [
  { value: 'multicolor', hex: null },
  { value: 'red', hex: '#ef4444' },
  { value: 'orange', hex: '#f97316' },
  { value: 'yellow', hex: '#eab308' },
  { value: 'green', hex: '#22c55e' },
  { value: 'blue', hex: '#3b82f6' },
  { value: 'purple', hex: '#a855f7' },
  { value: 'pink', hex: '#ec4899' },
  { value: 'black', hex: '#1f2937' },
  { value: 'white', hex: '#f9fafb' },
  { value: 'grey', hex: '#9ca3af' },
  { value: 'teal', hex: '#14b8a6' },
  { value: 'brown', hex: '#a16207' },
];

export const HOLD_TYPE_VALUES = [
  'crimp',
  'sloper',
  'jug',
  'pinch',
  'pocket',
  'volume',
  'undercling',
  'sidepull',
] as const;

export type HoldTypeValue = (typeof HOLD_TYPE_VALUES)[number];

export interface HoldTypeEntry {
  value: HoldTypeValue;
}

export const HOLD_TYPES: HoldTypeEntry[] = HOLD_TYPE_VALUES.map((value) => ({ value }));
