---
title: "Certificate Files, Decoded: PEM, DER, PFX, and P7B"
description: "What is really inside a TLS certificate file, a filterable format matrix, and a hands-on OpenSSL tutorial that builds and verifies a self-signed chain on Linux."
pubDate: 2026-11-22
category: "Web"
tags: ["TLS", "OpenSSL", "Certificates", "Linux", "Security"]
featured: false
author: "Alex.Hsiao"
readTime: "15 min read"
cardImage: "./cover.webp"
cardImageAlt: "Diagram of the three payloads a certificate file can carry: domain certificate, intermediate chain, and private key"
---

# Certificate Files, Decoded: PEM, DER, PFX, and P7B

A certificate file is not a format. It is a box with a label someone chose.

Inside the box there are at most three payloads: the **domain certificate** (your name and public key, signed by a CA), the **intermediate chain** (the links between your certificate and a trusted root), and the **private key** (the other half of the public key). Everything else — `.pem`, `.crt`, `.pfx` — describes how those payloads are encoded and packed.

Once you see the three payloads, the extensions stop being trivia. You can predict what a file can and cannot contain, and you can pick the right `openssl` command instead of guessing.

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
    <h3 class="crt-fig-title">The three payloads a TLS file can carry</h3>
    <p class="crt-fig-sub">The container changes. The payloads do not.</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 260" role="img" aria-labelledby="crt-f1-title crt-f1-desc">
    <title id="crt-f1-title">Certificate file anatomy</title>
    <desc id="crt-f1-desc">A file can contain a domain certificate, an intermediate certificate chain, and a private key in any combination.</desc>
    <text x="24" y="22" class="f" font-size="8" letter-spacing="1.2">ONE FILE // THREE POSSIBLE PAYLOADS</text>
    <rect x="24" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-file" x="40" y="58" width="20" height="20" class="ico"/>
    <text x="70" y="72" class="t" font-size="10.5" font-weight="700">DOMAIN CERTIFICATE</text>
    <line x1="40" y1="90" x2="244" y2="90" class="rule"/>
    <text x="40" y="110" class="m" font-size="9">Your domain name and</text>
    <text x="40" y="124" class="m" font-size="9">public key, signed by a CA.</text>
    <text x="40" y="160" class="f" font-size="7.5" letter-spacing="0.9">SENT TO EVERY VISITOR</text>
    <rect x="282" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-layers" x="298" y="58" width="20" height="20" class="ico"/>
    <text x="328" y="72" class="t" font-size="10.5" font-weight="700">INTERMEDIATE CHAIN</text>
    <line x1="298" y1="90" x2="502" y2="90" class="rule"/>
    <text x="298" y="110" class="m" font-size="9">The links between your</text>
    <text x="298" y="124" class="m" font-size="9">certificate and a trusted root.</text>
    <text x="298" y="160" class="f" font-size="7.5" letter-spacing="0.9">SENT WITH THE LEAF</text>
    <rect x="540" y="42" width="236" height="150" class="box"/>
    <use href="#crt-i-key" x="556" y="58" width="20" height="20" class="ico"/>
    <text x="586" y="72" class="t" font-size="10.5" font-weight="700">PRIVATE KEY</text>
    <line x1="556" y1="90" x2="760" y2="90" class="rule"/>
    <text x="556" y="110" class="m" font-size="9">The other half of the key</text>
    <text x="556" y="124" class="m" font-size="9">pair. It never leaves the host.</text>
    <text x="556" y="160" class="f" font-size="7.5" letter-spacing="0.9">NEVER SENT TO ANYONE</text>
    <line x1="24" y1="216" x2="776" y2="216" class="rule"/>
    <text x="24" y="238" class="m" font-size="9">A <tspan class="mono" font-weight="700">.pem</tspan> can hold any combination. A <tspan class="mono" font-weight="700">.crt</tspan> holds certificates. A <tspan class="mono" font-weight="700">.key</tspan> holds one key. A <tspan class="mono" font-weight="700">.pfx</tspan> holds all three.</text>
  </svg>
  </div>
  <div class="crt-fig-src">ANATOMY · THREE PAYLOADS · ICONS: LUCIDE VIA ICONIFY</div>
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

