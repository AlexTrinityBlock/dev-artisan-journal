---
title: "Raw History Is the Memory System: What a Naive RAG Baseline Exposes"
description: "A close reading of arXiv:2610.30755: the deliberately simple Raw-RAG baseline does no summarization, graph-building, or memory rewriting. It only indexes raw history, retrieves 128 candidates, reranks to 15, and answers — yet it beat other memory systems in six of seven evaluation settings, where each setting pairs one benchmark with one reader model."
pubDate: 2026-11-11
category: "AI"
tags: ["RAG", "Memory", "LLM", "PaperNotes", "Retrieval"]
featured: false
author: "Alex.Hsiao"
readTime: "25 min read"
---

# Raw History Is the Memory System: What a Naive RAG Baseline Exposes

<svg class="ragx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="ragx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="ragx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="ragx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="ragx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="ragx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="ragx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="ragx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="ragx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="ragx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="ragx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="ragx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="ragx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="ragx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="ragx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="ragx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="ragx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="ragx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="ragx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="ragx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="ragx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="ragx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="ragx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="ragx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="ragx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="ragx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="ragx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="ragx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="ragx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="ragx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="ragx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol></defs></svg>

Every **AI memory system** eventually adds a **second layer**: extraction, consolidation, graph construction, mutation, decay, reflection. The reason is simple: a conversation is long, the model's context window is finite, and the model should not have to reread everything on every question. Each layer tries to summarise, organise, or update the history so the model can use it. But each layer also adds a place where evidence can be lost, distorted, or moved out of reach.

A 2026 **preprint** — a research paper posted before peer review — asks the uncomfortable question directly: **is any of that complexity necessary for long-term conversation understanding?** In evaluation, a **baseline** is the deliberately simple reference system that every more complex method has to beat. Without that fixed reference, a gain from better memory cannot be separated from a gain from a better reader or a luckier prompt. The authors build *Raw-RAG* as that reference.

**RAG** stands for **retrieval-augmented generation**: instead of relying only on what the model memorised, you search a store of text and paste the relevant pieces into the prompt. **Agentic memory** is the opposite approach: an LLM decides what to extract, summarise, update, or delete, rather than just storing raw text. *Raw-RAG* does no LLM-based memory management — no model writes summaries, extracts facts, builds a graph, or edits the store. The history is stored raw. Retrieval still uses neural models (embeddings to find candidates, a cross-encoder to rerank them), so "naive" refers to the memory policy, not the retrieval machinery.

It indexes the raw history, retrieves dense candidates, reranks them, and hands the selected windows to a **reader** — the model that reads the retrieved evidence and writes the answer. It is not a human reader, and it is not the retrieval system. The retrieval system decides what evidence the reader sees; the reader decides what to do with it. Across LoCoMo, LongMemEval, MEME, and MemoryAgentBench, it ranks first among the compared memory systems in **six of seven benchmark–model settings** — each setting is one benchmark paired with one reader model — beating the strongest competing memory system in each setting by **0.13 to 5.53 percentage points**.

The paper is not saying that memory research is pointless. It is saying something narrower and more useful: **a well-built raw-history retrieval baseline is strong enough that every added memory operation has to prove its contribution.**

Here is the comparison set, because "six of seven" is easy to misread. The paper compares memory systems on four benchmarks, each paired with one or two answering models: **LoCoMo** with GPT-4o-mini and GPT-4.1-mini; **LongMemEval** with GPT-4.1-mini; **MEME** with GPT-4o-mini and DeepSeek-V4-Flash; and **MemoryAgentBench** with GPT-4o-mini and DeepSeek-V4-Flash. That is **seven benchmark × model combinations** — not seven benchmarks. In each combination, "the strongest competitor" means the best competing memory system **for that combination**, not the same fixed rival every time. Raw-RAG wins six; the single loss is MEME with DeepSeek-V4-Flash, where MemMachine is 1.52 points ahead.

Two things sit outside that count. **Full-context** is not a memory system; it is a diagnostic ceiling that skips retrieval and pastes the entire conversation into the model's context (explained later). **PersonaMem-v2** is a separate personalization check, where Raw-RAG ranks third. Six datasets appear in total; the six-of-seven claim is only about the four main accuracy benchmarks. Separately, the main comparison tables include up to **13 memory systems** — Raw-RAG, MemMachine, EverMemOS, EMem, Mem0, MemOS, MemU, Memora, SimpleMem, Nemori, RecMem, A-MEM, and MemoryOS — and the exact set differs by benchmark. The PersonaMem check compares seven.

All gaps in this article are in **percentage points**: moving from 45% to 46% is +1 point. A 0.13-point gap is essentially a tie; a 5-point gap is substantial.

<div class="ragx-paper-cta">
  <a class="mono-btn-chamfer ragx-paper-btn" href="https://arxiv.org/abs/2610.30755" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">READ THE PAPER ↗</span>
    </span>
  </a>
</div>

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01A · MAIN RESULT</div>
    <div class="ragx-title">Raw-RAG wins six of seven settings.</div>
    <p class="ragx-sub">Delta versus the strongest compared agentic memory system, in percentage points. The single loss is MEME with DeepSeek-V4-Flash.</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-a" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-a">Raw-RAG delta versus the strongest agentic memory system</title><desc>Dot plot of seven benchmark-model settings. Raw-RAG wins six and loses one.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="172.0" y1="28" x2="172.0" y2="232" class="ragx-grid" /><line x1="172.0" y1="23" x2="172.0" y2="30" class="ragx-tick" /><line x1="223.2" y1="28" x2="223.2" y2="232" class="ragx-zero" /><line x1="223.2" y1="23" x2="223.2" y2="30" class="ragx-tick" /><line x1="274.3" y1="28" x2="274.3" y2="232" class="ragx-grid" /><line x1="274.3" y1="23" x2="274.3" y2="30" class="ragx-tick" /><line x1="325.5" y1="28" x2="325.5" y2="232" class="ragx-grid" /><line x1="325.5" y1="23" x2="325.5" y2="30" class="ragx-tick" /><line x1="376.7" y1="28" x2="376.7" y2="232" class="ragx-grid" /><line x1="376.7" y1="23" x2="376.7" y2="30" class="ragx-tick" /><text x="0.0" y="48.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4o-mini</text><line x1="223.2" y1="46.0" x2="247.5" y2="46.0" class="ragx-stem" /><circle cx="247.5" cy="46.0" r="3.2" class="ragx-dot" /><text x="254.5" y="48.6" class="ragx-value" text-anchor="start">+0.95</text><text x="0.0" y="75.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4.1-mini</text><line x1="223.2" y1="73.0" x2="274.6" y2="73.0" class="ragx-stem" /><circle cx="274.6" cy="73.0" r="3.2" class="ragx-dot" /><text x="281.6" y="75.6" class="ragx-value" text-anchor="start">+2.01</text><text x="0.0" y="102.6" class="ragx-label" text-anchor="start">LongMemEval · GPT-4.1-mini</text><line x1="223.2" y1="100.0" x2="226.5" y2="100.0" class="ragx-stem" /><circle cx="226.5" cy="100.0" r="3.2" class="ragx-dot" /><text x="233.5" y="102.6" class="ragx-value" text-anchor="start">+0.13</text><text x="0.0" y="129.6" class="ragx-label" text-anchor="start">MEME · GPT-4o-mini</text><line x1="223.2" y1="127.0" x2="280.5" y2="127.0" class="ragx-stem" /><circle cx="280.5" cy="127.0" r="3.2" class="ragx-dot" /><text x="287.5" y="129.6" class="ragx-value" text-anchor="start">+2.24</text><text x="0.0" y="156.6" class="ragx-label" text-anchor="start">MEME · DeepSeek-V4-Flash</text><line x1="184.3" y1="154.0" x2="223.2" y2="154.0" class="ragx-stem" /><circle cx="184.3" cy="154.0" r="3.2" class="ragx-dot-hollow" /><text x="177.3" y="156.6" class="ragx-value" text-anchor="end">−1.52</text><text x="0.0" y="183.6" class="ragx-label" text-anchor="start">MAB · GPT-4o-mini</text><line x1="223.2" y1="181.0" x2="337.8" y2="181.0" class="ragx-stem" /><circle cx="337.8" cy="181.0" r="3.2" class="ragx-dot" /><text x="344.8" y="183.6" class="ragx-value" text-anchor="start">+4.48</text><text x="0.0" y="210.6" class="ragx-label" text-anchor="start">MAB · DeepSeek-V4-Flash</text><line x1="223.2" y1="208.0" x2="364.6" y2="208.0" class="ragx-stem" /><circle cx="364.6" cy="208.0" r="8.3" class="ragx-halo" /><circle cx="364.6" cy="208.0" r="4.8" class="ragx-dot-hero" /><text x="372.6" y="210.6" class="ragx-value-strong" text-anchor="start">+5.53</text><line x1="172" y1="232" x2="392" y2="232" class="ragx-axis-line" /><line x1="172.0" y1="232" x2="172.0" y2="237" class="ragx-tick" /><text x="172.0" y="246.0" class="ragx-axis" text-anchor="middle">−2</text><line x1="223.2" y1="232" x2="223.2" y2="237" class="ragx-tick" /><text x="223.2" y="246.0" class="ragx-axis" text-anchor="middle">0</text><line x1="274.3" y1="232" x2="274.3" y2="237" class="ragx-tick" /><text x="274.3" y="246.0" class="ragx-axis" text-anchor="middle">+2</text><line x1="325.5" y1="232" x2="325.5" y2="237" class="ragx-tick" /><text x="325.5" y="246.0" class="ragx-axis" text-anchor="middle">+4</text><line x1="376.7" y1="232" x2="376.7" y2="237" class="ragx-tick" /><text x="376.7" y="246.0" class="ragx-axis" text-anchor="middle">+6</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">← Raw-RAG behind</text><text x="392.0" y="280.0" class="ragx-note" text-anchor="end">Raw-RAG ahead →</text></svg>
    <div class="ragx-src">DOT PLOT · 7 BENCHMARK–MODEL SETTINGS · ARXIV:2610.30755</div>
  </div>
</div>

