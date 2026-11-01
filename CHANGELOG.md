# Changelog

## [Unreleased]

## [0.2.0] - 2026-11-01
### Added
- **Period names and readable ranges for the charts**: `extraFormData.custom_form_data` now carries `period_labels` (the names chosen in the control panel), `period_text` (ranges such as `1 Jan - 31 Mar 2008`, in the calendar language, English or Italian) and `locale`, so charts can name the two periods instead of printing raw dates. StratumBar, StratumHeatmap and StratumKPI do.

### Changed
- **`custom_form_data` is a list with one object** and no longer holds `t1_dates` and `t2_dates`. Superset only keeps this key when it is iterable, so as an object it never reached the charts of a dashboard; the list of every selected day is not sent to each chart any more. `t1_range`, `t2_range` and `active_slot` are still there.
- 1 new test (191 in total).

## [0.1.18] - 2026-11-01
### Added
- **Short applied filters text**: the filter now sends `filterState.label` (for example `Current period: 1 Jan - 31 Mar 2008 · 91 days | Comparison period: 1 Jan - 31 Mar 2007 · 90 days`), which the dashboard shows in the applied filters list of each chart. Before, that list printed every selected day, hundreds of dates for a year. It uses the period labels and is left out when nothing is selected.
- **No data warning**: a period none of whose days has data in the dataset is flagged with `⚠ no data` on its card, since the charts would silently show nothing for it.
- 3 new tests (190 in total).

## [0.1.17] - 2026-10-31
### Added
- **Clear reference and comparison periods**: the two periods now have cards that show a name, a color, the range covered and the number of days (for example "Current period, 1 Sep 2026 - 15 Sep 2026 · 15 days"). Clicking a card makes it the period the next click or drag edits, and the `✕` on a card clears only that period. The cards replace the old "Time 1" / "Time 2" switch in the chart header, and also appear in the expanded dialog, where the comparison period could not be chosen before.
- **Period labels** (`reference_label`, `comparison_label`, section "Periods"): rename the periods, for example "This year" and "Last year". Both are optional text fields; empty uses the default of the calendar language ("Current period" / "Comparison period", "Periodo corrente" / "Periodo di confronto").
- **Enable comparison period** (`enable_comparison`, default on): turn it off for a single-period filter. The cards disappear, a stored comparison period is ignored and no `time_compare` is emitted.
- **Native filter bar layout**: the filter shows the two period cards (one per row) instead of a single pill, and clicking a card opens the dialog on that period. With the comparison period disabled the single pill is kept.
- **Escape closes the calendar dialog.**
- `PeriodSummary` component and `utils/periods.ts` (names, colors, summaries); `useSelectionMask` exposes `clearSlot(slot)`.
- 21 new tests (187 in total).

### Fixed
- **Blank space under the filter in the native filter bar**: the compact layout reserved a fixed 116px bottom padding and, when the host reported a height above 120px, a fixed height, so the filter left empty space even with the calendar closed. The compact layout is now exactly as tall as its content.
- **Query controls**: removed the mandatory metric constraint inherited from sharedControls (`clearable: true, validators: []`), so the chart can be updated and saved even in filter-only mode or with an empty selection.
- **YearOverview component typings**: added the optional properties `selectedDatesT1` and `selectedDatesT2` to the `YearOverviewProps` interface, to match the full dual-slot support.
- **README** listed `it` as the default `locale`; the default is `en`.
- **Stacked period cards in the native filter bar** no longer take a 200px flex basis as height; the compact filter measures about 82px with both cards (checked in the demo).

### Changed
- **Control panel reorganized**: a new "Periods" section sits right after "Query"; "Shortcuts" (shortcut buttons and relative dates) is split from "Filter behaviour"; labels use sentence case and shorter descriptions. Every new option is optional and the defaults keep existing charts unchanged (comparison stays on).
- **Dialog title** reads "Calendar filter: Month view (...)" and follows the calendar language; the em dash is gone from the plugin name and texts.
- Period colors are defined once (`PERIOD_COLORS`) and shared by the cards and the selected days.

