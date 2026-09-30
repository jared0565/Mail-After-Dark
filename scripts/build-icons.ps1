$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$iconDirectory = Join-Path $projectRoot 'icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
foreach ($size in @(16, 32, 48, 128, 300)) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $background = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#14181e'))
    $accent = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#b5dec4'))
    $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#b5dec4'), 5)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.ScaleTransform(($size / 128.0), ($size / 128.0))
        $graphics.FillRectangle($background, 0, 0, 128, 128)
        $graphics.FillEllipse($accent, 73, 17, 34, 34)
        $graphics.FillEllipse($background, 85, 12, 30, 30)
        $graphics.DrawRectangle($pen, 23, 52, 82, 54)
        $graphics.DrawLine($pen, 24, 53, 64, 82)
        $graphics.DrawLine($pen, 64, 82, 104, 53)
        $bitmap.Save((Join-Path $iconDirectory "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $pen.Dispose()
        $accent.Dispose()
        $background.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}