<div class="chamfer-card-wrapper mx-card">
    <div class="chamfer-card-content">
      <div class="card-tag">EXHIBIT // 01B · ALL SYSTEMS</div>
      <div class="mx-title">The full field behind the six-of-seven result.</div>
      <p class="mx-sub">Every compared memory system, one panel per setting. Bars are overall score (<span class="mx-nowrap">0–100</span>); the ink row is Raw-RAG, and the ring marks the best system in each setting.</p>
      <div class="mx-legend">
        <span class="lg-raw">Raw-RAG</span>
        <span class="lg-best">best in setting</span>
        <span class="lg-scale">bar = score (<span class="mx-nowrap">0–100</span>)</span>
      </div>
      <div class="mx-grid">
      <section class="mx-panel" aria-labelledby="mx-set-1">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-1" role="heading" aria-level="3">LoCoMo · GPT-4o-mini</div>
          <span class="mx-count">13 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:89.07">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">89.07</div>
          </div>
        </div>
        <div class="mx-row" style="--s:88.12">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">88.12</div>
          </div>
        </div>
        <div class="mx-row" style="--s:86.76">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">86.76</div>
          </div>
        </div>
        <div class="mx-row" style="--s:80.61">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">80.61</div>
          </div>
        </div>
        <div class="mx-row" style="--s:78.25">
          <div class="mx-name">SimpleMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">78.25</div>
          </div>
        </div>
        <div class="mx-row" style="--s:78.00">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">78.00</div>
          </div>
        </div>
        <div class="mx-row" style="--s:75.80">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">75.80</div>
          </div>
        </div>
        <div class="mx-row" style="--s:74.40">
          <div class="mx-name">Nemori</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">74.40</div>
          </div>
        </div>
        <div class="mx-row" style="--s:72.47">
          <div class="mx-name">RecMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">72.47</div>
          </div>
        </div>
        <div class="mx-row" style="--s:66.88">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">66.88</div>
          </div>
        </div>
        <div class="mx-row" style="--s:63.64">
          <div class="mx-name">MemoryOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">63.64</div>
          </div>
        </div>
        <div class="mx-row" style="--s:61.15">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">61.15</div>
          </div>
        </div>
        <div class="mx-row" style="--s:60.84">
          <div class="mx-name">A-MEM</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">60.84</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-2">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-2" role="heading" aria-level="3">LoCoMo · GPT-4.1-mini</div>
          <span class="mx-count">13 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:93.70">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">93.70</div>
          </div>
        </div>
        <div class="mx-row" style="--s:93.05">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">93.05</div>
          </div>
        </div>
        <div class="mx-row" style="--s:91.69">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">91.69</div>
          </div>
        </div>
        <div class="mx-row" style="--s:86.30">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">86.30</div>
          </div>
        </div>
        <div class="mx-row" style="--s:84.20">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">84.20</div>
          </div>
        </div>
        <div class="mx-row" style="--s:83.87">
          <div class="mx-name">SimpleMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">83.87</div>
          </div>
        </div>
        <div class="mx-row" style="--s:81.10">
          <div class="mx-name">RecMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">81.10</div>
          </div>
        </div>
        <div class="mx-row" style="--s:80.76">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">80.76</div>
          </div>
        </div>
        <div class="mx-row" style="--s:79.40">
          <div class="mx-name">Nemori</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">79.40</div>
          </div>
        </div>
        <div class="mx-row" style="--s:68.83">
          <div class="mx-name">A-MEM</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">68.83</div>
          </div>
        </div>
        <div class="mx-row" style="--s:67.60">
          <div class="mx-name">MemoryOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">67.60</div>
          </div>
        </div>
        <div class="mx-row" style="--s:66.67">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">66.67</div>
          </div>
        </div>
        <div class="mx-row" style="--s:64.20">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">64.20</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-3">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-3" role="heading" aria-level="3">LongMemEval · GPT-4.1-mini</div>
          <span class="mx-count">13 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:87.53">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">87.53</div>
          </div>
        </div>
        <div class="mx-row" style="--s:87.40">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">87.40</div>
          </div>
        </div>
        <div class="mx-row" style="--s:83.00">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">83.00</div>
          </div>
        </div>
        <div class="mx-row" style="--s:83.00">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">83.00</div>
          </div>
        </div>
        <div class="mx-row" style="--s:77.80">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">77.80</div>
          </div>
        </div>
        <div class="mx-row" style="--s:76.87">
          <div class="mx-name">SimpleMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">76.87</div>
          </div>
        </div>
        <div class="mx-row" style="--s:76.80">
          <div class="mx-name">RecMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">76.80</div>
          </div>
        </div>
        <div class="mx-row" style="--s:74.60">
          <div class="mx-name">Nemori</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">74.60</div>
          </div>
        </div>
        <div class="mx-row" style="--s:74.40">
          <div class="mx-name">MemoryOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">74.40</div>
          </div>
        </div>
        <div class="mx-row" style="--s:74.33">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">74.33</div>
          </div>
        </div>
        <div class="mx-row" style="--s:71.60">
          <div class="mx-name">A-MEM</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">71.60</div>
          </div>
        </div>
        <div class="mx-row" style="--s:66.40">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">66.40</div>
          </div>
        </div>
        <div class="mx-row" style="--s:38.40">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">38.40</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-4">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-4" role="heading" aria-level="3">MEME · GPT-4o-mini</div>
          <span class="mx-count">8 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:39.30">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">39.30</div>
          </div>
        </div>
        <div class="mx-row" style="--s:37.06">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">37.06</div>
          </div>
        </div>
        <div class="mx-row" style="--s:33.84">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">33.84</div>
          </div>
        </div>
        <div class="mx-row" style="--s:33.52">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">33.52</div>
          </div>
        </div>
        <div class="mx-row" style="--s:30.24">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">30.24</div>
          </div>
        </div>
        <div class="mx-row" style="--s:27.76">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">27.76</div>
          </div>
        </div>
        <div class="mx-row" style="--s:21.57">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">21.57</div>
          </div>
        </div>
        <div class="mx-row" style="--s:19.87">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">19.87</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-5">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-5" role="heading" aria-level="3">MEME · DeepSeek-V4-Flash</div>
          <span class="mx-count">8 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row" style="--s:44.71">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">44.71</div>
          </div>
        </div>
        <div class="mx-row is-raw" style="--s:43.19">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score is-best">43.19</div>
          </div>
        </div>
        <div class="mx-row" style="--s:38.41">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">38.41</div>
          </div>
        </div>
        <div class="mx-row" style="--s:36.36">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">36.36</div>
          </div>
        </div>
        <div class="mx-row" style="--s:33.16">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">33.16</div>
          </div>
        </div>
        <div class="mx-row" style="--s:31.23">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">31.23</div>
          </div>
        </div>
        <div class="mx-row" style="--s:27.24">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">27.24</div>
          </div>
        </div>
        <div class="mx-row" style="--s:18.80">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">18.80</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-6">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-6" role="heading" aria-level="3">MemoryAgentBench · GPT-4o-mini</div>
          <span class="mx-count">8 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:48.32">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">48.32</div>
          </div>
        </div>
        <div class="mx-row" style="--s:43.84">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">43.84</div>
          </div>
        </div>
        <div class="mx-row" style="--s:41.28">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">41.28</div>
          </div>
        </div>
        <div class="mx-row" style="--s:38.44">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">38.44</div>
          </div>
        </div>
        <div class="mx-row" style="--s:36.49">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">36.49</div>
          </div>
        </div>
        <div class="mx-row" style="--s:35.72">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">35.72</div>
          </div>
        </div>
        <div class="mx-row" style="--s:35.53">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">35.53</div>
          </div>
        </div>
        <div class="mx-row" style="--s:26.12">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">26.12</div>
          </div>
        </div>
        </div>
      </section>
      <section class="mx-panel" aria-labelledby="mx-set-7">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-7" role="heading" aria-level="3">MemoryAgentBench · DeepSeek-V4-Flash</div>
          <span class="mx-count">8 systems</span>
        </div>
        <div class="mx-rows">
        <div class="mx-row is-raw" style="--s:53.41">
          <div class="mx-name">Raw-RAG</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div><span class="mx-best" aria-hidden="true"></span></div>
            <div class="mx-score is-best">53.41</div>
          </div>
        </div>
        <div class="mx-row" style="--s:47.88">
          <div class="mx-name">Memora</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">47.88</div>
          </div>
        </div>
        <div class="mx-row" style="--s:42.54">
          <div class="mx-name">EverMemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">42.54</div>
          </div>
        </div>
        <div class="mx-row" style="--s:42.05">
          <div class="mx-name">MemMachine</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">42.05</div>
          </div>
        </div>
        <div class="mx-row" style="--s:41.95">
          <div class="mx-name">Mem0</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">41.95</div>
          </div>
        </div>
        <div class="mx-row" style="--s:39.59">
          <div class="mx-name">EMem</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">39.59</div>
          </div>
        </div>
        <div class="mx-row" style="--s:37.47">
          <div class="mx-name">MemOS</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">37.47</div>
          </div>
        </div>
        <div class="mx-row" style="--s:28.27">
          <div class="mx-name">MemU</div>
          <div class="mx-plot">
            <div class="mx-track"><div class="mx-fill"></div></div>
            <div class="mx-score">28.27</div>
          </div>
        </div>
        </div>
      </section>
        <div class="mx-panel mx-method" role="note" aria-label="Method note">
          <div class="mx-method-kicker">METHOD NOTE</div>
          <p class="mx-method-body">Full-context is excluded: it is a no-retrieval ceiling, not a memory system. Every panel uses the same <span class="mx-nowrap">0–100</span> scale; ties are alphabetical.</p>
        </div>
      </div>
      <div class="mx-src">SYSTEM × SETTING MATRIX · FULL-CONTEXT EXCLUDED · 13 MEMORY SYSTEMS · ARXIV:2610.30755</div>
    </div>
  </div>


<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg><span>SECTION 01</span></div>

## What "naive" actually means here

The word *naive* is misleading here. Raw-RAG is naive about **memory management**, not about **retrieval**. Its **ingestion** step — the part that turns a conversation into something searchable — is deliberately plain:

- Turn each conversation into one long text file, keeping message timestamps and image captions.
- Split that text into **256-token windows** with **32-token overlap** (stride 224).
- Store the windows in **one simple searchable list** — a flat index. No hierarchy, no extraction, no summary, no graph.
- At query time, embed the question and retrieve the **top 128** windows by cosine similarity.
- Score each question–window pair with a **cross-encoder** and keep the **top 15**.
- Expand each selected window back to its complete source turns before the reader sees it.

