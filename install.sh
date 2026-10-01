#!/bin/sh
# 安装「黑金 VIP」皮肤到 DSH 皮肤目录（免重启；之后到 设置 → 皮肤中心 应用）
set -eu
root="${DSH_SKINS_HOME:-${DSH_SKINS_DIR:-$HOME/.dsh/skins}}"
dest="$root/black-gold-vip"
mkdir -p "$root"
rm -rf "$dest"
cp -r "$(dirname "$0")/black-gold-vip" "$dest"
echo "已安装到: $dest"
echo "下一步: 打开 DSH Web GUI → 设置 → 皮肤中心 → 黑金 VIP → 应用（免重启）"
