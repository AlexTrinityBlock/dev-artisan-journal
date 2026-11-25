---
title: "先 Search，再 Get：代理记忆的两个模块"
description: "代理记忆不是一个模块，而是两个。Search 把语料库缩成排过序的句柄，Get 把一个句柄展开成完整、现行的记录。一篇关于“找到”与“读到”之间那道接缝的架构文章。"
pubDate: 2026-11-23
category: "AI"
tags: ["代理", "记忆", "RAG", "检索", "架构"]
featured: false
author: "Alex.Hsiao"
readTime: "13 分钟"
---

# 先 Search，再 Get：代理记忆的两个模块

## 简单版：两个动作

<section class="mem-lead">
  <div class="mem-lead-head">
    <span class="card-tag">两个模块 // 00</span>
    <p class="mem-lead-kicker">多数代理记忆系统不是败在嵌入模型，而是败在“找到”与“读到”之间那道接缝。</p>
    <h3 class="mem-lead-title">代理的记忆，只有两个动作。</h3>
    <p class="mem-lead-sub">先找，再读。Search 把语料库缩成候选；Get 把一个候选展开成记录。</p>
  </div>
  <div class="mem-lead-grid">
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mem-lead-tag">SEARCH // 找</div>
      <h4>问一个问题，拿回一份清单</h4>
      <p>就像在搜索框里打字。它返回带分数与预览的句柄，可能三个，也可能一个都没有。</p>
      <div class="mem-lead-meta">查询 → N 个句柄</div>
    </div>
    <div class="mem-lead-plus" aria-hidden="true">+</div>
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg></div>
      <div class="mem-lead-tag">GET // 读</div>
      <h4>打开一个句柄，读到记录</h4>
      <p>就像点开其中一个结果。它返回完整、现行的记录：全文、元数据、版本。不猜、不排序。</p>
      <div class="mem-lead-meta">句柄 → 完整记录</div>
    </div>
  </div>
  <div class="mem-lead-flow mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 170" role="img" aria-labelledby="mem-f0-title mem-f0-desc">
    <title id="mem-f0-title">一个简单的 Search → Get 流程</title>
    <desc id="mem-f0-desc">一个线索进入 Search，返回三个句柄。选其中一个交给 Get，Get 返回完整记录。虚线箭头把证据带回成新线索。</desc>
    <defs>
      <marker id="mem-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-lead-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">简单流程 // 一次 SEARCH，一次 GET</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一次搜索 · 多个句柄 · 一条记录</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="112" height="72" class="term"/>
    <text x="36" y="60" class="f" font-size="6.8" letter-spacing="0.8">线索</text>
    <text x="36" y="76" class="t mono" font-size="7.8">退款期限</text>
    <text x="36" y="94" class="m" font-size="6.8">查询 + 筛选</text>
    <line x1="136" y1="80" x2="152" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="156" y="44" width="170" height="72" class="box"/>
    <svg x="168" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <text x="192" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="192" y="80" class="m" font-size="7">排序候选</text>
    <text x="168" y="104" class="f" font-size="6.8">grep · BM25 · vector · 混合</text>
    <line x1="326" y1="80" x2="342" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <text x="358" y="58" class="f" font-size="6.8" letter-spacing="0.6">3 个句柄 · 打开一个</text>
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
    <text x="580" y="80" class="m" font-size="7">解析一个</text>
    <text x="556" y="104" class="f" font-size="6.8">完整记录</text>
    <line x1="714" y1="80" x2="730" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <text x="744" y="58" class="f" font-size="6.6" letter-spacing="0.6">记录</text>
    <line x1="744" y1="70" x2="806" y2="70" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="80" x2="794" y2="80" stroke="var(--mono-ink)" stroke-width="1"/>
    <line x1="744" y1="90" x2="806" y2="90" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="100" x2="786" y2="100" stroke="var(--mono-l5)" stroke-width="1"/>
    <text x="744" y="112" class="m" font-size="6.4">一条记录</text>
    <path d="M775 120 V140 H80 V118" class="dash" fill="none" marker-end="url(#mem-lead-arrow-muted)"/>
    <text x="427" y="154" class="f" font-size="6.9" text-anchor="middle" letter-spacing="0.6">证据 → 新线索 · 再次 SEARCH</text>
  </svg>
  </div>
  <p class="mem-lead-note"><b>Search</b> 找到候选，<b>Get</b> 产生证据。真正的工程，藏在两者之间的契约里。</p>