That is the whole ingestion step: turn the conversation into searchable text once, and never rewrite it. A **turn** is one message in the conversation — one user message or one assistant reply. The retrieval unit is a 256-token window, but the reader does not see a severed sentence or half a turn. It sees the **full turn (or turns)** that the window overlaps, plus the neighbouring turns needed to make sense of pronouns and updates. The index stays small and fixed; the reader gets enough text to resolve references and state changes.

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg> EXHIBIT // 02 · RETRIEVAL BUDGET</div>
    <div class="ragx-title">The whole retrieval budget is four numbers.</div>
    <p class="ragx-sub">256-token windows · 32-token overlap · 128 dense candidates · 15 reranked windows. Turn expansion happens after selection.</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-d" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-d">Raw-RAG retrieval budget</title><desc>256-token windows with 32-token overlap, 128 dense candidates, 15 reranked windows.</desc><text x="24.0" y="16.0" class="ragx-label" text-anchor="start">SOURCE HISTORY</text><rect x="24" y="24" width="352" height="18" rx="3" class="ragx-src-box" /><line x1="28.0" y1="30" x2="28.0" y2="38" class="ragx-turn" /><line x1="40.3" y1="30" x2="40.3" y2="38" class="ragx-turn" /><line x1="52.6" y1="28" x2="52.6" y2="38" class="ragx-turn" /><line x1="64.9" y1="28" x2="64.9" y2="38" class="ragx-turn" /><line x1="77.2" y1="28" x2="77.2" y2="38" class="ragx-turn" /><line x1="89.5" y1="30" x2="89.5" y2="38" class="ragx-turn" /><line x1="101.8" y1="30" x2="101.8" y2="38" class="ragx-turn" /><line x1="114.1" y1="28" x2="114.1" y2="38" class="ragx-turn" /><line x1="126.4" y1="28" x2="126.4" y2="38" class="ragx-turn" /><line x1="138.7" y1="28" x2="138.7" y2="38" class="ragx-turn" /><line x1="151.0" y1="30" x2="151.0" y2="38" class="ragx-turn" /><line x1="163.3" y1="30" x2="163.3" y2="38" class="ragx-turn" /><line x1="175.6" y1="28" x2="175.6" y2="38" class="ragx-turn" /><line x1="187.9" y1="28" x2="187.9" y2="38" class="ragx-turn" /><line x1="200.2" y1="28" x2="200.2" y2="38" class="ragx-turn" /><line x1="212.5" y1="30" x2="212.5" y2="38" class="ragx-turn" /><line x1="224.8" y1="30" x2="224.8" y2="38" class="ragx-turn" /><line x1="237.1" y1="28" x2="237.1" y2="38" class="ragx-turn" /><line x1="249.4" y1="28" x2="249.4" y2="38" class="ragx-turn" /><line x1="261.7" y1="28" x2="261.7" y2="38" class="ragx-turn" /><line x1="274.0" y1="30" x2="274.0" y2="38" class="ragx-turn" /><line x1="286.3" y1="30" x2="286.3" y2="38" class="ragx-turn" /><line x1="298.6" y1="28" x2="298.6" y2="38" class="ragx-turn" /><line x1="310.9" y1="28" x2="310.9" y2="38" class="ragx-turn" /><line x1="323.2" y1="28" x2="323.2" y2="38" class="ragx-turn" /><line x1="335.5" y1="30" x2="335.5" y2="38" class="ragx-turn" /><line x1="347.8" y1="30" x2="347.8" y2="38" class="ragx-turn" /><line x1="360.1" y1="28" x2="360.1" y2="38" class="ragx-turn" /><line x1="372.4" y1="28" x2="372.4" y2="38" class="ragx-turn" /><rect x="24" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="88.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="200.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="248" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="312.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="16" height="26" class="ragx-overlap" /><rect x="248" y="50" width="16" height="26" class="ragx-overlap" /><line x1="136" y1="82" x2="152" y2="82" class="ragx-bracket" /><line x1="136" y1="79" x2="136" y2="85" class="ragx-bracket" /><line x1="152" y1="79" x2="152" y2="85" class="ragx-bracket" /><text x="144.0" y="92.0" class="ragx-axis" text-anchor="middle">32 overlap</text><path d="M200 98 V116" class="ragx-arrow" /><path d="M196 112 L200 117 L204 112" class="ragx-arrow" /><text x="210.0" y="110.0" class="ragx-note" text-anchor="start">EMBED</text><defs><pattern id="ragx-ticks" width="2.75" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" class="ragx-tickline" /></pattern></defs><rect x="24" y="122" width="352" height="10" fill="url(#ragx-ticks)" /><text x="24.0" y="148.0" class="ragx-label" text-anchor="start">TOP-128 DENSE CANDIDATES</text><text x="376.0" y="148.0" class="ragx-value-strong" text-anchor="end">128</text><path d="M200 154 V174" class="ragx-arrow" /><path d="M196 170 L200 175 L204 170" class="ragx-arrow" /><text x="210.0" y="167.0" class="ragx-note" text-anchor="start">RERANK</text><circle cx="24.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="49.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="74.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="99.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="124.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="149.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="174.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="200.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="225.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="250.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="275.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="300.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="325.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="350.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="376.0" cy="188" r="2.9" class="ragx-dot" /><text x="24.0" y="208.0" class="ragx-label" text-anchor="start">TOP-15 RERANKED WINDOWS</text><text x="376.0" y="208.0" class="ragx-value" text-anchor="end">15 × 256</text><path d="M200 216 V234" class="ragx-arrow" /><path d="M196 230 L200 235 L204 230" class="ragx-arrow" /><text x="210.0" y="228.0" class="ragx-note" text-anchor="start">READ</text><rect x="130" y="242" width="140" height="24" rx="3" class="ragx-reader" /><text x="200.0" y="258.0" class="ragx-label" text-anchor="middle">READER · FULL TURNS</text><text x="24.0" y="286.0" class="ragx-note" text-anchor="start">≈ 3,840 TOKENS BEFORE TURN EXPANSION</text></svg>
    <div class="ragx-src">PIPELINE · RAW-RAG · ARXIV:2610.30755</div>
  </div>
</div>

### The pipeline in everyday terms

The chart above is precise but unfriendly. Here is the same pipeline translated into ordinary situations:

<div class="ragx-glossary">
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">256-token window</div>
      <p class="ragx-gloss-copy">A long conversation is a loaf of bread. A window is one slice: small enough to pick up, large enough to contain a complete thought. Thirty-two tokens of overlap means neighbouring slices share a few crumbs, so a name or a date is never cut in half.</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Embedding</div>
      <p class="ragx-gloss-copy">A GPS pin for meaning. Every window gets coordinates, and passages that mean similar things land near each other — so "refund" can find "money back" even when the words do not match.</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scan-search"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Dense candidates (128)</div>
      <p class="ragx-gloss-copy">The first wide net. The system pulls 128 windows that look semantically close to the question. It is cheap and forgiving: the right passage is probably in the pile, along with some junk. Skip this stage and the reranker has nothing to promote.</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reranker / cross-encoder</div>
      <p class="ragx-gloss-copy">The call-back audition. A cross-encoder reads the question and each candidate together, word by word, so it notices negation, exact names, and dates. Too expensive for the whole archive; cheap enough for 128 pairs. Without it, a window that merely shares vocabulary can outrank the window that actually answers the question.</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Turn expansion</div>
      <p class="ragx-gloss-copy">Clicking "show full message". The search result is a 256-token slice, but the reader gets the whole turn around it — who spoke, when, and what "it" refers to. Without it, a pronoun can arrive with nothing to point at.</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-brain"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reader (top-15)</div>
      <p class="ragx-gloss-copy">The model that actually answers. The reader never sees the index or the 128 candidates, only the 15 expanded turns. A better index cannot compensate for a reader that misreads the evidence.</p>
    </div>
  </div>
</div>

The paper reports a 256-token window as the default, but the ablation shows the exact size is not sacred: windows from **128 to 1,024 tokens** do not significantly change the MemoryAgentBench total. What does matter is **reranking** and **moderate depth**. Removing the cross-encoder costs **3.92 percentage points**. Returning only one item costs **11.73 percentage points**. Returning 120 items costs **14.57 percentage points**, mostly on long-range understanding and conflict resolution.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-clipboard-list"></use></svg><span>SECTION 02</span></div>

## The benchmark map

The paper's result only means something if you know what each benchmark is designed to test. Here is what each one stresses, in everyday terms.

<div class="ragx-bench-grid">
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LoCoMo</div>
          <div class="ragx-bench-sub">LONG-TERM CONVERSATIONAL MEMORY</div>
        </div>
      </div>
      <p class="ragx-bench-desc">Two people talk across many sessions, days or weeks apart. Questions ask for one fact ("What is Ana's sister's name?"), a join across two facts, the order of events, or an inference beyond the literal text.</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>10 conversations · 1,540 questions</dd></div>
        <div><dt>METRIC</dt><dd>LLM judge · 3 votes</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Most questions (841 of 1,540) need only one fact, so a simple retriever can do well. This is a 10-conversation subset of the original 50, and trick questions designed to catch shortcuts were removed.</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LongMemEval-S</div>
          <div class="ragx-bench-sub">CHAT-ASSISTANT MEMORY</div>
        </div>
      </div>
      <p class="ragx-bench-desc">Each question comes with its own long chat history — like opening a fresh support ticket with months of logs. Five abilities: recall a fact, join facts across sessions, order events, remember a preference, and use the latest version of a changed fact.</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>500 questions · ~115k-token histories</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 3 votes</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> A fresh history per question means a system cannot carry an answer over — that is memory isolation. Thirty questions are abstention items: the history has no answer, and the correct response is "not mentioned", not a guess. S is ~115k tokens; M is ~1.5M, and scores do not transfer between them.</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MEME</div>
          <div class="ragx-bench-sub">MULTI-ENTITY & EVOLVING MEMORY</div>
        </div>
      </div>
      <p class="ragx-bench-desc">Scripted scenarios with several people, projects, or accounts whose values change over time. Six question types: exact recall ("What was the value?"), aggregation ("How many are active?"), tracking ("What is it now?"), deletion, cascade (a budget rise also raises an approval limit), and absence ("There is no such value — answer 'none'").</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>100 episodes · 1,188 questions · 32k-token filler</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 6-task macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Cascade questions apply a rule to an upstream change; absence questions have no value at all. The 32k/128k/no-filler variants differ in how much irrelevant filler text is mixed in — 32k and 128k are token budgets of filler, not counts of distractor items — so do not compare scores across them. The final score averages the six task types equally (a macro-average).</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MemoryAgentBench</div>
          <div class="ragx-bench-sub">INCREMENTAL MULTI-TURN MEMORY</div>
        </div>
      </div>
      <p class="ragx-bench-desc">Read one long source once, then answer many questions about it. Four skills: accurate retrieval (find a fact), test-time learning (learn a pattern from examples in the source and apply it to a new item), long-range understanding (connect facts far apart), and conflict resolution (when two parts disagree, choose the newer or more authoritative one).</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>2,071 questions · 14 sources · 103K–1.44M tokens</dd></div>
        <div><dt>METRIC</dt><dd>Native metrics · 4-capability macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Test-time learning and long-range understanding are the differentiators. The 2,071-question headline is curated from 14 sources, not one official test set. Its embedded LongMemEval portion is not the same as the standalone 500-question benchmark.</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span>
        <div>
          <div class="ragx-bench-name">PersonaMem-v2</div>
          <div class="ragx-bench-sub">IMPLICIT PERSONALIZATION</div>
        </div>
      </div>
      <p class="ragx-bench-desc">A long chat history where the user never says "I prefer short answers" — the system must infer it from what they ask, praise, and ignore. Then pick which of four replies fits that person across nine scenarios.</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>5,000 multiple-choice questions · ~32k-token histories</dd></div>
        <div><dt>METRIC</dt><dd>MCQ exact match</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Four options mean random guessing gets 25%, so the score has a built-in floor. Raw-RAG has no explicit user profile; EverMemOS builds one. This is a system-level comparison — profile + retrieval + reader — not a comparison of just their retrieval components.</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-timer"></use></svg></span>
        <div>
          <div class="ragx-bench-name">BEAM-1M</div>
          <div class="ragx-bench-sub">INGESTION WORKLOAD</div>
        </div>
      </div>
      <p class="ragx-bench-desc">One very long conversation (~1M tokens), used as a stress test for ingestion speed: how long until the system can answer the first question?</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>1 conversation · 1,710 messages · ~1M tokens</dd></div>
        <div><dt>METRIC</dt><dd>None — timing only</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> This is a timing test, not a BEAM accuracy result. The paper uses one conversation, not the full 100-conversation benchmark, and stops the clock before answer generation.</div>
    </div>
  </div>
