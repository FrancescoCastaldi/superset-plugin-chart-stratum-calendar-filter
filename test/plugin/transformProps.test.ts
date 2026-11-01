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
import { ChartProps, supersetTheme } from '@superset-ui/core';
import transformProps from '../../src/plugin/transformProps';

describe('SupersetPluginChartCalendarFilter transformProps', () => {
  const formData = {
    colorScheme: 'supersetColors',
    datasource: '3__table',
    granularity_sqla: 'ds',
    groupby: ['ds'],
    metric: 'sum__num',
    showLegend: true,
    firstDayOfWeek: 1,
    showWeekNumbers: true,
    showYearDropdown: false,
    enableOverview: false,
    viz_type: 'calendar_filter',
  };
  const filterState = {
    value: null,
    selectedValues: null,
  };
  const setDataMask = jest.fn();
  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    theme: supersetTheme,
    queriesData: [{
      data: [
        { ds: '2024-01-01', sum__num: 10 },
        { ds: '2024-01-02', sum__num: 20 },
      ],
    }],
    hooks: { setDataMask },
    filterState,
  });

  it('should transform chart props for viz', () => {
    expect(transformProps(chartProps)).toEqual({
      width: 800,
      height: 600,
      formData,
      colorScheme: 'supersetColors',
      showLegend: true,
      firstDayOfWeek: 1,
      showWeekNumbers: true,
      showYearDropdown: false,
      enableOverview: false,
      cellDensity: 'compact',
      filterTypeMode: 'time_range',
      defaultValueMode: 'none',
      showMacroShortcuts: true,
      customDefaultStartDate: undefined,
      customDefaultEndDate: undefined,
      inValueFormat: 'date',
      locale: 'en',
      holidayMode: 'none',
      customHolidays: undefined,
      excludeHolidaysFromWorkdays: true,
      scaleType: 'linear',
      scaleThresholds: undefined,
      enabledPresets: ['last_7_days', 'last_30_days', 'last_month', 'year_to_date'],
      valueAggregation: 'sum',
      metricKey: 'sum__num',
      enableComparison: true,
      autoComparison: 'none',
      data: [
        { ds: '2024-01-01', sum__num: 10 },
        { ds: '2024-01-02', sum__num: 20 },
      ],
      setDataMask,
      filterState,
      dateColumn: 'ds',
    });
  });

  it('should use defaults when formData is partial', () => {
    const minimalFormData = {
      datasource: '3__table',
      granularity_sqla: 'ds',
      groupby: ['ds'],
      metric: 'sum__num',
      viz_type: 'calendar_filter',
    };
    const minimalProps = new ChartProps({
      formData: minimalFormData,
      width: 400,
      height: 300,
      theme: supersetTheme,
      queriesData: [{
        data: [{ ds: '2024-01-01', sum__num: 10 }],
      }],
      hooks: { setDataMask: jest.fn() },
      filterState: { value: null },
    });
    const result = transformProps(minimalProps);
    expect(result.firstDayOfWeek).toBe(0);
    expect(result.showWeekNumbers).toBe(false);
    expect(result.showYearDropdown).toBe(true);
    expect(result.enableOverview).toBe(true);
    expect(result.dateColumn).toBe('ds');
    expect(result.filterState).toEqual({ value: null });
    expect(typeof result.setDataMask).toBe('function');
  });

  it('should handle empty queriesData without crashing', () => {
    const emptyProps = new ChartProps({
      formData: {
        colorScheme: 'supersetColors',
        datasource: '3__table',
        granularity_sqla: 'ds',
        groupby: ['ds'],
        metric: 'sum__num',
        viz_type: 'calendar_filter',
      },
      width: 400,
      height: 300,
      theme: supersetTheme,
      queriesData: [],
    });
    const result = transformProps(emptyProps);
    expect(result.data).toEqual([]);
    expect(result.dateColumn).toBe('ds');
    expect(typeof result.setDataMask).toBe('function');
  });

  describe('filter target column', () => {
    const build = (options: Record<string, unknown>) =>
      transformProps(
        new ChartProps({
          formData: { viz_type: 'calendar_filter', ...options },
          width: 400,
          height: 300,
          theme: supersetTheme,
          queriesData: [{ data: [] }],
        } as any),
      );

    it('prefers the explicit column (camelCased, as Superset delivers formData)', () => {
      expect(build({ dateColumn: 'order_date', groupby: ['ds'] }).dateColumn).toBe('order_date');
    });

    it('accepts the raw snake_case option too', () => {
      expect(build({ date_column: 'created_at', groupby: ['ds'] }).dateColumn).toBe('created_at');
    });

    it('reads the column name of an adhoc groupby object', () => {
      expect(build({ groupby: [{ column_name: 'event_ts', label: 'Event time' }] }).dateColumn).toBe('event_ts');
    });

    it('falls back to the native filter target', () => {
      expect(build({ target: { column: { name: 'sale_day' } } }).dateColumn).toBe('sale_day');
    });

    it('has no hard-coded column when nothing identifies one', () => {
      expect(build({}).dateColumn).toBeUndefined();
    });

    it('takes the metric label from an adhoc metric', () => {
      expect(build({ groupby: ['ds'], metric: { label: 'SUM(amount)' } }).metricKey).toBe('SUM(amount)');
    });

    it('ignores unknown option values', () => {
      const result = build({ filter_type_mode: 'weird', scale_type: 'nope', locale: 'xx', holiday_mode: 'x' });
      expect(result.filterTypeMode).toBe('time_range');
      expect(result.scaleType).toBe('linear');
      expect(result.locale).toBe('en');
      expect(result.holidayMode).toBe('none');
    });
  });
});

