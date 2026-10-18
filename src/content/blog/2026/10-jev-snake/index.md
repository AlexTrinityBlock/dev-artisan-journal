---
title: "Jev Plays Snake: Two Small Interfaces for a Decision Model"
description: "A hands-on TypeSafe Jev demo: file a document into the folders you define, watch a 10×9 Snake game driven by typed Choices, and compare the System One schema with OpenAI's Decisions API."
pubDate: 2026-10-18
category: "AI"
tags: ["TypeSafe", "Jev", "OpenAI", "AI", "JavaScript", "Interaction"]
featured: false
author: "Alex.Hsiao"
readTime: "16 min read"
---

# Jev Plays Snake: Two Small Interfaces for a Decision Model

**Jev** is TypeSafe's System One model: you send a *state* and a set of typed *questions*, and it returns structured answers and probabilities your code can branch on — no generated prose, no JSON parsing, no prompt-and-pray.

That one sentence is easy to nod at and hard to feel. So this post builds two small interfaces that make the contract visible. The first files a document into a folder. The second lets Jev drive a 10 × 9 Snake game, one typed move at a time. Both run in your browser with your own TypeSafe key.

---

## A decision model, not a chatbot

A chat model produces text for a human to read. Jev produces a decision for code to consume. The difference sounds philosophical until you look at the return shape:

| Primitive | Question it answers | What comes back |
| :-- | :-- | :-- |
| **Choice** | Which of these options? | `choice`, `probabilities`, `confidence` |
| **Score** | Which level on this rubric? | `score`, `legend`, `probabilities`, `confidence` |
| **Noul** | Is this statement true? | `noul` (0–1) |

Every answer is constrained to the options or levels you supplied. The model cannot invent a sixth folder or a direction outside the grid. Your code never has to recover a value from a sentence.

The other half of the contract is architectural: **code owns the workflow.** Jev supplies a judgment at one point in that workflow; code decides what to do with it. That is exactly the shape of both exhibits below.

> The TypeSafe docs put it well: ask for one snap judgment per question, then compose the answers in code. If a judgment needs several factors, split it, and weight the parts yourself.

## Your key, your browser, your bill

There is no backend on this page. The key you paste is stored in `localStorage` under `jev.key.v1` and sent only to the endpoint you choose. That is convenient, and it is also a real security boundary: any script running on this origin can read `localStorage`. Use a dedicated key with a spending limit, and revoke it when you are done experimenting.

<div class="chamfer-card-wrapper jev-shell" id="jev-auth">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">EXHIBIT // 00 · AUTHENTICATION</span>
        <h4 class="jev-h4">Bring your own Jev key</h4>
        <p class="jev-p">The key stays in this browser. Nothing is committed to the repository, and nothing is sent to this site's host.</p>
      </div>
      <div class="jev-status" id="jev-key-status" data-state="empty" role="status" aria-live="polite">
        <span class="jev-dot" aria-hidden="true"></span>
        <span data-status-text>NO KEY</span>
      </div>
    </div>
    <div class="jev-key-row">
      <div class="jev-input-wrap">
        <svg class="jev-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
        <input class="jev-input" id="jev-key-input" type="password" autocomplete="off" spellcheck="false" placeholder="apikey_..." aria-label="TypeSafe API key" />
        <button class="jev-icon-btn" id="jev-key-toggle" type="button" aria-label="Show key">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <button class="mono-btn-chamfer" id="jev-key-save" type="button">
        <span class="chamfer-inner"><span class="btn-tag">AUTH //</span><span class="btn-label">Save key</span></span>
      </button>
      <button class="jev-text-btn" id="jev-key-test" type="button" disabled>Test connection</button>
      <button class="jev-text-btn" id="jev-key-clear" type="button">Forget</button>
    </div>
    <div class="jev-transport">
      <label class="jev-label" for="jev-relay-input">RELAY BASE URL</label>
      <input class="jev-input" id="jev-relay-input" type="url" autocomplete="off" spellcheck="false" placeholder="https://your-worker.workers.dev" aria-label="Relay base URL" />
      <span class="jev-hint" id="jev-relay-hint">Paste the HTTPS base URL of your Cloudflare Worker. It is saved in this browser.</span>
    </div>
    <div class="jev-endpoint" id="jev-endpoint">ADD A RELAY URL</div>
  </div>
</div>

<div class="jev-error" id="jev-error" hidden role="alert">
  <svg class="jev-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  <div class="jev-error-body">
    <p class="jev-error-title" id="jev-error-title">Request failed.</p>
    <p class="jev-error-detail" id="jev-error-detail"></p>
    <div class="jev-error-actions">
      <button class="jev-text-btn" id="jev-error-relay" type="button" hidden>Relay URL</button>
    </div>
  </div>
  <button class="jev-error-close" id="jev-error-close" type="button" aria-label="Dismiss error">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
</div>

<p><strong>A CORS reality check.</strong> At the time of writing, TypeSafe's API returns <code>Access-Control-Allow-Origin</code> only for <code>https://console.typesafe.ai</code>. A static site on another origin cannot read a direct response, no matter how correct the key is. This demo therefore exposes only the <strong>Relay</strong> transport: a tiny proxy you control. The page is still pure frontend; the relay is a transport adapter, not a backend. The key goes from your browser to that relay and then to TypeSafe; it never goes to a public CORS proxy. The section below has a 30-line Cloudflare Worker you can deploy for free. If TypeSafe later allowlists your origin, you can point <code>baseUrl()</code> at the API directly and remove the relay.</p>

## Exhibit 01 — The filing cabinet

The first exhibit is deliberately mundane: a file lands in a shared drive, and someone has to choose a folder. The interesting part is how little the model needs to know, and how much the code still controls.

The state is the file name plus an optional excerpt. The questions are a **Choice** over the folder set — five starter folders, any custom folders you add, and **Unknown** — and a **Noul** for sensitive content. Both are asked in the same request, against the same state, and evaluated independently.

The folder manager is part of the exhibit. Add a folder and give it a one-line description; that description becomes part of the `criteria` rubric. Custom folders are saved in `localStorage`, so they survive a reload; **Reset** restores the five starters. **Unknown** is always present and cannot be removed. It is the honest "none of these" answer, so Jev can decline to force a file into a bad folder. When it chooses Unknown, the UI tells you to review the file instead of pretending the classification succeeded.

<div class="chamfer-card-wrapper jev-shell" id="jev-files">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">EXHIBIT // 01 · CHOICE + NOUL</span>
        <h4 class="jev-h4">The filing cabinet</h4>
        <p class="jev-p">Type a file name, add an excerpt if you have one, and let Jev choose among the starter folders, your own custom folders, or Unknown. The bars are the full probability distribution.</p>
      </div>
      <div class="jev-status" data-state="ready">
        <span class="jev-dot" aria-hidden="true"></span>
        <span>READY</span>
      </div>
    </div>
    <div class="jev-file-grid">
      <form id="jev-file-form">
        <label class="jev-field">
          <span class="jev-label">FILE NAME</span>
          <input class="jev-input" id="jev-file-name" type="text" value="Q3_invoice_acme_2026.pdf" autocomplete="off" spellcheck="false" placeholder="Q3_invoice_acme_2026.pdf" />
        </label>
        <label class="jev-field">
          <span class="jev-label">EXCERPT <span class="jev-optional">OPTIONAL</span></span>
          <textarea class="jev-textarea" id="jev-file-excerpt" rows="2" placeholder="A sentence or two from the document..."></textarea>
        </label>
        <div class="jev-samples" aria-label="Sample files">
          <button class="jev-sample" type="button" data-sample="invoice">Invoice</button>
          <button class="jev-sample" type="button" data-sample="incident">Incident</button>
          <button class="jev-sample" type="button" data-sample="nda">NDA</button>
          <button class="jev-sample" type="button" data-sample="resume">Resume</button>
        </div>
        <div class="jev-form-actions">
          <button class="mono-btn-chamfer" id="jev-file-submit" type="submit">
            <span class="chamfer-inner"><span class="btn-tag">JUDGE //</span><span class="btn-label">Classify file</span></span>
          </button>
          <button class="jev-text-btn" id="jev-file-copy" type="button">Copy request</button>
        </div>
      </form>
      <div class="jev-folders" id="jev-folders" aria-live="polite"></div>
    </div>
    <div class="jev-folder-manager">
      <div class="jev-folder-manager-head">
        <span class="jev-label">CUSTOM FOLDERS</span>
        <div class="jev-folder-manager-tools">
          <span class="jev-hint" id="jev-folder-count">0 / 8</span>
          <button class="jev-text-btn" id="jev-reset-folders" type="button" hidden>Reset</button>
        </div>
      </div>
      <form class="jev-folder-add" id="jev-folder-form">
        <input class="jev-input" id="jev-new-folder" type="text" maxlength="32" autocomplete="off" spellcheck="false" placeholder="Folder name" aria-label="Custom folder name" />
        <input class="jev-input" id="jev-new-folder-desc" type="text" maxlength="120" autocomplete="off" spellcheck="false" placeholder="What belongs here? (optional)" aria-label="Custom folder description" />
        <button class="mono-btn-chamfer" id="jev-add-folder" type="submit">
          <span class="chamfer-inner"><span class="btn-tag">ADD //</span><span class="btn-label">Folder</span></span>
        </button>
      </form>
      <div class="jev-custom-list" id="jev-custom-list" aria-live="polite"></div>
    </div>
    <div class="jev-file-result" id="jev-file-result" hidden>
      <div class="jev-file-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/></svg>
        <span class="jev-file-chip-name" id="jev-file-chip-name"></span>
        <span class="jev-chip-arrow" aria-hidden="true">→</span>
        <span class="jev-chip-folder" id="jev-file-chip-folder"></span>
      </div>
      <div class="jev-unknown-note" id="jev-file-unknown-note" hidden>
        <span class="card-tag">REVIEW //</span>
        <p>No folder fits. Jev chose Unknown, so this file should go to a human or to a new folder you define.</p>
      </div>
      <div class="jev-telemetry" id="jev-file-telemetry"></div>
      <div class="jev-probs" id="jev-file-probs"></div>
    </div>
    <details class="jev-req">
      <summary>Inspect the request</summary>
      <pre id="jev-file-json"></pre>
    </details>
    <div class="jev-foot">STATE = FILE NAME + EXCERPT · QUESTIONS = 1 CHOICE + 1 NOUL · ANSWER = FOLDER + PROBABILITIES + CONFIDENCE · UNKNOWN ALWAYS AVAILABLE · ICONS: LUCIDE (ISC)</div>
  </div>
</div>

### What the request looks like

The entire integration is one object. The folder names are the keys of `criteria`; the descriptions are the rubric the model compares against. The `sensitive` question is speculative in the useful sense: it is nearly free to ask, and the code can ignore it when it is not relevant.

```json
{
  "model": "jev-latest",
  "state": {
    "file_name": "Q3_invoice_acme_2026.pdf",
    "excerpt": ""
  },
  "questions": {
    "folder": {
      "type": "choice",
      "instructions": "Which folder should this file be filed into? Judge from the file name and any excerpt. Pick the single best folder.",
      "criteria": {
        "Finance": "Invoices, receipts, budgets, payroll, tax, expense reports, financial statements.",
        "Engineering": "Source code, architecture notes, incident reports, API specs, infrastructure, technical documentation.",
        "Legal": "Contracts, NDAs, terms of service, compliance policies, licenses, regulatory filings.",
        "Marketing": "Campaign briefs, ad copy, brand assets, social posts, landing pages, market research.",
        "People": "Resumes, offer letters, performance reviews, onboarding, HR policies, employee records.",
        "Unknown": "No listed folder fits, or the file is too ambiguous to file with confidence."
      }
    },
    "sensitive": {
      "type": "noul",
      "instructions": "Does the file name or excerpt suggest it contains personal, confidential, or regulated data?"
    }
  }
}
```

