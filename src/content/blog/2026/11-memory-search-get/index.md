---
title: "Search, Then Get: The Two Modules of Agent Memory"
description: "Agent memory is two modules, not one. Search reduces the corpus to ranked handles; Get expands a handle into the full, current record. An architecture essay about the seam between finding and reading."
pubDate: 2026-11-23
category: "AI"
tags: ["Agents", "Memory", "RAG", "Retrieval", "Architecture"]
featured: false
author: "Alex.Hsiao"
readTime: "13 min read"
cardImage: "./cover.webp"
cardImageAlt: "MemGPT memory hierarchy diagram: a fixed context window with archival and recall storage managed by functions"
---

# Search, Then Get: The Two Modules of Agent Memory

## The short version: two moves

<section class="mem-lead">
  <div class="mem-lead-head">
    <span class="card-tag">THE TWO MODULES // 00</span>
    <p class="mem-lead-kicker">Most agent memory systems do not fail at the embedding model. They fail at the seam between finding and reading.</p>
    <h3 class="mem-lead-title">Agent memory has two moves.</h3>
    <p class="mem-lead-sub">Find, then read. Search reduces the corpus to candidates; Get expands one candidate into the record.</p>
  </div>
  <div class="mem-lead-grid">
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mem-lead-tag">SEARCH // FIND</div>
      <h4>Ask a question, get a shortlist</h4>
      <p>Like typing into a search box. It returns handles with scores and previews. Maybe three. Maybe none.</p>
      <div class="mem-lead-meta">QUERY → N HANDLES</div>
    </div>
    <div class="mem-lead-plus" aria-hidden="true">+</div>
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg></div>
      <div class="mem-lead-tag">GET // READ</div>
      <h4>Open one handle, read the record</h4>
      <p>Like opening one result. It returns the full, current record: text, metadata, version. No guessing, no ranking.</p>
      <div class="mem-lead-meta">HANDLE → FULL RECORD</div>
    </div>
  </div>
  <div class="mem-lead-flow mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 170" role="img" aria-labelledby="mem-f0-title mem-f0-desc">
    <title id="mem-f0-title">A simple Search then Get flow</title>
    <desc id="mem-f0-desc">A cue goes to Search, which returns three handles. One handle is selected and passed to Get, which returns the full record. A dashed arrow carries the evidence back as a new cue.</desc>
    <defs>
      <marker id="mem-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-lead-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">SIMPLE FLOW // ONE SEARCH, ONE GET</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE SEARCH · MANY HANDLES · ONE RECORD</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="112" height="72" class="term"/>
    <text x="36" y="60" class="f" font-size="6.8" letter-spacing="0.8">CUE</text>
    <text x="36" y="76" class="t mono" font-size="7.8">refund window</text>
    <text x="36" y="94" class="m" font-size="6.8">query + filters</text>
    <line x1="136" y1="80" x2="152" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="156" y="44" width="170" height="72" class="box"/>
    <svg x="168" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <text x="192" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="192" y="80" class="m" font-size="7">rank candidates</text>
    <text x="168" y="104" class="f" font-size="6.8">grep · BM25 · vector · hybrid</text>
    <line x1="326" y1="80" x2="342" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <text x="358" y="58" class="f" font-size="6.8" letter-spacing="0.6">3 HANDLES · OPEN ONE</text>
    <rect x="358" y="64" width="164" height="14" class="box"/>
    <text x="366" y="74" class="m mono" font-size="6.2">01</text>
    <text x="382" y="74" class="t mono" font-size="6.7">returns-2024:41</text>
    <rect x="358" y="82" width="164" height="14" fill="var(--mono-l1)"/>
    <text x="366" y="92" fill="var(--mono-paper)" class="mono" font-size="6.2">02</text>
    <text x="382" y="92" fill="var(--mono-paper)" class="mono" font-size="6.7">returns-2026:12</text>
    <rect x="358" y="100" width="164" height="14" class="box"/>
    <text x="366" y="110" class="m mono" font-size="6.2">03</text>
    <text x="382" y="110" class="t mono" font-size="6.7">ticket-8841:7</text>
    <line x1="522" y1="89" x2="540" y2="89" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="544" y="44" width="170" height="72" class="box"/>
    <svg x="556" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg>
    <text x="580" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="580" y="80" class="m" font-size="7">resolve one</text>
    <text x="556" y="104" class="f" font-size="6.8">full record</text>
    <line x1="714" y1="80" x2="730" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <text x="744" y="58" class="f" font-size="6.6" letter-spacing="0.6">RECORD</text>
    <line x1="744" y1="70" x2="806" y2="70" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="80" x2="794" y2="80" stroke="var(--mono-ink)" stroke-width="1"/>
    <line x1="744" y1="90" x2="806" y2="90" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="100" x2="786" y2="100" stroke="var(--mono-l5)" stroke-width="1"/>
    <text x="744" y="112" class="m" font-size="6.4">one record</text>
    <path d="M775 120 V140 H80 V118" class="dash" fill="none" marker-end="url(#mem-lead-arrow-muted)"/>
    <text x="427" y="154" class="f" font-size="6.9" text-anchor="middle" letter-spacing="0.6">EVIDENCE → NEXT CUE · SEARCH AGAIN</text>
  </svg>
  </div>
  <p class="mem-lead-note"><b>Search</b> finds the candidates. <b>Get</b> produces the evidence. The engineering lives in the contract between them.</p>
