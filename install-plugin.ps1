<#
.SYNOPSIS
    Automated installer script for Calendar Filter Chart Plugin in Apache Superset.
.DESCRIPTION
    Installs and registers the Calendar Filter chart plugin into an Apache Superset instance:
    1. Locates and validates the Apache Superset root directory.
    2. Copies plugin files into superset-frontend/plugins/superset-plugin-chart-stratum-calendar-filter.
    3. Safely parses and updates MainPreset.ts with backup (MainPreset.ts.bak) and idempotency:
       - import { CalendarFilterPlugin } from '../../../plugins/superset-plugin-chart-stratum-calendar-filter/src';
       - new CalendarFilterPlugin().configure({ key: 'calendar_filter' }),
       Legacy registration variants (alias key 'superset-plugin-chart-calendar-filter',
       SupersetPluginChartCalendarFilter class, `.register()` lines, duplicates) are
       normalized to the canonical form instead of adding new lines.
    4. Cleans stale Webpack cache.
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$SupersetPath,

    [Parameter(Position = 1)]
    [string]$PluginPath,

    [switch]$CleanReinstall,
    [switch]$RebuildFrontend,
    [switch]$SkipBuild,
    [switch]$SkipCleanCache,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Color([string]$text, [string]$color = "White") {
    Write-Host $text -ForegroundColor $color
}

Write-Color "================================================================" "Cyan"
Write-Color "   Calendar Filter - Apache Superset Chart Plugin Installer     " "Cyan"
Write-Color "   Interactive Calendar Heatmap & Dashboard Cross-Filtering     " "Cyan"
Write-Color "================================================================" "Cyan"
Write-Color ""

if (-not $PluginPath) {
    $CurrentDir = (Get-Location).Path
    if (Test-Path (Join-Path $CurrentDir "package.json")) {
        $PluginPath = $CurrentDir
    } elseif (Test-Path (Join-Path $PSScriptRoot "src\index.ts")) {
        $PluginPath = $PSScriptRoot
    } elseif (Test-Path (Join-Path (Split-Path -Parent $PSScriptRoot) "src\index.ts")) {
        $PluginPath = Split-Path -Parent $PSScriptRoot
    } else {
        $PluginPath = $PSScriptRoot
    }
}

$ResolvedPluginPath = (Resolve-Path $PluginPath).Path
if (-not (Test-Path (Join-Path $ResolvedPluginPath "package.json"))) {
    Write-Color "[ERROR] Cannot find the plugin package.json in '$ResolvedPluginPath'!" "Red"
    exit 1
}
Write-Color "[INFO] Plugin folder (source): $ResolvedPluginPath" "Green"

$DefaultCompanyCandidate = "C:\Users\admmaps\superset_6_1_0\superset"
$DefaultCandidate = if (Test-Path $DefaultCompanyCandidate) { $DefaultCompanyCandidate } else { "D:\Sviluppo\superset" }

if (-not $SupersetPath) {
    $Candidates = @(
        $DefaultCompanyCandidate,
        "C:\Superset",
        "D:\Sviluppo\superset-6.1.0",
        "D:\Sviluppo\superset",
        (Join-Path $ResolvedPluginPath "..\superset"),
        (Join-Path $ResolvedPluginPath "..\superset-6.1.0"),
        (Join-Path $ResolvedPluginPath "..\apache-superset"),
        (Join-Path $env:USERPROFILE "superset_6_1_0\superset"),
        (Join-Path $env:USERPROFILE "superset"),
        (Join-Path $env:USERPROFILE "Projects\superset")
    )

    foreach ($cand in $Candidates) {
        if ($cand -and (Test-Path (Join-Path $cand "superset-frontend\package.json"))) {
            $SupersetPath = (Resolve-Path $cand).Path
            Write-Color "[INFO] Superset installation found automatically: $SupersetPath" "Green"
            break
        }
    }
}

if (-not $SupersetPath) {
    if ($Force) {
        $SupersetPath = $DefaultCandidate
    } else {
        Write-Color "Enter the path of the Apache Superset root folder" "Yellow"
        Write-Color "[Default: $DefaultCandidate]:" "Gray"
        $InputPath = Read-Host "Percorso Superset"
        if ([string]::IsNullOrWhiteSpace($InputPath)) {
            $SupersetPath = $DefaultCandidate
        } else {
            $SupersetPath = $InputPath.Trim('"', "'").Trim()
        }
    }
}