## Three payloads, one box

Start with what can be inside. A single file may carry one payload or all three; the extension alone will not tell you.

The practical consequence is simple. If a file contains a private key, it must be protected like a password. If it contains only certificates, it is public by design and can be copied freely. The extension does not tell you which case you are in; the contents do.

## The three-second test: text or binary

Before installing anything, look at the first line. PEM is Base64 wrapped in ASCII armor, so it is readable in any editor. DER and the containers built on it are binary.

<figure class="crt-fig">
  <figcaption>
    <span class="card-tag">TRIAGE // 02</span>
    <h3 class="crt-fig-title">The extension is a habit; the bytes are evidence</h3>
    <p class="crt-fig-sub">One command on each side tells you which family you are holding.</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 240" role="img" aria-labelledby="crt-f2-title crt-f2-desc">
    <title id="crt-f2-title">Text versus binary certificate files</title>
    <desc id="crt-f2-desc">Readable text starting with BEGIN is PEM. Binary bytes mean DER or PKCS#12.</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">OPEN IT BEFORE YOU CONVERT IT</text>
    <rect x="24" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-file" x="40" y="52" width="16" height="16" class="ico"/>
    <text x="64" y="64" class="f" font-size="7.5" letter-spacing="1">READABLE TEXT</text>
    <text x="40" y="88" class="t" font-size="11" font-weight="700">PEM and PKCS#7</text>
    <rect x="40" y="102" width="324" height="44" class="codebox"/>
    <text x="52" y="119" class="f mono" font-size="7.5">$ head -1 leaf.pem</text>
    <text x="52" y="135" class="t mono" font-size="8.5">-----BEGIN CERTIFICATE-----</text>
    <text x="40" y="166" class="m" font-size="8.5">Formats: .pem .crt .cer .key .p7b</text>
    <text x="40" y="182" class="m" font-size="8.5">A text editor is enough to identify it.</text>
    <line x1="400" y1="48" x2="400" y2="106" class="rule"/>
    <text x="400" y="126" class="f" font-size="8" text-anchor="middle" letter-spacing="1">OR</text>
    <line x1="400" y1="140" x2="400" y2="196" class="rule"/>
    <rect x="420" y="36" width="356" height="168" class="box"/>
    <use href="#crt-i-binary" x="436" y="52" width="16" height="16" class="ico"/>
    <text x="460" y="64" class="f" font-size="7.5" letter-spacing="1">BINARY</text>
    <text x="436" y="88" class="t" font-size="11" font-weight="700">DER and PKCS#12</text>
    <rect x="436" y="102" width="324" height="44" class="codebox"/>
    <text x="448" y="119" class="f mono" font-size="7.5">$ xxd -l 16 leaf.der</text>
    <text x="448" y="135" class="t mono" font-size="8">30 82 03 65 30 82 02 4d a0 03 02 01 02 02 14 46</text>
    <text x="436" y="166" class="m" font-size="8.5">Formats: .der .cer .pfx .p12</text>
    <text x="436" y="182" class="m" font-size="8.5">Use openssl or a hex viewer.</text>
    <text x="24" y="228" class="m" font-size="8.5">A <tspan class="mono" font-weight="700">.cer</tspan> can be either one. So can a <tspan class="mono" font-weight="700">.p7b</tspan>. The extension is not the format.</text>
  </svg>
  </div>
  <div class="crt-fig-src">TRIAGE · FIRST BYTES · REAL OUTPUT FROM THE LAB BELOW</div>
</figure>

The `BEGIN` line also names the payload:

- `-----BEGIN CERTIFICATE-----` — a certificate. It may be the leaf or an intermediate.
- `-----BEGIN PRIVATE KEY-----` — an unencrypted PKCS#8 private key.
- `-----BEGIN ENCRYPTED PRIVATE KEY-----` — a PKCS#8 key protected by a passphrase.
- `-----BEGIN RSA PRIVATE KEY-----` — a legacy PKCS#1 RSA key.
- `-----BEGIN EC PRIVATE KEY-----` — a SEC1 elliptic-curve key.
- `-----BEGIN PKCS7-----` — a P7B bundle of certificates.

If the first bytes are `30 82`, that is an ASN.1 SEQUENCE in DER. It could be a certificate or a PKCS#12 file; the next command tells you which.

## The format matrix

Six names, three payloads, two encodings. Filter the matrix to answer the question you actually have.

<figure class="crt-matrix">
  <figcaption>
    <span class="card-tag">FORMAT MATRIX // 03</span>
    <h3 class="crt-fig-title">Only two things really change: encoding and packaging</h3>
    <p class="crt-fig-sub">Payloads a container can hold. A password is required only when a private key is inside.</p>
  </figcaption>
  <div class="crt-filters" role="group" aria-label="Filter the certificate format matrix">
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-all" checked><span>All 6</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-key"><span>Contains a key</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pub"><span>Public only</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-pass"><span>Needs password</span></label>
    <label class="crt-chip"><input type="radio" name="crt-filter" id="crt-f-bin"><span>Binary</span></label>
  </div>
  <div class="crt-table-wrap">
    <table class="crt-table">
      <caption class="crt-vh">Comparison of certificate file formats by payload, encoding, password protection, and typical platform</caption>
      <thead>
        <tr>
          <th scope="col">Format</th>
          <th scope="col" class="crt-c">Cert</th>
          <th scope="col" class="crt-c">Chain</th>
          <th scope="col" class="crt-c">Key</th>
          <th scope="col">Encoding</th>
          <th scope="col">Password</th>
          <th scope="col">Typical home</th>
        </tr>
      </thead>
      <tbody>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="Format"><b>.pem</b><span>text container</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Encoding"><b>PEM</b><span>Base64 text</span></td>
          <td data-label="Password"><span class="crt-pass">optional</span></td>
          <td data-label="Typical home"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="Format"><b>.crt / .cer</b><span>naming convention</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--opt" aria-hidden="true"></span><span class="crt-vh">Sometimes</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Encoding"><b>PEM or DER</b><span>either</span></td>
          <td data-label="Password"><span class="crt-pass">none</span></td>
          <td data-label="Typical home"><span class="crt-home">Apache · Windows</span></td>
        </tr>
        <tr data-key="yes" data-pass="optional" data-enc="text">
          <td data-label="Format"><b>.key</b><span>private key only</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Encoding"><b>PEM</b><span>Base64 text</span></td>
          <td data-label="Password"><span class="crt-pass">optional</span></td>
          <td data-label="Typical home"><span class="crt-home">Nginx · Apache</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="binary">
          <td data-label="Format"><b>.der</b><span>encoding, not a container</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Encoding"><b>DER</b><span>binary</span></td>
          <td data-label="Password"><span class="crt-pass">none</span></td>
          <td data-label="Typical home"><span class="crt-home">Windows · Java</span></td>
        </tr>
        <tr data-key="yes" data-pass="required" data-enc="binary">
          <td data-label="Format"><b>.pfx / .p12</b><span>PKCS#12</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Encoding"><b>PKCS#12</b><span>binary</span></td>
          <td data-label="Password"><span class="crt-pass crt-pass--req">required</span></td>
          <td data-label="Typical home"><span class="crt-home">IIS · Azure · macOS</span></td>
        </tr>
        <tr data-key="no" data-pass="none" data-enc="text">
          <td data-label="Format"><b>.p7b</b><span>PKCS#7</span></td>
          <td data-label="Cert" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Chain" class="crt-c"><span class="crt-dot crt-dot--on" aria-hidden="true"></span><span class="crt-vh">Can include</span></td>
          <td data-label="Key" class="crt-c"><span class="crt-dot crt-dot--off" aria-hidden="true"></span><span class="crt-vh">Never</span></td>
          <td data-label="Encoding"><b>PKCS#7</b><span>text or binary</span></td>
          <td data-label="Password"><span class="crt-pass">none</span></td>
          <td data-label="Typical home"><span class="crt-home">Windows · Tomcat</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="crt-legend" aria-hidden="true">
    <span><span class="crt-dot crt-dot--on"></span>can include</span>
    <span><span class="crt-dot crt-dot--opt"></span>sometimes</span>
    <span><span class="crt-dot crt-dot--off"></span>never</span>
  </div>
  <div class="crt-fig-src">FORMAT MATRIX · 6 CONTAINERS · PAYLOAD / ENCODING / PASSWORD</div>
