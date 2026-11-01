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
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import { Global } from '@emotion/react';
import {
  Styles, NativeFilterTriggerContainer, NativeFilterPillButton, CalendarHeader, HeaderLeft, HeaderCenter, HeaderRight,
  NavButton, TodayButton, MonthTitle, SelectionBadge, ClearButton, YearSelect, MonthSelect, ViewToggleButton, ConfigHint,
} from './styles/CalendarFilter.styles';
import CalendarModal from './components/CalendarModal';
import MacroShortcuts from './components/MacroShortcuts';
import CalendarTooltip from './components/CalendarTooltip';
import MonthGrid from './components/MonthGrid';
import YearOverview from './components/YearOverview';
import PeriodSummary from './components/PeriodSummary';
import HeatLegend from './components/HeatLegend';
import { useCalendarData } from './hooks/useCalendarData';
import { useSelectionMask } from './hooks/useSelectionMask';
import { useMacroActions } from './hooks/useMacroActions';
import { useCalendarTooltip } from './hooks/useCalendarTooltip';
import { useViewSelection } from './hooks/useViewSelection';

import {
  CalendarFilterProps,
  CalendarDay,
} from './types';
import {
  parseDateValue,
  formatDateKey,
  formatDateParts,
  getDaysInMonth,
  formatDateRangeBadge as formatSelectionRange,
} from './utils/dateUtils';
import { buildMonthCells, buildWeekRows } from './utils/calendarGrid';
import { buildHolidayMap } from './utils/holidays';
import {
  CalendarDisplay,
  CalendarDisplayContext,
  getLabels,
  getMonthName,
  getWeekdayLabels,
  resolveLocale,
} from './utils/labels';
import { DEFAULT_PRESETS } from './utils/presets';
import { resolvePeriodNames, summarizePeriod } from './utils/periods';
import type { PeriodSlot } from './utils/periods';



// Component