</div>

<div class="ragx-callout">
  <svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg>
  <div><b>Do not compare the headline numbers directly.</b> The slices, graders, and averaging rules differ: LoCoMo and LongMemEval count each question equally; MEME averages its six task types equally (a six-task macro-average); MemoryAgentBench averages its four capabilities equally; PersonaMem-v2 is multiple-choice exact match, with no partial credit. The paper aligns settings where it can; the rest is a baseline argument, not a leaderboard.</div>
</div>

<div class="ragx-src">BENCHMARK SOURCES · LoCoMo (ACL 2024) · LongMemEval (ICLR 2025) · MEME (NeurIPS 2026) · MemoryAgentBench (ICLR 2026) · PersonaMem-v2 (2025) · BEAM (ICLR 2026)</div>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg><span>SECTION 03</span></div>

## The score is not the interesting part

To see where the accuracy comes from, the authors measure two **diagnostic rates** on labelled subsets. **Coverage** asks: of all the questions, in how many did the retrieved context contain enough evidence for a correct answer? **Utilization** asks: among the questions where the evidence was sufficient, how many did the system actually answer correctly? These are not two factors that multiply to the headline score. They are two different views of the same pipeline, measured on different denominators, and they matter because of how much they vary across systems.

On MemoryAgentBench, coverage ranges from **19.07% to 45.29%** — a **26.2-percentage-point** spread — while utilization ranges only from **80.00% to 89.71%** — a **9.7-point** spread. On MEME, coverage ranges from **35.69% to 76.35%** (**40.7 points**), while utilization ranges from **65.51% to 86.55%** (**21.0 points**). In both benchmarks, systems differ far more in whether they find the evidence than in whether they can use it once found.

Raw-RAG has the **highest coverage on both benchmarks** (45.29% and 76.35%). Its utilization is not the best: 84.43% on MemoryAgentBench and 73.76% on MEME. That is 5.3 points below the best system on MemoryAgentBench and 12.8 points below the best on MEME — close on the first, noticeably behind on the second.

One caveat matters for reading the utilization numbers. Because each system's utilization is measured only on the questions it retrieved enough evidence for, a system that retrieves less is being graded on an easier subset. High utilization can therefore be a selection effect, not a sign of a better reader. That is why the coverage gap — the part that determines whether the evidence is there at all — is the more trustworthy signal.

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg> EXHIBIT // 03 · COVERAGE VS UTILIZATION</div>
    <div class="ragx-title">Coverage moves more than utilization.</div>
    <p class="ragx-sub">Observed min–max across systems. Dots are systems; the bar is the range. Raw-RAG is the dark dot at the right end of each coverage row.</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-b" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-b">Coverage varies more than utilization</title><desc>Ranges of coverage and utilization across systems on MemoryAgentBench and MEME.</desc><text x="390.0" y="16.0" class="ragx-axis" text-anchor="end">PERCENT</text><line x1="124.0" y1="34" x2="124.0" y2="232" class="ragx-grid" /><line x1="190.5" y1="34" x2="190.5" y2="232" class="ragx-grid" /><line x1="257.0" y1="34" x2="257.0" y2="232" class="ragx-grid" /><line x1="323.5" y1="34" x2="323.5" y2="232" class="ragx-grid" /><line x1="390.0" y1="34" x2="390.0" y2="232" class="ragx-grid" /><line x1="124" y1="56" x2="390" y2="56" class="ragx-grid-h" /><line x1="124" y1="106" x2="390" y2="106" class="ragx-grid-h" /><line x1="124" y1="156" x2="390" y2="156" class="ragx-grid-h" /><line x1="124" y1="206" x2="390" y2="206" class="ragx-grid-h" /><text x="0.0" y="58.3" class="ragx-label" text-anchor="start">MAB · coverage</text><line x1="174.7" y1="56.0" x2="244.5" y2="56.0" class="ragx-range" /><line x1="174.7" y1="52.0" x2="174.7" y2="60.0" class="ragx-range-cap" /><line x1="244.5" y1="52.0" x2="244.5" y2="60.0" class="ragx-range-cap" /><text x="209.6" y="47.0" class="ragx-axis" text-anchor="middle">26.2 pp</text><circle cx="174.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="181.3" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="190.8" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="215.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="216.4" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="230.5" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="244.5" cy="53.8" r="8.3" class="ragx-halo" /><circle cx="244.5" cy="53.8" r="5.0" class="ragx-dot-hero" /><text x="255.5" y="56.2" class="ragx-value-strong" text-anchor="start">45.3</text><text x="0.0" y="108.3" class="ragx-label" text-anchor="start">MAB · utilization</text><line x1="336.8" y1="106.0" x2="362.6" y2="106.0" class="ragx-range" /><line x1="336.8" y1="102.0" x2="336.8" y2="110.0" class="ragx-range-cap" /><line x1="362.6" y1="102.0" x2="362.6" y2="110.0" class="ragx-range-cap" /><text x="349.7" y="97.0" class="ragx-axis" text-anchor="middle">9.7 pp</text><circle cx="336.8" cy="103.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.2" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.2" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="348.6" cy="103.8" r="3.4" class="ragx-dot-ink" /><circle cx="352.4" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="361.7" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="362.6" cy="103.8" r="2.9" class="ragx-dot-soft" /><text x="0.0" y="158.3" class="ragx-label" text-anchor="start">MEME · coverage</text><line x1="218.9" y1="156.0" x2="327.1" y2="156.0" class="ragx-range" /><line x1="218.9" y1="152.0" x2="218.9" y2="160.0" class="ragx-range-cap" /><line x1="327.1" y1="152.0" x2="327.1" y2="160.0" class="ragx-range-cap" /><text x="273.0" y="147.0" class="ragx-axis" text-anchor="middle">40.7 pp</text><circle cx="218.9" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="250.7" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="257.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="289.2" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="292.2" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="311.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="327.1" cy="153.8" r="3.4" class="ragx-dot-ink" /><text x="0.0" y="208.3" class="ragx-label" text-anchor="start">MEME · utilization</text><line x1="298.3" y1="206.0" x2="354.2" y2="206.0" class="ragx-range" /><line x1="298.3" y1="202.0" x2="298.3" y2="210.0" class="ragx-range-cap" /><line x1="354.2" y1="202.0" x2="354.2" y2="210.0" class="ragx-range-cap" /><text x="326.2" y="197.0" class="ragx-axis" text-anchor="middle">21.0 pp</text><circle cx="298.3" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="301.3" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="320.2" cy="208.2" r="3.4" class="ragx-dot-ink" /><circle cx="328.4" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.9" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.0" cy="208.2" r="2.9" class="ragx-dot-soft" /><circle cx="354.2" cy="203.8" r="2.9" class="ragx-dot-soft" /><line x1="124" y1="232" x2="390" y2="232" class="ragx-axis-line" /><line x1="124.0" y1="232" x2="124.0" y2="237" class="ragx-tick" /><text x="124.0" y="250.0" class="ragx-axis" text-anchor="middle">0</text><line x1="190.5" y1="232" x2="190.5" y2="237" class="ragx-tick" /><text x="190.5" y="250.0" class="ragx-axis" text-anchor="middle">25</text><line x1="257.0" y1="232" x2="257.0" y2="237" class="ragx-tick" /><text x="257.0" y="250.0" class="ragx-axis" text-anchor="middle">50</text><line x1="323.5" y1="232" x2="323.5" y2="237" class="ragx-tick" /><text x="323.5" y="250.0" class="ragx-axis" text-anchor="middle">75</text><line x1="390.0" y1="232" x2="390.0" y2="237" class="ragx-tick" /><text x="382.0" y="250.0" class="ragx-axis" text-anchor="middle">100</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">Dots = systems · bar = observed min–max</text></svg>
    <div class="ragx-src">RANGE PLOT · 7 SYSTEMS · MAB = MEMORYAGENTBENCH · PP = PERCENTAGE POINTS</div>
  </div>
</div>

This is the paper's most practical contribution. If your memory system is losing, the first question is not "how do I improve the reader?" It is "which necessary evidence never made it into the context?" That division is why the paper measures the two separately: coverage is the retrieval system's job; utilization is the reader's job. They fail differently and need different fixes. A better reader cannot reliably compensate for evidence that was never retrieved.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg><span>SECTION 04</span></div>

## Answer values are not enough

On MEME's **tracking and cascade** questions, the authors separate two kinds of coverage. **Result coverage** asks: does the required answer value appear somewhere in the retrieved context? **Path coverage** asks: does the context also contain the chronological order or dependency chain needed to derive that value? **P(path | result)** is the conditional rate: among the questions where the answer value was found, the share where the full path was also found. Read the bar as "given that".

| System | Result coverage (%) | Path coverage (%) | P(path \| result) (%) |
| :-- | --: | --: | --: |
| Raw-RAG | 90.53% | 56.44% | **62.34%** |
| MemMachine | 84.85% | 48.11% | 56.70% |
| EverMemOS | 78.03% | 39.02% | 50.00% |
| EMem | 76.52% | 37.88% | 49.50% |
| Mem0 | 81.06% | 38.64% | 47.66% |
| MemOS | 88.26% | 21.21% | 24.03% |
| MemU | 59.09% | 5.68% | 9.62% |

The table is a diagnostic on the tracking/cascade subset, not the end-to-end MEME score; the reader still has to turn the evidence into an answer.

This is the difference between storing a fact and storing the reason it is true *now*. A memory system can retrieve "the budget is $4,200" and still fail if it loses the approval that raised it, the transfer that lowered it, or the order in which those events happened. Raw history preserves those relations because it never removed them.

The complete-store oracle pushes the argument further. *Gold* means the answer key: the authors tell each system exactly which evidence is relevant, then give it access to its own complete exported memory store. Native retrieval is bypassed. The comparison is against a raw-evidence control that selects the original support sessions with the same gold signals.

