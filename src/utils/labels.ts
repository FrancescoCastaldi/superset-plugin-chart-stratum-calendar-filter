import { createContext, useContext } from 'react';
import type { CalendarLocale } from '../types';
import type { PresetId } from './presets';

export interface CalendarLabels {
  /** BCP 47 tag used by Intl for month and weekday names */
  intlLocale: string;
  previous: string;
  next: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  noDataBefore: string;
  noDataAfter: string;
  selectMonth: string;
  selectYear: string;
  year: string;
  month: string;
  yearView: string;
  monthView: string;
  today: string;
  clear: string;
  expand: string;
  expandTitle: string;
  close: string;
  pickDates: string;
  datesCount: (n: number) => string;
  datesSelected: (n: number) => string;
  selectedOne: string;
  selectedMany: (n: number) => string;
  yearShortcut: (year: number) => string;
  currentMonth: string;
  workdays: string;
  noColumn: string;
  calendarTitle: string;
  /** Default name of the reference period, used when the control panel label is empty */
  currentPeriod: string;
  /** Default name of the comparison period, used when the control panel label is empty */
  comparisonPeriod: string;
  periodNotSet: string;
  periodsGroup: string;
  periodDays: (n: number) => string;
  selectPeriod: (name: string) => string;
  clearPeriod: (name: string) => string;
  tooltipValue: string;
  tooltipMax: string;
  tooltipPercent: string;
  noValue: string;
  legendLess: string;
  legendMore: string;
  legendNoData: string;
  weekTitle: (week: number) => string;
  monthTitle: (month: string) => string;
  presets: Record<PresetId, string>;
}

const IT: CalendarLabels = {
  intlLocale: 'it-IT',
  previous: 'Precedente',
  next: 'Successivo',
  previousMonth: 'Mese precedente',
  nextMonth: 'Mese successivo',
  previousYear: 'Anno precedente',
  nextYear: 'Anno successivo',
  noDataBefore: 'Nessun dato prima di questa data',
  noDataAfter: 'Nessun dato dopo questa data',
  selectMonth: 'Seleziona mese',
  selectYear: 'Seleziona anno',
  year: 'Anno',
  month: 'Mese',
  yearView: 'Vista Annuale',
  monthView: 'Vista Mensile',
  today: 'Oggi',
  clear: 'Azzera',
  expand: '🖥️ Espandi',
  expandTitle: 'Apri vista espansa in modal',
  close: '✕ Chiudi',
  pickDates: 'Seleziona Date Calendario',
  datesCount: n => `${n} date`,
  datesSelected: n => `${n} date selezionate`,
  selectedOne: '1 selezionato',
  selectedMany: n => `${n} selezionati`,
  yearShortcut: y => `🎯 Anno ${y}`,
  currentMonth: '📅 Mese Corrente',
  workdays: '💼 Feriali',
  noColumn: 'Imposta la colonna data nelle opzioni del grafico: senza colonna il filtro non viene applicato.',
  calendarTitle: 'Filtro calendario',
  currentPeriod: 'Periodo corrente',
  comparisonPeriod: 'Periodo di confronto',
  periodNotSet: 'Non impostato',
  periodsGroup: 'Periodi selezionati',
  periodDays: n => (n === 1 ? '1 giorno' : `${n} giorni`),
  selectPeriod: name => `Seleziona: ${name}`,
  clearPeriod: name => `Azzera: ${name}`,
  tooltipValue: 'Valore:',
  tooltipMax: 'Massimo:',
  tooltipPercent: '% del max:',
  noValue: 'N/D',
  legendLess: 'Meno',
  legendMore: 'Più',
  legendNoData: 'Nessun dato',
  weekTitle: w => `Seleziona la settimana ${w}`,
  monthTitle: m => `Seleziona ${m}`,
  presets: {
    today: 'Oggi',
    yesterday: 'Ieri',
    this_week: 'Questa settimana',
    last_week: 'Settimana scorsa',
    last_7_days: 'Ultimi 7 giorni',
    last_30_days: 'Ultimi 30 giorni',
    last_90_days: 'Ultimi 90 giorni',
    month_to_date: 'Da inizio mese',
    last_month: 'Mese scorso',
    last_quarter: 'Trimestre scorso',
    year_to_date: 'Da inizio anno',
    last_year: 'Anno scorso',
  },
};

