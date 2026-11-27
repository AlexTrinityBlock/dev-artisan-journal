---
title: "先 Search，再 Get：代理記憶的兩個模組"
description: "代理記憶不是一個模組，而是兩個。Search 把語料庫縮成排序過的文章編號，Get 把一個文章編號展開成完整、現行的記錄。一篇關於「找到」與「讀到」之間那道接縫的架構文章。"
pubDate: 2026-11-23
category: "AI"
tags: ["代理", "記憶", "RAG", "檢索", "架構"]
featured: false
author: "Alex.Hsiao"
readTime: "13 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "MemGPT 記憶階層圖：固定上下文視窗，加上由函式管理的 archival 與 recall 儲存"
---

# 先 Search，再 Get：代理記憶的兩個模組

## 簡單版：兩個動作

<section class="mem-lead">
  <div class="mem-lead-head">
    <span class="card-tag">兩個模組 // 00</span>
    <p class="mem-lead-kicker">多數代理記憶系統不是敗在嵌入模型，而是敗在「找到」與「讀到」之間的那道接縫。</p>
    <h3 class="mem-lead-title">代理的記憶，只有兩個動作。</h3>
    <p class="mem-lead-sub">先找，再讀。Search 把語料庫縮成候選；Get 把一個候選展開成記錄。</p>
  </div>
  <div class="mem-lead-grid">
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mem-lead-tag">SEARCH // 找</div>
      <h4>問一個問題，拿回一份清單</h4>
      <p>就像在搜尋框裡打字。它回傳帶分數與預覽的文章編號，可能三個，也可能一個都沒有。</p>
      <div class="mem-lead-meta">查詢 → N 個文章編號</div>
    </div>
    <div class="mem-lead-plus" aria-hidden="true">+</div>
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg></div>
      <div class="mem-lead-tag">GET // 讀</div>
      <h4>打開一個文章編號，讀到記錄</h4>
      <p>就像點開其中一個結果。它回傳完整、現行的記錄：全文、中繼資料、版本。不猜、不排序。</p>
      <div class="mem-lead-meta">文章編號 → 完整記錄</div>
    </div>
  </div>
  <div class="mem-lead-flow mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 170" role="img" aria-labelledby="mem-f0-title mem-f0-desc">
    <title id="mem-f0-title">一個簡單的 Search → Get 流程</title>
    <desc id="mem-f0-desc">一個線索進入 Search，回傳三個文章編號。選其中一個交給 Get，Get 回傳完整記錄。虛線箭頭把證據帶回成新線索。</desc>
    <defs>
      <marker id="mem-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-lead-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">簡單流程 // 一次 SEARCH，一次 GET</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一次搜尋 · 多個文章編號 · 一筆記錄</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="112" height="72" class="term"/>
    <text x="36" y="60" class="f" font-size="6.8" letter-spacing="0.8">線索</text>
    <text x="36" y="76" class="t mono" font-size="7.8">退款期限</text>
    <text x="36" y="94" class="m" font-size="6.8">查詢 + 篩選</text>
    <line x1="136" y1="80" x2="152" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="156" y="44" width="170" height="72" class="box"/>
    <svg x="168" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <text x="192" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="192" y="80" class="m" font-size="7">排序候選</text>
    <text x="168" y="104" class="f" font-size="6.8">grep · BM25 · vector · 混合</text>
    <line x1="326" y1="80" x2="342" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <text x="358" y="58" class="f" font-size="6.8" letter-spacing="0.6">3 個文章編號 · 打開一個</text>
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
    <text x="580" y="80" class="m" font-size="7">解析一個</text>
    <text x="556" y="104" class="f" font-size="6.8">完整記錄</text>
    <line x1="714" y1="80" x2="730" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <text x="744" y="58" class="f" font-size="6.6" letter-spacing="0.6">記錄</text>
    <line x1="744" y1="70" x2="806" y2="70" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="80" x2="794" y2="80" stroke="var(--mono-ink)" stroke-width="1"/>
    <line x1="744" y1="90" x2="806" y2="90" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="100" x2="786" y2="100" stroke="var(--mono-l5)" stroke-width="1"/>
    <text x="744" y="112" class="m" font-size="6.4">一筆記錄</text>
    <path d="M775 120 V140 H80 V118" class="dash" fill="none" marker-end="url(#mem-lead-arrow-muted)"/>
    <text x="427" y="154" class="f" font-size="6.9" text-anchor="middle" letter-spacing="0.6">證據 → 新線索 · 再次 SEARCH</text>
  </svg>
  </div>
  <p class="mem-lead-note"><b>Search</b> 找到候選，<b>Get</b> 產生證據。真正的工程，藏在兩者之間的契約裡。</p>
