import { addDays, formatDateParts } from './dateUtils';

export type HolidayMode = 'none' | 'it' | 'custom';

/** Easter Sunday (Gregorian calendar, anonymous algorithm) as a YYYY-MM-DD key */
export function getEasterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return formatDateParts(year, month, day);
}

/** Italian national holidays of a year (date key -> name), Easter and Easter Monday included */
export function getItalianHolidays(year: number): Map<string, string> {
  const easter = getEasterSunday(year);
  const fixed: [number, number, string][] = [
    [1, 1, "New Year's Day"],
    [1, 6, 'Epiphany'],
    [4, 25, "Liberation Day"],
    [5, 1, "Labour Day"],
    [6, 2, "Republic Day"],
    [8, 15, 'Assumption Day'],
    [11, 1, "All Saints' Day"],
    [12, 8, 'Immaculate Conception'],
    [12, 25, 'Christmas Day'],
    [12, 26, "St. Stephen's Day"],
  ];
  const map = new Map<string, string>();
  fixed.forEach(([m, d, name]) => map.set(formatDateParts(year, m, d), name));
  map.set(easter, 'Easter Sunday');
  map.set(addDays(easter, 1), 'Easter Monday');
  return map;
}

export interface CustomHolidays {
  /** Recurring every year, keyed MM-DD */
  recurring: Map<string, string>;
  /** One-off dates, keyed YYYY-MM-DD */
  dated: Map<string, string>;
}

/**
 * Parse a free-text holiday list. Entries are separated by comma, semicolon
 * or newline; each is `YYYY-MM-DD` (one-off) or `MM-DD` (every year), with an
 * optional `=Name` suffix. Invalid entries are ignored.
 */
export function parseCustomHolidays(text: string | undefined | null): CustomHolidays {
  const recurring = new Map<string, string>();
  const dated = new Map<string, string>();
  if (!text) return { recurring, dated };

  text.split(/[,;\n]+/).forEach(raw => {
    const entry = raw.trim();
    if (!entry) return;
    const [datePart, ...nameParts] = entry.split('=');
    const dateText = datePart.trim();
    const name = nameParts.join('=').trim() || 'Festivo';

    const full = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (full && isRealDate(+full[1], +full[2], +full[3])) {
      dated.set(dateText, name);
      return;
    }
    const short = dateText.match(/^(\d{2})-(\d{2})$/);
    // 2024 is a leap year, so 02-29 is accepted as a recurring entry
    if (short && isRealDate(2024, +short[1], +short[2])) {
      recurring.set(dateText, name);
    }
  });
  return { recurring, dated };
}

function isRealDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/** Holidays (date key -> name) for the given years according to the selected mode */
export function buildHolidayMap(
  mode: HolidayMode,
  customText: string | undefined | null,
  years: number[],
): Map<string, string> {
  const result = new Map<string, string>();
  if (mode === 'none') return result;

  const custom = parseCustomHolidays(customText);
  years.forEach(year => {
    if (mode === 'it') {
      getItalianHolidays(year).forEach((name, key) => result.set(key, name));
    }
    custom.recurring.forEach((name, mmdd) => {
      const [m, d] = mmdd.split('-').map(Number);
      if (isRealDate(year, m, d)) result.set(formatDateParts(year, m, d), name);
    });
  });
  custom.dated.forEach((name, key) => result.set(key, name));
  return result;
}
