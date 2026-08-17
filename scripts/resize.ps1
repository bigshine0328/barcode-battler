Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param(
        [string]$Path,
        [int]$Width = 512,
        [int]$Height = 512,
        [int]$Quality = 85
    )

    $img = [System.Drawing.Image]::FromFile($Path)
    
    # 512x512 高品質リサイズ
    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $graph.DrawImage($img, 0, 0, $Width, $Height)
    
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
    
    $img.Dispose()
    
    $tempPath = "$Path.tmp"
    $bmp.Save($tempPath, $codec, $encoderParams)
    $graph.Dispose()
    $bmp.Dispose()
    
    Move-Item -Path $tempPath -Destination $Path -Force
    Write-Host "Optimized: $([System.IO.Path]::GetFileName($Path)) in $([System.IO.Path]::GetDirectoryName($Path))"
}

# src/assets/images 以下の全JPGを最適化
$targets = @("src\assets\images", "src\assets\monsters_cool", "src\assets\monsters_cute")
foreach ($folder in $targets) {
    if (Test-Path $folder) {
        Get-ChildItem -Path $folder -Recurse -Filter "*.jpg" | ForEach-Object {
            Optimize-Image -Path $_.FullName
        }
    }
}