const EN: CalendarLabels = {
  intlLocale: 'en-GB',
  previous: 'Previous',
  next: 'Next',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  noDataBefore: 'No data before this date',
  noDataAfter: 'No data after this date',
  selectMonth: 'Select month',
  selectYear: 'Select year',
  year: 'Year',
  month: 'Month',
  yearView: 'Year view',
  monthView: 'Month view',
  today: 'Today',
  clear: 'Clear',
  expand: '🖥️ Expand',
  expandTitle: 'Open expanded view in a dialog',
  close: '✕ Close',
  pickDates: 'Select calendar dates',
  datesCount: n => `${n} dates`,
  datesSelected: n => `${n} dates selected`,
  selectedOne: '1 selected',
  selectedMany: n => `${n} selected`,
  yearShortcut: y => `🎯 Year ${y}`,
  currentMonth: '📅 Current month',
  workdays: '💼 Working days',
  noColumn: 'Set the date column in the chart options: without a column the filter is not applied.',
  calendarTitle: 'Calendar filter',
  currentPeriod: 'Current period',
  comparisonPeriod: 'Comparison period',
  periodNotSet: 'Not set',
  periodsGroup: 'Selected periods',
  periodDays: n => (n === 1 ? '1 day' : `${n} days`),
  selectPeriod: name => `Select: ${name}`,
  clearPeriod: name => `Clear: ${name}`,
  tooltipValue: 'Value:',
  tooltipMax: 'Maximum:',
  tooltipPercent: '% of max:',
  noValue: 'N/A',
  legendLess: 'Less',
  legendMore: 'More',
  legendNoData: 'No data',
  weekTitle: w => `Select week ${w}`,
  monthTitle: m => `Select ${m}`,
  presets: {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This week',
    last_week: 'Last week',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    last_90_days: 'Last 90 days',
    month_to_date: 'Month to date',
    last_month: 'Last month',
    last_quarter: 'Last quarter',
    year_to_date: 'Year to date',
    last_year: 'Last year',
  },
};

/** `auto` follows the browser language: Italian when it starts with `it`, English otherwise */
export function resolveLocale(locale: CalendarLocale | undefined): 'it' | 'en' {
  if (locale === 'it') return 'it';
  if (locale === 'auto') {
    const lang = typeof navigator !== 'undefined' ? navigator.language || '' : '';
    return lang.toLowerCase().startsWith('it') ? 'it' : 'en';
  }
  return 'en';
}

export function getLabels(locale: CalendarLocale | undefined): CalendarLabels {
  return resolveLocale(locale) === 'en' ? EN : IT;
}

/** Month name for a 1-based month, capitalised, in the locale of the labels */
export function getMonthName(labels: CalendarLabels, month: number, style: 'long' | 'short' = 'long'): string {
  const raw = new Intl.DateTimeFormat(labels.intlLocale, { month: style }).format(new Date(2000, month - 1, 1));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Short weekday names starting on `firstDayOfWeek` (0 = Sunday) */
export function getWeekdayLabels(labels: CalendarLabels, firstDayOfWeek: number): string[] {
  const formatter = new Intl.DateTimeFormat(labels.intlLocale, { weekday: 'short' });
  // 2023-01-01 is a Sunday
  const names = Array.from({ length: 7 }, (_, i) => {
    const raw = formatter.format(new Date(2023, 0, 1 + i)).replace('.', '');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });
  return Array.from({ length: 7 }, (_, i) => names[(i + firstDayOfWeek) % 7]);
}

/**
 * Display data shared by the calendar components, so they do not need a
 * dozen extra props: texts, holidays and the week/month shortcuts.
 */
export interface CalendarDisplay {
  labels: CalendarLabels;
  holidays: Map<string, string>;
  /** Heat color of a value, `null` for days without data */
  heatStyle: (value: number | null, hasData: boolean) => { background: string; dark: boolean } | null;
  onWeekSelect?: (dateKey: string) => void;
  onMonthSelect?: (month: number) => void;
}

export const CalendarDisplayContext = createContext<CalendarDisplay>({
  labels: IT,
  holidays: new Map(),
  heatStyle: () => null,
});

export function useCalendarDisplay(): CalendarDisplay {
  return useContext(CalendarDisplayContext);
}
