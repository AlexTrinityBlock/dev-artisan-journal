---
title: "原始历史就是内存：一个 Naive RAG 基线揭露了什么"
description: "细读 arXiv:2610.30755：256-token 窗口、top-128 检索、top-15 重排，以及为什么这个简单基线在七个设置中赢了六个。"
pubDate: 2026-11-11
category: "AI"
tags: ["RAG", "Memory", "LLM", "论文笔记", "Retrieval"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
---

# 原始历史就是内存：一个 Naive RAG 基线揭露了什么

<svg class="ragx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="ragx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="ragx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="ragx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="ragx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="ragx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="ragx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="ragx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="ragx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="ragx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="ragx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="ragx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="ragx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="ragx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="ragx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="ragx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="ragx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="ragx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="ragx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="ragx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="ragx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="ragx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="ragx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="ragx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="ragx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="ragx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="ragx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="ragx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="ragx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="ragx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="ragx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol></defs></svg>


每个记忆系统最后都会长出第二个系统：抽取、整合、图构建、变更、衰减、反思。这个前提很合理——对话很长、context window 有限，模型不该每次都重读全部。但每加一层，就多一个证据可能遗失、被扭曲、或被搬到够不到的地方。

2026 年的一篇预印本直接把这个不舒服的问题问出来：**这些复杂度，对长期对话理解真的是必要的吗？** 作者建立了 *Raw-RAG*，一个完全不做 LLM 记忆管理的基线。它只索引原始历史、取出 dense 候选、重新排序，然后把选中的窗口交给 reader。在 LoCoMo、LongMemEval、MEME 与 MemoryAgentBench 上，它在 **七个 benchmark–model 设置中拿下六个第一**，赢过最强的 agentic memory 系统 **0.13 到 5.53 分**。

这篇论文不是说记忆研究没有意义。它说的是一个更窄、也更有用的结论：**一个做得好 raw-history 检索基线，强到每一个新增的记忆操作都必须证明自己的贡献。**

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01 · 主要结果</div>
    <div class="ragx-title">Raw-RAG 在七个设置中赢了六个。</div>
    <p class="ragx-sub">对比最强 agentic memory 系统的差距，单位为分。唯一输掉的是 MEME + DeepSeek-V4-Flash。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-a" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-a">Raw-RAG delta versus the strongest agentic memory system</title><desc>Dot plot of seven benchmark-model settings. Raw-RAG wins six and loses one.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="172.0" y1="28" x2="172.0" y2="232" class="ragx-grid" /><line x1="172.0" y1="23" x2="172.0" y2="30" class="ragx-tick" /><line x1="223.2" y1="28" x2="223.2" y2="232" class="ragx-zero" /><line x1="223.2" y1="23" x2="223.2" y2="30" class="ragx-tick" /><line x1="274.3" y1="28" x2="274.3" y2="232" class="ragx-grid" /><line x1="274.3" y1="23" x2="274.3" y2="30" class="ragx-tick" /><line x1="325.5" y1="28" x2="325.5" y2="232" class="ragx-grid" /><line x1="325.5" y1="23" x2="325.5" y2="30" class="ragx-tick" /><line x1="376.7" y1="28" x2="376.7" y2="232" class="ragx-grid" /><line x1="376.7" y1="23" x2="376.7" y2="30" class="ragx-tick" /><text x="0.0" y="48.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4o-mini</text><line x1="223.2" y1="46.0" x2="247.5" y2="46.0" class="ragx-stem" /><circle cx="247.5" cy="46.0" r="3.2" class="ragx-dot" /><text x="254.5" y="48.6" class="ragx-value" text-anchor="start">+0.95</text><text x="0.0" y="75.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4.1-mini</text><line x1="223.2" y1="73.0" x2="274.6" y2="73.0" class="ragx-stem" /><circle cx="274.6" cy="73.0" r="3.2" class="ragx-dot" /><text x="281.6" y="75.6" class="ragx-value" text-anchor="start">+2.01</text><text x="0.0" y="102.6" class="ragx-label" text-anchor="start">LongMemEval · GPT-4.1-mini</text><line x1="223.2" y1="100.0" x2="226.5" y2="100.0" class="ragx-stem" /><circle cx="226.5" cy="100.0" r="3.2" class="ragx-dot" /><text x="233.5" y="102.6" class="ragx-value" text-anchor="start">+0.13</text><text x="0.0" y="129.6" class="ragx-label" text-anchor="start">MEME · GPT-4o-mini</text><line x1="223.2" y1="127.0" x2="280.5" y2="127.0" class="ragx-stem" /><circle cx="280.5" cy="127.0" r="3.2" class="ragx-dot" /><text x="287.5" y="129.6" class="ragx-value" text-anchor="start">+2.24</text><text x="0.0" y="156.6" class="ragx-label" text-anchor="start">MEME · DeepSeek-V4-Flash</text><line x1="184.3" y1="154.0" x2="223.2" y2="154.0" class="ragx-stem" /><circle cx="184.3" cy="154.0" r="3.2" class="ragx-dot-hollow" /><text x="177.3" y="156.6" class="ragx-value" text-anchor="end">−1.52</text><text x="0.0" y="183.6" class="ragx-label" text-anchor="start">MAB · GPT-4o-mini</text><line x1="223.2" y1="181.0" x2="337.8" y2="181.0" class="ragx-stem" /><circle cx="337.8" cy="181.0" r="3.2" class="ragx-dot" /><text x="344.8" y="183.6" class="ragx-value" text-anchor="start">+4.48</text><text x="0.0" y="210.6" class="ragx-label" text-anchor="start">MAB · DeepSeek-V4-Flash</text><line x1="223.2" y1="208.0" x2="364.6" y2="208.0" class="ragx-stem" /><circle cx="364.6" cy="208.0" r="8.3" class="ragx-halo" /><circle cx="364.6" cy="208.0" r="4.8" class="ragx-dot-hero" /><text x="372.6" y="210.6" class="ragx-value-strong" text-anchor="start">+5.53</text><line x1="172" y1="232" x2="392" y2="232" class="ragx-axis-line" /><line x1="172.0" y1="232" x2="172.0" y2="237" class="ragx-tick" /><text x="172.0" y="246.0" class="ragx-axis" text-anchor="middle">−2</text><line x1="223.2" y1="232" x2="223.2" y2="237" class="ragx-tick" /><text x="223.2" y="246.0" class="ragx-axis" text-anchor="middle">0</text><line x1="274.3" y1="232" x2="274.3" y2="237" class="ragx-tick" /><text x="274.3" y="246.0" class="ragx-axis" text-anchor="middle">+2</text><line x1="325.5" y1="232" x2="325.5" y2="237" class="ragx-tick" /><text x="325.5" y="246.0" class="ragx-axis" text-anchor="middle">+4</text><line x1="376.7" y1="232" x2="376.7" y2="237" class="ragx-tick" /><text x="376.7" y="246.0" class="ragx-axis" text-anchor="middle">+6</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">← Raw-RAG behind</text><text x="392.0" y="280.0" class="ragx-note" text-anchor="end">Raw-RAG ahead →</text></svg>
    <div class="ragx-src">DOT PLOT · 7 个 BENCHMARK–MODEL 设置 · ARXIV:2610.30755</div>
  </div>
</div>

## 「Naive」在这里到底是什么意思

*Naive* 这个词承担了很多工作。Raw-RAG 对记忆管理 naive，但对检索并不 naive。它的 ingestion 管线刻意保持简单，但检索有调过：

- 把每段对话序列化，保留消息时间戳与图片 caption。
- 切成 **256-token 窗口**，重叠 **32 token**（stride 224）。
- 将窗口 embed 进一个扁平索引。不做抽取、不做摘要、不建图、不变更。
- 查询时，将问题 embed，用 cosine similarity 取出 **top 128** 个窗口。
- 用 **cross-encoder** 对每个问题–窗口配对评分，留下 **top 15**。
- 把每个选中的窗口展开回完整的来源 turn，再交给 reader。

最后一步很重要。检索单位是 256-token 窗口，但 reader 看到的不是被切断的句子或半个 turn，而是包含该窗口的完整来源 turn，加上周围的对话上下文。索引保持小且固定；reader 拿到足够的文字去解析指代与状态变化。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg> EXHIBIT // 02 · 检索预算</div>
    <div class="ragx-title">整个检索预算只有四个数字。</div>
    <p class="ragx-sub">256-token 窗口 · 32-token 重叠 · 128 个 dense 候选 · 15 个重排窗口。Turn expansion 发生在选择之后。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-d" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-d">Raw-RAG retrieval budget</title><desc>256-token windows with 32-token overlap, 128 dense candidates, 15 reranked windows.</desc><text x="24.0" y="16.0" class="ragx-label" text-anchor="start">SOURCE HISTORY</text><rect x="24" y="24" width="352" height="18" rx="3" class="ragx-src-box" /><line x1="28.0" y1="30" x2="28.0" y2="38" class="ragx-turn" /><line x1="40.3" y1="30" x2="40.3" y2="38" class="ragx-turn" /><line x1="52.6" y1="28" x2="52.6" y2="38" class="ragx-turn" /><line x1="64.9" y1="28" x2="64.9" y2="38" class="ragx-turn" /><line x1="77.2" y1="28" x2="77.2" y2="38" class="ragx-turn" /><line x1="89.5" y1="30" x2="89.5" y2="38" class="ragx-turn" /><line x1="101.8" y1="30" x2="101.8" y2="38" class="ragx-turn" /><line x1="114.1" y1="28" x2="114.1" y2="38" class="ragx-turn" /><line x1="126.4" y1="28" x2="126.4" y2="38" class="ragx-turn" /><line x1="138.7" y1="28" x2="138.7" y2="38" class="ragx-turn" /><line x1="151.0" y1="30" x2="151.0" y2="38" class="ragx-turn" /><line x1="163.3" y1="30" x2="163.3" y2="38" class="ragx-turn" /><line x1="175.6" y1="28" x2="175.6" y2="38" class="ragx-turn" /><line x1="187.9" y1="28" x2="187.9" y2="38" class="ragx-turn" /><line x1="200.2" y1="28" x2="200.2" y2="38" class="ragx-turn" /><line x1="212.5" y1="30" x2="212.5" y2="38" class="ragx-turn" /><line x1="224.8" y1="30" x2="224.8" y2="38" class="ragx-turn" /><line x1="237.1" y1="28" x2="237.1" y2="38" class="ragx-turn" /><line x1="249.4" y1="28" x2="249.4" y2="38" class="ragx-turn" /><line x1="261.7" y1="28" x2="261.7" y2="38" class="ragx-turn" /><line x1="274.0" y1="30" x2="274.0" y2="38" class="ragx-turn" /><line x1="286.3" y1="30" x2="286.3" y2="38" class="ragx-turn" /><line x1="298.6" y1="28" x2="298.6" y2="38" class="ragx-turn" /><line x1="310.9" y1="28" x2="310.9" y2="38" class="ragx-turn" /><line x1="323.2" y1="28" x2="323.2" y2="38" class="ragx-turn" /><line x1="335.5" y1="30" x2="335.5" y2="38" class="ragx-turn" /><line x1="347.8" y1="30" x2="347.8" y2="38" class="ragx-turn" /><line x1="360.1" y1="28" x2="360.1" y2="38" class="ragx-turn" /><line x1="372.4" y1="28" x2="372.4" y2="38" class="ragx-turn" /><rect x="24" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="88.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="200.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="248" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="312.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="16" height="26" class="ragx-overlap" /><rect x="248" y="50" width="16" height="26" class="ragx-overlap" /><line x1="136" y1="82" x2="152" y2="82" class="ragx-bracket" /><line x1="136" y1="79" x2="136" y2="85" class="ragx-bracket" /><line x1="152" y1="79" x2="152" y2="85" class="ragx-bracket" /><text x="144.0" y="92.0" class="ragx-axis" text-anchor="middle">32 overlap</text><path d="M200 98 V116" class="ragx-arrow" /><path d="M196 112 L200 117 L204 112" class="ragx-arrow" /><text x="210.0" y="110.0" class="ragx-note" text-anchor="start">EMBED</text><defs><pattern id="ragx-ticks" width="2.75" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" class="ragx-tickline" /></pattern></defs><rect x="24" y="122" width="352" height="10" fill="url(#ragx-ticks)" /><text x="24.0" y="148.0" class="ragx-label" text-anchor="start">TOP-128 DENSE CANDIDATES</text><text x="376.0" y="148.0" class="ragx-value-strong" text-anchor="end">128</text><path d="M200 154 V174" class="ragx-arrow" /><path d="M196 170 L200 175 L204 170" class="ragx-arrow" /><text x="210.0" y="167.0" class="ragx-note" text-anchor="start">RERANK</text><circle cx="24.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="49.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="74.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="99.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="124.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="149.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="174.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="200.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="225.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="250.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="275.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="300.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="325.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="350.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="376.0" cy="188" r="2.9" class="ragx-dot" /><text x="24.0" y="208.0" class="ragx-label" text-anchor="start">TOP-15 RERANKED WINDOWS</text><text x="376.0" y="208.0" class="ragx-value" text-anchor="end">15 × 256</text><path d="M200 216 V234" class="ragx-arrow" /><path d="M196 230 L200 235 L204 230" class="ragx-arrow" /><text x="210.0" y="228.0" class="ragx-note" text-anchor="start">READ</text><rect x="130" y="242" width="140" height="24" rx="3" class="ragx-reader" /><text x="200.0" y="258.0" class="ragx-label" text-anchor="middle">READER · FULL TURNS</text><text x="24.0" y="286.0" class="ragx-note" text-anchor="start">≈ 3,840 TOKENS BEFORE TURN EXPANSION</text></svg>
    <div class="ragx-src">PIPELINE · RAW-RAG · ARXIV:2610.30755</div>
  </div>
</div>

论文默认 256-token 窗口，但消融实验显示这个数字不是神圣的：**128 到 1,024 token** 的窗口对 MemoryAgentBench 总分没有显著影响。真正有影响的是 **reranking** 与 **适度的检索深度**。移除 cross-encoder 会掉 **3.92 分**；只返回一个项目会掉 **11.73 分**；返回 120 个项目会掉 **14.57 分**，主要发生在 long-range understanding 与 conflict resolution。

## Benchmark 地图

这篇论文的结果，只有在你知道每个 benchmark 在压力测试什么之后才有意义。评估中出现六个数据集：四个承担主要准确率主张，一个是个人化检查，一个只当 ingestion workload。

<div class="ragx-bench-grid">
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LoCoMo</div>
          <div class="ragx-bench-sub">长期对话记忆</div>
        </div>
      </div>
      <p class="ragx-bench-desc">两位说话者、跨越多个 session 的对话；问题要求单一事实、多跳整合、时间顺序与开放域推断。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>10 段对话 · 1,540 题</dd></div>
        <div><dt>METRIC</dt><dd>LLM judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 单跳回忆占多数（841/1,540）。10 段对话版本不是原始的 50 段，且 adversarial 题目被排除。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg></span>
        <div>
          <div class="ragx-bench-name">LongMemEval-S</div>
          <div class="ragx-bench-sub">聊天助理记忆</div>
        </div>
      </div>
      <p class="ragx-bench-desc">每题都附带自己的长对话历史；五种能力涵盖回忆、跨 session 推断、时间顺序、偏好与知识更新。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>500 题 · 约 115k-token 历史</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 每题都有独立历史，因此也测试记忆隔离。30 题是 abstention；S（115k）与 M（1.5M）不能互换。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MEME</div>
          <div class="ragx-bench-sub">多实体与演进记忆</div>
        </div>
      </div>
      <p class="ragx-bench-desc">受控 episode，包含多个随时间变化的实体；题目针对精确回忆、聚合、追踪、删除、cascade 与 absence。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>100 个 episode · 1,188 题 · 32k distractors</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 六任务 macro</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Cascade 与 absence 需要把上游变更沿规则传递。32k、128k 与 no-filler 是三种不同 benchmark；分数用六任务 macro-average。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg></span>
        <div>
          <div class="ragx-bench-name">MemoryAgentBench</div>
          <div class="ragx-bench-sub">增量多轮记忆</div>
        </div>
      </div>
      <p class="ragx-bench-desc">先 ingest 一次长来源，再回答横跨四种能力的多个问题：accurate retrieval、test-time learning、long-range understanding、conflict resolution。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>2,071 题 · 14 个来源 · 103K–1.44M tokens</dd></div>
        <div><dt>METRIC</dt><dd>原生指标 · 四能力 macro</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Test-time learning 与 long-range understanding 是差异点。2,071 是精选集；内嵌的 LongMemEval 来源不等于独立的 500 题版本。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span>
        <div>
          <div class="ragx-bench-name">PersonaMem-v2</div>
          <div class="ragx-bench-sub">隐式个人化</div>
        </div>
      </div>
      <p class="ragx-bench-desc">带有隐含偏好的长对话历史；模型必须推断使用者是谁，并在九种情境中选出适合他的回应。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>5,000 道选择题 · 32k 历史</dd></div>
        <div><dt>METRIC</dt><dd>MCQ exact match</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 四个选项代表 25% 的猜题基准。Raw-RAG 没有 persona profile，EverMemOS 有；这是系统级比较，不是检索骨干比较。</div>
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
      <p class="ragx-bench-desc">一段接近一百万 token 的连贯对话；论文用它测量每个系统多快能准备好服务。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>1 段对话 · 1,710 条消息 · 约 1M tokens</dd></div>
        <div><dt>METRIC</dt><dd>无——只计时</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 这不是 BEAM 准确率结果。论文只流式传输一段 1M-token 对话，不是完整的 100 段 benchmark，且不包含答案生成。</div>
    </div>
  </div>
</div>

<div class="ragx-callout">
  <svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg>
  <div><b>不要直接比较总分。</b>切片、judge 与聚合规则都不同：LoCoMo 与 LongMemEval 是 question-weighted accuracy，MEME 是六任务 macro，MemoryAgentBench 是四能力 macro，PersonaMem-v2 是 MCQ exact match。论文在能对齐的地方对齐；其余是基线论证，不是 leaderboard。</div>
</div>

<div class="ragx-src">BENCHMARK SOURCES · LoCoMo (ACL 2024) · LongMemEval (ICLR 2025) · MEME (NeurIPS 2026) · MemoryAgentBench (ICLR 2026) · PersonaMem-v2 (2025) · BEAM (ICLR 2026)</div>

## 分数不是重点

更有用的是「为什么 raw retrieval 会赢」。作者把准确率拆成两个量：

- **Coverage**：检索到的上下文中，含有足够证据回答问题的比例。
- **Utilization**：在证据足够的前提下，答对的比例。

在 MemoryAgentBench 上，各系统的 coverage 从 **19.07% 到 45.29%**，差距 26.2 个百分点；utilization 只从 **80.00% 到 89.71%**，差距 9.7 个百分点。MEME 的模式更明显：coverage 从 **35.69% 到 76.35%**（40.7 个百分点），utilization 从 **65.51% 到 86.55%**（21.0 个百分点）。

Raw-RAG 在两个 benchmark 上都有 **最高的 coverage**（45.29% 与 76.35%）。它的 utilization 不是最高（84.43% 与 73.76%）。乘起来仍然赢，因为「找到证据」是更难的问题。再强的 reader，也无法稳定补偿从来没被检索到的证据。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg> EXHIBIT // 03 · COVERAGE VS UTILIZATION</div>
    <div class="ragx-title">Coverage 的变异比 utilization 大。</div>
    <p class="ragx-sub">图中为各系统观测到的 min–max。点代表系统，横线代表范围；Raw-RAG 是 coverage 列右端最深的点。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-b" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-b">Coverage varies more than utilization</title><desc>Ranges of coverage and utilization across systems on MemoryAgentBench and MEME.</desc><text x="390.0" y="16.0" class="ragx-axis" text-anchor="end">PERCENT</text><line x1="124.0" y1="34" x2="124.0" y2="232" class="ragx-grid" /><line x1="190.5" y1="34" x2="190.5" y2="232" class="ragx-grid" /><line x1="257.0" y1="34" x2="257.0" y2="232" class="ragx-grid" /><line x1="323.5" y1="34" x2="323.5" y2="232" class="ragx-grid" /><line x1="390.0" y1="34" x2="390.0" y2="232" class="ragx-grid" /><line x1="124" y1="56" x2="390" y2="56" class="ragx-grid-h" /><line x1="124" y1="106" x2="390" y2="106" class="ragx-grid-h" /><line x1="124" y1="156" x2="390" y2="156" class="ragx-grid-h" /><line x1="124" y1="206" x2="390" y2="206" class="ragx-grid-h" /><text x="0.0" y="58.3" class="ragx-label" text-anchor="start">MAB · coverage</text><line x1="174.7" y1="56.0" x2="244.5" y2="56.0" class="ragx-range" /><line x1="174.7" y1="52.0" x2="174.7" y2="60.0" class="ragx-range-cap" /><line x1="244.5" y1="52.0" x2="244.5" y2="60.0" class="ragx-range-cap" /><text x="209.6" y="47.0" class="ragx-axis" text-anchor="middle">26.2 pp</text><circle cx="174.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="181.3" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="190.8" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="215.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="216.4" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="230.5" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="244.5" cy="53.8" r="8.3" class="ragx-halo" /><circle cx="244.5" cy="53.8" r="5.0" class="ragx-dot-hero" /><text x="255.5" y="56.2" class="ragx-value-strong" text-anchor="start">45.3</text><text x="0.0" y="108.3" class="ragx-label" text-anchor="start">MAB · utilization</text><line x1="336.8" y1="106.0" x2="362.6" y2="106.0" class="ragx-range" /><line x1="336.8" y1="102.0" x2="336.8" y2="110.0" class="ragx-range-cap" /><line x1="362.6" y1="102.0" x2="362.6" y2="110.0" class="ragx-range-cap" /><text x="349.7" y="97.0" class="ragx-axis" text-anchor="middle">9.7 pp</text><circle cx="336.8" cy="103.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.2" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.2" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="348.6" cy="103.8" r="3.4" class="ragx-dot-ink" /><circle cx="352.4" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="361.7" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="362.6" cy="103.8" r="2.9" class="ragx-dot-soft" /><text x="0.0" y="158.3" class="ragx-label" text-anchor="start">MEME · coverage</text><line x1="218.9" y1="156.0" x2="327.1" y2="156.0" class="ragx-range" /><line x1="218.9" y1="152.0" x2="218.9" y2="160.0" class="ragx-range-cap" /><line x1="327.1" y1="152.0" x2="327.1" y2="160.0" class="ragx-range-cap" /><text x="273.0" y="147.0" class="ragx-axis" text-anchor="middle">40.7 pp</text><circle cx="218.9" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="250.7" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="257.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="289.2" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="292.2" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="311.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="327.1" cy="153.8" r="3.4" class="ragx-dot-ink" /><text x="0.0" y="208.3" class="ragx-label" text-anchor="start">MEME · utilization</text><line x1="298.3" y1="206.0" x2="354.2" y2="206.0" class="ragx-range" /><line x1="298.3" y1="202.0" x2="298.3" y2="210.0" class="ragx-range-cap" /><line x1="354.2" y1="202.0" x2="354.2" y2="210.0" class="ragx-range-cap" /><text x="326.2" y="197.0" class="ragx-axis" text-anchor="middle">21.0 pp</text><circle cx="298.3" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="301.3" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="320.2" cy="208.2" r="3.4" class="ragx-dot-ink" /><circle cx="328.4" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.9" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.0" cy="208.2" r="2.9" class="ragx-dot-soft" /><circle cx="354.2" cy="203.8" r="2.9" class="ragx-dot-soft" /><line x1="124" y1="232" x2="390" y2="232" class="ragx-axis-line" /><line x1="124.0" y1="232" x2="124.0" y2="237" class="ragx-tick" /><text x="124.0" y="250.0" class="ragx-axis" text-anchor="middle">0</text><line x1="190.5" y1="232" x2="190.5" y2="237" class="ragx-tick" /><text x="190.5" y="250.0" class="ragx-axis" text-anchor="middle">25</text><line x1="257.0" y1="232" x2="257.0" y2="237" class="ragx-tick" /><text x="257.0" y="250.0" class="ragx-axis" text-anchor="middle">50</text><line x1="323.5" y1="232" x2="323.5" y2="237" class="ragx-tick" /><text x="323.5" y="250.0" class="ragx-axis" text-anchor="middle">75</text><line x1="390.0" y1="232" x2="390.0" y2="237" class="ragx-tick" /><text x="382.0" y="250.0" class="ragx-axis" text-anchor="middle">100</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">Dots = systems · bar = observed min–max</text></svg>
    <div class="ragx-src">RANGE PLOT · 7 个系统 · MEMORYAGENTBENCH + MEME</div>
  </div>
</div>

这是论文最实用的贡献。如果你的记忆系统输了，第一个问题不是「我要怎么改 reader？」而是「哪一个必要证据根本没进到 context？」Coverage 是 ingestion 与 retrieval 的问题；utilization 是 reader 的问题。两者失败的方式不同，修法也不同。

## 只有答案值不够

第二个诊断把问题切得更细。在 MEME 的 tracking 与 cascade 题上，作者区分 **result coverage**（需要的答案值是否出现）与 **path coverage**（答案值，加上推导它所需的时间顺序或依赖链，是否一起出现）。

条件路径率 **P(path | result)** 的定义是：在 result-covered 的题目中，上下文同时包含完整支持路径的比例。

| 系统 | Result coverage | Path coverage | P(path \| result) |
| :-- | --: | --: | --: |
| Raw-RAG | 90.53 | 56.44 | **62.34** |
| MemMachine | 84.85 | 48.11 | 56.70 |
| EverMemOS | 78.03 | 39.02 | 50.00 |
| EMem | 76.52 | 37.88 | 49.50 |
| Mem0 | 81.06 | 38.64 | 47.66 |
| MemOS | 88.26 | 21.21 | 24.03 |
| MemU | 59.09 | 5.68 | 9.62 |

这就是「存一个事实」与「存这个事实现在为什么成立」的差别。记忆系统可能检索到「预算是 $4,200」，却漏掉让它提高的核准、让它降低的转帐，或这些事件发生的顺序。Raw history 保留了这些关系，因为它从来没有把它们移除。

Complete-store oracle 把论点推得更远。作者让每个系统用 **gold-informed 的方式直接存取自己完整的汇出记忆**，绕过原生检索；再跟一个 raw-evidence control 比较，后者用同样的 gold 信号选出原始支持 session：

| 系统 | Native | Complete store | Raw evidence |
| :-- | --: | --: | --: |
| Raw-RAG | 39.30 | **57.54** | 61.60 |
| MemMachine | 37.06 | **57.46** | 61.60 |
| EverMemOS | 21.57 | 51.59 | 61.60 |
| EMem | 33.84 | 48.36 | 61.60 |
| MemOS | 30.24 | 45.12 | 61.60 |
| Mem0 | 27.76 | 32.26 | 61.60 |
| MemU | 19.87 | 31.07 | 61.60 |

把检索从方程式中拿掉之后，每个系统都变好。但保留原始对话内容的系统——Raw-RAG 与 MemMachine——最接近 raw-evidence 天花板。被转换过的 store 差距更大。就算能完整存取一个 store，也救不回 ingestion 阶段丢掉的信息。

作者对解读很克制：残余差距不是纯粹的信息损失量测。证据组装、排序，以及 *lost in the middle* 之类的位置效应，也可能有贡献。但方向是一致的，而且与 path 分析的结果吻合。

## 变更审计

论文也审计了 Mem0 的写入策略，这是目前最广泛使用的记忆层之一。

在 LoCoMo 上，UPDATE 与 DELETE 合计只占 33,902 次写入决策的 **4.39%**。在 LongMemEval 上，它们只占 428,858 次决策的 **2.46%**。真正造成持久文字改变的「有效变更」只有 **1.90%** 与 **1.34%**。许多提出的 update 是重复的或格式错误的。

接著作者做了一个简单干预：把 UPDATE 换成 append-only ADD，把 DELETE 换成 NONE。LoCoMo 准确率从 **67.36% 上升到 69.42%**，而且没有任何类别下降。在这个设置下，显式变更没有带来准确率好处。

这不代表在生产环境中删除不重要。它代表这些 benchmark 很少需要删除，而需要的时候，能力够强的 reader 通常可以从原始证据重建状态变化。第二个实验支持这点：在 MEME 上，reader 直接拿到查询阶段可见的证据，依时间顺序排列，完全没有检索错误。DeepSeek-V4-Flash 在 cascade 题达到 **82.32%**、invalidation 题 **91.54%**，整体 **85.48%**。GPT-4o-mini 只有 50.50%，Qwen3.5-35B-A3B 则是 70.25%。状态重建取决于 reader，但只要有足够的原始证据，它是做得到的。

## 复杂度仍然有价值的地方

这篇论文最强的时候，是被当成「基线论证」来读，而不是普世判决。两个结果让它保持诚实。

第一，**PersonaMem-v2**。Raw-RAG 得分 **49.62%**，在七个系统中排第三，落后 MemOS（50.72%）与 EverMemOS（53.25%），而且没有在任何单一情境中领先。PersonaMem 测试的是长历史中的个人化与偏好追踪；EverMemOS 使用了启用 profile 的记忆管线。当任务是「记住这个人是谁、他偏好什么」，结构化记忆有 raw retrieval 抹不掉的优势。

第二，**MEME + DeepSeek-V4-Flash**。Raw-RAG 得分 **43.19%**，MemMachine 则是 **44.71%**。更说明问题的是，同一个设置下 **Full-context 得分 63.17%**。一个能力强的 reader 拿到完整历史，远胜过一个能力强的 reader 只拿到 15 个检索窗口。这是检索失败，不是记忆管理的胜利。论文承认 reader 依赖性，也注明评估任务是离线问答，不是营运型记忆。

## 应该让 builder 停下来的消融实验

论文在 MemoryAgentBench 上的消融，是一份「听起来很聪明、分数却更差」的清单：

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg> EXHIBIT // 04 · 记忆管理消融</div>
    <div class="ragx-title">记忆管理没有为自己赚回成本。</div>
    <p class="ragx-sub">MemoryAgentBench 总分相对 48.32 基线的变化。负值代表新增操作让结果变差；只有 512/64 名义上为正。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-c" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-c">Memory-management ablations</title><desc>Change in MemoryAgentBench total when each operation is added to Raw-RAG.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="123.9" y1="32" x2="123.9" y2="236" class="ragx-grid" /><line x1="123.9" y1="27" x2="123.9" y2="34" class="ragx-tick" /><line x1="243.1" y1="32" x2="243.1" y2="236" class="ragx-grid" /><line x1="243.1" y1="27" x2="243.1" y2="34" class="ragx-tick" /><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="362.2" y1="27" x2="362.2" y2="34" class="ragx-tick" /><text x="0.0" y="46.4" class="ragx-label" text-anchor="start">− reranker</text><rect x="315.5" y="40.5" width="46.7" height="7" rx="3.5" class="ragx-bar" /><text x="309.5" y="46.4" class="ragx-value" text-anchor="end">−3.92</text><text x="0.0" y="72.4" class="ragx-label" text-anchor="start">128 / 16</text><rect x="359.4" y="66.5" width="2.9" height="7" rx="3.5" class="ragx-bar" /><text x="353.4" y="72.4" class="ragx-value" text-anchor="end">−0.24</text><text x="0.0" y="98.4" class="ragx-label" text-anchor="start">512 / 64</text><rect x="362.2" y="92.5" width="2.0" height="7" rx="3.5" class="ragx-bar-pos" /><text x="368.2" y="98.4" class="ragx-value" text-anchor="start">+0.04</text><text x="0.0" y="124.4" class="ragx-label" text-anchor="start">1024 / 128</text><rect x="358.9" y="118.5" width="3.3" height="7" rx="3.5" class="ragx-bar" /><text x="352.9" y="124.4" class="ragx-value" text-anchor="end">−0.28</text><text x="0.0" y="150.4" class="ragx-label" text-anchor="start">+ turn dedup</text><rect x="333.7" y="144.5" width="28.5" height="7" rx="3.5" class="ragx-bar" /><text x="327.7" y="150.4" class="ragx-value" text-anchor="end">−2.39</text><text x="0.0" y="176.4" class="ragx-label" text-anchor="start">+ atomic facts</text><rect x="128.4" y="170.0" width="233.8" height="8" rx="4" class="ragx-bar-hero" /><text x="140.4" y="176.5" class="ragx-value-paper" text-anchor="start">−19.62</text><text x="0.0" y="202.4" class="ragx-label" text-anchor="start">+ raw summary</text><rect x="293.0" y="196.5" width="69.2" height="7" rx="3.5" class="ragx-bar" /><text x="287.0" y="202.4" class="ragx-value" text-anchor="end">−5.81</text><text x="0.0" y="228.4" class="ragx-label" text-anchor="start">+ graph expansion</text><rect x="293.3" y="222.5" width="68.9" height="7" rx="3.5" class="ragx-bar" /><text x="287.3" y="228.4" class="ragx-value" text-anchor="end">−5.78</text><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="112" y1="244" x2="392" y2="244" class="ragx-axis-line" /><line x1="123.9" y1="244" x2="123.9" y2="249" class="ragx-tick" /><text x="123.9" y="260.0" class="ragx-axis" text-anchor="middle">−20</text><line x1="243.1" y1="244" x2="243.1" y2="249" class="ragx-tick" /><text x="243.1" y="260.0" class="ragx-axis" text-anchor="middle">−10</text><line x1="362.2" y1="244" x2="362.2" y2="249" class="ragx-tick" /><text x="362.2" y="260.0" class="ragx-axis" text-anchor="middle">0</text><text x="0.0" y="284.0" class="ragx-note" text-anchor="start">Δ vs Raw-RAG 48.32 · negative = worse</text></svg>
    <div class="ragx-src">BAR CHART · 14 个来源 · MEMORYAGENTBENCH</div>
  </div>
</div>

- **Atomic-fact extraction**：**−19.62 分**。Test-time learning 从 47.68% 掉到 15.37%。
- **Raw summary augmentation**：**−5.81 分**，主要在 conflict resolution。
- **Graph-expanded retrieval**：**−5.78 分**。
- **Display-turn deduplication**：**−2.39 分**。
- **移除 reranker**：**−3.92 分**。

Atomic-fact 的崩跌最有启发性。MemoryAgentBench 的 test-time-learning 分割包含 few-shot 分类与推荐。可用的 demonstration 不只是事实，而是可辨识的输入–标签配对，加上边界与格式。抽取事实可能保留了内容，却摧毁了 demonstration。论文很小心，没有把整个跌幅都归因于事实流失：证据量、结构、reader–格式不匹配都一起变动。但实务警讯很清楚：**压缩不是免费的，就算事实都还在。**

## 成本

效率数字不是接近，而是差一个数量级。在 10 个 episode、110 题的 MEME 切片上，使用一个外部 worker 与各系统原生的内部平行度：

| 系统 | Add → ready（秒） | Search（秒） | Total（秒） |
| :-- | --: | --: | --: |
| Raw-RAG | 50.32 | 255.59 | **305.91** |
| EMem | 1,082.37 | 479.59 | 1,561.97 |
| MemOS | 2,591.59 | 177.97 | 2,769.56 |
| MemMachine | 3,104.35 | 411.39 | 3,515.74 |
| Mem0 | 4,025.23 | 117.72 | 4,142.95 |
| EverMemOS | 8,217.69 | 1,083.79 | 9,301.48 |

Raw-RAG 比次快系统快 **5.1×**，比 EverMemOS 快 **30.4×**。在一个接近一百万 token、1,710 则消息的 BEAM-1M 对话上，累计 ingestion 时间是 **0.33 小时**；下一个完成的系统 MemOS 要 **3.25 小时**，Memora 则要 **26.95 小时**。消融中的三个记忆管理加法需要 **2,160 万到 1.093 亿个 LLM token**、**2.9 到 8.8 小时**的 add-plus-search，而 Raw-RAG 大约 **12 分钟**。

这不代表复杂系统没有用。它代表复杂系统的举证责任更高。如果一个记忆层的 ingestion 成本高了两个数量级，却没有在目标 workload 上提升准确率，那它不是记忆层，只是一个很贵的索引。

## 完整的切块规格

这是最值得抄进设计文件的部分。Raw-RAG 的默认值是：

| 参数 | 值 | 为什么重要 |
| :-- | :-- | :-- |
| 窗口 tokenizer | GPT-4 tokenizer | 256-token 窗口是在 ingestion 时量测的。 |
| 窗口大小 | **256 tokens** | 小到能检索特定交换；大到能保留局部语意。 |
| Stride | **224 tokens** | 256 − 32。 |
| 重叠 | **32 tokens** | 避免实体或关系在边界被切断。 |
| Dense 候选 | **128** | Rerank 前的 recall；昂贵的模型只看 128 个配对。 |
| 重排窗口 | **15** | Reader 预算。Final-k 从 5 到 60 都在 1.3 分内；120 会掉 14.57 分。 |
| Reranker | Cross-encoder | 移除它在 MemoryAgentBench 上掉 3.92 分。 |
| Turn expansion | **开启** | 选中的窗口会展开成完整来源 turn。 |
| 去重 | 默认**关闭** | 在测试设置中开启会掉 2.39 分。 |
| Query | 原始问题 | 不做 query rewriting，也不学检索策略。 |
| Index | 扁平、ingestion 后固定 | 不变更、不整合、不更新图。 |

读者实际拿到的证据长度，和窗口大小一样重要。经过 turn expansion 与格式化之后，平均证据长度是：

| Benchmark | 平均 tokens | 中位数 | P95 | 最大 | 超过 5,000 |
| :-- | --: | --: | --: | --: | --: |
| MemoryAgentBench | 3,915.8 | 4,173.0 | 4,209.5 | 4,262 | 0 |
| LoCoMo | 4,778.8 | 4,778.0 | 4,966.1 | 5,177 | 41 |
| LongMemEval | 11,355.6 | 11,248.5 | 13,915.3 | 27,375 | 500 |
| MEME | 11,986.1 | 10,186.0 | 21,329.6 | 42,490 | 1,188 |

5,000-token 控制组是一个有用的 sanity check。Raw-RAG 在 MemoryAgentBench 上从未超过 5,000 token，分数维持 **48.32%**；同一个上限下，控制组中最强的基线是 **44.74%**。在 LoCoMo 与 LongMemEval 上，关掉 turn expansion 以塞进 5,000 token 反而让分数略升（+0.35 与 +1.67）；在 MEME 上则降 1.09。预算有影响，但更大的影响仍然是「有没有检索到正确的证据」。

### 这篇文章的切块

我用同一个 tokenizer 跑过本文正文。下表不含 frontmatter、图表 SVG 与这张表本身。它是一个实际例子，说明一篇散文文章落在 256/32 索引上会长什么样子：

| 章节 | 约略 tokens | 256/32 窗口数 | 建议 reader 单位 |
| :-- | --: | --: | :-- |
| 开头 + 论点 | 348 | 2 | 1 个窗口 |
| 「Naive」的意思 | 429 | 2 | 2 个窗口 |
| Benchmark 地图 | 802 | 4 | 3–4 个窗口 |
| 为什么 coverage 会赢 | 383 | 2 | 2 个窗口 |
| 路径与 complete store | 681 | 3 | 2–3 个窗口 |
| 变更审计 | 351 | 2 | 1–2 个窗口 |
| 复杂度仍有价值的地方 | 271 | 2 | 1–2 个窗口 |
| 消融实验 | 309 | 2 | 1–2 个窗口 |
| 成本 | 405 | 2 | 1 个窗口 |
| 切块规格 | 639 | 3 | 2–3 个窗口 |
| 保留意见 + 检查清单 | 631 | 3 | 2–3 个窗口 |
| **正文合计** | **5,249** | **27** | **Top-15 = 展开前 3,840 tokens** |

两个实务提醒：

1. **不要切开表格、程式码区块或图表卡。** 256-token 窗口会切穿 Markdown 表格或 SVG。散文用 heading-aware 边界与 10–15% 重叠；对话用论文的 256/32。
2. **索引预算不等于 reader 预算。** 索引可以保留每一个 256-token 窗口；reader 只该看到一小组重排后的窗口。Raw-RAG 的 15 窗口默认值大约是展开前 3,840 token——这也解释了为什么实际证据长度是 3.9k 到 12k token，而不是 15 × 256。

## 我会怎么做

<ul class="ragx-checklist">
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg></span><div><b>先建基线，再加记忆层。</b> 扁平索引、256-token 窗口、32-token 重叠、top-128 dense 候选、cross-encoder top-15、turn expansion。先在你的 workload 上量它，再考虑加任何东西。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span><div><b>分开量 coverage 与 utilization。</b> 单一准确率会掩盖你到底是找不到证据，还是找到了却不会用。抽样标注 sufficiency；诊断不同，修法就不同。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-route"></use></svg></span><div><b>保留 provenance 与路径。</b> 存原始 turn、时间戳，以及让它变成目前状态的事件连结。没有依赖链的事实是一个陷阱。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg></span><div><b>让每个记忆操作通过同预算测试。</b> 同样的 reader、同样的证据预算、同样的 judge。如果 atomic facts、summary 或 graph expansion 赢不了 raw baseline，就不要上线。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span><div><b>用你真正要部署的 reader 测试。</b> MEME oracle 显示，同一份证据在不同 reader 之间有 35 分的差距。对弱 reader 有帮助的记忆设计，对强 reader 可能完全不必要——反之亦然。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-shield-check"></use></svg></span><div><b>不要把 benchmark 准确率当成营运型记忆。</b> 删除、权威状态、可审计性、隐私，都是这篇论文没有测试的真实需求。如果你删不掉，raw history 也是负债。</div></li>
</ul>

## 保留意见

结果很强，但不是普世定律。

- **比较混合了已发表分数。** 不同 baseline 论文的 reader、prompt、judge、证据预算都不同。作者在能对齐的地方做了对齐评估，但主表仍然混合了已发表数字与新跑的结果。LongMemEval 的 0.13 分胜利不是有意义的差距。
- **任务是离线对话问答。** 论文没有测试互动式 agent、工具使用、多模态记忆，或法规约束下的删除。
- **Coverage 标签来自 LLM judge**（MemoryAgentBench），而 utilization 是条件在各系统自己的 sufficient set 上。Reader 比较并不是完全受控。
- **MEME 的绝对分数偏低。** Raw-RAG 用 GPT-4o-mini 只有 39.30%，用 DeepSeek 只有 43.19%；Full-context + DeepSeek 则达到 63.17%。检索仍然把证据留在桌上。
- **PersonaMem 是一个真实的反例。** 当任务是个人化而不是事实回忆，profile-based memory 会赢。诚实的结论不是「agentic memory 已死」，而是「agentic memory 必须赢过一个强大的 raw baseline」。

论文标题问的是：复杂的 agentic memory 是否总是必要？它支持的答案是：**不——而且这个领域应该停止假设它必要。** 这个基线简单、便宜、而且很难打败。这正是基线存在的意义。

## 参考资料

- *Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought.* arXiv:2610.30755, 2026. <https://arxiv.org/abs/2610.30755>
- 论文使用的 benchmark 包括 LoCoMo、LongMemEval、MEME、MemoryAgentBench 与 PersonaMem-v2；完整的 baseline 设置与附录请见预印本。
- 图标：Lucide（ISC），通过 Iconify API 获取。

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
