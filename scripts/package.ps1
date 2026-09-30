$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'manifest.json') -Raw | ConvertFrom-Json
$files = @('manifest.json', 'background.js', 'site.js', 'content.js', 'theme.js', 'popup.html', 'popup.css', 'popup.js', 'icons')
$paths = $files | ForEach-Object { Join-Path $projectRoot $_ }
foreach ($path in $paths) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing package input: $path" }
}
$destination = Join-Path $projectRoot "Mail-After-Dark-$($manifest.version)-store.zip"
Compress-Archive -LiteralPath $paths -DestinationPath $destination -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
    if (-not ($archive.Entries.FullName -contains 'manifest.json')) { throw 'manifest.json must be at the archive root.' }
    Write-Output "Store upload package: $destination"
    $archive.Entries | Select-Object FullName, Length
} finally { $archive.Dispose() }
