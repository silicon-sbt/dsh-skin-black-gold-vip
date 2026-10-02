// build-skin.mjs —— 生成「黑金 VIP」皮肤（纯 CSS；用户皮肤的 hooks 被官方审核拦下）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chroma from 'chroma-js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SKIN = path.join(DIR, '..', 'black-gold-vip');
const HARNESS = path.join(DIR, '_harness');
fs.mkdirSync(path.join(SKIN, 'preview'), { recursive: true });
fs.mkdirSync(HARNESS, { recursive: true });

const P = JSON.parse(fs.readFileSync(path.join(DIR, 'brand-paths.json'), 'utf8'));
const FW = P.viewBox.width, FH = P.viewBox.height;
const BADGE = { x: 129.348, y: 5.5, w: 52, h: 14, rx: 2 };
const letters = P.wordmarkDetailed.filter((x) => !x.fill.includes('inverted'));
const ribbon = P.wordmarkDetailed.filter((x) => x.fill.includes('inverted'));

/* ---------- 色板（Chroma.js）：浅色主题用深金，深色主题用亮香槟金 ---------- */
const OFFSETS = [0, 0.22, 0.46, 0.7, 1];
const scaleOf = (c) => chroma.scale(c).mode('lch');
const bright = scaleOf(['#5C4614', '#C9A227', '#F6E7B0', '#C9A227', '#7A5C1A']);
const deep = scaleOf(['#3A2A08', '#6E5416', '#C9A227', '#8A6A22', '#463606']);
const stopList = (sc) => OFFSETS.map((o, i) => sc(i / (OFFSETS.length - 1)).hex());
const grad = (sc, deg) => 'linear-gradient(' + deg + 'deg, ' + stopList(sc).map((c, i) => c + ' ' + Math.round(OFFSETS[i] * 100) + '%').join(', ') + ')';

const V = {
  FLAT_LIGHT: deep(0.62).hex(),
  FLAT_DARK: bright(0.62).hex(),
  RIBBON_DARK: bright(0.38).hex(),
  DEEP_DIAG: grad(deep, 135),
  DEEP_VERT: grad(deep, 0),
  BRIGHT_DIAG: grad(bright, 135),
  BRIGHT_VERT: grad(bright, 0),
  ACCENT: bright(0.46).hex(),
};
console.log('浅色: 平金 ' + V.FLAT_LIGHT + ' (白底 ' + chroma.contrast(V.FLAT_LIGHT, '#FFFFFF').toFixed(2) + ':1) | 深色: 平金 ' + V.FLAT_DARK + ' (黑底 ' + chroma.contrast(V.FLAT_DARK, '#0A0A0C').toFixed(2) + ':1)');

/* ---------- data-URI 蒙版（纯 CSS 实现金属渐变，不需要 JS） ---------- */
const S = 'http://www.w3.org/2000/svg';
const enc = encodeURIComponent;
V.MASK_FISH = enc('<svg xmlns="' + S + '" viewBox="0 0 ' + FW + ' ' + FH + '" preserveAspectRatio="none"><path d="' + P.fish + '" fill="#000"/></svg>');
V.MASK_WORD = enc('<svg xmlns="' + S + '" viewBox="26 0 156 24" preserveAspectRatio="none">' +
  letters.map((x) => '<path d="' + x.d + '" fill="#000"/>').join('') +
  '<rect x="' + BADGE.x + '" y="' + BADGE.y + '" width="' + BADGE.w + '" height="' + BADGE.h + '" rx="' + BADGE.rx + '" fill="#000"/></svg>');

