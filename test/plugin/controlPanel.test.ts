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
import config from '../../src/plugin/controlPanel';

function findControl(cfg: any, controlName: string): any {
  for (const section of cfg.controlPanelSections) {
    for (const row of section.controlSetRows) {
      for (const item of row) {
        if (typeof item === 'string' && item === controlName) {
          return { name: item };
        }
        if (item && typeof item === 'object' && item.name === controlName) {
          return item;
        }
      }
    }
  }
  return null;
}

function getSection(cfg: any, label: string): any {
  return cfg.controlPanelSections.find((s: any) => s.label === label);
}

describe('SupersetPluginChartCalendarFilter controlPanel', () => {
  it('defines 7 sections in controlPanelSections', () => {
    expect(config.controlPanelSections).toHaveLength(7);
    const labels = config.controlPanelSections.map((s: any) => s.label);
    expect(labels).toEqual([
      'Query',
      'Periods',
      'Appearance',
      'Layout',
      'Holidays',
      'Filter behaviour',
      'Shortcuts',
    ]);
  });

  describe('tabOverride organization', () => {
    it('sets tabOverride: data on data and query sections', () => {
      const dataSections = ['Query', 'Periods', 'Filter behaviour', 'Shortcuts'];
      dataSections.forEach(label => {
        const section = getSection(config, label);
        expect(section).toBeDefined();
        expect(section.tabOverride).toBe('data');
      });
    });

    it('sets tabOverride: customize on styling, layout and holiday sections', () => {
      const customizeSections = ['Appearance', 'Layout', 'Holidays'];
      customizeSections.forEach(label => {
        const section = getSection(config, label);
        expect(section).toBeDefined();
        expect(section.tabOverride).toBe('customize');
      });
    });
  });

  describe('preservation of all 29 control keys', () => {
    const expectedControls = [
      'metric',
      'groupby',
      'date_column',
      'value_aggregation',
      'adhoc_filters',
      'enable_comparison',
      'auto_comparison',
      'reference_label',
      'comparison_label',
      'color_scheme',
      'scale_type',
      'scale_thresholds',
      'show_legend',
      'first_day_of_week',
      'locale',
      'show_week_numbers',
      'show_year_dropdown',
      'enable_overview',
      'cell_density',
      'holiday_mode',
      'custom_holidays',
      'exclude_holidays_from_workdays',
      'filter_type_mode',
      'in_value_format',
      'default_value_mode',
      'custom_default_start_date',
      'custom_default_end_date',
      'show_macro_shortcuts',
      'enabled_presets',
    ];

    expectedControls.forEach(controlName => {
      it(`includes control: ${controlName}`, () => {
        const control = findControl(config, controlName);
        expect(control).not.toBeNull();
      });
    });
  });

  describe('progressive disclosure visibility rules', () => {
    describe('value_aggregation', () => {
      const ctrl = findControl(config, 'value_aggregation');

      it('has a visibility function', () => {
        expect(typeof ctrl.config.visibility).toBe('function');
      });

      it('is hidden when groupby is undefined, null, empty string or empty array', () => {
        expect(ctrl.config.visibility({ controls: {} })).toBe(false);
        expect(ctrl.config.visibility({ controls: { groupby: { value: null } } })).toBe(false);
        expect(ctrl.config.visibility({ controls: { groupby: { value: '' } } })).toBe(false);
        expect(ctrl.config.visibility({ controls: { groupby: { value: [] } } })).toBe(false);
      });

      it('is visible when groupby has a column selection', () => {
        expect(ctrl.config.visibility({ controls: { groupby: { value: 'order_date' } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { groupby: { value: ['order_date'] } } })).toBe(true);
      });
    });

    describe('exclude_holidays_from_workdays', () => {
      const ctrl = findControl(config, 'exclude_holidays_from_workdays');

      it('has a compound visibility function', () => {
        expect(typeof ctrl.config.visibility).toBe('function');
      });

      it('is hidden when holiday_mode is none regardless of shortcuts', () => {
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'none' }, show_macro_shortcuts: { value: true } },
        })).toBe(false);
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'none' }, show_macro_shortcuts: { value: false } },
        })).toBe(false);
      });

      it('is hidden when show_macro_shortcuts is false even if holiday_mode is active', () => {
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'it' }, show_macro_shortcuts: { value: false } },
        })).toBe(false);
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'custom' }, show_macro_shortcuts: { value: false } },
        })).toBe(false);
      });

      it('is visible when holiday_mode is active and shortcuts are enabled', () => {
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'it' }, show_macro_shortcuts: { value: true } },
        })).toBe(true);
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'custom' }, show_macro_shortcuts: { value: true } },
        })).toBe(true);
        expect(ctrl.config.visibility({
          controls: { holiday_mode: { value: 'it' }, show_macro_shortcuts: { value: undefined } },
        })).toBe(true);
      });
    });

    describe('existing visibility rules preservation', () => {
      it('preserves auto_comparison visibility', () => {
        const ctrl = findControl(config, 'auto_comparison');
        expect(ctrl.config.visibility({ controls: { enable_comparison: { value: true } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { enable_comparison: { value: false } } })).toBe(false);
      });

      it('preserves scale_thresholds visibility', () => {
        const ctrl = findControl(config, 'scale_thresholds');
        expect(ctrl.config.visibility({ controls: { scale_type: { value: 'steps' } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { scale_type: { value: 'linear' } } })).toBe(false);
      });

      it('preserves in_value_format visibility', () => {
        const ctrl = findControl(config, 'in_value_format');
        expect(ctrl.config.visibility({ controls: { filter_type_mode: { value: 'auto' } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { filter_type_mode: { value: 'in_clause' } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { filter_type_mode: { value: 'time_range' } } })).toBe(false);
      });

      it('preserves custom default date visibility', () => {
        const startCtrl = findControl(config, 'custom_default_start_date');
        const endCtrl = findControl(config, 'custom_default_end_date');
        expect(startCtrl.config.visibility({ controls: { default_value_mode: { value: 'custom' } } })).toBe(true);
        expect(startCtrl.config.visibility({ controls: { default_value_mode: { value: 'none' } } })).toBe(false);
        expect(endCtrl.config.visibility({ controls: { default_value_mode: { value: 'custom' } } })).toBe(true);
        expect(endCtrl.config.visibility({ controls: { default_value_mode: { value: 'none' } } })).toBe(false);
      });

      it('preserves enabled_presets visibility', () => {
        const ctrl = findControl(config, 'enabled_presets');
        expect(ctrl.config.visibility({ controls: { show_macro_shortcuts: { value: true } } })).toBe(true);
        expect(ctrl.config.visibility({ controls: { show_macro_shortcuts: { value: false } } })).toBe(false);
      });
    });
  });
});
