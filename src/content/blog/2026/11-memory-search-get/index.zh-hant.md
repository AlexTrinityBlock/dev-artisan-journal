---
title: "先 Search，再 Get：代理記憶的兩個模組"
description: "細讀《Is Grep All You Need?》後留下的一個小分類：代理記憶只有兩個動作。Search 像搜尋框，Get 像點開連結；兩者搭配，Agent 就像有了外置大腦。"
pubDate: 2026-11-23
category: "AI"
tags: ["代理", "記憶", "RAG", "檢索", "論文筆記"]
featured: false
author: "Alex.Hsiao"
readTime: "18 分鐘"
---

# 先 Search，再 Get：代理記憶的兩個模組

## 簡單版：兩個動作

<section class="mem-lead">
  <div class="mem-lead-head">
    <span class="card-tag">THE TWO MODULES // 00</span>
    <p class="mem-lead-kicker">讀完論文後，我留下來的不是「grep 還是 vector」，而是一個更小的分類。</p>
    <h3 class="mem-lead-title">代理的記憶，只有兩個動作。</h3>
    <p class="mem-lead-sub">先找，再讀。Search 像搜尋框，Get 像點開連結。</p>
  </div>
  <div class="mem-lead-grid">
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mem-lead-tag">SEARCH // 找</div>
      <h4>輸入關鍵字，找到一些條目</h4>
      <p>就像在搜尋框裡打字。它回傳一份條目清單，可能三個，也可能一個都沒有。</p>
      <div class="mem-lead-meta">關鍵字 → N 個條目</div>
    </div>
    <div class="mem-lead-plus" aria-hidden="true">+</div>
    <div class="mem-lead-card">
      <div class="mem-lead-icon"><svg class="mem-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg></div>
      <div class="mem-lead-tag">GET // 讀</div>
      <h4>點開連結，看到全文</h4>
      <p>就像點開其中一個結果。它回傳那一頁的完整內容，不猜、不排序。</p>
      <div class="mem-lead-meta">連結 → 全文</div>
    </div>
  </div>
  <div class="mem-lead-flow mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 170" role="img" aria-labelledby="mem-f0-title mem-f0-desc">
    <title id="mem-f0-title">一個簡單的 Search → Get 流程</title>
    <desc id="mem-f0-desc">幾個關鍵字進入 Search，回傳三個條目。選其中一個，交給 Get，Get 回傳那一頁的全文。虛線箭頭把新關鍵字帶回 Search。</desc>
    <defs>
      <marker id="mem-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-lead-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">簡單流程 // 一次 SEARCH，一次 GET</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一次搜尋 · 多個條目 · 一個頁面</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="112" height="72" class="term"/>
    <text x="36" y="60" class="f" font-size="6.8" letter-spacing="0.8">關鍵字</text>
    <text x="36" y="76" class="t mono" font-size="7.8">幾個關鍵字</text>
    <text x="36" y="94" class="m" font-size="6.8">一次搜尋</text>
    <line x1="136" y1="80" x2="152" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="156" y="44" width="170" height="72" class="box"/>
    <svg x="168" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <text x="192" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="192" y="80" class="m" font-size="7">找到條目</text>
    <text x="168" y="104" class="f" font-size="6.8">grep · BM25 · vector</text>
    <line x1="326" y1="80" x2="342" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <text x="358" y="58" class="f" font-size="6.8" letter-spacing="0.6">3 個條目 · 點開一個</text>
    <rect x="358" y="64" width="164" height="14" class="box"/>
    <text x="366" y="74" class="m mono" font-size="6.2">01</text>
    <text x="382" y="74" class="t mono" font-size="6.7">條目 A</text>
    <rect x="358" y="82" width="164" height="14" fill="var(--mono-l1)"/>
    <text x="366" y="92" fill="var(--mono-paper)" class="mono" font-size="6.2">02</text>
    <text x="382" y="92" fill="var(--mono-paper)" class="mono" font-size="6.7">條目 B</text>
    <rect x="358" y="100" width="164" height="14" class="box"/>
    <text x="366" y="110" class="m mono" font-size="6.2">03</text>
    <text x="382" y="110" class="t mono" font-size="6.7">條目 C</text>
    <line x1="522" y1="89" x2="540" y2="89" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="544" y="44" width="170" height="72" class="box"/>
    <svg x="556" y="56" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg>
    <text x="580" y="68" class="t" font-size="10.5" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="580" y="80" class="m" font-size="7">點開一筆</text>
    <text x="556" y="104" class="f" font-size="6.8">確切位元組</text>
    <line x1="714" y1="80" x2="730" y2="80" class="arrow" marker-end="url(#mem-lead-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <text x="744" y="58" class="f" font-size="6.6" letter-spacing="0.6">全文</text>
    <line x1="744" y1="70" x2="806" y2="70" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="80" x2="794" y2="80" stroke="var(--mono-ink)" stroke-width="1"/>
    <line x1="744" y1="90" x2="806" y2="90" stroke="var(--mono-l5)" stroke-width="1"/>
    <line x1="744" y1="100" x2="786" y2="100" stroke="var(--mono-l5)" stroke-width="1"/>
    <text x="744" y="112" class="m" font-size="6.4">一個頁面</text>
    <path d="M775 120 V140 H80 V118" class="dash" fill="none" marker-end="url(#mem-lead-arrow-muted)"/>
    <text x="427" y="154" class="f" font-size="6.9" text-anchor="middle" letter-spacing="0.6">新關鍵字 → 再次 SEARCH</text>
  </svg>
  </div>
  <p class="mem-lead-note"><b>Search</b> 找到條目，<b>Get</b> 點開全文。兩者搭配，Agent 就像有了外置大腦，可以記得許多事物。</p>
