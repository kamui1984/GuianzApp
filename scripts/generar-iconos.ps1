Add-Type -AssemblyName System.Drawing

$clientDir = Join-Path $PSScriptRoot "..\client\Logos _PNG"
$logoFile = Get-ChildItem -Path $clientDir -Recurse -Filter "*11.png*" | Select-Object -First 1

if (-not $logoFile) {
    Write-Error "No se encontro el archivo del logo Recurso 11.png"
    exit 1
}

$outputDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

function Resize-ImageFile {
    param(
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$Size,
        [string]$BackgroundHex
    )
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($BackgroundHex) {
        $bgColor = [System.Drawing.ColorTranslator]::FromHtml($BackgroundHex)
        $brush = New-Object System.Drawing.SolidBrush $bgColor
        $graphics.FillRectangle($brush, 0, 0, $Size, $Size)
        $brush.Dispose()
        $pad = [int]($Size * 0.15)
        $targetW = $Size - ($pad * 2)
        $targetH = [int]($targetW * ($img.Height / $img.Width))
        $posY = [int](($Size - $targetH) / 2)
        $graphics.DrawImage($img, $pad, $posY, $targetW, $targetH)
    } else {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $ratio = [Math]::Min($Size / $img.Width, $Size / $img.Height)
        $targetW = [int]($img.Width * $ratio)
        $targetH = [int]($img.Height * $ratio)
        $posX = [int](($Size - $targetW) / 2)
        $posY = [int](($Size - $targetH) / 2)
        $graphics.DrawImage($img, $posX, $posY, $targetW, $targetH)
    }

    $bitmap.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $img.Dispose()
    Write-Host "Generado: $TargetPath"
}

Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path $outputDir "pwa-192x192.png") -Size 192 -BackgroundHex $null
Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path $outputDir "pwa-512x512.png") -Size 512 -BackgroundHex $null
Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path $outputDir "apple-touch-icon.png") -Size 180 -BackgroundHex "#FFFFFF"
Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path $outputDir "maskable-icon-512x512.png") -Size 512 -BackgroundHex "#174A5B"
Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path $outputDir "favicon-32x32.png") -Size 32 -BackgroundHex $null
Resize-ImageFile -SourcePath $logoFile.FullName -TargetPath (Join-Path (Join-Path $PSScriptRoot "..\public") "favicon.ico") -Size 48 -BackgroundHex $null

Write-Host "TODOS LOS ICONOS PWA GENERADOS EXITOSAMENTE"
