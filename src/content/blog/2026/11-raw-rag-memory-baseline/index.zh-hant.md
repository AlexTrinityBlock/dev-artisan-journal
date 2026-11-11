---
title: "原始歷史就是記憶系統：Naive RAG 基線揭露了什麼"
description: "細讀 arXiv:2610.30755：Raw-RAG 這個刻意簡單的基線，不做摘要、不建圖譜、不改寫記憶，只把原始對話切成 256 token 的窗格，先檢索 128 段，再重排成 15 段。它在七個評測設定中贏過其他記憶系統六次——每個設定是一個 benchmark 搭配一個 reader model。"
pubDate: 2026-11-11
category: "AI"
tags: ["RAG", "Memory", "LLM", "論文筆記", "Retrieval"]
featured: false
author: "Alex.Hsiao"
readTime: "22 min read"
---

# 原始歷史就是記憶系統：Naive RAG 基線揭露了什麼

<svg class="ragx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="ragx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="ragx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="ragx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="ragx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="ragx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="ragx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="ragx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="ragx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="ragx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="ragx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="ragx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="ragx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="ragx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="ragx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="ragx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="ragx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="ragx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="ragx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="ragx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="ragx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="ragx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="ragx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="ragx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="ragx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="ragx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="ragx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="ragx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="ragx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="ragx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="ragx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol></defs></svg>

每個 **AI 記憶系統**最後都會多出一層：抽取、整合、圖建構、變更、衰減、反思。原因很簡單——對話很長、模型的 context window 有限，模型不該每次回答都重讀全部。每一層都試著把歷史摘要、整理或更新，讓模型更好用；但每一層也多了地方，讓證據可能遺失、被扭曲、或被搬到拿不到的地方。

2026 年的一篇**預印本**（preprint，送審前先公開的論文）直接把這個不舒服的問題問出來：**這些複雜度，對長期對話理解真的是必要的嗎？** 在評測裡，**baseline（基線）** 是那個刻意保持簡單的對照系統：所有更複雜的方法都必須先贏過它。少了這個固定對照，就無法分辨進步是來自記憶層、更強的回答模型，還是剛好猜對的 prompt。作者建立的 *Raw-RAG* 就是這個對照。

**RAG** 是 **retrieval-augmented generation（檢索增強生成）**：不只靠模型記住的內容，而是先搜尋一座文字庫，把相關片段貼進 prompt。**Agentic memory** 則是相反的做法：由 LLM 自己決定要抽取、摘要、更新或刪除什麼，而不是只存原始文字。*Raw-RAG* 完全不做 LLM 式的記憶管理——沒有模型會寫摘要、抽事實、建圖或改寫記憶庫；歷史原封不動存著。檢索仍然使用神經模型（用 embedding 找候選，用 cross-encoder 重排），所以「naive」說的是**記憶策略**，不是檢索機制。

它索引原始歷史、取出 dense 候選、重新排序，再把選中的窗格交給**回答模型（reader）**——也就是讀取檢索結果、負責寫出答案的模型；它不是人類讀者，也不是檢索系統。檢索系統決定 reader 看到哪些證據，reader 決定怎麼用這些證據。在 LoCoMo、LongMemEval、MEME 與 MemoryAgentBench 上，它在 **七個「benchmark × 回答模型」設定中拿下六個第一**，在每個設定中贏過最強的競爭記憶系統 **0.13 到 5.53 個百分點**。

這篇論文不是說記憶研究沒有意義。它說的是一個更窄、也更有用的結論：**一個做得好的原始歷史檢索基線，強到每一個新增的記憶操作都必須證明自己的貢獻。**

這裡先把比較對象說清楚，因為「七個拿六個」很容易誤讀。論文在四個 benchmark 上比較記憶系統，每個 benchmark 搭配一到兩個回答模型：**LoCoMo** 配 GPT-4o-mini 與 GPT-4.1-mini；**LongMemEval** 配 GPT-4.1-mini；**MEME** 配 GPT-4o-mini 與 DeepSeek-V4-Flash；**MemoryAgentBench** 配 GPT-4o-mini 與 DeepSeek-V4-Flash。這是**七個「benchmark × 模型」組合**，不是七個 benchmark。每個組合裡的「最強對手」，指的是**該組合中最好的競爭記憶系統**，不是同一個固定對手。Raw-RAG 贏了六個；唯一輸掉的是 MEME 配 DeepSeek-V4-Flash，MemMachine 領先 1.52 個百分點。

有兩件事不在這個計數裡。**Full-context** 不是記憶系統，而是一個診斷用的上限：跳過檢索，把整段對話直接貼進模型的 context（後面會再解釋）。**PersonaMem-v2** 則是獨立的個人化檢查，Raw-RAG 在該項排第三。整篇論文共出現六個資料集；「七個拿六個」只算前四個主要準確率 benchmark。另外，主要比較表最多包含 **13 個記憶系統**——Raw-RAG、MemMachine、EverMemOS、EMem、Mem0、MemOS、MemU、Memora、SimpleMem、Nemori、RecMem、A-MEM 與 MemoryOS——實際數量依 benchmark 而異；PersonaMem 那張表則比較七個。

本文所有差距都是**百分點**：從 45% 到 46% 是 +1 個百分點。0.13 個百分點幾乎是平手；5 個百分點就是明顯差距。

<div class="ragx-paper-cta">
  <a class="mono-btn-chamfer ragx-paper-btn" href="https://arxiv.org/abs/2610.30755" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">閱讀論文 ↗</span>
    </span>
  </a>
</div>

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01 · 主要結果</div>
    <div class="ragx-title">Raw-RAG 在七個設定中贏了六個。</div>
    <p class="ragx-sub">對比該設定中最強競爭記憶系統的差距，單位為百分點。唯一輸掉的是 MEME + DeepSeek-V4-Flash。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-a" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-a">Raw-RAG delta versus the strongest agentic memory system</title><desc>Dot plot of seven benchmark-model settings. Raw-RAG wins six and loses one.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="172.0" y1="28" x2="172.0" y2="232" class="ragx-grid" /><line x1="172.0" y1="23" x2="172.0" y2="30" class="ragx-tick" /><line x1="223.2" y1="28" x2="223.2" y2="232" class="ragx-zero" /><line x1="223.2" y1="23" x2="223.2" y2="30" class="ragx-tick" /><line x1="274.3" y1="28" x2="274.3" y2="232" class="ragx-grid" /><line x1="274.3" y1="23" x2="274.3" y2="30" class="ragx-tick" /><line x1="325.5" y1="28" x2="325.5" y2="232" class="ragx-grid" /><line x1="325.5" y1="23" x2="325.5" y2="30" class="ragx-tick" /><line x1="376.7" y1="28" x2="376.7" y2="232" class="ragx-grid" /><line x1="376.7" y1="23" x2="376.7" y2="30" class="ragx-tick" /><text x="0.0" y="48.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4o-mini</text><line x1="223.2" y1="46.0" x2="247.5" y2="46.0" class="ragx-stem" /><circle cx="247.5" cy="46.0" r="3.2" class="ragx-dot" /><text x="254.5" y="48.6" class="ragx-value" text-anchor="start">+0.95</text><text x="0.0" y="75.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4.1-mini</text><line x1="223.2" y1="73.0" x2="274.6" y2="73.0" class="ragx-stem" /><circle cx="274.6" cy="73.0" r="3.2" class="ragx-dot" /><text x="281.6" y="75.6" class="ragx-value" text-anchor="start">+2.01</text><text x="0.0" y="102.6" class="ragx-label" text-anchor="start">LongMemEval · GPT-4.1-mini</text><line x1="223.2" y1="100.0" x2="226.5" y2="100.0" class="ragx-stem" /><circle cx="226.5" cy="100.0" r="3.2" class="ragx-dot" /><text x="233.5" y="102.6" class="ragx-value" text-anchor="start">+0.13</text><text x="0.0" y="129.6" class="ragx-label" text-anchor="start">MEME · GPT-4o-mini</text><line x1="223.2" y1="127.0" x2="280.5" y2="127.0" class="ragx-stem" /><circle cx="280.5" cy="127.0" r="3.2" class="ragx-dot" /><text x="287.5" y="129.6" class="ragx-value" text-anchor="start">+2.24</text><text x="0.0" y="156.6" class="ragx-label" text-anchor="start">MEME · DeepSeek-V4-Flash</text><line x1="184.3" y1="154.0" x2="223.2" y2="154.0" class="ragx-stem" /><circle cx="184.3" cy="154.0" r="3.2" class="ragx-dot-hollow" /><text x="177.3" y="156.6" class="ragx-value" text-anchor="end">−1.52</text><text x="0.0" y="183.6" class="ragx-label" text-anchor="start">MAB · GPT-4o-mini</text><line x1="223.2" y1="181.0" x2="337.8" y2="181.0" class="ragx-stem" /><circle cx="337.8" cy="181.0" r="3.2" class="ragx-dot" /><text x="344.8" y="183.6" class="ragx-value" text-anchor="start">+4.48</text><text x="0.0" y="210.6" class="ragx-label" text-anchor="start">MAB · DeepSeek-V4-Flash</text><line x1="223.2" y1="208.0" x2="364.6" y2="208.0" class="ragx-stem" /><circle cx="364.6" cy="208.0" r="8.3" class="ragx-halo" /><circle cx="364.6" cy="208.0" r="4.8" class="ragx-dot-hero" /><text x="372.6" y="210.6" class="ragx-value-strong" text-anchor="start">+5.53</text><line x1="172" y1="232" x2="392" y2="232" class="ragx-axis-line" /><line x1="172.0" y1="232" x2="172.0" y2="237" class="ragx-tick" /><text x="172.0" y="246.0" class="ragx-axis" text-anchor="middle">−2</text><line x1="223.2" y1="232" x2="223.2" y2="237" class="ragx-tick" /><text x="223.2" y="246.0" class="ragx-axis" text-anchor="middle">0</text><line x1="274.3" y1="232" x2="274.3" y2="237" class="ragx-tick" /><text x="274.3" y="246.0" class="ragx-axis" text-anchor="middle">+2</text><line x1="325.5" y1="232" x2="325.5" y2="237" class="ragx-tick" /><text x="325.5" y="246.0" class="ragx-axis" text-anchor="middle">+4</text><line x1="376.7" y1="232" x2="376.7" y2="237" class="ragx-tick" /><text x="376.7" y="246.0" class="ragx-axis" text-anchor="middle">+6</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">← Raw-RAG behind</text><text x="392.0" y="280.0" class="ragx-note" text-anchor="end">Raw-RAG ahead →</text></svg>
    <div class="ragx-src">DOT PLOT · 7 個 BENCHMARK–MODEL 設定 · ARXIV:2610.30755</div>
  </div>
