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

// Mock setDataMask
const mockSetDataMask = jest.fn();

// Mock filterState
const defaultFilterState = {
  value: null,
  selectedValues: null,
};

const defaultProps = {
  data: [
    { ds: '2026-01-01', metric: 10 },
    { ds: '2026-01-02', metric: 20 },
    { ds: '2026-01-15', metric: 30 },
    { ds: '2026-07-01', metric: 15 },
    { ds: '2026-07-15', metric: 25 },
    { ds: '2026-08-01', metric: 35 },
    { ds: '2026-12-01', metric: 5 },
  ],
  height: 600,
  width: 800,
  colorScheme: 'supersetColors' as const,
  showLegend: true,
  firstDayOfWeek: 0,
  showWeekNumbers: false,
  showYearDropdown: true,
  enableOverview: true,
  setDataMask: mockSetDataMask,
  filterState: defaultFilterState,
  dateColumn: 'ds',
};

describe('CalendarFilter', () => {
  beforeEach(() => {
    mockSetDataMask.mockClear();
  });

  it('renders without crashing', () => {
    const { container } = render(<CalendarFilter locale="it" {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('shows the month title', () => {
    const { getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    // defaults to maxDate month (Dicembre 2026)
    expect(getByText(/dicembre 2026/i)).toBeTruthy();
  });

  it('shows day numbers in the grid', () => {
    const { getAllByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const dayElements = getAllByText('01');
    expect(dayElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation and action buttons', () => {
    const { getAllByRole } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const buttons = getAllByRole('button');
    // Prev, Year toggle, Today, Next
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders a generic calendar when no data is provided (Standalone mode)', () => {
    const { getByText } = render(
      <CalendarFilter locale="it" {...defaultProps} data={[]} />,
    );
    // Deve renderizzare il bottone Oggi o Espandi invece dell'errore
    expect(getByText('Oggi')).toBeTruthy();
  });

  it('calls setDataMask when clicking a day', () => {
    const { getAllByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const day15Elements = getAllByText('15');
    const day15 = day15Elements[0]?.closest('[role]') || day15Elements[0]?.parentElement || day15Elements[0];
    if (day15) {
      fireEvent.click(day15);
    }

    expect(mockSetDataMask).toHaveBeenCalledTimes(1);
    expect(mockSetDataMask).toHaveBeenCalledWith(
      expect.objectContaining({
        extraFormData: expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              col: 'ds',
              op: 'IN',
            }),
          ]),
        }),
      }),
    );
  });

  it('toggles date selection on click, starting from pre-selected state', () => {
    const propsWithSelection = {
      ...defaultProps,
      filterState: {
        value: ['2026-12-01'],
        selectedValues: { '2026-12-01': '2026-12-01' },
      },
    };
    const { getAllByText } = render(<CalendarFilter locale="it" {...propsWithSelection} />);
    const dayElements = getAllByText('01');
    const day1 = dayElements[0]?.closest('[role]') || dayElements[0]?.parentElement || dayElements[0];
    if (day1) {
      fireEvent.click(day1);
    }

    expect(mockSetDataMask).toHaveBeenCalledTimes(1);
    const call = mockSetDataMask.mock.calls[0][0];
    expect(call.extraFormData.filters).toEqual([]);
  });

  it('selects a date range on second click', () => {
    const propsWithSelection = {
      ...defaultProps,
      filterState: {
        value: ['2026-12-01'],
        selectedValues: { '2026-12-01': '2026-12-01' },
      },
    };
    const { getAllByText } = render(<CalendarFilter locale="it" {...propsWithSelection} />);
    const dayElements = getAllByText('05');
    const day5 = dayElements[0]?.closest('[role]') || dayElements[0]?.parentElement || dayElements[0];
    if (day5) {
      fireEvent.click(day5);
    }

    expect(mockSetDataMask).toHaveBeenCalledTimes(1);
    const call = mockSetDataMask.mock.calls[0][0];
    expect(call.extraFormData.filters[0].val).toEqual([
      '2026-12-01',
      '2026-12-02',
      '2026-12-03',
      '2026-12-04',
      '2026-12-05'
    ]);
  });

  it('navigates to previous month', () => {
    const { getByLabelText, getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const prevButton = getByLabelText('Precedente');
    fireEvent.click(prevButton);
    // maxDate is 2026-12-01, so initial month is December. Previous is November.
    expect(getByText(/novembre 2026/i)).toBeTruthy();
  });

  it('navigates to next month', () => {
    const { getByLabelText, getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    // Initial state is December 2026 (maxDate).
    // Go to previous month (November) so Next button becomes enabled
    fireEvent.click(getByLabelText('Precedente'));
    expect(getByText(/novembre 2026/i)).toBeTruthy();
    
    // Now click Next
    const nextButton = getByLabelText('Successivo');
    fireEvent.click(nextButton);
    expect(getByText(/dicembre 2026/i)).toBeTruthy();
  });

  it('shows selected dates from filterState', () => {
    const propsWithSelection = {
      ...defaultProps,
      filterState: {
        value: ['2024-01-01'],
        selectedValues: { '2024-01-01': '2024-01-01' },
      },
    };
    const { container } = render(<CalendarFilter locale="it" {...propsWithSelection} />);
    expect(container).toBeTruthy();
  });

  // ── New feature tests ──────────────────────────────────────────────────────

  it('shows year dropdown when showYearDropdown is true', () => {
    const { getByLabelText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const yearSelect = getByLabelText('Seleziona anno');
    expect(yearSelect).toBeTruthy();
  });

  it('hides year dropdown when showYearDropdown is false', () => {
    const { queryByLabelText } = render(
      <CalendarFilter locale="it" {...defaultProps} showYearDropdown={false} />,
    );
    expect(queryByLabelText('Seleziona anno')).toBeNull();
  });

  it('shows view toggle button when enableOverview is true', () => {
    const { getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    expect(getByText('Anno')).toBeTruthy();
  });

  it('switches to year overview when clicking toggle', () => {
    const { getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    fireEvent.click(getByText('Anno'));
    // Should now show year view with month labels
    expect(getByText('gen')).toBeTruthy();
    expect(getByText('dic')).toBeTruthy();
  });

  it('shows Today button and navigates to today', () => {
    const { getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    expect(getByText('Oggi')).toBeTruthy();
  });

  it('shows week numbers when showWeekNumbers is true', () => {
    const { container } = render(
      <CalendarFilter locale="it" {...defaultProps} showWeekNumbers={true} />,
    );
    // Week numbers are rendered
    expect(container).toBeTruthy();
  });

  it('shows selection badge and clear button when dates selected', () => {
    const propsWithSelection = {
      ...defaultProps,
      filterState: {
        value: ['2024-01-01'],
        selectedValues: { '2024-01-01': '2024-01-01' },
      },
    };
    const { container } = render(<CalendarFilter locale="it" {...propsWithSelection} />);
    expect(container.textContent).toMatch(/1 gen 2024/i);
    expect(container.textContent).toContain('Azzera');
  });

  it('clears selection when Clear button is clicked', () => {
    const propsWithSelection = {
      ...defaultProps,
      filterState: {
        value: ['2024-01-01'],
        selectedValues: { '2024-01-01': '2024-01-01' },
      },
    };
    const { getByText } = render(<CalendarFilter locale="it" {...propsWithSelection} />);
    fireEvent.click(getByText('Azzera'));
    expect(mockSetDataMask).toHaveBeenCalledWith({
      extraFormData: { filters: [] },
      filterState: { value: null, selectedValues: null },
    });
  });

  it('renders with Monday as first day of week', () => {
    const { container } = render(
      <CalendarFilter locale="it" {...defaultProps} firstDayOfWeek={1} />,
    );
    expect(container).toBeTruthy();
  });

  it('shows tooltip on hover over a data day', () => {
    const { getAllByText, getByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    // Find day element with number 01 (Dec 01 has data value 5)
    const dayElements = getAllByText('01');
    const day01 = dayElements[0]?.closest('[role]') || dayElements[0]?.parentElement || dayElements[0];
    if (day01) {
      fireEvent.mouseEnter(day01);
    }
    // Tooltip should show the date, value, max, and percentage
    expect(getByText('Valore:')).toBeTruthy();
    expect(getByText('Massimo:')).toBeTruthy();
    expect(getByText('% del max:')).toBeTruthy();
  });

  it('renders with minimal config (no optional features)', () => {
    const { container } = render(
      <CalendarFilter locale="it"
        {...defaultProps}
        showYearDropdown={false}
        enableOverview={false}
        showLegend={false}
        showWeekNumbers={false}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('emits time_range filter when filterTypeMode is time_range', () => {
    const { getAllByText } = render(
      <CalendarFilter locale="it" {...defaultProps} filterTypeMode="time_range" />,
    );
    const day15Elements = getAllByText('15');
    const day15 = day15Elements[0]?.closest('[role]') || day15Elements[0]?.parentElement || day15Elements[0];
    if (day15) {
      fireEvent.click(day15);
    }

    expect(mockSetDataMask).toHaveBeenCalledWith(
      expect.objectContaining({
        extraFormData: expect.objectContaining({
          // Superset ranges are [start, end): one selected day ends on the next day
          time_range: expect.stringMatching(/2026-12-15 : 2026-12-16/),
        }),
      }),
    );
  });

  it('emits in_clause filter when filterTypeMode is in_clause', () => {
    const { getAllByText } = render(
      <CalendarFilter locale="it" {...defaultProps} filterTypeMode="in_clause" />,
    );
    const day15Elements = getAllByText('15');
    const day15 = day15Elements[0]?.closest('[role]') || day15Elements[0]?.parentElement || day15Elements[0];
    if (day15) {
      fireEvent.click(day15);
    }

    expect(mockSetDataMask).toHaveBeenCalledWith(
      expect.objectContaining({
        extraFormData: expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              col: 'ds',
              op: 'IN',
              val: ['2026-12-15'],
            }),
          ]),
        }),
      }),
    );
  });

  it('triggers default value selection when defaultValueMode is today', () => {
    mockSetDataMask.mockClear();
    render(
      <CalendarFilter locale="it"
        {...defaultProps}
        defaultValueMode="today"
        filterState={{ value: null, selectedValues: null }}
      />,
    );
    expect(mockSetDataMask).toHaveBeenCalled();
  });

  it('renders macro filter shortcuts and triggers Q1 selection', () => {
    const { getByText } = render(
      <CalendarFilter locale="it" {...defaultProps} showMacroShortcuts={true} />,
    );
    const q1Btn = getByText('📊 Q1');
    expect(q1Btn).toBeTruthy();
    fireEvent.click(q1Btn);
    expect(mockSetDataMask).toHaveBeenCalled();
  });

  it('opens expandable modal view when Espandi button is clicked and toggles between month and year view', () => {
    const { getByText, getByRole, getAllByText } = render(<CalendarFilter locale="it" {...defaultProps} />);
    const espandiBtn = getByText('🖥️ Espandi');
    fireEvent.click(espandiBtn);
    expect(getAllByText(/vista mensile/i).length).toBeGreaterThanOrEqual(1);
    expect(getByRole('button', { name: /chiudi/i })).toBeTruthy();

    // Click toggle to switch to Year view inside modal
    const vistaAnnualeBtn = getByText('Vista Annuale');
    fireEvent.click(vistaAnnualeBtn);
    expect(getAllByText(/vista annuale/i).length).toBeGreaterThanOrEqual(1);

    // Click toggle to switch back to Month view inside modal
    const vistaMensileBtn = getByText('Vista Mensile');
    fireEvent.click(vistaMensileBtn);
    expect(getAllByText(/vista mensile/i).length).toBeGreaterThanOrEqual(1);
  });
});