</section>

<p class="mem-lead-bridge">The classification is small: one verb is set-valued, the other is singular. Most of the design work follows from keeping them separate — in the index, in the handle, and in the loop.</p>

<figure class="fig">
  <img src="/images/memory-search-get/memgpt-system-flow.webp" alt="MemGPT figure three: a fixed LLM context window with system instructions, working context, and a FIFO queue, plus archival and recall storage connected through a function executor and queue manager" width="1600" height="610" loading="lazy" />
  <figcaption><b>Paper Fig. 3</b> — MemGPT's memory hierarchy: a fixed context window (system instructions, working context, FIFO queue) and external archival and recall storage, joined by functions the model can call. The paper's bet is that the model manages the hierarchy itself: it searches external storage and pages records back into the window. Source: <a href="https://arxiv.org/abs/2310.08560">Packer et al., "MemGPT: Towards LLMs as Operating Systems"</a>, Figure 3 · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

## Two verbs, one memory

Search is set-valued. It accepts a cue — a literal, a regex, a natural-language question, a metadata filter — and returns candidates. It is allowed to be approximate, ranked, and bounded. Its job is recall under a budget, not truth.

Get is singular. It accepts one address and returns the record at that address, or a definite miss. It is the primary-key lookup of memory: address in, record out. It is not allowed to rank, summarize, or substitute a near neighbor. Its job is resolution.

The unit that joins them is the **handle**: a stable name for a stored span. `src/auth/session.ts:42`, `orders/1841#L12`, `4f2c9a1:docs/spec.md`, `chunk_01H8...`, `message 118`. A handle is not the content. It is the promise that the content can be produced again.

A retrieval result that cannot be resolved again is not memory. It is a quotation.

Top-k chunks pasted into a prompt are quotations. They may answer the current question. They cannot be revisited, widened, or checked against a newer version. A grep hit with a file and a line number is a memory: the agent can leave, do something else, and come back to the same bytes.

The pair is asymmetric. Search is a reduction: many records become a few candidates. Get is an expansion: one candidate becomes a full record with its metadata. Search throws information away on purpose, because the context cannot hold the corpus. Get restores the part that matters, because the answer needs the record, not a resemblance to it. If both ends reduce, the agent never sees a whole record. If both ends expand, the context fills with everything the index touched.

The loop is what browsing means: cue → Search → handles → choose → Get → evidence → new cue. A library without a catalog is unusable; a catalog without shelves is a bibliography. An agent needs both halves.

## The architecture: index, handles, records

A memory system that exposes both verbs has three layers, and they have different jobs.

1. **The index** is derived, rebuildable, and lossy. For files, it may be the corpus itself plus a scanner. For BM25, it is an inverted index. For dense retrieval, it is an ANN structure over embeddings. For hybrid search, it is both, fused. The index exists to find candidates quickly. It is allowed to lag, to be partial, and to be approximate.

2. **The handle** is a small, addressable pointer. It names a record or a span inside one, and it carries enough context to resolve that name later: store, ID, span, version, scope. It is cheap to mint and cheap to pass around.

