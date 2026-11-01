import styled from '@emotion/styled';
import { CalendarFilterStylesProps } from '../types';
import { PERIOD_COLORS, PeriodSlot } from '../utils/periods';

/**
 * Design tokens. Every color comes from the host theme when it provides one
 * (Superset exposes antd-style tokens) and falls back to a neutral slate palette,
 * so the calendar matches the dashboard it is placed in.
 */
const tokens = (theme: any) => ({
  bg: theme?.colorBgContainer ?? '#ffffff',
  bgMuted: theme?.colorFillQuaternary ?? '#f8fafc',
  bgHover: theme?.colorFillTertiary ?? '#f1f5f9',
  border: theme?.colorBorderSecondary ?? '#e2e8f0',
  borderStrong: theme?.colorBorder ?? '#cbd5e1',
  text: theme?.colorText ?? '#0f172a',
  textMuted: theme?.colorTextSecondary ?? '#475569',
  textFaint: theme?.colorTextTertiary ?? '#94a3b8',
  accent: theme?.colorPrimary ?? theme?.colors?.primary?.base ?? '#2563eb',
  danger: theme?.colorError ?? '#dc2626',
  font:
    theme?.fontFamily ??
    theme?.typography?.families?.sansSerif ??
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
});

type TokenName = keyof ReturnType<typeof tokens>;

/** Interpolation helper: `${tk('border')}` reads the token from the active theme */
const tk = (name: TokenName) => ({ theme }: { theme?: any }) => tokens(theme)[name];

/** Accent mixed with transparency, for hover and selected backgrounds */
const accentTint = (percent: number) => ({ theme }: { theme?: any }) =>
  `color-mix(in srgb, ${tokens(theme).accent} ${percent}%, transparent)`;

/** Shared look of every small control (buttons, selects) so they line up */
const controlBase = ({ theme }: { theme?: any }) => {
  const c = tokens(theme);
  return `
  box-sizing: border-box;
  height: 28px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: ${c.text};
  background: ${c.bg};
  border: 1px solid ${c.borderStrong};
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease;

  &:hover:not(:disabled) {
    background: ${c.bgHover};
    border-color: ${c.textFaint};
  }

  &:focus-visible {
    outline: 2px solid ${c.accent};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
};

/**
 * Root of the chart. In the compact (native filter) layout the box is exactly as tall as its
 * content: no fixed height, no minimum and no bottom padding, so a closed filter leaves no blank
 * space under it. The full chart fills the height the dashboard gives it.
 */
export const Styles = styled.div<CalendarFilterStylesProps & { $compact?: boolean }>`
  height: ${({ height, $compact }) => (!$compact && height && height > 120 ? `${height}px` : 'auto')};
  min-height: ${({ height, $compact }) => (!$compact && height && height > 120 ? `${height}px` : '0')};
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  display: flex;
  flex-direction: column;
  font-family: ${tk('font')};
  color: ${tk('text')};
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
`;

export const NativeFilterTriggerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  width: 100%;
  padding: 2px 0;
`;

export const NativeFilterPillButton = styled.button`
  ${controlBase}
  width: 100%;
  height: 32px;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 13px;
`;

export const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: 8px 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${tk('border')};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/** Group holding the cards of the reference and comparison periods */
export const PeriodList = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: ${({ $stacked }) => ($stacked ? 'column' : 'row')};
  flex-wrap: wrap;
  align-items: stretch;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
`;

export const PeriodCard = styled.div<{ $slot: PeriodSlot; $active: boolean; $stacked?: boolean }>`
  display: flex;
  align-items: stretch;
  /* side by side the cards share the row; stacked, a flex basis would become a height */
  flex: ${({ $stacked }) => ($stacked ? '0 0 auto' : '1 1 200px')};
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid ${({ $active, $slot }) => ($active ? PERIOD_COLORS[$slot] : 'rgba(148, 163, 184, 0.55)')};
  border-left: 4px solid ${({ $slot }) => PERIOD_COLORS[$slot]};
  border-radius: 6px;
  background: ${({ $active, $slot }) =>
    $active ? `color-mix(in srgb, ${PERIOD_COLORS[$slot]} 10%, transparent)` : 'transparent'};
  box-shadow: ${({ $active, $slot }) => ($active ? `0 0 0 1px ${PERIOD_COLORS[$slot]}` : 'none')};
  transition: background 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
`;

export const PeriodSelectButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1px;
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  margin: 0;
  font-family: inherit;
  color: inherit;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
    outline-offset: -2px;
  }
`;

export const PeriodName = styled.span<{ $slot: PeriodSlot }>`
  max-width: 100%;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $slot }) => PERIOD_COLORS[$slot]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PeriodRange = styled.span<{ $empty?: boolean }>`
  max-width: 100%;
  font-size: 12px;
  font-weight: ${({ $empty }) => ($empty ? 400 : 600)};
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  color: ${({ $empty, theme }) => ($empty ? tokens(theme).textFaint : tokens(theme).text)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Row of one-click ways to fill the comparison period */
export const QuickCompareRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  font-size: 11px;
  color: ${tk('textMuted')};
`;

export const QuickCompareButton = styled.button`
  ${controlBase}
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
`;

export const PeriodClearButton = styled.button`
  align-self: center;
  width: 22px;
  height: 22px;
  margin-right: 4px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  color: ${tk('textMuted')};
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    color: ${tk('danger')};
    background: ${tk('bgHover')};
  }

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
  }