</figure>

The filters are CSS-only. There is no JavaScript behind them: a few radio inputs and `:has()` selectors decide which rows render. That is the same principle as the files themselves — the structure carries the behavior.

### Format by format

**`.pem`** is the lingua franca. It is Base64-encoded DER wrapped in `BEGIN`/`END` lines, so it survives copy-paste, email, and config files. One `.pem` can hold a certificate, a chain, a private key, or all of them concatenated. Nginx and Apache accept it everywhere.

**`.crt` and `.cer`** are naming conventions, not formats. On Linux, a `.crt` is almost always PEM and interchangeable with `.pem`. On Windows, a `.cer` is often DER. Neither should contain a private key; if one does, treat it as compromised.

**`.key`** contains exactly one private key. The header tells you which encoding: PKCS#8 (`BEGIN PRIVATE KEY`), PKCS#1 (`BEGIN RSA PRIVATE KEY`), or SEC1 (`BEGIN EC PRIVATE KEY`). Permissions matter more than the extension: `chmod 600` and root ownership.

**`.der`** is an encoding, not a container. It is the same ASN.1 structure as PEM without the Base64 armor, which makes it about 25% smaller and unreadable in a text editor. It usually holds a single certificate.

**`.pfx` and `.p12`** are the same thing: PKCS#12, a binary archive of certificates and a private key, protected by a password. This is what Windows IIS, Azure, and macOS Keychain expect. A PFX without a password is not a PFX; the password is part of the format.

**`.p7b`** is PKCS#7. It bundles certificates — leaf plus intermediates, and sometimes the root — but it can never hold a private key. It exists to move a chain between systems, and it is common on Windows and older Tomcat deployments.

## Build a chain on Linux