A representative response is just as small:

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "folder": {
      "type": "choice",
      "choice": "Finance",
      "confidence": 1.0,
      "probabilities": {
        "Finance": 1.0,
        "Engineering": 0.0,
        "Legal": 0.0,
        "Marketing": 0.0,
        "People": 0.0,
        "Unknown": 0.0
      }
    },
    "sensitive": { "type": "noul", "noul": 0.66 }
  },
  "usage": { "input_tokens": 495, "output_tokens": 38 }
}
```

There is no parsing step. `folder.choice` is already one of the keys you supplied. `sensitive.noul` is already a number between 0 and 1. The code decides whether 0.66 is worth a review flag — Jev does not make that policy decision.

## Exhibit 02 — Snake, with Jev at the controls

The second exhibit is the fun one, and also the stricter test of the contract. The board is **10 columns × 9 rows**. You cannot steer the snake. Jev chooses every move.

Each turn sends the same state shape:

- A **compact matrix** of all 90 cells, one string per row: `0` empty, `1` head, `2` body, `3` food.
- A **legend** that maps each digit to its meaning.
- The head coordinate, current direction, food coordinate, score, step count, and the **legal moves** computed by code.

The question is a **Choice** whose options are only the legal moves. Code has already removed walls and the snake's own body from the action space, so a bad answer cannot end the run on a technicality. The model still has to read the grid and pick a direction that moves toward the food.

<div class="chamfer-card-wrapper jev-shell" id="jev-snake">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">EXHIBIT // 02 · CHOICE</span>
        <h4 class="jev-h4">Jev plays Snake</h4>
        <p class="jev-p">10 × 9 grid. No arrow keys. Every move is one API call with the full matrix and a legal action set. The run pauses after every ten food points — or use <strong>Run to end</strong> to skip the gate and play until the board ends.</p>
      </div>
      <div class="jev-status" data-state="ready">
        <span class="jev-dot" aria-hidden="true"></span>
        <span id="jev-state">READY</span>
      </div>
    </div>
    <div class="jev-snake-grid">
      <div class="jev-board-wrap">
        <div class="jev-board" id="jev-board" role="img" aria-label="10 by 9 Snake board"></div>
        <div class="jev-board-caption">
          <span>GRID 10 × 9</span>
          <span>1 = HEAD</span>
          <span>2 = BODY</span>
          <span>3 = FOOD</span>
        </div>
      </div>
      <div class="jev-snake-panel">
        <div class="jev-telemetry-grid">
          <div><span class="jev-label">SCORE</span><strong id="jev-score">0</strong></div>
          <div><span class="jev-label">STEPS</span><strong id="jev-steps">0</strong></div>
          <div><span class="jev-label">TOKENS</span><strong id="jev-tokens">0</strong></div>
          <div><span class="jev-label">MODEL</span><strong>JEV</strong></div>
        </div>
        <div class="jev-move">
          <span class="jev-label">JEV'S LAST MOVE</span>
          <div class="jev-move-readout">
            <strong id="jev-move-choice">—</strong>
            <span id="jev-move-conf">—</span>
          </div>
          <div class="jev-probs" id="jev-snake-probs"></div>
        </div>
        <div class="jev-matrix-wrap">
          <span class="jev-label">WHAT JEV SEES</span>
          <pre class="jev-matrix" id="jev-matrix"></pre>
          <div class="jev-legend">
            <span><b>0</b> EMPTY</span>
            <span><b>1</b> HEAD</span>
            <span><b>2</b> BODY</span>
            <span><b>3</b> FOOD</span>
          </div>
        </div>
        <div class="jev-snake-actions">
          <button class="mono-btn-chamfer" id="jev-snake-start" type="button">
            <span class="chamfer-inner"><span class="btn-tag">RUN //</span><span class="btn-label">Start run</span></span>
          </button>
          <button class="mono-btn-chamfer" id="jev-snake-auto" type="button">
            <span class="chamfer-inner"><span class="btn-tag">AUTO //</span><span class="btn-label">Run to end</span></span>
          </button>
          <button class="jev-text-btn" id="jev-snake-pause" type="button">Pause</button>
          <button class="jev-text-btn" id="jev-snake-stop" type="button">Stop</button>
          <button class="jev-text-btn" id="jev-snake-reset" type="button">New run</button>
        </div>
        <div class="jev-gate" id="jev-snake-gate" hidden>
          <span class="card-tag">TOKEN BUDGET // 10 FOOD</span>
          <p>Jev has reached ten food points. The run is paused so you can decide whether to keep spending tokens. Each move is one request. <strong>Run to end</strong> skips this gate and continues until the board ends.</p>
          <div class="jev-gate-actions">
            <button class="mono-btn-chamfer" id="jev-snake-continue" type="button">
              <span class="chamfer-inner"><span class="btn-tag">NEXT //</span><span class="btn-label">Continue run</span></span>
            </button>
            <button class="jev-text-btn" id="jev-snake-auto-gate" type="button">Run to end</button>
            <button class="jev-text-btn" id="jev-snake-end" type="button">End run</button>
          </div>
        </div>
        <div class="jev-log" id="jev-snake-log" aria-live="polite"></div>
      </div>
    </div>
    <details class="jev-req">
      <summary>Inspect the current request</summary>
      <pre id="jev-snake-json"></pre>
    </details>
    <div style="margin-top: 10px;">
      <button class="jev-text-btn" id="jev-snake-copy" type="button">Copy current request</button>
    </div>
    <div class="jev-foot">STATE = 9 × 10 MATRIX + LEGEND + HEAD + DIRECTION + FOOD + LEGAL MOVES · QUESTION = 1 CHOICE · ONE REQUEST PER MOVE</div>
  </div>
</div>

### The compact matrix

The matrix is intentionally boring. A JSON object with 90 named cells would be readable to a human and noisy to the model; a 9-row array of 10-character strings is compact, unambiguous, and easy to log. Here is a real state from the game:

```json
{
  "grid": [
    "0000000000",
    "0000000000",
    "0000000000",
    "0000000000",
    "1221003000",
    "0000000000",
    "0000000000",
    "0000000000",
    "0000000000"
  ],
  "legend": { "0": "empty", "1": "snake head", "2": "snake body", "3": "food" },
  "head": { "row": 4, "col": 3 },
  "direction": "right",
  "food": { "row": 4, "col": 7 },
  "score": 0,
  "steps": 0,
  "legal_moves": ["up", "right", "down"]
}
```

The instruction tells Jev the coordinate convention — row 0 is the top, column 0 is the left, right increases the column, down increases the row — and tells it to choose only from `legal_moves`. On this board it chooses `right` toward the food, with a confidence around 0.95. On a board where the food is behind the snake, it has to turn; the matrix makes the body visible, so the legal set is what keeps it honest.

<blockquote><p><strong>Design note:</strong> the action space is filtered in code, not in the prompt. This is the “code owns the workflow” rule in miniature. Jev chooses a direction; code guarantees the direction is legal. The model is doing judgment, not bookkeeping.</p></blockquote>

### Why the run pauses at ten

Every move is a request. Jev is cheap — input is $42 per billion tokens, output is free — but “cheap” is not “free,” and a long run adds up. A typical move on this board is roughly 600 input tokens. A 10-food run is often 60–100 moves, so expect roughly 36,000–60,000 input tokens, or about $0.0015–$0.0025 at the current price. The pause at ten food points is a budget gate, not a technical limit: you can continue, end the run, or wait and inspect the matrix first.

**Run to end** is the deliberate bypass. It keeps the same loop but ignores the ten-food gate, stopping only at game over, a full board, an error, or **Stop**. The button is separate from **Start run** because skipping a budget gate should be a conscious choice, not the default. If you want to watch the model's behavior without clicking through every gate, use it; if you want to inspect the matrix at each milestone, stay on the manual run.

The gate also gives you a natural place to watch the model's behavior. Did it take the shortest path? Did it get trapped by its own body? Did confidence drop before a mistake? Those are the questions worth asking when you evaluate a decision model on your own data.

## The pattern behind both

The two exhibits look unrelated, but they share the same four moves:

| Move | Filing cabinet | Snake |
| :-- | :-- | :-- |
| **Constrain the answer** | Folder keys + Unknown | Only the legal directions |
| **Give only relevant state** | File name + excerpt | Matrix + legend + head + food |
| **Ask independent questions** | Folder + sensitive in one call | One move per call, because the board changes |
| **Keep policy in code** | What to do with `sensitive` | Filtering illegal moves and gating tokens |

The second row is where most prompt-based systems go wrong. More context is not automatically better. Jev's own documentation lists “large state full of irrelevant detail” as a failure mode: unrelated material acts as a distractor, and accuracy falls. The fix is to filter and structure in code before the request.

The fourth row is the part that makes the system testable. The model returns a probability distribution; the code decides the threshold, the fallback, and the human-escalation path. When the policy changes, you change a number in code — not a paragraph in a prompt.

## Two schemas for the same idea

The exhibits above use TypeSafe's **[System One](https://docs.typesafe.ai/concepts/system-one)** schema. As of October 2026 there is a second public schema for the same job: OpenAI's **[Decisions API](https://developers.openai.com/api/docs/guides/decisions)**. The two are close enough to compare field by field, and different enough that the comparison clarifies what a decision-model API actually is.

System One is not just Jev's private request body. Cloudflare's **[Clef](https://developers.cloudflare.com/workers-ai/models/clef)** and **Clef-flash** implement the same shape — `state`, a `questions` map, and `noul` / `choice` / `score` primitives with `criteria` — with multimodal extensions. That makes System One a schema in the practical sense: more than one model can speak it. The OpenAI Decisions API is a second schema, served by one endpoint and, today, one model.

### Side by side

<div class="api-spec chamfer-card-wrapper dark">
  <div class="chamfer-card-content">
    <div class="api-spec-head">
      <div>
        <span class="card-tag">SPEC MATRIX // DECISION PROTOCOLS</span>
        <h3 class="api-spec-title">Two contracts, one typed answer</h3>
        <p class="api-spec-sub">Both endpoints return probabilities instead of prose. The wire format is where they diverge.</p>
      </div>
      <div class="api-spec-status" aria-label="Public docs, 2026-10-18">
        <span class="api-spec-dot" aria-hidden="true"></span>
        <span>PUBLIC DOCS<br>2026-10-18</span>
      </div>
    </div>
    <div class="api-spec-endpoints">
      <div class="api-endpoint">
        <span class="api-endpoint-tag">S1 // SYSTEM ONE</span>
        <code class="api-endpoint-path">POST /v1/systemone</code>
        <span class="api-endpoint-flow">
          <span class="api-flow-node">state</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">questions{}</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">answers{}</span>
        </span>
      </div>
      <div class="api-endpoint is-openai">
        <span class="api-endpoint-tag">OA // DECISIONS</span>
        <code class="api-endpoint-path">POST /v1/decisions</code>
        <span class="api-endpoint-flow">
          <span class="api-flow-node">input</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">questions[]</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">answers[]</span>
        </span>
      </div>
    </div>
    <div class="api-spec-scroll">
      <table class="api-spec-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">System One <span class="api-table-note">Jev / Clef</span></th>
            <th scope="col">OpenAI Decisions <span class="api-table-note">GPT-6 Luna</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Evidence</th>
            <td><code>state</code> — string, object, or array</td>
            <td><code>input</code> — string, messages, or images</td>
          </tr>
          <tr>
            <th scope="row">Modality</th>
            <td>Jev: text. Clef: text / JSON / image / video.</td>
            <td>Text + image</td>
          </tr>
          <tr>
            <th scope="row">Questions</th>
            <td>Map keyed by ID. The key is not sent.</td>
            <td>Array. Optional <code>name</code> is echoed.</td>
          </tr>
          <tr>
            <th scope="row">Yes / no</th>
            <td><code>noul</code> → <code>noul</code></td>
            <td><code>predicate</code> → <code>probability</code></td>
          </tr>
          <tr>
            <th scope="row">Choice</th>
            <td><code>choice</code> + <code>probabilities{}</code> + <code>confidence</code></td>
            <td><code>choice</code> + <code>probabilities[]</code> + <code>confidence</code></td>
          </tr>
          <tr>
            <th scope="row">Score</th>
            <td><code>score</code> + <code>legend</code> + <code>probabilities{}</code> + <code>confidence</code></td>
            <td><code>score</code> + <code>probabilities[]</code> + <code>confidence</code></td>
          </tr>
          <tr>
            <th scope="row">Options</th>
            <td><code>criteria</code> — map / array / object</td>
            <td><code>choices[]</code> or <code>levels[]</code></td>
          </tr>
          <tr>
            <th scope="row">Instructions</th>
            <td>Required. String / object / array.</td>
            <td>Required. String.</td>
          </tr>
          <tr>
            <th scope="row">Answers</th>
            <td><code>answers{}</code> keyed by ID</td>
            <td><code>answers[]</code> in question order</td>
          </tr>
          <tr>
            <th scope="row">Refusal</th>
            <td>No answer type. Threshold in code.</td>
            <td>Per-question <code>refusal</code>; optional <code>safety_identifier</code>.</td>
          </tr>
          <tr>
            <th scope="row">Limits</th>
            <td>64k / request; 32k / question; 262k long context.</td>
            <td>1–200 questions; 2–255 choices.</td>
          </tr>
          <tr>
            <th scope="row">Model</th>
            <td>Jev 1.13 / 1.14 + Clef</td>
            <td>GPT-6 Luna (public beta)</td>
          </tr>
          <tr>
            <th scope="row">Price</th>
            <td>$0.042 / 1M input; output free</td>
            <td>$0.10 / 1M input; no output or cache charge</td>
          </tr>
          <tr>
            <th scope="row">Adoption</th>
            <td>Jev + Clef / Clef-flash</td>
            <td>OpenAI endpoint only</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="api-spec-swipe" aria-hidden="true">SWIPE TABLE →</div>
    <div class="api-spec-foot">
      <span>MONO / HAIRLINE 0.7PX</span>
      <span>SCHEMA DRIFT: CHECK DOCS</span>
      <span>JEV · CLEF · GPT-6 LUNA</span>
    </div>
  </div>
</div>

Two rows are worth correcting from the folklore version of this comparison. First, **both schemas require `instructions`**. The real difference is where the options live: System One puts them in `criteria`; OpenAI puts them in `choices` or `levels`. Second, OpenAI's `predicate` does **not** return a separate "condition indicator." It returns `{ type, name, probability }`; the condition lives in the `instructions` string. The statistical object is the same as a `noul`.

### The same three questions in both

Here is a support-ticket decision in System One. The state is a structured object, and the questions are keyed by ID:

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">REQUEST // SYSTEM ONE</span>
    <span class="api-console-meta">POST /v1/systemone · JSON</span>
  </div>
  <div class="api-console-body">

```json title="System One — POST /v1/systemone"
{
  "model": "jev-latest",
  "state": {
    "message": "I was charged twice for order A-104. Please refund the duplicate.",
    "order_id": "A-104"
  },
  "questions": {
    "department": {
      "type": "choice",
      "instructions": "Which team should handle this message?",
      "criteria": {
        "billing": "Payments, invoices, and refunds.",
        "technical": "Bugs, outages, and integrations.",
        "shipping": "Delivery and tracking.",
        "other": "None of the above."
      }
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "Does the customer explicitly request a refund?"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["Calm", "Frustrated but civil", "Very angry"]
    }
  }
}
```

  </div>
  <div class="api-console-foot"><span>STATE → QUESTIONS{}</span><span>APPLICATION/JSON</span></div>
</div>

And here is the same decision in the OpenAI Decisions format. The evidence is message-shaped, the questions are an array, and every question carries a name:

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">REQUEST // OPENAI DECISIONS</span>
    <span class="api-console-meta">POST /v1/decisions · JSON</span>
  </div>
  <div class="api-console-body">

```json title="OpenAI Decisions — POST /v1/decisions"
{
  "model": "gpt-6-luna",
  "input": "Order A-104: I was charged twice. Please refund the duplicate.",
  "questions": [
    {
      "type": "choice",
      "name": "department",
      "instructions": "Which team should handle this message?",
      "choices": [
        { "value": "billing", "description": "Payments, invoices, and refunds." },
        { "value": "technical", "description": "Bugs, outages, and integrations." },
        { "value": "shipping", "description": "Delivery and tracking." },
        { "value": "other", "description": "None of the above." }
      ]
    },
    {
      "type": "predicate",
      "name": "refund_requested",
      "instructions": "Does the customer explicitly request a refund?"
    },
    {
      "type": "score",
      "name": "frustration",
      "instructions": "How frustrated is the customer?",
      "levels": [
        { "label": "Calm", "description": "Neutral, matter-of-fact." },
        { "label": "Frustrated but civil", "description": "Annoyed, still constructive." },
        { "label": "Very angry", "description": "Hostile or threatening to leave." }
      ]
    }
  ]
}
```

  </div>
  <div class="api-console-foot"><span>INPUT → QUESTIONS[]</span><span>APPLICATION/JSON</span></div>
</div>

The responses mirror the two collection styles:

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">RESPONSE // SYSTEM ONE</span>
    <span class="api-console-meta">200 OK · ANSWERS{}</span>
  </div>
  <div class="api-console-body">

```json title="System One — response"
{
  "model": "jev-1.13.0",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.93,
      "probabilities": {
        "billing": 0.95,
        "technical": 0.02,
        "shipping": 0.01,
        "other": 0.02
      }
    },
    "refund_requested": { "type": "noul", "noul": 0.98 },
    "frustration": {
      "type": "score",
      "score": 1.1,
      "legend": {
        "0": "Calm",
        "1": "Frustrated but civil",
        "2": "Very angry"
      },
      "probabilities": { "0": 0.1, "1": 0.7, "2": 0.2 },
      "confidence": 0.55
    }
  },
  "usage": { "input_tokens": 420, "output_tokens": 40 }
}
```

  </div>
  <div class="api-console-foot"><span>KEYED BY QUESTION ID</span><span>PROBABILITY DISTRIBUTION</span></div>
</div>

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">RESPONSE // OPENAI DECISIONS</span>
    <span class="api-console-meta">200 OK · ANSWERS[]</span>
  </div>
  <div class="api-console-body">

```json title="OpenAI Decisions — response"
{
  "model": "gpt-6-luna",
  "answers": [
    {
      "type": "choice",
      "name": "department",
      "choice": "billing",
      "confidence": 0.93,
      "probabilities": [
        { "value": "billing", "probability": 0.95 },
        { "value": "technical", "probability": 0.02 },
        { "value": "shipping", "probability": 0.01 },
        { "value": "other", "probability": 0.02 }
      ]
    },
    {
      "type": "predicate",
      "name": "refund_requested",
      "probability": 0.98
    },
    {
      "type": "score",
      "name": "frustration",
      "score": 1.1,
      "confidence": 0.55,
      "probabilities": [
        { "value": 0, "label": "Calm", "probability": 0.1 },
        { "value": 1, "label": "Frustrated but civil", "probability": 0.7 },
        { "value": 2, "label": "Very angry", "probability": 0.2 }
      ]
    }
  ],
  "usage": { "input_tokens": 420 }
}
```

  </div>
  <div class="api-console-foot"><span>ORDERED BY QUESTIONS[]</span><span>PROBABILITY DISTRIBUTION</span></div>
</div>

The values are illustrative. The shapes are the point.

### What the table hides

**`state` is evidence-shaped; `input` is message-shaped.** System One accepts a JSON object or array directly, so a ticket record and its policy can travel as structured data. OpenAI's `input` is a string or a message array; structured evidence has to be serialized into text or a content part. If your state is already a record, System One asks less of your code. If your state is an image or a conversation, the Decisions API is the more natural fit.

**Map keys vs array names.** System One's question key is for your code; the model never sees it. OpenAI's `name` is part of the question object and is echoed in the answer, and answers arrive in question order. Both are easy to map into code, but they fail differently: a missing System One key is a lookup miss; a missing OpenAI name is an ordered-array position you have to trust.

**`criteria` vs `choices` / `levels`.** System One compresses the rubric into `criteria`: a map for Choice, an ordered array for Score, and an optional `{true, false}` object for Noul. OpenAI makes the options explicit: `choices` is an array of `{value, description}`, and `levels` is an array of `{label, description}`. The latter is more verbose, but it also lets a choice value be a boolean and keeps labels separate from the values. Both schemas still require `instructions`.

**`noul` vs `predicate`.** Same idea, different field name. Both return one probability that the statement is true. TypeSafe calls it `noul`; OpenAI calls it `probability`. Neither has a separate confidence field for that primitive, because the probability is the uncertainty.

**Refusal is a channel, not a probability.** OpenAI can return a per-question `refusal` answer, and the other questions in the same request can still answer. It also accepts an optional `safety_identifier` — an opaque, caller-provided end-user ID scoped to the verified organization. System One has no dedicated refusal answer type; you express guardrails as Noul questions and decide what to do with the probability and confidence in code. That is a real architectural choice: OpenAI gives you a refusal channel, TypeSafe gives you a number to threshold.

**Object vs array returns.** System One keys answers by your question ID, so order does not matter. OpenAI returns answers in the same order as the questions array, with `name` as the stable identifier. Both return full probability distributions for Choice and Score. System One's Score answer includes a `legend`; OpenAI's Score probabilities carry the `label` and `value` on each entry.

**Price and modality.** Jev lists $0.042 per 1M input tokens with output free; GPT-6 Luna Decisions lists $0.10 per 1M input tokens with no output or cache charges. Tokenization and request size differ, so compare on your own workload rather than multiplying list prices. The bigger difference is input: Jev 1.13 is text-only, while the Decisions API accepts images, and Clef extends the System One shape to images and video.

**Adoption and portability.** System One has more than one implementation: Jev and Cloudflare's Clef/Clef-flash. The OpenAI Decisions API is a single-vendor endpoint with one model today. If you want the same schema to survive a model swap, System One is the more portable contract; if you want OpenAI's model and image handling, Decisions is the direct path.

### Which one should you use?

- **Use System One** when the evidence is structured JSON, the workload is text-heavy, you want several independent questions in one request, and you want calibrated probabilities you can threshold. It is also the better fit when you want the option to run the same schema on Jev or Clef.
- **Use OpenAI Decisions** when you need text plus images, you are already in the OpenAI SDK ecosystem, or you want the `safety_identifier` / per-question `refusal` semantics.
- **Use neither as your control flow.** Both return decisions; your code should still own routing, thresholds, retries, and the human-escalation path. The schema decides the shape of the answer, not the policy.

The two formats are not wire-compatible, but they are close enough to normalize. A small adapter can map `state` ↔ `input`, the question map ↔ array, and `noul` ↔ `predicate`; the rest is field renaming. Some API gateways already expose both shapes behind one route. That is a compatibility layer, not a standard.

One caveat before you pin either one: the OpenAI Decisions API is in public beta and currently accepts only `gpt-6-luna`; TypeSafe's Jev is at 1.13/1.14, and Clef is an open-weight model with its own limits and prices. The table above reflects the public docs as of **2026-10-18**. Check the current docs before freezing a schema in your codebase.

## Run it yourself

The HTTP API is one endpoint:

```bash
curl https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": { "file_name": "Q3_invoice_acme_2026.pdf" },
    "questions": {
      "folder": {
        "type": "choice",
        "instructions": "Which folder should this file be filed into?",
        "criteria": {
          "Finance": "Invoices, budgets, tax, payroll.",
          "Engineering": "Code, incidents, specs, infrastructure.",
          "Legal": "Contracts, NDAs, compliance.",
          "Marketing": "Campaigns, copy, brand assets.",
          "People": "Resumes, reviews, HR records."
        }
      }
    }
  }'
