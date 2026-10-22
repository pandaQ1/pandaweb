/**
 * Panda 插件中心 —— 多插件官网前端
 * 数据来自 assets/plugins.data.js（由 tools/build.mjs 从 data/plugins.json + 压缩包生成）
 * 路由： #/            全部插件
 *        #/p/<id>      单个插件详情（介绍 / 下载安装 / 隐私摘要）
 * 隐私政策页： privacy.html?p=<id>
 */
(function () {
  'use strict';

  var SITE = window.PANDA_SITE || { name: 'Panda 插件中心', summary: '', repoUrl: '' };
  var PLUGINS = window.PANDA_PLUGINS || [];
  var KIND_EMOJI = { reading: '📖', video: '🎬', site: '🧩' };

  /* ---------------- 工具 ---------------- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }
  function byId(id) {
    for (var i = 0; i < PLUGINS.length; i += 1) if (PLUGINS[i].id === id) return PLUGINS[i];
    return null;
  }
  function latestPlugin() {
    var best = null;
    PLUGINS.forEach(function (p) {
      if (!p.download) return;
      if (!best || String(p.download.date) > String(best.download.date)) best = p;
    });
    return best || PLUGINS[0] || null;
  }
  function iconHtml(p, cls, size) {
    var emoji = KIND_EMOJI[p.kind] || '🧩';
    if (p.icon) return '<img class="' + cls + '" src="' + esc(p.icon) + '" alt="' + esc(p.name) + ' 图标" width="' + size + '" height="' + size + '" />';
    return '<span class="' + cls + ' emoji" style="width:' + size + 'px;height:' + size + 'px">' + emoji + '</span>';
  }
  function dlHref(p) {
    return p.download ? p.download.file : '';
  }
  function versionLabel(p) {
    return p.download ? 'v' + p.download.version : '打包中';
  }
  function copyText(text, btn) {
    var done = function (ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? '已复制 ✓' : '复制失败';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (e) {
      done(false);
    }
  }

  /* ---------------- 主题 ---------------- */
  function initTheme() {
    var root = document.documentElement;
    var btns = document.querySelectorAll('[data-theme-toggle]');
    function paint(t) {
      root.setAttribute('data-theme', t);
      for (var i = 0; i < btns.length; i += 1) btns[i].textContent = t === 'dark' ? '☀️' : '🌙';
    }
    paint(root.getAttribute('data-theme') || 'light');
    for (var i = 0; i < btns.length; i += 1) {
      btns[i].addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        paint(next);
        try { localStorage.setItem('site-theme', next); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------------- 公共片段 ---------------- */
  function navHtml(activeId) {
    var cur = activeId ? byId(activeId) : null;
    var items = PLUGINS.map(function (p) {
      return (
        '<a class="ps-item' + (p.id === activeId ? ' active' : '') + '" href="#/p/' + esc(p.id) + '">' +
          iconHtml(p, 'ps-ico', 30) +
          '<span class="ps-text">' +
            '<span class="ps-name">' + esc(p.name) + '</span>' +
            '<span class="ps-sub">' + esc(p.tagline) + '</span>' +
          '</span>' +
          '<span class="ps-ver">' + esc(versionLabel(p)) + '</span>' +
        '</a>'
      );
    }).join('');

    return (
      '<header class="nav"><div class="container nav-inner">' +
        '<a class="brand" href="#/">' +
          '<img src="assets/icons/icon128.png" alt="" />' +
          '<span>' + esc(SITE.name) + '</span>' +
        '</a>' +
        '<div class="ps" id="ps">' +
          '<button class="ps-btn" id="psBtn" type="button" aria-haspopup="true" aria-expanded="false">' +
            '<span class="ps-cur">' + (cur ? esc(cur.shortName) : '全部插件') + '</span>' +
            '<span class="ps-caret" aria-hidden="true">▾</span>' +
          '</button>' +
          '<div class="ps-menu" id="psMenu" hidden>' +
            '<a class="ps-item ps-all' + (activeId ? '' : ' active') + '" href="#/">' +
              '<span class="ps-ico emoji">🗂️</span>' +
              '<span class="ps-text"><span class="ps-name">全部插件</span><span class="ps-sub">' + PLUGINS.length + ' 个扩展的总览</span></span>' +
            '</a>' +
            '<div class="ps-sep"></div>' +
            items +
          '</div>' +
        '</div>' +
        '<nav class="nav-links">' +
          '<a href="#plugins" class="hide-sm">插件</a>' +
          '<a href="#install" class="hide-sm">安装</a>' +
          '<a href="privacy.html' + (activeId ? '?p=' + encodeURIComponent(activeId) : '') + '">隐私</a>' +
          '<a href="' + esc(SITE.accountPage || 'account.html') + '">账号</a>' +
          '<button class="theme-btn" type="button" data-theme-toggle title="切换日间 / 夜间主题" aria-label="切换主题">🌙</button>' +
        '</nav>' +
      '</div></header>'
    );
  }

  function footerHtml() {
    var links = PLUGINS.map(function (p) {
      return '<a href="#/p/' + esc(p.id) + '">' + esc(p.shortName) + '</a>';
    }).join('');
    return (
      '<footer class="footer"><div class="container footer-inner">' +
        '<a class="brand" href="#/"><img src="assets/icons/icon128.png" alt="" /><span>' + esc(SITE.name) + '</span></a>' +
        '<nav>' + links + '<a href="privacy.html">隐私政策</a><a href="' + esc(SITE.accountPage || 'account.html') + '">账号</a></nav>' +
        '<p class="copy">© ' + new Date().getFullYear() + ' ' + esc(SITE.name) + ' · GitHub Pages 托管 · 全部扩展本地运行</p>' +
      '</div></footer>'
    );
  }

  /* ---------------- 安装说明（全站通用） ---------------- */
  function installHtml(p) {
    var zipName = p && p.download ? p.download.file.split('/').pop() : '插件安装包.zip';
    return (
      '<div class="steps">' +
        '<div class="step"><h3>下载并解压 zip</h3><p>下载 <code>' + esc(zipName) + '</code>，解压到任意固定位置（安装后不要删除这个文件夹）。</p></div>' +
        '<div class="step"><h3>打开扩展管理页</h3><p>地址栏输入 <code>edge://extensions</code>（Chrome 为 <code>chrome://extensions</code>）回车。<button class="mini-copy" type="button" data-copy="edge://extensions">复制地址</button></p></div>' +
        '<div class="step"><h3>开启开发人员模式</h3><p>打开页面左侧（或右上角）的「开发人员模式 / 开发者模式」开关。</p></div>' +
        '<div class="step"><h3>加载解压缩的扩展</h3><p>点击「加载解压缩的扩展」，选中刚解压出的文件夹（里面应有 <code>manifest.json</code>），完成 ✅</p></div>' +
      '</div>' +
      '<p class="note">手动安装的扩展不会自动更新：新版本在同一页面点「重新加载」即可；建议先移除旧版再加载新版。</p>' +
      '<details class="why">' +
        '<summary>为什么点一下不能自动装进浏览器？</summary>' +
        '<div class="why-body">' +
          '<p>浏览器从安全角度禁止网页静默安装扩展：如果任意网站都能往浏览器里装插件，恶意站点就能随意窃取数据。历史上 Chrome 的 <code>chrome.webstore.install()</code>「内联安装」接口已在 Chrome 71 被移除，Edge / Chrome 现在只保留两条合法通道：</p>' +
          '<ul>' +
            '<li><strong>商店安装（最接近「点一下就装好」）</strong>：扩展上架 Edge 加载项 / Chrome 网上应用店后，点商店按钮 → 浏览器弹出确认框 → 确认即完成安装，并且后续自动更新；</li>' +
            '<li><strong>本地 zip + 开发者模式</strong>：从本站直接下载压缩包，用「加载解压缩的扩展」安装，无需等待审核，但不会自动更新。</li>' +
          '</ul>' +
          '<p>所以本站的做法是：<strong>zip 直链下载始终可用</strong>，商店链接在上架后补上；企业内网批量部署可用 <code>ExtensionInstallForcelist</code> 策略静默安装（需管理员权限）。</p>' +
        '</div>' +
      '</details>'
    );
  }

  function storeHtml(p) {
    var stores = p.stores || {};
    function card(kind, emoji, title, s) {
      var st = (s && s.status) || '待上架';
      var url = s && s.url;
      var inner =
        '<div class="ico">' + emoji + '</div>' +
        '<div><h3>' + title + '</h3><p>' + esc(st) + '</p></div>';
      if (url) {
        return '<a class="store" href="' + esc(url) + '" target="_blank" rel="noopener">' + inner + '</a>';
      }
      return '<div class="store is-off" aria-disabled="true">' + inner + '</div>';
    }
    return (
      '<div class="stores">' +
        card('edge', '🧭', 'Edge 加载项商店', stores.edge) +
        card('chrome', '🧩', 'Chrome 网上应用店', stores.chrome) +
      '</div>' +
      '<p class="note">商店上架后这里会变成「一键安装」按钮：点一下 → 浏览器确认 → 自动装好并持续更新。当前先使用下方 zip 安装。</p>'
    );
  }

  /* ---------------- 首页（全部插件） ---------------- */
  function cardHtml(p) {
    var bullets = (p.features || []).slice(0, 3).map(function (f) {
      return '<li><span class="li-ico">' + f.icon + '</span>' + esc(f.title) + '</li>';
    }).join('');
    var dl = p.download
      ? '<a class="btn btn-ghost" href="' + esc(dlHref(p)) + '" download>⬇ 下载 ' + esc(versionLabel(p)) + '</a>'
      : '<span class="btn btn-ghost is-off">安装包打包中</span>';
    return (
      '<article class="pcard">' +
        '<div class="pcard-head">' +
          iconHtml(p, 'pcard-ico', 48) +
          '<div class="pcard-title">' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<span class="pcard-ver">' + esc(versionLabel(p)) + (p.download ? ' · ' + esc(p.download.sizeText) : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="pcard-tag">' + esc(p.tagline) + '</p>' +
        '<ul class="pcard-list">' + bullets + '</ul>' +
        '<div class="pcard-foot">' +
          '<a class="btn btn-primary sm" href="#/p/' + esc(p.id) + '">查看详情</a>' +
          dl +
        '</div>' +
      '</article>'
    );
  }

  function renderHub() {
    var cards = PLUGINS.map(cardHtml).join('');
    var newest = latestPlugin();
    return (
      navHtml('') +
      '<main>' +
        '<section class="hub-hero">' +
          '<div class="container">' +
            '<div class="kicker">Panda Plugins</div>' +
            '<h1>一个网站，装下所有 <span class="hl">Panda 插件</span></h1>' +
            '<p class="sub">' + esc(SITE.summary) + '</p>' +
            '<div class="hero-cta">' +
              '<a class="btn btn-primary" href="#plugins">浏览 ' + PLUGINS.length + ' 个插件</a>' +
              '<a class="btn btn-ghost" href="#install">怎么安装</a>' +
            '</div>' +
            '<div class="stat-row">' +
              '<div class="stat"><b>' + PLUGINS.length + '</b><span>个扩展</span></div>' +
              '<div class="stat"><b>' + (newest && newest.download ? 'v' + newest.download.version : '—') + '</b><span>最近更新</span></div>' +
              '<div class="stat"><b>0</b><span>个中转服务器</span></div>' +
              '<div class="stat"><b>zip</b><span>直链下载</span></div>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<section class="section" id="plugins">' +
          '<div class="container">' +
            '<div class="section-head">' +
              '<div class="kicker">Plugins</div>' +
              '<h2>全部插件</h2>' +
              '<p>每个插件都有独立的介绍、下载安装与隐私政策；点击卡片或右上角切换即可跳到对应插件。</p>' +
            '</div>' +
            '<div class="plugin-grid">' + cards + '</div>' +
          '</div>' +
        '</section>' +
        '<section class="section" id="install"><div class="container">' +
          '<div class="section-head">' +
            '<div class="kicker">Install</div><h2>安装方式</h2>' +
            '<p>所有插件都是浏览器扩展，安装方式相同：商店一键装，或 zip 手动加载。</p>' +
          '</div>' +
          installHtml(null) +
          storeHtml({}) +
        '</div></section>' +
        '<section class="section" id="about"><div class="container">' +
          '<div class="section-head"><div class="kicker">Principles</div><h2>做插件的几条底线</h2></div>' +
          '<div class="grid">' +
            '<div class="card"><div class="ico">🔒</div><h3>本地优先</h3><p>设置、历史、生词本等数据默认只存在你的浏览器里；卸载即清除，没有云端账号也能正常使用。</p><span class="tag">无埋点 · 无遥测</span></div>' +
            '<div class="card"><div class="ico">🚫</div><h3>不注入远程代码</h3><p>所有脚本随安装包下发，不从服务器下载执行；这也符合 Edge / Chrome 应用商店的审核要求。</p><span class="tag">MV3 合规</span></div>' +
            '<div class="card"><div class="ico">🧾</div><h3>明确写出联网点</h3><p>每个插件的隐私政策都逐条列出「什么时候会联网、把什么发给了谁」，只用最少必要数据。</p><span class="tag">透明可查</span></div>' +
          '</div>' +
        '</div></section>' +
      '</main>' +
      footerHtml()
    );
  }

  /* ---------------- 插件详情 ---------------- */
  function featuresHtml(p) {
    return (p.features || []).map(function (f) {
      return (
        '<div class="card">' +
          '<div class="ico">' + f.icon + '</div>' +
          '<h3>' + esc(f.title) + '</h3>' +
          '<p>' + esc(f.desc) + '</p>' +
          (f.tag ? '<span class="tag">' + esc(f.tag) + '</span>' : '') +
        '</div>'
      );
    }).join('');
  }

  function permsHtml(p) {
    var rows = (p.permissions || []).map(function (x) {
      return '<tr><td><code>' + esc(x.name) + '</code></td><td>' + esc(x.purpose) + '</td></tr>';
    }).join('');
    if (!rows) return '';
    return (
      '<table class="data"><tr><th>权限 / 范围</th><th>用途</th></tr>' + rows + '</table>'
    );
  }

  function downloadHtml(p) {
    if (!p.download) {
      return (
        '<div class="dl"><div class="dl-main"><div class="ico">📦</div>' +
        '<div><h3>' + esc(p.name) + ' <span class="dl-ver">打包中</span></h3>' +
        '<p>压缩包目录里还没有这个插件的安装包，先看介绍，等打包后再回来下载。</p></div></div></div>'
      );
    }
    var d = p.download;
    return (
      '<div class="dl">' +
        '<div class="dl-main">' +
          '<div class="ico">📦</div>' +
          '<div>' +
            '<h3>' + esc(p.name) + ' <span class="dl-ver">v' + esc(d.version) + '</span></h3>' +
            '<p>官方 zip 安装包 · 解压后用「加载解压缩的扩展」安装</p>' +
            '<div class="dl-meta">' +
              '<span>zip</span><span>·</span><span>' + esc(d.sizeText) + '</span><span>·</span>' +
              '<span>' + esc(d.date) + '</span><span>·</span><span>Chromium 111+</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="dl-actions">' +
          '<a class="btn btn-primary" href="' + esc(d.file) + '" download>⬇ 下载 v' + esc(d.version) + '</a>' +
          '<a class="btn btn-ghost" href="' + esc(d.latestFile) + '" download>最新版（固定链接）</a>' +
        '</div>' +
      '</div>' +
      '<p class="dl-hash">SHA-256：<code>' + esc(d.sha256) + '</code>' +
        '<button class="mini-copy" type="button" data-copy="' + esc(d.sha256) + '">复制校验值</button>' +
      '</p>'
    );
  }

  function renderPlugin(p) {
    var chips = PLUGINS.map(function (x) {
      return '<a class="chip' + (x.id === p.id ? ' active' : '') + '" href="#/p/' + esc(x.id) + '">' +
        iconHtml(x, 'chip-ico', 20) + '<span>' + esc(x.shortName) + '</span>' +
        '<span class="chip-ver">' + esc(versionLabel(x)) + '</span></a>';
    }).join('');

    var badges = (p.badges || []).map(function (b) { return '<span class="badge">' + esc(b) + '</span>'; }).join('');
    var story = p.summary || '';
    var memberNote = p.membership
      ? '<div class="member-note' + (p.membership.required ? ' required' : '') + '">' +
          '<span class="member-badge">' + esc(p.membership.label || (p.membership.required ? 'PRO 会员' : '免费可用')) + '</span>' +
          '<span class="member-text">' + esc(p.membership.note || '') + '</span>' +
          '<a class="member-link" href="' + esc(SITE.accountPage || 'account.html') + '">账号与会员 →</a>' +
        '</div>'
      : '';

    return (
      navHtml(p.id) +
      '<main>' +
        '<div class="container crumb-row">' +
          '<a class="crumb" href="#/">← 全部插件</a>' +
          '<div class="chips">' + chips + '</div>' +
        '</div>' +
        '<section class="detail-hero">' +
          '<div class="container">' +
            '<div class="detail-top">' +
              iconHtml(p, 'detail-ico', 84) +
              '<div class="detail-head">' +
                '<div class="detail-kicker">' + esc(p.shortName) + '</div>' +
                '<h1>' + esc(p.name) + ' <span class="ver-pill">' + esc(versionLabel(p)) + '</span></h1>' +
                '<p class="detail-tag">' + esc(p.tagline) + '</p>' +
              '</div>' +
            '</div>' +
            '<p class="sub">' + esc(story) + '</p>' +
            '<div class="hero-cta left">' +
              (p.download
                ? '<a class="btn btn-primary" href="' + esc(dlHref(p)) + '" download>⬇ 下载 ' + esc(versionLabel(p)) + '</a>'
                : '<span class="btn btn-primary is-off">安装包打包中</span>') +
              '<a class="btn btn-ghost" href="#install">安装步骤</a>' +
              '<a class="btn btn-ghost" href="privacy.html?p=' + encodeURIComponent(p.id) + '">隐私政策</a>' +
            '</div>' +
            '<div class="hero-badges left">' + badges + '</div>' +
            memberNote +
          '</div>' +
        '</section>' +

        '<section class="section" id="download"><div class="container">' +
          '<div class="section-head"><div class="kicker">Download</div><h2>下载安装</h2>' +
            '<p>zip 直链下载始终可用；商店上架后这里同样接受一键安装。</p></div>' +
          downloadHtml(p) +
          '<div class="section-head" style="margin-top:52px"><h2 style="font-size:22px">从商店安装（上架后可用）</h2>' +
            '<p>商店版本可自动更新；直链包适合离线 / 内网环境。</p></div>' +
          storeHtml(p) +
        '</div></section>' +

        '<section class="section" id="install"><div class="container">' +
          '<div class="section-head"><div class="kicker">Install</div><h2>手动安装（开发者模式）</h2>' +
            '<p>适用于 Edge / Chrome / 其他 Chromium 内核浏览器，约 1 分钟。</p></div>' +
          installHtml(p) +
        '</div></section>' +

        '<section class="section" id="features"><div class="container">' +
          '<div class="section-head"><div class="kicker">Features</div><h2>' + esc(p.shortName) + '能做什么</h2>' +
            '<p>' + esc(p.tagline) + '</p></div>' +
          '<div class="grid">' + featuresHtml(p) + '</div>' +
        '</div></section>' +

        '<section class="section" id="privacy"><div class="container">' +
          '<div class="section-head"><div class="kicker">Privacy</div><h2>权限与隐私</h2>' +
            '<p>下面是这个扩展申请的全部权限与用途；完整政策见' +
            ' <a class="inline-link" href="privacy.html?p=' + encodeURIComponent(p.id) + '">隐私政策</a>。</p></div>' +
          '<div class="perm-wrap">' + permsHtml(p) + '</div>' +
        '</div></section>' +
      '</main>' +
      footerHtml()
    );
  }

  /* ---------------- 路由 ---------------- */
  var lastId = null;

  function parseRoute() {
    var hash = location.hash.replace(/^#\/?/, '');
    var m = /^p\/([\w-]+)/.exec(hash);
    if (m) return { name: 'plugin', id: m[1] };
    return { name: 'hub' };
  }

  function setMeta(title, description) {
    document.title = title;
    var el = document.querySelector('meta[name="description"]');
    if (el && description) el.setAttribute('content', description);
  }

  function render() {
    var app = document.getElementById('app');
    if (!app) return;
    var route = parseRoute();

    if (route.name === 'plugin') {
      var p = byId(route.id);
      if (p) {
        app.innerHTML = renderPlugin(p);
        setMeta(p.name + ' ' + versionLabel(p) + ' — ' + SITE.name, p.summary || p.tagline);
        if (lastId !== p.id) window.scrollTo(0, 0);
        lastId = p.id;
        document.documentElement.setAttribute('data-plugin', p.id);
        return;
      }
    }

    app.innerHTML = renderHub();
    setMeta(SITE.name + ' — 全部插件下载与安装', SITE.summary || '');
    if (lastId !== 'hub') window.scrollTo(0, 0);
    lastId = 'hub';
    document.documentElement.setAttribute('data-plugin', '');
  }

  /* ---------------- 事件绑定（委托） ---------------- */
  function bind() {
    document.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) {
        e.preventDefault();
        copyText(copyBtn.getAttribute('data-copy'), copyBtn);
        return;
      }
      var psBtn = e.target.closest('#psBtn');
      if (psBtn) {
        var menu = document.getElementById('psMenu');
        if (menu) {
          var open = menu.hasAttribute('hidden');
          if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
          psBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        return;
      }
      var insideMenu = e.target.closest('#psMenu');
      var menuEl = document.getElementById('psMenu');
      if (menuEl && !menuEl.hasAttribute('hidden') && (!insideMenu || e.target.closest('.ps-item'))) {
        menuEl.setAttribute('hidden', '');
        var b = document.getElementById('psBtn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var menu = document.getElementById('psMenu');
      if (menu && !menu.hasAttribute('hidden')) {
        menu.setAttribute('hidden', '');
        var b = document.getElementById('psBtn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('hashchange', function () {
      render();
      initTheme();
    });
  }

  /* ---------------- 启动 ---------------- */
  function ready() {
    // 兼容老链接： index.html?p=<id> → #/p/<id>
    try {
      var q = new URLSearchParams(location.search).get('p');
      if (q && byId(q) && !/^#\/?p\//.test(location.hash)) {
        location.replace(location.pathname + '#/p/' + q);
        return;
      }
    } catch (e) { /* ignore */ }

    if (!PLUGINS.length) {
      var app = document.getElementById('app');
      if (app) {
        app.innerHTML = '<div class="container" style="padding:80px 24px">' +
          '<h1>数据未生成</h1><p>请先运行 <code>node tools/build.mjs</code> 生成 assets/plugins.data.js。</p></div>';
      }
      return;
    }
    render();
    initTheme();
    bind();
  }

  // 供 privacy.html / account.html 复用同一套导航与页脚
  window.PandaSite = {
    site: SITE,
    plugins: PLUGINS,
    nav: navHtml,
    footer: footerHtml,
    icon: iconHtml,
    esc: esc,
    initTheme: initTheme,
    versionLabel: versionLabel,
    kindEmoji: KIND_EMOJI,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
