---
title: "证书文件全解析：PEM、DER、PFX 与 P7B"
description: "TLS 证书文件里到底装了什么、可筛选的格式矩阵，以及从检查到在 Linux 自签链的 OpenSSL 实战教程。"
pubDate: 2026-11-22
category: "Web"
tags: ["TLS", "OpenSSL", "证书", "Linux", "信息安全"]
featured: false
author: "Alex.Hsiao"
readTime: "15 分钟"
cardImage: "./cover.webp"
cardImageAlt: "证书文件可能承载的三种内容示意图：域名证书、中间链与私钥"
---

# 证书文件全解析：PEM、DER、PFX 与 P7B

证书文件不是一种格式。它是一个盒子，标签是别人贴的。

盒子里最多只有三种内容：**域名证书**（你的域名与公钥，由 CA 签发）、**中间证书链**（你的证书与受信任根证书之间的连接），以及**私钥**（公钥的另一半）。其余的一切——`.pem`、`.crt`、`.pfx`——描述的是这些内容如何编码、如何打包。

一旦看懂这三种内容，扩展名就不再是冷知识。你能预测一个文件能装什么、不能装什么，也能直接挑对 `openssl` 命令，不用再猜。

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
    <h3 class="crt-fig-title">TLS 文件可能携带的三种内容</h3>
    <p class="crt-fig-sub">容器会变，内容不会。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 260" role="img" aria-labelledby="crt-f1-title crt-f1-desc">
    <title id="crt-f1-title">证书文件结构</title>
    <desc id="crt-f1-desc">一个文件可以任意组合域名证书、中间证书链与私钥。</desc>
    <text x="24" y="22" class="f" font-size="8" letter-spacing="1.2">一个文件 // 三种可能内容</text>
    <rect x="24" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-file" x="40" y="58" width="20" height="20" class="ico"/>
    <text x="70" y="72" class="t" font-size="10.5" font-weight="700">域名证书</text>
    <line x1="40" y1="90" x2="244" y2="90" class="rule"/>
    <text x="40" y="110" class="m" font-size="9">你的域名与</text>
    <text x="40" y="124" class="m" font-size="9">公钥，由 CA 签发。</text>
    <text x="40" y="160" class="f" font-size="7.5" letter-spacing="0.9">发送给每位访客</text>
    <rect x="282" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-layers" x="298" y="58" width="20" height="20" class="ico"/>
    <text x="328" y="72" class="t" font-size="10.5" font-weight="700">中间证书链</text>
    <line x1="298" y1="90" x2="502" y2="90" class="rule"/>
    <text x="298" y="110" class="m" font-size="9">你的证书与</text>
    <text x="298" y="124" class="m" font-size="9">受信任根证书之间的连接。</text>
    <text x="298" y="160" class="f" font-size="7.5" letter-spacing="0.9">随叶证书发送</text>
    <rect x="540" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-key" x="556" y="58" width="20" height="20" class="ico"/>
    <text x="586" y="72" class="t" font-size="10.5" font-weight="700">私钥</text>
    <line x1="556" y1="90" x2="760" y2="90" class="rule"/>
    <text x="556" y="110" class="m" font-size="9">密钥对的另一半。</text>
    <text x="556" y="124" class="m" font-size="9">它永远不离开主机。</text>
    <text x="556" y="160" class="f" font-size="7.5" letter-spacing="0.9">绝不发送给任何人</text>
    <line x1="24" y1="216" x2="776" y2="216" class="rule"/>
    <text x="24" y="238" class="m" font-size="9">一个 <tspan class="mono" font-weight="700">.pem</tspan> 可以装任意组合；<tspan class="mono" font-weight="700">.crt</tspan> 装证书；<tspan class="mono" font-weight="700">.key</tspan> 装一把密钥；<tspan class="mono" font-weight="700">.pfx</tspan> 则三种全装。</text>
  </svg>
  </div>
  <div class="crt-fig-src">结构 · 三种内容 · 图标：LUCIDE VIA ICONIFY</div>
</figure>

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

## 三种内容，一个盒子

先从「里面可能有什么」说起。一个文件可能只装一种内容，也可能三种全装；光看扩展名不会知道。

实际结论很简单。文件里若有私钥，就得当成密码一样保护。若只有证书，它本来就是公开的，可以随意复制。扩展名不会告诉你属于哪一种；内容才会。

## 三秒测试：文本还是二进制