```

### A relay you control

The deployed page needs a relay because of the CORS allowlist. Deploy a tiny one; this Cloudflare Worker forwards only two paths and keeps the CORS allowlist tight:

```js
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "https://blog.alextrinitywolf.com";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/v1/systemone" && url.pathname !== "/v1/models") {
      return new Response("Not found", { status: 404, headers: cors });
    }

    const upstream = await fetch("https://api.typesafe.ai" + url.pathname, {
      method: request.method,
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": request.headers.get("content-type") || "application/json"
      },
      body: request.method === "GET" ? undefined : await request.text()
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    });
  }
};
```

Set `ALLOWED_ORIGIN` to your own origin. The relay sees the `Authorization` header, so self-host it, keep the allowlist narrow, and do not log request bodies. This is not a public CORS proxy; it is a small piece of infrastructure you own.

After deploying, paste `https://your-worker.workers.dev` into the page's Relay field (base only, no `/v1/systemone`) and press **Test connection**.

For local development, the same idea in Bun:

```ts
const ALLOW = "http://localhost:4321";

Bun.serve({
  port: 8787,
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW,
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    const upstream = await fetch("https://api.typesafe.ai" + url.pathname, {
      method: request.method,
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": request.headers.get("content-type") || "application/json"
      },
      body: request.method === "GET" ? undefined : await request.text()
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    });
  }
});
```