</section>

<p class="mem-lead-bridge">這個分類很小：一個動詞是集合值的，另一個是單一的。大部分的設計工作，都從「不要讓它們混在一起」開始——在索引裡、在文章編號裡、在迴圈裡。</p>

<figure class="fig">
  <img src="/images/memory-search-get/memgpt-system-flow.webp" alt="MemGPT 圖三：固定的 LLM 上下文視窗，內含系統指令、工作上下文與 FIFO 佇列，以及透過函式執行器與佇列管理器連接的 archival 與 recall 儲存" width="1600" height="610" loading="lazy" />
  <figcaption><b>論文圖 3</b> — MemGPT 的記憶階層：固定上下文視窗（系統指令、工作上下文、FIFO 佇列）與外部的 archival、recall 儲存，由模型可呼叫的函式連接。論文的賭注是模型自己管理這套階層：它搜尋外部儲存，再把記錄換頁回視窗。來源：<a href="https://arxiv.org/abs/2310.08560">Packer et al.,〈MemGPT: Towards LLMs as Operating Systems〉</a>，Figure 3 · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

## 兩個動詞，一個記憶

Search 是集合值的。它接受一個線索——字面字串、正規表達式、自然語言問題、中繼資料篩選——然後回傳候選。它可以近似、可以排序、可以有界。它的工作是在預算內取得召回，不是保證真理。

Get 是單一的。它接受一個位址，回傳該位址上的記錄，或一個明確的「找不到」。它是記憶的主鍵查詢：位址進，記錄出。它不被允許排序、摘要，或拿一個鄰居來代替。它的工作是解析。

把兩者接起來的單位是 **handle（文章編號）**：一個儲存片段的穩定名稱。`src/auth/session.ts:42`、`orders/1841#L12`、`4f2c9a1:docs/spec.md`、`chunk_01H8...`、`message 118`。文章編號不是內容本身；它是「這份內容可以再次被產生」的承諾。

一個無法再次解析的檢索結果，不是記憶。它是一段引文。

貼進提示裡的 top-k 區塊就是引文。它們或許能回答眼前這題，但無法被重訪、無法被擴大，也無法拿來和新版本對照。一個帶有檔案與行號的 grep 命中則是記憶：代理可以離開、去做別的事，再回來讀同一段位元組。

這一對動詞並不對稱。Search 是縮減：許多記錄變成少數候選。Get 是展開：一個候選變成一份帶著中繼資料的完整記錄。Search 刻意丟掉資訊，因為上下文裝不下整個語料庫；Get 把重要的那部分還原，因為答案需要的是記錄本身，不是「看起來很像」。如果兩端都在縮減，代理永遠看不到一份完整的記錄；如果兩端都在展開，上下文會被索引碰過的所有東西塞滿。

這個迴圈才是「翻閱」的意思：線索 → Search → 文章編號 → 選擇 → Get → 證據 → 新線索。沒有目錄的圖書館不能用；只有目錄、沒有書架的圖書館，則只是一份書目。代理兩半都需要。

## 架構：索引、文章編號、記錄

一個同時提供兩個動詞的記憶庫，有三層，而這三層的工作不一樣。

1. **索引**是衍生的、可重建的、有損的。對檔案而言，它可能就是語料庫本身加上一個掃描器；對 BM25 而言，它是倒排索引；對稠密檢索而言，它是建在嵌入上的 ANN 結構；對混合檢索而言，它是兩者融合。索引存在的目的是快速找到候選。它可以落後、可以不完整、可以近似。

2. **文章編號**是一個小小的、可定址的指標。它指涉一份記錄，或記錄裡的一個片段，並且帶著足夠的上下文，讓這個名字之後還能被解析：儲存體、ID、片段、版本、權限範圍。它產生成本低，傳遞成本也低。

3. **記錄庫**是權威。它保存全文、中繼資料、版本與權限。它是明天還必須為真的那個東西。

