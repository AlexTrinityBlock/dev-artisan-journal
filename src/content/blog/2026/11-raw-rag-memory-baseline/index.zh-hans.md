---
title: "原始历史就是记忆系统：Naive RAG 基线揭露了什么"
description: "细读 arXiv:2610.30755：Raw-RAG 这个刻意简单的基线，不做摘要、不建图谱、不改写记忆，只把原始对话切成 256 token 的窗口，先检索 128 段，再重排成 15 段。它在七个评测设置中赢过其他记忆系统六次——每个设置是一个 benchmark 搭配一个 reader model。"
pubDate: 2026-11-11
category: "AI"
tags: ["RAG", "Memory", "LLM", "论文笔记", "Retrieval"]
featured: false
author: "Alex.Hsiao"
readTime: "22 min read"
---

# 原始历史就是记忆系统：Naive RAG 基线揭露了什么

<svg class="ragx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="ragx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="ragx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="ragx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="ragx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="ragx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="ragx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="ragx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="ragx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="ragx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="ragx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="ragx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="ragx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="ragx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="ragx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="ragx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="ragx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="ragx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="ragx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="ragx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="ragx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="ragx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="ragx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="ragx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="ragx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="ragx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="ragx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="ragx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="ragx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="ragx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="ragx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol></defs></svg>

每个 **AI 记忆系统**最后都会多出一层：抽取、整合、图构建、变更、衰减、反思。原因很简单——对话很长、模型的 context window 有限，模型不该每次回答都重读全部。每一层都试着把历史摘要、整理或更新，让模型更好用；但每一层也多了地方，让证据可能遗失、被扭曲、或被搬到够不到的地方。

2026 年的一篇**预印本**（preprint，送审前先公开的论文）直接把这个不舒服的问题问出来：**这些复杂度，对长期对话理解真的是必要的吗？** 在评测里，**baseline（基线）** 是那个刻意保持简单的对照系统：所有更复杂的方法都必须先赢过它。少了这个固定对照，就无法分辨进步是来自记忆层、更强的回答模型，还是刚好猜对的 prompt。作者建立的 *Raw-RAG* 就是这个对照。

**RAG** 是 **retrieval-augmented generation（检索增强生成）**：不只靠模型记住的内容，而是先检索一座文本库，把相关片段贴进 prompt。**Agentic memory** 则是相反的做法：由 LLM 自己决定要抽取、摘要、更新或删除什么，而不是只存原始文本。*Raw-RAG* 完全不做 LLM 式的记忆管理——没有模型会写摘要、抽事实、建图或改写记忆库；历史原封不动存着。检索仍然使用神经模型（用 embedding 找候选，用 cross-encoder 重排），所以「naive」说的是**记忆策略**，不是检索机制。

它索引原始历史、取出 dense 候选、重新排序，再把选中的窗口交给**回答模型（reader）**——也就是读取检索结果、负责写出答案的模型；它不是人类读者，也不是检索系统。检索系统决定 reader 看到哪些证据，reader 决定怎么用这些证据。在 LoCoMo、LongMemEval、MEME 与 MemoryAgentBench 上，它在 **七个「benchmark × 回答模型」设置中拿下六个第一**，在每个设置中赢过最强的竞争记忆系统 **0.13 到 5.53 个百分点**。

这篇论文不是说记忆研究没有意义。它说的是一个更窄、也更有用的结论：**一个做得好的原始历史检索基线，强到每一个新增的记忆操作都必须证明自己的贡献。**

这里先把比较对象说清楚，因为「七个拿六个」很容易误读。论文在四个 benchmark 上比较记忆系统，每个 benchmark 搭配一到两个回答模型：**LoCoMo** 配 GPT-4o-mini 与 GPT-4.1-mini；**LongMemEval** 配 GPT-4.1-mini；**MEME** 配 GPT-4o-mini 与 DeepSeek-V4-Flash；**MemoryAgentBench** 配 GPT-4o-mini 与 DeepSeek-V4-Flash。这是**七个「benchmark × 模型」组合**，不是七个 benchmark。每个组合里的「最强对手」，指的是**该组合中最好的竞争记忆系统**，不是同一个固定对手。Raw-RAG 赢了六个；唯一输掉的是 MEME 配 DeepSeek-V4-Flash，MemMachine 领先 1.52 个百分点。

有两件事不在这个计数里。**Full-context** 不是记忆系统，而是一个诊断用的上限：跳过检索，把整段对话直接贴进模型的 context（后面会再解释）。**PersonaMem-v2** 则是独立的个性化检查，Raw-RAG 在该项排第三。整篇论文共出现六个数据集；「七个拿六个」只算前四个主要准确率 benchmark。另外，主要比较表最多包含 **13 个记忆系统**——Raw-RAG、MemMachine、EverMemOS、EMem、Mem0、MemOS、MemU、Memora、SimpleMem、Nemori、RecMem、A-MEM 与 MemoryOS——实际数量依 benchmark 而异；PersonaMem 那张表则比较七个。

本文所有差距都是**百分点**：从 45% 到 46% 是 +1 个百分点。0.13 个百分点几乎是平手；5 个百分点就是明显差距。

<p class="ragx-paper-link"><span>原始论文</span> <a href="https://arxiv.org/abs/2610.30755" target="_blank" rel="noopener noreferrer">arXiv:2610.30755 ↗</a></p>

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01 · 主要结果</div>
    <div class="ragx-title">Raw-RAG 在七个设置中赢了六个。</div>
    <p class="ragx-sub">对比该设置中最强竞争记忆系统的差距，单位为百分点。唯一输掉的是 MEME + DeepSeek-V4-Flash。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-a" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-a">Raw-RAG delta versus the strongest agentic memory system</title><desc>Dot plot of seven benchmark-model settings. Raw-RAG wins six and loses one.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="172.0" y1="28" x2="172.0" y2="232" class="ragx-grid" /><line x1="172.0" y1="23" x2="172.0" y2="30" class="ragx-tick" /><line x1="223.2" y1="28" x2="223.2" y2="232" class="ragx-zero" /><line x1="223.2" y1="23" x2="223.2" y2="30" class="ragx-tick" /><line x1="274.3" y1="28" x2="274.3" y2="232" class="ragx-grid" /><line x1="274.3" y1="23" x2="274.3" y2="30" class="ragx-tick" /><line x1="325.5" y1="28" x2="325.5" y2="232" class="ragx-grid" /><line x1="325.5" y1="23" x2="325.5" y2="30" class="ragx-tick" /><line x1="376.7" y1="28" x2="376.7" y2="232" class="ragx-grid" /><line x1="376.7" y1="23" x2="376.7" y2="30" class="ragx-tick" /><text x="0.0" y="48.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4o-mini</text><line x1="223.2" y1="46.0" x2="247.5" y2="46.0" class="ragx-stem" /><circle cx="247.5" cy="46.0" r="3.2" class="ragx-dot" /><text x="254.5" y="48.6" class="ragx-value" text-anchor="start">+0.95</text><text x="0.0" y="75.6" class="ragx-label" text-anchor="start">LoCoMo · GPT-4.1-mini</text><line x1="223.2" y1="73.0" x2="274.6" y2="73.0" class="ragx-stem" /><circle cx="274.6" cy="73.0" r="3.2" class="ragx-dot" /><text x="281.6" y="75.6" class="ragx-value" text-anchor="start">+2.01</text><text x="0.0" y="102.6" class="ragx-label" text-anchor="start">LongMemEval · GPT-4.1-mini</text><line x1="223.2" y1="100.0" x2="226.5" y2="100.0" class="ragx-stem" /><circle cx="226.5" cy="100.0" r="3.2" class="ragx-dot" /><text x="233.5" y="102.6" class="ragx-value" text-anchor="start">+0.13</text><text x="0.0" y="129.6" class="ragx-label" text-anchor="start">MEME · GPT-4o-mini</text><line x1="223.2" y1="127.0" x2="280.5" y2="127.0" class="ragx-stem" /><circle cx="280.5" cy="127.0" r="3.2" class="ragx-dot" /><text x="287.5" y="129.6" class="ragx-value" text-anchor="start">+2.24</text><text x="0.0" y="156.6" class="ragx-label" text-anchor="start">MEME · DeepSeek-V4-Flash</text><line x1="184.3" y1="154.0" x2="223.2" y2="154.0" class="ragx-stem" /><circle cx="184.3" cy="154.0" r="3.2" class="ragx-dot-hollow" /><text x="177.3" y="156.6" class="ragx-value" text-anchor="end">−1.52</text><text x="0.0" y="183.6" class="ragx-label" text-anchor="start">MAB · GPT-4o-mini</text><line x1="223.2" y1="181.0" x2="337.8" y2="181.0" class="ragx-stem" /><circle cx="337.8" cy="181.0" r="3.2" class="ragx-dot" /><text x="344.8" y="183.6" class="ragx-value" text-anchor="start">+4.48</text><text x="0.0" y="210.6" class="ragx-label" text-anchor="start">MAB · DeepSeek-V4-Flash</text><line x1="223.2" y1="208.0" x2="364.6" y2="208.0" class="ragx-stem" /><circle cx="364.6" cy="208.0" r="8.3" class="ragx-halo" /><circle cx="364.6" cy="208.0" r="4.8" class="ragx-dot-hero" /><text x="372.6" y="210.6" class="ragx-value-strong" text-anchor="start">+5.53</text><line x1="172" y1="232" x2="392" y2="232" class="ragx-axis-line" /><line x1="172.0" y1="232" x2="172.0" y2="237" class="ragx-tick" /><text x="172.0" y="246.0" class="ragx-axis" text-anchor="middle">−2</text><line x1="223.2" y1="232" x2="223.2" y2="237" class="ragx-tick" /><text x="223.2" y="246.0" class="ragx-axis" text-anchor="middle">0</text><line x1="274.3" y1="232" x2="274.3" y2="237" class="ragx-tick" /><text x="274.3" y="246.0" class="ragx-axis" text-anchor="middle">+2</text><line x1="325.5" y1="232" x2="325.5" y2="237" class="ragx-tick" /><text x="325.5" y="246.0" class="ragx-axis" text-anchor="middle">+4</text><line x1="376.7" y1="232" x2="376.7" y2="237" class="ragx-tick" /><text x="376.7" y="246.0" class="ragx-axis" text-anchor="middle">+6</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">← Raw-RAG behind</text><text x="392.0" y="280.0" class="ragx-note" text-anchor="end">Raw-RAG ahead →</text></svg>
    <div class="ragx-src">DOT PLOT · 7 个 BENCHMARK–MODEL 设置 · ARXIV:2610.30755</div>
  </div>
