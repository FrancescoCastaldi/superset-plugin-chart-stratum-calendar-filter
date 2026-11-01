import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { formatDateKey, getDatesInMonth, getDatesInYear, getDatesBetween } from '../utils/dateUtils';
import { DefaultValueMode } from '../types';
import { getPresetDates, PRESET_IDS, PresetId } from '../utils/presets';
import { buildExtraFormData, FilterTypeMode, InValueFormat } from '../utils/filterMask';
import type { PeriodSlot } from '../utils/periods';

export function useSelectionMask(
  filterState: any,
  setDataMask: ((mask: any) => void) | undefined,
  filterTypeMode: FilterTypeMode,
  dateColumn: string | undefined,
  defaultValueMode: DefaultValueMode,
  customDefaultStartDate?: string,
  customDefaultEndDate?: string,
  inValueFormat: InValueFormat = 'date',
  comparisonEnabled = true,
  /**
   * Text for `filterState.label`, which Superset shows in the applied filters list instead of every day,
   * and the names and readable ranges of the two periods that charts can show (`custom`).
   */
  describe?: (t1: string[], t2: string[]) => { label: string; custom?: Record<string, unknown> },
) {
  const [requestedSlot, setActiveSlot] = useState<PeriodSlot>('T1');
  // Without a comparison period the reference period is the only one that can be edited
  const activeSlot: PeriodSlot = comparisonEnabled ? requestedSlot : 'T1';
  const lastEmittedT1Ref = useRef<string[]>([]);
  const lastEmittedT2Ref = useRef<string[]>([]);

  // Selected dates for T1 from filterState (purely controlled)
  const selectedDatesT1: Set<string> = useMemo(() => {
    if (filterState?.selectedDatesT1) {
      const vals = Array.isArray(filterState.selectedDatesT1) ? filterState.selectedDatesT1 : Object.keys(filterState.selectedDatesT1);
      return new Set(vals.map(String));
    }
    if (filterState?.selectedValues) {
      return new Set(Object.keys(filterState.selectedValues));
    }
    if (filterState?.value) {
      const vals = Array.isArray(filterState.value) ? filterState.value : [filterState.value];
      return new Set(vals.map(String));
    }
    return new Set<string>();
  }, [filterState]);

  // Selected dates for T2
  const selectedDatesT2: Set<string> = useMemo(() => {
    if (!comparisonEnabled) return new Set<string>();
    if (filterState?.selectedDatesT2) {
      const vals = Array.isArray(filterState.selectedDatesT2) ? filterState.selectedDatesT2 : Object.keys(filterState.selectedDatesT2);
      return new Set(vals.map(String));
    }
    return new Set<string>(lastEmittedT2Ref.current);
  }, [filterState, comparisonEnabled]);

  // Unified dual selection emission handler
  const emitSelectionDual = useCallback(
    (t1Array: string[], t2Array: string[]) => {
      if (!setDataMask) return;
      const sortedT1 = Array.from(new Set(t1Array)).sort();
      const sortedT2 = Array.from(new Set(t2Array)).sort();
      lastEmittedT1Ref.current = sortedT1;
      lastEmittedT2Ref.current = sortedT2;

      const extraFormData = buildExtraFormData(sortedT1, dateColumn, filterTypeMode, inValueFormat);

      const described = describe && (sortedT1.length > 0 || sortedT2.length > 0) ? describe(sortedT1, sortedT2) : null;

      // The comparison period travels as an explicit range in time_compare
      let t2Range: unknown;
      if (sortedT2.length > 0 && dateColumn) {
        const t2RangeExtra = buildExtraFormData(sortedT2, dateColumn, 'time_range', inValueFormat);
        t2Range = t2RangeExtra.time_range;
        if (t2Range) {
          (extraFormData as any).time_compare = [t2Range];
        }
      }
      // Superset only keeps this key when it is a list, hence the single element array. It carries what
      // a chart needs to name the two periods: their labels and readable ranges, not every selected day.
      if (dateColumn && (described?.custom || t2Range)) {
        (extraFormData as any).custom_form_data = [
          {
            ...described?.custom,
            t1_range: extraFormData.time_range,
            t2_range: t2Range,
            active_slot: activeSlot,
          },
        ];
      }

      let selectedValues: Record<string, string> | null = null;
      if (sortedT1.length) {
        selectedValues = {};
        sortedT1.forEach(date => {
          (selectedValues as Record<string, string>)[date] = date;
        });
      }

      const filterStatePayload: Record<string, any> = {
        value: sortedT1.length ? sortedT1 : null,
        selectedValues,
      };
      if (described) {
        filterStatePayload.label = described.label;
      }
      if (sortedT2.length > 0) {
        filterStatePayload.selectedDatesT1 = sortedT1;
        filterStatePayload.selectedDatesT2 = sortedT2;
        filterStatePayload.activeSlot = activeSlot;
      }

      setDataMask({
        extraFormData,
        filterState: filterStatePayload,
      });
    },
    [setDataMask, filterTypeMode, dateColumn, inValueFormat, activeSlot, describe],
  );

  const emitSelection = useCallback(
    (datesArray: string[]) => {
      if (activeSlot === 'T2') {
        const t1 = selectedDatesT1.size > 0 ? Array.from(selectedDatesT1) : lastEmittedT1Ref.current;
        emitSelectionDual(t1, datesArray);
      } else {
        const t2 = selectedDatesT2.size > 0 ? Array.from(selectedDatesT2) : lastEmittedT2Ref.current;
        emitSelectionDual(datesArray, t2);
      }
    },
    [activeSlot, emitSelectionDual, selectedDatesT1, selectedDatesT2],
  );

  // Initialize Default Value on Mount if not already selected
  const defaultInitialized = useRef(false);
  useEffect(() => {
    if (defaultInitialized.current || !setDataMask || selectedDatesT1.size > 0 || defaultValueMode === 'none') {
      return;
    }
    defaultInitialized.current = true;
    const now = new Date();
    const currentY = now.getFullYear();
    const currentM = now.getMonth() + 1;
    const todayFormatted = formatDateKey(now);

    if (defaultValueMode === 'today') {
      emitSelection([todayFormatted]);
    } else if (defaultValueMode === 'current_month') {
      emitSelection(getDatesInMonth(currentY, currentM));
    } else if (defaultValueMode === 'current_year') {
      emitSelection(getDatesInYear(currentY));
    } else if (PRESET_IDS.includes(defaultValueMode as PresetId)) {
      emitSelection(getPresetDates(defaultValueMode as PresetId, now, 1));
    } else if (defaultValueMode === 'custom' && customDefaultStartDate && customDefaultEndDate) {
      emitSelection(getDatesBetween(customDefaultStartDate, customDefaultEndDate));
    }
  }, [defaultValueMode, setDataMask, selectedDatesT1.size, customDefaultStartDate, customDefaultEndDate, emitSelection]);

  const clearSelection = useCallback(() => {
    if (activeSlot === 'T2') {
      emitSelectionDual(Array.from(selectedDatesT1), []);
    } else {
      emitSelectionDual([], Array.from(selectedDatesT2));
    }
  }, [activeSlot, emitSelectionDual, selectedDatesT1, selectedDatesT2]);

  /** Clear one period without touching the other, whichever is active */
  const clearSlot = useCallback(
    (slot: PeriodSlot) => {
      if (slot === 'T2') {
        emitSelectionDual(Array.from(selectedDatesT1), []);
      } else {
        emitSelectionDual([], Array.from(selectedDatesT2));
      }
    },
    [emitSelectionDual, selectedDatesT1, selectedDatesT2],
  );

  const clearAllSlots = useCallback(() => {
    emitSelectionDual([], []);
  }, [emitSelectionDual]);

  // Click single or shift select helper
  const handleDayToggle = useCallback(
    (dateStr: string) => {
      if (!setDataMask) return;
      const currentDates = activeSlot === 'T2' ? selectedDatesT2 : selectedDatesT1;
      let newSelected = new Set(currentDates);

      if (currentDates.size === 1) {
        const firstDate = Array.from(currentDates)[0];
        if (firstDate === dateStr) {
          newSelected.delete(dateStr);
        } else {
          newSelected.clear();
          const range = getDatesBetween(firstDate, dateStr);
          range.forEach(d => newSelected.add(d));
        }
      } else {
        newSelected.clear();
        newSelected.add(dateStr);
      }

      emitSelection(Array.from(newSelected));
    },
    [setDataMask, activeSlot, selectedDatesT1, selectedDatesT2, emitSelection],
  );

  // Drag to select state
  const [dragState, setDragState] = useState<{ isDragging: boolean; start: string | null; current: string | null }>({
    isDragging: false,
    start: null,
    current: null,
  });

  // The cell and the window both report the button release; only the first one counts
  const dragFinished = useRef(true);

  const handleDragStart = useCallback((dateStr: string) => {
    dragFinished.current = false;
    setDragState({ isDragging: true, start: dateStr, current: dateStr });
  }, []);

  const handleDragEnter = useCallback((dateStr: string) => {
    setDragState(prev => prev.isDragging ? { ...prev, current: dateStr } : prev);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || dragFinished.current) return;
    dragFinished.current = true;
    if (dragState.start && dragState.current) {
      if (dragState.start !== dragState.current) {
        // Was a real drag, emit range
        const range = getDatesBetween(dragState.start, dragState.current);
        emitSelection(range);
      } else {
        // Was a click (start == current), let handleDayToggle do its thing
      }
    }
    setDragState({ isDragging: false, start: null, current: null });
  }, [dragState, emitSelection]);

  // Releasing the button outside any day cell would otherwise leave the drag stuck
  useEffect(() => {
    if (!dragState.isDragging) return undefined;
    window.addEventListener('mouseup', handleDragEnd);
    return () => window.removeEventListener('mouseup', handleDragEnd);
  }, [dragState.isDragging, handleDragEnd]);

  const effectiveSelectedDates = useMemo(() => {
    if (dragState.isDragging && dragState.start && dragState.current && dragState.start !== dragState.current) {
      return new Set(getDatesBetween(dragState.start, dragState.current));
    }
    return activeSlot === 'T2' ? selectedDatesT2 : selectedDatesT1;
  }, [activeSlot, selectedDatesT1, selectedDatesT2, dragState]);

  return {
    selectedDates: effectiveSelectedDates,
    selectedDatesT1,
    selectedDatesT2,
    activeSlot,
    setActiveSlot,
    emitSelection,
    emitSelectionDual,
    clearSelection,
    clearSlot,
    clearAllSlots,
    handleDayToggle,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
}
