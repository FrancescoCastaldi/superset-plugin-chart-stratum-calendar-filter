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
import React, { useEffect } from 'react';
import {
  NavButton,
  TodayButton,
  YearSelect,
  MonthSelect,
  ViewToggleButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
} from '../styles/CalendarFilter.styles';
import { CalendarDay } from '../types';
import MacroShortcuts from './MacroShortcuts';
import MonthGrid from './MonthGrid';
import YearOverview from './YearOverview';
import { useCalendarDisplay } from '../utils/labels';
import type { PresetId } from '../utils/presets';

interface WeekRowCells {
  weekNumber: number;
  cells: (CalendarDay | null)[];
}

interface OverviewMonth {
  month: number;
  label: string;
  cells: (CalendarDay | null)[];
  weekRows: WeekRowCells[];
}

interface CalendarModalProps {
  viewMode: 'month' | 'year';
  viewYear: number;
  viewMonth: number;
  monthLabel: string;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  enableOverview: boolean;
  showYearDropdown: boolean;
  showMacroShortcuts: boolean;
  showWeekNumbers: boolean;
  availableYears: number[];
  monthOptions: { value: number; label: string }[];
  dayLabels: string[];
  calendarCells: (CalendarDay | null)[];
  weekRows: WeekRowCells[];
  yearOverviewMonths: OverviewMonth[];
  cellHeight: number;
  baseColor: string;
  intensityScale: (val: number | null) => number;
  selectedDates: Set<string>;
  selectedDatesT1?: Set<string>;
  selectedDatesT2?: Set<string>;
  todayStr: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onMonthSelect: (month: number) => void;
  onYearSelect: (year: number) => void;
  onToggleView: () => void;
  onToday: () => void;
  onDayClick: (date: string) => void;
  onDayHover?: (cell: CalendarDay, event: React.MouseEvent) => void;
  onDayLeave?: () => void;
  onDayMouseDown?: (date: string) => void;
  onDayMouseUp?: () => void;
  onDayDragEnter?: (date: string) => void;
  onSelectYear: () => void;
  onSelectCurrentMonth: () => void;
  onSelectQuarter: (quarter: 1 | 2 | 3 | 4) => void;
  onSelectWeekdays: () => void;
  onClear: () => void;
  presets?: PresetId[];
  onSelectPreset?: (preset: PresetId) => void;
  /** Color legend shown under the calendar */
  legend?: React.ReactNode;
  /** Enable keyboard access + drag-to-select inside the modal */
  interactive?: boolean;
  /** Cards of the reference and comparison periods, shown under the header */
  periods?: React.ReactNode;
}

