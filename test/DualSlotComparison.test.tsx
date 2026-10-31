import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CalendarFilter from '../src/CalendarFilter';

describe('CalendarFilter Dual-Slot Comparison', () => {
  const mockSetDataMask = jest.fn();

  const baseProps: any = {
    data: [
      { date: '2026-09-15', value: 100 },
      { date: '2026-08-15', value: 80 },
    ],
    width: 600,
    height: 400,
    dateColumn: 'data_evento',
    filterTypeMode: 'time_range',
    setDataMask: mockSetDataMask,
    defaultValueMode: 'none',
    formData: {
      datasource: '1__table',
      viz_type: 'calendar_filter',
    },
  };

  beforeEach(() => {
    mockSetDataMask.mockClear();
  });

  it('renders slot buttons for Time 1 and Time 2', () => {
    const { getByText } = render(<CalendarFilter {...baseProps} />);
    expect(getByText(/Time 1/i)).toBeTruthy();
    expect(getByText(/Time 2/i)).toBeTruthy();
  });

  it('switches active slot when clicking Time 2 and emits dual filter dataMask', () => {
    const { getByText, container } = render(<CalendarFilter {...baseProps} />);

    // Click on day 15 in Time 1
    const dayCells = container.querySelectorAll('[data-date="2026-09-15"]');
    if (dayCells.length > 0) {
      fireEvent.click(dayCells[0]);
    }

    expect(mockSetDataMask).toHaveBeenCalledWith(
      expect.objectContaining({
        extraFormData: expect.objectContaining({
          time_range: '2026-09-15 : 2026-09-16',
        }),
      }),
    );

    // Switch to Time 2 slot
    fireEvent.click(getByText(/Time 2/i));

    // Click on another day in Time 2
    const dayCellT2 = container.querySelectorAll('[data-date="2026-09-10"]');
    if (dayCellT2.length > 0) {
      fireEvent.click(dayCellT2[0]);
    }

    expect(mockSetDataMask).toHaveBeenLastCalledWith(
      expect.objectContaining({
        extraFormData: expect.objectContaining({
          time_compare: ['2026-09-10 : 2026-09-11'],
          custom_form_data: expect.objectContaining({
            t1_dates: ['2026-09-15'],
            t2_dates: ['2026-09-10'],
          }),
        }),
        filterState: expect.objectContaining({
          selectedDatesT1: ['2026-09-15'],
          selectedDatesT2: ['2026-09-10'],
          activeSlot: 'T2',
        }),
      }),
    );
  });
});