Run it with `bun run relay.ts`, then paste `http://localhost:8787` into the page's Relay field. This local HTTP relay is for local development: an HTTPS page cannot call a loopback HTTP relay (browsers block the private address space), so use the HTTPS Worker for the deployed site.

> **Do not use a public CORS proxy for this.** It would receive your key in the `Authorization` header. A relay you control is the only version of this pattern I would ship.

## Field notes

- **Model version.** `jev-latest` currently resolves to `jev-1.13.0`. Jev 1.14.0 is available through `jev-preview` or its versioned ID. If you tune confidence thresholds, pin the versioned ID and switch deliberately.
- **Language.** English is the primary training language. Jev accepts other languages, including CJK, but accuracy is lower. Test on your own content before relying on it.
- **Literal reading.** Jev answers the question you wrote, not the one you meant. Put boundary cases in `criteria`, and split a judgment if it needs several independent factors.
- **Numbers and dates.** Keep arithmetic, counting, and date comparisons in code. Use Jev for the extraction or the judgment, not the calculation.
- **Cost.** Input is $42 per billion tokens; output tokens are free. A Snake move is a few hundred input tokens, so the gate at ten food points is mostly about discipline, not price.
- **Security.** The key in this demo lives in `localStorage`. Use a scoped key, revoke it when done, and never commit it. The test key used to validate this article is not in the repository.

The point of both exhibits is not that a model can play Snake. It is that a model can return a **typed decision** at a specific point in a workflow, and the rest of the system can stay ordinary code. That is a much smaller, more testable interface than “generate an answer and hope it parses.”

If you build something with it, the docs are at [docs.typesafe.ai](https://docs.typesafe.ai), and the [TypeSafe Playground](https://console.typesafe.ai/playground) is a good place to try a state and a few questions before writing the integration.

<style>
.jev-shell {
  margin: 28px 0;
  background: var(--mono-grid);
}

.jev-shell .chamfer-card-content {
  padding: 22px 20px 18px;
}

.jev-shell-inner {
  min-width: 0;
}

.jev-h4 {
  margin: 4px 0 5px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--mono-ink);
}

.jev-shell .jev-p {
  margin: 0 0 14px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--mono-muted);
}

.jev-shell .jev-label {
  display: block;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mono-muted);
}

.jev-shell .jev-optional {
  color: var(--mono-faint);
  letter-spacing: 0.08em;
}

.jev-ex-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.jev-ex-head > div {
  min-width: 0;
}

.jev-kicker {
  display: block;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--mono-faint);
  text-transform: uppercase;
  margin-bottom: 3px;
}

.jev-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--mono-muted);
  text-transform: uppercase;
}

.jev-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mono-faint);
}

.jev-status[data-state="ready"] .jev-dot,
.jev-status[data-state="ok"] .jev-dot {
  background: var(--mono-ink);
}

.jev-status[data-state="working"] .jev-dot {
  background: var(--mono-ink);
  animation: jev-blink 1s steps(2, end) infinite;
}

.jev-status[data-state="error"] .jev-dot {
  background: transparent;
  border: 0.8px solid var(--mono-ink);
}

.jev-key-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
}

.jev-input-wrap {
  position: relative;
  flex: 1 1 260px;
  min-width: 0;
}

.jev-input-wrap .jev-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translateY(-50%);
  color: var(--mono-muted);
  pointer-events: none;
}

.jev-input-wrap .jev-input {
  padding-left: 32px;
}

.jev-input,
.jev-textarea {
  width: 100%;
  background: var(--mono-paper);
  border: 0.7px solid var(--mono-grid);
  border-radius: 3px;
  padding: 9px 11px;
  color: var(--mono-ink);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  line-height: 1.45;
  outline: none;
  transition: border-color 150ms ease;
}

.jev-input::placeholder,
.jev-textarea::placeholder {
  color: var(--mono-faint);
}

.jev-input:focus,
.jev-textarea:focus {
  border-color: var(--mono-ink);
}

.jev-textarea {
  min-height: 58px;
  resize: vertical;
}

.jev-icon-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  cursor: pointer;
  border-radius: 2px;
}

.jev-icon-btn svg {
  width: 14px;
  height: 14px;
}

.jev-icon-btn:hover,
.jev-icon-btn.is-on {
  color: var(--mono-ink);
}

.jev-text-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
  border: 0;
  border-bottom: 0.7px solid transparent;
  background: transparent;
  color: var(--mono-muted);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}

.jev-text-btn:hover {
  color: var(--mono-ink);
  border-bottom-color: var(--mono-ink);
}

.jev-text-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  border-bottom-color: transparent;
}

.jev-transport {
  display: grid;
  gap: 5px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.7px dashed var(--mono-grid);
}

.jev-transport .jev-input {
  width: 100%;
}

.jev-hint,
.jev-endpoint {
  font-family: var(--mono-font-mono);
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--mono-faint);
}

.jev-endpoint {
  color: var(--mono-muted);
  word-break: break-all;
}

.jev-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: -14px 0 24px;
  padding: 12px 14px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
}

.jev-error-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--mono-ink);
  margin-top: 1px;
}

.jev-error-body {
  flex: 1;
  min-width: 0;
}

.jev-error .jev-error-title {
  margin: 0 0 3px;
  font-size: 12px;
  font-weight: 800;
  color: var(--mono-ink);
}

.jev-error .jev-error-detail {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-l2);
  overflow-wrap: anywhere;
}

.jev-error-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.jev-error-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  cursor: pointer;
}

.jev-error-close:hover {
  color: var(--mono-ink);
}

.jev-file-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}

.jev-field {
  display: block;
  margin-bottom: 10px;
}

.jev-field .jev-label {
  margin-bottom: 5px;
}

.jev-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 2px 0 12px;
}

.jev-sample {
  border: 0.7px solid var(--mono-grid);
  background: var(--mono-paper);
  padding: 3px 7px;
  color: var(--mono-muted);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}

.jev-sample:hover {
  border-color: var(--mono-ink);
  color: var(--mono-ink);
}

.jev-form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.jev-shell .mono-btn-chamfer[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

.jev-shell .mono-btn-chamfer.is-loading .btn-label {
  animation: jev-blink 1s steps(2, end) infinite;
}

.jev-folders {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.jev-folder {
  position: relative;
  min-height: 104px;
  padding: 9px 9px 8px;
  border: 0.7px solid var(--mono-grid);
  background: var(--mono-paper);
  transition: border-color 200ms ease;
}

.jev-folder.is-choice {
  border-color: var(--mono-ink);
}

.jev-folder.is-unknown {
  border-style: dashed;
}

.jev-folder.is-custom .jev-folder-desc {
  color: var(--mono-l3);
}

.jev-folder.is-choice::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 7px;
  height: 7px;
  background: var(--mono-ink);
}

.jev-folder-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 6px;
}

.jev-folder-icon {
  display: inline-flex;
  width: 17px;
  height: 17px;
  color: var(--mono-l3);
}

.jev-folder.is-choice .jev-folder-icon {
  color: var(--mono-ink);
}

.jev-folder-icon svg {
  width: 17px;
  height: 17px;
}

.jev-folder-pct {
  font-family: var(--mono-font-mono);
  font-size: 10px;
  font-weight: 800;
  color: var(--mono-l3);
}

.jev-folder.is-choice .jev-folder-pct {
  color: var(--mono-ink);
}

.jev-folder-name {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--mono-ink);
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
}

.jev-folder-desc {
  display: block;
  margin-top: 3px;
  font-size: 8.5px;
  line-height: 1.35;
  color: var(--mono-muted);
}

.jev-folder-bar {
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: 8px;
  height: 2px;
  background: var(--mono-grid);
  overflow: hidden;
}

.jev-folder-bar i {
  display: block;
  width: calc(var(--p, 0) * 100%);
  height: 100%;
  background: var(--mono-l5);
  transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.jev-folder.is-choice .jev-folder-bar i {
  background: var(--mono-ink);
}

.jev-folder-manager {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.7px dashed var(--mono-grid);
}

.jev-folder-manager-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 7px;
}

.jev-folder-manager-tools {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.jev-folder-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto;
  gap: 7px;
  align-items: stretch;
}

.jev-folder-add .mono-btn-chamfer {
  white-space: nowrap;
}

.jev-folder-add .mono-btn-chamfer .chamfer-inner {
  height: 100%;
}

.jev-custom-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.jev-custom-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 4px 3px 8px;
  border: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  color: var(--mono-l2);
}

.jev-custom-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.jev-custom-remove:hover {
  color: var(--mono-ink);
}

.jev-custom-empty {
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  line-height: 1.5;
  color: var(--mono-faint);
}

.jev-unknown-note {
  margin-top: 10px;
  padding: 9px 11px;
  border: 0.7px solid var(--mono-ink);
  border-left: 3px solid var(--mono-ink);
}

.jev-shell .jev-unknown-note p {
  margin: 3px 0 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-l2);
}

.jev-file-result {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 0.7px dashed var(--mono-grid);
  animation: jev-drop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.jev-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  padding: 6px 9px;
  border: 0.7px solid var(--mono-ink);
  font-family: var(--mono-font-mono);
  font-size: 10.5px;
  color: var(--mono-ink);
}

.jev-file-chip svg {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
}

.jev-file-chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jev-chip-arrow {
  color: var(--mono-faint);
}

.jev-chip-folder {
  font-weight: 800;
  white-space: nowrap;
}

.jev-telemetry {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.jev-telemetry strong {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 12px;
  font-weight: 800;
  color: var(--mono-ink);
  overflow-wrap: anywhere;
}

.jev-probs {
  margin-top: 10px;
}

.jev-prob {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
}

.jev-prob-label,
.jev-prob-pct {
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mono-muted);
}

.jev-prob-pct {
  text-align: right;
}

.jev-prob-bar {
  height: 4px;
  background: var(--mono-grid);
  overflow: hidden;
}