</section>

<p class="mem-lead-bridge">这个分类很小：一个动词是集合值的，另一个是单一的。大部分设计工作，都从“不要让它们混在一起”开始——在索引里、在句柄里、在循环里。</p>

## 两个动词，一个记忆

Search 是集合值的。它接受一个线索——字面字符串、正则表达式、自然语言问题、元数据筛选——然后返回候选。它可以近似、可以排序、可以有界。它的工作是在预算内取得召回，不是保证真理。

Get 是单一的。它接受一个地址，返回该地址上的记录，或一个明确的“找不到”。它是记忆的主键查询：地址进，记录出。它不被允许排序、摘要，或拿一个邻居来代替。它的工作是解析。

把两者接起来的单位是 **handle（句柄）**：一个存储片段的稳定名称。`src/auth/session.ts:42`、`orders/1841#L12`、`4f2c9a1:docs/spec.md`、`chunk_01H8...`、`message 118`。句柄不是内容本身；它是“这份内容可以再次被生成”的承诺。

一个无法再次解析的检索结果，不是记忆。它是一段引文。

贴进提示里的 top-k 区块就是引文。它们或许能回答眼前这题，但无法被重访、无法被扩大，也无法拿来和新版本对照。一个带有文件与行号的 grep 命中则是记忆：代理可以离开、去做别的事，再回来读同一段字节。

这一对动词并不对称。Search 是缩减：许多记录变成少数候选。Get 是展开：一个候选变成一份带着元数据的完整记录。Search 刻意丢掉信息，因为上下文装不下整个语料库；Get 把重要的那部分还原，因为答案需要的是记录本身，不是“看起来很像”。如果两端都在缩减，代理永远看不到一份完整的记录；如果两端都在展开，上下文会被索引碰过的所有东西塞满。

这个循环才是“翻阅”的意思：线索 → Search → 句柄 → 选择 → Get → 证据 → 新线索。没有目录的图书馆不能用；只有目录、没有书架的图书馆，则只是一份书目。代理两半都需要。

## 架构：索引、句柄、记录

一个同时提供两个动词的记忆库，有三层，而这三层的工作不一样。

1. **索引**是衍生的、可重建的、有损的。对文件而言，它可能就是语料库本身加上一个扫描器；对 BM25 而言，它是倒排索引；对稠密检索而言，它是建在嵌入上的 ANN 结构；对混合检索而言，它是两者融合。索引存在的目的是快速找到候选。它可以落后、可以不完整、可以近似。

2. **句柄**是一个很小的、可寻址的指针。它指向一份记录，或记录里的一个片段，并且带着足够的上下文，让这个名字之后还能被解析：存储、ID、片段、版本、权限范围。它生成成本低，传递成本也低。

3. **记录库**是权威。它保存全文、元数据、版本与权限。它是明天还必须为真的那个东西。

分工就是这条不变式：

- Search 读索引，不读记录库。
- Get 读记录库，不读索引。
- 索引可以从记录重建。记录不能从索引重建。

