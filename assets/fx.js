/**
 * Panda 插件中心 —— 动效层（视差滚动 / 入场 / 光斑 / 数字滚动 / 阅读进度）
 *
 * 设计约束（Panda 设计语言）：
 *  · 动效只用 opacity / transform，不触发重排
 *  · hover 位移 ≤ 1px，入场按 190ms 级别，Easing 用统一 --ease
 *  · prefers-reduced-motion: reduce 时整体关闭，且不加 .fx-ready（保证内容默认可见）
 *  · 所有监听 passive + requestAnimationFrame 合并，页面滚动时不掉帧
 *
 * 用法：渲染完 HTML 后调用 window.PandaFX.refresh()
 */
(function () {
  'use strict';

  var MOTION_OK = !!(
    window.matchMedia &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  var FINE_POINTER = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  var parallaxItems = [];
  var countItems = [];
  var io = null;
  var raf = 0;
  var progressBar = null;

  /* ---------- 滚动进度条 ---------- */
  function ensureProgress() {
    if (progressBar || !MOTION_OK) return;
    progressBar = document.createElement('div');
    progressBar.id = 'fxProgress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  /* ---------- 收集需要参与滚动计算的节点 ---------- */
  function collect() {
    parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    countItems = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

    // 入场元素：按父容器内顺序编号，做错峰延迟
    var groups = new Map();
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      if (el.classList.contains('fx-in')) return;
      var parent = el.parentElement || document.body;
      var idx = groups.get(parent) || 0;
      groups.set(parent, idx + 1);
      el.style.setProperty('--fx-delay', Math.min(idx, 5) * 55 + 'ms');
    });

    if (io) io.disconnect();
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('fx-in');
          io.unobserve(entry.target);
          if (entry.target.hasAttribute('data-count')) runCount(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
        if (!el.classList.contains('fx-in')) io.observe(el);
      });
      countItems.forEach(function (el) {
        if (!el.classList.contains('fx-in') && el.hasAttribute('data-reveal')) return;
        runCount(el);
      });
    } else {
      // 老浏览器：直接显示
      Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
        el.classList.add('fx-in');
      });
      countItems.forEach(runCount);
    }
  }

  /* ---------- 数字滚动 ---------- */
  function runCount(el) {
    if (el.dataset.fxCount === '1') return;
    el.dataset.fxCount = '1';
    var to = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (!MOTION_OK) { el.textContent = to + suffix; return; }
    var from = 0;
    var dur = 620;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (to - from) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 视差 ---------- */
  function applyParallax() {
    var vh = window.innerHeight || 800;
    for (var i = 0; i < parallaxItems.length; i += 1) {
      var el = parallaxItems[i];
      var rate = parseFloat(el.getAttribute('data-parallax'));
      if (!rate) continue;
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -240 || rect.top > vh + 240) continue;
      var delta = rect.top + rect.height / 2 - vh / 2;
      var shift = -delta * rate;
      el.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
    }
  }

  function updateProgress() {
    if (!progressBar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max)) : 0;
    progressBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      applyParallax();
      updateProgress();
      var scrolled = (window.scrollY || document.documentElement.scrollTop) > 6;
      document.body.classList.toggle('is-scrolled', scrolled);
    });
  }

  /* ---------- 卡片光斑（跟随指针的极淡高光） ---------- */
  function bindSpotlight() {
    if (!FINE_POINTER || !MOTION_OK) return;
    var SEL = '.pcard, .card, .policy-card';
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ---------- 初始化 ---------- */
  function refresh() {
    if (!MOTION_OK) return;
    document.documentElement.classList.add('fx-ready');
    ensureProgress();
    collect();
    applyParallax();
    updateProgress();
  }

  var bound = false;
  function bindOnce() {
    if (bound) return;
    bound = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    bindSpotlight();
  }

  window.PandaFX = {
    refresh: function () {
      bindOnce();
      refresh();
    },
    get enabled() { return MOTION_OK; },
  };

  // 首屏：脚本在 body 末尾，DOM 已就绪
  bindOnce();
  refresh();
})();