分工就是這條不變量：

- Search 讀索引，不讀記錄庫。
- Get 讀記錄庫，不讀索引。
- 索引可以從記錄重建。記錄不能從索引重建。

最後這一行，就是判斷一個系統有「記憶」還是只有「檢索」的測試。如果一個事實的唯一副本只活在嵌入裡，那它不是記憶，而是一個帶著向量的傳言。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">系統地圖 // 01</span>
    <h3 class="mem-fig-title">索引負責找到，記錄庫負責定案。</h3>
    <p class="mem-fig-sub">Search 從衍生索引排出文章編號。Get 拿一個文章編號到權威記錄庫解析。證據進入上下文，下一個回合從那裡開始。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 360" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">代理記憶的架構</title>
    <desc id="mem-f1-desc">規劃器把查詢送進 Search。Search 探查由 grep、BM25、vector 或混合檢索組成的衍生索引，回傳帶有 ID、分數與預覽的排序文章編號。Get 拿一個文章編號到權威記錄庫解析，記錄庫保存全文、中繼資料、權限與版本。證據進入上下文，下一個回合再回饋給規劃器。</desc>
    <defs>
      <marker id="mem-arch-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arch-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">記憶 // 架構</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">查詢 → 文章編號 → 記錄 → 上下文</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="176" y="46" class="f" font-size="7" letter-spacing="1.1">01 / 尋找</text>
    <text x="590" y="46" class="f" font-size="7" letter-spacing="1.1">02 / 讀取</text>
    <rect x="24" y="58" width="126" height="92" class="box"/>
    <text x="36" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">代理 / 規劃器</text>
    <text x="36" y="92" class="m" font-size="6.4">規劃下一步</text>
    <rect x="36" y="102" width="102" height="20" class="term"/>
    <text x="44" y="116" class="m mono" font-size="6.3">任務 · 回合 · 預算</text>
    <text x="36" y="140" class="f" font-size="6.2" letter-spacing="0.6">寫出查詢</text>
    <line x1="150" y1="112" x2="172" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="58" width="152" height="92" class="box"/>
    <text x="188" y="78" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="188" y="92" class="m" font-size="6.4">查詢 + 篩選</text>
    <rect x="188" y="102" width="128" height="30" class="term"/>
    <text x="196" y="114" class="t mono" font-size="6.2">"refund window"</text>
    <text x="196" y="125" class="m mono" font-size="6.2">after:2026-01-01</text>
    <text x="188" y="143" class="f" font-size="6.2" letter-spacing="0.6">回傳文章編號</text>
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
    <text x="366" y="147" class="f" font-size="6.1" letter-spacing="0.6">掃描或 ANN 探查</text>
    <line x1="524" y1="112" x2="546" y2="112" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="550" y="58" width="266" height="92" class="box"/>
    <text x="562" y="76" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">排序後的文章編號</text>
    <text x="562" y="88" class="m" font-size="6.4">ID · 分數 · 預覽</text>
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
    <text x="692" y="172" class="f" font-size="6.2" letter-spacing="0.6">已選一個</text>
    <rect x="590" y="188" width="190" height="88" class="box"/>
    <text x="602" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="602" y="221" class="m" font-size="6.4">一個文章編號進</text>
    <rect x="602" y="229" width="166" height="30" class="term"/>
    <text x="610" y="241" class="t mono" font-size="6.2">2026-returns.md:12</text>
    <text x="610" y="252" class="m mono" font-size="6.2">視窗 = 40 行</text>
    <text x="602" y="270" class="f" font-size="6.2" letter-spacing="0.6">記錄出 · 不排序</text>
    <line x1="590" y1="232" x2="554" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="344" y="188" width="208" height="88" class="box"/>
    <text x="356" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">記錄庫</text>
    <text x="356" y="221" class="m" font-size="6.4">權威 · 帶版本</text>
    <text x="356" y="237" class="m" font-size="6.2">全文 · 來源類型</text>
    <text x="356" y="248" class="m" font-size="6.2">狀態 · 生效日</text>
    <text x="356" y="259" class="m" font-size="6.2">權限 · 擁有者</text>
    <text x="356" y="270" class="m" font-size="6.2">版本 / 內容雜湊</text>
    <line x1="344" y1="232" x2="322" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="176" y="188" width="144" height="88" class="box"/>
    <text x="188" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">證據</text>
    <text x="188" y="221" class="m" font-size="6.4">已解析的位元組</text>
    <text x="188" y="238" class="m" font-size="6.2">現行政策</text>
    <text x="188" y="250" class="m" font-size="6.2">生效 2026-01-01</text>
    <text x="188" y="262" class="m" font-size="6.2">引用：L12–L17</text>
    <line x1="176" y1="232" x2="154" y2="232" class="arrow" marker-end="url(#mem-arch-arrow)"/>
    <rect x="24" y="188" width="128" height="88" class="box"/>
    <text x="36" y="208" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">上下文</text>
    <text x="36" y="221" class="m" font-size="6.4">提示 · 回合</text>
    <text x="36" y="238" class="m" font-size="6.2">證據進入</text>
    <text x="36" y="250" class="m" font-size="6.2">token 預算</text>
    <text x="36" y="262" class="m" font-size="6.2">下一回合 →</text>
    <path d="M88 188 V152" class="dash" fill="none" marker-end="url(#mem-arch-arrow-muted)"/>
    <text x="96" y="174" class="f" font-size="6.2" letter-spacing="0.6">新線索</text>
    <rect x="24" y="292" width="792" height="48" class="codebox"/>
    <text x="40" y="309" class="t mono" font-size="7.2" font-weight="700">SEARCH：語料庫 → 候選 · 只回傳文章編號，不回傳記錄。</text>
    <text x="40" y="323" class="t mono" font-size="7.2" font-weight="700">GET：文章編號 → 記錄 · 只回傳記錄，不做排序。</text>
    <text x="40" y="337" class="m mono" font-size="6.5">索引是衍生、可丟棄的。記錄庫才是權威。</text>
  </svg>
  </div>
  <div class="mem-fig-src">架構 · 兩個動詞 · 一種文章編號 · 不共用排序</div>
