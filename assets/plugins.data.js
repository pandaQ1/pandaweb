/* 自动生成，请勿手改：source = data/plugins.json + D:\桌面\ai压缩包
   重新生成：node tools/build.mjs */
window.PANDA_SITE = {
  "name": "Panda 插件中心",
  "tagline": "一套装进浏览器的工具，做完一件小事就好",
  "summary": "生词高亮、视频控制、B 站清爽浏览与视频下载——都在这里下载安装。全部扩展本地运行，账号只在需要会员功能时用到。",
  "repoUrl": "https://github.com/pandaQ1/pandaweb",
  "archiveUrl": "https://github.com/pandaQ1/pandaweb",
  "accountPage": "account.html",
  "privacyPage": "privacy.html",
  "generatedAt": "2026-10-22T08:22:34.490Z",
  "archive": "D:\\桌面\\ai压缩包"
};
window.PANDA_PLUGINS = [
  {
    "id": "word-highlighter",
    "match": [
      "生词高亮"
    ],
    "name": "Panda 生词高亮 & 翻译助手",
    "shortName": "生词助手",
    "tagline": "读英文网页时，生词一目了然",
    "summary": "按词汇等级自动标记生词，悬停秒看释义，右键查词根词缀，整页翻译多级降级，生词本 + 艾宾浩斯背单词闭环，还能接管 YouTube 字幕逐句翻译。",
    "kind": "reading",
    "badges": [
      "8 级词库 · 10,972 词",
      "悬停 / 右键释义",
      "整页翻译 · 多服务降级",
      "艾宾浩斯背单词",
      "YouTube 字幕接管"
    ],
    "membership": {
      "required": true,
      "label": "PRO 会员",
      "note": "安装与升级免费；词库高亮、释义卡片、整页翻译、生词本与背单词等增强功能需登录 Panda 账号并激活 PRO 后启用。账号、兑换与会员页面不受门禁影响。"
    },
    "features": [
      {
        "icon": "🖍️",
        "title": "等级词库高亮",
        "desc": "小学 / 初中 / 高中 / 四级 / 六级 / 考研 / 托福 / SAT 八级词库（共 10,972 词，离线内置），按所选等级精准高亮，白名单判定不误标人名与俚语。",
        "tag": "离线词库"
      },
      {
        "icon": "🖱️",
        "title": "悬停简译 + 右键释义卡片",
        "desc": "鼠标悬停即弹出简略翻译；右键（或按 A 键）打开详细卡片——音标、释义、词根词缀、关联词汇，三级词典兜底 + AI 兜底，点击即发音。",
        "tag": "词根词缀"
      },
      {
        "icon": "🌐",
        "title": "网页整页翻译",
        "desc": "Edge 免 token 批量翻译（20 句 / 批）+ MyMemory / 有道 / Bing / Google / 自定义 AI 多级自动降级；对照 / 覆盖两种显示模式。",
        "tag": "多级降级"
      },
      {
        "icon": "🎬",
        "title": "YouTube 字幕接管",
        "desc": "接管原生字幕条，按句末标点整句显示；timedtext 时间轴驱动零延迟切换，支持逐句 / 逐词两种模式，看完一个视频顺便学完生词。",
        "tag": "逐句 / 逐词"
      },
      {
        "icon": "📖",
        "title": "生词本 + 背单词",
        "desc": "右键一键收藏生词（自动保存语境句）；独立背单词模块按每日强度学习，艾宾浩斯间隔复习（认识 / 模糊 / 忘记三键反馈），数据统计曲线。",
        "tag": "艾宾浩斯"
      },
      {
        "icon": "🔊",
        "title": "TTS 发音自定义",
        "desc": "本地离线 TTS 或在线引擎（有道 / 谷歌 / OpenAI 兼容接口），语速可调，自动降级策略保证离线也能发音；日 / 夜主题跟随设置同步。",
        "tag": "本地优先"
      }
    ],
    "permissions": [
      {
        "name": "storage",
        "purpose": "保存生词本、复习记录与全部设置"
      },
      {
        "name": "activeTab / tabs",
        "purpose": "对当前标签页应用高亮与翻译、显示开关状态"
      },
      {
        "name": "alarms",
        "purpose": "定时刷新会员状态缓存"
      },
      {
        "name": "所有网站（host）",
        "purpose": "在网页中高亮生词与整页翻译；提供「本站不翻译」白名单"
      },
      {
        "name": "YouTube 域名",
        "purpose": "读取 timedtext 字幕时间轴，接管字幕逐句显示"
      }
    ],
    "privacy": {
      "updated": "2026-10-22",
      "callout": "核心原则：本扩展没有自己的服务器，不收集、不上传任何用户行为数据。生词本、复习记录、设置全部保存在你的浏览器本地。只有当你主动触发生词查询 / 翻译 / 发音时，最少的必要文本才会直接发往对应的词典或翻译接口。",
      "sections": [
        {
          "h": "一、我们收集什么",
          "p": [
            "核心功能不进行任何用户行为分析、埋点统计或遥测。"
          ],
          "list": [
            "账号系统（可选）：如果你在扩展「设置 → 账号」或官网「账号」页主动登录 / 注册以激活 PRO，我们会保存你的邮箱地址（由 Supabase 托管），仅用于登录识别与会员权益管理，不用于发送营销邮件。",
            "除此之外不收集任何其他个人信息。"
          ]
        },
        {
          "h": "二、数据存储（全部在本地）",
          "list": [
            "生词本、已掌握词表、背单词学习与复习记录：保存在 chrome.storage.local，仅存在于你的浏览器中；",
            "扩展设置（词汇等级、翻译服务、主题、TTS 配置等）：保存在 chrome.storage.sync；",
            "自定义 AI 的 API 地址与 Key：仅保存在本地浏览器存储，只在你主动使用该服务时发送给你自己配置的接口。"
          ],
          "p": [
            "卸载扩展即删除全部本地数据。我们不掌握、也无法恢复这些数据。"
          ]
        },
        {
          "h": "三、何时会把文本发送到网络",
          "p": [
            "默认发音使用浏览器本地离线 TTS；词库释义已内置离线，查询内置词库中的词同样不联网。"
          ],
          "table": {
            "head": [
              "触发场景",
              "发送内容",
              "接收方"
            ],
            "rows": [
              [
                "查询生词释义 / 音标",
                "单个英文单词",
                "有道词典、dictionaryapi.dev"
              ],
              [
                "开启网页翻译",
                "当前页面中的外文句子",
                "Edge 翻译、MyMemory、有道、Bing、Google，或你自行配置的 AI 接口"
              ],
              [
                "释义卡片 AI 兜底",
                "单个英文单词",
                "MyMemory 或你配置的自定义 AI"
              ],
              [
                "在线 TTS 发音",
                "被朗读的单词或句子",
                "有道 TTS、谷歌 TTS，或你配置的 OpenAI 兼容接口"
              ],
              [
                "YouTube 字幕翻译",
                "当前字幕句 / 词",
                "同网页翻译服务"
              ]
            ]
          }
        },
        {
          "h": "四、权限用途说明",
          "list": [
            "读取所有网站（host 权限）：高亮与翻译需要读取并处理当前页面文本，不上传整页内容，并提供「本站不翻译」白名单；",
            "storage：保存生词本、复习记录与设置；",
            "activeTab / tabs：获取当前标签页以应用高亮与翻译；",
            "YouTube 专用脚本：仅读取 YouTube 自带字幕时间轴，不修改页面其他内容。"
          ]
        },
        {
          "h": "五、第三方服务",
          "p": [
            "上述第三方接口由各自运营方负责，数据发送即受其隐私政策约束。MyMemory 匿名配额按 IP 计；如你关心 IP 暴露，可在设置中选择你信任的服务或自托管 AI 接口。Panda 账号与会员校验由 Supabase 提供。"
          ]
        },
        {
          "h": "六、儿童隐私",
          "p": [
            "本扩展不面向 13 岁以下儿童，也不收集儿童个人信息。"
          ]
        },
        {
          "h": "七、政策变更与联系",
          "p": [
            "功能更新涉及新的数据处理时，我们会更新本页并标注生效版本。继续使用即视为接受更新后的政策。对本政策有疑问请通过 GitHub 仓库 Issues 反馈。"
          ]
        }
      ]
    },
    "stores": {
      "edge": {
        "url": null,
        "status": "审核中 · 上架后这里变成一键安装"
      },
      "chrome": {
        "url": null,
        "status": "规划中 · 先用 zip 安装"
      }
    },
    "minBrowser": "111",
    "download": {
      "version": "2.19.4",
      "file": "downloads/word-highlighter-v2.19.4.zip",
      "latestFile": "downloads/word-highlighter-latest.zip",
      "sizeBytes": 503356,
      "sizeText": "492 KB",
      "date": "2026-10-20",
      "sha256": "77ea3866e635e720f6b341cf02765583729b27e501ee408c92718d29be649d41",
      "source": "Panda-生词高亮-翻译助手-v2.19.4.zip"
    },
    "icon": null
  },
  {
    "id": "video-control",
    "match": [
      "视频控制"
    ],
    "name": "Panda视频控制&录屏截图",
    "shortName": "视频控制",
    "tagline": "任何网页视频，都能像专业播放器一样调",
    "summary": "音量与 0.5–3 倍速精调、全屏 / 网页全屏 / 画中画、AB 片段循环、片头片尾跳过与进度记忆、外挂双字幕、画面调节、画质信息、截图与 WebM 片段录制、GIF 动图。",
    "kind": "video",
    "badges": [
      "音量 / 倍速精调",
      "AB 循环 · 逐帧",
      "双外挂字幕",
      "截图 · 录屏 · GIF",
      "画面调节"
    ],
    "membership": {
      "required": true,
      "label": "PRO 会员",
      "note": "安装与升级免费；播放控制、字幕、录制等增强功能需登录 Panda 账号并激活 PRO 后启用，账号 / 兑换页面始终可访问。"
    },
    "features": [
      {
        "icon": "🎚️",
        "title": "播放与倍速精调",
        "desc": "音量滑杆 + 一键静音，0.5x–3x 预设与 ±0.1 步进微调，上一帧 / 下一帧 / 定格，配合快捷键精确到帧。",
        "tag": "逐帧控制"
      },
      {
        "icon": "🖥️",
        "title": "显示模式与循环",
        "desc": "全屏、网页全屏、画中画三种模式；单视频循环、列表循环、随机播放，还能标记 A / B 点循环任意片段。",
        "tag": "AB 循环"
      },
      {
        "icon": "⏭️",
        "title": "跳过与进度记忆",
        "desc": "按秒设置片头 / 片尾自动跳过，支持多条自定义跳过规则；按视频记忆播放进度（最多 300 条），下次打开接着看。",
        "tag": "断点续播"
      },
      {
        "icon": "🎬",
        "title": "双外挂字幕",
        "desc": "同时加载主字幕与第二字幕，支持 SRT / ASS / SSA / VTT；字号、位置、字体、颜色、描边、不透明度、时间偏移全部可调。",
        "tag": "双语对照"
      },
      {
        "icon": "🎨",
        "title": "画面调节",
        "desc": "亮度、对比度、饱和度、色相、伽马五项调节，加旋转 90°/180°/270°、水平 / 垂直镜像、比例与缩放。",
        "tag": "实时预览"
      },
      {
        "icon": "📸",
        "title": "截图 · 录制 · GIF",
        "desc": "一键截图（可合成外挂字幕），WebM 片段录制（当前 → 片尾 / 片头 → 片尾 / 当前起 N 秒），直接从当前位置导出 GIF 动图，还能读取画质信息与切换音轨。",
        "tag": "全本地处理"
      }
    ],
    "permissions": [
      {
        "name": "storage",
        "purpose": "保存设置、字幕样式、播放进度与登录会话"
      },
      {
        "name": "activeTab / scripting",
        "purpose": "在当前页面按需注入播放器控制层，找到并控制 <video> 元素"
      },
      {
        "name": "webNavigation",
        "purpose": "检测页面内视频切换（站内跳转、多 P 换集）"
      },
      {
        "name": "alarms",
        "purpose": "定时刷新会员状态缓存"
      },
      {
        "name": "所有网站（content_scripts）",
        "purpose": "页面加载时注入控制层，以便在任何网页视频上生效"
      },
      {
        "name": "账号服务域名",
        "purpose": "仅用于 Panda 账号登录与会员校验"
      }
    ],
    "privacy": {
      "updated": "2026-10-22",
      "callout": "核心原则：视频画面、截图、录屏与 GIF 全部在你的电脑上生成与保存，扩展没有媒体服务器，也不上传任何视频内容。唯一会联网的地方是 Panda 账号与会员状态校验。",
      "sections": [
        {
          "h": "一、我们收集什么",
          "p": [
            "扩展不进行用户行为分析、埋点统计或遥测，不读取你输入的表单内容。"
          ],
          "list": [
            "账号系统（可选）：登录 / 注册以激活 PRO 时，会保存邮箱地址（Supabase 托管，仅用于登录识别与会员权益）；",
            "除此之外不收集任何个人信息。"
          ]
        },
        {
          "h": "二、数据存储（全部在本地）",
          "list": [
            "扩展设置、字幕样式、跳过规则、画质偏好：chrome.storage.local；",
            "播放进度记忆（最多 300 条）：chrome.storage.local；",
            "登录会话：chrome.storage.local，不写入同步存储、不上传到任何第三方页面。"
          ],
          "p": [
            "卸载扩展即删除以上全部数据。"
          ]
        },
        {
          "h": "三、何时会联网",
          "table": {
            "head": [
              "触发场景",
              "发送内容",
              "接收方"
            ],
            "rows": [
              [
                "登录 / 注册 / 兑换会员",
                "邮箱、密码（仅登录时）或兑换码",
                "Panda 账号服务（Supabase，经 Cloudflare Worker 反代）"
              ],
              [
                "定时校验会员状态",
                "登录会话 token",
                "同上"
              ],
              [
                "播放视频本身",
                "由网页与视频站点自行发起，扩展不插手",
                "视频所在网站"
              ]
            ]
          },
          "p": [
            "扩展不会上传页面内容、视频地址、截图、录屏文件或 GIF；这些数据始终留在本机。"
          ]
        },
        {
          "h": "四、页面访问与权限",
          "list": [
            "content_scripts 在所有网页注入控制层：用途是找到页面里的 <video> 元素并应用音量 / 倍速 / 滤镜 / 字幕，不读取页面其他文本，不注入任何远程代码；",
            "截图与 GIF 通过页面画布在本地生成，跨域或 DRM 视频可能因画布限制而失败，扩展不会绕过这些限制；",
            "录制生成的 WebM 文件通过浏览器下载保存到你指定的位置。"
          ]
        },
        {
          "h": "五、版权与使用边界",
          "p": [
            "本扩展只处理你有权访问的视频内容。录制、截图与下载产生的文件由你自己保存与使用，请遵守视频网站的用户协议与当地著作权法规，不要用于二次分发。"
          ]
        },
        {
          "h": "六、儿童隐私",
          "p": [
            "本扩展不面向 13 岁以下儿童，也不收集儿童个人信息。"
          ]
        },
        {
          "h": "七、政策变更与联系",
          "p": [
            "功能更新涉及新的数据处理时，我们会更新本页并标注生效版本。对本政策有疑问请通过 GitHub 仓库 Issues 反馈。"
          ]
        }
      ]
    },
    "stores": {
      "edge": {
        "url": null,
        "status": "待上架 · 先用 zip 安装"
      },
      "chrome": {
        "url": null,
        "status": "规划中 · 先用 zip 安装"
      }
    },
    "minBrowser": "102",
    "download": {
      "version": "2.1.0",
      "file": "downloads/video-control-v2.1.0.zip",
      "latestFile": "downloads/video-control-latest.zip",
      "sizeBytes": 89776,
      "sizeText": "88 KB",
      "date": "2026-10-18",
      "sha256": "890963c874cbd1d2b9e934d490e11f74c456dcf654212c6aa60805d99702fb7b",
      "source": "panda视频控制-v2.1.0.zip"
    },
    "icon": null
  },
  {
    "id": "bilibili-helper",
    "match": [
      "哔哩哔哩助手"
    ],
    "name": "Panda 哔哩哔哩助手",
    "shortName": "哔哩哔哩助手",
    "tagline": "把 B 站首页、搜索和播放页整理干净",
    "summary": "首页净化、隐藏直播与广告、换一换历史、无 Cookie 推荐，以及增强倍速、自动宽屏、自动字幕与搜索净化。规则全部在浏览器本地执行。",
    "kind": "site",
    "badges": [
      "首页净化",
      "拒绝信息茧房",
      "0.25x–5x 倍速",
      "自动宽屏 / 字幕",
      "搜索净化"
    ],
    "membership": {
      "required": true,
      "label": "PRO 会员",
      "note": "安装与升级免费；全部增强功能需登录 Panda 账号并激活 PRO 后启用，账号、兑换与会员页面始终可访问。"
    },
    "features": [
      {
        "icon": "🧹",
        "title": "清爽首页",
        "desc": "移除顶部大屏与活动轮播，保留导航栏、搜索框与分区导航；隐藏卡片后自动 dense 补位，不留空格。",
        "tag": "保留分区"
      },
      {
        "icon": "🚫",
        "title": "隐藏直播与广告",
        "desc": "过滤首页、视频侧栏与搜索结果中的直播推荐，直播间收起排行榜等干扰侧栏；识别广告角标、商业跳转与空广告位，后续视频自然补位。",
        "tag": "侧栏一并清理"
      },
      {
        "icon": "🕘",
        "title": "「换一换」历史",
        "desc": "记住最近 6 批推荐：首页按 R 换一批，Shift + R 返回上一组，Alt + R 前往下一组；原生「换一换」下方还会显示两个方形历史按钮。",
        "tag": "换错可回退"
      },
      {
        "icon": "🍪",
        "title": "拒绝信息茧房",
        "desc": "仅对推荐流、相关视频、热门排行与视频搜索列表移除 Cookie，播放、互动、账号请求保持登录态。通过 declarativeNetRequest 动态规则实现，不清 Cookie、不登出账号。",
        "tag": "只动 8 个列表接口"
      },
      {
        "icon": "▶️",
        "title": "倍速 / 宽屏 / 连播 / 字幕",
        "desc": "接管原生倍速菜单，扩到 0.25x–5.0x，支持滚轮、± 键与键盘输入；记住上次倍速；打开视频自动宽屏、检测到字幕自动开启，连播策略按场景切换。",
        "tag": "接管原生按钮"
      },
      {
        "icon": "🔍",
        "title": "搜索净化",
        "desc": "隐藏搜索页与搜索框下拉中的热搜与搜索发现，保留输入联想、B 站历史与正常结果；可另存本地搜索历史（默认关闭，仅在本机）。",
        "tag": "默认关闭历史"
      }
    ],
    "permissions": [
      {
        "name": "storage",
        "purpose": "保存开关、倍速与本地搜索历史（同步存储）"
      },
      {
        "name": "declarativeNetRequest",
        "purpose": "对 api.bilibili.com 的 8 个列表接口移除 Cookie，实现「拒绝信息茧房」"
      },
      {
        "name": "bilibili.com 等 B 站域名",
        "purpose": "在首页 / 搜索 / 播放 / 直播页应用净化与播放增强"
      }
    ],
    "privacy": {
      "updated": "2026-10-22",
      "callout": "核心原则：纯本地规则扩展，没有自建服务器，不收集数据、不注入远程代码。所有净化规则由浏览器自身执行；除 Panda 账号会员校验外，扩展不会主动向任何服务器发请求。",
      "sections": [
        {
          "h": "一、我们收集什么",
          "p": [
            "不收集浏览记录、不埋点、不发送遥测。扩展不读取你的 B 站账号信息。"
          ],
          "list": [
            "账号系统（可选）：登录 / 注册以激活 PRO 时保存邮箱地址（Supabase 托管），仅用于登录识别与会员权益；",
            "除此之外不收集任何个人信息。"
          ]
        },
        {
          "h": "二、数据存储",
          "list": [
            "全部开关、倍速、连播策略等设置：chrome.storage.sync，随浏览器账号同步；",
            "本地搜索历史：chrome.storage.local，默认关闭，不随账号同步，可随时清空；",
            "登录会话：chrome.storage.local，不上传第三方页面。"
          ]
        },
        {
          "h": "三、联网行为",
          "list": [
            "「拒绝信息茧房」只是给发往 B 站 API 的请求去掉 Cookie，请求本身仍由 B 站页面发起，扩展不收集也不转发；",
            "Panda 账号与会员校验请求直接发往 Panda 账号服务，仅在登录、刷新状态与兑换时发生；",
            "扩展不包含远程代码，不从任何服务器下载脚本。"
          ]
        },
        {
          "h": "四、权限用途",
          "list": [
            "storage：保存设置与会话；",
            "declarativeNetRequest：改写指定 B 站列表接口请求的 Cookie 头，关闭开关后规则立即移除；",
            "主机权限仅限 B 站域名：扩展不会读取其他网站的页面。"
          ]
        },
        {
          "h": "五、儿童隐私",
          "p": [
            "本扩展不面向 13 岁以下儿童，也不收集儿童个人信息。"
          ]
        },
        {
          "h": "六、政策变更与联系",
          "p": [
            "功能更新涉及新的数据处理时，我们会更新本页并标注生效版本。对本政策有疑问请通过 GitHub 仓库 Issues 反馈。"
          ]
        }
      ]
    },
    "stores": {
      "edge": {
        "url": null,
        "status": "待上架 · 商店素材已就绪"
      },
      "chrome": {
        "url": null,
        "status": "规划中 · 先用 zip 安装"
      }
    },
    "minBrowser": "111",
    "download": {
      "version": "1.1.9",
      "file": "downloads/bilibili-helper-v1.1.9.zip",
      "latestFile": "downloads/bilibili-helper-latest.zip",
      "sizeBytes": 98989,
      "sizeText": "97 KB",
      "date": "2026-10-21",
      "sha256": "73b935076f4c16a00b0d0233cd7697a84af2c64ac927ea900cfb073256924ae3",
      "source": "Panda-哔哩哔哩助手-v1.1.9.zip"
    },
    "icon": null
  },
  {
    "id": "bilibili-downloader",
    "match": [
      "B站视频下载器"
    ],
    "name": "B站视频下载器 · Panda",
    "shortName": "B 站下载器",
    "tagline": "把想留的视频、音频、封面和弹幕存到本地",
    "summary": "在 B 站视频页一键解析并下载视频 / 音频、封面与弹幕：支持多 P 批量、音视频分离与 ffmpeg 合并命令、命名模板与子目录、任务进度与失败重试。",
    "kind": "site",
    "badges": [
      "720P 免费下载",
      "1080P+ / 4K（PRO）",
      "多 P 批量",
      "封面 · 弹幕",
      "ffmpeg 合并"
    ],
    "membership": {
      "required": false,
      "label": "免费可用 · 可升级 PRO",
      "note": "免费账号每天可下载 3 个视频、最高 720P；PRO 不限次数并可选 1080P / 1080P+ / 4K（仍需 B 站大会员权限）。"
    },
    "features": [
      {
        "icon": "⬇️",
        "title": "一键解析下载",
        "desc": "在视频页点浮层按钮或按 Alt + D，解析当前视频的视频流 / 音频流 / 封面 / 弹幕，支持直连与「兼容保存」两种下载方式自动降级。",
        "tag": "自动降级"
      },
      {
        "icon": "🎞️",
        "title": "多 P 与批量任务",
        "desc": "整季 / 合集多 P 批量下载，可设同时并发数；任务列表显示进度、支持暂停与失败重试，断点多也不会乱。",
        "tag": "PRO 并发"
      },
      {
        "icon": "🧩",
        "title": "音视频分离 + 合并命令",
        "desc": "分离下载可得最高清晰度，任务卡里直接复制 ffmpeg 命令一条合成 MP4；也可以选单文件 MP4 直接可播。",
        "tag": "一条命令"
      },
      {
        "icon": "🗂️",
        "title": "目录与命名模板",
        "desc": "子目录 + 文件名模板（{title} {quality} {up} {bvid} {page} {date}），保存时自动归类，下载完不再手动改名。",
        "tag": "模板化"
      },
      {
        "icon": "🖼️",
        "title": "封面与弹幕",
        "desc": "下载完成后可同时保存封面图与 B 站标准 XML 弹幕，弹幕可直接导入常用播放器。",
        "tag": "XML 弹幕"
      },
      {
        "icon": "🛠️",
        "title": "自检与权限透明",
        "desc": "内置运行环境自检：检查账号服务、B 站接口、下载权限与请求头改写，下载失败时先跑一次就能定位问题。",
        "tag": "本机自检"
      }
    ],
    "permissions": [
      {
        "name": "storage",
        "purpose": "保存设置、任务记录与登录会话"
      },
      {
        "name": "downloads",
        "purpose": "把解析到的视频 / 音频 / 封面 / 弹幕写入下载目录"
      },
      {
        "name": "tabs",
        "purpose": "定位当前 B 站页面并发起解析"
      },
      {
        "name": "scripting",
        "purpose": "页面刷新后按需补注入浮层脚本"
      },
      {
        "name": "declarativeNetRequest",
        "purpose": "给 CDN 请求补上 Referer（B 站防盗链要求）"
      },
      {
        "name": "contextMenus",
        "purpose": "视频页右键「用 B站下载器解析此页」"
      },
      {
        "name": "alarms",
        "purpose": "每小时校验一次会员状态，离线时保留登录"
      },
      {
        "name": "offscreen",
        "purpose": "在后台页面取流，兼容防盗链场景"
      }
    ],
    "privacy": {
      "updated": "2026-10-22",
      "callout": "核心原则：扩展只把你本就有权观看的内容保存到本地。解析请求直接发往 B 站，文件写入你的浏览器下载目录，不经过任何中转服务器，也不上传视频内容。",
      "sections": [
        {
          "h": "一、我们收集什么",
          "p": [
            "不进行行为分析、埋点或遥测。"
          ],
          "list": [
            "账号系统（可选）：登录以使用 PRO 时保存邮箱地址（Supabase 托管），仅用于登录识别与会员权益；",
            "免费额度计数（每天 3 个）只保存在本机，按本地日期归零。"
          ]
        },
        {
          "h": "二、数据存储",
          "list": [
            "下载设置、命名模板、清晰度偏好：chrome.storage.sync；",
            "任务记录、今日额度计数、登录会话：chrome.storage.local；",
            "下载文件：写入你设置的浏览器下载目录（可指定子目录）。"
          ]
        },
        {
          "h": "三、联网行为",
          "table": {
            "head": [
              "触发场景",
              "发送内容",
              "接收方"
            ],
            "rows": [
              [
                "解析视频",
                "视频页 URL / 分 P 参数",
                "B 站公开播放接口"
              ],
              [
                "下载媒体",
                "直链或分段请求（补 Referer）",
                "B 站 CDN"
              ],
              [
                "登录 / 会员校验 / 兑换",
                "邮箱、密码（仅登录时）或兑换码",
                "Panda 账号服务（Supabase，经 Cloudflare Worker 反代）"
              ],
              [
                "运行环境自检",
                "一次公开接口请求，不含个人信息",
                "B 站 / 本地环境"
              ]
            ]
          },
          "p": [
            "扩展不会把你解析到的媒体上传到任何第三方，也不会把播放记录发给 Panda 账号服务。"
          ]
        },
        {
          "h": "四、权限用途",
          "list": [
            "主机权限仅限 bilibili.com / bilivideo.com / hdslb.com 等 B 站域名与 Panda 账号服务；",
            "downloads 权限仅用于把文件写入下载目录，不读取你已有的下载内容；",
            "declarativeNetRequest 只用于给 CDN 请求补 Referer，不改动其他站点的请求。"
          ]
        },
        {
          "h": "五、版权与使用边界",
          "p": [
            "本扩展只做「把你有权观看的内容保存到本地」。请遵守 B 站用户协议与著作权法规，不要二次分发下载的内容。"
          ]
        },
        {
          "h": "六、儿童隐私",
          "p": [
            "本扩展不面向 13 岁以下儿童，也不收集儿童个人信息。"
          ]
        },
        {
          "h": "七、政策变更与联系",
          "p": [
            "功能更新涉及新的数据处理时，我们会更新本页并标注生效版本。对本政策有疑问请通过 GitHub 仓库 Issues 反馈。"
          ]
        }
      ]
    },
    "stores": {
      "edge": {
        "url": null,
        "status": "待上架 · 先用 zip 安装"
      },
      "chrome": {
        "url": null,
        "status": "规划中 · 先用 zip 安装"
      }
    },
    "minBrowser": "109",
    "download": {
      "version": "1.0.8",
      "file": "downloads/bilibili-downloader-v1.0.8.zip",
      "latestFile": "downloads/bilibili-downloader-latest.zip",
      "sizeBytes": 109792,
      "sizeText": "107 KB",
      "date": "2026-10-22",
      "sha256": "16f62118f8af4362f1018441741a76bd334ec67831d9df708b22f0bfd7a29cb1",
      "source": "B站视频下载器-Panda-v1.0.8.zip"
    },
    "icon": null
  }
];
