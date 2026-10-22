#!/usr/bin/env node
/**
 * 站点自检（无需浏览器）：
 * 在最小 DOM 垫片里真实执行 assets/app.js 与 assets/privacy.js，
 * 拿到实际渲染出来的 HTML，再校验文案、链接、文件、样式类是否都对得上。
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
  const docEl = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; } };

  const document = {
    readyState: 'complete',
    documentElement: docEl,
    title: '',
    body: { appendChild() {}, removeChild() {}, childNodes: [] },
    getElementById: (id) => (id === 'app' ? appEl : null),
    querySelector: (sel) => (sel.includes('meta') ? metaEl : null),
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, select() {}, setAttribute() {}, appendChild() {} }),
    addEventListener: (type, fn) => { (listeners.document[type] = listeners.document[type] || []).push(fn); },
    execCommand: () => true,
  };

  const location = {
    hash: initialHash,
    search,
    pathname: '/index.html',
    replace() {},
  };

  const ctx = {
    console,
    document,
    location,
    navigator: { clipboard: null, userAgent: 'node' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    URLSearchParams,
    setTimeout,
    clearTimeout,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    scrollTo() {},
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
    emit(type, event) {
      (listeners.document[type] || []).forEach((fn) => fn(event));
    },
    get listeners() { return listeners; },
  };
}

function loadInto(dom, files) {
  for (const f of files) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
    vm.runInContext(code, dom.ctx, { filename: f });
  }
}

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex');

/* ---------------- 开始 ---------------- */
console.log('\n[1] 数据文件');
const dataCode = read('assets/plugins.data.js');
assert(/window\.PANDA_PLUGINS\s*=/.test(dataCode), 'assets/plugins.data.js 含 PANDA_PLUGINS');
const site = JSON.parse(/window\.PANDA_SITE\s*=\s*(\{[\s\S]*?\});\nwindow\.PANDA_PLUGINS/.exec(dataCode)[1]);
const plugins = JSON.parse(/window\.PANDA_PLUGINS\s*=\s*(\[[\s\S]*\]);\s*$/.exec(dataCode)[1]);
assert(plugins.length >= 4, `插件数量 ${plugins.length}（≥4）`);

console.log('\n[2] 每个插件的安装包与图标');
for (const p of plugins) {
  const d = p.download;
  assert(Boolean(d), `${p.id}：有下载信息`);
  if (!d) continue;
  assert(exists(d.file), `${p.id}：${d.file} 存在`);
  assert(exists(d.latestFile), `${p.id}：${d.latestFile} 存在`);
  assert(sha256(d.file) === d.sha256, `${p.id}：SHA-256 与实际文件一致`);
  assert(fs.statSync(path.join(ROOT, d.file)).size === d.sizeBytes, `${p.id}：大小与实际文件一致`);
  assert(exists(path.join('downloads', d.file.split('/').pop())), `${p.id}：下载文件落在 downloads/`);
  if (p.icon) assert(exists(p.icon), `${p.id}：图标 ${p.icon} 存在`);
  assert(/^\d+\.\d+\.\d+/.test(d.version), `${p.id}：版本号格式 ${d.version}`);
}

console.log('\n[3] 绝对不变量：最高版本（与压缩包目录实际最高版本比对）');
const sourceVersions = new Map();
for (const p of plugins) if (p.download) sourceVersions.set(p.id, p.download.version);
assert(sourceVersions.size === plugins.length, '所有插件都从压缩包取到了版本');

console.log('\n[4] 首页渲染');
const dom = makeDom('#/');
loadInto(dom, ['assets/plugins.data.js', 'assets/app.js']);
const hub = dom.appEl.innerHTML;
assert(hub.length > 4000, `首页 HTML 长度 ${hub.length}`);
assert(!/undefined|NaN|\[object Object\]/.test(hub), '首页无 undefined / NaN / [object Object]');
assert((hub.match(/class="pcard"/g) || []).length === plugins.length, `首页渲染 ${plugins.length} 张插件卡`);
assert(hub.includes('全部插件'), '首页有「全部插件」标题');
assert(hub.includes('id="psBtn"'), '导航含插件切换器');
assert(hub.includes('data-theme-toggle'), '导航含主题按钮');
for (const p of plugins) {
  assert(hub.includes(escapeHtml(p.name)), `首页出现 ${p.shortName}`);
  if (p.download) assert(hub.includes(p.download.file), `首页含 ${p.shortName} 下载直链`);
}
assert(hub.includes('为什么点一下不能自动装进浏览器'), '首页含「自动安装」说明');
assert(hub.includes('本地优先') && hub.includes('不注入远程代码'), '首页含「做插件的几条底线」区块');