export default function CalendarFilter(props: CalendarFilterProps) {
  const {
    data,
    height,
    width,
    formData,
    colorScheme = 'supersetColors',
    showLegend = true,
    firstDayOfWeek = 0,
    showWeekNumbers = false,
    showYearDropdown = true,
    enableOverview = true,
    cellDensity = 'compact',
    filterTypeMode = 'in_clause',
    defaultValueMode = 'none',
    showMacroShortcuts = true,
    customDefaultStartDate,
    customDefaultEndDate,
    setDataMask,
    filterState,
    dateColumn,
    inValueFormat = 'date',
    locale = 'en',
    holidayMode = 'none',
    customHolidays,
    excludeHolidaysFromWorkdays = true,
    scaleType = 'linear',
    scaleThresholds,
    enabledPresets = DEFAULT_PRESETS,
    valueAggregation = 'sum',
    metricKey,
    referenceLabel,
    comparisonLabel,
    enableComparison = true,
    autoComparison = 'none',
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // Current view: defaults to today's month/year
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateKey(today), [today]);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const labels = useMemo(() => getLabels(locale), [locale]);
  const dayLabels = useMemo(() => getWeekdayLabels(labels, firstDayOfWeek), [labels, firstDayOfWeek]);

  const baseCellHeight = cellDensity === 'normal' ? 38 : 30;

  const {
    dataMap,
    minDateBound,
    maxDateBound,
    availableYears,
    intensityScale,
    baseColor,
    palette,
    heatStyle,
  } = useCalendarData(data, dateColumn, colorScheme, viewYear, today, {
    metricKey,
    aggregation: valueAggregation,
    scaleType,
    scaleThresholds,
  });

  // Holidays for every year the calendar can show
  const holidays = useMemo(
    () => buildHolidayMap(holidayMode, customHolidays, Array.from(new Set([...availableYears, viewYear]))),
    [holidayMode, customHolidays, availableYears, viewYear],
  );

  const periodNames = useMemo(
    () => resolvePeriodNames({ referenceLabel, comparisonLabel }, labels),
    [referenceLabel, comparisonLabel, labels],
  );

  // Short text for the applied filters list of the dashboard, instead of one entry per selected day
  const describeSelection = useCallback(
    (t1: string[], t2: string[]) => {
      const first = summarizePeriod(t1, labels);
      const second = summarizePeriod(t2, labels);
      const label = !enableComparison
        ? first.text
        : [
            t1.length > 0 ? `${periodNames.T1}: ${first.text}` : '',
            t2.length > 0 ? `${periodNames.T2}: ${second.text}` : '',
          ]
            .filter(Boolean)
            .join(' | ');
      return {
        label,
        // What charts show for the two periods: the names chosen here and the ranges in the calendar language
        custom: {
          version: 1,
          period_labels: { reference: periodNames.T1, comparison: periodNames.T2 },
          period_text: { reference: first.range, comparison: second.range },
          locale: resolveLocale(locale),
        },
      };
    },
    [labels, periodNames, enableComparison, locale],
  );

  const {
    selectedDates,
    selectedDatesT1,
    selectedDatesT2,
    activeSlot,
    setActiveSlot,
    emitSelection,
    clearSelection,
    clearSlot,
    compareWith,
    handleDayToggle,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  } = useSelectionMask(
    filterState,
    setDataMask,
    filterTypeMode,
    dateColumn,
    defaultValueMode,
    customDefaultStartDate,
    customDefaultEndDate,
    inValueFormat,
    enableComparison,
    describeSelection,
    autoComparison,
  );

  const periodDates = useMemo(
    () => ({ T1: selectedDatesT1, T2: selectedDatesT2 }),
    [selectedDatesT1, selectedDatesT2],
  );
  // A selected period none of whose days has data would silently show nothing in the charts
  const periodNoData = useMemo(() => {
    if (!dataMap.hasData) return {};
    const empty = (dates: Set<string>) => dates.size > 0 && !Array.from(dates).some(d => dataMap.map.has(d));
    return { T1: empty(selectedDatesT1), T2: empty(selectedDatesT2) };
  }, [dataMap, selectedDatesT1, selectedDatesT2]);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const renderPeriods = (stacked: boolean, afterSelect?: (slot: PeriodSlot) => void) => (
    <PeriodSummary
      names={periodNames}
      dates={periodDates}
      activeSlot={activeSlot}
      noData={periodNoData}
      comparisonEnabled={enableComparison}
      stacked={stacked}
      onSelect={slot => {
        setActiveSlot(slot);
        afterSelect?.(slot);
      }}
      onClear={clearSlot}
      // The narrow filter bar shows the quick buttons only until a comparison period exists
      onCompareWith={afterSelect && selectedDatesT2.size > 0 ? undefined : compareWith}
    />
  );

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && dataMap.maxDate) {
      const maxD = parseDateValue(dataMap.maxDate);
      if (maxD) {
        setViewYear(maxD.getFullYear());
        setViewMonth(maxD.getMonth() + 1);
      }
      hasInitialized.current = true;
    }
  }, [dataMap.maxDate]);

  // Macro filter actions (year / current month / quarter / weekdays),
  // dropdown-driven view selection and tooltip positioning live in
  // dedicated hooks: they all propagate through `emitSelection` (dataMask).
  const {
    selectEntireYear,
    selectCurrentMonth,
    selectQuarter,
    selectWeekdays,
    selectWeek,
    selectMonth,
    selectPreset,
  } = useMacroActions(viewYear, viewMonth, emitSelection, {
    skipDates: holidayMode !== 'none' && excludeHolidaysFromWorkdays ? holidays : undefined,
    firstDayOfWeek,
  });

  const {
    handleMonthSelectChange,
    handleYearSelectChange,
  } = useViewSelection(viewMode, viewYear, viewMonth, setViewYear, setViewMonth, emitSelection);

  const {
    tooltip,
    handleMouseEnter,
    handleMouseLeave,
  } = useCalendarTooltip(intensityScale, holidays);

  // Is prev/next disabled?
  const isPrevDisabled = useMemo(() => {
    if (!minDateBound) return false;
    if (viewMode === 'year') {
      return viewYear <= (parseDateValue(minDateBound)?.getFullYear() ?? viewYear);
    }
    const firstOfMonth = formatDateParts(viewYear, viewMonth, 1);
    return firstOfMonth <= minDateBound;
  }, [minDateBound, viewYear, viewMonth, viewMode]);

  const isNextDisabled = useMemo(() => {
    if (!maxDateBound) return false;
    if (viewMode === 'year') {
      return viewYear >= (parseDateValue(maxDateBound)?.getFullYear() ?? viewYear);
    }
    const lastOfMonth = formatDateParts(viewYear, viewMonth, getDaysInMonth(viewYear, viewMonth));
    return lastOfMonth >= maxDateBound;
  }, [maxDateBound, viewYear, viewMonth, viewMode]);

  // Generate calendar grid
  const calendarCells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, firstDayOfWeek, dataMap.map),
    [viewYear, viewMonth, dataMap, firstDayOfWeek],
  );

  // Build week rows for week numbers
  const weekRows = useMemo(() => {
    if (!showWeekNumbers) return [];
    return buildWeekRows(calendarCells);
  }, [calendarCells, showWeekNumbers]);



  // Navigation
  const goPrevMonth = useCallback(() => {
    if (viewMode === 'year') {
      setViewYear(y => y - 1);
      return;
    }
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }, [viewMonth, viewYear, viewMode]);

  const goNextMonth = useCallback(() => {
    if (viewMode === 'year') {
      setViewYear(y => y + 1);
      return;
    }
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }, [viewMonth, viewYear, viewMode]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth() + 1);
  }, []);

  // Toggle date selection
  

  

  // Month labels for dropdown
  const MONTH_LABELS = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(labels, i + 1) }));
  }, [labels]);

  // Month label
  const monthLabel = useMemo(() => {
    const date = new Date(viewYear, viewMonth - 1, 1);
    const raw = date.toLocaleDateString(labels.intlLocale, { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [viewYear, viewMonth, labels]);

  // Selection badge text
  const selectionBadgeText = useMemo(() => {
    const sorted = Array.from(selectedDates).sort();
    return formatSelectionRange(sorted, labels);
  }, [selectedDates, labels]);

  // Year Overview
  const yearOverviewMonths = useMemo(() => {
    const months: { month: number; label: string; cells: (CalendarDay | null)[]; weekRows: { weekNumber: number; cells: (CalendarDay | null)[] }[] }[] = [];

    for (let m = 1; m <= 12; m++) {
      const cells = buildMonthCells(viewYear, m, firstDayOfWeek, dataMap.map);
      const wRows = showWeekNumbers ? buildWeekRows(cells) : [];

      const label = new Date(viewYear, m - 1, 1).toLocaleDateString(labels.intlLocale, { month: 'short' });
      months.push({ month: m, label, cells, weekRows: wRows });
    }

    return months;
  }, [viewYear, dataMap, firstDayOfWeek, showWeekNumbers, labels]);

  

  const display = useMemo<CalendarDisplay>(
    () => ({ labels, holidays, heatStyle, onWeekSelect: selectWeek, onMonthSelect: selectMonth }),
    [labels, holidays, heatStyle, selectWeek, selectMonth],
  );
  const legend =
    showLegend && dataMap.hasData ? <HeatLegend palette={palette} min={dataMap.min} max={dataMap.max} /> : null;
  // Cells grow with the space the dashboard gives the chart (up to 56px) so tall charts are not left empty
  const cellHeight = useMemo(() => {
    if (!height || height <= 120) return baseCellHeight;
    const shortcuts = showMacroShortcuts ? (enabledPresets.length > 0 ? 84 : 48) : 0;
    const periodRow = enableComparison ? 52 : 0;
    const chrome = 56 + shortcuts + periodRow + (legend ? 38 : 0) + 36 + 20;
    const perRow = Math.floor((height - chrome) / 6) - 4;
    return Math.min(56, Math.max(baseCellHeight, perRow));
  }, [height, baseCellHeight, showMacroShortcuts, enableComparison, enabledPresets.length, legend]);
  const missingColumnHint = !dateColumn ? <ConfigHint role="status">{labels.noColumn}</ConfigHint> : null;

  const isCompactNativeFilter = Boolean(formData?.inView || (height && height <= 120));

  // Render for Compact Native Filter Bar
  if (isCompactNativeFilter) {
    const selectionText = selectedDates.size === 0
      ? labels.pickDates
      : selectionBadgeText
        ? `${labels.datesCount(selectedDates.size)} (${selectionBadgeText})`
        : labels.datesSelected(selectedDates.size);

    return (
      <CalendarDisplayContext.Provider value={display}>
      <Styles height={height} width={width} ref={containerRef} $compact>
        <Global styles={`
          [data-test="filterbar-action-buttons"] {
            pointer-events: none;
          }
          [data-test="filterbar-action-buttons"] button {
            pointer-events: auto;
          }
        `} />
        {missingColumnHint}
        <NativeFilterTriggerContainer>
          {enableComparison ? (
            renderPeriods(true, () => setIsModalOpen(true))
          ) : (
            <NativeFilterPillButton type="button" onClick={() => setIsModalOpen(true)}>
              <span>📅 {selectionText}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
            </NativeFilterPillButton>
          )}
        </NativeFilterTriggerContainer>

        {/* Expandable Modal Popover */}
        {isModalOpen && (
          <CalendarModal
            viewMode={viewMode}
            viewYear={viewYear}
            viewMonth={viewMonth}
            monthLabel={monthLabel}
            isPrevDisabled={isPrevDisabled}
            isNextDisabled={isNextDisabled}
            enableOverview={enableOverview}
            showYearDropdown={showYearDropdown}
            showMacroShortcuts={showMacroShortcuts}
            showWeekNumbers={showWeekNumbers}
            availableYears={availableYears}
            monthOptions={MONTH_LABELS}
            onMonthSelect={handleMonthSelectChange}
            onYearSelect={handleYearSelectChange}
            dayLabels={dayLabels}
            calendarCells={calendarCells}
            weekRows={weekRows}
            yearOverviewMonths={yearOverviewMonths}
            cellHeight={cellHeight}
            baseColor={baseColor}
            intensityScale={intensityScale}
            selectedDates={selectedDates}
            selectedDatesT1={selectedDatesT1}
            selectedDatesT2={selectedDatesT2}
            todayStr={todayStr}
            onClose={closeModal}
            periods={enableComparison ? renderPeriods(false) : null}
            onPrev={goPrevMonth}
            onNext={goNextMonth}
            onPrevYear={() => setViewYear(y => y - 1)}
            onNextYear={() => setViewYear(y => y + 1)}
            onToggleView={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            onToday={goToToday}
            onDayClick={handleDayToggle}
            onDayHover={handleMouseEnter}
            onDayLeave={handleMouseLeave}
            onDayMouseDown={handleDragStart}
            onDayMouseUp={handleDragEnd}
            onDayDragEnter={handleDragEnter}
            onSelectYear={selectEntireYear}
            onSelectCurrentMonth={selectCurrentMonth}
            onSelectQuarter={selectQuarter}
            onSelectWeekdays={selectWeekdays}
            onClear={clearSelection}
            presets={enabledPresets}
            onSelectPreset={selectPreset}
            legend={legend}
            interactive
          />
        )}
        {tooltip && (
          <CalendarTooltip tooltip={tooltip} maxValue={dataMap.max} />
        )}
      </Styles>
      </CalendarDisplayContext.Provider>
    );
  }

  // Render for full chart


  return (
    <CalendarDisplayContext.Provider value={display}>
    <Styles height={height} width={width} ref={containerRef}>
      {missingColumnHint}
      {/* Header */}
      <CalendarHeader>
        <HeaderLeft>
          <NavButton
            onClick={goPrevMonth}
            type="button"
            aria-label={labels.previous}
            disabled={isPrevDisabled}
            title={isPrevDisabled ? labels.noDataBefore : labels.previous}
          >
            ◀
          </NavButton>
          {viewMode === 'month' && (
            <MonthSelect
              value={viewMonth}
              onChange={e => handleMonthSelectChange(Number(e.target.value))}
              aria-label={labels.selectMonth}
            >
              {MONTH_LABELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </MonthSelect>
          )}
          {showYearDropdown && (
            <YearSelect
              value={viewYear}
              onChange={e => handleYearSelectChange(Number(e.target.value))}
              aria-label={labels.selectYear}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </YearSelect>
          )}
          {enableOverview && (
            <ViewToggleButton
              type="button"
              onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            >
              {viewMode === 'month' ? labels.year : labels.month}
            </ViewToggleButton>
          )}
        </HeaderLeft>

        <HeaderCenter>
          <MonthTitle>
            {viewMode === 'year' ? viewYear : monthLabel}
          </MonthTitle>
          {selectedDates.size > 0 && (
            <>
              {!enableComparison && (
                <SelectionBadge>
                  {selectedDates.size}{selectionBadgeText ? ` · ${selectionBadgeText}` : ''}
                </SelectionBadge>
              )}
              <ClearButton type="button" onClick={clearSelection}>
                {labels.clear}
              </ClearButton>
            </>
          )}
        </HeaderCenter>

        <HeaderRight>
          <ViewToggleButton type="button" onClick={() => setIsModalOpen(true)} title={labels.expandTitle}>
            {labels.expand}
          </ViewToggleButton>
          <TodayButton type="button" onClick={goToToday}>
            {labels.today}
          </TodayButton>
          <NavButton
            onClick={goNextMonth}
            type="button"
            aria-label={labels.next}
            disabled={isNextDisabled}
            title={isNextDisabled ? labels.noDataAfter : labels.next}
          >
            ▶
          </NavButton>
        </HeaderRight>
      </CalendarHeader>

      {/* Reference and comparison periods */}
      {enableComparison && (
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>{renderPeriods(false)}</div>
      )}

      {/* Macro Filter Shortcuts */}
      {showMacroShortcuts && (
        <MacroShortcuts
          viewYear={viewYear}
          selectedCount={selectedDates.size}
          onSelectYear={selectEntireYear}
          onSelectCurrentMonth={selectCurrentMonth}
          onSelectQuarter={selectQuarter}
          onSelectWeekdays={selectWeekdays}
          onClear={clearSelection}
          presets={enabledPresets}
          onSelectPreset={selectPreset}
        />
      )}

      {/* Calendar / Year Overview */}
      {viewMode === 'year' ? (
        <YearOverview
          months={yearOverviewMonths}
          dayLabels={dayLabels}
          gridWeekNumbers={showWeekNumbers}
          showWeekRows={showWeekNumbers}
          baseColor={baseColor}
          intensityScale={intensityScale}
          selectedDates={selectedDates}
          selectedDatesT1={selectedDatesT1}
          selectedDatesT2={selectedDatesT2}
          todayStr={todayStr}
          keyPrefix=""
          titleWithValue
          onDayClick={handleDayToggle}
          onDayMouseDown={handleDragStart}
          onDayMouseUp={handleDragEnd}
          onDayDragEnter={handleDragEnter}
        />
      ) : (
        <>
          <MonthGrid
            cells={calendarCells}
            weekRows={weekRows}
            dayLabels={dayLabels}
            showWeekNumbers={showWeekNumbers}
            cellHeight={cellHeight}
            baseColor={baseColor}
            intensityScale={intensityScale}
            selectedDates={selectedDates}
            selectedDatesT1={selectedDatesT1}
            selectedDatesT2={selectedDatesT2}
            todayStr={todayStr}
            keyPrefix=""
            onDayClick={handleDayToggle}
            onDayHover={handleMouseEnter}
            onDayLeave={handleMouseLeave}
            onDayMouseDown={handleDragStart}
            onDayMouseUp={handleDragEnd}
            onDayDragEnter={handleDragEnter}
          />
          {legend}

          {/* Tooltip */}
          {tooltip && (
            <CalendarTooltip tooltip={tooltip} maxValue={dataMap.max} formatNumbers />
          )}
        </>
      )}

      {/* Expandable Modal Popover */}
      {isModalOpen && (
        <CalendarModal
          viewMode={viewMode}
          viewYear={viewYear}
          viewMonth={viewMonth}
          monthLabel={monthLabel}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          enableOverview={enableOverview}
          showYearDropdown={showYearDropdown}
          showMacroShortcuts={showMacroShortcuts}
          showWeekNumbers={showWeekNumbers}
          availableYears={availableYears}
          monthOptions={MONTH_LABELS}
          onMonthSelect={handleMonthSelectChange}
          onYearSelect={handleYearSelectChange}
          dayLabels={dayLabels}
          calendarCells={calendarCells}
          weekRows={weekRows}
          yearOverviewMonths={yearOverviewMonths}
          cellHeight={cellHeight}
          baseColor={baseColor}
          intensityScale={intensityScale}
          selectedDates={selectedDates}
          selectedDatesT1={selectedDatesT1}
          selectedDatesT2={selectedDatesT2}
          todayStr={todayStr}
          onClose={closeModal}
          periods={enableComparison ? renderPeriods(false) : null}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
          onPrevYear={() => setViewYear(y => y - 1)}
          onNextYear={() => setViewYear(y => y + 1)}
          onToggleView={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
          onToday={goToToday}
          onDayClick={handleDayToggle}
          onDayHover={handleMouseEnter}
          onDayLeave={handleMouseLeave}
          onSelectYear={selectEntireYear}
          onSelectCurrentMonth={selectCurrentMonth}
          onSelectQuarter={selectQuarter}
          onSelectWeekdays={selectWeekdays}
          onClear={clearSelection}
          presets={enabledPresets}
          onSelectPreset={selectPreset}
          legend={legend}
        />
      )}
    </Styles>
    </CalendarDisplayContext.Provider>
  );
}
