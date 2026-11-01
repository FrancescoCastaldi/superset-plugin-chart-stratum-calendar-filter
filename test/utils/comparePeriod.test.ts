import { deriveComparison } from '../../src/utils/comparePeriod';
import { getDatesBetween } from '../../src/utils/dateUtils';

describe('deriveComparison', () => {
  it('takes the days right before, as many as the reference spans', () => {
    const q1 = getDatesBetween('2008-01-01', '2008-03-31');
    const previous = deriveComparison(q1, 'previous_period');
    expect(previous).toHaveLength(91);
    expect(previous[0]).toBe('2007-10-02');
    expect(previous[previous.length - 1]).toBe('2007-12-31');
  });

  it('moves a week to the week before', () => {
    expect(deriveComparison(getDatesBetween('2026-09-14', '2026-09-20'), 'previous_period')).toEqual(
      getDatesBetween('2026-09-07', '2026-09-13'),
    );
  });

  it('moves a single day back by one day', () => {
    expect(deriveComparison(['2026-09-15'], 'previous_period')).toEqual(['2026-09-14']);
  });

  it('keeps the pattern of scattered days', () => {
    // Monday and Wednesday of one week: the span is 3 days
    expect(deriveComparison(['2026-09-14', '2026-09-16'], 'previous_period')).toEqual(['2026-09-11', '2026-09-13']);
  });

  it('takes the same days one year earlier', () => {
    const march = getDatesBetween('2008-03-01', '2008-03-31');
    expect(deriveComparison(march, 'previous_year')).toEqual(getDatesBetween('2007-03-01', '2007-03-31'));
  });

  it('turns 29 February into 28 February', () => {
    expect(deriveComparison(['2024-02-29'], 'previous_year')).toEqual(['2023-02-28']);
  });

  it('ignores duplicates and returns nothing for no days', () => {
    expect(deriveComparison(['2026-09-15', '2026-09-15'], 'previous_year')).toEqual(['2025-09-15']);
    expect(deriveComparison([], 'previous_period')).toEqual([]);
  });
});