</figure>

讀這張圖的方式，是上排由左到右，下排由右到左。規劃器寫出查詢；Search 探查衍生索引；索引回傳文章編號；Get 拿一個文章編號到權威記錄庫解析；證據進入上下文；下一個回合從那裡開始。那條回饋箭頭不是裝飾。記錄本身會提供下一個線索。

同樣的形狀，可以覆蓋非常不同的部署。檔案加上 `grep` 與 `sed`，是退化後的特例：索引和記錄庫是同一個目錄。向量資料庫加上物件儲存，再加上一張 SQL 中繼資料表，是分離後的特例。對話紀錄加上回合索引，是第三種。無論哪一種，介面都一樣，不變量也一樣：負責排序的東西，不是負責定案的東西。

## Search：把語料庫縮成候選

介面很小：

```python
hits = search(query, filters, k)
# -> [Handle(id, score, preview), ...]
```

查詢可以是字面字串、正規表達式、詞袋、自然語言問題，或結構化篩選。實作可以是 grep、BM25、ANN 索引，或幾種方法的融合。沒有一種在任何情況下都最好。當代理知道字串時，字面搜尋很精準；詞彙重疊時，BM25 很強；改寫與同義詞交給稠密檢索；代理不確定該用哪一種時，混合檢索兜底。

篩選通常被低估，值得更多注意。時間、路徑、租戶、類型、狀態、來源，都是在相似度計算之前，低成本地刪掉整片語料庫的方法。一個日期篩選就能排除一整類錯誤答案，完全不必動到嵌入。篩選是查詢的一部分，不是結果出來之後才補的動作。

Search 先顧召回，再顧精確率。如果正確的記錄不在候選集裡，Get 再厲害也救不回來。所以 `k` 必須大到足以涵蓋合理的答案，候選集也必須夠多元，不能讓單一排序函式把它壓扁。有了召回，才輪到排序前段的精確率，因為規劃器最多只會讀幾筆。`k` 是預算決策，不是品質旋鈕：回傳五十個文章編號很便宜，回傳五十份記錄可不便宜。

這就是 Search 應該回傳文章編號、而不是內容的原因。