`;

export const NavButton = styled.button`
  ${controlBase}
  width: 32px;
  padding: 0;
  font-size: 11px;
  color: ${tk('textMuted')};
`;

export const TodayButton = styled.button`
  ${controlBase}
  font-weight: 600;
`;

export const MonthTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${tk('text')};
  white-space: nowrap;
`;

export const SelectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 600;
  color: ${tk('accent')};
  background: ${accentTint(12)};
  border: 1px solid ${accentTint(30)};
  border-radius: 999px;
  white-space: nowrap;
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: ${tk('textMuted')};
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    color: ${tk('danger')};
    background: ${tk('bgHover')};
  }

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
  }
`;

const chevron = ({ theme }: { theme?: any }) => {
  const color = encodeURIComponent(tokens(theme).textMuted);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none' stroke='${color}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E")`;
};

export const YearSelect = styled.select`
  ${controlBase}
  appearance: none;
  padding-right: 26px;
  background-image: ${chevron};
  background-repeat: no-repeat;
  background-position: right 9px center;
`;

export const MonthSelect = styled.select`
  ${controlBase}
  appearance: none;
  padding-right: 26px;
  background-image: ${chevron};
  background-repeat: no-repeat;
  background-position: right 9px center;
`;

export const ViewToggleButton = styled.button`
  ${controlBase}
`;

export const CalendarGrid = styled.div<{ showWeekNumbers: boolean }>`
  display: grid;
  grid-template-columns: ${({ showWeekNumbers }) =>
    showWeekNumbers ? '28px repeat(7, 1fr)' : 'repeat(7, 1fr)'};
  gap: 4px;
  padding: 8px 16px 12px;
  flex: 1;
  align-content: start;
`;

export const DayHeader = styled.div`
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: ${tk('textMuted')};
  padding: 4px 0 6px;
  text-transform: uppercase;
`;

export const WeekNumberCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  color: ${tk('textFaint')};
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${accentTint(12)};
    color: ${tk('accent')};
  }
