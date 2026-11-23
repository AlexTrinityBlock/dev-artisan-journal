---
title: "Search, Then Get: The Two Modules of Agent Memory"
description: "A close reading of 'Is Grep All You Need?' through a simpler lens: agent memory is two operations, not one. Search turns a cue into handles; Get turns a handle into exact bytes — and the paper's harness effects follow from which of the two the interface preserves."
pubDate: 2026-11-23
category: "AI"
tags: ["Agents", "Memory", "RAG", "Retrieval", "PaperNotes"]
featured: false
author: "Alex.Hsiao"
readTime: "18 min read"
---

# Search, Then Get: The Two Modules of Agent Memory

The most useful result in “Is Grep All You Need?” is not that grep wins. It is that the harness can erase the win without touching the corpus.

The paper runs 116 long-memory questions across five models, four harnesses, two retrieval modes, and two delivery paths. Inline, grep beats vector in all ten harness-model pairs. Move the same results into files and the advantage disappears: the ten-pair average becomes a tie, and vector wins five of ten. One model moves 16.4 points when only the harness changes — more than the 1.7-point gap between grep and vector in that same row.

Read as a retriever contest, those numbers are confusing. Read as an interface problem, they are almost mechanical.

The interface has two verbs. **Search** takes a partial cue and returns a bounded list of candidate addresses. **Get** takes one address and returns the exact bytes stored there. Search is how an agent discovers that something exists. Get is how it reads what exists.

`grep -n` is Search, and its output is a list of `path:line` handles. `sed -n '40,60p' file` is Get. They compose because the first emits exactly what the second consumes. Vector retrieval is often shipped as Search alone: top-k chunks arrive inline, with no address to revisit and nothing further to open.

Grep is not all you need. Grep is two things you need, wearing one name.

## Two verbs, one memory

Search is set-valued. It accepts a cue — a literal, a regex, a natural-language question, a metadata filter — and returns candidates. It is allowed to be approximate, ranked, and bounded. Its job is recall under a budget, not truth.

Get is singular. It accepts one address and returns the bytes at that address, or a definite miss. It is the primary-key lookup of memory: address in, record out. It is not allowed to rank, summarize, or substitute a near neighbor. Its job is resolution.

The unit that joins them is the **handle**: a stable name for a stored span. `src/auth/session.ts:42`, `orders/1841#L12`, `4f2c9a1:docs/spec.md`, `chunk_01H8...`, `message 118`. A handle is not the content. It is the promise that the content can be produced again.

A retrieval result that cannot be resolved again is not memory. It is a quotation.

Top-k chunks pasted into a prompt are quotations. They may answer the current question. They cannot be revisited, widened, or checked against a newer version. A grep hit with a file and a line number is a memory: the agent can leave, do something else, and come back to the same bytes.

