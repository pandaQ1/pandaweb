# 安装包目录

本目录由 `node tools/build.mjs` 自动生成：脚本扫描 `D:\桌面\ai压缩包`，取每个插件版本号最高的压缩包，
复制成 `<插件id>-v<版本>.zip`（留档）与 `<插件id>-latest.zip`（固定链接，发新版时自动替换）。

| 文件 | 插件 | 版本 | 大小 | 打包日期 |
| --- | --- | --- | --- | --- |
| `word-highlighter-v2.19.4.zip` | Panda 生词高亮 & 翻译助手 | v2.19.4 | 492 KB | 2026-10-20 |
| `video-control-v2.1.0.zip` | Panda视频控制&录屏截图 | v2.1.0 | 88 KB | 2026-10-18 |
| `bilibili-helper-v1.1.9.zip` | Panda 哔哩哔哩助手 | v1.1.9 | 97 KB | 2026-10-21 |
| `bilibili-downloader-v1.0.8.zip` | B站视频下载器 · Panda | v1.0.8 | 107 KB | 2026-10-22 |

## SHA-256

- **Panda 生词高亮 & 翻译助手** v2.19.4：`77ea3866e635e720f6b341cf02765583729b27e501ee408c92718d29be649d41`
- **Panda视频控制&录屏截图** v2.1.0：`890963c874cbd1d2b9e934d490e11f74c456dcf654212c6aa60805d99702fb7b`
- **Panda 哔哩哔哩助手** v1.1.9：`73b935076f4c16a00b0d0233cd7697a84af2c64ac927ea900cfb073256924ae3`
- **B站视频下载器 · Panda** v1.0.8：`16f62118f8af4362f1018441741a76bd334ec67831d9df708b22f0bfd7a29cb1`

## 安装

1. 下载并解压 zip（根目录应直接是 `manifest.json`）。
2. 打开 `edge://extensions`（Chrome 为 `chrome://extensions`）。
3. 打开「开发人员模式」。
4. 点「加载解压缩的扩展」，选择解压出的文件夹。

> 浏览器不允许网页静默安装扩展：想做到「点一下就装好」，需要通过商店（Edge 加载项 / Chrome 网上应用店）。详见官网首页的安装说明。
