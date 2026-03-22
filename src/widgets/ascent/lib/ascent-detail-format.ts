import type { TFunction } from 'i18next';

export function formatAscentDuration(seconds: number, t: TFunction): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0
    ? `${m}${t('common.minuteAbbr')} ${s}${t('common.secondAbbr')}`
    : `${s}${t('common.secondAbbr')}`;
}

export function formatAscentDate(iso: string, locale: string): string {
  const loc = locale === 'ua' ? 'uk-UA' : 'en-US';
  return new Date(iso).toLocaleDateString(loc, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** День тижня + дата — для підзаголовка картки пролазу. */
export function formatAscentDateWithWeekday(iso: string, locale: string): string {
  const loc = locale === 'ua' ? 'uk-UA' : 'en-US';
  return new Date(iso).toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