</div>

<div class="chamfer-card-wrapper mx-card">
    <div class="chamfer-card-content">
      <div class="card-tag">EXHIBIT // 01B · ALL SYSTEMS</div>
      <div class="mx-title">六比一背後的完整戰場</div>
      <p class="mx-sub">每個設定一組，列出所有被比較的記憶系統。長條是 <span class="mx-nowrap">0–100</span> 的總分；深色列是 Raw-RAG，圓環標記該設定的最高分。</p>
      <div class="mx-legend">
        <span class="lg-raw">Raw-RAG</span>
        <span class="lg-best">該設定最高分</span>
        <span class="lg-scale">長條＝分數（<span class="mx-nowrap">0–100</span>）</span>
      </div>
      <div class="mx-grid">
      <section class="mx-panel" aria-labelledby="mx-set-1">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-1" role="heading" aria-level="3">LoCoMo · GPT-4o-mini</div>
          <span class="mx-count">13 個系統</span>
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
          <span class="mx-count">13 個系統</span>
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
          <span class="mx-count">13 個系統</span>
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
          <span class="mx-count">8 個系統</span>
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
          <span class="mx-count">8 個系統</span>
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
          <span class="mx-count">8 個系統</span>
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
          <span class="mx-count">8 個系統</span>
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
        <div class="mx-panel mx-method" role="note" aria-label="方法說明">
          <div class="mx-method-kicker">方法說明</div>
          <p class="mx-method-body">Full-context 不列入：它是無檢索的天花板，不是記憶系統。所有面板共用 <span class="mx-nowrap">0–100</span> 尺度；同分依字母排序。</p>
        </div>
      </div>
      <div class="mx-src">系統 × 設定矩陣 · FULL-CONTEXT 已排除 · 13 個記憶系統 · ARXIV:2610.30755</div>
    </div>
  </div>


<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg><span>章節 01</span></div>

## 「Naive」在這裡到底是什麼意思

*Naive* 這個詞在這裡容易誤導。Raw-RAG 對**記憶管理** naive，但對**檢索**並不 naive。它的 **ingestion（資料匯入）**——把對話變成可搜尋內容的那一步——刻意保持簡單：

- 把每段對話變成一個長文字檔，保留訊息時間戳與圖片 caption。
- 把這段文字切成 **256-token 窗格**，重疊 **32 token**（stride 224，步長）。
- 把窗格放進**一份簡單的可搜尋清單**——扁平索引。沒有階層、沒有抽取、沒有摘要、沒有圖。
- 查詢時，把問題 embed，用 cosine similarity 取出 **top 128** 個窗格。
- 用 **cross-encoder** 對每個問題–窗格配對評分，留下 **top 15**。
- 把每個選中的窗格展開回完整的來源 turn，再交給 reader。

這就是完整的 ingestion：把對話變成可搜尋的文字，只做一次，之後不再改寫。**Turn（一輪發言）** 是對話裡的一則訊息：一則使用者訊息，或一則助理回覆。檢索單位是 256-token 窗格，但 reader 看到的不是被切斷的句子或半個 turn，而是窗格重疊到的**完整一輪（或多輪）發言**，加上理解代名詞與狀態更新所需的相鄰 turn。索引保持小且固定；reader 拿到足夠的文字去解析指涉與狀態變化。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg> EXHIBIT // 02 · 檢索預算</div>
    <div class="ragx-title">整個檢索預算只有四個數字。</div>
    <p class="ragx-sub">256-token 窗格 · 32-token 重疊 · 128 個 dense 候選 · 15 個重排窗格。Turn expansion 發生在選取之後。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-d" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-d">Raw-RAG retrieval budget</title><desc>256-token windows with 32-token overlap, 128 dense candidates, 15 reranked windows.</desc><text x="24.0" y="16.0" class="ragx-label" text-anchor="start">SOURCE HISTORY</text><rect x="24" y="24" width="352" height="18" rx="3" class="ragx-src-box" /><line x1="28.0" y1="30" x2="28.0" y2="38" class="ragx-turn" /><line x1="40.3" y1="30" x2="40.3" y2="38" class="ragx-turn" /><line x1="52.6" y1="28" x2="52.6" y2="38" class="ragx-turn" /><line x1="64.9" y1="28" x2="64.9" y2="38" class="ragx-turn" /><line x1="77.2" y1="28" x2="77.2" y2="38" class="ragx-turn" /><line x1="89.5" y1="30" x2="89.5" y2="38" class="ragx-turn" /><line x1="101.8" y1="30" x2="101.8" y2="38" class="ragx-turn" /><line x1="114.1" y1="28" x2="114.1" y2="38" class="ragx-turn" /><line x1="126.4" y1="28" x2="126.4" y2="38" class="ragx-turn" /><line x1="138.7" y1="28" x2="138.7" y2="38" class="ragx-turn" /><line x1="151.0" y1="30" x2="151.0" y2="38" class="ragx-turn" /><line x1="163.3" y1="30" x2="163.3" y2="38" class="ragx-turn" /><line x1="175.6" y1="28" x2="175.6" y2="38" class="ragx-turn" /><line x1="187.9" y1="28" x2="187.9" y2="38" class="ragx-turn" /><line x1="200.2" y1="28" x2="200.2" y2="38" class="ragx-turn" /><line x1="212.5" y1="30" x2="212.5" y2="38" class="ragx-turn" /><line x1="224.8" y1="30" x2="224.8" y2="38" class="ragx-turn" /><line x1="237.1" y1="28" x2="237.1" y2="38" class="ragx-turn" /><line x1="249.4" y1="28" x2="249.4" y2="38" class="ragx-turn" /><line x1="261.7" y1="28" x2="261.7" y2="38" class="ragx-turn" /><line x1="274.0" y1="30" x2="274.0" y2="38" class="ragx-turn" /><line x1="286.3" y1="30" x2="286.3" y2="38" class="ragx-turn" /><line x1="298.6" y1="28" x2="298.6" y2="38" class="ragx-turn" /><line x1="310.9" y1="28" x2="310.9" y2="38" class="ragx-turn" /><line x1="323.2" y1="28" x2="323.2" y2="38" class="ragx-turn" /><line x1="335.5" y1="30" x2="335.5" y2="38" class="ragx-turn" /><line x1="347.8" y1="30" x2="347.8" y2="38" class="ragx-turn" /><line x1="360.1" y1="28" x2="360.1" y2="38" class="ragx-turn" /><line x1="372.4" y1="28" x2="372.4" y2="38" class="ragx-turn" /><rect x="24" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="88.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="200.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="248" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="312.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="16" height="26" class="ragx-overlap" /><rect x="248" y="50" width="16" height="26" class="ragx-overlap" /><line x1="136" y1="82" x2="152" y2="82" class="ragx-bracket" /><line x1="136" y1="79" x2="136" y2="85" class="ragx-bracket" /><line x1="152" y1="79" x2="152" y2="85" class="ragx-bracket" /><text x="144.0" y="92.0" class="ragx-axis" text-anchor="middle">32 overlap</text><path d="M200 98 V116" class="ragx-arrow" /><path d="M196 112 L200 117 L204 112" class="ragx-arrow" /><text x="210.0" y="110.0" class="ragx-note" text-anchor="start">EMBED</text><defs><pattern id="ragx-ticks" width="2.75" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" class="ragx-tickline" /></pattern></defs><rect x="24" y="122" width="352" height="10" fill="url(#ragx-ticks)" /><text x="24.0" y="148.0" class="ragx-label" text-anchor="start">TOP-128 DENSE CANDIDATES</text><text x="376.0" y="148.0" class="ragx-value-strong" text-anchor="end">128</text><path d="M200 154 V174" class="ragx-arrow" /><path d="M196 170 L200 175 L204 170" class="ragx-arrow" /><text x="210.0" y="167.0" class="ragx-note" text-anchor="start">RERANK</text><circle cx="24.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="49.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="74.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="99.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="124.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="149.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="174.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="200.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="225.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="250.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="275.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="300.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="325.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="350.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="376.0" cy="188" r="2.9" class="ragx-dot" /><text x="24.0" y="208.0" class="ragx-label" text-anchor="start">TOP-15 RERANKED WINDOWS</text><text x="376.0" y="208.0" class="ragx-value" text-anchor="end">15 × 256</text><path d="M200 216 V234" class="ragx-arrow" /><path d="M196 230 L200 235 L204 230" class="ragx-arrow" /><text x="210.0" y="228.0" class="ragx-note" text-anchor="start">READ</text><rect x="130" y="242" width="140" height="24" rx="3" class="ragx-reader" /><text x="200.0" y="258.0" class="ragx-label" text-anchor="middle">READER · FULL TURNS</text><text x="24.0" y="286.0" class="ragx-note" text-anchor="start">≈ 3,840 TOKENS BEFORE TURN EXPANSION</text></svg>
    <div class="ragx-src">PIPELINE · RAW-RAG · ARXIV:2610.30755</div>
  </div>
