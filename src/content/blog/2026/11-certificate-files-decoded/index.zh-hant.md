---
title: "憑證檔案全解析：PEM、DER、PFX、P7B 與 JKS"
description: "TLS 憑證檔案裡到底裝了什麼、可篩選的格式矩陣，以及從檢查到在 Linux 自簽鏈的 OpenSSL 實戰教學。"
pubDate: 2026-11-22
category: "Web"
tags: ["TLS", "OpenSSL", "憑證", "Linux", "資訊安全"]
featured: false
author: "Alex.Hsiao"
readTime: "15 分鐘"
---

# 憑證檔案全解析：PEM、DER、PFX、P7B 與 JKS

憑證檔案不是一種格式。它是一個箱子，標籤由人貼上。

箱子裡最多只有三種內容：**網域憑證**（你的網域名稱與公鑰，由 CA 簽發）、**中繼憑證鏈**（你的憑證與受信任根憑證之間的連結），以及**私鑰**（公鑰的另一半）。其餘的一切——`.pem`、`.crt`、`.pfx`、`.jks`——描述的是這些內容如何編碼、如何打包。

一旦看懂這三種內容，副檔名就不再是冷知識。你能預測一個檔案能裝什麼、不能裝什麼，也能直接挑對 `openssl` 指令，不必再猜。

