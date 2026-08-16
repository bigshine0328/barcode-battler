Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "src\assets\images" -Recurse -Filter "*.jpg"
foreach ($file in $files) {
    $srcPath = $file.FullName
    $destPath = [System.IO.Path]::ChangeExtension($srcPath, ".png")
    
    $srcBmp = New-Object System.Drawing.Bitmap $srcPath
    $w = $srcBmp.Width
    $h = $srcBmp.Height

    # 四隅の明るさをサンプリング
    $c1 = $srcBmp.GetPixel(4, 4)
    $c2 = $srcBmp.GetPixel($w - 5, 4)
    $c3 = $srcBmp.GetPixel(4, $h - 5)
    $c4 = $srcBmp.GetPixel($w - 5, $h - 5)
    $avgB = ($c1.GetBrightness() + $c2.GetBrightness() + $c3.GetBrightness() + $c4.GetBrightness()) / 4.0
    $isWhiteBg = ($avgB -gt 0.5)

    $outBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $srcBmp.GetPixel($x, $y)
            $r = $p.R
            $g = $p.G
            $b = $p.B

            if ($isWhiteBg) {
                $minC = [Math]::Min($r, [Math]::Min($g, $b))
                if ($minC -ge 246) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } elseif ($minC -ge 215) {
                    $factor = (246.0 - $minC) / (246.0 - 215.0)
                    $alpha = [int](255 * $factor)
                    $alpha = [Math]::Max(0, [Math]::Min(255, $alpha))
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
                } else {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
                }
            } else {
                $maxC = [Math]::Max($r, [Math]::Max($g, $b))
                if ($maxC -le 18) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } elseif ($maxC -le 60) {
                    $factor = ($maxC - 18.0) / (60.0 - 18.0)
                    $alpha = [int](255 * $factor)
                    $alpha = [Math]::Max(0, [Math]::Min(255, $alpha))
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
                } else {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
                }
            }
        }
    }

    $srcBmp.Dispose()
    $outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Created transparent PNG: $($file.Name) -> $([System.IO.Path]::GetFileName($destPath))"
}
