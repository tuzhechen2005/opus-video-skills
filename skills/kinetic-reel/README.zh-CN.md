<div align="center">

# kinetic-reel

<a href="README.md"><img src="https://img.shields.io/badge/English-0E0F0E?style=for-the-badge" alt="English"></a>
<a href="README.zh-CN.md"><img src="https://img.shields.io/badge/简体中文-DDF53D?style=for-the-badge" alt="简体中文"></a>

基于 Claude Opus 5.5 的动态排版短片制作技能（Claude Code Skill）。
属于 [opus-video-skills](../../README.zh-CN.md) 合集。

</div>

![Work Reel ’26](docs/work-reel-sheet.jpg)

## 概述

本技能使 Claude Opus 5.5 能够制作节奏紧凑、以排版为主的动态短片，适用于作品集、Showreel 和产品介绍。它涵盖时间分配、分镜、排版动画、生成式背景、转场、合成配乐与最终编码。所有画面和音乐均由代码生成。

## 技术原理

1. **时间分配与分镜。** Claude 先确定以哪部分为主，以及各部分分别占多少时长；再编写镜头表，为每个镜头确定大标题、视觉机制、转场与音效。
2. **绘制。** 每个镜头是一个 JavaScript 函数，负责绘制完整画面：二维画布绘制文字与图示，three.js 图层生成背景，WebGL 后期处理负责 RGB 分离、切片故障和颗粒感。每一帧都由时间唯一确定。
3. **审查。** 在无头 Chrome 中渲染关键帧拼图、全分辨率单帧和转场序列。Claude 检查元素重叠、可读性与转场是否干净，并据此修改代码。
4. **配乐。** Node 编写的小型合成器读取与画面相同的时间轴生成配乐，包括鼓、贝斯、琶音、铺底，以及为每个动作点与转场准备的同调音效。
5. **输出。** 各帧并行渲染（在 Mac GPU 上通常每帧 8–40 毫秒），由 ffmpeg 编码为 MP4。

## 主要特性

- **以排版为主导。** 大标题用窄体展示字体，重击词用宽体无衬线，全片唯一的「旁白」句用斜体衬线，标注用等宽小字，统一排布在固定的 HUD 网格上。
- **每个镜头都有机制。** 每一项论点都有一张可运转的示意图来说明，例如负责路由的工具网格、逐行扫描的评测矩阵、在状态机中跳转的标记、相互融合的排名列表、依次通过安全闸门的回答。
- **形状连贯的转场。** 从视线所在的元素钻入、从高亮节点圆形展开、擦除、百叶窗、像素格溶解和推移。每次转场 0.45–0.6 秒，全片交替使用。
- **画面与声音按节拍锁定。** 画面与配乐读取同一条 120 BPM 的时间轴，文字、计数器与切镜都落在节拍上。转场使用同调乐音，不用重复的噪声扫频。
- **数据有出处。** 画面中的数字只取自提供的资料，并注明评测口径；示意性内容一律标注 SCHEMATIC。

## 示例：Work Reel ’26

<p align="center"><img src="docs/work-reel.gif" width="640" alt="Work Reel ’26"></p>

一位 AI 工程师的 84 秒作品集短片，时长按重点依次分配：
- **30 秒：微软 Cloud & AI 实习。** 包括工具调用评测、约束解码、ReAct 智能体、规划—审查多智能体、事件响应管道与可靠性保障。
- **18 秒：UW–Madison 外科系的临床 AI 研究。**
- **14 秒：企业级 RAG 系统。**

片尾把整支短片展开成一次 Agent 运行的 trace。这支短片同时是作者个人网站的入口页，页面上的跳过、声音、重播与进入按钮沿用同一套视觉语言。

源码见 [examples/work-reel-26](examples/work-reel-26/)，入口页见 [examples/site-intro](examples/site-intro/)。

## 环境要求

- Claude Code 及 Claude Opus 5.5
- Node.js、Google Chrome、ffmpeg

## 安装

参见[合集说明](../../README.zh-CN.md#安装)。以插件方式安装：

```
/plugin marketplace add tuzhechen2005/opus-video-skills
/plugin install kinetic-reel@opus-video-skills
```

## 使用方法

在 Claude Code 中描述所需短片，例如：

> 根据这份简历，把我的三个项目做成一支 60 秒的动态排版短片，以第一个项目为主。

也可通过 `/kinetic-reel` 直接调用。技能会基于 `template/`（一支用到全部技巧的 17 秒演示片）创建项目、提交分镜、逐个镜头制作并审查，合成配乐后输出 `out/reel.mp4`。

## 目录结构

| 路径 | 说明 |
|---|---|
| `SKILL.md` | Claude 遵循的工作流程与规则 |
| `template/` | 引擎与演示片：`reel/reel.js`、`reel/cues.js`、`music/score.mjs`、`render.mjs` |
| `scripts/new_project.sh` | 项目初始化与环境检查 |
| `references/style-guide.md` | 色板、字体、版式网格、动效函数、GL 图层与转场目录 |
| `references/sound.md` | 合成器、转场音效规则、编曲方法与已知问题 |
| `examples/work-reel-26/` | 84 秒示例的完整源码 |
| `examples/site-intro/` | 把短片做成网站入口页的实现，附带支持 HTTP Range 的 Cloudflare Worker |
| `examples/dongdongkan/` | H5 游戏《咚咚砍》的 36 秒苹果风产品短片 |

## 许可协议

MIT。渲染器改编自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（MIT 协议），详见仓库的 [LICENSE](../../LICENSE)。
