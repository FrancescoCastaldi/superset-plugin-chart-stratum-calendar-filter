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
import { LegendBar, LegendSeparator, LegendSwatch } from '../styles/CalendarFilter.styles';
import { useCalendarDisplay } from '../utils/labels';
import { formatInteger } from '../utils/numberFormat';

interface HeatLegendProps {
  palette: string[];
  min: number;
  max: number;
}

/** Color ramp from the lowest to the highest value, plus the "no data" swatch */
const HeatLegend = memo(function HeatLegend({ palette, min, max }: HeatLegendProps) {
  const { labels } = useCalendarDisplay();
  return (
    <LegendBar data-testid="heat-legend">
      <LegendSwatch $color="transparent" title={labels.legendNoData} />
      <span>{labels.legendNoData}</span>
      <LegendSeparator />
      <span>{labels.legendLess}</span>
      <strong>{formatInteger(min)}</strong>
      {palette.map(color => (
        <LegendSwatch key={color} $color={color} />
      ))}
      <strong>{formatInteger(max)}</strong>
      <span>{labels.legendMore}</span>
    </LegendBar>
  );
});

export default HeatLegend;