/* ---------- 皮肤 CSS（占位符由 V 填充；文件内不含嵌套模板插值） ---------- */
const CSS_T = `/* 黑金 VIP（black-gold-vip）· v2.0
 * 双主题：浅色 = 暖金卡（象牙底 + 金框 + 深金标），深色 = 黑金卡（近黑底 + 金框 + 亮金标）。
 * 目标：左上角品牌区 + 开始会话页大鲸鱼。只改颜色与卡面装饰——不声明任何 --dsw-* token、
 * 不改布局结构、不替换组件。纯 CSS（data-URI 蒙版做金属渐变，零 JS）。
 * 由 build-skin.mjs 用 Chroma.js 生成，请勿手改。
 */

/* ============ 主题变量 ============ */
:root {
  --vip-flat: @@FLAT_LIGHT@@;
  --vip-metal-diag: @@DEEP_DIAG@@;
  --vip-metal-vert: @@DEEP_VERT@@;
  --vip-glow: drop-shadow(0 1px 1px rgba(110, 84, 22, .28));
  --vip-ring: linear-gradient(135deg, #EBD79A 0%, #C9A227 28%, #8A6A22 55%, #D9B95C 78%, #6E5416 100%);
  --vip-face: radial-gradient(130% 160% at 8% -10%, rgba(201,162,39,.20), rgba(201,162,39,0) 58%), linear-gradient(158deg, #FFFDF7 0%, #FBF4E3 46%, #F4E8D0 100%);
  --vip-card-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(140,110,30,.18), 0 1px 2px rgba(120,95,25,.20), 0 6px 18px rgba(120,95,25,.12);
  --vip-sheen: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85) 45%, rgba(255,255,255,.25) 62%, rgba(255,255,255,0));
  --vip-ribbon-bg: #141418;
  --vip-ribbon-fg: #E3C36B;
  --vip-ribbon-stroke: rgba(201, 162, 39, .65);
}
body[data-ds-dark-theme] {
  --vip-flat: @@FLAT_DARK@@;
  --vip-metal-diag: @@BRIGHT_DIAG@@;
  --vip-metal-vert: @@BRIGHT_VERT@@;
  --vip-glow: drop-shadow(0 0 6px rgba(201, 162, 39, .28));
  --vip-ring: linear-gradient(135deg, #F6E7B0 0%, #C9A227 26%, #5C4614 52%, #E3C36B 74%, #7A5C1A 100%);
  --vip-face: radial-gradient(130% 160% at 8% -10%, rgba(227,195,107,.17), rgba(227,195,107,0) 58%), linear-gradient(158deg, #1B1B22 0%, #101014 46%, #08080A 100%);
  --vip-card-shadow: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -1px 0 rgba(0,0,0,.65), 0 1px 2px rgba(0,0,0,.28), 0 6px 16px rgba(0,0,0,.16);
  --vip-sheen: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.09) 32%, rgba(246,231,176,.34) 50%, rgba(255,255,255,.09) 68%, rgba(255,255,255,0));
  --vip-ribbon-bg: @@RIBBON_DARK@@;
  --vip-ribbon-fg: #0A0A0C;
  --vip-ribbon-stroke: rgba(246, 231, 176, .55);
}

/* ============ ① 平面金兜底（不依赖蒙版，任何情况都不会透明） ============ */
[class*="brandMark"] svg path,
[class*="railMark"] svg path,
[class*="fishHitbox"] svg path,
[class*="brandIdentity"] [class*="brandName"] svg path {
  fill: var(--vip-flat) !important;
}
[class*="brandMark"] svg,
[class*="railMark"] svg,
[class*="fishHitbox"] svg {
  filter: var(--vip-glow);
}

/* ============ ② 会员卡（外观由主题变量决定） ============ */
[class*="brandIdentity"] {
  position: relative;
  isolation: isolate;
  height: 34px;
  padding: 0 9px;
  margin: 3px 0;
  border-radius: 10px;
  overflow: hidden;
  background: var(--vip-face);
  box-shadow: var(--vip-card-shadow);
}
[class*="brandIdentity"]::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  pointer-events: none;
  background: var(--vip-ring);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
[class*="brandIdentity"]::before {
  content: '';
  position: absolute;
  top: -45%;
  bottom: -45%;
  left: 0;
  width: 42%;
  pointer-events: none;
  background: var(--vip-sheen);
  animation: vip-sheen 7s cubic-bezier(.4, 0, .2, 1) infinite;
}
@keyframes vip-sheen {
  0%   { transform: translateX(-170%) skewX(-18deg); }
  42%, 100% { transform: translateX(320%) skewX(-18deg); }
}
@media (prefers-reduced-motion: reduce) {
  [class*="brandIdentity"]::before { animation: none; opacity: 0; }
}

/* ============ ③ 绶带：浅色=黑底金字，深色=金底黑字 ============ */
[class*="brandIdentity"] [class*="brandName"] svg > rect {
  fill: var(--vip-ribbon-bg) !important;
  stroke: var(--vip-ribbon-stroke);
  stroke-width: .5px;
}
[class*="brandIdentity"] [class*="brandName"] svg g[clip-path*="badge-clip"] path,
[class*="brandIdentity"] [class*="brandName"] svg path[fill*="inverted"] {
  fill: var(--vip-ribbon-fg) !important;
}

/* ============ ④ 金属蒙版升级（含开始会话页大鲸鱼） ============ */
@supports ((-webkit-mask: url("")) or (mask: url(""))) {
  [class*="brandIdentity"] [class*="brandMark"] svg,
  [class*="fishHitbox"] svg {
    background: var(--vip-metal-diag);
    -webkit-mask: url("data:image/svg+xml,@@MASK_FISH@@") center / 100% 100% no-repeat;
            mask: url("data:image/svg+xml,@@MASK_FISH@@") center / 100% 100% no-repeat;
  }
  [class*="brandIdentity"] [class*="brandMark"] svg path,
  [class*="fishHitbox"] svg path { fill: none !important; }

  [class*="brandIdentity"] [class*="brandName"] svg {
    background: var(--vip-metal-vert);
    -webkit-mask: url("data:image/svg+xml,@@MASK_WORD@@") center / 100% 100% no-repeat;
            mask: url("data:image/svg+xml,@@MASK_WORD@@") center / 100% 100% no-repeat;
  }
  [class*="brandIdentity"] [class*="brandName"] svg path { fill: none !important; }
  [class*="brandIdentity"] [class*="brandName"] svg g[clip-path*="badge-clip"] path,
  [class*="brandIdentity"] [class*="brandName"] svg path[fill*="inverted"] {
    fill: var(--vip-ribbon-fg) !important;
  }
}

/* 可选：绶带右侧再加一枚 VIP 小牌（默认关闭）
[class*="brandIdentity"] [class*="brandName"]::after {
  content: 'VIP';
  font: 700 9px/1 'PingFang SC','Microsoft YaHei',sans-serif;
  letter-spacing: .1em;
  padding: 3px 4px 2px;
  color: var(--vip-ribbon-fg);
  background: var(--vip-ribbon-bg);
  border: .5px solid var(--vip-ribbon-stroke);
  border-radius: 3px;
}
*/
`;

