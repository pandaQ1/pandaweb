# 安装包目录

本目录存放扩展的可下载安装包，官网「下载安装」区块直接链接到这里。

## 当前版本

| 文件 | 版本 | 大小 | 日期 |
| --- | --- | --- | --- |
| `panda-word-highlighter-2.19.0.zip` | v2.19.0 | 490 KB | 2026-10-20 |
| `panda-word-highlighter-latest.zip` | 同上（固定链接） | 490 KB | 2026-10-20 |

- **SHA-256**：`3c0685e36514070ddefcd65bd9dfb1e26ce077edd2b329876807f38c2aebcd9e`
- 校验命令（Windows）：`Get-FileHash .\panda-word-highlighter-2.19.0.zip -Algorithm SHA256`
- 校验命令（macOS / Linux）：`shasum -a 256 panda-word-highlighter-2.19.0.zip`

`latest` 是给官网固定链接用的副本：每次发版把它替换成新包，页面上的「最新版（固定链接）」按钮就不会失效；带版本号的文件用于留档和校验。

## 安装

1. 解压 zip，得到 `word-highlighter/` 文件夹（里面应有 `manifest.json`）。
2. 打开 `edge://extensions`（Chrome 为 `chrome://extensions`）。
3. 打开「开发人员模式 / 开发者模式」。
4. 点「加载解压缩的扩展」，选中 `word-highlighter/` 文件夹。

## 发版流程

```powershell
# 1) 在扩展仓库打包（会自检：单 root manifest、无嵌套压缩包、引用文件存在）
node tools\pack.mjs

# 2) 复制到官网仓库并更新 latest
Copy-Item dist\panda-word-highlighter-<版本>.zip downloads\
Copy-Item dist\panda-word-highlighter-<版本>.zip downloads\panda-word-highlighter-latest.zip

# 3) 更新 index.html 里的三处：nav 版本号、下载卡片的文件名/大小/日期、SHA-256
(Get-FileHash downloads\panda-word-highlighter-<版本>.zip -Algorithm SHA256).Hash
```

发版检查清单：

- [ ] 版本号在 `manifest.json`、官网 nav、下载卡片、文件名四处一致
- [ ] `latest.zip` 已替换成新包
- [ ] SHA-256 已更新
- [ ] zip 解压后根目录直接是 `manifest.json`（不要多一层文件夹）
- [ ] 用 Edge 手动加载一次，确认能正常启动
