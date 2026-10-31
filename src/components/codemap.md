# src/components/

## Responsibility

Houses modular React subcomponents used by `CalendarFilter.tsx` to render granular interface elements such as month grids, year overviews, modal popovers, tooltips, and macro shortcut toolbars.

## Design

- **Performance**: Leaf components are wrapped with `React.memo` to eliminate unnecessary re-renders during drag-sweep or selection toggling.
- **Presenter Pattern**: Receives data maps, active selection sets, and callback handlers as props from `CalendarFilter.tsx`.
- **Shared display data**: texts, holidays, heat colors and the week/month selection callbacks come from `CalendarDisplayContext` (`src/utils/labels.ts`), so the grids do not take a dozen extra props.
- **Accessibility**: day cells are `role=button` with `aria-pressed`, a `data-date` attribute, one roving tab stop per grid and arrow-key navigation.
- **Styling Integration**: Consumes Emotion styled components defined in `src/styles/CalendarFilter.styles.ts`.

## Key Components

- `MonthGrid.tsx`: Renders the single-month calendar heatmap matrix with week numbers, day names, and interactive day cells.
- `YearOverview.tsx`: Renders a 4x3 grid of 12 mini-months for panoramic annual overview.
- `CalendarModal.tsx`: Full-screen expandable modal with anti-overlap positioning and view switcher (Month/Year).
- `CalendarTooltip.tsx`: Absolute-positioned hover tooltip displaying date, metric value, and percentage contribution.
- `HeatLegend.tsx`: Color ramp with lowest/highest value and the no-data swatch.
- `PeriodSummary.tsx`: Cards naming the reference and comparison periods, with their range, day count and per-period clear button.
- `MacroShortcuts.tsx`: Quick selection toolbar buttons (year, month, Q1-Q4, working days, relative periods, clear).

## Flow

`CalendarFilter.tsx` -> passes formatted data & handlers -> `src/components/*` -> renders Emotion elements -> captures DOM user events (clicks, mouseover, drag).

## Integration

Used strictly within `src/CalendarFilter.tsx`.