3. **The record store** is authoritative. It holds the full text, the metadata, the version, and the permissions. It is the thing that must still be true tomorrow.

The division of labor is the invariant:

- Search reads the index, never the record store.
- Get reads the record store, never the index.
- The index can be rebuilt from the records. The records cannot be rebuilt from the index.

That last line is the test for whether a system has memory or only retrieval. If the only copy of a fact lives in an embedding, it is not memory. It is a rumor with a vector.

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">SYSTEM MAP // 01</span>
    <h3 class="mem-fig-title">The index finds. The record store proves.</h3>
    <p class="mem-fig-sub">Search ranks handles from a derived index. Get resolves one handle against the authoritative record. Evidence enters context; the next turn starts there.</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 360" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">The architecture of agent memory</title>
    <desc id="mem-f1-desc">A planner writes a query into Search. Search probes a derived index of grep, BM25, vector, or hybrid retrieval and returns ranked handles with IDs, scores, and previews. Get resolves one handle against the authoritative record store, which holds full text, metadata, permissions, and version. Evidence enters context and the next turn feeds back to the planner.</desc>
    <defs>
      <marker id="mem-arch-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arch-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">MEMORY // ARCHITECTURE</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">QUERY → HANDLES → RECORD → CONTEXT</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="176" y="46" class="f" font-size="7" letter-spacing="1.1">01 / FIND</text>
    <text x="590" y="46" class="f" font-size="7" letter-spacing="1.1">02 / READ</text>
    <rect x="24" y="58" width="126" height="92" class="box"/>
    <text x="36" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">AGENT / PLANNER</text>
    <text x="36" y="92" class="m" font-size="6.4">plans the next move</text>
    <rect x="36" y="102" width="102" height="20" class="term"/>
    <text x="44" y="116" class="m mono" font-size="6.3">task · turn · budget</text>
    <text x="36" y="140" class="f" font-size="6.2" letter-spacing="0.6">WRITES THE QUERY</text>
    <line x1="150" y1="112" x2="172" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="58" width="152" height="92" class="box"/>
    <text x="188" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="188" y="92" class="m" font-size="6.4">query + filters</text>
    <rect x="188" y="102" width="128" height="30" class="term"/>
    <text x="196" y="114" class="t mono" font-size="6.2">"refund window"</text>
    <text x="196" y="125" class="m mono" font-size="6.2">after:2026-01-01</text>
    <text x="188" y="143" class="f" font-size="6.2" letter-spacing="0.6">RETURNS HANDLES</text>
    <line x1="328" y1="112" x2="350" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="354" y="58" width="170" height="92" class="box"/>
    <text x="366" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">INDEX</text>
    <text x="366" y="92" class="m" font-size="6.4">derived · rebuildable</text>
    <rect x="366" y="100" width="46" height="20" class="term"/>
    <text x="389" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">GREP</text>
    <rect x="418" y="100" width="46" height="20" class="term"/>
    <text x="441" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">BM25</text>
    <rect x="470" y="100" width="46" height="20" class="term"/>
    <text x="493" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">VECTOR</text>
    <rect x="366" y="122" width="150" height="16" class="term"/>
    <text x="441" y="134" class="m mono" font-size="6.3" text-anchor="middle">HYBRID · fuse + rerank</text>
    <text x="366" y="147" class="f" font-size="6.1" letter-spacing="0.6">SCAN OR ANN PROBE</text>
    <line x1="524" y1="112" x2="546" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="550" y="58" width="266" height="92" class="box"/>
    <text x="562" y="76" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">RANKED HANDLES</text>
    <text x="562" y="88" class="m" font-size="6.4">id · score · preview</text>
    <rect x="562" y="94" width="242" height="15" fill="var(--mono-l1)"/>
    <text x="570" y="104" fill="var(--mono-paper)" class="mono" font-size="6.2">01</text>
    <text x="584" y="104" fill="var(--mono-paper)" class="mono" font-size="6.4">policies/2026-returns.md:12</text>
    <text x="796" y="104" fill="var(--mono-paper)" class="mono" font-size="6.1" text-anchor="end">0.94</text>
    <rect x="562" y="111" width="242" height="15" class="box"/>
    <text x="570" y="121" class="m mono" font-size="6.2">02</text>
    <text x="584" y="121" class="t mono" font-size="6.4">policies/returns-2024.md:41</text>
    <text x="796" y="121" class="m mono" font-size="6.1" text-anchor="end">0.89</text>
    <rect x="562" y="128" width="242" height="15" class="box"/>
    <text x="570" y="138" class="m mono" font-size="6.2">03</text>
    <text x="584" y="138" class="t mono" font-size="6.4">tickets/8841.json:7</text>
    <text x="796" y="138" class="m mono" font-size="6.1" text-anchor="end">0.81</text>
    <line x1="683" y1="150" x2="683" y2="186" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <text x="692" y="172" class="f" font-size="6.2" letter-spacing="0.6">ONE CHOSEN</text>
    <rect x="590" y="188" width="190" height="88" class="box"/>
    <text x="602" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="602" y="221" class="m" font-size="6.4">one handle in</text>
    <rect x="602" y="229" width="166" height="30" class="term"/>
    <text x="610" y="241" class="t mono" font-size="6.2">2026-returns.md:12</text>
    <text x="610" y="252" class="m mono" font-size="6.2">window = 40 lines</text>
    <text x="602" y="270" class="f" font-size="6.2" letter-spacing="0.6">RECORD OUT · NO RANKING</text>
    <line x1="590" y1="232" x2="554" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="344" y="188" width="208" height="88" class="box"/>
    <text x="356" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">RECORD STORE</text>
    <text x="356" y="221" class="m" font-size="6.4">authoritative · versioned</text>
    <text x="356" y="237" class="m" font-size="6.2">full text · source type</text>
    <text x="356" y="248" class="m" font-size="6.2">status · effective date</text>
    <text x="356" y="259" class="m" font-size="6.2">permissions · owner</text>
    <text x="356" y="270" class="m" font-size="6.2">version / content hash</text>
    <line x1="344" y1="232" x2="322" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="188" width="144" height="88" class="box"/>
    <text x="188" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">EVIDENCE</text>
    <text x="188" y="221" class="m" font-size="6.4">resolved bytes</text>
    <text x="188" y="238" class="m" font-size="6.2">current policy</text>
    <text x="188" y="250" class="m" font-size="6.2">effective 2026-01-01</text>
    <text x="188" y="262" class="m" font-size="6.2">cite: L12–L17</text>
    <line x1="176" y1="232" x2="154" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="24" y="188" width="128" height="88" class="box"/>
    <text x="36" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">CONTEXT</text>
    <text x="36" y="221" class="m" font-size="6.4">prompt · turn</text>
    <text x="36" y="238" class="m" font-size="6.2">evidence in</text>
    <text x="36" y="250" class="m" font-size="6.2">token budget</text>
    <text x="36" y="262" class="m" font-size="6.2">next turn →</text>
    <path d="M88 188 V152" class="dash" fill="none" marker-end="url(#mem-arch-arrow-muted)"/>
    <text x="96" y="174" class="f" font-size="6.2" letter-spacing="0.6">NEW CUE</text>
    <rect x="24" y="292" width="792" height="48" class="codebox"/>
    <text x="40" y="309" class="t mono" font-size="7.2" font-weight="700">SEARCH: corpus → candidates · returns handles, never the record.</text>
    <text x="40" y="323" class="t mono" font-size="7.2" font-weight="700">GET: handle → record · returns the record, never a ranking.</text>
    <text x="40" y="337" class="m mono" font-size="6.5">INDEX is derived and disposable. RECORD STORE is authoritative.</text>
  </svg>
  </div>
  <div class="mem-fig-src">ARCHITECTURE · TWO VERBS · ONE HANDLE TYPE · NO SHARED RANKING</div>
