/**
 * 隐私政策页： privacy.html?p=<插件id>
 * 不带参数时显示全部插件的政策索引。
 * 内容来自 assets/plugins.data.js 里各插件的 privacy 字段。
 */
(function () {
  'use strict';
  var API = window.PandaSite || {};
  var PLUGINS = window.PANDA_PLUGINS || API.plugins || [];
  var SITE = window.PANDA_SITE || API.site || {};
  var esc = API.esc || function (s) { return String(s == null ? '' : s); };
  var navHtml = API.nav || function () { return ''; };
  var footerHtml = API.footer || function () { return ''; };
  var iconHtml = API.icon || function () { return ''; };

  function byId(id) {
    for (var i = 0; i < PLUGINS.length; i += 1) if (PLUGINS[i].id === id) return PLUGINS[i];
    return null;
  }

  function sectionHtml(s) {
    var out = '<h2>' + esc(s.h) + '</h2>';
    if (s.p) out += s.p.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    if (s.list) out += '<ul>' + s.list.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
    if (s.table) {
      out += '<table class="data"><tr>' +
        s.table.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr>' +
        s.table.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') +
        '</table>';
    }
    return out;
  }

  function switchHtml(activeId) {
    var chips = PLUGINS.map(function (p) {
      return '<a class="chip' + (p.id === activeId ? ' active' : '') + '" href="privacy.html?p=' + encodeURIComponent(p.id) + '">' +
        iconHtml(p, 'chip-ico', 20) + '<span>' + esc(p.shortName) + '</span></a>';
    }).join('');
    return '<div class="privacy-switch"><span style="font-size:13px;color:var(--text-faint)">切换插件：</span><div class="chips">' + chips + '</div></div>';
  }

  function policyPage(p) {
    var pr = p.privacy || { sections: [] };
    var meta = '最后更新：' + esc(pr.updated || '—') +
      ' · 适用于「' + esc(p.name) + '」浏览器扩展' +
      (p.download ? '（v' + esc(p.download.version) + ' 及以上版本）' : '');
    var body = pr.sections.map(sectionHtml).join('');
    return (
      navHtml(p.id) +
      '<main>' +
        '<div class="container page-head">' +
          '<h1>' + esc(p.name) + ' · 隐私政策</h1>' +
          '<p class="meta">' + meta + '</p>' +
          switchHtml(p.id) +
        '</div>' +
        '<div class="container doc">' +
          (pr.callout ? '<div class="callout">' + esc(pr.callout) + '</div>' : '') +
          body +
          '<p class="doc-sub" style="margin-top:36px">返回：<a class="inline-link" href="#/p/' + esc(p.id) + '">' + esc(p.name) + ' 详情</a> · <a class="inline-link" href="#/">全部插件</a></p>' +
        '</div>' +
      '</main>' +
      footerHtml()
    );
  }

  function indexPage() {
    var cards = PLUGINS.map(function (p) {
      var pr = p.privacy || {};
      var first = (pr.sections && pr.sections[0] && pr.sections[0].h) || '';
      return '<a class="policy-card" href="privacy.html?p=' + encodeURIComponent(p.id) + '">' +
        iconHtml(p, 'pc-ico', 44) +
        '<span class="pc-body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + (p.download ? 'v' + esc(p.download.version) + ' · ' : '') + esc(pr.updated ? '更新于 ' + pr.updated : '') + (first ? ' · 共 ' + pr.sections.length + ' 节' : '') + '</p>' +
        '</span>' +
        '<span class="pc-go">查看 →</span>' +
      '</a>';
    }).join('');

    return (
      navHtml('') +
      '<main>' +
        '<div class="container page-head">' +
          '<h1>隐私政策</h1>' +
          '<p class="meta">' + PLUGINS.length + ' 个扩展各自独立说明：什么时候会联网、把什么内容发给了谁。</p>' +
        '</div>' +
        '<div class="container doc" style="max-width:860px;padding-bottom:40px">' +
          '<div class="callout">所有 Panda 扩展的共同原则：<strong>不做用户行为分析、不埋点、不注入远程代码</strong>；设置与历史数据默认只保存在你的浏览器里。只有在你主动触发某个功能（查词、翻译、会员校验等）时，最少的必要数据才会直接发往对应的服务商。</div>' +
        '</div>' +
        '<div class="container" style="padding-bottom:88px"><div class="policy-list">' + cards + '</div></div>' +
      '</main>' +
      footerHtml()
    );
  }

  function run() {
    var app = document.getElementById('app');
    if (!app) return;
    var id = '';
    try { id = new URLSearchParams(location.search).get('p') || ''; } catch (e) { id = ''; }
    var p = id ? byId(id) : null;

    if (p) {
      app.innerHTML = policyPage(p);
      document.title = p.name + ' · 隐私政策 — ' + (SITE.name || 'Panda 插件中心');
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', p.name + ' 浏览器扩展的隐私政策：数据存储位置、联网场景、权限用途与第三方服务说明。');
    } else {
      app.innerHTML = indexPage();
      document.title = '隐私政策 — ' + (SITE.name || 'Panda 插件中心');
    }
    if (API.initTheme) API.initTheme();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