The loop is what browsing means: cue → Search → handles → choose → Get → evidence → new cue. A library without a catalog is unusable; a catalog without shelves is a bibliography. An agent needs both halves.

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">MEMORY MAP // 01</span>
    <h3 class="mem-fig-title">One memory, two different reductions</h3>
    <p class="mem-fig-sub">Search reduces the corpus to addresses. Get reduces an address to bytes. The loop composes them.</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 496" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">The two modules of agent memory</title>
    <desc id="mem-f1-desc">Search takes a cue and returns a ranked list of handles. Get takes one handle and returns the exact bytes at that address. A dashed loop carries evidence back into a new cue.</desc>
    <defs>
      <marker id="mem-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">MEMORY // TWO MODULES</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">CUE → HANDLE → BYTES</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / SEARCH</text>
    <text x="448" y="46" class="f" font-size="7" letter-spacing="1.1">02 / GET</text>
    <rect x="24" y="58" width="368" height="332" class="box"/>
    <text x="40" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="40" y="98" class="m" font-size="7.5">cue in · candidates out · one-to-many</text>
    <text x="376" y="88" class="f" font-size="18" text-anchor="end">01</text>
    <rect x="40" y="110" width="336" height="50" class="term"/>
    <text x="50" y="124" class="f" font-size="6.5" letter-spacing="0.8">CUE</text>
    <text x="50" y="139" class="t mono" font-size="7.2">"refund window"  ·  /retry.*budget/</text>
    <text x="50" y="151" class="m mono" font-size="7.2">vector(q)  ·  path:src/**  ·  after:2026-01-01</text>
    <line x1="208" y1="160" x2="208" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="40" y="178" width="336" height="84" class="box"/>
    <text x="50" y="192" class="f" font-size="6.5" letter-spacing="0.8">INSTRUMENTS</text>
    <rect x="50" y="200" width="102" height="28" class="term"/>
    <text x="101" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">GREP</text>
    <text x="101" y="222" class="m mono" font-size="6.2" text-anchor="middle">regex · literal</text>
    <rect x="160" y="200" width="102" height="28" class="term"/>
    <text x="211" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">BM25</text>
    <text x="211" y="222" class="m mono" font-size="6.2" text-anchor="middle">term frequency</text>
    <rect x="270" y="200" width="96" height="28" class="term"/>
    <text x="318" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">VECTOR</text>
    <text x="318" y="222" class="m mono" font-size="6.2" text-anchor="middle">ANN · meaning</text>
    <text x="50" y="250" class="m" font-size="6.8">filters · dates · paths · globs</text>
    <line x1="208" y1="262" x2="208" y2="276" class="arrow" marker-end="url(#mem-arrow)"/>
    <text x="40" y="292" class="f" font-size="6.5" letter-spacing="0.8">HANDLES // N = 3</text>
    <text x="376" y="292" class="f" font-size="6.5" text-anchor="end" letter-spacing="0.8">RANKED</text>
    <rect x="40" y="300" width="336" height="20" fill="var(--mono-l1)"/>
    <text x="50" y="313" fill="var(--mono-paper)" class="mono" font-size="7">01</text>
    <text x="66" y="313" fill="var(--mono-paper)" class="mono" font-size="7">policies/2026-returns.md:12</text>
    <text x="366" y="313" fill="var(--mono-paper)" class="mono" font-size="6.5" text-anchor="end">0.94</text>
    <rect x="40" y="324" width="336" height="20" class="box"/>
    <text x="50" y="337" class="m mono" font-size="7">02</text>
    <text x="66" y="337" class="t mono" font-size="7">policies/returns-2024.md:41</text>
    <text x="366" y="337" class="m mono" font-size="6.5" text-anchor="end">0.89</text>
    <rect x="40" y="348" width="336" height="20" class="box"/>
    <text x="50" y="361" class="m mono" font-size="7">03</text>
    <text x="66" y="361" class="t mono" font-size="7">tickets/8841.json:7</text>
    <text x="366" y="361" class="m mono" font-size="6.5" text-anchor="end">0.81</text>
    <text x="40" y="382" class="m" font-size="6.8">set-valued · ranked · budgeted · may return nothing</text>
    <rect x="448" y="58" width="368" height="332" class="box"/>
    <text x="464" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="464" y="98" class="m" font-size="7.5">one handle in · exact bytes out · one-to-one</text>
    <text x="800" y="88" class="f" font-size="18" text-anchor="end">02</text>
    <rect x="464" y="110" width="336" height="50" class="term"/>
    <text x="474" y="124" class="f" font-size="6.5" letter-spacing="0.8">ONE HANDLE</text>
    <text x="474" y="139" class="t mono" font-size="7.2">policies/2026-returns.md:12</text>
    <text x="474" y="151" class="m mono" font-size="6.8">resolved from 3 candidates · no re-search</text>
    <line x1="632" y1="160" x2="632" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="464" y="178" width="336" height="84" class="box"/>
    <text x="474" y="192" class="f" font-size="6.5" letter-spacing="0.8">RESOLVE → READ → RETURN</text>
    <rect x="474" y="200" width="100" height="28" class="term"/>
    <text x="524" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">RESOLVE</text>
    <text x="524" y="222" class="m mono" font-size="6.2" text-anchor="middle">address</text>
    <rect x="584" y="200" width="100" height="28" class="term"/>
    <text x="634" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">READ</text>
    <text x="634" y="222" class="m mono" font-size="6.2" text-anchor="middle">range</text>
    <rect x="694" y="200" width="96" height="28" class="term"/>
    <text x="742" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">RETURN</text>
    <text x="742" y="222" class="m mono" font-size="6.2" text-anchor="middle">bytes</text>
    <text x="474" y="250" class="m" font-size="6.8">accepts the handle verbatim · fails closed</text>
    <text x="464" y="292" class="f" font-size="6.5" letter-spacing="0.8">EXACT BYTES // L12–L15</text>
    <text x="800" y="292" class="f" font-size="6.5" text-anchor="end" letter-spacing="0.8">ONE RECORD</text>
    <rect x="464" y="298" width="336" height="62" class="codebox"/>
    <text x="476" y="314" class="m mono" font-size="7.2">12  ## Returns</text>
    <text x="476" y="328" class="t mono" font-size="7.2">13  Refunds are accepted within 14 days</text>
    <text x="476" y="342" class="t mono" font-size="7.2">14  of delivery. Opened software is final sale.</text>
    <text x="476" y="356" class="m mono" font-size="6.8">15  Effective: 2026-01-01 · Status: current</text>
    <text x="464" y="382" class="m" font-size="6.8">singular · deterministic · no ranking</text>
    <path d="M394 310 H420 V135 H440" class="arrow" fill="none" marker-end="url(#mem-arrow)"/>
    <path d="M632 394 V414 H208 V396" class="dash" fill="none" marker-end="url(#mem-arrow-muted)"/>
    <text x="420" y="428" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">EVIDENCE → NEW CUE · SEARCH AGAIN</text>
    <rect x="24" y="442" width="792" height="38" class="codebox"/>
    <text x="40" y="458" class="t mono" font-size="7.5" font-weight="700">SEARCH = corpus → addresses.   GET = address → exact bytes.</text>
    <text x="40" y="471" class="m" font-size="7">The loop, not the index, is what makes the memory browsable.</text>
  </svg>
  </div>
  <div class="mem-fig-src">TWO-MODULE MEMORY · SEARCH / GET · HANDLE-CENTRIC LOOP</div>
</figure>

Search reduces the corpus to addresses. Get reduces an address to bytes. The loop composes the two reductions.

## What the paper measured

The study varies retrieval mode, harness, and delivery path. The task is the 116-question LongMemEval-S subset: multi-session chat questions spanning knowledge updates, multi-session aggregation, assistant-generated content, user preferences, user facts, and temporal reasoning. Each question comes with oracle sessions and a variable number of distractors. The corpus is fixed. The retrievers are grep over raw text and vector search with reranking. The harnesses are a custom agent (Chronos) and three provider CLIs (Claude Code, Codex, Gemini CLI). The delivery paths are inline tool messages and files the agent must open.

In the inline condition, grep is ahead in every one of the ten harness-model pairs. The unweighted mean across those pairs is 83.8 against 72.5, an 11.3-point gap. The largest margin is Gemini 3.1 Flash-Lite on Chronos: 86.2 against 62.9. The smallest is Claude Opus 4.6 on Claude Code: 76.7 against 75.0.

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">EXPERIMENT 1 // 02</span>
    <h3 class="mem-fig-title">All ten inline pairs tilt toward grep</h3>
    <p class="mem-fig-sub">Each row is one model in one harness. Hollow dots are vector, solid dots are grep. The gap ranges from 1.7 to 23.3 points.</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 470" role="img" aria-labelledby="mem-f2-title mem-f2-desc">
    <title id="mem-f2-title">Inline grep and vector accuracy by harness and model</title>
    <desc id="mem-f2-desc">A dumbbell chart of ten harness-model pairs. Grep is higher than vector in every pair, from a 1.7-point gap to a 23.3-point gap. The unweighted means are 83.8 for grep and 72.5 for vector.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">EXPERIMENT 1 // INLINE DELIVERY</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ACCURACY % · LONGMEMEVAL-S 116Q</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="50" class="t" font-size="12.5" font-weight="800" letter-spacing="-0.01em">Grep leads every inline pair</text>
    <text x="24" y="66" class="m" font-size="7.5">The line is the gap. The dots are the scores.</text>
    <g class="f" font-size="6.5">
      <circle cx="690" cy="62" r="3.2" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <text x="699" y="65" class="m">VECTOR</text>
      <circle cx="748" cy="62" r="3.7" fill="var(--mono-ink)"/>
      <text x="757" y="65" class="t">GREP</text>
    </g>
    <g class="f" font-size="6.3" text-anchor="middle">
      <line x1="270" y1="90" x2="270" y2="382" class="rule"/>
      <line x1="358.3" y1="90" x2="358.3" y2="382" class="rule"/>
      <line x1="446.7" y1="90" x2="446.7" y2="382" class="rule"/>
      <line x1="535" y1="90" x2="535" y2="382" class="rule"/>
      <line x1="623.3" y1="90" x2="623.3" y2="382" class="rule"/>
      <line x1="711.7" y1="90" x2="711.7" y2="382" class="rule"/>
      <line x1="800" y1="90" x2="800" y2="382" class="rule"/>
      <text x="270" y="396">40</text>
      <text x="358.3" y="396">50</text>
      <text x="446.7" y="396">60</text>
      <text x="535" y="396">70</text>
      <text x="623.3" y="396">80</text>
      <text x="711.7" y="396">90</text>
      <text x="800" y="396">100</text>
    </g>
    <g>
      <text x="24" y="114.5" class="t" font-size="7.6"><tspan font-weight="700">Claude Opus 4.6</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Chronos</tspan></text>
      <line x1="655.1" y1="112" x2="739.0" y2="112" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="655.1" cy="112" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="739.0" cy="112" r="4.1" fill="var(--mono-ink)"/>
      <text x="648.1" y="114.2" class="m mono" font-size="6.3" text-anchor="end">83.6</text>
      <text x="746.0" y="114.2" class="t mono" font-size="6.5" font-weight="700">93.1</text>
    </g>
    <g>
      <text x="24" y="142.5" class="t" font-size="7.6"><tspan font-weight="700">Claude Opus 4.6</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Claude Code</tspan></text>
      <line x1="579.2" y1="140" x2="594.2" y2="140" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="579.2" cy="140" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="594.2" cy="140" r="4.1" fill="var(--mono-ink)"/>
      <text x="572.2" y="142.2" class="m mono" font-size="6.3" text-anchor="end">75.0</text>
      <text x="601.2" y="142.2" class="t mono" font-size="6.5" font-weight="700">76.7</text>
    </g>
    <g>
      <text x="24" y="170.5" class="t" font-size="7.6"><tspan font-weight="700">Claude Haiku 4.5</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Chronos</tspan></text>
      <line x1="594.2" y1="168" x2="655.1" y2="168" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="594.2" cy="168" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="655.1" cy="168" r="4.1" fill="var(--mono-ink)"/>
      <text x="587.2" y="170.2" class="m mono" font-size="6.3" text-anchor="end">76.7</text>
      <text x="662.1" y="170.2" class="t mono" font-size="6.5" font-weight="700">83.6</text>
    </g>
    <g>
      <text x="24" y="198.5" class="t" font-size="7.6"><tspan font-weight="700">Claude Haiku 4.5</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Claude Code</tspan></text>
      <line x1="305.3" y1="196" x2="404.3" y2="196" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="305.3" cy="196" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="404.3" cy="196" r="4.1" fill="var(--mono-ink)"/>
      <text x="298.3" y="198.2" class="m mono" font-size="6.3" text-anchor="end">44.0</text>
      <text x="411.3" y="198.2" class="t mono" font-size="6.5" font-weight="700">55.2</text>
    </g>
    <g>
      <text x="24" y="226.5" class="t" font-size="7.6"><tspan font-weight="700">GPT-5.4</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Chronos</tspan></text>
      <line x1="640.1" y1="224" x2="709.0" y2="224" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="640.1" cy="224" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="709.0" cy="224" r="4.1" fill="var(--mono-ink)"/>
      <text x="633.1" y="226.2" class="m mono" font-size="6.3" text-anchor="end">81.9</text>
      <text x="716.0" y="226.2" class="t mono" font-size="6.5" font-weight="700">89.7</text>
    </g>
    <g>
      <text x="24" y="254.5" class="t" font-size="7.6"><tspan font-weight="700">GPT-5.4</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Codex CLI</tspan></text>
      <line x1="587.1" y1="252" x2="739.0" y2="252" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="587.1" cy="252" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="739.0" cy="252" r="4.1" fill="var(--mono-ink)"/>
      <text x="580.1" y="254.2" class="m mono" font-size="6.3" text-anchor="end">75.9</text>
      <text x="746.0" y="254.2" class="t mono" font-size="6.5" font-weight="700">93.1</text>
    </g>
    <g>
      <text x="24" y="282.5" class="t" font-size="7.6"><tspan font-weight="700">Gemini 3.1 Pro</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Chronos</tspan></text>
      <line x1="648.1" y1="280" x2="724.0" y2="280" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="648.1" cy="280" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="724.0" cy="280" r="4.1" fill="var(--mono-ink)"/>
      <text x="641.1" y="282.2" class="m mono" font-size="6.3" text-anchor="end">82.8</text>
      <text x="731.0" y="282.2" class="t mono" font-size="6.5" font-weight="700">91.4</text>
    </g>
    <g>
      <text x="24" y="310.5" class="t" font-size="7.6"><tspan font-weight="700">Gemini 3.1 Pro</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Gemini CLI</tspan></text>
      <line x1="579.2" y1="308" x2="640.1" y2="308" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="579.2" cy="308" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="640.1" cy="308" r="4.1" fill="var(--mono-ink)"/>
      <text x="572.2" y="310.2" class="m mono" font-size="6.3" text-anchor="end">75.0</text>
      <text x="647.1" y="310.2" class="t mono" font-size="6.5" font-weight="700">81.9</text>
    </g>
    <g>
      <text x="24" y="338.5" class="t" font-size="7.6"><tspan font-weight="700">Gemini 3.1 Flash-Lite</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Chronos</tspan></text>
      <line x1="472.3" y1="336" x2="678.1" y2="336" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="472.3" cy="336" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="678.1" cy="336" r="4.1" fill="var(--mono-ink)"/>
      <text x="465.3" y="338.2" class="m mono" font-size="6.3" text-anchor="end">62.9</text>
      <text x="685.1" y="338.2" class="t mono" font-size="6.5" font-weight="700">86.2</text>
    </g>
    <g>
      <text x="24" y="366.5" class="t" font-size="7.6"><tspan font-weight="700">Gemini 3.1 Flash-Lite</tspan><tspan fill="var(--mono-muted)" font-weight="400"> · Gemini CLI</tspan></text>
      <line x1="510.3" y1="364" x2="686.0" y2="364" stroke="var(--mono-l6)" stroke-width="0.8"/>
      <circle cx="510.3" cy="364" r="3.3" fill="var(--mono-paper)" stroke="var(--mono-l2)" stroke-width="1"/>
      <circle cx="686.0" cy="364" r="4.1" fill="var(--mono-ink)"/>
      <text x="503.3" y="366.2" class="m mono" font-size="6.3" text-anchor="end">67.2</text>
      <text x="693.0" y="366.2" class="t mono" font-size="6.5" font-weight="700">87.1</text>
    </g>
    <text x="270" y="418" class="f" font-size="6.5" letter-spacing="0.8">ACCURACY (%)</text>
    <rect x="24" y="428" width="792" height="34" class="codebox"/>
    <text x="40" y="444" class="t mono" font-size="7.3">MEAN ACROSS TEN PAIRS: GREP 83.8 · VECTOR 72.5 · GAP +11.3</text>
    <text x="40" y="456" class="m mono" font-size="6.9">FILE-BASED DELIVERY: GREP 72.5 · VECTOR 72.4 · VECTOR WINS 5 OF 10</text>
  </svg>
  </div>
  <div class="mem-fig-src">ARXIV:2605.15184 · TABLE 1 · LONGMEMEVAL-S 116Q · GPT-4O GRADER</div>
</figure>

The interesting number is not the gap. It is the harness row. Claude Opus 4.6 scores 93.1 under Chronos and 76.7 under Claude Code. That is a 16.4-point move from changing the orchestration layer, with the same model, the same corpus, and the same retriever. The retriever changes the score by 1.7 points in that row. A leaderboard that reports only retrieval mode is measuring the smaller effect.

File-based delivery then produces something that looks like a retriever result but is really a workflow result. The unweighted means converge: 72.5 for grep, 72.4 for vector. Vector wins five of ten pairs. Codex with GPT-5.4 drops from 93.1 inline grep to 55.2 programmatic grep — a 37.9-point fall — while its programmatic vector score is 67.2. The grep tool did not get worse. Each hit became a file to locate, open, and integrate, and that second stage failed often enough to eat the entire retrieval advantage.

| Where file-based delivery flips the winner | grep | vector | Δ (vector − grep) |
| :--- | ---: | ---: | ---: |
| Claude Opus 4.6 · Chronos | 80.2 | 81.9 | +1.7 |
| Claude Opus 4.6 · Claude Code | 68.1 | 79.3 | +11.2 |
| GPT-5.4 · Codex CLI | 55.2 | 67.2 | +12.0 |
| Gemini 3.1 Pro · Gemini CLI | 81.0 | 82.8 | +1.8 |
| Gemini 3.1 Flash-Lite · Gemini CLI | 68.1 | 74.1 | +6.0 |

Only the five flipped pairs are shown. The other five remain grep-ahead under file-based delivery.

Experiment 2 adds distractors in fixed session-limit steps (s5, s10, s20, s30, full). The curves are not monotone. Chronos with Opus is vector-ahead at s5 through s20 and again at full, but grep is ahead at s30, 85.3 against 84.5. Claude Code with Opus favors grep at every setting. Gemini CLI with Gemini 3.1 Pro favors vector at every setting, and the gap widens to 89.7 against 78.5 at full. The paper's own summary is that both methods degrade only mildly as noise grows, but the ordering depends on harness and backbone.

That is what a two-module model predicts. More distractors raise the value of a precise Search, but only if Get lets the agent confirm the literal span. If Get is expensive, the first result set is effectively the whole memory, and coverage-first retrieval holds up better. The paper does not measure that mechanism directly. It is a reading, not a result.

## Why inline grep wins

Three properties, and only the first is about lexical matching.

1. **The handle arrives with the content.** A grep hit is `path:line:text`. The agent gets a preview and an address in the same token. It can Get the surrounding range immediately, without another Search. An inline vector result is often a chunk with a score; the address, if it exists, is metadata the model may never see.

2. **Failure is legible.** A bad regex returns nothing, or returns an obvious mismatch. The agent knows to try another pattern. A bad embedding returns a plausible neighbor. The model has no signal that the right passage exists and was missed. Dense retrieval fails quietly, which is the worst way for a memory system to fail.

3. **The agent controls the query.** The model writes the pattern: it can anchor it, loosen it, add a file glob, or switch to another directory. In a vector tool, the query is re-encoded behind an interface the agent cannot inspect. It can only rephrase and hope.

None of this makes lexical matching universally better. It makes lexical matching a better *Search* when the evidence is literal and the handle is preserved. The paper's limitations section says the same thing in different words: LongMemEval answers often license on verbatim spans, and the result should not be generalized to paraphrase-heavy or multimodal corpora.

The Codex collapse is the counterexample that shows why the pair matters. Search was fine: the same grep tool, over the same corpus, found the same kind of hits. Get became a three-step workflow. The model had to notice a file path, open it, find the relevant region, and keep the state straight across turns. When that loop is unreliable, a 93.1% retriever produces a 55.2% answer. Retrieval quality is necessary; it is not the product.

The harness is not a wrapper around memory. It is the shape of memory.

## The handle contract

Once Search returns handles, the hard part moves to the handle. A good handle has five properties.

1. **Stable.** The same handle resolves to the same bytes for the life of the task. If the store mutates, the handle carries a version.

2. **Resolvable.** Get accepts it verbatim. No second Search, no fuzzy match, no guessing.

3. **Granular.** It addresses a span, not a whole document. `path:41-58`, not `path`.

4. **Cheap to mint.** Search must be able to return dozens without spending the context budget.

5. **Legible.** A human can read it in a log and know where it points. This is not required for correctness, but it is required for debugging.

| Store | Search returns | Get resolves | Staleness mode |
| :--- | :--- | :--- | :--- |
| Files | `path:line` | a line or byte range | the file is edited, so lines drift |
| Git | `commit:path:line` | `git show commit:path` | history is rewritten or objects are pruned |
| SQL | a primary key or row ID | `SELECT … WHERE id = ?` | the row is updated or deleted |
| Web | a URL plus fragment | an HTTP GET | the page changes or returns 404 |
| Vector index | a chunk ID plus offsets | fetch by ID | re-indexing or a model swap renumbers |
| Conversation | a message ID or turn index | fetch that turn | compaction rewrites the transcript |

The table also shows where memory rots. Every family has a staleness mode, and agents hit it faster than ordinary applications because the corpus is often the context window itself. Compaction rewrites history. Re-indexing renumbers chunks. A file edit shifts every line after it. The agent's notes — the handles it saved three turns ago — become dead links.

Link rot in agent memory is not a cosmetic problem. If the agent cannot resolve a handle it wrote down, it must either re-Search, spending a turn and possibly getting a different answer, or answer from the stale preview, spending correctness. A memory system should make that choice explicit: either the handle is versioned, or Get returns a mismatch instead of silently resolving to different bytes.

A handle that resolves to the wrong bytes is worse than a 404. A 404 is at least honest.

## The loop as a budget

Search and Get have different cost curves. Search costs a scan or an index probe plus one model turn to read the shortlist. Get costs the bytes returned plus one model turn to read them. The first scales with the corpus; the second scales with what you choose to read.

The efficient policy is therefore asymmetric: Search wide and cheap, Get narrow and exact. The common failure is the reverse — one narrow Search, then a whole-file Get. That is how an agent spends 40,000 tokens to answer a question whose evidence was one paragraph.

```python
def browse(cue, memory, budget):
    seen, evidence = set(), []
    while budget.left():
        hits = memory.search(cue, k=8)          # handles, not copies
        fresh = [h for h in hits if h.id not in seen]
        if not fresh:
            break
        for h in fresh[:3]:
            seen.add(h.id)
            span = memory.get(h, window=40)     # exact bytes at the address
            evidence.append(span)
            cue = next_cue(cue, span)           # a new term, date, or ID
    return evidence
```

Three details matter. `hits` is a list of handles, not passages; the preview is for ranking, not for evidence. `memory.get` takes a window, so the agent can widen the context around a hit without reading the whole file. `next_cue` closes the loop: the record itself supplies the next search term, which is what makes the process browsing rather than querying.

The stopping rule is not “k results read”. It is “no new handles” or “every claim has a resolved source”. A loop that stops at k has turned memory back into a quotation service.

What to measure follows from the loop: searches per answer, gets per search, unique handles, dead-handle rate, and re-search rate. Accuracy alone cannot tell you whether the memory is browsable. A system that returns high scores but few resolvable handles is a search engine, not a memory.

## The memory desk

The desk below makes the division visible. The cue matches three records. Search ranks them. Get reads them. Only one is the current policy.

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">MEMORY DESK // 03</span>
    <h3 class="mem-fig-title">Three handles match. One record is current.</h3>
    <p class="mem-fig-sub">Select a search result, then read what Get actually returns. Search ranks; Get decides.</p>
  </figcaption>
  <div class="mem-query">
    <span class="mem-query-tag">CUE</span>
    <code>"refund window"</code>
    <span class="mem-query-meta">support corpus · 4,812 records</span>
  </div>
  <div class="mem-desk">
    <div class="mem-results">
      <div class="mem-col-head">SEARCH // 3 HANDLES</div>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h1" checked>
        <span class="mem-rank">01</span>
        <span class="mem-addr">policies/returns-2024.md:41</span>
        <span class="mem-score">0.94</span>
        <span class="mem-snippet">Refunds are accepted within 30 days of delivery…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h2">
        <span class="mem-rank">02</span>
        <span class="mem-addr">policies/2026-returns.md:12</span>
        <span class="mem-score">0.89</span>
        <span class="mem-snippet">Refunds are accepted within 14 days of delivery…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h3">
        <span class="mem-rank">03</span>
        <span class="mem-addr">tickets/8841.json:7</span>
        <span class="mem-score">0.81</span>
        <span class="mem-snippet">customer asked about the refund window and was told 30 days…</span>
      </label>
    </div>
    <div class="mem-read">
      <div class="mem-col-head">GET // EXACT BYTES</div>
      <div class="mem-doc mem-doc--a">
        <div class="mem-doc-head"><span>policies/returns-2024.md</span><span>L41–L46</span></div>
        <pre>41  ## Returns
42
43  Refunds are accepted within 30 days
44  of delivery. Opened software is final
45  sale.
46  Effective: 2024-03-01 · Status: superseded</pre>
      </div>
      <div class="mem-doc mem-doc--b">
        <div class="mem-doc-head"><span>policies/2026-returns.md</span><span>L12–L17</span></div>
        <pre>12  ## Returns
13
14  Refunds are accepted within 14 days
15  of delivery. Opened software is final
16  sale.
17  Effective: 2026-01-01 · Status: current</pre>
      </div>
      <div class="mem-doc mem-doc--c">
        <div class="mem-doc-head"><span>tickets/8841.json</span><span>L7–L10</span></div>
        <pre>7   "customer asked about the refund window
8    and was told 30 days. Is that still
9    right?"
10  source: null · ticket, not policy</pre>
      </div>
    </div>
  </div>
  <div class="mem-verdict mem-verdict--a">
    <b>STALE VERSION</b>
    <p>The bytes are real. The policy was superseded on 2026-01-01. Rank 01 was the most similar record, not the current one.</p>
  </div>
  <div class="mem-verdict mem-verdict--b">
    <b>CURRENT SOURCE</b>
    <p>The record carries its own effective date and status. Get can decide because the bytes describe themselves. Search could not.</p>
  </div>
  <div class="mem-verdict mem-verdict--c">
    <b>MENTION, NOT SOURCE</b>
    <p>The snippet repeats the phrase. It does not define the rule. A handle can resolve to a record that should never be cited.</p>
  </div>
  <div class="mem-fig-src">SCHEMATIC · PURE CSS · NO JAVASCRIPT</div>
</figure>

The top-ranked hit is the stale one. That is not a bug in Search; it is the boundary of what ranking can know. The current policy is shorter, uses a different phrase, and ranks second. Get settles it because the record carries its own effective date and status.

If the record did not carry that metadata, Get would return bytes and the agent would still be guessing. A handle resolves a location. Provenance resolves a meaning.

## What this changes in practice

- Make every Search result carry a handle Get can consume. `path:line`, `doc_id#anchor`, `table:pk`, `commit:path:line`.

- Make Get a first-class tool, not a hidden step inside Search. It should accept the handle verbatim and return exact bytes or a definite miss.

- Let Get take a range. A whole-file read is how a memory system becomes a context leak.

- Keep handles stable across compaction and re-indexing. Version them when the store mutates, and fail loudly on a mismatch.

- Give Search more than one instrument. Literal search for known items, semantic search for paraphrase, filters for structure. Let the agent choose with a policy hint, not a hard-coded pipeline.

- Treat previews as previews. If the snippet is all the model ever sees, it will answer from the snippet.

- Put provenance inside the record. Effective dates, status, source type, and version belong in the bytes Get returns, not in a side channel the agent cannot see.

- Report the harness with the retriever. A score without the delivery path and stop policy is not reproducible.

## What the paper does not say

It does not say grep beats vector in general. The authors are explicit: the task rewards literal spans, and scientific synthesis, paraphrase-heavy abstracts, visual documents, and code semantics may favor dense retrieval or a hybrid.

The harness is both a variable and a confound. Chronos uses category-conditioned prompts and a controlled tool surface; the CLIs bring their own ergonomics. The 16.4-point harness shift is real, but it is not a clean estimate of “harness quality”.

File-based delivery is a workflow test, not a pure delivery test. It changes the number of turns, the failure surface, and the model's opportunity to lose state. The Codex collapse is evidence about the loop, not about grep.

The noise experiment is not monotone, and the paper does not isolate query strings or retrieved sets. The crossings are measured; the mechanism is inferred.

Most importantly, the paper measures answer accuracy, not memory. It does not test whether an agent can return to a source tomorrow, widen it, cite it, or detect that it changed. Those are the properties the two-module frame is about. A benchmark for memory would need to measure them directly.

Grep is not all you need. Grep is a pair. The question is not which index you install; it is whether your memory exposes both verbs.

Search finds the address. Get reads the shelf. The loop is what makes it memory.

## References

- [Is Grep All You Need? How Agent Harnesses Reshape Agentic Search](https://arxiv.org/abs/2605.15184) — the paper under discussion: 116 LongMemEval-S questions, four harnesses, two retrievers, two delivery paths.
- [LongMemEval](https://arxiv.org/abs/2410.10813) — the long-term conversational memory benchmark used in both experiments.
- [Chronos](https://arxiv.org/abs/2603.16862) — the custom harness and structured temporal-event layer.
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401) — the retrieve-then-generate pipeline this article is arguing about.
- [MemGPT](https://arxiv.org/abs/2310.08560) — memory as an operating system, with paging between context and storage.
- [Lost in the Middle](https://arxiv.org/abs/2307.03172) — why more retrieved text is not automatically more usable.
- [grep, POSIX](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html) — the tool whose output shape this article treats as an interface.

<style>
  .prose-inner .mem-fig,
  .prose-inner .mem-lab {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .mem-fig figcaption,
  .prose-inner .mem-lab figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .mem-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .mem-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .mem-fig-src {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  .prose-inner .mem-scroll {
    overflow-x: auto;
  }

  .prose-inner .mem-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .mem-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .mem-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .mem-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .mem-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .mem-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .mem-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .mem-svg .term {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .mem-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .mem-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .mem-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .mem-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  .prose-inner .mem-query {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 10px;
    padding: 10px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-bg-subtle);
    margin-bottom: 12px;
  }

  .prose-inner .mem-query-tag {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
  }

  .prose-inner .mem-query code {
    font-family: var(--mono-font-mono);
    font-size: 11px;
    font-weight: 700;
    color: var(--mono-ink);
    background: transparent;
    padding: 0;
  }

  .prose-inner .mem-query-meta {
    margin-left: auto;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    letter-spacing: 0.04em;
    color: var(--mono-muted);
  }

  .prose-inner .mem-desk {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .prose-inner .mem-col-head {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
    margin-bottom: 6px;
  }

  .prose-inner .mem-hit {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    gap: 2px 8px;
    padding: 9px 10px;
    margin-bottom: 6px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease;
  }

  .prose-inner .mem-hit:last-child {
    margin-bottom: 0;
  }

  .prose-inner .mem-hit input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .prose-inner .mem-rank {
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    color: var(--mono-faint);
  }

  .prose-inner .mem-addr {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 700;
    color: var(--mono-ink);
    word-break: break-all;
  }

  .prose-inner .mem-score {
    font-family: var(--mono-font-mono);
    font-size: 7px;
    color: var(--mono-muted);
    text-align: right;
  }

  .prose-inner .mem-snippet {
    grid-column: 2 / 4;
    font-size: 10.5px;
    line-height: 1.45;
    color: var(--mono-muted);
  }

  .prose-inner .mem-hit:has(input:checked) {
    background: var(--mono-l1);
    border-color: var(--mono-l1);
  }

  .prose-inner .mem-hit:has(input:checked) .mem-rank,
  .prose-inner .mem-hit:has(input:checked) .mem-score {
    color: var(--mono-l5);
  }

  .prose-inner .mem-hit:has(input:checked) .mem-addr {
    color: var(--mono-paper);
  }

  .prose-inner .mem-hit:has(input:checked) .mem-snippet {
    color: var(--mono-l6);
  }

  .prose-inner .mem-read {
    min-height: 208px;
    padding: 10px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-bg-subtle);
  }

  .prose-inner .mem-doc {
    display: none;
  }

  .prose-inner .mem-lab:has(#mem-h1:checked) .mem-doc--a,
  .prose-inner .mem-lab:has(#mem-h2:checked) .mem-doc--b,
  .prose-inner .mem-lab:has(#mem-h3:checked) .mem-doc--c {
    display: block;
  }

  .prose-inner .mem-doc-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    letter-spacing: 0.03em;
    color: var(--mono-muted);
  }

  .prose-inner .mem-doc pre {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow-x: auto;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    line-height: 1.65;
    color: var(--mono-l2);
  }

  .prose-inner .mem-verdict {
    display: none;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 0.7px solid var(--mono-grid);
  }

  .prose-inner .mem-lab:has(#mem-h1:checked) .mem-verdict--a,
  .prose-inner .mem-lab:has(#mem-h2:checked) .mem-verdict--b,
  .prose-inner .mem-lab:has(#mem-h3:checked) .mem-verdict--c {
    display: block;
  }

  .prose-inner .mem-verdict b {
    display: block;
    margin-bottom: 3px;
    font-family: var(--mono-font-mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--mono-ink);
  }

  .prose-inner .mem-verdict p {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .mem-verdict--a b,
  .prose-inner .mem-verdict--c b {
    color: var(--mono-muted);
  }

  @media (max-width: 700px) {
    .prose-inner .mem-svg {
      min-width: 680px;
    }

    .prose-inner .mem-desk {
      grid-template-columns: 1fr;
    }

    .prose-inner .mem-read {
      min-height: 0;
    }

    .prose-inner .mem-query-meta {
      margin-left: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prose-inner .mem-hit {
      transition: none;
    }
  }
</style>
