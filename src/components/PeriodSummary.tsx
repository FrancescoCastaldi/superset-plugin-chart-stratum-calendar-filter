import React from 'react';
import {
  PeriodList,
  PeriodCard,
  PeriodSelectButton,
  PeriodName,
  PeriodRange,
  PeriodClearButton,
  QuickCompareRow,
  QuickCompareButton,
} from '../styles/CalendarFilter.styles';
import { useCalendarDisplay } from '../utils/labels';
import { PERIOD_SLOTS, summarizePeriod } from '../utils/periods';
import type { PeriodNames, PeriodSlot } from '../utils/periods';
import { COMPARISON_SHIFTS } from '../utils/comparePeriod';
import type { ComparisonShift } from '../utils/comparePeriod';

interface PeriodSummaryProps {
  /** Names of the periods, already resolved from the control panel labels */
  names: PeriodNames;
  /** Days selected in each period */
  dates: Record<PeriodSlot, Set<string>>;
  /** Period that receives the next click on a day */
  activeSlot: PeriodSlot;
  /** Periods none of whose days holds data, flagged with a warning */
  noData?: Partial<Record<PeriodSlot, boolean>>;
  /** Show the comparison period too; with `false` only the reference period is listed */
  comparisonEnabled: boolean;
  onSelect: (slot: PeriodSlot) => void;
  onClear: (slot: PeriodSlot) => void;
  /** Fill the comparison period from the reference one; the buttons show when this is given */
  onCompareWith?: (shift: ComparisonShift) => void;
  /** One card per row, for narrow areas such as the native filter bar */
  stacked?: boolean;
}

/**
 * Cards that name the reference and comparison periods, show the range each one covers and
 * tell which one the next click edits. Selecting a card makes it the active period.
 */
export default function PeriodSummary({
  names,
  dates,
  activeSlot,
  noData,
  comparisonEnabled,
  onSelect,
  onClear,
  onCompareWith,
  stacked = false,
}: PeriodSummaryProps) {
  const { labels } = useCalendarDisplay();
  const slots = comparisonEnabled ? PERIOD_SLOTS : PERIOD_SLOTS.slice(0, 1);

  return (
    <PeriodList $stacked={stacked} role="group" aria-label={labels.periodsGroup}>
      {slots.map(slot => {
        const summary = summarizePeriod(dates[slot], labels);
        const isActive = slot === activeSlot;
        return (
          <PeriodCard key={slot} $slot={slot} $active={isActive} $stacked={stacked} data-period={slot}>
            <PeriodSelectButton
              type="button"
              aria-pressed={isActive}
              title={labels.selectPeriod(names[slot])}
              onClick={() => onSelect(slot)}
            >
              <PeriodName $slot={slot} title={noData?.[slot] ? labels.periodNoDataTitle : undefined}>
                {names[slot]}
                {noData?.[slot] ? ` · ⚠ ${labels.periodNoData}` : ''}
              </PeriodName>
              <PeriodRange $empty={summary.count === 0}>{summary.text}</PeriodRange>
            </PeriodSelectButton>
            {summary.count > 0 && (
              <PeriodClearButton
                type="button"
                aria-label={labels.clearPeriod(names[slot])}
                title={labels.clearPeriod(names[slot])}
                onClick={() => onClear(slot)}
              >
                ✕
              </PeriodClearButton>
            )}
          </PeriodCard>
        );
      })}
      {onCompareWith && comparisonEnabled && dates.T1.size > 0 && (
        <QuickCompareRow role="group" aria-label={labels.compareWith}>
          <span>{labels.compareWith}</span>
          {COMPARISON_SHIFTS.map(shift => (
            <QuickCompareButton key={shift} type="button" data-compare={shift} onClick={() => onCompareWith(shift)}>
              ↔ {shift === 'previous_period' ? labels.comparePrevious : labels.compareLastYear}
            </QuickCompareButton>
          ))}
        </QuickCompareRow>
      )}
    </PeriodList>
  );
}