安装任何东西之前，先看第一行。PEM 是包在 ASCII 外框里的 Base64，所以任何编辑器都读得懂。DER 以及构建在它之上的容器则是二进制。

<figure class="crt-fig">
  <figcaption>
    <span class="card-tag">TRIAGE // 02</span>
    <h3 class="crt-fig-title">扩展名是习惯，字节才是证据</h3>
    <p class="crt-fig-sub">两边各下一条命令，就知道手上是哪一种。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 240" role="img" aria-labelledby="crt-f2-title crt-f2-desc">
    <title id="crt-f2-title">文本与二进制证书文件</title>
    <desc id="crt-f2-desc">以 BEGIN 开头的可读文本是 PEM。二进制字节代表 DER 或 PKCS#12。</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">转换之前，先打开看看</text>
    <rect x="24" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-file" x="40" y="52" width="16" height="16" class="ico"/>
    <text x="64" y="64" class="f" font-size="7.5" letter-spacing="1">可读文本</text>
    <text x="40" y="88" class="t" font-size="11" font-weight="700">PEM 与 PKCS#7</text>
    <rect x="40" y="102" width="324" height="44" class="codebox"/>
    <text x="52" y="119" class="f mono" font-size="7.5">$ head -1 leaf.pem</text>
    <text x="52" y="135" class="t mono" font-size="8.5">-----BEGIN CERTIFICATE-----</text>
    <text x="40" y="166" class="m" font-size="8.5">格式：.pem .crt .cer .key .p7b</text>
    <text x="40" y="182" class="m" font-size="8.5">用文本编辑器就能识别。</text>
    <line x1="400" y1="48" x2="400" y2="106" class="rule"/>
    <text x="400" y="126" class="f" font-size="8" text-anchor="middle" letter-spacing="1">或</text>
    <line x1="400" y1="140" x2="400" y2="196" class="rule"/>
    <rect x="420" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-binary" x="436" y="52" width="16" height="16" class="ico"/>
    <text x="460" y="64" class="f" font-size="7.5" letter-spacing="1">二进制</text>
    <text x="436" y="88" class="t" font-size="11" font-weight="700">DER 与 PKCS#12</text>
    <rect x="436" y="102" width="324" height="44" class="codebox"/>
    <text x="448" y="119" class="f mono" font-size="7.5">$ xxd -l 16 leaf.der</text>
    <text x="448" y="135" class="t mono" font-size="8">30 82 03 65 30 82 02 4d a0 03 02 01 02 02 14 46</text>
    <text x="436" y="166" class="m" font-size="8.5">格式：.der .cer .pfx .p12</text>
    <text x="436" y="182" class="m" font-size="8.5">用 openssl 或十六进制查看器。</text>
    <text x="24" y="228" class="m" font-size="8.5">一个 <tspan class="mono" font-weight="700">.cer</tspan> 可能是其中任一种，<tspan class="mono" font-weight="700">.p7b</tspan> 也是。扩展名不等于格式。</text>
  </svg>
  </div>
  <div class="crt-fig-src">初步判断 · 开头字节 · 取自下方实验的真实输出</div>
</figure>

`BEGIN` 这一行也顺便说明了内容是什么：

- `-----BEGIN CERTIFICATE-----` — 一张证书。可能是叶证书，也可能是中间证书。
- `-----BEGIN PRIVATE KEY-----` — 未加密的 PKCS#8 私钥。
- `-----BEGIN ENCRYPTED PRIVATE KEY-----` — 受口令保护的 PKCS#8 密钥。
- `-----BEGIN RSA PRIVATE KEY-----` — 旧式 PKCS#1 RSA 密钥。
- `-----BEGIN EC PRIVATE KEY-----` — SEC1 椭圆曲线密钥。
- `-----BEGIN PKCS7-----` — 证书的 P7B 打包。

如果开头字节是 `30 82`，那是 DER 里的 ASN.1 SEQUENCE。它可能是证书或 PKCS#12 文件；下一条命令会告诉你是哪一种。

## 格式矩阵

六个名字、三种内容、两种编码。筛选矩阵，回答你真正想问的问题。

