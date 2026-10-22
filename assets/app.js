/**
 * Panda 插件中心 —— 路由与页面拼装
 * 路由：#/  全部插件   |   #/p/<插件id>  单个插件
 * 依赖：assets/plugins.data.js（数据）、assets/ui.js（组件）、assets/fx.js（动效，可选）
 */
(function () {
  'use strict';

  var UI = window.PandaUI;
  if (!UI) {
    console.error('[site] 缺少 assets/ui.js');
    return;
  }
  var esc = UI.esc;
  var PLUGINS = UI.plugins;
  var SITE = UI.site;
  var FX = window.PandaFX;

  /* ============ 通用小块 ============ */

  function badgesHtml(p) {
    return (p.badges || []).map(function (b) {
      return '<span class="badge">' + esc(b) + '</span>';
    }).join('');
  }

  function memberNoteHtml(p) {
    if (!p.membership) return '';
    var m = p.membership;
    return (
      '<div class="member-note' + (m.required ? ' required' : '') + '" data-reveal>' +
        '<span class="member-badge">' + esc(m.label || (m.required ? 'PRO 会员' : '免费可用')) + '</span>' +
        '<span class="member-text">' + esc(m.note || '') + '</span>' +
        '<a class="member-link" href="account.html">账号与会员 →</a>' +
      '</div>'
    );
  }

  function stepsHtml(p) {
    var zipName = p && p.download ? p.download.file.split('/').pop() : '插件安装包.zip';
    return (
      '<div class="steps">' +
        '<div class="step" data-reveal><h3>下载并解压 zip</h3>' +
          '<p>下载 <code>' + esc(zipName) + '</code>，解压到任意固定位置（安装后不要删除这个文件夹）。</p></div>' +
        '<div class="step" data-reveal><h3>打开扩展管理页</h3>' +
          '<p>地址栏输入 <code>edge://extensions</code>（Chrome 为 <code>chrome://extensions</code>）回车。' +
          '<button class="mini-copy" type="button" data-copy="edge://extensions">复制地址</button></p></div>' +
        '<div class="step" data-reveal><h3>开启开发人员模式</h3>' +
          '<p>打开页面左侧（或右上角）的「开发人员模式 / 开发者模式」开关。</p></div>' +
        '<div class="step" data-reveal><h3>加载解压缩的扩展</h3>' +
          '<p>点击「加载解压缩的扩展」，选中刚解压出的文件夹（里面应有 <code>manifest.json</code>），完成 ✅</p></div>' +
      '</div>' +
      '<p class="note" data-reveal>手动安装的扩展不会自动更新：新版本在同一页面点「重新加载」即可；建议先移除旧版再加载新版。</p>'
    );
  }

  function whyHtml() {
    return (
      '<details class="why" data-reveal>' +
        '<summary>为什么点一下不能自动装进浏览器？</summary>' +
        '<div class="why-body">' +
          '<p>浏览器从安全角度禁止网页静默安装扩展：如果任意网站都能往浏览器里装插件，恶意站点就能随意窃取数据。' +
          '历史上 Chrome 的 <code>chrome.webstore.install()</code>「内联安装」接口已在 Chrome 71 被移除，' +
          'Edge / Chrome 现在只保留两条合法通道：</p>' +
          '<ul>' +
            '<li><strong>商店安装（最接近「点一下就装好」）</strong>：上架 Edge 加载项 / Chrome 网上应用店后，' +
            '点上面的商店按钮 → 浏览器弹出确认框 → 确认即装好，并且后续自动更新；</li>' +
            '<li><strong>本地 zip + 开发者模式</strong>：直接用本站压缩包安装，无需等待审核，但不会自动更新。</li>' +
          '</ul>' +
          '<p>所以本站的做法是：<strong>zip 直链下载始终可用</strong>，商店按钮在上架后自动变成一键安装；' +
          '企业内网批量部署可用 <code>ExtensionInstallForcelist</code> 策略静默安装（需管理员权限）。</p>' +
        '</div>' +
      '</details>'
    );
  }

  function featuresHtml(p) {
    return (p.features || []).map(function (f) {
      return (
        '<div class="card" data-reveal>' +
          '<div class="ico" aria-hidden="true">' + f.icon + '</div>' +
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
    return rows ? '<table class="data"><tr><th>权限 / 范围</th><th>用途</th></tr>' + rows + '</table>' : '';
  }

  /* ============ 首页 ============ */

  function cardHtml(p) {
    var bullets = (p.features || []).slice(0, 3).map(function (f) {
      return '<li><span class="li-ico" aria-hidden="true">' + f.icon + '</span>' + esc(f.title) + '</li>';
    }).join('');
    var dl = p.download
      ? '<a class="btn btn-ghost" href="' + esc(UI.dlHref(p)) + '" download>⬇ 下载 ' + esc(UI.versionLabel(p)) + '</a>'
      : '<span class="btn btn-ghost is-off">安装包打包中</span>';
    return (
      '<article class="pcard" data-reveal>' +
        '<div class="pcard-head">' +
          UI.icon(p, 'pcard-ico', 46) +
          '<div class="pcard-title">' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<span class="pcard-ver">' + esc(UI.versionLabel(p)) + (p.download ? ' · ' + esc(p.download.sizeText) : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="pcard-tag">' + esc(p.tagline) + '</p>' +
        '<ul class="pcard-list">' + bullets + '</ul>' +
        '<div class="pcard-stores">' + UI.storePills(p, { size: 'sm' }) + '</div>' +
        '<div class="pcard-foot">' +
          '<a class="btn btn-primary sm" href="#/p/' + esc(p.id) + '">查看详情</a>' + dl +
        '</div>' +
      '</article>'
    );
  }

  function renderHub() {
    var newest = UI.latestPlugin();
    var storeSlots = 2;
    return (
      UI.nav('') +
      '<main>' +
        '<section class="hub-hero">' +
          '<div class="hero-bg" aria-hidden="true">' +
            '<span class="glow g1" data-parallax="0.16"></span>' +
            '<span class="glow g2" data-parallax="0.09"></span>' +
            '<span class="dotgrid" data-parallax="0.05"></span>' +
          '</div>' +
          '<div class="container hero-inner">' +
            '<p class="kicker" data-reveal>Panda Plugins</p>' +
            '<h1 data-reveal>一个网站，装下所有 <span class="hl">Panda 插件</span></h1>' +
            '<p class="sub" data-reveal>' + esc(SITE.summary) + '</p>' +
            '<div class="hero-cta" data-reveal>' +
              '<a class="btn btn-primary" href="#/" data-goto="plugins">浏览 ' + PLUGINS.length + ' 个插件</a>' +
              '<a class="btn btn-ghost" href="#/" data-goto="install">怎么安装</a>' +
            '</div>' +
            '<div class="stat-row" data-reveal>' +
              '<div class="stat"><b data-count="' + PLUGINS.length + '" data-count-suffix=" 个">' + PLUGINS.length + ' 个</b><span>扩展</span></div>' +
              '<div class="stat"><b data-count="' + storeSlots + '" data-count-suffix=" 条">' + storeSlots + ' 条</b><span>商店通道</span></div>' +
              '<div class="stat"><b>0</b><span>中转服务器</span></div>' +
              '<div class="stat"><b>' + esc(newest && newest.download ? 'v' + newest.download.version : '—') + '</b><span>最近更新</span></div>' +
            '</div>' +
          '</div>' +
          '<a class="scroll-cue" href="#/" data-goto="plugins" aria-label="向下查看全部插件">' +
            '<span class="cue-arrow" aria-hidden="true">↓</span>' +
          '</a>' +
        '</section>' +

        '<section class="section" id="plugins">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Plugins</div>' +
              '<h2>全部插件</h2>' +
              '<p>每个插件都有独立的介绍、下载安装与隐私政策；点卡片或右上角切换即可跳转。</p>' +
            '</div>' +
            '<div class="plugin-grid">' + PLUGINS.map(cardHtml).join('') + '</div>' +
          '</div>' +
        '</section>' +

        '<section class="section" id="install">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Install</div><h2>安装方式</h2>' +
              '<p>所有插件都是浏览器扩展，安装方式相同：商店一键装，或 zip 手动加载。</p>' +
            '</div>' +
            stepsHtml(null) +
            whyHtml() +
          '</div>' +
        '</section>' +

        '<section class="section" id="about">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Principles</div><h2>做插件的几条底线</h2>' +
            '</div>' +
            '<div class="grid">' +
              '<div class="card" data-reveal><div class="ico" aria-hidden="true">🔒</div><h3>本地优先</h3>' +
                '<p>设置、历史、生词本等数据默认只存在你的浏览器里；卸载即清除，没有云端账号也能用。</p>' +
                '<span class="tag">无埋点 · 无遥测</span></div>' +
              '<div class="card" data-reveal><div class="ico" aria-hidden="true">🚫</div><h3>不注入远程代码</h3>' +
                '<p>所有脚本随安装包下发，不从服务器下载执行；这也符合 Edge / Chrome 应用商店的审核要求。</p>' +
                '<span class="tag">MV3 合规</span></div>' +
              '<div class="card" data-reveal><div class="ico" aria-hidden="true">🧾</div><h3>写明联网点</h3>' +
                '<p>每个插件的隐私政策都逐条列出「什么时候联网、把什么发给了谁」，只用最少必要数据。</p>' +
                '<span class="tag">透明可查</span></div>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</main>' +
      UI.footer()
    );
  }

  /* ============ 插件详情 ============ */

  function renderPlugin(p) {
    var downloadCta = p.download
      ? '<a class="btn btn-primary" href="' + esc(UI.dlHref(p)) + '" download>⬇ 下载 ' + esc(UI.versionLabel(p)) + '</a>'
      : '<span class="btn btn-primary is-off">安装包打包中</span>';

    return (
      UI.nav(p.id) +
      '<main>' +
        '<div class="sticky-bar"><div class="container crumb-row">' +
          '<a class="crumb" href="#/">← 全部插件</a>' +
          UI.chips(p.id) +
        '</div></div>' +

        '<section class="detail-hero">' +
          '<div class="hero-bg" aria-hidden="true">' +
            '<span class="glow g1" data-parallax="0.12"></span>' +
            '<span class="dotgrid" data-parallax="0.04"></span>' +
          '</div>' +
          '<div class="container">' +
            '<div class="detail-top">' +
              '<div class="detail-ico-wrap" data-parallax="-0.06">' + UI.icon(p, 'detail-ico', 84) + '</div>' +
              '<div class="detail-head" data-reveal>' +
                '<p class="detail-kicker">' + esc(p.shortName) + '</p>' +
                '<h1>' + esc(p.name) + ' <span class="ver-pill">' + esc(UI.versionLabel(p)) + '</span></h1>' +
                '<p class="detail-tag">' + esc(p.tagline) + '</p>' +
              '</div>' +
            '</div>' +
            '<p class="sub" data-reveal>' + esc(p.summary || '') + '</p>' +
            '<div class="hero-actions" data-reveal>' +
              UI.storePills(p, { align: 'left' }) +
              '<div class="cta-row">' + downloadCta +
                '<a class="btn btn-ghost" href="#/" data-goto="install">安装步骤</a>' +
                '<a class="btn btn-ghost" href="privacy.html?p=' + encodeURIComponent(p.id) + '">隐私政策</a>' +
              '</div>' +
            '</div>' +
            '<div class="hero-badges" data-reveal>' + badgesHtml(p) + '</div>' +
            memberNoteHtml(p) +
          '</div>' +
        '</section>' +

        '<section class="section" id="install">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Install</div><h2>手动安装</h2>' +
              '<p>适用于 Edge / Chrome / 其他 Chromium 内核浏览器，约 1 分钟。</p>' +
            '</div>' +
            stepsHtml(p) +
            whyHtml() +
            UI.pkgMeta(p) +
          '</div>' +
        '</section>' +

        '<section class="section" id="features">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Features</div><h2>' + esc(p.shortName) + '能做什么</h2>' +
              '<p>' + esc(p.tagline) + '</p>' +
            '</div>' +
            '<div class="grid">' + featuresHtml(p) + '</div>' +
          '</div>' +
        '</section>' +

        '<section class="section" id="privacy">' +
          '<div class="container">' +
            '<div class="section-head" data-reveal>' +
              '<div class="kicker">Privacy</div><h2>权限与隐私</h2>' +
              '<p>这是「' + esc(p.shortName) + '」申请的全部权限与用途；完整政策见 ' +
              '<a class="inline-link" href="privacy.html?p=' + encodeURIComponent(p.id) + '">隐私政策</a>。</p>' +
            '</div>' +
            '<div class="perm-wrap" data-reveal>' + permsHtml(p) + '</div>' +
          '</div>' +
        '</section>' +
      '</main>' +
      UI.footer()
    );
  }

  /* ============ 路由 ============ */

  var lastRoute = null;

  function parseRoute() {
    var hash = location.hash.replace(/^#\/?/, '');
    var m = /^p\/([\w-]+)/.exec(hash);
    return m ? { name: 'plugin', id: m[1] } : { name: 'hub' };
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
      var p = UI.byId(route.id);
      if (p) {
        app.innerHTML = renderPlugin(p);
        setMeta(p.name + ' ' + UI.versionLabel(p) + ' — ' + SITE.name, p.summary || p.tagline);
        document.documentElement.setAttribute('data-plugin', p.id);
        if (lastRoute !== 'p:' + p.id) window.scrollTo(0, 0);
        lastRoute = 'p:' + p.id;
        if (FX) FX.refresh();
        return;
      }
    }

    app.innerHTML = renderHub();
    setMeta(SITE.name + ' — 全部插件下载与安装', SITE.summary || '');
    document.documentElement.setAttribute('data-plugin', '');
    if (lastRoute !== 'hub') window.scrollTo(0, 0);
    lastRoute = 'hub';
    if (FX) FX.refresh();
  }

  /* ============ 交互 ============ */

  function closeMenu() {
    var menu = document.getElementById('psMenu');
    var btn = document.getElementById('psBtn');
    if (menu && !menu.hasAttribute('hidden')) menu.setAttribute('hidden', '');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function scrollToSection(id) {
    var target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: FX && FX.enabled ? 'smooth' : 'auto', block: 'start' });
      return true;
    }
    return false;
  }

  /** 导航里的「插件 / 安装」：当前页有区块就滚，没有就回首页再滚，跨页时记住目标 */
  function gotoSection(id) {
    if (scrollToSection(id)) return;
    if (!document.getElementById('app')) {
      // 非 SPA 页（如 account.html）：带上去向再跳首页
      try { sessionStorage.setItem('panda-goto', id); } catch (e) { /* ignore */ }
      location.href = 'index.html';
      return;
    }
    location.hash = '#/';
    setTimeout(function () { scrollToSection(id); }, 90);
  }

  function bind() {
    document.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) {
        e.preventDefault();
        UI.copyText(copyBtn.getAttribute('data-copy'), copyBtn);
        return;
      }

      var goto = e.target.closest('[data-goto]');
      if (goto) {
        e.preventDefault();
        closeMenu();
        gotoSection(goto.getAttribute('data-goto'));
        return;
      }

      var btn = e.target.closest('#psBtn');
      if (btn) {
        var menu = document.getElementById('psMenu');
        var open = menu.hasAttribute('hidden');
        if (open) menu.removeAttribute('hidden');
        else menu.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }

      if (document.getElementById('psMenu') && !document.getElementById('psMenu').hasAttribute('hidden')) {
        if (!e.target.closest('#psMenu') || e.target.closest('.ps-item')) closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('hashchange', function () {
      render();
      UI.initTheme();
    });
  }

  /* ============ 启动 ============ */

  function ready() {
    try {
      var q = new URLSearchParams(location.search).get('p');
      if (q && UI.byId(q) && !/^#\/?p\//.test(location.hash)) {
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
    UI.initTheme();
    bind();

    // 从 account.html 等非 SPA 页跳回来时，恢复「要滚到哪个区块」
    var pending = null;
    try { pending = sessionStorage.getItem('panda-goto'); } catch (e) { /* ignore */ }
    if (pending) {
      try { sessionStorage.removeItem('panda-goto'); } catch (e) { /* ignore */ }
      setTimeout(function () { scrollToSection(pending); }, 60);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