</div>

### 用生活語言看這條管線

上面的圖很精確，但對沒接觸過 RAG 的人並不友善。把同樣的流程換成日常情境：

<div class="ragx-glossary">
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">256-token 窗格</div>
      <p class="ragx-gloss-copy">一段長對話像一條吐司。窗格就是其中一片：小到可以拿起來，大到仍裝得下一個完整意思。32 token 的重疊，等於相鄰兩片故意共用一點邊；名字或日期不會剛好被切斷。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Embedding（嵌入）</div>
      <p class="ragx-gloss-copy">替「意思」釘 GPS。每個窗格得到一組座標，意思相近的段落會落在附近；所以「退款」找得到「把錢退回來」，即使字面完全不同。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scan-search"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Dense 候選（128 段）</div>
      <p class="ragx-gloss-copy">第一張大網。系統先用意義座標撈出 128 段看起來相關的窗格。這步便宜又寬鬆：正確答案很可能在裡面，但同時夾著雜訊。少了這一層，重排器就沒有東西可以挑。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reranker／cross-encoder（重排器）</div>
      <p class="ragx-gloss-copy">複試。Cross-encoder 把「問題」和「候選段落」放在一起逐字讀，所以抓得到否定詞、專有名詞、日期與先後順序。它太貴，不能讀完整個資料庫；只讀 128 對剛好。少了它，只是字面重疊的窗格，可能排贏真正回答問題的那一段。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Turn expansion（回合展開）</div>
      <p class="ragx-gloss-copy">點開「顯示完整訊息」。檢索單位是 256-token 的切片，但 reader 拿到的是切片所在的完整發言：誰說的、什麼時候說的、「它」指的是什麼。少了它，代名詞進到 reader 眼前時，可能已經沒有可以指的東西。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-brain"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reader（回答模型，top-15）</div>
      <p class="ragx-gloss-copy">真正負責回答的模型。回答模型看不到索引，也看不到 128 個候選，只看到重排後留下的 15 段完整發言。索引再好，也救不回一個讀錯證據的回答模型。</p>
    </div>
  </div>
</div>

論文預設 256-token 窗格，但消融實驗顯示這個數字不是神聖的：**128 到 1,024 token** 的窗格對 MemoryAgentBench 總分沒有顯著影響。真正有影響的是 **reranking** 與 **適度的檢索深度**。移除 cross-encoder 會掉 **3.92 個百分點**；只回傳一個項目會掉 **11.73 個百分點**；回傳 120 個項目會掉 **14.57 個百分點**，主要發生在 long-range understanding 與 conflict resolution。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-clipboard-list"></use></svg><span>章節 02</span></div>

## Benchmark 地圖

這篇論文的結果，只有在你知道每個 benchmark 想測什麼之後才有意義。以下用日常例子說明每一個。

<div class="ragx-bench-grid">
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LoCoMo</div>
          <div class="ragx-bench-sub">長期對話記憶</div>
        </div>
      </div>
      <p class="ragx-bench-desc">兩個人跨越多個 session 對話，可能隔了幾天或幾週。題目會問單一事實（「Ana 的妹妹叫什麼名字？」）、把兩個事實接起來、事件先後順序，或超出字面內容的推論。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>10 段對話 · 1,540 題</dd></div>
        <div><dt>METRIC</dt><dd>LLM judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 多數題目（1,540 題中的 841 題）只需要一個事實，所以簡單的檢索器也能表現不錯。這是原始 50 段對話中的 10 段子集，分數不能直接跟使用完整版本的論文相比；用來抓捷徑的陷阱題也被移除了。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LongMemEval-S</div>
          <div class="ragx-bench-sub">聊天助理記憶</div>
        </div>
      </div>
      <p class="ragx-bench-desc">每一題都附帶自己的長對話歷史——像開一張新的客服單，裡面有幾個月的往來紀錄。五種能力：回憶事實、跨 session 連結事實、排出事件順序、記住偏好、採用更新後的版本。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>500 題 · 約 115k-token 歷史</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 每題都有獨立歷史，所以系統不能把上一題的答案帶過來——這就是記憶隔離。其中 30 題是 abstention（無答案）題：歷史裡根本沒有答案，正確回應是「沒有提到」，不是硬猜。S 是約 115k token 的版本，M 是約 1.5M token 的版本；兩者不能互換，因為 1.5M 的檢索難得多。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MEME</div>
          <div class="ragx-bench-sub">多實體與演進記憶</div>
        </div>
      </div>
      <p class="ragx-bench-desc">事先寫好的情境，裡面有多個人、專案或帳戶，數值會隨時間改變。六種題型：精確回憶（「當時的值是多少？」）、聚合（「現在有幾個是啟用的？」）、追蹤（「現在的值是什麼？」）、刪除、cascade（預算調高，核准上限也跟著提高）、absence（「沒有這個值——回答 none」）。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>100 個 episode · 1,188 題 · 32k-token 填充文字</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 六任務 macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Cascade 題要你把規則套用到上游變更；absence 題則根本沒有值。32k／128k／no-filler 三種版本差在混入多少無關的填充文字——32k 與 128k 是填充文字的 token 預算，不是干擾項的數量——所以不要跨版本比較分數。最後的分數是六種題型等權平均（macro-average）。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MemoryAgentBench</div>
          <div class="ragx-bench-sub">增量多輪記憶</div>
        </div>
      </div>
      <p class="ragx-bench-desc">先把一份長來源讀一遍，再回答許多關於它的問題。四種能力：準確檢索（找到某個事實）、test-time learning（從來源中的範例學會規則，當場套用到新題目）、long-range understanding（把相隔很遠的資訊接起來）、conflict resolution（兩處資訊矛盾時，選較新或較可信的那個）。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>2,071 題 · 14 個來源 · 103K–1.44M tokens</dd></div>
        <div><dt>METRIC</dt><dd>原生指標 · 四能力 macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Test-time learning 與 long-range understanding 是主要差異點。2,071 題的標題數字是精選集：它由 14 個來源組成，不是單一官方測試集。它內嵌的 LongMemEval 部分不等於獨立的 500 題版本，兩邊數字不要直接比。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span>
        <div>
          <div class="ragx-bench-name">PersonaMem-v2</div>
          <div class="ragx-bench-sub">隱式個人化</div>
        </div>
      </div>
      <p class="ragx-bench-desc">一段很長的對話歷史，使用者從沒說過「我喜歡簡短回答」——系統必須從他問什麼、稱讚什麼、忽略什麼推斷出來，再從四個回覆中選出最適合這個人的一個；共九種情境。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>5,000 道選擇題 · ~32k token 的歷史</dd></div>
        <div><dt>METRIC</dt><dd>MCQ exact match</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 四個選項代表亂猜也有 25%，所以分數有內建地板。Raw-RAG 沒有顯式使用者畫像，EverMemOS 會建一個。這是系統級比較——畫像 + 檢索 + 回答模型——不是只比檢索元件。</div>
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
      <p class="ragx-bench-desc">一段非常長的對話（約 1M token），用來壓力測試 ingestion 速度：系統要多久才能回答第一個問題？</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>1 段對話 · 1,710 則訊息 · 約 1M tokens</dd></div>
        <div><dt>METRIC</dt><dd>無——只計時</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 這是計時測試，不是 BEAM 準確率結果。論文只用一段對話，不是完整的 100 段 benchmark，而且在產生答案之前就停錶。</div>
    </div>
  </div>
