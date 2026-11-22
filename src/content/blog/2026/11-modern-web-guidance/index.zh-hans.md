---
title: "Modern Web Guidance：让编码代理不再错过现代网页平台"
description: "实测开源的 Modern Web Guidance 技能与 CLI：用本地搜索、Baseline 感知的回退方案与公开评测，引导编码代理采用现代 HTML、CSS 与浏览器 API。"
pubDate: 2026-11-22
category: "Web"
tags: ["网页平台", "Baseline", "编码代理", "工具链", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "9 分钟"
---

# Modern Web Guidance：让编码代理不再错过现代网页平台

编码代理能写出可以运行的代码，也能写出开发者在 2016 年才会写的代码：一个带有 `role="dialog"` 的 `<div>`、一个挂在 document 上的 Escape 监听器、一段锁住页面滚动的代码，还有一个手工打造的焦点陷阱。

这不是偷懒。训练数据里充满旧有代码；即使模型知道较新的 API，也往往缺乏让 API 真正可用的生产环境模式。代理还会复制周围仓库的惯例。

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) 会在代理动手构建的那一刻，把专家编写的指南放进它的上下文。它是一组技能加一个本地 CLI，由 Google Chrome、Microsoft Edge、Mozilla Firefox 与 MDN 团队共同维护。1.0 版于 [2026 年 11 月 10 日](https://developer.chrome.com/blog/modern-web-guidance-v1) 发布。

## 是技能，不是模型

Modern Web Guidance 不生成代码，也不取代你的代理。它给代理一个查询工具。

[源代码仓库](https://github.com/GoogleChrome/modern-web-guidance-src) 包含指南、CLI、评测框架与校准代码。可安装的技能则放在隔壁的 [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) 仓库；如果你想贡献或查证某个说法，这个区别很重要。

技能告诉代理何时该寻求指导。CLI 返回一份有针对性的 Markdown 文件，里面有代码模式、浏览器支持说明、容易踩的坑与回退方案。这里没有微调，代码仍然由代理编写。

任何支持技能的代理都能使用，包括 Claude Code、Codex 与 Copilot。

## 一行命令安装

CLI 需要 Node.js 22 或更新版本。在项目目录中运行：

```bash
npx modern-web-guidance@latest install
```

安装程序是交互式的，会把技能写到代理找得到的位置。如果你要开发 Chrome 扩展程序，或想自己挑选技能包：

```bash
npx modern-web-guidance@latest install --choose
```

之后用 `npx modern-web-guidance@latest update` 更新。

不安装也能先浏览目录：

```bash
# Find guides by plain-English query
npx modern-web-guidance@latest search "animate a dialog modal backdrop"

# Print a guide by ID
npx modern-web-guidance@latest retrieve dialog

# Scan a codebase for legacy patterns
npx modern-web-guidance@latest legacy-scan .
```

`search` 会返回 JSON。下面是精简后的结果：

```json
[
  {
    "id": "animate-to-from-top-layer",
    "description": "Animate elements such as dialogs, popovers, and tooltips as they're entering/exiting the top layer."
  },
  {
    "id": "dialog",
    "description": "Build a modal or non-modal dialog component that is accessible, manages focus appropriately, and can be dismissed the way users expect on each platform."
  }
]
```

实际命令会返回十条。`retrieve` 会打印一份指南，并接受用逗号分隔的列表。

`legacy-scan` 会解析 HTML、CSS、JavaScript、TypeScript、框架组件与 `package.json`。下面是一个小型示例：

```text
Modern Web Guidance Analyzer — .
Found 2 modernization opportunities across 2 guides (scanned 38 guides with deterministic rules; ~20% of the guidance corpus)
Note: Static analysis results are provisional — verify against the Keep/Drop criteria below.

* declarative-dialog-popover-control (1 finding)
  - legacy.html:4
    openBtn.addEventListener('click', () => menu.showPopover());

* form-fields-automatically-fit-contents (1 finding)
  - legacy.html:7
    textarea.style.height = `${textarea.scrollHeight}px`;
```

这是预筛，不是自动修复器。CLI 刻意没有 `--fix` 标志。每个发现都附有 `keepWhen` 与 `dropWhen` 标准，代理必须检查周围的代码。

## 检索循环如何运作

流程如下：

1. **触发。** 代理识别出网页任务，技能告诉它去查 CLI。
2. **搜索。** `search` 在本地用离线嵌入模型加 BM25 比对查询与指南目录。没有搜索 API、没有 API key，也没有网络往返。
3. **获取。** 代理调用 `retrieve <guide-id>`，得到一份聚焦的指南，而不是一个文档网站。
4. **应用。** 指南只在相关时进入上下文窗口。代理编写代码、运行测试，并对结果负责。

这个包是自包含的，没有运行时依赖，缓存后可用 `npx --offline` 运行。当它要在每个代理会话中运行时，低延迟与较小的供应链攻击面很重要。

指南也顾及 token 效率。项目会删掉模型已经会遵循的建议，让取回的文件把 token 花在真正的差距上，而不是一份通用 CSS 教程。

## 模态框实测：自制覆盖层，还是九行 HTML？

[`dialog` 指南](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/ui-components/dialog.md) 是个好测试：几乎每个应用都有模态框，而几乎每个自制模态框都漏掉同样的细节。下面的旧有版本有打开与关闭函数、会还原焦点，也会锁定页面。它仍然需要 Escape 处理、焦点陷阱、背景遮罩，以及让背景 inert。

```html
<div id="confirm" class="modal" role="dialog" aria-modal="true"
     aria-labelledby="confirm-title" hidden>
  <h2 id="confirm-title">Delete this item?</h2>
  <button id="cancel">Cancel</button>
  <button id="delete">Delete</button>
</div>

<script>
  const modal = document.querySelector('#confirm');
  let lastFocused;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('button').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus();
  }

  // Wiring omitted. Still missing: Escape, focus trap, inert background, backdrop.
</script>
```

现代版本：

```html
<button type="button" commandfor="confirm" command="show-modal">Delete</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this item?</h2>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

在支持 Invoker Commands 的浏览器上，这样就是完整实现：没有 JavaScript、不用手动还原焦点，也没有 z-index 或背景遮罩代码。再用两条 CSS 规则完成滚动锁定：

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

浏览器会处理自制模态框常做错的事：

- 背后的页面会变成 inert。
- 焦点会留在里面，并在关闭时回到触发元素。
- 它会渲染在顶层，并带有真正的 `::backdrop`。
- Escape、移动端返回手势与对话框语义都由浏览器提供。

指南在这里很明确：不要对原生模态框加上 `role="dialog"`、`aria-modal`、焦点陷阱、`inert` 切换或 Escape 处理器。重复实现浏览器行为，反而可能让对话框更糟。

它还抓到一个更细微的坑。旧建议是在 `body` 上设 `overflow: hidden`，这会移除根滚动条并造成布局偏移。指南用上面两条规则取代它。Safari 目前尚未强制实施 `overscroll-behavior`，但模态框仍会困住自己的滚动，页面也仍然是 inert。

Invoker Commands 于 2025 年 12 月 12 日成为 Baseline 新近可用。如果你的目标浏览器更旧，请保留相同标记，并只在 `HTMLButtonElement.prototype` 缺少 `commandForElement` 时载入 [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill)。

这就是「事实」与「指南」的差别：回退方案、无障碍规则，以及那个滚动 bug。

## 里面有什么

截至 2026 年 11 月，README 列出 **262 项现代网页功能** 与 **204 个使用案例**。六大核心领域是用户体验、CSS 布局、性能、表单与 UI、无障碍，以及内置 AI。目录也涵盖安全、隐私、passkey、Web Component、PWA 与 WebMCP。

使用案例很具体：把 dialog 动画送进顶层、做一张会响应自身宽度的卡片、只在用户交互后验证字段，或加入 passkey 登录。每份指南都是 Markdown，附有可运行片段与限制条件。

扫描器的范围较窄。我在 2026 年 11 月运行 CLI 1.0.1 时，它报告 **38 份指南** 具有确定性规则，约占整个语料的 20%。一个什么都标记的扫描器会被忽略，所以规则必须在没见过的仓库上通过精度门槛。

[现代化文档](https://developer.chrome.com/docs/modern-web-guidance/modernization-workflow) 展示了覆盖范围：

| 旧有模式 | 现代替代方案 |
| :--- | :--- |
| 用 JavaScript 根据 `scrollHeight` 调整 textarea 高度 | CSS `field-sizing: content` |
| 只为了调用 `showPopover()` 的点击监听器 | `popovertarget` 属性 |
| `max-height: 9999px` 的手风琴动画 | `interpolate-size: allow-keywords` 与 `calc-size()` |
| 没有完整性元数据的 CDN script 标签 | `integrity` 与 `crossorigin="anonymous"` |

技能包有两个。核心的 `modern-web-guidance` 约 205 个 token，`chrome-extensions` 约 175 个。这些是技能定义的大小，不是每份指南的长度，所以技能可以待在上下文里，又不会挤掉手上的任务。

## 安全采用是产品的一部分

Modern Web Guidance 具备 Baseline 感知，但 Baseline 不是「到处都能用」的同义词。

- **设置目标。** 如果 `AGENTS.md` 或 `CLAUDE.md` 没有指定，工具会默认为 Baseline Widely available。声明目标会改变代理收到的建议。
- **区分增强与关键行为。** 推测性预加载可以静默失败；对话框控件不行。只有在行为不可或缺时才需要写回退方案。
- **优先选择小型回退。** 少于 50 行、针对个案的方案，或按条件加载的 polyfill，胜过臃肿的打包文件。
- **管控不稳定功能。** Origin Trial 与 volatile 指南仍可搜索，但在你选择加入之前，`retrieve` 会被拦截。

选择加入的设置放在项目根目录的可选文件 `.mwgrc`，或以 `~/.mwgrc` 作为用户级的后备。例如，只允许 Origin Trial 指南：

```bash
npx modern-web-guidance@latest set-allow-origin-trials
```

CLI 会写入一个小到可以提交进版本控制的 JSON 文件：

```json
{
  "allowOriginTrials": true,
  "allowVolatileFeatures": false
}
```

如果你也想要单引擎的指南，再运行 `set-allow-volatile-features`。Volatile 指的是在过去三个月内只在一个引擎推出、或仍在稳定的功能。它仍会出现在搜索中，所以你可以阅读，但不会被自动采用。代理不该因为找到一份看起来有希望的文件，就伸手去用单引擎 API。

## 评测数据撑得住吗？

项目公开了 [评测仪表盘](https://googlechrome.github.io/modern-web-guidance-src/)，并运行每晚 A/B 测试。每个任务都会在启用与未启用技能的情况下各跑一次，然后在真实浏览器中用 Playwright 评分。评分器检查行为、样式、源代码模式与无障碍状态，而不是某一种特定实现。

下面是仪表盘上每个模型最新的每晚测试结果，日期为 **2026 年 11 月 20 日**：

| 代理与模型 | 配对任务／检查 | 未引导 → 有引导 | 提升 | 自动无障碍检查 |
| :--- | :---: | :---: | :---: | :---: |
| Antigravity CLI, Gemini 4 Argon | 228 / 1,955 | 56% → 97% | +41 pp | 54% → 95% |
| Claude Code, Claude Opus 5.5 | 229 / 1,961 | 54% → 94% | +40 pp | 60% → 96% |
| Codex CLI, GPT-6.1 Sol | 229 / 1,961 | 49% → 85% | +36 pp | 60% → 92% |

未引导的代理大约通过一半检查；有引导的代理通过大多数检查。无障碍项从 54–60% 提升到 92–96%。

几点提醒：

- 这个基准由项目团队设计并运行。任务与评分器是开源的，但这是团队自行运行的评测，不是独立审计。
- 提示词从来没有提到 Modern Web Guidance。代理必须自己发现技能适用，所以有引导的一侧不是 100%。
- 未引导的基准是 49–56%，所以改善空间很大。你的代码库缺口可能不同。
- 无障碍项涵盖键盘、焦点与 `inert`、动效与对比、ARIA 以及表单标签的自动检查。它不是 WCAG 审计。

在一个精选的基准上提升 36 到 41 个百分点，说明指南补上了真实缺口。它不保证你下一个 PR 也会进步 40 分。

## 它做不到的地方

Modern Web Guidance 很有用，但不能取代判断。

**它是精选的，不是完整的。** 两百个使用案例是很广的目录，不是全部；`legacy-scan` 也只涵盖约 20% 的指南。如果你的问题不在里面，代理会退回自己的知识。信任它之前，先读那份指南。

**编写指导不等于运行时验证。** 指南可以解释 `<dialog>`，但无法证明焦点顺序在你的应用里正常。运行测试，并在浏览器中检查交互。

**Baseline 是互操作性，不是普遍支持。** 新近可用代表主要引擎最近都推出了，不保证用户的浏览器已经有。设置目标，并阅读回退章节。

**代理可能忽略建议。** 检索只是把指南放进上下文，并不强制执行。评测衡量的是遵循程度，答案是「大多数时候」，不是「总是」。

## 隐私与关闭开关

CLI 默认会发送匿名遥测：安装次数、调用的代理、指南检索 ID，以及代理的搜索查询。原始用户提示词不会被收集。代码在 [`modern-web.ts`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/src/cli/modern-web.ts)。

如果要选择退出，在 shell 配置文件设置一个环境变量：

```bash
export DISABLE_TELEMETRY=1
```

CLI 缓存后仍可离线运行，所以封闭环境可以在第一次安装后使用 `npx --offline`。

## 这带来的改变

真正的转变不是代理会写模态框，而是平台知识变成一个可以检查、版本化、按需获取的文件；这比微调或把整个文档网站贴进提示词，是更小的介入。

对开发者来说，实用流程很短：

1. 安装技能，并在 `AGENTS.md` 或 `CLAUDE.md` 设置 Baseline 目标。
2. 对一个文件夹运行 `legacy-scan`，不要对整个仓库跑。
3. 在接受 diff 之前，读它取回的指南。
4. 在浏览器中验证结果。

教训是：编写指导与运行时验证是两份不同的工作。这里处理前者；测试、DevTools 与真人审查处理后者。

源代码在 [GitHub](https://github.com/GoogleChrome/modern-web-guidance-src)。软件采用 [Apache 2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE)，指南采用 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)。文档：[developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance)。仪表盘：[googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/)。

网页平台已经向前走了。这是一个让代理跟上的实用方法。
