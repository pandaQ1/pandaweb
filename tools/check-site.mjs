#!/usr/bin/env node
/**
 * 站点自检（无需浏览器）：
 * 在最小 DOM 垫片里真实执行 assets/ui.js + assets/app.js 与 assets/privacy.js，
 * 拿到实际渲染出来的 HTML，再校验结构、文案、链接、文件与样式类。
 *
 *   node tools/check-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
let fails = 0;
let checks = 0;
const ok = (msg) => { checks += 1; console.log('  ✓ ' + msg); };
const bad = (msg) => { checks += 1; fails += 1; console.error('  ✗ ' + msg); };
const assert = (cond, msg) => (cond ? ok(msg) : bad(msg));

/* ---------------- DOM 垫片 ---------------- */
function makeDom(initialHash = '#/', search = '') {
  const listeners = { window: {}, document: {} };
  const appEl = { innerHTML: '', classList: { add() {}, remove() {}, toggle() {} } };
  const metaEl = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; } };
  const docEl = {
    attrs: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
  };

  const document = {
    readyState: 'complete',
    documentElement: docEl,
    title: '',
    body: { appendChild() {}, removeChild() {}, childNodes: [], classList: { add() {}, remove() {}, toggle() {} } },
    getElementById: (id) => (id === 'app' ? appEl : null),
    querySelector: (sel) => (sel.includes('meta') ? metaEl : null),
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, select() {}, setAttribute() {}, appendChild() {} }),
    addEventListener: (type, fn) => { (listeners.document[type] = listeners.document[type] || []).push(fn); },
    execCommand: () => true,
  };

  const location = { hash: initialHash, search, pathname: '/index.html', replace() {}, href: '' };

  const ctx = {
    console,
    document,
    location,
    navigator: { clipboard: null, userAgent: 'node' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    URLSearchParams,
    setTimeout,
    clearTimeout,
    performance: { now: () => Date.now() },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    scrollTo() {},
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0),
    addEventListener: (type, fn) => { (listeners.window[type] = listeners.window[type] || []).push(fn); },
    getComputedStyle: () => ({}),
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  return {
    ctx,
    appEl,
    docEl,
    metaEl,
    navigate(hash) {
      location.hash = hash;
      (listeners.window.hashchange || []).forEach((fn) => fn());
      return appEl.innerHTML;
    },
  };
}

const SPA_FILES = ['assets/plugins.data.js', 'assets/ui.js', 'assets/app.js'];
const PRIVACY_FILES = [...SPA_FILES, 'assets/privacy.js'];

function loadInto(dom, files) {
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), dom.ctx, { filename: f });
  }
}

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex');
const count = (s, re) => (s.match(re) || []).length;

/* ---------------- 开始 ---------------- */
console.log('\n[1] 数据文件');
const dataCode = read('assets/plugins.data.js');
assert(/window\.PANDA_PLUGINS\s*=/.test(dataCode), 'plugins.data.js 含 PANDA_PLUGINS');
const plugins = JSON.parse(/window\.PANDA_PLUGINS\s*=\s*(\[[\s\S]*\]);\s*$/.exec(dataCode)[1]);
assert(plugins.length >= 4, `插件数量 ${plugins.length}（≥4）`);

console.log('\n[2] 安装包 / 图标 / 商店配置');
for (const p of plugins) {
  const d = p.download;
  assert(Boolean(d), `${p.id}：有下载信息`);
  if (d) {
    assert(exists(d.file), `${p.id}：${d.file} 存在`);
    assert(exists(d.latestFile), `${p.id}：${d.latestFile} 存在`);
    assert(sha256(d.file) === d.sha256, `${p.id}：SHA-256 与实际文件一致`);
    assert(fs.statSync(path.join(ROOT, d.file)).size === d.sizeBytes, `${p.id}：大小与实际文件一致`);
    assert(/^\d+\.\d+\.\d+/.test(d.version), `${p.id}：版本号格式 ${d.version}`);
  }
  if (p.icon) assert(exists(p.icon), `${p.id}：图标存在`);
  assert(p.stores && p.stores.edge && p.stores.chrome, `${p.id}：Edge / Chrome 商店入口已配置`);
  assert(typeof p.minBrowser === 'string' && /^\d+$/.test(p.minBrowser), `${p.id}：minBrowser=${p.minBrowser}`);
}