</div>

<div class="ragx-callout">
  <svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg>
  <div><b>不要直接比較總分。</b>切片、評分者與平均規則都不同：LoCoMo 與 LongMemEval 每題等權；MEME 是六任務等權平均（macro-average）；MemoryAgentBench 是四能力等權平均；PersonaMem-v2 是多選題 exact match，沒有部分分數。論文在能對齊的地方對齊；其餘是基線論證，不是 leaderboard。</div>
</div>

<div class="ragx-src">BENCHMARK SOURCES · LoCoMo (ACL 2024) · LongMemEval (ICLR 2025) · MEME (NeurIPS 2026) · MemoryAgentBench (ICLR 2026) · PersonaMem-v2 (2025) · BEAM (ICLR 2026)</div>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg><span>章節 03</span></div>

## 分數不是重點

更有用的是「為什麼 raw retrieval 會贏」。作者在標註過的子集上量兩個**診斷率**。**Coverage** 問：在所有題目中，檢索到的脈絡有多少題含有足夠證據可以正確回答？**Utilization** 問：在證據已經足夠的題目裡，系統實際答對多少？這兩個不是相乘得到總分的兩個因子。它們是同一條管線的兩個切面，分母不同；有用的是它們在不同系統之間的變動幅度。

在 MemoryAgentBench 上，coverage 從 **19.07% 到 45.29%**，差距 **26.2 個百分點**；utilization 只從 **80.00% 到 89.71%**，差距 **9.7 個百分點**。MEME 的模式更明顯：coverage 從 **35.69% 到 76.35%**（**40.7 個百分點**），utilization 從 **65.51% 到 86.55%**（**21.0 個百分點**）。兩個 benchmark 都顯示：系統之間差最多的是「有沒有找到證據」，不是「找到之後會不會用」。

Raw-RAG 在兩個 benchmark 上都有**最高的 coverage**（45.29% 與 76.35%）。它的 utilization 不是最高：MemoryAgentBench 是 84.43%，MEME 是 73.76%；分別比該 benchmark 的最佳系統低 5.3 與 12.8 個百分點——前者很接近，後者明顯落後。

讀 utilization 時要注意一個陷阱。每個系統的 utilization 只在**它自己**檢索到足夠證據的題目上計算，所以檢索得少的系統，等於被考在比較簡單的子集上。高 utilization 可能只是選擇效應，不代表 reader 比較強。這也是為什麼 coverage 的差距——決定證據到底在不在——是比較可信的訊號。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg> EXHIBIT // 03 · COVERAGE VS UTILIZATION</div>
    <div class="ragx-title">Coverage 的變異比 utilization 大。</div>
    <p class="ragx-sub">圖中為各系統觀測到的 min–max。點代表系統，橫線代表範圍；Raw-RAG 是 coverage 列右端最深的點。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-b" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-b">Coverage varies more than utilization</title><desc>Ranges of coverage and utilization across systems on MemoryAgentBench and MEME.</desc><text x="390.0" y="16.0" class="ragx-axis" text-anchor="end">PERCENT</text><line x1="124.0" y1="34" x2="124.0" y2="232" class="ragx-grid" /><line x1="190.5" y1="34" x2="190.5" y2="232" class="ragx-grid" /><line x1="257.0" y1="34" x2="257.0" y2="232" class="ragx-grid" /><line x1="323.5" y1="34" x2="323.5" y2="232" class="ragx-grid" /><line x1="390.0" y1="34" x2="390.0" y2="232" class="ragx-grid" /><line x1="124" y1="56" x2="390" y2="56" class="ragx-grid-h" /><line x1="124" y1="106" x2="390" y2="106" class="ragx-grid-h" /><line x1="124" y1="156" x2="390" y2="156" class="ragx-grid-h" /><line x1="124" y1="206" x2="390" y2="206" class="ragx-grid-h" /><text x="0.0" y="58.3" class="ragx-label" text-anchor="start">MAB · coverage</text><line x1="174.7" y1="56.0" x2="244.5" y2="56.0" class="ragx-range" /><line x1="174.7" y1="52.0" x2="174.7" y2="60.0" class="ragx-range-cap" /><line x1="244.5" y1="52.0" x2="244.5" y2="60.0" class="ragx-range-cap" /><text x="209.6" y="47.0" class="ragx-axis" text-anchor="middle">26.2 pp</text><circle cx="174.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="181.3" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="190.8" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="215.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="216.4" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="230.5" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="244.5" cy="53.8" r="8.3" class="ragx-halo" /><circle cx="244.5" cy="53.8" r="5.0" class="ragx-dot-hero" /><text x="255.5" y="56.2" class="ragx-value-strong" text-anchor="start">45.3</text><text x="0.0" y="108.3" class="ragx-label" text-anchor="start">MAB · utilization</text><line x1="336.8" y1="106.0" x2="362.6" y2="106.0" class="ragx-range" /><line x1="336.8" y1="102.0" x2="336.8" y2="110.0" class="ragx-range-cap" /><line x1="362.6" y1="102.0" x2="362.6" y2="110.0" class="ragx-range-cap" /><text x="349.7" y="97.0" class="ragx-axis" text-anchor="middle">9.7 pp</text><circle cx="336.8" cy="103.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.2" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.2" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="348.6" cy="103.8" r="3.4" class="ragx-dot-ink" /><circle cx="352.4" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="361.7" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="362.6" cy="103.8" r="2.9" class="ragx-dot-soft" /><text x="0.0" y="158.3" class="ragx-label" text-anchor="start">MEME · coverage</text><line x1="218.9" y1="156.0" x2="327.1" y2="156.0" class="ragx-range" /><line x1="218.9" y1="152.0" x2="218.9" y2="160.0" class="ragx-range-cap" /><line x1="327.1" y1="152.0" x2="327.1" y2="160.0" class="ragx-range-cap" /><text x="273.0" y="147.0" class="ragx-axis" text-anchor="middle">40.7 pp</text><circle cx="218.9" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="250.7" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="257.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="289.2" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="292.2" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="311.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="327.1" cy="153.8" r="3.4" class="ragx-dot-ink" /><text x="0.0" y="208.3" class="ragx-label" text-anchor="start">MEME · utilization</text><line x1="298.3" y1="206.0" x2="354.2" y2="206.0" class="ragx-range" /><line x1="298.3" y1="202.0" x2="298.3" y2="210.0" class="ragx-range-cap" /><line x1="354.2" y1="202.0" x2="354.2" y2="210.0" class="ragx-range-cap" /><text x="326.2" y="197.0" class="ragx-axis" text-anchor="middle">21.0 pp</text><circle cx="298.3" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="301.3" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="320.2" cy="208.2" r="3.4" class="ragx-dot-ink" /><circle cx="328.4" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.9" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.0" cy="208.2" r="2.9" class="ragx-dot-soft" /><circle cx="354.2" cy="203.8" r="2.9" class="ragx-dot-soft" /><line x1="124" y1="232" x2="390" y2="232" class="ragx-axis-line" /><line x1="124.0" y1="232" x2="124.0" y2="237" class="ragx-tick" /><text x="124.0" y="250.0" class="ragx-axis" text-anchor="middle">0</text><line x1="190.5" y1="232" x2="190.5" y2="237" class="ragx-tick" /><text x="190.5" y="250.0" class="ragx-axis" text-anchor="middle">25</text><line x1="257.0" y1="232" x2="257.0" y2="237" class="ragx-tick" /><text x="257.0" y="250.0" class="ragx-axis" text-anchor="middle">50</text><line x1="323.5" y1="232" x2="323.5" y2="237" class="ragx-tick" /><text x="323.5" y="250.0" class="ragx-axis" text-anchor="middle">75</text><line x1="390.0" y1="232" x2="390.0" y2="237" class="ragx-tick" /><text x="382.0" y="250.0" class="ragx-axis" text-anchor="middle">100</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">Dots = systems · bar = observed min–max</text></svg>
    <div class="ragx-src">RANGE PLOT · 7 個系統 · MAB = MEMORYAGENTBENCH · PP = 百分點</div>
  </div>
