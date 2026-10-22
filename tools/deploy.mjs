#!/usr/bin/env node
/**
 * 把站点发布到 GitHub（pandaQ1/pandaweb）—— 走 REST Git Data API，不需要本地 git。
 *
 *   node tools/deploy.mjs --dry        # 只看将新增 / 修改 / 删除哪些文件
 *   node tools/deploy.mjs              # 真正提交
 *   node tools/deploy.mjs --message="chore: xxx"
 *
 * 令牌来源（按顺序）：环境变量 GITHUB_TOKEN / GH_TOKEN → ~/.dsh/github-plugin-upload/token.txt
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OWNER = process.env.PANDAWEB_OWNER || 'pandaQ1';
const REPO = process.env.PANDAWEB_REPO || 'pandaweb';
const BRANCH = process.env.PANDAWEB_BRANCH || 'main';
const API = 'https://api.github.com';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const MESSAGE =
  (args.find((a) => a.startsWith('--message=')) || '').slice('--message='.length) ||
  'feat(site): 多插件官网（插件切换 + 逐插件隐私政策 + 自动下载包）';

/* 参与发布的目录 / 文件白名单 */
const ROOTS = ['assets', 'downloads', 'data', 'tools'];
const ROOT_FILES = /^(index\.html|privacy\.html|account\.html|404\.html|README\.md|\.gitignore|sitemap\.xml)$/;
const SKIP = /(^|\/)(\.tmp|\.inspect|node_modules|pandaweb-main)(\/|$)/;

function token() {
  const env = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.DSH_GITHUB_TOKEN;
  if (env && env.trim()) return env.trim();
  const f = path.join(os.homedir(), '.dsh', 'github-plugin-upload', 'token.txt');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  throw new Error('找不到 GitHub 令牌：设置 GITHUB_TOKEN 或写入 ~/.dsh/github-plugin-upload/token.txt');
}

const TOKEN = token();

async function gh(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'User-Agent': 'pandaweb-deploy',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || text.slice(0, 200);
    throw new Error(`${method} ${url} → ${res.status} ${msg}`);
  }
  return json;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (SKIP.test(rel)) continue;
    if (e.isDirectory()) walk(abs, out);
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

function localFiles() {
  const files = new Set();
  for (const f of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (f.isFile() && ROOT_FILES.test(f.name)) files.add(f.name);
  }
  for (const d of ROOTS) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const rel of walk(abs)) files.add(rel);
  }
  return [...files].sort();
}

async function main() {
  console.log(`仓库：${OWNER}/${REPO} · 分支 ${BRANCH}`);
  const ref = await gh('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const headSha = ref.object.sha;
  const headCommit = await gh('GET', `/repos/${OWNER}/${REPO}/git/commits/${headSha}`);
  const baseTree = headCommit.tree.sha;
  console.log(`HEAD：${headSha.slice(0, 8)} · base tree ${baseTree.slice(0, 8)}`);

  const remoteTree = await gh('GET', `/repos/${OWNER}/${REPO}/git/trees/${baseTree}?recursive=1`);
  const remote = new Map();
  for (const e of remoteTree.tree || []) if (e.type === 'blob') remote.set(e.path, e.sha);

  const local = localFiles();
  const localSet = new Set(local);

  // 需要删除的旧文件：位于我们管理的目录里，但本地已经没有了
  const managed = (p) => ROOTS.some((d) => p.startsWith(d + '/')) || ROOT_FILES.test(p);
  const deletions = [...remote.keys()].filter((p) => managed(p) && !localSet.has(p));

  console.log(`本地文件 ${local.length} 个，远端 ${remote.size} 个，待删除 ${deletions.length} 个`);
  if (delDry()) return;

  // 逐个上传 blob（内容未变也会重传，但体积只有几百 KB，简单可靠）
  const entries = [];
  let bytes = 0;
  for (const rel of local) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    bytes += buf.length;
    const blob = await gh('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: buf.toString('base64'),
      encoding: 'base64',
    });
    entries.push({ path: rel, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write(`\r  已上传 ${entries.length}/${local.length}  ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  }
  process.stdout.write('\n');

  for (const p of deletions) entries.push({ path: p, mode: '100644', type: 'blob', sha: null });

  const tree = await gh('POST', `/repos/${OWNER}/${REPO}/git/trees`, { base_tree: baseTree, tree: entries });
  const commit = await gh('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: MESSAGE,
    tree: tree.sha,
    parents: [headSha],
  });
  await gh('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });

  console.log(`\n✅ 已提交 ${commit.sha.slice(0, 8)}`);
  console.log(`   ${MESSAGE}`);
  console.log(`   https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`);
  if (deletions.length) console.log(`   删除：${deletions.join(', ')}`);

  function delDry() {
    if (!DRY) return false;
    const added = local.filter((p) => !remote.has(p));
    const changed = local.filter((p) => remote.has(p));
    console.log(`\n[dry] 新增 ${added.length}：\n  ${added.join('\n  ') || '—'}`);
    console.log(`[dry] 覆盖 ${changed.length}：\n  ${changed.join('\n  ') || '—'}`);
    console.log(`[dry] 删除 ${deletions.length}：\n  ${deletions.join('\n  ') || '—'}`);
    return true;
  }
}

main().catch((e) => {
  console.error('\n❌ ' + e.message);
  process.exit(1);
});