if (-not (Test-Path $SupersetPath)) {
    Write-Color "[ERROR] The specified path '$SupersetPath' does not exist!" "Red"
    exit 1
}

$ResolvedSupersetPath = (Resolve-Path $SupersetPath).Path
$FrontendDir = Join-Path $ResolvedSupersetPath "superset-frontend"

if (-not (Test-Path (Join-Path $FrontendDir "package.json"))) {
    Write-Color "[ERROR] 'superset-frontend\package.json' not found in '$ResolvedSupersetPath'!" "Red"
    exit 1
}
Write-Color "[INFO] Superset target folder: $ResolvedSupersetPath" "Green"
Write-Color "[INFO] superset-frontend folder: $FrontendDir" "Gray"
Write-Color ""

if (-not $SkipBuild) {
    Write-Color "=== STEP 1: Verifying the bundle and plugin sources ===" "Cyan"
    $EsmDir = Join-Path $ResolvedPluginPath "esm"
    $LibDir = Join-Path $ResolvedPluginPath "lib"
    if ((Test-Path $EsmDir) -or (Test-Path $LibDir)) {
        Write-Color "[OK] Compiled bundles found (esm/lib). Instant install, no dependency download." "Green"
    } else {
        Write-Color "[OK] 'src/' sources ready. Superset will compile them directly through Webpack." "Green"
    }
    Write-Color ""
}

Write-Color "=== STEP 2: Copy and sync the plugin ===" "Cyan"
$PluginsTargetRoot = Join-Path $FrontendDir "plugins"
if (-not (Test-Path $PluginsTargetRoot)) {
    New-Item -ItemType Directory -Path $PluginsTargetRoot -Force | Out-Null
}

$DestPluginDir = Join-Path $PluginsTargetRoot "superset-plugin-chart-stratum-calendar-filter"
$LegacyPluginDir = Join-Path $PluginsTargetRoot "superset-plugin-chart-calendar-filter"
if (Test-Path $LegacyPluginDir) {
    Remove-Item -Recurse -Force $LegacyPluginDir -ErrorAction SilentlyContinue
}
if (Test-Path $DestPluginDir) {
    Write-Color "[INFO] Cleaning the previous version in '$DestPluginDir'..." "Yellow"
    try {
        Remove-Item -Recurse -Force $DestPluginDir -ErrorAction Stop
    } catch {
        Start-Sleep -Milliseconds 300
        Remove-Item -Recurse -Force $DestPluginDir -ErrorAction SilentlyContinue
    }
}

New-Item -ItemType Directory -Path $DestPluginDir -Force | Out-Null

$ItemsToCopy = @("src", "esm", "lib", "package.json", "tsconfig.json", "README.md")
foreach ($item in $ItemsToCopy) {
    $srcItem = Join-Path $ResolvedPluginPath $item
    if (Test-Path $srcItem) {
        $destItem = Join-Path $DestPluginDir $item
        $isDir = (Get-Item $srcItem) -is [System.IO.DirectoryInfo]
        if ($isDir) {
            Copy-Item -Path $srcItem -Destination $DestPluginDir -Recurse -Force
            Write-Color "  [+] Copied folder:    $item" "Gray"
        } else {
            Copy-Item -Path $srcItem -Destination $destItem -Force
            Write-Color "  [+] Copied file:      $item" "Gray"
        }
    }
}
Write-Color "[SUCCESS] Plugin copied successfully to '$DestPluginDir'" "Green"
Write-Color ""

Write-Color "=== STEP 3: Registration in MainPreset.ts ===" "Cyan"
$PresetCandidates = @(
    (Join-Path $FrontendDir "src\visualizations\presets\MainPreset.ts"),
    (Join-Path $FrontendDir "src\visualizations\presets\MainPreset.js")
)

$PresetFile = $null
foreach ($pf in $PresetCandidates) {
    if (Test-Path $pf) {
        $PresetFile = $pf
        break
    }
}