最后这一行，就是判断一个系统有“记忆”还是只有“检索”的测试。如果一个事实的唯一副本只活在嵌入里，那它不是记忆，而是一个带着向量的传言。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">系统地图 // 01</span>
    <h3 class="mem-fig-title">索引负责找到，记录库负责定案。</h3>
    <p class="mem-fig-sub">Search 从衍生索引排出句柄。Get 拿一个句柄到权威记录库解析。证据进入上下文，下一个回合从那里开始。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 360" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">代理记忆的架构</title>
    <desc id="mem-f1-desc">规划器把查询送进 Search。Search 探查由 grep、BM25、vector 或混合检索组成的衍生索引，返回带有 ID、分数与预览的排序句柄。Get 拿一个句柄到权威记录库解析，记录库保存全文、元数据、权限与版本。证据进入上下文，下一个回合再回馈给规划器。</desc>
    <defs>
      <marker id="mem-arch-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arch-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">记忆 // 架构</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">查询 → 句柄 → 记录 → 上下文</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="176" y="46" class="f" font-size="7" letter-spacing="1.1">01 / 寻找</text>
    <text x="590" y="46" class="f" font-size="7" letter-spacing="1.1">02 / 读取</text>
    <rect x="24" y="58" width="126" height="92" class="box"/>
    <text x="36" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">代理 / 规划器</text>
    <text x="36" y="92" class="m" font-size="6.4">规划下一步</text>
    <rect x="36" y="102" width="102" height="20" class="term"/>
    <text x="44" y="116" class="m mono" font-size="6.3">任务 · 回合 · 预算</text>
    <text x="36" y="140" class="f" font-size="6.2" letter-spacing="0.6">写出查询</text>
    <line x1="150" y1="112" x2="172" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="58" width="152" height="92" class="box"/>
    <text x="188" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="188" y="92" class="m" font-size="6.4">查询 + 筛选</text>
    <rect x="188" y="102" width="128" height="30" class="term"/>
    <text x="196" y="114" class="t mono" font-size="6.2">"refund window"</text>
    <text x="196" y="125" class="m mono" font-size="6.2">after:2026-01-01</text>
    <text x="188" y="143" class="f" font-size="6.2" letter-spacing="0.6">返回句柄</text>
    <line x1="328" y1="112" x2="350" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="354" y="58" width="170" height="92" class="box"/>
    <text x="366" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">索引</text>
    <text x="366" y="92" class="m" font-size="6.4">衍生 · 可重建</text>
    <rect x="366" y="100" width="46" height="20" class="term"/>
    <text x="389" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">GREP</text>
    <rect x="418" y="100" width="46" height="20" class="term"/>
    <text x="441" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">BM25</text>
    <rect x="470" y="100" width="46" height="20" class="term"/>
    <text x="493" y="113" class="t mono" font-size="6.4" font-weight="700" text-anchor="middle">VECTOR</text>
    <rect x="366" y="122" width="150" height="16" class="term"/>
    <text x="441" y="134" class="m mono" font-size="6.3" text-anchor="middle">混合 · 融合 + 重排</text>
    <text x="366" y="147" class="f" font-size="6.1" letter-spacing="0.6">扫描或 ANN 探查</text>
    <line x1="524" y1="112" x2="546" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="550" y="58" width="266" height="92" class="box"/>
    <text x="562" y="76" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">排过序的句柄</text>
    <text x="562" y="88" class="m" font-size="6.4">ID · 分数 · 预览</text>
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
    <text x="692" y="172" class="f" font-size="6.2" letter-spacing="0.6">已选一个</text>
    <rect x="590" y="188" width="190" height="88" class="box"/>
    <text x="602" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="602" y="221" class="m" font-size="6.4">一个句柄进</text>
    <rect x="602" y="229" width="166" height="30" class="term"/>
    <text x="610" y="241" class="t mono" font-size="6.2">2026-returns.md:12</text>
    <text x="610" y="252" class="m mono" font-size="6.2">窗口 = 40 行</text>
    <text x="602" y="270" class="f" font-size="6.2" letter-spacing="0.6">记录出 · 不排序</text>
    <line x1="590" y1="232" x2="554" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="344" y="188" width="208" height="88" class="box"/>
    <text x="356" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">记录库</text>
    <text x="356" y="221" class="m" font-size="6.4">权威 · 带版本</text>
    <text x="356" y="237" class="m" font-size="6.2">全文 · 来源类型</text>
    <text x="356" y="248" class="m" font-size="6.2">状态 · 生效日</text>
    <text x="356" y="259" class="m" font-size="6.2">权限 · 拥有者</text>
    <text x="356" y="270" class="m" font-size="6.2">版本 / 内容哈希</text>
    <line x1="344" y1="232" x2="322" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="188" width="144" height="88" class="box"/>
    <text x="188" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">证据</text>
    <text x="188" y="221" class="m" font-size="6.4">已解析的字节</text>
    <text x="188" y="238" class="m" font-size="6.2">现行政策</text>
    <text x="188" y="250" class="m" font-size="6.2">生效 2026-01-01</text>
    <text x="188" y="262" class="m" font-size="6.2">引用：L12–L17</text>
    <line x1="176" y1="232" x2="154" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="24" y="188" width="128" height="88" class="box"/>
    <text x="36" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">上下文</text>
    <text x="36" y="221" class="m" font-size="6.4">提示 · 回合</text>
    <text x="36" y="238" class="m" font-size="6.2">证据进入</text>
    <text x="36" y="250" class="m" font-size="6.2">token 预算</text>
    <text x="36" y="262" class="m" font-size="6.2">下一回合 →</text>
    <path d="M88 188 V152" class="dash" fill="none" marker-end="url(#mem-arch-arrow-muted)"/>
    <text x="96" y="174" class="f" font-size="6.2" letter-spacing="0.6">新线索</text>
    <rect x="24" y="292" width="792" height="48" class="codebox"/>
    <text x="40" y="309" class="t mono" font-size="7.2" font-weight="700">SEARCH：语料库 → 候选 · 只返回句柄，不返回记录。</text>
    <text x="40" y="323" class="t mono" font-size="7.2" font-weight="700">GET：句柄 → 记录 · 只返回记录，不做排序。</text>
    <text x="40" y="337" class="m mono" font-size="6.5">索引是衍生、可丢弃的。记录库才是权威。</text>
  </svg>
  </div>
  <div class="mem-fig-src">架构 · 两个动词 · 一种句柄 · 不共用排序</div>
