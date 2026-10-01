// extract-brand-paths.mjs —— 从本机已安装的 DSH 抽取品牌矢量路径（构建输入，不入库）
//
// 为什么要抽而不是直接放进仓库：鲸鱼 FishLogo 与字标 BrandWordmark 的路径数据属于
// @deepseek-ai/dsh-client-ui-primitives（MIT, Copyright (c) 2026 DeepSeek）。构建时从
// 使用者自己的 DSH 安装里读取，仓库就不必囤一份别人的品牌图形；生成的 CSS 因蒙版需要
// 必然内嵌这些形状，其授权与商标声明见 THIRD_PARTY_LICENSES.md。
//
// 用法: node extract-brand-paths.mjs   （可用 DSH_PRIMITIVES_DIR 指定包目录）
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'brand-paths.json');
const REL = 'lib/index.js';

function candidates() {
  const list = [];
  if (process.env.DSH_PRIMITIVES_DIR) list.push(path.join(process.env.DSH_PRIMITIVES_DIR, REL));
  const roots = [];
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch {}
  if (process.env.APPDATA) roots.push(path.join(process.env.APPDATA, 'npm', 'node_modules'));
  roots.push('/usr/local/lib/node_modules', '/usr/lib/node_modules');
  for (const r of roots) {
    list.push(path.join(r, '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives', REL));
    list.push(path.join(r, '@deepseek-ai', 'dsh-client-ui-primitives', REL));
  }
  return list;
}

const src = candidates().find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
if (!src) {
  console.error('找不到 dsh-client-ui-primitives。请设置 DSH_PRIMITIVES_DIR 指向该包目录。');
  process.exit(1);
}
const js = fs.readFileSync(src, 'utf8');
const vb = js.match(/FISH_LOGO_VIEWBOX\s*=\s*\{([^}]*)\}/);
const fp = js.match(/FISH_LOGO_PATH\s*=\s*"([^"]+)"/);
const start = js.indexOf('function BrandWordmark');
const end = js.indexOf('//#endregion', start);
if (!vb || !fp || start < 0 || end < 0) {
  console.error('解析失败：DSH 客户端包内部结构可能已变 → ' + src);
  process.exit(2);
}
const items = [];
for (const m of js.slice(start, end).matchAll(/jsx\("path",\s*\{([^}]*)\}/g)) {
  const d = (m[1].match(/\bd:\s*"([^"]+)"/) ?? [])[1];
  const fill = (m[1].match(/\bfill:\s*"([^"]+)"/) ?? [])[1] ?? '(none)';
  if (d) items.push({ d, fill });
}
const out = {
  viewBox: {
    width: Number((vb[1].match(/width:\s*([\d.]+)/) ?? [])[1]),
    height: Number((vb[1].match(/height:\s*([\d.]+)/) ?? [])[1]),
  },
  fish: fp[1],
  wordmarkDetailed: items,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('✓ ' + OUT);
console.log('  来源: ' + src);
console.log('  鲸鱼路径 ' + out.fish.length + ' 字符；字标 ' + items.length + ' 条（HARNESS 徽标字母 ' + items.filter((x) => x.fill.includes('inverted')).length + ' 条）');
