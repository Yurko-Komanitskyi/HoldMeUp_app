import type { AscentFeedLocalizedField } from '../model/ascent';

export function pickLocalizedString(
  field: AscentFeedLocalizedField | undefined,
  locale: string
): string | null {
  if (field == null) return null;
  if (typeof field === 'string') {
    const s = field.trim();
    return s || null;
  }
  const short = locale.split('-')[0] ?? 'uk';
  return (
    field[locale] ??
    field[short] ??
    field.uk ??
    field.en ??
    Object.values(field).find((v) => typeof v === 'string' && v.trim()) ??
    null
  );
}
