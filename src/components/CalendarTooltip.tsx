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
import React, { memo } from 'react';
import {
  TooltipContainer,
  TooltipTitle,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
} from '../styles/CalendarFilter.styles';
import { TooltipData } from '../types';
import { useCalendarDisplay } from '../utils/labels';
import { formatInteger } from '../utils/numberFormat';

interface CalendarTooltipProps {
  tooltip: TooltipData;
  maxValue: number;
  /** Locale-format numeric values (full chart); raw values for the compact bar */
  formatNumbers?: boolean;
}

/** Hover tooltip showing date, holiday, value, max, and percentage of max */
const CalendarTooltip = memo(function CalendarTooltip({
  tooltip,
  maxValue,
  formatNumbers = false,
}: CalendarTooltipProps) {
  const { labels } = useCalendarDisplay();
  const displayValue = formatNumbers
    ? (tooltip.value != null ? formatInteger(tooltip.value) : labels.noValue)
    : tooltip.value != null
      ? tooltip.value
      : labels.noValue;
  const displayMax = formatNumbers ? formatInteger(maxValue) : maxValue;

  return (
    <TooltipContainer x={tooltip.x} y={tooltip.y}>
      <TooltipTitle>{tooltip.date}</TooltipTitle>
      {tooltip.holiday && <TooltipRow>🎉 {tooltip.holiday}</TooltipRow>}
      {tooltip.value != null && (
        <>
          <TooltipRow>
            <TooltipLabel>{labels.tooltipValue}</TooltipLabel>
            <TooltipValue>{displayValue}</TooltipValue>
          </TooltipRow>
          <TooltipRow>
            <TooltipLabel>{labels.tooltipMax}</TooltipLabel>
            <TooltipValue>{displayMax}</TooltipValue>
          </TooltipRow>
          <TooltipRow>
            <TooltipLabel>{labels.tooltipPercent}</TooltipLabel>
            <TooltipValue>{tooltip.percentage}%</TooltipValue>
          </TooltipRow>
        </>
      )}
    </TooltipContainer>
  );
});

export default CalendarTooltip;