- **上下文預算。** 一份清單應該每個項目只花幾十個 token，而不是幾千個。只有活下來的候選，才需要抓完整記錄。
- **延後解析。** 規劃器可以選擇、重問、擴大，或停手。內嵌段落則是把選擇鎖在檢索的那一刻。
- **驗證。** 新鮮度與權限是在 Get 檢查的。一段直接貼進提示的段落，已經跳過了這個檢查。
- **單一排序權威。** 如果 Search 直接回傳段落，排序模型的第一名就悄悄變成了答案。規劃器根本沒有比較的機會。

當 Search 把段落內嵌回傳，它已經花掉上下文，也已經替代理做了選擇。模型不能把段落擴大，不能確認有沒有更新版本，也不能精確引用一個片段。分數變成了答案。

還有一個可讀性的理由。字面搜尋失敗得很明顯：空結果或明顯不匹配，會告訴代理該換一個模式。稠密搜尋失敗得很合理：最近鄰索引就算沒有好答案，也會回傳一個鄰居——除非系統套用門檻，並且說出來。一個說不出「我沒找到」的記憶系統，會捏造出一段連續的故事。回傳實際跑過的查詢、套用的篩選，以及一個信心訊號。找不到，也是資訊。

這些都不代表某一種工具在任何地方都更好。它代表工具應該是規劃器可以推理的選擇。Search 應該提供不只一種檢索方式，並且在第一次失敗時，讓代理換一種。

## Get：把一個文章編號展開成證據

另一半刻意很無聊：

```python
record = get(handle, window=None)
# -> Record(text, metadata, version, scope) | Miss | Mismatch
```

Get 原樣接受文章編號。它不重新跑 Search、不對 ID 做模糊比對、不挑「最好的那一段」。它解析位址，回傳記錄。

展開的意思是：不只回傳命中的那一行。Get 應該回傳所在的段落、文件標題、生效日、狀態、來源類型與版本。代理需要記錄對自己的描述，才能判斷它適不適用。一行沒有生效日的政策，只是一段引文。一張提到政策的工單，不是政策。

新鮮度是第一個難題。索引是快照，記錄會動。Get 應該讀到現行記錄，或在文章編號指定版本時讀到那個版本的快照，並且回報它實際服務的是哪個版本。如果文章編號指定一個版本，而儲存體已經更新，Get 回傳不吻合，附上兩個版本。它絕不會默默解析到不同的位元組。

權限是第二個。Search 檢索的語料庫，可能比呼叫者的可讀範圍更廣。預覽可能洩漏標題、路徑或摘要，即使正文受到保護。在 Search 過濾，在 Get 強制執行，而且只從呼叫者讀得到的欄位生成預覽。文章編號應該帶著權限範圍，或者至少不能被猜中；但難以猜中不是授權。

成本是第三個。Get 的成本是回傳的位元組，加上讀它們的那一個回合。給它一個視窗、一個位元組上限、一個 token 估算。讀整份檔案，就是記憶系統變成上下文漏洞的開始。記錄很大時，回傳結構化的切片：標題路徑、相關段落、中繼資料，以及其餘部分的指標。不要在 Get 裡摘要。摘要是寫入時或規劃時的決定，不是讀取時偷做的替換。

版本是第四個。每一份記錄都需要版本：雜湊、ETag、commit、`updated_at`。文章編號可以固定住它。Get 回傳實際服務的版本，規劃器才能快取證據，也知道什麼時候該刷新。版本不是形式。它是「這份政策」與「索引建立時曾經為真的某份政策」之間的差別。

而 Get 永遠不排序。如果 Get 開始挑「最好的段落」，排序就滲進了讀取路徑。於是兩個元件都在排序，卻沒有一個為結果負責；文章編號也不再代表「這份記錄」，而是「這附近某個東西」。

## 文章編號的契約

一旦 Search 開始回傳文章編號，難題就轉移到文章編號身上。一個好的文章編號有五個性質。

1. **穩定。** 在任務的生命週期內，同一個文章編號解析到同一份記錄版本。不可變的 ID 比行號好；如果儲存體會變動，文章編號就帶著版本。`path:41-58` 比 `path` 穩定，但一次檔案編輯仍會讓後面每一行的行號位移。

2. **可定址。** Get 原樣接受它。不重新 Search、不做模糊比對、不猜。文章編號是一個名字，加上足夠解析它的上下文：儲存體、ID、片段、版本、權限範圍。

3. **可預覽。** 它帶著一小段預覽，或能低成本地取得，供排序與日誌使用。預覽不是證據，它是打開記錄的理由。