<div class="ragx-oracle">
  <div class="ragx-oracle-head">
    <div class="ragx-oracle-eyebrow">THE ORACLE, IN ONE PICTURE</div>
    <div class="ragx-oracle-title">Three ways to look for a receipt.</div>
    <p class="ragx-oracle-sub">Gold-informed means the examiner tells you which drawer holds the answer. It tests what survived storage, not how well you search.</p>
  </div>
  <div class="ragx-oracle-grid">
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">NATIVE RETRIEVAL</div>
      <p class="ragx-oracle-copy">You search your own filing cabinet using the labels you created. Your labels decide what you can find.</p>
      <div class="ragx-oracle-score">39.30</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">COMPLETE STORE (GOLD-INFORMED)</div>
      <p class="ragx-oracle-copy">Someone dumps the entire cabinet on your desk and says the receipt is in there. Search is no longer the bottleneck — but you can only find what the cabinet still contains.</p>
      <div class="ragx-oracle-score">57.54</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">RAW EVIDENCE</div>
      <p class="ragx-oracle-copy">Someone hands you the original shoebox of receipts. This is the ceiling: the evidence existed, and nothing was thrown away.</p>
      <div class="ragx-oracle-score">61.60</div>
    </div>
  </div>
  <div class="ragx-oracle-foot">RAW-RAG · MEME · SAME GOLD SIGNAL, THREE LEVELS OF ACCESS</div>
</div>

| System | Native | Complete store | Raw evidence |
| :-- | --: | --: | --: |
| Raw-RAG | 39.30 | **57.54** | 61.60 |
| MemMachine | 37.06 | **57.46** | 61.60 |
| EverMemOS | 21.57 | 51.59 | 61.60 |
| EMem | 33.84 | 48.36 | 61.60 |
| MemOS | 30.24 | 45.12 | 61.60 |
| Mem0 | 27.76 | 32.26 | 61.60 |
| MemU | 19.87 | 31.07 | 61.60 |

<div class="ragx-table-note">MEME · GPT-4o-mini reader · Bold = each system's complete-store score · Raw evidence = shared ceiling</div>

Every system improves when retrieval is taken out of the equation. But the systems that preserve raw conversational content — Raw-RAG and MemMachine — recover closest to the raw-evidence ceiling. The transformed stores remain further away. Raw-RAG's 57.54 is still about four percentage points below the 61.60 raw-evidence ceiling, and that residue is what ingestion already threw away: merged fields, summaries that smoothed over a correction, facts detached from their source. Complete access cannot reconstruct what was never stored.

The authors are careful about the interpretation: the residual gap is not a pure measure of information loss. Evidence assembly, ordering, and position effects such as *lost in the middle* can also contribute. But the direction is consistent, and it matches the path analysis.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg><span>SECTION 05</span></div>

## The mutation audit

The paper also audits the write policy of Mem0, one of the most widely used memory layers.

A memory layer like Mem0 reads a new message and decides what to do with it: **ADD** a new memory, **UPDATE** an existing one, **DELETE** one, or do nothing (**NONE**). Each decision is a **write decision**. The paper counts these decisions and asks how often the system actually rewrites or deletes what it stored.

A concrete example: the user says "I live in Munich." Later they say "I moved to Berlin." An **UPDATE** overwrites the Munich memory with Berlin. An **append-only ADD** keeps both, with timestamps, so the reader can see that Berlin is newer. A **DELETE** removes the Munich memory. **NONE** leaves both untouched.

On LoCoMo, UPDATE and DELETE together are only **4.39% of 33,902 decisions**. On LongMemEval, **where each of the 500 questions carries its own ~115k-token history**, they are **2.46% of 428,858 decisions**; the decision count is much larger than the question count because every history is processed separately. "Effective mutations" — updates or deletions that actually changed stored text — are only **1.90%** and **1.34%**; many proposed updates were duplicates or malformed.

Then the authors run a simple experiment: replace UPDATE with **append-only ADD** (keep the old memory and add the new one), and DELETE with **NONE** (do nothing). If accuracy does not drop, the explicit rewrite was not helping on this benchmark. LoCoMo accuracy rises from **67.36% to 69.42%**, and no category drops.

That does not mean deletion is unimportant in production. It means these benchmarks rarely require it, and when they do, a capable reader can often resolve the state change from the raw evidence. A second experiment supports this, but it is a **ceiling test**, not an end-to-end Raw-RAG run. The authors do not run retrieval; for each question they hand the reader exactly the evidence that existed at that point in the conversation, in chronological order, with no retrieval error. The question is: if retrieval were perfect, could a strong reader reconstruct the current state? This tests the reader, not the memory system, so its score is not comparable to Raw-RAG's end-to-end 43.19%.

DeepSeek-V4-Flash reaches **85.48% overall across MEME's six task types**, including **82.32% on cascade questions** — where an upstream change must be propagated through a rule — and **91.54% on invalidation questions**, where a later event makes an earlier fact invalid. The same evidence produces **70.25% with Qwen3.5-35B-A3B** and **50.50% with GPT-4o-mini**. That 35-point spread is the point: state reconstruction is reader-dependent even when the evidence is perfect.

The 85.48% is a **six-task macro**, not the average of the two named tasks (82.32 and 91.54 average to 86.93). It is lower because it includes the other four MEME task types.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg><span>SECTION 06</span></div>

## Where complexity still earns its keep

The paper is strongest when it is read as a baseline argument, not a universal verdict. Two results keep it honest.

First, **PersonaMem-v2**. Raw-RAG scores **49.62%**, third among the seven memory systems, behind MemOS (50.72%) and EverMemOS (53.25%). It comes first on **none of PersonaMem's nine scenarios**. PersonaMem tests personalization: the user never says "I prefer short answers"; the system must infer it from what they ask, praise, and ignore, then choose among four replies. EverMemOS first builds an **explicit user profile** — a running list of who the user is and what they like — and uses it to answer; Raw-RAG has no such profile. This is a **system-level comparison**: profile + retrieval + reader, not just their retrieval components. When the task is "remember who this person is and what they prefer," structured memory has an advantage that raw retrieval does not erase.

Second, **MEME with DeepSeek-V4-Flash**. Raw-RAG scores **43.19%**, while MemMachine scores **44.71%** — end-to-end numbers from normal retrieval. More tellingly, **Full-context scores 63.17%** in the same setting. Full-context is not another memory system: it is a diagnostic that skips retrieval entirely and pastes the whole conversation into the model's context. It asks what the reader could do if it saw everything. The gap is about **20 points above Raw-RAG** and **18 points above MemMachine**, which shows both retrieval-based systems were limited by what retrieval handed the reader — not that MemMachine's memory management was the winner. MemMachine's 1.52-point edge is small next to that gap. The paper acknowledges the reader dependence and notes that the evaluated tasks are batch question answering, not a live product memory.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg><span>SECTION 07</span></div>

## The ablation that should make builders pause

The paper's MemoryAgentBench ablation is a useful checklist of additions that sound smart and score worse:

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg> EXHIBIT // 04 · MEMORY-MANAGEMENT ABLATIONS</div>
    <div class="ragx-title">Memory management did not pay for itself.</div>
    <p class="ragx-sub">Window size / overlap (tokens). The default is 256/32; the ablation tries 128/16, 512/64, and 1024/128. Negative means the change lowered the MemoryAgentBench total. The first bar removes the reranker; the rest add or change an operation. Only 512/64 is slightly positive (+0.04), which is within noise.</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-c" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-c">Memory-management ablations</title><desc>Change in MemoryAgentBench total when each operation is added to Raw-RAG.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="123.9" y1="32" x2="123.9" y2="236" class="ragx-grid" /><line x1="123.9" y1="27" x2="123.9" y2="34" class="ragx-tick" /><line x1="243.1" y1="32" x2="243.1" y2="236" class="ragx-grid" /><line x1="243.1" y1="27" x2="243.1" y2="34" class="ragx-tick" /><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="362.2" y1="27" x2="362.2" y2="34" class="ragx-tick" /><text x="0.0" y="46.4" class="ragx-label" text-anchor="start">− reranker</text><rect x="315.5" y="40.5" width="46.7" height="7" rx="3.5" class="ragx-bar" /><text x="309.5" y="46.4" class="ragx-value" text-anchor="end">−3.92</text><text x="0.0" y="72.4" class="ragx-label" text-anchor="start">128 / 16</text><rect x="359.4" y="66.5" width="2.9" height="7" rx="3.5" class="ragx-bar" /><text x="353.4" y="72.4" class="ragx-value" text-anchor="end">−0.24</text><text x="0.0" y="98.4" class="ragx-label" text-anchor="start">512 / 64</text><rect x="362.2" y="92.5" width="2.0" height="7" rx="3.5" class="ragx-bar-pos" /><text x="368.2" y="98.4" class="ragx-value" text-anchor="start">+0.04</text><text x="0.0" y="124.4" class="ragx-label" text-anchor="start">1024 / 128</text><rect x="358.9" y="118.5" width="3.3" height="7" rx="3.5" class="ragx-bar" /><text x="352.9" y="124.4" class="ragx-value" text-anchor="end">−0.28</text><text x="0.0" y="150.4" class="ragx-label" text-anchor="start">+ turn dedup</text><rect x="333.7" y="144.5" width="28.5" height="7" rx="3.5" class="ragx-bar" /><text x="327.7" y="150.4" class="ragx-value" text-anchor="end">−2.39</text><text x="0.0" y="176.4" class="ragx-label" text-anchor="start">+ atomic facts</text><rect x="128.4" y="170.0" width="233.8" height="8" rx="4" class="ragx-bar-hero" /><text x="140.4" y="176.5" class="ragx-value-paper" text-anchor="start">−19.62</text><text x="0.0" y="202.4" class="ragx-label" text-anchor="start">+ raw summary</text><rect x="293.0" y="196.5" width="69.2" height="7" rx="3.5" class="ragx-bar" /><text x="287.0" y="202.4" class="ragx-value" text-anchor="end">−5.81</text><text x="0.0" y="228.4" class="ragx-label" text-anchor="start">+ graph expansion</text><rect x="293.3" y="222.5" width="68.9" height="7" rx="3.5" class="ragx-bar" /><text x="287.3" y="228.4" class="ragx-value" text-anchor="end">−5.78</text><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="112" y1="244" x2="392" y2="244" class="ragx-axis-line" /><line x1="123.9" y1="244" x2="123.9" y2="249" class="ragx-tick" /><text x="123.9" y="260.0" class="ragx-axis" text-anchor="middle">−20</text><line x1="243.1" y1="244" x2="243.1" y2="249" class="ragx-tick" /><text x="243.1" y="260.0" class="ragx-axis" text-anchor="middle">−10</text><line x1="362.2" y1="244" x2="362.2" y2="249" class="ragx-tick" /><text x="362.2" y="260.0" class="ragx-axis" text-anchor="middle">0</text><text x="0.0" y="284.0" class="ragx-note" text-anchor="start">Δ vs Raw-RAG 48.32 · negative = worse</text></svg>
    <div class="ragx-src">BAR CHART · 14 SOURCES · Δ = CHANGE VS RAW-RAG'S 48.32 MEMORYAGENTBENCH TOTAL · SAME READER AND EVIDENCE BUDGET</div>
  </div>
</div>

Here is each operation in plain language. The number is the change in MemoryAgentBench total when it is added to the 48.32 baseline. The 48.32 baseline is Raw-RAG's default total; every change is relative to that, not to a competitor.

