Add-Type -AssemblyName System.Drawing

function Convert-HQTransparent {
    param(
        [string]$InputFile,
        [string]$OutputFile
    )

    $fullIn = [System.IO.Path]::GetFullPath($InputFile)
    $fullOut = [System.IO.Path]::GetFullPath($OutputFile)

    if (-not (Test-Path $fullIn)) { return }

    $fs = New-Object System.IO.FileStream($fullIn, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
    $bmp = [System.Drawing.Bitmap]::FromStream($fs)
    $fs.Close()
    $fs.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $r = [int]$c.R
            $g = [int]$c.G
            $b = [int]$c.B

            $max = [Math]::Max($r, [Math]::Max($g, $b))
            $min = [Math]::Min($r, [Math]::Min($g, $b))
            $diff = $max - $min # 彩度

            $yRatio = $y / $h
            # 床面・反射・手足の隙間を含む白・薄グレー判定
            $bgThreshold = if ($yRatio -gt 0.8) { 210 } elseif ($yRatio -gt 0.6) { 225 } else { 235 }

            if ($min -ge $bgThreshold -and $diff -le 16) {
                # 完全透過
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($min -ge ($bgThreshold - 20) -and $diff -le 14) {
                # エッジのなめらかフェード
                $alpha = [int](255 * (1.0 - ($min - ($bgThreshold - 20)) / 20.0))
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
            }
        }
    }

    $bmp.Dispose()
    $outBmp.Save($fullOut, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Processed: $fullOut"
}

Convert-HQTransparent -InputFile "src/assets/images/monsters_heroic/wolf.jpg" -OutputFile "src/assets/images/monsters_heroic/wolf.png"
Convert-HQTransparent -InputFile "src/assets/images/monsters_heroic/slime.jpg" -OutputFile "src/assets/images/monsters_heroic/slime.png"
Convert-HQTransparent -InputFile "src/assets/images/monsters_epic/wolf.jpg" -OutputFile "src/assets/images/monsters_epic/wolf.png"
Convert-HQTransparent -InputFile "src/assets/images/monsters_epic/slime.jpg" -OutputFile "src/assets/images/monsters_epic/slime.png"
