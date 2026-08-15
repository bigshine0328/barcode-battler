Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "src\assets\images" -Recurse -Filter "*.jpg"
foreach ($file in $files) {
    $srcPath = $file.FullName
    $img = [System.Drawing.Image]::FromFile($srcPath)
    $newBmp = New-Object System.Drawing.Bitmap 512, 512
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, 512, 512)
    $img.Dispose()

    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]85)

    $destPath = $srcPath + ".tmp"
    $newBmp.Save($destPath, $jpegCodec, $encoderParams)
    $newBmp.Dispose()
    $g.Dispose()

    Move-Item -Force $destPath $srcPath
    Write-Host "Optimized: $($file.Name)"
}