One of MemoryAgentBench's four skills is **test-time learning**, and the name is misleading: the model does **not** retrain or update its weights. The source contains a few worked examples — for instance, five customer reviews labelled "negative" or "positive" — and the model must infer the pattern and apply it to a new review. This is also called **few-shot learning**: the "training" happens inside the prompt. A **demonstration** is the whole worked example: the review text, its label, and the boundary showing where the next example starts. If extraction keeps only the fact "negative" and throws away the input–label pairing, the model can no longer see what pattern to copy.

<div class="ragx-abl-grid">
  <div class="ragx-abl ragx-abl-hero">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span class="ragx-abl-name">ATOMIC-FACT EXTRACTION</span><span class="ragx-abl-delta">−19.62</span></div>
    <p class="ragx-abl-big">A movie becomes a plot summary.</p>
    <p class="ragx-abl-copy">You keep who did what; you lose the scene, the tone, the timing, and the worked example. Facts survive, demonstrations do not.</p>
    <div class="ragx-abl-stat">TEST-TIME LEARNING SUBSET <b>47.68% → 15.37% (−32.31 pts)</b></div>
    <div class="ragx-abl-note">The −19.62 at the top is the overall MemoryAgentBench drop. The test-time-learning subset falls much further (−32.31 points); the overall number is smaller because it averages across all four capabilities.</div>
</div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg><span class="ragx-abl-name">RAW SUMMARY AUGMENTATION</span><span class="ragx-abl-delta">−5.81</span></div>
    <p class="ragx-abl-copy">Rewriting a meeting recording into minutes. The minutes read better, but they smooth over who objected, which number was corrected, and in what order. Conflict-resolution questions need exactly those seams.</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-network"></use></svg><span class="ragx-abl-name">GRAPH-EXPANDED RETRIEVAL</span><span class="ragx-abl-delta">−5.78</span></div>
    <p class="ragx-abl-copy">Pulling in everything connected to "invoice" — customer, order, address, support ticket. The links are real, but relevance is not the same as connection. Extra neighbours crowd out the evidence the reader actually needs.</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-repeat"></use></svg><span class="ragx-abl-name">DISPLAY-TURN DEDUPLICATION</span><span class="ragx-abl-delta">−2.39</span></div>
    <p class="ragx-abl-copy">Deleting repeated lines from a chat log. But people repeat themselves to repair: "no, the new address". Dedup can keep the old line and throw away the correction.</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg><span class="ragx-abl-name">REMOVING THE RERANKER</span><span class="ragx-abl-delta">−3.92</span></div>
    <p class="ragx-abl-copy">Choosing books by their titles. Every title contains "pasta", but none may contain the sauce you asked for. The reranker is the editor who opens the book and checks.</p>
  </div>
</div>

None of these operations is stupid in isolation. Each is a bet that compression or structure will help more than it hurts. On this benchmark, the bet lost — and the size of the loss tells you which bet was worst.

The paper does not attribute the whole atomic-fact drop to factual loss: the amount of evidence, its layout, and whether the answering model handles that layout well all move together. Extracted facts are short, uniform, and stripped of the conversational cues the model may rely on — a format change, not just a content change. The practical warning stands: **compression is not free just because the facts survive.**

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-coins"></use></svg><span>SECTION 08</span></div>

## The cost side

Three different timing tests are summarised here, and they answer three different questions.

**Test 1: the MEME slice.** The table uses 10 episodes and 110 questions, with one external worker and each system's native parallelism. "Ingest to ready" is the time to read the episodes into memory and be ready to answer; "Search" is the **total time to answer all 110 questions**, not a single query; "Total" is the sum. Raw-RAG takes about **50 seconds to ingest**, **256 seconds to answer all 110 questions** (about 2.3 seconds each), and **306 seconds total**. The next system, EMem, takes 1,562 seconds total; EverMemOS takes 9,301 seconds — about **2.6 hours**.

| System | Ingest to ready (s) | Search (s) | Total (s) |
| :-- | --: | --: | --: |
| Raw-RAG | 50.32 | 255.59 | **305.91** |
| EMem | 1,082.37 | 479.59 | 1,561.97 |
| MemOS | 2,591.59 | 177.97 | 2,769.56 |
| MemMachine | 3,104.35 | 411.39 | 3,515.74 |
| Mem0 | 4,025.23 | 117.72 | 4,142.95 |
| EverMemOS | 8,217.69 | 1,083.79 | 9,301.48 |

**Test 2: the BEAM conversation.** This is one 1,710-message conversation approaching one million tokens, and it measures **ingestion only**. Raw-RAG takes about **20 minutes**; MemOS, the next system to finish, takes about **3¼ hours**; Memora takes nearly **27 hours**. Some systems did not finish, which is why the comparison says "next completed run." Memora is one of the systems in the BEAM comparison; it does not appear in the smaller MEME table.

**Test 3: the MemoryAgentBench ablation.** This is a different benchmark (14 sources, 103K–1.44M tokens), and it measures the **three additive memory operations**: atomic facts, summaries, and graph expansion. They cost **21.6–109.3 million LLM-generated tokens** — roughly tens of thousands to a hundred thousand pages of text — and **2.9–8.8 hours** of ingest-plus-search. Raw-RAG's baseline on the **same** benchmark takes about **12 minutes**. Raw-RAG's ingestion uses embedding calls, not LLM generation, so the token comparison is not like-for-like; the time difference is the more meaningful number.

The ratios are therefore different by design: **5.1×** on the MEME slice (about one-fifth the total time of the next system), **30.4×** against EverMemOS, about **10×** on BEAM ingestion against MemOS, and **15–44×** on the ablation. Total-time ratios are **5–30×**; "two orders of magnitude" applies only to the slowest ingestion (about **160×**), not to every row.

That does not make the complex systems useless. It makes their burden of proof higher. If a memory layer costs far more to ingest and does not improve accuracy on the target workload, it is not a memory layer; it is an expensive index.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span>SECTION 09</span></div>

## The chunking specification, in full

This is the part worth copying into a design doc. Raw-RAG's defaults are:

| Parameter | Value | Why it matters |
| :-- | :-- | :-- |
| Tokenizer for windows | GPT-4 tokenizer | Window size is counted with GPT-4's tokenizer at ingestion time. |
| Window size | **256 tokens** | Small enough to retrieve a specific exchange; large enough to preserve local meaning. |
| Stride | **224 tokens** | How far the window moves each step. 256 − 32 = 224, so neighbouring windows share 32 tokens. |
| Overlap | **32 tokens** | Prevents an entity or relation from being cut at a boundary. |
| Dense candidates | **128** | The cheap vector-search shortlist. It aims to contain the right window at all; the expensive reranker only scores these 128 pairs. |
| Reranked windows | **15** | The reader budget. Final-k is the number of windows finally passed to the reader; values from 5 to 60 stay within 1.3 points, while 120 loses 14.57. |
| Reranker | Cross-encoder | Removing it costs 3.92 percentage points on MemoryAgentBench. |
| Turn expansion | **On** | Selected windows expand to the full turn (or turns) they overlap. |
| Deduplication | **Off** by default | Turning it on costs 2.39 percentage points in the tested setting. |
| Query | Original question | No query rewriting — the user's question is not rephrased before search. |
| Index | Flat, fixed after ingestion | One simple list, with no hierarchy, no graph, and no updates after ingestion. |

### One paragraph, three windows

Here is a support email cut with the same overlap geometry, scaled down so the seams are visible:

<div class="ragx-chunk">
  <div class="ragx-chunk-head">
    <div class="ragx-chunk-eyebrow">SOURCE DOCUMENT · 57 WORDS</div>
    <p class="ragx-chunk-src">Hi, I ordered the walnut desk on 3 March. The first delivery arrived with a cracked leg, so your team replaced it on 12 March. The replacement is fine, but the invoice still charges me for two desks. I only want to pay for one. Please correct the invoice and confirm the refund of the duplicate charge.</p>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 01</div>
    <div class="ragx-chunk-text">Hi, I ordered the walnut desk on 3 March. The first delivery arrived with a cracked leg, so your team replaced it on 12 March.</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 02</div>
    <div class="ragx-chunk-text"><mark>your team replaced it on 12 March.</mark> The replacement is fine, but the invoice still charges me for two desks. I only want to pay for one.</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 03</div>
    <div class="ragx-chunk-text"><mark>I only want to pay for one.</mark> Please correct the invoice and confirm the refund of the duplicate charge.</div>
  </div>
  <div class="ragx-chunk-foot">SCALED EXAMPLE · SAME OVERLAP PATTERN, SHORTER WINDOW</div>
</div>

1. Window 02 can still answer "what replaced the desk?" because the overlap carries "replaced it on 12 March" across the seam.
2. Window 03 alone does not know what "the duplicate charge" refers to; Window 02 introduced it. The overlap preserves the bridge.
3. No single window contains the whole story. That is why turn expansion reattaches the full messages, and why top-15 is a budget, not a guarantee.

The reported reader-evidence lengths are just as important as the window size. After turn expansion and formatting, the mean evidence supplied to the reader is:

| Benchmark | Mean tokens | Median | 95th percentile | Longest | Questions over 5,000 tokens |
| :-- | --: | --: | --: | --: | --: |
| MemoryAgentBench | 3,915.8 | 4,173.0 | 4,209.5 | 4,262 | 0 |
| LoCoMo | 4,778.8 | 4,778.0 | 4,966.1 | 5,177 | 41 |
| LongMemEval | 11,355.6 | 11,248.5 | 13,915.3 | 27,375 | 500 |
| MEME | 11,986.1 | 10,186.0 | 21,329.6 | 42,490 | 1,188 |

The 95th percentile is the length below which 95% of questions fall; the longest 5% are above it. The last column counts questions, not tokens.

The 5,000-token control is a useful sanity check. Raw-RAG never exceeds 5,000 tokens on MemoryAgentBench, and its score is unchanged at **48.32%**. Under the same ceiling, the strongest baseline in the control scores **44.74%**. On LoCoMo and LongMemEval, disabling turn expansion to fit 5,000 tokens *raises* the score slightly (+0.35 and +1.67); on MEME it lowers it by 1.09. The budget matters, but the bigger effect is still whether the right evidence was retrieved.

### What this means for this article

I ran the same tokenizer over the body of this post. The counts below exclude frontmatter, the chart SVGs, the 01B HTML chart, and this table itself. They are a practical example of how a prose article lands on a 256/32 index:

| Section | Approx. tokens | Windows @ 256/32 | Recommended reader unit |
| :-- | --: | --: | :-- |
| Opening + thesis | 941 | 5 | 3–5 windows |
| What "naive" means | 787 | 4 | 2–4 windows |
| Benchmark map | 1,057 | 5 | 3–5 windows |
| Why coverage wins | 567 | 3 | 2–3 windows |
| Paths and complete store | 941 | 5 | 3–5 windows |
| Mutation audit | 646 | 3 | 2–3 windows |
| Where complexity wins | 380 | 2 | 1–2 windows |
| Ablations | 802 | 4 | 2–4 windows |
| Cost | 718 | 4 | 2–3 windows |
| Chunking spec | 1,000 | 5 | 3–5 windows |
| Caveats + checklist | 646 | 4 | 2–4 windows |
| **Total body** | **8,485** | **44** | **Top-15 = 3,840 tokens before expansion** |

