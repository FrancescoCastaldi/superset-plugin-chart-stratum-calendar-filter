#!/usr/bin/env node
/**
 * Single source of truth for the esbuild entry points of the plugin.
 *
 * The previous package.json scripts (build-cjs / build-esm / dev) each
 * duplicated the same hardcoded list of source files. This script keeps
 * the list in exactly one place. Every entry point is emitted per-file
 * (no bundling) so the dual cjs (lib/) and esm (esm/) layouts consumed by
 * package.json `main`/`module` stay intact; output is minified for an
 * es2020-capable browser baseline with linked sourcemaps.
 *
 * Usage:
 *   node scripts/build.js --format=cjs --outdir=lib
 *   node scripts/build.js --format=esm --outdir=esm
 *   node scripts/build.js --format=esm --outdir=esm --watch
 */

const esbuild = require('esbuild');

/** Ordered entry points mirroring the src/ module structure. */
const ENTRY_POINTS = [
  'src/index.ts',
  'src/CalendarFilter.tsx',
  'src/types.ts',
  'src/plugin/index.ts',
  'src/plugin/buildQuery.ts',
  'src/plugin/controlPanel.ts',
  'src/plugin/transformProps.ts',
  'src/styles/CalendarFilter.styles.ts',
  'src/hooks/useCalendarData.ts',
  'src/hooks/useSelectionMask.ts',
  'src/hooks/useMacroActions.ts',
  'src/hooks/useCalendarTooltip.ts',
  'src/hooks/useViewSelection.ts',
  'src/utils/themeUtils.ts',
  'src/utils/dateUtils.ts',
  'src/utils/calendarGrid.ts',
  'src/utils/colorScale.ts',
  'src/utils/filterMask.ts',
  'src/utils/gridKeys.ts',
  'src/utils/holidays.ts',
  'src/utils/labels.ts',
  'src/utils/presets.ts',
  'src/utils/periods.ts',
  'src/components/HeatLegend.tsx',
  'src/components/MacroShortcuts.tsx',
  'src/components/CalendarTooltip.tsx',
  'src/components/MonthGrid.tsx',
  'src/components/YearOverview.tsx',
  'src/components/CalendarModal.tsx',
  'src/components/PeriodSummary.tsx',
];

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find(a => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

async function main() {
  const format = getArg('format');
  const outdir = getArg('outdir');
  const watch = process.argv.includes('--watch');

  if (!format || !outdir) {
    console.error(
      'Usage: node scripts/build.js --format=<cjs|esm> --outdir=<dir> [--watch]',
    );
    process.exit(1);
  }

  const options = {
    entryPoints: ENTRY_POINTS,
    outdir,
    format,
    target: ['es2020', 'chrome110', 'firefox110', 'safari16'],
    minify: true,
    sourcemap: 'linked',
    loader: { '.png': 'dataurl' },
  };

  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log(
      `[build] watching ${format} -> ${outdir} (${ENTRY_POINTS.length} entry points)`,
    );
    return;
  }

  await esbuild.build(options);
  console.log(`[build] ${format} -> ${outdir} (${ENTRY_POINTS.length} entry points)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