<figure class="crt-matrix">
  <figcaption>
    <span class="card-tag">FORMAT MATRIX // 03</span>
    <h3 class="crt-fig-title">真正会变的只有两件事：编码与打包</h3>
    <p class="crt-fig-sub">容器可以装哪些内容。只有内含私钥时才需要密码。</p>
  </figcaption>
  <div class="crt-filters" role="group" aria-label="筛选证书格式矩阵">
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-all" checked><span>全部 6 种</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-key"><span>含私钥</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pub"><span>只有公开证书</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pass"><span>需要密码</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-bin"><span>二进制</span></label>
  </div>
  <div class="crt-table-wrap">
    <table class="crt-table">
      <caption class="crt-vh">按内容、编码、密码保护与常见平台比较证书文件格式</caption>
      <thead>
        <tr>
          <th scope="col">格式</th>
          <th scope="col" class="crt-c">域名证书</th>
          <th scope="col" class="crt-c">中间链</th>
          <th scope="col" class="crt-c">私钥</th>
          <th scope="col">编码</th>
          <th scope="col">密码</th>
          <th scope="col">常见环境</th>
        </tr>
      </thead>
      <tbody>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="格式"><b>.pem</b><span>文本容器</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="编码"><b>PEM</b><span>Base64 文本</span></td>
          <td data-label="密码"><span class="crt-pass">可选</span></td>
          <td data-label="常见环境"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="格式"><b>.crt / .cer</b><span>命名惯例</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--opt" aria-hidden="true"></span><span class="crt-vh">有时</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="编码"><b>PEM 或 DER</b><span>均可</span></td>
          <td data-label="密码"><span class="crt-pass">无</span></td>
          <td data-label="常见环境"><span class="crt-home">Apache · Windows</span></td>
        </tr>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="格式"><b>.key</b><span>仅私钥</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="编码"><b>PEM</b><span>Base64 文本</span></td>
          <td data-label="密码"><span class="crt-pass">可选</span></td>
          <td data-label="常见环境"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="binary">
          <td data-label="格式"><b>.der</b><span>编码，不是容器</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="编码"><b>DER</b><span>二进制</span></td>
          <td data-label="密码"><span class="crt-pass">无</span></td>
          <td data-label="常见环境"><span class="crt-home">Windows · Java</span></td>
        </tr>
        <tr data-key="yes" data-pass="required" data-enc="binary">
          <td data-label="格式"><b>.pfx / .p12</b><span>PKCS#12</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="编码"><b>PKCS#12</b><span>二进制</span></td>
          <td data-label="密码"><span class="crt-pass crt-pass--req">必须</span></td>
          <td data-label="常见环境"><span class="crt-home">IIS · Azure · macOS</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="格式"><b>.p7b</b><span>PKCS#7</span></td>
          <td data-label="域名证书" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="中间链" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">可包含</span></td>
          <td data-label="私钥" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">绝不</span></td>
          <td data-label="编码"><b>PKCS#7</b><span>文字或二进制</span></td>
          <td data-label="密码"><span class="crt-pass">无</span></td>
          <td data-label="常见环境"><span class="crt-home">Windows · Tomcat</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="crt-legend" aria-hidden="true">
    <span><span class="crt-dot crt-dot--on"></span>可包含</span>
    <span><span class="crt-dot crt-dot--opt"></span>有时</span>
    <span><span class="crt-dot crt-dot--off"></span>绝不</span>
  </div>
  <div class="crt-fig-src">格式矩阵 · 6 种容器 · 内容 / 编码 / 密码</div>
</figure>

筛选器纯 CSS。背后没有 JavaScript：几个 radio input 加 `:has()` 选择器就决定哪些行显示。这和文件本身的道理一样——结构承载行为。

### 逐个格式拆解

**`.pem`** 是通用语言。它是用 `BEGIN`/`END` 包起来的 Base64 编码 DER，所以能安然通过复制粘贴、电子邮件与配置文件。一个 `.pem` 可以装一张证书、一串链、一把私钥，或全部串在一起。Nginx 与 Apache 到处都接受它。

**`.crt` 与 `.cer`** 是命名惯例，不是格式。在 Linux 上，`.crt` 几乎都是 PEM，和 `.pem` 可以互换。在 Windows 上，`.cer` 通常是 DER。两者都不该含私钥；若真的含了，就当它已泄露。

**`.key`** 只装一把私钥。文件头会告诉你是哪种编码：PKCS#8（`BEGIN PRIVATE KEY`）、PKCS#1（`BEGIN RSA PRIVATE KEY`）或 SEC1（`BEGIN EC PRIVATE KEY`）。权限比扩展名重要：`chmod 600`，所有者设为 root。

**`.der`** 是一种编码，不是容器。它的 ASN.1 结构和 PEM 相同，只是少了 Base64 外框，所以小约 25%，而且文本编辑器读不懂。它通常只装一张证书。