</section>

<p class="mem-lead-bridge">分類就只有這樣。接下來，文章把速度放慢：為什麼論文裡的數字能從這個分類推出來、一個 handle 必須保證什麼，以及如何讓迴圈保持誠實。</p>

## 分類背後的結果


論文的標題結果是 grep 贏了。更奇怪的結果是，harness 可以在完全不動語料庫的情況下，把這個勝利抹掉。

論文用 116 個長期記憶問題，橫跨五個模型、四種 harness、兩種檢索模式與兩種遞送路徑。在內嵌模式下，grep 在十個 harness–model 組合中全部贏過 vector。把同樣的結果搬進檔案，優勢就消失了：十組平均變成平手，vector 在十組中贏了五組。只換 harness，同一個模型就移動 16.4 個百分點——比同一列裡 grep 與 vector 的 1.7 個百分點差距還大。

把這些數字當成檢索引擎比賽，會讓人困惑。把它們當成介面問題，幾乎就變得機械而必然。

Search 就像在搜尋框裡輸入關鍵字，得到一些條目。Get 就像點開其中一個連結，看到全文。兩者搭配，Agent 就像有了外置大腦，可以記得許多事物，也能把它們找回來。

`grep -n` 是 Search，它的輸出是一串 `path:line` 形式的 handle。`sed -n '40,60p' file` 是 Get。兩者能組合，是因為前者吐出的東西，正好是後者吃的東西。Vector 檢索常常只以 Search 的形式出現：top-k 區塊直接內嵌進上下文，沒有位址可以回頭，也沒有更多東西可以打開。

Grep 不是全部。Grep 是你需要的兩件事，只是共用同一個名字。

## 兩個動詞，一個記憶

Search 是集合值的。它接受一個線索——字面字串、正規表達式、自然語言問題、中繼資料篩選——然後回傳候選。它可以近似、可以排序、可以有界。它的工作是在預算內取得召回，不是保證真理。

Get 是單一的。它接受一個位址，回傳該位址上的位元組，或一個明確的「找不到」。它是記憶的主鍵查詢：位址進，記錄出。它不被允許排序、摘要，或拿一個鄰居來代替。它的工作是解析。

把兩者接起來的單位是 **handle**：一個儲存片段（span）的穩定名稱。`src/auth/session.ts:42`、`orders/1841#L12`、`4f2c9a1:docs/spec.md`、`chunk_01H8...`、`message 118`。handle 不是內容本身；它是「這份內容可以再次被產生」的承諾。