/** Expandable modal popover with header navigation, macro shortcuts and calendar body */
export default function CalendarModal({
  viewMode,
  viewYear,
  viewMonth,
  monthLabel,
  isPrevDisabled,
  isNextDisabled,
  enableOverview,
  showYearDropdown,
  showMacroShortcuts,
  showWeekNumbers,
  availableYears,
  monthOptions,
  dayLabels,
  calendarCells,
  weekRows,
  yearOverviewMonths,
  cellHeight,
  baseColor,
  intensityScale,
  selectedDates,
  selectedDatesT1,
  selectedDatesT2,
  todayStr,
  onClose,
  onPrev,
  onNext,
  onPrevYear,
  onNextYear,
  onMonthSelect,
  onYearSelect,
  onToggleView,
  onToday,
  onDayClick,
  onDayHover,
  onDayLeave,
  onDayMouseDown,
  onDayMouseUp,
  onDayDragEnter,
  onSelectYear,
  onSelectCurrentMonth,
  onSelectQuarter,
  onSelectWeekdays,
  onClear,
  presets,
  onSelectPreset,
  legend,
  interactive = false,
  periods,
}: CalendarModalProps) {
  const { labels } = useCalendarDisplay();

  // Escape closes the dialog, like any popover
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <ModalTitle>
              📅 {labels.calendarTitle}: {viewMode === 'year' ? `${labels.yearView} ${viewYear}` : `${labels.monthView} (${monthLabel})`}
            </ModalTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {viewMode === 'month' && (
                <NavButton
                  type="button"
                  onClick={onPrev}
                  disabled={isPrevDisabled}
                  title={labels.previousMonth}
                >◀</NavButton>
              )}
              {viewMode === 'year' && (
                <NavButton
                  type="button"
                  onClick={onPrevYear}
                  disabled={isPrevDisabled}
                  title={labels.previousYear}
                >◀</NavButton>
              )}
              {viewMode === 'month' && (
                <MonthSelect
                  value={viewMonth}
                  onChange={e => onMonthSelect(Number(e.target.value))}
                  aria-label={labels.selectMonth}
                >
                  {monthOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </MonthSelect>
              )}
              {showYearDropdown && (
                <YearSelect
                  value={viewYear}
                  onChange={e => onYearSelect(Number(e.target.value))}
                  aria-label={labels.selectYear}
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </YearSelect>
              )}
              {viewMode === 'month' && (
                <NavButton
                  type="button"
                  onClick={onNext}
                  disabled={isNextDisabled}
                  title={labels.nextMonth}
                >▶</NavButton>
              )}
              {viewMode === 'year' && (
                <NavButton
                  type="button"
                  onClick={onNextYear}
                  disabled={isNextDisabled}
                  title={labels.nextYear}
                >▶</NavButton>
              )}
              {enableOverview && (
                <ViewToggleButton
                  type="button"
                  onClick={onToggleView}
                >
                  {viewMode === 'month' ? labels.yearView : labels.monthView}
                </ViewToggleButton>
              )}
              <TodayButton type="button" onClick={onToday}>
                {labels.today}
              </TodayButton>
            </div>
          </div>
          <ModalCloseButton type="button" onClick={onClose}>
            {labels.close}
          </ModalCloseButton>
        </ModalHeader>
        {periods && <div style={{ padding: '10px 16px 0' }}>{periods}</div>}
        {showMacroShortcuts && (
          <MacroShortcuts
            viewYear={viewYear}
            selectedCount={selectedDates.size}
            onSelectYear={onSelectYear}
            onSelectCurrentMonth={onSelectCurrentMonth}
            onSelectQuarter={onSelectQuarter}
            onSelectWeekdays={onSelectWeekdays}
            onClear={onClear}
            presets={presets}
            onSelectPreset={onSelectPreset}
          />
        )}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'year' ? (
            <YearOverview
              months={yearOverviewMonths}
              dayLabels={dayLabels}
              gridWeekNumbers={showWeekNumbers}
              showWeekRows={false}
              baseColor={baseColor}
              intensityScale={intensityScale}
              selectedDates={selectedDates}
              selectedDatesT1={selectedDatesT1}
              selectedDatesT2={selectedDatesT2}
              todayStr={todayStr}
              keyPrefix="modal"
              style={{ flex: 1 }}
              onDayClick={onDayClick}
              onDayMouseDown={onDayMouseDown}
              onDayMouseUp={onDayMouseUp}
              onDayDragEnter={onDayDragEnter}
              interactive={interactive}
            />
          ) : (
            <MonthGrid
              cells={calendarCells}
              weekRows={weekRows}
              dayLabels={dayLabels}
              showWeekNumbers={showWeekNumbers}
              cellHeight={Math.max(cellHeight, 36)}
              baseColor={baseColor}
              intensityScale={intensityScale}
              selectedDates={selectedDates}
              selectedDatesT1={selectedDatesT1}
              selectedDatesT2={selectedDatesT2}
              todayStr={todayStr}
              keyPrefix="modal"
              style={{ flex: 1, minHeight: '340px' }}
              onDayClick={onDayClick}
              onDayHover={onDayHover}
              onDayLeave={onDayLeave}
              onDayMouseDown={onDayMouseDown}
              onDayMouseUp={onDayMouseUp}
              onDayDragEnter={onDayDragEnter}
              interactive={interactive}
            />
          )}
          {legend}
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}
