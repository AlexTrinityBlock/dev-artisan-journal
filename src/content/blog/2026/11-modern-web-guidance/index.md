---
title: "Modern Web Guidance: Giving Coding Agents the Web Platform They Skip"
description: "Live demos of the native dialog, popover, auto-growing field, and exclusive accordion patterns coding agents skip — plus the open-source Modern Web Guidance skill that teaches agents to use them."
pubDate: 2026-11-22
category: "Web"
tags: ["Web Platform", "Baseline", "Coding Agents", "Tooling", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "10 min read"
cardImage: "./cover.webp"
cardImageAlt: "Logos of coding agents and IDEs that support Modern Web Guidance"
---

# Modern Web Guidance: Giving Coding Agents the Web Platform They Skip

Coding agents can produce code that works. They can also produce the code a developer would have written in 2016. The gap is often a library's worth of JavaScript versus a few lines of HTML.

Here is the same modal in both styles.

**The legacy shape**

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

**The modern shape**

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

The scroll lock is two CSS rules:

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

Nine lines, no JavaScript. The browser supplies the backdrop, focus containment, Escape, the mobile back gesture, and focus return.

Here is the same markup, running on this page. Open it, tab through it, press Escape, then reopen it and pick a button.

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
      <h3 class="mwg-demo-title">The same nine lines, running</h3>
      <p class="mwg-demo-sub">Open the dialog, tab through it, press Escape, then reopen it and pick a button.</p>
    </div>
    <div class="mwg-stage">
      <button class="mwg-btn" commandfor="confirm" command="show-modal" data-mwg-open>Delete</button>
      <span class="mwg-out" id="mwg-result">Waiting for a choice…</span>
    </div>
    <dialog id="confirm" aria-labelledby="confirm-title">
      <h2 id="confirm-title">Delete this item?</h2>
      <p>This is a native modal. The page behind it is inert, and Escape closes it.</p>
      <form method="dialog">
        <button class="mwg-btn" value="cancel" autofocus>Cancel</button>
        <button class="mwg-btn mwg-btn--ink" value="delete">Delete</button>
      </form>
    </dialog>
    <div class="mwg-src">DIALOG · INVOKER COMMANDS · HTML + CSS</div>
  </div>
</div>

The guide behind this demo is opinionated: do not add `role="dialog"`, `aria-modal`, a focus trap, an `inert` toggle, or an Escape handler to a native modal. Duplicating browser behavior can make the dialog worse.

It also replaces the old `overflow: hidden` on `body` with `overscroll-behavior: contain` on `dialog:modal` and `dialog::backdrop`. Safari does not enforce `overscroll-behavior` yet, but the modal still contains its own scroll and the page is still inert.

Invoker Commands became Baseline newly available on December 12, 2025. If your target is older, keep the same markup and load [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill) only when `commandForElement` is missing from `HTMLButtonElement.prototype`.

## Three more patterns worth stealing

### A popover is an attribute

A custom menu usually brings a click listener, an outside-click handler, careful `aria-expanded` updates, and a z-index decision. The Popover API folds most of that into markup.

```html
<button popovertarget="menu">Actions</button>

<ul id="menu" popover>
  <li><button popovertarget="menu" popovertargetaction="hide">Rename</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Duplicate</button></li>
  <li><button popovertarget="menu" popovertargetaction="hide">Archive</button></li>
</ul>
```

The trigger opens the popover. The menu items close it with `popovertargetaction="hide"`. In the basic case, there is no JavaScript to write.

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 02</span>
      <h3 class="mwg-demo-title">No click listener required</h3>
      <p class="mwg-demo-sub">The trigger and the close actions are attributes, not JavaScript.</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-popover-wrap">
        <button id="menu-btn" class="mwg-btn" popovertarget="menu">Actions</button>
        <ul id="menu" class="mwg-menu" popover>
          <li><button popovertarget="menu" popovertargetaction="hide">Rename</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">Duplicate</button></li>
          <li><button popovertarget="menu" popovertargetaction="hide">Archive</button></li>
        </ul>
      </div>
    </div>
    <div class="mwg-src">POPOVER API · DECLARATIVE CONTROL · HTML</div>
  </div>
</div>

The Popover API is Baseline newly available since January 27, 2025. Fallbacks are progressive: if the attribute is missing, the trigger simply does nothing, so keep a normal link or button path when the action is critical.

### A textarea that grows with one CSS line

The old pattern is a `scrollHeight` loop on every input event. The modern pattern is one declaration:

```css
textarea {
  field-sizing: content;
}
```

That is the whole implementation. The field starts at its natural height and grows as the user types, without a JavaScript listener or a framework render cycle.

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 03</span>
      <h3 class="mwg-demo-title">Type, and the box grows</h3>
      <p class="mwg-demo-sub">One CSS declaration replaces the old <code>scrollHeight</code> loop. The fallback only runs when the property is missing.</p>
    </div>
    <div class="mwg-stage">
      <textarea class="mwg-field" id="mwg-field" rows="2" placeholder="Type a few lines here. The field grows with the content."></textarea>
    </div>
    <div class="mwg-src">FIELD-SIZING · CSS ONLY · PROGRESSIVE ENHANCEMENT</div>
  </div>
</div>

`field-sizing: content` is the modern replacement for the old resize loop. It is CSS-only, so it does not fight the framework's render cycle or add an input listener to every field. Where it is missing, the fallback is still small.

### An exclusive accordion without a library

An accordion package usually manages open state, hides panels, and updates ARIA attributes. The `name` attribute on `details` does the exclusive part natively:

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

Opening one closes the other. That is the whole state machine.

<div class="chamfer-card-wrapper mwg-demo">
  <div class="chamfer-card-content">
    <div class="mwg-demo-head">
      <span class="card-tag">LIVE // 04</span>
      <h3 class="mwg-demo-title">One open at a time</h3>
      <p class="mwg-demo-sub">The <code>name</code> attribute makes these details exclusive. Opening one closes the other.</p>
    </div>
    <div class="mwg-stage">
      <div class="mwg-accordion">
        <details name="faq" open>
          <summary>What is Baseline?</summary>
          <p>Baseline tells you when a feature is interoperable across the major engines. It is a signal, not a guarantee that every user has it.</p>
        </details>
        <details name="faq">
          <summary>Why does the browser do it better?</summary>
          <p>Native controls already contain the focus, keyboard, and accessibility behavior that custom widgets rebuild by hand.</p>
        </details>
        <details name="faq">
          <summary>What about older browsers?</summary>
          <p>Use the feature as progressive enhancement, and load a small polyfill only when the API is missing.</p>
        </details>
      </div>
    </div>
    <div class="mwg-src">DETAILS · NAME ATTRIBUTE · HTML</div>
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
          : 'Dismissed with Escape.';
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

## Where these patterns come from

These patterns are the visible part. The harder question is how an agent finds them at the right moment, before it writes the legacy version.

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) puts an expert-written guide into the agent's context when it builds something. It is a set of skills plus a local CLI, stewarded by the Google Chrome, Microsoft Edge, Mozilla Firefox, and MDN teams. Version 1.0 shipped on [November 10, 2026](https://developer.chrome.com/blog/modern-web-guidance-v1).

