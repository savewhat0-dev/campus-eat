[CmdletBinding()]
param(
    [ValidateSet('preview','production')][string]$Channel = 'preview',
    [ValidateSet('android','ios','all')][string]$Platform = 'android',
    [string]$Message = '',
    [string]$SiteUrl = '',
    [switch]$PrepareOnly,
    [switch]$ValidateOnly
)
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $appRoot
try {
    $package = Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json
    $config = Get-Content -LiteralPath 'app.json' -Raw | ConvertFrom-Json
    $build = Get-Content -LiteralPath 'eas.json' -Raw | ConvertFrom-Json
    if ($package.name -ne 'bmu-eats-app') { throw 'This must run from the BMU Eats Expo app, not the website.' }
    $projectId = $config.expo.extra.eas.projectId
    if (-not $projectId -or $config.expo.updates.url -ne "https://u.expo.dev/$projectId") { throw 'EAS project and update URL do not match.' }
    if (-not $package.dependencies.'expo-updates' -or $config.expo.runtimeVersion.policy -ne 'fingerprint') { throw 'Update dependency or runtime compatibility policy is missing.' }
    if ($build.build.$Channel.channel -ne $Channel -or $build.build.$Channel.environment -ne $Channel) { throw 'Build channel and environment must match the selected channel.' }
    if (-not $SiteUrl) {
        if ($env:EXPO_PUBLIC_SITE_URL) { $SiteUrl = $env:EXPO_PUBLIC_SITE_URL }
        elseif (Test-Path -LiteralPath '.env') {
            $line = Get-Content -LiteralPath '.env' | Where-Object { $_ -match '^\s*EXPO_PUBLIC_SITE_URL\s*=' } | Select-Object -Last 1
            if ($line) { $SiteUrl = ($line -replace '^\s*EXPO_PUBLIC_SITE_URL\s*=\s*','').Trim().Trim('"').Trim("'") }
        }
    }
    if (-not $SiteUrl) { $SiteUrl = 'https://campus-eat-v6je.onrender.com' }
    $uri = $null
    if (-not [Uri]::TryCreate($SiteUrl, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or $uri.AbsolutePath -ne '/') { throw 'SiteUrl must be an HTTPS origin without a path, query or credentials.' }
    $SiteUrl = $uri.GetLeftPart([UriPartial]::Authority)
    Write-Host "App: $appRoot"
    Write-Host "Channel/environment: $Channel | Website: $SiteUrl"
    & npm.cmd run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed. Nothing was published.' }
    & npm.cmd run test:links
    if ($LASTEXITCODE -ne 0) { throw 'Sign-in link checks failed. Nothing was published.' }
    if ($ValidateOnly) { Write-Host 'Local validation passed. No remote changes or update publication.'; return }
    if (-not $PrepareOnly -and [string]::IsNullOrWhiteSpace($Message)) { throw 'Add -Message describing this update, or use -PrepareOnly for initial setup.' }
    # SDK 55+ uses the EAS server environment for updates. Upload only this public URL.
    & npx.cmd eas-cli@latest env:set $Channel --name EXPO_PUBLIC_SITE_URL --value $SiteUrl --visibility plaintext --type string --scope project --non-interactive
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the public website URL. Run npx.cmd eas-cli@latest login and retry.' }
    if ($PrepareOnly) { Write-Host "Ready. Build a new APK with: npx.cmd eas-cli@latest build --platform android --profile $Channel"; return }
    & npx.cmd eas-cli@latest update --channel $Channel --environment $Channel --platform $Platform --message $Message
    if ($LASTEXITCODE -ne 0) { throw 'EAS Update failed. Read the error above; no success is assumed.' }
    Write-Host 'Published. Compatible installed builds download on cold launch and apply on the following restart. Native changes require a new build.'
}
finally { Pop-Location }