</figure>

Read the diagram left to right on the top row, then right to left on the bottom. The planner writes a query; Search probes a derived index; the index returns handles; Get resolves one handle against the authoritative store; evidence enters context; the next turn starts there. The feedback arrow is not decoration. The record supplies the next cue.

The same shape covers very different deployments. Files plus `grep` and `sed` are the degenerate case: the index and the record store are the same directory. A vector database plus an object store plus a SQL metadata table is the separated case. A conversation log plus a turn index is a third. In every case, the interface is the same, and the invariant is the same: the thing that ranks is not the thing that is authoritative.

## Search: reduce the corpus to candidates

The interface is small:

```python
hits = search(query, filters, k)
# -> [Handle(id, score, preview), ...]
```

The query can be a literal, a regex, a bag of terms, a natural-language question, or a structured filter. The implementation can be grep, BM25, an ANN index, or a fusion of several. None of these is universally best. Literal search is precise when the agent knows the string; BM25 is strong when the vocabulary overlaps; dense retrieval handles paraphrase; hybrid covers the case where the agent does not know which one applies.

Filters deserve more attention than they usually get. Time, path, tenant, type, status, and source are cheap ways to remove whole regions of the corpus before similarity runs. A date filter can eliminate an entire class of wrong answers without touching the embedding. The filter is part of the query, not an afterthought applied to the result.

