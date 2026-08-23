Add-Type -AssemblyName System.Drawing

function Optimize-Image {
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

    # 中央正方形クロップ領域
    $cropSize = [Math]::Min($w, $h)
    $cropX = [int](($w - $cropSize) / 2)
    $cropY = [int](($h - $cropSize) / 2)
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetSize, $TargetSize)

    # 512x512 高品質リサイズ
    $bmp = New-Object System.Drawing.Bitmap $TargetSize, $TargetSize, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
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

# src/assets/images 以下の全JPG/PNGを走査・最適化
$targets = @("src\assets\images\cards_standard", "src\assets\images\cards_ssr", "src\assets\images\cards_items", "src\assets\images\monsters_heroic", "src\assets\images\monsters_epic", "src\assets\images\monsters_cute", "src\assets\images\items", "src\assets\images\samples")
foreach ($folder in $targets) {
    if (Test-Path $folder) {
        Get-ChildItem -Path $folder -Recurse -Filter "*.jpg" | ForEach-Object {
            Optimize-Image -Path $_.FullName
        }
    }
}
Write-Host "All images successfully optimized to 512x512!"
