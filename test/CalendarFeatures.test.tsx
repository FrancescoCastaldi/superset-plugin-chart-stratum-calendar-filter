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
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CalendarFilter from '../src/CalendarFilter';

const setDataMask = jest.fn();

// The view opens on the month of the latest data point: April 2026
const baseProps = {
  locale: 'it',
  data: [
    { ds: '2026-04-01', metric: 10 },
    { ds: '2026-04-02', metric: 20 },
    { ds: '2026-04-15', metric: 30 },
  ],
  height: 700,
  width: 800,
  colorScheme: 'supersetColors' as const,
  showLegend: true,
  firstDayOfWeek: 1,
  showWeekNumbers: false,
  showYearDropdown: true,
  enableOverview: true,
  setDataMask,
  filterState: { value: null, selectedValues: null },
  dateColumn: 'ds',
  filterTypeMode: 'in_clause' as const,
};

const cell = (container: HTMLElement, date: string) =>
  container.querySelector(`[data-date="${date}"]`) as HTMLElement;

const lastMask = () => setDataMask.mock.calls[setDataMask.mock.calls.length - 1][0];

describe('CalendarFilter features', () => {
  beforeEach(() => setDataMask.mockClear());

  describe('heatmap', () => {
    it('shows the legend when there is data', () => {
      const { getByTestId } = render(<CalendarFilter {...baseProps} />);
      expect(getByTestId('heat-legend')).toBeTruthy();
    });

    it('hides the legend when switched off or without data', () => {
      expect(render(<CalendarFilter {...baseProps} showLegend={false} />).queryByTestId('heat-legend')).toBeNull();
      expect(render(<CalendarFilter {...baseProps} data={[]} />).queryByTestId('heat-legend')).toBeNull();
    });
  });

  describe('holidays', () => {
    it('names Italian holidays on the day cell', () => {
      const { container } = render(<CalendarFilter {...baseProps} holidayMode="it" />);
      expect(cell(container, '2026-04-25').getAttribute('aria-label')).toContain('Liberation Day');
      expect(cell(container, '2026-04-06').getAttribute('aria-label')).toContain('Easter Monday');
      expect(cell(container, '2026-04-14').getAttribute('aria-label')).toBe('2026-04-14');
    });

    it('marks nothing by default', () => {
      const { container } = render(<CalendarFilter {...baseProps} />);
      expect(cell(container, '2026-04-25').getAttribute('aria-label')).toBe('2026-04-25');
    });

    it('uses the custom list', () => {
      const { container } = render(
        <CalendarFilter {...baseProps} holidayMode="custom" customHolidays="04-10=Patron" />,
      );
      expect(cell(container, '2026-04-10').getAttribute('aria-label')).toContain('Patron');
    });

    it('working days skip weekends and holidays', () => {
      const { getByText } = render(<CalendarFilter {...baseProps} holidayMode="it" />);
      fireEvent.click(getByText(/Feriali/));
      const dates: string[] = lastMask().filterState.value;
      expect(dates).not.toContain('2026-04-06');
      expect(dates).not.toContain('2026-04-25');
      expect(dates).not.toContain('2026-04-04');
      expect(dates).toContain('2026-04-07');
      // April 2026 has 22 weekdays; Easter Monday (6th) is the only holiday on one, 25 April is a Saturday
      expect(dates).toHaveLength(21);
    });

    it('working days keep holidays when the option is off', () => {
      const { getByText } = render(
        <CalendarFilter {...baseProps} holidayMode="it" excludeHolidaysFromWorkdays={false} />,
      );
      fireEvent.click(getByText(/Feriali/));
      expect(lastMask().filterState.value).toContain('2026-04-06');
    });
  });

  describe('week and month selection', () => {
    it('selects a whole week from its number', () => {
      const { container } = render(<CalendarFilter {...baseProps} showWeekNumbers />);
      const weekCell = container.querySelector('[title^="Seleziona la settimana"]') as HTMLElement;
      fireEvent.click(weekCell);
      expect(lastMask().filterState.value).toHaveLength(7);
    });

    it('selects the week containing the number clicked, starting on the configured day', () => {
      const { container } = render(<CalendarFilter {...baseProps} showWeekNumbers />);
      const weekCell = container.querySelector('[title="Seleziona la settimana 16"]') as HTMLElement;
      fireEvent.click(weekCell);
      expect(lastMask().filterState.value).toEqual([
        '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-18', '2026-04-19',
      ]);
    });

    it('selects a month from its title in the year overview', () => {
      const { getByText, container } = render(<CalendarFilter {...baseProps} />);
      fireEvent.click(getByText('Anno'));
      const march = container.querySelector('[title="Seleziona mar"]') as HTMLElement;
      fireEvent.click(march);
      const dates: string[] = lastMask().filterState.value;
      expect(dates).toHaveLength(31);
      expect(dates[0]).toBe('2026-03-01');
    });
  });

  describe('relative date shortcuts', () => {
    afterEach(() => jest.useRealTimers());

    it('shows only the enabled shortcuts', () => {
      const { queryByText } = render(
        <CalendarFilter {...baseProps} enabledPresets={['last_30_days', 'last_year']} />,
      );
      expect(queryByText(/Ultimi 30 giorni/)).toBeTruthy();
      expect(queryByText(/Anno scorso/)).toBeTruthy();
      expect(queryByText(/Ultimi 7 giorni/)).toBeNull();
    });

    it('selects the last 30 days up to today', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2026, 3, 15, 12));
      const { getByText } = render(<CalendarFilter {...baseProps} enabledPresets={['last_30_days']} />);
      fireEvent.click(getByText(/Ultimi 30 giorni/));
      const dates: string[] = lastMask().filterState.value;
      expect(dates).toHaveLength(30);
      expect(dates[0]).toBe('2026-03-17');
      expect(dates[29]).toBe('2026-04-15');
    });

    it('applies a relative default on first render', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2026, 3, 15, 12));
      render(<CalendarFilter {...baseProps} defaultValueMode="last_7_days" />);
      expect(lastMask().filterState.value).toHaveLength(7);
    });
  });

  describe('filter target column', () => {
    it('warns and emits no filter when no column is known', () => {
      const { getByRole, getAllByText } = render(<CalendarFilter {...baseProps} dateColumn={undefined} />);
      expect(getByRole('status').textContent).toMatch(/colonna data/);
      fireEvent.click(getAllByText('15')[0]);
      expect(lastMask().extraFormData).toEqual({ filters: [] });
    });

    it('uses any column name for the emitted filter', () => {
      const { container } = render(<CalendarFilter {...baseProps} dateColumn="DATA_EROGAZIONE" />);
      fireEvent.click(cell(container, '2026-04-15'));
      expect(lastMask().extraFormData.filters[0].col).toBe('DATA_EROGAZIONE');
    });

    it('formats list values for the column type', () => {
      const { container } = render(<CalendarFilter {...baseProps} inValueFormat="datetime" />);
      fireEvent.click(cell(container, '2026-04-15'));
      expect(lastMask().extraFormData.filters[0].val).toEqual(['2026-04-15 00:00:00']);
    });
  });

  describe('language', () => {
    it('speaks English on request', () => {
      const { getByText, queryByText, getByLabelText } = render(
        <CalendarFilter {...baseProps} locale="en" holidayMode="it" />,
      );
      expect(getByText('Today')).toBeTruthy();
      expect(getByLabelText('Select month')).toBeTruthy();
      expect(queryByText('Oggi')).toBeNull();
      expect(getByText(/April 2026/)).toBeTruthy();
    });

    it('starts the weekday header on the configured day', () => {
      const monday = render(<CalendarFilter {...baseProps} firstDayOfWeek={1} />);
      expect(monday.getAllByText('Lun').length).toBeGreaterThan(0);
      const sunday = render(<CalendarFilter {...baseProps} firstDayOfWeek={0} />);
      expect(sunday.getAllByText('Dom').length).toBeGreaterThan(0);
    });
  });

  describe('drag selection', () => {
    it('selects the dragged range once, in the full chart view', () => {
      const { container } = render(<CalendarFilter {...baseProps} filterTypeMode="time_range" />);
      fireEvent.mouseDown(cell(container, '2026-04-08'));
      fireEvent.mouseEnter(cell(container, '2026-04-10'));
      fireEvent.mouseUp(cell(container, '2026-04-10'));
      fireEvent.mouseUp(window);
      expect(setDataMask).toHaveBeenCalledTimes(1);
      expect(lastMask().extraFormData.time_range).toBe('2026-04-08 : 2026-04-11');
    });

    it('ends the drag when the button is released outside the calendar', () => {
      const { container } = render(<CalendarFilter {...baseProps} filterTypeMode="time_range" />);
      fireEvent.mouseDown(cell(container, '2026-04-08'));
      fireEvent.mouseEnter(cell(container, '2026-04-09'));
      fireEvent.mouseUp(window);
      expect(setDataMask).toHaveBeenCalledTimes(1);
      expect(lastMask().extraFormData.time_range).toBe('2026-04-08 : 2026-04-10');
    });
  });

  describe('keyboard', () => {
    it('selects the focused day with Enter and Space', () => {
      const { container } = render(<CalendarFilter {...baseProps} />);
      fireEvent.keyDown(cell(container, '2026-04-10'), { key: 'Enter' });
      expect(lastMask().filterState.value).toEqual(['2026-04-10']);
      setDataMask.mockClear();
      fireEvent.keyDown(cell(container, '2026-04-11'), { key: ' ' });
      expect(lastMask().filterState.value).toEqual(['2026-04-11']);
    });

    it('moves the focus with the arrow keys', () => {
      const { container } = render(<CalendarFilter {...baseProps} />);
      const start = cell(container, '2026-04-10');
      start.focus();
      fireEvent.keyDown(start, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(cell(container, '2026-04-11'));
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(cell(container, '2026-04-18'));
    });

    it('has a single tab stop in the grid', () => {
      const { container } = render(<CalendarFilter {...baseProps} />);
      const stops = container.querySelectorAll('[data-date][tabindex="0"]');
      expect(stops).toHaveLength(1);
    });

    it('exposes the selection state', () => {
      const { container } = render(
        <CalendarFilter {...baseProps} filterState={{ value: ['2026-04-10'], selectedValues: { '2026-04-10': '2026-04-10' } }} />,
      );
      expect(cell(container, '2026-04-10').getAttribute('aria-pressed')).toBe('true');
      expect(cell(container, '2026-04-11').getAttribute('aria-pressed')).toBe('false');
    });
  });
});