.jev-prob-bar i {
  display: block;
  height: 100%;
  background: var(--mono-l5);
  transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.jev-prob.is-win .jev-prob-bar i {
  background: var(--mono-ink);
}

.jev-prob.is-win .jev-prob-label,
.jev-prob.is-win .jev-prob-pct {
  color: var(--mono-ink);
  font-weight: 800;
}

.jev-foot {
  margin-top: 14px;
  padding-top: 8px;
  border-top: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--mono-faint);
}

.jev-snake-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.jev-board-wrap {
  padding: 7px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
}

.jev-board {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  width: 100%;
  aspect-ratio: 10 / 9;
  gap: 0.7px;
  padding: 0.7px;
  background: var(--mono-grid);
  border: 0.7px solid var(--mono-grid);
}

.jev-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mono-paper);
  min-width: 0;
  min-height: 0;
}

.jev-cell.is-head {
  background: var(--mono-ink);
}

.jev-cell.is-body.shade-1 {
  background: var(--mono-l3);
}

.jev-cell.is-body.shade-2 {
  background: var(--mono-l4);
}

.jev-cell.is-body.shade-3 {
  background: var(--mono-l5);
}

.jev-eye {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--mono-paper);
}

.jev-food {
  width: 44%;
  height: 44%;
  border: 1.1px solid var(--mono-ink);
  background: var(--mono-paper);
  transform: rotate(45deg);
  animation: jev-food 2.6s ease-in-out infinite;
}

.jev-board-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--mono-muted);
}

.jev-snake-panel {
  min-width: 0;
}

.jev-telemetry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 0.7px solid var(--mono-grid);
}

.jev-telemetry-grid strong {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--mono-ink);
  overflow-wrap: anywhere;
}

.jev-move {
  padding: 10px 0;
  border-bottom: 0.7px dashed var(--mono-grid);
}

.jev-move-readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin: 2px 0 4px;
}

.jev-move-readout strong {
  font-family: var(--mono-font-mono);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--mono-ink);
}

.jev-move-readout span {
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  color: var(--mono-muted);
}

.jev-matrix-wrap {
  padding: 10px 0;
  border-bottom: 0.7px dashed var(--mono-grid);
}

.jev-matrix {
  margin: 6px 0 0;
  padding: 10px 12px;
  background: var(--mono-dark-bg);
  border: 0.7px solid var(--mono-dark-grid);
  color: var(--mono-dark-ink);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.jev-mrow {
  display: block;
  white-space: nowrap;
}

.jev-mlabel {
  display: inline-block;
  width: 1.2ch;
  color: var(--mono-dark-l6);
}

.jev-mline {
  display: inline;
}

.jev-md {
  display: inline-block;
  width: 1ch;
  text-align: center;
}

.jev-md.v0 {
  color: var(--mono-dark-l7);
}

.jev-md.v1,
.jev-md.v3 {
  color: var(--mono-dark-l1);
  font-weight: 800;
}

.jev-md.v2 {
  color: var(--mono-dark-l4);
}

.jev-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 7px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--mono-muted);
}

.jev-legend b {
  color: var(--mono-ink);
  font-weight: 800;
}

.jev-snake-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.jev-gate {
  margin-top: 14px;
  padding: 12px 14px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
  animation: jev-drop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.jev-shell .jev-gate p {
  margin: 5px 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--mono-l2);
}

.jev-gate-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.jev-log {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 9px;
  line-height: 1.9;
  letter-spacing: 0.04em;
  color: var(--mono-muted);
}

/* ------------------------------------------------------------------ */
/* API spec matrix + request/response consoles                         */
/* ------------------------------------------------------------------ */

.api-spec {
  margin: 28px 0;
  min-width: 0;
  max-width: 100%;
  background: var(--mono-dark-grid);
}

.api-spec .chamfer-card-content {
  min-width: 0;
  padding: 0;
  background: var(--mono-dark-bg);
  color: var(--mono-dark-ink);
}

.api-spec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
  padding: 20px 20px 16px;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background-image:
    linear-gradient(var(--mono-dark-grid-soft) 0.7px, transparent 0.7px),
    linear-gradient(90deg, var(--mono-dark-grid-soft) 0.7px, transparent 0.7px);
  background-size: 26px 26px;
  background-position: -0.7px -0.7px;
}

.api-spec .card-tag {
  color: var(--mono-dark-l5);
}

.api-spec .api-spec-head h3.api-spec-title {
  margin: 4px 0 6px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--mono-dark-l1);
}

.api-spec .api-spec-head p.api-spec-sub {
  max-width: 520px;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--mono-dark-l4);
}

.api-spec-status {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex-shrink: 0;
  padding-left: 14px;
  border-left: 0.7px solid var(--mono-dark-grid);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.12em;
  color: var(--mono-dark-l5);
  text-align: right;
  text-transform: uppercase;
}

.api-spec-dot {
  width: 5px;
  height: 5px;
  margin-top: 3px;
  border-radius: 50%;
  background: var(--mono-dark-l1);
  animation: api-pulse 2.4s steps(2, end) infinite;
}

.api-spec-endpoints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7px;
  min-width: 0;
  background: var(--mono-dark-grid);
  border-bottom: 0.7px solid var(--mono-dark-grid);
}

.api-endpoint {
  min-width: 0;
  padding: 14px 16px 13px;
  background: var(--mono-dark-bg);
  position: relative;
}

.api-endpoint::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 26px;
  height: 0.7px;
  background: var(--mono-dark-l5);
}

.api-endpoint-tag {
  display: block;
  margin-bottom: 5px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--mono-dark-l5);
}

.api-spec .api-endpoint code.api-endpoint-path {
  display: block;
  margin: 0 0 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mono-dark-l1);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-endpoint-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--mono-dark-l4);
}

.api-flow-node {
  padding: 2px 5px;
  border: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-surface);
  color: var(--mono-dark-l3);
}

.api-flow-arrow {
  color: var(--mono-dark-l6);
  font-size: 10px;
}

.api-spec-scroll {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  background: var(--mono-dark-bg);
  border-bottom: 0.7px solid var(--mono-dark-grid);
  -webkit-overflow-scrolling: touch;
}

.api-spec .api-spec-scroll table.api-spec-table {
  display: table;
  width: 100%;
  min-width: 640px;
  margin: 0;
  border-collapse: collapse;
  table-layout: fixed;
  overflow-x: visible;
  font-size: 10.5px;
  line-height: 1.55;
  color: var(--mono-dark-l2);
}

.api-spec .api-spec-table thead th {
  padding: 9px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l5);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-align: left;
  text-transform: uppercase;
  vertical-align: bottom;
}

.api-spec .api-spec-table thead th:nth-child(1) { width: 18%; }
.api-spec .api-spec-table thead th:nth-child(2) { width: 41%; }
.api-spec .api-spec-table thead th:nth-child(3) { width: 41%; }

.api-spec .api-spec-table tbody th {
  padding: 8px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid-soft);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l4);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  vertical-align: top;
}

.api-spec .api-spec-table tbody td {
  padding: 8px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid-soft);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l2);
  font-size: 10.5px;
  line-height: 1.55;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.api-spec .api-spec-table tbody tr:last-child th,
.api-spec .api-spec-table tbody tr:last-child td {
  border-bottom: 0;
}

.api-spec .api-spec-table tbody tr:hover th,
.api-spec .api-spec-table tbody tr:hover td {
  background: var(--mono-dark-surface);
}

.api-spec .api-spec-table td code,
.api-spec .api-spec-table th code {
  padding: 1px 4px;
  border: 0.7px solid var(--mono-dark-grid);
  border-radius: 2px;
  background: var(--mono-dark-surface);
  color: var(--mono-dark-l1);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  line-height: 1.45;
  word-break: break-word;
}

.api-table-note {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--mono-dark-l6);
  text-transform: none;
}

.api-spec-swipe {
  display: none;
}

.api-spec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
  padding: 8px 12px;
  border-top: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l6);
  text-transform: uppercase;
}

.api-console {
  position: relative;
  min-width: 0;
  max-width: 100%;
  margin: 18px 0 22px;
  border: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}

.api-console-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-surface);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l4);
  text-transform: uppercase;
}

.api-console-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--mono-dark-l1);
}

.api-console-title::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--mono-dark-l1);
  transform: rotate(45deg);
}

.api-console-meta {
  color: var(--mono-dark-l5);
  text-align: right;
}

.api-console-body {
  position: relative;
  background: var(--mono-dark-bg);
}

.api-console-body::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0.7px;
  background: var(--mono-dark-grid);
  pointer-events: none;
}

.api-console-body pre.astro-code {
  margin: 0 !important;
  padding: 16px 16px 16px 46px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: var(--mono-dark-bg) !important;
  color: var(--mono-dark-ink) !important;
  font-size: 11px !important;
  line-height: 1.65 !important;
  filter: grayscale(1) contrast(1.06);
  counter-reset: api-line;
  max-width: none;
  box-sizing: border-box;
}

.api-console-body pre.astro-code .line {
  position: relative;
}

.api-console-body pre.astro-code .line::before {
  counter-increment: api-line;
  content: counter(api-line, decimal-leading-zero);
  position: absolute;
  left: -32px;
  width: 22px;
  text-align: right;
  color: var(--mono-dark-l7);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
  user-select: none;
}

.api-console-body pre.astro-code:focus-visible {
  outline: 1px solid var(--mono-dark-l5);
  outline-offset: -2px;
}

.api-console-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 6px 12px;
  border-top: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l6);
  text-transform: uppercase;
}

@keyframes api-pulse {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.25; }
}

@media (max-width: 640px) {
  .api-spec-head {
    flex-direction: column;
    gap: 12px;
  }

  .api-spec-status {
    padding-left: 0;
    border-left: 0;
    text-align: left;
  }

  .api-spec-endpoints {
    grid-template-columns: 1fr;
  }

  .api-spec-scroll {
    border-bottom: 0;
  }

  .api-spec-swipe {
    display: flex;
    justify-content: flex-end;
    padding: 4px 12px;
    border-top: 0.7px solid var(--mono-dark-grid);
    background: var(--mono-dark-bg);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-dark-l6);
  }

  .api-console-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .api-console-meta {
    text-align: left;
  }

  .api-console-body pre.astro-code {
    font-size: 10px !important;
    padding-left: 38px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .api-spec-dot {
    animation: none;
  }
}

.jev-req {
  margin-top: 12px;
  border-top: 0.7px solid var(--mono-grid);
  padding-top: 8px;
}

.jev-req summary {
  cursor: pointer;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--mono-muted);
}

.jev-req summary:hover {
  color: var(--mono-ink);
}

.jev-req pre {
  margin: 8px 0 0;
  max-height: 220px;
  overflow: auto;
  background: var(--mono-dark-bg);
  color: var(--mono-dark-ink);
  border: 0.7px solid var(--mono-dark-grid);
  padding: 10px 12px;
  font-size: 10px;
  line-height: 1.55;
}

.jev-shell button:focus-visible,
.jev-shell input:focus-visible,
.jev-shell textarea:focus-visible,
.jev-shell summary:focus-visible {
  outline: 2px solid var(--mono-ink);
  outline-offset: 2px;
}

.jev-shell [hidden],
.jev-error[hidden] {
  display: none !important;
}

@keyframes jev-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.25; }
}

@keyframes jev-drop {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}

@keyframes jev-food {
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(45deg) scale(0.78); }
}