**`.pfx` 与 `.p12`** 是同一件事：PKCS#12，一个由密码保护、装着证书与私钥的二进制归档文件。Windows IIS、Azure 与 macOS Keychain 要的就是这个。没有密码的 PFX 不叫 PFX；密码是格式的一部分。

**`.p7b`** 是 PKCS#7。它打包证书——叶证书加中间证书，有时也含根证书——但永远装不了私钥。它的存在是为了在系统之间搬运证书链，在 Windows 与较旧的 Tomcat 部署很常见。

## 在 Linux 上建一条链

下面的命令会创建根证书 CA、中间 CA 与服务器证书。形状和公开 CA 用的一样，只是名字换成你自己的。在空目录里运行；一切都在本机，而且都是自签。

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
    <h3 class="crt-fig-title">实验刚建好的东西，以及哪个文件是哪个</h3>
    <p class="crt-fig-sub">叶证书是公开的。中间证书是公开的。两把密钥不是。</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 320" role="img" aria-labelledby="crt-f3-title crt-f3-desc">
    <title id="crt-f3-title">在 Linux 上创建的自签链</title>
    <desc id="crt-f3-desc">root.pem 签发 int.pem；int.pem 签发 leaf.pem。leaf.key 对应 leaf.pem。fullchain.pem 按顺序包含 leaf.pem 与 int.pem。</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">在 LINUX 自签 // 文件对照</text>
    <rect x="24" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-shield" x="38" y="52" width="18" height="18" class="ico"/>
    <text x="64" y="64" class="t mono" font-size="10" font-weight="700">root.pem</text>
    <text x="64" y="78" class="f" font-size="7" letter-spacing="0.8">根证书 CA · 自签</text>
    <line x1="38" y1="88" x2="226" y2="88" class="rule"/>
    <text x="38" y="106" class="m" font-size="8.5">本实验创建，信任锚点。</text>
    <rect x="292" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-server" x="306" y="52" width="18" height="18" class="ico"/>
    <text x="332" y="64" class="t mono" font-size="10" font-weight="700">int.pem</text>
    <text x="332" y="78" class="f" font-size="7" letter-spacing="0.8">中间证书 CA</text>
    <line x1="306" y1="88" x2="494" y2="88" class="rule"/>
    <text x="306" y="106" class="m" font-size="8.5">由 root.key 签发。</text>
    <rect x="560" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-globe" x="574" y="52" width="18" height="18" class="ico"/>
    <text x="600" y="64" class="t mono" font-size="10" font-weight="700">leaf.pem</text>
    <text x="600" y="78" class="f" font-size="7" letter-spacing="0.8">域名证书</text>
    <line x1="574" y1="88" x2="762" y2="88" class="rule"/>
    <text x="574" y="106" class="m" font-size="8.5">CN=example.test · 由 int.key 签发</text>
    <line x1="240" y1="81" x2="284" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="262" y="72" class="f mono" font-size="7" text-anchor="middle">签发</text>
    <line x1="508" y1="81" x2="552" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="530" y="72" class="f mono" font-size="7" text-anchor="middle">签发</text>
    <rect x="24" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-lock" x="38" y="186" width="16" height="16" class="ico muted"/>
    <text x="62" y="198" class="t mono" font-size="9.5" font-weight="700">root.key</text>
    <text x="38" y="218" class="m" font-size="8">根证书的私钥。</text>
    <text x="38" y="234" class="f" font-size="7" letter-spacing="0.7">离线保管 · 0600</text>
    <rect x="292" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-layers" x="306" y="186" width="16" height="16" class="ico"/>
    <text x="330" y="198" class="t mono" font-size="9.5" font-weight="700">fullchain.pem</text>
    <text x="306" y="218" class="m" font-size="8">leaf.pem + int.pem，叶证书在前。</text>
    <text x="306" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate</text>
    <rect x="560" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-key" x="574" y="186" width="16" height="16" class="ico"/>
    <text x="598" y="198" class="t mono" font-size="9.5" font-weight="700">leaf.key</text>
    <text x="574" y="218" class="m" font-size="8">服务器私钥。</text>
    <text x="574" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate_key</text>
    <line x1="132" y1="124" x2="132" y2="164" class="dash"/>
    <text x="140" y="148" class="f mono" font-size="7">同一密钥对</text>
    <line x1="668" y1="124" x2="668" y2="164" class="dash"/>
    <text x="676" y="148" class="f mono" font-size="7">同一密钥对</text>
    <line x1="24" y1="272" x2="776" y2="272" class="rule"/>
    <text x="24" y="292" class="m" font-size="8.5">服务器发送 <tspan class="mono" font-weight="700">leaf.pem</tspan> 与 <tspan class="mono" font-weight="700">int.pem</tspan>；浏览器早已持有它信任的根证书。</text>
    <text x="24" y="308" class="f mono" font-size="7.5">cat leaf.pem int.pem &gt; fullchain.pem   # 顺序很重要</text>
    <defs>
      <marker id="crt-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="var(--mono-ink)"/></marker>
    </defs>
  </svg>
  </div>
  <div class="crt-fig-src">LINUX 实验 · 根 → 中间 → 叶 · 私钥不外流</div>
