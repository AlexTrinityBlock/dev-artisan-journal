---
title: "Modern Web Guidance：讓編碼代理不再錯過現代網頁平台"
description: "原生 dialog、popover、自動長高的欄位與互斥手風琴等編碼代理常跳過的模式，全部即時示範；再加上教會代理使用它們的開源 Modern Web Guidance 技能。"
pubDate: 2026-11-22
category: "Web"
tags: ["網頁平台", "Baseline", "編碼代理", "工具鏈", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "11 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "支援 Modern Web Guidance 的編碼代理與 IDE 標誌"
---

# Modern Web Guidance：讓編碼代理不再錯過現代網頁平台

編碼代理能寫出可運作的程式碼，也能寫出開發者在 2016 年才會寫的程式碼。兩者的差距，往往是一整套函式庫份量的 JavaScript，對上幾行 HTML。

同一個 modal，兩種寫法。

**舊有寫法**

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

**現代寫法**

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

捲動鎖定靠兩條 CSS 規則：

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

九行，沒有 JavaScript。背景遮罩、焦點留在對話框內、Escape、行動裝置返回手勢與焦點歸還，全都由瀏覽器提供。

<figure class="fig">
  <img src="/images/modern-web-guidance/agent-marketplaces.webp" alt="支援 Modern Web Guidance 的編碼代理與 IDE 標誌：Codex、Cursor、Kimi、Google Antigravity、Grok、JetBrains WebStorm 與 GitHub Copilot。" width="1600" height="753" loading="lazy" />
  <figcaption><b>官方圖示</b> — Chrome 在 Modern Web Guidance v1.0 發布時使用的支援名單，列出當時表態的編碼代理與 IDE：Codex、Cursor、Kimi、Google Antigravity、Grok、JetBrains WebStorm 與 GitHub Copilot。支援程度依宿主代理而異，安裝路徑仍取決於你用的代理。資料來源：<a href="https://developer.chrome.com/blog/modern-web-guidance-v1">Chrome for Developers — Modern Web Guidance v1</a></figcaption>
</figure>

下面就是同樣的標記，正在這篇文章裡運作。打開它，用 Tab 走一遍，按 Escape，再重新開啟並選一個按鈕。

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
      <h3 class="mwg-demo-title">同樣九行，實際運行</h3>
      <p class="mwg-demo-sub">打開對話框，用 Tab 走一遍，按 Escape，再重新開啟並選一個按鈕。</p>
    </div>
    <div class="mwg-stage">
      <button class="mwg-btn" commandfor="confirm" command="show-modal" data-mwg-open>刪除</button>
      <span class="mwg-out" id="mwg-result">等待你的選擇…</span>
    </div>
    <dialog id="confirm" aria-labelledby="confirm-title">
      <h2 id="confirm-title">要刪除這個項目嗎？</h2>
      <p>這是原生 modal。背後的頁面會變成 inert，按 Escape 就能關閉。</p>
      <form method="dialog">
        <button class="mwg-btn" value="cancel" autofocus>取消</button>
        <button class="mwg-btn mwg-btn--ink" value="delete">刪除</button>
      </form>
    </dialog>
    <div class="mwg-src">DIALOG · INVOKER COMMANDS · HTML + CSS</div>
  </div>
</div>

這個示範背後的指南立場很清楚：不要對原生 modal 加上 `role="dialog"`、`aria-modal`、焦點陷阱、`inert` 切換或 Escape 處理器。重複實作瀏覽器行為，反而可能讓對話框更糟。

它也把 `body` 上舊有的 `overflow: hidden`，換成 `dialog:modal` 與 `dialog::backdrop` 上的 `overscroll-behavior: contain`。Safari 目前尚未強制執行 `overscroll-behavior`，但 modal 仍會困住自己的捲動，頁面也仍然是 inert。

Invoker Commands 於 2025 年 12 月 12 日成為 Baseline 新近可用。如果你的目標瀏覽器更舊，請保留相同標記，並只在 `HTMLButtonElement.prototype` 缺少 `commandForElement` 時載入 [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill)。

## 另外三個值得借用的模式

### popover 就是一個屬性

自製選單通常會附帶一個點擊監聽器、一個外部點擊處理器、還得小心維護 `aria-expanded`，另外還要決定 z-index。Popover API 把其中大部分收進標記裡。

```html
<button popovertarget="menu">Actions</button>

<ul id="menu" popover>
  <li><button popovertarget="menu" popovertargetaction="hide">Rename</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Duplicate</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Archive</button></li>
</ul>
```

觸發按鈕負責開啟 popover，選單項目則用 `popovertargetaction="hide"` 將它關閉。基本的用法裡，一行 JavaScript 都不用寫。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 02</span>
      <h3 class="mwg-demo-title">不需要點擊監聽器</h3>
      <p class="mwg-demo-sub">開啟與關閉都是屬性，不是 JavaScript。</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-popover-wrap">
        <button id="menu-btn" class="mwg-btn" popovertarget="menu">操作</button>
        <ul id="menu" class="mwg-menu" popover>
          <li><button popovertarget="menu" popovertargetaction="hide">重新命名</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">建立副本</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">封存</button></li>
        </ul>
      </div>
    </div>
    <div class="mwg-src">POPOVER API · 宣告式控制 · HTML</div>
  </div>
</div>

Popover API 自 2025 年 1 月 27 日起成為 Baseline 新近可用。回退是漸進式的：如果瀏覽器不認得這個屬性，觸發按鈕就什麼都不做，所以當某個操作很關鍵時，請保留一般的連結或按鈕路徑。

### 一行 CSS 就會長高的 textarea

舊模式是在每個 input 事件上跑一次 `scrollHeight` 迴圈。現代模式只有一行宣告：

```css
textarea {
  field-sizing: content;
}
```

這就是全部實作。欄位從自然高度開始，隨著使用者輸入長高，不需要 JavaScript 監聽器，也不會牽動框架的渲染週期。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 03</span>
      <h3 class="mwg-demo-title">開始輸入，方框就長高</h3>
      <p class="mwg-demo-sub">一行 CSS 宣告取代舊的 <code>scrollHeight</code> 迴圈。只有瀏覽器不支援這個屬性時，才會執行回退方案。</p>
    </div>
    <div class="mwg-stage">
      <textarea class="mwg-field" id="mwg-field" rows="2" placeholder="在這裡輸入幾行字，欄位會隨著內容長高。"></textarea>
    </div>
    <div class="mwg-src">FIELD-SIZING · 純 CSS · 漸進增強</div>
  </div>
</div>

`field-sizing: content` 是舊有 resize 迴圈的現代替代方案。它純粹是 CSS，不會和框架的渲染週期打架，也不必為每個欄位加上 input 監聽器。在尚未支援的地方，回退方案依然很小。

### 不用函式庫的互斥手風琴

手風琴套件通常要管理開啟狀態、隱藏面板，還要更新 ARIA 屬性。`details` 上的 `name` 屬性，原生就處理了互斥這一部分：

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

打開一個，另一個就會關閉。整個狀態機就這樣。

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 04</span>
      <h3 class="mwg-demo-title">一次只開一個</h3>
      <p class="mwg-demo-sub"><code>name</code> 屬性讓這些 details 互斥。打開一個，另一個就會關閉。</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-accordion">
        <details name="faq" open>
          <summary>什麼是 Baseline？</summary>
          <p>Baseline 告訴你某項功能何時在主要引擎之間達成互通。它是一個訊號，不保證每位使用者都已經能用。</p>
        </details>
        <details name="faq">
          <summary>為什麼瀏覽器做得更好？</summary>
          <p>原生控制項本身就包含焦點、鍵盤與無障礙行為，而自製元件往往得手工重建這些東西。</p>
        </details>
        <details name="faq">
          <summary>較舊的瀏覽器怎麼辦？</summary>
          <p>把這項功能當作漸進增強使用，只在 API 不存在時載入一個小型 polyfill。</p>
        </details>
      </div>
    </div>
    <div class="mwg-src">DETAILS · NAME 屬性 · HTML</div>
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
          : '已按 Escape 關閉。';
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

## 這些模式從哪裡來

這些模式是可見的部分。更難的問題是：代理怎麼在寫下舊有版本之前，就在正確的時機找到它們？

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) 會在代理動手建構的那一刻，把專家撰寫的指南放進它的上下文。它是一組技能加一個本地 CLI，由 Google Chrome、Microsoft Edge、Mozilla Firefox 與 MDN 團隊共同維護。1.0 版於 [2026 年 11 月 10 日](https://developer.chrome.com/blog/modern-web-guidance-v1) 發布。

[原始碼儲存庫](https://github.com/GoogleChrome/modern-web-guidance-src) 包含指南、CLI、評測框架與校準程式碼。可安裝的技能則放在隔壁的 [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) 儲存庫；如果你想貢獻或查證某個說法，這個區別很重要。

技能告訴代理何時該尋求指引。CLI 回傳一份有針對性的 Markdown 檔，裡面有程式模式、瀏覽器支援註記、容易踩的坑與回退方案。這裡沒有微調，程式碼仍然由代理撰寫。

任何支援技能的代理都能使用，包括 Claude Code、Codex 與 Copilot。

## 一行指令安裝

CLI 需要 Node.js 22 或更新版本。在專案目錄中執行：

```bash
npx modern-web-guidance@latest install
```

安裝程式是互動式的，會把技能寫到代理找得到的位置。若你要開發 Chrome 擴充功能，或想自己挑選技能包：

```bash
npx modern-web-guidance@latest install --choose
```

之後用 `npx modern-web-guidance@latest update` 更新。

不安裝也能先瀏覽目錄：

```bash
# Find guides by plain-English query
npx modern-web-guidance@latest search "animate a dialog modal backdrop"

# Print a guide by ID
npx modern-web-guidance@latest retrieve dialog

# Scan a codebase for legacy patterns
npx modern-web-guidance@latest legacy-scan .
```

`search` 會回傳依相關性排序的 JSON。`retrieve` 會印出一份指南，並接受以逗號分隔的清單。

`legacy-scan` 會解析 HTML、CSS、JavaScript、TypeScript、框架元件與 `package.json`。這是預篩，不是修復器：CLI 刻意不提供 `--fix` 旗標，而且每個發現都附有 `keepWhen` 與 `dropWhen` 準則。代理必須自行檢查周遭程式碼。

## 檢索迴圈怎麼運作

流程如下：

1. **觸發。** 代理辨識出網頁任務，技能告訴它去查 CLI。
2. **搜尋。** `search` 在本地用離線嵌入模型加 BM25 比對查詢與指南目錄。沒有搜尋 API、沒有 API key，也沒有網路往返。
3. **取用。** 代理呼叫 `retrieve <guide-id>`，得到一份聚焦的指南，而不是一個文件網站。
4. **套用。** 指南只在相關時進入上下文視窗。代理寫程式、跑測試，並對結果負責。

這個套件是自包含的，沒有執行期相依，快取後可用 `npx --offline` 運作。當它要在每個代理工作階段中執行時，低延遲與較小的供應鏈攻擊面很重要。

指南也顧及 token 效率。專案會刪掉模型已經會遵循的建議，讓取回的檔案把 token 花在真正的落差上，而不是一份通用 CSS 教學。

## 裡面有什麼

截至 2026 年 11 月，README 列出 **262 項現代網頁功能** 與 **204 個使用案例**。六大核心領域是使用者體驗、CSS 版面、效能、表單與 UI、無障礙，以及內建 AI。目錄也涵蓋安全、隱私、passkey、web component、PWA 與 WebMCP。

[現代化文件](https://developer.chrome.com/docs/modern-web-guidance/modernization-workflow) 展示了涵蓋範圍：

| 舊有模式 | 現代替代方案 |
| :--- | :--- |
| 用 JavaScript 依 `scrollHeight` 調整 textarea 高度 | CSS `field-sizing: content` |
| 只為了呼叫 `showPopover()` 的點擊監聽器 | `popovertarget` 屬性 |
| `max-height: 9999px` 的手風琴動畫 | `interpolate-size: allow-keywords` 與 `calc-size()` |
| 沒有完整性中繼資料的 CDN script 標籤 | `integrity` 與 `crossorigin="anonymous"` |

技能包有兩個。核心的 `modern-web-guidance` 約 205 個 token，`chrome-extensions` 約 175 個。這些是技能定義的大小，不是每份指南的長度，所以技能可以待在上下文裡，又不會擠掉手上的任務。

## 安全採用是產品的一部分

Modern Web Guidance 具備 Baseline 感知，但 Baseline 不是「到處都能用」的同義詞。

- **設定目標。** 如果 `AGENTS.md` 或 `CLAUDE.md` 沒有指定，工具會預設為 Baseline Widely available。宣告目標會改變代理收到的建議。
- **區分增強與關鍵行為。** 推測性預載可以無聲失敗；對話框控制不行。只有在行為不可或缺時才需要寫回退方案。
- **優先選擇小型回退。** 少於 50 行、針對個案的回退，或條件式載入的 polyfill，勝過肥大的打包檔。
- **管制不穩定功能。** Origin Trial 與 volatile 指南仍可搜尋，但在你選擇加入之前，`retrieve` 會被擋下。

選擇加入的設定放在專案根目錄的選用檔案 `.mwgrc`，或以 `~/.mwgrc` 作為使用者層級的備援。例如，只允許 Origin Trial 指南：

```bash
npx modern-web-guidance@latest set-allow-origin-trials
```

CLI 會寫入一個小到可以提交進版本控制的 JSON 檔：

```json
{
  "allowOriginTrials": true,
  "allowVolatileFeatures": false
}
```

如果你也想要單一引擎的指南，再執行 `set-allow-volatile-features`。Volatile 指的是在過去三個月內只在一個引擎推出、或仍在穩定的功能。它仍會出現在搜尋中，所以你可以閱讀，但不會被自動採用。代理不該因為找到一份看起來有希望的檔案，就伸手去用單一引擎 API。

## 評測數據撐得住嗎？

專案公開了 [評測儀表板](https://googlechrome.github.io/modern-web-guidance-src/)，並執行每晚 A/B 測試。每個任務都會在啟用與未啟用技能的情況下各跑一次，然後在真實瀏覽器中用 Playwright 評分。評分器檢查行為、樣式、原始碼模式與無障礙狀態，而不是某一種特定實作。

以下是儀表板上每個模型最新的每晚測試結果，日期為 **2026 年 11 月 20 日**：

<figure class="mwg-chart" aria-label="長條圖：三個編碼代理在啟用與未啟用 Modern Web Guidance 時的檢查通過率">
  <figcaption>
    <span class="card-tag">EVALS // NIGHTLY</span>
    <h3 class="mwg-chart-title">有引導的代理通過明顯更多檢查</h3>
    <p class="mwg-chart-sub">啟用與未啟用技能時的檢查通過率。愈高愈好。</p>
  </figcaption>
  <div class="mwg-chart-legend" aria-hidden="true">
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--unguided"></span>未引導</span>
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--guided"></span>有引導</span>
  </div>
  <div class="mwg-chart-scale" aria-hidden="true">
    <span></span>
    <div class="mwg-scale"><span>0%</span><span>50%</span><span>100%</span></div>
  </div>
  <div class="mwg-chart-rows">
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Antigravity CLI</b><span>Gemini 4 Argon</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引導：56%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 56%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">56%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引導：97%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 97%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">97%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Claude Code</b><span>Claude Opus 5.5</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引導：54%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 54%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">54%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引導：94%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 94%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">94%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Codex CLI</b><span>GPT-6.1 Sol</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="未引導：49%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 49%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">49%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="有引導：85%">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 85%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">85%</span>
        </div>
      </div>
    </div>
  </div>
  <div class="mwg-chart-src">每晚評測 · 2026-11-20 · 檢查通過率 · 評測儀表板</div>
</figure>

每一列代表一個模型的配對執行，包含 228–229 個任務與 1,955–1,961 項檢查。未引導的代理大約通過一半檢查；有引導的代理通過大多數檢查。差距分別是 +41、+40 與 +36 個百分點。自動無障礙檢查這一部分則從 54–60% 提升到 92–96%。

幾點提醒：

- 這個基準由專案團隊設計並執行。任務與評分器是開源的，但這是團隊自行執行的評測，不是獨立稽核。
- 提示從來沒有提到 Modern Web Guidance。代理必須自己發現技能適用，所以有引導的一側不是 100%。
- 未引導的基準是 49–56%，所以改善空間很大。你的程式碼庫缺口可能不同。
- 自動無障礙檢查涵蓋鍵盤、焦點與 `inert`、動態效果與對比、ARIA，以及表單標籤。它不是 WCAG 稽核。

在一個精選的基準上提升 36 到 41 個百分點，說明指南補上了真實缺口。它不保證你下一個 PR 也會進步 40 分。

## 它做不到的地方

Modern Web Guidance 很有用，但不能取代判斷。

**它是精選的，不是完整的。** 兩百個使用案例是很廣的目錄，不是全部；`legacy-scan` 也只涵蓋約 20% 的指南。如果你的問題不在裡面，代理會退回自己的知識。信任它之前，先讀那份指南。

**撰寫指引不等於執行期驗證。** 指南可以解釋 `<dialog>`，但無法證明焦點順序在你的應用裡正常。跑測試，並在瀏覽器中檢查互動。

**Baseline 是互通性，不是普遍支援。** 新近可用代表主要引擎最近都推出了，不保證使用者的瀏覽器已經有。設定目標，並閱讀回退章節。

**代理可能忽略建議。** 檢索只是把指南放進上下文，並不強制執行。評測衡量的是遵循程度，答案是「大多數時候」，不是「總是」。

## 隱私與關閉開關

CLI 預設會傳送匿名遙測：安裝次數、呼叫的代理、指南檢索 ID，以及代理的搜尋查詢。原始使用者提示不會被收集。程式碼在 [`modern-web.ts`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/src/cli/modern-web.ts)。

若要選擇退出，在 shell 設定檔設定一個環境變數：

```bash
export DISABLE_TELEMETRY=1
```

CLI 快取後仍可離線運作，所以封閉環境可以在第一次安裝後使用 `npx --offline`。

## 這帶來的改變

真正的轉變不是代理會寫 modal，而是平台知識變成一個可以檢查、納入版本控制、按需取用的檔案；這比微調或把整個文件網站貼進提示，是更小的介入。

對開發者來說，實用流程很短：

1. 安裝技能，並在 `AGENTS.md` 或 `CLAUDE.md` 設定 Baseline 目標。
2. 對一個資料夾執行 `legacy-scan`，不要對整個儲存庫跑。
3. 在接受 diff 之前，讀它取回的指南。
4. 在瀏覽器中驗證結果。

教訓是：撰寫指引與執行期驗證是兩份不同的工作。這裡處理前者；測試、DevTools 與真人審查處理後者。

原始碼在 [GitHub](https://github.com/GoogleChrome/modern-web-guidance-src)。軟體採用 [Apache 2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE)，指南採用 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)。文件：[developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance)。儀表板：[googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/)。

網頁平台已經往前走。這是一個讓代理跟上的實用方法。
