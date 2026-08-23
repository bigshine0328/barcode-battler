Add-Type -AssemblyName System.Drawing

function Optimize-SingleCard {
    param(
        [string]$Path,
        [int]$TargetSize = 512,
        [int]$Quality = 85
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    if (-not (Test-Path $fullPath)) { return }

    $fs = New-Object System.IO.FileStream($fullPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
    $img = [System.Drawing.Bitmap]::FromStream($fs)
    $fs.Close()
    $fs.Dispose()

    $w = $img.Width
    $h = $img.Height

    # 正方形中央クロップ
    $cropSize = [Math]::Min($w, $h)
    $cropX = [int](($w - $cropSize) / 2)
    $cropY = [int](($h - $cropSize) / 2)
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetSize, $TargetSize)

    $bmp = New-Object System.Drawing.Bitmap($TargetSize, $TargetSize)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graph.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $graph.Dispose()
    $img.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

    $tempPath = "$fullPath.tmp.jpg"
    $bmp.Save($tempPath, $codec, $encoderParams)
    $bmp.Dispose()

    Move-Item -Path $tempPath -Destination $fullPath -Force
    Write-Host "Optimized (512x512): $([System.IO.Path]::GetFileName($fullPath))"
}

$files = Get-ChildItem -Path "src/assets/images/cards_standard" -Filter "*.jpg"
foreach ($f in $files) {
    Optimize-SingleCard -Path $f.FullName -TargetSize 512 -Quality 85
}
Write-Host "Successfully optimized all $($files.Count) standard cards!"
