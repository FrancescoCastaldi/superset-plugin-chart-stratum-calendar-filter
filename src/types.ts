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
import {
  QueryFormData,
  TimeseriesDataRecord,
  SetDataMaskHook,
  DataMask,
} from '@superset-ui/core';
import type { FilterTypeMode, InValueFormat } from './utils/filterMask';
import type { HolidayMode } from './utils/holidays';
import type { PresetId } from './utils/presets';
import type { ScaleType } from './utils/colorScale';

export interface CalendarFilterStylesProps {
  height: number;
  width: number;
}

export type { FilterTypeMode, InValueFormat } from './utils/filterMask';
export type DefaultValueMode = 'none' | 'today' | 'current_month' | 'current_year' | 'custom' | PresetId;
export type CalendarLocale = 'it' | 'en' | 'auto';
export type ValueAggregation = 'sum' | 'avg' | 'max' | 'min' | 'count';

interface CalendarFilterCustomizeProps {
  colorScheme: string;
  showLegend: boolean;
  firstDayOfWeek: number; // 0=Sunday, 1=Monday
  showWeekNumbers: boolean;
  showYearDropdown: boolean;
  enableOverview: boolean;
  cellDensity?: 'compact' | 'normal';
  filterTypeMode?: FilterTypeMode;
  defaultValueMode?: DefaultValueMode;
  showMacroShortcuts?: boolean;
  customDefaultStartDate?: string;
  customDefaultEndDate?: string;
  /** Format of the values of an `IN` filter, to match the column type */
  inValueFormat?: InValueFormat;
  locale?: CalendarLocale;
  holidayMode?: HolidayMode;
  /** Free-text holiday list: `YYYY-MM-DD` or `MM-DD`, optional `=Name` */
  customHolidays?: string;
  /** Skip holidays in the "working days" shortcut */
  excludeHolidaysFromWorkdays?: boolean;
  scaleType?: ScaleType;
  /** Comma separated thresholds, used by the `steps` scale */
  scaleThresholds?: string;
  /** Relative-date shortcuts to show, in order */
  enabledPresets?: PresetId[];
  /** How several rows of the same day are combined */
  valueAggregation?: ValueAggregation;
  /** Result column holding the metric (defaults to the first numeric column) */
  metricKey?: string;
  /** Name of the reference (current) period; empty uses the default of the calendar language */
  referenceLabel?: string;
  /** Name of the comparison period; empty uses the default of the calendar language */
  comparisonLabel?: string;
  /** Let users pick a second, comparison period and show the cards naming both periods (default true) */
  enableComparison?: boolean;
}

export type CalendarFilterQueryFormData = QueryFormData &
  CalendarFilterStylesProps &
  CalendarFilterCustomizeProps;

export type CalendarFilterProps = CalendarFilterStylesProps &
  CalendarFilterCustomizeProps & {
    data: TimeseriesDataRecord[];
    setDataMask?: SetDataMaskHook;
    filterState?: DataMask['filterState'];
    dateColumn?: string;
    formData?: QueryFormData;
  };

/** Calendar day data point */
export interface CalendarDay {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Raw metric value */
  value: number | null;
  /** Whether this day has data */
  hasData: boolean;
}

/** Tooltip data shown on hover */
export interface TooltipData {
  date: string;
  value: number | null;
  percentage: number;
  /** Holiday name when the day is a holiday */
  holiday?: string;
  x: number;
  y: number;
}
