---
title: "Modern Web Guidance：让编码代理不再错过现代网页平台"
description: "原生 dialog、popover、自动长高的字段与互斥手风琴等编码代理常跳过的模式，全部实时演示；再加上教会代理使用它们的开源 Modern Web Guidance 技能。"
pubDate: 2026-11-22
category: "Web"
tags: ["网页平台", "Baseline", "编码代理", "工具链", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "11 分钟"
---

# Modern Web Guidance：让编码代理不再错过现代网页平台

编码代理能写出可以运行的代码，也能写出开发者在 2016 年才会写的代码。两者的差距，往往是一大套 JavaScript 库，对上几行 HTML。

同一个模态框，两种写法。

**旧有写法**

```html
<div id="confirm" role="dialog" aria-modal="true" hidden>
  <h2>Delete this item?</h2>
  <button>Cancel</button>
  <button>Delete</button>
</div>
<script>
  // open/close, focus trap, Escape, inert background, scroll lock
</script>
```

**现代写法**

```html
<button commandfor="confirm" command="show-modal">Delete</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this item?</h2>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

滚动锁定靠两条 CSS 规则：

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

九行，没有 JavaScript。背景遮罩、焦点约束、Escape、移动端返回手势与焦点归还，全都由浏览器提供。

下面就是同样的标记，正在这篇文章里运行。打开它，用 Tab 走一遍，按 Escape，再重新打开并选一个按钮。

<style>
  .prose-inner .mwg-demo {
    margin: 22px 0;
  }

  .prose-inner .mwg-demo .chamfer-card-content {
    padding: 20px 18px 16px;
  }

  .prose-inner .mwg-demo-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .prose-inner .mwg-demo-head .card-tag {
    margin: 0;
  }

  .prose-inner .mwg-demo-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--mono-ink);
  }

  .prose-inner .mwg-demo-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-demo pre {
    margin: 0 0 14px;
    padding: 12px 14px;
    background: var(--mono-paper);
    color: var(--mono-ink);
    border: 0.7px solid var(--mono-grid);
    border-radius: 0;
    font-size: 11.5px;
    line-height: 1.65;
    overflow-x: auto;
  }

  .prose-inner .mwg-demo pre code {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: inherit;
  }

  .prose-inner .mwg-stage {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding-top: 14px;
    border-top: 0.7px dashed var(--mono-grid);
  }

  .prose-inner .mwg-src {
    margin-top: 14px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  .prose-inner .mwg-out {
    font-family: var(--mono-font-mono);
    font-size: 10px;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--mono-paper);
    color: var(--mono-ink);
    border: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font);
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
  }

  .prose-inner .mwg-btn:hover {
    border-color: var(--mono-ink);
  }

  .prose-inner .mwg-btn--ink {
    background: var(--mono-ink);
    border-color: var(--mono-ink);
    color: var(--mono-paper);
  }

  .prose-inner .mwg-btn:focus-visible,
  .prose-inner .mwg-field:focus-visible,
  .prose-inner .mwg-accordion summary:focus-visible {
    outline: 0.8px solid var(--mono-ink);
    outline-offset: 2px;
  }

  .prose-inner .mwg-demo dialog {
    width: min(420px, calc(100vw - 32px));
    margin: auto;
    padding: 22px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    color: var(--mono-ink);
  }

  .prose-inner .mwg-demo dialog:modal {
    overscroll-behavior: contain;
  }

  .prose-inner .mwg-demo dialog::backdrop {
    overflow: hidden;
    overscroll-behavior: contain;
    background: color-mix(in srgb, var(--mono-ink) 55%, transparent);
  }

  .prose-inner .mwg-demo dialog h2 {
    margin: 0 0 6px;
    padding: 0;
    border: 0;
    font-size: 1.15rem;
    line-height: 1.3;
  }

  .prose-inner .mwg-demo dialog p {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--mono-l2);
  }

  .prose-inner .mwg-demo dialog form {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }

  .prose-inner .mwg-demo dialog .mwg-out {
    display: block;
    margin-top: 12px;
  }

  .prose-inner .mwg-popover-wrap {
    display: inline-flex;
  }

  .prose-inner .mwg-demo [popover] {
    inset: auto;
    top: 50%;
    left: 50%;
    width: 220px;
    margin: 0;
    padding: 6px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    color: var(--mono-ink);
    transform: translate(-50%, -50%);
  }

  .prose-inner .mwg-demo [popover]::backdrop {
    background: transparent;
  }

  @supports (anchor-name: --mwg-menu-btn) {
    .prose-inner .mwg-demo #menu-btn {
      anchor-name: --mwg-menu-btn;
    }

    .prose-inner .mwg-demo #menu {
      position-anchor: --mwg-menu-btn;
      top: anchor(bottom);
      left: anchor(left);
      transform: none;
      margin-top: 6px;
    }
  }

  .prose-inner .mwg-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .prose-inner .mwg-menu li {
    margin: 0;
  }

  .prose-inner .mwg-menu button {
    display: block;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    color: var(--mono-ink);
    font-family: var(--mono-font);
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }

  .prose-inner .mwg-menu button:hover {
    background: var(--mono-bg-subtle);
  }

  .prose-inner .mwg-field {
    width: 100%;
    min-height: 4.5em;
    max-height: 14em;
    padding: 10px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    color: var(--mono-ink);
    font-family: var(--mono-font);
    font-size: 12.5px;
    line-height: 1.55;
    resize: none;
    field-sizing: content;
  }

  .prose-inner .mwg-accordion {
    width: 100%;
  }

  .prose-inner .mwg-accordion details {
    padding: 9px 0;
    border-top: 0.7px solid var(--mono-grid);
  }

  .prose-inner .mwg-accordion details:last-child {
    border-bottom: 0.7px solid var(--mono-grid);
  }

  .prose-inner .mwg-accordion summary {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    list-style: none;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--mono-ink);
  }

  .prose-inner .mwg-accordion summary::-webkit-details-marker {
    display: none;
  }

  .prose-inner .mwg-accordion summary::after {
    content: '+';
    font-family: var(--mono-font-mono);
    font-size: 11px;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-accordion details[open] summary::after {
    content: '−';
  }

  .prose-inner .mwg-accordion p {
    margin: 7px 0 0;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--mono-l2);
  }

  .prose-inner .mwg-chart {
    margin: 28px 0;
    padding: 22px 20px 18px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .mwg-chart figcaption {
    margin-bottom: 12px;
  }

  .prose-inner .mwg-chart-title {
    margin: 4px 0 3px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--mono-ink);
  }

  .prose-inner .mwg-chart-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-chart-legend {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    font-family: var(--mono-font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .prose-inner .mwg-swatch {
    display: inline-block;
    width: 14px;
    height: 6px;
  }

  .prose-inner .mwg-swatch--unguided {
    background: var(--mono-l5);
  }

  .prose-inner .mwg-swatch--guided {
    background: var(--mono-ink);
  }

  .prose-inner .mwg-chart-scale {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 14px;
    align-items: end;
  }

  .prose-inner .mwg-scale {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-right: 36px;
    padding-bottom: 4px;
    border-bottom: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    color: var(--mono-faint);
  }

  .prose-inner .mwg-scale span:nth-child(2) {
    text-align: center;
  }

  .prose-inner .mwg-scale span:last-child {
    text-align: right;
  }

  .prose-inner .mwg-chart-row {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 14px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 0.7px dashed var(--mono-grid);
  }

  .prose-inner .mwg-chart-row:last-child {
    border-bottom: 0;
  }

  .prose-inner .mwg-chart-model {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .prose-inner .mwg-chart-model b {
    font-size: 11.5px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .mwg-chart-model span {
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    color: var(--mono-muted);
  }

  .prose-inner .mwg-bar-pair {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .prose-inner .mwg-bar-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .prose-inner .mwg-bar-track {
    flex: 1;
    height: 7px;
    background: var(--mono-bg-subtle);
    border-radius: 0 99px 99px 0;
    overflow: hidden;
  }

  .prose-inner .mwg-bar {
    display: block;
    height: 100%;
    border-radius: 0 99px 99px 0;
  }

  .prose-inner .mwg-bar--unguided {
    background: var(--mono-l5);
  }

  .prose-inner .mwg-bar--guided {
    background: var(--mono-ink);
  }

  .prose-inner .mwg-bar-val {
    flex: none;
    width: 28px;
    font-family: var(--mono-font-mono);
    font-size: 9px;
    font-weight: 800;
    color: var(--mono-ink);
    text-align: right;
  }

  .prose-inner .mwg-chart-src {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  @media (max-width: 620px) {
    .prose-inner .mwg-chart {
      padding: 18px 14px 14px;
    }

    .prose-inner .mwg-chart-scale {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .prose-inner .mwg-chart-scale > span:first-child {
      display: none;
    }

    .prose-inner .mwg-chart-row {
      grid-template-columns: 1fr;
      gap: 6px;
      padding: 12px 0;
    }

    .prose-inner .mwg-chart-model {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }
  }
</style>

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 01</span>
      <h3 class="mwg-demo-title">同样九行，实际运行</h3>
      <p class="mwg-demo-sub">打开对话框，用 Tab 走一遍，按 Escape，再重新打开并选一个按钮。</p>
    </div>
    <div class="mwg-stage">
      <button class="mwg-btn" commandfor="confirm" command="show-modal" data-mwg-open>删除</button>
      <span class="mwg-out" id="mwg-result">等待你的选择…</span>
    </div>
    <dialog id="confirm" aria-labelledby="confirm-title">
      <h2 id="confirm-title">要删除这个项目吗？</h2>
      <p>这是原生模态框。背后的页面会变成 inert，按 Escape 就能关闭。</p>
      <form method="dialog">
        <button class="mwg-btn" value="cancel" autofocus>取消</button>
        <button class="mwg-btn mwg-btn--ink" value="delete">删除</button>
      </form>
    </dialog>
    <div class="mwg-src">DIALOG · INVOKER COMMANDS · HTML + CSS</div>
  </div>
</div>

这个演示背后的指南立场很清楚：不要对原生模态框加上 `role="dialog"`、`aria-modal`、焦点陷阱、`inert` 切换或 Escape 处理器。重复实现浏览器行为，反而可能让对话框更糟。

它也把 `body` 上旧有的 `overflow: hidden`，换成 `dialog:modal` 与 `dialog::backdrop` 上的 `overscroll-behavior: contain`。Safari 目前尚未强制实施 `overscroll-behavior`，但模态框仍会困住自己的滚动，页面也仍然是 inert。

Invoker Commands 于 2025 年 12 月 12 日成为 Baseline 新近可用。如果你的目标浏览器更旧，请保留相同标记，并只在 `HTMLButtonElement.prototype` 缺少 `commandForElement` 时载入 [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill)。

## 另外三个值得借用的模式

### popover 就是一个属性

自制菜单通常会附带一个点击监听器、一个外部点击处理器、还得小心维护 `aria-expanded`，另外还要决定 z-index。Popover API 把其中大部分收进标记里。

```html
<button popovertarget="menu">Actions</button>

<ul id="menu" popover>
  <li><button popovertarget="menu" popovertargetaction="hide">Rename</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Duplicate</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Archive</button></li>
</ul>
```

触发按钮负责打开 popover，菜单项则用 `popovertargetaction="hide"` 将它关闭。基本的用法里，一行 JavaScript 都不用写。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 02</span>
      <h3 class="mwg-demo-title">不需要点击监听器</h3>
      <p class="mwg-demo-sub">打开与关闭都是属性，不是 JavaScript。</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-popover-wrap">
        <button id="menu-btn" class="mwg-btn" popovertarget="menu">操作</button>
        <ul id="menu" class="mwg-menu" popover>
          <li><button popovertarget="menu" popovertargetaction="hide">重命名</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">创建副本</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">归档</button></li>
        </ul>
      </div>
    </div>
    <div class="mwg-src">POPOVER API · 声明式控制 · HTML</div>
  </div>
</div>

Popover API 自 2025 年 1 月 27 日起成为 Baseline 新近可用。回退是渐进式的：如果浏览器不认识这个属性，触发按钮就什么都不做，所以当某个操作很关键时，请保留普通的链接或按钮路径。

### 一行 CSS 就会长高的 textarea

旧模式是在每个 input 事件上跑一次 `scrollHeight` 循环。现代模式只有一行声明：

```css
textarea {
  field-sizing: content;
}
```

这就是全部实现。字段从自然高度开始，随着用户输入长高，不需要 JavaScript 监听器，也不会牵动框架的渲染周期。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 03</span>
      <h3 class="mwg-demo-title">开始输入，方框就长高</h3>
      <p class="mwg-demo-sub">一行 CSS 声明取代旧的 <code>scrollHeight</code> 循环。只有浏览器不支持这个属性时，才会执行回退方案。</p>
    </div>
    <div class="mwg-stage">
      <textarea class="mwg-field" id="mwg-field" rows="2" placeholder="在这里输入几行字，字段会随内容长高。"></textarea>
    </div>
    <div class="mwg-src">FIELD-SIZING · 纯 CSS · 渐进增强</div>
  </div>
</div>

`field-sizing: content` 是旧有 resize 循环的现代替代方案。它纯粹是 CSS，不会和框架的渲染周期打架，也不必为每个字段加上 input 监听器。在尚未支持的地方，回退方案依然很小。

### 不用库的互斥手风琴

手风琴库通常要管理打开状态、隐藏面板，还要更新 ARIA 属性。`details` 上的 `name` 属性，原生就处理了互斥这一部分：

```html
<details name="faq">
  <summary>What is Baseline?</summary>
  <p>Baseline tells you when a feature is interoperable across the major engines.</p>
</details>

<details name="faq">
  <summary>Why does the browser do it better?</summary>
  <p>Native controls already contain the focus and keyboard behavior.</p>
</details>
```

打开一个，另一个就会关闭。整个状态机就这样。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 04</span>
      <h3 class="mwg-demo-title">一次只开一个</h3>
      <p class="mwg-demo-sub"><code>name</code> 属性让这些 details 互斥。打开一个，另一个就会关闭。</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-accordion">
        <details name="faq" open>
          <summary>什么是 Baseline？</summary>
          <p>Baseline 告诉你某项功能何时在主要引擎之间达成互通。它是一个信号，不保证每位用户都已经能用。</p>
        </details>
        <details name="faq">
          <summary>为什么浏览器做得更好？</summary>
          <p>原生控件本身就包含焦点、键盘与无障碍行为，而自制组件往往得手工重建这些东西。</p>
        </details>
        <details name="faq">
          <summary>较旧的浏览器怎么办？</summary>
          <p>把这功能当作渐进增强使用，只在 API 不存在时加载一个小型 polyfill。</p>
        </details>
      </div>
    </div>
    <div class="mwg-src">DETAILS · NAME 属性 · HTML</div>
  </div>
</div>

<script is:inline>
  (() => {
    const dialog = document.getElementById('confirm');
    const open = document.querySelector('[data-mwg-open]');
    const result = document.getElementById('mwg-result');

    if (dialog && open) {
      open.addEventListener('click', () => {
        dialog.returnValue = '';
      }, true);

      if (!('commandForElement' in HTMLButtonElement.prototype)) {
        open.addEventListener('click', () => dialog.showModal());
      }
    }

    if (dialog && result) {
      dialog.addEventListener('close', () => {
        result.textContent = dialog.returnValue
          ? 'returnValue = "' + dialog.returnValue + '"'
          : '已按 Escape 关闭。';
      });
    }

    const field = document.getElementById('mwg-field');
    if (field && !CSS.supports('field-sizing', 'content')) {
      const grow = () => {
        field.style.height = 'auto';
        field.style.height = field.scrollHeight + 'px';
      };
      field.addEventListener('input', grow);
      grow();
    }
  })();
</script>

## 这些模式从哪里来

这些模式是可见的部分。更难的问题是：代理怎么在写下旧有版本之前，就在正确的时机找到它们？

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) 会在代理动手构建的那一刻，把专家编写的指南放进它的上下文。它是一组技能加一个本地 CLI，由 Google Chrome、Microsoft Edge、Mozilla Firefox 与 MDN 团队共同维护。1.0 版于 [2026 年 11 月 10 日](https://developer.chrome.com/blog/modern-web-guidance-v1) 发布。

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

`search` 会返回按相关性排序的 JSON。`retrieve` 会打印一份指南，并接受用逗号分隔的列表。

`legacy-scan` 会解析 HTML、CSS、JavaScript、TypeScript、框架组件与 `package.json`。这是预筛，不是修复器：CLI 刻意不提供 `--fix` 标志，而且每个发现都附有 `keepWhen` 与 `dropWhen` 标准。代理必须自行检查周围的代码。

## 检索循环如何运作

流程如下：

1. **触发。** 代理识别出网页任务，技能告诉它去查 CLI。
2. **搜索。** `search` 在本地用离线嵌入模型加 BM25 比对查询与指南目录。没有搜索 API、没有 API key，也没有网络往返。
3. **获取。** 代理调用 `retrieve <guide-id>`，得到一份聚焦的指南，而不是一个文档网站。
4. **应用。** 指南只在相关时进入上下文窗口。代理编写代码、运行测试，并对结果负责。

这个包是自包含的，没有运行时依赖，缓存后可用 `npx --offline` 运行。当它要在每个代理会话中运行时，低延迟与较小的供应链攻击面很重要。

指南也顾及 token 效率。项目会删掉模型已经会遵循的建议，让取回的文件把 token 花在真正的差距上，而不是一份通用 CSS 教程。

## 里面有什么

截至 2026 年 11 月，README 列出 **262 项现代网页功能** 与 **204 个使用案例**。六大核心领域是用户体验、CSS 布局、性能、表单与 UI、无障碍，以及内置 AI。目录也涵盖安全、隐私、passkey、Web Component、PWA 与 WebMCP。

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

以下是仪表盘上每个模型最新的每晚测试结果，日期为 **2026 年 11 月 20 日**：

<figure class="mwg-chart" aria-label="条形图：三个编码代理在启用与未启用 Modern Web Guidance 时的检查通过率">
  <figcaption>
    <span class="card-tag">EVALS // NIGHTLY</span>
    <h3 class="mwg-chart-title">有引导的代理通过明显更多检查</h3>
    <p class="mwg-chart-sub">启用与未启用技能时的检查通过率。越高越好。</p>
  </figcaption>
  <div class="mwg-chart-legend" aria-hidden="true">
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--unguided"></span>未引导</span>
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--guided"></span>有引导</span>
  </div>
  <div class="mwg-chart-scale" aria-hidden="true">
    <span></span>
    <div class="mwg-scale"><span>0%</span><span>50%</span><span>100%</span></div>
  </div>
  <div class="mwg-chart-rows">
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Antigravity CLI</b><span>Gemini 4 Argon</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引导：56%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 56%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">56%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引导：97%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 97%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">97%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Claude Code</b><span>Claude Opus 5.5</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引导：54%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 54%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">54%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引导：94%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 94%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">94%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Codex CLI</b><span>GPT-6.1 Sol</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引导：49%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 49%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">49%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引导：85%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 85%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">85%</span>
        </div>
      </div>
    </div>
  </div>
  <div class="mwg-chart-src">每晚评测 · 2026-11-20 · 检查通过率 · 评测仪表盘</div>
</figure>

每一行代表一个模型的配对运行，包含 228–229 个任务与 1,955–1,961 项检查。未引导的代理大约通过一半检查；有引导的代理通过大多数检查。差距分别是 +41、+40 与 +36 个百分点。自动无障碍检查这部分则从 54–60% 提升到 92–96%。

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

真正的转变不是代理会写模态框，而是平台知识变成一个可以检查、纳入版本控制、按需获取的文件；这比微调或把整个文档网站贴进提示词，是更小的介入。

对开发者来说，实用流程很短：

1. 安装技能，并在 `AGENTS.md` 或 `CLAUDE.md` 设置 Baseline 目标。
2. 对一个文件夹运行 `legacy-scan`，不要对整个仓库跑。
3. 在接受 diff 之前，读它取回的指南。
4. 在浏览器中验证结果。

教训是：编写指导与运行时验证是两份不同的工作。这里处理前者；测试、DevTools 与真人审查处理后者。

源代码在 [GitHub](https://github.com/GoogleChrome/modern-web-guidance-src)。软件采用 [Apache 2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE)，指南采用 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)。文档：[developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance)。仪表盘：[googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/)。

网页平台已经向前走了。这是一个让代理跟上的实用方法。