The commands below create a root CA, an intermediate CA, and a server certificate. It is the same shape a public CA uses, just with your own names. Run it in an empty directory; everything is local and self-signed.

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
    <h3 class="crt-fig-title">What the lab just built, and which file is which</h3>
    <p class="crt-fig-sub">The leaf is public. The intermediate is public. The two keys are not.</p>
  </figcaption>
  <div class="crt-scroll">
  <svg class="crt-svg" viewBox="0 0 800 320" role="img" aria-labelledby="crt-f3-title crt-f3-desc">
    <title id="crt-f3-title">A self-signed chain built on Linux</title>
    <desc id="crt-f3-desc">root.pem signs int.pem; int.pem signs leaf.pem. leaf.key matches leaf.pem. fullchain.pem contains leaf.pem and int.pem in that order.</desc>
    <text x="24" y="20" class="f" font-size="8" letter-spacing="1.2">SELF-SIGNED ON LINUX // FILE MAP</text>
    <rect x="24" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-shield" x="38" y="52" width="18" height="18" class="ico"/>
    <text x="64" y="64" class="t mono" font-size="10" font-weight="700">root.pem</text>
    <text x="64" y="78" class="f" font-size="7" letter-spacing="0.8">ROOT CA · SELF-SIGNED</text>
    <line x1="38" y1="88" x2="226" y2="88" class="rule"/>
    <text x="38" y="106" class="m" font-size="8.5">Created in this lab. The anchor.</text>
    <rect x="292" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-server" x="306" y="52" width="18" height="18" class="ico"/>
    <text x="332" y="64" class="t mono" font-size="10" font-weight="700">int.pem</text>
    <text x="332" y="78" class="f" font-size="7" letter-spacing="0.8">INTERMEDIATE CA</text>
    <line x1="306" y1="88" x2="494" y2="88" class="rule"/>
    <text x="306" y="106" class="m" font-size="8.5">Signed by root.key.</text>
    <rect x="560" y="38" width="216" height="86" class="box"/>
    <use href="#crt-i-globe" x="574" y="52" width="18" height="18" class="ico"/>
    <text x="600" y="64" class="t mono" font-size="10" font-weight="700">leaf.pem</text>
    <text x="600" y="78" class="f" font-size="7" letter-spacing="0.8">DOMAIN CERTIFICATE</text>
    <line x1="574" y1="88" x2="762" y2="88" class="rule"/>
    <text x="574" y="106" class="m" font-size="8.5">CN=example.test · signed by int.key.</text>
    <line x1="240" y1="81" x2="284" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="262" y="72" class="f mono" font-size="7" text-anchor="middle">signs</text>
    <line x1="508" y1="81" x2="552" y2="81" class="arrow" marker-end="url(#crt-arrow)"/>
    <text x="530" y="72" class="f mono" font-size="7" text-anchor="middle">signs</text>
    <rect x="24" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-lock" x="38" y="186" width="16" height="16" class="ico muted"/>
    <text x="62" y="198" class="t mono" font-size="9.5" font-weight="700">root.key</text>
    <text x="38" y="218" class="m" font-size="8">The root private key.</text>
    <text x="38" y="234" class="f" font-size="7" letter-spacing="0.7">KEEP OFFLINE · 0600</text>
    <rect x="292" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-layers" x="306" y="186" width="16" height="16" class="ico"/>
    <text x="330" y="198" class="t mono" font-size="9.5" font-weight="700">fullchain.pem</text>
    <text x="306" y="218" class="m" font-size="8">leaf.pem + int.pem, leaf first.</text>
    <text x="306" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate</text>
    <rect x="560" y="172" width="216" height="76" class="box"/>
    <use href="#crt-i-key" x="574" y="186" width="16" height="16" class="ico"/>
    <text x="598" y="198" class="t mono" font-size="9.5" font-weight="700">leaf.key</text>
    <text x="574" y="218" class="m" font-size="8">The server private key.</text>
    <text x="574" y="234" class="f" font-size="7" letter-spacing="0.7">→ ssl_certificate_key</text>
    <line x1="132" y1="124" x2="132" y2="164" class="dash"/>
    <text x="140" y="148" class="f mono" font-size="7">same key pair</text>
    <line x1="668" y1="124" x2="668" y2="164" class="dash"/>
    <text x="676" y="148" class="f mono" font-size="7">same key pair</text>
    <line x1="24" y1="272" x2="776" y2="272" class="rule"/>
    <text x="24" y="292" class="m" font-size="8.5">The server sends <tspan class="mono" font-weight="700">leaf.pem</tspan> and <tspan class="mono" font-weight="700">int.pem</tspan>. The browser already holds a root it trusts.</text>
    <text x="24" y="308" class="f mono" font-size="7.5">cat leaf.pem int.pem &gt; fullchain.pem   # order matters</text>
    <defs>
      <marker id="crt-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="var(--mono-ink)"/></marker>
    </defs>
  </svg>
  </div>
  <div class="crt-fig-src">LINUX LAB · ROOT → INTERMEDIATE → LEAF · PRIVATE KEYS STAY LOCAL</div>
