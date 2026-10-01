# 安装「黑金 VIP」皮肤到 DSH 皮肤目录（免重启；之后到 设置 → 皮肤中心 应用）
$ErrorActionPreference = 'Stop'
$root = if ($env:DSH_SKINS_HOME) { $env:DSH_SKINS_HOME } elseif ($env:DSH_SKINS_DIR) { $env:DSH_SKINS_DIR } else { Join-Path $env:USERPROFILE '.dsh\skins' }
$dest = Join-Path $root 'black-gold-vip'
New-Item -ItemType Directory -Force -Path $root | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Copy-Item -Recurse -Force (Join-Path $PSScriptRoot 'black-gold-vip') $dest
Write-Host "已安装到: $dest"
Write-Host "下一步: 打开 DSH Web GUI → 设置 → 皮肤中心 → 黑金 VIP → 应用（免重启）"