<style>
  .prose-inner .crt-sprite {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .prose-inner .crt-fig,
  .prose-inner .crt-matrix {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .crt-fig figcaption,
  .prose-inner .crt-matrix figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .crt-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .crt-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .crt-fig-src {
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

  .prose-inner .crt-scroll {
    overflow-x: auto;
  }

  .prose-inner .crt-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .crt-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .crt-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .crt-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .crt-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .crt-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .crt-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .crt-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .crt-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .crt-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .crt-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  .prose-inner .crt-svg .ico {
    color: var(--mono-ink);
  }

  .prose-inner .crt-svg .muted {
    color: var(--mono-muted);
  }

  .prose-inner .crt-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .prose-inner .crt-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-muted);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .prose-inner .crt-chip:hover {
    border-color: var(--mono-l5);
    color: var(--mono-ink);
  }

  .prose-inner .crt-chip input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .prose-inner .crt-chip:has(input:checked) {
    background: var(--mono-ink);
    border-color: var(--mono-ink);
    color: var(--mono-paper);
  }

  .prose-inner .crt-chip:has(input:focus-visible) {
    outline: 0.8px solid var(--mono-ink);
    outline-offset: 2px;
  }

  .prose-inner .crt-matrix .crt-table-wrap {
    overflow-x: auto;
  }

  .prose-inner .crt-matrix .crt-table {
    display: table;
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    font-size: 11px;
    margin: 0;
    white-space: normal;
    overflow: visible;
  }

  .prose-inner .crt-matrix .crt-table th {
    padding: 8px 6px;
    border: 0;
    border-bottom: 0.7px solid var(--mono-grid);
    background: transparent;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-muted);
    text-align: left;
    vertical-align: bottom;
    white-space: nowrap;
  }

  .prose-inner .crt-matrix .crt-table td {
    padding: 9px 6px;
    border: 0;
    border-bottom: 0.7px dashed var(--mono-grid);
    vertical-align: middle;
    text-align: left;
  }

  .prose-inner .crt-matrix .crt-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .prose-inner .crt-matrix .crt-table th:first-child,
  .prose-inner .crt-matrix .crt-table td:first-child {
    width: 22%;
    padding-left: 0;
  }

  .prose-inner .crt-matrix .crt-table th.crt-c,
  .prose-inner .crt-matrix .crt-table td.crt-c {
    width: 7%;
    text-align: center;
  }

  .prose-inner .crt-matrix .crt-table td b {
    display: block;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .crt-matrix .crt-table td b + span {
    display: block;
    margin-top: 1px;
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    line-height: 1.4;
    color: var(--mono-muted);
  }

  .prose-inner .crt-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 0.7px solid var(--mono-l5);
    border-radius: 50%;
    background: transparent;
    vertical-align: middle;
  }

  .prose-inner .crt-dot--on {
    background: var(--mono-ink);
    border-color: var(--mono-ink);
  }

  .prose-inner .crt-dot--opt {
    background: linear-gradient(90deg, var(--mono-ink) 50%, transparent 50%);
    border-color: var(--mono-ink);
  }

  .prose-inner .crt-pass {
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    color: var(--mono-muted);
  }

  .prose-inner .crt-pass--req {
    color: var(--mono-ink);
    font-weight: 700;
  }

  .prose-inner .crt-home {
    display: block;
    font-size: 9.5px;
    line-height: 1.4;
    color: var(--mono-l2);
  }

  .prose-inner .crt-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    letter-spacing: 0.04em;
    color: var(--mono-muted);
  }

  .prose-inner .crt-legend > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .prose-inner .crt-vh {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .prose-inner .crt-matrix:has(#crt-f-key:checked) .crt-table tbody tr:not([data-key='yes']),
  .prose-inner .crt-matrix:has(#crt-f-pub:checked) .crt-table tbody tr[data-key='yes'],
  .prose-inner .crt-matrix:has(#crt-f-pass:checked) .crt-table tbody tr:not([data-pass='required']),
  .prose-inner .crt-matrix:has(#crt-f-bin:checked) .crt-table tbody tr:not([data-enc='binary']) {
    display: none;
  }

  @media (max-width: 700px) {
    .prose-inner .crt-fig,
    .prose-inner .crt-matrix {
      padding: 16px 14px 12px;
    }

    .prose-inner .crt-scroll svg {
      min-width: 680px;
    }
  }

  @media (max-width: 680px) {
    .prose-inner .crt-matrix .crt-table-wrap {
      overflow-x: visible;
    }

    .prose-inner .crt-matrix .crt-table,
    .prose-inner .crt-matrix .crt-table tbody,
    .prose-inner .crt-matrix .crt-table tr {
      display: block;
      width: 100%;
    }

    .prose-inner .crt-matrix .crt-table {
      white-space: normal;
      overflow: visible;
    }

    .prose-inner .crt-matrix .crt-table thead {
      display: none;
    }

    .prose-inner .crt-matrix .crt-table tr {
      padding: 10px 0;
      border-bottom: 0.7px solid var(--mono-grid);
    }

    .prose-inner .crt-matrix .crt-table tr:last-child {
      border-bottom: 0;
    }

    .prose-inner .crt-matrix .crt-table td,
    .prose-inner .crt-matrix .crt-table td.crt-c,
    .prose-inner .crt-matrix .crt-table td:first-child {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 2px 12px;
      width: 100%;
      padding: 3px 0;
      border: 0;
      text-align: left;
      white-space: normal;
    }

    .prose-inner .crt-matrix .crt-table td::before {
      grid-column: 1;
      grid-row: 1;
      content: attr(data-label);
      font-family: var(--mono-font-mono);
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--mono-muted);
    }

    .prose-inner .crt-matrix .crt-table td:first-child {
      display: block;
      margin-bottom: 4px;
      text-align: left;
    }

    .prose-inner .crt-matrix .crt-table td:first-child::before {
      display: none;
    }

    .prose-inner .crt-matrix .crt-table td:first-child b,
    .prose-inner .crt-matrix .crt-table td:first-child b + span {
      text-align: left;
    }

    .prose-inner .crt-matrix .crt-table td:not(:first-child) b {
      grid-column: 2;
      grid-row: 1;
      font-size: 12px;
      text-align: right;
    }

    .prose-inner .crt-matrix .crt-table td:not(:first-child) b + span {
      grid-column: 2;
      grid-row: 2;
      margin-top: 0;
      font-size: 8px;
      text-align: right;
    }

    .prose-inner .crt-matrix .crt-table td:not(:first-child) > .crt-pass,
    .prose-inner .crt-matrix .crt-table td:not(:first-child) > .crt-home,
    .prose-inner .crt-matrix .crt-table td:not(:first-child) > .crt-dot {
      grid-column: 2;
      grid-row: 1;
      text-align: right;
    }
  }
</style>

## 三種內容，一個箱子

先從「裡面可能有什麼」開始。一個檔案可能只裝一種內容，也可能三種全裝；光看副檔名不會知道。

<div class="crt-sprite" aria-hidden="true">
  <svg width="0" height="0" focusable="false">
    <defs>
      <symbol id="crt-i-file" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></g></symbol>
      <symbol id="crt-i-layers" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></g></symbol>
      <symbol id="crt-i-key" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></g></symbol>
      <symbol id="crt-i-shield" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></g></symbol>
      <symbol id="crt-i-server" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/></g></symbol>
      <symbol id="crt-i-globe" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20M2 12h20"/></g></symbol>
      <symbol id="crt-i-lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><circle cx="12" cy="16" r="1"/><rect width="18" height="12" x="3" y="10" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></g></symbol>
      <symbol id="crt-i-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3L15 18"/></g></symbol>
      <symbol id="crt-i-terminal" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M12 19h8M4 17l6-6l-6-6"/></g></symbol>
      <symbol id="crt-i-binary" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><rect width="4" height="6" x="14" y="14" rx="2"/><rect width="4" height="6" x="6" y="4" rx="2"/><path d="M6 20h4m4-10h4M6 14h2v6m6-16h2v6"/></g></symbol>
    </defs>
  </svg>
</div>

<figure class="crt-fig">
  <figcaption>
    <span class="card-tag">ANATOMY // 01</span>
    <h3 class="crt-fig-title">TLS 檔案可能攜帶的三種內容</h3>
    <p class="crt-fig-sub">容器會變，內容不會。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 260" role="img" aria-labelledby="crt-f1-title crt-f1-desc">
    <title id="crt-f1-title">憑證檔案結構</title>
    <desc id="crt-f1-desc">一個檔案可以任意組合網域憑證、中繼憑證鏈與私鑰。</desc>
    <text x="24" y="22" class="f" font-size="8" letter-spacing="1.2">一個檔案 // 三種可能內容</text>
    <rect x="24" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-file" x="40" y="58" width="20" height="20" class="ico"/>
    <text x="70" y="72" class="t" font-size="10.5" font-weight="700">網域憑證</text>
    <line x1="40" y1="90" x2="244" y2="90" class="rule"/>
    <text x="40" y="110" class="m" font-size="9">你的網域名稱與</text>
    <text x="40" y="124" class="m" font-size="9">公鑰，由 CA 簽發。</text>
    <text x="40" y="160" class="f" font-size="7.5" letter-spacing="0.9">傳送給每位訪客</text>
    <rect x="282" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-layers" x="298" y="58" width="20" height="20" class="ico"/>
    <text x="328" y="72" class="t" font-size="10.5" font-weight="700">中繼憑證鏈</text>
    <line x1="298" y1="90" x2="502" y2="90" class="rule"/>
    <text x="298" y="110" class="m" font-size="9">你的憑證與</text>
    <text x="298" y="124" class="m" font-size="9">受信任根憑證之間的連結。</text>
    <text x="298" y="160" class="f" font-size="7.5" letter-spacing="0.9">隨葉憑證傳送</text>
    <rect x="540" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-key" x="556" y="58" width="20" height="20" class="ico"/>
    <text x="586" y="72" class="t" font-size="10.5" font-weight="700">私鑰</text>
    <line x1="556" y1="90" x2="760" y2="90" class="rule"/>
    <text x="556" y="110" class="m" font-size="9">金鑰對的另一半。</text>
    <text x="556" y="124" class="m" font-size="9">它永遠不離開主機。</text>
    <text x="556" y="160" class="f" font-size="7.5" letter-spacing="0.9">絕不傳送給任何人</text>
    <line x1="24" y1="216" x2="776" y2="216" class="rule"/>
    <text x="24" y="238" class="m" font-size="9">一個 <tspan class="mono" font-weight="700">.pem</tspan> 可以裝任意組合；<tspan class="mono" font-weight="700">.crt</tspan> 裝憑證；<tspan class="mono" font-weight="700">.key</tspan> 裝一把金鑰；<tspan class="mono" font-weight="700">.pfx</tspan> 則三種全裝。</text>
  </svg>
  </div>
  <div class="crt-fig-src">結構 · 三種內容 · 圖示：LUCIDE VIA ICONIFY</div>
</figure>

實務上的結論很簡單。檔案裡若有私鑰，就得當成密碼一樣保護。若只有憑證，它本來就是公開的，可以隨意複製。副檔名不會告訴你屬於哪一種；內容才會。

## 三秒測試：文字還是二進位

安裝任何東西之前，先看第一行。PEM 是包在 ASCII 外框裡的 Base64，所以任何編輯器都讀得懂。DER 以及建構於其上的容器則是二進位。

<figure class="crt-fig">
  <figcaption>
    <span class="card-tag">TRIAGE // 02</span>
    <h3 class="crt-fig-title">副檔名是習慣，位元組才是證據</h3>
    <p class="crt-fig-sub">兩邊各下一道指令，就知道手上是哪一種。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 240" role="img" aria-labelledby="crt-f2-title crt-f2-desc">
    <title id="crt-f2-title">文字與二進位憑證檔案</title>
    <desc id="crt-f2-desc">以 BEGIN 開頭的可讀文字是 PEM。二進位位元組代表 DER、PKCS#12 或 JKS。</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">轉換之前，先打開來看</text>
    <rect x="24" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-file" x="40" y="52" width="16" height="16" class="ico"/>
    <text x="64" y="64" class="f" font-size="7.5" letter-spacing="1">可讀文字</text>
    <text x="40" y="88" class="t" font-size="11" font-weight="700">PEM 與 PKCS#7</text>
    <rect x="40" y="102" width="324" height="44" class="codebox"/>
    <text x="52" y="119" class="f mono" font-size="7.5">$ head -1 leaf.pem</text>
    <text x="52" y="135" class="t mono" font-size="8.5">-----BEGIN CERTIFICATE-----</text>
    <text x="40" y="166" class="m" font-size="8.5">格式：.pem .crt .cer .key .p7b</text>
    <text x="40" y="182" class="m" font-size="8.5">用文字編輯器就能辨識。</text>
    <line x1="400" y1="48" x2="400" y2="106" class="rule"/>
    <text x="400" y="126" class="f" font-size="8" text-anchor="middle" letter-spacing="1">或</text>
    <line x1="400" y1="140" x2="400" y2="196" class="rule"/>
    <rect x="420" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-binary" x="436" y="52" width="16" height="16" class="ico"/>
    <text x="460" y="64" class="f" font-size="7.5" letter-spacing="1">二進位</text>
    <text x="436" y="88" class="t" font-size="11" font-weight="700">DER, PKCS#12, JKS</text>
    <rect x="436" y="102" width="324" height="44" class="codebox"/>
    <text x="448" y="119" class="f mono" font-size="7.5">$ xxd -l 16 leaf.der</text>
    <text x="448" y="135" class="t mono" font-size="8">30 82 03 65 30 82 02 4d a0 03 02 01 02 02 14 46</text>
    <text x="436" y="166" class="m" font-size="8.5">格式：.der .cer .pfx .p12 .jks</text>
    <text x="436" y="182" class="m" font-size="8.5">用 openssl、keytool 或十六進位檢視器。</text>
    <text x="24" y="228" class="m" font-size="8.5">一個 <tspan class="mono" font-weight="700">.cer</tspan> 可能是其中任一種，<tspan class="mono" font-weight="700">.p7b</tspan> 也是。副檔名不等於格式。</text>
  </svg>
  </div>
  <div class="crt-fig-src">初步判斷 · 開頭位元組 · 取自下方實驗的真實輸出</div>
</figure>

`BEGIN` 這一行也順便說明了內容是什麼：

- `-----BEGIN CERTIFICATE-----` — 一張憑證。可能是葉憑證，也可能是中繼憑證。
- `-----BEGIN PRIVATE KEY-----` — 未加密的 PKCS#8 私鑰。
- `-----BEGIN ENCRYPTED PRIVATE KEY-----` — 受密碼短語保護的 PKCS#8 金鑰。
- `-----BEGIN RSA PRIVATE KEY-----` — 舊式 PKCS#1 RSA 金鑰。
- `-----BEGIN EC PRIVATE KEY-----` — SEC1 橢圓曲線金鑰。
- `-----BEGIN PKCS7-----` — 憑證的 P7B 打包。

如果開頭位元組是 `30 82`，那是 DER 裡的 ASN.1 SEQUENCE。它可能是憑證、PKCS#12 檔案或 JKS 金鑰庫；下一道指令會告訴你是哪一種。

## 格式矩陣

七個名字、三種內容、兩種編碼。篩選矩陣，回答你真正想問的問題。

<figure class="crt-matrix">
  <figcaption>
    <span class="card-tag">FORMAT MATRIX // 03</span>
    <h3 class="crt-fig-title">真正會變的只有兩件事：編碼與打包</h3>
    <p class="crt-fig-sub">容器可以裝哪些內容。只有內含私鑰時才需要密碼。</p>
  </figcaption>
  <div class="crt-filters" role="group" aria-label="篩選憑證格式矩陣">
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-all" checked><span>全部 7 種</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-key"><span>含私鑰</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pub"><span>只有公開憑證</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pass"><span>需要密碼</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-bin"><span>二進位</span></label>
  </div>
  <div class="crt-table-wrap">
    <table class="crt-table">
      <caption class="crt-vh">依內容、編碼、密碼保護與常見平台比較憑證檔案格式</caption>
      <thead>
        <tr>
          <th scope="col">格式</th>
          <th scope="col" class="crt-c">網域憑證</th>
          <th scope="col" class="crt-c">中繼鏈</th>
          <th scope="col" class="crt-c">私鑰</th>
          <th scope="col">編碼</th>
          <th scope="col">密碼</th>
          <th scope="col">常見環境</th>
        </tr>
      </thead>
      <tbody>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="格式"><b>.pem</b><span>文字容器</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="編碼"><b>PEM</b><span>Base64 文字</span></td>
          <td data-label="密碼"><span class="crt-pass">選用</span></td>
          <td data-label="常見環境"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="格式"><b>.crt / .cer</b><span>命名慣例</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--opt" aria-hidden="true"></span><span class="crt-vh">有時</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="編碼"><b>PEM 或 DER</b><span>皆可</span></td>
          <td data-label="密碼"><span class="crt-pass">無</span></td>
          <td data-label="常見環境"><span class="crt-home">Apache · Windows</span></td>
        </tr>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="格式"><b>.key</b><span>僅私鑰</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="編碼"><b>PEM</b><span>Base64 文字</span></td>
          <td data-label="密碼"><span class="crt-pass">選用</span></td>
          <td data-label="常見環境"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="binary">
          <td data-label="格式"><b>.der</b><span>編碼，不是容器</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="編碼"><b>DER</b><span>二進位</span></td>
          <td data-label="密碼"><span class="crt-pass">無</span></td>
          <td data-label="常見環境"><span class="crt-home">Windows · Java</span></td>
        </tr>
        <tr data-key="yes" data-pass="required" data-enc="binary">
          <td data-label="格式"><b>.pfx / .p12</b><span>PKCS#12</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="編碼"><b>PKCS#12</b><span>二進位</span></td>
          <td data-label="密碼"><span class="crt-pass crt-pass--req">必須</span></td>
          <td data-label="常見環境"><span class="crt-home">IIS · Azure · macOS</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="格式"><b>.p7b</b><span>PKCS#7</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">絕不</span></td>
          <td data-label="編碼"><b>PKCS#7</b><span>文字或二進位</span></td>
          <td data-label="密碼"><span class="crt-pass">無</span></td>
          <td data-label="常見環境"><span class="crt-home">Windows · Tomcat</span></td>
        </tr>
        <tr data-key="yes" data-pass="required" data-enc="binary">
          <td data-label="格式"><b>.jks</b><span>Java 金鑰庫</span></td>
          <td data-label="網域憑證" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中繼鏈" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私鑰" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="編碼"><b>JKS</b><span>二進位</span></td>
          <td data-label="密碼"><span class="crt-pass crt-pass--req">必須</span></td>
          <td data-label="常見環境"><span class="crt-home">Tomcat · Spring Boot</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="crt-legend" aria-hidden="true">
    <span><span class="crt-dot crt-dot--on"></span>可包含</span>
    <span><span class="crt-dot crt-dot--opt"></span>有時</span>
    <span><span class="crt-dot crt-dot--off"></span>絕不</span>
  </div>
  <div class="crt-fig-src">格式矩陣 · 7 種容器 · 內容 / 編碼 / 密碼</div>
</figure>

篩選器純 CSS。背後沒有 JavaScript：幾個 radio input 加 `:has()` 選擇器就決定哪些列要顯示。這和檔案本身的道理一樣——結構承載行為。

### 逐一拆解格式

**`.pem`** 是共通語言。它是用 `BEGIN`/`END` 包起來的 Base64 編碼 DER，所以能安然通過複製貼上、電子郵件與設定檔。一個 `.pem` 可以裝一張憑證、一串鏈、一把私鑰，或全部串在一起。Nginx 與 Apache 到處都接受它。

**`.crt` 與 `.cer`** 是命名慣例，不是格式。在 Linux 上，`.crt` 幾乎都是 PEM，和 `.pem` 可以互換。在 Windows 上，`.cer` 通常是 DER。兩者都不該含私鑰；若真的含了，就當它已外洩。

**`.key`** 只裝一把私鑰。檔頭會告訴你是哪種編碼：PKCS#8（`BEGIN PRIVATE KEY`）、PKCS#1（`BEGIN RSA PRIVATE KEY`）或 SEC1（`BEGIN EC PRIVATE KEY`）。權限比副檔名重要：`chmod 600`，擁有者設為 root。

**`.der`** 是一種編碼，不是容器。它的 ASN.1 結構和 PEM 相同，只是少了 Base64 外框，所以小約 25%，而且文字編輯器讀不懂。它通常只裝一張憑證。

**`.pfx` 與 `.p12`** 是同一件事：PKCS#12，一個由密碼保護、裝著憑證與私鑰的二進位封裝檔。Windows IIS、Azure 與 macOS Keychain 要的就是這個。沒有密碼的 PFX 不叫 PFX；密碼是格式的一部分。

**`.p7b`** 是 PKCS#7。它打包憑證——葉憑證加中繼憑證，有時也含根憑證——但永遠裝不了私鑰。它的存在是為了在系統之間搬運憑證鏈，在 Windows 與較舊的 Tomcat 部署很常見。

**`.jks`** 是 Java 專有的金鑰庫。它把憑證與金鑰鎖在密碼之後，這點和 PFX 一樣，但用的是 Java 專屬的二進位配置。自 Java 9 起，預設金鑰庫類型是 PKCS#12（[JEP 229](https://openjdk.org/jeps/229)）；JKS 在 Tomcat、Jetty 與長期運行的 Spring Boot 安裝中仍很常見。

## 在 Linux 上建一條鏈

下面的指令會建立根憑證 CA、中繼 CA 與伺服器憑證。形狀和公開 CA 用的一樣，只是名字換成你自己的。在空目錄裡執行；一切都在本機，而且都是自簽。

```bash
# 1. Root CA — self-signed, the trust anchor
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout root.key -out root.pem \
  -subj "/CN=Lab Root CA" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"

# 2. Intermediate CA — signed by the root
openssl req -new -newkey rsa:2048 -nodes \
  -keyout int.key -out int.csr -subj "/CN=Lab Intermediate CA"

printf "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n" > int.ext
openssl x509 -req -in int.csr -CA root.pem -CAkey root.key \
  -CAcreateserial -days 1825 -extfile int.ext -out int.pem

# 3. Server certificate — signed by the intermediate
openssl req -new -newkey rsa:2048 -nodes \
  -keyout leaf.key -out leaf.csr -subj "/CN=example.test"

printf "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:example.test,DNS:www.example.test\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n" > leaf.ext
openssl x509 -req -in leaf.csr -CA int.pem -CAkey int.key \
  -CAcreateserial -days 397 -extfile leaf.ext -out leaf.pem

# 4. What the server actually loads
cat leaf.pem int.pem > fullchain.pem
chmod 600 root.key int.key leaf.key
```

<figure class="crt-fig">
  <figcaption>
    <span class="card-tag">LAB // 04</span>
    <h3 class="crt-fig-title">實驗剛建好的東西，以及哪個檔案是哪個</h3>
    <p class="crt-fig-sub">葉憑證是公開的。中繼憑證是公開的。兩把金鑰不是。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 320" role="img" aria-labelledby="crt-f3-title crt-f3-desc">
    <title id="crt-f3-title">在 Linux 上建立的自簽鏈</title>
    <desc id="crt-f3-desc">root.pem 簽發 int.pem；int.pem 簽發 leaf.pem。leaf.key 對應 leaf.pem。fullchain.pem 依序包含 leaf.pem 與 int.pem。</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">在 LINUX 自簽 // 檔案對照</text>
    <rect x="24" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-shield" x="38" y="52" width="18" height="18" class="ico"/>
    <text x="64" y="64" class="t mono" font-size="10" font-weight="700">root.pem</text>
    <text x="64" y="78" class="f" font-size="7" letter-spacing="0.8">根憑證 CA · 自簽</text>
    <line x1="38" y1="88" x2="226" y2="88" class="rule"/>
    <text x="38" y="106" class="m" font-size="8.5">本實驗建立，信任錨點。</text>
    <rect x="292" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-server" x="306" y="52" width="18" height="18" class="ico"/>
    <text x="332" y="64" class="t mono" font-size="10" font-weight="700">int.pem</text>
    <text x="332" y="78" class="f" font-size="7" letter-spacing="0.8">中繼憑證 CA</text>
    <line x1="306" y1="88" x2="494" y2="88" class="rule"/>
    <text x="306" y="106" class="m" font-size="8.5">由 root.key 簽發。</text>
    <rect x="560" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-globe" x="574" y="52" width="18" height="18" class="ico"/>
    <text x="600" y="64" class="t mono" font-size="10" font-weight="700">leaf.pem</text>
    <text x="600" y="78" class="f" font-size="7" letter-spacing="0.8">網域憑證</text>
    <line x1="574" y1="88" x2="762" y2="88" class="rule"/>
    <text x="574" y="106" class="m" font-size="8.5">CN=example.test · 由 int.key 簽發</text>
    <line x1="240" y1="81" x2="284" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="262" y="72" class="f mono" font-size="7" text-anchor="middle">簽發</text>
    <line x1="508" y1="81" x2="552" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="530" y="72" class="f mono" font-size="7" text-anchor="middle">簽發</text>
    <rect x="24" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-lock" x="38" y="186" width="16" height="16" class="ico muted"/>
    <text x="62" y="198" class="t mono" font-size="9.5" font-weight="700">root.key</text>
    <text x="38" y="218" class="m" font-size="8">根憑證的私鑰。</text>
    <text x="38" y="234" class="f" font-size="7" letter-spacing="0.7">離線保管 · 0600</text>
    <rect x="292" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-layers" x="306" y="186" width="16" height="16" class="ico"/>
    <text x="330" y="198" class="t mono" font-size="9.5" font-weight="700">fullchain.pem</text>
    <text x="306" y="218" class="m" font-size="8">leaf.pem + int.pem，葉憑證在前。</text>
    <text x="306" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate</text>
    <rect x="560" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-key" x="574" y="186" width="16" height="16" class="ico"/>
    <text x="598" y="198" class="t mono" font-size="9.5" font-weight="700">leaf.key</text>
    <text x="574" y="218" class="m" font-size="8">伺服器私鑰。</text>
    <text x="574" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate_key</text>
    <line x1="132" y1="124" x2="132" y2="164" class="dash"/>
    <text x="140" y="148" class="f mono" font-size="7">同一金鑰對</text>
    <line x1="668" y1="124" x2="668" y2="164" class="dash"/>
    <text x="676" y="148" class="f mono" font-size="7">同一金鑰對</text>
    <line x1="24" y1="272" x2="776" y2="272" class="rule"/>
    <text x="24" y="292" class="m" font-size="8.5">伺服器送出 <tspan class="mono" font-weight="700">leaf.pem</tspan> 與 <tspan class="mono" font-weight="700">int.pem</tspan>；瀏覽器早已持有它信任的根憑證。</text>
    <text x="24" y="308" class="f mono" font-size="7.5">cat leaf.pem int.pem &gt; fullchain.pem   # 順序很重要</text>
    <defs>
      <marker id="crt-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="var(--mono-ink)"/></marker>
    </defs>
  </svg>
  </div>
  <div class="crt-fig-src">LINUX 實驗 · 根 → 中繼 → 葉 · 私鑰不外流</div>
</figure>

兩個細節很容易漏掉。第一，`-nodes` 的意思是「不用 DES」：它寫出的私鑰沒有密碼短語。這在實驗室很方便，在正式環境很危險。第二，葉憑證是用 `-CAkey int.key` 簽的，不是 `root.key`。跳過中繼，就會得到一張無法鏈回你剛建立之根憑證的憑證。

## OpenSSL 實戰指南

本文接下來假設上面的實驗檔案都在目前目錄。除非特別註明，每道指令都只讀不寫。

### 信任之前，先讀檔案

```bash
# Subject, issuer, and validity window
openssl x509 -in leaf.pem -noout -subject -issuer -dates

# Everything: extensions, SANs, key usage, fingerprints
openssl x509 -in leaf.pem -noout -text

# Subject Alternative Names only
openssl x509 -in leaf.pem -noout -ext subjectAltName

# A private key: algorithm and size, without printing the secret
openssl pkey -in leaf.key -noout -text
```

`subject` 是這張憑證給誰用的；`issuer` 是誰簽的。如果兩者相同，這張憑證就是自簽。`X509v3 Subject Alternative Name` 區塊才是瀏覽器真正檢查的清單；舊的 `CN` 欄位在主機名稱比對時已被忽略。

PFX 的對等第一眼是：

```bash
openssl pkcs12 -in bundle.pfx -info -noout -passin pass:demo
```

它會印出 MAC 演算法，以及憑證 bag 與金鑰 bag 所用的加密方式。如果指令什麼都還沒印就失敗，代表密碼錯了，或這個檔案不是 PKCS#12。

### 用瀏覽器的方式驗證鏈

`openssl verify` 把受信任的根憑證與不受信任的中繼憑證分開給：

```bash
openssl verify -CAfile root.pem -untrusted int.pem leaf.pem
```

```text
leaf.pem: OK
```

拿掉 `-untrusted int.pem`，同樣的指令就會失敗：

```text
CN=example.test
error 20 at 0 depth lookup: unable to get local issuer certificate
error leaf.pem: verification failed
```

這個錯誤是 TLS 中斷最常見的單一原因。葉憑證本身有效，但伺服器沒有送出那張把它接到受信任根憑證的中繼憑證。Windows 的憑證鏈引擎有時會靠 CA 的 AIA URL 去抓缺的憑證來掩蓋問題；Chrome、Firefox 與多數行動用戶端不會。

要測試線上伺服器實際送了什麼，用 SNI 加 here-string，讓指令自己結束：

```bash
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts </dev/null
```

數一數輸出裡有幾張憑證。一張代表只有葉憑證；兩張以上代表有鏈。加上 `-CAfile root.pem -verify_return_error`，驗證失敗就會產生非零的結束碼——沒有這個旗標時，`s_client` 即使印出 `Verify return code: 20` 也會以 `0` 結束。

用一行總結一個線上端點：

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

### 證明金鑰與憑證相符

憑證裡有公鑰。`.key` 檔裡有私鑰那一半。兩者的公鑰相同就代表相符，而最安全的比法對 RSA 與 EC 一體適用：

```bash
openssl x509 -in leaf.pem -noout -pubkey | openssl sha256
openssl pkey -in leaf.key -pubout | openssl sha256
```

```text
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
```

如果雜湊不同，Nginx 會以 `SSL_CTX_use_PrivateKey` 或「key values mismatch」拒絕啟動。別想靠編輯任一個檔案來修；重新簽發或重新匯出這對金鑰。

### 在警報響起之前先檢查到期

```bash
openssl x509 -in leaf.pem -noout -enddate
openssl x509 -in leaf.pem -noout -checkend 2592000
```

```text
notAfter=Dec 24 05:24:30 2027 GMT
Certificate will not expire
```

`-checkend` 接收秒數；憑證在那段時間內仍有效就回傳結束碼 `0`，若會在期限內過期則回傳 `1`。三十天是 `2592000`。把它放進 cron job，並在結束碼非零時告警。

這只檢查一張憑證。如果你跑的是鏈，中繼憑證也要檢查；過期的中繼憑證和過期的葉憑證一樣，會徹底弄斷握手。

### 在 PEM 與 DER 之間轉換

```bash
# PEM to DER
openssl x509 -in leaf.pem -outform DER -out leaf.der

# DER to PEM
openssl x509 -in leaf.der -inform DER -out leaf-from-der.pem
```

`openssl x509` 在近期的版本對輸入很寬容，但 `-inform` 能消除歧義。如果你不確定手上是哪一種，`file leaf.cer` 會回答：

```text
leaf.pem: PEM certificate
leaf.der: Certificate, Version=3
```

### 打包與解開 PKCS#12

要從 PEM 金鑰、葉憑證與中繼憑證建立 PFX：

```bash
openssl pkcs12 -export -out bundle.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -passout pass:demo
```

`-certfile` 就是讓中繼憑證進到封裝檔的關鍵。少了它，你會得到一個匯入時一切正常、到了瀏覽器卻失敗的 PFX。要讀回來：

```bash
# Everything, including the key, into one PEM
openssl pkcs12 -in bundle.pfx -out bundle.pem -nodes -passin pass:demo

# Certificates only
openssl pkcs12 -in bundle.pfx -nokeys -passin pass:demo

# Leaf certificate only
openssl pkcs12 -in bundle.pfx -nokeys -clcerts -passin pass:demo

# Private key only
openssl pkcs12 -in bundle.pfx -nocerts -nodes -passin pass:demo
```

`-nodes` 再次代表「不要加密輸出的金鑰」。若你想讓 OpenSSL 提示輸入新的密碼短語，就把它拿掉。

OpenSSL 3 預設用 PBES2、PBKDF2、AES-256-CBC 與 SHA-256 MAC 寫出 PFX。舊的 Windows Server 版本與舊 JVM 可能拒絕這種組合，並給出誤導人的「密碼錯誤」。如果非得支援它們，就明確指定演算法：

```bash
openssl pkcs12 -export -out bundle-legacy.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -certpbe PBE-SHA1-3DES -keypbe PBE-SHA1-3DES -macalg sha1 \
  -passout pass:demo
```

`-legacy` 也能用，但它會為憑證 bag 產生 RC2-40，強度較弱，而且在 OpenSSL 3 上還得再加 `-legacy` 才讀得回來。明確指定 3DES 的寫法比較可攜。

### 讀取 P7B 打包

```bash
# Build a P7B from a full chain
openssl crl2pkcs7 -nocrl -certfile fullchain.pem -out chain.p7b

# List the certificates inside
openssl pkcs7 -in chain.p7b -print_certs -noout
```

```text
subject=CN=example.test
issuer=CN=Lab Intermediate CA

subject=CN=Lab Intermediate CA
issuer=CN=Lab Root CA
```

P7B 只帶憑證，其他什麼都沒有。如果你需要私鑰，它住在別的地方；沒有任何 `openssl pkcs7` 指令能把私鑰抽出來。

### 把 JKS 交給 keytool

JKS 不是 OpenSSL 的格式，所以轉換工具是 `keytool`：

```bash
# Inspect a keystore
keytool -list -v -keystore keystore.jks -storepass changeit

# PFX to JKS (legacy systems)
keytool -importkeystore \
  -srckeystore bundle.pfx -srcstoretype PKCS12 -srcstorepass demo \
  -destkeystore keystore.jks -deststoretype JKS -deststorepass changeit
```

在 Java 9 以後，去掉 `-deststoretype JKS` 就會得到現代預設的 PKCS#12。只有在應用程式真的讀不了 PKCS#12 時才保留它。

### 讓 Nginx 指向正確的兩個檔案

```nginx
server {
  listen 443 ssl;
  server_name example.test;

  ssl_certificate     /etc/ssl/example/fullchain.pem;
  ssl_certificate_key /etc/ssl/example/leaf.key;

  ssl_protocols TLSv1.2 TLSv1.3;
}
```

`ssl_certificate` 拿的是完整鏈，葉憑證在前。Nginx 不會幫你重排。`ssl_certificate_key` 拿的是私鑰。根憑證不用部署；對公有 CA 而言，用戶端本來就有，送它只是浪費位元組。若是私有 CA，請把根憑證安裝到每個用戶端的信任儲存區一次。

```bash
sudo nginx -t && sudo systemctl reload nginx
openssl s_client -connect example.test:443 -servername example.test -showcerts </dev/null
```

如果金鑰有加密，而 Nginx 在 systemd 下執行，開機時它無法提示輸入。要嘛讓金鑰不加密並設為 `0600` 權限，要嘛把 `ssl_password_file` 指向一個 root 可讀、內含密碼短語的檔案。

## 解釋多數中斷的六種失誤

1. **只有葉憑證。** 鏈不完整。把中繼憑證加進 `ssl_certificate`，再用 `openssl verify` 重測。
2. **順序錯誤。** `fullchain.pem` 裡中繼憑證排第一。`openssl x509 -in fullchain.pem -noout -subject` 印的是第一張憑證；它必須是葉憑證。
3. **金鑰不符。** 憑證與金鑰來自不同的金鑰對。比對公鑰雜湊，不要用猜的。
4. **中繼憑證過期。** 葉憑證有效，鏈卻無效。檢查檔案裡的每一張憑證，不是只看第一張。
5. **舊版 PFX 被拒。** 匯入時說「密碼錯誤」，但密碼明明正確。針對舊 Windows 或舊 Java，用 3DES 與 SHA-1 重新匯出。
6. **開機時金鑰有加密。** Nginx 互動執行時好好的，在 systemd 下就掛。用 `ssl_password_file`，或改用未加密的 `0600` 金鑰。

## 一頁速查表

```bash
# Inspect
openssl x509 -in cert.pem -noout -subject -issuer -dates
openssl x509 -in cert.pem -noout -text
openssl pkcs12 -in bundle.pfx -info -noout -passin pass:demo

# Verify
openssl verify -CAfile root.pem -untrusted int.pem leaf.pem
openssl s_client -connect host:443 -servername host -showcerts </dev/null

# Match
openssl x509 -in leaf.pem -noout -pubkey | openssl sha256
openssl pkey -in leaf.key -pubout | openssl sha256

# Expiry
openssl x509 -in leaf.pem -noout -checkend 2592000

# Convert
openssl x509 -in cert.pem -outform DER -out cert.der
openssl x509 -in cert.der -inform DER -out cert.pem
openssl pkcs12 -export -out bundle.pfx -inkey key.pem -in cert.pem -certfile chain.pem
openssl pkcs12 -in bundle.pfx -out bundle.pem -nodes
openssl crl2pkcs7 -nocrl -certfile fullchain.pem -out chain.p7b
keytool -importkeystore -srckeystore bundle.pfx -srcstoretype PKCS12 \
  -destkeystore keystore.jks -deststoretype JKS
```

底下貫穿全部的原則：讀內容，不要讀副檔名。一個含私鑰的 `.pem` 是機密；一個少了鏈的 `.pfx`，則是在等某個行動瀏覽器來引發故障。

如果這篇文章你只記一道指令，就記 `openssl verify -CAfile root.pem -untrusted int.pem leaf.pem`。它能抓到監控通常漏掉、而使用者通常會回報的那種故障。

## 參考資料

- [RFC 7468 — PKIX、PKCS 與 CMS 結構的文字編碼](https://www.rfc-editor.org/rfc/rfc7468)
- [RFC 7292 — PKCS #12：個人資訊交換語法](https://www.rfc-editor.org/rfc/rfc7292)
- [RFC 2315 — PKCS #7：密碼訊息語法](https://www.rfc-editor.org/rfc/rfc2315)
- [JEP 229 — 預設建立 PKCS12 金鑰庫](https://openjdk.org/jeps/229)
- [OpenSSL 3 文件](https://docs.openssl.org/3.5/)