</div>

這是論文最實用的貢獻。如果你的記憶系統輸了，第一個問題不是「我要怎麼改回答模型？」而是「哪一個必要證據根本沒進到 context？」這個分工正是為什麼論文要把兩者分開量：coverage 是檢索系統的工作，utilization 是回答模型的工作。兩者失敗的方式不同，修法也不同。再強的回答模型，也無法穩定補償從來沒被檢索到的證據。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg><span>章節 04</span></div>

## 只有答案值不夠

在 MEME 的**追蹤與 cascade** 題上，作者把 coverage 再拆成兩種。**Result coverage** 問：必要的答案值有沒有出現在檢索到的脈絡裡？**Path coverage** 問：脈絡裡有沒有推導出這個值所需的時間順序或依賴鏈？**P(path | result)** 是條件比率：在已經找到答案值的題目裡，同時找到完整路徑的比例。把中間的豎線讀成「在……的情況下」。

| 系統 | Result coverage（%） | Path coverage（%） | P(path \| result)（%） |
| :-- | --: | --: | --: |
| Raw-RAG | 90.53% | 56.44% | **62.34%** |
| MemMachine | 84.85% | 48.11% | 56.70% |
| EverMemOS | 78.03% | 39.02% | 50.00% |
| EMem | 76.52% | 37.88% | 49.50% |
| Mem0 | 81.06% | 38.64% | 47.66% |
| MemOS | 88.26% | 21.21% | 24.03% |
| MemU | 59.09% | 5.68% | 9.62% |

這張表是追蹤／cascade 子集上的診斷，不是 MEME 的端到端總分；找到證據之後，reader 還是得把它變成答案。

這就是「存一個事實」與「存這個事實現在為什麼成立」的差別。記憶系統可能檢索到「預算是 $4,200」，卻漏掉讓它提高的核准、讓它降低的轉帳，或這些事件發生的順序。Raw history 保留了這些關係，因為它從來沒有把它們移除。

Complete-store oracle 把論點推得更遠。*Gold* 指的是答案卷：作者直接告訴每個系統哪些證據相關，再讓它存取自己完整的匯出記憶，繞過原生檢索；並用同樣的 gold 訊號選出原始支持 session，作為 raw-evidence control。

<div class="ragx-oracle">
  <div class="ragx-oracle-head">
    <div class="ragx-oracle-eyebrow">用一張圖看懂 ORACLE</div>
    <div class="ragx-oracle-title">三種找收據的方法。</div>
    <p class="ragx-oracle-sub">Gold-informed 的意思是：考官直接告訴你答案放在哪個抽屜。它考的是「東西有沒有被留下來」，不是「你會不會找」。</p>
  </div>
  <div class="ragx-oracle-grid">
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">NATIVE RETRIEVAL（原生檢索）</div>
      <p class="ragx-oracle-copy">用你自己貼的標籤翻自己的檔案櫃。標籤決定你能找到什麼。</p>
      <div class="ragx-oracle-score">39.30</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">COMPLETE STORE（GOLD-INFORMED，完整記憶庫）</div>
      <p class="ragx-oracle-copy">有人把整個檔案櫃倒在你桌上，告訴你收據在裡面。搜尋不再是瓶頸，但你只能找到檔案櫃還留著的東西。</p>
      <div class="ragx-oracle-score">57.54</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">RAW EVIDENCE（原始證據）</div>
      <p class="ragx-oracle-copy">有人直接把你最初那個鞋盒交給你。這是天花板：證據確實存在，而且什麼都沒被丟掉。</p>
      <div class="ragx-oracle-score">61.60</div>
    </div>
  </div>
  <div class="ragx-oracle-foot">RAW-RAG · MEME · 同一份 GOLD 訊號，三種存取方式</div>
</div>

| 系統 | Native | Complete store | Raw evidence |
| :-- | --: | --: | --: |
| Raw-RAG | 39.30 | **57.54** | 61.60 |
| MemMachine | 37.06 | **57.46** | 61.60 |
| EverMemOS | 21.57 | 51.59 | 61.60 |
| EMem | 33.84 | 48.36 | 61.60 |
| MemOS | 30.24 | 45.12 | 61.60 |
| Mem0 | 27.76 | 32.26 | 61.60 |
| MemU | 19.87 | 31.07 | 61.60 |

<div class="ragx-table-note">MEME · GPT-4o-mini · 粗體 = 各系統的 complete-store 分數 · Raw evidence = 共用上限</div>

把檢索從方程式中拿掉之後，每個系統都變好。但保留原始對話內容的系統——Raw-RAG 與 MemMachine——最接近 raw-evidence 天花板。被轉換過的 store 差距更大。Raw-RAG 的 57.54 離 61.60 還有約 4 個百分點，那就是 ingestion 留下的殘影：被合併的欄位、把更正磨平的摘要、失去來源的事實。再完整的存取權，也重建不了當初沒有存下的東西。

作者對解讀很克制：殘餘差距不是純粹的資訊損失量測。證據組裝、排序，以及 *lost in the middle* 之類的位置效應，也可能有貢獻。但方向是一致的，而且與 path 分析的結果吻合。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg><span>章節 05</span></div>

## 變更審計

論文也審計了 Mem0 的寫入策略，這是目前最廣泛使用的記憶層之一。

像 Mem0 這樣的記憶層，讀到一則新訊息後會決定怎麼處理：**ADD** 一則新記憶、**UPDATE** 既有記憶、**DELETE** 刪掉一則，或什麼都不做（**NONE**）。每一次決定都是一次**寫入決策**。論文把這些決策全部數出來，問：系統到底多常改寫或刪除它存下的東西？

具體例子：使用者先說「我住在慕尼黑」，後來說「我搬到柏林了」。**UPDATE** 會用柏林覆蓋慕尼黑那則記憶；**append-only ADD** 會兩則都留著、各自帶時間戳，讓 reader 看得出柏林比較新；**DELETE** 會刪掉慕尼黑；**NONE** 則兩則都不動。

在 LoCoMo 上，UPDATE 與 DELETE 合計只占 33,902 次決策的 **4.39%**。在 LongMemEval 上，**每一題都帶著自己的約 115k-token 歷史**，它們只占 428,858 次決策的 **2.46%**；決策數遠大於題數，因為每一段歷史都分開處理。真正造成持久文字改變的「有效變更」只有 **1.90%** 與 **1.34%**；許多提出的 update 是重複的或格式錯誤的。

接著作者做了一個簡單實驗：把 UPDATE 換成**append-only ADD**（保留舊記憶，另外新增一則），把 DELETE 換成 **NONE**（什麼都不做）。如果準確率沒有下降，就代表在這個 benchmark 上，顯式改寫並沒有幫上忙。LoCoMo 準確率從 **67.36% 上升到 69.42%**，而且沒有任何類別下降。

