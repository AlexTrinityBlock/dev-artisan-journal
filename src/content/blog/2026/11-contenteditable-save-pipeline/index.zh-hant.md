---
title: "可以直接打字編輯的網頁"
description: "一個純前端的標題與內文示範：點一下就能直接打字。文章也說明 plaintext-only 的瀏覽器支援、React 陷阱，以及讓快速編輯不會撞到自己版本的逐區塊儲存佇列。"
pubDate: 2026-11-25
category: "Web"
tags: ["contentEditable", "React", "TanStack Query", "使用者體驗", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "contenteditable plaintext-only 屬性值的官方 Baseline 圖示"
---

# 可以直接打字編輯的網頁

先試再讀。點一下標題或內文，直接打字。這是一個純前端組件：沒有儲存請求、沒有資料庫、沒有框架。

<section class="ce-demo" aria-labelledby="ce-demo-label">
  <div class="ce-demo-head">
    <span class="card-tag" id="ce-demo-label">LIVE DEMO // 00</span>
    <span class="ce-demo-hint">點一下就能改 · 只在本地</span>
  </div>
  <div class="ce-demo-page">
    <div class="ce-demo-title" contenteditable="plaintext-only" data-ce-demo="title" spellcheck="false" role="textbox" aria-multiline="false" aria-label="示範文章標題">可以直接打字編輯的網頁</div>
    <div class="ce-demo-body" contenteditable="plaintext-only" data-ce-demo="body" spellcheck="false" role="textbox" aria-multiline="true" aria-label="示範文章內文"><p>這是內文。把游標放進來，直接修改。貼上時只保留純文字，不會帶進 Word 或 Google Docs 的樣式。</p><p>沒有儲存按鈕。重新整理頁面就會還原。</p></div>
    <div class="ce-demo-status">CONTENTEDITABLE="PLAINTEXT-ONLY" · 不儲存 · 沒有後端</div>
  </div>
</section>

<script>
  (() => {
    document.documentElement.dataset.ceDemo = 'ready';
    const probe = document.createElement('div');
    probe.setAttribute('contenteditable', 'plaintext-only');
    if (probe.contentEditable === 'plaintext-only') return;
    document.querySelectorAll('[data-ce-demo]').forEach((el) => {
      el.setAttribute('contenteditable', 'true');
    });
  })();
</script>

<p class="mfig-bridge">這個示範是想法的最小版本。接下來要說明的是：一旦文字需要被儲存，為什麼它比看起來更難，以及瀏覽器到底保證了什麼。</p>

## 編輯器應該只佔最小的一部分

內容管理畫面天生帶著一個誘惑：安裝一套富文字編輯器，把文件建模成樹狀結構，讓框架接手選取範圍、歷史、貼上與儲存。對一頁標題、圖說與簡短內文欄位來說，這是用大量機械來處理少量文字。

替代方案是瀏覽器自己的編輯原語。`contentEditable` 很老、不耀眼，而且已經處理好游標、選取、復原、輸入法、拼字檢查與行動鍵盤。如果欄位是純文字，瀏覽器就可以是編輯器。應用程式只要負責三件事：「純文字」是什麼意思、何時提交，以及如何儲存才不會和自己賽跑。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">行內編輯 // 00</span>
    <p class="mfig-lead-kicker">CMS 欄位不需要文件模型。它需要純文字和一份儲存契約。</p>
    <h3 class="mfig-lead-title">像文字欄位一樣編輯。像資料庫一樣儲存。</h3>
    <p class="mfig-lead-sub">原生 contentEditable 守住游標；逐區塊佇列守住版本。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg></div>
      <div class="mfig-tag">純文字 // 僅限</div>
      <h4>瀏覽器剝掉標記</h4>
      <p>貼上就變成文字；不會夾帶 span、沒有隱藏樣式、沒有文件樹。</p>
      <div class="mfig-meta">貼上 · ENTER · 輸入法</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg></div>
      <div class="mfig-tag">失焦 // 儲存</div>
      <h4>在意圖明確時提交</h4>
      <p>失焦或 Enter 就儲存；Escape 還原；組字要等輸入法結束。</p>
      <div class="mfig-meta">ONBLUR · ENTER · ESC</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg></div>
      <div class="mfig-tag">版本 // 佇列</div>
      <h4>一次只寫一筆</h4>
      <p>下一個 PATCH 會等前一個回應，並採用它的版本。</p>
      <div class="mfig-meta">409 · 重試 · 回滾</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="ce-lead-title ce-lead-desc">
    <title id="ce-lead-title">行內儲存路徑</title>
    <desc id="ce-lead-desc">一次編輯在失焦時提交，頁面編輯器把欄位包成只含翻譯的 patch，儲存邏輯回報狀態，逐區塊佇列串接版本，API 更新區塊，TanStack Query 更新或回滾快取。</desc>
    <defs>
      <marker id="ce-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一個欄位 // 一個 PATCH // 一個版本</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">儲存路徑</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">編輯</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">失焦 / ENTER</text>
    <text x="34" y="100" class="m" font-size="6.8">onSave(text)</text>
    <text x="34" y="112" class="f" font-size="6.2">輸入法等待</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="codebox"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="M8 12h8"/><path d="M8 16h6"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">包成 patch</text>
    <text x="172" y="88" class="t mono" font-size="8.4" font-weight="800">patchField</text>
    <text x="172" y="100" class="m" font-size="6.8">translations.zh-TW</text>
    <text x="172" y="112" class="f" font-size="6.2">只改 title</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="term"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">狀態</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">useSaver</text>
    <text x="310" y="100" class="m" font-size="6.8">儲存中 · 已儲存</text>
    <text x="310" y="112" class="f" font-size="6.2">失敗 · 重試</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="box"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">佇列</text>
    <text x="448" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="448" y="100" class="m" font-size="6.8">block:&lt;id&gt;</text>
    <text x="448" y="112" class="f" font-size="6.2">逐鍵序列隊尾</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="codebox"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">HTTP</text>
    <text x="586" y="88" class="t mono" font-size="8.2" font-weight="800">PATCH /blocks</text>
    <text x="586" y="100" class="m" font-size="6.8">+ 版本</text>
    <text x="586" y="112" class="f" font-size="6.2">同源 cookie</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">快取</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">TANSTACK</text>
    <text x="724" y="100" class="m" font-size="6.8">setQueryData</text>
    <text x="724" y="112" class="f" font-size="6.2">或回滾</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">編輯器刻意保持精簡 · 嚴謹度藏在儲存路徑裡</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>編輯器刻意保持精簡。</b>嚴謹度藏在儲存路徑裡。</p>
</section>

<p class="mfig-bridge">本文其餘部分是：瀏覽器實際上保證了什麼、如何用 React 包住它，以及為什麼這條七步儲存路徑非得有佇列不可。</p>

## plaintext-only 到底保證了什麼

`contenteditable` 是列舉屬性，有三個有意義的值：`true`、`false` 與 `plaintext-only`。最後一個讓元素的原始文字可編輯，並關閉富文字格式。貼上會被剝成純文字，瀏覽器也不再提供粗體、斜體與其他格式工具列。

這就是承諾。細節比表面上看起來薄得多。

HTML 規格並沒有標準化 Enter 或貼上產生的 DOM。Chrome 把 Enter 當成換行並插入 `\n`，還會強制元素使用預格式化的 `white-space`。Firefox 136+ 只在 `white-space` 為預格式化時插入 `\n`；否則插入 `<br>`。Safari 歷來使用 `<br>`。實務上的規則是：永遠不要解析 `innerHTML`；讀 `innerText`，並自己設定 `white-space: pre-wrap`。

<figure class="fig">
  <img src="/images/contenteditable-save-pipeline/devtools-plaintext-only.webp" alt="Chrome DevTools 元素面板：一個 contenteditable=plaintext-only 的 div，以及 textarea 內部由使用者代理陰影根節點包住的 div 編輯區" width="625" height="167" loading="lazy" />
  <figcaption><b>官方圖示</b> — Chrome DevTools 顯示 <code>contenteditable="plaintext-only"</code> 的 div，以及 textarea 的使用者代理陰影根節點。兩者的編輯表面都是 div；屬性改變的是行為，不是元素型別。來源：<a href="https://web.dev/blog/contenteditable-plaintext-only-baseline">web.dev</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

`plaintext-only` 也不是消毒器。`paste` 事件仍可能帶著 `text/html`，`execCommand("insertHTML")` 仍能插入標記。這個屬性約束的是編輯介面，不是每一條能碰到 DOM 的程式路徑。儲存純文字、在伺服器驗證純文字，並以文字呈現——永遠不要當成 HTML。

支援現在已經夠廣，可以用了，但要留後備：

| 瀏覽器 | `plaintext-only` | 備註 |
| :--- | :--- | :--- |
| Chrome | 51+ | 強制預格式化空白；Enter 插入 LF |
| Edge | Chromium 79+ | 跟隨 Chromium 行為 |
| Safari / iOS Safari | 5.1+ | 歷來是 `<br>`；請讀 `innerText` |
| Firefox | 136+ | 自 2025 年 3 月起；除非 `white-space: pre`，否則用 `<br>` |

Baseline 將 `plaintext-only` 列為自 2025 年 3 月起新近可用，「廣泛可用」預計在 2027 年 9 月。目前所有發行版都支援它。後備方案是為舊的 Firefox ESR、內嵌 WebView，以及客戶採購團隊五年前選定的那款瀏覽器而存在。

用 `setAttribute` 做功能偵測，不要用 IDL setter。把無效值指定給 `el.contentEditable` 可能會拋出例外：

```ts
const supportsPlaintext = () => {
  const el = document.createElement("div");
  el.setAttribute("contenteditable", "plaintext-only");
  return el.contentEditable === "plaintext-only";
};
```

在 SSR 應用中，先渲染 `contentEditable={true}`，掛載後再升級。在伺服器渲染 `plaintext-only`、在老舊客戶端渲染 `true` 會造成 hydration 不匹配；什麼都不渲染則會得到一個在 JavaScript 載入前無法編輯的欄位。

## 後備方案：true 加三道防線

當功能不存在時，`contentEditable="true"` 會改變三種行為：

1. **貼上會保留 HTML。** 從 Word 或 Google Docs 貼上的內容會帶著 span 與樣式。
2. **Enter 會產生區塊元素。** 你得到的是 `<div>`、`<p>` 或 `<br>`，而不是可預測的換行。
3. **拖放與快速鍵可以插入標記。** 拖放與 `execCommand` 不再受約束。

因此後備方案需要三道防線：`onPaste` 讀 `text/plain` 並插入、`onDrop` 被阻止或正規化、`beforeinput` 取消 `format*` 與 `insertFromDrop`。欄位維持 `white-space: pre-wrap`，儲存路徑正規化 CRLF 與不斷行空格，伺服器拒絕標記。後備方案是相容層，不是第二個編輯器。

## React 負責掛載，瀏覽器負責游標

`contentEditable` 元素不管 React 怎麼想，都是非受控的。React 無法讓使用者的編輯與 `children` 保持一致；它自己的文件就警告，使用者編輯後「將無法更新其內容」。`suppressContentEditableWarning` 只是讓警告閉嘴，並沒有轉移所有權。

可行的模式是：

- 只渲染一次初始文字，或在 layout effect 中設定。
- 透過 ref 管理 DOM。
- 不要把每個 `input` 事件都回饋到 `children`。那會替換文字節點並讓游標塌陷。
- 外部值變更時，只在元素沒有焦點時寫入。
- 如果伺服器更新必須在聚焦時落地，儲存並還原選區的位移量，或把寫入延後到失焦。

其他 React 陷阱比較小，但很尖銳：

**輸入法。** 中文、日文、韓文輸入會觸發組字事件。用 ref 追蹤 `compositionstart` 與 `compositionend`，組字期間不要在 Enter 時提交。Safari 歷來會在負責提交的 Enter keydown 之前先觸發 `compositionend`，所以要檢查 `nativeEvent.isComposing`、`keyCode === 229`，以及你自己的組字旗標。如果組字中途收到失焦，延後處理，等組字結束再提交。

**beforeinput。** React 的 `onBeforeInput` 是 polyfill，無法可靠地暴露 `inputType` 或 `data`。如果你需要取消格式，透過 ref 掛上原生監聽器。不是每種編輯都會觸發 `beforeinput`，而輸入法、自動填入與拼字檢查的編輯可能無法取消，所以要在 `input` 與提交時做正規化，當作最後防線。

**按鍵與空狀態。** 單行欄位在 Enter 時提交並失焦。多行欄位在 Enter 時插入換行，在 Cmd/Ctrl+Enter 時提交。Escape 還原上次儲存的值並失焦，不儲存。瀏覽器會在「空」元素裡留下一個填充用的 `<br>`，所以 `:empty` 不可靠；用 `innerText.trim()` 追蹤空狀態，並以 `::before` 渲染佔位文字。

**無障礙。** 使用 `role="textbox"`、`aria-multiline`，以及 `aria-label` 或 `aria-labelledby`。`<label for>` 對 `div` 沒有作用。視情況加上 `tabIndex={0}`、`lang`、`dir="auto"`、`spellCheck`、`aria-invalid` 與 `aria-describedby`。儲存後保留同一個節點，讓焦點與鍵盤流程得以延續。

## 儲存路徑，一步一步來

編輯器刻意保持精簡。工作由儲存路徑以七個步驟完成：

1. **EditableText。** 在失焦或 Enter 時——且不在組字期間——呼叫 `onSave(newText)`。
2. **`usePageEditor().patchField`。** 把欄位包成區塊 patch，例如 `{ translations: { "zh-TW": { title } } }`。深度合併；替換 `translations` 會抹掉 body 與其他所有語言版本。
3. **`useSaver().run`。** 把狀態設為儲存中並套用樂觀快取更新。右下角的狀態提示是 live region，不是 toast。
4. **`versionedWrite("block:<id>", version, …)`。** 逐區塊排入寫入。下一次寫入會等前一個回應，並採用它的新版本。
5. **`adminApi.patchBlock(id, { …, version })`。** 帶著佇列目前認可的版本，送出 `PATCH /api/admin/blocks/{id}`。
6. **`apiFetch`。** 同源 `fetch`，加上 `credentials: "same-origin"`，讓 session cookie 一起送出。檢查 `response.ok`；解析錯誤 body 以區分 `409` 與 `422`。
7. **TanStack Query。** 成功時，用伺服器的區塊 `setQueryData`，讓 UI 顯示標準值。失敗時，還原欄位快照並標記儲存失敗。`invalidateQueries` 是給衍生清單與搜尋用的，不是給你剛寫入的區塊。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">儲存路徑 // 01</span>
    <h3 class="mfig-fig-title">從失焦的欄位到快取條目，共七步</h3>
    <p class="mfig-fig-sub">元件提交文字，頁面編輯器把欄位整理成 patch，儲存邏輯負責狀態，佇列負責版本順序。API 與快取是最後兩步。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 390" role="img" aria-labelledby="ce-f1-title ce-f1-desc">
    <title id="ce-f1-title">七步行內儲存管線</title>
    <desc id="ce-f1-desc">EditableText 在失焦或 Enter 時提交；patchField 建立只含翻譯的 patch；useSaver 設定狀態與樂觀狀態；versionedWrite 逐區塊排隊；adminApi.patchBlock 帶著版本送出 PATCH；apiFetch 使用同源 session cookie；TanStack Query 寫入伺服器回應或回滾。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">從失焦到快取 // 七個步驟</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一個欄位，一個版本</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="78" class="term"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">01 · 元件</text>
    <text x="36" y="88" class="t" font-size="9.4" font-weight="800">EditableText</text>
    <text x="36" y="102" class="m" font-size="6.6">失焦或 Enter → onSave</text>
    <text x="36" y="114" class="f" font-size="6.2">組字防護</text>
    <line x1="204" y1="87" x2="222" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="48" width="180" height="78" class="box"/>
    <text x="236" y="66" class="f" font-size="6.8" letter-spacing="0.7">02 · 頁面編輯器</text>
    <text x="236" y="88" class="t mono" font-size="8.6" font-weight="800">patchField</text>
    <text x="236" y="102" class="m" font-size="6.6">translations.zh-TW.title</text>
    <text x="236" y="114" class="f" font-size="6.2">深度合併，不是替換</text>
    <line x1="404" y1="87" x2="422" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="48" width="180" height="78" class="term"/>
    <text x="436" y="66" class="f" font-size="6.8" letter-spacing="0.7">03 · 狀態</text>
    <text x="436" y="88" class="t" font-size="9.4" font-weight="800">useSaver().run</text>
    <text x="436" y="102" class="m" font-size="6.6">儲存中 → 已儲存 / 失敗</text>
    <text x="436" y="114" class="f" font-size="6.2">樂觀快取寫入</text>
    <line x1="604" y1="87" x2="622" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="48" width="180" height="78" class="codebox"/>
    <text x="636" y="66" class="f" font-size="6.8" letter-spacing="0.7">04 · 順序</text>
    <text x="636" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="636" y="102" class="m" font-size="6.6">block:&lt;id&gt;</text>
    <text x="636" y="114" class="f" font-size="6.2">逐鍵序列隊尾</text>
    <line x1="714" y1="126" x2="714" y2="160" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="162" width="180" height="78" class="box"/>
    <text x="636" y="180" class="f" font-size="6.8" letter-spacing="0.7">05 · API 客戶端</text>
    <text x="636" y="202" class="t mono" font-size="8" font-weight="800">patchBlock</text>
    <text x="636" y="216" class="m" font-size="6.6">PATCH /api/admin/blocks/:id</text>
    <text x="636" y="228" class="f" font-size="6.2">+ 版本</text>
    <line x1="624" y1="201" x2="606" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="162" width="180" height="78" class="term"/>
    <text x="436" y="180" class="f" font-size="6.8" letter-spacing="0.7">06 · 傳輸</text>
    <text x="436" y="202" class="t mono" font-size="8.6" font-weight="800">apiFetch</text>
    <text x="436" y="216" class="m" font-size="6.6">credentials: same-origin</text>
    <text x="436" y="228" class="f" font-size="6.2">session cookie · res.ok</text>
    <line x1="424" y1="201" x2="406" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="162" width="180" height="78" class="box"/>
    <text x="236" y="180" class="f" font-size="6.8" letter-spacing="0.7">07 · 快取</text>
    <text x="236" y="202" class="t" font-size="9.4" font-weight="800">TanStack Query</text>
    <text x="236" y="216" class="m" font-size="6.6">setQueryData(server)</text>
    <text x="236" y="228" class="f" font-size="6.2">失敗時回滾</text>
    <line x1="24" y1="266" x2="816" y2="266" class="dash"/>
    <text x="24" y="288" class="f" font-size="6.6" letter-spacing="0.5">成功 → 寫入伺服器值 · 409 → 以新版本為基底或顯示衝突 · 422 → 保留草稿 · 網路 → 重試</text>
    <text x="24" y="310" class="f" font-size="6.6" letter-spacing="0.5">佇列在執行時讀取最新認可的版本，而不是入列時捕捉的版本</text>
    <text x="24" y="332" class="f" font-size="6.2">每個區塊：一個進行中寫入 + 一個合併後的待處理寫入</text>
    <text x="816" y="332" class="f" font-size="6.2" text-anchor="end">讓清單失效，不是你剛寫入的區塊</text>
  </svg>
  </div>
  <p class="mfig-fig-src">提交 → 欄位 PATCH → 狀態 → 佇列 → PATCH → 快取</p>
</figure>

## 為什麼需要佇列

沒有佇列時，兩次快速編輯會產生兩個 PATCH，兩者都帶著版本 7。伺服器接受第一個並回傳 8。第二個仍說 7，所以伺服器正確地回傳 `409 Conflict`。使用者沒有和任何人衝突；客戶端和自己衝突。

逐鍵佇列讓第二次寫入等待第一個回應並採用其版本，從而修正這個問題。微妙之處在於版本從哪裡來：

```ts
type Queue = { tail: Promise<unknown>; version: number; pending: number };
const queues = new Map<string, Queue>();

export function versionedWrite<T>(
  key: string,
  baseVersion: number,
  write: (version: number) => Promise<{ data: T; version: number }>,
): Promise<T> {
  const q = queues.get(key) ?? {
    tail: Promise.resolve(),
    version: baseVersion,
    pending: 0,
  };
  queues.set(key, q);
  q.pending++;

  const run = q.tail.then(async () => {
    const result = await write(q.version); // read at execution, not enqueue
    q.version = result.version;
    return result.data;
  });

  q.tail = run.then(() => undefined, () => undefined);
  const done = () => {
    if (--q.pending === 0 && queues.get(key) === q) queues.delete(key);
  };
  run.then(done, done);
  return run;
}
```

如果 `write` 閉包捕捉了呼叫端的 `baseVersion`，排隊的請求仍會送出過期的數字。這個參數只是為新佇列提供起始版本；每次執行都必須讀 `q.version`。這就是「真的能用」的佇列與「看起來能用」的佇列之間的差別。

合併是另一半。每個區塊一個進行中寫入加上一個最新的待處理寫入就夠了。如果每次按鍵都排入一個 PATCH，打字快的人會產生一長串請求，唯一的目的就是被覆寫。如果你用自動儲存，去抖 500–800 ms；在失焦或 Enter 時立刻送出；而且永遠不要在組字期間去抖。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">佇列 // 02</span>
    <h3 class="mfig-fig-title">自我衝突與序列版本串接</h3>
    <p class="mfig-fig-sub">三次針對同一版本的編輯，不是互相競速，就是排隊。佇列把第二與第三個 PATCH 變成接下來的版本，而不是 409 回應。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 330" role="img" aria-labelledby="ce-f2-title ce-f2-desc">
    <title id="ce-f2-title">並發寫入與逐鍵佇列</title>
    <desc id="ce-f2-desc">沒有佇列時，三次編輯都送出 v7；只有第一個成功，另外兩個收到 409。有佇列時，第一個送出 7 並回傳 8，第二個送出 8 並回傳 9，第三個送出 9 並回傳 10。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">三次編輯 // 兩種結果</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">同一個區塊，同一個使用者</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="56" class="f" font-size="7" letter-spacing="0.8">沒有佇列 // 三次都送 v7</text>
    <rect x="24" y="68" width="150" height="54" class="term"/>
    <text x="36" y="86" class="f" font-size="6.4">編輯 01</text>
    <text x="36" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="95" x2="196" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="68" width="130" height="54" class="box"/>
    <text x="210" y="86" class="f" font-size="6.4">伺服器</text>
    <text x="210" y="104" class="t" font-size="8.2" font-weight="800">200 → v8</text>
    <rect x="352" y="68" width="150" height="54" class="term"/>
    <text x="364" y="86" class="f" font-size="6.4">編輯 02</text>
    <text x="364" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="502" y1="95" x2="524" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="526" y="68" width="130" height="54" class="box"/>
    <text x="538" y="86" class="f" font-size="6.4">伺服器</text>
    <text x="538" y="104" class="t" font-size="8.2" font-weight="800">409 ×</text>
    <rect x="680" y="68" width="136" height="54" class="term"/>
    <text x="692" y="86" class="f" font-size="6.4">編輯 03</text>
    <text x="692" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7 → 409</text>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <text x="24" y="176" class="f" font-size="7" letter-spacing="0.8">有佇列 // 每次寫入採用已認可的版本</text>
    <rect x="24" y="188" width="150" height="54" class="term"/>
    <text x="36" y="206" class="f" font-size="6.4">編輯 01</text>
    <text x="36" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="215" x2="196" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="188" width="130" height="54" class="box"/>
    <text x="210" y="206" class="f" font-size="6.4">200</text>
    <text x="210" y="224" class="t" font-size="8.2" font-weight="800">v8</text>
    <line x1="328" y1="215" x2="352" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="354" y="188" width="150" height="54" class="codebox"/>
    <text x="366" y="206" class="f" font-size="6.4">編輯 02</text>
    <text x="366" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v8</text>
    <line x1="504" y1="215" x2="526" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="528" y="188" width="130" height="54" class="box"/>
    <text x="540" y="206" class="f" font-size="6.4">200</text>
    <text x="540" y="224" class="t" font-size="8.2" font-weight="800">v9</text>
    <line x1="658" y1="215" x2="680" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="682" y="188" width="134" height="54" class="codebox"/>
    <text x="694" y="206" class="f" font-size="6.4">編輯 03</text>
    <text x="694" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v9</text>
    <rect x="24" y="268" width="792" height="34" class="term"/>
    <text x="36" y="289" class="f" font-size="6.6" letter-spacing="0.6">一個進行中 + 一個合併待處理 · 佇列是逐區塊，不是全域 · 409 仍代表有外部寫入者</text>
  </svg>
  </div>
  <p class="mfig-fig-src">沒有佇列：200 · 409 · 409 — 有佇列：200 · 200 · 200</p>
</figure>

## 伺服器仍然掌握版本

佇列只協調一個客戶端。另一個分頁、第二位管理員，或一個 MCP 工具，都可能在這兩個請求之間寫入。伺服器必須執行原子性的 compare-and-swap：

```sql
UPDATE content_blocks
SET version = version + 1, updated_at = now()
WHERE id = $1 AND version = $2
RETURNING version;
```

如果回傳零列，回傳 `409` 與目前的表示。客戶端接著可以把編輯過的欄位與它的基底比較：如果沒有人改過那個欄位，就以新版本為基底重試一次。如果有人改過，顯示衝突，而不是猜測。

客戶端的 `version` 不是安全控制。它是協調提示。授權、驗證與發佈規則仍在伺服器上對每個請求執行，不論請求從哪扇門進來。

## 失敗、回滾與狀態提示

樂觀 UI 是快取在伺服器同意之前先做出的承諾。安全順序是：

1. 對該區塊 `cancelQueries`。
2. 快照欄位目前的快取值。
3. 用新值 `setQueryData`。
4. 成功時，用伺服器的標準區塊 `setQueryData`。
5. 失敗時，只還原嘗試的欄位——不是整個區塊，因為其中可能有另一個欄位較新的成功編輯。

失敗時把使用者的文字留在編輯器裡。回滾快取與唯讀檢視；不要抹掉他們打的內容。把欄位標記為無效並提供「重試」，重試會送出最新文字，不是失敗的快照。

狀態提示應該放在 provider 裡，才能在編輯器卸載後存活。給它 `role="status"` 與 `aria-live="polite"`，「儲存中…」至少顯示 300 ms 以避免閃爍，「已儲存」則停留幾秒。它是狀態，不是 toast，而且永遠不該搶走焦點。

有幾種失敗模式值得明確處理：

| 失敗 | 回應 |
| :--- | :--- |
| 回應遺失後的 `409` | 用 idempotency key 重試，或重新抓取、以新版本為基底並詢問 |
| `422` 驗證 | 保留草稿，設定 `aria-invalid`，顯示欄位錯誤 |
| `401` session 過期 | 保留草稿，重新驗證，重試 |
| 網路離線 | 暫停 mutation，重連後恢復，不要空轉 |
| 儲存期間卸載 | 讓請求完成；儲存邏輯位於編輯器之上 |
| 有未儲存文字時導覽 | 路由攔截器加草稿，不是只有 `beforeunload` |

`beforeunload` 在行動裝置上不可靠，而 `fetch(..., { keepalive: true })` 的 body 上限是 64 KiB。在 localStorage 裡放一份小草稿，比一個使用者可能永遠看不到的對話框更可靠。

## 檢查清單

- [ ] 用 `setAttribute` 對 `plaintext-only` 做功能偵測；回退到 `true` 時加上貼上、拖放與 `beforeinput` 防線。
- [ ] 讀 `innerText`，正規化 CRLF 與 NBSP，設定 `white-space: pre-wrap`，儲存純文字。
- [ ] 讓 DOM 保持非受控；聚焦時永不寫入；不要每次 input 都重新渲染 `children`。
- [ ] 防護輸入法組字，包括 Safari 的事件順序；組字中途延後失焦儲存。
- [ ] 逐欄位定義 Enter、Shift+Enter、Escape 與失焦行為；Escape 時還原。
- [ ] `role="textbox"`、`aria-multiline`、label、`lang`、`aria-invalid`、placeholder。
- [ ] 逐區塊佇列在執行時讀取最新認可版本；合併待處理寫入。
- [ ] 伺服器做原子 compare-and-swap；`409` 回傳目前狀態。
- [ ] 深度合併欄位 patch；永遠不要替換 `translations` 物件。
- [ ] 重試要有 idempotency key；不要盲目重試 `409`、`401` 或 `422`。
- [ ] `cancelQueries` → 快照 → 樂觀寫入；只回滾嘗試的欄位。
- [ ] 狀態 live region、重試、衝突 UI、草稿持久化、焦點返回。
- [ ] 測試 Chrome、Safari、Firefox、中文輸入法、從 Word/Docs 貼上、離線、兩個分頁、慢網路、卸載。

整個設計的重點是：瀏覽器本來就擅長編輯，伺服器本來就擅長版本。元件不該試圖成為其中任何一個。它應該讀純文字、在意圖明確時提交，然後把寫入交給一個知道下一個版本是什麼的佇列。

## 參考資料

- [WHATWG HTML: `contenteditable`](https://html.spec.whatwg.org/multipage/interaction.html#attr-contenteditable) — 屬性值與編輯模型。
- [MDN: `contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable) — 行為與相容性說明。
- [MDN: `HTMLElement.contentEditable`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable) — IDL setter 行為。
- [web-features: `contenteditable=plaintext-only`](https://web-platform-dx.github.io/web-features-explorer/features/contenteditable-plaintextonly) — Baseline 狀態。
- [web.dev: plaintext-only Baseline](https://web.dev/blog/contenteditable-plaintext-only-baseline) — 支援時程。
- [Firefox 136 release notes](https://www.mozilla.org/en-US/firefox/136.0/releasenotes/) — `plaintext-only` 支援。
- [MDN: `beforeinput`](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) — 可取消的輸入類型。
- [MDN: `innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) — 渲染文字與換行。
- [React: common props](https://react.dev/reference/react-dom/components/common) — `contentEditable` 與 `suppressContentEditableWarning`。
- [WAI-ARIA: textbox](https://www.w3.org/TR/wai-aria-1.2/#textbox) — 角色與狀態。
- [TanStack Query: optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) — 快照、回滾與快取寫入。
- [TanStack Query: invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — 何時重新抓取。
- [RFC 9110 §15.5.10](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.10) — `409 Conflict`。
- [RFC 7386](https://www.rfc-editor.org/rfc/rfc7386) — JSON Merge Patch。
- [Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) — 安全重試。