一個無法再次解析的檢索結果，不是記憶。它是一段引文。

貼進提示裡的 top-k 區塊就是引文。它們或許能回答眼前這題，但無法被重訪、無法被擴大，也無法拿來和新版本對照。一個帶有檔案與行號的 grep 命中則是記憶：代理可以離開、去做別的事，再回來讀同一段位元組。

這個迴圈才是「翻閱」的意思：線索 → Search → handle → 選擇 → Get → 證據 → 新線索。沒有目錄的圖書館不能用；只有目錄、沒有書架的圖書館，則只是一份書目。代理兩半都需要。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">記憶地圖 // 01</span>
    <h3 class="mem-fig-title">一個記憶，兩種不同的縮減</h3>
    <p class="mem-fig-sub">Search 把語料庫縮成位址，Get 把位址縮成位元組，迴圈把兩者組合起來。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 496" role="img" aria-labelledby="mem-f1-title mem-f1-desc">
    <title id="mem-f1-title">代理記憶的兩個模組</title>
    <desc id="mem-f1-desc">Search 接受線索，回傳一份排序過的 handle 清單。Get 接受一個 handle，回傳該位址上的確切位元組。虛線迴圈把證據帶回成新的線索。</desc>
    <defs>
      <marker id="mem-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="mem-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">記憶 // 兩個模組</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">線索 → HANDLE → 位元組</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / SEARCH</text>
    <text x="448" y="46" class="f" font-size="7" letter-spacing="1.1">02 / GET</text>
    <rect x="24" y="58" width="368" height="332" class="box"/>
    <text x="40" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">SEARCH</text>
    <text x="40" y="98" class="m" font-size="7.5">線索進 · 候選出 · 一對多</text>
    <text x="376" y="88" class="f" font-size="18" text-anchor="end">01</text>
    <rect x="40" y="110" width="336" height="50" class="term"/>
    <text x="50" y="124" class="f" font-size="6.5" letter-spacing="0.8">線索</text>
    <text x="50" y="139" class="t mono" font-size="7.2">"refund window"  ·  /retry.*budget/</text>
    <text x="50" y="151" class="m mono" font-size="7.2">vector(q)  ·  path:src/**  ·  after:2026-01-01</text>
    <line x1="208" y1="160" x2="208" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="40" y="178" width="336" height="84" class="box"/>
    <text x="50" y="192" class="f" font-size="6.5" letter-spacing="0.8">檢索工具</text>
    <rect x="50" y="200" width="102" height="28" class="term"/>
    <text x="101" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">GREP</text>
    <text x="101" y="222" class="m mono" font-size="6.2" text-anchor="middle">正規表達式 · 字面</text>
    <rect x="160" y="200" width="102" height="28" class="term"/>
    <text x="211" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">BM25</text>
    <text x="211" y="222" class="m mono" font-size="6.2" text-anchor="middle">詞頻</text>
    <rect x="270" y="200" width="96" height="28" class="term"/>
    <text x="318" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">VECTOR</text>
    <text x="318" y="222" class="m mono" font-size="6.2" text-anchor="middle">ANN · 語意</text>
    <text x="50" y="250" class="m" font-size="6.8">篩選 · 日期 · 路徑 · glob</text>
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
    <text x="40" y="382" class="m" font-size="6.8">集合值 · 已排序 · 有預算 · 可能什麼都沒找到</text>
    <rect x="448" y="58" width="368" height="332" class="box"/>
    <text x="464" y="84" class="t" font-size="13" font-weight="800" letter-spacing="-0.01em">GET</text>
    <text x="464" y="98" class="m" font-size="7.5">一個 HANDLE 進 · 確切位元組出 · 一對一</text>
    <text x="800" y="88" class="f" font-size="18" text-anchor="end">02</text>
    <rect x="464" y="110" width="336" height="50" class="term"/>
    <text x="474" y="124" class="f" font-size="6.5" letter-spacing="0.8">一個 HANDLE</text>
    <text x="474" y="139" class="t mono" font-size="7.2">policies/2026-returns.md:12</text>
    <text x="474" y="151" class="m mono" font-size="6.8">從 3 個候選解析 · 不重新搜尋</text>
    <line x1="632" y1="160" x2="632" y2="174" class="arrow" marker-end="url(#mem-arrow)"/>
    <rect x="464" y="178" width="336" height="84" class="box"/>
    <text x="474" y="192" class="f" font-size="6.5" letter-spacing="0.8">解析 → 讀取 → 回傳</text>
    <rect x="474" y="200" width="100" height="28" class="term"/>
    <text x="524" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">解析</text>
    <text x="524" y="222" class="m mono" font-size="6.2" text-anchor="middle">位址</text>
    <rect x="584" y="200" width="100" height="28" class="term"/>
    <text x="634" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">讀取</text>
    <text x="634" y="222" class="m mono" font-size="6.2" text-anchor="middle">範圍</text>
    <rect x="694" y="200" width="96" height="28" class="term"/>
    <text x="742" y="212" class="t mono" font-size="7.5" font-weight="700" text-anchor="middle">回傳</text>
    <text x="742" y="222" class="m mono" font-size="6.2" text-anchor="middle">位元組</text>
    <text x="474" y="250" class="m" font-size="6.8">原樣接受 HANDLE · 失敗即拒絕</text>
    <text x="464" y="292" class="f" font-size="6.5" letter-spacing="0.8">確切位元組 // L12–L15</text>
    <text x="800" y="292" class="f" font-size="6.5" text-anchor="end" letter-spacing="0.8">一筆記錄</text>
    <rect x="464" y="298" width="336" height="62" class="codebox"/>
    <text x="476" y="314" class="m mono" font-size="7.2">12  ## 退款</text>
    <text x="476" y="328" class="t mono" font-size="7.2">13  退款須於 14 天內提出</text>
    <text x="476" y="342" class="t mono" font-size="7.2">14  自到貨起算。拆封軟體恕不退換。</text>
    <text x="476" y="356" class="m mono" font-size="6.8">15  生效：2026-01-01 · 狀態：現行</text>
    <text x="464" y="382" class="m" font-size="6.8">單一 · 確定性 · 不排序</text>
    <path d="M394 310 H420 V135 H440" class="arrow" fill="none" marker-end="url(#mem-arrow)"/>
    <path d="M632 394 V414 H208 V396" class="dash" fill="none" marker-end="url(#mem-arrow-muted)"/>
    <text x="420" y="428" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">證據 → 新線索 · 再次 SEARCH</text>
    <rect x="24" y="442" width="792" height="38" class="codebox"/>
    <text x="40" y="458" class="t mono" font-size="7.5" font-weight="700">SEARCH = 語料庫 → 位址。   GET = 位址 → 確切位元組。</text>
    <text x="40" y="471" class="m" font-size="7">讓記憶可被翻閱的是迴圈，不是索引。</text>
  </svg>
  </div>
  <div class="mem-fig-src">雙模組記憶 · SEARCH / GET · 以 HANDLE 為中心的迴圈</div>
</figure>

Search 把語料庫縮成位址。Get 把位址縮成位元組。迴圈把這兩種縮減組合起來。

## 論文到底量了什麼

這項研究變動檢索模式、harness 與遞送路徑。任務是 LongMemEval-S 的 116 題子集：跨多個工作階段的對話問答，涵蓋知識更新、跨工作階段彙整、助理生成內容、使用者偏好、使用者陳述的事實，以及時間推理。每題都附有含答案的工作階段（oracle sessions），以及數量不定的干擾工作階段。語料庫固定不變。檢索器一個是對原始文字做 grep，一個是帶重排的 vector 檢索。harness 則是一個自製代理（Chronos）與三個供應商 CLI（Claude Code、Codex、Gemini CLI）。遞送路徑分為內嵌工具訊息，以及代理必須自己打開的檔案。

在內嵌條件下，grep 在十個 harness–model 組合中全部領先。這十組的未加權平均是 83.8 對 72.5，差距 11.3 個百分點。最大差距是 Gemini 3.1 Flash-Lite 搭配 Chronos：86.2 對 62.9。最小差距是 Claude Opus 4.6 搭配 Claude Code：76.7 對 75.0。

<figure class="mem-fig">
  <figcaption>
    <span class="card-tag">實驗 1 // 02</span>
    <h3 class="mem-fig-title">十組內嵌配對全部倒向 grep</h3>
    <p class="mem-fig-sub">每一列是一個模型在一種 harness 裡的結果。空心圓是 vector，實心圓是 grep。差距從 1.7 到 23.3 個百分點。</p>
  </figcaption>
  <div class="mem-scroll">
  <svg class="mem-svg" viewBox="0 0 840 470" role="img" aria-labelledby="mem-f2-title mem-f2-desc">
    <title id="mem-f2-title">各 harness 與模型的內嵌 grep、vector 準確率</title>
    <desc id="mem-f2-desc">十組 harness–model 配對的啞鈴圖。grep 在每一組都高於 vector，差距從 1.7 到 23.3 個百分點。未加權平均為 grep 83.8、vector 72.5。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">實驗 1 // 內嵌遞送</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">準確率 % · LONGMEMEVAL-S 116 題</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="50" class="t" font-size="12.5" font-weight="800" letter-spacing="-0.01em">Grep 在每一組內嵌配對中都領先</text>
    <text x="24" y="66" class="m" font-size="7.5">連線是差距，圓點是分數。</text>
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
    <text x="270" y="418" class="f" font-size="6.5" letter-spacing="0.8">準確率（%）</text>
    <rect x="24" y="428" width="792" height="34" class="codebox"/>
    <text x="40" y="444" class="t mono" font-size="7.3">十組平均：GREP 83.8 · VECTOR 72.5 · 差距 +11.3</text>
    <text x="40" y="456" class="m mono" font-size="6.9">檔案式遞送：GREP 72.5 · VECTOR 72.4 · VECTOR 勝 5/10</text>
  </svg>
  </div>
  <div class="mem-fig-src">ARXIV:2605.15184 · 表 1 · LONGMEMEVAL-S 116 題 · GPT-4O 評分</div>
</figure>

有意思的數字不是差距，而是 harness 那一列。Claude Opus 4.6 在 Chronos 下是 93.1，在 Claude Code 下是 76.7。只換編排層，就移動了 16.4 個百分點；模型一樣、語料庫一樣、檢索器也一樣。在那一列裡，換檢索器只讓分數移動 1.7 個百分點。只回報檢索模式的排行榜，量到的是比較小的那個效應。

接著，檔案式遞送產生了一個看起來像檢索結果、其實是工作流結果的東西。未加權平均收斂了：grep 72.5，vector 72.4。vector 在十組中贏了五組。GPT-5.4 搭配 Codex，從內嵌 grep 的 93.1 掉到程式化 grep 的 55.2——少了 37.9 個百分點——而同一組的程式化 vector 是 67.2。grep 工具沒有變差。每一個命中都變成一個必須定位、開啟、整合的檔案，而這第二階段失敗得夠頻繁，足以吃掉全部的檢索優勢。

| 檔案式遞送讓贏家翻盤的地方 | grep | vector | Δ（vector − grep） |
| :--- | ---: | ---: | ---: |
| Claude Opus 4.6 · Chronos | 80.2 | 81.9 | +1.7 |
| Claude Opus 4.6 · Claude Code | 68.1 | 79.3 | +11.2 |
| GPT-5.4 · Codex CLI | 55.2 | 67.2 | +12.0 |
| Gemini 3.1 Pro · Gemini CLI | 81.0 | 82.8 | +1.8 |
| Gemini 3.1 Flash-Lite · Gemini CLI | 68.1 | 74.1 | +6.0 |

只列出翻盤的五組；其餘五組在檔案式遞送下仍由 grep 領先。

實驗 2 以固定的工作階段上限逐步加入干擾項（s5、s10、s20、s30、full）。曲線不是單調的。Chronos 搭配 Opus 在 s5 到 s20 以及 full 都是 vector 領先，但 s30 由 grep 領先，85.3 對 84.5。Claude Code 搭配 Opus 在每一個設定都由 grep 領先。Gemini CLI 搭配 Gemini 3.1 Pro 在每一個設定都由 vector 領先，到 full 時差距拉開到 89.7 對 78.5。論文自己的總結是：雜訊增加時，兩種方法都只輕微退化，但排序取決於 harness 與主幹模型。

這正是雙模組模型會預測的事。干擾項越多，精準的 Search 越有價值——但前提是 Get 能讓代理確認字面片段。如果 Get 很貴，第一組結果實際上就是全部的記憶，那麼「先求覆蓋」的檢索就會比較撐得住。論文沒有直接量到這個機制。這是一種解讀，不是實驗結果。

## 為什麼內嵌 grep 會贏

有三個性質。只有第一個和字面比對有關。

1. **handle 和內容一起到達。** 一個 grep 命中就是 `path:line:text`。代理在同一個 token 裡拿到預覽和位址，可以立刻 Get 周圍的範圍，不必再 Search 一次。內嵌的 vector 結果常常是一個帶分數的區塊；位址就算存在，也是模型可能永遠看不到的中繼資料。

2. **失敗是可讀的。** 寫壞的正規表達式會回傳空結果，或回傳明顯不對的東西。代理知道該換一個模式。糟糕的 embedding 則會回傳一個看起來很合理的鄰居；模型沒有任何訊號知道自己錯過了正確段落。稠密檢索失敗時很安靜，而這是記憶系統最糟的失敗方式。

3. **代理控制查詢。** 模型自己寫模式：可以加錨點、放寬、加檔案 glob，或換一個目錄。在 vector 工具裡，查詢是在代理看不到的介面後面重新編碼；它只能換句話說，然後祈禱。

這些都不代表字面比對在任何地方都更好。它只代表：當證據是字面的、而 handle 被保留下來時，字面比對是更好的 *Search*。論文的限制章節用不同的話說了同一件事：LongMemEval 的答案經常建立在逐字片段上，這個結果不該推廣到大量改寫或多模態的語料庫。

Codex 的崩跌，正好是說明這對動詞為何重要的反例。Search 沒問題：同一個 grep 工具、同一個語料庫、找到同一類命中。Get 卻變成一個三步驟工作流。模型必須注意到檔案路徑、打開它、找到相關區域，還要在多個回合之間把狀態維持住。當這個迴圈不可靠時，93.1% 的檢索器只生產出 55.2% 的答案。檢索品質是必要條件，不是產品本身。

harness 不是包在記憶外面的包裝。它就是記憶的形狀。

## handle 的契約

一旦 Search 開始回傳 handle，難題就轉移到 handle 身上。一個好的 handle 有五個性質。

1. **穩定。** 在任務的生命週期內，同一個 handle 解析到同一段位元組。如果儲存體會變動，handle 就必須帶著版本。

2. **可解析。** Get 原樣接受它。不重新 Search、不做模糊比對、不猜。

3. **有粒度。** 它指向一個片段，不是整份文件。`path:41-58`，不是 `path`。

4. **產生成本低。** Search 必須能一次回傳幾十個，而不吃掉上下文預算。

5. **可讀。** 人類在日誌裡看到它，就知道它指向哪裡。這不是正確性的必要條件，卻是除錯的必要條件。

| 儲存體 | Search 回傳 | Get 解析 | 過時模式 |
| :--- | :--- | :--- | :--- |
| 檔案 | `path:line` | 行號或位元組範圍 | 檔案被編輯，行號會漂移 |
| Git | `commit:path:line` | `git show commit:path` | 歷史被改寫，或物件被清除 |
| SQL | 主鍵或資料列 ID | `SELECT … WHERE id = ?` | 資料列被更新或刪除 |
| Web | URL 加片段 | 一個 HTTP GET | 頁面改變或回傳 404 |
| 向量索引 | 區塊 ID 加偏移 | 依 ID 取回 | 重建索引或換模型後重新編號 |
| 對話 | 訊息 ID 或回合索引 | 取回該回合 | 壓縮改寫了對話紀錄 |

這張表也顯示記憶從哪裡開始腐壞。每一個家族都有過時模式，而代理比一般應用更快撞上，因為語料庫常常就是上下文視窗本身。壓縮改寫歷史。重建索引重新編號區塊。一次檔案編輯會讓後面每一行的行號位移。代理留下的筆記——三個回合前存下的 handle——就這樣變成死連結。

代理記憶裡的連結腐化不是外觀問題。如果代理無法解析自己寫下的 handle，它只剩兩條路：重新 Search，花掉一個回合，而且可能得到不同答案；或是根據過時的預覽回答，賠上正確性。記憶系統應該把這個選擇攤開來：要嘛 handle 帶版本，要嘛 Get 在解析到不同位元組時明確回報不吻合，而不是安靜地把錯的東西交出去。

一個解析到錯誤位元組的 handle，比 404 還糟。至少 404 是誠實的。

## 把迴圈當成預算

Search 和 Get 的成本曲線不同。Search 的成本是一次掃描或索引探查，加上一個模型回合來讀候選清單。Get 的成本是回傳的位元組，加上一個模型回合來讀它們。前者隨語料庫規模成長，後者隨你選擇要讀多少而成長。

所以有效率的策略是不對稱的：Search 要廣而便宜，Get 要窄而精確。常見的失敗則剛好相反——一次狹窄的 Search，然後 Get 整份檔案。代理就是這樣花掉 40,000 個 token，去回答一個證據只有一段話的問題。

```python
def browse(cue, memory, budget):
    seen, evidence = set(), []
    while budget.left():
        hits = memory.search(cue, k=8)          # handle，不是複本
        fresh = [h for h in hits if h.id not in seen]
        if not fresh:
            break
        for h in fresh[:3]:
            seen.add(h.id)
            span = memory.get(h, window=40)     # 位址上的確切位元組
            evidence.append(span)
            cue = next_cue(cue, span)           # 新詞、日期或 ID
    return evidence
```

有三個細節很重要。`hits` 是一串 handle，不是段落；預覽是拿來排序的，不是拿來當證據的。`memory.get` 接受一個視窗，所以代理可以擴大命中周圍的上下文，而不必讀整份檔案。`next_cue` 把迴圈閉合：記錄本身提供下一個搜尋詞，這才是「翻閱」，而不只是「查詢」。

停止規則不是「讀了 k 筆結果」，而是「沒有新的 handle」或「每一個主張都有已解析的來源」。停在 k 的迴圈，等於把記憶變回引文服務。

該量什麼，也從迴圈推得出來：每個答案幾次 Search、每次 Search 幾次 Get、不重複的 handle 數、死 handle 比率，以及重新搜尋率。只看準確率，無法告訴你記憶是否真的可翻閱。一個回傳高分、卻只給得出少數可解析 handle 的系統，是搜尋引擎，不是記憶。

## 記憶測試台

下面的測試台把這個分工變得可見。同一個線索命中三筆記錄。Search 把它們排序，Get 把它們讀出來。只有一筆是現行政策。

<figure class="mem-lab">
  <figcaption>
    <span class="card-tag">記憶測試台 // 03</span>
    <h3 class="mem-fig-title">三個 handle 命中，只有一筆是現行版本</h3>
    <p class="mem-fig-sub">選一筆搜尋結果，然後讀 Get 實際回傳的內容。Search 排序，Get 決定。</p>
  </figcaption>
  <div class="mem-query">
    <span class="mem-query-tag">線索</span>
    <code>"refund window"</code>
    <span class="mem-query-meta">支援語料庫 · 4,812 筆記錄</span>
  </div>
  <div class="mem-desk">
    <div class="mem-results">
      <div class="mem-col-head">SEARCH // 3 個 HANDLE</div>
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
      <div class="mem-col-head">GET // 確切位元組</div>
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
    <p>摘要片段重複了那個詞，但沒有定義規則。handle 可以解析到一筆根本不該被引用的記錄。</p>
  </div>
  <div class="mem-fig-src">示意 · 純 CSS · 無 JavaScript</div>
</figure>

排名第一的命中，是過時的那一筆。這不是 Search 的 bug；這是排序所能知道的邊界。現行政策比較短、用了不同的說法，所以排在第二。Get 之所以能定案，是因為記錄自己帶著生效日與狀態。

如果記錄沒有帶著這些中繼資料，Get 只會回傳位元組，代理仍然只能猜。handle 解析的是位置；出處脈絡解析的是意義。

## 實務上要改什麼

- 讓每一個 Search 結果都帶著 Get 能吃的 handle。`path:line`、`doc_id#anchor`、`table:pk`、`commit:path:line`。

- 把 Get 做成第一級工具，而不是藏在 Search 裡的一個步驟。它要能原樣接受 handle，回傳確切位元組，或明確說找不到。

- 讓 Get 接受範圍。讀整份檔案，就是記憶系統變成上下文漏洞的開始。

- 讓 handle 在壓縮與重建索引之後仍然穩定。儲存體變動時給它們版本，遇到不吻合就明確報錯。

- 給 Search 不只一種工具。已知項目用字面搜尋，改寫用語意搜尋，結構用篩選。讓代理依照策略提示自己選，而不是寫死一條管線。

- 把預覽當預覽。如果模型從頭到尾只看到摘要片段，它就會用摘要片段回答。

- 把出處放進記錄裡。生效日、狀態、來源類型與版本，應該在 Get 回傳的位元組裡，而不是在代理看不到的側通道。

- 報告檢索器時，也報告 harness。沒有遞送路徑與停止策略的分數，無法重現。

## 論文沒有說的事

它沒有說 grep 在一般情況下都贏過 vector。作者講得很清楚：這個任務獎勵字面片段；科學綜整、大量改寫的摘要、視覺化文件與程式語意，可能更適合稠密檢索或混合檢索。

harness 既是一個變數，也是一個干擾變因。Chronos 使用依類別調整的提示與受控的工具介面；CLI 則帶著自己的使用體驗。16.4 個百分點的 harness 位移是真的，但它不是「harness 品質」的乾淨估計。

檔案式遞送是一個工作流測試，不是單純的遞送測試。它改變了回合數、失敗面，以及模型弄丟狀態的機會。Codex 的崩跌是關於迴圈的證據，不是關於 grep 的證據。

雜訊實驗不是單調的，論文也沒有隔離查詢字串或檢索到的集合。交叉點是量出來的；機制是推論出來的。

最重要的是，論文量的是答案準確率，不是記憶。它沒有測試代理明天能不能回到同一個來源、把它擴大、引用它，或發現它變了。而這些正是雙模組框架關心的性質。一個真正的記憶基準測試，必須直接量這些東西。

Grep 不是全部。Grep 是一對。問題不是你要裝哪一種索引，而是你的記憶有沒有把兩個動詞都暴露出來。

Search 找到位址。Get 讀到書架。迴圈讓它成為記憶。

## 參考資料

- [Is Grep All You Need? How Agent Harnesses Reshape Agentic Search](https://arxiv.org/abs/2605.15184)——本文討論的論文：116 題 LongMemEval-S、四種 harness、兩種檢索器、兩種遞送路徑。
- [LongMemEval](https://arxiv.org/abs/2410.10813)——兩個實驗都用到的長期對話記憶基準測試。
- [Chronos](https://arxiv.org/abs/2603.16862)——自製 harness 與結構化時間事件層。
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)——本文正在爭論的「先檢索、再生成」管線。
- [MemGPT](https://arxiv.org/abs/2310.08560)——把記憶當成作業系統，在上下文與儲存之間分頁。
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)——為什麼更多檢索文字不等於更好用。
- [grep, POSIX](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html)——本文把它的輸出形狀當成一種介面。

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
  }
</style>
