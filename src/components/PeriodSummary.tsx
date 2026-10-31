import React from 'react';
import {
  PeriodList,
  PeriodCard,
  PeriodSelectButton,
  PeriodName,
  PeriodRange,
  PeriodClearButton,
} from '../styles/CalendarFilter.styles';
import { useCalendarDisplay } from '../utils/labels';
import { PERIOD_SLOTS, summarizePeriod } from '../utils/periods';
import type { PeriodNames, PeriodSlot } from '../utils/periods';

interface PeriodSummaryProps {
  /** Names of the periods, already resolved from the control panel labels */
  names: PeriodNames;
  /** Days selected in each period */
  dates: Record<PeriodSlot, Set<string>>;
  /** Period that receives the next click on a day */
  activeSlot: PeriodSlot;
  /** Show the comparison period too; with `false` only the reference period is listed */
  comparisonEnabled: boolean;
  onSelect: (slot: PeriodSlot) => void;
  onClear: (slot: PeriodSlot) => void;
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
  comparisonEnabled,
  onSelect,
  onClear,
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
              <PeriodName $slot={slot}>{names[slot]}</PeriodName>
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
    </PeriodList>
  );
}