</figure>

两个细节很容易漏掉。第一，`-nodes` 的意思是「不用 DES」：它写出的私钥没有口令。这在实验室很方便，在生产环境很危险。第二，叶证书是用 `-CAkey int.key` 签的，不是 `root.key`。跳过中间证书，就会得到一张无法链回你刚创建之根证书的证书。

## OpenSSL 实战指南

本文接下来假设上面的实验文件都在当前目录。除非特别注明，每条命令都只读不写。

### 信任之前，先读文件

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

`subject` 是这张证书给谁用的；`issuer` 是谁签的。如果两者相同，这张证书就是自签。`X509v3 Subject Alternative Name` 区块才是浏览器真正检查的列表；旧的 `CN` 字段在主机名匹配时已被忽略。

PFX 的等效第一眼是：

```bash
openssl pkcs12 -in bundle.pfx -info -noout -passin pass:demo
```

它会打印 MAC 算法，以及证书 bag 与密钥 bag 所用的加密方式。如果命令什么都没打印就失败，说明密码错了，或这个文件不是 PKCS#12。

### 用浏览器的方式验证链

`openssl verify` 把受信任的根证书与不受信任的中间证书分开给：

```bash
openssl verify -CAfile root.pem -untrusted int.pem leaf.pem
```

```text
leaf.pem: OK
```

去掉 `-untrusted int.pem`，同样的命令就会失败：

```text
CN=example.test
error 20 at 0 depth lookup: unable to get local issuer certificate
error leaf.pem: verification failed
```

这个错误是 TLS 中断最常见的单一原因。叶证书本身有效，但服务器没有发送那张把它接到受信任根证书的中间证书。Windows 的证书链引擎有时会通过 CA 的 AIA URL 抓取缺失的证书来掩盖问题；Chrome、Firefox 与多数移动客户端不会。

要测试线上服务器实际发送了什么，用 SNI 加 here-string，让命令自己结束：

```bash
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts </dev/null
```

数一数输出里有几张证书。一张代表只有叶证书；两张以上代表有链。加上 `-CAfile root.pem -verify_return_error`，验证失败就会产生非零退出码——没有这个标志时，`s_client` 即使打印 `Verify return code: 20` 也会以 `0` 退出。

用一行总结一个线上端点：

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

### 证明密钥与证书匹配

证书里有公钥。`.key` 文件里有私钥那一半。两者的公钥相同就代表匹配，而最安全的比法对 RSA 与 EC 一样适用：

```bash
openssl x509 -in leaf.pem -noout -pubkey | openssl sha256
openssl pkey -in leaf.key -pubout | openssl sha256
```

```text
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
```

如果哈希不同，Nginx 会以 `SSL_CTX_use_PrivateKey` 或「key values mismatch」拒绝启动。别想靠编辑任何一个文件来修；重新签发或重新导出这对密钥。

### 在报警响起之前先检查到期

```bash
openssl x509 -in leaf.pem -noout -enddate
openssl x509 -in leaf.pem -noout -checkend 2592000
```

```text
notAfter=Dec 24 05:24:30 2027 GMT
Certificate will not expire
```

`-checkend` 接收秒数；证书在那段时间内仍有效就返回退出码 `0`，若会在窗口内过期则返回 `1`。三十天是 `2592000`。把它放进 cron job，并在退出码非零时告警。

这只检查一张证书。如果你跑的是链，中间证书也要检查；过期的中间证书和过期的叶证书一样，会彻底弄断握手。

### 在 PEM 与 DER 之间转换

```bash
# PEM to DER
openssl x509 -in leaf.pem -outform DER -out leaf.der

# DER to PEM
openssl x509 -in leaf.der -inform DER -out leaf-from-der.pem
```

