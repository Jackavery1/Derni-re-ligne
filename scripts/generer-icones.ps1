
# Genere les icones PWA (PNG reels) depuis img/robo-favicon.png (JPEG 1024x1024).
Add-Type -AssemblyName System.Drawing

$racine = Split-Path -Parent $PSScriptRoot
$src = [System.Drawing.Image]::FromFile((Join-Path $racine 'img/robo-favicon.png'))

function Save-Resized($img, $size, $path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.SmoothingMode = 'HighQuality'
    $g.DrawImage($img, 0, 0, $size, $size)
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Save-Resized $src 192 (Join-Path $racine 'img/icon-192.png')
Save-Resized $src 512 (Join-Path $racine 'img/icon-512.png')

# Maskable : contenu reduit a ~78% (zone sure) sur fond uni du theme.
$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#08081a'))
$inner = [int]($size * 0.78)
$off = [int](($size - $inner) / 2)
$g.DrawImage($src, $off, $off, $inner, $inner)
$bmp.Save((Join-Path $racine 'img/icon-maskable-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Get-ChildItem (Join-Path $racine 'img/icon-*.png') | Select-Object Name, Length