這不代表在生產環境中刪除不重要。它代表這些 benchmark 很少需要刪除，而需要的時候，能力夠強的回答模型通常可以從原始證據重建狀態變化。第二個實驗支持這點，但它是**上限測試**，不是 Raw-RAG 的端到端分數。作者完全不跑檢索；每一題都直接把**問題所問的那個時間點**已經存在的證據，依時間順序交給 reader，沒有任何檢索錯誤。問題是：如果檢索完美，強的回答模型能不能重建目前狀態？這考的是**回答模型**，不是記憶系統，所以分數**不能拿來跟 Raw-RAG 端到端的 43.19% 相比**。

DeepSeek-V4-Flash 在 MEME 六種題型上整體達到 **85.48%**，其中 **cascade 題 82.32%**（要把上游變更沿規則傳下去）、**invalidation 題 91.54%**（後面的事件讓先前的事實失效）。同一份證據交給 Qwen3.5-35B-A3B 只有 **70.25%**，交給 GPT-4o-mini 只有 **50.50%**。這 35 個百分點的差距正是重點：就算證據完美，狀態重建仍然高度取決於回答模型。

85.48% 是**六題型等權平均（six-task macro）**，不是 82.32 與 91.54 的平均（兩者平均是 86.93）；它比較低，是因為還包含其他四種 MEME 題型。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg><span>章節 06</span></div>

## 複雜度仍然有價值的地方

這篇論文最強的時候，是被當成「基線論證」來讀，而不是普世判決。兩個結果讓它保持誠實。

第一，**PersonaMem-v2**。Raw-RAG 得分 **49.62%**，在七個記憶系統中排第三，落後 MemOS（50.72%）與 EverMemOS（53.25%）；PersonaMem 的**九種情境中，沒有任何一種由 Raw-RAG 領先**。PersonaMem 測的是個人化：使用者從沒說「我喜歡簡短回答」，系統必須從他問什麼、稱讚什麼、忽略什麼推斷出來，再從四個回覆中選一個。EverMemOS 會先建一份**顯式使用者畫像**——一份「這個人是誰、喜歡什麼」的清單——再用它回答；Raw-RAG 沒有這種畫像。這是**系統級比較**：畫像 + 檢索 + 回答模型，不是只比檢索元件。當任務是「記住這個人是誰、他偏好什麼」，結構化記憶有 raw retrieval 抹不掉的優勢。

第二，**MEME + DeepSeek-V4-Flash**。Raw-RAG 得分 **43.19%**，MemMachine 則是 **44.71%**——這些是正常檢索下的端到端分數。更說明問題的是，同一個設定下 **Full-context 得分 63.17%**。Full-context 不是另一個記憶系統，而是一個診斷：完全跳過檢索，把整段對話貼進模型的 context，問「如果 reader 什麼都看得到，能做得多好？」它比 Raw-RAG 高約 **20 個百分點**，比 MemMachine 高約 **18 個百分點**；這表示兩個檢索式系統都受限於檢索交給 reader 的內容，**不是**說 MemMachine 的記憶管理贏了。MemMachine 那 1.52 個百分點的領先，在這個 20 分差距旁邊很小。論文也承認結果很依賴回答模型，並註明評估任務是批次問答，不是真正在產品裡運作的記憶系統。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg><span>章節 07</span></div>

## 應該讓 builder 停下來的消融實驗

論文在 MemoryAgentBench 上的消融，是一份「聽起來很聰明、分數卻更差」的清單：

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg> EXHIBIT // 04 · 記憶管理消融</div>
    <div class="ragx-title">記憶管理沒有為自己賺回成本。</div>
    <p class="ragx-sub">窗格大小／重疊（token）。預設是 256/32；消融測試 128/16、512/64 與 1024/128。負值代表這個改動讓 MemoryAgentBench 總分下降。第一根棒子是移除重排器；其餘是新增或改變一個操作。只有 512/64 略微為正（+0.04），在雜訊範圍內。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-c" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-c">Memory-management ablations</title><desc>Change in MemoryAgentBench total when each operation is added to Raw-RAG.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="123.9" y1="32" x2="123.9" y2="236" class="ragx-grid" /><line x1="123.9" y1="27" x2="123.9" y2="34" class="ragx-tick" /><line x1="243.1" y1="32" x2="243.1" y2="236" class="ragx-grid" /><line x1="243.1" y1="27" x2="243.1" y2="34" class="ragx-tick" /><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="362.2" y1="27" x2="362.2" y2="34" class="ragx-tick" /><text x="0.0" y="46.4" class="ragx-label" text-anchor="start">− reranker</text><rect x="315.5" y="40.5" width="46.7" height="7" rx="3.5" class="ragx-bar" /><text x="309.5" y="46.4" class="ragx-value" text-anchor="end">−3.92</text><text x="0.0" y="72.4" class="ragx-label" text-anchor="start">128 / 16</text><rect x="359.4" y="66.5" width="2.9" height="7" rx="3.5" class="ragx-bar" /><text x="353.4" y="72.4" class="ragx-value" text-anchor="end">−0.24</text><text x="0.0" y="98.4" class="ragx-label" text-anchor="start">512 / 64</text><rect x="362.2" y="92.5" width="2.0" height="7" rx="3.5" class="ragx-bar-pos" /><text x="368.2" y="98.4" class="ragx-value" text-anchor="start">+0.04</text><text x="0.0" y="124.4" class="ragx-label" text-anchor="start">1024 / 128</text><rect x="358.9" y="118.5" width="3.3" height="7" rx="3.5" class="ragx-bar" /><text x="352.9" y="124.4" class="ragx-value" text-anchor="end">−0.28</text><text x="0.0" y="150.4" class="ragx-label" text-anchor="start">+ turn dedup</text><rect x="333.7" y="144.5" width="28.5" height="7" rx="3.5" class="ragx-bar" /><text x="327.7" y="150.4" class="ragx-value" text-anchor="end">−2.39</text><text x="0.0" y="176.4" class="ragx-label" text-anchor="start">+ atomic facts</text><rect x="128.4" y="170.0" width="233.8" height="8" rx="4" class="ragx-bar-hero" /><text x="140.4" y="176.5" class="ragx-value-paper" text-anchor="start">−19.62</text><text x="0.0" y="202.4" class="ragx-label" text-anchor="start">+ raw summary</text><rect x="293.0" y="196.5" width="69.2" height="7" rx="3.5" class="ragx-bar" /><text x="287.0" y="202.4" class="ragx-value" text-anchor="end">−5.81</text><text x="0.0" y="228.4" class="ragx-label" text-anchor="start">+ graph expansion</text><rect x="293.3" y="222.5" width="68.9" height="7" rx="3.5" class="ragx-bar" /><text x="287.3" y="228.4" class="ragx-value" text-anchor="end">−5.78</text><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="112" y1="244" x2="392" y2="244" class="ragx-axis-line" /><line x1="123.9" y1="244" x2="123.9" y2="249" class="ragx-tick" /><text x="123.9" y="260.0" class="ragx-axis" text-anchor="middle">−20</text><line x1="243.1" y1="244" x2="243.1" y2="249" class="ragx-tick" /><text x="243.1" y="260.0" class="ragx-axis" text-anchor="middle">−10</text><line x1="362.2" y1="244" x2="362.2" y2="249" class="ragx-tick" /><text x="362.2" y="260.0" class="ragx-axis" text-anchor="middle">0</text><text x="0.0" y="284.0" class="ragx-note" text-anchor="start">Δ vs Raw-RAG 48.32 · negative = worse</text></svg>
    <div class="ragx-src">BAR CHART · 14 個來源 · Δ = 相對 48.32 總分的變化 · 同一 reader 與證據預算</div>
  </div>
</div>

以下把每個操作翻成白話。數字是把它加進 48.32 基線後，MemoryAgentBench 總分的變化；48.32 是 Raw-RAG 在預設設定下的總分，所有變化都是相對它，不是相對某個對手。

MemoryAgentBench 的四種能力之一是 **test-time learning（測試時學習）**。這個名字容易誤會：模型**不會**重新訓練，也不會更新權重。來源裡會有幾個示範範例——例如五則客服評論，各自標了「negative」或「positive」——模型必須從中歸納出規則，再套用到新的一則評論。這也叫 **few-shot learning**：「訓練」發生在 prompt 裡。一個 **demonstration（示範範例）** 不是只有那句「這則評論是負評」，而是完整的組合：評論文字、它的標籤，以及標出下一則範例從哪裡開始的邊界。如果抽取只留下「負評」這個事實，卻丟掉輸入–標籤的配對，模型就看不到該模仿的模式。