Two practical notes:

1. **Do not split tables, code blocks, or chart cards.** A 256-token window will cut through a Markdown table or an SVG. For prose, use heading-aware boundaries and a 10–15% overlap; for dialogue, use the paper's 256/32.
2. **The reader budget is not the index budget.** The index can hold every 256-token window; the reader should see a small, reranked set. Raw-RAG's 15-window default is about 3,840 tokens before turn expansion — which is why the reported evidence lengths are 3.9k to 12k tokens, not 15 × 256.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg><span>SECTION 10</span></div>

## What I would do with this

<ul class="ragx-checklist">
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg></span><div><b>Build the baseline before the memory layer.</b> A flat index, 256-token windows, 32-token overlap, top-128 dense candidates, cross-encoder top-15, turn expansion. Measure it on your own workload before you add anything.</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span><div><b>Measure coverage and utilization separately.</b> A single accuracy number hides whether you are failing to find evidence or failing to use it. Label a sample for <b>sufficiency</b> — mark whether the retrieved evidence was enough to answer, not whether the answer was correct; the diagnosis changes the fix.</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-route"></use></svg></span><div><b>Preserve provenance and paths.</b> Store the raw turn, its timestamp, and its links to the events that made it current. <b>Provenance</b> means where each stored fact came from; a fact without its dependency chain is a trap.</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg></span><div><b>Make every memory operation pass a matched-budget test.</b> Same reader, same evidence budget, same judge. If atomic facts, summaries, or graph expansion cannot beat the raw baseline, do not ship them.</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span><div><b>Test with the reader you will deploy.</b> The MEME ceiling test shows a 35-point spread across answering models on the same evidence. A memory design that helps a weak reader may be unnecessary for a strong one — and vice versa.</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-shield-check"></use></svg></span><div><b>Do not confuse benchmark accuracy with operational memory.</b> Deletion, <b>authoritative state</b> (which value is currently correct when several versions exist), <b>auditability</b> (the ability to trace why the system answered as it did), and privacy are real requirements that this paper does not test. Raw history is also a liability if you cannot delete it.</div></li>
</ul>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg><span>SECTION 11</span></div>

## Caveats

The result is strong, but it is not a universal law.

- **The comparisons mix published scores.** Different baseline papers used different answering models, different instructions, different graders, and different amounts of evidence. Where possible, the authors reran systems under the same conditions, but the headline comparison still mixes previously published numbers with new runs. The 0.13-point LongMemEval win is within the noise of LLM judging and should not be treated as a real margin.
- **The tasks are batch question answering over a fixed history.** The paper does not test a live conversation, an interactive agent, tool use, or memory for images and audio.
- **Coverage labels come from an LLM judge** on MemoryAgentBench. Each system's utilization is measured only on the questions it retrieved enough evidence for, so systems that retrieve less are graded on an easier subset. The reader comparison is not fully apples-to-apples.
- **Absolute MEME scores are low.** Raw-RAG's 39.30% with GPT-4o-mini and 43.19% with DeepSeek are far from solved; Full-context with DeepSeek reaches 63.17%. Retrieval is still leaving evidence on the table.
- **PersonaMem is a real counterexample.** When the task is personalization rather than fact recall, profile-based memory wins. The honest conclusion is not "agentic memory is dead"; it is "agentic memory must justify itself against a strong raw baseline."

The paper's title asks whether complex agentic memory is always needed. The answer it supports is: **no — and the field should stop assuming it is.** The baseline is simple, cheap, and hard to beat. That is exactly what a baseline is for.

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-book-open"></use></svg><span>SECTION 12</span></div>

## References

- *Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought.* [arXiv:2610.30755](https://arxiv.org/abs/2610.30755), 2026.
- LoCoMo, LongMemEval, MEME, MemoryAgentBench, and PersonaMem-v2 are the benchmarks used in the paper; see the preprint for the full baseline configurations and appendices.
- Icons: Lucide (ISC), delivered via the Iconify API.

<style>
.ragx-card {
  margin: 28px 0;
}
.ragx-card .ragx-title {
  font-family: var(--mono-font);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.35;
  color: var(--mono-ink);
  margin: 4px 0 3px;
}
.ragx-card .ragx-sub {
  font-family: var(--mono-font);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-muted);
  margin: 0 0 10px;
}
.ragx-svg {
  display: block;
  width: 100%;
  max-width: 640px;
  height: auto;
  margin: 4px auto 0;
  overflow: visible;
}
.ragx-src {
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mono-faint);
  margin-top: 8px;
}
.ragx-label {
  font-family: var(--mono-font);
  font-size: 7.5px;
  font-weight: 500;
  fill: var(--mono-l2);
}
.ragx-axis {
  font-family: var(--mono-font-mono);
  font-size: 6.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  fill: var(--mono-muted);
  paint-order: stroke;
  stroke: var(--mono-paper);
  stroke-width: 0.9px;
  stroke-linejoin: round;
}
.ragx-note {
  font-family: var(--mono-font-mono);
  font-size: 6.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  fill: var(--mono-muted);
}
.ragx-value {
  font-family: var(--mono-font);
  font-size: 7.2px;
  font-weight: 800;
  fill: var(--mono-l2);
  paint-order: stroke;
  stroke: var(--mono-paper);
  stroke-width: 1.2px;
  stroke-linejoin: round;
}
.ragx-value-strong {
  font-family: var(--mono-font);
  font-size: 7.4px;
  font-weight: 800;
  fill: var(--mono-ink);
  paint-order: stroke;
  stroke: var(--mono-paper);
  stroke-width: 1.2px;
  stroke-linejoin: round;
}
.ragx-value-paper {
  font-family: var(--mono-font);
  font-size: 7.4px;
  font-weight: 800;
  fill: var(--mono-paper);
}
.ragx-grid {
  stroke: var(--mono-grid);
  stroke-width: 0.7;
  stroke-dasharray: 2 3;
}
.ragx-grid-h {
  stroke: var(--mono-grid);
  stroke-width: 0.6;
}
.ragx-zero {
  stroke: var(--mono-l3);
  stroke-width: 1;
}
.ragx-tick {
  stroke: var(--mono-faint);
  stroke-width: 0.7;
}
.ragx-axis-line {
  stroke: var(--mono-grid);
  stroke-width: 0.8;
}
.ragx-stem {
  stroke: var(--mono-l5);
  stroke-width: 1;
}
.ragx-range {
  stroke: var(--mono-l4);
  stroke-width: 1.2;
}
.ragx-range-cap {
  stroke: var(--mono-l3);
  stroke-width: 0.8;
}
.ragx-bracket {
  stroke: var(--mono-l3);
  stroke-width: 0.7;
}
.ragx-dot {
  fill: var(--mono-l2);
}
.ragx-dot-ink {
  fill: var(--mono-ink);
}
.ragx-dot-soft {
  fill: var(--mono-l4);
}
.ragx-dot-hero {
  fill: var(--mono-ink);
}
.ragx-halo {
  fill: none;
  stroke: var(--mono-grid);
  stroke-width: 0.8;
}
.ragx-dot-hollow {
  fill: var(--mono-paper);
  stroke: var(--mono-ink);
  stroke-width: 1.1;
}
.ragx-bar {
  fill: var(--mono-l2);
}
.ragx-bar-hero {
  fill: var(--mono-ink);
}
.ragx-bar-pos {
  fill: var(--mono-ink);
}
.ragx-win {
  fill: none;
  stroke: var(--mono-grid);
  stroke-width: 0.8;
}
.ragx-overlap {
  fill: var(--mono-l6);
}
.ragx-src-box {
  fill: var(--mono-bg-subtle);
  stroke: var(--mono-grid);
  stroke-width: 0.7;
}
.ragx-turn {
  stroke: var(--mono-l5);
  stroke-width: 0.6;
}
.ragx-arrow {
  fill: none;
  stroke: var(--mono-l4);
  stroke-width: 0.8;
}
.ragx-tickline {
  stroke: var(--mono-l5);
  stroke-width: 0.7;
}
.ragx-reader {
  fill: var(--mono-paper);
  stroke: var(--mono-ink);
  stroke-width: 0.9;
}

.ragx-sprite { position: absolute; width: 0; height: 0; overflow: hidden; }
.ragx-ico { width: 14px; height: 14px; display: block; flex: none; }
.ragx-ico-xs { width: 12px; height: 12px; color: var(--mono-muted); }
.ragx-tag { display: inline-flex; align-items: center; gap: 6px; }
.ragx-bench-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 24px 0 18px; }
.ragx-bench { margin: 0; }
.ragx-bench .chamfer-card-content { padding: 16px 16px 14px; }
.ragx-bench-inner { display: flex; flex-direction: column; gap: 9px; }
.ragx-bench-top { display: flex; align-items: center; gap: 10px; }
.ragx-bench-ico { width: 32px; height: 32px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.ragx-bench-name { font-family: var(--mono-font); font-size: 13px; font-weight: 700; letter-spacing: -0.01em; color: var(--mono-ink); line-height: 1.2; }
.ragx-bench-sub { font-family: var(--mono-font-mono); font-size: 7.5px; font-weight: 600; letter-spacing: 0.08em; color: var(--mono-muted); margin-top: 2px; text-transform: uppercase; }
.ragx-bench .ragx-bench-inner p.ragx-bench-desc { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.5; color: var(--mono-l2); margin: 0; }
.ragx-bench-stats { display: grid; gap: 3px; margin: 0; }
.ragx-bench-stats div { display: grid; grid-template-columns: 46px 1fr; gap: 6px; align-items: baseline; }
.ragx-bench-stats dt { font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.08em; color: var(--mono-muted); }
.ragx-bench-stats dd { font-family: var(--mono-font); font-size: 9.5px; line-height: 1.4; color: var(--mono-l2); margin: 0; }
.ragx-bench-stress { border-top: 0.7px solid var(--mono-grid); padding-top: 8px; font-family: var(--mono-font); font-size: 9px; line-height: 1.45; color: var(--mono-l2); }
.ragx-bench-stress b { font-family: var(--mono-font-mono); font-size: 7px; letter-spacing: 0.08em; color: var(--mono-ink); margin-right: 4px; }
.ragx-callout { display: flex; align-items: flex-start; gap: 10px; border: 0.7px solid var(--mono-grid); border-left: 2px solid var(--mono-ink); padding: 12px 14px; margin: 18px 0 6px; }
.ragx-callout .ragx-ico { color: var(--mono-ink); margin-top: 2px; }
.ragx-callout > div { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); }
.ragx-callout b { color: var(--mono-ink); }
.ragx-checklist { list-style: none; padding-left: 0 !important; margin: 22px 0 !important; display: grid; gap: 12px; }
.ragx-checklist li { display: flex; align-items: flex-start; gap: 10px; margin: 0 !important; }
.ragx-check-ico { width: 24px; height: 24px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; margin-top: 1px; }
.ragx-checklist li > div { font-family: var(--mono-font); font-size: 12px; line-height: 1.6; color: var(--mono-l2); }
.ragx-checklist b { color: var(--mono-ink); }
@media (max-width: 700px) { .ragx-bench-grid { grid-template-columns: 1fr; } }

