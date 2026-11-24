import { formatInteger } from '../src/utils/numberFormat';

describe('formatInteger', () => {
  it('groups thousands with a dot, four digits included', () => {
    expect(formatInteger(1240)).toBe('1.240');
    expect(formatInteger(1234567)).toBe('1.234.567');
    expect(formatInteger(999)).toBe('999');
  });

  it('keeps the sign and drops decimals', () => {
    expect(formatInteger(-1234)).toBe('-1.234');
    expect(formatInteger(12.6)).toBe('13');
  });
});