<div class="ragx-abl-grid">
  <div class="ragx-abl ragx-abl-hero">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span class="ragx-abl-name">ATOMIC-FACT EXTRACTION（原子事實抽取）</span><span class="ragx-abl-delta">−19.62</span></div>
    <p class="ragx-abl-big">把一部電影濃縮成劇情大綱。</p>
    <p class="ragx-abl-copy">人物與事件還在，但鏡頭、語氣、時間感，以及「這件事到底怎麼做」的示範都不見了。事實留下來了，示範沒有。</p>
    <div class="ragx-abl-stat">TEST-TIME LEARNING SUBSET <b>47.68% → 15.37%（−32.31 個百分點）</b></div>
    <div class="ragx-abl-note">卡上的 −19.62 是整體 MemoryAgentBench 總分的跌幅。test-time-learning 子集掉得更深：−32.31 個百分點；整體數字比較小，因為它平均了四種能力。</div>
</div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg><span class="ragx-abl-name">RAW SUMMARY AUGMENTATION（原始摘要增強）</span><span class="ragx-abl-delta">−5.81</span></div>
    <p class="ragx-abl-copy">把會議錄音改寫成會議紀錄。紀錄更好讀，但「誰反對哪個數字、哪個數字後來被更正、先後順序是什麼」都被磨平了。Conflict resolution 考的正是這些接縫。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-network"></use></svg><span class="ragx-abl-name">GRAPH-EXPANDED RETRIEVAL（圖譜擴展檢索）</span><span class="ragx-abl-delta">−5.78</span></div>
    <p class="ragx-abl-copy">查「發票」，系統順便把客戶、訂單、地址、客服單整串關聯搬過來。關聯是真的，但「有關聯」不等於「這題需要」；多出來的鄰居會擠掉 reader 真正需要的證據。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-repeat"></use></svg><span class="ragx-abl-name">DISPLAY-TURN DEDUPLICATION（顯示回合去重）</span><span class="ragx-abl-delta">−2.39</span></div>
    <p class="ragx-abl-copy">把對話裡重複的句子刪掉。但人重複講，往往是在修補：「不是這個地址，是新的那個。」去重可能留下舊的，刪掉最後的更正。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg><span class="ragx-abl-name">REMOVING THE RERANKER（移除重排器）</span><span class="ragx-abl-delta">−3.92</span></div>
    <p class="ragx-abl-copy">只憑書名找書。每本書的書名都有「義大利麵」，但翻開才發現沒有一本寫到你要的醬。Reranker 就是那個先翻開書對照問題的人。</p>
  </div>
</div>

這些操作單獨看都不笨。每一個都是在賭：壓縮或結構帶來的好處，會大於它弄丟的東西。在這個 benchmark 上，賭輸了；而輸掉的分數，告訴你哪一個賭得最糟。

論文沒有把整個跌幅都歸因於事實流失：證據的**數量**、**排列方式**，以及**回答模型是否適應這種格式**，都一起變動。抽出來的事實很短、很一致，卻被剝掉了模型可能依賴的對話線索；這是格式改變，不只是內容改變。但實務警訊很清楚：**壓縮不是免費的，就算事實都還在。**

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-coins"></use></svg><span>章節 08</span></div>

## 成本

這裡其實是三場不同的計時測試，各自回答不同的問題。

**測試 1：MEME 切片。** 表格使用 10 個 episode、110 題，搭配一個外部 worker 與各系統原生的平行度。「Ingest to ready」是把 episode 讀進記憶、準備好回答的時間；「Search」是**回答全部 110 題的總時間**，不是單一查詢；「Total」是兩者相加。Raw-RAG 約 **50 秒匯入**、**256 秒回答 110 題**（每題約 2.3 秒）、合計 **306 秒**。第二名的 EMem 總共 1,562 秒；EverMemOS 則要 9,301 秒，約 **2.6 小時**。

| 系統 | Ingest to ready（秒） | Search（秒） | Total（秒） |
| :-- | --: | --: | --: |
| Raw-RAG | 50.32 | 255.59 | **305.91** |
| EMem | 1,082.37 | 479.59 | 1,561.97 |
| MemOS | 2,591.59 | 177.97 | 2,769.56 |
| MemMachine | 3,104.35 | 411.39 | 3,515.74 |
| Mem0 | 4,025.23 | 117.72 | 4,142.95 |
| EverMemOS | 8,217.69 | 1,083.79 | 9,301.48 |

**測試 2：BEAM 對話。** 這是一段 1,710 則訊息、接近一百萬 token 的對話，只量**匯入**。Raw-RAG 約 **20 分鐘**；下一個完成的系統 MemOS 約 **3 小時 15 分**；Memora 則要將近 **27 小時**。有些系統沒有跑完，所以文中說「下一個完成的跑分」。Memora 是 BEAM 比較中的一個系統，沒有出現在較小的 MEME 表裡。

**測試 3：MemoryAgentBench 消融。** 這是另一個 benchmark（14 個來源、103K–1.44M token），量的是**三個外加的記憶操作**：原子事實、摘要與圖譜擴展。它們需要 **2,160 萬到 1.093 億個 LLM 生成 token**——大約是數萬到十萬頁文字——以及 **2.9 到 8.8 小時**的匯入加搜尋。Raw-RAG 在**同一個** benchmark 的基線約 **12 分鐘**。Raw-RAG 的匯入使用 embedding 呼叫，不是 LLM 生成，所以 token 數字不是同類比較；時間差距是比較有意義的數字。

因此各種倍率本來就不同：MEME 切片是 **5.1 倍**（總時間約為第二名的五分之一）、對 EverMemOS 是 **30.4 倍**、BEAM 匯入對 MemOS 約 **10 倍**、消融則是 **15–44 倍**。總時間的倍率是 **5–30 倍**；「兩個數量級」只適用於最慢的匯入（約 **160 倍**），不是每一列都成立。

這不代表複雜系統沒有用。它代表複雜系統的舉證責任更高。如果一個記憶層的匯入成本高得多，卻沒有在目標 workload 上提升準確率，那它不是記憶層，只是一個很貴的索引。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span>章節 09</span></div>

## 完整的切塊規格

這是最值得抄進設計文件的部分。Raw-RAG 的預設值是：

| 參數 | 值 | 為什麼重要 |
| :-- | :-- | :-- |
| 窗格 tokenizer | GPT-4 tokenizer | 窗格大小是用 GPT-4 的 tokenizer 在匯入時量的。 |
| 窗格大小 | **256 tokens** | 小到能檢索特定交換；大到能保留局部語意。 |
| Stride | **224 tokens** | 每一步移動多遠。256 − 32 = 224，所以相鄰窗格共用 32 token。 |
| 重疊 | **32 tokens** | 避免實體或關係在邊界被切斷。 |
| Dense 候選 | **128** | 便宜的向量搜尋短名單。它先確保正確窗格有機會進榜；昂貴的重排器只看這 128 個問題–窗格配對。 |
| 重排窗格 | **15** | 回答模型的預算。Final-k 是最後交給 reader 的窗格數；5 到 60 都在 1.3 個百分點內，120 會掉 14.57 個百分點。 |
| Reranker | Cross-encoder | 移除它在 MemoryAgentBench 上掉 3.92 個百分點。 |
| Turn expansion | **開啟** | 選中的窗格會展開成它重疊到的完整 turn（可能不止一輪）。 |
| 去重 | 預設**關閉** | 在測試設定中開啟會掉 2.39 個百分點。 |
| Query | 原始問題 | 不做 query rewriting（改寫查詢）：使用者問什麼就搜什麼。 |
| Index | 扁平、ingestion 後固定 | 一份簡單清單，沒有階層、沒有圖，匯入後不再更新。 |

### 一段文字，三個窗格

這是一封客服信，用同樣的重疊幾何切開；為了讓接縫看得見，窗格縮小了：