4. **帶權限。** 它帶著或暗示一個範圍，並由 Get 強制執行。Search 不該產生呼叫者永遠解析不到的文章編號，預覽也不該揭露記錄會隱藏的內容。

5. **帶版本。** 它固定住一個版本，或回報解析到的版本。不吻合是一個正式的回應，不是可以吞掉的例外。

一個可用的形狀大概長這樣：

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

| 儲存體 | Search 回傳 | Get 解析 | 過時模式 |
| :--- | :--- | :--- | :--- |
| 檔案 | `path:line` | 行號或位元組範圍 | 檔案被編輯，行號會漂移 |
| Git | `commit:path:line` | `git show commit:path` | 歷史被改寫，或物件被清除 |
| SQL | 主鍵或資料列 ID | `SELECT … WHERE id = ?` | 資料列被更新或刪除 |
| Web | URL 加片段 | 一個 HTTP GET | 頁面改變或回傳 404 |
| 向量索引 | 區塊 ID 加偏移 | 依 ID 取回 | 重建索引或換模型後重新編號 |
| 對話 | 訊息 ID 或回合索引 | 取回該回合 | 壓縮改寫了對話紀錄 |

這張表也顯示記憶從哪裡開始腐壞。每一個家族都有過時模式，而代理比一般應用更快撞上，因為語料庫常常就是上下文視窗本身。壓縮改寫歷史。重建索引重新編號區塊。一次檔案編輯會讓後面每一行的行號位移。代理留下的筆記——三個回合前存下的文章編號——就這樣變成死連結。

代理記憶裡的連結腐化不是外觀問題。如果代理無法解析自己寫下的文章編號，它只剩兩條路：重新 Search，花掉一個回合，而且可能得到不同答案；或是根據過時的預覽回答，賠上正確性。記憶系統應該把這個選擇攤開來：要嘛文章編號帶版本，要嘛 Get 在解析到不同位元組時明確回報不吻合，而不是默默把錯的東西交出去。

一個解析到錯誤位元組的文章編號，比 404 還糟。至少 404 是誠實的。

## 把迴圈當成預算

Search 和 Get 的成本曲線不同。Search 的成本是一次掃描或索引探查，加上一個模型回合來讀候選清單。Get 的成本是回傳的位元組，加上一個模型回合來讀它們。前者隨語料庫規模成長，後者隨你選擇要讀多少而成長。

所以有效率的策略是不對稱的：Search 要廣而便宜，Get 要窄而精確。常見的失敗則剛好相反——一次狹窄的 Search，然後 Get 整份檔案。代理就是這樣花掉幾萬個 token，去回答一個證據只有一段話的問題。

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

有三個細節很重要。`hits` 是一串文章編號，不是段落；預覽是拿來排序的，不是拿來當證據的。`memory.get` 接受一個視窗，所以代理可以擴大命中周圍的上下文，而不必讀整份檔案。`next_cue` 把迴圈閉合：記錄本身提供下一個搜尋詞，這才是「翻閱」，而不只是「查詢」。

停止規則不是「讀了 k 筆結果」，而是「沒有新的文章編號」或「每一個主張都有已解析的來源」。停在 k 的迴圈，等於把記憶變回引文服務。

上下文預算是另一半。每一次 Get 都會擠掉工作狀態：指令、當前計畫、先前的證據。證據應該花在答案真正需要的主張上。一個抓了十幾份記錄、只用了一份的系統，付了十幾次讀取的成本，只換到一個答案。要追蹤的是「每個已解析主張花掉多少位元組」，不是「每個回合花掉多少位元組」。

該量什麼，也從迴圈推得出來：每個答案幾次 Search、每次 Search 幾次 Get、不重複的文章編號數、死文章編號比率、重新搜尋率，以及每個已解析主張的位元組數。只看準確率，無法告訴你記憶是否真的可翻閱。一個回傳高分、卻只給得出少數可解析文章編號的系統，是搜尋引擎，不是記憶。

## 記憶測試台

