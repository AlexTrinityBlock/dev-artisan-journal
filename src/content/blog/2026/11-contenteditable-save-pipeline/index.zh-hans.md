---
title: "可以直接打字编辑的网址"
description: "一个纯前端的标题与正文示例：点一下就能直接打字。文章也说明 plaintext-only 的浏览器支持、React 陷阱，以及让快速编辑不会撞到自己版本的逐区块保存队列。"
pubDate: 2026-11-25
category: "Web"
tags: ["contentEditable", "React", "TanStack Query", "用户体验", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分钟"
---

# 可以直接打字编辑的网址

先试再读。点一下标题或正文，直接打字。这是一个纯前端组件：没有保存请求、没有数据库、没有框架。

<section class="ce-demo" aria-labelledby="ce-demo-label">
  <div class="ce-demo-head">
    <span class="card-tag" id="ce-demo-label">LIVE DEMO // 00</span>
    <span class="ce-demo-hint">点一下就能改 · 只在本地</span>
  </div>
  <div class="ce-demo-page">
    <div class="ce-demo-title" contenteditable="plaintext-only" data-ce-demo="title" spellcheck="false" role="textbox" aria-multiline="false" aria-label="示例文章标题">可以直接打字编辑的网址</div>
    <div class="ce-demo-body" contenteditable="plaintext-only" data-ce-demo="body" spellcheck="false" role="textbox" aria-multiline="true" aria-label="示例文章正文"><p>这是正文。把光标放进来，直接修改。粘贴时只保留纯文本，不会带进 Word 或 Google Docs 的样式。</p><p>没有保存按钮。刷新页面就会还原。</p></div>
    <div class="ce-demo-status">CONTENTEDITABLE="PLAINTEXT-ONLY" · 不保存 · 没有后端</div>
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

<p class="mfig-bridge">这个示例是想法的最小版本。接下来要说明的是：一旦文本需要被保存，为什么它比看起来更难，以及浏览器到底保证了什么。</p>

## 编辑器应该只占最小的一部分

内容管理界面天生带着一个诱惑：安装一套富文本编辑器，把文档建模成树状结构，让框架接管选区、历史、粘贴与保存。对一页标题、图注与简短正文字段来说，这是用大量机械来处理少量文本。

替代方案是浏览器自己的编辑原语。`contentEditable` 很老、不耀眼，而且已经处理好光标、选区、撤销、输入法、拼写检查与移动端键盘。如果字段是纯文本，浏览器就可以是编辑器。应用程序只要负责三件事：“纯文本”是什么意思、何时提交，以及如何保存才不会和自己赛跑。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">行内编辑 // 00</span>
    <p class="mfig-lead-kicker">CMS 字段不需要文档模型。它需要纯文本和一份保存契约。</p>
    <h3 class="mfig-lead-title">像文本字段一样编辑。像数据库一样保存。</h3>
    <p class="mfig-lead-sub">原生 contentEditable 守住光标；逐区块队列守住版本。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg></div>
      <div class="mfig-tag">纯文本 // 仅限</div>
      <h4>浏览器剥掉标记</h4>
      <p>粘贴就变成文本；不会夹带 span、没有隐藏样式、没有文档树。</p>
      <div class="mfig-meta">粘贴 · ENTER · 输入法</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg></div>
      <div class="mfig-tag">失焦 // 保存</div>
      <h4>在意图明确时提交</h4>
      <p>失焦或 Enter 就保存；Escape 恢复；组字要等输入法结束。</p>
      <div class="mfig-meta">ONBLUR · ENTER · ESC</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg></div>
      <div class="mfig-tag">版本 // 队列</div>
      <h4>一次只写一笔</h4>
      <p>下一个 PATCH 会等前一个响应，并采用它的版本。</p>
      <div class="mfig-meta">409 · 重试 · 回滚</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="ce-lead-title ce-lead-desc">
    <title id="ce-lead-title">行内保存路径</title>
    <desc id="ce-lead-desc">一次编辑在失焦时提交，页面编辑器把字段包成只含翻译的 patch，保存逻辑回报状态，逐区块队列串联版本，API 更新区块，TanStack Query 更新或回滚缓存。</desc>
    <defs>
      <marker id="ce-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一个字段 // 一个 PATCH // 一个版本</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">保存路径</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">编辑</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">失焦 / ENTER</text>
    <text x="34" y="100" class="m" font-size="6.8">onSave(text)</text>
    <text x="34" y="112" class="f" font-size="6.2">输入法等待</text>
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
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">状态</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">useSaver</text>
    <text x="310" y="100" class="m" font-size="6.8">保存中 · 已保存</text>
    <text x="310" y="112" class="f" font-size="6.2">失败 · 重试</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="box"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">队列</text>
    <text x="448" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="448" y="100" class="m" font-size="6.8">block:&lt;id&gt;</text>
    <text x="448" y="112" class="f" font-size="6.2">逐键串行队尾</text>
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
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">缓存</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">TANSTACK</text>
    <text x="724" y="100" class="m" font-size="6.8">setQueryData</text>
    <text x="724" y="112" class="f" font-size="6.2">或回滚</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">编辑器刻意保持精简 · 严谨度藏在保存路径里</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>编辑器刻意保持精简。</b>严谨度藏在保存路径里。</p>
</section>

<p class="mfig-bridge">本文其余部分是：浏览器实际上保证了什么、如何用 React 包住它，以及为什么这条七步保存路径非得有队列不可。</p>

## plaintext-only 到底保证了什么

`contenteditable` 是列举属性，有三个有意义的值：`true`、`false` 与 `plaintext-only`。最后一个让元素的原始文本可编辑，并关闭富文本格式。粘贴会被剥成纯文本，浏览器也不再提供粗体、斜体与其他格式工具栏。

这就是承诺。细节比表面上看起来薄得多。

HTML 规格并没有标准化 Enter 或粘贴产生的 DOM。Chrome 把 Enter 当成换行并插入 `\n`，还会强制元素使用预格式化的 `white-space`。Firefox 136+ 只在 `white-space` 为预格式化时插入 `\n`；否则插入 `<br>`。Safari 历来使用 `<br>`。实际上的规则是：永远不要解析 `innerHTML`；读 `innerText`，并自己设置 `white-space: pre-wrap`。

`plaintext-only` 也不是消毒器。`paste` 事件仍可能带着 `text/html`，`execCommand("insertHTML")` 仍能插入标记。这个属性约束的是编辑界面，不是每一条能碰到 DOM 的程序路径。保存纯文本、在服务器验证纯文本，并以文本呈现——永远不要当成 HTML。

支持现在已经够广，可以用了，但要留后备：

| 浏览器 | `plaintext-only` | 备注 |
| :--- | :--- | :--- |
| Chrome | 51+ | 强制预格式化空白；Enter 插入 LF |
| Edge | Chromium 79+ | 跟随 Chromium 行为 |
| Safari / iOS Safari | 5.1+ | 历来是 `<br>`；请读 `innerText` |
| Firefox | 136+ | 自 2025 年 3 月起；除非 `white-space: pre`，否则用 `<br>` |

Baseline 将 `plaintext-only` 列为自 2025 年 3 月起新近可用，“广泛可用”预计在 2027 年 9 月。目前所有发行版都支持它。后备方案是为旧的 Firefox ESR、内嵌 WebView，以及客户采购团队五年前选定的那款浏览器而存在。

用 `setAttribute` 做特性检测，不要用 IDL setter。把无效值指定给 `el.contentEditable` 可能会抛出异常：

```ts
const supportsPlaintext = () => {
  const el = document.createElement("div");
  el.setAttribute("contenteditable", "plaintext-only");
  return el.contentEditable === "plaintext-only";
};
```

在 SSR 应用中，先渲染 `contentEditable={true}`，挂载后再升级。在服务器渲染 `plaintext-only`、在老旧客户端渲染 `true` 会造成 hydration 不匹配；什么都不渲染则会得到一个在 JavaScript 加载前无法编辑的字段。

## 后备方案：true 加三道防线

当该特性不存在时，`contentEditable="true"` 会改变三种行为：

1. **粘贴会保留 HTML。** 从 Word 或 Google Docs 粘贴的内容会带着 span 与样式。
2. **Enter 会产生区块元素。** 你得到的是 `<div>`、`<p>` 或 `<br>`，而不是可预测的换行。
3. **拖放与快捷键可以插入标记。** 拖放与 `execCommand` 不再受约束。

因此后备方案需要三道防线：`onPaste` 读 `text/plain` 并插入、`onDrop` 被阻止或规范化、`beforeinput` 取消 `format*` 与 `insertFromDrop`。字段维持 `white-space: pre-wrap`，保存路径规范化 CRLF 与不换行空格，服务器拒绝标记。后备方案是兼容层，不是第二个编辑器。

## React 负责挂载，浏览器负责光标

`contentEditable` 元素不管 React 怎么想，都是非受控的。React 无法让用户的编辑与 `children` 保持一致；它自己的文档就警告，用户编辑后“将无法更新其内容”。`suppressContentEditableWarning` 只是让警告闭嘴，并没有转移所有权。

可行的模式是：

- 只渲染一次初始文本，或在 layout effect 中设置。
- 通过 ref 管理 DOM。
- 不要把每个 `input` 事件都反馈到 `children`。那会替换文本节点并让光标塌陷。
- 外部值变更时，只在元素没有焦点时写入。
- 如果服务器更新必须在聚焦时落地，保存并恢复选区的偏移量，或把写入延后到失焦。

其他 React 陷阱比较小，但很尖锐：

**输入法。** 中文、日文、韩文输入会触发组字事件。用 ref 追踪 `compositionstart` 与 `compositionend`，组字期间不要在 Enter 时提交。Safari 历来会在负责提交的 Enter keydown 之前先触发 `compositionend`，所以要检查 `nativeEvent.isComposing`、`keyCode === 229`，以及你自己的组字标志。如果组字中途收到失焦，延后处理，等组字结束再提交。

**beforeinput。** React 的 `onBeforeInput` 是 polyfill，无法可靠地暴露 `inputType` 或 `data`。如果你需要取消格式，通过 ref 挂上原生监听器。不是每种编辑都会触发 `beforeinput`，而输入法、自动填充与拼写检查的编辑可能无法取消，所以要在 `input` 与提交时做规范化，当作最后防线。

**按键与空状态。** 单行字段在 Enter 时提交并失焦。多行字段在 Enter 时插入换行，在 Cmd/Ctrl+Enter 时提交。Escape 恢复上次保存的值并失焦，不保存。浏览器会在“空”元素里留下一个填充用的 `<br>`，所以 `:empty` 不可靠；用 `innerText.trim()` 追踪空状态，并以 `::before` 渲染占位文本。

**无障碍。** 使用 `role="textbox"`、`aria-multiline`，以及 `aria-label` 或 `aria-labelledby`。`<label for>` 对 `div` 没有作用。视情况加上 `tabIndex={0}`、`lang`、`dir="auto"`、`spellCheck`、`aria-invalid` 与 `aria-describedby`。保存后保留同一个节点，让焦点与键盘流程得以延续。

## 保存路径，一步一步来

编辑器刻意保持精简。工作由保存路径以七个步骤完成：

1. **EditableText。** 在失焦或 Enter 时——且不在组字期间——调用 `onSave(newText)`。
2. **`usePageEditor().patchField`。** 把字段包成区块 patch，例如 `{ translations: { "zh-TW": { title } } }`。深度合并；替换 `translations` 会抹掉 body 与其他所有语言版本。
3. **`useSaver().run`。** 把状态设为保存中并应用乐观缓存更新。右下角的状态提示是 live region，不是 toast。
4. **`versionedWrite("block:<id>", version, …)`。** 逐区块排入写入。下一次写入会等前一个响应，并采用它的新版本。
5. **`adminApi.patchBlock(id, { …, version })`。** 带着队列目前认可的版本，发送 `PATCH /api/admin/blocks/{id}`。
6. **`apiFetch`。** 同源 `fetch`，加上 `credentials: "same-origin"`，让 session cookie 一起发送。检查 `response.ok`；解析错误 body 以区分 `409` 与 `422`。
7. **TanStack Query。** 成功时，用服务器的区块 `setQueryData`，让 UI 显示规范值。失败时，恢复字段快照并标记保存失败。`invalidateQueries` 是给派生列表与搜索用的，不是给你刚写入的区块。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">保存路径 // 01</span>
    <h3 class="mfig-fig-title">从失焦的字段到缓存条目，共七步</h3>
    <p class="mfig-fig-sub">组件提交文本，页面编辑器把字段整理成 patch，保存逻辑负责状态，队列负责版本顺序。API 与缓存是最后两步。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 390" role="img" aria-labelledby="ce-f1-title ce-f1-desc">
    <title id="ce-f1-title">七步行内保存流水线</title>
    <desc id="ce-f1-desc">EditableText 在失焦或 Enter 时提交；patchField 建立只含翻译的 patch；useSaver 设置状态与乐观状态；versionedWrite 逐区块排队；adminApi.patchBlock 带着版本发送 PATCH；apiFetch 使用同源 session cookie；TanStack Query 写入服务器响应或回滚。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">从失焦到缓存 // 七个步骤</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一个字段，一个版本</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="78" class="term"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">01 · 组件</text>
    <text x="36" y="88" class="t" font-size="9.4" font-weight="800">EditableText</text>
    <text x="36" y="102" class="m" font-size="6.6">失焦或 Enter → onSave</text>
    <text x="36" y="114" class="f" font-size="6.2">组字防护</text>
    <line x1="204" y1="87" x2="222" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="48" width="180" height="78" class="box"/>
    <text x="236" y="66" class="f" font-size="6.8" letter-spacing="0.7">02 · 页面编辑器</text>
    <text x="236" y="88" class="t mono" font-size="8.6" font-weight="800">patchField</text>
    <text x="236" y="102" class="m" font-size="6.6">translations.zh-TW.title</text>
    <text x="236" y="114" class="f" font-size="6.2">深度合并，不是替换</text>
    <line x1="404" y1="87" x2="422" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="48" width="180" height="78" class="term"/>
    <text x="436" y="66" class="f" font-size="6.8" letter-spacing="0.7">03 · 状态</text>
    <text x="436" y="88" class="t" font-size="9.4" font-weight="800">useSaver().run</text>
    <text x="436" y="102" class="m" font-size="6.6">保存中 → 已保存 / 失败</text>
    <text x="436" y="114" class="f" font-size="6.2">乐观缓存写入</text>
    <line x1="604" y1="87" x2="622" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="48" width="180" height="78" class="codebox"/>
    <text x="636" y="66" class="f" font-size="6.8" letter-spacing="0.7">04 · 顺序</text>
    <text x="636" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="636" y="102" class="m" font-size="6.6">block:&lt;id&gt;</text>
    <text x="636" y="114" class="f" font-size="6.2">逐键串行队尾</text>
    <line x1="714" y1="126" x2="714" y2="160" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="162" width="180" height="78" class="box"/>
    <text x="636" y="180" class="f" font-size="6.8" letter-spacing="0.7">05 · API 客户端</text>
    <text x="636" y="202" class="t mono" font-size="8" font-weight="800">patchBlock</text>
    <text x="636" y="216" class="m" font-size="6.6">PATCH /api/admin/blocks/:id</text>
    <text x="636" y="228" class="f" font-size="6.2">+ 版本</text>
    <line x1="624" y1="201" x2="606" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="162" width="180" height="78" class="term"/>
    <text x="436" y="180" class="f" font-size="6.8" letter-spacing="0.7">06 · 传输</text>
    <text x="436" y="202" class="t mono" font-size="8.6" font-weight="800">apiFetch</text>
    <text x="436" y="216" class="m" font-size="6.6">credentials: same-origin</text>
    <text x="436" y="228" class="f" font-size="6.2">session cookie · res.ok</text>
    <line x1="424" y1="201" x2="406" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="162" width="180" height="78" class="box"/>
    <text x="236" y="180" class="f" font-size="6.8" letter-spacing="0.7">07 · 缓存</text>
    <text x="236" y="202" class="t" font-size="9.4" font-weight="800">TanStack Query</text>
    <text x="236" y="216" class="m" font-size="6.6">setQueryData(server)</text>
    <text x="236" y="228" class="f" font-size="6.2">失败时回滚</text>
    <line x1="24" y1="266" x2="816" y2="266" class="dash"/>
    <text x="24" y="288" class="f" font-size="6.6" letter-spacing="0.5">成功 → 写入服务器值 · 409 → 以新版本为基础或显示冲突 · 422 → 保留草稿 · 网络 → 重试</text>
    <text x="24" y="310" class="f" font-size="6.6" letter-spacing="0.5">队列在执行时读取最新认可的版本，而不是入列时捕捉的版本</text>
    <text x="24" y="332" class="f" font-size="6.2">每个区块：一个进行中写入 + 一个合并后的待处理写入</text>
    <text x="816" y="332" class="f" font-size="6.2" text-anchor="end">让列表失效，不是你刚写入的区块</text>
  </svg>
  </div>
  <p class="mfig-fig-src">提交 → 字段 PATCH → 状态 → 队列 → PATCH → 缓存</p>
</figure>

## 为什么需要队列

没有队列时，两次快速编辑会产生两个 PATCH，两者都带着版本 7。服务器接受第一个并返回 8。第二个仍说 7，所以服务器正确地返回 `409 Conflict`。用户没有和任何人冲突；客户端和自己冲突。

逐键队列让第二次写入等待第一个响应并采用其版本，从而修正这个问题。微妙之处在于版本从哪里来：

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

如果 `write` 闭包捕获了调用方的 `baseVersion`，排队的请求仍会发送过期的数字。这个参数只是为新队列提供起始版本；每次执行都必须读 `q.version`。这就是“真的能用”的队列与“看起来能用”的队列之间的差别。

合并是另一半。每个区块一个进行中写入加上一个最新的待处理写入就够了。如果每次按键都排入一个 PATCH，打字快的人会产生一长串请求，唯一的目的就是被覆写。如果你用自动保存，防抖 500–800 ms；在失焦或 Enter 时立刻发送；而且永远不要在组字期间防抖。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">队列 // 02</span>
    <h3 class="mfig-fig-title">自我冲突与序列版本串联</h3>
    <p class="mfig-fig-sub">三次针对同一版本的编辑，不是相互竞争，就是排队。队列把第二与第三个 PATCH 变成接下来的版本，而不是 409 响应。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 330" role="img" aria-labelledby="ce-f2-title ce-f2-desc">
    <title id="ce-f2-title">并发写入与逐键队列</title>
    <desc id="ce-f2-desc">没有队列时，三次编辑都发送 v7；只有第一个成功，另外两个收到 409。有队列时，第一个发送 7 并返回 8，第二个发送 8 并返回 9，第三个发送 9 并返回 10。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">三次编辑 // 两种结果</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">同一个区块，同一个用户</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="56" class="f" font-size="7" letter-spacing="0.8">没有队列 // 三次都送 v7</text>
    <rect x="24" y="68" width="150" height="54" class="term"/>
    <text x="36" y="86" class="f" font-size="6.4">编辑 01</text>
    <text x="36" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="95" x2="196" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="68" width="130" height="54" class="box"/>
    <text x="210" y="86" class="f" font-size="6.4">服务器</text>
    <text x="210" y="104" class="t" font-size="8.2" font-weight="800">200 → v8</text>
    <rect x="352" y="68" width="150" height="54" class="term"/>
    <text x="364" y="86" class="f" font-size="6.4">编辑 02</text>
    <text x="364" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="502" y1="95" x2="524" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="526" y="68" width="130" height="54" class="box"/>
    <text x="538" y="86" class="f" font-size="6.4">服务器</text>
    <text x="538" y="104" class="t" font-size="8.2" font-weight="800">409 ×</text>
    <rect x="680" y="68" width="136" height="54" class="term"/>
    <text x="692" y="86" class="f" font-size="6.4">编辑 03</text>
    <text x="692" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7 → 409</text>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <text x="24" y="176" class="f" font-size="7" letter-spacing="0.8">有队列 // 每次写入采用已认可的版本</text>
    <rect x="24" y="188" width="150" height="54" class="term"/>
    <text x="36" y="206" class="f" font-size="6.4">编辑 01</text>
    <text x="36" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="215" x2="196" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="188" width="130" height="54" class="box"/>
    <text x="210" y="206" class="f" font-size="6.4">200</text>
    <text x="210" y="224" class="t" font-size="8.2" font-weight="800">v8</text>
    <line x1="328" y1="215" x2="352" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="354" y="188" width="150" height="54" class="codebox"/>
    <text x="366" y="206" class="f" font-size="6.4">编辑 02</text>
    <text x="366" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v8</text>
    <line x1="504" y1="215" x2="526" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="528" y="188" width="130" height="54" class="box"/>
    <text x="540" y="206" class="f" font-size="6.4">200</text>
    <text x="540" y="224" class="t" font-size="8.2" font-weight="800">v9</text>
    <line x1="658" y1="215" x2="680" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="682" y="188" width="134" height="54" class="codebox"/>
    <text x="694" y="206" class="f" font-size="6.4">编辑 03</text>
    <text x="694" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v9</text>
    <rect x="24" y="268" width="792" height="34" class="term"/>
    <text x="36" y="289" class="f" font-size="6.6" letter-spacing="0.6">一个进行中 + 一个合并待处理 · 队列是逐区块，不是全域 · 409 仍代表有外部写入者</text>
  </svg>
  </div>
  <p class="mfig-fig-src">没有队列：200 · 409 · 409 — 有队列：200 · 200 · 200</p>
</figure>

## 服务器仍然掌握版本

队列只协调一个客户端。另一个标签页、第二位管理员，或一个 MCP 工具，都可能在这两个请求之间写入。服务器必须执行原子性的 compare-and-swap：

```sql
UPDATE content_blocks
SET version = version + 1, updated_at = now()
WHERE id = $1 AND version = $2
RETURNING version;
```

如果返回零列，返回 `409` 与当前的表示。客户端接着可以把编辑过的字段与它的基准比较：如果没有人改过那个字段，就以新版本为基础重试一次。如果有人改过，显示冲突，而不是猜测。

客户端的 `version` 不是安全控制。它是协调提示。授权、验证与发布规则仍在服务器上对每个请求执行，不论请求从哪扇门进来。

## 失败、回滚与状态提示

乐观 UI 是缓存在服务器同意之前先做出的承诺。安全顺序是：

1. 对该区块 `cancelQueries`。
2. 快照字段目前的缓存值。
3. 用新值 `setQueryData`。
4. 成功时，用服务器的规范区块 `setQueryData`。
5. 失败时，只恢复尝试的字段——不是整个区块，因为其中可能有另一个字段较新的成功编辑。

失败时把用户的文本留在编辑器里。回滚缓存与只读视图；不要抹掉他们输入的内容。把字段标记为无效并提供“重试”，重试会发送最新文本，不是失败的快照。

状态提示应该放在 provider 里，才能在编辑器卸载后存活。给它 `role="status"` 与 `aria-live="polite"`，“保存中…”至少显示 300 ms 以避免闪烁，“已保存”则停留几秒。它是状态，不是 toast，而且永远不该抢走焦点。

有几种失败模式值得明确处理：

| 失败 | 响应 |
| :--- | :--- |
| 响应遗失后的 `409` | 用 idempotency key 重试，或重新抓取、以新版本为基础并询问 |
| `422` 验证 | 保留草稿，设置 `aria-invalid`，显示字段错误 |
| `401` session 过期 | 保留草稿，重新认证，重试 |
| 网络离线 | 暂停 mutation，重连后恢复，不要空转 |
| 保存期间卸载 | 让请求完成；保存逻辑位于编辑器之上 |
| 有未保存文本时导航 | 路由拦截器加草稿，不是只有 `beforeunload` |

`beforeunload` 在移动设备上不可靠，而 `fetch(..., { keepalive: true })` 的 body 上限是 64 KiB。在 localStorage 里放一份小草稿，比一个用户可能永远看不到的对话框更可靠。

## 检查清单

- [ ] 用 `setAttribute` 对 `plaintext-only` 做特性检测；回退到 `true` 时加上粘贴、拖放与 `beforeinput` 防线。
- [ ] 读 `innerText`，规范化 CRLF 与 NBSP，设置 `white-space: pre-wrap`，保存纯文本。
- [ ] 让 DOM 保持非受控；聚焦时永不写入；不要每次 input 都重新渲染 `children`。
- [ ] 防护输入法组字，包括 Safari 的事件顺序；组字中途延后失焦保存。
- [ ] 逐字段定义 Enter、Shift+Enter、Escape 与失焦行为；Escape 时恢复。
- [ ] `role="textbox"`、`aria-multiline`、label、`lang`、`aria-invalid`、placeholder。
- [ ] 逐区块队列在执行时读取最新认可版本；合并待处理写入。
- [ ] 服务器做原子 compare-and-swap；`409` 返回目前状态。
- [ ] 深度合并字段 patch；永远不要替换 `translations` 对象。
- [ ] 重试要有 idempotency key；不要盲目重试 `409`、`401` 或 `422`。
- [ ] `cancelQueries` → 快照 → 乐观写入；只回滚尝试的字段。
- [ ] 状态 live region、重试、冲突 UI、草稿持久化、焦点返回。
- [ ] 测试 Chrome、Safari、Firefox、中文输入法、从 Word/Docs 粘贴、离线、两个标签页、慢网络、卸载。

整个设计的重点是：浏览器本来就擅长编辑，服务器本来就擅长版本。组件不该试图成为其中任何一个。它应该读纯文本、在意图明确时提交，然后把写入交给一个知道下一个版本是什么的队列。

## 参考资料

- [WHATWG HTML: `contenteditable`](https://html.spec.whatwg.org/multipage/interaction.html#attr-contenteditable) — 属性值与编辑模型。
- [MDN: `contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable) — 行为与兼容性说明。
- [MDN: `HTMLElement.contentEditable`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable) — IDL setter 行为。
- [web-features: `contenteditable=plaintext-only`](https://web-platform-dx.github.io/web-features-explorer/features/contenteditable-plaintextonly) — Baseline 状态。
- [web.dev: plaintext-only Baseline](https://web.dev/blog/contenteditable-plaintext-only-baseline) — 支持时间线。
- [Firefox 136 release notes](https://www.mozilla.org/en-US/firefox/136.0/releasenotes/) — `plaintext-only` 支持。
- [MDN: `beforeinput`](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) — 可取消的输入类型。
- [MDN: `innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) — 渲染文本与换行。
- [React: common props](https://react.dev/reference/react-dom/components/common) — `contentEditable` 与 `suppressContentEditableWarning`。
- [WAI-ARIA: textbox](https://www.w3.org/TR/wai-aria-1.2/#textbox) — 角色与状态。
- [TanStack Query: optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) — 快照、回滚与缓存写入。
- [TanStack Query: invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — 何时重新抓取。
- [RFC 9110 §15.5.10](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.10) — `409 Conflict`。
- [RFC 7386](https://www.rfc-editor.org/rfc/rfc7386) — JSON Merge Patch。
- [Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) — 安全重试。