</figure>

读这张图的方式，是上排从左到右，下排从右到左。规划器写出查询；Search 探查衍生索引；索引返回句柄；Get 拿一个句柄到权威记录库解析；证据进入上下文；下一个回合从那里开始。那条反馈箭头不是装饰。记录本身会提供下一个线索。

同样的形状，可以覆盖非常不同的部署。文件加上 `grep` 与 `sed`，是退化后的特例：索引和记录库是同一个目录。向量数据库加上对象存储，再加上一张 SQL 元数据表，是分离后的特例。对话记录加上回合索引，是第三种。无论哪一种，接口都一样，不变式也一样：负责排序的东西，不是负责定案的东西。

## Search：把语料库缩成候选

接口很小：

```python
hits = search(query, filters, k)
# -> [Handle(id, score, preview), ...]
```

查询可以是字面字符串、正则表达式、词袋、自然语言问题，或结构化筛选。实现可以是 grep、BM25、ANN 索引，或几种方法的融合。没有一种在任何情况下都最好。当代理知道字符串时，字面搜索很精确；词汇重叠时，BM25 很强；改写与同义词交给稠密检索；代理不确定该用哪一种时，混合检索兜底。

筛选通常被低估，值得更多注意。时间、路径、租户、类型、状态、来源，都是在相似度计算之前，低成本地裁掉整片语料库的方法。一个日期筛选就能排除一整类错误答案，完全不必动到嵌入。筛选是查询的一部分，不是结果出来之后才补的动作。

Search 先顾召回，再顾精确率。如果正确的记录不在候选集里，Get 再厉害也救不回来。所以 `k` 必须大到足以覆盖合理的答案，候选集也必须够多元，不能让单一排序函数把它压扁。有了召回，才轮到排序前段的精确率，因为规划器最多只会读几条。`k` 是预算决策，不是质量旋钮：返回五十个句柄很便宜，返回五十份记录可不便宜。

这就是 Search 应该返回句柄、而不是内容的原因。

- **上下文预算。** 一份清单应该每个条目只花几十个 token，而不是几千个。只有活下来的候选，才需要抓完整记录。
- **延后解析。** 规划器可以选择、重问、扩大，或停手。内嵌段落则是把选择锁在检索的那一刻。
- **验证。** 新鲜度与权限是在 Get 检查的。一段直接贴进提示的段落，已经跳过了这个检查。
- **单一排序权威。** 如果 Search 直接返回段落，排序模型的第一名就悄悄变成了答案。规划器根本没有比较的机会。

当 Search 把段落内嵌返回，它已经花掉上下文，也已经替代理做了选择。模型不能把段落扩大，不能确认有没有更新版本，也不能精确引用一个片段。分数变成了答案。

还有一个可读性的理由。字面搜索失败得很明显：空结果或明显不匹配，会告诉代理该换一个模式。稠密搜索失败得很合理：最近邻索引就算没有好答案，也会返回一个邻居——除非系统应用阈值，并且说出来。一个说不出“我没找到”的记忆系统，会捏造出一段连续的故事。返回实际跑过的查询、套用的筛选，以及一个置信信号。找不到，也是信息。

