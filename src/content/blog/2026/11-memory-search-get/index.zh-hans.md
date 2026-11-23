---
title: "先 Search，再 Get：代理记忆的两个模块"
description: "细读《Is Grep All You Need?》，换一个更简单的视角：代理记忆不是一个操作，而是两个。Search 把线索变成 handle，Get 把 handle 变成确切字节；论文里的 harness 效应，取决于接口保住了哪一个。"
pubDate: 2026-11-23
category: "AI"
tags: ["代理", "记忆", "RAG", "检索", "论文笔记"]
featured: false
author: "Alex.Hsiao"
readTime: "18 分钟"
---

# 先 Search，再 Get：代理记忆的两个模块

《Is Grep All You Need?》最有用的一个结果，不是 grep 赢了。而是 harness 可以在完全不动语料库的情况下，把这个胜利抹掉。

论文用 116 个长期记忆问题，横跨五个模型、四种 harness、两种检索模式与两种投递路径。在内嵌模式下，grep 在十个 harness–model 组合中全部赢过 vector。把同样的结果搬进文件，优势就消失了：十组平均变成平手，vector 在十组中赢了五组。只换 harness，同一个模型就移动 16.4 个百分点——比同一行里 grep 与 vector 的 1.7 个百分点差距还大。

把这些数字当成检索引擎比赛，会让人困惑。把它们当成接口问题，几乎就变得机械而必然。

这个接口有两个动词。**Search** 接受一个不完整的线索，返回一份有界的候选地址列表。**Get** 接受一个地址，返回存在那里的确切字节。Search 让代理发现“有这个东西”；Get 让代理读到“这个东西是什么”。

`grep -n` 是 Search，它的输出是一串 `path:line` 形式的 handle。`sed -n '40,60p' file` 是 Get。两者能组合，是因为前者吐出的东西，正好是后者吃的东西。Vector 检索常常只以 Search 的形式出现：top-k 区块直接内嵌进上下文，没有地址可以回头，也没有更多东西可以打开。

Grep 不是全部。Grep 是你需要的两件事，只是共用同一个名字。

## 两个动词，一个记忆

Search 是集合值的。它接受一个线索——字面字符串、正则表达式、自然语言问题、元数据筛选——然后返回候选。它可以近似、可以排序、可以有界。它的工作是在预算内取得召回，不是保证真理。

Get 是单一的。它接受一个地址，返回该地址上的字节，或一个明确的“找不到”。它是记忆的主键查询：地址进，记录出。它不被允许排序、摘要，或拿一个邻居来代替。它的工作是解析。

把两者接起来的单位是 **handle**：一个存储片段（span）的稳定名称。`src/auth/session.ts:42`、`orders/1841#L12`、`4f2c9a1:docs/spec.md`、`chunk_01H8...`、`message 118`。handle 不是内容本身；它是“这份内容可以再次被生成”的承诺。

一个无法再次解析的检索结果，不是记忆。它是一段引文。

贴进提示里的 top-k 区块就是引文。它们或许能回答眼前这题，但无法被重访、无法被扩大，也无法拿来和新版本对照。一个带有文件与行号的 grep 命中则是记忆：代理可以离开、去做别的事，再回来读同一段字节。