Search owns recall first and precision second. If the right record is not in the candidate set, Get cannot recover it. So `k` has to be large enough to cover the plausible answers, and the candidate set has to be diverse enough that one ranking function does not collapse it. Only then does precision at the top matter, because the planner will read a handful at most. `k` is a budget decision, not a quality knob: returning fifty handles is cheap; returning fifty records is not.

This is why Search should return handles rather than content.

- **Context budget.** A shortlist should cost tens of tokens per item, not thousands. The full record is fetched only for the candidates that survive.
- **Deferred resolution.** The planner can choose, re-query, widen, or stop. Inline passages force the choice at the moment of retrieval.
- **Verification.** Get is where freshness and permissions are checked. A passage pasted into the prompt has already skipped that check.
- **One ranking authority.** If Search returns passages, the ranking model's top choice quietly becomes the answer. The planner never gets to compare.

When Search returns passages inline, it has already spent the context and made the choice. The model cannot widen the passage, cannot check a newer version, and cannot cite a precise span. The score becomes the answer.

There is also a legibility argument. Literal search fails visibly: an empty result or an obvious mismatch tells the agent to change the pattern. Dense search fails plausibly: a nearest-neighbor index returns a neighbor even when no good match exists, unless the system applies a threshold and says so. A memory system that cannot report "I did not find it" will manufacture continuity. Return the query that ran, the filters that applied, and a confidence signal. A miss is information.

None of this makes one instrument universally better. It makes the instrument a choice the planner can reason about. Search should expose more than one way to look, and it should let the agent switch when the first look fails.

## Get: expand a handle into evidence

The other half is deliberately boring:

```python
record = get(handle, window=None)
# -> Record(text, metadata, version, scope) | Miss | Mismatch
```

Get takes the handle verbatim. It does not re-run Search, does not fuzzy-match the nearest ID, and does not pick the best paragraph. It resolves the address and returns the record.

Expansion means more than returning the matched line. Get should return the enclosing section, the document title, the effective date, the status, the source type, and the version. The agent needs the record's own description to decide whether it applies. A policy line without its effective date is a quotation. A ticket that mentions a policy is not the policy.

Freshness is the first hard problem. The index is a snapshot; records move. Get should read through to the current record, or to a versioned snapshot if the handle pins one, and it should report which version it served. If the handle names a version and the store has moved on, Get returns a mismatch with both versions. It never silently resolves to different bytes.

Permissions are the second. Search may rank over a corpus wider than the caller's read scope. The preview can leak a title, a path, or a snippet even when the body is protected. Filter at Search, enforce at Get, and generate previews only from fields the caller may read. A handle should carry a scope, or be unguessable, but obscurity is not authorization.

Cost is the third. Get's cost is the bytes returned plus the turn spent reading them. Give it a window, a byte cap, and a token estimate. Whole-file reads are how a memory system becomes a context leak. If the record is large, return a structured slice: the heading path, the relevant section, the metadata, and a pointer to the rest. Do not summarize inside Get. Summarization is a write-time or planner-time decision, not a read-time substitution.

Version is the fourth. Every record needs a version: a hash, an ETag, a commit, an `updated_at`. The handle may pin it. Get returns the version it served, so the planner can cache evidence and know when to refresh. A version is not a formality. It is the difference between "the policy" and "a policy that was true when the index was built."

And Get never ranks. If Get starts choosing "the best passage", ranking has leaked into the read path. Then two components rank, neither is accountable, and the handle no longer means "this record" but "something around here".