## [0.1.16] - 2026-10-26
### Added
- **Dual-slot comparison filter (Dual-Slot Comparison)**: built-in management of the reference period (Time 1, Navy #0A224E) and the comparison period (Time 2, Magenta #E12B72) in the same calendar component.
- **Quick slot buttons for the active slot**: an ergonomic way to switch the selection mask between T1 and T2 and propagate the filters through extraFormData for Jinja templates and Superset analytics views.


### Added
- **Filter target column control** (`date_column`, "Filter target column"): choose any dataset column the filter applies to. The option was documented but never existed in the control panel.
- **Filter formats for any column type**: new `filter_type_mode` value `auto` (one range when the days are contiguous, otherwise a list; default for new charts) and `in_value_format` (`date`, `datetime`, `epoch_ms`) so lists match date, timestamp, text-date or epoch columns.
- **Week and month selection**: click an ISO week number to select that week (honouring the first day of the week), or a month name in the year overview to select that month.
- **Relative-date shortcuts**: today, yesterday, this/last week, last 7/30/90 days, month to date, last month, last quarter, year to date, last year. The visible ones are configurable (`enabled_presets`) and any of them can be the initial selection.
- **Holidays**: Italian national holidays (Easter and Easter Monday computed) and/or a custom list (`2026-06-15`, or `12-24=Name` for every year), shown in red, named in tooltips and aria labels, and skipped by the working days shortcut (`holiday_mode`, `custom_holidays`, `exclude_holidays_from_workdays`).
- **Color scales**: linear, logarithmic, square root or custom thresholds (`scale_type`, `scale_thresholds`).
- **Several rows per day**: `value_aggregation` (sum, average, maximum, minimum, row count); without a metric each row counts as one record.
- **Language**: `locale` (`en` by default, `it`, `auto`) for month names, weekdays and every button and tooltip text.
- **Keyboard and screen reader support**: day cells are buttons with `aria-pressed` and a date label, arrow keys move by a day or a week, Enter/Space select, and each grid has a single tab stop.
- **Drag selection in the chart view**, not only in the expanded dialog; releasing the button outside the calendar now ends the drag.
- 94 new tests (164 in total).

### Fixed
- **The heatmap was never painted**: cell colors, the legend and `show_legend` were documented but not rendered. Days with data are now colored from the palette, days without data stay white, a real zero keeps the lightest shade, and the legend is drawn.
- **Time ranges excluded the last selected day**: Superset ranges are `[start, end)`, so selecting one day sent an empty range (`2026-04-15 : 2026-04-15`). The end is now the day after the last selected day.
- **Hard-coded column `DATAEROGAZIONE`**: removed. Without any known column the calendar shows a notice and sends no filter instead of filtering on a guessed name.
- **Options read from inconsistent keys**: `transformProps` read `date_column` in snake case while every other option was read camel-cased, and `formData` is camel-cased by Superset. It now accepts both forms, plus adhoc column and metric objects.
- **First numeric column used as the metric**: the configured metric is used; rows of the same day are combined instead of the last one winning.
- **Scattered selections in `time_range` mode**: `auto` mode sends a list for non-contiguous days, so the working days shortcut no longer includes weekends.
- **Quadratic cost of large selections**: building the selected-values map no longer copies the object for every day.
- **README**: describes the real click behavior (second click selects the range) and the real test counts.

### Changed
- **Control panel labels are in English** (Query, Appearance, Layout, Holidays, Filter behaviour) instead of a mix of Italian and English; the heatmap date column is labelled optional, as it is. The calendar texts follow the `locale` option, which now defaults to `en`.
- **Visual refinement** (same layout and emoji as before): one set of design tokens (colors come from the host Superset theme when it provides them, with a neutral slate fallback), hairline borders, uniform 28px controls, small uppercase weekday headers and tabular numerals. Day cells keep their heat color when selected (inset ring instead of a glow that hid the data), holidays get a corner dot, today an underline bar, and hover no longer scales cells over their neighbours. The year overview shows one card per month. Cells grow with the chart height (up to 56px) instead of leaving the bottom empty, and the 116px bottom padding is now only kept for the compact native filter.
- **Smaller, modern bundler output (v0.1.15)**: `scripts/build.js` now passes `minify: true`, an explicit `target` of `es2020` / `chrome110` / `firefox110` / `safari16` and `sourcemap: 'linked'` to esbuild. The per-file dual output is preserved (`lib/` CommonJS for `main`, `esm/` for `module`), so imports from Superset and `MainPreset.ts` are unaffected while `lib/` + `esm/` shrink noticeably. `package.json` keeps `"sideEffects": false` so host bundlers can tree-shake unused modules.
- **Build no longer chains the Jest suite**: the `postbuild` hook that ran `npm run test` after every `npm run build` has been removed, so builds and installer runs stay fast. Tests are still available on demand with `npm test`.

## [0.1.14] - 2026-10-08

### Changed
- **Decomposed `CalendarFilter.tsx` into dedicated hooks**: extracted `src/hooks/useMacroActions.ts` (whole-year / current-month / **quarter** / weekdays macro selections, with pure `getQuarterDates()` and `getWeekdayDates()`), `src/hooks/useCalendarTooltip.ts` (tooltip state plus viewport positioning via `getBoundingClientRect`, with pure `computeTooltipPosition()`) and `src/hooks/useViewSelection.ts` (dropdown month/year changes that propagate the `dataMask`). Added 19 direct unit tests in `test/hooks/`; the 51 existing tests pass with unchanged expectations and rendering is identical.
- **Centralized esbuild entry points**: `scripts/build.js` is now the single source of the source-file list; the `build-cjs`, `build-esm` and `dev` scripts delegate to it with the same esbuild flags. Verified byte-identical outputs (all 76 `lib/`+`esm/` files unchanged against the previous build).
- **Local translation shim**: `src/plugin/index.ts` no longer imports `t` from `@apache-superset/core/translation`; it uses the suite-wide local pattern `const t = (str: string) => str` like the other four plugins.
- **Legacy installers aligned to the canonical registration**: `scripts/install.ps1`, `scripts/installer.py`, `scripts/install-to-superset.ps1` and `installer/install.js` no longer reintroduce the obsolete idiom (class `SupersetPluginChartCalendarFilter`, `.register()` lines, alias key `superset-plugin-chart-calendar-filter`); they now write only the canonical `new CalendarFilterPlugin().configure({ key: 'calendar_filter' })` form already used by `install-plugin.ps1`. Verified with ripgrep that `install.bat` and `aggiorna-tutti-i-chart.bat` reference only `install-plugin.ps1`.

### Fixed
- **Accurate utils documentation**: `src/utils/codemap.md` no longer mentions the non-existent `resolveTheme()`; `themeUtils.ts` is documented as live code. The audit's dead-code premise for `COLOR_PALETTES`/`getBaseColor` was disproved by grep (`src/hooks/useCalendarData.ts` imports `getBaseColor`), so the module stays in the build inputs as prescribed by the architecture plan for real consumers.

## [0.1.13] - 2026-10-07

### Fixed
- **Single canonical registration in `MainPreset.ts`**: `install-plugin.ps1` now registers the plugin only under the canonical key `calendar_filter`, removing the legacy alias line `superset-plugin-chart-calendar-filter` from the template (made obsolete by the normalization). The idempotency check is now exact-line: legacy variants (alias line, class `SupersetPluginChartCalendarFilter`, `.register()` lines, duplicates) are recognized and normalized to the canonical form without adding new lines.
- **Safety backup `MainPreset.ts.bak`**: the installer now creates a safety backup of `MainPreset.ts` before any change, like the other installers of the suite.

## [0.1.12] - 2026-10-02

### Added
- **Standalone Interactive Calendar**: Enabled the calendar to render and function as a standalone visual filter on dashboards even without providing any query data (`data` empty). Previously, omitting a date column or query data would crash the visual into a blocking "No data available" state. Now it renders a clean, neutral, fully interactive calendar initialized to the current year.

### Changed
- **Data Panel Cleanup**: Removed the confusing and legacy `sections.legacyTimeseriesTime` (Time Column, Time Grain, Time Range) from the chart configuration panel, as they overlap confusingly with the concept of a calendar filter.
- **Clarified Mandatory vs Optional Fields**: Renamed `groupby` to `Heatmap date column (required for the chart)` and `metric` to `Heatmap metric (optional)` in the control panel to clearly guide the user.

## [0.1.11] - 2026-10-02

### Changed
- **UI Optimization (Cognitive Load)**: Refactored `controlPanel.ts` to logically group control sections (`Base Visualizations`, `Advanced Layout`, `Filter Behaviour`). Reduced visual clutter by setting `expanded: false` on advanced sections, making the configuration view cleaner and more approachable for end users.

## [0.1.10] - 2026-10-01

### Fixed
- **Registry key fix in Superset (`calendar_filter`)**: fixed a critical bug where the installer registered the plugin under the key `superset-plugin-chart-calendar-filter`, causing the frontend error `chartType="calendar_filter" — Error: Item with key "calendar_filter" is not registered.` The official key `calendar_filter` is now registered (with alias `superset-plugin-chart-calendar-filter`).
- **Multiple exports of `CalendarFilterPlugin` & `SupersetPluginChartCalendarFilter`**: added the named export `CalendarFilterPlugin` in `src/index.ts` and `esm/index.js`, so both destructured imports (`import { CalendarFilterPlugin } from ...`, Superset 6.x) and default imports work.
- **TypeScript warnings**: removed the unused `validateNonEmpty` import in `controlPanel.ts`.

## [0.1.9] - 2026-10-01

### Fixed
- **Instant installer without npm install**: removed the automatic `npm install --legacy-peer-deps` attempt from `install-plugin.ps1`. The `src/` sources are now copied and registered directly for Superset's native Webpack build, removing waiting times and network blocks on the target machine.

## [0.1.8] - 2026-09-17

### Fixed
- **Native filter propagation on custom date columns**: added fallback detection for native filter targets (`formData.target.column.name` and default `DATAEROGAZIONE`) in `transformProps.ts`, preventing non-filtering due to undefined date column.
- **Dual filter emission in `useSelectionMask`**: `time_range` mode now emits both `time_range` and explicit `TEMPORAL_RANGE` column filter in `extraFormData.filters`.
- **In-clause filter emission**: `in_clause` mode now cleanly emits `{ col: colName, op: 'IN', val: sorted }` with sorted dates array, ensuring universal compatibility with SQL Server CTEs and virtual datasets without requiring `granularity_sqla`.

## [0.1.7] - 2026-08-01

### Added
- Universal drop-in installer (`install-calendar-filter.bat`) for Windows: place in Superset root, double-click to auto-discover plugin, build if needed, install as file dependency, register in MainPreset, and optionally generate Docker Compose override. Supports `SUPERSET_PLUGIN_PATH` environment variable for explicit plugin location.
- Technical documentation for the installer (`INSTALLER.md`).
- Fully automated Docker-ready plugin embedding: installer copies plugin into `superset-frontend/plugins/superset-plugin-chart-calendar-filter` and regenerates `package-lock.json` with `--legacy-peer-deps` automatically, ensuring zero-error Docker `npm ci` builds.
- Frontend Safety Cleanup routine in installer (`performFrontendSafetyClean`): automatically purges stale Webpack/Babel cache (`node_modules/.cache`), old build output (`dist/`), and lockfiles (`package-lock.json`) to guarantee a clean, reliable frontend build.
- GitHub Actions CI fixes: cross-platform `copy-images` script (Node.js `fs.cpSync` instead of PowerShell), Node 22 matrix only (Node 20 deprecated), upgraded `actions/checkout@v4` and `actions/setup-node@v4` in release workflow.

### Fixed
- Zero-dependency installer & clean scripts: replaced `rimraf` with native Node.js `fs.rmSync` in `package.json` clean scripts and added auto dependency installation in `installer/install.js`.
- CI pipeline now passes on Ubuntu runners (exit code 127 from `powershell: not found` resolved).
- Release workflow uses modern action versions and Node 22.
- **Removed duplicate npm publish job** from CI workflow (conflicted with semantic-release in release.yml).
- **Added `permissions: contents: write`** to release workflow for semantic-release to push tags and create GitHub releases.
- **Fixed package.json description encoding** (mojibake `â€"` → proper em dash `—`).
- **Aligned package.json version** to 0.1.7 (was 0.1.5, now matches CHANGELOG).
- **Stopped tracking `demo/demo-bundle.js`** build artifact (1.2 MB) in git; added to `.gitignore`.

## [0.1.6] - 2026-07-31

### Added
- Date Column control (`date_column`) in the Native Filter Settings section: lets the user select the target date column for the emitted filter. Required in Native Filter mode — without it the plugin falls back to `__timestamp` and the dashboard charts are not filtered (fixes the non-working native filter on dashboards).

### Fixed
- Native filter not filtering dashboards: the emitted filter pointed to `__timestamp` (a non-existent column) because no target date column reached the plugin in Native Filter mode; the new `date_column` control fixes it. The filter is also applied to the real dataset column (`order_date`) via the dashboard filter configuration.

### Changed
- Calendar cells keep the flat neutral style (white background, no data-intensity heatmap): days are highlighted only when selected, never by the underlying records. `DayCell`/`MiniDayCell` ignore the `intensity` prop as in 0.1.3.

## [0.1.5] - 2026-07-30

### Added
- Monthly / Yearly View Toggle in Native Filter Popover: switch between the Monthly View (single detailed month with high-resolution interactive cells) and the Yearly View (4x3 grid of 12 months) within the expanded Native Filter popover.
- Architectural Documentation for AI (CODE_ARCHITECTURE_MAP.md): comprehensive code map to guide future frontend and backend developments.
- MonthSelect dropdown alongside YearSelect: quick month selection dropdown added to the native filter modal, chart header, and expand modal.

### Fixed
- Current year always included in years dropdown: `availableYears` selector extends its upper range to the current year (`today.getFullYear()`) even when the dataset ends earlier.

## [0.1.4] - 2026-07-28

### Added
- Dynamic Year Selector in Modal: year navigation buttons and year selection dropdown (`<YearSelect>`) in the modal header (Native Filter and Chart), allowing direct selection and navigation to any year.

### Changed
- Yearly View Modal - Rectangular Layout and Positioning: adjusted modal origin (`padding-top: 210px`) to position below the Superset dashboard header/tabs; expanded container to `width: 96%` and `max-width: 1350px` for a 12-month rectangular panoramic view.

### Fixed
- Webpack Stub Modules (0 error build): created complete stubs in `/app/superset-frontend/node_modules/` for `@deck.gl/widgets`, `@react-spring/web` (`animated`, `a`, `useTransition`, `useSpring`, etc.), and `@fontsource/inter` (`100-900.css`). Superset 6.1.0 webpack-dev-server now compiles with 0 errors.

## [0.1.3] - 2026-07-28

### Added
- Native Filter Evolution (`Behavior.NativeFilter`): registered the plugin in the Apache Superset 6.1.0 Native Filters registry using a hybrid architecture, usable as both a Native Filter in the sidebar and an interactive Chart.
- Dual View Layout (Mini Inline + 12-Month Modal): compact 1-month mini calendar for the sidebar filter alongside an Expand button to open a high-resolution 12-month modal popover.
- Configurable Emitted Filter Format: control panel option to choose between native time range (`time_range`) and an ad-hoc list of discrete dates (`IN` clause on column).
- Macro Filters Shortcuts Bar: quick buttons for Year [YYYY], Current Month, Q1-Q4, Weekdays (Mon-Fri), and Clear.
- Configurable Default Values: customizable initial filter selection (No filter, Today, Current Month, Current Year, Custom Range).
- Italian localization: full Italian translation of all UI components (weekdays, months, Today, Clear, Year/Month, Expand Modal buttons, and tooltips), selectable with the `locale` option.
- Unit Tests (44/44): expanded Jest test suite to 44 passing unit tests.

### Changed
- Aseptic Plain Cell Styling: removed data-intensity conditional background gradient/heatmap. Unselected cells now have a neutral white background (`#ffffff`) with a discrete border (`1px solid #e2e8f0`).

### Fixed
- Nested Query OrderBy Stripping: removed `ORDER BY` clause insertion in `buildQuery.ts` to prevent SQL errors on nested subqueries in Apache Superset.

## [0.1.2] - 2026-07-27

### Fixed
- Cross-filter compatibility with Superset 6.1.0: `transformProps` now passes `hooks.setDataMask`, `filterState`, and `dateColumn` to the component; plugin metadata declares `behaviors: [Behavior.InteractiveChart]` so dashboards include it in cross-filter scope; cross-filter payload now uses the real date column (`dateColumn ?? '__timestamp'`) instead of non-existent `__time_range`.
- Timezone-safe date parsing: `YYYY-MM-DD` strings are parsed with local `new Date(y, m-1, d)` to avoid UTC-negative timezone shifts.
- Peer dependencies: added `@apache-superset/core` and `@emotion/styled`; React range expanded to `^16.13.1 || ^17.0.0`.

## [0.1.1] - 2026-07-18

### Changed
- Compact redesign: cells reduced from `aspect-ratio: 1` to 30px fixed height, header padding cut 50%, grid gap reduced to 1px, overall footprint approximately 35% smaller.
- GitHub-inspired color palettes: all 6 palettes updated to contribution-graph style gradients (`#ebedf0` to `#216e39` etc.).
- Modern look: border-radius 4px, subtle selection rings (2px + 3px), smoother 0.2s transitions, higher-contrast day numbers.
- Compact nav buttons: icon-only style with 4px padding, smaller typography throughout.

### Added
- Today indicator: green dot below the current day's cell, also shown in year overview.
- Smart selection badge: shows formatted range ("12-15 Mar 2026") instead of generic count.
- Cell Density option: new `Cell Density` control in Calendar Options (Compact/Normal) toggles cell size between 30px and 38px.
- Empty state: calendar icon with centered message when no data.
- Transient props: added `$isToday`, `$cellHeight` transient props to styled components to prevent DOM leakage.

### Tests
- 27/27 tests pass (4 suites).
- Updated badge test to match new range format.
- Added `cellDensity` to mock/styled props filter list.

## [0.1.0] - 2026-07-08

### Added
- Initial scaffold with package.json, babel, TypeScript, Jest.
- `CalendarFilter.tsx` - interactive calendar heatmap component.
- Month navigation (prev/next) with month/year display.
- Color-coded day cells with 6 color palettes.
- Date selection with toggle behavior.
- Cross-filter API via `setDataMask()` with `__time_range`.
- Legend showing color scale (min/max values).
- Empty state when no data is available.
- Control panel with metric, date column, filters, color scheme, legend toggle.
- Build query with `groupby` support.
- Data transformation pipeline.
- 15 unit tests across 4 test suites.