console.log('\n[3] 首页渲染');
const dom = makeDom('#/');
loadInto(dom, SPA_FILES);
const hub = dom.appEl.innerHTML;
assert(hub.length > 5000, `首页 HTML 长度 ${hub.length}`);
assert(!/undefined|NaN|\[object Object\]/.test(hub), '首页无 undefined / NaN / [object Object]');
assert(count(hub, /class="pcard"/g) === plugins.length, `首页渲染 ${plugins.length} 张插件卡`);
assert(count(hub, /class="store-pill[\s"]/g) === plugins.length * 2, `每张卡片 2 个商店按钮（共 ${plugins.length * 2} 个）`);
assert(count(hub, /data-parallax="/g) >= 2, '首页有视差层（data-parallax）');
assert(count(hub, /data-reveal/g) >= 8, '首页有入场动画标记（data-reveal）');
assert(hub.includes('data-goto="plugins"') && hub.includes('data-goto="install"'), '导航「插件 / 安装」用平滑滚动');
assert(hub.includes('class="scroll-cue"') && /class="scroll-cue"[^>]*data-goto="plugins"/.test(hub), 'hero 底部有下滑提示箭头（指向插件区）');
assert(hub.includes('aria-label="向下查看全部插件"'), '下滑箭头有可读标签');
assert(hub.includes('为什么点一下不能自动装进浏览器'), '首页含「自动安装」说明');
assert(hub.includes('本地优先') && hub.includes('不注入远程代码'), '首页含「做插件的几条底线」');
for (const p of plugins) {
  assert(hub.includes(esc(p.name)), `首页出现 ${p.shortName}`);
  if (p.download) assert(hub.includes(p.download.file), `首页含 ${p.shortName} 下载直链`);
}

console.log('\n[4] 插件详情页（删掉冗余下载区块后的结构）');
for (const p of plugins) {
  const html = dom.navigate('#/p/' + p.id);
  assert(html.includes(esc(p.name)), `${p.id}：标题含插件名`);
  assert(!/id="download"/.test(html), `${p.id}：已删除「下载安装」大区块`);
  assert(!/class="dl"/.test(html), `${p.id}：已删除下载卡片`);
  assert(!/class="stores"/.test(html) && !/class="store"/.test(html), `${p.id}：商店卡片已压缩成小按钮`);
  assert(count(html, /class="store-pill[\s"]/g) === 2, `${p.id}：hero 内 2 个商店小按钮`);
  const storeIdx = html.indexOf('class="store-pills');
  const ctaIdx = html.indexOf('class="cta-row"');
  assert(storeIdx > 0 && ctaIdx > storeIdx, `${p.id}：商店按钮在下载按钮上方`);
  assert(html.includes('class="pkg-meta"'), `${p.id}：安装包信息条存在`);
  assert(html.includes(p.download.sha256), `${p.id}：显示 SHA-256`);
  assert(html.includes(p.download.latestFile), `${p.id}：含 latest 固定链接`);
  assert(html.includes('id="install"') && html.includes('id="features"') && html.includes('id="privacy"'), `${p.id}：三个区块齐全`);
  assert(html.includes('data-parallax'), `${p.id}：图标/光晕有视差`);
  (p.features || []).forEach((f) => {
    if (!html.includes(f.title)) bad(`${p.id}：功能卡「${f.title}」缺失`);
  });
  ok(`${p.id}：${(p.features || []).length} 张功能卡齐全`);
  (p.permissions || []).forEach((perm) => {
    if (!html.includes(perm.name)) bad(`${p.id}：权限「${perm.name}」未渲染`);
  });
  ok(`${p.id}：${(p.permissions || []).length} 条权限用途齐全`);
  assert(html.includes(p.membership ? p.membership.label : ''), `${p.id}：会员说明已渲染`);
}

console.log('\n[5] 隐私政策页');
for (const p of plugins) {
  const domP = makeDom('#/', '?p=' + p.id);
  loadInto(domP, PRIVACY_FILES);
  const html = domP.appEl.innerHTML;
  assert(html.includes(esc(p.name) + ' · 隐私政策'), `${p.id}：政策页标题`);
  assert(!/undefined|NaN/.test(html), `${p.id}：政策页无 undefined / NaN`);
  const sections = (p.privacy && p.privacy.sections) || [];
  assert(sections.length >= 5, `${p.id}：政策章节 ${sections.length} 节`);
  sections.forEach((s) => { if (!html.includes(s.h)) bad(`${p.id}：章节「${s.h}」缺失`); });
  if (p.privacy && p.privacy.callout) assert(html.includes(p.privacy.callout.slice(0, 18)), `${p.id}：core callout 已渲染`);
  assert(count(html, /class="chip/g) >= plugins.length, `${p.id}：政策页可切换插件`);
}

const domIdx = makeDom('#/', '');
loadInto(domIdx, PRIVACY_FILES);
const idx = domIdx.appEl.innerHTML;
assert(count(idx, /class="policy-card"/g) === plugins.length, '隐私索引列出全部插件');

console.log('\n[6] 链接与资源完整性');
const allHtml = [hub, ...plugins.map((p) => dom.navigate('#/p/' + p.id)), idx].join('\n');
const hrefs = [...new Set([...allHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))];
let broken = 0;
for (const h of hrefs) {
  if (h.startsWith('http')) continue;
  if (h.startsWith('#/p/')) {
    if (!plugins.some((p) => p.id === h.slice(4))) { broken += 1; bad(`路由指向不存在的插件：${h}`); }
    continue;
  }
  if (h.startsWith('privacy.html?p=')) {
    if (!plugins.some((p) => p.id === h.split('=')[1])) { broken += 1; bad(`隐私链接指向不存在的插件：${h}`); }
    continue;
  }
  if (h.startsWith('#')) continue;
  if (!exists(h)) { broken += 1; bad(`本地资源 404：${h}`); }
}
if (!broken) ok(`${hrefs.length} 个链接 / 资源全部可解析`);

console.log('\n[7] 样式类覆盖');
const css = read('assets/style.css');
const classes = new Set();
for (const m of allHtml.matchAll(/class="([^"]+)"/g)) {
  m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
}
const missing = [...classes].filter((c) => !new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s,{:>~)]').test(css));
assert(missing.length === 0, missing.length ? `样式里缺少：${missing.join(', ')}` : `${classes.size} 个样式类都有定义`);

// 反向：CSS 里定义了但页面从不使用的类（帮助发现死样式）
const cssClasses = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const dynamic = new Set(['fx-in', 'fx-ready', 'is-scrolled', 'ok', 'err', 'active', 'required', 'sm', 'center', 'pro', 'hidden', 'in', 'a1', 'g1', 'g2']);
const unused = [...cssClasses].filter((c) => !classes.has(c) && !dynamic.has(c));
if (unused.length) console.log(`  ℹ 仅供 JS/状态使用或未使用的类：${unused.join(', ')}`);

console.log('\n[8] 静态页面结构');
for (const page of ['index.html', 'privacy.html', 'account.html']) {
  const html = read(page);
  assert(html.includes('assets/style.css'), `${page}：引入样式`);
  assert(html.includes('assets/ui.js'), `${page}：引入 ui.js`);
  assert(html.includes('assets/app.js'), `${page}：引入 app.js`);
  assert(!/panda-word-highlighter-2\.19\.0/.test(html), `${page}：无旧版本残留`);
}
assert(read('index.html').includes('assets/fx.js'), 'index.html：引入 fx.js');
assert(read('privacy.html').includes('assets/fx.js'), 'privacy.html：引入 fx.js');
assert(!fs.existsSync(path.join(ROOT, 'downloads/panda-word-highlighter-2.19.0.zip')), '旧的单版本安装包已清理');

console.log('\n[9] 动效与无障碍约定');
const fx = read('assets/fx.js');
assert(fx.includes('prefers-reduced-motion'), 'fx.js：尊重减少动效偏好');
assert(fx.includes('requestAnimationFrame'), 'fx.js：滚动用 rAF 合并');
assert(/passive:\s*true/.test(fx), 'fx.js：滚动监听 passive');
assert(css.includes('prefers-reduced-motion'), 'style.css：有 reduced-motion 兜底');
assert(/html\.fx-ready \[data-reveal\]/.test(css), 'style.css：入场样式由 JS 开关（无 JS 时不隐藏内容）');
assert(!/#[0-9a-f]{6}.*gradient/.test(css.split('/* ---------- 动效层')[1] || ''), '动效层没有彩色渐变（保持灰阶）');

console.log('\n[10] 视差与定位安全');
// 视差元素由 JS 写 inline transform，CSS 里若也给它们设了 transform 会被覆盖 → 定位错乱
const parallaxClasses = new Set();
for (const m of allHtml.matchAll(/class="([^"]+)"[^>]*data-parallax=/g)) {
  m[1].split(/\s+/).filter(Boolean).forEach((c) => parallaxClasses.add(c));
}
let conflict = 0;
for (const c of parallaxClasses) {
  const re = new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'g');
  for (const m of css.matchAll(re)) {
    if (/transform\s*:\s*(?!none)/.test(m[1])) {
      conflict += 1;
      bad(`类 .${c} 同时有 CSS transform 和 data-parallax，会被 JS 覆盖`);
    }
  }
}
assert(conflict === 0, `${parallaxClasses.size} 个视差元素的定位不会被 transform 覆盖`);
assert(/margin-left:\s*calc\(min\(900px, 96vw\) \* -0\.5\)/.test(css), '光晕用 margin-left 居中（不依赖 transform）');

console.log('\n[11] 动效层可执行性（含 fx.js 真实执行）');
const domFx = makeDom('#/');
let appended = [];
domFx.ctx.document.body.appendChild = (el) => { appended.push(el && el.id); };
let fxError = null;
try {
  loadInto(domFx, ['assets/plugins.data.js', 'assets/ui.js', 'assets/fx.js', 'assets/app.js']);
} catch (e) {
  fxError = e;
}
assert(!fxError, fxError ? `执行报错：${fxError.message}` : 'ui.js + fx.js + app.js 依次执行无异常');
assert(appended.includes('fxProgress'), 'fx.js 注入了顶部阅读进度条');
assert(domFx.appEl.innerHTML.includes('class="pcard"'), 'fx.js 加载后首页仍能正常渲染');

console.log('\n[12] 文字可读性守卫');
assert(!/background-clip:\s*text\s*;/i.test(css), 'CSS 不用 background-clip:text（避免字取色失败后透明看不见）');
assert(/\.hub-hero h1 \.hl\s*\{[^}]*color:\s*var\(--text\)/.test(css), '主标题强调词用实心文字色');
assert(/@keyframes cueBob/.test(css) && /\.cue-arrow\s*\{[^}]*animation:/.test(css), '下滑箭头有独立动画');
assert(/(prefers-reduced-motion)[\s\S]*animation:\s*none/.test(css), 'reduced-motion 会关掉箭头动画');

console.log(`\n结果：${checks - fails}/${checks} 通过${fails ? `，${fails} 项失败` : ''}`);
process.exit(fails ? 1 : 0);
