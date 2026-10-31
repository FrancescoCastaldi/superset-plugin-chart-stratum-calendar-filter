/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const MONTH_SHORT_NAMES = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giug',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic',
];

/** Parse a date value into a Date object. String YYYY-MM-DD is parsed as local midnight. */
export function parseDateValue(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val);
  const str = String(val);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const date = new Date(y, m, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a Date to YYYY-MM-DD */
export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get the first day of the month adjusted for firstDayOfWeek */
export function getFirstDayOfMonth(year: number, month: number, firstDayOfWeek: number): number {
  const raw = new Date(year, month - 1, 1).getDay();
  return (raw - firstDayOfWeek + 7) % 7;
}

/** Get the number of days in a month */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** ISO 8601 week number */
export function getISOWeekNumber(d: Date): number {
  const temp = new Date(d.valueOf());
  const dayNum = (d.getDay() + 6) % 7;
  temp.setDate(temp.getDate() - dayNum + 3);
  const firstThursday = temp.valueOf();
  temp.setMonth(0, 1);
  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - temp.valueOf()) / 604800000);
}

/** Format year/month/day numbers to a YYYY-MM-DD date key */
export function formatDateParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** All date keys (YYYY-MM-DD) in a month, from the 1st to the last day */
export function getDatesInMonth(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  const dates: string[] = [];
  for (let d = 1; d <= days; d++) {
    dates.push(formatDateParts(year, month, d));
  }
  return dates;
}

/** All date keys (YYYY-MM-DD) in a year, from Jan 1st to Dec 31st */
export function getDatesInYear(year: number): string[] {
  const dates: string[] = [];
  for (let m = 1; m <= 12; m++) {
    dates.push(...getDatesInMonth(year, m));
  }
  return dates;
}

/** Check if two dates represent the same year, month, and day */
/** Texts and locale the range badge needs; English when omitted */
export interface BadgeLabels {
  intlLocale: string;
  selectedOne: string;
  selectedMany: (n: number) => string;
}

const ITALIAN_BADGE: BadgeLabels = {
  intlLocale: 'it-IT',
  selectedOne: '1 selezionato',
  selectedMany: n => `${n} selezionati`,
};

/** Format selected date keys into a readable badge string (e.g. "12-15 Mar 2026" or "3 selezionati") */
export function formatDateRangeBadge(dates: string[], labels: BadgeLabels = ITALIAN_BADGE): string {
  if (dates.length === 0) return '';
  const monthShort = (d: Date): string =>
    labels.intlLocale.startsWith('it')
      ? MONTH_SHORT_NAMES[d.getMonth()]
      : d.toLocaleDateString(labels.intlLocale, { month: 'short' });

  if (dates.length === 1) {
    const d = parseDateValue(dates[0]);
    if (!d) return labels.selectedOne;
    return d.toLocaleDateString(labels.intlLocale, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const sorted = [...dates].sort();
  const first = parseDateValue(sorted[0]);
  const last = parseDateValue(sorted[sorted.length - 1]);

  if (!first || !last) return labels.selectedMany(dates.length);

  // Check if contiguous
  const isContiguous = sorted.every((dateStr, idx) => {
    if (idx === 0) return true;
    const prev = parseDateValue(sorted[idx - 1]);
    const curr = parseDateValue(dateStr);
    if (!prev || !curr) return false;
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
    return Math.round(diff) === 1;
  });

  if (isContiguous) {
    if (
      first.getFullYear() === last.getFullYear() &&
      first.getMonth() === last.getMonth()
    ) {
      return `${first.getDate()}-${last.getDate()} ${monthShort(first)} ${first.getFullYear()}`;
    }
    if (first.getFullYear() === last.getFullYear()) {
      return `${first.getDate()} ${monthShort(first)} - ${last.getDate()} ${monthShort(last)} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${monthShort(first)} ${first.getFullYear()} - ${last.getDate()} ${monthShort(last)} ${last.getFullYear()}`;
  }

  return labels.selectedMany(dates.length);
}

/** Get all dates between two dates (inclusive) */
export function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = parseDateValue(start);
  const endDate = parseDateValue(end);
  if (!current || !endDate) return dates;
  const step = current <= endDate ? 1 : -1;

  while (step > 0 ? current <= endDate : current >= endDate) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + step);
  }

  return dates;
}

/** Date key shifted by a number of days (negative goes back); DST-safe */
export function addDays(dateKey: string, days: number): string {
  const d = parseDateValue(dateKey);
  if (!d) return dateKey;
  const shifted = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  return formatDateKey(shifted);
}

/** The 7 date keys of the week containing `dateKey`, starting on `firstDayOfWeek` (0 = Sunday) */
export function getWeekDates(dateKey: string, firstDayOfWeek: number): string[] {
  const d = parseDateValue(dateKey);
  if (!d) return [];
  const offset = (d.getDay() - firstDayOfWeek + 7) % 7;
  const start = addDays(dateKey, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** True when sorted date keys cover every day between the first and the last */
export function isContiguousSelection(sortedKeys: string[]): boolean {
  if (sortedKeys.length < 2) return true;
  return sortedKeys.every((key, i) => i === 0 || addDays(sortedKeys[i - 1], 1) === key);
}

/** Midnight UTC of a date key, in epoch milliseconds (null when the key is invalid) */
export function dateKeyToEpochMs(dateKey: string): number | null {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return Date.UTC(+match[1], +match[2] - 1, +match[3]);
}