`;

export interface HeatProps {
  /** Heat color of the day, `null` for days without data */
  $heat?: { background: string; dark: boolean } | null;
  $isHoliday?: boolean;
}

export interface DayCellProps extends HeatProps {
  intensity: number;
  isSelected: boolean;
  isCurrentMonth: boolean;
  $isToday: boolean;
  baseColor: string;
  $cellHeight: number;
  $selectionSlot?: 'T1' | 'T2' | 'BOTH' | 'STANDARD';
}

/** Marks used on day cells: holiday dot (top right) and today bar (bottom) */
const dayMarks = (isToday: boolean, isHoliday: boolean, size: 'normal' | 'mini') => {
  const dot = size === 'mini' ? 3 : 5;
  const inset = size === 'mini' ? 1 : 4;
  return `
  ${
    isHoliday
      ? `
  &::before {
    content: '';
    position: absolute;
    top: ${inset}px;
    right: ${inset}px;
    width: ${dot}px;
    height: ${dot}px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.85);
  }`
      : ''
  }
  ${
    isToday
      ? `
  &::after {
    content: '';
    position: absolute;
    bottom: ${size === 'mini' ? 1 : 3}px;
    left: 50%;
    transform: translateX(-50%);
    width: ${size === 'mini' ? 6 : 12}px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.85;
  }`
      : ''
  }`;
};

export const DayCell = styled.div<DayCellProps>`
  box-sizing: border-box;
  height: ${({ $cellHeight }) => $cellHeight}px;
  width: 100%;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: ${({ isCurrentMonth }) => (isCurrentMonth ? 'pointer' : 'default')};
  opacity: ${({ isCurrentMonth }) => (isCurrentMonth ? 1 : 0.3)};
  transition: box-shadow 0.12s ease, filter 0.12s ease;
  position: relative;
  user-select: none;

  background-color: ${({ $heat, theme }) => ($heat ? $heat.background : tokens(theme).bg)};
  color: ${({ $heat, theme }) => ($heat?.dark ? '#ffffff' : tokens(theme).text)};
  border: 1px solid ${({ $heat, theme }) => ($heat ? 'transparent' : tokens(theme).border)};

  ${({ isSelected, $selectionSlot, theme }) => {
    if (!isSelected) return '';
    if ($selectionSlot === 'T1') {
      return `
    box-shadow: inset 0 0 0 2px ${PERIOD_COLORS.T1}, inset 0 0 0 3px rgba(255, 255, 255, 0.85);
    font-weight: 700;
    z-index: 1;
    `;
    }
    if ($selectionSlot === 'T2') {
      return `
    box-shadow: inset 0 0 0 2px ${PERIOD_COLORS.T2}, inset 0 0 0 3px rgba(255, 255, 255, 0.85);
    font-weight: 700;
    z-index: 1;
    `;
    }
    if ($selectionSlot === 'BOTH') {
      return `
    box-shadow: inset 0 0 0 2px ${PERIOD_COLORS.T1}, inset 0 0 0 4px ${PERIOD_COLORS.T2};
    font-weight: 700;
    z-index: 1;
    `;
    }
    return `
    box-shadow: inset 0 0 0 2px ${tokens(theme).accent}, inset 0 0 0 3px rgba(255, 255, 255, 0.85);
    font-weight: 700;
    z-index: 1;
    `;
  }}

  ${({ $isToday, $isHoliday }) => dayMarks($isToday, Boolean($isHoliday), 'normal')}

  &:hover {
    filter: brightness(0.94);
  }

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
    outline-offset: 2px;
    z-index: 2;
  }
`;

export const DayNumber = styled.span`
  font-size: 12px;
  font-weight: inherit;
  pointer-events: none;
  line-height: 1;
  color: inherit;
`;

export const TooltipContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${({ x }) => Math.min(x, window.innerWidth - 200)}px;
  top: ${({ y }) => Math.max(y - 40, 0)}px;
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  z-index: 1000000;
  white-space: nowrap;
  line-height: 1.6;
  font-family: ${tk('font')};
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
`;

export const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
`;

export const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

export const TooltipLabel = styled.span`
  color: #94a3b8;
`;

export const TooltipValue = styled.span`
  font-weight: 600;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${tk('textFaint')};
  font-size: 12px;
  gap: 8px;
`;

export const EmptyIcon = styled.div`
  font-size: 16px;
  line-height: 1;
`;

export const YearOverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px 16px 16px;
  flex: 1;
  overflow-y: auto;
`;

