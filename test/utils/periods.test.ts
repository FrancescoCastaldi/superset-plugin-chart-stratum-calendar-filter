import { getLabels } from '../../src/utils/labels';
import { resolvePeriodNames, summarizePeriod, PERIOD_COLORS } from '../../src/utils/periods';

describe('periods', () => {
  const en = getLabels('en');
  const itLabels = getLabels('it');

  describe('resolvePeriodNames', () => {
    it('uses the translated defaults when no label is given', () => {
      expect(resolvePeriodNames({}, en)).toEqual({ T1: 'Current period', T2: 'Comparison period' });
      expect(resolvePeriodNames({}, itLabels)).toEqual({ T1: 'Periodo corrente', T2: 'Periodo di confronto' });
    });

    it('lets custom labels win, trimmed', () => {
      expect(resolvePeriodNames({ referenceLabel: '  Q2 ', comparisonLabel: 'Q1' }, en)).toEqual({
        T1: 'Q2',
        T2: 'Q1',
      });
    });

    it('treats blank labels as missing and each label independently', () => {
      expect(resolvePeriodNames({ referenceLabel: '   ', comparisonLabel: 'Baseline' }, en)).toEqual({
        T1: 'Current period',
        T2: 'Baseline',
      });
    });
  });

  describe('summarizePeriod', () => {
    it('reports an empty period', () => {
      expect(summarizePeriod([], en)).toEqual({ count: 0, range: '', text: 'Not set' });
    });

    it('describes one day', () => {
      const summary = summarizePeriod(['2026-09-15'], en);
      expect(summary.count).toBe(1);
      expect(summary.text).toMatch(/15 Sep[a-z]* 2026 · 1 day$/);
    });

    it('describes a range and ignores duplicates and order', () => {
      const summary = summarizePeriod(new Set(['2026-09-12', '2026-09-10', '2026-09-11']), en);
      expect(summary.count).toBe(3);
      expect(summary.text.endsWith('3 days')).toBe(true);
      expect(summary.range).toContain('2026');
    });

    it('follows the language for the day count', () => {
      expect(summarizePeriod(['2026-09-10', '2026-09-11'], itLabels).text.endsWith('2 giorni')).toBe(true);
    });
  });

  it('gives the two periods different colors', () => {
    expect(PERIOD_COLORS.T1).not.toBe(PERIOD_COLORS.T2);
  });
});
