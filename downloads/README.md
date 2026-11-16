# 安装包目录

本目录由 `node tools/build.mjs` 自动生成：脚本扫描 `D:\桌面\ai压缩包`，取每个插件版本号最高的压缩包，
复制成 `<插件id>-v<版本>.zip`（留档）与 `<插件id>-latest.zip`（固定链接，发新版时自动替换）。

| 文件 | 插件 | 版本 | 大小 | 打包日期 |
| --- | --- | --- | --- | --- |
| `word-highlighter-v2.35.0.zip` | Panda 生词高亮 & 翻译助手 | v2.35.0 | 6.17 MB | 2026-11-17 |
| `video-control-v2.1.0.zip` | Panda视频控制&录屏截图 | v2.1.0 | 88 KB | 2026-10-18 |
| `bilibili-helper-v1.2.0.zip` | Panda 哔哩哔哩助手 | v1.2.0 | 106 KB | 2026-11-08 |
| `bilibili-downloader-v1.2.4.zip` | B站视频下载器 · Panda | v1.2.4 | 405 KB | 2026-11-16 |

## SHA-256

- **Panda 生词高亮 & 翻译助手** v2.35.0：`d4f9f083d748605f2dd339bbbfff9fe1120df42698739319477bf5963ab626af`
- **Panda视频控制&录屏截图** v2.1.0：`890963c874cbd1d2b9e934d490e11f74c456dcf654212c6aa60805d99702fb7b`
- **Panda 哔哩哔哩助手** v1.2.0：`6d3524aaf9ff453f68196ee0f56c67dbd81f8c700b5a4e9010476be85e662e7f`
- **B站视频下载器 · Panda** v1.2.4：`2299336b383629e822c4c09923927aa85db0ca1133e5d4a0e96b0caccafc3615`

## 安装

1. 下载并解压 zip（根目录应直接是 `manifest.json`）。
2. 打开 `edge://extensions`（Chrome 为 `chrome://extensions`）。
3. 打开「开发人员模式」。
4. 点「加载解压缩的扩展」，选择解压出的文件夹。

> 浏览器不允许网页静默安装扩展：想做到「点一下就装好」，需要通过商店（Edge 加载项 / Chrome 网上应用店）。详见官网首页的安装说明。
