import type { CalendarLabels } from './labels';
import { formatDateRangeBadge } from './dateUtils';

/** The two periods the calendar manages: `T1` is the reference (current) one, `T2` the comparison one */
export type PeriodSlot = 'T1' | 'T2';

export const PERIOD_SLOTS: readonly PeriodSlot[] = ['T1', 'T2'];

/** Accent color of each period, used by badges, summary cards and selected days */
export const PERIOD_COLORS: Record<PeriodSlot, string> = {
  T1: '#0A224E',
  T2: '#E12B72',
};

export interface PeriodNames {
  T1: string;
  T2: string;
}

/**
 * Names shown for the two periods. A label typed in the control panel wins;
 * an empty one falls back to the translated default of the calendar language.
 */
export function resolvePeriodNames(
  custom: { referenceLabel?: string; comparisonLabel?: string },
  labels: CalendarLabels,
): PeriodNames {
  const pick = (value: string | undefined, fallback: string): string => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed || fallback;
  };
  return {
    T1: pick(custom.referenceLabel, labels.currentPeriod),
    T2: pick(custom.comparisonLabel, labels.comparisonPeriod),
  };
}

export interface PeriodSummaryText {
  /** Number of selected days */
  count: number;
  /** Range such as `1 Sep 2026 - 15 Sep 2026`, empty when nothing is selected */
  range: string;
  /** Range plus day count, or the "not set" text */
  text: string;
}

/** One-line description of the days selected for a period */
export function summarizePeriod(dates: Iterable<string>, labels: CalendarLabels): PeriodSummaryText {
  const sorted = Array.from(new Set(dates)).sort();
  if (sorted.length === 0) {
    return { count: 0, range: '', text: labels.periodNotSet };
  }
  const range = formatDateRangeBadge(sorted, labels);
  return { count: sorted.length, range, text: `${range} · ${labels.periodDays(sorted.length)}` };
}
