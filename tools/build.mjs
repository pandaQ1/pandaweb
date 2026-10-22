#!/usr/bin/env node
/**
 * 官网构建脚本：从压缩包目录提取每个插件的最高版本，落地下载文件，生成站点数据。
 *
 *   node tools/build.mjs                 # 默认扫描 D:\桌面\ai压缩包
 *   node tools/build.mjs --archive=路径    # 指定其他压缩包目录
 *   node tools/build.mjs --dry            # 只看识别结果，不复制文件
 *
 * 做四件事：
 *   1) 递归扫描压缩包目录（含「插件历史版本」子目录），读取每个 zip 里的 manifest.json
 *   2) 按 manifest.name 匹配 data/plugins.json 里的插件，挑出语义化版本最高的那一个
 *   3) 复制成 downloads/<id>-v<版本>.zip 与 downloads/<id>-latest.zip，并抽取图标
 *   4) 生成 assets/plugins.data.js（内容 + 版本 / 大小 / SHA-256 / 日期）与 downloads/README.md
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { listEntries, readEntry } from './lib/zip.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const eq = hit.indexOf('=');
  return eq === -1 ? true : hit.slice(eq + 1);
};
const DRY = Boolean(argOf('dry', false));
const ARCHIVE = path.resolve(String(argOf('archive', 'D:\\桌面\\ai压缩包')));
const SKIP_NAME = /商店素材|提交资料|素材包|源素材/;

const DATA_FILE = path.join(ROOT, 'data', 'plugins.json');
const DL_DIR = path.join(ROOT, 'downloads');
const ICON_DIR = path.join(ROOT, 'assets', 'icons');
const OUT_FILE = path.join(ROOT, 'assets', 'plugins.data.js');

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn('⚠ ', ...a);

/* ---------- 工具 ---------- */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && /\.zip$/i.test(entry.name) && !SKIP_NAME.test(entry.name)) out.push(p);
  }
  return out;
}

function normName(s) {
  return String(s || '')
    .replace(/\s+/g, '')
    .replace(/[&·•、，,（）()【】[\]]/g, '')
    .toLowerCase();
}

function parseVersion(v) {
  return String(v || '')
    .split(/[.\-+_]/)
    .map((x) => Number.parseInt(x, 10))
    .filter((n) => Number.isFinite(n));
}

