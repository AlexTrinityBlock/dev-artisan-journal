---
title: "原始歷史就是記憶體：一個 Naive RAG 基線揭露了什麼"
description: "細讀 arXiv:2610.30755：256-token 窗格、top-128 檢索、top-15 重排，以及為什麼這個簡單基線在七個設定中贏了六個。"
pubDate: 2026-11-11
category: "AI"
tags: ["RAG", "Memory", "LLM", "論文筆記", "Retrieval"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
---

# 原始歷史就是記憶體：一個 Naive RAG 基線揭露了什麼

<svg class="ragx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="ragx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="ragx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="ragx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="ragx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="ragx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="ragx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="ragx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="ragx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="ragx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="ragx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="ragx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="ragx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="ragx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="ragx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="ragx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="ragx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="ragx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="ragx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="ragx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="ragx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="ragx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="ragx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="ragx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="ragx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="ragx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="ragx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="ragx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="ragx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="ragx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="ragx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol></defs></svg>


每個記憶系統最後都會長出第二個系統：抽取、整合、圖建構、變更、衰減、反思。這個前提很合理——對話很長、context window 有限，模型不該每次都重讀全部。但每加一層，就多一個證據可能遺失、被扭曲、或被搬到搆不到的地方。

2026 年的一篇預印本直接把這個不舒服的問題問出來：**這些複雜度，對長期對話理解真的是必要的嗎？** 作者建立了 *Raw-RAG*，一個完全不做 LLM 記憶管理的基線。它只索引原始歷史、取出 dense 候選、重新排序，然後把選中的窗格交給 reader。在 LoCoMo、LongMemEval、MEME 與 MemoryAgentBench 上，它在 **七個 benchmark–model 設定中拿下六個第一**，贏過最強的 agentic memory 系統 **0.13 到 5.53 分**。

這篇論文不是說記憶研究沒有意義。它說的是一個更窄、也更有用的結論：**一個做得好 raw-history 檢索基線，強到每一個新增的記憶操作都必須證明自己的貢獻。**

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01 · 主要結果</div>
    <div class="ragx-title">Raw-RAG 在七個設定中贏了六個。</div>
    <p class="ragx-sub">對比最強 agentic memory 系統的差距，單位為分。唯一輸掉的是 MEME + DeepSeek-V4-Flash。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-a" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-a">Raw-RAG delta versus the strongest agentic memory system</title><desc>Dot plot of seven benchmark-model settings. Raw-RAG wins six and loses one.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="172.0" y1="28" x2="172.0" y2="232" class="ragx-grid" /><line x1="172.0" y1="23" x2="172.0" y2="30" class="ragx-tick" /><line x1="223.2" y1="28" x2="223.2" y2="232" class="ragx-zero" /><line x1="223.2" y1="23" x2="223.2" y2="30" class="ragx-tick" /><line x1="274.3" y1="28" x2="274.3" y2="232" class="ragx-grid" /><line x1="274.3" y1="23" x2="274.3" y2="30" class="ragx-tick" /><line x1="325.5" y1="28" x2="325.5" y2="232" class="ragx-grid" /><line x1="325.5" y1="23" x2="325.5" y2="30" class="ragx-tick" /><line x1="376.7" y1="28" x2="376.7" y2="232" class="ragx-grid" /><line x1="376.7" y1="23" x2="376.7" y2="30" class="ragx-tick" /><text x="0.0" y="48.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4o-mini</text><line x1="223.2" y1="46.0" x2="247.5" y2="46.0" class="ragx-stem" /><circle cx="247.5" cy="46.0" r="3.2" class="ragx-dot" /><text x="254.5" y="48.6" class="ragx-value" text-anchor="start">+0.95</text><text x="0.0" y="75.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4.1-mini</text><line x1="223.2" y1="73.0" x2="274.6" y2="73.0" class="ragx-stem" /><circle cx="274.6" cy="73.0" r="3.2" class="ragx-dot" /><text x="281.6" y="75.6" class="ragx-value" text-anchor="start">+2.01</text><text x="0.0" y="102.6" class="ragx-label" text-anchor="start">LongMemEval · GPT-4.1-mini</text><line x1="223.2" y1="100.0" x2="226.5" y2="100.0" class="ragx-stem" /><circle cx="226.5" cy="100.0" r="3.2" class="ragx-dot" /><text x="233.5" y="102.6" class="ragx-value" text-anchor="start">+0.13</text><text x="0.0" y="129.6" class="ragx-label" text-anchor="start">MEME · GPT-4o-mini</text><line x1="223.2" y1="127.0" x2="280.5" y2="127.0" class="ragx-stem" /><circle cx="280.5" cy="127.0" r="3.2" class="ragx-dot" /><text x="287.5" y="129.6" class="ragx-value" text-anchor="start">+2.24</text><text x="0.0" y="156.6" class="ragx-label" text-anchor="start">MEME · DeepSeek-V4-Flash</text><line x1="184.3" y1="154.0" x2="223.2" y2="154.0" class="ragx-stem" /><circle cx="184.3" cy="154.0" r="3.2" class="ragx-dot-hollow" /><text x="177.3" y="156.6" class="ragx-value" text-anchor="end">−1.52</text><text x="0.0" y="183.6" class="ragx-label" text-anchor="start">MAB · GPT-4o-mini</text><line x1="223.2" y1="181.0" x2="337.8" y2="181.0" class="ragx-stem" /><circle cx="337.8" cy="181.0" r="3.2" class="ragx-dot" /><text x="344.8" y="183.6" class="ragx-value" text-anchor="start">+4.48</text><text x="0.0" y="210.6" class="ragx-label" text-anchor="start">MAB · DeepSeek-V4-Flash</text><line x1="223.2" y1="208.0" x2="364.6" y2="208.0" class="ragx-stem" /><circle cx="364.6" cy="208.0" r="8.3" class="ragx-halo" /><circle cx="364.6" cy="208.0" r="4.8" class="ragx-dot-hero" /><text x="372.6" y="210.6" class="ragx-value-strong" text-anchor="start">+5.53</text><line x1="172" y1="232" x2="392" y2="232" class="ragx-axis-line" /><line x1="172.0" y1="232" x2="172.0" y2="237" class="ragx-tick" /><text x="172.0" y="246.0" class="ragx-axis" text-anchor="middle">−2</text><line x1="223.2" y1="232" x2="223.2" y2="237" class="ragx-tick" /><text x="223.2" y="246.0" class="ragx-axis" text-anchor="middle">0</text><line x1="274.3" y1="232" x2="274.3" y2="237" class="ragx-tick" /><text x="274.3" y="246.0" class="ragx-axis" text-anchor="middle">+2</text><line x1="325.5" y1="232" x2="325.5" y2="237" class="ragx-tick" /><text x="325.5" y="246.0" class="ragx-axis" text-anchor="middle">+4</text><line x1="376.7" y1="232" x2="376.7" y2="237" class="ragx-tick" /><text x="376.7" y="246.0" class="ragx-axis" text-anchor="middle">+6</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">← Raw-RAG behind</text><text x="392.0" y="280.0" class="ragx-note" text-anchor="end">Raw-RAG ahead →</text></svg>
    <div class="ragx-src">DOT PLOT · 7 個 BENCHMARK–MODEL 設定 · ARXIV:2610.30755</div>
  </div>
</div>

## 「Naive」在這裡到底是什麼意思

*Naive* 這個詞承擔了很多工作。Raw-RAG 對記憶管理 naive，但對檢索並不 naive。它的 ingestion 管線刻意保持簡單，但檢索有調過：

- 把每段對話序列化，保留訊息時間戳與圖片 caption。
- 切成 **256-token 窗格**，重疊 **32 token**（stride 224）。
- 將窗格 embed 進一個扁平索引。不做抽取、不做摘要、不建圖、不變更。
- 查詢時，將問題 embed，用 cosine similarity 取出 **top 128** 個窗格。
- 用 **cross-encoder** 對每個問題–窗格配對評分，留下 **top 15**。
- 把每個選中的窗格展開回完整的來源 turn，再交給 reader。

最後一步很重要。檢索單位是 256-token 窗格，但 reader 看到的不是被切斷的句子或半個 turn，而是包含該窗格的完整來源 turn，加上周圍的對話脈絡。索引保持小且固定；reader 拿到足夠的文字去解析指涉與狀態變化。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg> EXHIBIT // 02 · 檢索預算</div>
    <div class="ragx-title">整個檢索預算只有四個數字。</div>
    <p class="ragx-sub">256-token 窗格 · 32-token 重疊 · 128 個 dense 候選 · 15 個重排窗格。Turn expansion 發生在選取之後。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-d" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-d">Raw-RAG retrieval budget</title><desc>256-token windows with 32-token overlap, 128 dense candidates, 15 reranked windows.</desc><text x="24.0" y="16.0" class="ragx-label" text-anchor="start">SOURCE HISTORY</text><rect x="24" y="24" width="352" height="18" rx="3" class="ragx-src-box" /><line x1="28.0" y1="30" x2="28.0" y2="38" class="ragx-turn" /><line x1="40.3" y1="30" x2="40.3" y2="38" class="ragx-turn" /><line x1="52.6" y1="28" x2="52.6" y2="38" class="ragx-turn" /><line x1="64.9" y1="28" x2="64.9" y2="38" class="ragx-turn" /><line x1="77.2" y1="28" x2="77.2" y2="38" class="ragx-turn" /><line x1="89.5" y1="30" x2="89.5" y2="38" class="ragx-turn" /><line x1="101.8" y1="30" x2="101.8" y2="38" class="ragx-turn" /><line x1="114.1" y1="28" x2="114.1" y2="38" class="ragx-turn" /><line x1="126.4" y1="28" x2="126.4" y2="38" class="ragx-turn" /><line x1="138.7" y1="28" x2="138.7" y2="38" class="ragx-turn" /><line x1="151.0" y1="30" x2="151.0" y2="38" class="ragx-turn" /><line x1="163.3" y1="30" x2="163.3" y2="38" class="ragx-turn" /><line x1="175.6" y1="28" x2="175.6" y2="38" class="ragx-turn" /><line x1="187.9" y1="28" x2="187.9" y2="38" class="ragx-turn" /><line x1="200.2" y1="28" x2="200.2" y2="38" class="ragx-turn" /><line x1="212.5" y1="30" x2="212.5" y2="38" class="ragx-turn" /><line x1="224.8" y1="30" x2="224.8" y2="38" class="ragx-turn" /><line x1="237.1" y1="28" x2="237.1" y2="38" class="ragx-turn" /><line x1="249.4" y1="28" x2="249.4" y2="38" class="ragx-turn" /><line x1="261.7" y1="28" x2="261.7" y2="38" class="ragx-turn" /><line x1="274.0" y1="30" x2="274.0" y2="38" class="ragx-turn" /><line x1="286.3" y1="30" x2="286.3" y2="38" class="ragx-turn" /><line x1="298.6" y1="28" x2="298.6" y2="38" class="ragx-turn" /><line x1="310.9" y1="28" x2="310.9" y2="38" class="ragx-turn" /><line x1="323.2" y1="28" x2="323.2" y2="38" class="ragx-turn" /><line x1="335.5" y1="30" x2="335.5" y2="38" class="ragx-turn" /><line x1="347.8" y1="30" x2="347.8" y2="38" class="ragx-turn" /><line x1="360.1" y1="28" x2="360.1" y2="38" class="ragx-turn" /><line x1="372.4" y1="28" x2="372.4" y2="38" class="ragx-turn" /><rect x="24" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="88.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="200.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="248" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="312.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="16" height="26" class="ragx-overlap" /><rect x="248" y="50" width="16" height="26" class="ragx-overlap" /><line x1="136" y1="82" x2="152" y2="82" class="ragx-bracket" /><line x1="136" y1="79" x2="136" y2="85" class="ragx-bracket" /><line x1="152" y1="79" x2="152" y2="85" class="ragx-bracket" /><text x="144.0" y="92.0" class="ragx-axis" text-anchor="middle">32 overlap</text><path d="M200 98 V116" class="ragx-arrow" /><path d="M196 112 L200 117 L204 112" class="ragx-arrow" /><text x="210.0" y="110.0" class="ragx-note" text-anchor="start">EMBED</text><defs><pattern id="ragx-ticks" width="2.75" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" class="ragx-tickline" /></pattern></defs><rect x="24" y="122" width="352" height="10" fill="url(#ragx-ticks)" /><text x="24.0" y="148.0" class="ragx-label" text-anchor="start">TOP-128 DENSE CANDIDATES</text><text x="376.0" y="148.0" class="ragx-value-strong" text-anchor="end">128</text><path d="M200 154 V174" class="ragx-arrow" /><path d="M196 170 L200 175 L204 170" class="ragx-arrow" /><text x="210.0" y="167.0" class="ragx-note" text-anchor="start">RERANK</text><circle cx="24.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="49.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="74.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="99.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="124.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="149.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="174.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="200.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="225.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="250.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="275.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="300.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="325.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="350.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="376.0" cy="188" r="2.9" class="ragx-dot" /><text x="24.0" y="208.0" class="ragx-label" text-anchor="start">TOP-15 RERANKED WINDOWS</text><text x="376.0" y="208.0" class="ragx-value" text-anchor="end">15 × 256</text><path d="M200 216 V234" class="ragx-arrow" /><path d="M196 230 L200 235 L204 230" class="ragx-arrow" /><text x="210.0" y="228.0" class="ragx-note" text-anchor="start">READ</text><rect x="130" y="242" width="140" height="24" rx="3" class="ragx-reader" /><text x="200.0" y="258.0" class="ragx-label" text-anchor="middle">READER · FULL TURNS</text><text x="24.0" y="286.0" class="ragx-note" text-anchor="start">≈ 3,840 TOKENS BEFORE TURN EXPANSION</text></svg>
    <div class="ragx-src">PIPELINE · RAW-RAG · ARXIV:2610.30755</div>
  </div>
</div>

論文預設 256-token 窗格，但消融實驗顯示這個數字不是神聖的：**128 到 1,024 token** 的窗格對 MemoryAgentBench 總分沒有顯著影響。真正有影響的是 **reranking** 與 **適度的檢索深度**。移除 cross-encoder 會掉 **3.92 分**；只回傳一個項目會掉 **11.73 分**；回傳 120 個項目會掉 **14.57 分**，主要發生在 long-range understanding 與 conflict resolution。

## Benchmark 地圖

這篇論文的結果，只有在你知道每個 benchmark 在壓力測試什麼之後才有意義。評估中出現六個資料集：四個承擔主要準確率主張，一個是個人化檢查，一個只當 ingestion workload。

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
      <p class="ragx-bench-desc">兩位說話者、跨越多個 session 的對話；問題要求單一事實、多跳整合、時間順序與開放域推論。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>10 段對話 · 1,540 題</dd></div>
        <div><dt>METRIC</dt><dd>LLM judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 單跳回憶占多數（841/1,540）。10 段對話版本不是原始的 50 段，且 adversarial 題目被排除。</div>
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
      <p class="ragx-bench-desc">每題都附帶自己的長對話歷史；五種能力涵蓋回憶、跨 session 推論、時間順序、偏好與知識更新。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>500 題 · 約 115k-token 歷史</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 每題都有獨立歷史，因此也測試記憶隔離。30 題是 abstention；S（115k）與 M（1.5M）不能互換。</div>
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
      <p class="ragx-bench-desc">受控 episode，包含多個隨時間變化的實體；題目針對精確回憶、聚合、追蹤、刪除、cascade 與 absence。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>100 個 episode · 1,188 題 · 32k distractors</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 六任務 macro</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Cascade 與 absence 需要把上游變更沿規則傳遞。32k、128k 與 no-filler 是三種不同 benchmark；分數用六任務 macro-average。</div>
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
      <p class="ragx-bench-desc">先 ingest 一次長來源，再回答橫跨四種能力的多個問題：accurate retrieval、test-time learning、long-range understanding、conflict resolution。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>2,071 題 · 14 個來源 · 103K–1.44M tokens</dd></div>
        <div><dt>METRIC</dt><dd>原生指標 · 四能力 macro</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Test-time learning 與 long-range understanding 是差異點。2,071 是精選集；內嵌的 LongMemEval 來源不等於獨立的 500 題版本。</div>
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
      <p class="ragx-bench-desc">帶有隱含偏好的長對話歷史；模型必須推斷使用者是誰，並在九種情境中選出適合他的回應。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>5,000 道選擇題 · 32k 歷史</dd></div>
        <div><dt>METRIC</dt><dd>MCQ exact match</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 四個選項代表 25% 的猜題基準。Raw-RAG 沒有 persona profile，EverMemOS 有；這是系統級比較，不是檢索骨幹比較。</div>
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
      <p class="ragx-bench-desc">一段接近一百萬 token 的連貫對話；論文用它測量每個系統多快能準備好服務。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>1 段對話 · 1,710 則訊息 · 約 1M tokens</dd></div>
        <div><dt>METRIC</dt><dd>無——只計時</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 這不是 BEAM 準確率結果。論文只串流一段 1M-token 對話，不是完整的 100 段 benchmark，且不包含答案生成。</div>
    </div>
  </div>
</div>

<div class="ragx-callout">
  <svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg>
  <div><b>不要直接比較總分。</b>切片、judge 與聚合規則都不同：LoCoMo 與 LongMemEval 是 question-weighted accuracy，MEME 是六任務 macro，MemoryAgentBench 是四能力 macro，PersonaMem-v2 是 MCQ exact match。論文在能對齊的地方對齊；其餘是基線論證，不是 leaderboard。</div>
</div>

<div class="ragx-src">BENCHMARK SOURCES · LoCoMo (ACL 2024) · LongMemEval (ICLR 2025) · MEME (NeurIPS 2026) · MemoryAgentBench (ICLR 2026) · PersonaMem-v2 (2025) · BEAM (ICLR 2026)</div>

## 分數不是重點

更有用的是「為什麼 raw retrieval 會贏」。作者把準確率拆成兩個量：

- **Coverage**：檢索到的脈絡中，含有足夠證據回答問題的比例。
- **Utilization**：在證據足夠的前提下，答對的比例。

在 MemoryAgentBench 上，各系統的 coverage 從 **19.07% 到 45.29%**，差距 26.2 個百分點；utilization 只從 **80.00% 到 89.71%**，差距 9.7 個百分點。MEME 的模式更明顯：coverage 從 **35.69% 到 76.35%**（40.7 個百分點），utilization 從 **65.51% 到 86.55%**（21.0 個百分點）。

Raw-RAG 在兩個 benchmark 上都有 **最高的 coverage**（45.29% 與 76.35%）。它的 utilization 不是最高（84.43% 與 73.76%）。乘起來仍然贏，因為「找到證據」是更難的問題。再強的 reader，也無法穩定補償從來沒被檢索到的證據。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg> EXHIBIT // 03 · COVERAGE VS UTILIZATION</div>
    <div class="ragx-title">Coverage 的變異比 utilization 大。</div>
    <p class="ragx-sub">圖中為各系統觀測到的 min–max。點代表系統，橫線代表範圍；Raw-RAG 是 coverage 列右端最深的點。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-b" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-b">Coverage varies more than utilization</title><desc>Ranges of coverage and utilization across systems on MemoryAgentBench and MEME.</desc><text x="390.0" y="16.0" class="ragx-axis" text-anchor="end">PERCENT</text><line x1="124.0" y1="34" x2="124.0" y2="232" class="ragx-grid" /><line x1="190.5" y1="34" x2="190.5" y2="232" class="ragx-grid" /><line x1="257.0" y1="34" x2="257.0" y2="232" class="ragx-grid" /><line x1="323.5" y1="34" x2="323.5" y2="232" class="ragx-grid" /><line x1="390.0" y1="34" x2="390.0" y2="232" class="ragx-grid" /><line x1="124" y1="56" x2="390" y2="56" class="ragx-grid-h" /><line x1="124" y1="106" x2="390" y2="106" class="ragx-grid-h" /><line x1="124" y1="156" x2="390" y2="156" class="ragx-grid-h" /><line x1="124" y1="206" x2="390" y2="206" class="ragx-grid-h" /><text x="0.0" y="58.3" class="ragx-label" text-anchor="start">MAB · coverage</text><line x1="174.7" y1="56.0" x2="244.5" y2="56.0" class="ragx-range" /><line x1="174.7" y1="52.0" x2="174.7" y2="60.0" class="ragx-range-cap" /><line x1="244.5" y1="52.0" x2="244.5" y2="60.0" class="ragx-range-cap" /><text x="209.6" y="47.0" class="ragx-axis" text-anchor="middle">26.2 pp</text><circle cx="174.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="181.3" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="190.8" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="215.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="216.4" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="230.5" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="244.5" cy="53.8" r="8.3" class="ragx-halo" /><circle cx="244.5" cy="53.8" r="5.0" class="ragx-dot-hero" /><text x="255.5" y="56.2" class="ragx-value-strong" text-anchor="start">45.3</text><text x="0.0" y="108.3" class="ragx-label" text-anchor="start">MAB · utilization</text><line x1="336.8" y1="106.0" x2="362.6" y2="106.0" class="ragx-range" /><line x1="336.8" y1="102.0" x2="336.8" y2="110.0" class="ragx-range-cap" /><line x1="362.6" y1="102.0" x2="362.6" y2="110.0" class="ragx-range-cap" /><text x="349.7" y="97.0" class="ragx-axis" text-anchor="middle">9.7 pp</text><circle cx="336.8" cy="103.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.2" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.2" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="348.6" cy="103.8" r="3.4" class="ragx-dot-ink" /><circle cx="352.4" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="361.7" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="362.6" cy="103.8" r="2.9" class="ragx-dot-soft" /><text x="0.0" y="158.3" class="ragx-label" text-anchor="start">MEME · coverage</text><line x1="218.9" y1="156.0" x2="327.1" y2="156.0" class="ragx-range" /><line x1="218.9" y1="152.0" x2="218.9" y2="160.0" class="ragx-range-cap" /><line x1="327.1" y1="152.0" x2="327.1" y2="160.0" class="ragx-range-cap" /><text x="273.0" y="147.0" class="ragx-axis" text-anchor="middle">40.7 pp</text><circle cx="218.9" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="250.7" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="257.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="289.2" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="292.2" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="311.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="327.1" cy="153.8" r="3.4" class="ragx-dot-ink" /><text x="0.0" y="208.3" class="ragx-label" text-anchor="start">MEME · utilization</text><line x1="298.3" y1="206.0" x2="354.2" y2="206.0" class="ragx-range" /><line x1="298.3" y1="202.0" x2="298.3" y2="210.0" class="ragx-range-cap" /><line x1="354.2" y1="202.0" x2="354.2" y2="210.0" class="ragx-range-cap" /><text x="326.2" y="197.0" class="ragx-axis" text-anchor="middle">21.0 pp</text><circle cx="298.3" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="301.3" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="320.2" cy="208.2" r="3.4" class="ragx-dot-ink" /><circle cx="328.4" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.9" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.0" cy="208.2" r="2.9" class="ragx-dot-soft" /><circle cx="354.2" cy="203.8" r="2.9" class="ragx-dot-soft" /><line x1="124" y1="232" x2="390" y2="232" class="ragx-axis-line" /><line x1="124.0" y1="232" x2="124.0" y2="237" class="ragx-tick" /><text x="124.0" y="250.0" class="ragx-axis" text-anchor="middle">0</text><line x1="190.5" y1="232" x2="190.5" y2="237" class="ragx-tick" /><text x="190.5" y="250.0" class="ragx-axis" text-anchor="middle">25</text><line x1="257.0" y1="232" x2="257.0" y2="237" class="ragx-tick" /><text x="257.0" y="250.0" class="ragx-axis" text-anchor="middle">50</text><line x1="323.5" y1="232" x2="323.5" y2="237" class="ragx-tick" /><text x="323.5" y="250.0" class="ragx-axis" text-anchor="middle">75</text><line x1="390.0" y1="232" x2="390.0" y2="237" class="ragx-tick" /><text x="382.0" y="250.0" class="ragx-axis" text-anchor="middle">100</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">Dots = systems · bar = observed min–max</text></svg>
    <div class="ragx-src">RANGE PLOT · 7 個系統 · MEMORYAGENTBENCH + MEME</div>
  </div>
</div>

這是論文最實用的貢獻。如果你的記憶系統輸了，第一個問題不是「我要怎麼改 reader？」而是「哪一個必要證據根本沒進到 context？」Coverage 是 ingestion 與 retrieval 的問題；utilization 是 reader 的問題。兩者失敗的方式不同，修法也不同。

## 只有答案值不夠

第二個診斷把問題切得更細。在 MEME 的 tracking 與 cascade 題上，作者區分 **result coverage**（需要的答案值是否出現）與 **path coverage**（答案值，加上推導它所需的時間順序或依賴鏈，是否一起出現）。

條件路徑率 **P(path | result)** 的定義是：在 result-covered 的題目中，脈絡同時包含完整支持路徑的比例。

| 系統 | Result coverage | Path coverage | P(path \| result) |
| :-- | --: | --: | --: |
| Raw-RAG | 90.53 | 56.44 | **62.34** |
| MemMachine | 84.85 | 48.11 | 56.70 |
| EverMemOS | 78.03 | 39.02 | 50.00 |
| EMem | 76.52 | 37.88 | 49.50 |
| Mem0 | 81.06 | 38.64 | 47.66 |
| MemOS | 88.26 | 21.21 | 24.03 |
| MemU | 59.09 | 5.68 | 9.62 |

這就是「存一個事實」與「存這個事實現在為什麼成立」的差別。記憶系統可能檢索到「預算是 $4,200」，卻漏掉讓它提高的核准、讓它降低的轉帳，或這些事件發生的順序。Raw history 保留了這些關係，因為它從來沒有把它們移除。

Complete-store oracle 把論點推得更遠。作者讓每個系統用 **gold-informed 的方式直接存取自己完整的匯出記憶**，繞過原生檢索；再跟一個 raw-evidence control 比較，後者用同樣的 gold 訊號選出原始支持 session：

| 系統 | Native | Complete store | Raw evidence |
| :-- | --: | --: | --: |
| Raw-RAG | 39.30 | **57.54** | 61.60 |
| MemMachine | 37.06 | **57.46** | 61.60 |
| EverMemOS | 21.57 | 51.59 | 61.60 |
| EMem | 33.84 | 48.36 | 61.60 |
| MemOS | 30.24 | 45.12 | 61.60 |
| Mem0 | 27.76 | 32.26 | 61.60 |
| MemU | 19.87 | 31.07 | 61.60 |

把檢索從方程式中拿掉之後，每個系統都變好。但保留原始對話內容的系統——Raw-RAG 與 MemMachine——最接近 raw-evidence 天花板。被轉換過的 store 差距更大。就算能完整存取一個 store，也救不回 ingestion 階段丟掉的資訊。

作者對解讀很克制：殘餘差距不是純粹的資訊損失量測。證據組裝、排序，以及 *lost in the middle* 之類的位置效應，也可能有貢獻。但方向是一致的，而且與 path 分析的結果吻合。

## 變更審計

論文也審計了 Mem0 的寫入策略，這是目前最廣泛使用的記憶層之一。

在 LoCoMo 上，UPDATE 與 DELETE 合計只占 33,902 次寫入決策的 **4.39%**。在 LongMemEval 上，它們只占 428,858 次決策的 **2.46%**。真正造成持久文字改變的「有效變更」只有 **1.90%** 與 **1.34%**。許多提出的 update 是重複的或格式錯誤的。

接著作者做了一個簡單干預：把 UPDATE 換成 append-only ADD，把 DELETE 換成 NONE。LoCoMo 準確率從 **67.36% 上升到 69.42%**，而且沒有任何類別下降。在這個設定下，顯式變更沒有帶來準確率好處。

這不代表在生產環境中刪除不重要。它代表這些 benchmark 很少需要刪除，而需要的時候，能力夠強的 reader 通常可以從原始證據重建狀態變化。第二個實驗支持這點：在 MEME 上，reader 直接拿到查詢階段可見的證據，依時間順序排列，完全沒有檢索錯誤。DeepSeek-V4-Flash 在 cascade 題達到 **82.32%**、invalidation 題 **91.54%**，整體 **85.48%**。GPT-4o-mini 只有 50.50%，Qwen3.5-35B-A3B 則是 70.25%。狀態重建取決於 reader，但只要有足夠的原始證據，它是做得到的。

## 複雜度仍然有價值的地方

這篇論文最強的時候，是被當成「基線論證」來讀，而不是普世判決。兩個結果讓它保持誠實。

第一，**PersonaMem-v2**。Raw-RAG 得分 **49.62%**，在七個系統中排第三，落後 MemOS（50.72%）與 EverMemOS（53.25%），而且沒有在任何單一情境中領先。PersonaMem 測試的是長歷史中的個人化與偏好追蹤；EverMemOS 使用了啟用 profile 的記憶管線。當任務是「記住這個人是誰、他偏好什麼」，結構化記憶有 raw retrieval 抹不掉的優勢。

第二，**MEME + DeepSeek-V4-Flash**。Raw-RAG 得分 **43.19%**，MemMachine 則是 **44.71%**。更說明問題的是，同一個設定下 **Full-context 得分 63.17%**。一個能力強的 reader 拿到完整歷史，遠勝過一個能力強的 reader 只拿到 15 個檢索窗格。這是檢索失敗，不是記憶管理的勝利。論文承認 reader 依賴性，也註明評估任務是離線問答，不是營運型記憶。

## 應該讓 builder 停下來的消融實驗

論文在 MemoryAgentBench 上的消融，是一份「聽起來很聰明、分數卻更差」的清單：

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg> EXHIBIT // 04 · 記憶管理消融</div>
    <div class="ragx-title">記憶管理沒有為自己賺回成本。</div>
    <p class="ragx-sub">MemoryAgentBench 總分相對 48.32 基線的變化。負值代表新增操作讓結果變差；只有 512/64 名義上為正。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-c" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-c">Memory-management ablations</title><desc>Change in MemoryAgentBench total when each operation is added to Raw-RAG.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="123.9" y1="32" x2="123.9" y2="236" class="ragx-grid" /><line x1="123.9" y1="27" x2="123.9" y2="34" class="ragx-tick" /><line x1="243.1" y1="32" x2="243.1" y2="236" class="ragx-grid" /><line x1="243.1" y1="27" x2="243.1" y2="34" class="ragx-tick" /><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="362.2" y1="27" x2="362.2" y2="34" class="ragx-tick" /><text x="0.0" y="46.4" class="ragx-label" text-anchor="start">− reranker</text><rect x="315.5" y="40.5" width="46.7" height="7" rx="3.5" class="ragx-bar" /><text x="309.5" y="46.4" class="ragx-value" text-anchor="end">−3.92</text><text x="0.0" y="72.4" class="ragx-label" text-anchor="start">128 / 16</text><rect x="359.4" y="66.5" width="2.9" height="7" rx="3.5" class="ragx-bar" /><text x="353.4" y="72.4" class="ragx-value" text-anchor="end">−0.24</text><text x="0.0" y="98.4" class="ragx-label" text-anchor="start">512 / 64</text><rect x="362.2" y="92.5" width="2.0" height="7" rx="3.5" class="ragx-bar-pos" /><text x="368.2" y="98.4" class="ragx-value" text-anchor="start">+0.04</text><text x="0.0" y="124.4" class="ragx-label" text-anchor="start">1024 / 128</text><rect x="358.9" y="118.5" width="3.3" height="7" rx="3.5" class="ragx-bar" /><text x="352.9" y="124.4" class="ragx-value" text-anchor="end">−0.28</text><text x="0.0" y="150.4" class="ragx-label" text-anchor="start">+ turn dedup</text><rect x="333.7" y="144.5" width="28.5" height="7" rx="3.5" class="ragx-bar" /><text x="327.7" y="150.4" class="ragx-value" text-anchor="end">−2.39</text><text x="0.0" y="176.4" class="ragx-label" text-anchor="start">+ atomic facts</text><rect x="128.4" y="170.0" width="233.8" height="8" rx="4" class="ragx-bar-hero" /><text x="140.4" y="176.5" class="ragx-value-paper" text-anchor="start">−19.62</text><text x="0.0" y="202.4" class="ragx-label" text-anchor="start">+ raw summary</text><rect x="293.0" y="196.5" width="69.2" height="7" rx="3.5" class="ragx-bar" /><text x="287.0" y="202.4" class="ragx-value" text-anchor="end">−5.81</text><text x="0.0" y="228.4" class="ragx-label" text-anchor="start">+ graph expansion</text><rect x="293.3" y="222.5" width="68.9" height="7" rx="3.5" class="ragx-bar" /><text x="287.3" y="228.4" class="ragx-value" text-anchor="end">−5.78</text><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="112" y1="244" x2="392" y2="244" class="ragx-axis-line" /><line x1="123.9" y1="244" x2="123.9" y2="249" class="ragx-tick" /><text x="123.9" y="260.0" class="ragx-axis" text-anchor="middle">−20</text><line x1="243.1" y1="244" x2="243.1" y2="249" class="ragx-tick" /><text x="243.1" y="260.0" class="ragx-axis" text-anchor="middle">−10</text><line x1="362.2" y1="244" x2="362.2" y2="249" class="ragx-tick" /><text x="362.2" y="260.0" class="ragx-axis" text-anchor="middle">0</text><text x="0.0" y="284.0" class="ragx-note" text-anchor="start">Δ vs Raw-RAG 48.32 · negative = worse</text></svg>
    <div class="ragx-src">BAR CHART · 14 個來源 · MEMORYAGENTBENCH</div>
  </div>
</div>

- **Atomic-fact extraction**：**−19.62 分**。Test-time learning 從 47.68% 掉到 15.37%。
- **Raw summary augmentation**：**−5.81 分**，主要在 conflict resolution。
- **Graph-expanded retrieval**：**−5.78 分**。
- **Display-turn deduplication**：**−2.39 分**。
- **移除 reranker**：**−3.92 分**。

Atomic-fact 的崩跌最有啟發性。MemoryAgentBench 的 test-time-learning 分割包含 few-shot 分類與推薦。可用的 demonstration 不只是事實，而是可辨識的輸入–標籤配對，加上邊界與格式。抽取事實可能保留了內容，卻摧毀了 demonstration。論文很小心，沒有把整個跌幅都歸因於事實流失：證據量、結構、reader–格式不匹配都一起變動。但實務警訊很清楚：**壓縮不是免費的，就算事實都還在。**

## 成本

效率數字不是接近，而是差一個數量級。在 10 個 episode、110 題的 MEME 切片上，使用一個外部 worker 與各系統原生的內部平行度：

| 系統 | Add → ready（秒） | Search（秒） | Total（秒） |
| :-- | --: | --: | --: |
| Raw-RAG | 50.32 | 255.59 | **305.91** |
| EMem | 1,082.37 | 479.59 | 1,561.97 |
| MemOS | 2,591.59 | 177.97 | 2,769.56 |
| MemMachine | 3,104.35 | 411.39 | 3,515.74 |
| Mem0 | 4,025.23 | 117.72 | 4,142.95 |
| EverMemOS | 8,217.69 | 1,083.79 | 9,301.48 |

Raw-RAG 比次快系統快 **5.1×**，比 EverMemOS 快 **30.4×**。在一個接近一百萬 token、1,710 則訊息的 BEAM-1M 對話上，累計 ingestion 時間是 **0.33 小時**；下一個完成的系統 MemOS 要 **3.25 小時**，Memora 則要 **26.95 小時**。消融中的三個記憶管理加法需要 **2,160 萬到 1.093 億個 LLM token**、**2.9 到 8.8 小時**的 add-plus-search，而 Raw-RAG 大約 **12 分鐘**。

這不代表複雜系統沒有用。它代表複雜系統的舉證責任更高。如果一個記憶層的 ingestion 成本高了兩個數量級，卻沒有在目標 workload 上提升準確率，那它不是記憶層，只是一個很貴的索引。

## 完整的切塊規格

這是最值得抄進設計文件的部分。Raw-RAG 的預設值是：

| 參數 | 值 | 為什麼重要 |
| :-- | :-- | :-- |
| 窗格 tokenizer | GPT-4 tokenizer | 256-token 窗格是在 ingestion 時量測的。 |
| 窗格大小 | **256 tokens** | 小到能檢索特定交換；大到能保留局部語意。 |
| Stride | **224 tokens** | 256 − 32。 |
| 重疊 | **32 tokens** | 避免實體或關係在邊界被切斷。 |
| Dense 候選 | **128** | Rerank 前的 recall；昂貴的模型只看 128 個配對。 |
| 重排窗格 | **15** | Reader 預算。Final-k 從 5 到 60 都在 1.3 分內；120 會掉 14.57 分。 |
| Reranker | Cross-encoder | 移除它在 MemoryAgentBench 上掉 3.92 分。 |
| Turn expansion | **開啟** | 選中的窗格會展開成完整來源 turn。 |
| 去重 | 預設**關閉** | 在測試設定中開啟會掉 2.39 分。 |
| Query | 原始問題 | 不做 query rewriting，也不學檢索策略。 |
| Index | 扁平、ingestion 後固定 | 不變更、不整合、不更新圖。 |

讀者實際拿到的證據長度，和窗格大小一樣重要。經過 turn expansion 與格式化之後，平均證據長度是：

| Benchmark | 平均 tokens | 中位數 | P95 | 最大 | 超過 5,000 |
| :-- | --: | --: | --: | --: | --: |
| MemoryAgentBench | 3,915.8 | 4,173.0 | 4,209.5 | 4,262 | 0 |
| LoCoMo | 4,778.8 | 4,778.0 | 4,966.1 | 5,177 | 41 |
| LongMemEval | 11,355.6 | 11,248.5 | 13,915.3 | 27,375 | 500 |
| MEME | 11,986.1 | 10,186.0 | 21,329.6 | 42,490 | 1,188 |

5,000-token 控制組是一個有用的 sanity check。Raw-RAG 在 MemoryAgentBench 上從未超過 5,000 token，分數維持 **48.32%**；同一個上限下，控制組中最強的基線是 **44.74%**。在 LoCoMo 與 LongMemEval 上，關掉 turn expansion 以塞進 5,000 token 反而讓分數略升（+0.35 與 +1.67）；在 MEME 上則降 1.09。預算有影響，但更大的影響仍然是「有沒有檢索到正確的證據」。

### 這篇文章的切塊

我用同一個 tokenizer 跑過本文正文。下表不含 frontmatter、圖表 SVG 與這張表本身。它是一個實際例子，說明一篇散文文章落在 256/32 索引上會長什麼樣子：

| 章節 | 約略 tokens | 256/32 窗格數 | 建議 reader 單位 |
| :-- | --: | --: | :-- |
| 開頭 + 論點 | 396 | 2 | 1 個窗格 |
| 「Naive」的意思 | 493 | 3 | 2–3 個窗格 |
| Benchmark 地圖 | 890 | 4 | 3–4 個窗格 |
| 為什麼 coverage 會贏 | 437 | 2 | 2 個窗格 |
| 路徑與 complete store | 733 | 4 | 3–4 個窗格 |
| 變更審計 | 394 | 2 | 1–2 個窗格 |
| 複雜度仍有價值的地方 | 308 | 2 | 1–2 個窗格 |
| 消融實驗 | 340 | 2 | 1–2 個窗格 |
| 成本 | 446 | 2 | 1 個窗格 |
| 切塊規格 | 686 | 3 | 2–3 個窗格 |
| 保留意見 + 檢查清單 | 730 | 4 | 3–4 個窗格 |
| **正文合計** | **5,853** | **30** | **Top-15 = 展開前 3,840 tokens** |

兩個實務提醒：

1. **不要切開表格、程式碼區塊或圖表卡。** 256-token 窗格會切穿 Markdown 表格或 SVG。散文用 heading-aware 邊界與 10–15% 重疊；對話用論文的 256/32。
2. **索引預算不等於 reader 預算。** 索引可以保留每一個 256-token 窗格；reader 只該看到一小組重排後的窗格。Raw-RAG 的 15 窗格預設值大約是展開前 3,840 token——這也解釋了為什麼實際證據長度是 3.9k 到 12k token，而不是 15 × 256。

## 我會怎麼做

<ul class="ragx-checklist">
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg></span><div><b>先建基線，再加記憶層。</b> 扁平索引、256-token 窗格、32-token 重疊、top-128 dense 候選、cross-encoder top-15、turn expansion。先在你的 workload 上量它，再考慮加任何東西。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span><div><b>分開量 coverage 與 utilization。</b> 單一準確率會掩蓋你到底是找不到證據，還是找到了卻不會用。抽樣標註 sufficiency；診斷不同，修法就不同。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-route"></use></svg></span><div><b>保留 provenance 與路徑。</b> 存原始 turn、時間戳，以及讓它變成目前狀態的事件連結。沒有依賴鏈的事實是一個陷阱。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg></span><div><b>讓每個記憶操作通過同預算測試。</b> 同樣的 reader、同樣的證據預算、同樣的 judge。如果 atomic facts、summary 或 graph expansion 贏不了 raw baseline，就不要上線。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span><div><b>用你真正要部署的 reader 測試。</b> MEME oracle 顯示，同一份證據在不同 reader 之間有 35 分的差距。對弱 reader 有幫助的記憶設計，對強 reader 可能完全不必要——反之亦然。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-shield-check"></use></svg></span><div><b>不要把 benchmark 準確率當成營運型記憶。</b> 刪除、權威狀態、可審計性、隱私，都是這篇論文沒有測試的真實需求。如果你刪不掉，raw history 也是負債。</div></li>
</ul>

## 保留意見

結果很強，但不是普世定律。

- **比較混合了已發表分數。** 不同 baseline 論文的 reader、prompt、judge、證據預算都不同。作者在能對齊的地方做了對齊評估，但主表仍然混合了已發表數字與新跑的結果。LongMemEval 的 0.13 分勝利不是有意義的差距。
- **任務是離線對話問答。** 論文沒有測試互動式 agent、工具使用、多模態記憶，或法規約束下的刪除。
- **Coverage 標籤來自 LLM judge**（MemoryAgentBench），而 utilization 是條件在各系統自己的 sufficient set 上。Reader 比較並不是完全受控。
- **MEME 的絕對分數偏低。** Raw-RAG 用 GPT-4o-mini 只有 39.30%，用 DeepSeek 只有 43.19%；Full-context + DeepSeek 則達到 63.17%。檢索仍然把證據留在桌上。
- **PersonaMem 是一個真實的反例。** 當任務是個人化而不是事實回憶，profile-based memory 會贏。誠實的結論不是「agentic memory 已死」，而是「agentic memory 必須贏過一個強大的 raw baseline」。

論文標題問的是：複雜的 agentic memory 是否總是必要？它支持的答案是：**不——而且這個領域應該停止假設它必要。** 這個基線簡單、便宜、而且很難打敗。這正是基線存在的意義。

## 參考資料

- *Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought.* arXiv:2610.30755, 2026. <https://arxiv.org/abs/2610.30755>
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

</style>