下面的測試台把這個分工變得可見。同一個線索命中三筆記錄。Search 把它們排序，Get 把它們讀出來。只有一筆是現行政策。

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">記憶測試台 // 02</span>
    <h3 class="mem-fig-title">三個文章編號命中。只有一筆記錄是現行版。</h3>
    <p class="mem-fig-sub">選一筆搜尋結果，然後讀 Get 實際回傳的內容。Search 排序，Get 決定。</p>
  </figcaption>
  <div class="mem-query">
    <span class="mem-query-tag">線索</span>
    <code>"refund window"</code>
    <span class="mem-query-meta">支援語料庫 · 4,812 筆記錄</span>
  </div>
  <div class="mem-desk">
    <div class="mem-results">
      <div class="mem-col-head">SEARCH // 3 個文章編號</div>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h1" checked>
        <span class="mem-rank">01</span>
        <span class="mem-addr">policies/returns-2024.md:41</span>
        <span class="mem-score">0.94</span>
        <span class="mem-snippet">退款須於到貨後 30 天內提出…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h2">
        <span class="mem-rank">02</span>
        <span class="mem-addr">policies/2026-returns.md:12</span>
        <span class="mem-score">0.89</span>
        <span class="mem-snippet">退款須於到貨後 14 天內提出…</span>
      </label>
      <label class="mem-hit">
        <input type="radio" name="mem-pick" id="mem-h3">
        <span class="mem-rank">03</span>
        <span class="mem-addr">tickets/8841.json:7</span>
        <span class="mem-score">0.81</span>
        <span class="mem-snippet">客戶詢問退款期限，被告知 30 天…</span>
      </label>
    </div>
    <div class="mem-read">
      <div class="mem-col-head">GET // 確切記錄</div>
      <div class="mem-doc mem-doc--a">
        <div class="mem-doc-head"><span>policies/returns-2024.md</span><span>L41–L46</span></div>
        <pre>41  ## 退款
42
43  退款須於到貨後 30 天內提出。
44  拆封軟體恕不退換。
45
46  生效：2024-03-01 · 狀態：已被取代</pre>
      </div>
      <div class="mem-doc mem-doc--b">
        <div class="mem-doc-head"><span>policies/2026-returns.md</span><span>L12–L17</span></div>
        <pre>12  ## 退款
13
14  退款須於到貨後 14 天內提出。
15  拆封軟體恕不退換。
16
17  生效：2026-01-01 · 狀態：現行</pre>
      </div>
      <div class="mem-doc mem-doc--c">
        <div class="mem-doc-head"><span>tickets/8841.json</span><span>L7–L10</span></div>
        <pre>7   「客戶詢問退款期限，
8    被告知 30 天。這樣還
9    正確嗎？」
10  source: null · 工單，不是政策</pre>
      </div>
    </div>
  </div>
  <div class="mem-verdict mem-verdict--a">
    <b>過時版本</b>
    <p>位元組是真的，但政策已於 2026-01-01 被取代。排名 01 只是最相似的記錄，不是現行的那一筆。</p>
  </div>
  <div class="mem-verdict mem-verdict--b">
    <b>現行來源</b>
    <p>這筆記錄自己帶著生效日與狀態。Get 能判斷，因為位元組會描述自己；Search 沒辦法。</p>
  </div>
  <div class="mem-verdict mem-verdict--c">
    <b>提及，不是來源</b>
    <p>摘要片段重複了那個詞，但沒有定義規則。文章編號可以解析到一筆根本不該被引用的記錄。</p>
  </div>
  <div class="mem-fig-src">示意 · 純 CSS · 無 JavaScript</div>
</figure>

排名第一的命中，是過時的那一筆。這不是 Search 的 bug；這是排序所能知道的邊界。現行政策比較短、用了不同的說法，所以排在第二。Get 之所以能定案，是因為記錄自己帶著生效日與狀態。

如果記錄沒有帶著這些中繼資料，Get 只會回傳位元組，代理仍然只能猜。文章編號解析的是位置；出處脈絡解析的是意義。

## 實務上要改什麼

API 是兩個函式與一種文章編號。真正的工作在 schema 裡。

```python
# Search returns handles. It never returns records.
hits = memory.search("refund window", filters={"after": "2026-01-01"}, k=8)
# -> [Handle(id=..., score=0.94, preview="..."), ...]

# Get resolves one handle. It never ranks.
record = memory.get(hits[0], window=40)
# -> Record(text=..., metadata={...}, version="sha256:...", scope="tenant:acme")
```