</figure>

Two details are easy to miss. First, `-nodes` means "no DES": it writes the private key without a passphrase. That is convenient in a lab and risky in production. Second, the leaf is signed with `-CAkey int.key`, not `root.key`. Skipping the intermediate would produce a certificate that cannot chain back to the root you just created.

## The OpenSSL field guide

The rest of the article assumes the lab files above exist in the current directory. Every command is read-only unless it says otherwise.

### Read a file before you trust it

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

`subject` is who the certificate is for; `issuer` is who signed it. If those two are identical, the certificate is self-signed. The `X509v3 Subject Alternative Name` block is the list browsers actually check; the old `CN` field is ignored for hostname matching.

For a PFX, the equivalent first look is:

```bash
openssl pkcs12 -in bundle.pfx -info -noout -passin pass:demo
```

It prints the MAC algorithm and the encryption used for the certificate bags and the key bag. If that command fails before printing anything, the password is wrong or the file is not PKCS#12.

### Verify the chain the way a browser does

`openssl verify` takes the trusted root separately from the untrusted intermediates:

```bash
openssl verify -CAfile root.pem -untrusted int.pem leaf.pem
```

```text
leaf.pem: OK
```

Remove `-untrusted int.pem` and the same command fails:

```text
CN=example.test
error 20 at 0 depth lookup: unable to get local issuer certificate
error leaf.pem: verification failed
```

That error is the single most common TLS outage. The leaf is valid, but the server is not sending the intermediate that connects it to a trusted root. Windows' certificate chain engine sometimes papers over it by fetching the missing certificate from the CA's AIA URL; Chrome, Firefox, and most mobile clients do not.

To test what a live server actually sends, use SNI and a here-string so the command exits:

```bash
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts </dev/null
```

Count the certificates in the output. One means leaf only; two or more means a chain. Add `-CAfile root.pem -verify_return_error` to make a verification failure produce a non-zero exit code — without that flag, `s_client` exits `0` even when it prints `Verify return code: 20`.

To summarize a live endpoint in one line:

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

### Prove the key matches the certificate

A certificate contains a public key. The `.key` file contains the private half. They match if their public keys are identical, and the safest comparison works for RSA and EC alike:

```bash
openssl x509 -in leaf.pem -noout -pubkey | openssl sha256
openssl pkey -in leaf.key -pubout | openssl sha256
```

```text
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
SHA2-256(stdin)= 83ec726fcccbe9dce2773e6eced144035f7ba91d60b808006785b7f4f2092b27
```

If the hashes differ, Nginx will refuse to start with `SSL_CTX_use_PrivateKey` or "key values mismatch". Do not try to fix it by editing either file; reissue or re-export the pair.

### Check expiry before it pages you

```bash
openssl x509 -in leaf.pem -noout -enddate
openssl x509 -in leaf.pem -noout -checkend 2592000
```

```text
notAfter=Dec 24 05:24:30 2027 GMT
Certificate will not expire
```

`-checkend` takes seconds and returns exit code `0` if the certificate is still valid for that long, `1` if it will expire inside the window. Thirty days is `2592000`. Put it in a cron job and alert on a non-zero exit.

This checks one certificate. If you run a chain, check the intermediate too; an expired intermediate breaks the handshake just as thoroughly as an expired leaf.

### Convert between PEM and DER

```bash
# PEM to DER
openssl x509 -in leaf.pem -outform DER -out leaf.der

# DER to PEM
openssl x509 -in leaf.der -inform DER -out leaf-from-der.pem
```

`openssl x509` is forgiving about input in recent versions, but `-inform` removes the ambiguity. If you are unsure which one you have, `file leaf.cer` answers it:

```text
leaf.pem: PEM certificate
leaf.der: Certificate, Version=3
```

### Pack and unpack PKCS#12

To build a PFX from a PEM key, a leaf, and an intermediate:

```bash
openssl pkcs12 -export -out bundle.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -passout pass:demo
```

`-certfile` is what puts the intermediate into the archive. Leave it out and you get a PFX that imports cleanly and fails in the browser. To read it back:

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

`-nodes` again means "do not encrypt the output key". Omit it if you want OpenSSL to prompt for a new passphrase.

OpenSSL 3 writes PFX files with PBES2, PBKDF2, AES-256-CBC, and a SHA-256 MAC by default. Old Windows Server builds and old JVMs can reject that combination with a misleading "wrong password" error. If you must target them, choose the algorithms explicitly:

```bash
openssl pkcs12 -export -out bundle-legacy.pfx \
  -inkey leaf.key -in leaf.pem -certfile int.pem \
  -certpbe PBE-SHA1-3DES -keypbe PBE-SHA1-3DES -macalg sha1 \
  -passout pass:demo
```

`-legacy` also works, but it produces RC2-40 for the certificate bags, which is weaker and needs `-legacy` again to read on OpenSSL 3. The explicit 3DES form is the more portable choice.

### Read a P7B bundle

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

A P7B carries certificates and nothing else. If you need the private key, it lives somewhere else; no `openssl pkcs7` command will extract one.

### Point Nginx at the right two files

```nginx
server {
  listen 443 ssl;
  server_name example.test;

  ssl_certificate     /etc/ssl/example/fullchain.pem;
  ssl_certificate_key /etc/ssl/example/leaf.key;

  ssl_protocols TLSv1.2 TLSv1.3;
}
```

`ssl_certificate` gets the full chain, leaf first. Nginx will not reorder it for you. `ssl_certificate_key` gets the private key. The root certificate is not deployed; for a public CA the client already has it, and sending it only wastes bytes. For a private CA, install the root in each client's trust store once.

```bash
sudo nginx -t && sudo systemctl reload nginx
openssl s_client -connect example.test:443 -servername example.test -showcerts </dev/null
```

If the key is encrypted and Nginx runs under systemd, it cannot prompt at boot. Either keep the key unencrypted with `0600` permissions, or point `ssl_password_file` at a root-readable file containing the passphrase.

## Six failures that explain most outages

1. **Leaf only.** The chain is incomplete. Add the intermediate to `ssl_certificate` and re-test with `openssl verify`.
2. **Wrong order.** The intermediate is first in `fullchain.pem`. `openssl x509 -in fullchain.pem -noout -subject` prints the first certificate; it must be the leaf.
3. **Key mismatch.** The certificate and key are from different pairs. Compare the public-key hashes; do not guess.
4. **Expired intermediate.** The leaf is valid, the chain is not. Check every certificate in the file, not just the first.
5. **Legacy PFX rejected.** The import says "wrong password" even though it is correct. Re-export with 3DES and SHA-1 for old Windows or old Java.
6. **Encrypted key at boot.** Nginx starts fine interactively and fails under systemd. Use `ssl_password_file` or an unencrypted `0600` key.

## The one-screen cheat sheet

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

The rule underneath all of it: read the payload, not the extension. A `.pem` that contains a private key is a secret; a `.pfx` without its chain is an outage waiting for a mobile browser.

If you remember one command from this article, make it `openssl verify -CAfile root.pem -untrusted int.pem leaf.pem`. It catches the failure that monitoring usually misses and users usually report.

## References

- [RFC 7468 — Textual Encodings of PKIX, PKCS, and CMS Structures](https://www.rfc-editor.org/rfc/rfc7468)
- [RFC 7292 — PKCS #12: Personal Information Exchange Syntax](https://www.rfc-editor.org/rfc/rfc7292)
- [RFC 2315 — PKCS #7: Cryptographic Message Syntax](https://www.rfc-editor.org/rfc/rfc2315)
- [OpenSSL 3 documentation](https://docs.openssl.org/3.5/)