The [source repository](https://github.com/GoogleChrome/modern-web-guidance-src) contains the guides, CLI, eval harness, and calibration code. The installable skill lives in the sibling [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) repository, which matters if you want to contribute or inspect a claim.

The skill tells the agent when to ask for guidance. The CLI returns one targeted Markdown file with code patterns, browser-support notes, gotchas, and fallbacks. Nothing is fine-tuned, and the agent still writes the code.

It works with any agent that supports skills, including Claude Code, Codex, and Copilot.

<figure class="fig">
  <img src="/images/modern-web-guidance/agent-marketplaces.webp" alt="Logos of coding agents and IDEs with Modern Web Guidance support: Codex, Cursor, Kimi, Google Antigravity, Grok, JetBrains WebStorm, and GitHub Copilot." width="1600" height="753" loading="lazy" />
  <figcaption><b>Official figure</b> — Chrome's launch image for Modern Web Guidance v1.0, showing the coding agents and IDEs that announced support: Codex, Cursor, Kimi, Google Antigravity, Grok, JetBrains WebStorm, and GitHub Copilot. Support is per host, so the install path still depends on the agent. Source: <a href="https://developer.chrome.com/blog/modern-web-guidance-v1">Chrome for Developers — Modern Web Guidance v1</a></figcaption>
</figure>

## Install it in one command

The CLI requires Node.js 22 or later. From your project directory:

```bash
npx modern-web-guidance@latest install
```

The installer is interactive and writes the skill where your agent can find it. For Chrome extensions, or to pick packs yourself:

```bash
npx modern-web-guidance@latest install --choose
```

Update later with `npx modern-web-guidance@latest update`.

Inspect the catalog without installing:

```bash
# Find guides by plain-English query
npx modern-web-guidance@latest search "animate a dialog modal backdrop"

# Print a guide by ID
npx modern-web-guidance@latest retrieve dialog

# Scan a codebase for legacy patterns
npx modern-web-guidance@latest legacy-scan .
```

`search` returns JSON ranked by relevance. `retrieve` prints one guide and accepts a comma-separated list.

`legacy-scan` parses HTML, CSS, JavaScript, TypeScript, framework components, and `package.json`. It is a pre-screen, not a fixer: the CLI has no `--fix` flag on purpose, and every finding includes `keepWhen` and `dropWhen` criteria. The agent must inspect the surrounding code.

## How the retrieval loop works

The workflow:

1. **Activation.** The agent recognizes a web task and the skill tells it to consult the CLI.
2. **Search.** `search` matches the query against the guide catalog locally, using an offline embedding model plus BM25. There is no search API, no API key, and no network round trip.
3. **Retrieve.** The agent calls `retrieve <guide-id>` and gets one focused guide instead of a documentation site.
4. **Apply.** The guide enters the context window only when it is relevant. The agent writes the code, runs the tests, and remains responsible for the result.

The package is self-contained, has no runtime dependencies, and works with `npx --offline` once cached. Low latency and a small supply-chain surface matter when this runs inside every agent session.

The guides are token-efficient. The project prunes advice models already follow, so the retrieved file spends tokens on gaps rather than a general CSS tutorial.

## What is inside

As of November 2026, the README lists **262 modern web features** and **204 use cases**. The six core disciplines are user experience, CSS layout, performance, forms and UI, accessibility, and built-in AI. The catalog also reaches security, privacy, passkeys, web components, PWAs, and WebMCP.

[The modernization docs](https://developer.chrome.com/docs/modern-web-guidance/modernization-workflow) show the range:

| Legacy pattern | Modern replacement |
| :--- | :--- |
| JavaScript `scrollHeight` textarea resizing | CSS `field-sizing: content` |
| A click listener whose only job is `showPopover()` | The `popovertarget` attribute |
| `max-height: 9999px` accordion animation | `interpolate-size: allow-keywords` and `calc-size()` |
| A CDN script tag without integrity metadata | `integrity` and `crossorigin="anonymous"` |

There are two skill packs. The core `modern-web-guidance` pack is about 205 tokens, and the `chrome-extensions` pack is about 175. Those are the skill definitions, not the size of every guide, so the skill can sit in context without crowding out the task.

## Safe adoption is part of the product

Modern Web Guidance is Baseline-aware, but Baseline is not a synonym for "works everywhere."

- **Set a target.** Without one in `AGENTS.md` or `CLAUDE.md`, the tool defaults to Baseline Widely available. Declaring a target changes which recommendations the agent receives.
- **Separate enhancements from critical behavior.** Speculative preloading can fail silently; a dialog control cannot. Fallbacks are written only where behavior is load-bearing.
- **Prefer small fallbacks.** A case-specific fallback under 50 lines or a conditional polyfill beats a heavy bundle.
- **Gate the unstable stuff.** Origin Trial and volatile guides stay searchable but are blocked on `retrieve` until you opt in.

The opt-in lives in an optional `.mwgrc` at the project root, or `~/.mwgrc` as a user-level fallback. For example, to allow Origin Trial guides only:

```bash
npx modern-web-guidance@latest set-allow-origin-trials
```

The CLI writes a JSON file that is small enough to commit:

```json
{
  "allowOriginTrials": true,
  "allowVolatileFeatures": false
}
```

Run `set-allow-volatile-features` when you also want the single-engine guides. Volatile means a feature that shipped in only one engine within the last three months, or is still stabilizing. It stays visible in search, so you can read it, but it is hidden from automatic adoption. An agent should not reach for a single-engine API because it found a promising file.

## Do the evals back it up?

The project publishes an [evaluation dashboard](https://googlechrome.github.io/modern-web-guidance-src/) and runs nightly A/B jobs. Each task is attempted twice, with and without the skill, then graded in a real browser with Playwright. Graders check behavior, styles, source patterns, and accessibility states, not one specific implementation.

Here is the latest nightly job per model on the dashboard, dated **November 20, 2026**:

<figure class="mwg-chart" aria-label="Bar chart: share of checks passed by three coding agents, with and without Modern Web Guidance">
  <figcaption>
    <span class="card-tag">EVALS // NIGHTLY</span>
    <h3 class="mwg-chart-title">Guided agents pass far more checks</h3>
    <p class="mwg-chart-sub">Share of checks passed, with and without the skill. Higher is better.</p>
  </figcaption>
  <div class="mwg-chart-legend" aria-hidden="true">
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--unguided"></span>Unguided</span>
    <span class="mwg-legend-item"><span class="mwg-swatch mwg-swatch--guided"></span>Guided</span>
  </div>
  <div class="mwg-chart-scale" aria-hidden="true">
    <span></span>
    <div class="mwg-scale"><span>0%</span><span>50%</span><span>100%</span></div>
  </div>
  <div class="mwg-chart-rows">
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Antigravity CLI</b><span>Gemini 4 Argon</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="Unguided: 56 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 56%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">56%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="Guided: 97 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 97%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">97%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Claude Code</b><span>Claude Opus 5.5</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="Unguided: 54 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 54%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">54%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="Guided: 94 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 94%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">94%</span>
        </div>
      </div>
    </div>
    <div class="mwg-chart-row">
      <div class="mwg-chart-model"><b>Codex CLI</b><span>GPT-6.1 Sol</span></div>
      <div class="mwg-bar-pair">
        <div class="mwg-bar-line" role="img" aria-label="Unguided: 49 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--unguided" style="width: 49%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">49%</span>
        </div>
        <div class="mwg-bar-line" role="img" aria-label="Guided: 85 percent">
          <div class="mwg-bar-track" aria-hidden="true"><span class="mwg-bar mwg-bar--guided" style="width: 85%"></span></div>
          <span class="mwg-bar-val" aria-hidden="true">85%</span>
        </div>
      </div>
    </div>
  </div>
  <div class="mwg-chart-src">NIGHTLY EVAL · 2026-11-20 · SHARE OF CHECKS PASSED · EVAL DASHBOARD</div>
</figure>

Each row is a paired run of 228–229 tasks and 1,955–1,961 checks. Unguided agents pass roughly half the checks; guided agents pass most of them. The gaps are +41, +40, and +36 percentage points. The automated accessibility subset moves from 54–60% to 92–96%.

A few caveats:

- The benchmark is designed and run by the project team. The tasks and graders are open source, but this is a vendor-run evaluation, not an independent audit.
- Prompts never mention Modern Web Guidance. The agent has to discover that the skill applies, which is why the guided side is not 100%.
- The unguided baseline is 49–56%, so the room for improvement is large. Your codebase may have different gaps.
- The accessibility column covers automated checks across keyboard, focus and `inert`, motion and contrast, ARIA, and form labels. It is not a WCAG audit.

A 36-to-41-point lift on a curated benchmark shows the guides close real gaps. It does not promise your next pull request gets 40 points better.

## Where it stops

Modern Web Guidance is useful, but it is not a substitute for judgment.

**It is curated, not complete.** Two hundred use cases is a broad catalog, not an exhaustive one, and `legacy-scan` covers only about 20% of the guides. If your problem is missing, the agent falls back to its own knowledge. Read the guide before trusting it.

**Authoring guidance is not runtime verification.** A guide can explain `<dialog>`, but it cannot prove the focus order works in your app. Run the tests and check the interaction in a browser.

**Baseline is interoperability, not universal support.** Newly available means the major engines shipped it recently, not that your users' browsers have it. Set a target and read the fallback section.

**Agents can ignore the advice.** Retrieval puts a guide in context; it does not enforce it. The evals measure follow-through, and the answer is "most of the time," not "always."

## Privacy and the off switch

The CLI sends anonymous telemetry by default: install counts, the calling agent, guide retrieval IDs, and the agent's search queries. Raw user prompts are not collected. The code is in [`modern-web.ts`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/src/cli/modern-web.ts).

To opt out, set one environment variable in your shell profile:

```bash
export DISABLE_TELEMETRY=1
```

The CLI still works offline once cached, so a locked-down environment can use `npx --offline` after the first install.

## What this changes

The shift is not that an agent can write a modal. It is that platform knowledge is now a file you can inspect, version, and retrieve on demand, a smaller intervention than fine-tuning or pasting a docs site into a prompt.

For developers, the practical sequence is short:

1. Install the skill and set a Baseline target in `AGENTS.md` or `CLAUDE.md`.
2. Run `legacy-scan` on one folder, not the whole repository.
3. Read the guide it retrieves before accepting the diff.
4. Verify the result in a browser.

The lesson: authoring guidance and runtime verification are different jobs. This handles the first; tests, DevTools, and a human reviewer handle the second.

The source is on [GitHub](https://github.com/GoogleChrome/modern-web-guidance-src). Software is [Apache 2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE); guides are [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). Docs: [developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance). Dashboard: [googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/).

The web platform moved on. This is a practical way to move the agent with it.
