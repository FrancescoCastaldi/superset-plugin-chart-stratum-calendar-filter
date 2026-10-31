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
import { t } from '@apache-superset/core/translation';
import {
  ControlPanelConfig,
  sharedControls,
} from '@superset-ui/chart-controls';
import { DEFAULT_PRESETS, PRESET_IDS } from '../utils/presets';
import { getLabels } from '../utils/labels';

const presetLabels = getLabels('en').presets;

/** Columns of the dataset as select choices; any column can be a date (string, integer, timestamp) */
function datasetColumnChoices({ datasource }: any): { choices: [string, string][] } {
  const columns: any[] = datasource?.columns ?? [];
  return {
    choices: columns.map(c => [c.column_name, c.verbose_name || c.column_name] as [string, string]),
  };
}

const whenValue =
  (control: string, ...values: string[]) =>
  ({ controls }: any) =>
    values.includes(controls?.[control]?.value);

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'metric',
            config: {
              ...sharedControls.metric,
              clearable: true,
              validators: [],
            },
          },
        ],
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              label: t('Heatmap date column'),
              description: t(
                'Optional. Date column used to color the days; leave empty to use the calendar only as a filter.',
              ),
              multi: false,
              validators: [],
              clearable: true,
            },
          },
        ],
        [
          {
            name: 'date_column',
            config: {
              type: 'SelectControl',
              label: t('Filter target column'),
              description: t(
                'Column the filter is applied to. Defaults to the heatmap column or, in a native filter, to the column it is bound to. Any column works: date, timestamp, text or integer.',
              ),
              freeForm: true,
              clearable: true,
              default: null,
              choices: [],
              mapStateToProps: datasetColumnChoices,
            },
          },
        ],
        [
          {
            name: 'value_aggregation',
            config: {
              type: 'SelectControl',
              label: t('Combine rows of the same day'),
              description: t('How several rows that fall on the same day become one value.'),
              default: 'sum',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['sum', t('Sum')],
                ['avg', t('Average')],
                ['max', t('Maximum')],
                ['min', t('Minimum')],
                ['count', t('Row count')],
              ],
            },
          },
        ],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Appearance'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'color_scheme',
            config: {
              type: 'SelectControl',
              label: t('Color Scheme'),
              default: 'supersetColors',
              choices: [
                ['supersetColors', 'Superset Default'],
                ['greens', 'Greens'],
                ['blues', 'Blues'],
                ['oranges', 'Oranges'],
                ['reds', 'Reds'],
                ['purples', 'Purples'],
              ],
              renderTrigger: true,
              description: t('Color scheme for the calendar heatmap'),
            },
          },
        ],
        [
          {
            name: 'scale_type',
            config: {
              type: 'SelectControl',
              label: t('Color scale'),
              description: t(
                'Linear suits evenly spread values; logarithmic or square root keep a few very high days from flattening the rest; custom thresholds uses your own steps.',
              ),
              default: 'linear',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['linear', t('Linear')],
                ['log', t('Logarithmic')],
                ['sqrt', t('Square root')],
                ['steps', t('Custom thresholds')],
              ],
            },
          },
        ],
        [
          {
            name: 'scale_thresholds',
            config: {
              type: 'TextControl',
              label: t('Thresholds'),
              description: t('Comma separated values, e.g. 10, 50, 100. Each threshold starts a darker shade.'),
              default: '',
              renderTrigger: true,
              visibility: whenValue('scale_type', 'steps'),
            },
          },
        ],
        [
          {
            name: 'show_legend',
            config: {
              type: 'CheckboxControl',
              label: t('Show Legend'),
              renderTrigger: true,
              default: true,
              description: t('Show or hide the color legend'),
            },
          },
        ],
        [
          {
            name: 'first_day_of_week',
            config: {
              type: 'SelectControl',
              label: t('First Day of Week'),
              default: 0,
              choices: [
                [0, 'Sunday'],
                [1, 'Monday'],
              ],
              renderTrigger: true,
              description: t('Which day to start the week on'),
            },
          },
        ],
        [
          {
            name: 'locale',
            config: {
              type: 'SelectControl',
              label: t('Calendar language'),
              description: t('Language of month names, weekdays and buttons. Auto follows the browser.'),
              default: 'en',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['it', 'Italiano'],
                ['en', 'English'],
                ['auto', t('Auto (browser)')],
              ],
            },
          },
        ],
      ],
    },
    {
      label: t('Layout'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'show_week_numbers',
            config: {
              type: 'CheckboxControl',
              label: t('Show Week Numbers'),
              renderTrigger: true,
              default: false,
              description: t('Display ISO week numbers on the left side of each row; clicking one selects that week'),
            },
          },
        ],
        [
          {
            name: 'show_year_dropdown',
            config: {
              type: 'CheckboxControl',
              label: t('Show Year Dropdown'),
              renderTrigger: true,
              default: true,
              description: t('Show a dropdown to jump to any year'),
            },
          },
        ],
        [
          {
            name: 'enable_overview',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Year Overview'),
              renderTrigger: true,
              default: true,
              description: t('Allow switching between single-month and full-year overview'),
            },
          },
        ],
        [
          {
            name: 'cell_density',
            config: {
              type: 'SelectControl',
              label: t('Cell Density'),
              default: 'compact',
              choices: [
                ['compact', 'Compact'],
                ['normal', 'Normal'],
              ],
              renderTrigger: true,
              description: t('Calendar cell size: Compact for tighter fit, Normal for larger cells'),
            },
          },
        ],
      ],
    },
    {
      label: t('Holidays'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'holiday_mode',
            config: {
              type: 'SelectControl',
              label: t('Highlight holidays'),
              default: 'none',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['none', t('None')],
                ['it', t('Italian national holidays (+ custom list)')],
                ['custom', t('Custom list only')],
              ],
              description: t(
                'Holidays are shown in red, named in the tooltip and can be skipped by the working days shortcut.',
              ),
            },
          },
        ],
        [
          {
            name: 'custom_holidays',
            config: {
              type: 'TextAreaControl',
              label: t('Custom holidays'),
              default: '',
              rows: 4,
              renderTrigger: true,
              description: t(
                'One per line or comma separated. 2026-06-15 is a single day, 12-24 repeats every year; add =Name to label it, e.g. 12-24=Christmas Eve.',
              ),
              visibility: whenValue('holiday_mode', 'it', 'custom'),
            },
          },
        ],
        [
          {
            name: 'exclude_holidays_from_workdays',
            config: {
              type: 'CheckboxControl',
              label: t('Working days skip holidays'),
              default: true,
              renderTrigger: true,
              description: t('The working days shortcut leaves out highlighted holidays as well as weekends.'),
              visibility: whenValue('holiday_mode', 'it', 'custom'),
            },
          },
        ],
      ],
    },
    {
      label: t('Filter behaviour'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'filter_type_mode',
            config: {
              type: 'SelectControl',
              label: t('Emitted filter'),
              default: 'auto',
              clearable: false,
              choices: [
                ['auto', t('Automatic: range if contiguous, otherwise list of dates')],
                ['time_range', t('Always a time range (first to last day)')],
                ['in_clause', t('Always a list of dates (IN)')],
              ],
              renderTrigger: true,
              description: t(
                'A time range works on any date or timestamp column. A list of dates matches exactly the days picked, but the column values must look like those dates.',
              ),
            },
          },
        ],
        [
          {
            name: 'in_value_format',
            config: {
              type: 'SelectControl',
              label: t('Date format in lists'),
              default: 'date',
              clearable: false,
              choices: [
                ['date', t('Date (2026-04-15)')],
                ['datetime', t('Timestamp (2026-04-15 00:00:00)')],
                ['epoch_ms', t('Epoch milliseconds')],
              ],
              renderTrigger: true,
              description: t('Match the type of the filter target column when a list of dates is used.'),
              visibility: whenValue('filter_type_mode', 'auto', 'in_clause'),
            },
          },
        ],
        [
          {
            name: 'default_value_mode',
            config: {
              type: 'SelectControl',
              label: t('Initial selection'),
              default: 'none',
              clearable: false,
              choices: [
                ['none', t('Nothing (all dates)')],
                ['today', presetLabels.today],
                ['current_month', t('Current month')],
                ['current_year', t('Current year')],
                ...PRESET_IDS.filter(id => id !== 'today').map(id => [id, presetLabels[id]]),
                ['custom', t('Custom range')],
              ],
              renderTrigger: true,
              description: t('Selection applied when the filter opens'),
            },
          },
        ],
        [
          {
            name: 'custom_default_start_date',
            config: {
              type: 'TextControl',
              label: t('Initial range start'),
              default: '',
              placeholder: 'YYYY-MM-DD',
              renderTrigger: true,
              visibility: whenValue('default_value_mode', 'custom'),
            },
          },
          {
            name: 'custom_default_end_date',
            config: {
              type: 'TextControl',
              label: t('Initial range end'),
              default: '',
              placeholder: 'YYYY-MM-DD',
              renderTrigger: true,
              visibility: whenValue('default_value_mode', 'custom'),
            },
          },
        ],
        [
          {
            name: 'show_macro_shortcuts',
            config: {
              type: 'CheckboxControl',
              label: t('Show shortcuts'),
              renderTrigger: true,
              default: true,
              description: t(
                'Show quick-selection buttons (year, month, quarters, working days and the relative dates below)',
              ),
            },
          },
        ],
        [
          {
            name: 'enabled_presets',
            config: {
              type: 'SelectControl',
              label: t('Relative date shortcuts'),
              multi: true,
              default: DEFAULT_PRESETS,
              choices: PRESET_IDS.map(id => [id, presetLabels[id]]),
              renderTrigger: true,
              description: t('Buttons that select a period relative to today, in the order chosen.'),
              visibility: ({ controls }: any) => controls?.show_macro_shortcuts?.value !== false,
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    metric: {
      label: t('Heatmap metric (optional)'),
      description: t('Optional metric used to color the days. Without one, each row counts as one record.'),
    },
    groupby: {
      ...sharedControls.groupby,
      label: t('Heatmap date column'),
      description: t('Optional date column used to color the days; leave empty to use the calendar only as a filter.'),
      multi: false,
      validators: [],
      clearable: true,
    },
  },
};

export default config;
