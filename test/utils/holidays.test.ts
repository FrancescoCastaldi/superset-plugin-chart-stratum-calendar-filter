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
  buildHolidayMap,
  getEasterSunday,
  getItalianHolidays,
  parseCustomHolidays,
} from '../../src/utils/holidays';

describe('holidays', () => {
  it('computes Easter Sunday for known years', () => {
    expect(getEasterSunday(2024)).toBe('2024-03-31');
    expect(getEasterSunday(2025)).toBe('2025-04-20');
    expect(getEasterSunday(2026)).toBe('2026-04-05');
    expect(getEasterSunday(2038)).toBe('2038-04-25');
  });

  it('lists the Italian national holidays including Easter Monday', () => {
    const h = getItalianHolidays(2026);
    expect(h.size).toBe(12);
    expect(h.get('2026-01-01')).toBe("New Year's Day");
    expect(h.get('2026-04-06')).toBe('Easter Monday');
    expect(h.get('2026-04-25')).toBe('Liberation Day');
    expect(h.get('2026-12-26')).toBe("St. Stephen's Day");
  });

  describe('parseCustomHolidays', () => {
    it('splits on commas, semicolons and newlines', () => {
      const { dated, recurring } = parseCustomHolidays('2026-06-15=Patron, 12-24;\n03-19=San Giuseppe');
      expect(dated.get('2026-06-15')).toBe('Patron');
      expect(recurring.get('12-24')).toBe('Festivo');
      expect(recurring.get('03-19')).toBe('San Giuseppe');
    });

    it('drops invalid or impossible dates', () => {
      const { dated, recurring } = parseCustomHolidays('2026-02-30, 13-01, hello, 2025-02-29');
      expect(dated.size).toBe(0);
      expect(recurring.size).toBe(0);
    });

    it('accepts a recurring 29 February', () => {
      expect(parseCustomHolidays('02-29').recurring.has('02-29')).toBe(true);
    });

    it('handles empty input', () => {
      expect(parseCustomHolidays(undefined).dated.size).toBe(0);
      expect(parseCustomHolidays('').recurring.size).toBe(0);
    });
  });

  describe('buildHolidayMap', () => {
    it('is empty when disabled', () => {
      expect(buildHolidayMap('none', '12-24', [2026]).size).toBe(0);
    });

    it('merges national and custom holidays for each year', () => {
      const map = buildHolidayMap('it', '12-24=Vigilia', [2025, 2026]);
      expect(map.get('2025-12-24')).toBe('Vigilia');
      expect(map.get('2026-12-24')).toBe('Vigilia');
      expect(map.get('2026-12-25')).toBe('Christmas Day');
    });

    it('uses only the custom list in custom mode', () => {
      const map = buildHolidayMap('custom', '2026-06-15', [2026]);
      expect([...map.keys()]).toEqual(['2026-06-15']);
    });

    it('skips a recurring 29 February in a non-leap year', () => {
      const map = buildHolidayMap('custom', '02-29', [2025, 2024]);
      expect(map.has('2025-02-29')).toBe(false);
      expect(map.has('2024-02-29')).toBe(true);
    });
  });
});