这个循环才是“翻阅”的意思：线索 → Search → handle → 选择 → Get → 证据 → 新线索。没有目录的图书馆不能用；只有目录、没有书架的图书馆，则只是一份书目。代理两半都需要。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">记忆地图 // 01</span>
    <h3 class="mem-fig-title">一个记忆，两种不同的缩减</h3>
    <p class="mem-fig-sub">Search 把语料库缩成地址，Get 把地址缩成字节，循环把两者组合起来。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 496" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">代理记忆的两个模块</title>
    <desc id="mem-f1-desc">Search 接受线索，返回一份排序过的 handle 列表。Get 接受一个 handle，返回该地址上的确切字节。虚线循环把证据带回成新的线索。</desc>
    <defs>
      <marker id="mem-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">记忆 // 两个模块</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">线索 → HANDLE → 字节</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / SEARCH</text>
    <text x="448" y="46" class="f" font-size="7" letter-spacing="1.1">02 / GET</text>
    <rect x="24" y="58" width="368" height="332" class="box"/>
    <text x="40" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="40" y="98" class="m" font-size="7.5">线索进 · 候选出 · 一对多</text>
    <text x="376" y="88" class="f" font-size="18" text-anchor="end">01</text>
    <rect x="40" y="110" width="336" height="50" class="term"/>
    <text x="50" y="124" class="f" font-size="6.5" letter-spacing="0.8">线索</text>
    <text x="50" y="139" class="t mono" font-size="7.2">"refund window"  ·  /retry.*budget/</text>
    <text x="50" y="151" class="m mono" font-size="7.2">vector(q)  ·  path:src/**  ·  after:2026-01-01</text>
    <line x1="208" y1="160" x2="208" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="40" y="178" width="336" height="84" class="box"/>
    <text x="50" y="192" class="f" font-size="6.5" letter-spacing="0.8">检索工具</text>
    <rect x="50" y="200" width="102" height="28" class="term"/>
    <text x="101" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">GREP</text>
    <text x="101" y="222" class="m mono" font-size="6.2" text-anchor="middle">正则表达式 · 字面</text>
    <rect x="160" y="200" width="102" height="28" class="term"/>
    <text x="211" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">BM25</text>
    <text x="211" y="222" class="m mono" font-size="6.2" text-anchor="middle">词频</text>
    <rect x="270" y="200" width="96" height="28" class="term"/>
    <text x="318" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">VECTOR</text>
    <text x="318" y="222" class="m mono" font-size="6.2" text-anchor="middle">ANN · 语义</text>
    <text x="50" y="250" class="m" font-size="6.8">筛选 · 日期 · 路径 · glob</text>
    <line x1="208" y1="262" x2="208" y2="276" class="arrow" marker-end="url(#mem-arrow)"/>
    <text x="40" y="292" class="f" font-size="6.5" letter-spacing="0.8">HANDLE // N = 3</text>
    <text x="376" y="292" class="f" font-size="6.5" text-anchor="end" letter-spacing="0.8">已排序</text>
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
    <text x="40" y="382" class="m" font-size="6.8">集合值 · 已排序 · 有预算 · 可能什么都没找到</text>
    <rect x="448" y="58" width="368" height="332" class="box"/>
    <text x="464" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="464" y="98" class="m" font-size="7.5">一个 HANDLE 进 · 确切字节出 · 一对一</text>
    <text x="800" y="88" class="f" font-size="18" text-anchor="end">02</text>
    <rect x="464" y="110" width="336" height="50" class="term"/>
    <text x="474" y="124" class="f" font-size="6.5" letter-spacing="0.8">一个 HANDLE</text>
    <text x="474" y="139" class="t mono" font-size="7.2">policies/2026-returns.md:12</text>
    <text x="474" y="151" class="m mono" font-size="6.8">从 3 个候选解析 · 不重新搜索</text>
    <line x1="632" y1="160" x2="632" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="464" y="178" width="336" height="84" class="box"/>
    <text x="474" y="192" class="f" font-size="6.5" letter-spacing="0.8">解析 → 读取 → 返回</text>
    <rect x="474" y="200" width="100" height="28" class="term"/>
    <text x="524" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">解析</text>
    <text x="524" y="222" class="m mono" font-size="6.2" text-anchor="middle">地址</text>
    <rect x="584" y="200" width="100" height="28" class="term"/>
    <text x="634" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">读取</text>
    <text x="634" y="222" class="m mono" font-size="6.2" text-anchor="middle">范围</text>
    <rect x="694" y="200" width="96" height="28" class="term"/>
    <text x="742" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">返回</text>
    <text x="742" y="222" class="m mono" font-size="6.2" text-anchor="middle">字节</text>
    <text x="474" y="250" class="m" font-size="6.8">原样接受 HANDLE · 失败即拒绝</text>
    <text x="464" y="292" class="f" font-size="6.5" letter-spacing="0.8">确切字节 // L12–L15</text>
    <text x="800" y="292" class="f" font-size="6.5" text-anchor="end" letter-spacing="0.8">一条记录</text>
    <rect x="464" y="298" width="336" height="62" class="codebox"/>
    <text x="476" y="314" class="m mono" font-size="7.2">12  ## 退款</text>
    <text x="476" y="328" class="t mono" font-size="7.2">13  退款须于 14 天内提出</text>
    <text x="476" y="342" class="t mono" font-size="7.2">14  自到货起算。拆封软件恕不退换。</text>
    <text x="476" y="356" class="m mono" font-size="6.8">15  生效：2026-01-01 · 状态：现行</text>
    <text x="464" y="382" class="m" font-size="6.8">单一 · 确定性 · 不排序</text>
    <path d="M394 310 H420 V135 H440" class="arrow" fill="none" marker-end="url(#mem-arrow)"/>
    <path d="M632 394 V414 H208 V396" class="dash" fill="none" marker-end="url(#mem-arrow-muted)"/>
    <text x="420" y="428" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">证据 → 新线索 · 再次 SEARCH</text>
    <rect x="24" y="442" width="792" height="38" class="codebox"/>
    <text x="40" y="458" class="t mono" font-size="7.5" font-weight="700">SEARCH = 语料库 → 地址。   GET = 地址 → 确切字节。</text>
    <text x="40" y="471" class="m" font-size="7">让记忆可被翻阅的是循环，不是索引。</text>
  </svg>
  </div>
  <div class="mem-fig-src">双模块记忆 · SEARCH / GET · 以 HANDLE 为中心的循环</div>
</figure>

Search 把语料库缩成地址。Get 把地址缩成字节。循环把这两种缩减组合起来。

## 论文到底量了什么

这项研究变动检索模式、harness 与投递路径。任务是 LongMemEval-S 的 116 题子集：跨多个会话的对话问答，涵盖知识更新、跨会话汇总、助手生成内容、用户偏好、用户陈述的事实，以及时间推理。每题都附有含答案的会话（oracle sessions），以及数量不定的干扰会话。语料库固定不变。检索器一个是对原始文本做 grep，一个是带重排的 vector 检索。harness 则是一个自制代理（Chronos）与三个提供商 CLI（Claude Code、Codex、Gemini CLI）。投递路径分为内嵌工具消息，以及代理必须自己打开的文件。

在内嵌条件下，grep 在十个 harness–model 组合中全部领先。这十组的未加权平均是 83.8 对 72.5，差距 11.3 个百分点。最大差距是 Gemini 3.1 Flash-Lite 搭配 Chronos：86.2 对 62.9。最小差距是 Claude Opus 4.6 搭配 Claude Code：76.7 对 75.0。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">实验 1 // 02</span>
    <h3 class="mem-fig-title">十组内嵌配对全部倒向 grep</h3>
    <p class="mem-fig-sub">每一行是一个模型在一种 harness 里的结果。空心圆是 vector，实心圆是 grep。差距从 1.7 到 23.3 个百分点。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 470" role="img" aria-labelledby="mem-f2-title mem-f2-desc">
    <title id="mem-f2-title">各 harness 与模型的内嵌 grep、vector 准确率</title>
    <desc id="mem-f2-desc">十组 harness–model 配对的哑铃图。grep 在每一组都高于 vector，差距从 1.7 到 23.3 个百分点。未加权平均为 grep 83.8、vector 72.5。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">实验 1 // 内嵌投递</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">准确率 % · LONGMEMEVAL-S 116 题</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="50" class="t" font-size="12.5" font-weight="800" letter-spacing="-0.01em">Grep 在每一组内嵌配对中都领先</text>
    <text x="24" y="66" class="m" font-size="7.5">连线是差距，圆点是分数。</text>
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
    <text x="270" y="418" class="f" font-size="6.5" letter-spacing="0.8">准确率（%）</text>
    <rect x="24" y="428" width="792" height="34" class="codebox"/>
    <text x="40" y="444" class="t mono" font-size="7.3">十组平均：GREP 83.8 · VECTOR 72.5 · 差距 +11.3</text>
    <text x="40" y="456" class="m mono" font-size="6.9">文件式投递：GREP 72.5 · VECTOR 72.4 · VECTOR 胜 5/10</text>
  </svg>
  </div>
  <div class="mem-fig-src">ARXIV:2605.15184 · 表 1 · LONGMEMEVAL-S 116 题 · GPT-4O 评分</div>
</figure>

有意思的数字不是差距，而是 harness 那一行。Claude Opus 4.6 在 Chronos 下是 93.1，在 Claude Code 下是 76.7。只换编排层，就移动了 16.4 个百分点；模型一样、语料库一样、检索器也一样。在那一行里，换检索器只让分数移动 1.7 个百分点。只报告检索模式的排行榜，量到的是比较小的那个效应。

接着，文件式投递产生了一个看起来像检索结果、其实是工作流结果的东西。未加权平均收敛了：grep 72.5，vector 72.4。vector 在十组中赢了五组。GPT-5.4 搭配 Codex，从内嵌 grep 的 93.1 掉到程序化 grep 的 55.2——少了 37.9 个百分点——而同一组的程序化 vector 是 67.2。grep 工具没有变差。每一个命中都变成一个必须定位、打开、整合的文件，而这第二阶段失败得够频繁，足以吃掉全部的检索优势。

| 文件式投递让赢家翻盘的地方 | grep | vector | Δ（vector − grep） |
| :--- | ---: | ---: | ---: |
| Claude Opus 4.6 · Chronos | 80.2 | 81.9 | +1.7 |
| Claude Opus 4.6 · Claude Code | 68.1 | 79.3 | +11.2 |
| GPT-5.4 · Codex CLI | 55.2 | 67.2 | +12.0 |
| Gemini 3.1 Pro · Gemini CLI | 81.0 | 82.8 | +1.8 |
| Gemini 3.1 Flash-Lite · Gemini CLI | 68.1 | 74.1 | +6.0 |

只列出翻盘的五组；其余五组在文件式投递下仍由 grep 领先。

实验 2 以固定的会话上限逐步加入干扰项（s5、s10、s20、s30、full）。曲线不是单调的。Chronos 搭配 Opus 在 s5 到 s20 以及 full 都是 vector 领先，但 s30 由 grep 领先，85.3 对 84.5。Claude Code 搭配 Opus 在每一个设置都由 grep 领先。Gemini CLI 搭配 Gemini 3.1 Pro 在每一个设置都由 vector 领先，到 full 时差距拉开到 89.7 对 78.5。论文自己的总结是：噪声增加时，两种方法都只轻微退化，但排序取决于 harness 与骨干模型。

这正是双模块模型会预测的事。干扰项越多，精准的 Search 越有价值——但前提是 Get 能让代理确认字面片段。如果 Get 很贵，第一组结果实际上就是全部的记忆，那么“先求覆盖”的检索就会比较撑得住。论文没有直接量到这个机制。这是一种解读，不是实验结果。

## 为什么内嵌 grep 会赢

有三个性质。只有第一个和字面匹配有关。

1. **handle 和内容一起到达。** 一个 grep 命中就是 `path:line:text`。代理在同一个 token 里拿到预览和地址，可以立刻 Get 周围的范围，不必再 Search 一次。内嵌的 vector 结果常常是一个带分数的区块；地址就算存在，也是模型可能永远看不到的元数据。

2. **失败是可读的。** 写坏的正则表达式会返回空结果，或返回明显不对的东西。代理知道该换一个模式。糟糕的 embedding 则会返回一个看起来很合理的邻居；模型没有任何信号知道自己错过了正确段落。稠密检索失败时很安静，而这是记忆系统最糟的失败方式。

3. **代理控制查询。** 模型自己写模式：可以加锚点、放宽、加文件 glob，或换一个目录。在 vector 工具里，查询是在代理看不到的接口后面重新编码；它只能换个说法，然后祈祷。

这些都不代表字面匹配在任何地方都更好。它只代表：当证据是字面的、而 handle 被保留下来时，字面匹配是更好的 *Search*。论文的局限性章节用不同的话说了同一件事：LongMemEval 的答案经常建立在逐字片段上，这个结果不该推广到大量改写或多模态的语料库。

Codex 的崩跌，正好是说明这对动词为何重要的反例。Search 没问题：同一个 grep 工具、同一个语料库、找到同一类命中。Get 却变成一个三步工作流。模型必须注意到文件路径、打开它、找到相关区域，还要在多个回合之间把状态维持住。当这个循环不可靠时，93.1% 的检索器只生产出 55.2% 的答案。检索质量是必要条件，不是产品本身。

harness 不是包在记忆外面的包装。它就是记忆的形状。

## handle 的契约

一旦 Search 开始返回 handle，难题就转移到 handle 身上。一个好的 handle 有五个性质。

1. **稳定。** 在任务的生命周期内，同一个 handle 解析到同一段字节。如果存储会变动，handle 就必须带着版本。

2. **可解析。** Get 原样接受它。不重新 Search、不做模糊匹配、不猜。

3. **有粒度。** 它指向一个片段，不是整个文件。`path:41-58`，不是 `path`。

4. **生成成本低。** Search 必须能一次返回几十个，而不吃掉上下文预算。

5. **可读。** 人类在日志里看到它，就知道它指向哪里。这不是正确性的必要条件，却是调试的必要条件。

| 存储 | Search 返回 | Get 解析 | 过期模式 |
| :--- | :--- | :--- | :--- |
| 文件 | `path:line` | 行号或字节范围 | 文件被编辑，行号会漂移 |
| Git | `commit:path:line` | `git show commit:path` | 历史被改写，或对象被清除 |
| SQL | 主键或数据行 ID | `SELECT … WHERE id = ?` | 数据行被更新或删除 |
| Web | URL 加片段 | 一个 HTTP GET | 页面改变或返回 404 |
| 向量索引 | 区块 ID 加偏移 | 按 ID 取回 | 重建索引或换模型后重新编号 |
| 对话 | 消息 ID 或回合索引 | 取回该回合 | 压缩改写了对话记录 |

这张表也显示记忆从哪里开始腐坏。每一个家族都有过期模式，而代理比一般应用更快撞上，因为语料库常常就是上下文窗口本身。压缩改写历史。重建索引重新编号区块。一次文件编辑会让后面每一行的行号偏移。代理留下的笔记——三个回合前存下的 handle——就这样变成死链接。

代理记忆里的链接腐化不是外观问题。如果代理无法解析自己写下的 handle，它只剩两条路：重新 Search，花掉一个回合，而且可能得到不同答案；或是根据过期的预览回答，赔上正确性。记忆系统应该把这个选择摊开来：要么 handle 带版本，要么 Get 在解析到不同字节时明确报告不匹配，而不是安静地把错的东西交出去。

一个解析到错误字节的 handle，比 404 还糟。至少 404 是诚实的。

## 把循环当成预算

Search 和 Get 的成本曲线不同。Search 的成本是一次扫描或索引探查，加上一个模型回合来读候选列表。Get 的成本是返回的字节，加上一个模型回合来读它们。前者随语料库规模增长，后者随你选择要读多少而增长。

所以有效的策略是不对称的：Search 要广而便宜，Get 要窄而精确。常见的失败则刚好相反——一次狭窄的 Search，然后 Get 整个文件。代理就是这样花掉 40,000 个 token，去回答一个证据只有一段话的问题。

```python
def browse(cue, memory, budget):
    seen, evidence = set(), []
    while budget.left():
        hits = memory.search(cue, k=8)          # handle，不是副本
        fresh = [h for h in hits if h.id not in seen]
        if not fresh:
            break
        for h in fresh[:3]:
            seen.add(h.id)
            span = memory.get(h, window=40)     # 地址上的确切字节
            evidence.append(span)
            cue = next_cue(cue, span)           # 新词、日期或 ID
    return evidence
```

有三个细节很重要。`hits` 是一串 handle，不是段落；预览是拿来排序的，不是拿来当证据的。`memory.get` 接受一个窗口，所以代理可以扩大命中周围的上下文，而不必读整个文件。`next_cue` 把循环闭合：记录本身提供下一个搜索词，这才是“翻阅”，而不只是“查询”。

停止规则不是“读了 k 条结果”，而是“没有新的 handle”或“每一个主张都有已解析的来源”。停在 k 的循环，等于把记忆变回引文服务。

该量什么，也从循环推得出来：每个答案几次 Search、每次 Search 几次 Get、不重复的 handle 数、死 handle 比率，以及重新搜索率。只看准确率，无法告诉你记忆是否真的可翻阅。一个返回高分、却只给得出少数可解析 handle 的系统，是搜索引擎，不是记忆。

## 记忆测试台

下面的测试台把这个分工变得可见。同一个线索命中三条记录。Search 把它们排序，Get 把它们读出来。只有一条是现行政策。

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">记忆测试台 // 03</span>
    <h3 class="mem-fig-title">三个 handle 命中，只有一条是现行版本</h3>
    <p class="mem-fig-sub">选一条搜索结果，然后读 Get 实际返回的内容。Search 排序，Get 决定。</p>
  </figcaption>
  <div class="mem-query">
    <span class="mem-query-tag">线索</span>
    <code>"refund window"</code>
    <span class="mem-query-meta">支持语料库 · 4,812 条记录</span>
  </div>
  <div class="mem-desk">
    <div class="mem-results">
      <div class="mem-col-head">SEARCH // 3 个 HANDLE</div>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h1" checked>
        <span class="mem-rank">01</span>
        <span class="mem-addr">policies/returns-2024.md:41</span>
        <span class="mem-score">0.94</span>
        <span class="mem-snippet">退款须于到货后 30 天内提出…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h2">
        <span class="mem-rank">02</span>
        <span class="mem-addr">policies/2026-returns.md:12</span>
        <span class="mem-score">0.89</span>
        <span class="mem-snippet">退款须于到货后 14 天内提出…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h3">
        <span class="mem-rank">03</span>
        <span class="mem-addr">tickets/8841.json:7</span>
        <span class="mem-score">0.81</span>
        <span class="mem-snippet">客户询问退款期限，被告知 30 天…</span>
      </label>
    </div>
    <div class="mem-read">
      <div class="mem-col-head">GET // 确切字节</div>
      <div class="mem-doc mem-doc--a">
        <div class="mem-doc-head"><span>policies/returns-2024.md</span><span>L41–L46</span></div>
        <pre>41  ## 退款
42
43  退款须于到货后 30 天内提出。
44  拆封软件恕不退换。
45
46  生效：2024-03-01 · 状态：已被取代</pre>
      </div>
      <div class="mem-doc mem-doc--b">
        <div class="mem-doc-head"><span>policies/2026-returns.md</span><span>L12–L17</span></div>
        <pre>12  ## 退款
13
14  退款须于到货后 14 天内提出。
15  拆封软件恕不退换。
16
17  生效：2026-01-01 · 状态：现行</pre>
      </div>
      <div class="mem-doc mem-doc--c">
        <div class="mem-doc-head"><span>tickets/8841.json</span><span>L7–L10</span></div>
        <pre>7   “客户询问退款期限，
8    被告知 30 天。这样还
9    正确吗？”
10  source: null · 工单，不是政策</pre>
      </div>
    </div>
  </div>
  <div class="mem-verdict mem-verdict--a">
    <b>过期版本</b>
    <p>字节是真的，但政策已于 2026-01-01 被取代。排名 01 只是最相似的记录，不是现行的这一条。</p>
  </div>
  <div class="mem-verdict mem-verdict--b">
    <b>现行来源</b>
    <p>这条记录自己带着生效日与状态。Get 能判断，因为字节会描述自己；Search 没办法。</p>
  </div>
  <div class="mem-verdict mem-verdict--c">
    <b>提及，不是来源</b>
    <p>摘要片段重复了那个词，但没有定义规则。handle 可以解析到一条根本不该被引用的记录。</p>
  </div>
  <div class="mem-fig-src">示意 · 纯 CSS · 无 JavaScript</div>
</figure>

排名第一的命中，是过期的那一条。这不是 Search 的 bug；这是排序所能知道的边界。现行政策比较短、用了不同的说法，所以排在第二。Get 之所以能定案，是因为记录自己带着生效日与状态。

如果记录没有带着这些元数据，Get 只会返回字节，代理仍然只能猜。handle 解析的是位置；出处脉络解析的是意义。

## 实践上要改什么

- 让每一个 Search 结果都带着 Get 能吃的 handle。`path:line`、`doc_id#anchor`、`table:pk`、`commit:path:line`。

- 把 Get 做成一级工具，而不是藏在 Search 里的一个步骤。它要能原样接受 handle，返回确切字节，或明确说找不到。

- 让 Get 接受范围。读整个文件，就是记忆系统变成上下文漏洞的开始。

- 让 handle 在压缩与重建索引之后仍然稳定。存储变动时给它们版本，遇到不匹配就明确报错。

- 给 Search 不只一种工具。已知项目用字面搜索，改写用语义搜索，结构用筛选。让代理按照策略提示自己选，而不是写死一条流水线。

- 把预览当预览。如果模型从头到尾只看到摘要片段，它就会用摘要片段回答。

- 把出处放进记录里。生效日、状态、来源类型与版本，应该在 Get 返回的字节里，而不是在代理看不到的侧通道。

- 报告检索器时，也报告 harness。没有投递路径与停止策略的分数，无法重现。

## 论文没有说的事

它没有说 grep 在一般情况下都赢过 vector。作者讲得很清楚：这个任务奖励字面片段；科学综述、大量改写的摘要、可视化文档与代码语义，可能更适合稠密检索或混合检索。

harness 既是一个变量，也是一个混杂因素。Chronos 使用按类别调整的提示与受控的工具接口；CLI 则带着自己的使用体验。16.4 个百分点的 harness 位移是真的，但它不是“harness 质量”的干净估计。

文件式投递是一个工作流测试，不是单纯的投递测试。它改变了回合数、失败面，以及模型弄丢状态的机会。Codex 的崩跌是关于循环的证据，不是关于 grep 的证据。

噪声实验不是单调的，论文也没有隔离查询字符串或检索到的集合。交叉点是量出来的；机制是推断出来的。

最重要的是，论文量的是答案准确率，不是记忆。它没有测试代理明天能不能回到同一个来源、把它扩大、引用它，或发现它变了。而这些正是双模块框架关心的性质。一个真正的记忆基准测试，必须直接量这些东西。

Grep 不是全部。Grep 是一对。问题不是你要装哪一种索引，而是你的记忆有没有把两个动词都暴露出来。

Search 找到地址。Get 读到书架。循环让它成为记忆。

## 参考资料

- [Is Grep All You Need? How Agent Harnesses Reshape Agentic Search](https://arxiv.org/abs/2605.15184)——本文讨论的论文：116 题 LongMemEval-S、四种 harness、两种检索器、两种投递路径。
- [LongMemEval](https://arxiv.org/abs/2410.10813)——两个实验都用到的长期对话记忆基准测试。
- [Chronos](https://arxiv.org/abs/2603.16862)——自制 harness 与结构化时间事件层。
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)——本文正在争论的“先检索、再生成”流水线。
- [MemGPT](https://arxiv.org/abs/2310.08560)——把记忆当成操作系统，在上下文与存储之间分页。
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)——为什么更多检索文本不等于更好用。
- [grep, POSIX](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html)——本文把它的输出形状当成一种接口。

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