describe('period options', () => {
  const build = (options: Record<string, unknown>) =>
    transformProps(
      new ChartProps({
        formData: { viz_type: 'calendar_filter', ...options },
        width: 400,
        height: 300,
        theme: supersetTheme,
        queriesData: [{ data: [] }],
      } as any),
    );

  it('enables the comparison period and leaves the labels empty by default', () => {
    const result = build({});
    expect(result.enableComparison).toBe(true);
    expect(result.referenceLabel).toBeUndefined();
    expect(result.comparisonLabel).toBeUndefined();
  });

  it('reads the labels camelCased or in snake case and trims them', () => {
    expect(build({ referenceLabel: ' This year ' }).referenceLabel).toBe('This year');
    expect(build({ comparison_label: 'Last year' }).comparisonLabel).toBe('Last year');
  });

  it('treats blank labels as not set', () => {
    const result = build({ referenceLabel: '   ', comparisonLabel: '' });
    expect(result.referenceLabel).toBeUndefined();
    expect(result.comparisonLabel).toBeUndefined();
  });

  it('turns the comparison period off only when explicitly disabled', () => {
    expect(build({ enableComparison: false }).enableComparison).toBe(false);
    expect(build({ enable_comparison: false }).enableComparison).toBe(false);
    expect(build({ enableComparison: null }).enableComparison).toBe(true);
  });
});

describe('auto comparison option', () => {
  const build = (options: Record<string, unknown>) =>
    transformProps(
      new ChartProps({
        formData: { viz_type: 'calendar_filter', ...options },
        width: 400,
        height: 300,
        theme: supersetTheme,
        queriesData: [{ data: [] }],
      } as any),
    );

  it('is off by default and ignores unknown values', () => {
    expect(build({}).autoComparison).toBe('none');
    expect(build({ autoComparison: 'weird' }).autoComparison).toBe('none');
  });

  it('reads the option camelCased or in snake case', () => {
    expect(build({ autoComparison: 'previous_year' }).autoComparison).toBe('previous_year');
    expect(build({ auto_comparison: 'previous_period' }).autoComparison).toBe('previous_period');
  });
});
