param(
    [string]$InFile,
    [string]$OutFile,
    [int]$TargetSize = 512
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $InFile)) {
    Write-Error "File not found: $InFile"
    exit 1
}

$fs = New-Object System.IO.FileStream($InFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
$bmp = [System.Drawing.Bitmap]::FromStream($fs)
$fs.Close()
$fs.Dispose()

$w = $bmp.Width
$h = $bmp.Height

# 中央の正方形クロップ領域
$cropSize = [Math]::Min($w, $h)
$cropX = [int](($w - $cropSize) / 2)
$cropY = [int](($h - $cropSize) / 2)

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetSize, $TargetSize)

$targetBmp = New-Object System.Drawing.Bitmap($TargetSize, $TargetSize, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($targetBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Dispose()

$outDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($OutFile))
if (-not (Test-Path $outDir)) { [System.IO.Directory]::CreateDirectory($outDir) | Out-Null }

$targetBmp.Save([System.IO.Path]::GetFullPath($OutFile), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$targetBmp.Dispose()
Write-Host "Successfully imported and cropped to: $OutFile"