<div class="ragx-chunk">
  <div class="ragx-chunk-head">
    <div class="ragx-chunk-eyebrow">來源文件 · 75 字</div>
    <p class="ragx-chunk-src">你好，我在 3 月 3 日訂了胡桃木書桌。第一次送來時桌腳裂了，你們在 3 月 12 日換了一張。新桌子沒問題，但發票仍然向我收兩張桌子的錢。我只想付一張。請更正發票，並確認退還重複收取的款項。</p>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 01</div>
    <div class="ragx-chunk-text">你好，我在 3 月 3 日訂了胡桃木書桌。第一次送來時桌腳裂了，你們在 3 月 12 日換了一張。</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 02</div>
    <div class="ragx-chunk-text"><mark>你們在 3 月 12 日換了一張。</mark> 新桌子沒問題，但發票仍然向我收兩張桌子的錢。我只想付一張。</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 03</div>
    <div class="ragx-chunk-text"><mark>我只想付一張。</mark> 請更正發票，並確認退還重複收取的款項。</div>
  </div>
  <div class="ragx-chunk-foot">縮小範例 · 同樣的重疊模式，更短的窗格</div>
</div>

1. Window 02 還能回答「什麼東西被換掉？」，因為重疊把「3 月 12 日換了一張」一起帶過來了。
2. Window 03 單獨看不知道「重複收取的款項」指什麼；是 Window 02 先介紹了這個概念。重疊保留了這座橋。
3. 沒有任何一個窗格裝得下完整故事。這就是為什麼最後還要 turn expansion 把完整訊息接回來，也是為什麼 top-15 只是預算，不是保證。

讀者實際拿到的證據長度，和窗格大小一樣重要。經過 turn expansion 與格式化之後，平均證據長度是：

| Benchmark | 平均 token | 中位數 | 第 95 百分位 | 最長 | 超過 5,000 token 的題數 |
| :-- | --: | --: | --: | --: | --: |
| MemoryAgentBench | 3,915.8 | 4,173.0 | 4,209.5 | 4,262 | 0 |
| LoCoMo | 4,778.8 | 4,778.0 | 4,966.1 | 5,177 | 41 |
| LongMemEval | 11,355.6 | 11,248.5 | 13,915.3 | 27,375 | 500 |
| MEME | 11,986.1 | 10,186.0 | 21,329.6 | 42,490 | 1,188 |

第 95 百分位是「95% 的題目都低於這個長度」；最長的 5% 在此之上。最後一欄是題數，不是 token 數。

5,000-token 控制組是一個有用的 sanity check。Raw-RAG 在 MemoryAgentBench 上從未超過 5,000 token，分數維持 **48.32%**；同一個上限下，控制組中最強的基線是 **44.74%**。在 LoCoMo 與 LongMemEval 上，關掉 turn expansion 以塞進 5,000 token 反而讓分數略升（+0.35 與 +1.67）；在 MEME 上則降 1.09。預算有影響，但更大的影響仍然是「有沒有檢索到正確的證據」。

### 這篇文章的切塊

我用同一個 tokenizer 跑過本文正文。下表不含 frontmatter、圖表 SVG、01B HTML 圖表與這張表本身。它是一個實際例子，說明一篇散文文章落在 256/32 索引上會長什麼樣子：

| 章節 | 約略 tokens | 256/32 窗格數 | 建議 reader 單位 |
| :-- | --: | --: | :-- |
| 開頭 + 論點 | 1,225 | 6 | 3–6 個窗格 |
| 「Naive」的意思 | 1,129 | 5 | 3–5 個窗格 |
| Benchmark 地圖 | 1,412 | 7 | 4–7 個窗格 |
| 為什麼 coverage 會贏 | 707 | 4 | 2–4 個窗格 |
| 路徑與 complete store | 1,165 | 6 | 3–6 個窗格 |
| 變更審計 | 870 | 4 | 2–4 個窗格 |
| 複雜度仍有價值的地方 | 539 | 3 | 2–3 個窗格 |
| 消融實驗 | 1,149 | 5 | 3–5 個窗格 |
| 成本 | 840 | 4 | 2–4 個窗格 |
| 切塊規格 | 1,253 | 6 | 3–6 個窗格 |
| 保留意見 + 檢查清單 | 915 | 4 | 2–4 個窗格 |
| **正文合計** | **11,204** | **54** | **Top-15 = 展開前 3,840 tokens** |

兩個實務提醒：

1. **不要切開表格、程式碼區塊或圖表卡。** 256-token 窗格會切穿 Markdown 表格或 SVG。散文用 heading-aware 邊界與 10–15% 重疊；對話用論文的 256/32。
2. **索引預算不等於 reader 預算。** 索引可以保留每一個 256-token 窗格；reader 只該看到一小組重排後的窗格。Raw-RAG 的 15 窗格預設值大約是展開前 3,840 token——這也解釋了為什麼實際證據長度是 3.9k 到 12k token，而不是 15 × 256。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg><span>章節 10</span></div>

## 我會怎麼做

<ul class="ragx-checklist">
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg></span><div><b>先建基線，再加記憶層。</b> 扁平索引、256-token 窗格、32-token 重疊、top-128 dense 候選、cross-encoder top-15、turn expansion。先在你的 workload 上量它，再考慮加任何東西。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span><div><b>分開量 coverage 與 utilization。</b> 單一準確率會掩蓋你到底是找不到證據，還是找到了卻不會用。抽樣標註<b>證據夠不夠（sufficiency）</b>——只判斷檢索到的證據是否足以回答，不判斷答案對不對；診斷不同，修法就不同。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-route"></use></svg></span><div><b>保留 provenance 與路徑。</b> 存原始 turn、時間戳，以及讓它變成目前狀態的事件連結。<b>Provenance（來源追溯）</b> 是指每一則存入的事實從哪裡來；沒有依賴鏈的事實是一個陷阱。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg></span><div><b>讓每個記憶操作通過同預算測試。</b> 同樣的 reader、同樣的證據預算、同樣的 judge。如果 atomic facts、summary 或 graph expansion 贏不了 raw baseline，就不要上線。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span><div><b>用你真正要部署的回答模型測試。</b> MEME 的上限測試顯示，同一份證據交給不同回答模型，分數可以差 35 個百分點。對弱模型有幫助的記憶設計，對強模型可能完全不必要——反之亦然。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-shield-check"></use></svg></span><div><b>不要把 benchmark 準確率當成產品中的記憶。</b> 刪除、<b>權威狀態（authoritative state：多個版本並存時，哪一個才是目前正確的值）</b>、<b>可審計性（auditability：能追溯系統為什麼這樣回答、用了哪些證據）</b>、隱私，都是這篇論文沒有測試的真實需求。如果你刪不掉，raw history 也是負債。</div></li>
</ul>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg><span>章節 11</span></div>

## 保留意見

結果很強，但不是普世定律。

- **比較混合了已發表分數。** 不同 baseline 論文使用不同的回答模型、不同的指示、不同的評分者、不同大小的證據預算。作者在能對齊的地方重跑了對齊設定，但主表仍然混合已發表數字與新跑的結果。LongMemEval 的 0.13 個百分點勝利在 LLM 評分的雜訊範圍內，不該當成真正的差距。
- **任務是固定歷史上的批次問答。** 論文沒有測試即時對話、互動式 agent、工具使用，或圖像與音訊記憶。
- **Coverage 標籤來自 LLM judge**（MemoryAgentBench）。每個系統的 utilization 只在**它自己**檢索到足夠證據的題目上計算，所以檢索得少的系統等於被考在較簡單的子集上。回答模型的比較**不是完全對等的**。
- **MEME 的絕對分數偏低。** Raw-RAG 用 GPT-4o-mini 只有 39.30%，用 DeepSeek 只有 43.19%；Full-context + DeepSeek 則達到 63.17%。檢索仍然漏掉關鍵證據。
- **PersonaMem 是一個真實的反例。** 當任務是個人化而不是事實回憶，profile-based memory 會贏。誠實的結論不是「agentic memory 已死」，而是「agentic memory 必須贏過一個強大的 raw baseline」。

論文標題問的是：複雜的 agentic memory 是否總是必要？它支持的答案是：**不——而且這個領域應該停止假設它必要。** 這個基線簡單、便宜、而且很難打敗。這正是基線存在的意義。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-book-open"></use></svg><span>章節 12</span></div>

## 參考資料

- *Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought.* [arXiv:2610.30755](https://arxiv.org/abs/2610.30755), 2026.
- 論文使用的 benchmark 包括 LoCoMo、LongMemEval、MEME、MemoryAgentBench 與 PersonaMem-v2；完整的 baseline 設定與附錄請見預印本。
- 圖示：Lucide（ISC），透過 Iconify API 取得。

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
