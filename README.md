# Panda 插件中心（pandaweb）

所有 Panda 浏览器扩展的统一官网：一个页面里切换查看每个插件的介绍、下载安装与隐私政策。

- 线上地址：<https://pandaq1.github.io/pandaweb/>
- 托管方式：GitHub Pages（`main` 分支根目录，纯静态，无构建服务）

## 页面结构

| 文件 | 作用 |
| --- | --- |
| `index.html` | 首页 + 插件详情（hash 路由：`#/`、`#/p/<插件id>`） |
| `privacy.html` | 隐私政策：`privacy.html` 是索引，`privacy.html?p=<插件id>` 是单个插件的政策 |
| `account.html` | Panda 账号 / 会员 / 兑换码（Supabase Auth） |
| `assets/app.js` | 路由、插件切换器、详情页渲染 |
| `assets/privacy.js` | 隐私政策页渲染 |
| `assets/plugins.data.js` | **自动生成**的站点数据（内容 + 版本 + 大小 + SHA-256） |
| `data/plugins.json` | **手写**的插件内容源（介绍、功能、权限、隐私条款） |
| `downloads/` | 安装包（`<插件id>-v<版本>.zip` 与固定链接 `<插件id>-latest.zip`） |
| `tools/build.mjs` | 扫描压缩包目录 → 取每个插件最高版本 → 落地下载文件 + 生成数据 |
| `tools/check-site.mjs` | 站点自检（在 DOM 垫片里真实执行前端脚本，校验文案 / 链接 / 哈希） |
| `tools/serve.mjs` | 本地预览服务器 |

## 新增一个插件（标准流程）

1. 插件打包，把 zip 放进 `D:\桌面\ai压缩包`（文件名随意，脚本只认包内 `manifest.json` 的 `name` / `version`）。
2. 在 `data/plugins.json` 的 `plugins` 数组里加一条，至少要写：
   - `id`：英文短横线命名，决定下载文件名与路由，例：`video-control`
   - `match`：用于匹配压缩包的名称片段（按 `manifest.name` 模糊匹配），例：`["视频控制"]`
   - `name` / `shortName` / `tagline` / `summary`
   - `features`（功能卡）、`permissions`（权限用途）、`privacy`（隐私政策分节）
   - `membership`（是否需要 PRO）、`badges`（卖点标签）、`kind`（图标兜底 emoji：`reading` / `video` / `site`）
3. 运行构建：

   ```powershell
   node tools/build.mjs          # 生成 assets/plugins.data.js、复制下载包、抽取图标、更新 downloads/README.md
   node tools/check-site.mjs     # 自检
   ```

4. 本地预览：`node tools/serve.mjs`，打开 <http://127.0.0.1:8123/>。
5. 发布：把改动推到 `main`（GitHub Pages 会自动更新）。

> 版本号永远以压缩包里的 `manifest.json` 为准：目录里同时存在多个版本时，脚本按语义化版本比较后取最高那个，并自动把旧的同插件包从 `downloads/` 移除。

## 关于「点击就自动装进浏览器」

浏览器不允许网页静默安装扩展（`chrome.webstore.install()` 早在 Chrome 71 被移除），所以只能二选一：

- **商店安装**：上架 Edge 加载项 / Chrome 网上应用店后，在 `data/plugins.json` 对应插件里填 `stores.edge.url` / `stores.chrome.url`，页面上的灰色卡片就会变成「一键安装」按钮（点一下 → 浏览器确认 → 自动装好并且自动更新）。
- **zip 直链下载 + 开发者模式**：始终可用，无需审核，但不会自动更新（新版需在扩展页点「重新加载」）。

首页与每个插件页的「为什么点一下不能自动装进浏览器？」折叠块对此有完整说明。

## 发版检查清单

- [ ] 新包已放进 `D:\桌面\ai压缩包`，且包内根目录直接是 `manifest.json`
- [ ] `node tools/build.mjs` 输出的版本号 = 你刚打的版本
- [ ] `node tools/check-site.mjs` 全绿
- [ ] 首页卡片、插件页下载卡、`downloads/README.md` 三处版本号一致（脚本统一生成，正常不会不一致）
- [ ] 推送后在线上点一次「下载 vX」确认文件能下
