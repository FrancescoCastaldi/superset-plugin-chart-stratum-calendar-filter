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
import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';
import { normalizePresets } from '../utils/presets';
import type { CalendarLocale, ValueAggregation } from '../types';
import type { FilterTypeMode, InValueFormat } from '../utils/filterMask';
import type { HolidayMode } from '../utils/holidays';
import type { ScaleType } from '../utils/colorScale';

type AnyRecord = Record<string, any>;

/** Name of a column or metric given as a plain string or as an adhoc object */
function nameOf(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined;
  if (value && typeof value === 'object') {
    const v = value as AnyRecord;
    return v.column_name ?? v.columnName ?? v.label ?? v.metric_name ?? v.metricName ?? undefined;
  }
  return undefined;
}

/** Free text typed in the control panel, `undefined` when empty so the translated default applies */
function textOption(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData } = chartProps;
  const rawFormData: AnyRecord = (chartProps as any).rawFormData ?? {};

  // Superset camel-cases `formData` but keeps `rawFormData` as typed in the control panel:
  // accept both so the options work wherever the chart runs (Explore, dashboard, native filter).
  const option = (camel: string, snake: string): any =>
    (formData as AnyRecord)[camel] ?? (formData as AnyRecord)[snake] ?? rawFormData[snake];

  const colorScheme = option('colorScheme', 'color_scheme');
  const showLegend = option('showLegend', 'show_legend');
  const firstDayOfWeek = option('firstDayOfWeek', 'first_day_of_week') ?? 0;
  const showWeekNumbers = option('showWeekNumbers', 'show_week_numbers') ?? false;
  const showYearDropdown = option('showYearDropdown', 'show_year_dropdown') ?? true;
  const enableOverview = option('enableOverview', 'enable_overview') ?? true;
  const cellDensity = option('cellDensity', 'cell_density') ?? 'compact';
  const defaultValueMode = option('defaultValueMode', 'default_value_mode') ?? 'none';
  const showMacroShortcuts = option('showMacroShortcuts', 'show_macro_shortcuts') ?? true;
  const customDefaultStartDate = option('customDefaultStartDate', 'custom_default_start_date');
  const customDefaultEndDate = option('customDefaultEndDate', 'custom_default_end_date');

  const filterTypeMode: FilterTypeMode = oneOf(
    option('filterTypeMode', 'filter_type_mode'),
    ['time_range', 'in_clause', 'auto'] as const,
    'time_range',
  );
  const inValueFormat: InValueFormat = oneOf(
    option('inValueFormat', 'in_value_format'),
    ['date', 'datetime', 'epoch_ms'] as const,
    'date',
  );
  const locale: CalendarLocale = oneOf(option('locale', 'locale'), ['it', 'en', 'auto'] as const, 'en');
  const holidayMode: HolidayMode = oneOf(
    option('holidayMode', 'holiday_mode'),
    ['none', 'it', 'custom'] as const,
    'none',
  );
  const scaleType: ScaleType = oneOf(
    option('scaleType', 'scale_type'),
    ['linear', 'log', 'sqrt', 'steps'] as const,
    'linear',
  );
  const valueAggregation: ValueAggregation = oneOf(
    option('valueAggregation', 'value_aggregation'),
    ['sum', 'avg', 'max', 'min', 'count'] as const,
    'sum',
  );

  const { hooks, filterState } = chartProps;
  const { setDataMask = () => {} } = hooks || {};
  const data = (queriesData[0]?.data ?? []) as TimeseriesDataRecord[];

  // Column the emitted filter targets, most specific first: the explicit option,
  // the heatmap column, then the column a native filter is bound to.
  // There is deliberately no hard-coded default: without a column no filter is emitted.
  const groupByDateColumn = nameOf(
    Array.isArray(formData.groupby) ? formData.groupby[0] : formData.groupby,
  );
  const nativeFilterColumn =
    (formData as AnyRecord).target?.column?.name ??
    (formData as AnyRecord).targets?.[0]?.column?.name ??
    rawFormData.target?.column?.name ??
    rawFormData.targets?.[0]?.column?.name;
  const dateColumn: string | undefined =
    nameOf(option('dateColumn', 'date_column')) ?? groupByDateColumn ?? nativeFilterColumn;

  return {
    width,
    height,
    formData,
    data,
    colorScheme,
    showLegend,
    firstDayOfWeek: parseInt(firstDayOfWeek as string, 10),
    showWeekNumbers: showWeekNumbers === true,
    showYearDropdown: showYearDropdown !== false,
    enableOverview: enableOverview !== false,
    cellDensity,
    filterTypeMode,
    inValueFormat,
    defaultValueMode,
    showMacroShortcuts: showMacroShortcuts !== false,
    customDefaultStartDate,
    customDefaultEndDate,
    locale,
    holidayMode,
    customHolidays: option('customHolidays', 'custom_holidays'),
    excludeHolidaysFromWorkdays: option('excludeHolidaysFromWorkdays', 'exclude_holidays_from_workdays') !== false,
    scaleType,
    scaleThresholds: option('scaleThresholds', 'scale_thresholds'),
    enabledPresets: normalizePresets(option('enabledPresets', 'enabled_presets')),
    valueAggregation,
    metricKey: nameOf(option('metric', 'metric')),
    referenceLabel: textOption(option('referenceLabel', 'reference_label')),
    comparisonLabel: textOption(option('comparisonLabel', 'comparison_label')),
    enableComparison: option('enableComparison', 'enable_comparison') !== false,
    setDataMask,
    filterState,
    dateColumn,
  };
}
