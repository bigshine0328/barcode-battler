Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "src\assets\images" -Recurse -Filter "*.jpg"
foreach ($file in $files) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    $bmp = New-Object System.Drawing.Bitmap $img
    $c1 = $bmp.GetPixel(5, 5)
    $c2 = $bmp.GetPixel(505, 5)
    $c3 = $bmp.GetPixel(5, 505)
    $c4 = $bmp.GetPixel(505, 505)
    $avgBright = ($c1.GetBrightness() + $c2.GetBrightness() + $c3.GetBrightness() + $c4.GetBrightness()) / 4
    $type = if ($avgBright -gt 0.6) { "⚪ 白背景 (Light)" } else { "⚫ 黒背景 (Dark)" }
    $bStr = [math]::Round($avgBright, 2)
    Write-Host "$($file.Name) : $type (Brightness: $bStr)"
    $bmp.Dispose()
    $img.Dispose()
}