## The handle contract

Once Search returns handles, the hard part moves to the handle. A good handle has five properties.

1. **Stable.** The same handle resolves to the same record version for the life of the task. Immutable IDs are better than line numbers; if the store mutates, the handle carries a version. `path:41-58` is more stable than `path`, but a file edit still shifts every line after it.

2. **Addressable.** Get accepts it verbatim. No second Search, no fuzzy match, no guessing. A handle is a name plus enough context to resolve it: store, ID, span, version, scope.

3. **Previewable.** It carries, or can cheaply fetch, a short preview for ranking and logs. The preview is not evidence. It is a reason to open the record.

4. **Permissioned.** It carries or implies a scope, and Get enforces it. Search should not mint handles the caller can never resolve, and a preview should not disclose what the record would hide.

5. **Versioned.** It pins a version or reports the one it resolved. A mismatch is a first-class response, not an exception to swallow.

A workable shape looks like this:

```json
{
  "store": "docs",
  "id": "policies/2026-returns.md",
  "span": "L12-L17",
  "version": "sha256:6f1c...",
  "scope": "tenant:acme",
  "preview": "Refunds are accepted within 14 days..."
}
```

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

The efficient policy is therefore asymmetric: Search wide and cheap, Get narrow and exact. The common failure is the reverse — one narrow Search, then a whole-file Get. That is how an agent spends tens of thousands of tokens to answer a question whose evidence was one paragraph.

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

The stopping rule is not "k results read". It is "no new handles" or "every claim has a resolved source". A loop that stops at `k` has turned memory back into a quotation service.

The context budget is the other half. Every Get displaces working state: instructions, the current plan, the previous evidence. Evidence should be spent on the claims the answer actually needs. A system that retrieves a dozen records and uses one has paid for a dozen reads and one answer. Track bytes per resolved claim, not bytes per turn.

What to measure follows from the loop: searches per answer, gets per search, unique handles, dead-handle rate, re-search rate, and bytes per resolved claim. Accuracy alone cannot tell you whether the memory is browsable. A system that returns high scores but few resolvable handles is a search engine, not a memory.

## The memory desk

The desk below makes the division visible. The cue matches three records. Search ranks them. Get reads them. Only one is the current policy.

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">MEMORY DESK // 02</span>
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
      <div class="mem-col-head">GET // EXACT RECORD</div>
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

If the record did not carry that metadata, Get would return bytes and the agent would still be guessing. A handle resolves a location. Provenance resolves meaning.

## What this changes in practice

The API is two functions and one handle type. The schema is where the real work lives.

```python
# Search returns handles. It never returns records.
hits = memory.search("refund window", filters={"after": "2026-01-01"}, k=8)
# -> [Handle(id=..., score=0.94, preview="..."), ...]

# Get resolves one handle. It never ranks.
record = memory.get(hits[0], window=40)
# -> Record(text=..., metadata={...}, version="sha256:...", scope="tenant:acme")
```

- **One handle type, two verbs.** If Search and Get each invent their own address format, the seam becomes a translation layer and the translation will drift.

- **Search returns handles with previews, never full records.** A preview is a reason to open a record, not a substitute for it.

- **Get is first-class.** It accepts a handle verbatim and returns an exact record or a definite miss. It is not a hidden step inside Search.

- **Get takes a span or a window.** A whole-file read is how a memory system becomes a context leak. Enforce a byte cap and report the token estimate before the planner commits.

- **Put provenance in the record.** Effective dates, status, source type, version, and permissions belong in the bytes Get returns, not in a side channel the agent cannot see.

- **Keep the index derivable.** Rebuild it from records when the embedding model changes. Never let the index become the only copy of a fact.

- **Apply permissions twice.** Filter in Search, enforce in Get, and generate previews only from readable fields. A title leak is still a leak.

- **Version every handle and fail loudly.** A mismatch is cheaper than a wrong answer that looks current.

- **Expose more than one search instrument.** Literal for known items, BM25 for term overlap, dense for paraphrase, filters for structure. Let the planner choose, or route by query type.

- **Instrument the loop.** Searches per answer, gets per search, unique handles, dead handles, re-searches, bytes per resolved claim. Accuracy alone hides the seam.