这些都不代表某一种工具在任何地方都更好。它代表工具应该是规划器可以推理的选择。Search 应该提供不只一种检索方式，并且在第一次失败时，让代理换一种。

## Get：把一个句柄展开成证据

另一半刻意很无聊：

```python
record = get(handle, window=None)
# -> Record(text, metadata, version, scope) | Miss | Mismatch
```

Get 原样接受句柄。它不重新跑 Search、不对 ID 做模糊匹配、不挑“最好的那一段”。它解析地址，返回记录。

展开的意思是：不只返回命中的那一行。Get 应该返回所在的段落、文档标题、生效日、状态、来源类型与版本。代理需要记录对自己的描述，才能判断它适不适用。一行没有生效日的政策，只是一段引文。一张提到政策的工单，不是政策。

新鲜度是第一个难题。索引是快照，记录会动。Get 应该读到现行记录，或在句柄指定版本时读到那个版本的快照，并且报告它实际服务的是哪个版本。如果句柄指定一个版本，而存储已经更新，Get 返回不匹配，附上两个版本。它绝不会默默解析到不同的字节。

权限是第二个。Search 检索的语料库，可能比调用者的可读范围更广。预览可能泄露标题、路径或摘要，即使正文受到保护。在 Search 过滤，在 Get 强制执行，而且只从调用者读得到的字段生成预览。句柄应该带着权限范围，或者至少不能被猜中；但难以猜中不是授权。

成本是第三个。Get 的成本是返回的字节，加上读它们的那一个回合。给它一个窗口、一个字节上限、一个 token 估算。读整份文档，就是记忆系统变成上下文漏洞的开始。记录很大时，返回结构化的切片：标题路径、相关段落、元数据，以及其余部分的指针。不要在 Get 里摘要。摘要是写入时或规划时的决定，不是读取时偷偷做的替换。

版本是第四个。每一份记录都需要版本：哈希、ETag、commit、`updated_at`。句柄可以固定住它。Get 返回实际服务的版本，规划器才能缓存证据，也知道什么时候该刷新。版本不是形式。它是“这份政策”与“索引建立时曾经为真的某份政策”之间的差别。

而 Get 永远不排序。如果 Get 开始挑“最好的段落”，排序就渗进了读取路径。于是两个组件都在排序，却没有一个为结果负责；句柄也不再代表“这份记录”，而是“这附近某个东西”。

## 句柄的契约

一旦 Search 开始返回句柄，难题就转移到句柄身上。一个好的句柄有五个性质。

1. **稳定。** 在任务的生命周期内，同一个句柄解析到同一份记录版本。不可变的 ID 比行号好；如果存储会变动，句柄就带着版本。`path:41-58` 比 `path` 稳定，但一次文件编辑仍会让后面每一行的行号偏移。

2. **可寻址。** Get 原样接受它。不重新 Search、不做模糊匹配、不猜。句柄是一个名字，加上足够解析它的上下文：存储、ID、片段、版本、权限范围。

3. **可预览。** 它带着一小段预览，或能低成本地取得，供排序与日志使用。预览不是证据，它是打开记录的理由。

4. **带权限。** 它带着或暗示一个范围，并由 Get 强制执行。Search 不该生成调用者永远解析不到的句柄，预览也不该揭露记录会隐藏的内容。

5. **带版本。** 它固定住一个版本，或报告解析到的版本。不匹配是一个正式的响应，不是可以吞掉的异常。

一个可用的形状大概长这样：

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

| 存储 | Search 返回 | Get 解析 | 过期模式 |
| :--- | :--- | :--- | :--- |
| 文件 | `path:line` | 行号或字节范围 | 文件被编辑，行号会漂移 |
| Git | `commit:path:line` | `git show commit:path` | 历史被改写，或对象被清除 |
| SQL | 主键或数据行 ID | `SELECT … WHERE id = ?` | 数据行被更新或删除 |
| Web | URL 加片段 | 一个 HTTP GET | 页面改变或返回 404 |
| 向量索引 | 区块 ID 加偏移 | 按 ID 取回 | 重建索引或换模型后重新编号 |
| 对话 | 消息 ID 或回合索引 | 取回该回合 | 压缩改写了对话记录 |