function cmpVersion(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function humanSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function ymd(date) {
  const d = new Date(date);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 读取 zip 内的 manifest.json 与一张最大的图标 */
function inspectZip(zipPath) {
  let entries;
  try {
    ({ entries } = listEntries(zipPath));
  } catch (e) {
    warn(`无法读取 ${path.basename(zipPath)}：${e.message}`);
    return null;
  }
  const names = entries.map((e) => e.name);
  if (!names.includes('manifest.json')) {
    warn(`跳过 ${path.basename(zipPath)}：根目录没有 manifest.json（包结构不符合发布规范）`);
    return null;
  }
  const iconName =
    names.find((n) => /^icons\/icon128\.png$/i.test(n)) ||
    names.find((n) => /^icons\/icon256\.png$/i.test(n)) ||
    names.find((n) => /icon128\.png$/i.test(n)) ||
    names.find((n) => /icon48\.png$/i.test(n)) ||
    null;

  let manifest;
  try {
    manifest = JSON.parse(readEntry(zipPath, 'manifest.json').toString('utf8'));
  } catch (e) {
    warn(`manifest.json 解析失败 ${path.basename(zipPath)}：${e.message}`);
    return null;
  }

  let icon = null;
  if (iconName) {
    try {
      icon = readEntry(zipPath, iconName);
    } catch {
      icon = null;
    }
  }
  return {
    zipPath,
    name: manifest.name,
    version: manifest.version,
    icon,
    date: ymd(fs.statSync(zipPath).mtime),
  };
}

/* ---------- 主流程 ---------- */
if (!fs.existsSync(ARCHIVE)) {
  console.error(`压缩包目录不存在：${ARCHIVE}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const plugins = data.plugins;
log(`压缩包目录：${ARCHIVE}`);
log(`插件配置：${plugins.length} 个（${plugins.map((p) => p.id).join(', ')}）\n`);

const zips = walk(ARCHIVE);
log(`发现 ${zips.length} 个候选压缩包`);

const found = new Map(); // id -> best candidate
const unmatched = [];
for (const zipPath of zips) {
  const info = inspectZip(zipPath);
  if (!info) continue;
  const norm = normName(info.name);
  const owner = plugins.find((p) => (p.match || []).some((m) => norm.includes(normName(m))));
  if (!owner) {
    unmatched.push(info);
    continue;
  }
  const prev = found.get(owner.id);
  if (!prev || cmpVersion(info.version, prev.version) > 0) found.set(owner.id, info);
}

if (unmatched.length) {
  log('\n未匹配到配置的压缩包（在 data/plugins.json 里加一条 match 就能收录）：');
  for (const u of unmatched) log(`  · ${path.basename(u.zipPath)} → ${u.name} v${u.version}`);
}

log('');
fs.mkdirSync(DL_DIR, { recursive: true });
fs.mkdirSync(ICON_DIR, { recursive: true });

const out = [];
for (const p of plugins) {
  const hit = found.get(p.id);
  if (!hit) {
    warn(`${p.id}：压缩包里没有找到安装包，本次不生成下载项（卡片会显示「安装包打包中」）`);
    out.push({ ...p, download: null });
    continue;
  }
  const versionedName = `${p.id}-v${hit.version}.zip`;
  const latestName = `${p.id}-latest.zip`;
  const bytes = fs.statSync(hit.zipPath).size;
  const hash = sha256(hit.zipPath);

  if (!DRY) {
    fs.copyFileSync(hit.zipPath, path.join(DL_DIR, versionedName));
    fs.copyFileSync(hit.zipPath, path.join(DL_DIR, latestName));
    if (hit.icon) fs.writeFileSync(path.join(ICON_DIR, `${p.id}.png`), hit.icon);
  }

  out.push({
    ...p,
    download: {
      version: hit.version,
      file: `downloads/${versionedName}`,
      latestFile: `downloads/${latestName}`,
      sizeBytes: bytes,
      sizeText: humanSize(bytes),
      date: hit.date,
      sha256: hash,
      source: path.basename(hit.zipPath),
    },
    icon: hit.iconPath ? `assets/icons/${p.id}.png` : null,
  });
  log(
    `✓ ${p.id.padEnd(20)} v${String(hit.version).padEnd(8)} ${humanSize(bytes).padStart(8)}  ${hit.date}  ← ${path.basename(hit.zipPath)}`
  );
}

/* ---------- 清理过期包 ---------- */
const keep = new Set();
for (const p of out) if (p.download) keep.add(path.basename(p.download.file)).add(path.basename(p.download.latestFile));
if (!DRY && fs.existsSync(DL_DIR)) {
  for (const f of fs.readdirSync(DL_DIR)) {
    if (!/\.zip$/i.test(f)) continue;
    if (!keep.has(f)) {
      fs.rmSync(path.join(DL_DIR, f));
      log(`- 移除过期包 downloads/${f}`);
    }
  }
}

/* ---------- 生成站点数据 ---------- */
const site = { ...data.site, generatedAt: new Date().toISOString(), archive: ARCHIVE };
const banner = `/* 自动生成，请勿手改：source = data/plugins.json + ${ARCHIVE}\n   重新生成：node tools/build.mjs */\n`;
const body = `window.PANDA_SITE = ${JSON.stringify(site, null, 2)};\nwindow.PANDA_PLUGINS = ${JSON.stringify(out, null, 2)};\n`;
if (!DRY) fs.writeFileSync(OUT_FILE, banner + body, 'utf8');

/* ---------- 生成下载目录说明 ---------- */
if (!DRY) {
  const rows = out
    .filter((p) => p.download)
    .map((p) => `| \`${path.basename(p.download.file)}\` | ${p.name} | v${p.download.version} | ${p.download.sizeText} | ${p.download.date} |`)
    .join('\n');
  const hashes = out
    .filter((p) => p.download)
    .map((p) => `- **${p.name}** v${p.download.version}：\`${p.download.sha256}\``)
    .join('\n');
  fs.writeFileSync(
    path.join(DL_DIR, 'README.md'),
    `# 安装包目录\n\n本目录由 \`node tools/build.mjs\` 自动生成：脚本扫描 \`${ARCHIVE}\`，取每个插件版本号最高的压缩包，\n复制成 \`<插件id>-v<版本>.zip\`（留档）与 \`<插件id>-latest.zip\`（固定链接，发新版时自动替换）。\n\n| 文件 | 插件 | 版本 | 大小 | 打包日期 |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## SHA-256\n\n${hashes}\n\n## 安装\n\n1. 下载并解压 zip（根目录应直接是 \`manifest.json\`）。\n2. 打开 \`edge://extensions\`（Chrome 为 \`chrome://extensions\`）。\n3. 打开「开发人员模式」。\n4. 点「加载解压缩的扩展」，选择解压出的文件夹。\n\n> 浏览器不允许网页静默安装扩展：想做到「点一下就装好」，需要通过商店（Edge 加载项 / Chrome 网上应用店）。详见官网首页的安装说明。\n`,
    'utf8'
  );
}

/* ---------- 摘要 ---------- */
log('');
for (const p of out) {
  if (p.download) log(`  ${p.id}: v${p.download.version} · ${p.download.sizeText} · sha256 ${p.download.sha256.slice(0, 12)}…`);
  else log(`  ${p.id}: 无安装包`);
}
if (DRY) log('\n[dry] 未写入任何文件');
else log(`\n已生成 ${path.relative(ROOT, OUT_FILE)} 与 downloads/README.md`);
