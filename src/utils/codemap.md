# src/utils/

## Responsibility

Pure utility functions for date parsing, formatting, ISO week calculations, date range expansion, and theme resolution (`dateUtils.ts`, `calendarGrid.ts`, `themeUtils.ts`).

## Design

- **Timezone Safety**: `parseDateValue()` parses date strings using local midnight (`new Date(year, month - 1, day)`) to avoid UTC negative offset shifts across timezones.
- **Pure Functions**: Utility methods are side-effect-free and fully tested by Jest unit tests (`test/utils/dateUtils.test.ts`).
- **Core Functions**:
  - `parseDateValue(val)`: Converts strings/numbers/dates to local `Date` objects.
  - `formatDateKey(d)`: Formats `Date` objects into `YYYY-MM-DD` strings.
  - `getDatesBetween(start, end)`: Returns inclusive array of dates between two bounds.
  - `getISOWeekNumber(d)`: Calculates ISO-8601 week number.
  - `formatDateRangeBadge(dates)`: Formats smart selection badge text.
  - `addDays`, `getWeekDates`, `isContiguousSelection`, `dateKeyToEpochMs`: DST-safe day arithmetic and week/contiguity helpers.
  - `filterMask.ts` - `buildExtraFormData(dates, column, mode, inFormat)`: builds the Superset filter. Ranges end on the day after the last selected day because Superset ranges are `[start, end)`; `auto` mode sends a range for contiguous days and a list otherwise; `inFormat` shapes list values (date, datetime, epoch ms). No column means no filter.
  - `presets.ts` - relative periods (`getPresetRange`, `getPresetDates`, `normalizePresets`).
  - `periods.ts` - reference/comparison period names, colors and one-line summaries (`resolvePeriodNames`, `summarizePeriod`).
  - `holidays.ts` - Italian national holidays with computed Easter, plus a parser for custom lists (`YYYY-MM-DD` or `MM-DD`, optional `=Name`).
  - `colorScale.ts` - linear / log / sqrt / threshold intensity scales and `getHeatStyle` (null for days without data).
  - `labels.ts` - Italian and English texts, Intl month and weekday names, and `CalendarDisplayContext` (labels, holidays, heat colors, week/month selection) shared by the components.
  - `gridKeys.ts` - arrow-key navigation and the roving tab stop of the day grids.
  - `getBaseColor(paletteName)`: Returns the strongest color of a `COLOR_PALETTES` scheme (falls back to `supersetColors`). Consumed by `useCalendarData` to build the gradient scale — not dead code.

## Flow

Called by `useCalendarData`, `useSelectionMask`, and `CalendarFilter.tsx` during rendering, selection filtering, and date calculations.

## Integration

Used throughout the src codebase and validated in `test/utils/dateUtils.test.ts`.
