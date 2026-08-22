Add-Type -AssemblyName System.Drawing

function Convert-ToTransparentPng {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Threshold = 245
    )

    $fullInput = [System.IO.Path]::GetFullPath($InputPath)
    $fullOutput = [System.IO.Path]::GetFullPath($OutputPath)

    if (-not (Test-Path $fullInput)) { return }

    $fs = New-Object System.IO.FileStream($fullInput, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
    $bmp = [System.Drawing.Bitmap]::FromStream($fs)
    $fs.Close()
    $fs.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $transBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($transBmp)
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $g.Dispose()
    $bmp.Dispose()

    # 外周からのFlood-Fillによる背景白検出
    $visited = New-Object 'bool[,]' $w, $h
    $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

    for ($x = 0; $x -lt $w; $x++) {
        $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
        $queue.Enqueue((New-Object System.Drawing.Point($x, ($h - 1))))
    }
    for ($y = 0; $y -lt $h; $y++) {
        $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
        $queue.Enqueue((New-Object System.Drawing.Point(($w - 1), $y)))
    }

    while ($queue.Count -gt 0) {
        $p = $queue.Dequeue()
        $x = $p.X
        $y = $p.Y

        if ($x -lt 0 -or $x -ge $w -or $y -lt 0 -or $y -ge $h) { continue }
        if ($visited[$x, $y]) { continue }
        $visited[$x, $y] = $true

        $pixel = $transBmp.GetPixel($x, $y)
        if ($pixel.R -ge $Threshold -and $pixel.G -ge $Threshold -and $pixel.B -ge $Threshold) {
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))

            $queue.Enqueue((New-Object System.Drawing.Point(($x + 1), $y)))
            $queue.Enqueue((New-Object System.Drawing.Point(($x - 1), $y)))
            $queue.Enqueue((New-Object System.Drawing.Point($x, ($y + 1))))
            $queue.Enqueue((New-Object System.Drawing.Point($x, ($y - 1))))
        }
    }

    $outDir = [System.IO.Path]::GetDirectoryName($fullOutput)
    if (-not (Test-Path $outDir)) { [System.IO.Directory]::CreateDirectory($outDir) | Out-Null }

    $transBmp.Save($fullOutput, [System.Drawing.Imaging.ImageFormat]::Png)
    $transBmp.Dispose()
    Write-Host "Generated: $fullOutput"
}

# 全ディレクトリの JPG を透明 PNG に一括変換
$dirs = @("monsters_heroic", "monsters_epic", "monsters_cute", "items")
foreach ($d in $dirs) {
    $targetDir = "src/assets/images/$d"
    if (Test-Path $targetDir) {
        $files = Get-ChildItem -Path $targetDir -Filter "*.jpg"
        foreach ($file in $files) {
            $pngName = [System.IO.Path]::ChangeExtension($file.Name, ".png")
            $outPath = Join-Path $targetDir $pngName
            Convert-ToTransparentPng -InputPath $file.FullName -OutputPath $outPath -Threshold 240
        }
    }
}
Write-Host "All Transparent PNG assets created successfully!"