这张表也显示记忆从哪里开始腐坏。每一个家族都有过期模式，而代理比一般应用更快撞上，因为语料库常常就是上下文窗口本身。压缩改写历史。重建索引重新编号区块。一次文件编辑会让后面每一行的行号偏移。代理留下的笔记——三个回合前存下的句柄——就这样变成死链接。

代理记忆里的链接腐化不是外观问题。如果代理无法解析自己写下的句柄，它只剩两条路：重新 Search，花掉一个回合，而且可能得到不同答案；或是根据过期的预览回答，赔上正确性。记忆系统应该把这个选择摊开来：要么句柄带版本，要么 Get 在解析到不同字节时明确报告不匹配，而不是默默把错的东西交出去。

一个解析到错误字节的句柄，比 404 还糟。至少 404 是诚实的。

## 把循环当成预算

Search 和 Get 的成本曲线不同。Search 的成本是一次扫描或索引探查，加上一个模型回合来读候选清单。Get 的成本是返回的字节，加上一个模型回合来读它们。前者随语料库规模增长，后者随你选择要读多少而增长。

所以有效的策略是不对称的：Search 要广而便宜，Get 要窄而精确。常见的失败则刚好相反——一次狭窄的 Search，然后 Get 整份文件。代理就是这样花掉几万个 token，去回答一个证据只有一段话的问题。

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

有三个细节很重要。`hits` 是一串句柄，不是段落；预览是拿来排序的，不是拿来当证据的。`memory.get` 接受一个窗口，所以代理可以扩大命中周围的上下文，而不必读整份文件。`next_cue` 把循环闭合：记录本身提供下一个搜索词，这才是“翻阅”，而不只是“查询”。

停止规则不是“读了 k 条结果”，而是“没有新的句柄”或“每一个主张都有已解析的来源”。停在 k 的循环，等于把记忆变回引文服务。

上下文预算是另一半。每一次 Get 都会挤掉工作状态：指令、当前计划、先前的证据。证据应该花在答案真正需要的主张上。一个抓了十几份记录、只用了一份的系统，付了十几次读取的成本，只换到一个答案。要追踪的是“每个已解析主张花掉多少字节”，不是“每个回合花掉多少字节”。

该测什么，也从循环推得出来：每个答案几次 Search、每次 Search 几次 Get、不重复的句柄数、死句柄比率、重新搜索率，以及每个已解析主张的字节数。只看准确率，无法告诉你记忆是否真的可翻阅。一个返回高分、却只给得出少数可解析句柄的系统，是搜索引擎，不是记忆。

## 记忆测试台

下面的测试台把这个分工变得可见。同一个线索命中三条记录。Search 把它们排序，Get 把它们读出来。只有一条是现行政策。

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">记忆测试台 // 02</span>
    <h3 class="mem-fig-title">三个句柄命中。只有一条记录是现行版。</h3>
    <p class="mem-fig-sub">选一条搜索结果，然后读 Get 实际返回的内容。Search 排序，Get 决定。</p>
  </figcaption>
  <div class="mem-query">
    <span class="mem-query-tag">线索</span>
    <code>"refund window"</code>
    <span class="mem-query-meta">支持语料库 · 4,812 条记录</span>
  </div>
  <div class="mem-desk">
    <div class="mem-results">
      <div class="mem-col-head">SEARCH // 3 个句柄</div>
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
      <div class="mem-col-head">GET // 确切记录</div>
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
    <p>摘要片段重复了那个词，但没有定义规则。句柄可以解析到一条根本不该被引用的记录。</p>
  </div>
  <div class="mem-fig-src">示意 · 纯 CSS · 无 JavaScript</div>
</figure>

排名第一的命中，是过期的那一条。这不是 Search 的 bug；这是排序所能知道的边界。现行政策比较短、用了不同的说法，所以排在第二。Get 之所以能定案，是因为记录自己带着生效日与状态。

如果记录没有带着这些元数据，Get 只会返回字节，代理仍然只能猜。句柄解析的是位置；出处脉络解析的是意义。

## 实践上要改什么

API 是两个函数与一种句柄。真正的工作在 schema 里。

