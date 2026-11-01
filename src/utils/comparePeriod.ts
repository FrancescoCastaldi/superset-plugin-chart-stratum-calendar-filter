import { addDays, formatDateKey, parseDateValue } from './dateUtils';

/** How the comparison period is derived from the reference one */
export type ComparisonShift = 'previous_period' | 'previous_year';

export const COMPARISON_SHIFTS: readonly ComparisonShift[] = ['previous_period', 'previous_year'];

/** The same calendar day one year earlier; 29 February becomes 28 February */
function sameDayLastYear(dateKey: string): string {
  const d = parseDateValue(dateKey);
  if (!d) return dateKey;
  const shifted = new Date(d.getFullYear() - 1, d.getMonth(), d.getDate());
  // 29 February of a leap year rolls over to 1 March: step back to the end of February
  if (shifted.getMonth() !== d.getMonth()) return formatDateKey(new Date(d.getFullYear() - 1, d.getMonth() + 1, 0));
  return formatDateKey(shifted);
}

/**
 * Comparison days for a set of reference days.
 *
 * - `previous_period`: the days right before, as many as the reference spans (1-31 Mar becomes
 *   29 Jan-28 Feb, 1 week becomes the week before). Scattered days keep their pattern.
 * - `previous_year`: the same days one year earlier.
 */
export function deriveComparison(dates: Iterable<string>, shift: ComparisonShift): string[] {
  const sorted = Array.from(new Set(dates)).sort();
  if (sorted.length === 0) return [];
  if (shift === 'previous_year') return sorted.map(sameDayLastYear);
  const first = parseDateValue(sorted[0]);
  const last = parseDateValue(sorted[sorted.length - 1]);
  if (!first || !last) return [];
  const spanDays = Math.round((Date.UTC(last.getFullYear(), last.getMonth(), last.getDate()) - Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())) / 86400000) + 1;
  return sorted.map(d => addDays(d, -spanDays));
}