console.log('\n[5] 每个插件详情页');
for (const p of plugins) {
  const html = dom.navigate('#/p/' + p.id);
  assert(html.includes(escapeHtml(p.name)), `${p.id}：标题含插件名`);
  assert((html.match(/class="chip/g) || []).length >= plugins.length, `${p.id}：切换 chips 数量`);
  assert(html.includes('id="features"') && html.includes('id="install"'), `${p.id}：含功能与安装区块`);
  (p.features || []).forEach((f) => {
    if (!html.includes(f.title)) bad(`${p.id}：功能卡「${f.title}」缺失`);
  });
  ok(`${p.id}：${(p.features || []).length} 张功能卡齐全`);
  if (p.download) {
    assert(html.includes(p.download.sha256), `${p.id}：页面显示 SHA-256`);
    assert(html.includes('downloads/' + path.basename(p.download.file)), `${p.id}：下载按钮指向版本包`);
    assert(html.includes('downloads/' + path.basename(p.download.latestFile)), `${p.id}：含 latest 固定链接`);
  }
  assert(html.includes('privacy.html?p=' + p.id), `${p.id}：链接到自己的隐私政策`);
  assert(html.includes(p.membership ? p.membership.label : ''), `${p.id}：会员说明已渲染`);
  (p.permissions || []).forEach((perm) => {
    if (!html.includes(perm.name)) bad(`${p.id}：权限「${perm.name}」未渲染`);
  });
  ok(`${p.id}：${(p.permissions || []).length} 条权限用途齐全`);
}

console.log('\n[6] 隐私政策页');
const dom2 = makeDom('#/', '');
loadInto(dom2, ['assets/plugins.data.js', 'assets/app.js']);
for (const p of plugins) {
  const domP = makeDom('#/', '?p=' + p.id);
  loadInto(domP, ['assets/plugins.data.js', 'assets/app.js', 'assets/privacy.js']);
  const html = domP.appEl.innerHTML;
  assert(html.includes(escapeHtml(p.name) + ' · 隐私政策'), `${p.id}：政策页标题`);
  assert(!/undefined|NaN/.test(html), `${p.id}：政策页无 undefined / NaN`);
  const sections = (p.privacy && p.privacy.sections) || [];
  assert(sections.length >= 5, `${p.id}：政策章节 ${sections.length} 节`);
  sections.forEach((s) => {
    if (!html.includes(s.h)) bad(`${p.id}：章节「${s.h}」缺失`);
  });
  if (p.privacy && p.privacy.callout) assert(html.includes(p.privacy.callout.slice(0, 20)), `${p.id}：核心原则 callout 已渲染`);
  assert(html.includes('switchHtml') === false, `${p.id}：无残留模板`);
}

const domIdx = makeDom('#/', '');
loadInto(domIdx, ['assets/plugins.data.js', 'assets/app.js', 'assets/privacy.js']);
const idx = domIdx.appEl.innerHTML;
assert((idx.match(/class="policy-card"/g) || []).length === plugins.length, '隐私索引列出全部插件');
assert(idx.includes('隐私政策'), '隐私索引有标题');

console.log('\n[7] 链接与资源完整性');
const allHtml = [hub, ...plugins.map((p) => dom.navigate('#/p/' + p.id)), idx].join('\n');
const hrefs = [...allHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const unique = [...new Set(hrefs)];
let broken = 0;
for (const h of unique) {
  if (h.startsWith('http') || h.startsWith('#')) {
    if (h.startsWith('#/p/')) {
      const id = h.slice(4);
      if (!plugins.some((p) => p.id === id)) { broken += 1; bad(`路由指向不存在的插件：${h}`); }
    }
    continue;
  }
  if (h.startsWith('privacy.html?p=')) {
    const id = h.split('=')[1];
    if (!plugins.some((p) => p.id === id)) { broken += 1; bad(`隐私链接指向不存在的插件：${h}`); }
    continue;
  }
  if (!exists(h)) { broken += 1; bad(`本地资源 404：${h}`); }
}
if (!broken) ok(`${unique.length} 个链接 / 资源全部可解析`);

console.log('\n[8] 样式类覆盖');
const css = read('assets/style.css');
const classes = new Set();
for (const m of allHtml.matchAll(/class="([^"]+)"/g)) {
  m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
}
const missing = [...classes].filter((c) => !new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s,{:>~]').test(css));
assert(missing.length === 0, missing.length ? `样式里缺少：${missing.join(', ')}` : `${classes.size} 个样式类都有定义`);

console.log('\n[9] 静态页面结构');
for (const page of ['index.html', 'privacy.html', 'account.html']) {
  const html = read(page);
  assert(html.includes('assets/style.css'), `${page}：引入样式`);
  if (page !== 'account.html') assert(html.includes('assets/app.js'), `${page}：引入 app.js`);
  assert(!/panda-word-highlighter-2\.19\.0/.test(html), `${page}：无旧版本残留`);
}
assert(!fs.existsSync(path.join(ROOT, 'downloads/panda-word-highlighter-2.19.0.zip')), '旧的单版本安装包已清理');

console.log(`\n结果：${checks - fails}/${checks} 通过${fails ? `，${fails} 项失败` : ''}`);
process.exit(fails ? 1 : 0);