@media (max-width: 860px) {
  .jev-file-grid,
  .jev-snake-grid {
    grid-template-columns: 1fr;
  }

  .jev-folders {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .jev-board-wrap {
    max-width: 520px;
    margin: 0 auto;
  }
}

@media (max-width: 560px) {
  .jev-shell .chamfer-card-content {
    padding: 18px 14px 14px;
  }

  .jev-folders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .jev-folder-add {
    grid-template-columns: 1fr;
  }

  .jev-folder-add .mono-btn-chamfer {
    width: 100%;
  }

  .jev-telemetry,
  .jev-telemetry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .jev-key-row {
    flex-direction: column;
  }

  .jev-key-row .jev-input-wrap {
    flex: 0 0 auto;
    width: 100%;
  }

  .jev-key-row .mono-btn-chamfer {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jev-food,
  .jev-status[data-state="working"] .jev-dot,
  .jev-shell .mono-btn-chamfer.is-loading .btn-label {
    animation: none;
  }

  .jev-file-result,
  .jev-gate {
    animation: none;
  }

  .jev-folder-bar i,
  .jev-prob-bar i {
    transition: none;
  }
}

</style>

<script is:inline>
(() => {
  'use strict';

  const LS = {
    key: 'jev.key.v1',
    relay: 'jev.relay.v1',
    folders: 'jev.folders.v1'
  };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const app = {
    key: '',
    relay: ''
  };

  const esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  function readStored() {
    try {
      app.key = localStorage.getItem(LS.key) || '';
      app.relay = localStorage.getItem(LS.relay) || '';
    } catch (err) {
      app.key = '';
      app.relay = '';
    }
  }

  function store(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      /* localStorage can be unavailable in private modes. */
    }
  }

  function forget(name) {
    try {
      localStorage.removeItem(name);
    } catch (err) {
      /* no-op */
    }
  }

  function baseUrl() {
    const url = app.relay.trim().replace(/\/+$/, '');
    if (!url) throw new Error('Add a relay base URL first.');
    return url;
  }

  class ApiError extends Error {
    constructor(message, status, body) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  }

  async function api(path, options = {}) {
    const base = baseUrl();
    const headers = {
      Authorization: 'Bearer ' + app.key,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

    let res;
    try {
      res = await fetch(base + path, { ...options, headers });
    } catch (err) {
      const wrapped = new Error('Network request failed.');
      wrapped.network = true;
      wrapped.cause = err;
      throw wrapped;
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = null;
    }

    if (!res.ok) {
      const detail = data && typeof data === 'object' ? JSON.stringify(data) : text;
      throw new ApiError('TypeSafe returned ' + res.status + '.', res.status, detail);
    }
    return data;
  }

  function describeError(err) {
    if (err && err.message === 'Add a relay base URL first.') {
      return {
        title: 'Add a relay URL.',
        detail:
          'Paste the HTTPS base URL of your Cloudflare Worker. The demo appends /v1/systemone to it.',
        relay: true
      };
    }
    if (err && err.network) {
      return {
        title: 'Could not reach the relay.',
        detail:
          'Check the relay URL, that the Worker is deployed, and that its ALLOWED_ORIGIN matches this page. ' +
          'The Worker must be HTTPS.',
        relay: true
      };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return {
          title: 'The key was rejected (401).',
          detail: 'Check the key and save it again. A revoked or mistyped key returns 401.'
        };
      }
      if (err.status === 429) {
        return {
          title: 'Rate limited (429).',
          detail: 'Wait a few seconds, then continue the run. The SDKs retry with backoff; this demo does not.'
        };
      }
      if (err.status === 422) {
        return {
          title: 'The request was rejected (422).',
          detail: err.body || 'The API could not validate the request body.'
        };
      }
      return {
        title: 'TypeSafe returned ' + err.status + '.',
        detail: err.body || 'The request did not complete.'
      };
    }
    return {
      title: 'Request failed.',
      detail: err && err.message ? err.message : String(err)
    };
  }

  const errorBox = $('#jev-error');

  function showError(err) {
    const info = describeError(err);
    $('#jev-error-title').textContent = info.title;
    $('#jev-error-detail').textContent = info.detail;
    $('#jev-error-relay').hidden = !info.relay;
    errorBox.hidden = false;
  }

  function clearError() {
    if (errorBox) errorBox.hidden = true;
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message || 'Copied.');
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        showToast(message || 'Copied.');
      } catch (copyErr) {
        showToast('Copy failed. Select the text manually.');
      }
      area.remove();
    }
  }

  function requireKey() {
    if (app.key) return true;
    showToast('Add your Jev API key above first.');
    const input = $('#jev-key-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

  function requireRelay() {
    if (app.relay.trim()) return true;
    showToast('Add your relay URL first.');
    focusRelay();
    return false;
  }

  function setKeyStatus(text, stateName) {
    const status = $('#jev-key-status');
    if (!status) return;
    status.dataset.state = stateName || 'empty';
    status.querySelector('[data-status-text]').textContent = text;
  }

  function syncKeyUI() {
    const input = $('#jev-key-input');
    if (input) input.value = app.key;
    setKeyStatus(app.key ? 'KEY STORED' : 'NO KEY', app.key ? 'ready' : 'empty');
    const test = $('#jev-key-test');
    if (test) test.disabled = !app.key;
  }

  function renderRelayMeta() {
    const hint = $('#jev-relay-hint');
    if (hint) {
      hint.textContent = app.relay.trim()
        ? 'Saved in this browser. The request goes browser → relay → TypeSafe.'
        : 'Paste the HTTPS base URL of your Cloudflare Worker. It is saved in this browser.';
    }
    const endpoint = $('#jev-endpoint');
    if (endpoint) {
      endpoint.textContent = app.relay.trim()
        ? app.relay.trim().replace(/\/+$/, '') + '/v1/systemone'
        : 'ADD A RELAY URL';
    }
  }

  function syncRelayUI() {
    const relayInput = $('#jev-relay-input');
    if (relayInput && document.activeElement !== relayInput && relayInput.value !== app.relay) {
      relayInput.value = app.relay;
    }
    renderRelayMeta();
  }

  function focusRelay() {
    const input = $('#jev-relay-input');
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function testConnection() {
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    setKeyStatus('TESTING', 'working');
    const button = $('#jev-key-test');
    if (button) button.disabled = true;
    try {
      const data = await api('/v1/models', { method: 'GET' });
      const count = data && Array.isArray(data.models) ? data.models.length : null;
      setKeyStatus(count ? 'CONNECTED · ' + count + ' MODELS' : 'CONNECTED', 'ok');
      showToast('Connection works.');
    } catch (err) {
      setKeyStatus('CONNECTION FAILED', 'error');
      showError(err);
    } finally {
      if (button) button.disabled = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Exhibit 01 — the filing cabinet                                     */
  /* ------------------------------------------------------------------ */

  const FOLDER_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  const FILE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>';

  const UNKNOWN_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';

  const DEFAULT_FOLDERS = [
    {
      name: 'Finance',
      desc: 'Invoices · budgets · tax',
      long: 'Invoices, receipts, budgets, payroll, tax, expense reports, financial statements.'
    },
    {
      name: 'Engineering',
      desc: 'Code · incidents · specs',
      long: 'Source code, architecture notes, incident reports, API specs, infrastructure, technical documentation.'
    },
    {
      name: 'Legal',
      desc: 'Contracts · policies · NDAs',
      long: 'Contracts, NDAs, terms of service, compliance policies, licenses, regulatory filings.'
    },
    {
      name: 'Marketing',
      desc: 'Campaigns · copy · brand',
      long: 'Campaign briefs, ad copy, brand assets, social posts, landing pages, market research.'
    },
    {
      name: 'People',
      desc: 'Resumes · reviews · HR',
      long: 'Resumes, offer letters, performance reviews, onboarding, HR policies, employee records.'
    }
  ];

  const UNKNOWN_FOLDER = {
    name: 'Unknown',
    desc: 'No folder fits',
    long: 'No listed folder fits, or the file is too ambiguous to file with confidence.',
    kind: 'unknown'
  };

  const MAX_CUSTOM_FOLDERS = 8;
  let customFolders = [];

  const SAMPLES = {
    invoice: { name: 'Q3_invoice_acme_2026.pdf', excerpt: '' },
    incident: {
      name: 'incident_postmortem_2026-10-02.md',
      excerpt: 'Root cause: expired TLS certificate on the edge gateway. 43 minutes of elevated 502s.'
    },
    nda: { name: 'mutual_nda_signed_v4.pdf', excerpt: '' },
    resume: {
      name: 'resume_jane_doe.pdf',
      excerpt: '10 years of backend engineering, distributed systems, Go and Rust.'
    }
  };

  function isReservedName(name) {
    const lower = name.toLowerCase();
    return lower === 'unknown' || DEFAULT_FOLDERS.some((folder) => folder.name.toLowerCase() === lower);
  }

  function loadCustomFolders() {
    try {
      const raw = localStorage.getItem(LS.folders);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      customFolders = parsed
        .filter((item) => item && typeof item.name === 'string')
        .map((item) => ({
          name: item.name.trim().replace(/\s+/g, ' '),
          desc: typeof item.desc === 'string' ? item.desc.trim().replace(/\s+/g, ' ') : ''
        }))
        .filter((item) => item.name && !isReservedName(item.name))
        .slice(0, MAX_CUSTOM_FOLDERS);
    } catch (err) {
      customFolders = [];
    }
  }

  function saveCustomFolders() {
    store(LS.folders, JSON.stringify(customFolders));
  }

  function allFolders() {
    return [
      ...DEFAULT_FOLDERS.map((folder) => ({ ...folder, kind: 'default' })),
      ...customFolders.map((folder) => ({
        ...folder,
        kind: 'custom',
        long:
          folder.desc ||
          'Custom folder named ' + folder.name + '. Use the folder name and the file itself to decide.'
      }))
    ];
  }

  function folderOptions() {
    return [...allFolders(), UNKNOWN_FOLDER];
  }

  function addCustomFolder(name, desc) {
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanDesc = desc.trim().replace(/\s+/g, ' ');

    if (!cleanName) {
      showToast('Type a folder name first.');
      return false;
    }
    if (cleanName.length > 32) {
      showToast('Folder names are limited to 32 characters.');
      return false;
    }
    if (customFolders.length >= MAX_CUSTOM_FOLDERS) {
      showToast('Up to ' + MAX_CUSTOM_FOLDERS + ' custom folders.');
      return false;
    }
    if (
      isReservedName(cleanName) ||
      customFolders.some((folder) => folder.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      showToast('That folder already exists.');
      return false;
    }

    customFolders.push({ name: cleanName, desc: cleanDesc });
    saveCustomFolders();
    return true;
  }

  function removeCustomFolder(index) {
    if (index < 0 || index >= customFolders.length) return;
    const removed = customFolders.splice(index, 1)[0];
    saveCustomFolders();
    renderFolders();
    renderCustomList();
    clearFileResult();
    updateFileJson(buildFilePayload());
    showToast('Removed ' + removed.name + '.');
  }

  function resetCustomFolders() {
    customFolders = [];
    saveCustomFolders();
    renderFolders();
    renderCustomList();
    clearFileResult();
    updateFileJson(buildFilePayload());
    showToast('Custom folders reset.');
  }

  function renderFolders() {
    const host = $('#jev-folders');
    if (!host) return;
    host.innerHTML = folderOptions()
      .map((folder) => {
        const kind = folder.kind || 'default';
        const icon = kind === 'unknown' ? UNKNOWN_ICON : FOLDER_ICON;
        const classes = ['jev-folder'];
        if (kind === 'unknown') classes.push('is-unknown');
        if (kind === 'custom') classes.push('is-custom');
        return `
          <div class="${classes.join(' ')}" data-folder="${esc(folder.name)}" data-kind="${kind}" aria-label="${esc(folder.name)}: no result yet">
            <div class="jev-folder-top">
              <span class="jev-folder-icon">${icon}</span>
              <span class="jev-folder-pct" data-pct>—</span>
            </div>
            <span class="jev-folder-name">${esc(folder.name)}</span>
            <span class="jev-folder-desc">${esc(folder.desc || (kind === 'custom' ? 'Custom folder' : ''))}</span>
            <span class="jev-folder-bar" aria-hidden="true"><i></i></span>
          </div>`;
      })
      .join('');
  }

  function renderCustomList() {
    const host = $('#jev-custom-list');
    const count = $('#jev-folder-count');
    const reset = $('#jev-reset-folders');

    if (count) count.textContent = customFolders.length + ' / ' + MAX_CUSTOM_FOLDERS;
    if (reset) reset.hidden = customFolders.length === 0;
    if (!host) return;

    if (!customFolders.length) {
      host.innerHTML =
        '<span class="jev-custom-empty">No custom folders yet. The starter folders and Unknown are always available.</span>';
      return;
    }

    host.innerHTML = customFolders
      .map(
        (folder, index) => `
          <span class="jev-custom-chip">
            <span>${esc(folder.name)}</span>
            <button class="jev-custom-remove" type="button" data-remove-index="${index}" aria-label="Remove ${esc(folder.name)}">×</button>
          </span>`
      )
      .join('');
  }

  function clearFileResult() {
    const result = $('#jev-file-result');
    if (result) result.hidden = true;
    const unknown = $('#jev-file-unknown-note');
    if (unknown) unknown.hidden = true;
  }

  function buildFilePayload() {
    const name = $('#jev-file-name').value.trim();
    const excerpt = $('#jev-file-excerpt').value.trim();
    const state = { file_name: name };
    if (excerpt) state.excerpt = excerpt;

    return {
      model: 'jev-latest',
      state,
      questions: {
        folder: {
          type: 'choice',
          instructions:
            'Which folder should this file be filed into? Judge from the file name and any excerpt. Pick the single best folder.',
          criteria: Object.fromEntries(folderOptions().map((folder) => [folder.name, folder.long]))
        },
        sensitive: {
          type: 'noul',
          instructions:
            'Does the file name or excerpt suggest it contains personal, confidential, or regulated data?'
        }
      }
    };
  }

  function updateFileJson(payload) {
    const json = $('#jev-file-json');
    if (json) json.textContent = JSON.stringify(payload, null, 2);
  }

  function renderFileResult(data, fileName) {
    const folderAnswer = data.answers && data.answers.folder;
    if (!folderAnswer) throw new Error('The response did not include a folder answer.');
    const sensitive = data.answers && data.answers.sensitive;
    const probabilities = folderAnswer.probabilities || {};

    const folderHost = $('#jev-folders');
    folderOptions().forEach((folder) => {
      const card = Array.from(folderHost.querySelectorAll('.jev-folder')).find(
        (el) => el.dataset.folder === folder.name
      );
      if (!card) return;
      const probability = Number(probabilities[folder.name] || 0);
      card.style.setProperty('--p', String(probability));
      const pct = card.querySelector('[data-pct]');
      if (pct) pct.textContent = Math.round(probability * 100) + '%';
      card.classList.toggle('is-choice', folder.name === folderAnswer.choice);
      card.setAttribute(
        'aria-label',
        folder.name + ': ' + Math.round(probability * 100) + ' percent' +
          (folder.name === folderAnswer.choice ? ', selected' : '')
      );
    });

    $('#jev-file-chip-name').textContent = fileName;
    $('#jev-file-chip-folder').textContent = folderAnswer.choice;
    $('#jev-file-unknown-note').hidden = folderAnswer.choice !== 'Unknown';
    $('#jev-file-result').hidden = false;

    $('#jev-file-telemetry').innerHTML = `
      <div><span class="jev-label">MODEL</span><strong>${esc(data.model || '—')}</strong></div>
      <div><span class="jev-label">CONFIDENCE</span><strong>${Number(folderAnswer.confidence || 0).toFixed(2)}</strong></div>
      <div><span class="jev-label">SENSITIVE</span><strong>${sensitive ? Math.round(Number(sensitive.noul || 0) * 100) + '%' : '—'}</strong></div>
      <div><span class="jev-label">TOKENS</span><strong>${data.usage ? Number(data.usage.input_tokens || 0).toLocaleString() : '—'}</strong></div>`;

    const probHost = $('#jev-file-probs');
    if (probHost) {
      const entries = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));
      probHost.innerHTML = entries
        .map(
          ([label, value]) => `
            <div class="jev-prob ${label === folderAnswer.choice ? 'is-win' : ''}">
              <span class="jev-prob-label">${esc(label)}</span>
              <span class="jev-prob-bar"><i style="width:${(Number(value) * 100).toFixed(1)}%"></i></span>
              <span class="jev-prob-pct">${Math.round(Number(value) * 100)}%</span>
            </div>`
        )
        .join('');
    }
  }

  async function classifyFile(event) {
    event.preventDefault();
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();

    const nameInput = $('#jev-file-name');
    const fileName = nameInput.value.trim();
    if (!fileName) {
      showToast('Type a file name first.');
      nameInput.focus();
      return;
    }

    const payload = buildFilePayload();
    updateFileJson(payload);

    const button = $('#jev-file-submit');
    const label = button ? button.querySelector('.btn-label') : null;
    const oldLabel = label ? label.textContent : '';
    if (button) {
      button.disabled = true;
      button.classList.add('is-loading');
    }
    if (label) label.textContent = 'Classifying…';

    try {
      const data = await api('/v1/systemone', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      renderFileResult(data, fileName);
    } catch (err) {
      showError(err);
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('is-loading');
      }
      if (label && oldLabel) label.textContent = oldLabel;
    }
  }

  function loadSample(key) {
    const sample = SAMPLES[key];
    if (!sample) return;
    $('#jev-file-name').value = sample.name;
    $('#jev-file-excerpt').value = sample.excerpt;
    updateFileJson(buildFilePayload());
    $('#jev-file-name').focus();
  }

  /* ------------------------------------------------------------------ */
  /* Exhibit 02 — Jev plays Snake                                        */
  /* ------------------------------------------------------------------ */

  const COLS = 10;
  const ROWS = 9;
  const DELTA = {
    up: [-1, 0],
    right: [0, 1],
    down: [1, 0],
    left: [0, -1]
  };
  const MOVE_LABEL = { up: 'UP', right: 'RIGHT', down: 'DOWN', left: 'LEFT' };
  const MOVE_DESC = {
    up: 'Move one cell up. Row decreases by 1.',
    right: 'Move one cell right. Column increases by 1.',
    down: 'Move one cell down. Row increases by 1.',
    left: 'Move one cell left. Column decreases by 1.'
  };

  const game = {
    snake: [],
    food: null,
    direction: 'right',
    score: 0,
    steps: 0,
    tokens: 0,
    running: false,
    paused: false,
    gameOver: false,
    gate: false,
    autoRun: false,
    seed: 20261018,
    inFlight: false,
    timer: null,
    lastGate: -1,
    runId: 0,
    log: []
  };

  function rand() {
    game.seed = (game.seed * 1664525 + 1013904223) >>> 0;
    return game.seed / 4294967296;
  }

  function placeFood() {
    const occupied = new Set(game.snake.map((point) => point.r + ',' + point.c));
    const empty = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (!occupied.has(r + ',' + c)) empty.push({ r, c });
      }
    }
    if (!empty.length) {
      game.food = null;
      game.gameOver = true;
      return;
    }
    game.food = empty[Math.floor(rand() * empty.length)];
  }

  function gridRows() {
    const map = new Map();
    game.snake.forEach((point, index) => {
      map.set(point.r + ',' + point.c, index === 0 ? 1 : 2);
    });
    if (game.food) map.set(game.food.r + ',' + game.food.c, 3);

    const rows = [];
    for (let r = 0; r < ROWS; r += 1) {
      let row = '';
      for (let c = 0; c < COLS; c += 1) {
        row += String(map.has(r + ',' + c) ? map.get(r + ',' + c) : 0);
      }
      rows.push(row);
    }
    return rows;
  }

  function setSnakeState(text) {
    const el = $('#jev-state');
    if (el) el.textContent = text;
  }

  function renderMatrix() {
    const host = $('#jev-matrix');
    if (!host) return;
    const rows = gridRows();
    const header =
      '<span class="jev-mrow"><span class="jev-mlabel"></span><span class="jev-mline">' +
      '0123456789'
        .split('')
        .map((digit) => '<span class="jev-md">' + digit + '</span>')
        .join('') +
      '</span></span>';
    const body = rows
      .map((row, index) => {
        const digits = row
          .split('')
          .map((digit) => '<span class="jev-md v' + digit + '">' + digit + '</span>')
          .join('');
        return (
          '<span class="jev-mrow"><span class="jev-mlabel">' +
          index +
          '</span><span class="jev-mline">' +
          digits +
          '</span></span>'
        );
      })
      .join('');
    host.innerHTML = header + body;
    host.setAttribute('aria-label', 'Compact grid matrix: ' + rows.join(' '));
  }

  function renderBoard() {
    const host = $('#jev-board');
    if (!host) return;
    const map = new Map();
    game.snake.forEach((point, index) => {
      map.set(point.r + ',' + point.c, index === 0 ? 'head' : 'body:' + index);
    });
    if (game.food) map.set(game.food.r + ',' + game.food.c, 'food');

    let html = '';
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const value = map.get(r + ',' + c) || '';
        let className = 'jev-cell';
        let inner = '';
        if (value === 'head') {
          className += ' is-head';
          inner = '<i class="jev-eye"></i>';
        } else if (value.indexOf('body:') === 0) {
          const index = Number(value.split(':')[1]);
          className += ' is-body shade-' + (((index - 1) % 3) + 1);
        } else if (value === 'food') {
          className += ' is-food';
          inner = '<i class="jev-food"></i>';
        }
        html +=
          '<div class="' + className + '" data-r="' + r + '" data-c="' + c + '">' + inner + '</div>';
      }
    }
    host.innerHTML = html;

    const head = game.snake[0];
    host.setAttribute(
      'aria-label',
      'Snake board. Head at row ' + (head.r + 1) + ', column ' + (head.c + 1) +
        '. Food at row ' + (game.food ? game.food.r + 1 : 'none') +
        ', column ' + (game.food ? game.food.c + 1 : 'none') +
        '. Score ' + game.score + '.'
    );

    $('#jev-score').textContent = String(game.score);
    $('#jev-steps').textContent = String(game.steps);
    $('#jev-tokens').textContent = game.tokens.toLocaleString();
    renderMatrix();
  }

  function legalMoves() {
    const head = game.snake[0];
    const body = new Set(game.snake.slice(0, -1).map((point) => point.r + ',' + point.c));
    return Object.keys(DELTA).filter((direction) => {
      const delta = DELTA[direction];
      const r = head.r + delta[0];
      const c = head.c + delta[1];
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      return !body.has(r + ',' + c);
    });
  }

  function buildSnakePayload(legal) {
    const head = game.snake[0];
    return {
      model: 'jev-latest',
      state: {
        grid: gridRows(),
        legend: {
          '0': 'empty',
          '1': 'snake head',
          '2': 'snake body',
          '3': 'food'
        },
        head: { row: head.r, col: head.c },
        direction: game.direction,
        food: game.food ? { row: game.food.r, col: game.food.c } : null,
        score: game.score,
        steps: game.steps,
        legal_moves: legal
      },
      questions: {
        move: {
          type: 'choice',
          instructions:
            'You are the snake head (1). The snake is moving ' + game.direction +
            '. Choose the next move that keeps the snake alive and moves toward the food (3). ' +
            'The grid is 9 rows by 10 columns: row 0 is the top row, column 0 is the left column. ' +
            'Only choose from `legal_moves`.',
          criteria: Object.fromEntries(legal.map((direction) => [direction, MOVE_DESC[direction]]))
        }
      }
    };
  }

  function updateSnakeJson(payload) {
    const el = $('#jev-snake-json');
    if (el) el.textContent = JSON.stringify(payload, null, 2);
  }

  function applyMove(direction) {
    const delta = DELTA[direction];
    const head = game.snake[0];
    const next = { r: head.r + delta[0], c: head.c + delta[1] };
    game.snake.unshift(next);

    const ate = game.food && next.r === game.food.r && next.c === game.food.c;
    if (ate) {
      game.score += 1;
      placeFood();
      if (!game.food) {
        game.gameOver = true;
        game.running = false;
        setSnakeState('BOARD FULL');
      }
    } else {
      game.snake.pop();
    }

    game.direction = direction;
    game.steps += 1;
  }

  function renderMove(answer, choice, corrected) {
    const choiceEl = $('#jev-move-choice');
    if (choiceEl) {
      choiceEl.textContent = MOVE_LABEL[choice] + (corrected ? ' · CORRECTED' : '');
    }
    const confEl = $('#jev-move-conf');
    if (confEl) {
      confEl.textContent =
        answer && answer.confidence != null ? 'CONF ' + Number(answer.confidence).toFixed(2) : '—';
    }

    const host = $('#jev-snake-probs');
    if (!host) return;
    const probabilities = (answer && answer.probabilities) || {};
    const entries = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));
    host.innerHTML = entries
      .map(
        ([label, value]) => `
          <div class="jev-prob ${label === choice ? 'is-win' : ''}">
            <span class="jev-prob-label">${esc(MOVE_LABEL[label] || label)}</span>
            <span class="jev-prob-bar"><i style="width:${(Number(value) * 100).toFixed(1)}%"></i></span>
            <span class="jev-prob-pct">${Math.round(Number(value) * 100)}%</span>
          </div>`
      )
      .join('');
  }

  function addLog(choice, answer, corrected) {
    game.log.unshift({
      step: game.steps,
      direction: choice,
      confidence: answer && answer.confidence != null ? Number(answer.confidence) : null,
      corrected
    });
    game.log = game.log.slice(0, 5);
    const host = $('#jev-snake-log');
    if (!host) return;
    host.innerHTML = game.log
      .map(
        (entry) =>
          '<div>STEP ' +
          String(entry.step).padStart(3, '0') +
          ' · ' +
          MOVE_LABEL[entry.direction] +
          ' · ' +
          (entry.confidence == null ? '—' : entry.confidence.toFixed(2)) +
          (entry.corrected ? ' · CORRECTED' : '') +
          '</div>'
      )
      .join('');
  }

  function updateSnakeButtons() {
    const start = $('#jev-snake-start');
    const auto = $('#jev-snake-auto');
    const pause = $('#jev-snake-pause');
    const stop = $('#jev-snake-stop');

    if (start) {
      start.disabled = game.running || game.gate;
      const label = start.querySelector('.btn-label');
      if (label) {
        label.textContent = game.running
          ? 'Running'
          : game.gate
            ? 'Paused'
            : game.gameOver
              ? 'New run'
              : game.steps > 0
                ? 'Resume run'
                : 'Start run';
      }
    }
    if (auto) {
      auto.disabled = game.autoRun;
      auto.classList.toggle('active', game.autoRun);
      const label = auto.querySelector('.btn-label');
      if (label) {
        label.textContent = game.autoRun
          ? 'Auto running'
          : game.gameOver
            ? 'Run again'
            : game.gate
              ? 'Finish run'
              : 'Run to end';
      }
    }
    if (pause) {
      pause.disabled = game.gate || (!game.running && !game.paused);
      pause.textContent = game.gate ? 'Paused' : game.paused ? 'Resume' : 'Pause';
    }
    if (stop) {
      stop.disabled = game.gate || (!game.running && !game.paused);
    }
  }

  function resetGame() {
    game.runId += 1;
    clearTimeout(game.timer);
    game.timer = null;
    game.inFlight = false;
    game.snake = [
      { r: 4, c: 3 },
      { r: 4, c: 2 },
      { r: 4, c: 1 }
    ];
    game.food = null;
    game.direction = 'right';
    game.score = 0;
    game.steps = 0;
    game.tokens = 0;
    game.running = false;
    game.paused = false;
    game.gameOver = false;
    game.gate = false;
    game.autoRun = false;
    game.seed = 20261018;
    game.lastGate = -1;
    game.log = [];
    placeFood();
    renderBoard();
    setSnakeState('READY');
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    const log = $('#jev-snake-log');
    if (log) log.innerHTML = '';
    const choice = $('#jev-move-choice');
    if (choice) choice.textContent = '—';
    const conf = $('#jev-move-conf');
    if (conf) conf.textContent = '—';
    const probs = $('#jev-snake-probs');
    if (probs) probs.innerHTML = '';
    updateSnakeJson(buildSnakePayload(legalMoves()));
    updateSnakeButtons();
  }

  async function stepSnake() {
    if (!game.running || game.paused || game.gameOver || game.inFlight) return;

    const legal = legalMoves();
    if (!legal.length) {
      game.running = false;
      game.gameOver = true;
      game.autoRun = false;
      setSnakeState('GAME OVER');
      updateSnakeButtons();
      return;
    }

    game.inFlight = true;
    setSnakeState('THINKING');
    const runId = game.runId;

    try {
      const payload = buildSnakePayload(legal);
      updateSnakeJson(payload);
      const data = await api('/v1/systemone', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (runId !== game.runId) return;

      const answer = data.answers && data.answers.move;
      if (!answer) throw new Error('The response did not include a move answer.');

      let choice = answer.choice;
      let corrected = false;
      if (legal.indexOf(choice) === -1) {
        choice = legal[0];
        corrected = true;
      }

      applyMove(choice);
      game.tokens += data.usage ? Number(data.usage.input_tokens || 0) : 0;
      renderBoard();
      renderMove(answer, choice, corrected);
      addLog(choice, answer, corrected);

      if (game.score > 0 && game.score % 10 === 0 && game.score !== game.lastGate) {
        game.lastGate = game.score;
        if (game.autoRun) {
          setSnakeState('AUTO · ' + game.score + ' FOOD');
        } else {
          game.gate = true;
          game.running = false;
          game.paused = true;
          game.inFlight = false;
          setSnakeState('GATE · ' + game.score + ' FOOD');
          const gate = $('#jev-snake-gate');
          if (gate) gate.hidden = false;
          updateSnakeButtons();
          return;
        }
      }
    } catch (err) {
      if (runId !== game.runId) return;
      game.running = false;
      game.paused = false;
      game.inFlight = false;
      game.autoRun = false;
      setSnakeState('ERROR');
      showError(err);
      updateSnakeButtons();
      return;
    }

    if (runId !== game.runId) return;
    game.inFlight = false;

    if (game.running && !game.paused && !game.gameOver) {
      setSnakeState(game.autoRun ? 'AUTO' : 'RUNNING');
      game.timer = setTimeout(() => {
        if (runId === game.runId) stepSnake();
      }, 700);
    } else if (game.gameOver) {
      game.autoRun = false;
      setSnakeState('GAME OVER');
    }
    updateSnakeButtons();
  }

  function startSnake() {
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    if (game.gameOver || (game.steps === 0 && !game.running)) {
      resetGame();
    }
    game.autoRun = false;
    game.running = true;
    game.paused = false;
    game.gate = false;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('RUNNING');
    updateSnakeButtons();
    stepSnake();
  }

  function autoSnake() {
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    if (game.gameOver || (game.steps === 0 && !game.running && !game.paused)) {
      resetGame();
    }
    game.autoRun = true;
    game.running = true;
    game.paused = false;
    game.gate = false;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('AUTO');
    updateSnakeButtons();
    if (!game.inFlight) stepSnake();
  }

  function pauseSnake() {
    if (game.gate) return;
    if (game.running) {
      game.running = false;
      game.paused = true;
      clearTimeout(game.timer);
      game.timer = null;
      setSnakeState('PAUSED');
    } else if (game.paused && !game.gameOver) {
      game.paused = false;
      game.running = true;
      setSnakeState(game.autoRun ? 'AUTO' : 'RUNNING');
      if (!game.inFlight) stepSnake();
    }
    updateSnakeButtons();
  }

  function stopSnake() {
    game.running = false;
    game.paused = false;
    game.gate = false;
    game.autoRun = false;
    clearTimeout(game.timer);
    game.timer = null;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('STOPPED');
    updateSnakeButtons();
  }

  function continueSnake() {
    game.gate = false;
    game.paused = false;
    game.autoRun = false;
    game.running = true;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('RUNNING');
    updateSnakeButtons();
    stepSnake();
  }

  function endSnake() {
    game.gate = false;
    game.paused = false;
    game.autoRun = false;
    game.running = false;
    game.gameOver = true;
    clearTimeout(game.timer);
    game.timer = null;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('ENDED');
    updateSnakeButtons();
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  function bindEvents() {
    $('#jev-key-save').addEventListener('click', () => {
      const value = $('#jev-key-input').value.trim();
      if (!value) {
        showToast('Paste a Jev API key first.');
        return;
      }
      app.key = value;
      store(LS.key, value);
      syncKeyUI();
      showToast('Key saved in this browser.');
    });

    $('#jev-key-clear').addEventListener('click', () => {
      app.key = '';
      forget(LS.key);
      $('#jev-key-input').value = '';
      syncKeyUI();
      showToast('Key removed from this browser.');
    });

    $('#jev-key-toggle').addEventListener('click', () => {
      const input = $('#jev-key-input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('#jev-key-toggle').setAttribute('aria-label', show ? 'Hide key' : 'Show key');
      $('#jev-key-toggle').classList.toggle('is-on', show);
    });

    $('#jev-key-test').addEventListener('click', testConnection);
    $('#jev-error-close').addEventListener('click', clearError);
    $('#jev-error-relay').addEventListener('click', focusRelay);

    $('#jev-relay-input').addEventListener('input', (event) => {
      app.relay = event.target.value.trim();
      store(LS.relay, app.relay);
      renderRelayMeta();
    });

    $('#jev-file-form').addEventListener('submit', classifyFile);
    $('#jev-file-copy').addEventListener('click', () => {
      copyText(JSON.stringify(buildFilePayload(), null, 2), 'Request JSON copied.');
    });
    $$('.jev-sample').forEach((button) => {
      button.addEventListener('click', () => loadSample(button.dataset.sample));
    });

    $('#jev-folder-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const nameInput = $('#jev-new-folder');
      const descInput = $('#jev-new-folder-desc');
      if (!addCustomFolder(nameInput.value, descInput.value)) return;
      nameInput.value = '';
      descInput.value = '';
      renderFolders();
      renderCustomList();
      clearFileResult();
      updateFileJson(buildFilePayload());
      showToast('Folder added.');
      nameInput.focus();
    });

    $('#jev-custom-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-index]');
      if (!button) return;
      removeCustomFolder(Number(button.dataset.removeIndex));
    });

    $('#jev-reset-folders').addEventListener('click', resetCustomFolders);

    $('#jev-snake-start').addEventListener('click', startSnake);
    $('#jev-snake-auto').addEventListener('click', autoSnake);
    $('#jev-snake-pause').addEventListener('click', pauseSnake);
    $('#jev-snake-stop').addEventListener('click', stopSnake);
    $('#jev-snake-reset').addEventListener('click', () => {
      resetGame();
      showToast('New run ready.');
    });
    $('#jev-snake-continue').addEventListener('click', continueSnake);
    $('#jev-snake-auto-gate').addEventListener('click', autoSnake);
    $('#jev-snake-end').addEventListener('click', endSnake);
    $('#jev-snake-copy').addEventListener('click', () => {
      const payload = buildSnakePayload(legalMoves());
      copyText(JSON.stringify(payload, null, 2), 'Request JSON copied.');
    });
  }

  function init() {
    readStored();
    syncKeyUI();
    loadCustomFolders();
    renderFolders();
    renderCustomList();
    syncRelayUI();
    resetGame();
    bindEvents();
    updateFileJson(buildFilePayload());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

</script>
