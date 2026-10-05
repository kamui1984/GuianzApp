$distPath = Join-Path $PSScriptRoot "..\dist"
$zipPath = Join-Path $PSScriptRoot "..\guianzapp-dist.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Compress-Archive -Path "$distPath\*" -DestinationPath $zipPath -Force
$item = Get-Item $zipPath
Write-Host "Archivo zip creado: $($item.FullName) ($($item.Length) bytes)"