const fillVars = (tpl, extra) => {
  const all = Object.assign({}, V, extra || {});
  return tpl.replace(/@@([A-Z_]+)@@/g, (m, k) => (k in all ? String(all[k]) : m));
};
const CSS = fillVars(CSS_T);

const manifest = {
  $schema: 'https://schemas.linxin666.org/dsh-skin/v2.json',
  skinManifestVersion: 2,
  id: 'black-gold-vip',
  name: '黑金 VIP',
  nameEn: 'Black Gold VIP',
  version: '2.0.0',
  author: 'silicon-sbt',
  license: 'MIT',
  licenseUrl: 'https://opensource.org/licenses/MIT',
  tagline: '黑金会员卡品牌的左上角 · 金属金字标 · 金属金大鲸鱼',
  description: '只给品牌标识上色：左上角品牌区做成会员卡（渐变金属边框、卡面打光、缓慢掠光），品牌字标与开始会话页大鲸鱼用五档金属金（Chroma.js 的 lch 插值生成），HARNESS 徽标改为绶带。双主题自适应——浅色用暖金卡（象牙底 + 深金标 + 黑底金字绶带），深色用黑金卡（近黑底 + 亮金标 + 金底黑字绶带）。不声明任何 --dsw-* token、不改布局结构、不替换组件，悬停摆尾动画保留。纯 CSS：金属渐变由 data-URI SVG 蒙版 + CSS 渐变实现（未用 hooks，用户皮肤的 hooks 需审核故不可用）。',
  tags: ['black', 'gold', 'brand', 'logo', 'metal', 'css-only'],
  accent: '#c9a227',
  order: 103,
  preview: { light: 'preview/light.png', dark: 'preview/dark.png' },
  contributes: { stylesheet: 'skin.css', patches: 'patches.css' },
};
fs.writeFileSync(path.join(SKIN, 'skin.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(SKIN, 'patches.css'), CSS);
fs.writeFileSync(path.join(SKIN, 'skin.css'), '/* 黑金 VIP：不改任何设计 token，本文件故意留空。\n   全部改动在 patches.css（纯 CSS，无 JS）。 */\n');
try { fs.rmSync(path.join(SKIN, 'hooks.mjs'), { force: true }); } catch {}
console.log('✓ skin.json / patches.css / skin.css (' + CSS.split('\n').length + ' 行)');

/* ---------- 仿真页 ---------- */
const fishSvg = (cls, size) => '<span class="' + cls + '"><svg width="' + size + '" height="' + (size * FH / FW).toFixed(2) + '" viewBox="0 0 ' + FW + ' ' + FH + '" fill="none" aria-hidden="true"><path d="' + P.fish + '" fill="currentColor"/></svg></span>';
const wordSvg = '<svg width="156" height="24" viewBox="26 0 156 24" fill="none" aria-hidden="true">' +
  letters.map((x) => '<path d="' + x.d + '" fill="' + x.fill + '"/>').join('') +
  '<rect x="' + BADGE.x + '" y="' + BADGE.y + '" width="' + BADGE.w + '" height="' + BADGE.h + '" rx="' + BADGE.rx + '" fill="currentColor"/>' +
  '<g clip-path="url(#dsh-wordmark-badge-clip)">' + ribbon.map((x) => '<path d="' + x.d + '" fill="' + x.fill + '"/>').join('') + '</g>' +
  '<defs><clipPath id="dsh-wordmark-badge-clip"><rect x="132.348" y="5.5" width="46" height="14"/></clipPath></defs></svg>';

const PAGE_T = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>黑金VIP @@THEME@@</title>
<style>
  :root { --dsw-alias-label-primary: @@PRIMARY@@; --dsw-alias-label-primary-inverted: @@INVERTED@@; }
  body { margin:0; font-family:'PingFang SC','Microsoft YaHei',sans-serif; background:@@BG@@; color:var(--dsw-alias-label-primary); }
  .sidebar { width:279px; padding:6px 12px; box-sizing:border-box; background:@@SIDEBAR@@; }
  .hHd-Xa_logoRow { display:flex; align-items:center; }
  .hHd-Xa_brand { flex:1; min-width:0; display:inline-flex; align-items:center; border:none; background:0 0; padding:0; overflow:hidden; }
  .hHd-Xa_brandIdentity { display:inline-flex; align-items:center; gap:8px; min-width:0; }
  .hHd-Xa_brandMark { flex:none; display:inline-flex; }
  .hHd-Xa_brandName { display:inline-flex; align-items:center; gap:6px; }
  .toggle { flex:none; width:28px; text-align:center; opacity:.6; }
  .hero { display:flex; justify-content:center; padding:34px; }
  .pXSMma_fishHitbox { display:inline-flex; }
  .cap { font-size:12px; opacity:.55; padding:14px 12px 0; }
</style>
<link rel="stylesheet" href="../skin/black-gold-vip/patches.css">
</head><body @@DARK_ATTR@@>
  <div class="cap">① 左上角品牌区</div>
  <div class="sidebar"><div class="hHd-Xa_logoRow">
    <button class="hHd-Xa_brand"><span class="hHd-Xa_brandIdentity">
      @@BRAND@@</span></button>
    <span class="toggle">▤</span>
  </div></div>
  <div class="cap">② 开始会话页大鲸鱼（34px）</div>
  <div class="hero">@@HERO@@</div>
</body></html>`;

for (const t of ['light', 'dark']) {
  const dark = t === 'dark';
  const html = fillVars(PAGE_T, {
    THEME: t,
    DARK_ATTR: dark ? 'data-ds-dark-theme' : '',
    BG: dark ? '#0A0A0C' : '#FFFFFF',
    SIDEBAR: dark ? '#0A0A0C' : '#F9FAFB',
    PRIMARY: dark ? '#EDEDF2' : '#1A1A1E',
    INVERTED: dark ? '#1A1A1E' : '#FFFFFF',
    BRAND: fishSvg('hHd-Xa_brandMark', 24) + '<span class="hHd-Xa_brandName">' + wordSvg + '</span>',
    HERO: fishSvg('pXSMma_fishHitbox', 34),
  });
  fs.writeFileSync(path.join(HARNESS, t + '.html'), html);
}
console.log('✓ _harness/light.html + dark.html');