.ragx-kicker { display: flex; align-items: center; gap: 7px; margin: 34px 0 2px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.16em; color: var(--mono-muted); text-transform: uppercase; }
.ragx-kicker .ragx-ico { width: 11px; height: 11px; color: var(--mono-muted); }
.ragx-kicker::after { content: ""; flex: 1; height: 0.7px; background: var(--mono-grid); margin-left: 4px; }
article.prose-inner .ragx-kicker + h2 { margin-top: 4px; }

.ragx-glossary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin: 18px 0 10px; }
.ragx-gloss { display: flex; align-items: flex-start; gap: 9px; border-top: 0.7px solid var(--mono-grid); padding-top: 10px; }
.ragx-gloss-ico { width: 26px; height: 26px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.ragx-gloss-ico .ragx-ico { width: 12px; height: 12px; }
.ragx-gloss-term { font-family: var(--mono-font-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--mono-ink); text-transform: uppercase; }
.ragx-glossary .ragx-gloss .ragx-gloss-copy { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); margin: 3px 0 0; }

.ragx-oracle { border: 0.7px solid var(--mono-grid); margin: 20px 0 14px; }
.ragx-oracle-head { padding: 12px 14px 10px; border-bottom: 0.7px solid var(--mono-grid); }
.ragx-oracle-eyebrow { font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.14em; color: var(--mono-muted); }
.ragx-oracle-title { font-family: var(--mono-font); font-size: 14px; font-weight: 700; color: var(--mono-ink); margin-top: 4px; }
.ragx-oracle .ragx-oracle-head .ragx-oracle-sub { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.5; color: var(--mono-l2); margin: 4px 0 0; }
.ragx-oracle-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ragx-oracle-col { padding: 12px 14px; border-left: 0.7px solid var(--mono-grid); display: flex; flex-direction: column; gap: 6px; }
.ragx-oracle-col:first-child { border-left: 0; }
.ragx-oracle-name { font-family: var(--mono-font-mono); font-size: 7px; font-weight: 700; letter-spacing: 0.08em; color: var(--mono-ink); }
.ragx-oracle .ragx-oracle-col .ragx-oracle-copy { font-family: var(--mono-font); font-size: 10px; line-height: 1.5; color: var(--mono-l2); margin: 0; }
.ragx-oracle-score { font-family: var(--mono-font-mono); font-size: 18px; font-weight: 700; color: var(--mono-ink); margin-top: auto; }
.ragx-oracle-foot { border-top: 0.7px solid var(--mono-grid); padding: 7px 14px; font-family: var(--mono-font-mono); font-size: 6.5px; letter-spacing: 0.06em; color: var(--mono-muted); }
.ragx-table-note { margin-top: 6px; font-family: var(--mono-font-mono); font-size: 7.5px; line-height: 1.55; letter-spacing: 0.04em; color: var(--mono-muted); }

.ragx-abl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 18px 0 10px; }
.ragx-abl { border: 0.7px solid var(--mono-grid); padding: 12px 13px; display: flex; flex-direction: column; gap: 7px; }
.ragx-abl-hero { grid-column: 1 / -1; border-left: 2px solid var(--mono-ink); }
.ragx-abl-head { display: flex; align-items: center; gap: 7px; }
.ragx-abl-head .ragx-ico { width: 12px; height: 12px; color: var(--mono-ink); }
.ragx-abl-name { font-family: var(--mono-font-mono); font-size: 7.5px; font-weight: 700; letter-spacing: 0.05em; color: var(--mono-ink); }
.ragx-abl-delta { margin-left: auto; font-family: var(--mono-font-mono); font-size: 12px; font-weight: 700; color: var(--mono-ink); }
.ragx-abl-grid .ragx-abl .ragx-abl-big { font-family: var(--mono-font); font-size: 12.5px; font-weight: 700; line-height: 1.35; color: var(--mono-ink); margin: 0; }
.ragx-abl-grid .ragx-abl .ragx-abl-copy { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); margin: 0; }
.ragx-abl-grid .ragx-abl .ragx-abl-note { font-family: var(--mono-font); font-size: 10px; line-height: 1.5; color: var(--mono-muted); margin: 0; }
.ragx-abl-stat { display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 8px; border-top: 0.7px solid var(--mono-grid); padding-top: 7px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.05em; color: var(--mono-muted); }
.ragx-abl-stat b { font-size: 11px; color: var(--mono-ink); }

.ragx-chunk { border: 0.7px solid var(--mono-grid); margin: 18px 0 12px; }
.ragx-chunk-head { padding: 10px 13px; border-bottom: 0.7px solid var(--mono-grid); }
.ragx-chunk-eyebrow { font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 600; letter-spacing: 0.1em; color: var(--mono-muted); }
.ragx-chunk .ragx-chunk-head .ragx-chunk-src { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-ink); margin: 5px 0 0; }
.ragx-chunk-win { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 10px; padding: 9px 13px; border-top: 0.7px dashed var(--mono-grid); }
.ragx-chunk-tag { font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.06em; color: var(--mono-ink); padding-top: 2px; }
.ragx-chunk-text { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }
.ragx-chunk-text mark { background: var(--mono-l6); color: var(--mono-ink); padding: 0 2px; }
.ragx-chunk-foot { border-top: 0.7px solid var(--mono-grid); padding: 7px 13px; font-family: var(--mono-font-mono); font-size: 6.5px; letter-spacing: 0.06em; color: var(--mono-muted); }

@media (max-width: 700px) { .ragx-glossary { grid-template-columns: 1fr; } .ragx-oracle-grid { grid-template-columns: 1fr; } .ragx-oracle-col { border-left: 0; border-top: 0.7px solid var(--mono-grid); } .ragx-oracle-col:first-child { border-top: 0; } .ragx-abl-grid { grid-template-columns: 1fr; } }

@media (max-width: 700px) {
  article.prose-inner h1 { font-size: 26px; line-height: 1.35; }
}

article.prose-inner p.ragx-paper-link { display: flex; align-items: baseline; gap: 8px; font-family: var(--mono-font-mono); font-size: 8px; font-weight: 600; letter-spacing: 0.1em; color: var(--mono-muted); margin: 0 0 18px; }
.ragx-paper-link a { color: var(--mono-ink); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 0.7px; }
.ragx-paper-link a:hover { text-decoration-thickness: 1.2px; }
.ragx-paper-cta { margin: 0 0 22px; }
.ragx-paper-cta .mono-btn-chamfer { vertical-align: middle; }


.mx-card { width: 100%; }
  .mx-card .mx-title {
    font-family: var(--mono-font);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.35;
    color: var(--mono-ink);
    margin: 4px 0 3px;
  }
  .prose-inner .mx-card .mx-sub {
    font-family: var(--mono-font);
    font-size: 11.5px;
    font-weight: 400;
    line-height: 1.55;
    color: var(--mono-muted);
    margin: 0 0 12px;
  }
  .mx-legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mono-muted);
    margin: 0 0 22px;
  }
  .mx-legend .lg-raw { display: inline-flex; align-items: center; gap: 7px; color: var(--mono-ink); }
  .mx-legend .lg-raw::before { content: ''; width: 1.1px; height: 11px; background: var(--mono-ink); display: block; }
  .mx-legend .lg-best { display: inline-flex; align-items: center; gap: 7px; }
  .mx-legend .lg-best::before { content: ''; width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--mono-ink); background: var(--mono-paper); display: block; }
  .mx-legend .lg-scale { margin-left: auto; }
  .mx-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px 26px;
    align-items: start;
  }
  .mx-panel {
    border-top: 0.7px solid var(--mono-grid);
    padding-top: 11px;
    min-width: 0;
  }
  .mx-panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mx-card .mx-panel .mx-setting {
    margin: 0;
    padding: 0;
    border: 0;
    font-family: var(--mono-font);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.3;
    color: var(--mono-ink);
  }
  .mx-count {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mono-muted);
    white-space: nowrap;
  }
  .mx-rows { display: grid; gap: 0; }
  .mx-row {
    position: relative;
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    min-height: 22px;
    padding-left: 10px;
  }
  .mx-row.is-raw::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 1.1px;
    background: var(--mono-ink);
  }
  .mx-plot { position: relative; min-width: 0; }
  .mx-name {
    font-family: var(--mono-font);
    font-size: 10.5px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--mono-l2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mx-row.is-raw .mx-name { color: var(--mono-ink); font-weight: 700; }
  .mx-track {
    position: relative;
    width: calc(100% - 34px);
    height: 6px;
    background: var(--mono-bg-subtle);
    border-radius: 99px;
    min-width: 0;
  }
  .mx-fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: calc(var(--s) * 1%);
    background: var(--mono-l4);
    border-radius: 99px;
  }
  .mx-row.is-raw .mx-fill { background: var(--mono-ink); }
  .mx-best {
    position: absolute;
    left: calc(var(--s) * 1%);
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--mono-paper);
    border: 1.2px solid var(--mono-ink);
    transform: translate(-50%, -50%);
    box-sizing: border-box;
  }
  .mx-score {
    position: absolute;
    left: calc(var(--s) * 1% + 6px - var(--s) * 0.34px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    background: var(--mono-paper);
    padding: 0 2px;
    font-family: var(--mono-font);
    font-size: 10px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    text-align: left;
    color: var(--mono-l2);
    white-space: nowrap;
  }
  .mx-score.is-best { color: var(--mono-ink); font-weight: 700; }
  .mx-method {
    align-self: stretch;
    display: flex;
    flex-direction: column;
  }
  .mx-method-kicker {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mono-muted);
    margin-bottom: 8px;
  }
  .prose-inner .mx-card .mx-method-body {
    margin: 0;
    font-family: var(--mono-font);
    font-size: 10.5px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--mono-l2);
  }
  .mx-nowrap { white-space: nowrap; }
  .mx-src {
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mono-faint);
    margin-top: 20px;
  }
  @media (max-width: 720px) {
    .mx-card { width: 100%; }
    .mx-grid { grid-template-columns: 1fr; gap: 22px; }
    .mx-row { grid-template-columns: 86px minmax(0, 1fr); gap: 8px; padding-left: 8px; }
    .mx-name { font-size: 10.5px; }
    .mx-score { font-size: 10px; }
    .mx-legend { margin-bottom: 18px; }
    .mx-legend .lg-scale { margin-left: 0; }
  }
</style>