## Failure modes

Most memory failures are not model failures. They are contract failures, and they cluster at the two boundaries: the index and the record store.

| Failure | What goes wrong | Design fix |
| :--- | :--- | :--- |
| Search miss | The query vocabulary does not match the record, or a dense index returns a plausible neighbor. The right record never enters the candidate set. | Offer more than one instrument, let the planner reformulate from evidence, apply filters early, and return an explicit low-confidence or empty result. |
| Stale handle | A record is edited, re-indexed, or compacted. The handle still resolves, but to different bytes. | Version the handle, hash the record, and return a mismatch with both versions instead of silently resolving. |
| Permission leak | Search ranks a document the caller cannot read, or the preview exposes its title or snippet. | Filter by scope at Search, enforce at Get, and build previews only from readable fields. Do not rely on unguessable IDs as authorization. |
| Get too expensive | The planner reads whole files or repeats the same Get, and evidence crowds out working state. | Require a span or window, cap bytes and tokens, cache resolved records by version, and charge the read against the turn budget. |
| Infinite loop | Every record suggests a new cue, no handle is repeated in the seen-set, and the loop never reaches a claim. | Keep a seen-set, cap turns and bytes, stop on no new handles or resolved claims, and treat repeated cues as a signal to change instruments. |
| Handle collision | Two records share an ID after a re-index or a merge, and the handle resolves to the wrong one. | Namespace IDs by store, keep record IDs immutable, include a version, and check for collisions when minting a handle. |

The failures are asymmetric. A Search miss is cheap: the agent sees an empty list and tries another query. A Get failure is expensive: the agent has already spent context and may not notice that the record is stale, unreadable, or the wrong one. That asymmetry is why Get needs the stricter contract, and why "the retriever scored well" is not a memory metric.

The two modules are not a pipeline you install once. They are a division of labor you have to keep: Search reduces, Get expands, the handle carries the promise between them, and the loop spends the budget. When the seam holds, the agent can find something, leave, come back, and still be talking about the same record.

## References

- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401) — the retrieve-then-generate pipeline this article is arguing about.
- [MemGPT](https://arxiv.org/abs/2310.08560) — memory as an operating system, with paging between context and storage.
- [Lost in the Middle](https://arxiv.org/abs/2307.03172) — why more retrieved text is not automatically more usable.

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
    .prose-inner .mem-lead-grid {
      grid-template-columns: 1fr;
    }

    .prose-inner .mem-lead-plus {
      height: 24px;
    }

    .prose-inner .mem-lead-title {
      font-size: 18px;
    }

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

  .prose-inner .mem-lead {
    margin: 26px 0;
    padding: 20px 18px 16px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .mem-lead-head {
    margin-bottom: 14px;
  }

  .prose-inner .mem-lead-kicker {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .mem-lead-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--mono-ink);
  }

  .prose-inner .mem-lead-sub {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .mem-lead-grid {
    display: grid;
    grid-template-columns: 1fr 30px 1fr;
    align-items: stretch;
    margin-bottom: 14px;
  }

  .prose-inner .mem-lead-card {
    display: flex;
    flex-direction: column;
    padding: 16px 14px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .mem-lead-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    margin-bottom: 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-bg-subtle);
    color: var(--mono-ink);
  }

  .prose-inner .mem-lead-ico {
    display: block;
    width: 24px;
    height: 24px;
  }

  .prose-inner .mem-lead-tag {
    margin-bottom: 5px;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
  }

  .prose-inner .mem-lead-card h4 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.35;
    color: var(--mono-ink);
  }

  .prose-inner .mem-lead-card p {
    margin: 0 0 12px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .mem-lead-meta {
    margin-top: auto;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--mono-faint);
  }

  .prose-inner .mem-lead-plus {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono-font-mono);
    font-size: 12px;
    color: var(--mono-faint);
  }

  .prose-inner .mem-lead-flow {
    margin-bottom: 12px;
  }

  .prose-inner .mem-lead-note {
    margin: 0;
    padding-top: 10px;
    border-top: 0.7px solid var(--mono-grid);
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .mem-lead-note b {
    color: var(--mono-ink);
  }

  .prose-inner .mem-lead-bridge {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }
</style>