if ($PresetFile) {
    # Safety backup (MainPreset.ts.bak) before any change
    $BackupFile = "$PresetFile.bak"
    if (-not (Test-Path $BackupFile)) {
        Copy-Item -Path $PresetFile -Destination $BackupFile -Force
        Write-Color "[SUCCESS] Safety backup created: $(Split-Path -Leaf $BackupFile)" "Green"
    } else {
        Write-Color "[INFO] Existing safety backup kept: $(Split-Path -Leaf $BackupFile)" "Gray"
    }

    $Content = [System.IO.File]::ReadAllText($PresetFile, [System.Text.Encoding]::UTF8)
    $TargetImport = "import { CalendarFilterPlugin } from '../../../plugins/superset-plugin-chart-stratum-calendar-filter/src';"
    $TargetRegister = "        new CalendarFilterPlugin().configure({ key: 'stratum_calendar' }),`r`n        new CalendarFilterPlugin().configure({ key: 'calendar_filter' }),"
    $ImportRegex = "from\s*['`"][^'`"]*superset-plugin-chart-(stratum-)?calendar-filter"
    $RegisterRegex = 'new\s+(SupersetPluginChartCalendarFilter|CalendarFilterPlugin|StratumCalendarChartPlugin)'

    $NL = "`n"
    if ($Content -match "`r`n") { $NL = "`r`n" }

    $lines = [System.Collections.Generic.List[string]]::new($Content -split "\r?\n")

    # Checks whether the file is already configured in the CANONICAL form (exact line):
    # one import line and one registration with key 'calendar_filter'.
    # Legacy variants (alias line 'superset-plugin-chart-calendar-filter', class
    # SupersetPluginChartCalendarFilter, lines with `.register()`, duplicates) are
    # normalized to the canonical form without adding new lines.
    $hasExactImport = ($lines -contains $TargetImport)
    $hasExactRegister = ($lines -contains $TargetRegister)
    $importCount = @($lines | Where-Object { $_ -match $ImportRegex }).Count
    $registerCount = @($lines | Where-Object { $_ -match $RegisterRegex }).Count

    if (-not $CleanReinstall -and $hasExactImport -and $hasExactRegister -and ($importCount -eq 1) -and ($registerCount -eq 1)) {
        Write-Color "[INFO] MainPreset.ts is already registered correctly (idempotent, no change needed)." "Green"
    } else {
        # Normalization: removes existing imports/registrations (also legacy or
        # duplicate) and re-inserts only the canonical form with key 'calendar_filter'.
        $importLines = [System.Collections.Generic.List[string]]::new()
        $lastImportIdx = -1
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            if ($line -match $ImportRegex) { continue }
            if ($line.Trim().StartsWith("import ")) { $lastImportIdx = $importLines.Count }
            $importLines.Add($line)
        }
        if ($lastImportIdx -ge 0) {
            $importLines.Insert($lastImportIdx + 1, $TargetImport)
        } else {
            $importLines.Insert(0, $TargetImport)
        }

        $finalLines = [System.Collections.Generic.List[string]]::new()
        $pluginsIdx = -1
        for ($i = 0; $i -lt $importLines.Count; $i++) {
            $line = $importLines[$i]
            if ($line -match $RegisterRegex) { continue }
            $finalLines.Add($line)
            if ($line -match 'plugins\s*:\s*\[') { $pluginsIdx = $finalLines.Count }
        }
        if ($pluginsIdx -ge 0) {
            $finalLines.Insert($pluginsIdx, $TargetRegister)
        } else {
            $finalLines.Add($TargetRegister)
        }

        $NewContent = $finalLines -join $NL
        [System.IO.File]::WriteAllText($PresetFile, $NewContent, [System.Text.UTF8Encoding]::new($false))
        Write-Color "[SUCCESS] MainPreset.ts normalized to the canonical form only (key: 'calendar_filter')." "Green"
    }
}

if (-not $SkipCleanCache) {
    Write-Color "=== STEP 4: Clearing the Webpack frontend cache ===" "Cyan"
    $CacheDirs = @(
        (Join-Path $FrontendDir "node_modules\.cache"),
        (Join-Path $FrontendDir ".cache")
    )
    foreach ($cd in $CacheDirs) {
        if (Test-Path $cd) {
            try {
                Remove-Item -Recurse -Force $cd -ErrorAction SilentlyContinue
                Write-Color "[SUCCESS] Cache cleared: $cd" "Green"
            } catch {
                Write-Color "[WARN] Cannot clear $($cd): $_" "Yellow"
            }
        }
    }
}

Write-Color "================================================================" "Green"
Write-Color "   Installazione Plugin Calendar Filter completata!             " "Green"
Write-Color "================================================================" "Green"