- **一種文章編號，兩個動詞。** 如果 Search 和 Get 各自發明一套位址格式，接縫就變成翻譯層，而翻譯一定會漂移。

- **Search 回傳帶預覽的文章編號，不回傳完整記錄。** 預覽是打開記錄的理由，不是記錄的替代品。

- **Get 是一級工具。** 它原樣接受文章編號，回傳確切記錄或明確的找不到。它不是藏在 Search 裡的一個步驟。

- **Get 接受片段或視窗。** 讀整份檔案，就是記憶系統變成上下文漏洞的開始。設定位元組上限，並在規劃器投入之前回報 token 估算。

- **把出處放進記錄裡。** 生效日、狀態、來源類型、版本與權限，應該在 Get 回傳的位元組裡，而不是在代理看不到的側通道。

- **讓索引保持可衍生。** 換嵌入模型時，從記錄重建它。不要讓索引成為一個事實的唯一副本。

- **權限要做兩次。** 在 Search 過濾，在 Get 強制執行，而且只從可讀欄位生成預覽。標題外洩也是外洩。

- **每個文章編號都帶版本，而且錯誤要明顯。** 不吻合比一個看起來最新的錯誤答案便宜。

- **提供不只一種搜尋工具。** 已知項目用字面，詞彙重疊用 BM25，改寫用稠密，結構用篩選。讓規劃器選，或按查詢類型路由。

- **量測迴圈。** 每個答案幾次 Search、每次 Search 幾次 Get、不重複文章編號、死文章編號、重新搜尋、每個已解析主張的位元組數。只看準確率，會把接縫藏起來。

## 失敗模式

多數記憶失敗不是模型失敗，而是契約失敗，而且集中在兩個邊界：索引與記錄庫。

| 失敗 | 哪裡出錯 | 設計對策 |
| :--- | :--- | :--- |
| Search 漏找 | 查詢詞彙對不上記錄，或稠密索引回傳一個看起來很合理的鄰居。正確記錄從未進入候選集。 | 提供不只一種工具，讓規劃器從證據改寫查詢，提早套用篩選，並在信心不足時明確回傳空結果。 |
| 文章編號過時 | 記錄被編輯、重建索引或壓縮。文章編號還能解析，但解析到不同的位元組。 | 文章編號帶版本、記錄做雜湊，解析到不同內容時回報不吻合，附上兩個版本，而不是默默回傳。 |
| 權限外洩 | Search 排序了呼叫者讀不到的檔案，或預覽露出了標題與摘要。 | 在 Search 依範圍過濾，在 Get 強制執行，預覽只從可讀欄位生成。不要把「ID 猜不到」當成授權。 |
| Get 太貴 | 規劃器讀整份檔案，或重複 Get 同一筆，證據把工作狀態擠掉。 | 要求片段或視窗，限制位元組與 token，依版本快取已解析記錄，並把讀取算進回合預算。 |
| 無限迴圈 | 每一份記錄都提供新線索，seen-set 裡沒有重複文章編號，迴圈永遠到不了主張。 | 保留 seen-set，限制回合與位元組，沒有新文章編號或主張都已解析就停；重複線索是換工具的訊號。 |
| 文章編號碰撞 | 重建索引或合併之後，兩份記錄共用一個 ID，文章編號解析到錯的那一份。 | 依儲存體命名空間化 ID，記錄 ID 不可變，文章編號包含版本，產生文章編號時檢查碰撞。 |

這些失敗並不對稱。Search 漏找很便宜：代理看到空清單，換一個查詢就好。Get 失敗很貴：代理已經花掉上下文，而且可能沒發現記錄過時、讀不到，或根本是錯的那一份。這個不對稱，就是 Get 需要更嚴格契約的原因，也是「檢索分數很高」不能當成記憶指標的原因。

這兩個模組不是裝一次就好的管線，而是一種必須維持的分工：Search 縮減，Get 展開，文章編號在中間帶著承諾，迴圈負責花預算。接縫撐得住時，代理才能找到東西、離開、再回來，而且還是在講同一份記錄。

## 參考資料

- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)——這篇文章討論的「先檢索、再生成」管線。
- [MemGPT](https://arxiv.org/abs/2310.08560)——把記憶當成作業系統，在上下文與儲存之間分頁。
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)——為什麼更多檢索文字，不等於更好用。

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