`openssl x509` 在近期版本对输入很宽容，但 `-inform` 能消除歧义。如果你不确定手上是哪一种，`file leaf.cer` 会回答：

```text
leaf.pem: PEM certificate
leaf.der: Certificate, Version=3
```

### 打包与解包 PKCS#12

要从 PEM 密钥、叶证书与中间证书创建 PFX：

```bash
openssl pkcs12 -export -out bundle.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -passout pass:demo
```

`-certfile` 就是让中间证书进到归档文件里的关键。少了它，你会得到一个导入时一切正常、到了浏览器却失败的 PFX。要读回来：

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

`-nodes` 再次代表「不要加密输出的密钥」。若你想让 OpenSSL 提示输入新的口令，就去掉它。

OpenSSL 3 默认用 PBES2、PBKDF2、AES-256-CBC 与 SHA-256 MAC 写出 PFX。旧的 Windows Server 版本与旧 JVM 可能拒绝这种组合，并给出误导人的「密码错误」。如果必须支持它们，就明确指定算法：

```bash
openssl pkcs12 -export -out bundle-legacy.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -certpbe PBE-SHA1-3DES -keypbe PBE-SHA1-3DES -macalg sha1 \
  -passout pass:demo
```

`-legacy` 也能用，但它会为证书 bag 产生 RC2-40，强度较弱，而且在 OpenSSL 3 上还得再加 `-legacy` 才读得回来。明确指定 3DES 的写法更可移植。

### 读取 P7B 打包

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

P7B 只带证书，别的什么都没有。如果你需要私钥，它住在别的地方；没有任何 `openssl pkcs7` 命令能把私钥抽出来。

### 让 Nginx 指向正确的两个文件

```nginx
server {
  listen 443 ssl;
  server_name example.test;

  ssl_certificate     /etc/ssl/example/fullchain.pem;
  ssl_certificate_key /etc/ssl/example/leaf.key;

  ssl_protocols TLSv1.2 TLSv1.3;
}
```

`ssl_certificate` 拿的是完整链，叶证书在前。Nginx 不会帮你重排。`ssl_certificate_key` 拿的是私钥。根证书不用部署；对公有 CA 来说，客户端本来就有，发送它只是浪费字节。若是私有 CA，请把根证书安装到每个客户端的信任存储区一次。

```bash
sudo nginx -t && sudo systemctl reload nginx
openssl s_client -connect example.test:443 -servername example.test -showcerts </dev/null
```

如果密钥有加密，而 Nginx 在 systemd 下运行，启动时它无法提示输入。要么让密钥不加密并设为 `0600` 权限，要么把 `ssl_password_file` 指向一个 root 可读、内含口令的文件。

## 解释多数中断的六种失误

1. **只有叶证书。** 链不完整。把中间证书加进 `ssl_certificate`，再用 `openssl verify` 重测。
2. **顺序错误。** `fullchain.pem` 里中间证书排第一。`openssl x509 -in fullchain.pem -noout -subject` 打印的是第一张证书；它必须是叶证书。
3. **密钥不匹配。** 证书与密钥来自不同的密钥对。比对公钥哈希，不要用猜的。
4. **中间证书过期。** 叶证书有效，链却无效。检查文件里的每一张证书，不是只看第一张。
5. **旧版 PFX 被拒。** 导入时说「密码错误」，但密码明明正确。针对旧 Windows 或旧 Java，用 3DES 与 SHA-1 重新导出。
6. **启动时密钥有加密。** Nginx 交互运行时好好的，在 systemd 下就挂。用 `ssl_password_file`，或改用未加密的 `0600` 密钥。

## 一页速查表

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
```

底下贯穿全部的原则：读内容，不要读扩展名。一个含私钥的 `.pem` 是机密；一个少了链的 `.pfx`，就是在等某个移动浏览器来引发故障。

如果这篇文章你只记一条命令，就记 `openssl verify -CAfile root.pem -untrusted int.pem leaf.pem`。它能抓到监控通常漏掉、而用户通常会报告的那种故障。

## 参考资料

- [RFC 7468 — PKIX、PKCS 与 CMS 结构的文本编码](https://www.rfc-editor.org/rfc/rfc7468)
- [RFC 7292 — PKCS #12：个人信息交换语法](https://www.rfc-editor.org/rfc/rfc7292)
- [RFC 2315 — PKCS #7：密码消息语法](https://www.rfc-editor.org/rfc/rfc2315)
- [OpenSSL 3 文档](https://docs.openssl.org/3.5/)