</div>

<div class="chamfer-card-wrapper mx-card">
    <div class="chamfer-card-content">
      <div class="card-tag">EXHIBIT // 01B · ALL SYSTEMS</div>
      <div class="mx-title">六比一背后的完整战场</div>
      <p class="mx-sub">每个设置一组，列出所有被比较的记忆系统。长条是 <span class="mx-nowrap">0–100</span> 的总分；深色行是 Raw-RAG，圆环标记该设置的最高分。</p>
      <div class="mx-legend">
        <span class="lg-raw">Raw-RAG</span>
        <span class="lg-best">该设置最高分</span>
        <span class="lg-scale">长条＝分数（<span class="mx-nowrap">0–100</span>）</span>
      </div>
      <div class="mx-grid">
      <section class="mx-panel" aria-labelledby="mx-set-1">
        <div class="mx-panel-head">
          <div class="mx-setting" id="mx-set-1" role="heading" aria-level="3">LoCoMo · GPT-4o-mini</div>
          <span class="mx-count">13 个系统</span>
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
          <span class="mx-count">13 个系统</span>
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
          <span class="mx-count">13 个系统</span>
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
          <span class="mx-count">8 个系统</span>
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
          <span class="mx-count">8 个系统</span>
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
          <span class="mx-count">8 个系统</span>
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
          <span class="mx-count">8 个系统</span>
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
        <div class="mx-panel mx-method" role="note" aria-label="方法说明">
          <div class="mx-method-kicker">方法说明</div>
          <p class="mx-method-body">Full-context 不列入：它是无检索的天花板，不是记忆系统。所有面板共用 <span class="mx-nowrap">0–100</span> 尺度；同分按字母排序。</p>
        </div>
      </div>
      <div class="mx-src">系统 × 设置矩阵 · FULL-CONTEXT 已排除 · 13 个记忆系统 · ARXIV:2610.30755</div>
    </div>
  </div>


<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg><span>章节 01</span></div>

## 「Naive」在这里到底是什么意思

*Naive* 这个词在这里容易误导。Raw-RAG 对**记忆管理** naive，但对**检索**并不 naive。它的 **ingestion（数据导入）**——把对话变成可检索内容的那一步——刻意保持简单：

- 把每段对话变成一个长文本文件，保留消息时间戳与图片 caption。
- 把这段文本切成 **256-token 窗口**，重叠 **32 token**（stride 224，步长）。
- 把窗口放进**一份简单的可检索列表**——扁平索引。没有层级、没有抽取、没有摘要、没有图。
- 查询时，把问题 embed，用 cosine similarity 取出 **top 128** 个窗口。
- 用 **cross-encoder** 对每个问题–窗口配对评分，留下 **top 15**。
- 把每个选中的窗口展开回完整的来源 turn，再交给 reader。

