---
title: "A Page You Can Edit by Typing"
description: "A live, front-end-only demo of a title and body you can edit by typing — plus the browser support, React traps, and save queue behind a reliable contentEditable editor."
pubDate: 2026-11-25
category: "Web"
tags: ["contentEditable", "React", "TanStack Query", "UX", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "12 min read"
cardImage: "./cover.webp"
cardImageAlt: "Official Baseline graphic for the contenteditable plaintext-only attribute value combination"
---

# A Page You Can Edit by Typing

Try it before reading the argument. Click the title or the body and type. This is a front-end-only component: no save request, no database, no framework.

<section class="ce-demo" aria-labelledby="ce-demo-label">
  <div class="ce-demo-head">
    <span class="card-tag" id="ce-demo-label">LIVE DEMO // 00</span>
    <span class="ce-demo-hint">CLICK + TYPE · LOCAL ONLY</span>
  </div>
  <div class="ce-demo-page">
    <div class="ce-demo-title" contenteditable="plaintext-only" data-ce-demo="title" spellcheck="false" role="textbox" aria-multiline="false" aria-label="Demo article title">A Page You Can Edit by Typing</div>
    <div class="ce-demo-body" contenteditable="plaintext-only" data-ce-demo="body" spellcheck="false" role="textbox" aria-multiline="true" aria-label="Demo article body"><p>This is the body. Put the caret here and type. Paste keeps plain text; it does not carry Word or Google Docs styling.</p><p>There is no save button. Reload the page and it resets.</p></div>
    <div class="ce-demo-status">CONTENTEDITABLE="PLAINTEXT-ONLY" · NO SAVE · NO BACKEND</div>
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

<p class="mfig-bridge">The demo is the smallest version of the idea. The rest of this article is why it is harder than it looks once the text has to be saved, and what the browser does not guarantee.</p>

<figure class="fig">
  <img src="/images/contenteditable-save-pipeline/devtools-plaintext-only.webp" alt="Chrome DevTools Elements panel showing a div with contenteditable=plaintext-only and a textarea whose editable surface is a div inside a user-agent shadow root" width="625" height="167" loading="lazy" />
  <figcaption><b>Official figure</b> — Chrome DevTools shows a <code>contenteditable="plaintext-only"</code> div beside a textarea's user-agent shadow root. The editing surface is a div in both cases; the attribute changes behavior, not the element type. Source: <a href="https://web.dev/blog/contenteditable-plaintext-only-baseline">web.dev</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

## The editor should be the smallest part

A content management screen has a temptation built into it: install a rich-text editor, model the document as a tree, and let the framework own selection, history, paste, and save. For a page of titles, captions, and short body fields, that is a large amount of machinery for a small amount of text.

The alternative is the browser's own editing primitive. `contentEditable` is old, unglamorous, and already handles the caret, selection, undo, IME, spellcheck, and mobile keyboards. If the field is plain text, the browser can be the editor. The application only has to own three things: what "plain text" means, when to commit, and how to save without racing itself.

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">INLINE EDITING // 00</span>
    <p class="mfig-lead-kicker">A CMS field does not need a document model. It needs plain text and a save contract.</p>
    <h3 class="mfig-lead-title">Edit like a text field. Save like a database.</h3>
    <p class="mfig-lead-sub">Native contentEditable keeps the caret; a per-block queue keeps the version.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg></div>
      <div class="mfig-tag">PLAINTEXT // ONLY</div>
      <h4>The browser strips the markup</h4>
      <p>Paste becomes text; no pasted spans, no hidden styling, no document tree.</p>
      <div class="mfig-meta">PASTE · ENTER · IME</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg></div>
      <div class="mfig-tag">BLUR // SAVE</div>
      <h4>Commit on intent</h4>
      <p>Blur or Enter saves; Escape restores; composition waits until the IME is done.</p>
      <div class="mfig-meta">ONBLUR · ENTER · ESC</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg></div>
      <div class="mfig-tag">VERSION // QUEUE</div>
      <h4>One write at a time</h4>
      <p>The next PATCH waits for the previous response and adopts its version.</p>
      <div class="mfig-meta">409 · RETRY · ROLLBACK</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="ce-lead-title ce-lead-desc">
    <title id="ce-lead-title">The inline save path</title>
    <desc id="ce-lead-desc">An edit commits on blur, the page editor wraps the field into a translation patch, the saver reports status, a per-block queue chains the version, the API patches the block, and TanStack Query updates or rolls back the cache.</desc>
    <defs>
      <marker id="ce-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE FIELD // ONE PATCH // ONE VERSION</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">THE SAVE PATH</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">EDIT</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">BLUR / ENTER</text>
    <text x="34" y="100" class="m" font-size="6.8">onSave(text)</text>
    <text x="34" y="112" class="f" font-size="6.2">IME waits</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="codebox"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="M8 12h8"/><path d="M8 16h6"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">WRAP</text>
    <text x="172" y="88" class="t mono" font-size="8.4" font-weight="800">patchField</text>
    <text x="172" y="100" class="m" font-size="6.8">translations.zh-TW</text>
    <text x="172" y="112" class="f" font-size="6.2">title only</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="term"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">STATUS</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">useSaver</text>
    <text x="310" y="100" class="m" font-size="6.8">saving · saved</text>
    <text x="310" y="112" class="f" font-size="6.2">failed · retry</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="box"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">QUEUE</text>
    <text x="448" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="448" y="100" class="m" font-size="6.8">block:&lt;id&gt;</text>
    <text x="448" y="112" class="f" font-size="6.2">per-key tail</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="codebox"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">HTTP</text>
    <text x="586" y="88" class="t mono" font-size="8.2" font-weight="800">PATCH /blocks</text>
    <text x="586" y="100" class="m" font-size="6.8">+ version</text>
    <text x="586" y="112" class="f" font-size="6.2">same-origin cookie</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#ce-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">CACHE</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">TANSTACK</text>
    <text x="724" y="100" class="m" font-size="6.8">setQueryData</text>
    <text x="724" y="112" class="f" font-size="6.2">or rollback</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">THE EDITOR IS SMALL ON PURPOSE · THE SAVE PATH IS WHERE THE RIGOR LIVES</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>The editor is small on purpose.</b> The save path is where the rigor lives.</p>
</section>

<p class="mfig-bridge">The rest of this article is what the browser actually guarantees, how to wire React around it, and why the seven-step save path needs a queue at all.</p>

## What plaintext-only actually promises

`contenteditable` is an enumerated attribute with three meaningful values: `true`, `false`, and `plaintext-only`. The last one makes the element's raw text editable and disables rich formatting. Paste is stripped to text, and the browser stops offering bold, italic, and the rest of the formatting toolbar.

That is the promise. The details are thinner than they look.

The HTML specification does not standardize the DOM that Enter or paste produces. Chrome treats Enter as a line break and inserts `\n`, and it forces a preformatted `white-space` on the element. Firefox 136+ inserts `\n` only when `white-space` is preformatted; otherwise it inserts `<br>`. Safari has historically used `<br>`. The practical rule is: never parse `innerHTML`; read `innerText` and set `white-space: pre-wrap` yourself.

`plaintext-only` is also not a sanitizer. The `paste` event can still expose `text/html`, and `execCommand("insertHTML")` can still insert markup. The attribute constrains the editing UI, not every code path that can touch the DOM. Store plain text, validate plain text on the server, and render it as text — never as HTML.

Support is now broad enough to use, with a fallback:

| Browser | `plaintext-only` | Notes |
| :--- | :--- | :--- |
| Chrome | 51+ | Forces preformatted whitespace; Enter inserts LF |
| Edge | Chromium 79+ | Follows Chromium behavior |
| Safari / iOS Safari | 5.1+ | Historically `<br>`; read `innerText` |
| Firefox | 136+ | Since March 2025; `<br>` unless `white-space: pre` |

Baseline reports `plaintext-only` as newly available since March 2025, with "widely available" projected for September 2027. All current releases support it. The fallback matters for old Firefox ESR, embedded WebViews, and whatever browser a client's procurement team standardized on five years ago.

Feature-detect with `setAttribute`, not the IDL setter. Assigning an invalid value to `el.contentEditable` can throw:

```ts
const supportsPlaintext = () => {
  const el = document.createElement("div");
  el.setAttribute("contenteditable", "plaintext-only");
  return el.contentEditable === "plaintext-only";
};
```

In an SSR app, render `contentEditable={true}` first and upgrade after mount. Rendering `plaintext-only` on the server and `true` on an old client produces a hydration mismatch, and rendering nothing produces a field that cannot be edited until JavaScript loads.

## The fallback: true plus three guards

When the feature is missing, `contentEditable="true"` changes three behaviors:

1. **Paste keeps HTML.** A paste from Word or Google Docs arrives with spans and styles.
2. **Enter creates block elements.** You get `<div>`, `<p>`, or `<br>` instead of a predictable newline.
3. **Drops and shortcuts can insert markup.** Drag-and-drop and `execCommand` are no longer constrained.

The fallback therefore needs three guards: `onPaste` reads `text/plain` and inserts it, `onDrop` is prevented or normalized, and `beforeinput` cancels `format*` and `insertFromDrop`. The field keeps `white-space: pre-wrap`, the save path normalizes CRLF and non-breaking spaces, and the server rejects markup. The fallback is a compatibility layer, not a second editor.

## React owns the mount, the browser owns the caret

A `contentEditable` element is uncontrolled whether React thinks so or not. React cannot reconcile user edits with `children`; its own documentation warns that it "will not be able to update its content after user edits." `suppressContentEditableWarning` silences the warning; it does not transfer ownership.

The working pattern is:

- Render the initial text once, or set it in a layout effect.
- Manage the DOM through a ref.
- Do not feed every `input` event back into `children`. That replaces text nodes and collapses the caret.
- When an external value changes, write only if the element is not focused.
- If a server update must land while focused, save and restore the selection offsets, or defer the write to blur.

The other React traps are smaller but sharp:

**IME.** Chinese, Japanese, and Korean input fires composition events. Track `compositionstart` and `compositionend` in a ref, and do not commit on Enter while composing. Safari has historically fired `compositionend` before the committing Enter keydown, so check `nativeEvent.isComposing`, `keyCode === 229`, and your own composition flag. If a blur arrives mid-composition, defer it and commit when composition ends.

**beforeinput.** React's `onBeforeInput` is a polyfill and does not reliably expose `inputType` or `data`. If you need to cancel formatting, attach a native listener through the ref. Not every edit fires `beforeinput`, and IME, autofill, and spellcheck edits may be non-cancelable, so normalize on `input` and on commit as the backstop.

**Keys and empty state.** A single-line field commits on Enter and blurs. A multiline field inserts a newline on Enter and commits on Cmd/Ctrl+Enter. Escape restores the last saved value and blurs without saving. Browsers leave a padding `<br>` in an "empty" element, so `:empty` is unreliable; track emptiness from `innerText.trim()` and render a placeholder with `::before`.

**Accessibility.** Use `role="textbox"`, `aria-multiline`, and `aria-label` or `aria-labelledby`. A `<label for>` does not work on a `div`. Add `tabIndex={0}`, `lang`, `dir="auto"`, `spellCheck`, `aria-invalid`, and `aria-describedby` where they apply. Keep the same node after save so focus and keyboard flow survive.

## The save path, step by step

The editor is deliberately thin. The save path does the work in seven steps:

1. **EditableText.** On blur or Enter — and not during composition — call `onSave(newText)`.
2. **`usePageEditor().patchField`.** Wrap the field into a block patch such as `{ translations: { "zh-TW": { title } } }`. Deep-merge it; replacing `translations` would wipe the body and every other locale.
3. **`useSaver().run`.** Set the status to saving and apply the optimistic cache update. The status pill in the bottom-right is a live region, not a toast.
4. **`versionedWrite("block:<id>", version, …)`.** Queue the write per block. The next write waits for the previous response and adopts its new version.
5. **`adminApi.patchBlock(id, { …, version })`.** Send `PATCH /api/admin/blocks/{id}` with the version the queue currently acknowledges.
6. **`apiFetch`.** A same-origin `fetch` with `credentials: "same-origin"` so the session cookie travels. Check `response.ok`; parse the error body for `409` versus `422`.
7. **TanStack Query.** On success, `setQueryData` with the server's block so the UI shows the canonical value. On failure, restore the field snapshot and mark the save failed. `invalidateQueries` is for derived lists and search, not for the block you just wrote.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE SAVE PATH // 01</span>
    <h3 class="mfig-fig-title">Seven steps from a blurred field to a cache entry</h3>
    <p class="mfig-fig-sub">The component commits text, the page editor shapes a field patch, the saver owns status, and the queue owns version order. The API and the cache are the last two steps.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 390" role="img" aria-labelledby="ce-f1-title ce-f1-desc">
    <title id="ce-f1-title">The seven-step inline save pipeline</title>
    <desc id="ce-f1-desc">EditableText commits on blur or Enter; patchField builds a translations patch; useSaver sets status and optimistic state; versionedWrite queues per block; adminApi.patchBlock sends PATCH with the version; apiFetch uses the same-origin session cookie; TanStack Query writes the server response or rolls back.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">FROM BLUR TO CACHE // SEVEN STEPS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE FIELD, ONE VERSION</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="78" class="term"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">01 · COMPONENT</text>
    <text x="36" y="88" class="t" font-size="9.4" font-weight="800">EditableText</text>
    <text x="36" y="102" class="m" font-size="6.6">blur or Enter → onSave</text>
    <text x="36" y="114" class="f" font-size="6.2">composition guard</text>
    <line x1="204" y1="87" x2="222" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="48" width="180" height="78" class="box"/>
    <text x="236" y="66" class="f" font-size="6.8" letter-spacing="0.7">02 · PAGE EDITOR</text>
    <text x="236" y="88" class="t mono" font-size="8.6" font-weight="800">patchField</text>
    <text x="236" y="102" class="m" font-size="6.6">translations.zh-TW.title</text>
    <text x="236" y="114" class="f" font-size="6.2">deep merge, not replace</text>
    <line x1="404" y1="87" x2="422" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="48" width="180" height="78" class="term"/>
    <text x="436" y="66" class="f" font-size="6.8" letter-spacing="0.7">03 · STATUS</text>
    <text x="436" y="88" class="t" font-size="9.4" font-weight="800">useSaver().run</text>
    <text x="436" y="102" class="m" font-size="6.6">saving → saved / failed</text>
    <text x="436" y="114" class="f" font-size="6.2">optimistic cache write</text>
    <line x1="604" y1="87" x2="622" y2="87" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="48" width="180" height="78" class="codebox"/>
    <text x="636" y="66" class="f" font-size="6.8" letter-spacing="0.7">04 · ORDER</text>
    <text x="636" y="88" class="t mono" font-size="8" font-weight="800">versionedWrite</text>
    <text x="636" y="102" class="m" font-size="6.6">block:&lt;id&gt;</text>
    <text x="636" y="114" class="f" font-size="6.2">per-key serial tail</text>
    <line x1="714" y1="126" x2="714" y2="160" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="624" y="162" width="180" height="78" class="box"/>
    <text x="636" y="180" class="f" font-size="6.8" letter-spacing="0.7">05 · API CLIENT</text>
    <text x="636" y="202" class="t mono" font-size="8" font-weight="800">patchBlock</text>
    <text x="636" y="216" class="m" font-size="6.6">PATCH /api/admin/blocks/:id</text>
    <text x="636" y="228" class="f" font-size="6.2">+ version</text>
    <line x1="624" y1="201" x2="606" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="424" y="162" width="180" height="78" class="term"/>
    <text x="436" y="180" class="f" font-size="6.8" letter-spacing="0.7">06 · TRANSPORT</text>
    <text x="436" y="202" class="t mono" font-size="8.6" font-weight="800">apiFetch</text>
    <text x="436" y="216" class="m" font-size="6.6">credentials: same-origin</text>
    <text x="436" y="228" class="f" font-size="6.2">session cookie · res.ok</text>
    <line x1="424" y1="201" x2="406" y2="201" class="arrow" marker-end="url(#ce-f1-arrow)"/>
    <rect x="224" y="162" width="180" height="78" class="box"/>
    <text x="236" y="180" class="f" font-size="6.8" letter-spacing="0.7">07 · CACHE</text>
    <text x="236" y="202" class="t" font-size="9.4" font-weight="800">TanStack Query</text>
    <text x="236" y="216" class="m" font-size="6.6">setQueryData(server)</text>
    <text x="236" y="228" class="f" font-size="6.2">rollback on failure</text>
    <line x1="24" y1="266" x2="816" y2="266" class="dash"/>
    <text x="24" y="288" class="f" font-size="6.6" letter-spacing="0.5">SUCCESS → SET THE SERVER VALUE · 409 → REBASE OR SHOW CONFLICT · 422 → KEEP THE DRAFT · NETWORK → RETRY</text>
    <text x="24" y="310" class="f" font-size="6.6" letter-spacing="0.5">THE QUEUE READS THE LATEST ACKNOWLEDGED VERSION AT EXECUTION TIME, NOT THE VERSION CAPTURED AT ENQUEUE</text>
    <text x="24" y="332" class="f" font-size="6.2">ONE IN-FLIGHT WRITE + ONE COALESCED PENDING WRITE PER BLOCK</text>
    <text x="816" y="332" class="f" font-size="6.2" text-anchor="end">INVALIDATE LISTS, NOT THE BLOCK YOU JUST WROTE</text>
  </svg>
  </div>
  <p class="mfig-fig-src">COMMIT → PATCH FIELD → STATUS → QUEUE → PATCH → CACHE</p>
</figure>

## Why the queue exists

Without a queue, two quick edits produce two PATCHes that both carry version 7. The server accepts the first and returns 8. The second still says 7, so the server correctly returns `409 Conflict`. The user did not conflict with anyone; the client conflicted with itself.

A per-key queue fixes that by making the second write wait for the first response and adopt its version. The subtle part is where the version comes from:

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

If `write` closes over the caller's `baseVersion`, the queued request still sends the stale number. The argument only seeds a new queue; each execution must read `q.version`. That is the difference between a queue that works and a queue that looks like it works.

Coalescing is the second half. One in-flight write plus one latest pending write per block is enough. If every keystroke enqueues a PATCH, a fast typist creates a long chain of requests whose only purpose is to be overwritten. Debounce 500–800 ms if you autosave, flush on blur or Enter, and never debounce through composition.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE QUEUE // 02</span>
    <h3 class="mfig-fig-title">Self-conflict versus serial version chaining</h3>
    <p class="mfig-fig-sub">Three edits against the same version either race or queue. The queue turns the second and third PATCH into the next versions instead of 409 responses.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 330" role="img" aria-labelledby="ce-f2-title ce-f2-desc">
    <title id="ce-f2-title">Concurrent writes versus a per-key queue</title>
    <desc id="ce-f2-desc">Without a queue, three edits all send version 7; only the first succeeds and the other two receive 409. With a queue, the first sends 7 and returns 8, the second sends 8 and returns 9, and the third sends 9 and returns 10.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">THREE EDITS // TWO OUTCOMES</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">SAME BLOCK, SAME USER</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="56" class="f" font-size="7" letter-spacing="0.8">WITHOUT QUEUE // ALL THREE SEND v7</text>
    <rect x="24" y="68" width="150" height="54" class="term"/>
    <text x="36" y="86" class="f" font-size="6.4">EDIT 01</text>
    <text x="36" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="95" x2="196" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="68" width="130" height="54" class="box"/>
    <text x="210" y="86" class="f" font-size="6.4">SERVER</text>
    <text x="210" y="104" class="t" font-size="8.2" font-weight="800">200 → v8</text>
    <rect x="352" y="68" width="150" height="54" class="term"/>
    <text x="364" y="86" class="f" font-size="6.4">EDIT 02</text>
    <text x="364" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="502" y1="95" x2="524" y2="95" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="526" y="68" width="130" height="54" class="box"/>
    <text x="538" y="86" class="f" font-size="6.4">SERVER</text>
    <text x="538" y="104" class="t" font-size="8.2" font-weight="800">409 ×</text>
    <rect x="680" y="68" width="136" height="54" class="term"/>
    <text x="692" y="86" class="f" font-size="6.4">EDIT 03</text>
    <text x="692" y="104" class="t mono" font-size="8.2" font-weight="800">PATCH v7 → 409</text>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <text x="24" y="176" class="f" font-size="7" letter-spacing="0.8">WITH QUEUE // EACH WRITE ADOPTS THE ACKNOWLEDGED VERSION</text>
    <rect x="24" y="188" width="150" height="54" class="term"/>
    <text x="36" y="206" class="f" font-size="6.4">EDIT 01</text>
    <text x="36" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v7</text>
    <line x1="174" y1="215" x2="196" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="198" y="188" width="130" height="54" class="box"/>
    <text x="210" y="206" class="f" font-size="6.4">200</text>
    <text x="210" y="224" class="t" font-size="8.2" font-weight="800">v8</text>
    <line x1="328" y1="215" x2="352" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="354" y="188" width="150" height="54" class="codebox"/>
    <text x="366" y="206" class="f" font-size="6.4">EDIT 02</text>
    <text x="366" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v8</text>
    <line x1="504" y1="215" x2="526" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="528" y="188" width="130" height="54" class="box"/>
    <text x="540" y="206" class="f" font-size="6.4">200</text>
    <text x="540" y="224" class="t" font-size="8.2" font-weight="800">v9</text>
    <line x1="658" y1="215" x2="680" y2="215" class="arrow" marker-end="url(#ce-f2-arrow)"/>
    <rect x="682" y="188" width="134" height="54" class="codebox"/>
    <text x="694" y="206" class="f" font-size="6.4">EDIT 03</text>
    <text x="694" y="224" class="t mono" font-size="8.2" font-weight="800">PATCH v9</text>
    <rect x="24" y="268" width="792" height="34" class="term"/>
    <text x="36" y="289" class="f" font-size="6.6" letter-spacing="0.6">ONE IN-FLIGHT + ONE COALESCED PENDING · THE QUEUE IS PER BLOCK, NOT GLOBAL · 409 STILL MEANS AN EXTERNAL WRITER</text>
  </svg>
  </div>
  <p class="mfig-fig-src">WITHOUT QUEUE: 200 · 409 · 409 — WITH QUEUE: 200 · 200 · 200</p>
</figure>

## The server still owns the version

The queue only coordinates one client. Another tab, a second administrator, or an MCP tool can write between two requests. The server must perform an atomic compare-and-swap:

```sql
UPDATE content_blocks
SET version = version + 1, updated_at = now()
WHERE id = $1 AND version = $2
RETURNING version;
```

If zero rows come back, return `409` with the current representation. The client can then compare the edited field with its base: if nobody changed that field, rebase onto the new version and retry once. If someone did, show the conflict instead of guessing.

The client's `version` is not a security control. It is a coordination hint. Authorization, validation, and the publish rule still run on the server for every request, whichever door it came through.

## Failure, rollback, and the status pill

Optimistic UI is a promise the cache makes before the server agrees. The safe sequence is:

1. `cancelQueries` for the block.
2. Snapshot the field's current cache value.
3. `setQueryData` with the new value.
4. On success, `setQueryData` with the server's canonical block.
5. On failure, restore only the attempted field — not the whole block, which may contain a newer successful edit from another field.

Keep the user's text in the editor on failure. Roll back the cache and the read-only view; do not erase what they typed. Mark the field invalid and offer Retry, which sends the latest text, not the failed snapshot.

The status pill belongs in a provider so it survives the editor unmounting. Give it `role="status"` and `aria-live="polite"`, keep "Saving…" visible for at least 300 ms to avoid flicker, and hold "Saved" for a couple of seconds. It is a status, not a toast, and it should never steal focus.

A few failure modes deserve explicit handling:

| Failure | Response |
| :--- | :--- |
| `409` after a lost response | Retry with an idempotency key, or refetch, rebase, and ask |
| `422` validation | Keep the draft, set `aria-invalid`, show the field error |
| `401` session expired | Preserve the draft, re-authenticate, retry |
| Network offline | Pause mutations, resume on reconnect, do not spin |
| Unmount during save | Let the request finish; the saver lives above the editor |
| Navigation with unsaved text | Router blocker plus a draft, not only `beforeunload` |

`beforeunload` is unreliable on mobile, and `fetch(..., { keepalive: true })` caps the body at 64 KiB. A small draft in local storage is a better safety net than a dialog the user may never see.

## Checklist

- [ ] Feature-detect `plaintext-only` with `setAttribute`; fall back to `true` with paste, drop, and `beforeinput` guards.
- [ ] Read `innerText`, normalize CRLF and NBSP, set `white-space: pre-wrap`, store plain text.
- [ ] Keep the DOM uncontrolled; never write while focused; do not re-render `children` on every input.
- [ ] Guard IME composition, including Safari's event ordering; defer blur-save mid-composition.
- [ ] Define Enter, Shift+Enter, Escape, and blur per field; restore on Escape.
- [ ] `role="textbox"`, `aria-multiline`, label, `lang`, `aria-invalid`, placeholder.
- [ ] Per-block queue reads the latest acknowledged version at execution; coalesce pending writes.
- [ ] Server does an atomic compare-and-swap; `409` returns the current state.
- [ ] Deep-merge field patches; never replace the `translations` object.
- [ ] Idempotency key for retries; no blind retry of `409`, `401`, or `422`.
- [ ] `cancelQueries` → snapshot → optimistic write; roll back only the attempted field.
- [ ] Status live region, retry, conflict UI, draft persistence, focus return.
- [ ] Test Chrome, Safari, Firefox, Chinese IME, paste from Word/Docs, offline, two tabs, slow network, unmount.

The point of the whole design is that the browser is already good at editing and the server is already good at versions. The component should not try to be either. It should read plain text, commit on intent, and hand the write to a queue that knows which version comes next.

## References

- [WHATWG HTML: `contenteditable`](https://html.spec.whatwg.org/multipage/interaction.html#attr-contenteditable) — the attribute values and editing model.
- [MDN: `contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable) — behavior and compatibility notes.
- [MDN: `HTMLElement.contentEditable`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable) — IDL setter behavior.
- [web-features: `contenteditable=plaintext-only`](https://web-platform-dx.github.io/web-features-explorer/features/contenteditable-plaintextonly) — Baseline status.
- [web.dev: plaintext-only Baseline](https://web.dev/blog/contenteditable-plaintext-only-baseline) — support timeline.
- [Firefox 136 release notes](https://www.mozilla.org/en-US/firefox/136.0/releasenotes/) — `plaintext-only` support.
- [MDN: `beforeinput`](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) — cancellable input types.
- [MDN: `innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) — rendered text and line breaks.
- [React: common props](https://react.dev/reference/react-dom/components/common) — `contentEditable` and `suppressContentEditableWarning`.
- [WAI-ARIA: textbox](https://www.w3.org/TR/wai-aria-1.2/#textbox) — roles and states.
- [TanStack Query: optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) — snapshot, rollback, and cache writes.
- [TanStack Query: invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — when to refetch.
- [RFC 9110 §15.5.10](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.10) — `409 Conflict`.
- [RFC 7386](https://www.rfc-editor.org/rfc/rfc7386) — JSON Merge Patch.
- [Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) — safe retries.
