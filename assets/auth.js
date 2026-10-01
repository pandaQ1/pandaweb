/**
 * Panda 生词助手官网 —— 账号系统（Supabase Auth，纯 REST，无依赖）
 * 与浏览器扩展共用同一 Supabase 后端：同一邮箱在官网和扩展里是同一账号。
 * 网页环境无 chrome.storage，会话保存在 localStorage（仅本浏览器可见）。
 */
"use strict";
(function () {
  var SUPA_URL = "https://jahkqtkmupynxckkvwhn.supabase.co";
  var SUPA_KEY = "sb_publishable_d2qrLjSKPbyLg4_lzz0Vvw_6iWiWTZV";
  var STORE_KEY = "wh_site_auth";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; }
  }
  function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
  function clear() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }

  function normZh(msg) {
    if (/invalid_credentials/i.test(msg)) return "邮箱或密码错误";
    if (/email.*not.*confirmed|email_not_confirmed/i.test(msg)) return "邮箱尚未验证，请查收验证邮件";
    if (/already.*registered|user_already_exists/i.test(msg)) return "该邮箱已注册，请直接登录";
    if (/password/i.test(msg) && /at least|weak/i.test(msg)) return "密码强度不足（至少 6 位）";
    if (/rate limit|too many/i.test(msg)) return "操作过于频繁，请稍后再试";
    return msg || "请求失败";
  }

  function callAuth(path, body) {
    return fetch(SUPA_URL + "/auth/v1/" + path, {
      method: "POST",
      headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (data) {
        if (!r.ok || !data) {
          var raw = (data && (data.msg || data.error_description || data.error)) || ("HTTP " + r.status);
          throw new Error(normZh(String(raw)));
        }
        return data;
      });
    });
  }

  function normSession(d) {
    return {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: Date.now() + (d.expires_in || 3600) * 1000,
      user: d.user ? { id: d.user.id, email: d.user.email } : null
    };
  }

  window.SiteAuth = {
    signUp: function (email, password) {
      return callAuth("signup", { email: String(email || "").trim(), password: String(password || "") })
        .then(function (d) {
          if (d.access_token) { save(normSession(d)); return { needConfirm: false }; }
          return { needConfirm: true };
        });
    },
    signIn: function (email, password) {
      return callAuth("token?grant_type=password", { email: String(email || "").trim(), password: String(password || "") })
        .then(function (d) { save(normSession(d)); return { email: d.user ? d.user.email : "" }; });
    },
    signOut: function () {
      var s = load();
      var p = Promise.resolve();
      if (s && s.refresh_token) {
        p = fetch(SUPA_URL + "/auth/v1/logout", {
          method: "POST",
          headers: { apikey: SUPA_KEY, "Content-Type": "application/json", Authorization: "Bearer " + s.access_token },
          body: JSON.stringify({ refresh_token: s.refresh_token })
        }).catch(function () {});
      }
      return p.then(function () { clear(); });
    },
    getSession: function () {
      var s = load();
      if (!s || !s.access_token) return Promise.resolve(null);
      if (Date.now() < s.expires_at - 60000) return Promise.resolve(s);
      return callAuth("token?grant_type=refresh_token", { refresh_token: s.refresh_token })
        .then(function (d) { var n = normSession(d); save(n); return n; })
        .catch(function (e) { clear(); return null; });
    },
    /** 返回 { signed_in, pro, plan, expires_at, email, reason } */
    getMembership: function () {
      return this.getSession().then(function (s) {
        if (!s) return { signed_in: false, pro: false, plan: "free", reason: "未登录" };
        var query = function (token) {
          return fetch(SUPA_URL + "/rest/v1/memberships?select=plan,expires_at", {
            headers: { apikey: SUPA_KEY, Authorization: "Bearer " + token }
          });
        };
        return query(s.access_token).then(function (r) {
          if (r.status === 401 || r.status === 403) {
            // 刷新 token 重试一次
            return callAuth("token?grant_type=refresh_token", { refresh_token: s.refresh_token })
              .then(function (d) { var n = normSession(d); save(n); return query(n.access_token); })
              .catch(function () { clear(); return null; });
          }
          return r;
        }).then(function (r) {
          if (!r) return { signed_in: false, pro: false, plan: "free", reason: "会话已失效，请重新登录" };
          if (!r.ok) {
            return r.text().catch(function () { return ""; }).then(function (body) {
              var tip = /PGRST205|Could not find the table/i.test(body) ? "memberships 表未创建" : "会员信息查询失败(HTTP " + r.status + ")";
              return { signed_in: true, pro: false, plan: "free", email: s.user && s.user.email, reason: tip };
            });
          }
          return r.json().then(function (rows) {
            var m = rows && rows[0];
            var email = s.user && s.user.email;
            if (!m || m.plan !== "pro") return { signed_in: true, pro: false, plan: m ? m.plan : "free", email: email };
            if (m.expires_at && new Date(m.expires_at).getTime() < Date.now()) {
              return { signed_in: true, pro: false, plan: m.plan, expires_at: m.expires_at, email: email, reason: "会员已过期" };
            }
            return { signed_in: true, pro: true, plan: m.plan, expires_at: m.expires_at, email: email };
          });
        });
      }).catch(function (e) {
        return { signed_in: false, pro: false, plan: "free", reason: "网络错误：" + (e.message || e) };
      });
    }
  };
})();
