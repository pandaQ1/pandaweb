/**
 * Panda 插件中心 —— UI 组件层
 * 只放「可复用、无状态」的东西：转义、图标、切换器导航、页脚、插件 chips、
 * 商店小按钮、安装包信息、主题、复制。页面拼装在 app.js，动效在 fx.js。
 */
(function () {
  'use strict';

  var SITE = window.PANDA_SITE || { name: 'Panda 插件中心', summary: '', repoUrl: '' };
  var PLUGINS = window.PANDA_PLUGINS || [];
  var KIND_ICON = { reading: '📖', video: '🎬', site: '🧩' };
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /* ---------- 基础工具 ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
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

  function versionLabel(p) {
    return p && p.download ? 'v' + p.download.version : '打包中';
  }

  function dlHref(p) {
    return p && p.download ? p.download.file : '';
  }

  /* ---------- 图标 ---------- */
  function iconHtml(p, cls, size) {
    if (p.icon) {
      return '<img class="' + cls + '" src="' + esc(p.icon) + '" alt="' + esc(p.name) + ' 图标" width="' + size + '" height="' + size + '" loading="lazy" decoding="async" />';
    }
    var emoji = KIND_ICON[p.kind] || '🧩';
    return '<span class="' + cls + ' emoji" style="width:' + size + 'px;height:' + size + 'px">' + emoji + '</span>';
  }

  /* ---------- 商店小按钮（Edge / Chrome） ---------- */
  var STORE_META = {
    edge: { icon: '🧭', name: 'Edge 商店' },
    chrome: { icon: '🧩', name: 'Chrome 商店' },
  };

  /**
   * @param {object} p 插件
   * @param {{size?:'sm', align?:'left'|'center'}} [opts]
   */
  function storePills(p, opts) {
    var o = opts || {};
    var stores = p.stores || {};
    var items = ['edge', 'chrome'].map(function (key) {
      var meta = STORE_META[key];
      var s = stores[key] || {};
      var url = s.url;
      var full = s.status || '待上架';
      var short = String(full).split('·')[0].trim() || '待上架';
      var inner =
        '<span class="sp-ico" aria-hidden="true">' + meta.icon + '</span>' +
        '<span class="sp-name">' + meta.name + '</span>' +
        '<span class="sp-state">' + esc(short) + '</span>';
      if (url) {
        return '<a class="store-pill" href="' + esc(url) + '" target="_blank" rel="noopener" title="' +
          esc(meta.name + '一键安装 · ' + full) + '">' + inner + '</a>';
      }
      return '<span class="store-pill is-off" title="上架后这里会变成一键安装按钮">' + inner + '</span>';
    }).join('');
    return '<div class="store-pills' + (o.size === 'sm' ? ' sm' : '') + (o.align === 'center' ? ' center' : '') + '" role="group" aria-label="浏览器商店安装入口">' + items + '</div>';
  }

  /* ---------- 顶部导航 ---------- */
  function navHtml(activeId) {
    var cur = activeId ? byId(activeId) : null;
    var items = PLUGINS.map(function (p) {
      return '<a class="ps-item' + (p.id === activeId ? ' active' : '') + '" href="#/p/' + esc(p.id) + '"' +
        (p.id === activeId ? ' aria-current="page"' : '') + '>' +
        iconHtml(p, 'ps-ico', 30) +
        '<span class="ps-text"><span class="ps-name">' + esc(p.name) + '</span>' +
        '<span class="ps-sub">' + esc(p.tagline) + '</span></span>' +
        '<span class="ps-ver">' + esc(versionLabel(p)) + '</span></a>';
    }).join('');

    return (
      '<header class="nav" id="siteNav">' +
        '<div class="container nav-inner">' +
          '<a class="brand" href="#/">' +
            '<img src="assets/icons/icon128.png" alt="" width="26" height="26" />' +
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
                '<span class="ps-text"><span class="ps-name">全部插件</span>' +
                '<span class="ps-sub">' + PLUGINS.length + ' 个扩展总览</span></span>' +
              '</a>' +
              '<div class="ps-sep"></div>' + items +
            '</div>' +
          '</div>' +
          '<nav class="nav-links">' +
            '<a href="#/" data-goto="plugins" class="hide-sm">插件</a>' +
            '<a href="#/" data-goto="install" class="hide-sm">安装</a>' +
            '<a href="privacy.html' + (activeId ? '?p=' + encodeURIComponent(activeId) : '') + '">隐私</a>' +
            '<a href="account.html">账号</a>' +
            '<button class="theme-btn" type="button" data-theme-toggle title="切换日间 / 夜间主题" aria-label="切换主题">🌙</button>' +
          '</nav>' +
        '</div>' +
      '</header>'
    );
  }

  /* ---------- 页脚 ---------- */
  function footerHtml() {
    var links = PLUGINS.map(function (p) {
      return '<a href="#/p/' + esc(p.id) + '">' + esc(p.shortName) + '</a>';
    }).join('');
    return (
      '<footer class="footer"><div class="container footer-inner">' +
        '<a class="brand" href="#/"><img src="assets/icons/icon128.png" alt="" width="22" height="22" /><span>' + esc(SITE.name) + '</span></a>' +
        '<nav>' + links + '<a href="privacy.html">隐私政策</a><a href="account.html">账号</a></nav>' +
        '<p class="copy">© ' + new Date().getFullYear() + ' ' + esc(SITE.name) + ' · GitHub Pages 托管 · 全部扩展本地运行' +
        (SITE.repoUrl ? ' · <a href="' + esc(SITE.repoUrl) + '" target="_blank" rel="noopener">源码</a>' : '') +
        '</p>' +
      '</div></footer>'
    );
  }

  /* ---------- 插件切换 chips ---------- */
  function chipsHtml(activeId) {
    var chips = PLUGINS.map(function (p) {
      return '<a class="chip' + (p.id === activeId ? ' active' : '') + '" href="#/p/' + esc(p.id) + '">' +
        iconHtml(p, 'chip-ico', 20) + '<span>' + esc(p.shortName) + '</span>' +
        '<span class="chip-ver">' + esc(versionLabel(p)) + '</span></a>';
    }).join('');
    return '<div class="chips" role="tablist" aria-label="切换插件">' + chips + '</div>';
  }

  /* ---------- 安装包信息（替代原来的下载大卡片） ---------- */
  function pkgMetaHtml(p) {
    if (!p || !p.download) return '';
    var d = p.download;
    return (
      '<div class="pkg-meta">' +
        '<span class="pkg-file">' + esc(d.file.split('/').pop()) + '</span>' +
        '<span class="dot" aria-hidden="true">·</span><span>' + esc(d.sizeText) + '</span>' +
        '<span class="dot" aria-hidden="true">·</span><span>' + esc(d.date) + '</span>' +
        '<span class="dot" aria-hidden="true">·</span><span>Chromium ' + esc(p.minBrowser || '111') + '+</span>' +
        '<span class="dot" aria-hidden="true">·</span>' +
        '<a class="pkg-latest" href="' + esc(d.latestFile) + '" download>最新版固定链接</a>' +
        '<span class="pkg-sha">SHA-256 <code>' + esc(d.sha256) + '</code>' +
          '<button class="mini-copy" type="button" data-copy="' + esc(d.sha256) + '">复制</button>' +
        '</span>' +
      '</div>'
    );
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var root = document.documentElement;
    var btns = document.querySelectorAll('[data-theme-toggle]');
    function paint(t) {
      root.setAttribute('data-theme', t);
      for (var i = 0; i < btns.length; i += 1) btns[i].textContent = t === 'dark' ? '☀️' : '🌙';
    }
    paint(root.getAttribute('data-theme') || 'light');
    for (var i = 0; i < btns.length; i += 1) {
      // 幂等：重复调用（如 account.html 注入导航后再初始化）不会重复绑定
      if (btns[i].dataset.themeBound === '1') continue;
      btns[i].dataset.themeBound = '1';
      btns[i].addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        paint(next);
        try { localStorage.setItem('site-theme', next); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------- 复制 ---------- */
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? '已复制 ✓' : '复制失败';
      btn.classList.toggle('ok', ok);
      setTimeout(function () {
        btn.textContent = old;
        btn.classList.remove('ok');
      }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (e) {
      done(false);
    }
  }

  window.PandaUI = {
    site: SITE,
    plugins: PLUGINS,
    esc: esc,
    byId: byId,
    latestPlugin: latestPlugin,
    versionLabel: versionLabel,
    dlHref: dlHref,
    icon: iconHtml,
    storePills: storePills,
    nav: navHtml,
    footer: footerHtml,
    chips: chipsHtml,
    pkgMeta: pkgMetaHtml,
    initTheme: initTheme,
    copyText: copyText,
  };
  // 兼容旧引用（account.html / privacy.js 早期版本）
  window.PandaSite = window.PandaUI;
})();
