---
title: "Modern Web Guidance: Giving Coding Agents the Web Platform They Skip"
description: "A hands-on look at the open-source Modern Web Guidance skill and CLI for steering coding agents toward modern HTML, CSS, and browser APIs, with local search, Baseline-aware fallbacks, and public evals."
pubDate: 2026-11-22
category: "Web"
tags: ["Web Platform", "Baseline", "Coding Agents", "Tooling", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "9 min read"
---

# Modern Web Guidance: Giving Coding Agents the Web Platform They Skip

Coding agents can produce code that works. They can also produce the code a developer would have written in 2016: a `<div>` with `role="dialog"`, a document-level Escape listener, a body scroll lock, and a hand-rolled focus trap.

That is not laziness. Training data is full of legacy code, and even when a model knows a newer API, it often lacks the production patterns that make the API usable. Agents also copy the conventions of the repository around them.

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) puts an expert-written guide into the agent's context at the moment it builds something. It is a set of skills plus a local CLI, stewarded by the Google Chrome, Microsoft Edge, Mozilla Firefox, and MDN teams. Version 1.0 shipped on [November 10, 2026](https://developer.chrome.com/blog/modern-web-guidance-v1).

## A skill, not a model

Modern Web Guidance does not generate code and it does not replace your agent. It gives the agent a lookup tool.

The [source repository](https://github.com/GoogleChrome/modern-web-guidance-src) contains the guides, CLI, eval harness, and calibration code. The installable skill lives in the sibling [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) repository, which matters if you want to contribute or inspect a claim.

The skill tells the agent when to ask for guidance. The CLI returns one targeted Markdown file with code patterns, browser-support notes, gotchas, and fallbacks. Nothing is fine-tuned, and the agent still writes the code.

It works with any agent that supports skills, including Claude Code, Codex, and Copilot.

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

`search` returns JSON. A trimmed result:

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

The real command returns ten. `retrieve` prints one guide and accepts a comma-separated list.

`legacy-scan` parses HTML, CSS, JavaScript, TypeScript, framework components, and `package.json`. On a small demo:

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

That is a pre-screen, not a fixer. The CLI has no `--fix` flag on purpose. Every finding includes `keepWhen` and `dropWhen` criteria, and the agent must inspect the surrounding code.

## How the retrieval loop works

The workflow:

1. **Activation.** The agent recognizes a web task and the skill tells it to consult the CLI.
2. **Search.** `search` matches the query against the guide catalog locally, using an offline embedding model plus BM25. There is no search API, no API key, and no network round trip.
3. **Retrieve.** The agent calls `retrieve <guide-id>` and gets one focused guide instead of a documentation site.
4. **Apply.** The guide enters the context window only when it is relevant. The agent writes the code, runs the tests, and remains responsible for the result.

The package is self-contained, has no runtime dependencies, and works with `npx --offline` once cached. Low latency and a small supply-chain surface matter when this runs inside every agent session.

The guides are token-efficient. The project prunes advice models already follow, so the retrieved file spends tokens on gaps rather than a general CSS tutorial.

## The modal test: a custom overlay, or nine lines of HTML

The [`dialog` guide](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/ui-components/dialog.md) is a good test: almost every app has a modal, and almost every custom modal gets the same details wrong. The legacy shape below has open and close functions, restores focus, and locks the page. It still needs Escape handling, a focus trap, a backdrop, and background inerting.

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

The modern version:

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

On a browser with Invoker Commands support, that is the entire implementation: no JavaScript, no manual focus restore, no z-index or backdrop code. Two CSS rules finish the scroll lock:

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

The browser handles what custom modals usually get wrong:

- The page behind it becomes inert.
- Focus stays inside and returns to the invoker on close.
- It renders in the top layer with a real `::backdrop`.
- Escape, the mobile back gesture, and dialog semantics come from the browser.

The guide is opinionated here: do not add `role="dialog"`, `aria-modal`, a focus trap, an `inert` toggle, or an Escape handler to a native modal. Duplicating browser behavior can make the dialog worse.

It also catches a subtler gotcha. The old advice was `overflow: hidden` on `body`, which removes the root scrollbar and shifts the layout. The guide replaces it with the two rules above. Safari does not enforce `overscroll-behavior` yet, but the modal still contains its own scroll and the page is still inert.

Invoker Commands became Baseline newly available on December 12, 2025. If your target is older, keep the same markup and load [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill) only when `commandForElement` is missing from `HTMLButtonElement.prototype`.

That is the difference between a fact and a guide: the fallback, the accessibility rule, and the scroll bug.

## What is inside

As of November 2026, the README lists **262 modern web features** and **204 use cases**. The six core disciplines are user experience, CSS layout, performance, forms and UI, accessibility, and built-in AI. The catalog also reaches security, privacy, passkeys, web components, PWAs, and WebMCP.

The use cases are concrete: animate a dialog into the top layer, build a card that responds to its own width, validate a field only after interaction, or add passkey sign-in. Each guide is Markdown with runnable snippets and constraints.

The scanner is narrower. When I ran CLI 1.0.1 in November 2026, it reported **38 guides** with deterministic rules, about 20% of the corpus. A scanner that flags everything gets ignored, so rules must clear precision thresholds on unseen repositories.

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

| Agent and model | Paired tasks / checks | Unguided to guided | Uplift | Automated a11y checks |
| :--- | :---: | :---: | :---: | :---: |
| Antigravity CLI, Gemini 4 Argon | 228 / 1,955 | 56% to 97% | +41 pp | 54% to 95% |
| Claude Code, Claude Opus 5.5 | 229 / 1,961 | 54% to 94% | +40 pp | 60% to 96% |
| Codex CLI, GPT-6.1 Sol | 229 / 1,961 | 49% to 85% | +36 pp | 60% to 92% |

Unguided agents pass roughly half the checks; guided agents pass most of them. The accessibility column moves from 54–60% to 92–96%.

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