export const MiniMonth = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 10px 10px;
  background: ${tk('bg')};
  border: 1px solid ${tk('border')};
  border-radius: 8px;
`;

export const MiniMonthTitle = styled.div`
  align-self: flex-start;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${tk('text')};
  margin-bottom: 6px;
  padding: 2px 6px;
  margin-left: -6px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${accentTint(12)};
    color: ${tk('accent')};
  }
`;

export const MiniMonthGrid = styled.div<{ showWeekNumbers: boolean }>`
  display: grid;
  grid-template-columns: ${({ showWeekNumbers }) =>
    showWeekNumbers ? '16px repeat(7, 1fr)' : 'repeat(7, 1fr)'};
  gap: 2px;
`;

export const MiniDayHeader = styled.div`
  text-align: center;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${tk('textFaint')};
  text-transform: uppercase;
  padding-bottom: 2px;
`;

export const MiniWeekNum = styled.div`
  cursor: pointer;
  border-radius: 3px;
  font-size: 8px;
  color: ${tk('textFaint')};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${accentTint(12)};
    color: ${tk('accent')};
  }
`;

export interface MiniDayCellProps extends HeatProps {
  isSelected: boolean;
  $isToday: boolean;
  baseColor: string;
}

export const MiniDayCell = styled.div<MiniDayCellProps>`
  box-sizing: border-box;
  aspect-ratio: 1;
  border-radius: 3px;
  cursor: pointer;
  transition: box-shadow 0.12s ease, filter 0.12s ease;
  position: relative;

  background-color: ${({ $heat, theme }) => ($heat ? $heat.background : tokens(theme).bgMuted)};
  border: 1px solid ${({ $heat, theme }) => ($heat ? 'transparent' : tokens(theme).border)};
  color: ${({ $heat }) => ($heat?.dark ? '#ffffff' : '#334155')};

  ${({ isSelected, theme }) =>
    isSelected
      ? `
    box-shadow: inset 0 0 0 2px ${tokens(theme).accent}, inset 0 0 0 3px rgba(255, 255, 255, 0.85);
    z-index: 1;
    `
      : ''}

  ${({ $isToday, $isHoliday }) => dayMarks($isToday, Boolean($isHoliday), 'mini')}

  &:hover {
    filter: brightness(0.92);
  }

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
    outline-offset: 1px;
    z-index: 2;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 999999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 210px 24px 24px 24px;
`;

export const ModalContent = styled.div`
  background: ${tk('bg')};
  color: ${tk('text')};
  font-family: ${tk('font')};
  font-variant-numeric: tabular-nums;
  border: 1px solid ${tk('border')};
  border-radius: 12px;
  width: 96%;
  max-width: 1350px;
  height: auto;
  max-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.35);
  overflow: hidden;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${tk('border')};
  background: ${tk('bg')};
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${tk('text')};
`;

export const ModalCloseButton = styled.button`
  ${controlBase}
`;

export const MacroBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 16px;
  background: ${tk('bgMuted')};
  border-bottom: 1px solid ${tk('border')};
`;

export const MacroButton = styled.button<{ $tone?: 'danger' }>`
  box-sizing: border-box;
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $tone, theme }) => ($tone === 'danger' ? tokens(theme).danger : tokens(theme).text)};
  background: ${tk('bg')};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'danger' ? tokens(theme).danger : tokens(theme).borderStrong)};
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${accentTint(10)};
    border-color: ${tk('accent')};
    color: ${tk('accent')};
  }

  &:focus-visible {
    outline: 2px solid ${tk('accent')};
    outline-offset: 1px;
  }
`;

export const LegendBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px 10px;
  border-top: 1px solid ${tk('border')};
  font-size: 11px;
  color: ${tk('textMuted')};
`;

export const LegendSwatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  border: 1px solid ${tk('border')};
  box-sizing: border-box;
`;

export const LegendSeparator = styled.span`
  display: inline-block;
  width: 1px;
  height: 14px;
  margin: 0 6px;
  background: ${tk('border')};
`;

export const ConfigHint = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: #92400e;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
`;