这就是完整的 ingestion：把对话变成可检索的文本，只做一次，之后不再改写。**Turn（一轮发言）** 是对话里的一条消息：一条用户消息，或一条助手回复。检索单位是 256-token 窗口，但 reader 看到的不是被切断的句子或半个 turn，而是窗口重叠到的**完整一轮（或多轮）发言**，加上理解代词与状态更新所需的相邻 turn。索引保持小且固定；reader 拿到足够的文字去解析指代与状态变化。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-workflow"></use></svg> EXHIBIT // 02 · 检索预算</div>
    <div class="ragx-title">整个检索预算只有四个数字。</div>
    <p class="ragx-sub">256-token 窗口 · 32-token 重叠 · 128 个 dense 候选 · 15 个重排窗口。Turn expansion 发生在选择之后。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-d" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-d">Raw-RAG retrieval budget</title><desc>256-token windows with 32-token overlap, 128 dense candidates, 15 reranked windows.</desc><text x="24.0" y="16.0" class="ragx-label" text-anchor="start">SOURCE HISTORY</text><rect x="24" y="24" width="352" height="18" rx="3" class="ragx-src-box" /><line x1="28.0" y1="30" x2="28.0" y2="38" class="ragx-turn" /><line x1="40.3" y1="30" x2="40.3" y2="38" class="ragx-turn" /><line x1="52.6" y1="28" x2="52.6" y2="38" class="ragx-turn" /><line x1="64.9" y1="28" x2="64.9" y2="38" class="ragx-turn" /><line x1="77.2" y1="28" x2="77.2" y2="38" class="ragx-turn" /><line x1="89.5" y1="30" x2="89.5" y2="38" class="ragx-turn" /><line x1="101.8" y1="30" x2="101.8" y2="38" class="ragx-turn" /><line x1="114.1" y1="28" x2="114.1" y2="38" class="ragx-turn" /><line x1="126.4" y1="28" x2="126.4" y2="38" class="ragx-turn" /><line x1="138.7" y1="28" x2="138.7" y2="38" class="ragx-turn" /><line x1="151.0" y1="30" x2="151.0" y2="38" class="ragx-turn" /><line x1="163.3" y1="30" x2="163.3" y2="38" class="ragx-turn" /><line x1="175.6" y1="28" x2="175.6" y2="38" class="ragx-turn" /><line x1="187.9" y1="28" x2="187.9" y2="38" class="ragx-turn" /><line x1="200.2" y1="28" x2="200.2" y2="38" class="ragx-turn" /><line x1="212.5" y1="30" x2="212.5" y2="38" class="ragx-turn" /><line x1="224.8" y1="30" x2="224.8" y2="38" class="ragx-turn" /><line x1="237.1" y1="28" x2="237.1" y2="38" class="ragx-turn" /><line x1="249.4" y1="28" x2="249.4" y2="38" class="ragx-turn" /><line x1="261.7" y1="28" x2="261.7" y2="38" class="ragx-turn" /><line x1="274.0" y1="30" x2="274.0" y2="38" class="ragx-turn" /><line x1="286.3" y1="30" x2="286.3" y2="38" class="ragx-turn" /><line x1="298.6" y1="28" x2="298.6" y2="38" class="ragx-turn" /><line x1="310.9" y1="28" x2="310.9" y2="38" class="ragx-turn" /><line x1="323.2" y1="28" x2="323.2" y2="38" class="ragx-turn" /><line x1="335.5" y1="30" x2="335.5" y2="38" class="ragx-turn" /><line x1="347.8" y1="30" x2="347.8" y2="38" class="ragx-turn" /><line x1="360.1" y1="28" x2="360.1" y2="38" class="ragx-turn" /><line x1="372.4" y1="28" x2="372.4" y2="38" class="ragx-turn" /><rect x="24" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="88.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="200.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="248" y="50" width="128" height="26" rx="3" class="ragx-win" /><text x="312.0" y="66.0" class="ragx-note" text-anchor="middle">256 tok</text><rect x="136" y="50" width="16" height="26" class="ragx-overlap" /><rect x="248" y="50" width="16" height="26" class="ragx-overlap" /><line x1="136" y1="82" x2="152" y2="82" class="ragx-bracket" /><line x1="136" y1="79" x2="136" y2="85" class="ragx-bracket" /><line x1="152" y1="79" x2="152" y2="85" class="ragx-bracket" /><text x="144.0" y="92.0" class="ragx-axis" text-anchor="middle">32 overlap</text><path d="M200 98 V116" class="ragx-arrow" /><path d="M196 112 L200 117 L204 112" class="ragx-arrow" /><text x="210.0" y="110.0" class="ragx-note" text-anchor="start">EMBED</text><defs><pattern id="ragx-ticks" width="2.75" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" class="ragx-tickline" /></pattern></defs><rect x="24" y="122" width="352" height="10" fill="url(#ragx-ticks)" /><text x="24.0" y="148.0" class="ragx-label" text-anchor="start">TOP-128 DENSE CANDIDATES</text><text x="376.0" y="148.0" class="ragx-value-strong" text-anchor="end">128</text><path d="M200 154 V174" class="ragx-arrow" /><path d="M196 170 L200 175 L204 170" class="ragx-arrow" /><text x="210.0" y="167.0" class="ragx-note" text-anchor="start">RERANK</text><circle cx="24.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="49.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="74.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="99.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="124.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="149.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="174.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="200.0" cy="188" r="2.9" class="ragx-dot" /><circle cx="225.1" cy="188" r="2.9" class="ragx-dot" /><circle cx="250.3" cy="188" r="2.9" class="ragx-dot" /><circle cx="275.4" cy="188" r="2.9" class="ragx-dot" /><circle cx="300.6" cy="188" r="2.9" class="ragx-dot" /><circle cx="325.7" cy="188" r="2.9" class="ragx-dot" /><circle cx="350.9" cy="188" r="2.9" class="ragx-dot" /><circle cx="376.0" cy="188" r="2.9" class="ragx-dot" /><text x="24.0" y="208.0" class="ragx-label" text-anchor="start">TOP-15 RERANKED WINDOWS</text><text x="376.0" y="208.0" class="ragx-value" text-anchor="end">15 × 256</text><path d="M200 216 V234" class="ragx-arrow" /><path d="M196 230 L200 235 L204 230" class="ragx-arrow" /><text x="210.0" y="228.0" class="ragx-note" text-anchor="start">READ</text><rect x="130" y="242" width="140" height="24" rx="3" class="ragx-reader" /><text x="200.0" y="258.0" class="ragx-label" text-anchor="middle">READER · FULL TURNS</text><text x="24.0" y="286.0" class="ragx-note" text-anchor="start">≈ 3,840 TOKENS BEFORE TURN EXPANSION</text></svg>
    <div class="ragx-src">PIPELINE · RAW-RAG · ARXIV:2610.30755</div>
  </div>
</div>

### 用生活语言看这条管线

上面的图很精确，但对没接触过 RAG 的人并不友善。把同样的流程换成日常情境：

<div class="ragx-glossary">
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">256-token 窗口</div>
      <p class="ragx-gloss-copy">一段长对话像一条吐司。窗口就是其中一片：小到可以拿起来，大到仍装得下一个完整意思。32 token 的重叠，等于相邻两片故意共用一点边；名字或日期不会刚好被切断。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Embedding（嵌入）</div>
      <p class="ragx-gloss-copy">替「意思」钉 GPS。每个窗口得到一组坐标，意思相近的段落会落在附近；所以「退款」找得到「把钱退回来」，即使字面完全不同。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scan-search"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Dense 候选（128 段）</div>
      <p class="ragx-gloss-copy">第一张大网。系统先用意义坐标捞出 128 段看起来相关的窗口。这步便宜又宽松：正确答案很可能在里面，但同时夹着噪声。少了这一层，重排器就没有东西可以挑。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reranker／cross-encoder（重排器）</div>
      <p class="ragx-gloss-copy">复试。Cross-encoder 把「问题」和「候选段落」放在一起逐字读，所以抓得到否定词、专有名词、日期与先后顺序。它太贵，不能读完整座数据库；只读 128 对刚好。少了它，只是字面重叠的窗口，可能排赢真正回答问题的那一段。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-messages-square"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Turn expansion（回合展开）</div>
      <p class="ragx-gloss-copy">点开「显示完整消息」。检索单位是 256-token 的切片，但 reader 拿到的是切片所在的完整发言：谁说的、什么时候说的、「它」指的是什么。少了它，代词进到 reader 眼前时，可能已经没有可以指的东西。</p>
    </div>
  </div>
  <div class="ragx-gloss">
    <span class="ragx-gloss-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-brain"></use></svg></span>
    <div>
      <div class="ragx-gloss-term">Reader（回答模型，top-15）</div>
      <p class="ragx-gloss-copy">真正负责回答的模型。回答模型看不到索引，也看不到 128 个候选，只看到重排后留下的 15 段完整发言。索引再好，也救不回一个读错证据的回答模型。</p>
    </div>
  </div>
</div>

论文默认 256-token 窗口，但消融实验显示这个数字不是神圣的：**128 到 1,024 token** 的窗口对 MemoryAgentBench 总分没有显著影响。真正有影响的是 **reranking** 与 **适度的检索深度**。移除 cross-encoder 会掉 **3.92 个百分点**；只返回一个项目会掉 **11.73 个百分点**；返回 120 个项目会掉 **14.57 个百分点**，主要发生在 long-range understanding 与 conflict resolution。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-clipboard-list"></use></svg><span>章节 02</span></div>

## Benchmark 地图

这篇论文的结果，只有在你知道每个 benchmark 想测什么之后才有意义。以下用日常例子说明每一个。

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
      <p class="ragx-bench-desc">两个人在多个 session 里对话，可能隔了几天或几周。题目会问单一事实（「Ana 的妹妹叫什么名字？」）、把两个事实接起来、事件先后顺序，或超出字面内容的推论。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>10 段对话 · 1,540 题</dd></div>
        <div><dt>METRIC</dt><dd>LLM judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 多数题目（1,540 题中的 841 题）只需要一个事实，所以简单检索器也能表现不错。这是原始 50 段对话中的 10 段子集，分数不能直接跟使用完整版本的论文相比；用来抓捷径的陷阱题也被移除了。</div>
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
      <p class="ragx-bench-desc">每一题都附带自己的长对话历史——像开一张新的客服单，里面有几个月往来记录。五种能力：回忆事实、跨 session 连接事实、排出事件顺序、记住偏好、采用更新后的版本。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>500 题 · 约 115k-token 历史</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 3 次投票</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 每题都有独立历史，所以系统不能把上一题的答案带过来——这就是记忆隔离。其中 30 题是 abstention（无答案）题：历史里根本没有答案，正确回应是「没有提到」，不是硬猜。S 是约 115k token 的版本，M 是约 1.5M token 的版本；两者不能互换，因为 1.5M 的检索难得多。</div>
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
      <p class="ragx-bench-desc">事先写好的场景，里面有多个人、项目或账户，数值会随时间改变。六种题型：精确回忆（「当时的值是多少？」）、聚合（「现在有几个是启用的？」）、追踪（「现在的值是什么？」）、删除、cascade（预算调高，批准上限也跟着提高）、absence（「没有这个值——回答 none」）。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>100 个 episode · 1,188 题 · 32k-token 填充文本</dd></div>
        <div><dt>METRIC</dt><dd>GPT-4o judge · 六任务 macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Cascade 题要你把规则套用到上游变更；absence 题则根本没有值。32k／128k／no-filler 三种版本差在混入多少无关的填充文本——32k 与 128k 是填充文本的 token 预算，不是干扰项的数量——所以不要跨版本比较分数。最后分数是六种题型等权平均（macro-average）。</div>
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
      <p class="ragx-bench-desc">先把一份长来源读一遍，再回答许多关于它的问题。四种能力：准确检索（找到某个事实）、test-time learning（从来源中的范例学会规则，当场套用到新题目）、long-range understanding（把相隔很远的信息接起来）、conflict resolution（两处信息矛盾时，选较新或较可信的那个）。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>2,071 题 · 14 个来源 · 103K–1.44M tokens</dd></div>
        <div><dt>METRIC</dt><dd>原生指标 · 四能力 macro-average</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> Test-time learning 与 long-range understanding 是主要差异点。2,071 题的标题数字是精选集：它由 14 个来源组成，不是单一官方测试集。它内嵌的 LongMemEval 部分不等于独立的 500 题版本，两边数字不要直接比。</div>
    </div>
  </div>
  <div class="chamfer-card-wrapper ragx-bench">
    <div class="chamfer-card-content ragx-bench-inner">
      <div class="ragx-bench-top">
        <span class="ragx-bench-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span>
        <div>
          <div class="ragx-bench-name">PersonaMem-v2</div>
          <div class="ragx-bench-sub">隐式个性化</div>
        </div>
      </div>
      <p class="ragx-bench-desc">一段很长的对话历史，用户从没说过「我喜欢简短回答」——系统必须从他问什么、称赞什么、忽略什么推断出来，再从四个回复中选出最适合这个人的一个；共九个场景。</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>5,000 道选择题 · ~32k token 的历史</dd></div>
        <div><dt>METRIC</dt><dd>MCQ exact match</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 四个选项代表乱猜也有 25%，所以分数有内置地板。Raw-RAG 没有显式用户画像，EverMemOS 会建一个。这是系统级比较——画像 + 检索 + 回答模型——不是只比检索组件。</div>
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
      <p class="ragx-bench-desc">一段非常长的对话（约 1M token），用来压力测试 ingestion 速度：系统要多久才能回答第一个问题？</p>
      <dl class="ragx-bench-stats">
        <div><dt>SLICE</dt><dd>1 段对话 · 1,710 条消息 · 约 1M tokens</dd></div>
        <div><dt>METRIC</dt><dd>无——只计时</dd></div>
      </dl>
      <div class="ragx-bench-stress"><b>STRESS</b> 这是计时测试，不是 BEAM 准确率结果。论文只用一段对话，不是完整的 100 段 benchmark，而且在生成答案之前就停表。</div>
    </div>
  </div>
</div>

<div class="ragx-callout">
  <svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg>
  <div><b>不要直接比较总分。</b>切片、评分者与平均规则都不同：LoCoMo 与 LongMemEval 每题等权；MEME 是六任务等权平均（macro-average）；MemoryAgentBench 是四能力等权平均；PersonaMem-v2 是选择题 exact match，没有部分分数。论文在能对齐的地方对齐；其余是基线论证，不是 leaderboard。</div>
</div>

<div class="ragx-src">BENCHMARK SOURCES · LoCoMo (ACL 2024) · LongMemEval (ICLR 2025) · MEME (NeurIPS 2026) · MemoryAgentBench (ICLR 2026) · PersonaMem-v2 (2025) · BEAM (ICLR 2026)</div>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-chart-no-axes-column"></use></svg><span>章节 03</span></div>

## 分数不是重点

更有用的是「为什么 raw retrieval 会赢」。作者在标注过的子集上量两个**诊断率**。**Coverage** 问：在所有题目中，检索到的上下文有多少题含有足够证据可以正确回答？**Utilization** 问：在证据已经足够的题目里，系统实际答对多少？这两个不是相乘得到总分的两个因子。它们是同一条管线的两个切面，分母不同；有用的是它们在不同系统之间的变动幅度。

在 MemoryAgentBench 上，coverage 从 **19.07% 到 45.29%**，差距 **26.2 个百分点**；utilization 只从 **80.00% 到 89.71%**，差距 **9.7 个百分点**。MEME 的模式更明显：coverage 从 **35.69% 到 76.35%**（**40.7 个百分点**），utilization 从 **65.51% 到 86.55%**（**21.0 个百分点**）。两个 benchmark 都显示：系统之间差最多的是「有没有找到证据」，不是「找到之后会不会用」。

Raw-RAG 在两个 benchmark 上都有**最高的 coverage**（45.29% 与 76.35%）。它的 utilization 不是最高：MemoryAgentBench 是 84.43%，MEME 是 73.76%；分别比该 benchmark 的最佳系统低 5.3 与 12.8 个百分点——前者很接近，后者明显落后。

读 utilization 时要注意一个陷阱。每个系统的 utilization 只在**它自己**检索到足够证据的题目上计算，所以检索得少的系统，等于被考在比较简单的子集上。高 utilization 可能只是选择效应，不代表 reader 比较强。这也是为什么 coverage 的差距——决定证据到底在不在——是比较可信的信号。

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg> EXHIBIT // 03 · COVERAGE VS UTILIZATION</div>
    <div class="ragx-title">Coverage 的变异比 utilization 大。</div>
    <p class="ragx-sub">图中为各系统观测到的 min–max。点代表系统，横线代表范围；Raw-RAG 是 coverage 列右端最深的点。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-b" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-b">Coverage varies more than utilization</title><desc>Ranges of coverage and utilization across systems on MemoryAgentBench and MEME.</desc><text x="390.0" y="16.0" class="ragx-axis" text-anchor="end">PERCENT</text><line x1="124.0" y1="34" x2="124.0" y2="232" class="ragx-grid" /><line x1="190.5" y1="34" x2="190.5" y2="232" class="ragx-grid" /><line x1="257.0" y1="34" x2="257.0" y2="232" class="ragx-grid" /><line x1="323.5" y1="34" x2="323.5" y2="232" class="ragx-grid" /><line x1="390.0" y1="34" x2="390.0" y2="232" class="ragx-grid" /><line x1="124" y1="56" x2="390" y2="56" class="ragx-grid-h" /><line x1="124" y1="106" x2="390" y2="106" class="ragx-grid-h" /><line x1="124" y1="156" x2="390" y2="156" class="ragx-grid-h" /><line x1="124" y1="206" x2="390" y2="206" class="ragx-grid-h" /><text x="0.0" y="58.3" class="ragx-label" text-anchor="start">MAB · coverage</text><line x1="174.7" y1="56.0" x2="244.5" y2="56.0" class="ragx-range" /><line x1="174.7" y1="52.0" x2="174.7" y2="60.0" class="ragx-range-cap" /><line x1="244.5" y1="52.0" x2="244.5" y2="60.0" class="ragx-range-cap" /><text x="209.6" y="47.0" class="ragx-axis" text-anchor="middle">26.2 pp</text><circle cx="174.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="181.3" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="190.8" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="215.7" cy="53.8" r="2.9" class="ragx-dot-soft" /><circle cx="216.4" cy="56.0" r="2.9" class="ragx-dot-soft" /><circle cx="230.5" cy="58.2" r="2.9" class="ragx-dot-soft" /><circle cx="244.5" cy="53.8" r="8.3" class="ragx-halo" /><circle cx="244.5" cy="53.8" r="5.0" class="ragx-dot-hero" /><text x="255.5" y="56.2" class="ragx-value-strong" text-anchor="start">45.3</text><text x="0.0" y="108.3" class="ragx-label" text-anchor="start">MAB · utilization</text><line x1="336.8" y1="106.0" x2="362.6" y2="106.0" class="ragx-range" /><line x1="336.8" y1="102.0" x2="336.8" y2="110.0" class="ragx-range-cap" /><line x1="362.6" y1="102.0" x2="362.6" y2="110.0" class="ragx-range-cap" /><text x="349.7" y="97.0" class="ragx-axis" text-anchor="middle">9.7 pp</text><circle cx="336.8" cy="103.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.2" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.2" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="348.6" cy="103.8" r="3.4" class="ragx-dot-ink" /><circle cx="352.4" cy="106.0" r="2.9" class="ragx-dot-soft" /><circle cx="361.7" cy="108.2" r="2.9" class="ragx-dot-soft" /><circle cx="362.6" cy="103.8" r="2.9" class="ragx-dot-soft" /><text x="0.0" y="158.3" class="ragx-label" text-anchor="start">MEME · coverage</text><line x1="218.9" y1="156.0" x2="327.1" y2="156.0" class="ragx-range" /><line x1="218.9" y1="152.0" x2="218.9" y2="160.0" class="ragx-range-cap" /><line x1="327.1" y1="152.0" x2="327.1" y2="160.0" class="ragx-range-cap" /><text x="273.0" y="147.0" class="ragx-axis" text-anchor="middle">40.7 pp</text><circle cx="218.9" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="250.7" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="257.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="289.2" cy="153.8" r="2.9" class="ragx-dot-soft" /><circle cx="292.2" cy="156.0" r="2.9" class="ragx-dot-soft" /><circle cx="311.2" cy="158.2" r="2.9" class="ragx-dot-soft" /><circle cx="327.1" cy="153.8" r="3.4" class="ragx-dot-ink" /><text x="0.0" y="208.3" class="ragx-label" text-anchor="start">MEME · utilization</text><line x1="298.3" y1="206.0" x2="354.2" y2="206.0" class="ragx-range" /><line x1="298.3" y1="202.0" x2="298.3" y2="210.0" class="ragx-range-cap" /><line x1="354.2" y1="202.0" x2="354.2" y2="210.0" class="ragx-range-cap" /><text x="326.2" y="197.0" class="ragx-axis" text-anchor="middle">21.0 pp</text><circle cx="298.3" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="301.3" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="320.2" cy="208.2" r="3.4" class="ragx-dot-ink" /><circle cx="328.4" cy="203.8" r="2.9" class="ragx-dot-soft" /><circle cx="343.9" cy="206.0" r="2.9" class="ragx-dot-soft" /><circle cx="348.0" cy="208.2" r="2.9" class="ragx-dot-soft" /><circle cx="354.2" cy="203.8" r="2.9" class="ragx-dot-soft" /><line x1="124" y1="232" x2="390" y2="232" class="ragx-axis-line" /><line x1="124.0" y1="232" x2="124.0" y2="237" class="ragx-tick" /><text x="124.0" y="250.0" class="ragx-axis" text-anchor="middle">0</text><line x1="190.5" y1="232" x2="190.5" y2="237" class="ragx-tick" /><text x="190.5" y="250.0" class="ragx-axis" text-anchor="middle">25</text><line x1="257.0" y1="232" x2="257.0" y2="237" class="ragx-tick" /><text x="257.0" y="250.0" class="ragx-axis" text-anchor="middle">50</text><line x1="323.5" y1="232" x2="323.5" y2="237" class="ragx-tick" /><text x="323.5" y="250.0" class="ragx-axis" text-anchor="middle">75</text><line x1="390.0" y1="232" x2="390.0" y2="237" class="ragx-tick" /><text x="382.0" y="250.0" class="ragx-axis" text-anchor="middle">100</text><text x="0.0" y="280.0" class="ragx-note" text-anchor="start">Dots = systems · bar = observed min–max</text></svg>
    <div class="ragx-src">RANGE PLOT · 7 个系统 · MAB = MEMORYAGENTBENCH · PP = 百分点</div>
  </div>
</div>

这是论文最实用的贡献。如果你的记忆系统输了，第一个问题不是「我要怎么改回答模型？」而是「哪一个必要证据根本没进到 context？」这个分工正是为什么论文要把两者分开量：coverage 是检索系统的工作，utilization 是回答模型的工作。两者失败的方式不同，修法也不同。再强的回答模型，也无法稳定补偿从来没被检索到的证据。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-git-branch"></use></svg><span>章节 04</span></div>

## 只有答案值不够

在 MEME 的**追踪与 cascade** 题上，作者把 coverage 再拆成两种。**Result coverage** 问：必要的答案值有没有出现在检索到的上下文里？**Path coverage** 问：上下文里有没有推导出这个值所需的时间顺序或依赖链？**P(path | result)** 是条件比率：在已经找到答案值的题目里，同时找到完整路径的比例。把中间的竖线读成「在……的情况下」。

| 系统 | Result coverage（%） | Path coverage（%） | P(path \| result)（%） |
| :-- | --: | --: | --: |
| Raw-RAG | 90.53% | 56.44% | **62.34%** |
| MemMachine | 84.85% | 48.11% | 56.70% |
| EverMemOS | 78.03% | 39.02% | 50.00% |
| EMem | 76.52% | 37.88% | 49.50% |
| Mem0 | 81.06% | 38.64% | 47.66% |
| MemOS | 88.26% | 21.21% | 24.03% |
| MemU | 59.09% | 5.68% | 9.62% |

这张表是追踪／cascade 子集上的诊断，不是 MEME 的端到端总分；找到证据之后，reader 还是得把它变成答案。

这就是「存一个事实」与「存这个事实现在为什么成立」的差别。记忆系统可能检索到「预算是 $4,200」，却漏掉让它提高的批准、让它降低的转账，或这些事件发生的顺序。Raw history 保留了这些关系，因为它从来没有把它们移除。

Complete-store oracle 把论点推得更远。*Gold* 指的是答案卷：作者直接告诉每个系统哪些证据相关，再让它存取自己完整的导出记忆，绕过原生检索；并用同样的 gold 信号选出原始支持 session，作为 raw-evidence control。

<div class="ragx-oracle">
  <div class="ragx-oracle-head">
    <div class="ragx-oracle-eyebrow">用一张图看懂 ORACLE</div>
    <div class="ragx-oracle-title">三种找收据的方法。</div>
    <p class="ragx-oracle-sub">Gold-informed 的意思是：考官直接告诉你答案放在哪个抽屉。它考的是「东西有没有被留下来」，不是「你会不会找」。</p>
  </div>
  <div class="ragx-oracle-grid">
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">NATIVE RETRIEVAL（原生检索）</div>
      <p class="ragx-oracle-copy">用你自己贴的标签翻自己的档案柜。标签决定你能找到什么。</p>
      <div class="ragx-oracle-score">39.30</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">COMPLETE STORE（GOLD-INFORMED，完整记忆库）</div>
      <p class="ragx-oracle-copy">有人把整个档案柜倒在你桌上，告诉你收据在里面。搜索不再是瓶颈，但你只能找到档案柜还留着的东西。</p>
      <div class="ragx-oracle-score">57.54</div>
    </div>
    <div class="ragx-oracle-col">
      <div class="ragx-oracle-name">RAW EVIDENCE（原始证据）</div>
      <p class="ragx-oracle-copy">有人直接把你最初那个鞋盒交给你。这是天花板：证据确实存在，而且什么都没被丢掉。</p>
      <div class="ragx-oracle-score">61.60</div>
    </div>
  </div>
  <div class="ragx-oracle-foot">RAW-RAG · MEME · 同一份 GOLD 信号，三种存取方式</div>
</div>

| 系统 | Native | Complete store | Raw evidence |
| :-- | --: | --: | --: |
| Raw-RAG | 39.30 | **57.54** | 61.60 |
| MemMachine | 37.06 | **57.46** | 61.60 |
| EverMemOS | 21.57 | 51.59 | 61.60 |
| EMem | 33.84 | 48.36 | 61.60 |
| MemOS | 30.24 | 45.12 | 61.60 |
| Mem0 | 27.76 | 32.26 | 61.60 |
| MemU | 19.87 | 31.07 | 61.60 |

<div class="ragx-table-note">MEME · GPT-4o-mini · 粗体 = 各系统的 complete-store 分数 · Raw evidence = 共用上限</div>

把检索从方程式中拿掉之后，每个系统都变好。但保留原始对话内容的系统——Raw-RAG 与 MemMachine——最接近 raw-evidence 天花板。被转换过的 store 差距更大。Raw-RAG 的 57.54 离 61.60 还有约 4 个百分点，那就是 ingestion 留下的残影：被合并的字段、把更正磨平的摘要、失去来源的事实。再完整的存取权，也重建不了当初没有存下的东西。

作者对解读很克制：残余差距不是纯粹的信息损失量测。证据组装、排序，以及 *lost in the middle* 之类的位置效应，也可能有贡献。但方向是一致的，而且与 path 分析的结果吻合。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-history"></use></svg><span>章节 05</span></div>

## 变更审计

论文也审计了 Mem0 的写入策略，这是目前最广泛使用的记忆层之一。

像 Mem0 这样的记忆层，读到一条新消息后会决定怎么处理：**ADD** 一条新记忆、**UPDATE** 已有记忆、**DELETE** 删掉一条，或什么都不做（**NONE**）。每一次决定都是一次**写入决策**。论文把这些决策全部数出来，问：系统到底多常改写或删除它存下的东西？

具体例子：用户先说「我住在慕尼黑」，后来说「我搬到柏林了」。**UPDATE** 会用柏林覆盖慕尼黑那条记忆；**append-only ADD** 会两条都留着、各自带时间戳，让 reader 看得出柏林更新；**DELETE** 会删掉慕尼黑；**NONE** 则两条都不动。

在 LoCoMo 上，UPDATE 与 DELETE 合计只占 33,902 次决策的 **4.39%**。在 LongMemEval 上，**每一题都带着自己的约 115k-token 历史**，它们只占 428,858 次决策的 **2.46%**；决策数远大于题数，因为每一段历史都分开处理。真正造成持久文字改变的「有效变更」只有 **1.90%** 与 **1.34%**；许多提出的 update 是重复的或格式错误的。

接着作者做了一个简单实验：把 UPDATE 换成**append-only ADD**（保留旧记忆，另外新增一条），把 DELETE 换成 **NONE**（什么都不做）。如果准确率没有下降，就代表在这个 benchmark 上，显式改写并没有帮上忙。LoCoMo 准确率从 **67.36% 上升到 69.42%**，而且没有任何类别下降。

这不代表在生产环境中删除不重要。它代表这些 benchmark 很少需要删除，而需要的时候，能力够强的回答模型通常可以从原始证据重建状态变化。第二个实验支持这点，但它是**上限测试**，不是 Raw-RAG 的端到端分数。作者完全不跑检索；每一题都直接把**问题所问的那个时间点**已经存在的证据，按时间顺序交给 reader，没有任何检索错误。问题是：如果检索完美，强的回答模型能不能重建当前状态？这考的是**回答模型**，不是记忆系统，所以分数**不能拿来跟 Raw-RAG 端到端的 43.19% 相比**。

DeepSeek-V4-Flash 在 MEME 六种题型上整体达到 **85.48%**，其中 **cascade 题 82.32%**（要把上游变更沿规则传下去）、**invalidation 题 91.54%**（后面的事件让先前的事实失效）。同一份证据交给 Qwen3.5-35B-A3B 只有 **70.25%**，交给 GPT-4o-mini 只有 **50.50%**。这 35 个百分点的差距正是重点：就算证据完美，状态重建仍然高度取决于回答模型。

85.48% 是**六题型等权平均（six-task macro）**，不是 82.32 与 91.54 的平均（两者平均是 86.93）；它比较低，是因为还包含其他四种 MEME 题型。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-layers"></use></svg><span>章节 06</span></div>

## 复杂度仍然有价值的地方

这篇论文最强的时候，是被当成「基线论证」来读，而不是普世判决。两个结果让它保持诚实。

第一，**PersonaMem-v2**。Raw-RAG 得分 **49.62%**，在七个记忆系统中排第三，落后 MemOS（50.72%）与 EverMemOS（53.25%）；PersonaMem 的**九个场景中，没有任何一个由 Raw-RAG 领先**。PersonaMem 测的是个性化：用户从没说过「我喜欢简短回答」，系统必须从他问什么、称赞什么、忽略什么推断出来，再从四个回复中选一个。EverMemOS 会先建一份**显式用户画像**——一份「这个人是谁、喜欢什么」的清单——再用它回答；Raw-RAG 没有这种画像。这是**系统级比较**：画像 + 检索 + 回答模型，不是只比检索组件。当任务是「记住这个人是谁、他偏好什么」，结构化记忆有 raw retrieval 抹不掉的优势。

第二，**MEME + DeepSeek-V4-Flash**。Raw-RAG 得分 **43.19%**，MemMachine 则是 **44.71%**——这些是正常检索下的端到端分数。更说明问题的是，同一个设置下 **Full-context 得分 63.17%**。Full-context 不是另一个记忆系统，而是一个诊断：完全跳过检索，把整段对话贴进模型的 context，问「如果 reader 什么都看得到，能做得多好？」它比 Raw-RAG 高约 **20 个百分点**，比 MemMachine 高约 **18 个百分点**；这表示两个检索式系统都受限于检索交给 reader 的内容，**不是**说 MemMachine 的记忆管理赢了。MemMachine 那 1.52 个百分点的领先，在这个 20 分差距旁边很小。论文也承认结果很依赖回答模型，并注明评估任务是批量问答，不是真正在产品里运行的记忆系统。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg><span>章节 07</span></div>

## 应该让 builder 停下来的消融实验

论文在 MemoryAgentBench 上的消融，是一份「听起来很聪明、分数却更差」的清单：

<div class="chamfer-card-wrapper ragx-card">
  <div class="chamfer-card-content">
    <div class="card-tag ragx-tag"><svg class="ragx-ico ragx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg> EXHIBIT // 04 · 记忆管理消融</div>
    <div class="ragx-title">记忆管理没有为自己赚回成本。</div>
    <p class="ragx-sub">窗口大小／重叠（token）。默认是 256/32；消融测试 128/16、512/64 与 1024/128。负值代表这个改动让 MemoryAgentBench 总分下降。第一根柱子是移除重排器；其余是新增或改变一个操作。只有 512/64 略微为正（+0.04），在噪声范围内。</p>
    <svg class="ragx-svg" viewBox="0 0 400 300" role="img" aria-labelledby="ragx-title-c" xmlns="http://www.w3.org/2000/svg"><title id="ragx-title-c">Memory-management ablations</title><desc>Change in MemoryAgentBench total when each operation is added to Raw-RAG.</desc><text x="392.0" y="16.0" class="ragx-axis" text-anchor="end">Δ POINTS</text><line x1="123.9" y1="32" x2="123.9" y2="236" class="ragx-grid" /><line x1="123.9" y1="27" x2="123.9" y2="34" class="ragx-tick" /><line x1="243.1" y1="32" x2="243.1" y2="236" class="ragx-grid" /><line x1="243.1" y1="27" x2="243.1" y2="34" class="ragx-tick" /><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="362.2" y1="27" x2="362.2" y2="34" class="ragx-tick" /><text x="0.0" y="46.4" class="ragx-label" text-anchor="start">− reranker</text><rect x="315.5" y="40.5" width="46.7" height="7" rx="3.5" class="ragx-bar" /><text x="309.5" y="46.4" class="ragx-value" text-anchor="end">−3.92</text><text x="0.0" y="72.4" class="ragx-label" text-anchor="start">128 / 16</text><rect x="359.4" y="66.5" width="2.9" height="7" rx="3.5" class="ragx-bar" /><text x="353.4" y="72.4" class="ragx-value" text-anchor="end">−0.24</text><text x="0.0" y="98.4" class="ragx-label" text-anchor="start">512 / 64</text><rect x="362.2" y="92.5" width="2.0" height="7" rx="3.5" class="ragx-bar-pos" /><text x="368.2" y="98.4" class="ragx-value" text-anchor="start">+0.04</text><text x="0.0" y="124.4" class="ragx-label" text-anchor="start">1024 / 128</text><rect x="358.9" y="118.5" width="3.3" height="7" rx="3.5" class="ragx-bar" /><text x="352.9" y="124.4" class="ragx-value" text-anchor="end">−0.28</text><text x="0.0" y="150.4" class="ragx-label" text-anchor="start">+ turn dedup</text><rect x="333.7" y="144.5" width="28.5" height="7" rx="3.5" class="ragx-bar" /><text x="327.7" y="150.4" class="ragx-value" text-anchor="end">−2.39</text><text x="0.0" y="176.4" class="ragx-label" text-anchor="start">+ atomic facts</text><rect x="128.4" y="170.0" width="233.8" height="8" rx="4" class="ragx-bar-hero" /><text x="140.4" y="176.5" class="ragx-value-paper" text-anchor="start">−19.62</text><text x="0.0" y="202.4" class="ragx-label" text-anchor="start">+ raw summary</text><rect x="293.0" y="196.5" width="69.2" height="7" rx="3.5" class="ragx-bar" /><text x="287.0" y="202.4" class="ragx-value" text-anchor="end">−5.81</text><text x="0.0" y="228.4" class="ragx-label" text-anchor="start">+ graph expansion</text><rect x="293.3" y="222.5" width="68.9" height="7" rx="3.5" class="ragx-bar" /><text x="287.3" y="228.4" class="ragx-value" text-anchor="end">−5.78</text><line x1="362.2" y1="32" x2="362.2" y2="236" class="ragx-zero" /><line x1="112" y1="244" x2="392" y2="244" class="ragx-axis-line" /><line x1="123.9" y1="244" x2="123.9" y2="249" class="ragx-tick" /><text x="123.9" y="260.0" class="ragx-axis" text-anchor="middle">−20</text><line x1="243.1" y1="244" x2="243.1" y2="249" class="ragx-tick" /><text x="243.1" y="260.0" class="ragx-axis" text-anchor="middle">−10</text><line x1="362.2" y1="244" x2="362.2" y2="249" class="ragx-tick" /><text x="362.2" y="260.0" class="ragx-axis" text-anchor="middle">0</text><text x="0.0" y="284.0" class="ragx-note" text-anchor="start">Δ vs Raw-RAG 48.32 · negative = worse</text></svg>
    <div class="ragx-src">BAR CHART · 14 个来源 · Δ = 相对 48.32 总分的变动 · 同一 reader 与证据预算</div>
  </div>
</div>

以下把每个操作翻成白话。数字是把它加进 48.32 基线后，MemoryAgentBench 总分的变化；48.32 是 Raw-RAG 在默认设置下的总分，所有变化都是相对它，不是相对某个对手。

MemoryAgentBench 的四种能力之一是 **test-time learning（测试时学习）**。这个名字容易误会：模型**不会**重新训练，也不会更新权重。来源里会有几个示范样例——例如五条客服评论，各自标了「negative」或「positive」——模型必须从中归纳出规则，再套用到新的一条评论。这也叫 **few-shot learning**：「训练」发生在 prompt 里。一个 **demonstration（示范样例）** 不是只有那句「这条评论是负评」，而是完整的组合：评论文字、它的标签，以及标出下一条样例从哪里开始的边界。如果抽取只留下「负评」这个事实，却丢掉输入–标签的配对，模型就看不到该模仿的模式。

<div class="ragx-abl-grid">
  <div class="ragx-abl ragx-abl-hero">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span class="ragx-abl-name">ATOMIC-FACT EXTRACTION（原子事实抽取）</span><span class="ragx-abl-delta">−19.62</span></div>
    <p class="ragx-abl-big">把一部电影浓缩成剧情大纲。</p>
    <p class="ragx-abl-copy">人物与事件还在，但镜头、语气、时间感，以及「这件事到底怎么做」的示范都不见了。事实留下来了，示范没有。</p>
    <div class="ragx-abl-stat">TEST-TIME LEARNING SUBSET <b>47.68% → 15.37%（−32.31 个百分点）</b></div>
    <div class="ragx-abl-note">卡上的 −19.62 是整体 MemoryAgentBench 总分的跌幅。test-time-learning 子集掉得更深：−32.31 个百分点；整体数字比较小，因为它平均了四种能力。</div>
</div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-file-text"></use></svg><span class="ragx-abl-name">RAW SUMMARY AUGMENTATION（原始摘要增强）</span><span class="ragx-abl-delta">−5.81</span></div>
    <p class="ragx-abl-copy">把会议录音改写成会议记录。记录更好读，但「谁反对哪个数字、哪个数字后来被更正、先后顺序是什么」都被磨平了。Conflict resolution 考的正是这些接缝。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-network"></use></svg><span class="ragx-abl-name">GRAPH-EXPANDED RETRIEVAL（图谱扩展检索）</span><span class="ragx-abl-delta">−5.78</span></div>
    <p class="ragx-abl-copy">查「发票」，系统顺便把客户、订单、地址、客服单整串关联搬过来。关联是真的，但「有关联」不等于「这题需要」；多出来的邻居会挤掉 reader 真正需要的证据。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-repeat"></use></svg><span class="ragx-abl-name">DISPLAY-TURN DEDUPLICATION（显示回合去重）</span><span class="ragx-abl-delta">−2.39</span></div>
    <p class="ragx-abl-copy">把对话里重复的句子删掉。但人重复讲，往往是在修补：「不是这个地址，是新的那个。」去重可能留下旧的，删掉最后的更正。</p>
  </div>
  <div class="ragx-abl">
    <div class="ragx-abl-head"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-list-filter"></use></svg><span class="ragx-abl-name">REMOVING THE RERANKER（移除重排器）</span><span class="ragx-abl-delta">−3.92</span></div>
    <p class="ragx-abl-copy">只凭书名找书。每本书的书名都有「意大利面」，但翻开才发现没有一本写到你要的酱。Reranker 就是那个先翻开书对照问题的人。</p>
  </div>
</div>

这些操作单独看都不笨。每一个都是在赌：压缩或结构带来的好处，会大于它弄丢的东西。在这个 benchmark 上，赌输了；而输掉的分，告诉你哪一个赌得最糟。

论文没有把整个跌幅都归因于事实流失：证据的**数量**、**排列方式**，以及**回答模型是否适应这种格式**，都一起变动。抽出的事实很短、很一致，却被剥掉了模型可能依赖的对话线索；这是格式改变，不只是内容改变。但实务警讯很清楚：**压缩不是免费的，就算事实都还在。**

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-coins"></use></svg><span>章节 08</span></div>

## 成本

这里其实是三场不同的计时测试，各自回答不同的问题。

**测试 1：MEME 切片。** 表格使用 10 个 episode、110 题，搭配一个外部 worker 与各系统原生的并行度。「Ingest to ready」是把 episode 读进记忆、准备好回答的时间；「Search」是**回答全部 110 题的总时间**，不是单一查询；「Total」是两者相加。Raw-RAG 约 **50 秒导入**、**256 秒回答 110 题**（每题约 2.3 秒）、合计 **306 秒**。第二名的 EMem 总共 1,562 秒；EverMemOS 则要 9,301 秒，约 **2.6 小时**。

| 系统 | Ingest to ready（秒） | Search（秒） | Total（秒） |
| :-- | --: | --: | --: |
| Raw-RAG | 50.32 | 255.59 | **305.91** |
| EMem | 1,082.37 | 479.59 | 1,561.97 |
| MemOS | 2,591.59 | 177.97 | 2,769.56 |
| MemMachine | 3,104.35 | 411.39 | 3,515.74 |
| Mem0 | 4,025.23 | 117.72 | 4,142.95 |
| EverMemOS | 8,217.69 | 1,083.79 | 9,301.48 |

**测试 2：BEAM 对话。** 这是一段 1,710 条消息、接近一百万 token 的对话，只量**导入**。Raw-RAG 约 **20 分钟**；下一个完成的系统 MemOS 约 **3 小时 15 分**；Memora 则要将近 **27 小时**。有些系统没有跑完，所以文中说「下一个完成的跑分」。Memora 是 BEAM 比较中的一个系统，没有出现在较小的 MEME 表里。

**测试 3：MemoryAgentBench 消融。** 这是另一个 benchmark（14 个来源、103K–1.44M token），量的是**三个外加的记忆操作**：原子事实、摘要与图谱扩展。它们需要 **2,160 万到 1.093 亿个 LLM 生成 token**——大约是数万到十万页文字——以及 **2.9 到 8.8 小时**的导入加检索。Raw-RAG 在**同一个** benchmark 的基线约 **12 分钟**。Raw-RAG 的导入使用 embedding 调用，不是 LLM 生成，所以 token 数字不是同类比较；时间差距是更有意义的数字。

因此各种倍率本来就不同：MEME 切片是 **5.1 倍**（总时间约为第二名的五分之一）、对 EverMemOS 是 **30.4 倍**、BEAM 导入对 MemOS 约 **10 倍**、消融则是 **15–44 倍**。总时间的倍率是 **5–30 倍**；「两个数量级」只适用于最慢的导入（约 **160 倍**），不是每一行都成立。

这不代表复杂系统没有用。它代表复杂系统的举证责任更高。如果一个记忆层的导入成本高得多，却没有在目标 workload 上提升准确率，那它不是记忆层，只是一个很贵的索引。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-scissors"></use></svg><span>章节 09</span></div>

## 完整的切块规格

这是最值得抄进设计文件的部分。Raw-RAG 的默认值是：

| 参数 | 值 | 为什么重要 |
| :-- | :-- | :-- |
| 窗口 tokenizer | GPT-4 tokenizer | 窗口大小是用 GPT-4 的 tokenizer 在导入时量的。 |
| 窗口大小 | **256 tokens** | 小到能检索特定交换；大到能保留局部语意。 |
| Stride | **224 tokens** | 每一步移动多远。256 − 32 = 224，所以相邻窗口共用 32 token。 |
| 重叠 | **32 tokens** | 避免实体或关系在边界被切断。 |
| Dense 候选 | **128** | 便宜的向量检索短名单。它先确保正确窗口有机会进榜；昂贵的重排器只看这 128 个问题–窗口配对。 |
| 重排窗口 | **15** | 回答模型的预算。Final-k 是最后交给 reader 的窗口数；5 到 60 都在 1.3 个百分点内，120 会掉 14.57 个百分点。 |
| Reranker | Cross-encoder | 移除它在 MemoryAgentBench 上掉 3.92 个百分点。 |
| Turn expansion | **开启** | 选中的窗口会展开成它重叠到的完整 turn（可能不止一轮）。 |
| 去重 | 默认**关闭** | 在测试设置中开启会掉 2.39 个百分点。 |
| Query | 原始问题 | 不做 query rewriting（改写查询）：用户问什么就搜什么。 |
| Index | 扁平、ingestion 后固定 | 一份简单列表，没有层级、没有图，导入后不再更新。 |

### 一段文字，三个窗口

这是一封客服信，用同样的重叠几何切开；为了让接缝看得见，窗口缩小了：

<div class="ragx-chunk">
  <div class="ragx-chunk-head">
    <div class="ragx-chunk-eyebrow">来源文件 · 75 字</div>
    <p class="ragx-chunk-src">你好，我在 3 月 3 日订了胡桃木书桌。第一次送来时桌腿裂了，你们在 3 月 12 日换了一张。新桌子没问题，但发票仍然向我收两张桌子的钱。我只想付一张。请更正发票，并确认退还重复收取的款项。</p>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 01</div>
    <div class="ragx-chunk-text">你好，我在 3 月 3 日订了胡桃木书桌。第一次送来时桌腿裂了，你们在 3 月 12 日换了一张。</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 02</div>
    <div class="ragx-chunk-text"><mark>你们在 3 月 12 日换了一张。</mark> 新桌子没问题，但发票仍然向我收两张桌子的钱。我只想付一张。</div>
  </div>
  <div class="ragx-chunk-win">
    <div class="ragx-chunk-tag">WINDOW 03</div>
    <div class="ragx-chunk-text"><mark>我只想付一张。</mark> 请更正发票，并确认退还重复收取的款项。</div>
  </div>
  <div class="ragx-chunk-foot">缩小示例 · 同样的重叠模式，更短的窗口</div>
</div>

1. Window 02 还能回答「什么东西被换掉？」，因为重叠把「3 月 12 日换了一张」一起带过来了。
2. Window 03 单独看不知道「重复收取的款项」指什么；是 Window 02 先介绍了这个概念。重叠保留了这座桥。
3. 没有任何一个窗口装得下完整故事。这就是为什么最后还要 turn expansion 把完整消息接回来，也是为什么 top-15 只是预算，不是保证。

读者实际拿到的证据长度，和窗口大小一样重要。经过 turn expansion 与格式化之后，平均证据长度是：

| Benchmark | 平均 token | 中位数 | 第 95 百分位 | 最长 | 超过 5,000 token 的题数 |
| :-- | --: | --: | --: | --: | --: |
| MemoryAgentBench | 3,915.8 | 4,173.0 | 4,209.5 | 4,262 | 0 |
| LoCoMo | 4,778.8 | 4,778.0 | 4,966.1 | 5,177 | 41 |
| LongMemEval | 11,355.6 | 11,248.5 | 13,915.3 | 27,375 | 500 |
| MEME | 11,986.1 | 10,186.0 | 21,329.6 | 42,490 | 1,188 |

第 95 百分位是「95% 的题目都低于这个长度」；最长的 5% 在此之上。最后一栏是题数，不是 token 数。

5,000-token 控制组是一个有用的 sanity check。Raw-RAG 在 MemoryAgentBench 上从未超过 5,000 token，分数维持 **48.32%**；同一个上限下，控制组中最强的基线是 **44.74%**。在 LoCoMo 与 LongMemEval 上，关掉 turn expansion 以塞进 5,000 token 反而让分数略升（+0.35 与 +1.67）；在 MEME 上则降 1.09。预算有影响，但更大的影响仍然是「有没有检索到正确的证据」。

### 这篇文章的切块

我用同一个 tokenizer 跑过本文正文。下表不含 frontmatter、图表 SVG、01B HTML 图表与这张表本身。它是一个实际例子，说明一篇散文文章落在 256/32 索引上会长什么样子：

| 章节 | 约略 tokens | 256/32 窗口数 | 建议 reader 单位 |
| :-- | --: | --: | :-- |
| 开头 + 论点 | 1,077 | 5 | 3–5 个窗口 |
| 「Naive」的意思 | 1,003 | 5 | 3–5 个窗口 |
| Benchmark 地图 | 1,259 | 6 | 3–6 个窗口 |
| 为什么 coverage 会赢 | 614 | 3 | 2–3 个窗口 |
| 路径与 complete store | 1,061 | 5 | 3–5 个窗口 |
| 变更审计 | 772 | 4 | 2–4 个窗口 |
| 复杂度仍有价值的地方 | 463 | 2 | 1–2 个窗口 |
| 消融实验 | 986 | 5 | 3–5 个窗口 |
| 成本 | 779 | 4 | 2–4 个窗口 |
| 切块规格 | 1,139 | 5 | 3–5 个窗口 |
| 保留意见 + 检查清单 | 782 | 4 | 2–4 个窗口 |
| **正文合计** | **9,935** | **48** | **Top-15 = 展开前 3,840 tokens** |

两个实务提醒：

1. **不要切开表格、程式码区块或图表卡。** 256-token 窗口会切穿 Markdown 表格或 SVG。散文用 heading-aware 边界与 10–15% 重叠；对话用论文的 256/32。
2. **索引预算不等于 reader 预算。** 索引可以保留每一个 256-token 窗口；reader 只该看到一小组重排后的窗口。Raw-RAG 的 15 窗口默认值大约是展开前 3,840 token——这也解释了为什么实际证据长度是 3.9k 到 12k token，而不是 15 × 256。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg><span>章节 10</span></div>

## 我会怎么做

<ul class="ragx-checklist">
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-target"></use></svg></span><div><b>先建基线，再加记忆层。</b> 扁平索引、256-token 窗口、32-token 重叠、top-128 dense 候选、cross-encoder top-15、turn expansion。先在你的 workload 上量它，再考虑加任何东西。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-radar"></use></svg></span><div><b>分开量 coverage 与 utilization。</b> 单一准确率会掩盖你到底是找不到证据，还是找到了却不会用。抽样标注<b>证据够不够（sufficiency）</b>——只判断检索到的证据是否足以回答，不判断答案对不对；诊断不同，修法就不同。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-route"></use></svg></span><div><b>保留 provenance 与路径。</b> 存原始 turn、时间戳，以及让它变成当前状态的事件链接。<b>Provenance（来源追溯）</b> 是指每一条存入的事实从哪里来；没有依赖链的事实是一个陷阱。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-flask-conical"></use></svg></span><div><b>让每个记忆操作通过同预算测试。</b> 同样的 reader、同样的证据预算、同样的 judge。如果 atomic facts、summary 或 graph expansion 赢不了 raw baseline，就不要上线。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-users"></use></svg></span><div><b>用你真正要部署的回答模型测试。</b> MEME 的上限测试显示，同一份证据交给不同回答模型，分数可以差 35 个百分点。对弱模型有帮助的记忆设计，对强模型可能完全不必要——反之亦然。</div></li>
  <li><span class="ragx-check-ico"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-shield-check"></use></svg></span><div><b>不要把 benchmark 准确率当成产品中的记忆。</b> 删除、<b>权威状态（authoritative state：多个版本并存时，哪一个才是当前正确的值）</b>、<b>可审计性（auditability：能追溯系统为什么这样回答、用了哪些证据）</b>、隐私，都是这篇论文没有测试的真实需求。如果你删不掉，raw history 也是负债。</div></li>
</ul>

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-triangle-alert"></use></svg><span>章节 11</span></div>

## 保留意见

结果很强，但不是普世定律。

- **比较混合了已发表分数。** 不同 baseline 论文使用不同的回答模型、不同的指示、不同的评分者、不同大小的证据预算。作者在能对齐的地方重跑了对齐设置，但主表仍然混合已发表数字与新跑的结果。LongMemEval 的 0.13 个百分点胜利在 LLM 评分的噪声范围内，不该当成真正的差距。
- **任务是固定历史上的批量问答。** 论文没有测试实时对话、交互式 agent、工具使用，或图像与音频记忆。
- **Coverage 标签来自 LLM judge**（MemoryAgentBench）。每个系统的 utilization 只在**它自己**检索到足够证据的题目上计算，所以检索得少的系统等于被考在较简单的子集上。回答模型的比较**不是完全对等的**。
- **MEME 的绝对分数偏低。** Raw-RAG 用 GPT-4o-mini 只有 39.30%，用 DeepSeek 只有 43.19%；Full-context + DeepSeek 则达到 63.17%。检索仍然漏掉关键证据。
- **PersonaMem 是一个真实的反例。** 当任务是个性化而不是事实回忆，profile-based memory 会赢。诚实的结论不是「agentic memory 已死」，而是「agentic memory 必须赢过一个强大的 raw baseline」。

论文标题问的是：复杂的 agentic memory 是否总是必要？它支持的答案是：**不——而且这个领域应该停止假设它必要。** 这个基线简单、便宜、而且很难打败。这正是基线存在的意义。

<div class="ragx-kicker"><svg class="ragx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ragx-i-book-open"></use></svg><span>章节 12</span></div>

## 参考资料

- *Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought.* [arXiv:2610.30755](https://arxiv.org/abs/2610.30755), 2026.
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