```python
# Search returns handles. It never returns records.
hits = memory.search("refund window", filters={"after": "2026-01-01"}, k=8)
# -> [Handle(id=..., score=0.94, preview="..."), ...]

# Get resolves one handle. It never ranks.
record = memory.get(hits[0], window=40)
# -> Record(text=..., metadata={...}, version="sha256:...", scope="tenant:acme")
```

- **一种句柄，两个动词。** 如果 Search 和 Get 各自发明一套地址格式，接缝就变成翻译层，而翻译一定会漂移。

- **Search 返回带预览的句柄，不返回完整记录。** 预览是打开记录的理由，不是记录的替代品。

- **Get 是一级工具。** 它原样接受句柄，返回确切记录或明确的找不到。它不是藏在 Search 里的一个步骤。

- **Get 接受片段或窗口。** 读整份文件，就是记忆系统变成上下文漏洞的开始。设置字节上限，并在规划器投入之前报告 token 估算。

- **把出处放进记录里。** 生效日、状态、来源类型、版本与权限，应该在 Get 返回的字节里，而不是在代理看不到的侧通道。

- **让索引保持可衍生。** 换嵌入模型时，从记录重建它。不要让索引成为一个事实的唯一副本。

- **权限要做两次。** 在 Search 过滤，在 Get 强制执行，而且只从可读字段生成预览。标题外泄也是外泄。

- **每个句柄都带版本，而且错误要明显。** 不匹配比一个看起来是最新的错误答案便宜。

- **提供不只一种搜索工具。** 已知条目用字面，词汇重叠用 BM25，改写用稠密，结构用筛选。让规划器选，或按查询类型路由。

- **测量循环。** 每个答案几次 Search、每次 Search 几次 Get、不重复句柄、死句柄、重新搜索、每个已解析主张的字节数。只看准确率，会把接缝藏起来。

## 失败模式

多数记忆失败不是模型失败，而是契约失败，而且集中在两个边界：索引与记录库。

| 失败 | 哪里出错 | 设计对策 |
| :--- | :--- | :--- |
| Search 漏找 | 查询词汇对不上记录，或稠密索引返回一个看起来很合理的邻居。正确记录从未进入候选集。 | 提供不只一种工具，让规划器从证据改写查询，提早套用筛选，并在信心不足时明确返回空结果。 |
| 句柄过期 | 记录被编辑、重建索引或压缩。句柄还能解析，但解析到不同的字节。 | 句柄带版本、记录做哈希，解析到不同内容时报告不匹配，附上两个版本，而不是默默返回。 |
| 权限外泄 | Search 排序了调用者读不到的文件，或预览露出了标题与摘要。 | 在 Search 按范围过滤，在 Get 强制执行，预览只从可读字段生成。不要把“ID 猜不到”当成授权。 |
| Get 太贵 | 规划器读整份文件，或重复 Get 同一条，证据把工作状态挤掉。 | 要求片段或窗口，限制字节与 token，按版本缓存已解析记录，并把读取算进回合预算。 |
| 无限循环 | 每一份记录都提供新线索，seen-set 里没有重复句柄，循环永远到不了主张。 | 保留 seen-set，限制回合与字节，没有新句柄或主张都已解析就停；重复线索是换工具的信号。 |
| 句柄碰撞 | 重建索引或合并之后，两份记录共用一个 ID，句柄解析到错的那一份。 | 按存储命名空间化 ID，记录 ID 不可变，句柄包含版本，生成句柄时检查碰撞。 |

这些失败并不对称。Search 漏找很便宜：代理看到空清单，换一个查询就好。Get 失败很贵：代理已经花掉上下文，而且可能没发现记录过期、读不到，或根本是错的那一份。这个不对称，就是 Get 需要更严格契约的原因，也是“检索分数很高”不能当成记忆指标的原因。

这两个模块不是装一次就好的流水线，而是一种必须维持的分工：Search 缩减，Get 展开，句柄在中间带着承诺，循环负责花预算。接缝撑得住时，代理才能找到东西、离开、再回来，而且说的还是同一份记录。

## 参考资料

- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)——这篇文章讨论的“先检索、再生成”流水线。
- [MemGPT](https://arxiv.org/abs/2310.08560)——把记忆当成操作系统，在上下文与存储之间分页。
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)——为什么更多检索文本，不等于更好用。

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
