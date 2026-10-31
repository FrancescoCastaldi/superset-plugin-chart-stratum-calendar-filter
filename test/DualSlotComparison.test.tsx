import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CalendarFilter from '../src/CalendarFilter';

describe('CalendarFilter reference and comparison periods', () => {
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

  const cardOf = (container: HTMLElement, slot: 'T1' | 'T2') =>
    container.querySelector(`[data-period="${slot}"]`) as HTMLElement;

  beforeEach(() => {
    mockSetDataMask.mockClear();
  });

  it('names the two periods with sensible defaults', () => {
    const { container } = render(<CalendarFilter {...baseProps} />);
    expect(cardOf(container, 'T1').textContent).toContain('Current period');
    expect(cardOf(container, 'T2').textContent).toContain('Comparison period');
    expect(cardOf(container, 'T1').textContent).toContain('Not set');
  });

  it('follows the calendar language for the default names', () => {
    const { container } = render(<CalendarFilter {...baseProps} locale="it" />);
    expect(cardOf(container, 'T1').textContent).toContain('Periodo corrente');
    expect(cardOf(container, 'T2').textContent).toContain('Periodo di confronto');
  });

  it('shows custom labels typed in the control panel', () => {
    const { container } = render(
      <CalendarFilter {...baseProps} referenceLabel="This year" comparisonLabel="Last year" />,
    );
    expect(cardOf(container, 'T1').textContent).toContain('This year');
    expect(cardOf(container, 'T2').textContent).toContain('Last year');
    expect(container.textContent).not.toContain('Current period');
  });

  it('falls back to the default name when a label is blank', () => {
    const { container } = render(<CalendarFilter {...baseProps} referenceLabel="   " comparisonLabel="" />);
    expect(cardOf(container, 'T1').textContent).toContain('Current period');
    expect(cardOf(container, 'T2').textContent).toContain('Comparison period');
  });

  it('summarizes the range and day count of each period', () => {
    const { container } = render(
      <CalendarFilter
        {...baseProps}
        filterState={{
          value: ['2026-09-10', '2026-09-11', '2026-09-12'],
          selectedDatesT1: ['2026-09-10', '2026-09-11', '2026-09-12'],
          selectedDatesT2: ['2026-08-15'],
        }}
      />,
    );
    expect(cardOf(container, 'T1').textContent).toContain('3 days');
    expect(cardOf(container, 'T2').textContent).toContain('1 day');
    expect(cardOf(container, 'T2').textContent).toContain('2026');
  });

  it('switches the active period from its card and emits the dual filter dataMask', () => {
    const { container } = render(<CalendarFilter {...baseProps} />);
    expect(cardOf(container, 'T1').querySelector('button')?.getAttribute('aria-pressed')).toBe('true');

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

    fireEvent.click(cardOf(container, 'T2').querySelector('button') as HTMLElement);
    expect(cardOf(container, 'T2').querySelector('button')?.getAttribute('aria-pressed')).toBe('true');

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

  it('clears one period without touching the other', () => {
    const { container } = render(
      <CalendarFilter
        {...baseProps}
        filterState={{
          value: ['2026-09-15'],
          selectedDatesT1: ['2026-09-15'],
          selectedDatesT2: ['2026-08-15'],
        }}
      />,
    );
    fireEvent.click(cardOf(container, 'T2').querySelector('[aria-label="Clear: Comparison period"]') as HTMLElement);
    const mask = mockSetDataMask.mock.calls[mockSetDataMask.mock.calls.length - 1][0];
    expect(mask.filterState.value).toEqual(['2026-09-15']);
    expect(mask.extraFormData.time_compare).toBeUndefined();
    expect(mask.extraFormData.time_range).toBe('2026-09-15 : 2026-09-16');
  });

  it('hides the comparison period and ignores a stored one when comparison is disabled', () => {
    const { container } = render(
      <CalendarFilter
        {...baseProps}
        enableComparison={false}
        filterState={{
          value: ['2026-09-15'],
          selectedDatesT1: ['2026-09-15'],
          selectedDatesT2: ['2026-08-15'],
        }}
      />,
    );
    expect(cardOf(container, 'T1')).toBeNull();
    expect(cardOf(container, 'T2')).toBeNull();

    const dayCells = container.querySelectorAll('[data-date="2026-09-10"]');
    if (dayCells.length > 0) {
      fireEvent.click(dayCells[0]);
    }
    const mask = mockSetDataMask.mock.calls[mockSetDataMask.mock.calls.length - 1][0];
    expect(mask.extraFormData.time_compare).toBeUndefined();
  });

  describe('compact native filter', () => {
    const compactProps = { ...baseProps, height: 60 };

    it('lists both periods instead of a single pill and sets no fixed height', () => {
      const { container } = render(<CalendarFilter {...compactProps} />);
      expect(cardOf(container, 'T1')).not.toBeNull();
      expect(cardOf(container, 'T2')).not.toBeNull();
      expect(container.textContent).not.toContain('Select calendar dates');
    });

    it('opens the dialog on the period that was clicked and closes it with Escape', () => {
      const { container, queryByText } = render(<CalendarFilter {...compactProps} />);
      fireEvent.click(cardOf(container, 'T2').querySelector('button') as HTMLElement);
      expect(queryByText(/Calendar filter:/)).not.toBeNull();
      // the dialog repeats the cards, with the comparison period active
      const active = Array.from(document.querySelectorAll('[data-period="T2"] button[aria-pressed="true"]'));
      expect(active.length).toBeGreaterThan(0);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(queryByText(/Calendar filter:/)).toBeNull();
    });

    it('keeps the single pill when comparison is disabled', () => {
      const { container, getByText } = render(<CalendarFilter {...compactProps} enableComparison={false} />);
      expect(cardOf(container, 'T1')).toBeNull();
      expect(getByText(/Select calendar dates/)).toBeTruthy();
    });
  });
});
